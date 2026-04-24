/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getTimelineEvents, getTimelineCount, saveTimelineEvent, deleteTimelineEvent, bulkSaveTimelineEvents } from '../../lib/db';
import { requireAuth, requireEditor } from '../middleware/auth';

const app = new Hono();

// 获取时间线事件（支持分页；不传 limit 则返回全部。支持 year 和 tag 组合筛选）
app.get('/', async (c) => {
  const year = c.req.query('year') || undefined;
  const tag = c.req.query('tag') || undefined;
  const limitQuery = c.req.query('limit');
  const pageQuery = c.req.query('page');

  if (limitQuery) {
    const page = parseInt(pageQuery || '1', 10);
    const limit = parseInt(limitQuery, 10);
    const offset = (page - 1) * limit;

    const [events, total] = await Promise.all([
      getTimelineEvents(c.env.DB, { year, tag, limit, offset }),
      getTimelineCount(c.env.DB, { year, tag })
    ]);

    return c.json({ data: events, total, page, limit });
  }

  const events = await getTimelineEvents(c.env.DB, { year, tag });
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
