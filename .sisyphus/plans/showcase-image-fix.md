# 修复 Admin 橱窗图片选择器 + R2 迁移 + 橱窗页展示

## TL;DR

> **Quick Summary**: 修复 admin 图片选择器无法显示 R2 子目录文件的问题，同时修复 API 支持递归查询、迁移 R2 现有文件到 model-N 目录、修复橱窗页随机展示、新建橱窗时自动创建 R2 目录。
> 
> **Deliverables**:
> - API `/api/r2-files` 支持 `recursive` 参数
> - Admin 图片选择器正确显示目录内文件
> - R2 文件从 `showcase/` 根目录迁移到 `showcase/model-N/` 子目录
> - 橱窗页正确展示并轮播图片
> - 新建橱窗时自动在 R2 创建对应目录
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (API) → Task 3 (Admin) + Task 4 (ShowcaseList) → Task 6 (Migration) → Task 7 (Auto-folder)

---

## Context

### Original Request
用户反馈 admin 界面"选择图片"逻辑有问题。期望：能识别 R2 目录结构，展示目录下图片，橱窗页随机展示。同时需要将现有 R2 文件从 showcase/ 根目录迁移到 model-N 子目录。

### Interview Summary
**Key Discussions**:
- 问题根因：R2 API 使用 `delimiter: '/'` 导致只返回根目录文件，子目录文件不返回
- `data/` 是默认目录不应使用，应该用 `showcase/model-N/` 结构
- R2 迁移要直接用 wrangler/API 操作，不在项目里创建脚本
- 橱窗页随机展示是否正常工作不确定

**Research Findings**:
- R2 `list()` + `delimiter: '/'` 只返回 delimitedPrefixes（目录名）+ 根目录 objects
- R2 `list()` 不带 delimiter 返回所有对象（递归）
- 当前 AdminDashboard 的 `currentFolderFiles` 过滤永远为空
- 点击目录只设置状态，不重新获取文件
- POST /api/showcases 已自动生成 model-N 的 id/folder，但 R2 目录未物理创建

### Metis Review
**Identified Gaps** (addressed):
- 需要确认当前 R2 实际文件分布 → Task 2 专门探查
- 迁移时无匹配橱窗的孤立文件处理 → 保留在原位，手动处理
- 新建橱窗后 R2 空目录问题 → 通过创建 placeholder 文件解决
- ShowcaseList 轮播可能失效 → 加入验证和修复任务

---

## Work Objectives

### Core Objective
让 Admin 图片选择器能正确浏览 R2 目录并显示图片，橱窗页能随机展示目录内图片，现有文件迁移到正确目录结构。

### Concrete Deliverables
- `functions/api/[[route]].ts` 的 `/api/r2-files` 端点支持 `recursive` 参数
- `AdminDashboard.tsx` 图片选择器点击目录时获取该目录文件
- `ShowcaseList.tsx` 正确获取所有橱窗图片并轮播
- R2 文件从 `showcase/xxx.jpg` 迁移到 `showcase/model-N/xxx.jpg`
- 新建橱窗 POST 请求自动在 R2 创建目录（placeholder）

### Definition of Done
- [x] Admin 图片选择器选择目录后能看到图片
- [x] 橱窗页 /showcase 正确显示图片并自动轮播
- [x] `npm run build` 无错误
- [x] R2 中 showcase/ 根目录无残留图片文件

### Must Have
- 图片选择器按目录正确展示文件
- API 支持 recursive 获取所有文件
- 橱窗页图片展示和轮播正常
- R2 迁移完成（showcase/ 根目录文件移入 model-N/）

