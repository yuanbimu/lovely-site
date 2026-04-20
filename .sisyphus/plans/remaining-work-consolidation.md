# 剩余工作汇总计划

## TL;DR

> **快速Summary**: 汇总所有旧计划与草稿中的未完成事项，建立唯一活跃计划，收敛后续工作入口。
>
> **交付成果**:
> - `docs/database-schema.md` 数据库结构文档
> - `showcase-picker` 现状与计划状态对齐
> - `showcase-diagnosis` 中未确认问题的处理结论
> - 旧计划归档后的索引说明
>
> **预计工作**: 中
> **并行执行**: YES
> **关键路径**: 盘点未完成项 → 补齐数据库文档 → 更新 showcase 计划状态 → 收敛诊断结论

---

## Context

### 来源
- 旧正式计划已归档：`showcase-picker.md`、`admin-improvements.md`、`project-plan-remediation.md`
- 旧草稿已归档：`project-plan-review.md`、`showcase-diagnosis.md`、`admin-improvements.md`
- 当前需要唯一活跃计划承接剩余工作

### 已确认未完成项
1. `docs/database-schema.md` 尚未创建
2. `showcase-picker` 计划状态与代码现实不完全同步
3. `showcase-diagnosis` 中仍有待确认问题未收敛
4. 旧计划归档后需要一个新的唯一入口

---

## Work Objectives

### Concrete Deliverables
- [ ] 创建 `docs/database-schema.md`
- [ ] 输出 `showcase-picker` 代码现实与计划差异结论
- [ ] 收敛 `showcase-diagnosis` 的待确认问题
- [ ] 建立归档后索引与说明

### Definition of Done
- [ ] 仓库中仅保留本文件作为活跃计划
- [ ] 旧计划与草稿全部迁移到归档目录
- [ ] `docs/database-schema.md` 存在且内容可读
- [ ] 剩余未完成项被明确关闭、执行或重新排期

---

## TODOs

- [ ] 1. 创建数据库结构文档

  **What to do**:
  - 创建 `docs/database-schema.md`
  - 基于现有数据库操作代码整理表结构、字段与用途
  - 不杜撰线上不存在的字段

  **Must NOT do**:
  - 不直接修改数据库
  - 不伪造无法从代码确认的结构

  **Acceptance Criteria**:
  - [ ] `docs/database-schema.md` 文件存在
  - [ ] 至少覆盖 `users`、`timeline_events`、`songs`、`showcases`
  - [ ] 字段说明清晰可读

- [ ] 2. 对齐 showcase-picker 计划状态与代码现实

  **What to do**:
  - 检查 `AboutImageBox.tsx`、`AboutSection.astro`、`ShowcasePicker.tsx`
  - 输出“已完成/未完成/偏离原计划但已落地”的结论
  - 决定是否需要重写为新的功能结案记录

  **Must NOT do**:
  - 不重复创建旧计划
  - 不把代码已完成项继续标记为未完成

  **Acceptance Criteria**:
  - [ ] 组件接入方式有明确结论
  - [ ] 功能验证缺口被明确记录
  - [ ] 原计划与现状差异被说明

- [ ] 3. 收敛橱窗诊断草稿中的开放问题

  **What to do**:
  - 审查 `showcase-diagnosis` 中待确认问题
  - 将可验证项转成结论，将不可验证项明确标注为待外部环境确认

  **Must NOT do**:
  - 不在无线上环境证据时假装问题已解决

  **Acceptance Criteria**:
  - [ ] 每个开放问题都有结论或阻塞说明
  - [ ] 不再保留模糊的“待确认”措辞

- [ ] 4. 补充归档索引说明

  **What to do**:
  - 说明归档目录中的旧计划清单
  - 记录哪些文件为 superseded、哪些为历史草稿

  **Must NOT do**:
  - 不删除 evidence 与 notepads

  **Acceptance Criteria**:
  - [ ] 归档目录有清晰索引说明
  - [ ] 活跃计划入口唯一
