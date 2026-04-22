/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getLiveStatus } from '../../lib/db';

const app = new Hono();

// 获取直播状态和粉丝数
// 所有数据从 D1 读取（由本地定时脚本 scripts/sync-live-to-d1.js 写入）
app.get('/', async (c) => {
  const lastChecked = new Date().toISOString();

  try {
    const status = await getLiveStatus(c.env.DB);

    if (status) {
      return c.json({
        isLive: status.isLive,
        title: status.title,
        url: status.url,
        roomId: status.roomId,
        fans: status.fans,
        lastChecked: new Date(status.checkedAt).toISOString(),
      });
    }

    // 数据库无记录时的默认值
    return c.json({
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      fans: 0,
      lastChecked,
    });
  } catch (err) {
    console.error('[Live API] Database error:', err);
    return c.json({
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      fans: 0,
      lastChecked,
    }, 500);
  }
});

export default app;