### Must NOT Have (Guardrails)
- 不修改认证/授权逻辑
- 不修改 showcases 表 schema
- 不在项目里创建迁移脚本文件
- 不添加图片压缩/裁剪功能
- 不添加拖拽排序功能
- 不改变 CDN 域名
- 不添加批量上传功能
- 不添加新的图片格式支持

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: none
- **Primary verification**: Agent-Executed QA Scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) - Navigate, interact, assert DOM, screenshot
- **API**: Use Bash (curl) - Send requests, assert status + response fields
- **R2 Operations**: Use Bash (wrangler) - List, copy, delete objects

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - API fix + R2 exploration):
├── Task 1: 修复 /api/r2-files 添加 recursive 参数 [quick]
└── Task 2: 探查 R2 当前文件分布 [quick]

Wave 2 (After Wave 1 - frontend fixes):
├── Task 3: 修复 AdminDashboard 图片选择器 (depends: 1) [unspecified-high]
├── Task 4: 修复 ShowcaseList 图片获取和轮播 (depends: 1) [unspecified-high]
└── Task 5: 新建橱窗时自动创建 R2 目录 (depends: 1) [quick]

Wave 3 (After Wave 2 - migration + integration):
├── Task 6: 迁移 R2 文件到 model-N 目录 (depends: 2, 5) [deep]
└── Task 7: 端到端集成验证 + 清理 (depends: 3, 4, 6) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 3 → Task 7 → F1-F4 → user okay
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 3 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | - | 3, 4, 5 |
| 2 | - | 6 |
| 3 | 1 | 7 |
| 4 | 1 | 7 |
| 5 | 1 | 6 |
| 6 | 2, 5 | 7 |
| 7 | 3, 4, 6 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks - T1 → `quick`, T2 → `quick`
- **Wave 2**: 3 tasks - T3 → `unspecified-high`, T4 → `unspecified-high`, T5 → `quick`
- **Wave 3**: 2 tasks - T6 → `deep`, T7 → `unspecified-high`
- **FINAL**: 4 tasks - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. 修复 /api/r2-files 端点添加 recursive 参数

  **What to do**:
  - 修改 `functions/api/[[route]].ts` 的 `/api/r2-files` GET 路由
  - 添加 `recursive` 查询参数支持
  - 当 `recursive=true` 时，不使用 `delimiter`，返回所有层级的文件
  - 当 `recursive=false` 或未传（默认），保持当前行为（delimiter='/'）
  - 递归模式下，文件需要按目录分组返回（或保持扁平列表让前端分组）
  - 确保两种模式返回的数据结构兼容

  **Must NOT do**:
  - 不修改其他端点
  - 不修改认证/授权逻辑
  - 不改变现有默认行为（不加 recursive 时行为不变）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件小改动，逻辑清晰
  - **Skills**: [`wrangler`]
    - `wrangler`: 可能需要了解 R2 API 行为
  - **Skills Evaluated but Omitted**:
    - `workers-best-practices`: 不是 Workers 核心逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `functions/api/[[route]].ts:327-351` - 当前 R2 文件列表 API 实现，使用 `delimiter: '/'` 导致只返回根目录文件

  **API/Type References**:
  - Cloudflare R2 `list()` API: `delimiter` 参数控制是否按目录分隔，不传则递归返回所有对象

  **WHY Each Reference Matters**:
  - 需要理解当前 delimiter 行为，才能正确添加 recursive 开关
  - 递归模式下 objects 包含所有路径的文件，需要保持 url 构造逻辑一致

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 默认行为不变（无 recursive 参数）
    Tool: Bash (curl)
    Preconditions: 本地开发服务器运行中 (npm run dev:cf)
    Steps:
      1. curl -s http://localhost:4321/api/r2-files -H "Cookie: session=VALID_SESSION" | jq '.data.folders'
      2. 确认返回目录列表（delimitedPrefixes 解析结果）
      3. curl -s http://localhost:4321/api/r2-files -H "Cookie: session=VALID_SESSION" | jq '.data.files | length'
      4. 确认只返回根目录文件
    Expected Result: folders 包含目录名列表，files 只含根目录级文件
    Failure Indicators: 返回格式与修改前不同，或报错
    Evidence: .sisyphus/evidence/task-1-default-behavior.txt

  Scenario: recursive=true 返回所有文件
    Tool: Bash (curl)
    Preconditions: 本地开发服务器运行中
    Steps:
      1. curl -s "http://localhost:4321/api/r2-files?recursive=true" -H "Cookie: session=VALID_SESSION" | jq '.data.files | length'
      2. 确认返回数量 >= 默认模式
      3. 确认文件 key 包含子目录路径（如 showcase/model-1/xxx.jpg）
    Expected Result: 返回所有层级的文件，包括子目录内的文件
    Failure Indicators: 文件数量未增加，或子目录文件未出现
    Evidence: .sisyphus/evidence/task-1-recursive.txt

  Scenario: prefix + recursive 组合查询
    Tool: Bash (curl)
    Preconditions: 本地开发服务器运行中
    Steps:
      1. curl -s "http://localhost:4321/api/r2-files?prefix=showcase/&recursive=true" -H "Cookie: session=VALID_SESSION" | jq '.data.files'
      2. 确认返回 showcase/ 目录下所有文件（含子目录）
    Expected Result: 只返回 showcase/ 前缀的所有文件
    Failure Indicators: 返回了非 showcase/ 前缀的文件，或缺少子目录文件
    Evidence: .sisyphus/evidence/task-1-prefix-recursive.txt
  ```

  **Commit**: YES (groups with Tasks 3, 4, 5)
  - Message: `fix(showcase): 修复图片选择器和橱窗展示，支持 R2 目录递归`
  - Files: `functions/api/[[route]].ts`, `src/components/AdminDashboard.tsx`, `src/components/ShowcaseList.tsx`
  - Pre-commit: `npm run build`

- [x] 2. 探查 R2 当前文件分布

  **What to do**:
  - 使用 wrangler 命令列出 R2 存储桶中的所有对象
  - 确认当前文件分布：
    - `showcase/` 根目录下有哪些文件
    - `showcase/model-N/` 子目录下是否有文件
    - 是否有其他目录（如 `data/`）下的文件
  - 输出文件清单和目录结构映射
  - 确认每个文件应该迁移到哪个 model-N 目录

  **Must NOT do**:
  - 不修改任何文件
  - 不删除任何 R2 对象

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯探查任务，执行命令并记录结果
  - **Skills**: [`wrangler`]
    - `wrangler`: 必须使用 wrangler r2 object list 命令

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 6 (迁移)
  - **Blocked By**: None

  **References**:

  **External References**:
  - wrangler R2 命令: `npx wrangler r2 object list lovelymain` 列出存储桶对象
  - wrangler.toml 中 R2 bucket_name 为实际桶名，需确认

  **WHY Each Reference Matters**:
  - 需要知道正确的 R2 桶名才能执行 wrangler 命令
  - 文件清单是迁移任务（Task 6）的输入

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 成功列出 R2 对象
    Tool: Bash (wrangler)
    Preconditions: wrangler 已认证
    Steps:
      1. 读取 wrangler.toml 确认 R2 bucket_name
      2. 执行 npx wrangler r2 object list <bucket_name> --prefix "showcase/"
      3. 记录返回的所有对象 key
      4. 如有分页，继续获取直到完整
    Expected Result: 获得完整的 showcase/ 下文件列表
    Failure Indicators: 命令报错或返回空
    Evidence: .sisyphus/evidence/task-2-r2-file-list.txt

  Scenario: 确认目录结构
    Tool: Bash (wrangler)
    Preconditions: 上一步成功
    Steps:
      1. 分析文件 key 的路径结构
      2. 区分根目录文件 vs 子目录文件
      3. 生成迁移映射表：源路径 → 目标路径
    Expected Result: 生成清晰的迁移映射
    Failure Indicators: R2 为空或无法访问
    Evidence: .sisyphus/evidence/task-2-migration-map.txt
  ```

  **Commit**: NO (纯探查，无代码变更)

