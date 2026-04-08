# AGENTS.md - 東愛璃 Lovely 应援站

**Stack**: Astro 5.17 + React 19 + TypeScript + Cloudflare Pages  
**Domain**: VTuber 粉丝应援站点  
**Generated**: 2026-03-06

---

## 语言规则 (强制)

### 强制使用简体中文
- **所有回复必须使用简体中文（简体字）**
- 代码注释、提交信息、对话回复全部使用简体
- **禁止使用繁体中文（如"裡""為""發"等）**

### 繁体转简体
- 用户输入繁体中文时：**先转换为简体再回复**
- 自动转换示例：
  - "裡面" → "里面"
  - "為什麼" → "为什么"
  - "發送" → "发送"

### Git 提交规则
- 提交信息使用简体中文
- 使用约定的提交前缀：`feat:` `fix:` `chore:` `refactor:`

---

## 项目结构

```
lovely-site/
├── src/
│   ├── components/     # React + Astro 组件 (见 /src/components/AGENTS.md)
│   ├── pages/          # 路由页面 + API 端点 (见 /src/pages/AGENTS.md)
│   ├── styles/         # 设计系统 + 全局样式
│   ├── types/          # TypeScript 类型定义
│   ├── lib/            # 工具函数
│   └── config/         # 站点配置中心
├── functions/          # Cloudflare Pages 边缘函数 (见 /functions/AGENTS.md)
├── scripts/            # 数据同步/自动化脚本
├── public/             # 静态资源
└── .github/workflows/  # CI/CD (自动同步 B 站动态)
```

---

## 快速开始

```bash
# 开发
npm install
npm run dev              # localhost:4321
npm run dev:cf           # Cloudflare Pages 本地调试

# 生产
npm run fetch-data       # 获取 B 站数据
npm run build            # 构建到 dist/
npm run preview          # 预览

# 数据同步
npm run sync-dynamics    # 同步 B 站动态
```

---

## 技术栈决策

| 领域 | 技术 | 原因 |
|------|------|------|
| 静态页面 | Astro | SEO 友好，零 JS 输出 |
| 交互组件 | React Islands | 按需 hydration |
| API 端点 | Hono | 轻量，Cloudflare 原生支持 |
| 部署 | Cloudflare Pages | 免费边缘网络，Functions 集成 |
| 样式 | Tailwind + CSS 变量 | 设计系统复用 |

---

## 核心约定

### 文件命名
- **组件**: 大驼峰 (`HeroBanner.astro`, `LiveStatus.tsx`)
- **页面**: 小写 (`index.astro`, `dynamics.astro`)
- **工具**: 小写 + 连字符 (`site.config.ts`)

### TypeScript
- 严格模式 (`astro/tsconfigs/strict`)
- 所有接口定义在 `src/types/index.ts`
- 禁止 `any`，必要时用 `unknown`

### 样式
- 设计系统变量优先 (`var(--brown-500)`, `var(--blue-200)`)
- 响应式断点：`600px`, `1000px`
- 使用 `@layer` 管理优先级

---

## 边缘函数 (Cloudflare)

**位置**: `functions/api/*.ts`

**部署**: 自动部署到 Cloudflare Pages Functions

**本地测试**: `npm run dev:cf`

**环境绑定** (wrangler.toml):
- `DB`: D1 数据库
- `IMAGES`: R2 存储桶

---

## 数据流

```
Bilibili API → scripts/sync-dynamics.js → src/data/dynamics.json
                                           ↓
                                    Astro 页面渲染
                                           ↓
                                    静态 HTML 输出
```

**自动同步**: GitHub Actions 每 30 分钟触发 (已禁用，因 B 站风控)

---

## 测试

**当前状态**: 无自动化测试

**推荐添加**:
```bash
npm install -D vitest @testing-library/react
```

**运行单个测试**:
```bash
npx vitest path/to/test.test.ts
```

---

## CI/CD

**工作流**:
- `sync-dynamics.yml`: 同步 B 站动态 (已禁用)
- `update.yml`: 自动更新依赖

**部署**: 推送到 main 分支自动部署到 Cloudflare Pages

---

## 常见问题

### B 站 API 风控
- GitHub Actions IP 被封，改用本地运行脚本
- 需要 Cookie: `BILI_JCT`, `BUVID3`, `SESSDATA`

### Cloudflare 绑定
- 本地开发无需配置
- 生产环境在 Cloudflare Dashboard 设置

### 设计系统
- 位置：`src/styles/design-system.css`
- 包含：配色、间距、阴影、动画时长

---

## 子目录 AGENTS.md

| 目录 | 内容 |
|------|------|
| `/src/components/AGENTS.md` | React + Astro 组件模式 |
| `/src/pages/AGENTS.md` | 页面路由 + API 端点 |
| `/functions/AGENTS.md` | Cloudflare 边缘函数 |
| `/src/pages/AGENTS.md` | 页面路由 + API 端点 |
| `/functions/AGENTS.md` | Cloudflare 边缘函数 |

---

## 待办事项

### 进行中

- [x] 关于页面改进 - 见 `docs/about-page-plan.md`
  - [x] 站点运行时间统计（已移至 Footer，全站可见）
  - [x] 贡献者墙
  - [x] 鸣谢部分重构（分层次）
  - [ ] 文字内容优化（更有温度）
  - [ ] 更新日志

### 计划中

- [ ] 动态数据同步（D1 + R2）- 见 `docs/dynamics-sync-notes.md`
- [ ] 实时直播检测功能 - 见 `docs/live-status-plan.md`
- [ ] 歌单内容填充
- [ ] Pics 图片库页面

### 已完成 ✅

- [x] Timeline 时间线页面
- [x] Songs 歌单页面（框架）
- [x] 导航栏重新设计（Logo 置左）
- [x] 直播状态检测功能
- [x] 繁体字统一转换为简体

---

### 断点系统

```css
--breakpoint-xs: 320px;   /* 小型手机 */
--breakpoint-sm: 375px;   /* iPhone 12 mini */
--breakpoint-md: 414px;   /* iPhone 12 Pro Max */
--breakpoint-lg: 600px;   /* 平板竖屏 */
--breakpoint-xl: 768px;   /* 平板横屏 */
--breakpoint-2xl: 900px;  /* 小屏笔记本 */
--breakpoint-3xl: 1000px; /* 桌面过渡 */
--breakpoint-4xl: 1200px; /* 标准桌面 */
```

### 移动端优化

- **Navigation**: 汉堡菜单（<600px）
- **HeroBanner**: 响应式字体和布局
- **Footer**: 单列布局（<600px）
- **AboutSection**: 垂直堆叠（<1000px）
- **DynamicsList**: 触摸友好按钮

### 响应式工具类

- `.touch-target` - 最小 44px 触摸区域
- `.container-cute` - 自适应容器
