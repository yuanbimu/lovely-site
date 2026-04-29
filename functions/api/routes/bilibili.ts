/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';

const app = new Hono();

// 获取B站视频封面
app.get('/bilibili-cover', async (c) => {
  const bvid = c.req.query('bvid');
  if (!bvid) {
    return c.json({ error: '缺少 bvid 参数' }, 400);
  }

  // 方式1: 直接请求B站API（最快，但可能被风控返回-412）
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (res.ok) {
      const text = await res.text();
      let json: { code: number; message?: string; data?: { pic?: string; title?: string } };
      try {
        json = JSON.parse(text);
      } catch {
        // 非JSON，fallback到HTML解析
      }

      if (json!.code === 0) {
        const pic = json!.data?.pic;
        if (pic) {
          const securePic = pic.replace(/^http:/, 'https:');
          return c.json({ success: true, data: { cover_url: securePic, title: json!.data?.title } });
        }
      }
    }
  } catch {
    // API请求失败，继续fallback
  }

  // 方式2: fallback抓取B站视频页面HTML，解析meta标签中的封面（绕过API风控）
  try {
    const htmlRes = await fetch(`https://www.bilibili.com/video/${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!htmlRes.ok) {
      return c.json({ error: `B站页面HTTP错误: ${htmlRes.status}` }, 500);
    }

    const html = await htmlRes.text();

    // 从HTML meta标签中提取封面: <meta data-vue-meta="true" itemprop="image" content="//i2.hdslb.com/bfs/archive/...">
    const metaMatch = html.match(/<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/);
    if (metaMatch && metaMatch[1]) {
      let coverUrl = metaMatch[1].trim();
      // 补齐协议头
      if (coverUrl.startsWith('//')) {
        coverUrl = 'https:' + coverUrl;
      } else if (coverUrl.startsWith('http:')) {
        coverUrl = coverUrl.replace(/^http:/, 'https:');
      }
      return c.json({ success: true, data: { cover_url: coverUrl } });
    }

    // 备用: 从 window.__INITIAL_STATE__ 中提取
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]) as { videoData?: { pic?: string } };
        const pic = state.videoData?.pic;
        if (pic) {
          const securePic = pic.replace(/^http:/, 'https:');
          return c.json({ success: true, data: { cover_url: securePic } });
        }
      } catch {
        // 解析失败，继续
      }
    }

    return c.json({ error: '未能从B站页面解析到封面' }, 404);
  } catch (err) {
    console.error('[Bilibili Cover] Fallback Error:', err);
    return c.json({ error: '获取封面失败', detail: err instanceof Error ? err.message : String(err) }, 500);
  }
});

export default app;
