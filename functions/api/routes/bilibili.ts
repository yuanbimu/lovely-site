/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';

const app = new Hono();

// 获取B站视频封面
app.get('/bilibili-cover', async (c) => {
  const bvid = c.req.query('bvid');
  if (!bvid) {
    return c.json({ error: '缺少 bvid 参数' }, 400);
  }

  // 生成伪造的 buvid3 (B站设备追踪cookie，格式: UUID + infoc)
  const fakeBuvid3 = `buvid3=${crypto.randomUUID().replace(/-/g, '')}infoc`;
  // 伪造一个国内IP
  const fakeIP = `223.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.bilibili.com',
    'Origin': 'https://www.bilibili.com',
    'Connection': 'keep-alive',
    'Cookie': fakeBuvid3,
    'X-Forwarded-For': fakeIP,
    'X-Real-IP': fakeIP,
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
  };

  // 方式1: 请求B站API
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: commonHeaders,
    });

    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text) as { code: number; message?: string; data?: { pic?: string; title?: string } };
        if (json.code === 0) {
          const pic = json.data?.pic;
          if (pic) {
            const securePic = pic.replace(/^http:/, 'https:');
            return c.json({ success: true, data: { cover_url: securePic, title: json.data?.title } });
          }
        }
      } catch {
        // JSON解析失败，继续fallback
      }
    }
  } catch {
    // 网络错误，继续fallback
  }

  // 方式2: 请求B站移动端API (风控策略通常不同)
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view/detail?bvid=${bvid}`, {
      headers: commonHeaders,
    });
    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text) as { code: number; data?: { View?: { pic?: string; title?: string } } };
        if (json.code === 0) {
          const pic = json.data?.View?.pic;
          if (pic) {
            const securePic = pic.replace(/^http:/, 'https:');
            return c.json({ success: true, data: { cover_url: securePic, title: json.data?.View?.title } });
          }
        }
      } catch {
        // 继续fallback
      }
    }
  } catch {
    // 继续fallback
  }

  // 方式3: fallback抓取B站视频页面HTML
  try {
    const htmlRes = await fetch(`https://www.bilibili.com/video/${bvid}`, {
      headers: {
        ...commonHeaders,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (htmlRes.ok) {
      const html = await htmlRes.text();

      // 从HTML meta标签中提取封面
      const metaMatch = html.match(/<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/);
      if (metaMatch && metaMatch[1]) {
        let coverUrl = metaMatch[1].trim();
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
          // 解析失败
        }
      }

      return c.json({ error: '未能从B站页面解析到封面' }, 404);
    } else {
      return c.json({ error: `B站页面HTTP错误: ${htmlRes.status}` }, 500);
    }
  } catch (err) {
    console.error('[Bilibili Cover] Error:', err);
    return c.json({ error: '获取封面失败', detail: err instanceof Error ? err.message : String(err) }, 500);
  }
});

export default app;
