# AGENTS.md - Cloudflare Pages Functions 指南

适用目录：`functions/`

## 目录现状

```text
functions/
├── api/
│   ├── [[route]].ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── dynamics.ts
│   │   ├── live.ts
│   │   ├── r2.ts
│   │   ├── showcases.ts
│   │   ├── songs.ts
│   │   ├── timeline.ts
│   │   └── users.ts
│   └── utils/
│       ├── cookies.ts
│       ├── crypto.ts
│       └── r2.ts
└── lib/
    └── db.ts
```

## 架构规则

- `functions/api/[[route]].ts` 是聚合入口
- 具体业务路由放在 `functions/api/routes/`
- 中间件放在 `functions/api/middleware/`
- 辅助工具放在 `functions/api/utils/`
- D1 数据库相关能力集中在 `functions/lib/db.ts`

## 运行时约定

- 框架：Hono
- 本地调试：`npm run dev:cf`
- 绑定名称以 `wrangler.toml` 为准：`DB`、`IMAGES`

## 修改 Functions 时的原则

- 优先复用已有 `routes/` 结构，不要随意新建平铺的旧式 endpoint 文件
- 新增 API 时，先判断应加入哪个现有路由模块；只有确实独立时再新增新路由文件
- 涉及鉴权时，优先复用 `middleware/auth.ts`
- 涉及 R2 时，优先复用 `utils/r2.ts`
- 涉及 D1 时，优先复用 `lib/db.ts` 中已有查询与数据模型

## 返回与错误处理

- 尽量沿用现有 Hono 路由风格返回 JSON
- 错误处理要可追踪，不要吞错
- 不要在文档里假设不存在的路由文件或旧目录结构

## 本地与部署验证

- 修改函数后至少验证 `npm run dev:cf`
- 提交前至少执行 `npm run build`
- 如果涉及绑定或数据库结构，额外对照 `wrangler.toml` 与 `docs/database-schema.md`
