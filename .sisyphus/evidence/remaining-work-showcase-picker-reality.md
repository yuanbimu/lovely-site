# Showcase Picker 现状对齐结论

## 结论摘要

- `ShowcasePicker.tsx` 已创建并实际接入主页 About 区域。
- 图片切换逻辑并不是直接写在 `AboutSection.astro`，而是通过 `AboutImageBox.tsx` 中的 React state 完成。
- 旧计划 `showcase-picker.md` 中第 2、3 项仍标记为未完成，但代码现实显示：**核心功能已落地，计划状态落后于实现状态**。
- 当前仍存在一个真实缺口：`AboutSection.astro` 的初始图片仍来自 `config.json`，尚未完全统一到 D1 / `/api/showcases`。

---

## 代码现实

### 1. 组件创建已完成

文件：`src/components/home/ShowcasePicker.tsx`

已实现：
- 从 `/api/showcases` 拉取数据
- 按 `sort_order` 排序
- 默认选中第一项
- 支持下拉切换
- 支持随机按钮
- 支持 loading / empty state

### 2. 实际接入路径已完成

旧计划写的是“集成到 `AboutSection.astro`”，但真实实现为：

- `AboutSection.astro` 渲染 `AboutImageBox`
- `AboutImageBox.tsx` 内部引入 `ShowcasePicker`
- `ShowcasePicker` 通过 `onSelect` 回调修改当前图片

因此，真实接入链路是：

`AboutSection.astro` → `AboutImageBox.tsx` → `ShowcasePicker.tsx`

### 3. 已落地行为

- 用户可在 About 区域下方使用下拉菜单选择橱窗
- 用户可点击“随机”按钮切换橱窗图
- 当前图片通过 React state 即时更新

---

## 与旧计划的差异

### 旧计划未同步完成状态

归档计划：`.sisyphus/archive/plans/showcase-picker.md`

其中：
- TODO 1 已勾选
- TODO 2 未勾选
- TODO 3 未勾选

但从代码现实看：
- TODO 2 的核心目标（接入 About 区域并实现图片替换）已完成
- TODO 3 没有保留自动化验证证据，因而“功能验证记录”未完成，但不能因此否认功能本身已落地

---

## 当前真实缺口

### 初始图仍依赖旧静态数据源

文件：`src/components/home/AboutSection.astro`

当前仍有：
- 导入 `src/data/config.json`
- 使用第一张静态 `showcase` 图片作为初始图

这意味着：
- 橱窗切换功能运行时走 D1
- 初始展示图仍走旧静态配置

因此该功能当前属于：

**已完成主要交互功能，但数据源统一未完成。**

---

## 建议归档结论

- 不需要恢复旧计划继续执行。
- 应将旧计划视为：
  - **功能已落地**
  - **计划状态未同步**
  - **剩余问题转入数据源统一整改，而非 Showcase Picker 功能开发本身**

## 建议后续动作

1. 将 `AboutSection.astro` 的初始图改为来自 D1 / `/api/showcases`
2. 不再把 `config.json` 作为橱窗初始数据源
3. 若需要结案，可新增一份简短结案记录，而不是恢复旧计划打勾
