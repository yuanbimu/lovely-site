import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type Env } from '../lib/db';

// 子路由导入
import authRoutes from './routes/auth';
import timelineRoutes from './routes/timeline';
import usersRoutes from './routes/users';
import songsRoutes from './routes/songs';
import showcasesRoutes from './routes/showcases';
import r2Routes from './routes/r2';
import dynamicsRoutes from './routes/dynamics';
import liveRoutes from './routes/live';

const app = new Hono<{ Bindings: Env, Variables: { user: any } }>();

// === Global Middleware ===

// CORS
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
  maxAge: 86400
}));

// 全局錯誤處理
app.onError((err, c) => {
  console.error(`[API ERROR] ${c.req.method} ${c.req.path}:`, err);
  console.error(`[STACK]:`, err.stack);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack,
    type: err.name
  }, 500);
});

// === Routes ===

// 认证路由 /api/auth/*
app.route('/api/auth', authRoutes);

// 时间线路由 /api/timeline/*
app.route('/api/timeline', timelineRoutes);

// 用户路由 /api/users/*
app.route('/api/users', usersRoutes);

// 歌曲路由 /api/songs/*
app.route('/api/songs', songsRoutes);

// 橱窗路由 /api/showcases/*
app.route('/api/showcases', showcasesRoutes);

// R2 文件路由 - 挂载到 /api，因为子路由定义了完整路径 /r2-files, /r2-get 等
app.route('/api', r2Routes);

// 动态路由 /api/dynamics/*
app.route('/api/dynamics', dynamicsRoutes);

// 直播路由 /api/live/*
app.route('/api/live', liveRoutes);

export const onRequest = (context: { request: Request; env: Env; executionCtx: ExecutionContext }) => app.fetch(context.request, context.env, context.executionCtx);
