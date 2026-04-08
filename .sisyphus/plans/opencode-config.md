# OpenCode 配置规则 - 工作规划

## TL;DR

> **快速配置**: 为 OpenCode AI 助手创建规则文件，实现简体中文回复和自动 git push
> 
> **交付物**:
> - `opencode.json` - Git 权限配置
> - 更新 `AGENTS.md` - 语言规则
> 
> **预计工作量**: 简单 (5-10 分钟)
> **并行执行**: 否 - 顺序任务

---

## Context

### 原始需求
用户需要配置 OpenCode AI 助手：
1. **强制简体中文回复** - 用户看不懂英文
2. **繁体转简体** - 用户输入繁体时自动转换
3. **自动 git push** - 开发完成后推送到 main

### 研究发现
- OpenCode 使用 `AGENTS.md` 存储自定义指令规则
- OpenCode 使用 `opencode.json` 配置运行时权限
- 项目已存在 `AGENTS.md` (212行)
- 项目无 `opencode.json`

### Metis 建议
- 推荐使用 Option B：opencode.json + AGENTS.md 更新
- Git 权限建议先设 "ask"，但用户明确要自动 push
- 需要预提交验证防止推送失败

---

## Work Objectives

### 核心目标
配置 OpenCode 规则文件，使 AI：
1. 使用简体中文回复所有内容
2. 将用户输入的繁体中文转换为简体
3. 开发完成后自动 git push 到 main

### 具体交付物
- [ ] `opencode.json` - Git 权限配置
- [ ] 更新 `AGENTS.md` - 添加语言强制规则
- [ ] 验证配置生效

### 完成定义
- [ ] opencode.json 存在且格式正确
- [ ] AGENTS.md 包含简体中文规则
- [ ] Git 权限配置为允许自动 push

### 必须包含
- 简体中文强制规则（含示例）
- Git push 自动执行配置
- 预提交验证（npm run build）

### 必须不包含
- ❌ 任何代码文件修改
- ❌ 新增 npm 依赖
- ❌ 修改现有业务逻辑

---

## Verification Strategy

### 测试决策
- **基础设施**: 无需测试框架
- **自动化测试**: 无
- **验证方式**: 人工检查文件内容

### QA 策略
每个任务必须包含 Agent 执行验证场景（无人类干预）

---

## Execution Strategy

### 任务流

```
Task 1: 创建 opencode.json 配置
  → opencode.json

Task 2: 更新 AGENTS.md 添加语言规则
  → AGENTS.md (更新)

Task 3: 验证配置生效
  → 人工检查
```

### 依赖关系
- Task 1 → Task 2 (无依赖，可并行)
- Task 2, 3 → Task 3 (依赖前面完成)

---

## TODOs

- [x] 1. 创建 opencode.json 配置文件

  **What to do**:
  - 在项目根目录创建 `opencode.json` 文件
  - 配置 Git 权限：允许自动 push
  - 配置预提交验证：push 前执行 `npm run build`

  **Must NOT do**:
  - 不修改任何代码文件
  - 不添加任何依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Reason**: 简单配置文件创建

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (与 Task 2 并行)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - OpenCode 配置文档: https://www.mintlify.com/opencode-ai/opencode/core-concepts/configuration

  **Acceptance Criteria**:
  - [ ] 文件 `opencode.json` 已创建
  - [ ] 包含 git push 权限配置
  - [ ] 包含预提交验证配置

  **QA Scenarios**:
  ```
  Scenario: opencode.json 创建成功
    Tool: Bash
    Preconditions: 无
    Steps:
      1. 读取 opencode.json 文件
      2. 检查 JSON 格式有效
      3. 检查包含 "permission" 字段
    Expected Result: 文件存在且格式正确
    Evidence: 文件内容输出
  ```

- [x] 2. 更新 AGENTS.md 添加语言规则

  **What to do**:
  - 在 `AGENTS.md` 顶部添加语言强制规则
  - 规则内容：
    - 所有回复必须使用简体中文（简体字）
    - 代码注释、提交信息、对话回复全部使用简体
    - 用户输入繁体中文时：先转换为简体再回复
  - 提供具体示例

  **Must NOT do**:
  - 不删除现有内容
  - 不修改现有配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Reason**: 文档更新任务

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (与 Task 1 并行)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - 现有 AGENTS.md 文件

  **Acceptance Criteria**:
  - [ ] AGENTS.md 包含简体中文规则
  - [ ] 包含繁体转简体规则
  - [ ] 包含示例说明

  **QA Scenarios**:
  ```
  Scenario: AGENTS.md 语言规则已添加
    Tool: Bash
    Preconditions: AGENTS.md 存在
    Steps:
      1. 读取 AGENTS.md 文件
      2. 检查包含 "简体中文" 关键词
      3. 检查包含 "繁体" 关键词
    Expected Result: 语言规则存在
    Evidence: 文件内容输出
  ```

- [x] 3. 执行 git commit 和 push

  **What to do**:
  - 执行 `git add -A` 添加所有更改
  - 执行 `git commit -m "chore: 添加 OpenCode 配置规则"`
  - 执行 `git push origin main`

  **Must NOT do**:
  - 不推送其他分支

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Reason**: Git 操作

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: 在 Task 1 和 2 完成后执行
  - **Blocks**: None
  - **Blocked By**: Task 1, Task 2

  **Acceptance Criteria**:
  - [ ] git add 成功
  - [ ] git commit 成功
  - [ ] git push 成功推送到 main

  **QA Scenarios**:
  ```
  Scenario: Git push 成功
    Tool: Bash
    Preconditions: 已完成 Task 1 和 2
    Steps:
      1. git status
      2. 检查无未提交更改
      3. 检查 main 分支已推送
    Expected Result: 远程仓库包含新提交
    Evidence: git log 输出
  ```

---

## Final Verification Wave

- [x] F1. 验证 opencode.json 存在且格式正确
- [x] F2. 验证 AGENTS.md 包含语言规则
- [x] F3. 验证 Git 权限配置

---

## Commit Strategy

- 任务完成后一次性提交：
  - `git add opencode.json AGENTS.md`
  - `git commit -m "chore: 添加 OpenCode 配置规则"`
  - `git push origin main`

---

## Success Criteria

### 验证命令
- 读取 `opencode.json` 确认格式
- 读取 `AGENTS.md` 确认语言规则存在

### 最终检查
- [x] opencode.json 已创建
- [x] AGENTS.md 已更新语言规则
- [x] Git push 权限已配置