- [x] 3. 修复 AdminDashboard 图片选择器按目录获取文件

  **What to do**:
  - 修改 `src/components/AdminDashboard.tsx` 的图片选择器逻辑
  - **关键修复 1**: 点击目录按钮时，调用 `/api/r2-files?prefix=目录名/` 获取该目录下文件
  - **关键修复 2**: 简化 `currentFolderFiles` 逻辑 — 使用 prefix 获取时，文件已在目标目录，直接显示即可
  - **关键修复 3**: 打开图片选择器时，如果有目标目录（如 editingShowcase.folder），自动获取该目录文件
  - **关键修复 4**: 上传图片后，用当前目录的 prefix 刷新文件列表
  - 删除 `data/` 作为默认目录的逻辑，改为使用 showcase 的 folder 字段
  - 目录选择下拉框改为使用 `showcase/model-N` 格式的路径
  - 保持封面图（cover）选择器不受影响

  **Must NOT do**:
  - 不修改歌单封面选择逻辑（imagePickerType === 'cover' 保持原样）
  - 不添加图片压缩/裁剪
  - 不添加拖拽排序
  - 不改变认证逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: AdminDashboard.tsx 已有 1282 行，需要理解现有逻辑并精准修改，涉及多个状态变量的协调
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 图片选择器 UI 交互优化
  - **Skills Evaluated but Omitted**:
    - `workers-best-practices`: 不涉及 Workers 逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (API 必须先支持 prefix 查询)

  **References**:

  **Pattern References**:
  - `src/components/AdminDashboard.tsx:77-90` - 当前 r2Files、r2Folders、currentFolderFiles 状态定义和过滤逻辑
  - `src/components/AdminDashboard.tsx:419-469` - openImagePicker 函数，获取 R2 文件列表
  - `src/components/AdminDashboard.tsx:1243-1279` - 图片选择器 Modal UI，包含目录按钮和文件网格

  **API/Type References**:
  - `src/components/AdminDashboard.tsx:31-39` - Showcase 接口定义（folder 字段）

  **WHY Each Reference Matters**:
  - 第 87-90 行的 `currentFolderFiles` 是核心 bug，必须重写
  - openImagePicker 需要改为带 prefix 参数获取
  - 目录按钮的 onClick 需要添加获取文件逻辑
  - 理解 Showcase 的 folder 字段用于确定图片所在目录

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 点击目录显示该目录图片
    Tool: Playwright (playwright skill)
    Preconditions: 本地开发服务器运行，已登录 admin，R2 中 showcase/model-1/ 下有图片
    Steps:
      1. 导航到 /admin，点击"橱窗管理"
      2. 点击任一橱窗的"编辑"按钮
      3. 点击"選擇圖片"按钮
      4. 在弹出的 Modal 中，点击 model-1 目录按钮
      5. 等待图片加载
      6. 截图确认图片网格显示
    Expected Result: 目录按钮高亮，下方显示 model-1 目录下的图片缩略图
    Failure Indicators: 图片区域显示"暫無圖片文件，請上傳"
    Evidence: .sisyphus/evidence/task-3-folder-images.png

  Scenario: 选择图片后正确设置 image_url
    Tool: Playwright (playwright skill)
    Preconditions: 同上
    Steps:
      1. 在图片选择器中点击 model-1 目录
      2. 点击一张图片
      3. 确认 Modal 关闭
      4. 确认橱窗编辑表单中的图片预览更新
    Expected Result: 图片预览显示所选图片，image_url 包含 model-1/ 路径
    Failure Indicators: image_url 未更新或图片预览为空
    Evidence: .sisyphus/evidence/task-3-select-image.png

  Scenario: 上传图片到当前目录后刷新文件列表
    Tool: Playwright (playwright skill)
    Preconditions: 同上
    Steps:
      1. 打开图片选择器，选择 model-1 目录
      2. 上传一张新图片
      3. 确认上传成功提示
      4. 确认文件列表刷新，新图片出现在网格中
    Expected Result: 上传后文件列表自动更新，新图片可见
    Failure Indicators: 上传成功但文件列表未刷新
    Evidence: .sisyphus/evidence/task-3-upload-refresh.png
  ```

  **Commit**: YES (groups with Tasks 1, 4, 5)
  - Message: `fix(showcase): 修复图片选择器和橱窗展示，支持 R2 目录递归`
  - Files: `src/components/AdminDashboard.tsx`
  - Pre-commit: `npm run build`

- [x] 4. 修复 ShowcaseList 图片获取和轮播

  **What to do**:
  - 修改 `src/components/ShowcaseList.tsx` 的图片获取逻辑
  - **修复 1**: 使用 `/api/r2-files?recursive=true` 或 `/api/r2-files?prefix=showcase/` 获取所有图片
  - **修复 2**: 按目录分组逻辑保持不变（file.key.split('/')[0] 或更精确的路径解析）
  - **修复 3**: 验证轮播逻辑（3 秒自动切换、悬停暂停）是否正常工作
  - **修复 4**: 修改为按每个橱窗的 folder 字段精确匹配图片目录
  - 确保图片路径使用 CDN 域名 `https://cdn.yuanbimu.top/`
  - 添加适当的错误处理和空态处理

  **Must NOT do**:
  - 不修改轮播间隔（保持 3 秒）
  - 不修改 UI 样式
  - 不添加搜索/筛选功能

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解现有的图片分组逻辑和轮播机制，精准修改 API 调用
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 前端组件交互逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 3, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (API 必须先支持 recursive)

  **References**:

  **Pattern References**:
  - `src/components/ShowcaseList.tsx:54-95` - 当前 fetchShowcases 函数，从 /api/showcases 和 /api/r2-files 获取数据
  - `src/components/ShowcaseList.tsx:70-79` - 按 key.split('/')[0] 分组图片的逻辑
  - `src/components/ShowcaseList.tsx:97-111` - getCurrentImage 和 getTotalImages 函数

  **API/Type References**:
  - `src/components/ShowcaseList.tsx:3-10` - Showcase 接口定义
  - `/api/r2-files?recursive=true` - 新的 API 调用方式

  **WHY Each Reference Matters**:
  - 第 67 行的 API 调用是核心 bug 点，需要改为 recursive 或带 prefix
  - 分组逻辑需要适配新的路径结构（showcase/model-N/xxx.jpg → folder 应为 model-N）
  - 轮播逻辑依赖 folderImages 数据正确填充

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 橱窗页正确展示图片
    Tool: Playwright (playwright skill)
    Preconditions: 本地开发服务器运行，D1 有橱窗数据，R2 有对应图片
    Steps:
      1. 导航到 /showcase
      2. 等待页面加载完成
      3. 确认橱窗卡片显示图片（非占位符）
      4. 截图确认
    Expected Result: 每个橱窗卡片显示对应的图片，无 🖼️ 占位符
    Failure Indicators: 显示占位符或图片加载失败
    Evidence: .sisyphus/evidence/task-4-showcase-display.png

  Scenario: 图片自动轮播正常
    Tool: Playwright (playwright skill)
    Preconditions: 同上，某个橱窗有多张图片
    Steps:
      1. 导航到 /showcase
      2. 等待 4 秒以上（超过轮播间隔 3 秒）
      3. 确认图片已切换（对比初始截图）
      4. 确认轮播导航点（image-dot）更新
    Expected Result: 图片自动切换到下一张，导航点位置更新
    Failure Indicators: 图片未切换，导航点不变
    Evidence: .sisyphus/evidence/task-4-rotation.png

  Scenario: 悬停暂停轮播
    Tool: Playwright (playwright skill)
    Preconditions: 同上
    Steps:
      1. 导航到 /showcase
      2. 鼠标悬停在某个橱窗卡片上
      3. 等待 5 秒
      4. 确认图片未切换
      5. 移开鼠标，再等待 4 秒
      6. 确认图片切换恢复
    Expected Result: 悬停时图片不变，移开后恢复轮播
    Failure Indicators: 悬停时图片仍然切换
    Evidence: .sisyphus/evidence/task-4-hover-pause.png

  Scenario: 空橱窗无报错
    Tool: Playwright (playwright skill)
    Preconditions: 存在没有图片的橱窗
    Steps:
      1. 导航到 /showcase
      2. 确认无 JS 控制台错误
      3. 确认空橱窗显示占位符
    Expected Result: 页面正常渲染，无报错
    Failure Indicators: 控制台报错或页面白屏
    Evidence: .sisyphus/evidence/task-4-empty-showcase.png
  ```

  **Commit**: YES (groups with Tasks 1, 3, 5)
  - Message: `fix(showcase): 修复图片选择器和橱窗展示，支持 R2 目录递归`
  - Files: `src/components/ShowcaseList.tsx`
  - Pre-commit: `npm run build`

- [x] 5. 新建橱窗时自动创建 R2 目录

  **What to do**:
  - 修改 `functions/api/[[route]].ts` 的 POST /api/showcases 路由
  - 在保存橱窗后，自动在 R2 创建一个 placeholder 文件以物理创建目录
  - placeholder 文件：在 `showcase/model-N/.folder` 路径下创建一个空文件或 JSON 文件
  - 文件内容可以是 `{"folder": "model-N", "created_at": timestamp}`
  - 确保图片选择器能识别这个目录（即使只有 placeholder）
  - 图片选择器应过滤掉 `.folder` 这类隐藏文件

  **Must NOT do**:
  - 不修改 showcases 表结构
  - 不删除现有橱窗数据
  - placeholder 文件不应出现在图片选择器的图片网格中

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件小改动，逻辑清晰
  - **Skills**: [`wrangler`, `workers-best-practices`]
    - `wrangler`: 了解 R2 put 操作
    - `workers-best-practices`: Workers 中操作 R2 的最佳实践

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 3, 4)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 6 (迁移需要新目录存在)
  - **Blocked By**: Task 1 (API 改动在同一文件)

  **References**:

  **Pattern References**:
  - `functions/api/[[route]].ts:283-319` - POST /api/showcases 路由，包含 model-N 自动生成逻辑
  - `functions/api/[[route]].ts:386-394` - R2 put 操作示例（上传 API）

  **WHY Each Reference Matters**:
  - 需要在 model-N 自动生成后，立即在 R2 创建 placeholder
  - 参考上传 API 的 put 操作方式

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 新建橱窗后 R2 目录存在
    Tool: Bash (curl + wrangler)
    Preconditions: 本地开发服务器运行，已登录 admin
    Steps:
      1. curl -X POST http://localhost:4321/api/showcases -H "Cookie: session=VALID_SESSION" -H "Content-Type: application/json" -d '{"name":"测试橱窗","sort_order":99}'
      2. 从响应获取 folder 字段（应为 model-N 格式）
      3. npx wrangler r2 object list <bucket_name> --prefix "showcase/model-N/"
      4. 确认 .folder placeholder 文件存在
    Expected Result: R2 中 showcase/model-N/ 目录下有 .folder 文件
    Failure Indicators: 目录为空或不存在
    Evidence: .sisyphus/evidence/task-5-r2-folder-created.txt

  Scenario: 图片选择器过滤隐藏文件
    Tool: Playwright (playwright skill)
    Preconditions: 上面创建的橱窗存在
    Steps:
      1. 在 admin 中编辑该橱窗
      2. 打开图片选择器，选择 model-N 目录
      3. 确认图片网格中不显示 .folder 文件
    Expected Result: 图片网格为空（无图片），不显示 .folder 占位文件
    Failure Indicators: .folder 文件出现在图片网格中
    Evidence: .sisyphus/evidence/task-5-filter-placeholder.png
  ```

  **Commit**: YES (groups with Tasks 1, 3, 4)
  - Message: `fix(showcase): 修复图片选择器和橱窗展示，支持 R2 目录递归`
  - Files: `functions/api/[[route]].ts`
  - Pre-commit: `npm run build`

