# Task 9 - QA 场景模板（文档任务专用）

> **任务**：为文档任务创建可复用的 QA 场景编写标准
> **日期**：2026-04-16

---

## 概述

本文档定义文档任务的 QA 场景编写标准，包含 **6 个必填字段** 和 **最低覆盖率要求**。适用于代码文档、API 文档、组件文档等各类文档任务的验证场景编写。

---

## QA 场景结构

每个 QA 场景必须包含以下 6 个字段：

### 1. 工具（Tool）

定义执行验证所使用的工具。

**必填值**：
- `read` - 读取文件内容验证
- `grep` - 搜索文件内容验证
- `glob` - 查找文件是否存在
- `lsp_diagnostics` - 检查代码诊断
- `playwright` - 交互式功能验证（仅用于需要浏览器操作的场景）

**格式**：
```markdown
- Tool: <工具名>
```

**示例**：
```markdown
- Tool: grep
```

### 2. 前置条件（Preconditions）

定义执行验证前必须满足的条件。

**要求**：
- 明确说明环境要求
- 明确说明依赖的资源
- 明确说明数据的初始状态

**禁止**：
- ❌ "无"
- ❌ "页面加载完成"
- ❌ "正常情况"

**格式**：
```markdown
- Preconditions:
  - <具体条件1>
  - <具体条件2>
```

**示例**：
```markdown
- Preconditions:
  - 开发服务器运行（npm run dev）
  - 目标文件 src/components/home/AboutSection.astro 存在
  - API /api/showcases 返回非空数据
```

### 3. 步骤（Steps）

定义逐步执行的验证操作。

**要求**：
- 每一步都是可执行的具体操作
- 包含具体的文件路径或选择器
- 步骤之间有逻辑顺序

**禁止**：
- ❌ "检查是否正常"
- ❌ "验证功能正常"
- ❌ "确认输出正确"

**格式**：
```markdown
- Steps:
  1. <具体操作1>
  2. <具体操作2>
  3. <具体操作3>
```

**示例**：
```markdown
- Steps:
  1. 打开主页 http://localhost:4321/
  2. 滚动到 About 区域 (#about-section)
  3. 点击下拉选择框 (select[name="showcase-select"])
  4. 等待 500ms 过渡动画
```

### 4. 断言（Assertions）

定义验证成功的判定条件。

**要求**：
- 必须是可以判断真假的明确条件
- 包含具体的期望值或匹配模式
- 不能使用模糊描述

**禁止**：
- ❌ "检查是否正常"
- ❌ "功能工作正常"
- ❌ "输出正确"

**格式**：
```markdown
- Assertions:
  - <断言条件1>
  - <断言条件2>
```

**示例**：
```markdown
- Assertions:
  - 图片 src 属性包含选择的橱窗 ID
  - 下拉菜单显示的选项数量等于 API 返回数量
  - 随机按钮点击后图片 URL 发生变化
```

### 5. 失败指示（Failure Indicators）

定义验证失败的判定条件，用于失败路径场景。

**要求**：
- 明确说明在什么情况下判定为失败
- 可以与断言条件相反表述

**格式**：
```markdown
- Failure Indicators:
  - <失败条件1>
  - <失败条件2>
```

**示例**：
```markdown
- Failure Indicators:
  - 图片 src 属性未改变
  - 控制台出现未捕获的 JavaScript 错误
  - 页面加载时间超过 3 秒
```

### 6. 证据路径（Evidence Path）

定义验证结果产出的证据文件路径。

**要求**：
- 必须指定具体的文件路径
- 路径前缀为 `.sisyphus/evidence/`
- 文件命名格式：`{task-id}-{scenario-slug}.{ext}`

**格式**：
```markdown
- Evidence Path: .sisyphus/evidence/{task-id}-{scenario-slug}.{ext}
```

**示例**：
```markdown
- Evidence Path: .sisyphus/evidence/task-5-dropdown-select-success.png
```

