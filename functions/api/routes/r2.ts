/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { buildR2Url } from '../utils/r2';
import { requireAuth, requireEditor } from '../middleware/auth';

const app = new Hono();

// R2 文件列表 API - 公开读取（写操作保留认证）
app.get('/r2-files', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const recursive = c.req.query('recursive') === 'true';

    // 非递归模式使用 delimiter 返回目录结构
    const list = recursive
      ? await c.env.IMAGES.list({ prefix })
      : await c.env.IMAGES.list({ prefix, delimiter: '/' });

    // 文件夹（目录）- 仅在非递归模式下有值
    const folders = recursive
      ? []
      : (list.delimitedPrefixes || []).map(p => ({
          type: 'folder',
          name: p.replace(prefix, '').replace('/', ''),
          key: p
        }));

    // 文件 - 根据环境返回 URL
    const files = list.objects.map(obj => ({
      type: 'file',
      key: obj.key,
      url: buildR2Url(obj.key, c.req.url)
    }));

    return c.json({ success: true, data: { folders, files } });
  } catch (err) {
    console.error('[R2] List error:', err);
    return c.json({ error: '获取文件列表失败' }, 500);
  }
});

// R2 文件获取 API - 本地开发环境代理
app.get('/r2-get/:key', async (c) => {
  try {
    const key = decodeURIComponent(c.req.param('key'));
    const object = await c.env.IMAGES.get(key);

    if (!object) {
      return c.json({ error: '文件不存在' }, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (err) {
    console.error('[R2] Get error:', err);
    return c.json({ error: '获取文件失败' }, 500);
  }
});

// R2 文件删除 API
app.delete('/r2-files/:key', requireAuth, requireEditor, async (c) => {
  try {
    const key = c.req.param('key');

    if (!key) {
      return c.json({ error: '缺少文件 key' }, 400);
    }

    await c.env.IMAGES.delete(key);

    return c.json({ success: true });
  } catch (err) {
    console.error('[R2] Delete error:', err);
    return c.json({ error: '删除失败' }, 500);
  }
});

// R2 上传 API
app.post('/r2-upload', requireAuth, requireEditor, async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'] as File;

    if (!file) {
      return c.json({ error: '请选择文件' }, 400);
    }

    const filename = formData['filename'] as string || file.name;
    const folder = formData['folder'] as string || '';
    const key = folder ? `${folder}/${filename}` : filename;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await c.env.IMAGES.put(key, uint8Array, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream'
      }
    });

    return c.json({
      success: true,
      data: {
        key,
        url: buildR2Url(key, c.req.url)
      }
    });
  } catch (err) {
    console.error('[R2] Upload error:', err);
    return c.json({ error: '上传失败' }, 500);
  }
});

export default app;