- [x] 6. 迁移 R2 文件到 model-N 目录

  **What to do**:
  - 基于 Task 2 的探查结果，执行 R2 文件迁移
  - 对 showcase/ 根目录下的每个文件：
    1. 读取文件
    2. 确定目标目录（根据 D1 中橱窗的 folder 字段或文件名匹配）
    3. 复制文件到新路径 `showcase/model-N/filename`
    4. 确认复制成功后删除原文件
  - **不在项目中创建脚本**，直接使用 wrangler CLI 命令或一次性 API 调用
  - 迁移策略：
    - 方案 A: 在 API 中添加临时迁移端点（POST /api/r2-migrate），执行后删除
    - 方案 B: 使用 wrangler r2 object get/put 命令手动操作
    - 推荐方案 A（更可靠，可处理批量操作）
  - 迁移完成后验证：
    - showcase/ 根目录无图片文件
    - 每个 model-N/ 目录下有正确文件
    - CDN 链接仍可访问

  **Must NOT do**:
  - 不在项目中保留迁移代码/脚本
  - 不修改 D1 数据库中的橱窗记录（folder 字段已经是正确的）
  - 不删除非 showcase/ 目录下的文件
  - 不修改 showcase/model-N/ 子目录下已有的文件

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要理解 R2 文件分布，制定迁移策略，执行迁移并验证，风险较高
  - **Skills**: [`wrangler`, `cloudflare`]
    - `wrangler`: 必须用 wrangler 操作 R2
    - `cloudflare`: 了解 R2 存储行为

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 2 (探查结果), 5 (新目录需存在)

  **References**:

  **Pattern References**:
  - `functions/api/[[route]].ts:372-405` - R2 上传 API，展示 put 操作
  - `functions/api/[[route]].ts:354-369` - R2 删除 API，展示 delete 操作

  **WHY Each Reference Matters**:
  - 参考现有 R2 操作方式实现迁移逻辑
  - 迁移需要 get + put + delete 三个操作的组合

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 迁移完成后 showcase/ 根目录无图片
    Tool: Bash (wrangler)
    Preconditions: 迁移已执行
    Steps:
      1. npx wrangler r2 object list <bucket_name> --prefix "showcase/"
      2. 检查返回的对象中是否还有直接在 showcase/ 下的图片文件
    Expected Result: showcase/ 根目录下无 jpg/png/gif/webp 文件，只有子目录
    Failure Indicators: 仍有 showcase/xxx.jpg 类文件
    Evidence: .sisyphus/evidence/task-6-root-clean.txt

  Scenario: 迁移后图片仍可通过 CDN 访问
    Tool: Bash (curl)
    Preconditions: 迁移已完成
    Steps:
      1. 从 D1 获取橱窗的 image_url 字段
      2. curl -I 该 URL
      3. 确认返回 200
    Expected Result: CDN 图片 URL 返回 200 OK
    Failure Indicators: 返回 404 或其他错误
    Evidence: .sisyphus/evidence/task-6-cdn-access.txt

  Scenario: 迁移后橱窗页正常展示
    Tool: Playwright (playwright skill)
    Preconditions: 迁移已完成，开发服务器运行
    Steps:
      1. 导航到 /showcase
      2. 确认图片正常显示
    Expected Result: 所有橱窗图片正常显示
    Failure Indicators: 图片 404 或显示占位符
    Evidence: .sisyphus/evidence/task-6-post-migration.png
  ```

  **Commit**: NO (迁移操作不产生代码变更，临时迁移端点执行后删除)

- [x] 7. 端到端集成验证 + 清理

  **What to do**:
  - 完整测试整个流程：
    1. 在 Admin 新建橱窗 → 确认 R2 目录自动创建
    2. 上传图片到橱窗目录 → 确认图片可见
    3. 在图片选择器中选择图片 → 确认 image_url 正确设置
    4. 保存橱窗 → 确认 D1 数据正确
    5. 访问橱窗页 → 确认图片显示和轮播正常
  - 清理工作：
    - 删除临时迁移端点（如果创建了）
    - 确认项目无遗留调试代码
  - 运行 `npm run build` 确认无错误
  - 如果有临时修改（如迁移端点），从代码中移除

  **Must NOT do**:
  - 不添加新功能
  - 不修改现有正常工作的逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要全面测试多个组件的交互，可能需要修复集成问题
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: 需要浏览器自动化验证
    - `frontend-ui-ux`: 可能需要调整 UI 细节

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 3, 4, 6

  **References**:

  **Pattern References**:
  - 所有前面任务的修改文件

  **WHY Each Reference Matters**:
  - 集成验证需要理解所有修改点的交互

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 完整新建橱窗流程
    Tool: Playwright (playwright skill)
    Preconditions: 本地开发服务器运行，已登录 admin
    Steps:
      1. 导航到 /admin → 橱窗管理
      2. 点击"+ 新增"按钮
      3. 填写橱窗名称"集成测试橱窗"
      4. 设置展示序号为 99
      5. 点击保存
      6. 确认保存成功，橱窗列表出现新条目
      7. 点击编辑该橱窗
      8. 点击"選擇圖片"按钮
      9. 确认图片选择器显示了目录（包含新建的 model-N 目录）
      10. 选择目录，上传一张测试图片
      11. 选择刚上传的图片
      12. 保存橱窗
      13. 导航到 /showcase
      14. 确认新橱窗显示在页面中，图片正确
    Expected Result: 完整流程无报错，橱窗页显示新橱窗和图片
    Failure Indicators: 任何步骤报错或显示异常
    Evidence: .sisyphus/evidence/task-7-e2e-flow.png

  Scenario: npm run build 无错误
    Tool: Bash
    Preconditions: 所有代码修改完成
    Steps:
      1. npm run build
      2. 确认构建成功，无 TypeScript 错误
    Expected Result: Build 成功，无错误
    Failure Indicators: TypeScript 报错或构建失败
    Evidence: .sisyphus/evidence/task-7-build.txt
  ```

  **Commit**: YES (如果需要清理代码)
  - Message: `chore: 清理集成验证临时代码`
  - Files: 如有清理
  - Pre-commit: `npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Task 1**: `fix(api): r2-files 端点添加 recursive 参数` - functions/api/[[route]].ts
- **Task 3**: `fix(admin): 图片选择器按目录获取文件` - src/components/AdminDashboard.tsx
- **Task 4**: `fix(showcase): 橱窗页正确获取目录图片并轮播` - src/components/ShowcaseList.tsx
- **Task 5**: `feat(api): 新建橱窗自动创建 R2 目录` - functions/api/[[route]].ts
- **Tasks 1+3+4+5**: 可合并为一个 commit: `fix(showcase): 修复图片选择器和橱窗展示，支持 R2 目录递归`

---

## Success Criteria

### Verification Commands
```bash
npm run build                    # Expected: 成功，无 TypeScript 错误
curl /api/r2-files?recursive=true  # Expected: 返回所有文件（含子目录）
curl /api/r2-files?prefix=showcase/model-1/  # Expected: 返回 model-1 目录下文件
```

### Final Checklist
- [x] Admin 图片选择器选择目录后显示图片
- [x] 橱窗页 /showcase 正确显示图片
- [x] 橱窗页图片自动轮播正常
- [x] R2 showcase/ 根目录无残留图片
- [x] 新建橱窗后 R2 目录存在
- [x] npm run build 无错误
