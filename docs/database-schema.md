# 数据库结构文档

## 说明

- 本文档基于 `functions/lib/db.ts` 中的真实读写代码整理。
- `sessions` 表字段已通过线上 D1 `PRAGMA table_info` 验证。
- 其余表字段以当前代码契约为准，用于维护与后续重构参考。
- 当前项目未保留可直接读取的建表 SQL 文件，因此本文档应视为“代码驱动的数据库结构说明”。

---

## 1. `users`

用途：后台用户账户。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | 用户唯一 ID |
| `username` | `TEXT` | 登录用户名 |
| `email` | `TEXT` | 邮箱 |
| `password_hash` | `TEXT` | 密码哈希 |
| `role` | `TEXT` | 角色：`admin` / `editor` / `viewer` |
| `created_at` | `INTEGER` | 创建时间戳 |
| `updated_at` | `INTEGER` | 更新时间戳 |

代码依据：`functions/lib/db.ts:168`, `functions/lib/db.ts:187`, `functions/lib/db.ts:252`

---

## 2. `sessions`

用途：后台登录会话。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | Session Token，主键 |
| `user_id` | `TEXT` | 关联用户 ID |
| `expires_at` | `INTEGER` | 过期时间戳 |
| `created_at` | `INTEGER` | 创建时间戳 |

线上验证：已通过 `PRAGMA table_info(sessions)` 验证。  
代码依据：`functions/lib/db.ts:178`, `functions/lib/db.ts:218`

---

## 3. `timeline_events`

用途：时间线事件展示与后台编辑。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | 事件唯一 ID |
| `date` | `TEXT` | 日期字符串 |
| `title` | `TEXT` | 标题 |
| `content` | `TEXT` | 内容，可为空 |
| `color` | `TEXT` | 颜色标识，由标签系统自动分配 |
| `icon` | `TEXT` | 图标标识，由标签系统自动分配 |
| `tag` | `TEXT` | 标签名称，如「首播」「歌回」等 |
| `sort_order` | `INTEGER` | 排序值，默认 `0` |
| `created_at` | `INTEGER` | 创建时间戳 |
| `updated_at` | `INTEGER` | 更新时间戳 |

> 标签系统：前端用户只需选择标签名（如「首播」），系统通过 `TIMELINE_TAG_MAP` 自动映射为对应的 `color` + `icon`，同时标签名存入 `tag` 字段。

代码依据：`functions/lib/db.ts:107`, `functions/lib/db.ts:118`, `functions/lib/db.ts:149`

---

## 4. `songs`

用途：歌单页面与后台歌曲管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | 歌曲唯一 ID |
| `title` | `TEXT` | 歌名 |
| `artist` | `TEXT` | 艺术家名 |
| `cover_url` | `TEXT` | 封面图 URL，可为空 |
| `url` | `TEXT` | 外链，可为空 |
| `release_date` | `TEXT` | 发布时间或日期字符串，可为空 |
| `tag` | `TEXT` | 标签，如「中文」「日文」「翻唱」「原创」等，可为空 |
| `created_at` | `INTEGER` | 创建时间戳 |
| `updated_at` | `INTEGER` | 更新时间戳 |

代码依据：`functions/lib/db.ts:267`, `functions/lib/db.ts:286`

---

## 5. `showcases`

用途：橱窗展示、首页橱窗选择器、后台橱窗管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | 橱窗唯一 ID，例如 `model-1` |
| `name` | `TEXT` | 橱窗名称 |
| `description` | `TEXT` | 描述，可为空 |
| `folder` | `TEXT` | 对应 R2/目录名，可为空 |
| `image_url` | `TEXT` | 主图 URL，可为空 |
| `sort_order` | `INTEGER` | 排序值，默认 `0` |
| `created_at` | `INTEGER` | 创建时间戳 |
| `updated_at` | `INTEGER` | 更新时间戳 |

代码依据：`functions/lib/db.ts:306`, `functions/lib/db.ts:325`

---

## 6. `live_status`

用途：缓存直播状态，前台 `LiveStatus` 组件读取 `/api/live` 时可作为回退。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `INTEGER` / 固定值 | 当前实现固定写入 `1` |
| `is_live` | `INTEGER` | 直播状态，`1` 为直播中，`0` 为未开播 |
| `title` | `TEXT` | 直播标题，可为空 |
| `room_id` | `TEXT` | 直播间 ID，可为空 |
| `url` | `TEXT` | 直播间 URL，可为空 |
| `checked_at` | `INTEGER` | 最近检查时间戳 |

代码依据：`functions/lib/db.ts:65`, `functions/lib/db.ts:72`, `functions/lib/db.ts:83`

---

## 7. `user_info`

用途：键值形式保存额外用户信息或配置。

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | `TEXT` | 键名 |
| `value` | `TEXT` | JSON 序列化值 |
| `updated_at` | `INTEGER` | 更新时间戳 |

代码依据：`functions/lib/db.ts:50`, `functions/lib/db.ts:57`

---

## 8. `dynamics`

用途：原设计用于存储 B 站动态，但当前功能已暂时下线，且同步脚本尚未真正写入 D1。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `TEXT` | 动态唯一 ID |
| `type` | `TEXT` | 动态类型 |
| `content` | `TEXT` | 动态正文 |
| `images` | `TEXT` | 远程图片数组，JSON 字符串 |
| `local_images` | `TEXT` | 本地图片数组，JSON 字符串 |
| `author` | `TEXT` | 作者名 |
| `publish_time` | `INTEGER` | 发布时间戳 |
| `likes` | `INTEGER` | 点赞数 |
| `comments` | `INTEGER` | 评论数 |
| `reposts` | `INTEGER` | 转发数 |
| `created_at` | `INTEGER` | 创建时间戳 |
| `updated_at` | `INTEGER` | 更新时间戳 |

代码依据：`functions/lib/db.ts:8`, `functions/lib/db.ts:23`, `functions/lib/db.ts:42`

---

## 当前状态备注

- `showcases`、`songs`、`timeline_events`、`users`、`sessions` 已实际用于线上 D1。
- `live_status` 现已接入 D1 作为缓存/回退数据源。
- `dynamics` 表结构仍保留，但功能已先从前台移除，后续若重新接入需补齐写入链路。
