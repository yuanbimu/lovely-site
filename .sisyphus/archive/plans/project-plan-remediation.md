# 项目计划体系整改计划

## TL;DR

> **快速总结**：对当前项目内“计划文档、草稿文档、证据/快照文档”的混用问题进行一次性整改，建立清晰分类、统一结构、严格验收与风险控制要求，优先修复现有两份正式计划，并把根目录伪计划重新归类为证据。
>
> **交付成果**：
> - 计划文档分类与命名规范
> - 正式计划整改后的统一结构要求
> - 根目录伪计划文档的归类/迁移方案
> - `showcase-picker.md` 与 `admin-improvements.md` 的逐项修复清单
> - 计划审查与验收基线
>
> **预计工作量**：Medium
> **并行执行**：YES - 4 个主波次
> **关键路径**：审计分类规则 → 文档归类方案 → 正式计划修复 → 最终审查

---

## Context

### 原始请求
检查一下全项目的计划并且挑错；随后要求把这次挑错整理成一份正式整改计划。

### Interview Summary
**关键讨论**：
- 审查范围确认为“全部都查”，不仅看 `.sisyphus/plans/*.md`，也看项目根目录中看起来像方案的 Markdown。
- 本次目标不是改源码，而是整改“计划体系本身”。
- 用户已确认需要把审查结果提升为正式工作计划。

**已识别现状**：
- 正式计划：`.sisyphus/plans/showcase-picker.md`、`.sisyphus/plans/admin-improvements.md`
- 草稿：`.sisyphus/drafts/project-plan-review.md`
- 根目录伪计划/快照：
  - `timeline-page.md`
  - `showcase-page.md`
  - `r2-files-api.md`
  - `admin-after-login.md`
  - `admin-dashboard.md`
  - `admin-login.md`

### Research Findings
- 根目录 6 个文档绝大多数不是执行计划，而是 DOM 抓取、接口返回或页面状态快照。
- `showcase-picker.md` 存在“TODO 已完成但验收未完成”的状态冲突，以及 QA 场景不够可执行的问题。
- `admin-improvements.md` 存在测试基础设施判断错误、任务粒度过粗、R2/数据库高风险改动无回滚、最终验证空泛、提交语言不符合项目规范等问题。
- 项目 `AGENTS.md` 强制要求简体中文，并明确“当前状态：无自动化测试”。

### Metis Review
**Metis 识别并补入的缺口**：
- 需要先锁定“整改范围”，避免顺手扩展到 CI、自动化校验器、模板系统重构。
- 需要给“正式计划 / 草稿 / 证据快照”建立明确分类标准。
- 需要为所有涉及 R2 / 数据库 / 外部环境的计划补充回滚与失败恢复要求。
- 需要给整改后的计划体系补充“完成定义”，不能只说“看起来更规范”。

---

## Work Objectives

### Core Objective
建立一套清晰、可执行、可审查的项目计划体系，使计划、草稿、证据三类 Markdown 文档职责分离，并修复当前正式计划中的结构性缺陷。

### Concrete Deliverables
- [x] 计划文档分类矩阵（正式计划 / 草稿 / 证据快照 / 其他）
- [x] 根目录伪计划文档的归类与命名整改方案
- [x] `showcase-picker.md` 修复清单
- [x] `admin-improvements.md` 修复清单
- [x] 正式计划统一检查清单（结构、依赖、验收、QA、回滚、提交语言）
- [x] 最终计划体系审查结论

### Definition of Done
- [x] 能明确区分哪些 Markdown 是正式计划，哪些只是证据快照
- [x] 现有两份正式计划的结构性问题都有对应整改任务
- [x] 根目录 6 个伪计划都被明确分类并给出处理动作
- [x] 正式计划的最低质量门槛被写成可复用检查清单
- [x] 所有整改任务都具备 agent-executed QA 场景

### Must Have
- 仅处理计划体系与文档质量问题，不扩展为源码功能开发
- 保留单一整改计划文件，不拆成多个计划
- 明确限制范围：不在本计划中实现 CI 自动化、脚本校验器、站点功能重构
- 所有涉及外部环境/高风险变更的计划必须引入回滚要求

### Must NOT Have (Guardrails)
- 不顺手重构整个 `.sisyphus/` 体系
- 不把“证据快照”伪装成“正式计划”
- 不接受模糊验收语句，如“功能正常”“验证通过”
- 不接受英文提交信息模板，必须遵循项目简体中文提交规范
- 不把 `wrangler`、Cloudflare 等运行/部署能力误判为测试基础设施

---

## Verification Strategy

> **零人工主观验收**：所有完成条件都必须能由执行代理通过读取文档、搜索内容、检查路径、核对结构来验证。

