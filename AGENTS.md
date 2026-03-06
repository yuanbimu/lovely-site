# AGENTS.md - 東愛璃 Lovely 应援站开发指南

## 项目概述

本项目是 VTuber 東愛璃 Lovely 的非官方粉丝应援站点，包含两个主要部分：
- `lovely-site/` - Astro + React 站点主体
- `tools/` - 本地工具脚本（数据同步、图片上传等）

## 技术栈

- **框架**: Astro 5.17 + React 19 (Islands 架构)
- **语言**: TypeScript (strict 模式)
- **样式**: Tailwind CSS + 自定义设计系统 (OKLCH 配色)
- **部署**: Cloudflare Pages + Hono 边缘函数
- **数据**: JSON 文件 + Bilibili API

---

## 构建/测试/运行命令

### 开发环境
```bash
cd lovely-site
npm install                    # 安装依赖
npm run dev                    # 启动开发服务器 (localhost:4321)
npm run dev:cf                 # Cloudflare Pages 本地调试
```

### 生产构建
```bash
npm run fetch-data             # 获取最新 B 站数据
npm run build                  # 构建静态站点
npm run preview                # 预览生产构建
```

### 数据同步
```bash
npm run sync-dynamics          # 同步 B 站动态
node scripts/fetch-bilibili-data.js  # 获取 B 站用户数据
```

### 运行单个测试
当前项目无自动化测试框架。添加测试时使用：
```bash
npm install -D vitest @testing-library/react
# vitest.config.ts 配置后运行
npm run test                   # 运行所有测试
npm run test -- --run File.test.ts  # 运行单个测试文件
```

---

## 代码风格指南

### 文件组织
```
lovely-site/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── ui/              # 基础 UI 组件
│   │   ├── home/            # 首页专用组件
│   │   └── *.tsx/*.astro    # React 或 Astro 组件
│   ├── layouts/             # 页面布局
│   ├── pages/               # 路由页面
│   │   ├── api/             # API 端点
│   │   └── *.astro          # Astro 页面
│   ├── styles/              # 全局样式
│   │   ├── design-system.css  # 设计系统变量
│   │   └── global.css       # 全局样式
│   ├── types/               # TypeScript 类型定义
│   ├── lib/                 # 工具函数
│   └── config/              # 配置中心
├── functions/               # Cloudflare Pages 函数
├── scripts/                 # 构建自动化脚本
└── public/                  # 静态资源
```

### 命名约定
- **文件**: 小写 + 连字符 (e.g., `hero-banner.astro`)
- **组件**: 大驼峰 (e.g., `HeroBanner.astro`, `LiveStatus.tsx`)
- **类型**: 大驼峰接口 (e.g., `Profile`, `SiteConfig`)
- **CSS 类**: 连字符分隔 (e.g., `.hero-section`, `.avatar-wrapper`)
- **变量**: 小驼峰 (e.g., `fanCount`, `avatarUrl`)
- **常量**: 全大写 (e.g., `SITE_CONFIG`, `BILIBILI_UID`)

### 导入顺序
```typescript
// 1. React 导入
import { useState, useEffect } from 'react';

// 2. 第三方库
import { formatNumber } from '../../lib/utils';

// 3. 内部模块
import Avatar from '../Avatar';
import type { Profile } from '../../types';

// 4. 样式
import './HeroBanner.css';
```

### TypeScript 规范
- 使用 `astro/tsconfigs/strict` 基础配置
- 所有函数参数和返回值必须标注类型
- 使用接口定义数据结构 (`interface Dynamic { ... }`)
- 避免 `any`，必要时使用 `unknown` 或类型断言
- 事件处理：`React.ChangeEvent<HTMLInputElement>`

### Astro 组件模式
```astro
---
// Frontmatter 中的逻辑
import { formatNumber } from '../../lib/utils';
const { count = 0 } = Astro.props;
---

<!-- 模板部分 -->
<div class="card">{formatNumber(count)}</div>

<style>
  .card { /* 作用域样式 */ }
</style>
```

### React Islands 模式
```tsx
interface Props {
  size?: number;
  className?: string;
}

export default function Avatar({ size = 280, className = '' }: Props) {
  const [url, setUrl] = useState('/images/avatar.webp');
  
  return <img src={url} style={{ width: size }} className={className} />;
}
```

### 错误处理
- API 端点：返回友好错误响应，记录日志
- 数据获取：提供降级数据，避免页面崩溃
- 图片加载：使用 `onError` 提供备用图片

### 样式约定
- 优先使用设计系统变量 (e.g., `var(--brown-500)`)
- 响应式断点：600px, 1000px
- 动画时长：fast (150ms), normal (300ms), slow (500ms)
- 使用 `@layer` 管理 CSS 优先级

---

## 环境配置

### .env 示例
```env
BILIBILI_UID=3821157
CDN_DOMAIN=cdn.yuanbimu.top
```

### Cloudflare 绑定 (wrangler.toml)
- D1 数据库：`DB` 绑定
- R2 存储桶：`IMAGES` 绑定

---

## Git 工作流

```bash
git checkout -b feature/amazing-feature
# 开发完成后
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
# 创建 Pull Request
```

---

## 调试技巧

- 开发服务器：`npm run dev` 查看详细错误堆栈
- 类型检查：Astro 自动运行，VSCode 实时提示
- 网络请求：检查 `src/pages/api/` 端点响应
- 样式调试：使用浏览器 DevTools 检查 CSS 变量
