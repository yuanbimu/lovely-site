/// <reference types="@cloudflare/workers-types" />

/**
 * B 站直播数据抓取（只负责取数，不碰存储）。
 *
 * 被两处复用：
 * - `workers/live-poller/src/index.ts`：每分钟的定时抓取
 * - `functions/api/routes/live.ts`：快照过期太久时的同步兜底
 *
 * 所有失败都返回 null，不抛异常，让调用方决定是回退旧快照还是跳过本轮写入。
 */

const BILIBILI_UID = '3821157';
const REQUEST_TIMEOUT_MS = 4000;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface LiveRoom {
  isLive: boolean;
  title: string;
  roomId: string;
  url: string;
}

interface RoomInfoPayload {
  code: number;
  message?: string;
  data?: {
    liveStatus: number;
    title: string;
    roomid: number;
  };
}

interface CardPayload {
  code: number;
  data?: {
    follower?: number;
    card?: {
      fans?: number;
    };
  };
}

async function fetchJson<T>(url: string, referer: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': referer,
        'Accept': 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`[LiveFetch] B 站请求失败 ${response.status}: ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(`[LiveFetch] B 站请求异常: ${url}`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 直播间状态。返回 null 表示本次抓取失败，调用方不得据此写入「未开播」。
 */
export async function fetchLiveRoom(): Promise<LiveRoom | null> {
  const payload = await fetchJson<RoomInfoPayload>(
    `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${BILIBILI_UID}`,
    'https://live.bilibili.com/'
  );

  if (!payload || payload.code !== 0 || !payload.data) {
    console.error('[LiveFetch] 直播间状态获取失败:', payload?.code ?? 'no-response');
    return null;
  }

  const isLive = payload.data.liveStatus === 1;
  const roomId = String(payload.data.roomid ?? '');

  return {
    isLive,
    title: isLive ? (payload.data.title || '直播中') : '',
    roomId,
    url: isLive && roomId ? `https://live.bilibili.com/${roomId}` : '',
  };
}

/**
 * 粉丝数。返回 null 表示抓取失败或数据不可用，调用方应沿用上一次的值。
 */
export async function fetchLiveFans(): Promise<number | null> {
  const payload = await fetchJson<CardPayload>(
    `https://api.bilibili.com/x/web-interface/card?mid=${BILIBILI_UID}`,
    'https://space.bilibili.com'
  );

  if (!payload || payload.code !== 0 || !payload.data) {
    console.error('[LiveFetch] 粉丝数获取失败:', payload?.code ?? 'no-response');
    return null;
  }

  const fans = payload.data.follower ?? payload.data.card?.fans ?? 0;
  return fans > 0 ? fans : null;
}
