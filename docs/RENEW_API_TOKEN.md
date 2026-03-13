# 🚀 重新配置 Cloudflare API Token

> 当前问题：旧的 API Token 已失效，需要更新

---

## 获取新的 API Token

### 步骤 1: 访问 Cloudflare

打开浏览器，访问：
```
https://dash.cloudflare.com/profile/api-tokens
```

### 步骤 2: 创建新 Token

1. 点击 **"Create Token"** 按钮
2. 选择 **"Edit Cloudflare Workers"** 模板
3. 点击 **"Use template"**

### 步骤 3: 配置权限

确保权限包含：
- ✅ **Account.Cloudflare Pages** - Edit
- ✅ **Account.D1** - Edit
- ✅ **Workers Scripts** - Edit

### 步骤 4: 生成 Token

1. 点击 **"Continue to summary"**
2. 点击 **"Create Token"**
3. **复制显示的 Token**（只显示一次！）

---

## 更新环境变量

### Windows (当前用户)

```bash
setx CLOUDFLARE_API_TOKEN "你的新 Token"
```

### Windows (系统环境变量)

1. 打开"系统属性" → "环境变量"
2. 新建系统变量：
   - 变量名：`CLOUDFLARE_API_TOKEN`
   - 变量值：`你的新 Token`

### Mac/Linux

编辑 `~/.bashrc` 或 `~/.zshrc`：
```bash
export CLOUDFLARE_API_TOKEN="你的新 Token"
```

---

## 重启终端

环境变量更新后，**需要重启终端**才能生效。

关闭所有终端窗口，重新打开。

---

## 验证

```bash
wrangler whoami
```

应该显示：
```
✅  Account: Your Account Name
✅  Email: your@email.com
```

---

## 创建数据库

```bash
cd lovely-site
wrangler d1 create lovely-site-db --location=enam
```

复制显示的 UUID。

---

## 更新 wrangler.toml

打开 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "lovely-site-db"
database_id = "你的 UUID"  # ← 替换这里
```

---

## 初始化数据库

```bash
npm run init:db:windows
```

---

## 完成！

```bash
npm run dev:cf
```

访问：
- http://localhost:4321/timeline
- http://localhost:4321/admin/timeline

---

## 备用方案

如果不想用 API Token，可以删除环境变量后使用浏览器登录：

```bash
# 删除环境变量
setx CLOUDFLARE_API_TOKEN ""

# 重启终端
# ...

# 浏览器登录
wrangler logout
wrangler login
```

---

**下一步**: 获取新 Token 并更新环境变量！
