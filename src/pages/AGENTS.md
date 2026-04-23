# AGENTS.md - 页面开发指南

适用目录：`src/pages/`

## 目录现状

```text
pages/
├── 404.astro
├── 500.astro
├── index.astro
├── about.astro
├── articles.astro
├── links.astro
├── showcase.astro
├── songs.astro
├── timeline.astro
├── api/
│   ├── avatar.ts
│   └── live.ts
└── admin/
    ├── index.astro
    └── timeline.astro
```

## 页面层规则

- 页面文件保持语义化命名
- 页面优先负责布局、数据组合和 SEO 元信息
- 复杂交互逻辑尽量下沉到 `src/components/`

## 当前项目中的页面类型

### 普通页面

- `index.astro`、`about.astro`、`showcase.astro`、`songs.astro`、`timeline.astro` 等
- 这类页面以 Astro 组合组件和静态数据为主

### 管理后台页面

- 位于 `admin/`
- 主要负责挂载后台相关 React 组件与布局容器

### Astro API 端点

- `api/live.ts`
- `api/avatar.ts`

注意：这里的 `src/pages/api/` 只包含少量 Astro 端点。更完整的运行时 API 路由位于 `functions/api/`，使用 Hono 集中管理，详见 `functions/AGENTS.md`。

## 布局与组合原则

- 页面应该优先使用现有布局与导航结构
- 页面负责组装数据与组件，不应承担过多底层交互细节
- 当页面体积继续增长时，优先拆到 `src/components/`，不要把大量展示逻辑长期堆在单个页面文件里

## 数据来源约定

- 构建期静态内容：优先来自 `src/data/*.json`
- 运行时数据：通过 `functions/api/` 或现有 Astro API 端点获取
- 不要在页面文档里假设存在未落地的页面、路由或博客体系

## 修改页面时的要求

- 确认页面路径与文件系统路由一致
- 如果新增页面，先判断应放普通页面、`admin/` 还是 API 端点
- 如果页面变重，优先提取组件而不是继续堆积
- 页面改动后至少验证 `npm run build`