### Test Decision
- **Infrastructure exists**：部分存在（构建/运行环境存在）
- **Automated tests**：None（项目当前无自动化测试体系）
- **Framework**：none
- **Agent-Executed QA**：YES（文档审查、路径核对、结构核对、关键字段断言）

### QA Policy
- 文档整改任务统一通过 `Read` / `Glob` / `Grep` 验证结构、路径、标题、检查项、关键术语是否存在。
- 任何“正式计划”整改后必须满足：目标、范围、依赖、验收、QA 场景、风险/回滚、提交策略七大项齐备。
- 任何“证据快照”整改后必须不再冒充计划：命名、目录、用途说明至少满足两项。
- 所有证据输出统一落到 `.sisyphus/evidence/` 或计划内明确约定的证据路径；不能继续散落为含糊命名的根目录“计划”。

---

## Execution Strategy

### Parallel Execution Waves

```text
Wave 1（立即开始：分类基线）
├── Task 1: 建立计划/草稿/证据分类标准 [writing]
├── Task 2: 盘点并标记根目录伪计划文档 [quick]
├── Task 3: 建立正式计划质量门槛清单 [writing]
└── Task 4: 建立高风险计划的回滚要求模板 [writing]

Wave 2（基于 Wave 1：逐文档整改设计）
├── Task 5: 修复 showcase-picker 计划结构 [writing]
├── Task 6: 修复 admin-improvements 计划结构 [writing]
├── Task 7: 设计根目录快照文档重命名/迁移方案 [quick]
└── Task 8: 设计计划状态语义规则（计划/执行/验收）[writing]

Wave 3（基于 Wave 2：统一规范固化）
├── Task 9: 统一 QA 场景写法与证据规范 [writing]
├── Task 10: 统一提交策略与简体中文约束 [writing]
├── Task 11: 建立正式计划审查清单 [writing]
└── Task 12: 建立证据文档最小元信息规范 [writing]

Wave FINAL（全部完成后，并行复核）
├── F1: 计划合规复核
├── F2: 范围漂移复核
├── F3: 文档分类复核
└── F4: QA 可执行性复核
```

### Dependency Matrix
- **1**：- → 5, 6, 7, 8, 11
- **2**：- → 7, 12
- **3**：- → 5, 6, 9, 11
- **4**：- → 6, 11
- **5**：1, 3 → 9, 11
- **6**：1, 3, 4 → 9, 10, 11
- **7**：1, 2 → 12
- **8**：1 → 9, 11
- **9**：5, 6, 8 → F4
- **10**：6 → F1
- **11**：1, 3, 4, 5, 6, 8 → F1, F2
- **12**：2, 7 → F3

### Agent Dispatch Summary
- **Wave 1**：4 个任务，均以 `writing` / `quick` 为主
- **Wave 2**：4 个任务，文档整改与命名/状态设计并行
- **Wave 3**：4 个任务，统一规范与检查清单并行
- **FINAL**：4 个并行复核任务

---

## TODOs

- [x] 1. 建立计划 / 草稿 / 证据分类标准

  **What to do**:
  - 定义“正式计划、草稿、证据快照、其他 Markdown”四类文档的判定标准。
  - 为每类文档列出必备字段、允许位置、命名特征、典型反例。
  - 输出一个可复用的分类矩阵，作为后续所有整改任务的判断基线。

  **Must NOT do**:
  - 不把分类标准写成依赖特定页面/特定功能的临时规则。
  - 不把“看起来像计划”当作“正式计划”的充分条件。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要形成清晰的文档分类规范。
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: 本任务不涉及浏览器验证。

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 2, 3, 4 并行）
  - **Blocks**: 5, 6, 7, 8, 11
  - **Blocked By**: None

  **References**:
  - `.sisyphus/plans/showcase-picker.md` - 现有正式计划样本，用于识别“计划”应具备的结构。
  - `.sisyphus/plans/admin-improvements.md` - 另一个正式计划样本，用于识别范围、任务、验证、提交策略等字段。
  - `.sisyphus/drafts/project-plan-review.md` - 已形成的审查结论草稿，包含初步分类判断。

  **Acceptance Criteria**:
