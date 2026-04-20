# 主页 AboutSection 橱窗选择功能

## TL;DR

> **快速 Summary**: 在主页 AboutSection 添加橱窗选择功能 - 两个按钮（选择橱窗、随机展示），下拉菜单选择，选择后替换原图片显示

> **Deliverables**: 
> - src/components/home/ShowcasePicker.tsx - 交互式橱窗选择组件
> - AboutSection.astro 更新 - 集成选择器

> **Estimated Effort**: 短
> **Parallel Execution**: NO - 顺序任务
> **Critical Path**: 创建组件 → 集成到页面

---

## Context

### Original Request
给主页 about 研究一下，增加按键可以选择橱窗和随机一个橱窗

### Interview Summary
**Key Discussions**:
- 目标位置: 主页 AboutSection（关于区域）
- 选择方式: 下拉菜单
- 展示方式: 替换原图（替换 aboutImage）
- 按钮位置: 图片下方
- 随机行为: 每次点击随机换一个橱窗

**Research Findings**:
- `/api/showcases` API 已存在于 `functions/api/[[route]].ts`
- 数据来源: D1 数据库
- 返回格式: `{ success: true, data: Showcase[] }`
- Showcase 类型: id, name, description, folder, image_url, sort_order

---

## Work Objectives

### Core Objective
在主页 AboutSection 添加两个按钮，允许用户选择或随机展示橱窗图片

### Concrete Deliverables
- `src/components/home/ShowcasePicker.tsx` - 交互式橱窗选择组件
- 修改 `AboutSection.astro` 集成选择器

### Definition of Done
- [ ] 下拉菜单显示所有橱窗选项
- [ ] 选择橱窗后替换原图片
- [ ] 随机按钮每次点击随机换一个橱窗
- [ ] 加载状态和空状态正确处理
- [ ] 移动端响应式适配

### Must Have
- 从 `/api/showcases` 获取数据
- 下拉选择框 + 随机按钮
- 图片替换功能

### Must NOT Have
- 不修改 D1 数据库
- 不创建新 API 端点
- 不修改 ShowcaseList 组件

---

## Verification Strategy

### QA Policy
每个任务包含 agent-executed QA scenarios

---

## Execution Strategy

### Wave 1 (顺序执行)
1. 创建 ShowcasePicker.tsx 组件
2. 集成到 AboutSection.astro
3. 测试验证

---

## TODOs

- [x] 1. 创建 ShowcasePicker.tsx 组件

  **What to do**:
  - 创建 `src/components/home/ShowcasePicker.tsx`
  - 使用 `/api/showcases` 获取橱窗数据
  - 实现下拉选择框和随机按钮
  - 通过 props 回调将选择的图片传回父组件
  - 处理加载状态和空状态
  - 移动端适配

  **Must NOT do**:
  - 不创建新的 API 端点
  - 不修改数据库
  - 不做管理员功能

  **Execution Record**:
  - 组件已创建：`src/components/home/ShowcasePicker.tsx`
  - 包含：下拉选择框、随机按钮、props 回调、状态管理

  **Acceptance Criteria**:
  - [x] 组件文件创建成功
  - [x] 从 API 获取数据
  - [x] 下拉菜单显示橱窗名称

  **Recommended Agent Profile**:
  > **Category**: visual-engineering
    - Reason: 交互式 UI 组件，需要处理用户输入和状态
  > **Skills**: [`playwright`]
    - `playwright`: 验证按钮交互和下拉菜单功能

  **References**:
  - `src/components/ShowcaseList.tsx` - 现有的橱窗列表组件，使用相同的 API 获取数据
  - `src/components/home/AboutSection.astro` - 需要集成的目标组件

- [ ] 2. 集成到 AboutSection.astro

  **What to do**:
  - 修改 `src/components/home/AboutSection.astro`
  - 导入 ShowcasePicker 组件
  - 添加按钮区域（图片下方）
  - 使用 `client:load` 指令
  - 实现图片替换逻辑（通过 state 管理当前图片）

  **Must NOT do**:
  - 不破坏现有的 AboutSection 布局
  - 不影响其他功能

  **Execution Record**:
  - 待执行：修改 AboutSection.astro 集成 ShowcasePicker

  **Recommended Agent Profile**:
  > **Category**: visual-engineering
    - Reason: 需要修改 Astro 组件并保持样式一致性

  **References**:
  - `src/components/home/AboutSection.astro` - 当前实现
  - `src/components/home/ShowcasePicker.tsx` - 新创建的组件

  **Acceptance Criteria**:
  - [ ] 页面正常加载
  - [ ] 两个按钮显示在图片下方
  - [ ] 下拉菜单可选择
  - [ ] 随机按钮可点击
  - [ ] 选择后图片替换

- [ ] 3. 功能验证

  **What to do**:
  - 使用 Playwright 验证功能
  - 测试下拉选择
  - 测试随机按钮
  - 测试图片替换
  - 验证空状态处理

  **Must NOT do**:
  - 不修改生产环境数据
  - 不破坏现有功能

  **Execution Record**:
  - 待执行：Playwright 自动化测试

  **QA Scenarios**:

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
  - Assertion: `[data-showcase-image]` 元素的 `src` 属性值应改变
  - Evidence: `.sisyphus/evidence/task-5-dropdown-select-success.png`

  **Happy Path - 随机按钮**:
  - Tool: playwright
  - Selector: `button[data-testid="random-showcase-btn"]`
  - Preconditions: 
    - 开发服务器运行 (`npm run dev`)
  - Steps:
    1. 打开主页 http://localhost:4321/
    2. 滚动到 About 区域
    3. 记录当前图片 URL
    4. 点击随机按钮 3 次
    5. 每次点击后记录图片 URL
  - Assertion: 至少 2 次点击后图片 URL 发生变化
  - Evidence: `.sisyphus/evidence/task-5-random-button-success.png`

  **Failure Path - 空数据处理**:
  - Tool: playwright
  - Selector: `select[name="showcase-select"]`
  - Preconditions: 
    - 拦截 API `/api/showcases` 返回 `{"success":true,"data":[]}`
  - Steps:
    1. 打开主页 http://localhost:4321/
    2. 滚动到 About 区域
    3. 检查按钮是否显示
  - Assertion: 按钮区域仍可见，下拉菜单显示"暂无橱窗"或禁用状态
  - Evidence: `.sisyphus/evidence/task-5-empty-state-failure.png`

  **Failure Path - 网络错误处理**:
  - Tool: playwright
  - Preconditions: 
    - 拦截 API `/api/showcases` 返回 500 错误
  - Steps:
    1. 打开主页 http://localhost:4321/
    2. 滚动到 About 区域
    3. 检查加载状态
  - Assertion: 显示错误提示或重试按钮
  - Evidence: `.sisyphus/evidence/task-5-network-error-failure.png`

  **Evidence**: .sisyphus/evidence/task-5-{scenario-slug}.{ext}

---

## Success Criteria

### Verification Commands
```bash
# 启动开发服务器
npm run dev

# 验证页面加载
curl -s http://localhost:4321/ | grep -q "about-section"

# 验证 API 可访问
curl -s http://localhost:4321/api/showcases | grep -q "success"
```

### Final Checklist
- [ ] 下拉选择功能正常
- [ ] 随机按钮功能正常
- [ ] 图片替换正常
- [ ] 样式与现有区域一致
- [ ] 移动端适配正常
