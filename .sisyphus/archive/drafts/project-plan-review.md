# Draft: 全项目计划审查

## Requirements (confirmed)
- 目标：检查全项目的计划并挑错
- 当前理解：优先审查项目内现有计划类 Markdown，找出结构、范围、依赖、验证、可执行性等问题

## Technical Decisions
- 审查对象暂定为 `.sisyphus/plans/*.md` 以及项目根目录下明显属于计划/方案的 Markdown 文件
- 输出形式预期为：按文件列出问题，并补充全局共性问题

## Research Findings
- 现有“计划”文档混有两类内容：
  - 正式工作计划：`.sisyphus/plans/showcase-picker.md`、`.sisyphus/plans/admin-improvements.md`
  - 根目录所谓“计划”文档多数其实是页面/接口抓取结果，不是可执行计划：`timeline-page.md`、`showcase-page.md`、`r2-files-api.md`、`admin-after-login.md`、`admin-dashboard.md`、`admin-login.md`
- `showcase-picker.md` 主要问题：
  - TODO 已打勾但验收项未打勾，状态自相矛盾
  - 缺少完整依赖矩阵、并行策略、最终验证波次
  - QA 场景不够可执行，缺少具体选择器、证据文件、错误断言
  - 任务描述混入“已实现”口吻，更像事后记录，不像执行前计划
- `admin-improvements.md` 主要问题：
  - 范围过大且混杂：UI、R2 迁移、数据库更新、前台轮播、文档都塞在一个计划里，但任务粒度仍偏粗
  - 验证策略把“有 wrangler/cloudflare”误当成测试基础设施
  - 出现越权输出路径 `docs/database-schema.md`，不符合 Prometheus 计划输出约束
  - Final Verification 直接打勾，但没有并行复核细节与证据
  - 包含高风险生产操作（R2/数据库）却缺少回滚、备份、分批执行与失败恢复策略
- 根目录 6 个文档都不是“计划”，更像 Playwright/接口抓取快照：
  - 不含目标、范围、任务、依赖、验收、风险、验证策略
  - 只能作为现状证据，不能作为实施计划

## Open Questions
- 是否需要把这次“挑错”进一步整理成正式整改工作计划

## Scope Boundaries
- INCLUDE: 计划文档内容质量、任务拆分、依赖关系、验收标准、范围边界、可执行性
- EXCLUDE: 直接修改源码、直接实现功能