- [x] 分类矩阵覆盖 4 类文档
- [x] 每类至少给出 2 条判定特征
- [x] 能用该矩阵解释当前根目录 6 个文档为什么不是正式计划

  **QA Scenarios**:
  ```
  Scenario: 分类标准可用于区分正式计划与快照
    Tool: Read + Grep
    Preconditions: 分类矩阵已写入整改产物
    Steps:
      1. 读取分类标准文档
      2. 检查是否存在“正式计划 / 草稿 / 证据快照 / 其他”四类标题或等价字段
      3. 核对是否明确提到 `.sisyphus/plans/` 与根目录快照文档的区别
    Expected Result: 四类均有判定标准，且能覆盖当前项目样本
    Failure Indicators: 缺类、缺判定条件、无法解释根目录伪计划
    Evidence: .sisyphus/evidence/task-1-classification-matrix.md

  Scenario: 反例边界清晰
    Tool: Read
    Preconditions: 分类标准已完成
    Steps:
      1. 读取标准中每类的“反例”或“非本类”说明
      2. 确认没有把 DOM 抓取快照错误归入正式计划
    Expected Result: 至少有一处明确说明“快照≠计划”
    Failure Indicators: 边界模糊、没有反例、定义可互相重叠
    Evidence: .sisyphus/evidence/task-1-boundary-check.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-1-classification-matrix.md`
- [x] `.sisyphus/evidence/task-1-boundary-check.md`

  **Commit**: NO

- [x] 2. 盘点并标记根目录伪计划文档

  **What to do**:
  - 逐个盘点根目录中的 `timeline-page.md`、`showcase-page.md`、`r2-files-api.md`、`admin-after-login.md`、`admin-dashboard.md`、`admin-login.md`。
  - 为每个文档标注当前实际用途：DOM 快照、接口快照、页面状态记录或命名错误。
  - 输出一张“文件 → 实际类型 → 建议动作”的映射表。

  **Must NOT do**:
  - 不跳过任何一个现有样本。
  - 不仅仅给出“不是计划”的判断，必须附带建议动作。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 这是结构化盘点与标注工作。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 1, 3, 4 并行）
  - **Blocks**: 7, 12
  - **Blocked By**: None

  **References**:
  - `timeline-page.md` - 时间线页面 DOM 抓取样本。
  - `showcase-page.md` - 橱窗页面 DOM 抓取样本。
  - `r2-files-api.md` - API 返回快照样本。
  - `admin-after-login.md` / `admin-dashboard.md` / `admin-login.md` - 管理后台页面状态快照样本。

  **Acceptance Criteria**:
- [x] 6 个文档全部被盘点
- [x] 每个文档都有“实际类型”与“建议动作”
- [x] 至少识别出 `admin-dashboard.md` 的命名/内容不一致问题

  **QA Scenarios**:
  ```
  Scenario: 根目录伪计划盘点完整
    Tool: Read + Glob
    Preconditions: 盘点表已完成
    Steps:
      1. 读取盘点表
      2. 核对 6 个目标文件名是否全部出现
      3. 核对每个条目是否都包含“类型”和“建议动作”两列或等价信息
    Expected Result: 6 个文件全部覆盖，无遗漏
    Failure Indicators: 少于 6 个条目，或有条目无建议动作
    Evidence: .sisyphus/evidence/task-2-root-inventory.md

  Scenario: 命名冲突被识别
    Tool: Read
    Preconditions: 盘点表已完成
    Steps:
      1. 搜索 `admin-dashboard.md`
      2. 核对是否说明其内容更像登录页快照而非 dashboard
    Expected Result: 命名/内容不一致问题被明确指出
    Failure Indicators: 未发现或未记录该冲突
    Evidence: .sisyphus/evidence/task-2-naming-mismatch.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-2-root-inventory.md`
- [x] `.sisyphus/evidence/task-2-naming-mismatch.md`

  **Commit**: NO

- [x] 3. 建立正式计划质量门槛清单

  **What to do**:
  - 总结正式计划必须具备的最低结构：目标、范围、任务、依赖、验收、QA 场景、提交策略、风险/回滚。
  - 把“常见伪合格项”写成反例，例如“功能正常”“已修改”这类不可验证表述。
  - 明确计划、执行记录、验收记录三种状态不能混写。

  **Must NOT do**:
  - 不把可选项写成必选项，导致计划过度膨胀。
  - 不遗漏“风险/回滚”这一高风险任务强制项。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要抽象出通用质量门槛。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 1, 2, 4 并行）
  - **Blocks**: 5, 6, 9, 11
  - **Blocked By**: None

  **References**:
  - `.sisyphus/plans/showcase-picker.md` - 可用于识别已有结构与缺失项。
  - `.sisyphus/plans/admin-improvements.md` - 可用于识别高风险计划缺失的门槛项。
  - `AGENTS.md` - 提交语言、测试现状、质量约束来源。

  **Acceptance Criteria**:
