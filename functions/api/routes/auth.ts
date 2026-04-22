/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getCookieValue, isSecureCookieEnabled, buildSessionCookie } from '../utils/cookies';
import { verifyPassword } from '../utils/crypto';
import { getUserByUsername, createSession } from '../../lib/db';
import { requireAuth } from '../middleware/auth';

function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
}

const app = new Hono();

// 登录
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (!username || !password) return c.json({ error: '請輸入用戶名和密碼' }, 400);

    const db = c.env.DB;
    if (!db) {
      console.error('[Auth] Database binding (c.env.DB) is missing!');
      return c.json({ error: 'Database binding missing' }, 500);
    }

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
    await createSession(db, { id: sessionToken, user_id: user.id, expires_at: expiresAt });

    const isSecure = isSecureCookieEnabled(c.req.url);
    const cookie = buildSessionCookie(sessionToken, isSecure, 7 * 24 * 60 * 60);
    c.header('Set-Cookie', cookie, { append: true });
    return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[Auth] Login Route Error:', err);
    throw err;
  }
});

// 获取当前登录用户信息
app.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// 登出
app.post('/logout', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader ?? null, 'session');
  if (sessionToken) {
    const { deleteSession } = await import('../../lib/db');
    await deleteSession(c.env.DB, sessionToken);
  }
  const isSecure = isSecureCookieEnabled(c.req.url);
  const cookie = buildSessionCookie('', isSecure, 0);
  c.header('Set-Cookie', cookie, { append: true });
  return c.json({ success: true });
});

export default app;
