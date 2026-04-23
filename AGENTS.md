# AGENTS.md - 東愛璃 Lovely 应援站

**Stack**: Astro 5.17 + React 19 + TypeScript + Cloudflare Pages  
**Domain**: VTuber 粉丝应援站点

---

## 语言规则（强制）

- 所有回复、注释、提交信息使用简体中文
- 用户使用繁体时，先转换为简体再回复
- 禁止在代码中使用 `any`、`@ts-ignore`、空 `catch` 块

## Git 与提交规则

- 提交信息使用简体中文
- 建议前缀：`feat:` `fix:` `chore:` `refactor:` `docs:`
- 提交前至少运行 `npm run build`

## 项目结构

```text
lovely-site/
├── src/
│   ├── components/     # React + Astro 组件（见 src/components/AGENTS.md）
│   ├── pages/          # 页面与 Astro API 端点（见 src/pages/AGENTS.md）
│   ├── styles/         # 设计系统与全局样式
│   ├── types/          # TypeScript 类型定义
│   ├── lib/            # 工具函数
│   ├── config/         # 站点配置
│   └── data/           # 构建期静态 JSON 数据
├── functions/          # Cloudflare Pages Functions（见 functions/AGENTS.md）
├── scripts/            # 初始化、同步、数据库辅助脚本
├── docs/               # 活跃文档与归档文档
└── .github/workflows/  # CI/CD 与同步任务
```

## 当前可用命令

```bash
npm install
npm run dev
npm run dev:cf
npm run setup
npm run login
npm run init:db
npm run sync:live
npm run build
npm run preview
```

补充说明：

- `scripts/sync-dynamics.js` 文件存在，但当前没有对应的 npm script
- `sync-dynamics.yml` 工作流仍存在，但定时自动同步当前已禁用

## 技术与架构约定

| 领域 | 约定 |
|------|------|
| 静态页面 | 优先 Astro，减少不必要 JS |
| 交互组件 | 使用 React Islands |
| 运行时 API | 使用 Cloudflare Pages Functions + Hono |
| 数据分层 | `src/data/*.json` 用于构建期静态数据，D1 用于运行时数据 |
| 图片存储 | 使用 R2 绑定 |
| 样式 | 设计系统变量优先，避免随意引入新风格 |

## 核心开发约定

### 文件命名

- 组件：大驼峰，如 `HeroBanner.astro`、`LiveStatus.tsx`
- 页面：语义化小写，如 `index.astro`、`timeline.astro`
- 工具与配置：小写或连字符风格

### TypeScript

- 使用 `astro/tsconfigs/strict`
- 优先复用 `src/types/` 中已有类型
- 不确定类型时优先使用 `unknown`，不要回退到 `any`

### 样式

- 优先复用 `src/styles/design-system.css` 中的变量
- 修改 UI 时同时检查桌面端与移动端
- 尽量沿用现有组件样式组织方式，不随意引入新的样式范式

## Cloudflare 与运行时

- 本地运行 Pages Functions：`npm run dev:cf`
- 绑定名称以 `wrangler.toml` 为准：`DB`、`IMAGES`
- Functions 入口与聚合逻辑位于 `functions/api/`

## 数据流

```text
Bilibili / 外部数据
  ├── scripts/sync-dynamics.js -> src/data/dynamics.json（构建期静态内容）
  └── scripts/sync-live-to-d1.js -> D1（运行时直播状态）
```

## 验证要求

- 功能改动后至少执行 `npm run build`
- UI 改动需要做页面可见性与响应式检查
- 文档改动要保持与实际脚本、路径、工作流一致

## CI/CD 备注

- `auto-pr.yml`：自动建 PR / build / 自动合并相关流程
- `sync-dynamics.yml`：存在但定时同步已禁用
- `sync-live.yml`：定时同步直播状态
- `update.yml`：依赖更新相关流程

## 子目录 AGENTS

| 文件 | 用途 |
|------|------|
| `src/components/AGENTS.md` | 组件层模式与目录局部规则 |
| `src/pages/AGENTS.md` | 页面、布局与 Astro 端点说明 |
| `functions/AGENTS.md` | Hono 路由、D1、R2 与函数结构 |

## 常见判断原则

- 代码、配置、工作流优先于 README 或历史文档
- 子目录 `AGENTS.md` 只覆盖该目录的局部规则，不覆盖全局硬约束
- `docs/archive/` 中的内容默认不应作为当前实现依据