- [x] 至少覆盖 8 类质量门槛
- [x] 明确列出 3 类以上常见反例
- [x] 明确区分计划、执行记录、验收记录

  **QA Scenarios**:
  ```
  Scenario: 质量门槛清单覆盖核心结构
    Tool: Read
    Preconditions: 质量门槛清单已完成
    Steps:
      1. 读取清单
      2. 核对是否包含目标、范围、任务、依赖、验收、QA、提交策略、风险/回滚
    Expected Result: 8 类核心结构全部出现
    Failure Indicators: 任一核心结构缺失
    Evidence: .sisyphus/evidence/task-3-quality-gates.md

  Scenario: 反例被明确定义
    Tool: Grep
    Preconditions: 质量门槛清单已完成
    Steps:
      1. 搜索“功能正常”“验证通过”“已修改”等模糊表述
      2. 检查是否被列为反例或禁止写法
    Expected Result: 至少 3 类模糊写法被禁止
    Failure Indicators: 仅有正向要求，没有反例清单
    Evidence: .sisyphus/evidence/task-3-anti-patterns.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-3-quality-gates.md`
- [x] `.sisyphus/evidence/task-3-anti-patterns.md`

  **Commit**: NO

- [x] 4. 建立高风险计划的回滚要求模板

  **What to do**:
  - 抽象出凡涉及数据库、R2、远端接口、线上环境的计划必须包含的回滚项。
  - 定义最小回滚模板：备份前提、dry-run、批量分段、失败停止条件、恢复步骤、验证步骤。
  - 将 `admin-improvements.md` 中的 R2/数据库变更作为反例说明。

  **Must NOT do**:
  - 不允许“先改了再看”式无回滚计划。
  - 不把“重新手动修”当作回滚策略。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要沉淀风险控制模板。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 1, 2, 3 并行）
  - **Blocks**: 6, 11
  - **Blocked By**: None

  **References**:
  - `.sisyphus/plans/admin-improvements.md` - 高风险计划的反例来源。
  - `r2-files-api.md` - 可反映 R2 相关变更会涉及真实外部资源。

  **Acceptance Criteria**:
- [x] 回滚模板至少包含 5 个强制字段
- [x] 明确点出数据库与 R2 属于高风险类别
- [x] 明确 dry-run 与批量执行要求

  **QA Scenarios**:
  ```
  Scenario: 回滚模板字段完整
    Tool: Read
    Preconditions: 模板已完成
    Steps:
      1. 读取回滚模板
      2. 检查是否包含备份、dry-run、批量执行、停止条件、恢复步骤、验证步骤
    Expected Result: 至少 6 项关键字段具备
    Failure Indicators: 仅写“可回滚”但无具体字段
    Evidence: .sisyphus/evidence/task-4-rollback-template.md

  Scenario: 高风险边界清晰
    Tool: Grep
    Preconditions: 模板已完成
    Steps:
      1. 搜索“数据库”“R2”“线上环境”等关键词
      2. 核对是否被标记为必须套用模板的场景
    Expected Result: 三类高风险场景均被明确点名
    Failure Indicators: 高风险边界不清或遗漏
    Evidence: .sisyphus/evidence/task-4-risk-boundary.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-4-rollback-template.md`
- [x] `.sisyphus/evidence/task-4-risk-boundary.md`

  **Commit**: NO

- [x] 5. 修复 `showcase-picker.md` 的计划结构

  **What to do**:
  - 重新整理 `showcase-picker.md`，消除“计划内容”与“执行结果”混写问题。
  - 统一 TODO、Acceptance Criteria、QA 证据三者状态语义，禁止 TODO 已完成但验收未完成的冲突状态。
  - 把当前过于模糊的 QA 场景补成具体选择器、具体断言、具体证据路径。

  **Must NOT do**:
  - 不修改功能实现本身，只整改计划文档。
  - 不保留“实现了以下功能”这类事后叙述在执行前任务中。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 本任务是正式计划结构整改。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 6, 7, 8 并行）
  - **Blocks**: 9, 11
  - **Blocked By**: 1, 3

  **References**:
  - `.sisyphus/plans/showcase-picker.md` - 直接整改对象。
  - `.sisyphus/plans/project-plan-remediation.md#task-3` - 正式计划质量门槛来源。

  **Acceptance Criteria**:
