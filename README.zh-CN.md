# 東愛璃Lovely - 非官方应援站

[![Astro](https://img.shields.io/badge/Astro-5.17.1-BC52EE?style=flat-square&logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com)

[English Documentation](./README.md) | [线上站点](https://lovely.yuanbimu.top)

东爱璀Lovely 的非官方应援站，一个用爱发电的 VTuber 展示网站。

## 🎯 功能特色

- 🖼️ **主页展示** - 头像、简介、社交链接
- 📊 **实时统计** - Bilibili 粉丝数实时显示
- 📹 **直播状态** - 实时直播检测（*即将上线*）
- 🖼️ **橱窗展示** - 32 套不同的形象/模型展示
- 📱 **响应式设计** - 适配所有设备
- ⚡ **极致性能** - 静态站点加边缘部署

## 🚀 技术栈

### 前端
- **框架**: [Astro](https://astro.build) - 静态站点生成器
- **UI 框架**: [React](https://react.dev) - 交互组件（岛屿架构）
- **语言**: [TypeScript](https://www.typescriptlang.org)
- **样式**: 
  - [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
  - 自定义 CSS 设计系统（基于 OKLCH 配色）
- **状态管理**: React 原生 hooks（Zustand 已就绪）

### 后端与数据
- **边缘函数**: [Hono](https://hono.dev) 部署在 Cloudflare Pages
- **数据库**: JSON 文件（静态数据）+ IndexedDB（客户端，即将支持）
- **API 接入**: Bilibili API 整合

### 运维与部署
- **托管**: [Cloudflare Pages](https://pages.cloudflare.com)
- **CDN**: Cloudflare R2（图片存储）
- **CI/CD**: GitHub Actions（每日数据更新）
- **包管理器**: npm（兼容 Bun）

## 📁 项目结构

```
lovely-site/
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       └── live.ts              # 直播状态 API 端点
├── public/                     # 静态资源
│   ├── images/
│   └── favicon.ico
├── scripts/                    # 构建与数据自动化
│   ├── fetch-bilibili-data.js  # 获取 Bilibili 用户数据
│   ├── check-live.py           # 检测直播状态
│   └── ...
├── src/
│   ├── components/             # 可复用组件
│   │   ├── home/
│   │   ├── ui/
│   │   └── LiveStatus.tsx    # ⭐ 实时直播状态组件
│   ├── data/                   # JSON 数据文件
│   │   ├── config.json
│   │   ├── dynamics.json
│   │   └── site-data.json
│   ├── layouts/                # 页面布局
│   ├── pages/                  # 路由页面
│   │   ├── index.astro
│   │   ├── showcase.astro
│   │   └── ...
│   ├── styles/                 # CSS 样式
│   │   ├── design-system.css
│   │   └── global.css
│   └── types/                  # TypeScript 定义
│       └── index.ts
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 🎁 快速开始

### 环境要求
- Node.js 18+ (或 Bun 1.0+)
- npm / yarn / pnpm / bun

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourname/lovely-site.git
cd lovely-site

# 安装依赖
npm install
# 或: bun install

# 启动开发服务器
npm run dev
# 或: bun run dev

# 打开 http://localhost:4321
```

### 可用命令

| 命令 | 操作 |
| :------ | :----- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 `localhost:4321` |
| `npm run fetch-data` | 获取最新 Bilibili 数据 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |

## 📝 配置

### 环境变量

创建 `.env` 文件用于本地开发：

```env
# Bilibili API 凭证（公开数据可选）
BILI_JCT=your_jct_cookie
BUVID3=your_buvid3_cookie
BUVID4=your_buvid4_cookie
SESSDATA=your_sessdata_cookie

# Bilibili UID（默认: 3821157）
BILIBILI_UID=3821157

# CDN 配置
CDN_DOMAIN=cdn.yuanbimu.top
```

### 站点数据

编辑 `src/data/site-data.json` 来自定义：
- 个人信息
- 社交链接
- 统计显示设置

## 🔧 开发路线图

### ✅ 已完成
- [x] 基础站点结构
- [x] 个人主页和社交链接
- [x] 橱窗展示（32 套形象）
- [x] Bilibili 数据接入
- [x] 响应式设计
- [x] 自定义设计系统

### 🚛 进行中
- [ ] 实时直播状态检测
  - [ ] 边缘函数 API (`/api/live`)
  - [ ] React 组件 (`LiveStatus.tsx`)
  - [ ] 每 15 分钟自动刷新
  - [ ] 文档: [docs/live-status-plan.md](./docs/live-status-plan.md)

### 📜 计划中
- [ ] 离线支持 (IndexedDB)
- [ ] 收藏功能
- [ ] 搜索功能
- [ ] 暗色模式切换
- [ ] 数据分析仪表盘
- [ ] 多语言支持

### 💭 未来想法
- [ ] 用户评论系统 (Cloudflare D1)
- [ ] 直播推送通知
- [ ] 历史直播统计
- [ ] 交互式时间线

## 📚 文档

- [直播状态开发计划](./docs/live-status-plan.md) - 详细技术方案
- [贡献指南](./CONTRIBUTING.md) - 如何贡献（*即将推出*）
- [更新日志](./CHANGELOG.md) - 版本历史（*即将推出*）

## 💾 数据来源

- **Bilibili API**: [api.bilibili.com](https://api.bilibili.com)
  - 用户信息
  - 直播状态
  - 粉丝数量
  - 动态/投稿

## 🌐 部署

### Cloudflare Pages

本项目配置为在 Cloudflare Pages 自动部署：

1. 将 GitHub 仓库连接到 Cloudflare Pages
2. 构建命令: `npm run build`
3. 构建输出: `dist`
4. 环境变量: 在 Cloudflare 仪表板添加秘密

### 手动部署

```bash
# 构建项目
npm run build

# 将 dist/ 文件夹部署到任何静态托管
# （Cloudflare Pages、Vercel、Netlify 等）
```

## 🤝 贡献

欢迎贡献！请阅读我们的[贡献指南](./CONTRIBUTING.md)了解详情。

### 贡献者快速开始

1. Fork 仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些神奇功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 许可证

本项目开源，基于 [MIT 许可证](./LICENSE)。

## 💝 致谢

- **东爱璀Lovely** - 这个站点的主角，超棒的 VTuber
- **PSPLive** - 所属事务所
- **Bilibili** - 提供开放 API
- **Cloudflare** - 慷慨的免费托管层级

## 📱 联系方式

- **站点**: [lovely.yuanbimu.top](https://lovely.yuanbimu.top)
- **Bilibili**: [space.bilibili.com/3821157](https://space.bilibili.com/3821157)
- **微博**: [weibo.com/u/7802960328](https://weibo.com/u/7802960328)

---

⭐ **如果觉得有帮助，请给这个仓库点星！**

Made with ❤️ by fans, for fans.
