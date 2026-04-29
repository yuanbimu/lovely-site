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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!res.ok) {
      return c.json({ error: `B站HTTP错误: ${res.status}` }, 500);
    }

    const text = await res.text();
    let json: { code: number; message?: string; data?: { pic?: string; title?: string } };
    try {
      json = JSON.parse(text);
    } catch {
      return c.json({ error: 'B站返回非JSON数据', detail: text.slice(0, 200) }, 500);
    }

    if (json.code !== 0) {
      return c.json({ error: json.message || `B站API错误(code:${json.code})` }, 500);
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
    return c.json({ error: '服务器请求B站API失败', detail: err instanceof Error ? err.message : String(err) }, 500);
  }
});

export default app;
