/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getShowcases, saveShowcase, deleteShowcase } from '../../lib/db';
import { requireAuth, requireEditor } from '../middleware/auth';

const app = new Hono();

// Get max model number from existing showcases
async function getMaxModelNumber(db: D1Database): Promise<number> {
  const showcases = await getShowcases(db);
  let maxNum = 0;
  for (const s of showcases) {
    const match = s.id?.match(/^model-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
    const folderMatch = s.folder?.match(/^model-(\d+)$/);
    if (folderMatch) {
      const num = parseInt(folderMatch[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return maxNum;
}

// Update showcase folder
async function updateShowcaseFolder(db: D1Database, id: string, folder: string) {
  const now = Date.now();
  await db.prepare(`
    UPDATE showcases SET folder = ?, updated_at = ? WHERE id = ?
  `).bind(folder, now, id).run();
}

// 获取所有橱窗
app.get('/', async (c) => {
  const showcases = await getShowcases(c.env.DB);

  // Migration: Fill empty folder fields with their ID on first run
  for (const showcase of showcases) {
    if (!showcase.folder && showcase.id) {
      await updateShowcaseFolder(c.env.DB, showcase.id, showcase.id);
      showcase.folder = showcase.id;
    }
  }

  return c.json({ success: true, data: showcases });
});

// 创建或更新橱窗
app.post('/', requireAuth, requireEditor, async (c) => {
  try {
    const body = await c.req.json();

    // Auto-generate folder if not provided
    let folder = body.folder;
    let id = body.id;

    if (!folder && !id) {
      // Both missing - auto-generate model-{N}
      const maxNum = await getMaxModelNumber(c.env.DB);
      const newNum = maxNum + 1;
      id = `model-${newNum}`;
      folder = id;
    } else if (!folder && id) {
      // folder missing but id provided - use id as folder
      folder = id;
    } else if (folder && !id) {
      // id missing but folder provided - use folder as id
      id = folder;
    }

    const showcaseData = {
      id,
      name: body.name,
      description: body.description,
      folder,
      image_url: body.image_url,
      sort_order: body.sort_order || 0
    };
    await saveShowcase(c.env.DB, showcaseData);

    // 创建 R2 占位对象以支持目录识别
    const folderKey = `showcase/${folder}/.folder`;
    await c.env.IMAGES.put(folderKey, new TextEncoder().encode(''), {
      httpMetadata: {
        contentType: 'application/octet-stream'
      }
    });

    return c.json({ success: true, data: showcaseData });
  } catch (err) {
    console.error('[Showcase] Save error:', err);
    return c.json({ error: '保存失败' }, 500);
  }
});

// 删除橱窗
app.delete('/:id', requireAuth, requireEditor, async (c) => {
  await deleteShowcase(c.env.DB, c.req.param('id'));
  return c.json({ success: true });
});

export default app;
