import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getSongs, saveSong, deleteSong, getSessionById, getUserById } from '../lib/db.js';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

const requireEditor = async (c: any, next: any) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader, 'session');
  if (!sessionToken) return c.json({ error: '未登錄' }, 401);
  const db = c.env.DB;
  const session = await getSessionById(db, sessionToken);
  if (!session) return c.json({ error: 'Session 過期' }, 401);
  const user = await getUserById(db, session.user_id);
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return c.json({ error: '需要編輯權限' }, 403);
  }
  c.set('user', user);
  await next();
};

app.get('/', async (c) => {
  try {
    const songs = await getSongs(c.env.DB);
    return c.json({ success: true, data: songs });
  } catch (error) {
    return c.json({ error: '獲取歌單失敗' }, 500);
  }
});

app.post('/', requireEditor, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.title) return c.json({ error: '缺少標題' }, 400);
    
    const songId = body.id || `song_${Date.now()}`;
    await saveSong(c.env.DB, { ...body, id: songId });
    return c.json({ success: true, message: '保存成功', id: songId }, 201);
  } catch (error) {
    return c.json({ error: '保存失敗' }, 500);
  }
});

app.delete('/:id', requireEditor, async (c) => {
  try {
    const id = c.req.param('id');
    await deleteSong(c.env.DB, id);
    return c.json({ success: true, message: '刪除成功' });
  } catch (error) {
    return c.json({ error: '刪除失敗' }, 500);
  }
});

export const onRequest = app.fetch;
