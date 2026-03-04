import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c): Promise<Response> => {
  try {
    // 这个端点用于手动触发同步（仅用于测试）
    // 实际同步由 GitHub Actions 定时执行
    
    return c.json({
      success: true,
      message: 'Sync triggered. Note: Actual sync is performed by GitHub Actions.',
      tip: 'Run `npm run sync-dynamics` locally to sync data.'
    }, 200);
  } catch (error) {
    console.error('[Sync API] Error:', error);
    return c.json({ error: 'Failed to trigger sync' }, 500);
  }
});

export default app;
