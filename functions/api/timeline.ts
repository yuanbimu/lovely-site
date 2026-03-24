import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  getTimelineEvents, 
  saveTimelineEvent, 
  deleteTimelineEvent,
  bulkSaveTimelineEvents,
  getSessionById,
  getUserById
} from '../lib/db.js';

const app = new Hono().basePath('/api/timeline');

// 添加 CORS 中間件
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// 獲取 Cookie 的輔助函數
function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Session 認證中間件
const requireAuth = async (c: any, next: any) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader, 'session');
  
  if (!sessionToken) {
    return c.json({ error: '未登錄，請先登錄' }, 401);
  }
  
  const db = c.env.DB;
  const session = await getSessionById(db, sessionToken);
  
  if (!session) {
    c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/', { append: true });
    return c.json({ error: 'Session 已過期，請重新登錄' }, 401);
  }
  
  const user = await getUserById(db, session.user_id);
  if (!user) {
    return c.json({ error: '用戶不存在' }, 404);
  }
  
  c.set('user', user);
  await next();
};

// 要求管理員或編輯員權限
const requireEditor = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: '未登錄' }, 401);
  }
  
  if (user.role !== 'admin' && user.role !== 'editor') {
    return c.json({ error: '權限不足，需要編輯員或以上權限' }, 403);
  }
  
  await next();
};

// GET /api/timeline - 获取所有时间线事件（公开）
app.get('/', async (c): Promise<Response> => {
  try {
    const db = c.env.DB;
    const events = await getTimelineEvents(db);
    
    const parsedEvents = events.map((e: any) => ({ ...e }));
    
    return c.json({
      data: parsedEvents,
      total: parsedEvents.length
    }, 200, {
      'Cache-Control': 'public, max-age=600',
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('[Timeline API] Error:', error);
    return c.json({ 
      data: [], 
      total: 0,
      error: 'Failed to fetch timeline events' 
    }, 500);
  }
});

// GET /api/timeline/:id - 获取单个事件（公开）
app.get('/:id', async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    const result = await db
      .prepare('SELECT * FROM timeline_events WHERE id = ?')
      .bind(id)
      .first();
    
    if (!result) {
      return c.json({ error: 'Event not found' }, 404);
    }
    
    return c.json(result, 200, {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('[Timeline Event API] Error:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// POST /api/timeline - 创建/更新事件（需要認證）
app.post('/', requireAuth, requireEditor, async (c): Promise<Response> => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const user = c.get('user');
    
    if (!body.date || !body.title) {
      return c.json({ error: '缺少必填字段：date, title' }, 400);
    }
    
    const eventData = {
      id: body.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: body.date,
      title: body.title,
      content: body.content,
      color: body.color || 'blue',
      icon: body.icon || 'mdi-star',
      sort_order: body.sort_order || 0
    };
    
    await saveTimelineEvent(db, eventData);
    
    console.log(`[Timeline] User ${user.username} saved event: ${eventData.id}`);
    
    return c.json({
      success: true,
      data: eventData,
      message: '事件保存成功'
    }, 201);
  } catch (error) {
    console.error('[Timeline API POST] Error:', error);
    return c.json({ 
      error: '保存事件失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, 500);
  }
});

// POST /api/timeline/bulk - 批量导入事件（需要認證）
app.post('/bulk', requireAuth, requireEditor, async (c): Promise<Response> => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    const user = c.get('user');
    
    if (!Array.isArray(body.events)) {
      return c.json({ error: '請求體必須包含 "events" 數組' }, 400);
    }
    
    const validatedEvents = body.events.map((e: any) => ({
      id: e.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: e.date,
      title: e.title,
      content: e.content,
      color: e.color || 'blue',
      icon: e.icon || 'mdi-star',
      sort_order: e.sort_order || 0
    }));
    
    const invalidEvents = validatedEvents.filter((e: any) => !e.date || !e.title);
    if (invalidEvents.length > 0) {
      return c.json({ 
        error: '部分事件缺少必填字段（date, title）',
        invalidCount: invalidEvents.length
      }, 400);
    }
    
    await bulkSaveTimelineEvents(db, validatedEvents);
    
    console.log(`[Timeline] User ${user.username} imported ${validatedEvents.length} events`);
    
    return c.json({
      success: true,
      count: validatedEvents.length,
      message: `成功導入 ${validatedEvents.length} 個事件`
    }, 201);
  } catch (error) {
    console.error('[Timeline API BULK] Error:', error);
    return c.json({ 
      error: '導入事件失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }, 500);
  }
});

// DELETE /api/timeline/:id - 删除事件（需要認證）
app.delete('/:id', requireAuth, requireEditor, async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const user = c.get('user');
    
    await deleteTimelineEvent(db, id);
    
    console.log(`[Timeline] User ${user.username} deleted event: ${id}`);
    
    return c.json({
      success: true,
      message: '事件删除成功'
    }, 200);
  } catch (error) {
    console.error('[Timeline API DELETE] Error:', error);
    return c.json({ error: '删除事件失敗' }, 500);
  }
});

export default app;
