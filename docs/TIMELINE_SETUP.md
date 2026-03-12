# Timeline 功能实现完成

## 📋 功能概述

为 Timeline 页面添加了完整的数据管理功能：
- ✅ 数据导入（支持 JSON 批量导入）
- ✅ 权限控制（Token 认证）
- ✅ D1 数据库存储
- ✅ 管理后台界面
- ✅ 公开页面展示

---

## 🗄️ 数据库设置

### 1. 创建/更新 D1 数据库

运行以下命令创建表结构：

```bash
# 本地开发
wrangler d1 execute lovely-site-db --local --file=d1-schema.sql

# 生产环境
wrangler d1 execute lovely-site-db --file=d1-schema.sql
```

或者在 Cloudflare Dashboard 中手动执行 `d1-schema.sql` 中的 SQL 语句。

### 2. 数据表结构

```sql
CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,              -- 事件 ID（UUID）
  date TEXT NOT NULL,               -- 事件日期（YYYY-MM-DD）
  title TEXT NOT NULL,              -- 事件标题
  content TEXT,                     -- 事件详细描述
  color TEXT DEFAULT 'blue',        -- 颜色主题：blue/green/purple/red
  icon TEXT DEFAULT 'mdi-star',     -- 图标
  sort_order INTEGER DEFAULT 0,     -- 排序顺序（数字小的在前）
  created_at INTEGER NOT NULL,      -- 本地创建时间戳
  updated_at INTEGER NOT NULL       -- 本地更新时间戳
);
```

---

## 🔐 配置管理 Token

### 1. 生成 Token

```bash
# 生成一个随机 token（示例）
openssl rand -hex 32
# 输出示例：a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 2. 设置环境变量

**本地开发** (`wrangler.toml` 或 `.dev.vars`):

```toml
# wrangler.toml
[vars]
ADMIN_TOKEN = "你的 token 在这里"
```

或创建 `.dev.vars` 文件：
```
ADMIN_TOKEN=你的 token 在这里
```

**生产环境** (Cloudflare Dashboard):
1. 进入 Pages → 选择项目 → Settings
2. Environment Variables → Production
3. 添加变量：`ADMIN_TOKEN`
4. 值：你的 token
5. 点击 Save

---

## 📥 导入数据

### 方法一：管理后台（推荐）

1. 访问 `/admin/timeline`
2. 输入 Token 登录
3. 在导入区域粘贴 JSON 数据
4. 点击"导入数据"

JSON 格式示例：
```json
[
  {
    "date": "2020-04-26",
    "title": "在 B 站发表第一条动态",
    "content": "",
    "color": "blue",
    "icon": "⭐"
  },
  {
    "date": "2020-04-28",
    "title": "投稿第一个视频，展示了自己的立绘",
    "content": "",
    "color": "blue",
    "icon": "▶️"
  }
]
```

### 方法二：直接调用 API

```bash
# 导入单条数据
curl -X POST http://localhost:8788/api/timeline \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2020-04-26",
    "title": "在 B 站发表第一条动态",
    "content": "",
    "color": "blue",
    "icon": "⭐"
  }'

# 批量导入
curl -X POST http://localhost:8788/api/timeline/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "date": "2020-04-26",
        "title": "在 B 站发表第一条动态",
        "color": "blue"
      },
      {
        "date": "2020-04-28",
        "title": "投稿第一个视频",
        "color": "blue"
      }
    ]
  }'
```

---

## 🎨 颜色主题

支持以下颜色主题：
- `blue` - 蓝色（默认）
- `green` - 绿色
- `purple` - 紫色
- `red` - 红色

---

## 📱 API 端点

### 公开端点（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/timeline` | 获取所有事件 |
| GET | `/api/timeline/:id` | 获取单个事件 |

### 受保护端点（需要认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/timeline` | 创建/更新单个事件 |
| POST | `/api/timeline/bulk` | 批量导入事件 |
| DELETE | `/api/timeline/:id` | 删除事件 |

**认证方式**:
```
Authorization: Bearer YOUR_TOKEN
```

---

## 🛠️ 管理后台

**访问地址**: `/admin/timeline`

**功能**:
- 🔐 Token 认证登录
- 📥 JSON 数据批量导入
- 📝 事件列表查看
- ✏️ 在线编辑事件
- 🗑️ 删除事件
- 🔄 实时刷新

---

## 🚀 本地测试

1. **启动开发服务器**:
```bash
npm run dev:cf
```

2. **访问页面**:
- 公开展示页：http://localhost:4321/timeline
- 管理后台：http://localhost:4321/admin/timeline
- API 端点：http://localhost:8788/api/timeline

3. **导入测试数据**:
访问管理后台，使用以下示例数据测试：
```json
[
  {
    "date": "2020-04-26",
    "title": "在 B 站发表第一条动态",
    "content": "",
    "color": "blue",
    "icon": "⭐"
  },
  {
    "date": "2020-04-28",
    "title": "投稿第一个视频，展示了自己的立绘",
    "content": "",
    "color": "blue",
    "icon": "▶️"
  },
  {
    "date": "2020-04-29",
    "title": "投稿自我介绍视频",
    "content": "在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源",
    "color": "green",
    "icon": "🎤"
  }
]
```

---

## 📂 文件清单

### 新增文件
- `functions/api/timeline.ts` - Timeline API 端点
- `src/components/TimelineAdmin.tsx` - 管理后台 React 组件
- `src/components/TimelineAdmin.css` - 管理后台样式
- `src/pages/admin/timeline.astro` - 管理后台页面

### 修改文件
- `d1-schema.sql` - 添加 timeline_events 表
- `functions/lib/db.ts` - 添加 timeline 数据库操作函数
- `src/pages/timeline.astro` - 改为从 API 获取数据

---

## ⚠️ 注意事项

1. **Token 安全**:
   - 不要将 Token 提交到代码仓库
   - 生产环境只在 Cloudflare Dashboard 设置
   - 定期更换 Token

2. **数据备份**:
   - 定期导出 D1 数据备份
   - 使用 `wrangler d1 export` 命令

3. **性能优化**:
   - API 已设置 10 分钟缓存
   - 大量数据建议分批导入

4. **错误处理**:
   - 如果 API 获取失败，页面会显示默认的示例数据
   - 检查控制台日志排查问题

---

## 🔧 故障排查

### 问题：管理后台无法登录
**原因**: Token 未配置或配置错误
**解决**: 检查 `ADMIN_TOKEN` 环境变量是否正确设置

### 问题：Timeline 页面显示"加载失败"
**原因**: API 端点不可用或 D1 数据库未正确配置
**解决**: 
1. 检查 D1 数据库是否已创建表
2. 检查 `wrangler.toml` 中数据库绑定
3. 查看控制台错误日志

### 问题：导入数据时报错
**原因**: JSON 格式错误或必填字段缺失
**解决**: 确保 JSON 格式正确，必填字段 `date` 和 `title` 必须存在

---

## 📞 下一步

1. 设置生产环境的 `ADMIN_TOKEN`
2. 在 D1 生产数据库执行表结构
3. 导入现有数据
4. 测试公开展示页

---

**完成时间**: 2026-03-12
**技术栈**: Astro 5 + React 19 + Cloudflare D1 + Hono
