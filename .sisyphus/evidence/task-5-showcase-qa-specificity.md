# Task 5 - QA 场景具体性增强证据

> **任务**: 为 showcase-picker.md QA 场景添加具体性和路径分类
> **日期**: 2026-04-16

---

## 增强内容

### 修复前 QA 场景

```markdown
Scenario: 下拉选择橱窗
  Tool: playwright
  Preconditions: 页面加载完成
  Steps:
    1. 打开主页 http://localhost:4321/
    2. 滚动到 About 区域
    3. 点击下拉选择框
    4. 选择第二个选项
    5. 检查图片是否变化
  Expected Result: 图片变为选择的橱窗图片
```

**问题**:
- 缺少 selector 信息
- Preconditions 过于模糊
- 缺少明确的 assertion
- 缺少 evidence path
- 没有 happy path / failure path 分类

### 修复后 QA 场景

#### Happy Path - 下拉选择橱窗

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

#### Happy Path - 随机按钮

```markdown
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
```

#### Failure Path - 空数据处理

```markdown
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
```

#### Failure Path - 网络错误处理

```markdown
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
```

---

## 增强要点对照

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| Selector | 无 | ✅ `select[name="showcase-select"]` |
| Preconditions | "页面加载完成" | ✅ 具体环境要求 |
| Assertion | 无 | ✅ 明确的断言条件 |
| Evidence Path | 无 | ✅ 具体文件路径 |
| 路径分类 | 无 | ✅ Happy/Failure 区分 |

---

## 符合质量门槛

根据 task-3-quality-gates.md 的要求：

| 检查项 | 状态 |
|--------|------|
| 步骤可执行 | ✅ 详细步骤 |
| 期望结果明确 | ✅ Assertion 清晰 |
| 证据产出 | ✅ 具体路径 |
| Happy Path | ✅ 2 个 |
| Failure Path | ✅ 2 个 |

---

## 结论

QA 场景已增强为符合可执行标准：
1. 包含具体 selector
2. 包含明确的 assertion
3. 包含 evidence path
4. 包含 happy path 和 failure path
5. 满足质量门槛要求