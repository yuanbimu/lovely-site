import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  getDynamics,
  getTimelineEvents, 
  saveTimelineEvent, 
  deleteTimelineEvent,
  bulkSaveTimelineEvents,
  getUsers,
  createUser, 
  getUserByUsername, 
  getUserById,
  createSession, 
  getSessionById, 
  deleteSession,
  updateUserPassword,
  updateUserRole,
  deleteUser,
  getSongs,
  saveSong,
  deleteSong,
  type Env
} from '../lib/db';

const app = new Hono<{ Bindings: Env, Variables: { user: any } }>();

// === Global Middleware ===

// 1. 全局請求日誌
app.use('*', async (c, next) => {
  console.log(`[API Request] ${c.req.method} ${c.req.path}`);
  await next();
});

// 2. CORS
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
  maxAge: 86400
}));

// 3. 全局錯誤處理
app.onError((err, c) => {
  console.error(`[API ERROR] ${c.req.method} ${c.req.path}:`, err);
  console.error(`[STACK]:`, err.stack);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack, // 開發環境先開啟 stack 回傳以便診斷
    type: err.name
  }, 500);
});

// === Helpers ===

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const cookie of cookieHeader.split(';')) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'lovely-site-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

// === Auth Middlewares ===

const requireAuth = async (c: any, next: any) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader ?? null, 'session');
  if (!sessionToken) {
    console.log('[Auth Middleware] No session token found');
    return c.json({ error: '未登錄' }, 401);
  }
  
  const db = c.env.DB;
  const session = await getSessionById(db, sessionToken);
  if (!session) {
    console.log(`[Auth Middleware] Invalid session: ${sessionToken}`);
    c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/', { append: true });
    return c.json({ error: 'Session 已過期' }, 401);
  }
  
  const user = await getUserById(db, session.user_id);
  if (!user) {
    console.log(`[Auth Middleware] User not found: ${session.user_id}`);
    return c.json({ error: '用戶不存在' }, 404);
  }
  
  c.set('user', user);
  await next();
};

const requireEditor = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return c.json({ error: '需要編輯權限' }, 403);
  }
  await next();
};

const requireAdmin = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: '需要管理員權限' }, 403);
  }
  await next();
};

// === Routes ===

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;
    console.log(`[Auth] Login attempt: username=${username}`);
    
    if (!username || !password) return c.json({ error: '請輸入用戶名和密碼' }, 400);
    
    const db = c.env.DB;
    if (!db) {
       console.error("[Auth] Database binding (c.env.DB) is missing!");
       return c.json({ error: "Database binding missing" }, 500);
    }
    
    const user = await getUserByUsername(db, username);
    if (!user) {
       console.log(`[Auth] User not found in DB: ${username}`);
       return c.json({ error: '用戶名或密碼錯誤' }, 401);
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
       console.log(`[Auth] Password mismatch for user: ${username}`);
       return c.json({ error: '用戶名或密碼錯誤' }, 401);
    }
    
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    await createSession(db, { id: sessionToken, user_id: user.id, expires_at: expiresAt });
    
    c.header('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`, { append: true });
    console.log(`[Auth] Login SUCCESS: ${username}`);
    return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(`[Auth] Login Route Error:`, err);
    throw err;
  }
});

app.get('/api/auth/me', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.post('/api/auth/logout', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader ?? null, 'session');
  if (sessionToken) await deleteSession(c.env.DB, sessionToken);
  c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/', { append: true });
  return c.json({ success: true });
});

app.get('/api/timeline', async (c) => {
  const events = await getTimelineEvents(c.env.DB);
  return c.json({ data: events, total: events.length });
});

app.post('/api/timeline', requireAuth, requireEditor, async (c) => {
  const body = await c.req.json();
  const eventData = { id: body.id || `event_${Date.now()}`, ...body };
  await saveTimelineEvent(c.env.DB, eventData);
  return c.json({ success: true, data: eventData });
});

app.delete('/api/timeline/:id', requireAuth, requireEditor, async (c) => {
  await deleteTimelineEvent(c.env.DB, c.req.param('id'));
  return c.json({ success: true });
});

app.get('/api/users', requireAuth, requireAdmin, async (c) => {
  const users = await getUsers(c.env.DB);
  return c.json({ success: true, data: users });
});

app.get('/api/songs', async (c) => {
  const songs = await getSongs(c.env.DB);
  return c.json({ success: true, data: songs });
});

app.get('/api/dynamics', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  const dynamics = await getDynamics(c.env.DB, limit, offset);
  return c.json({ data: dynamics, hasMore: dynamics.length === limit });
});

app.get('/api/live', async (c) => {
  try {
    const res = await fetch(`https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=3821157`);
    const data = await res.json() as any;
    if (data.code === 0 && data.data) {
      const { liveStatus, title, roomid } = data.data;
      return c.json({ 
        isLive: liveStatus === 1, 
        title: title || '', 
        url: roomid ? `https://live.bilibili.com/${roomid}` : '' 
      });
    }
    return c.json({ isLive: false });
  } catch { return c.json({ isLive: false }); }
});

export const onRequest = (context) => app.fetch(context.request, context.env, context);
