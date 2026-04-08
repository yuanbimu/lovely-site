# 数据库 Schema 文档

本文档描述東愛璃 Lovely 应援站使用的 D1 数据库表结构。

---

## 目录

1. [dynamics - B站动态数据](#dynamics---b站动态数据)
2. [user_info - 用户信息键值对](#user_info---用户信息键值对)
3. [live_status - 直播状态](#live_status---直播状态)
4. [timeline_events - 时间线事件](#timeline_events---时间线事件)
5. [users - 用户账户](#users---用户账户)
6. [sessions - 用户会话](#sessions---用户会话)
7. [songs - 歌曲数据](#songs---歌曲数据)
8. [showcases - 橱窗展示数据](#showcases---橱窗展示数据)

---

## dynamics - B站动态数据

存储从 Bilibili 获取的动态帖子数据。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 动态唯一标识符 |
| type | TEXT | 动态类型（如转发、图文、视频等） |
| content | TEXT | 动态文本内容 |
| images | TEXT | 图片列表，JSON 数组格式 |
| local_images | TEXT | 本地化图片列表，JSON 数组格式 |
| author | TEXT | 发布者名称 |
| publish_time | INTEGER | 发布时间戳（毫秒） |
| likes | INTEGER | 点赞数 |
| comments | INTEGER | 评论数 |
| reposts | INTEGER | 转发数 |
| created_at | INTEGER | 记录创建时间戳 |
| updated_at | INTEGER | 记录更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `saveDynamic(db, dynamic)` | 保存或更新动态数据 |
| `getDynamics(db, limit, offset)` | 分页获取动态列表，按发布时间倒序 |

---

## user_info - 用户信息键值对

存储站点配置和用户偏好等键值对数据。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| key | TEXT | 键名，唯一标识 |
| value | TEXT | 值，JSON 格式存储任意数据 |
| updated_at | INTEGER | 更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `saveUserInfo(db, key, value)` | 保存或更新键值对 |
| `getUserInfo(db, key)` | 根据键名获取值 |

---

## live_status - 直播状态

存储东爱璃 Lovely 的直播状态信息。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | INTEGER | 主键，固定值为 1 |
| is_live | INTEGER | 是否正在直播（0 或 1） |
| title | TEXT | 直播间标题 |
| room_id | TEXT | 直播间 ID |
| url | TEXT | 直播间链接 |
| checked_at | INTEGER | 最后检查时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `saveLiveStatus(db, status)` | 保存或更新直播状态 |
| `getLiveStatus(db)` | 获取当前直播状态 |

---

## timeline_events - 时间线事件

存储时间线页面的事件数据。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 事件唯一标识符 |
| date | TEXT | 事件日期（YYYY-MM-DD 格式） |
| title | TEXT | 事件标题 |
| content | TEXT | 事件详细描述 |
| color | TEXT | 主题颜色（默认 blue） |
| icon | TEXT | 图标名称（默认 mdi:star） |
| sort_order | INTEGER | 排序权重 |
| created_at | INTEGER | 记录创建时间戳 |
| updated_at | INTEGER | 记录更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `saveTimelineEvent(db, event)` | 保存或更新时间线事件 |
| `getTimelineEvents(db)` | 获取所有时间线事件，按日期倒序、sort_order 升序 |
| `deleteTimelineEvent(db, id)` | 删除指定事件 |
| `bulkSaveTimelineEvents(db, events)` | 批量导入时间线事件（事务） |

---

## users - 用户账户

存储用户账户信息，用于后台管理认证。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 用户唯一标识符 |
| username | TEXT | 用户名，唯一 |
| email | TEXT | 邮箱地址 |
| password_hash | TEXT | 密码哈希值 |
| role | TEXT | 角色（admin / editor / viewer） |
| created_at | INTEGER | 账户创建时间戳 |
| updated_at | INTEGER | 账户更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `createUser(db, user)` | 创建新用户账户 |
| `getUserByUsername(db, username)` | 根据用户名查询用户 |
| `getUserById(db, id)` | 根据 ID 查询用户 |
| `getUsers(db)` | 获取所有用户列表（不含密码哈希） |
| `updateUserPassword(db, userId, newPasswordHash)` | 更新用户密码 |
| `updateUserRole(db, userId, role)` | 更新用户角色 |
| `deleteUser(db, userId)` | 删除用户及其关联会话 |

---

## sessions - 用户会话

存储用户登录会话信息，用于保持登录状态。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 会话唯一标识符 |
| user_id | TEXT | 关联的用户 ID |
| expires_at | INTEGER | 会话过期时间戳 |
| created_at | INTEGER | 会话创建时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `createSession(db, session)` | 创建新会话 |
| `getSessionById(db, id)` | 获取会话（自动检查过期） |
| `deleteSession(db, id)` | 删除指定会话 |
| `deleteExpiredSessions(db)` | 清理所有过期会话 |

---

## songs - 歌曲数据

存储东爱璃翻唱或演唱的歌曲信息。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 歌曲唯一标识符 |
| title | TEXT | 歌曲标题 |
| artist | TEXT | 艺术家（默认東愛璃 Lovely） |
| cover_url | TEXT | 封面图片链接 |
| url | TEXT | 歌曲播放链接 |
| release_date | TEXT | 发布时间（YYYY-MM-DD 格式） |
| created_at | INTEGER | 记录创建时间戳 |
| updated_at | INTEGER | 记录更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `getSongs(db)` | 获取所有歌曲列表，按发布倒序 |
| `saveSong(db, song)` | 保存或更新歌曲信息 |
| `deleteSong(db, id)` | 删除指定歌曲 |

---

## showcases - 橱窗展示数据

存储 32 套服装或造型展示的元数据。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 展示项唯一标识符 |
| name | TEXT | 展示名称 |
| description | TEXT | 展示描述 |
| folder | TEXT | 图片文件夹路径 |
| image_url | TEXT | 预览图链接 |
| sort_order | INTEGER | 排序权重 |
| created_at | INTEGER | 记录创建时间戳 |
| updated_at | INTEGER | 记录更新时间戳 |

### CRUD 函数

| 函数 | 说明 |
|------|------|
| `getShowcases(db)` | 获取所有展示项，按 sort_order 升序 |
| `saveShowcase(db, showcase)` | 保存或更新展示项 |
| `deleteShowcase(db, id)` | 删除指定展示项 |

---

## 数据类型说明

| 类型 | 说明 |
|------|------|
| TEXT | 文本字符串 |
| INTEGER | 整数（时间戳存储为毫秒） |
| JSON | 通过 TEXT 字段存储，代码中序列化为 JSON 字符串 |

---

## 使用示例

```typescript
import { getLiveStatus, saveLiveStatus } from 'functions/lib/db';

app.get('/api/live', async (c) => {
  const status = await getLiveStatus(c.env.DB);
  return c.json(status);
});

app.post('/api/live', async (c) => {
  const body = await c.req.json();
  await saveLiveStatus(c.env.DB, body);
  return c.json({ success: true });
});
```
