# 诊断草案：东爱璃Lovely站点橱窗问题

## 收集的上下文

### 1. 系统架构

| 层级 | 实现 | 文件位置 |
|------|------|----------|
| 数据存储 | Cloudflare D1 数据库 | `lovely-site-db` |
| API 端点 | Hono 路由 | `functions/api/[[route]].ts:241-323` |
| 数据库操作 | D1 CRUD 函数 | `functions/lib/db.ts:304-341` |
| 前端组件 | React Island | `src/components/home/ShowcasePicker.tsx` |
| 首页展示 | Astro 组件 | `src/components/home/AboutImageBox.tsx` |

### 2. D1 数据库表结构

**表名**: `showcases`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | TEXT | 是 | 主键（如 model-1） |
| `name` | TEXT | 是 | 橱窗名称 |
| `description` | TEXT | 否 | 描述文本 |
| `folder` | TEXT | 否 | 文件夹标识 |
| `image_url` | TEXT | 否 | 图片CDN链接 |
| `sort_order` | INTEGER | 否 | 排序权重 |
| `created_at` | INTEGER | 是 | 创建时间戳 |
| `updated_at` | INTEGER | 是 | 更新时间戳 |

### 3. API 端点

- `GET /api/showcases` - 公开获取橱窗列表
- `POST /api/showcases` - 需编辑权限
- `DELETE /api/showcases/:id` - 需编辑权限

### 4. 静态数据源

`src/data/config.json` 中有 32 个橱窗配置:
- 字段: id, name, description, image
- 注意：使用 `image` 字段（不是 `image_url`）

### 5. 识别的潜在问题

| # | 问题 | 严重性 | 相关文件 |
|---|------|--------|----------|
| 1 | 无数据迁移脚本 - config.json 数据未导入 D1 | 高 | config.json → D1 |
| 2 | 字段名不匹配 - config.json 用 `image`，D1 用 `image_url` | 高 | 迁移逻辑 |
| 3 | API 自动填充逻辑 - 首次请求会触发额外 UPDATE | 中 | API:241-323 |
| 4 | 无数据库 schema 文件 - 无法追溯表结构 | 低 | 文档缺失 |
| 5 | 排序字段为空 - sort_order 全为 0 时排序不稳定 | 低 | 排序逻辑 |

## 待确认信息

- [ ] 具体问题表现是什么？
- [ ] D1 数据库中是否有数据？
- [ ] API 请求是否报错？
- [ ] 前端是否加载失败？

## 诊断计划

### Phase 1: 确认问题表现

1. 检查 D1 数据库实际数据
2. 调用 API 端点测试响应
3. 检查前端网络请求

### Phase 2: 分析根因

1. 数据缺失 → 创建迁移脚本
2. 字段不匹配 → 修正字段映射
3. API 错误 → 修复后端逻辑

### Phase 3: 修复与验证

1. 执行数据迁移（如需）
2. 测试 API 响应
3. 验证前端展示
