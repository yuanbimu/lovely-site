/// <reference types="@cloudflare/workers-types" />

/**
 * 直播状态轮询 Worker。
 *
 * 每分钟（Cron Trigger）抓一次 B 站，把「是否在播 / 标题 / 直播间链接 / 粉丝数」
 * 写成 `live_status` 表的一行。站点的 GET /api/live 只读这张表，不再回源。
 *
 * 设计约束（见 docs/superpowers/specs/2026-10-28-live-status-cron-poller-design.md）：
 * - 抓取失败绝不写行，否则会谎报「刚检查过，未开播」
 * - 粉丝数失败不影响状态写入，沿用上一行
 * - 失败行不写，checked_at 停滞，下游据此判定 stale
 */

import {
  getLiveStatus,
  pruneLiveStatus,
  saveLiveStatus,
} from '../../../functions/lib/db';
import { fetchLiveFans, fetchLiveRoom } from '../../../functions/lib/live-fetch';

/** 约 2 小时历史，够排查上下播时点，表也不会长 */
const KEEP_RECORDS = 120;

export interface PollerEnv {
  DB: D1Database;
}

/**
 * 执行一轮抓取。与定时触发解耦，便于本地用 --test-scheduled 反复调用。
 */
export async function pollOnce(env: PollerEnv): Promise<void> {
  const [room, fans, prev] = await Promise.all([
    fetchLiveRoom(),
    fetchLiveFans(),
    getLiveStatus(env.DB).catch((err: unknown) => {
      // 读不到上一行不致命，只是没法继承粉丝数
      console.error('[LivePoller] 读取上一行失败:', err);
      return null;
    }),
  ]);

  if (!room) {
    // 不写行：让 checked_at 停在上一次成功的时间，下游才能如实标记 stale
    console.error('[LivePoller] 本轮抓取失败，跳过写入');
    return;
  }

  if (prev && prev.isLive !== room.isLive) {
    console.log(`[LivePoller] ${room.isLive ? '上播' : '下播'} room=${room.roomId}`);
  }

  await saveLiveStatus(env.DB, {
    is_live: room.isLive,
    title: room.title,
    room_id: room.roomId,
    url: room.url,
    fans: fans ?? prev?.fans ?? 0,
  });

  await pruneLiveStatus(env.DB, KEEP_RECORDS);
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: PollerEnv,
    ctx: ExecutionContext
  ): Promise<void> {
    // 不挂 waitUntil 会在 handler 返回后立刻回收，任务被静默丢弃
    ctx.waitUntil(pollOnce(env));
  },
};
