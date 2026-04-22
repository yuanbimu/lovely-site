# 问题记录 - showcase-image-fix

## 2026-04-21

### 已知边界风险

1. **R2 list 条数限制**
   - Cloudflare R2 `list()` API 默认最多返回 1000 条对象
   - 递归模式可能返回大量文件，需注意分页或限制
   - 如需获取更多文件，需使用 `cursor` 参数进行分页查询

2. **隐藏 placeholder 文件**
   - R2 可能包含 `.folder` 等隐藏文件作为目录占位符
   - 本任务未做过滤，保留给前端任务处理（符合需求）

3. **folders 字段兼容**
   - 递归模式下 `folders` 返回空数组 `[]`
   - 前端使用时需兼容处理空数组情况

### Task 2 探查阻塞问题

**问题**: 无法直接列出 R2 对象

1. **wrangler CLI 限制**
   - 当前版本 v4.76.0 没有 `wrangler r2 object list` 命令
   - 只有 get/put/delete 三个对象操作
   - 需要升级到 v4.84+ 或使用其他方式

2. **缺少 API 凭证**
   - Cloudflare API 调用需要 API Token
   - 项目 .env 中没有 R2 相关凭证
   - wrangler 已登录 OAuth，但 API Token 需要单独创建

3. **替代方案**
   - 方案 A: 升级 wrangler 后使用 CLI 探查
   - 方案 B: 通过前端 API 探查 (需先完成 Task 1 并登录)
   - 方案 C: 在 Cloudflare Dashboard 手动查看

**影响**: Task 2 阻塞 → Task 6 (迁移) 依赖此结果