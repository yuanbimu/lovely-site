# AGENTS.md - Cloudflare 边缘函数

**位置**: `functions/`  
**运行时**: Cloudflare Workers  
**框架**: Hono (轻量路由)

---

## 目录结构

```
functions/
├── api/
│   ├── live.ts        # 直播状态 API
│   ├── avatar.ts      # 头像 API
│   ├── dynamics.ts    # 动态 API
│   └── sync.ts        # 同步 API
└── lib/
    └── db.ts          # 数据库工具
```

---

## 基础模板

```typescript
// functions/api/example.ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/', async (c) => {
  return c.json({ message: 'Hello' });
});

app.post('/', async (c) => {
  const body = await c.req.json();
  return c.json({ received: body });
});

export default app;
```

---

## 部署配置

### wrangler.toml

```toml
name = "lovely-site"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "YOUR_ID"

# R2 存储桶
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "lovely-site-images"
```

### 环境变量

```env
# .env (本地开发)
BILIBILI_UID=3821157
CDN_DOMAIN=cdn.yuanbimu.top

# Cloudflare Dashboard (生产)
# Settings → Environment Variables
```

---

## 本地开发

```bash
# 启动开发服务器 (带边缘函数)
npm run dev:cf

# 访问边缘函数
# http://localhost:8788/api/live
```

---

## API 模式

### GET 请求

```typescript
app.get('/status', async (c) => {
  const status = { isLive: false };
  return c.json(status, 200);
});
```

### POST 请求

```typescript
app.post('/webhook', async (c) => {
  const body = await c.req.json();
  // 处理 webhook
  return c.json({ success: true });
});
```

### 带参数

```typescript
app.get('/user/:id', async (c) => {
  const id = c.req.param('id');
  const user = await getUser(id);
  return c.json(user);
});
```

---

## 数据库操作 (D1)

```typescript
// functions/lib/db.ts
import { D1Database } from '@cloudflare/workers-types';

export async function queryUser(
  db: D1Database,
  userId: string
) {
  const { results } = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .all();
  
  return results[0];
}
```

### 在 API 中使用

```typescript
// functions/api/user/[id].ts
interface Env {
  DB: D1Database;
}

export default async function request(
  req: Request,
  env: Env
) {
  const user = await queryUser(env.DB, '123');
  return Response.json(user);
}
```

---

## 存储操作 (R2)

```typescript
// 上传图片
app.put('/upload', async (c) => {
  const image = await c.req.blob();
  await c.env.IMAGES.put('avatar.jpg', image);
  return c.json({ success: true });
});

// 下载图片
app.get('/image/:key', async (c) => {
  const object = await c.env.IMAGES.get(c.req.param('key'));
  return new Response(object.body);
});
```

---

## 缓存策略

### 边缘缓存

```typescript
app.get('/api/data', async (c) => {
  const cache = caches.default;
  const cacheKey = new Request(c.req.url);
  
  let response = await cache.match(cacheKey);
  
  if (!response) {
    const data = await fetchData();
    response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900'
      }
    });
    
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  
  return response;
});
```

---

## 错误处理

```typescript
app.onError((err, c) => {
  console.error('[Edge Function Error]:', err);
  
  return c.json(
    { error: 'Internal Server Error' },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});
```

---

## 中间件

### CORS

```typescript
import { cors } from 'hono/cors';

app.use('/api/*', cors());
```

### 日志

```typescript
import { logger } from 'hono/logger';

app.use(logger());
```

### 认证

```typescript
app.use('/api/protected/*', async (c, next) => {
  const token = c.req.header('Authorization');
  
  if (!token || token !== 'Bearer secret') {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await next();
});
```

---

## 测试建议

```typescript
// api/live.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/live', () => {
  it('returns live status', async () => {
    const response = await fetch('http://localhost:8788/api/live');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('isLive');
  });
});
```

---

## 部署检查清单

- [ ] 环境变量在 Cloudflare Dashboard 配置
- [ ] D1 数据库 ID 正确
- [ ] R2 存储桶绑定
- [ ] 本地测试通过
- [ ] 生产环境测试

---

## 常见问题

### 404 错误
检查 `functions/` 目录结构，确保文件在正确路径

### 环境变量未定义
- 本地：`.env` 文件或 `wrangler.toml`
- 生产：Cloudflare Dashboard Settings

### 数据库绑定错误
确保 `wrangler.toml` 中 `binding` 与代码中 `env.DB` 匹配
