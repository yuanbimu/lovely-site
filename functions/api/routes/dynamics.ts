/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';

const app = new Hono();

// 动态功能已下线
app.get('/', async (c) => {
  return c.json({ error: '动态功能暂时下线，后续将以新方案重新接入' }, 410);
});

export default app;
