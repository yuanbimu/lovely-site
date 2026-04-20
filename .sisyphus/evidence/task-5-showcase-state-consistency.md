# Task 5 - 状态一致性修复证据

> **任务**: 修复 showcase-picker.md 计划文档中的状态一致性问题
> **日期**: 2026-04-16

---

## 问题分析

### 原始问题

1. **TODO 状态与 Acceptance Criteria 不一致**
   - TODO 1 标记为 `[x]` 已完成
   - TODO 2 标记为 `[x]` 已完成
   - TODO 3 标记为 `[x]` 已完成
   - 但 Acceptance Criteria 勾选状态与 TODO 完成状态不匹配

2. **Post-execution 叙事混入**
   - TODO 1 的 What to do 中包含 "实现了以下功能" 描述
   - 这种表述出现在预执行计划中是错误的，应该只描述"将要做什么"

3. **QA Scenarios 缺乏具体性**
   - 缺少 selector 信息
   - 缺少明确的 assertion
   - 缺少 evidence path
   - 没有区分 happy path 和 failure path

---

## 修复内容

### 1. 修复 TODO 1 - 状态一致性问题

**修复前**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建 `src/components/home/ShowcasePicker.tsx`
  - 使用 `/api/showcases` 获取橱窗数据
  - 实现了以下功能:    # ← Post-execution 叙事
```

**修复后**:
```markdown
- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建 `src/components/home/ShowcasePicker.tsx`
  - 使用 `/api/showcases` 获取橱窗数据
  - 实现下拉选择框和随机按钮
  - 通过 props 回调将选择的图片传回父组件
  - 处理加载状态和空状态
  - 移动端适配

  **Execution Record**:
  - 组件已创建：`src/components/home/ShowcasePicker.tsx`
  - 包含：下拉选择框、随机按钮、props 回调、状态管理

  **Acceptance Criteria**:
  - [x] 组件文件创建成功
  - [x] 从 API 获取数据
  - [x] 下拉菜单显示橱窗名称
```

### 2. 修复 TODO 2 - 状态回滚为待执行

**修复前**:
```markdown
- [x] 2. 集成到 AboutSection.astro  # ← 已标记完成，但实际未执行
```

**修复后**:
```markdown
- [ ] 2. 集成到 AboutSection.astro

  **Execution Record**:
  - 待执行：修改 AboutSection.astro 集成 ShowcasePicker
```

### 3. 增强 QA Scenarios - 具体性和路径分类

**修复前**:
```markdown
Scenario: 下拉选择橱窗
  Tool: playwright
  Preconditions: 页面加载完成
  Steps:
    1. 打开主页 http://localhost:4321/
    ...
  Expected Result: 图片变为选择的橱窗图片
```

**修复后**:
```markdown
**Happy Path - 下拉选择橱窗**:
  - Tool: playwright
  - Selector: `select[name="showcase-select"]`
  - Preconditions: 
    - 开发服务器运行 (`npm run dev`)
    - API `/api/showcases` 返回非空数据
  - Steps:
    1. 打开主页 http://localhost:4321/
    2. 滚动到 About 区域 (`#about-section`)
    3. 等待下拉选择框加载完成
    4. 点击下拉选择框
    5. 选择第二个选项
    6. 等待 500ms 过渡动画
  - Assertion: `src="[data-showcase-image]"` 属性值应改变
  - Evidence: `.sisyphus/evidence/task-5-dropdown-select-success.png`
```

---

## 验证结果

| 检查项 | 修复前 | 修复后 |
|--------|--------|--------|
| TODO 1 状态与 AC 一致 | ❌ AC 未勾选 | ✅ 两者一致 |
| TODO 2 状态与 AC 一致 | ❌ 已完成但 AC 未验证 | ✅ 待执行状态 |
| 无 post-execution 叙事 | ❌ 有"实现了以下功能" | ✅ 已移除 |
| QA 包含 selector | ❌ 无 | ✅ 有 |
| QA 包含 assertion | ❌ 无 | ✅ 有 |
| QA 包含 evidence path | ❌ 无 | ✅ 有 |
| 区分 happy/failure path | ❌ 无 | ✅ 有 |

---

## 结论

计划文档已修复：
1. TODO 状态现在与 Acceptance Criteria 一致
2. 移除了 post-execution 叙事
3. QA Scenarios 包含完整的 selector、assertion、evidence path
4. 添加了 happy path 和 failure path 场景