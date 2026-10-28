/// <reference types="@cloudflare/workers-types" />

import { Hono, type Context } from 'hono';
import {
  getLiveStatus,
  pruneLiveStatus,
  saveLiveStatus,
  type Env,
} from '../../lib/db';
import { fetchLiveFans, fetchLiveRoom } from '../../lib/live-fetch';

const app = new Hono<{ Bindings: Env }>();

/**
 * 数据时效策略（2026-10 起）：
 * - 直播状态与粉丝数由 Cron Worker `lovely-live-poller` 每分钟抓取，写入 D1 `live_status`。
 * - 本接口只读快照，不再「每次请求实时查询」。
 * - 快照 90s 内视为新鲜；90s ~ 10min 标记 stale；超过 10min 才同步兜底回源一次。
 * - B 站不可用时回退到最后一次成功快照并标记 stale，不得谎报「未开播」。
 */
const FRESH_MS = 90 * 1000;
const FALLBACK_MS = 10 * 60 * 1000;

// 与 workers/live-poller 保持一致
const KEEP_RECORDS = 120;

interface LiveSnapshot {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  fans: number;
  /** 快照写入时间（= 最后一次成功抓取时间），不是请求时间 */
  checkedAt: number;
}

/**
 * 读取最后一次成功快照。读不到（表缺失 / 绑定缺失）不致命，交给兜底逻辑。
 */
async function readSnapshot(db: D1Database | null): Promise<LiveSnapshot | null> {
  if (!db) return null;

  try {
    return await getLiveStatus(db);
  } catch (err) {
    console.error('[Live API] 读取 D1 快照失败:', err);
    return null;
  }
}

// 同一个 isolate 内避免并发重复写入
let persistInFlight = false;

function createPersistTask(db: D1Database, snapshot: LiveSnapshot): Promise<void> {
  if (persistInFlight) {
    return Promise.resolve();
  }
  persistInFlight = true;

  return (async () => {
    try {
      await saveLiveStatus(db, {
        is_live: snapshot.isLive,
        title: snapshot.title,
        room_id: snapshot.roomId,
        url: snapshot.url,
        fans: snapshot.fans,
      });
      await pruneLiveStatus(db, KEEP_RECORDS);
    } finally {
      persistInFlight = false;
    }
  })().catch((err) => {
    console.error('[Live API] 写入快照失败:', err);
  });
}

/**
 * Hono 的 c.executionCtx 在 Pages 环境需要入口显式注入，这里先探测是否可用。
 */
function hasExecutionCtx(c: Context<{ Bindings: Env }>): boolean {
  try {
    void c.executionCtx;
    return true;
  } catch (err) {
    // 没有注入 executionCtx 时退化为同步写入，不能把后台任务直接丢掉
    console.error('[Live API] 当前上下文没有 executionCtx:', err);
    return false;
  }
}

function buildPayload(snapshot: LiveSnapshot, stale: boolean) {
  const checkedAt = new Date(snapshot.checkedAt).toISOString();
  return {
    isLive: snapshot.isLive,
    title: snapshot.title,
    url: snapshot.url,
    roomId: snapshot.roomId,
    fans: snapshot.fans,
    // 快照时间：poller 停摆时前端会如实看到时间在倒退
    lastChecked: checkedAt,
    // 粉丝数与状态同一批抓取，两者的时间一致（该字段前端未消费，保留为契约兼容）
    fansUpdatedAt: checkedAt,
    stale,
  };
}

// 获取直播状态和粉丝数
// 读 Cron Worker 写好的快照；只有快照过期太久时才兜底回源一次。
app.get('/', async (c) => {
  const db = c.env.DB ?? null;
  const now = Date.now();
  const snapshot = await readSnapshot(db);

  if (snapshot) {
    const age = now - snapshot.checkedAt;

    if (age <= FRESH_MS) {
      return c.json(buildPayload(snapshot, false), 200, {
        'Cache-Control': 'no-store',
      });
    }

    if (age <= FALLBACK_MS) {
      // 轮询可能刚抖了一下，先给旧快照并如实标记
      return c.json(buildPayload(snapshot, true), 200, {
        'Cache-Control': 'no-store',
      });
    }

    console.error(
      `[Live API] 快照已 ${Math.round(age / 1000)}s 未更新，尝试兜底回源`
    );
  }

  // 快照缺失或长期未更新：同步兜底一次，避免 poller 失效后站点一直卡在旧数据
  const room = await fetchLiveRoom();

  if (!room) {
    if (snapshot) {
      return c.json(buildPayload(snapshot, true), 200, {
        'Cache-Control': 'no-store',
      });
    }

    const lastChecked = new Date(now).toISOString();
    return c.json(
      {
        error: '直播状态暂时不可用',
        isLive: false,
        title: '',
        url: '',
        roomId: '',
        fans: 0,
        lastChecked,
        fansUpdatedAt: lastChecked,
        stale: true,
      },
      503,
      { 'Cache-Control': 'no-store' }
    );
  }

  // 粉丝数抓不到就沿用旧值，允许短时间内不准确
  const fans = (await fetchLiveFans()) ?? snapshot?.fans ?? 0;

  const fresh: LiveSnapshot = {
    isLive: room.isLive,
    title: room.title,
    url: room.url,
    roomId: room.roomId,
    fans,
    checkedAt: now,
  };

  if (db) {
    const task = createPersistTask(db, fresh);
    if (hasExecutionCtx(c)) {
      c.executionCtx.waitUntil(task);
    } else {
      // 没有后台执行能力时只能同步等它写完，保证数据不丢
      await task;
    }
  }

  return c.json(buildPayload(fresh, false), 200, {
    'Cache-Control': 'no-store',
  });
});

export default app;
