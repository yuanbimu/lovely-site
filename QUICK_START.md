# 🚀 快速配置 - 3 步完成

## 前提条件

✅ 已获取 Cloudflare API Token  
访问：https://dash.cloudflare.com/profile/api-tokens

---

## 快速开始

### 1️⃣ 配置 Token

```bash
cd C:\Users\Cashier\Desktop\reLovelyProject\lovely-site
scripts\complete-setup.bat 你的 Token
```

### 2️⃣ 重启终端

关闭所有窗口，重新打开。

### 3️⃣ 启动开发

```bash
cd C:\Users\Cashier\Desktop\reLovelyProject\lovely-site
npm run dev:cf
```

---

## 访问地址

- **Timeline**: http://localhost:4321/timeline
- **管理后台**: http://localhost:4321/admin/timeline

---

## 成功标志

✅ `wrangler whoami` 显示账号信息  
✅ `wrangler d1 list` 显示数据库  
✅ Timeline 页面正常显示  
✅ 管理后台可以登录

---

## 遇到问题？

查看 `docs/COMPLETE_SETUP_GUIDE.md` 获取详细故障排查指南。