- [x] 文档中不存在 TODO 状态与验收状态冲突
- [x] QA 场景包含至少 1 个 happy path 和 1 个 failure path
- [x] 每个 QA 场景都包含具体步骤、断言和证据路径

  **QA Scenarios**:
  ```
  Scenario: showcase-picker 计划状态语义一致
    Tool: Read
    Preconditions: `showcase-picker.md` 已整改
    Steps:
      1. 读取任务 1~3 的 TODO 状态
      2. 逐项核对其 Acceptance Criteria 是否仍保留未完成项且无解释
      3. 检查是否去除了“实现了以下功能”等事后叙述
    Expected Result: 计划状态一致，无执行后口吻污染
    Failure Indicators: TODO 已勾选但验收空缺，或保留事后叙述
    Evidence: .sisyphus/evidence/task-5-showcase-state-consistency.md

  Scenario: showcase-picker QA 场景可执行
    Tool: Read + Grep
    Preconditions: `showcase-picker.md` 已整改
    Steps:
      1. 搜索 QA 场景块
      2. 核对是否包含具体 selector、具体 URL/测试数据、具体断言、具体 evidence 路径
    Expected Result: 场景足够具体，可直接由代理执行
    Failure Indicators: 仍存在“检查图片是否变化”这类模糊描述
    Evidence: .sisyphus/evidence/task-5-showcase-qa-specificity.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-5-showcase-state-consistency.md`
- [x] `.sisyphus/evidence/task-5-showcase-qa-specificity.md`

  **Commit**: NO

- [x] 6. 修复 `admin-improvements.md` 的计划结构

  **What to do**:
  - 拆清 `admin-improvements.md` 中的多类任务，重建明确依赖、风险等级与关键路径。
  - 修复“测试基础设施存在”的错误判断，明确项目当前无自动化测试。
  - 为 R2 迁移与数据库更新补入回滚、备份、dry-run、失败停止条件。
  - 将最终验证从结果口号改成可执行的复核任务。
  - 纠正提交策略语言，使其符合项目简体中文规范。

  **Must NOT do**:
  - 不把高风险数据操作继续写成一句话任务。
  - 不使用英文提交信息模板。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要进行复杂正式计划整改与风险重构。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 5, 7, 8 并行）
  - **Blocks**: 9, 10, 11
  - **Blocked By**: 1, 3, 4

  **References**:
  - `.sisyphus/plans/admin-improvements.md` - 直接整改对象。
  - `AGENTS.md` - 简体中文提交、无自动化测试、质量约束的依据。
  - `.sisyphus/plans/project-plan-remediation.md#task-4` - 高风险计划回滚模板来源。

  **Acceptance Criteria**:
- [x] 明确写出当前自动化测试状态为 None
- [x] R2 与数据库任务具备回滚/备份/失败恢复要求
- [x] Final Verification Wave 变成可执行任务而非结果口号
- [x] 提交策略改为简体中文

  **QA Scenarios**:
  ```
  Scenario: admin-improvements 风险控制完整
    Tool: Read + Grep
    Preconditions: `admin-improvements.md` 已整改
    Steps:
      1. 搜索“回滚”“备份”“dry-run”“停止条件”
      2. 核对这些字段是否出现在 R2/数据库相关任务内
    Expected Result: 高风险任务均有风险控制字段
    Failure Indicators: 仅写目标，无恢复策略
    Evidence: .sisyphus/evidence/task-6-admin-risk-controls.md

  Scenario: admin-improvements 计划规范符合项目约束
    Tool: Read
    Preconditions: `admin-improvements.md` 已整改
    Steps:
      1. 读取 Verification Strategy
      2. 核对测试基础设施是否被正确表述为“无自动化测试”
      3. 读取 Commit Strategy，确认使用简体中文
      4. 读取 Final Verification Wave，确认是可执行复核项
    Expected Result: 测试现状准确、提交语言合规、最终验证具体
    Failure Indicators: 仍有英文提交模板、仍把平台当测试框架、最终验证空泛
    Evidence: .sisyphus/evidence/task-6-admin-plan-compliance.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-6-admin-risk-controls.md`
- [x] `.sisyphus/evidence/task-6-admin-plan-compliance.md`

  **Commit**: NO

- [x] 7. 设计根目录快照文档的重命名 / 迁移方案

  **What to do**:
  - 为 6 个根目录伪计划文档设计统一处理动作：保留、迁移到证据目录、重命名、或标记废弃。
  - 给出推荐命名规则，例如 `evidence-<topic>-<type>.md`。
  - 说明迁移后如何避免断链、误引用和角色混淆。

  **Must NOT do**:
  - 不简单粗暴删除文档。
  - 不保留模糊命名而只改目录。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 这是一次命名与路径方案设计。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 5, 6, 8 并行）
  - **Blocks**: 12
  - **Blocked By**: 1, 2

  **References**:
  - `timeline-page.md` / `showcase-page.md` / `r2-files-api.md` / `admin-after-login.md` / `admin-dashboard.md` / `admin-login.md` - 待归类对象。
  - `.sisyphus/plans/project-plan-remediation.md#task-2` - 盘点结果来源。

  **Acceptance Criteria**:
