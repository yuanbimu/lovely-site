# 状态语义反例

## 反例 1: showcase-picker.md - TODO 完成但 AC 未检查

### 问题描述

在 `showcase-picker.md` 中，Todo 1、2、3 都标记为已完成 `[x]`，但内部的 Acceptance Criteria 未检查：

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功    ← AC 未检查！
  - [ ] 从 API 获取数据    ← AC 未检查！
```

### 为什么这是问题

1. **TODO [x] 表示"代码已写"**
2. **AC [ ] 表示"未验证"**
3. 标记 TODO 完成意味着"你可以检查了"，但当前状态混淆

### 解决方

**方案 A: 保持 TODO [x]，等 AC 验证后标记**

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [x] 组件文件创建成功    ← 验证后标记
  - [x] 从 API 获取数据    ← 验证后标记
```

**方案 B: 待验证状态加 suffix**

```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件 (pending verification)

  **What to do**:
  - 创建组件文件

  **Acceptance Criteria**:
  - [ ] 组件文件创建成功
  - [ ] 从 API 获取数据
```

### 这里的状态应该是

**如果代码已写但还未运行验证命令**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件 (pending verification)
  **Acceptance Criteria**:
  - [ ] 组件文件创建成功
  - [ ] 从 API 获取数据
```

**如果验证已通过**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件
  **Acceptance Criteria**:
  - [x] 组件文件创建成功
  - [x] 从 API 获取数据
```

---

## 计数器 2: admin-improvements.md - Final Verification 是口号

### 问题描述

所有 Final Verification 标记为 `[x]`，但是：
1. 没有说明验证了什么
2. 没有证据文件路径
3. TODOs 中没有 AC 验证
4. "代码写完 = 任务完成" 的错误等式

```markdown
- [x] F1. Admin布局验证 - CSS已修改
```

### 为什么这是问题

1. **F1 标记 [x] 但没有说明验证了什么**
2. **没有执行验证命令的证据**
3. **没有区分"代码写了"和"验证通过"**

### 正确的 Final Verification 写法

```markdown
## Final Verification Wave

- [x] F1. Admin布局验证

  **Verification Command**:
  ```bash
  curl -s http://localhost:4321/admin | grep "admin-content"
  ```

  **Evidence**: .sisyphus/evidence/admin-layout-verify.html

  **Result**: 页面正常返回，CSS 已加载
```

### 或者如果验证失败

```markdown
## Final Verification Wave

- [ ] F1. Admin布局验证

  **Verification Command**:
  ```bash
  curl -s http://localhost:4321/admin
  ```

  **Expected**: 内容居中显示
  **Actual**: 仍偏左

  **Next Step**: 修改 CSS
```

---

## 计数器 3: 混合状态问题

### 问题描述

同一个任务中同时存在不同状态层级：

```markdown
- [x] 1. 创建组件 (已实现)
  **Acceptance Criteria**:
  - [ ] 检查点 A

- [ ] 2. 集成到页面 (未开始)
  **Acceptance Criteria**:
  - [ ] 检查点 B
```

### 正确理解

| 状态 | 含义 | 后续操作 |
|------|------|---------|
| `[ ]` Plan | 等待执行 | 等待分配 |
| `[x]` Execution | 代码已写 | 等待验证 |
| `[x]` + AC [x] | 验证通过 | 任务完成 |

### 不能同时存在的状态

```markdown
// ❌ 禁止：一个 TODO 状态不明确
- [ ] 1. 任务     //  Plan? Execution?

// ✅ 正确：状态明确
- [x] 1. 任务    //  Execution/已实现
- [x] 1. 任务    //  或带 pending
  **AC**: [x]    //  验证通过
```

---

## 总结

### 反例汇总

| 反例名 | 问题 | 解决方案 |
|--------|------|---------|
| showcase-picker | TODO [x] + AC [ ] | 验证后标记 AC [x] |
| admin-improvements | FV 无验证内容 | 添加验证命令和证据 |
| 混合状态 | 状态不明确 | 只用三级状态 |

### 关键点

1. **TODO [x] = 代码写了，不是验证**
2. **AC [x] = 验证通过**
3. **Final Verification 需要证据**
4. **禁止：代码写完 = 验证通过**