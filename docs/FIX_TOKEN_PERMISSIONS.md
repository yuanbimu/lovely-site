# 🔧 API Token 权限问题

当前 Token 无法创建 D1 数据库，需要更多权限。

## 解决方案

### 方式 1: 使用完整权限 Token（推荐）

重新创建一个 Token，确保包含以下权限：

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 **"Create Token"**
3. 选择 **"Edit Cloudflare Workers"** 模板
4. 点击 **"Use template"**
5. **关键步骤** - 在 "Zone Resources" 下方，确保选择：
   - ✅ **All accounts**（不是特定账户）
6. 在 "Permissions" 中添加：
   - ✅ **Account - Account Settings - Edit**
   - ✅ **Account - Cloudflare Pages - Edit**
   - ✅ **Account - D1 - Edit**
   - ✅ **Workers Scripts - Edit**
7. 点击 **"Continue to summary"**
8. 点击 **"Create Token"**
9. 复制新 Token

### 方式 2: 使用管理员 Token

如果方式 1 还不行，使用账户管理员权限：

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 **"Create Token"**
3. 这次选择 **"Create Custom Token"**
4. 权限设置：
   - **Account** → **Account Settings** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Workers and Pages** → **Workers Scripts** → **Edit**
5. 创建并复制 Token

---

## 使用新 Token

获取新 Token 后运行：

```bash
setx CLOUDFLARE_API_TOKEN "新 Token"
```

然后**重启终端**，再次执行：

```bash
cd lovely-site
wrangler d1 create lovely-site-db --location=enam
```