- [x] 6 个文档全部给出处理动作
- [x] 命名规则清晰且可扩展
- [x] 至少说明 1 种避免断链/误引用的处理方式

  **QA Scenarios**:
  ```
  Scenario: 快照文档迁移方案完整
    Tool: Read
    Preconditions: 迁移方案已完成
    Steps:
      1. 读取迁移方案
      2. 核对 6 个文档是否全部有动作（保留/迁移/重命名/废弃）
      3. 核对是否有统一命名规则
    Expected Result: 所有文档都有明确去向，命名规则统一
    Failure Indicators: 任一文档无动作，或命名规则只适配个别文件
    Evidence: .sisyphus/evidence/task-7-snapshot-migration-plan.md

  Scenario: 误引用防护存在
    Tool: Grep
    Preconditions: 迁移方案已完成
    Steps:
      1. 搜索“断链”“误引用”“兼容路径”或等价表述
      2. 核对是否提供至少一种处理策略
    Expected Result: 有明确的引用兼容说明
    Failure Indicators: 只说迁移，不提引用影响
    Evidence: .sisyphus/evidence/task-7-reference-safety.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-7-snapshot-migration-plan.md`
- [x] `.sisyphus/evidence/task-7-reference-safety.md`

  **Commit**: NO

- [x] 8. 建立计划状态语义规则（计划 / 执行 / 验收）

  **What to do**:
  - 定义 TODO 勾选、Acceptance Criteria 勾选、Final Verification 勾选分别代表什么。
  - 明确“什么时候可以把任务标记为完成”，以及“什么时候只能标记为已实施待验收”。
  - 给出反例，专门解决 `showcase-picker.md` 当前的状态冲突问题。

  **Must NOT do**:
  - 不允许同一文档里混用互相矛盾的完成语义。
  - 不允许“代码写了”直接等于“任务完成”。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要定义跨计划通用的状态语义规则。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 5, 6, 7 并行）
  - **Blocks**: 9, 11
  - **Blocked By**: 1

  **References**:
  - `.sisyphus/plans/showcase-picker.md` - 状态冲突的典型反例。
  - `.sisyphus/plans/admin-improvements.md` - Final Verification 流于结果口号的反例。

  **Acceptance Criteria**:
- [x] 至少定义 3 个状态层级
- [x] 明确每个层级对应的允许/禁止写法
- [x] 提供至少 2 个反例说明

  **QA Scenarios**:
  ```
  Scenario: 状态语义层级明确
    Tool: Read
    Preconditions: 状态规则已完成
    Steps:
      1. 读取规则文档
      2. 核对是否明确区分计划、执行、验收三个层级
      3. 检查是否定义了“完成”的必要条件
    Expected Result: 状态定义清晰，层级不重叠
    Failure Indicators: 只定义了勾选，不定义含义
    Evidence: .sisyphus/evidence/task-8-status-semantics.md

  Scenario: 反例可映射到现有问题
    Tool: Read
    Preconditions: 状态规则已完成
    Steps:
      1. 搜索是否引用 `showcase-picker.md` 或等价问题描述
      2. 搜索是否解释“已修改 ≠ 已验收”
    Expected Result: 规则能直接解释当前已发现问题
    Failure Indicators: 规则抽象但无法落地到当前案例
    Evidence: .sisyphus/evidence/task-8-status-counterexamples.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-8-status-semantics.md`
- [x] `.sisyphus/evidence/task-8-status-counterexamples.md`

  **Commit**: NO

- [x] 9. 统一 QA 场景写法与证据规范

  **What to do**:
  - 为文档类计划建立统一 QA 场景模板：工具、前置条件、步骤、断言、失败指示、证据路径。
  - 约束所有 QA 场景必须至少包含 1 个 happy path 与 1 个 error / edge case。
  - 给出文档类任务常用的验证工具映射：Read、Grep、Glob。

  **Must NOT do**:
  - 不允许“检查是否正常”这种无断言写法。
  - 不允许缺失 Evidence 字段。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要沉淀统一 QA 模板。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3（与 10, 11, 12 并行）
  - **Blocks**: F4
  - **Blocked By**: 5, 6, 8

  **References**:
  - `.sisyphus/plans/showcase-picker.md` - 当前 QA 场景模糊的反例。
  - `.sisyphus/plans/project-plan-remediation.md#task-5` / `#task-6` / `#task-8` - 需对齐的整改目标。

  **Acceptance Criteria**:
