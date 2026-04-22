/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getLiveStatus } from '../../lib/db';

const app = new Hono();

// 获取直播状态（仅从 D1 读取，不再直接请求 Bilibili API）
// 数据由本地定时脚本 scripts/sync-live-to-d1.js 写入 D1
app.get('/', async (c) => {
  try {
    const status = await getLiveStatus(c.env.DB);

    if (status) {
      return c.json({
        isLive: status.isLive,
        title: status.title,
        url: status.url,
        roomId: status.roomId,
        lastChecked: new Date(status.checkedAt).toISOString(),
      });
    }

    // 数据库无记录时的默认值
    return c.json({
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      lastChecked: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Live API] Database error:', err);
    return c.json({
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      lastChecked: new Date().toISOString(),
    }, 500);
  }
});

export default app;
