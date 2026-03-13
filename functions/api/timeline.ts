import { Hono } from 'hono';
import { 
  getTimelineEvents, 
  saveTimelineEvent, 
  deleteTimelineEvent,
  bulkSaveTimelineEvents
} from '../lib/db.js';

const app = new Hono();

// 简单认证中间件
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization');
  const adminToken = c.env.ADMIN_TOKEN;
  
  if (!adminToken) {
    return c.json({ error: 'Admin token not configured' }, 500);
  }
  
  if (!token || token !== `Bearer ${adminToken}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await next();
};

// GET /api/timeline - 获取所有时间线事件（公开）
app.get('/', async (c): Promise<Response> => {
  try {
    const db = c.env.DB;
    const events = await getTimelineEvents(db);
    
    // 解析可能的 JSON 字段
    const parsedEvents = events.map((e: any) => ({
      ...e,
      // 如果将来有 JSON 字段，在这里解析
    }));
    
    return c.json({
      data: parsedEvents,
      total: parsedEvents.length
    }, 200, {
      'Cache-Control': 'public, max-age=600', // 10 分钟缓存
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
      'Cache-Control': 'public, max-age=3600', // 1 小时缓存
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('[Timeline Event API] Error:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// POST /api/timeline - 创建/更新事件（需要认证）
app.post('/', authMiddleware, async (c): Promise<Response> => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    
    // 验证必填字段
    if (!body.date || !body.title) {
      return c.json({ 
        error: 'Missing required fields: date, title' 
      }, 400);
    }
    
    // 生成 ID（如果没有提供）
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
    
    return c.json({
      success: true,
      data: eventData,
      message: 'Event saved successfully'
    }, 201);
  } catch (error) {
    console.error('[Timeline API POST] Error:', error);
    return c.json({ 
      error: 'Failed to save event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// POST /api/timeline/bulk - 批量导入事件（需要认证）
app.post('/bulk', authMiddleware, async (c): Promise<Response> => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    
    if (!Array.isArray(body.events)) {
      return c.json({ 
        error: 'Request body must contain an "events" array' 
      }, 400);
    }
    
    // 验证每个事件
    const validatedEvents = body.events.map((e: any) => ({
      id: e.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: e.date,
      title: e.title,
      content: e.content,
      color: e.color || 'blue',
      icon: e.icon || 'mdi-star',
      sort_order: e.sort_order || 0
    }));
    
    // 检查必填字段
    const invalidEvents = validatedEvents.filter((e: any) => !e.date || !e.title);
    if (invalidEvents.length > 0) {
      return c.json({ 
        error: 'Some events are missing required fields (date, title)',
        invalidCount: invalidEvents.length
      }, 400);
    }
    
    await bulkSaveTimelineEvents(db, validatedEvents);
    
    return c.json({
      success: true,
      count: validatedEvents.length,
      message: `Successfully imported ${validatedEvents.length} events`
    }, 201);
  } catch (error) {
    console.error('[Timeline API BULK] Error:', error);
    return c.json({ 
      error: 'Failed to import events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// DELETE /api/timeline/:id - 删除事件（需要认证）
app.delete('/:id', authMiddleware, async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    await deleteTimelineEvent(db, id);
    
    return c.json({
      success: true,
      message: 'Event deleted successfully'
    }, 200);
  } catch (error) {
    console.error('[Timeline API DELETE] Error:', error);
    return c.json({ 
      error: 'Failed to delete event' 
    }, 500);
  }
});

export default app;