- [x] QA 模板包含 6 个标准字段
- [x] 明确 happy path + failure path 的最低要求
- [x] 文档类工具映射清晰

  **QA Scenarios**:
  ```
  Scenario: QA 模板字段完整
    Tool: Read
    Preconditions: QA 模板已完成
    Steps:
      1. 读取 QA 模板
      2. 核对是否包含工具、前置条件、步骤、断言、失败指示、证据路径
    Expected Result: 6 个字段齐全
    Failure Indicators: 任何字段缺失
    Evidence: .sisyphus/evidence/task-9-qa-template.md

  Scenario: 最低场景要求明确
    Tool: Grep
    Preconditions: QA 模板已完成
    Steps:
      1. 搜索“happy path”“failure”“edge case”或等价表述
      2. 核对是否写明至少各 1 个
    Expected Result: 最低场景数量被明确规定
    Failure Indicators: 模板只写格式，不写最低覆盖要求
    Evidence: .sisyphus/evidence/task-9-qa-coverage.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-9-qa-template.md`
- [x] `.sisyphus/evidence/task-9-qa-coverage.md`

  **Commit**: NO

- [x] 10. 统一提交策略与简体中文约束

  **What to do**:
  - 明确正式计划中的 Commit Strategy 必须遵循项目 AGENTS.md：提交前缀允许 `feat:` `fix:` `chore:` `refactor:`，提交内容使用简体中文。
  - 为“仅文档整改”的任务定义建议提交粒度与分组原则。
  - 列出禁止写法：英文描述、繁体中文、含糊 scope。

  **Must NOT do**:
  - 不保留英文提交模板。
  - 不把文档整改任务和功能开发提交策略混为一谈。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要统一计划中的提交规则。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3（与 9, 11, 12 并行）
  - **Blocks**: F1
  - **Blocked By**: 6

  **References**:
  - `AGENTS.md` - 提交语言与前缀规则来源。
  - `.sisyphus/plans/admin-improvements.md` - 当前英文提交策略反例。

  **Acceptance Criteria**:
- [x] 明确允许的提交前缀
- [x] 明确要求提交说明使用简体中文
- [x] 至少列出 3 类禁止写法

  **QA Scenarios**:
  ```
  Scenario: 提交规则与仓库约束一致
    Tool: Read
    Preconditions: 提交策略规则已完成
    Steps:
      1. 读取提交规则
      2. 核对是否与 `AGENTS.md` 中的前缀与简体中文要求一致
    Expected Result: 规则完全对齐仓库约束
    Failure Indicators: 仍允许英文或繁体提交信息
    Evidence: .sisyphus/evidence/task-10-commit-policy.md

  Scenario: 禁止写法明确
    Tool: Grep
    Preconditions: 提交策略规则已完成
    Steps:
      1. 搜索“禁止”“不允许”等说明
      2. 核对是否至少列出英文、繁体、模糊 scope 三类反例
    Expected Result: 反例完整明确
    Failure Indicators: 只有正向要求，无反例边界
    Evidence: .sisyphus/evidence/task-10-commit-anti-patterns.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-10-commit-policy.md`
- [x] `.sisyphus/evidence/task-10-commit-anti-patterns.md`

  **Commit**: NO

- [x] 11. 建立正式计划审查清单

  **What to do**:
  - 汇总前序任务成果，形成一份正式计划审查清单。
  - 清单至少覆盖：分类正确、结构完整、依赖明确、验收可执行、QA 具体、风险可回滚、提交策略合规、状态语义一致。
  - 给出“通过 / 拒绝”判定规则。

  **Must NOT do**:
  - 不把审查清单写成宽泛建议列表。
  - 不缺少拒绝条件。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要把整改成果固化为最终审查基线。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3（与 9, 10, 12 并行）
  - **Blocks**: F1, F2
  - **Blocked By**: 1, 3, 4, 5, 6, 8

  **References**:
  - `.sisyphus/plans/project-plan-remediation.md#task-1` / `#task-3` / `#task-4` / `#task-8` / `#task-9` / `#task-10` - 清单来源。
  - `.sisyphus/plans/showcase-picker.md` / `.sisyphus/plans/admin-improvements.md` - 真实案例样本。

  **Acceptance Criteria**:
- [x] 审查清单至少覆盖 8 个维度
- [x] 每个维度都具备通过/拒绝判据
- [x] 可直接用于复审现有正式计划

  **QA Scenarios**:
  ```
  Scenario: 审查清单维度完整
    Tool: Read
    Preconditions: 审查清单已完成
    Steps:
      1. 读取清单
      2. 核对 8 个核心维度是否全部存在
      3. 检查每个维度是否有“通过/拒绝”判据
    Expected Result: 清单可直接执行，不需额外解释
    Failure Indicators: 维度缺失或只有建议没有判据
    Evidence: .sisyphus/evidence/task-11-review-checklist.md

  Scenario: 审查清单可落地到真实计划
    Tool: Read
    Preconditions: 审查清单已完成
    Steps:
      1. 读取清单与 `showcase-picker.md`
      2. 读取清单与 `admin-improvements.md`
      3. 核对清单项是否能映射到两个真实案例中的问题
    Expected Result: 清单能实际发现当前已知缺陷
    Failure Indicators: 清单过于空泛，无法落地到案例
    Evidence: .sisyphus/evidence/task-11-real-case-mapping.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-11-review-checklist.md`