---

## 场景分类

### Happy Path（成功路径）

验证功能正常工作的场景。

**特征**：
- 预期结果为成功
- 使用正常的输入数据
- 不包含错误条件

**命名格式**：
```markdown
**Happy Path - <场景描述>**
```

### Failure Path（失败路径）

验证功能异常处理的场景。

**特征**：
- 预期结果为失败或错误处理
- 包含异常条件或错误输入
- 验证错误处理逻辑

**命名格式**：
```markdown
**Failure Path - <异常场景>**
```

### Edge Case（边界情况）

验证边界条件处理的场景。

**特征**：
- 验证边界值或极限情况
- 可能成功也可能失败
- 关注边界行为

**命名格式**：
```markdown
**Edge Case - <边界场景>**
```

---

## 禁止模式

以下模式 **禁止使用**：

| 模式 | 错误示例 | 说明 |
|------|----------|------|
| 模糊前置条件 | "页面加载完成" | 应具体说明环境要求 |
| 模糊断言 | "检查是否正常" | 应明确判定条件 |
| 缺少证据路径 | 无 | 必须指定证据文件 |
| 无效工具选择 | 对文档任务使用 playwright | 应使用 read/grep/glob |
| 单一路径 | 只有 happy path | 复杂功能需失败路径 |

---

## 完整示例

### 示例 1：文档任务（使用 Read/grep）

```markdown
**Happy Path - 组件文档存在性验证**:

- Tool: read
- Preconditions:
  - 目标文件 src/components/home/ShowcasePicker.tsx 存在
- Steps:
  1. 读取文件 src/components/home/ShowcasePicker.tsx
  2. 检查文件头部是否存在 JSDoc 注释
  3. 检查是否导出组件
- Assertions:
  - 文件包含 "/**" 开头的 JSDoc 注释
  - 文件包含 "export default" 或 "export" 声明
- Evidence Path: .sisyphus/evidence/task-9-component-docs-existence.md
```

### 示例 2：配置任务（使用 grep）

```markdown
**Happy Path - 配置值验证**:

- Tool: grep
- Preconditions:
  - 配置文件 src/data/site-data.json 存在
- Steps:
  1. 读取配置文件 src/data/site-data.json
  2. 使用 grep 搜索 "bilibili_uid" 字段
- Assertions:
  - 配置文件包含 bilibili_uid 字段
  - 字段值为 "3821157"
- Evidence Path: .sisyphus/evidence/task-9-config-bilibili-uid.md
```

### 示例 3：类型任务（使用 glob）

```markdown
**Happy Path - 类型定义文件存在性**:

- Tool: glob
- Preconditions:
  - 项目根目录存在
- Steps:
  1. 使用 glob 搜索 src/types/*.ts 文件
  2. 检查 index.ts 是否存在
- Assertions:
  - src/types/index.ts 文件存在
  - 文件包含 interface 或 type 定义
- Evidence Path: .sisyphus/evidence/task-9-types-index-exists.md
```

---

## 检查清单

编写 QA 场景时检查以下项目：

- [ ] 包含 Tool 字段，且工具选择正确
- [ ] 包含 Preconditions 字段，无模糊描述
- [ ] 包含 Steps 字段，步骤可执行
- [ ] 包含 Assertions 字段，断言明确
- [ ] 包含 Failure Indicators 字段（仅失败路径）
- [ ] 包含 Evidence Path 字段，路径具体
- [ ] 至少包含 1 个 happy path
- [ ] 复杂功能包含失败路径
- [ ] 无禁止模式中的错误表述

---

## 相关文档

- [task-9-qa-coverage.md](./task-9-qa-coverage.md) - 覆盖率规范
- [task-5-showcase-qa-specificity.md](./task-5-showcase-qa-specificity.md) - QA 具体性增强示例
- [task-3-quality-gates.md](./task-3-quality-gates.md) - 质量门槛