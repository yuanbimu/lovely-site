import { Hono } from 'hono';
import { getDynamics } from '../lib/db.js';

const app = new Hono();

interface DynamicsResponse {
  data: any[];
  hasMore: boolean;
  total: number;
}

app.get('/', async (c): Promise<Response> => {
  try {
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    
    // 限制最大查询数量
    const safeLimit = Math.min(limit, 50);
    
    const db = c.env.DB;
    const dynamics = await getDynamics(db, safeLimit, offset);
    
    // 解析 JSON 字段
    const parsedDynamics = dynamics.map((d: any) => ({
      ...d,
      images: typeof d.images === 'string' ? JSON.parse(d.images) : d.images,
      local_images: typeof d.local_images === 'string' ? JSON.parse(d.local_images) : d.local_images
    }));
    
    const response: DynamicsResponse = {
      data: parsedDynamics,
      hasMore: parsedDynamics.length === safeLimit,
      total: parsedDynamics.length
    };
    
    return c.json(response, 200, {
      'Cache-Control': 'public, max-age=300', // 5 分钟缓存
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('[Dynamics API] Error:', error);
    
    // 错误响应
    return c.json({
      data: [],
      hasMore: false,
      total: 0,
      error: 'Failed to fetch dynamics'
    }, 500);
  }
});

// 获取单条动态
app.get('/:id', async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    const result = await db
      .prepare('SELECT * FROM dynamics WHERE id = ?')
      .bind(id)
      .first();
    
    if (!result) {
      return c.json({ error: 'Dynamic not found' }, 404);
    }
    
    const dynamic = {
      ...result,
      images: typeof result.images === 'string' ? JSON.parse(result.images) : result.images,
      local_images: typeof result.local_images === 'string' ? JSON.parse(result.local_images) : result.local_images
    };
    
    return c.json(dynamic, 200, {
      'Cache-Control': 'public, max-age=3600', // 1 小时缓存
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('[Dynamic API] Error:', error);
    return c.json({ error: 'Failed to fetch dynamic' }, 500);
  }
});

export default app;