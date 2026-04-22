/// <reference types="@cloudflare/workers-types" />

import { getCookieValue, isSecureCookieEnabled, buildSessionCookie } from '../utils/cookies';
import { getSessionById, getUserById } from '../../lib/db';

/**
 * 要求用户已登录
 */
export const requireAuth = async (c: any, next: any) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = getCookieValue(cookieHeader ?? null, 'session');
  if (!sessionToken) {
    return c.json({ error: '未登錄' }, 401);
  }

  const db = c.env.DB;
  const session = await getSessionById(db, sessionToken);
  if (!session) {
    const isSecure = isSecureCookieEnabled(c.req.url);
    const cookie = buildSessionCookie('', isSecure, 0);
    c.header('Set-Cookie', cookie, { append: true });
    return c.json({ error: 'Session 已過期' }, 401);
  }

  const user = await getUserById(db, session.user_id);
  if (!user) {
    return c.json({ error: '用戶不存在' }, 404);
  }

  c.set('user', user);
  await next();
};

/**
 * 要求用户具有编辑权限（admin 或 editor）
 */
export const requireEditor = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return c.json({ error: '需要編輯權限' }, 403);
  }
  await next();
};

/**
 * 要求用户具有管理员权限
 */
export const requireAdmin = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: '需要管理員權限' }, 403);
  }
  await next();
};
