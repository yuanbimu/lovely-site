# Showcase Diagnosis 开放问题收敛结论

## 总结

归档草稿：`.sisyphus/archive/drafts/showcase-diagnosis.md` 中列出的橱窗问题，现已可分为三类：

1. **已确认成立且仍需处理**
2. **已通过现状调查确认，不再属于待确认问题**
3. **已过时或严重性需要下调**

---

## 逐项结论

### 问题 1：无数据迁移脚本 - `config.json` 数据未导入 D1

结论：**已不再是待确认问题，但其历史背景成立。**

原因：
- 当前线上 D1 `showcases` 已有完整数据。
- 橱窗前台与后台主流程已从 D1 读取。
- 但 `AboutSection.astro` 仍残留 `config.json` 初始图依赖，说明数据源统一没有彻底完成。

现状判断：
- “D1 是否有数据” → 已确认有数据
- “是否彻底摆脱 `config.json`” → 尚未完成

后续动作：
- 将 `AboutSection.astro` 初始图切到 D1 / `/api/showcases`

---

### 问题 2：字段名不匹配 - `image` vs `image_url`

结论：**问题真实存在，但范围已收敛。**

原因：
- `config.json` 使用 `image`
- D1 `showcases` 使用 `image_url`
- 当前前台橱窗组件主要走 D1，不再直接消费 `config.json` 的橱窗主数据
- 但 `AboutSection.astro` 仍通过 `config.json` + `getShowcaseImageUrl()` 生成初始图

现状判断：
- 字段不匹配仍然是旧静态源残留的一部分
- 不再是“迁移脚本阻塞问题”，而是“最后一个静态残留未清理”

---

### 问题 3：API 自动填充 `folder` 逻辑会触发额外 UPDATE

结论：**成立，但严重性下调为中/低。**

代码位置：`functions/api/[[route]].ts:245`

原因：
- `GET /api/showcases` 首次读到 `folder` 为空时，会执行补写 `folder = id`
- 这属于运行时迁移逻辑

现状判断：
- 不是前台功能阻塞问题
- 是后端实现上的“读操作带写副作用”问题
- 应在后续重构时挪到明确的迁移脚本或后台修复任务中

---

### 问题 4：无数据库 schema 文件

结论：**已处理。**

当前已新增：`docs/database-schema.md`

因此该问题可关闭。

---

### 问题 5：`sort_order` 全为 0 时排序不稳定

结论：**当前未见明确证据表明这是线上阻塞问题。**

原因：
- 当前 `ShowcasePicker.tsx` 会按 `sort_order` 排序
- `showcases` 线上数据已有 `model-1` 到 `model-32` 的顺序信息
- 未见现有证据表明当前线上 `sort_order` 全为 0

现状判断：
- 保留为“低优先级数据健康检查项”
- 不再作为当前主要阻塞问题

---

## 原草稿中的待确认项收敛

### `D1 数据库中是否有数据？`

结论：**已确认有数据。**

### `API 请求是否报错？`

结论：**`/api/showcases` 主链路未见错误证据。**

### `前端是否加载失败？`

结论：**未发现 Showcase 主功能加载失败，主要缺口在数据源统一。**

### `具体问题表现是什么？`

结论：**当前真实问题不是“橱窗不可用”，而是“橱窗主流程与首页初始图使用了两套数据源”。**

---

## 最终结论

`showcase-diagnosis` 不需要继续作为开放调查草稿保留。它的主要价值已经转化为：

- 一个已确认的遗留缺口：`AboutSection.astro` 仍依赖 `config.json`
- 一个次要后端实现问题：`GET /api/showcases` 含运行时补写副作用
- 一个已解决问题：数据库 schema 文档已补齐

建议：
- 将这份草稿视为**已收敛**
- 后续不再围绕“橱窗是否有数据”调查，而直接进入数据源统一整改
