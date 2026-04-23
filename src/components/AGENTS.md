# AGENTS.md - 组件开发指南

适用目录：`src/components/`

## 目录现状

```text
components/
├── admin/
│   ├── AdminLogin.tsx
│   ├── AdminSidebar.tsx
│   ├── types.ts
│   └── tabs/
├── home/
│   ├── AboutImageBox.tsx
│   ├── AboutSection.astro
│   ├── HeroBanner.astro
│   └── ShowcasePicker.tsx
├── ui/
│   └── SectionHeader.astro
├── Avatar.tsx / Avatar.css
├── LiveStatus.tsx / LiveStatus.css
├── DynamicsList.tsx / DynamicsList.css
├── DynamicsPreview.astro
├── AdminDashboard.tsx / AdminDashboard.css
├── ImagePicker.tsx / ImagePicker.css
├── ShowcaseList.tsx
├── SongsList.tsx
├── TimelineAdmin.tsx / TimelineAdmin.css
├── TimelineList.tsx
├── SiteUptime.tsx / SiteUptime.css
├── ContributorsWall.tsx / ContributorsWall.css
├── Footer.astro
├── Navigation.astro
└── QuickNav.astro
```

## 组件选择规则

- 纯展示、SEO 关键、静态内容：优先 Astro
- 有状态、事件、轮询、客户端请求：使用 React
- 页面级组合尽量放在 Astro，交互局部以下沉到 React Islands 为主

## 当前项目中的常见模式

### React 组件

- 使用显式 Props 接口
- 伴随样式通常与组件同目录放置，如 `LiveStatus.tsx` + `LiveStatus.css`
- 涉及请求或副作用时，优先沿用现有错误态 / 加载态处理方式

### Astro 组件

- 用于页面区块、导航、页脚、展示型内容
- 尽量把静态内容和布局控制留在 Astro 侧
- 需要客户端能力时，通过 `client:*` 挂载 React 组件

### Islands 使用

- `client:load`：首屏关键交互
- `client:visible`：可延迟的非关键组件
- 不要为了统一风格把纯静态组件改成 React

## 样式约定

- 优先复用 `src/styles/design-system.css` 中的变量
- 沿用现有类名和结构，不随意引入新的命名体系
- UI 改动要同时关注移动端与桌面端

## 目录局部提醒

- `home/` 主要承载首页与关于页的大型展示组件
- `admin/` 主要承载后台登录、侧边栏和 tab 组件
- `ui/` 当前只有少量基础展示组件，不要假设这里已经有完整通用组件库

## 修改组件时的要求

- 不要虚构不存在的基础组件或 hooks 体系
- 不要假设项目已引入 Zustand、Testing Library 等未落地依赖
- 如果新增组件，需要判断它应属于 `home/`、`admin/`、`ui/` 还是根组件层
- 修改交互组件后，至少验证 `npm run build`
