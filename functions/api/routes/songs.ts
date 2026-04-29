/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getSongs, getSongsCount, saveSong, deleteSong } from '../../lib/db';
import { requireAuth, requireEditor } from '../middleware/auth';

const app = new Hono();

// 获取所有歌曲（支持分页和标签筛选）
app.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = parseInt(c.req.query('offset') || '0');
  const tag = c.req.query('tag') || undefined;

  const [songs, total] = await Promise.all([
    getSongs(c.env.DB, { limit, offset, tag }),
    getSongsCount(c.env.DB, tag)
  ]);

  return c.json({ success: true, data: songs, total });
});

// 创建或更新歌曲
app.post('/', requireAuth, requireEditor, async (c) => {
  try {
    const body = await c.req.json();
    const songData = {
      id: body.id || `song_${Date.now()}`,
      title: body.title,
      artist: body.artist || '东爱璃 Lovely',
      cover_url: body.cover_url,
      url: body.url,
      release_date: body.release_date,
      tag: Array.isArray(body.tag) ? body.tag : (body.tag ? [body.tag] : undefined)
    };
    await saveSong(c.env.DB, songData);
    return c.json({ success: true, data: songData });
  } catch (err) {
    console.error('[Songs] Save error:', err);
    return c.json({ error: '保存失败' }, 500);
  }
});

// 删除歌曲
app.delete('/:id', requireAuth, requireEditor, async (c) => {
  await deleteSong(c.env.DB, c.req.param('id'));
  return c.json({ success: true });
});

export default app;
