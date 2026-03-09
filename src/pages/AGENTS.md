# AGENTS.md - 页面开发指南

**位置**: `src/pages/`  
**类型**: Astro 页面 + API 端点  
**路由**: 文件系统路由

---

## 目录结构

```
pages/
├── api/                # API 端点
│   ├── live.ts        # 直播状态 API
│   ├── avatar.ts      # 头像 API
│   └── dynamics.ts    # 动态 API
├── index.astro         # 首页
├── about.astro         # 关于页面
├── dynamics.astro      # 动态列表
├── showcase.astro      # 橱窗展示
├── links.astro         # 链接页面
├── articles.astro      # 文章列表
├── 404.astro           # 404 页面
└── 500.astro           # 500 页面
```

---

## 页面类型

### 静态页面 (.astro)

```astro
---
// src/pages/about.astro
import Layout from '../layouts/Layout.astro';
import { SITE_CONFIG } from '../config/site.config';

// 服务端数据获取
const response = await fetch(`${SITE_CONFIG.url}/api/data`);
const data = await response.json();
---

<Layout title="关于">
  <main>
    <h1>{data.title}</h1>
    <p>{data.description}</p>
  </main>
</Layout>
```

**规则**:
- 必须使用 `<Layout>` 包裹
- 所有页面导出 `<main>` 标签
- 元数据在 frontmatter 设置

### 动态页面 (带参数)

```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { slug } = Astro.params;
const { post } = Astro.props;
---

<h1>{post.title}</h1>
```

### API 端点 (.ts)

```typescript
// src/pages/api/live.ts
interface LiveStatusResponse {
  isLive: boolean;
  title: string;
  url: string;
  lastChecked: string;
}

export async function GET(): Promise<Response> {
  try {
    const data = await fetchBilibiliAPI();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500
    });
  }
}
```

**HTTP 方法**:
- `GET()`: 获取数据
- `POST()`: 提交数据
- `PUT()`: 更新数据
- `DELETE()`: 删除数据

---

## 大型页面拆分

当前大型页面：
- `about.astro` (397 行)
- `dynamics.astro` (372 行)

**拆分策略**:
1. 提取可复用部分为组件
2. 长列表使用分页
3. 复杂逻辑移到 `lib/` 工具函数

---

## API 端点规范

### 响应格式

```typescript
// 成功响应
{
  "data": { ... },
  "timestamp": "2026-03-06T10:30:00.000Z"
}

// 错误响应
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### 状态码

| 场景 | 状态码 |
|------|--------|
| 成功 | 200 |
| 创建 | 201 |
| 无内容 | 204 |
| 客户端错误 | 400 |
| 未授权 | 401 |
| 未找到 | 404 |
| 服务端错误 | 500 |

### 缓存策略

```typescript
headers: {
  // 静态数据 - 1 小时
  'Cache-Control': 'public, max-age=3600'
  
  // 动态数据 - 15 分钟
  'Cache-Control': 'public, max-age=900'
  
  // 实时数据 - 不缓存
  'Cache-Control': 'no-cache'
}
```

---

## 布局使用

### 基础布局

```astro
---
// src/layouts/Layout.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description = '默认描述' } = Astro.props;
---

<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 页面布局

```astro
---
// src/layouts/PageLayout.astro
import Layout from './Layout.astro';
---

<Layout title={Astro.props.title}>
  <nav><!-- 导航 --></nav>
  <main>
    <slot />
  </main>
  <footer><!-- 页脚 --></footer>
</Layout>
```

---

## 路由规则

| 路径 | 文件 | URL |
|------|------|-----|
| `index.astro` | `/` | `/` |
| `about.astro` | `/about` | `/about` |
| `blog/index.astro` | `/blog` | `/blog` |
| `blog/[slug].astro` | `/blog/hello` | `/blog/hello` |
| `api/live.ts` | `/api/live` | `/api/live` |

---

## 数据获取

### 服务端 (Frontmatter)

```astro
---
// 构建时获取
const response = await fetch('https://api.example.com/data');
const data = await response.json();
---
```

### 客户端 (React)

```tsx
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData);
}, []);
```

### 混合模式

```astro
---
// 构建时获取静态数据
const staticData = await getStaticData();
---

<!-- 客户端获取动态数据 -->
<DynamicComponent client:load data={staticData} />
```

---

## 错误处理

### 404 页面

```astro
---
// src/pages/404.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="404 - 未找到">
  <h1>404</h1>
  <p>页面不存在</p>
  <a href="/">返回首页</a>
</Layout>
```

### API 错误

```typescript
export async function GET() {
  try {
    // 可能失败的逻辑
  } catch (error) {
    console.error('[API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
```

---

## 性能优化

### 图片优化
```astro
<!-- 懒加载 -->
<img src={image} loading="lazy" alt={alt} />

<!-- 预加载关键图片 -->
<link rel="preload" as="image" href="/images/hero.webp" />
```

### 代码分割
```astro
<!-- 按需加载 React 组件 -->
<HeavyComponent client:visible />
```

### 缓存
```typescript
// API 响应头设置缓存
headers: {
  'Cache-Control': 'public, max-age=900'
}
```

---

## 测试建议

```typescript
// api/live.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/live', () => {
  it('returns live status', async () => {
    const response = await fetch('/api/live');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('isLive');
  });
});
```