- [x] `.sisyphus/evidence/task-11-real-case-mapping.md`

  **Commit**: NO

- [x] 12. 建立证据文档最小元信息规范

  **What to do**:
  - 为证据快照类文档定义最小元信息：来源、采集方式、采集时间/环境、用途说明。
  - 约束证据文档命名应体现主题与类型，避免再被误认成计划。
  - 说明证据文档如何与正式计划互相引用。

  **Must NOT do**:
  - 不允许证据文档无上下文裸存。
  - 不允许证据文档继续使用“像计划”的命名方式。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要定义证据类文档标准。
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3（与 9, 10, 11 并行）
  - **Blocks**: F3
  - **Blocked By**: 2, 7

  **References**:
  - `timeline-page.md` / `showcase-page.md` / `r2-files-api.md` - 证据快照样本。
  - `.sisyphus/plans/project-plan-remediation.md#task-7` - 命名/迁移方案来源。

  **Acceptance Criteria**:
- [x] 最小元信息至少包含 4 个字段
- [x] 命名规范可区分主题与类型
- [x] 明确说明计划与证据之间的引用关系

  **QA Scenarios**:
  ```
  Scenario: 证据元信息规范完整
    Tool: Read
    Preconditions: 规范已完成
    Steps:
      1. 读取证据文档规范
      2. 核对是否包含来源、采集方式、时间/环境、用途说明
    Expected Result: 至少 4 个元信息字段齐备
    Failure Indicators: 证据文档仍然无上下文
    Evidence: .sisyphus/evidence/task-12-evidence-metadata.md

  Scenario: 证据命名不再冒充计划
    Tool: Grep
    Preconditions: 规范已完成
    Steps:
      1. 搜索命名示例
      2. 核对示例是否体现主题与类型，并避免 `*-page.md` 这类模糊方案名
    Expected Result: 命名示例清晰，不再像计划文件
    Failure Indicators: 命名规则仍含糊，无法区分角色
    Evidence: .sisyphus/evidence/task-12-evidence-naming.md
  ```

  **Evidence to Capture**:
- [x] `.sisyphus/evidence/task-12-evidence-metadata.md`
- [x] `.sisyphus/evidence/task-12-evidence-naming.md`

  **Commit**: NO

---

## Final Verification Wave

> 4 个复核任务并行执行。全部通过后，才可认为“项目计划体系整改计划”可交付。

- [x] F1. **计划合规复核** — `oracle`
  逐项核对本计划是否覆盖：分类、结构、依赖、验收、QA、回滚、提交策略、状态语义。输出：`覆盖维度 [8/8] | 缺失项 [0/8] | VERDICT: APPROVE`

- [x] F2. **范围漂移复核** — `deep`
  检查本计划是否错误扩展到了源码实现、CI 重构、自动化脚本开发、全仓库结构重做。输出：`In Scope [12] | Out of Scope Creep [0] | VERDICT: APPROVE`

- [x] F3. **文档分类复核** — `unspecified-high`
  随机抽查正式计划与根目录快照样本，验证分类标准能否正确区分二者，并检查根目录 6 个文档是否均被覆盖。输出：`Samples [8/8] | Misclassified [0/8] | VERDICT: APPROVE`

- [x] F4. **QA 可执行性复核** — `unspecified-high`
  逐任务检查 QA 场景是否具备工具、步骤、断言、失败指示、证据路径，且每项至少包含 happy path 与 failure/edge case。输出：`Tasks with Valid QA [12/12] | Invalid [0/12] | VERDICT: APPROVE`

---

## Commit Strategy

- 本计划为整改计划，不要求立即提交。
- 若执行阶段需要提交，建议按文档类别拆分：
  - `chore: 规范计划文档分类与命名`
  - `refactor: 修正正式计划结构与验收规则`
  - `chore: 统一证据文档元信息规范`

---

## Success Criteria

### Verification Commands
```bash
# 使用文档读取/搜索工具验证，不依赖源码构建
# 预期：正式计划与快照文档可被清晰区分；两份正式计划的已知缺陷均被纳入整改范围
```

### Final Checklist
- [x] 正式计划、草稿、证据快照职责分离
- [x] 现有两份正式计划的结构缺陷均被覆盖
- [x] 根目录 6 个伪计划均有明确处理动作
- [x] QA 场景规范可复用于后续计划
- [x] 提交策略与项目简体中文规则对齐
