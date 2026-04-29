/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';

const app = new Hono();

// 获取B站视频封面
app.get('/bilibili-cover', async (c) => {
  const bvid = c.req.query('bvid');
  if (!bvid) {
    return c.json({ error: '缺少 bvid 参数' }, 400);
  }

  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });
    const json = (await res.json()) as { code: number; message?: string; data?: { pic?: string; title?: string } };

    if (json.code !== 0) {
      return c.json({ error: json.message || 'B站API返回错误' }, 500);
    }

    const pic = json.data?.pic;
    if (!pic) {
      return c.json({ error: '未能获取到封面' }, 404);
    }

    // 将 http 升级为 https
    const securePic = pic.replace(/^http:/, 'https:');

    return c.json({ success: true, data: { cover_url: securePic, title: json.data?.title } });
  } catch (err) {
    console.error('[Bilibili Cover] Error:', err);
    return c.json({ error: '获取封面失败' }, 500);
  }
});

export default app;
