# 任务状态语义规则

## 概述

本文档定义任务执行过程中的状态语义，解决以下问题：
1. 何时任务可以被标记为"完成"
2. TODO、验收标准、最终验证之间的关系
3. 代码写完 != 任务完成

---

## 三级状态模型

### Level 1: Plan（计划级）

**定义**: 任务已在计划中定义，尚未开始执行

**触发条件**:
- 任务出现在 plan 文件的 TODOs 列表中
- 包含 "What to do" 描述
- 定义了 Acceptance Criteria

**_allowed_ wording:**
- `[ ]` (未开始)
- `TODO`
- `Task defined`
- `Planned`

**_forbidden_ wording:**
- `Complete`
- `Done`
- `Implemented`

**示例**:
```markdown
- [ ] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件
  - 使用 /api/showcases 获取数据

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功
  - [ ] 从 API 获取数据
```

---

### Level 2: Execution（执行级）

**定义**: 代码正在编写或已完成编写，等待验证

**触发条件**:
- 代码已写入文件系统
- 组件/函数已创建
- 集成到目标位置

**_allowed_ wording:**
- `[x]` (已完成编码)
- `Implemented`
- `Code written`
- `In Progress` (如果还在写)
- **可以加 suffix**: "_(pending verification)_"

**_forbidden_ wording:**
- `Complete`
- `Done`
- `Verified`
- `AC passed`

**示例**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件
  - 使用 /api/showcases 获取数据

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功
  - [ ] 从 API 获取数据
```

**⚠️ 关键规则**: Execution 状态时，Acceptance Criteria 必须保持 `[ ]`（未检查）

---

### Level 3: Verification（验证级）

**定义**: 已通过验收标准验证

**触发条件**:
- Acceptance Criteria 全部检查 `[x]`
- 验证命令执行成功
- QA 场景通过

**_allowed_ wording:**
- `[x]` (AC 已验证)
- `Verified`
- `AC passed`
- `Final Verification passed`

**_forbidden_ wording:**
- `[x]` 在 Execution 级别但 AC 未检查

**示例**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [x] 组件文件创建成功
  - [x] 从 API 获取数据
```

---

## 完成判定规则

### 核心公式

```
任务完成 = (TODO [x]) AND (所有 AC [x])
```

**即**: TODO 勾选 + 所有 Acceptance Criteria 勾选

### 禁止的等式

```typescript
// ❌ 禁止：代码写完 = 任务完成
// 正确：代码写完 + 验证通过 = 任务完成

// ❌ 禁止：TODO [x] = AC [x]
// 正确：TODO [x] 表示执行完成，AC [x] 表示验证通过
```

---

## Final Verification 语义

### 什么是 Final Verification

Final Verification 是**计划级检查点**，不是任务级别的：

| 元素 | 含义 |
|------|------|
| Final Verification N | 整个计划的多项验证（例如 F1: 页面加载） |
| Acceptance Criteria | 单个 TODO 的验证 |

### Final Verification 的触发条件

**必须在所有 TODO 完成之后**：
1. 所有 TODOs 的 TODO 列为 `[x]`
2. 所有 TODOs 的 AC 列为 `[x]`
3. 然后 Final Verification 才能标记为 `[x]`

### 禁止的顺序

```typescript
// ❌ 禁止：先标记 Final Verification，再执行 TODOs
// 正确：先完成所有 TODOs 和 AC，最后标记 Final Verification
```

---

## 状态的正确顺序

### 正确流程

```
[ ] Plan 定义
  ↓
[x] TODO (代码已写) + [ ] AC (待验证)
  ↓
[x] TODO + [x] AC (验证通过)
  ↓
任务完成
```

### 错误流程（禁止）

```
[ ] Plan 定义
  ↓
[x] TODO + [ ] AC  ← 错误！AC 未验证却标记 TODO 完成
  ↓
[ ] TODO (不应该重新标记)
  ↓
任务状态模糊不清
```

---

## 实例：showcase-picker.md 修复

### 修复前（有问题）

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功    ← TODO 已完成但 AC 未检查
  - [ ] 从 API 获取数据
```

**问题**: TODO 标记完成，但 AC 未检查。这表示代码写了但没验证。

### 修复后（正确）

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [x] 组件文件创建成功    ← 验证通过
  - [x] 从 API 获取数据    ← 验证通过
```

或（如果还没验证）:

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件 (pending verification)

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功    ← 待验证
  - [ ] 从 API 获取数据    ← 待验证
```

---

## admin-improvements.md 问题

### 识别的问题

1. **Final Verification Wave 是口号，不是验证**
   - F1-F4 全部标记 `[x]`
   - 但没有说明具体验证了什么
   - 没有证据文件

2. **没有区分 TODOs 完成和验证通过**
   - 所有 TODO 1-6 标记 `[x]`
   - 所有 AC 保持缺失或空白
   - 没有 AC 级别验证

### 正确的写法应该是

```markdown
## TODOs

- [x] 1. Admin布局修复

  **What to do**:
  - 修改 CSS

  **Acceptance Criteria**:
  - [x] 访问 /admin 内容居中
  - [x] 一行显示3个方块

## Final Verification Wave

- [x] F1. Admin布局验证 - 页面正常加载
- [x] F2. R2数据验证 - 数据库已更新
```

---

## 总结规则表

| 状态 | TODO 列 | AC 列 | 含义 |
|------|--------|------|------|
| Plan | `[ ]` | `[ ]` | 计划中，未开始 |
| Execution | `[x]` | `[ ]` | 代码已写，待验证 |
| Complete | `[x]` | `[x]` | 代码已写 + 验证通过 |
| Invalid | `[ ]` | `[x]` | AC 验证了但 TODO 没做？ |

---

## 关键原则

1. **TODO [x] 不代表任务完成**
2. **AC [x] 才代表验证通过**
3. **任务完成 = TODO [x] + AC [x]**
4. **Final Verification 是计划级检查点**
5. **代码写完 ≠ 任务完成**