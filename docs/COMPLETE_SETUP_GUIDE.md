# ✅ Cloudflare 配置完整指南

> 状态：脚本已准备好，按步骤执行即可

---

## 🎯 快速开始（3 步完成）

### 第 1 步：获取 API Token

**访问**: https://dash.cloudflare.com/profile/api-tokens

**操作**:
1. 登录 Cloudflare 账号
2. 点击 **"Create Token"**
3. 选择 **"Edit Cloudflare Workers"** → **"Use template"**
4. **"Continue to summary"** → **"Create Token"**
5. **复制 Token**（格式：`a1b2c3d4e5f6...`）

---

### 第 2 步：配置 Token

**Windows 用户**:
```bash
cd C:\Users\Cashier\Desktop\reLovelyProject\lovely-site

# 方式 A: 使用脚本（推荐）
scripts\configure-cloudflare.bat 你的 Token

# 方式 B: 手动设置
setx CLOUDFLARE_API_TOKEN "你的 Token"
```

**重要**: 设置后环境变量不会立即生效！

---

### 第 3 步：重启终端

**必须执行**:
1. 关闭所有终端窗口
2. 关闭 VSCode
3. 重新打开 VSCode/终端

---

### 第 4 步：验证并完成

重启后执行：

```bash
cd C:\Users\Cashier\Desktop\reLovelyProject\lovely-site

# 验证登录
wrangler whoami

# 创建数据库
wrangler d1 create lovely-site-db --location=enam

# 复制显示的 UUID，然后更新 wrangler.toml
# database_id = "你的 UUID"

# 初始化数据库
npm run init:db:windows

# 启动开发
npm run dev:cf
```

---

## 🔧 完整流程（含验证）

### 0. 准备工作

```bash
cd lovely-site
```

---

### 1. 获取 Token

浏览器访问：https://dash.cloudflare.com/profile/api-tokens

Token 示例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### 2. 设置环境变量

```bash
# 方式 1: 使用配置脚本
scripts\configure-cloudflare.bat a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# 方式 2: 手动
setx CLOUDFLARE_API_TOKEN "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

### 3. 重启终端

关闭所有窗口，重新打开。

---

### 4. 验证登录

```bash
wrangler whoami
```

✅ 成功输出：
```
 ⛅️  wrangler 4.72.0
───────────────────
Getting User settings...
✨  Account: Your Account Name
✨  Email: your@email.com
```

❌ 失败输出（需要重新获取 Token）：
```
[ERROR] A request to the Cloudflare API (/user/tokens/verify) failed.
```

---

### 5. 创建 D1 数据库

```bash
wrangler d1 create lovely-site-db --location=enam
```

✅ 成功输出：
```
✅ Successfully created database 'lovely-site-db'
{
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**重要**: 复制 `uuid` 字段！

---

### 6. 更新 wrangler.toml

打开 `wrangler.toml`，找到：

```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "YOUR_DATABASE_ID"
```

改为：

```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 你的 UUID
```

---

### 7. 初始化数据库

```bash
npm run init:db:windows
```

或手动执行：

```bash
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
```

✅ 成功输出：
```
✅ Successfully executed SQL
```

---

### 8. 验证数据库

```bash
# 查看数据库列表
wrangler d1 list

# 查看表结构
wrangler d1 execute lovely-site-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 查看初始数据
wrangler d1 execute lovely-site-db --local --command="SELECT * FROM timeline_events LIMIT 5;"
```

---

### 9. 启动开发服务器

```bash
npm run dev:cf
```

访问：
- **Timeline**: http://localhost:4321/timeline
- **管理后台**: http://localhost:4321/admin/timeline

---

## 🐛 故障排查

### 问题 1: wrangler whoami 失败

**错误**: `Invalid request headers`

**原因**: Token 无效或已过期

**解决**:
1. 重新获取 Token
2. 确保复制完整（没有多余空格）
3. 重新设置环境变量并重启终端

---

### 问题 2: 创建数据库失败

**错误**: `Account ID not found`

**原因**: 未正确登录

**解决**:
```bash
wrangler logout
wrangler login
```

---

### 问题 3: SQL 执行失败

**错误**: `no such table`

**原因**: 初始化脚本未正确执行

**解决**:
```bash
# 检查 SQL 文件
dir scripts\init-db.sql

# 手动执行
wrangler d1 execute lovely-site-db --local --file=scripts/init-db.sql
```

---

### 问题 4: wrangler.toml 未更新

**症状**: 开发服务器启动失败，报错 `database_id not found`

**解决**: 手动打开 `wrangler.toml`，将 UUID 改为第 5 步创建的数据库 UUID。

---

## 📞 需要帮助？

如果遇到其他问题：

1. **检查日志**:
   ```bash
   type %APPDATA%\xdg.config\.wrangler\logs\wrangler-*.log
   ```

2. **重新配置**:
   ```bash
   wrangler logout
   wrangler login
   ```

3. **查看文档**:
   - `docs/RENEW_API_TOKEN.md` - Token 配置指南
   - `docs/WRANGLER_SETUP.md` - 完整设置指南
   - `docs/QUICKSTART.md` - 快速开始

---

## ✅ 完成检查清单

- [ ] 获取了新的 API Token
- [ ] 设置了 `CLOUDFLARE_API_TOKEN` 环境变量
- [ ] 重启了终端
- [ ] `wrangler whoami` 显示账号信息
- [ ] 创建了 D1 数据库（有 UUID）
- [ ] 更新了 `wrangler.toml` 的 `database_id`
- [ ] 执行了 `npm run init:db:windows`
- [ ] `npm run dev:cf` 启动成功
- [ ] 可以访问 Timeline 页面

---

**下一步**: 获取 Token 并执行 `scripts\configure-cloudflare.bat 你的 Token`！
