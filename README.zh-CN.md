# 东爱璃Lovely - 非官方应援站

[![Astro](https://img.shields.io/badge/Astro-5.17.1-BC52EE?style=flat-square&logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com)

[English Documentation](./README.md) | [线上站点](https://lovely.yuanbimu.top)

这是一个面向东爱璀 Lovely 的非官方应援站，采用 Astro 静态生成、React Islands 和 Cloudflare Pages 构建。

## 当前能力

- 使用 Astro 生成静态页面，包括首页、关于、橱窗、歌曲、时间线、友链和文章页面
- 使用 React 组件承载交互逻辑，例如直播状态、头像加载和动态列表
- 使用 Cloudflare Pages Functions + Hono 提供运行时 API
- 使用 D1 存储直播状态和后台管理相关数据，使用 R2 作为图片存储绑定
- 提供面向移动端和桌面端的响应式样式系统

## 技术栈

- Astro 5
- React 19
- TypeScript 严格模式
- Hono
- Cloudflare Pages / D1 / R2

## 项目结构

```text
lovely-site/
├── functions/                 # Cloudflare Pages Functions 入口与路由聚合
├── scripts/                   # 初始化、同步、数据库辅助脚本
├── src/
│   ├── components/            # Astro + React 组件
│   ├── config/                # 站点配置
│   ├── data/                  # 构建期使用的静态 JSON 数据
│   ├── pages/                 # Astro 页面与 API 端点
│   │   ├── admin/
│   │   └── api/
│   ├── styles/                # 设计系统与全局样式
│   └── types/                 # 共用 TypeScript 类型
├── docs/                      # 活跃文档与归档文档
├── wrangler.toml
└── package.json
```

## 快速开始

### 前置要求

- Node.js 18+
- npm
- 如果需要使用 `dev:cf`、D1 或 R2，请准备 Cloudflare 账号权限

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
# Astro 开发服务器
npm run dev

# 带 Cloudflare Pages Functions / D1 / R2 绑定的本地环境
npm run dev:cf
```

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Astro 本地开发服务器 |
| `npm run dev:cf` | 启动 Cloudflare Pages 本地环境 |
| `npm run setup` | 执行 Wrangler 相关本地配置 |
| `npm run login` | Wrangler 登录 |
| `npm run init:db` | 初始化本地数据库 |
| `npm run sync:live` | 同步直播状态到本地 D1 |
| `npm run build` | 构建生产产物 |
| `npm run preview` | 预览构建结果 |

## 数据与部署说明

- `src/data/*.json` 用于构建期静态内容
- D1 用于运行时数据，例如直播状态和后台内容
- R2 用于图片存储绑定
- 构建输出目录为 `dist`
- Cloudflare Pages 配置位于 `wrangler.toml`
- `sync-dynamics.yml` 仍存在，但定时自动同步当前因 B 站风控已禁用
- `sync-live.yml` 用于定时同步直播状态

## 文档入口

- `AGENTS.md`：项目规则与 AI 开发约束
- `CONTRIBUTING.md`：贡献流程与仓库约定
- `QUICK_START.md`：最小本地启动路径
- `docs/database-schema.md`：基于代码整理的数据库结构参考
- `docs/archive/`：已归档的历史存根文档，不应作为当前实现依据

## 参与开发

提交修改前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。
