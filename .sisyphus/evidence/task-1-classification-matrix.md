# 项目文档分类矩阵

## 概述

本文档为项目内 Markdown 文档建立分类标准，用于区分「正式计划」「草稿」「证据快照」「其他」四类文档。本分类矩阵是项目计划重构工作的基础识别框架。

---

## 分类定义

### 1. 正式计划 (Formal Plan)

**定义**：具有明确目标、范围、任务拆分、依赖关系、验收标准、执行策略和验证波次的可执行工作计划文档。

**定义特性（至少满足 4 项）**：

1. **目标明确**：包含清晰的 TL;DR 或执行摘要，说明交付成果和工作量估算
2. **范围界定**：明确列出「必须做」和「禁止做」的边界
3. **任务拆分**：将工作拆分为原子化的 TODO 单元，每个 TODO 包含具体操作步骤
4. **依赖关系**：明确任务间的阻塞关系和并行可能性
5. **验收标准**：为每个任务定义可验证的完成条件（Acceptance Criteria）
6. **验证策略**：包含 QA 场景、验证命令或 agent-executed 测试计划
7. **执行策略**：包含分阶段执行计划（Wave 1/2/3）或执行顺序
8. **完成追踪**：使用 `[ ]` / `[x]` 标记任务进度，且状态与内容一致

**典型文件**：

- `.sisyphus/plans/showcase-picker.md`
- `.sisyphus/plans/admin-improvements.md`

---

### 2. 草稿 (Draft)

**定义**：已开始编写但尚未完成结构化整理的工作文档，可能包含部分想法但缺乏完整的计划要素。

**定义特性（至少满足 2 项）**：

1. **标题含「草稿」或「Draft」**：文件名前缀或标题明确标注为草稿
2. **结构不完整**：缺少 TL;DR、任务拆分、验收标准等计划核心要素
3. **内容不连贯**：包含「待确认」「TODO」等占位符，或存在开放式问题
4. **状态标记为「待定」或「考虑中」**：明确表明文档未进入执行阶段

**典型文件**：

- `.sisyphus/drafts/project-plan-review.md`
- `.sisyphus/drafts/showcase-diagnosis.md`
- `.sisyphus/drafts/admin-improvements.md`

---

### 3. 证据快照 (Evidence Snapshot)

**定义**：通过工具（Playwright、API 抓取、DOM 解析等）自动生成的现状记录，用于保存某一时刻的系统状态，不具备计划属性。

**定义特性（至少满足 2 项）**：

1. **工具生成**：由 Playwright、curl、API 客户端等自动化工具输出
2. **格式为结构化数据**：JSON、DOM 树结构、Markdown 表格等
3. **无目标声明**：不包含「要做...」「交付...」等计划性表述
4. **无执行意图**：不包含任务拆分、依赖关系、验收标准
5. **仅记录现状**：描述「当前是什么」而非「应该做什么」

**典型文件**：

- `timeline-page.md`
- `showcase-page.md`
- `r2-files-api.md`
- `admin-after-login.md`
- `admin-dashboard.md`
- `admin-login.md`

---

### 4. 其他 (Other)

**定义**：不属于上述三类但具有保留价值的文档，如项目介绍、贡献指南、配置文件说明等。

**定义特性（至少满足 1 项）**：

1. **项目级文档**：README、CONTRIBUTING、QUICK_START 等面向用户或开发者的说明文档
2. **配置类文档**：包含环境配置、依赖说明、部署指南等操作指引
3. **规范类文档**：如 AGENTS.md，定义项目开发规范和约定

**典型文件**：

- `README.md` / `README.zh-CN.md`
- `CONTRIBUTING.md`
- `QUICK_START.md`
- `AGENTS.md`
- `src/components/AGENTS.md`
- `src/pages/AGENTS.md`
- `functions/AGENTS.md`

---

## 根目录伪计划文档分析

以下 6 个文件位于项目根目录，常被误认为「计划」，但经分类矩阵验证，均为**证据快照**，不具备正式计划资格：

| 文件名 | 内容性质 | 证据快照特征 | 为什么不是正式计划 |
|--------|----------|--------------|---------------------|
| `timeline-page.md` | Playwright DOM 抓取 | 页面元素树结构，无目标声明 | 仅记录「时间线页面当前有什么」，无执行意图 |
| `showcase-page.md` | Playwright DOM 抓取 | 页面元素树结构，无目标声明 | 仅记录「橱窗页面当前有什么」，无执行意图 |
| `r2-files-api.md` | API 响应快照 | JSON 格式的 API 返回值 | 仅记录「R2 API 当前返回什么」，无执行意图 |
| `admin-after-login.md` | Playwright DOM 抓取 | 登录后的后台页面结构 | 仅记录「后台页面当前有什么」，无执行意图 |
| `admin-dashboard.md` | Playwright DOM 抓取 | 登录表单结构 | 仅记录「登录页当前有什么」，无执行意图 |
| `admin-login.md` | Playwright DOM 抓取 | 登录页面结构 | 仅记录「登录页当前有什么」，无执行意图 |

**关键区分点**：这些文件的生成方式是「观察并记录」，而不是「规划并执行」。它们无法回答「要做什么」「怎么做」「如何验证」这些问题。

---

## 分类决策树

```
文档开头是否有 "Plan:" / "计划:" 标题？
  ├─ 是 → 进入计划审查流程
  │        ├─ 是否包含 TL;DR + 任务拆分 + 验收标准？
  │        │     ├─ 是 → 正式计划
  │        │     └─ 否 → 草稿
  │        └─ 是否为工具自动生成（Playwright/API/curl）？
  │              ├─ 是 → 证据快照
  │              └─ 否 → 其他
  │
  └─ 否 → 检查文件位置和内容
           ├─ 位于 .sisyphus/drafts/ → 草稿
           ├─ 内容为 JSON/DOM 树 → 证据快照
           └─ 内容为说明/配置 → 其他
```

---

## 分类结果总览

| 分类 | 文件路径 |
|------|----------|
| **正式计划** | `.sisyphus/plans/showcase-picker.md` |
|  | `.sisyphus/plans/admin-improvements.md` |
| **草稿** | `.sisyphus/drafts/project-plan-review.md` |
|  | `.sisyphus/drafts/showcase-diagnosis.md` |
|  | `.sisyphus/drafts/admin-improvements.md` |
| **证据快照** | `timeline-page.md` |
|  | `showcase-page.md` |
|  | `r2-files-api.md` |
|  | `admin-after-login.md` |
|  | `admin-dashboard.md` |
|  | `admin-login.md` |
| **其他** | `README.md`, `README.zh-CN.md` |
|  | `CONTRIBUTING.md`, `QUICK_START.md` |
|  | `AGENTS.md` 及其子目录版本 |
|  | `.sisyphus/plans/project-plan-remediation.md` |

---

## 使用建议

1. **计划审查**：仅对「正式计划」分类的文件进行计划质量审查
2. **快照处理」：将「证据快照」移至 `.sisyphus/evidence/` 目录，避免与计划混淆
3. **草稿转化」：对「草稿」进行结构化补充，达标后升级为「正式计划」
4. **清理无价值文件**：识别并删除无法归类的冗余文档