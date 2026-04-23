# 快速开始

本文件只保留当前仓库真实可执行的最小启动路径。

## 1. 安装依赖

```bash
npm install
```

## 2. 可选：登录与初始化 Cloudflare 本地环境

如果你需要运行带 D1 / R2 绑定的本地环境，请先完成：

```bash
npm run login
npm run setup
npm run init:db
```

## 3. 启动开发

```bash
# 仅启动 Astro
npm run dev

# 启动 Cloudflare Pages 本地环境
npm run dev:cf
```

## 常用访问地址

- 首页：`http://localhost:4321/`
- 时间线：`http://localhost:4321/timeline`
- 管理后台：`http://localhost:4321/admin`

## 成功标志

- `npm run dev` 可以正常打开站点
- `npm run dev:cf` 可以正常启动本地 Pages 环境
- 页面能正常访问，且时间线与后台入口存在

## 补充说明

- 更完整的项目规则请看 `AGENTS.md`
- 数据库结构参考见 `docs/database-schema.md`
