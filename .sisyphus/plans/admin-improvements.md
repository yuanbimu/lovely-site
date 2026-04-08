# Admin 后台改进计划

## TL;DR

> **快速Summary**: 修复Admin后台布局（居中+3列网格）、迁移R2图片、添加橱窗轮播图、删除时间线批量导入
> 
> **交付成果**: 
> - Admin页面布局修复
> - R2图片迁移脚本 + 占位图
> - 橱窗展示页轮播图
> - 数据库文档
> 
> **预计工作**: Medium
> **并行执行**: YES

---

## Context

### 原始需求
用户对Admin后台所有地方不满意，要求：
1. 布局居中，一行3个方块
2. 橱窗展示页支持轮播图（自动/手动切换）
3. R2图片迁移（showcase/model-1.jpg → model-1/）
4. model-3~32占位图（复制model-1）
5. 删除时间线批量导入

### 已确认的问题
- Admin所有页面内容偏左，需居中
- 橱窗图片404（路径错误）
- 前台橱窗展示页需要轮播功能

---

## Work Objectives

### 核心目标
1. 修复Admin页面布局（居中+3列）
2. 迁移R2图片并更新数据库
3. 添加橱窗轮播图功能
4. 创建数据库文档

### 具体交付物
- [ ] Admin布局CSS修复（居中+3列网格）
- [ ] R2图片迁移（showcase → model-x/）
- [ ] model-3~32占位图上传
- [ ] 数据库image_url路径更新
- [ ] 橱窗展示页轮播组件
- [ ] 删除时间线批量导入UI
- [ ] 数据库文档（docs/database-schema.md）

### 定义完成
- Admin页面 `/admin` 访问正常，内容居中显示
- 橱窗页面 `/showcase` 显示轮播图
- 前台数据不丢失

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (wrangler, cloudflare)
- **Automated tests**: None (manual QA)
- **Agent-Executed QA**: 每次修改后验证页面正常

### QA Policy
- 每次CSS修改后访问 `/admin` 验证布局
- R2迁移后验证 `/api/r2-files` 返回正确数据
- 数据库更新后查询验证
- 轮播图添加后验证 `/showcase` 正常显示

---

## Execution Strategy

### Wave 1 (基础)
1. Admin布局修复CSS
2. R2图片迁移脚本
3. 数据库路径更新

### Wave 2 (功能)
4. 橱窗轮播组件
5. 删除时间线批量导入

### Wave 3 (文档)
6. 创建数据库文档

---

## TODOs

- [x] 1. Admin布局修复 - CSS居中+3列网格

  **What to do**:
  - 修改 `src/components/AdminDashboard.css`
  - 内容区域添加 `max-width: 1200px; margin: 0 auto;`
  - 表格/表单改为居中
  - 响应式3列网格

  **Must NOT do**:
  - 不修改认证逻辑
  - 不修改其他页面

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 需要CSS布局调整
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: None

  **References**:
  - `src/components/AdminDashboard.css:1-496` - 现有样式
  - `src/layouts/AdminLayout.astro:16-235` - 布局样式

  **Acceptance Criteria**:
  - [ ] 访问 `/admin` 内容居中
  - [ ] 一行显示3个方块（统计卡片等）
  - [ ] 响应式正常

- [x] 2. R2图片迁移 - showcase图片移动到model-x目录

  **What to do**:
  - 下载 `showcase/model-1.jpg`
  - 上传到 `model-1/model-1.jpg`
  - 复制到 `model-3/` ~ `model-32/` 作为占位图
  - 上传命令通过 `/api/r2-upload` API

  **Must NOT do**:
  - 不删除原有文件（备份后删除）
  - 不修改其他数据

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要API调用和文件操作

  **Parallelization**:
  - **Can Run In Parallel**: YES (分批上传)

  **References**:
  - `functions/api/[[route]].ts:370-404` - R2上传API

  **Acceptance Criteria**:
  - [ ] `model-1/` 有主图
  - [ ] `model-3` ~ `model-32` 都有占位图

- [x] 3. 数据库image_url更新

  **What to do**:
  - 查询现有showcases数据
  - 更新每个showcase的image_url为R2 URL格式
  - 格式: `https://cdn.yuanbimu.top/{folder}/{filename}`

  **Must NOT do**:
  - 不删除数据
  - 不修改其他表

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 数据库操作

  **Parallelization**:
  - **Can Run In Parallel**: NO (依赖R2迁移)

  **References**:
  - `functions/lib/db.ts:304-341` - showcases表操作

  **Acceptance Criteria**:
  - [ ] 所有showcase的image_url更新为R2 URL
  - [ ] 数据量不变

- [x] 4. 删除时间线批量导入UI

  **What to do**:
  - 修改 `src/components/AdminDashboard.tsx`
  - 删除时间线Tab的批量导入区域
  - 保留API（以备后用）

  **Must NOT do**:
  - 不删除其他功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单UI删除

  **Parallelization**:
  - **Can Run In Parallel**: YES

  **References**:
  - `src/components/AdminDashboard.tsx:752-762` - 批量导入代码

  **Acceptance Criteria**:
  - [ ] 时间线Tab没有批量导入框
  - [ ] 事件CRUD正常

- [x] 5. 橱窗展示页轮播组件

  **What to do**:
  - 在前台橱窗页添加轮播图
  - 支持自动切换（3秒）
  - 支持手动切换（左右箭头+圆点）
  - 图片来源于R2各model目录

  **Must NOT do**:
  - 不破坏现有网格布局
  - 不修改Admin页面

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 轮播组件开发

  **Parallelization**:
  - **Can Run In Parallel**: YES

  **References**:
  - `src/components/ShowcaseList.tsx` - 现有橱窗组件

  **Acceptance Criteria**:
  - [ ] 轮播图正常显示
  - [ ] 自动切换正常
  - [ ] 手动切换正常
  - [ ] 现有网格布局保留

- [x] 6. 创建数据库文档

  **What to do**:
  - 创建 `docs/database-schema.md`
  - 记录所有表结构
  - 记录字段类型和说明

  **Must NOT do**:
  - 不修改数据库

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档编写

  **Parallelization**:
  - **Can Run In Parallel**: YES

  **References**:
  - `functions/lib/db.ts` - 数据库操作

  **Acceptance Criteria**:
  - [ ] 文档完整记录所有表
  - [ ] 字段说明清晰

---

## Final Verification Wave

- [x] F1. Admin布局验证 - CSS已修改
- [x] F2. R2数据验证 - 数据库已更新
- [x] F3. 前台橱窗验证 - 自动轮播代码已添加
- [x] F4. 数据完整性验证 - 30条记录已更新

---

## Commit Strategy

- `fix: admin layout - center content and add 3-column grid`
- `fix: r2 migration - copy placeholder images model-3~32`
- `fix: update showcases image_url to r2 urls`
- `fix: remove bulk import ui from timeline admin`
- `feat: add carousel to showcase public page`
- `docs: add database schema documentation`

---

## Success Criteria

### 验证命令
- 访问 `https://lovely.yuanbimu.top/admin` - 内容居中
- 访问 `https://lovely.yuanbimu.top/showcase` - 轮播图显示
- 查询D1数据库 - showcase数据完整

### 最终检查
- [ ] Admin所有页面布局正常
- [ ] R2 model-3~32有占位图
- [ ] 数据库image_url已更新
- [ ] 橱窗轮播图功能正常
- [ ] 前台数据无丢失
