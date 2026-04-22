/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getLiveStatus, saveLiveStatus } from '../../lib/db';

const app = new Hono();

// 获取直播状态
app.get('/', async (c) => {
  try {
    const cachedStatus = await getLiveStatus(c.env.DB);
    const res = await fetch(`https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=3821157`);
    const data = await res.json() as any;
    if (data.code === 0 && data.data) {
      const { liveStatus, title, roomid } = data.data;
      const status = {
        is_live: liveStatus === 1,
        title: title || '',
        room_id: roomid ? String(roomid) : '',
        url: roomid ? `https://live.bilibili.com/${roomid}` : ''
      };
      await saveLiveStatus(c.env.DB, status);
      return c.json({
        isLive: status.is_live,
        title: status.title,
        url: status.url,
        roomId: status.room_id,
        lastChecked: new Date().toISOString()
      });
    }

    if (cachedStatus) {
      return c.json({
        isLive: cachedStatus.isLive,
        title: cachedStatus.title,
        url: cachedStatus.url,
        roomId: cachedStatus.roomId,
        lastChecked: new Date(cachedStatus.checkedAt).toISOString(),
        stale: true
      });
    }

    return c.json({ isLive: false, title: '', url: '', roomId: '', lastChecked: new Date().toISOString() });
  } catch {
    const cachedStatus = await getLiveStatus(c.env.DB);
    if (cachedStatus) {
      return c.json({
        isLive: cachedStatus.isLive,
        title: cachedStatus.title,
        url: cachedStatus.url,
        roomId: cachedStatus.roomId,
        lastChecked: new Date(cachedStatus.checkedAt).toISOString(),
        stale: true
      });
    }
    return c.json({ isLive: false, title: '', url: '', roomId: '', lastChecked: new Date().toISOString() });
  }
});

export default app;
