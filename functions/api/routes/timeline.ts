/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getTimelineEvents, saveTimelineEvent, deleteTimelineEvent, bulkSaveTimelineEvents } from '../../lib/db';
import { requireAuth, requireEditor } from '../middleware/auth';

const app = new Hono();

// 获取所有时间线事件
app.get('/', async (c) => {
  const events = await getTimelineEvents(c.env.DB);
  return c.json({ data: events, total: events.length });
});

// 创建或更新时间线事件
app.post('/', requireAuth, requireEditor, async (c) => {
  const body = await c.req.json();
  const eventData = { ...body, id: body.id || `event_${Date.now()}` };
  await saveTimelineEvent(c.env.DB, eventData);
  return c.json({ success: true, data: eventData });
});

// 批量导入时间线事件
app.post('/bulk', requireAuth, requireEditor, async (c) => {
  const body = await c.req.json();
  const events = body.events || [];
  await bulkSaveTimelineEvents(c.env.DB, events);
  return c.json({ success: true });
});

// 删除时间线事件
app.delete('/:id', requireAuth, requireEditor, async (c) => {
  await deleteTimelineEvent(c.env.DB, c.req.param('id'));
  return c.json({ success: true });
});

export default app;
