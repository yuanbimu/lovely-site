# 🚀 Wrangler 配置和 D1 数据库激活指南

> **状态**: ✅ Wrangler 已安装 (v4.72.0)
> **下一步**: 需要登录 Cloudflare 并创建数据库

---

## 📋 当前状态

| 项目 | 状态 | 说明 |
|------|------|------|
| Wrangler CLI | ✅ 已安装 | v4.72.0 |
| Cloudflare 登录 | ⚠️ 未登录 | 需要执行 `wrangler login` |
| D1 数据库（本地） | ⏳ 待创建 | 登录后自动创建 |
| D1 数据库（生产） | ⏳ 待创建 | 需要登录 Cloudflare |
| 数据库初始化 | ⏳ 待执行 | SQL 脚本已准备好 |

---

## 🔐 第一步：登录 Cloudflare（必需）

**为什么需要登录？**
- D1 数据库需要 Cloudflare API 访问权限
- 生产环境部署需要认证
- 本地开发也需要基础认证

**登录方法（三选一）**:

### 方法一：浏览器登录（推荐）

```bash
wrangler login
```

执行后会：
1. 自动打开浏览器
2. 登录你的 Cloudflare 账号
3. 授权 Wrangler 访问
4. 自动返回终端完成认证

### 方法二：API Token 登录

1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 创建新 Token → 选择 "Edit Cloudflare Workers" 模板
3. 复制 Token
4. 执行：
   ```bash
   wrangler login --api-token
   # 粘贴你的 Token
   ```

### 方法三：检查登录状态

```bash
wrangler whoami
```

成功登录后会显示你的账号信息。

---

## 🗄️ 第二步：创建 D1 数据库

**登录后执行**:

### 本地开发数据库

```bash
cd lovely-site
wrangler d1 create lovely-site-db
```

成功后会显示：
```
✅ Successfully created database 'lovely-site-db'
{
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**记下这个 UUID**，然后更新 `wrangler.toml`。

### 生产数据库

```bash
wrangler d1 create lovely-site-db --location=enam
```

生产数据库 UUID 会不同，也需要记录。

---

## ⚙️ 第三步：更新 wrangler.toml

打开 `wrangler.toml`，替换数据库 ID：

**修改前**:
```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "YOUR_DATABASE_ID"  # ← 替换这里
```

**修改后**:
```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← 你的 UUID
```

**本地开发配置** (`.dev.vars`):
```toml
# 添加本地数据库 ID
D1_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 📥 第四步：初始化数据库

### 本地环境

```bash
# 方法一：使用 npm 脚本
npm run init:db:windows

# 方法二：手动执行
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
```

### 生产环境

```bash
# 方法一：使用 npm 脚本
npm run init:db:prod

# 方法二：手动执行
wrangler d1 execute lovely-site-db --file=scripts/init-db.sql
```

**成功后会显示**:
```
✅ Successfully executed SQL
```

---

## ✅ 第五步：验证

### 检查数据库列表

```bash
wrangler d1 list
```

应该看到 `lovely-site-db`。

### 检查表结构

```bash
wrangler d1 execute lovely-site-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

应该看到：
- dynamics
- user_info
- live_status
- timeline_events

### 检查初始数据

```bash
wrangler d1 execute lovely-site-db --local --command="SELECT * FROM timeline_events;"
```

应该看到 4 条初始事件数据。

---

## 🎯 快速激活（一键脚本）

创建一个 `setup.bat` 文件：

```batch
@echo off
echo ===================================
echo Wrangler D1 数据库配置向导
echo ===================================
echo.

echo 步骤 1: 登录 Cloudflare
echo 请在新窗口中完成认证...
wrangler login

echo.
echo 步骤 2: 检查登录状态
wrangler whoami

echo.
echo 步骤 3: 创建数据库
wrangler d1 create lovely-site-db

echo.
echo 步骤 4: 查看数据库信息
echo 请复制显示的 UUID，然后更新 wrangler.toml
pause

echo.
echo 步骤 5: 初始化数据库
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql

echo.
echo 步骤 6: 验证
wrangler d1 list

echo.
echo ===================================
echo 配置完成！
echo 现在可以运行：npm run dev:cf
echo ===================================
pause
```

---

## 🐛 故障排查

### Q1: wrangler login 失败

**错误**: `Network error`

**解决**:
```bash
# 检查网络连接
ping dash.cloudflare.com

# 使用代理（如果有）
set HTTPS_PROXY=http://your-proxy:port
wrangler login
```

### Q2: 创建数据库失败

**错误**: `Account ID not found`

**原因**: 未登录或登录过期

**解决**:
```bash
wrangler logout
wrangler login
```

### Q3: SQL 执行失败

**错误**: `table already exists`

**原因**: 数据库已经初始化过

**解决**: 这是正常的，表会跳过创建（使用 IF NOT EXISTS）。

**错误**: `no such table`

**原因**: 数据库未正确初始化

**解决**:
```bash
# 检查 SQL 文件是否存在
dir scripts\init-db.sql

# 重新执行
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
```

---

## 📞 需要人工协助的步骤

以下操作**必须**手动完成：

1. **Cloudflare 登录** - 需要浏览器授权
2. **更新 wrangler.toml** - 复制 UUID 到配置文件
3. **生产环境配置** - 在 Cloudflare Dashboard 设置环境变量

---

## 🎉 完成后的状态

- ✅ Wrangler v4.72.0 已安装
- ✅ Cloudflare 账号已登录
- ✅ D1 数据库已创建（本地 + 生产）
- ✅ 数据库表已初始化
- ✅ 初始 Timeline 数据已导入
- ✅ 可以启动开发服务器

---

**下一步**: 执行 `wrangler login` 开始配置流程！
