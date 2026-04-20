# Task 12 证据文档命名规范

**任务**: 定义证据快照文档的命名规则  
**日期**: 2026-04-16  
**依赖**: Task 7 (命名模板)

---

## 1. 命名模板

### 1.1 标准格式

```
evidence-<主题>-<类型>.md
```

### 1.2 组成规则

| 组成部分 | 规则 | 示例 |
|----------|------|------|
| `evidence-` | 固定前缀，小写 | evidence- |
| `<主题>` | 2-4个字符或全小写单词，描述主要内容 | timeline, showcase, admin-login |
| `<类型>` | 标准化后缀，描述文档性质 | snapshot-dom, snapshot-api, analysis |

---

## 2. 类型后缀对照表

### 2.1 快照类

| 类型 | 后缀 | 适用场景 |
|------|------|----------|
| DOM 快照 | `-snapshot-dom` | 页面HTML渲染输出 |
| API 响应 | `-snapshot-api` | JSON API响应体 |
| 数据快照 | `-snapshot-data` | 结构化数据文件 |
| 配置快照 | `-snapshot-config` | 配置文件内容 |

### 2.2 分析类

| 类型 | 后缀 | 适用场景 |
|------|------|----------|
| 分析报告 | `-analysis` | 调研、分析结论 |
| 问题清单 | `-issues` | 发现的问题列表 |
| 对比表 | `-comparison` | 多版本对比 |
| 验证结果 | `-verification` | 测试/验证结果 |

### 2.3 记录类

| 类型 | 后缀 | 适用场景 |
|------|------|----------|
| 决策记录 | `-decisions` | 架构/设计决策 |
| 学习笔记 | `-learnings` | 过程中的学习 |
| 问题记录 | `-problems` | 遇到的困难和解决方案 |

---

## 3. 主题词规范

### 3.1 常用主题词

| 主题 | 含义 | 适用证据 |
|------|------|----------|
| timeline | 时间线页面 | 时间线相关快照 |
| showcase | 橱窗页面 | 服装展示相关 |
| admin-login | 登录页面 | 登录流程相关 |
| admin-dashboard | 仪表板页面 | 仪表板相关 |
| r2 | R2存储 | 文件API相关 |
| dynamics | 动态页面 | B站动态相关 |

### 3.2 任务专用主题词

对于任务证据，使用 `task-<数字>-<描述>` 格式：

```
evidence-task-1-boundary-check.md      # Task 1 边界检查
evidence-task-2-naming-mismatch.md   # Task 2 命名不一致
evidence-task-5-showcase-qa.md        # Task 5 橱窗QA相关
```

---

## 4. 禁止规则

### 4.1 禁止的命名模式

以下命名方式禁止用于证据文档：

| 禁止类型 | 错误示例 | 原因 |
|----------|----------|------|
| 计划式命名 | `task-7-snapshot-migration-plan.md` | "plan"暗示是计划而非证据 |
| 功能式命名 | `admin-improvements.md` | 看起来像待办事项 |
| 文档式命名 | `guidelines.md` | 看起来像规范文档 |
| 空主题 | `evidence-test.md` | 主题词不明确 |

### 4.2 正确vs错误对照

| 错误 | 正确 | 说明 |
|------|------|------|
| evidence-task-7-plan.md | evidence-task-7-reference-safety.md | 避免"plan" |
| evidence-admin-feature.md | evidence-admin-login-snapshot-dom.md | 明确类型 |
| evidence-notes.md | evidence-task-3-learnings.md | 关联具体任务 |

---

## 5. 与计划文档的交叉引用

### 5.1 引用格式

证据文档中引用计划时：

```markdown
# 引用计划
本证据基于 [project-plan-remediation] 任务执行过程中采集。

# 引用其他证据
相关证据: [task-7-snapshot-migration-plan]
```

### 5.2 引用规则

| 引用场景 | 格式 | 示例 |
|----------|------|------|
| 引用计划 | `[计划名]` | `[project-plan-remediation]` |
| 引用任务证据 | `[task-N-名称]` | `[task-7-snapshot-migration-plan]` |
| 引用根级快照 | `[snapshot-名称]` | `[timeline-page]` |

### 5.3 禁止交叉引用

- 禁止在证据中引用自己
- 禁止创建循环引用（A引用B，B引用A）
- 禁止引用不存在的计划或证据

---

## 6. 命名检查清单

创建新证据文档时检查：

- [ ] 符合 `evidence-<主题>-<类型>.md` 格式
- [ ] 主题词不是泛化的通用词（如"test"、"notes"）
- [ ] 类型后缀来自预定义列表
- [ ] 不包含 "plan"、"todo"、"feature" 等计划类词汇
- [ ] 与现有证据文档不重名
- [ ] 路径在 `.sisyphus/evidence/` 目录下

---

## 7. 现有文档重命名示例

根据Task 7的迁移计划，根级快照文档应重命名：

| 原文件名 | 新文件名 | 理由 |
|----------|----------|------|
| timeline-page.md | evidence-timeline-snapshot-dom.md | 标准化前缀+类型 |
| showcase-page.md | evidence-showcase-snapshot-dom.md | 标准化前缀+类型 |
| r2-files-api.md | evidence-r2-snapshot-api.md | 标准化前缀+类型 |
| admin-login.md | evidence-admin-login-snapshot-dom.md | 明确登录状态 |
| admin-after-login.md | evidence-admin-dashboard-snapshot-dom.md | 明确页面性质 |

> 注: `admin-dashboard.md` 实际是登录页面，已在Task 2识别并修正为 `admin-login-filled`
