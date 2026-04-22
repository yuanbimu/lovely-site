/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getUsers, createUser, getUserByUsername, updateUserRole, deleteUser } from '../../lib/db';
import { hashPassword } from '../utils/crypto';
import { requireAuth, requireAdmin } from '../middleware/auth';

const app = new Hono();

// 获取所有用户
app.get('/', requireAuth, requireAdmin, async (c) => {
  const users = await getUsers(c.env.DB);
  return c.json({ success: true, data: users });
});

// 创建新用户
app.post('/', requireAuth, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password, role } = body;

    if (!username || !email || !password) {
      return c.json({ error: '请填写用户名、邮箱和密码' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: '密码至少需要6个字符' }, 400);
    }

    const db = c.env.DB;

    // 检查用户名是否已存在
    const existingUser = await getUserByUsername(db, username);
    if (existingUser) {
      return c.json({ error: '用户名已存在' }, 409);
    }

    const userId = `user_${Date.now()}`;
    const passwordHash = await hashPassword(password);

    await createUser(db, {
      id: userId,
      username,
      email,
      password_hash: passwordHash,
      role: role || 'editor'
    });

    return c.json({ success: true, data: { id: userId, username, email, role: role || 'editor' } });
  } catch (err) {
    console.error('[Users] Create error:', err);
    return c.json({ error: '创建用户失败' }, 500);
  }
});

// 更新用户角色
app.put('/:id/role', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    const body = await c.req.json();
    const { role } = body;

    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return c.json({ error: '无效的角色' }, 400);
    }

    await updateUserRole(c.env.DB, userId, role);
    return c.json({ success: true });
  } catch (err) {
    console.error('[Users] Update role error:', err);
    return c.json({ error: '更新角色失败' }, 500);
  }
});

// 删除用户
app.delete('/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    await deleteUser(c.env.DB, userId);
    return c.json({ success: true });
  } catch (err) {
    console.error('[Users] Delete error:', err);
    return c.json({ error: '删除用户失败' }, 500);
  }
});

export default app;
