# Task 12 证据文档元数据标准

**任务**: 定义证据快照文档的最小元数据要求  
**日期**: 2026-04-16  
**依赖**: Task 2, Task 7

---

## 1. 元数据字段定义

### 1.1 必填字段（最低要求）

所有证据文档必须在文件顶部包含以下元数据：

```markdown
---
来源: <string>
采集方式: <string>
采集时间: <string>
用途说明: <string>
---
```

### 1.2 字段详细定义

| 字段 | 含义 | 填写要求 | 示例 |
|------|------|----------|------|
| **来源** | 数据/页面的原始出处 | 具体URL或系统名称 | `https://lovely.yuanbimu.top/timeline` |
| **采集方式** | 如何获取该证据 | 工具或方法名称 | `Playwright DOM Snapshot` |
| **采集时间** | 采集时的环境/时间戳 | ISO 8601格式或描述 | `2026-04-16T10:30:00+08:00` |
| **用途说明** | 该证据用于证明什么 | 简要说明 | `验证时间线页面结构完整性` |

### 1.3 可选扩展字段

根据需要可添加以下字段：

| 字段 | 含义 | 示例 |
|------|------|------|
| 关联任务 | 对应的Task编号 | `Task 1, Task 2` |
| 环境变量 | 采集时的关键配置 | `NODE_ENV=production` |
| 备注 | 其他补充说明 | `登录状态: admin123已填写` |

---

## 2. 完整元数据示例

```markdown
---
来源: https://lovely.yuanbimu.top/showcase
采集方式: Playwright DOM Snapshot
采集时间: 2026-04-16T14:22:00+08:00
用途说明: 验证橱窗页面包含32套服装的完整列表
关联任务: Task 5
环境变量: production build
备注: 页面加载完成后截图，登录状态为未登录
---

# 证据内容...
```

---

## 3. 合规性检查

### 3.1 验证规则

- [ ] 文件头部包含 YAML front matter
- [ ] 必填字段全部填写，无空值
- [ ] 来源字段为有效URL或可识别来源
- [ ] 采集时间格式清晰可解析

### 3.2 禁止模式

- ❌ 无元数据头部的证据文档
- [ ] 必填字段缺失任何一项
- [ ] 来源字段填写"无"或"未知"
- [ ] 用途说明过于模糊（如"待定"、"备用"）

---

## 4. 现有证据文档合规性

| 文档 | 状态 | 备注 |
|------|------|------|
| task-1-boundary-check.md | 需补充元数据 | Task 1 证据 |
| task-1-classification-matrix.md | 需补充元数据 | Task 1 证据 |
| task-2-naming-mismatch.md | 需补充元数据 | Task 2 证据 |
| task-2-root-inventory.md | 需补充元数据 | Task 2 证据 |
| task-3-anti-patterns.md | 需补充元数据 | Task 3 证据 |
| task-3-quality-gates.md | 需补充元数据 | Task 3 证据 |
| task-4-risk-boundary.md | 需补充元数据 | Task 4 证据 |
| task-4-rollback-template.md | 需补充元数据 | Task 4 证据 |
| task-5-showcase-qa-specificity.md | 需补充元数据 | Task 5 证据 |
| task-5-showcase-state-consistency.md | 需补充元数据 | Task 5 证据 |
| task-6-admin-plan-compliance.md | 需补充元数据 | Task 6 证据 |
| task-6-admin-risk-controls.md | 需补充元数据 | Task 6 证据 |
| task-7-reference-safety.md | 需补充元数据 | Task 7 证据 |
| task-7-snapshot-migration-plan.md | 需补充元数据 | Task 7 证据 |
| task-8_status_counterexamples.md | 需补充元数据 | Task 8 证据 |
| task-8_status_semantics.md | 需补充元数据 | Task 8 证据 |

> 注: 现有证据文档需要补充元数据头部，可作为后续清理任务的一部分

---

## 5. 与计划文档的关联

证据文档与计划文档的关系：

1. **证据从属于计划**: 每个计划任务执行过程中产生的快照作为证据
2. **元数据关联**: 通过"关联任务"字段指向对应的计划任务
3. **引用格式**: 证据中引用计划时使用 `[计划名]` 格式

详细引用规则见 `task-12-evidence-naming.md`
