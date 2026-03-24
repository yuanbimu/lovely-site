import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  getUsers, 
  createUser,
  getUserById,
  getUserByUsername,
  updateUserRole, 
  deleteUser,
  getSessionById
} from '../lib/db.js';

const app = new Hono().basePath('/api/users');

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

function generateId() { return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`; }

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password + 'lovely-site-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const requireAdmin = async (c: any, next: any) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader, 'session');
  if (!sessionToken) return c.json({ error: '未登錄' }, 401);
  const db = c.env.DB;
  const session = await getSessionById(db, sessionToken);
  if (!session) return c.json({ error: 'Session 過期' }, 401);
  const user = await getUserById(db, session.user_id);
  if (!user || user.role !== 'admin') return c.json({ error: '需要管理員權限' }, 403);
  c.set('user', user);
  await next();
};

app.use('*', requireAdmin);

app.get('/', async (c): Promise<Response> => {
  try {
    const users = await getUsers(c.env.DB);
    return c.json({ success: true, data: users });
  } catch (error) {
    return c.json({ error: '獲取用戶失敗' }, 500);
  }
});

app.post('/', async (c): Promise<Response> => {
  try {
    const body = await c.req.json();
    if (!body.username || !body.email || !body.password) return c.json({ error: '缺少必填' }, 400);
    const db = c.env.DB;
    if (await getUserByUsername(db, body.username)) return c.json({ error: '用戶名已存在' }, 409);
    
    const userId = generateId();
    const passwordHash = await hashPassword(body.password);
    await createUser(db, {
      id: userId,
      username: body.username,
      email: body.email,
      password_hash: passwordHash,
      role: body.role || 'editor'
    });
    return c.json({ success: true, message: '用戶建立成功' }, 201);
  } catch (error) {
    return c.json({ error: '創建失敗' }, 500);
  }
});

app.put('/:id/role', async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const { role } = await c.req.json();
    if (!['admin', 'editor', 'viewer'].includes(role)) return c.json({ error: '無效權限' }, 400);
    await updateUserRole(c.env.DB, id, role);
    return c.json({ success: true, message: '權限更新成功' });
  } catch (error) {
    return c.json({ error: '更新失敗' }, 500);
  }
});

app.delete('/:id', async (c): Promise<Response> => {
  try {
    const id = c.req.param('id');
    const currentUser = c.get('user');
    if (id === currentUser.id) return c.json({ error: '不能刪除自己' }, 400);
    await deleteUser(c.env.DB, id);
    return c.json({ success: true, message: '刪除成功' });
  } catch (error) {
    return c.json({ error: '刪除失敗' }, 500);
  }
});

export const onRequest = app.fetch;
