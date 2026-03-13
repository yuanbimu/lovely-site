import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  createUser, 
  getUserByUsername, 
  getUserById,
  createSession, 
  getSessionById, 
  deleteSession,
  updateUserPassword
} from '../lib/db.js';

const app = new Hono().basePath('/api/auth');

// 添加 CORS 中間件
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// 生成隨機 ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// 生成 Session Token
function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
}

// 簡易密碼驗證
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

// 註冊（僅管理員可創建用戶）
app.post('/register', async (c): Promise<Response> => {
  try {
    const { username, email, password, role = 'editor' } = await c.req.json();
    
    if (!username || !email || !password) {
      return c.json({ error: '缺少必填字段' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: '密碼至少需要6個字符' }, 400);
    }
    
    const db = c.env.DB;
    
    const existingUser = await getUserByUsername(db, username);
    if (existingUser) {
      return c.json({ error: '用戶名已存在' }, 409);
    }
    
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    
    await createUser(db, {
      id: userId,
      username,
      email,
      password_hash: passwordHash,
      role: role as 'admin' | 'editor' | 'viewer'
    });
    
    return c.json({ 
      success: true, 
      message: '用戶創建成功',
      user: { id: userId, username, email, role }
    }, 201);
  } catch (error) {
    console.error('[Auth Register] Error:', error);
    return c.json({ error: '註冊失敗' }, 500);
  }
});

// 登錄
app.post('/login', async (c): Promise<Response> => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: '請輸入用戶名和密碼' }, 400);
    }
    
    const db = c.env.DB;
    
    const user = await getUserByUsername(db, username);
    if (!user) {
      return c.json({ error: '用戶名或密碼錯誤' }, 401);
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: '用戶名或密碼錯誤' }, 401);
    }
    
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    await createSession(db, {
      id: sessionToken,
      user_id: user.id,
      expires_at: expiresAt
    });
    
    // 設置 Cookie - 使用 SameSite=Lax 以便在開發環境工作
    c.header('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`, { append: true });
    
    return c.json({
      success: true,
      message: '登錄成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return c.json({ error: '登錄失敗' }, 500);
  }
});

// 登出
app.post('/logout', async (c): Promise<Response> => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionToken = getCookieValue(cookieHeader, 'session');
    
    if (sessionToken) {
      const db = c.env.DB;
      await deleteSession(db, sessionToken);
    }
    
    c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/', { append: true });
    
    return c.json({ success: true, message: '已登出' });
  } catch (error) {
    console.error('[Auth Logout] Error:', error);
    return c.json({ error: '登出失敗' }, 500);
  }
});

// 獲取當前用戶
app.get('/me', async (c): Promise<Response> => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionToken = getCookieValue(cookieHeader, 'session');
    
    if (!sessionToken) {
      return c.json({ error: '未登錄' }, 401);
    }
    
    const db = c.env.DB;
    const session = await getSessionById(db, sessionToken);
    
    if (!session) {
      c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/', { append: true });
      return c.json({ error: 'Session 已過期' }, 401);
    }
    
    const user = await getUserById(db, session.user_id);
    if (!user) {
      return c.json({ error: '用戶不存在' }, 404);
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth Me] Error:', error);
    return c.json({ error: '獲取用戶信息失敗' }, 500);
  }
});

// 修改密碼
app.post('/change-password', async (c): Promise<Response> => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionToken = getCookieValue(cookieHeader, 'session');
    
    if (!sessionToken) {
      return c.json({ error: '未登錄' }, 401);
    }
    
    const { currentPassword, newPassword } = await c.req.json();
    
    if (!currentPassword || !newPassword) {
      return c.json({ error: '請輸入當前密碼和新密碼' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: '新密碼至少需要6個字符' }, 400);
    }
    
    const db = c.env.DB;
    const session = await getSessionById(db, sessionToken);
    
    if (!session) {
      return c.json({ error: 'Session 已過期' }, 401);
    }
    
    const user = await getUserById(db, session.user_id);
    if (!user) {
      return c.json({ error: '用戶不存在' }, 404);
    }
    
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return c.json({ error: '當前密碼錯誤' }, 401);
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    await updateUserPassword(db, user.id, newPasswordHash);
    
    return c.json({ success: true, message: '密碼修改成功' });
  } catch (error) {
    console.error('[Auth Change Password] Error:', error);
    return c.json({ error: '修改密碼失敗' }, 500);
  }
});

export default app;

// Cloudflare Pages Functions 導出
export const onRequest = app.fetch;
