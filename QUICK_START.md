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

## 本地同步生产 D1 数据

如果本地开发时出现 `/api/showcases`、`/api/songs` 等接口因为缺表或缺数据而报错，可以先把生产 D1 同步到本地：

```bash
npm run pull:db
```

补充说明：

- 该命令会先从生产 D1 导出完整 SQL，再导入到本地 D1
- 默认会删除临时导出文件；如果需要保留，可执行 `node scripts/pull-d1.js --keep-dump`
- 同步完成后再运行 `npm run dev:all`
- API：`http://localhost:4321/api/*`（由 Astro 开发服务器代理到本地 Wrangler 的 `8788`）

## 成功标志

- `npm run dev` 可以正常打开站点
- `npm run dev:cf` 可以正常启动本地 Pages 环境
- 页面能正常访问，且时间线与后台入口存在

## 补充说明

- 更完整的项目规则请看 `AGENTS.md`
- 数据库结构参考见 `docs/database-schema.md`
- `npm run dev:cf` / `npm run dev:all` 启动后，日常开发统一访问 `4321`，不要直接依赖 `8788` 作为手动访问入口
