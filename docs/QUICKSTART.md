# 🚀 快速开始指南

> 5 分钟完成本地开发环境配置

---

## 前置要求

确保已安装以下工具：

- [Node.js](https://nodejs.org/) (v18.0+)
- [npm](https://www.npmjs.com/) (v8.0+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare 命令行工具)

安装 Wrangler:
```bash
npm install -g wrangler
```

---

## 一、安装依赖

```bash
cd lovely-site
npm install
```

---

## 二、初始化数据库

### Windows 用户

```bash
npm run init:db:windows
```

### Mac/Linux 用户

```bash
npm run init:db
```

**这会做什么？**
- ✅ 创建 D1 数据库表结构
- ✅ 导入初始 Timeline 数据（东爱璃早期事件）
- ✅ 配置数据库绑定

---

## 三、启动开发服务器

```bash
npm run dev:cf
```

等待看到：
```
⚡️ Server listening on http://localhost:8788
```

**开发服务器包含：**
- 🌐 本地页面服务 (http://localhost:4321)
- 🔧 边缘函数模拟 (http://localhost:8788)
- 📊 实时热重载

---

## 四、访问网站

### 公开页面

| 页面 | 地址 | 说明 |
|------|------|------|
| 首页 | http://localhost:4321 | 网站主页 |
| Timeline | http://localhost:4321/timeline | 时间线展示 |
| 关于 | http://localhost:4321/about | 关于页面 |

### 管理后台

**地址**: http://localhost:4321/admin/timeline

**登录 Token**: 已配置在 `.dev.vars` 文件中

打开文件查看：
```bash
# Windows
type .dev.vars

# Mac/Linux
cat .dev.vars
```

Token 示例：
```
ADMIN_TOKEN=timeline_admin_2026_a1b2c3d4e5f6g7h8i9j0
```

---

## 五、测试导入功能

1. 访问管理后台
2. 输入 Token 登录
3. 在导入区域粘贴以下 JSON：

```json
[
  {
    "date": "2024-01-01",
    "title": "新年特别直播",
    "content": "东爱璃进行了 3 小时的新年特别直播",
    "color": "red",
    "icon": "🎉"
  },
  {
    "date": "2024-02-14",
    "title": "情人节纪念",
    "content": "发布了新曲《情人节的巧克力》",
    "color": "pink",
    "icon": "💝"
  }
]
```

4. 点击"导入数据"
5. 刷新 Timeline 页面查看效果

---

## 常用命令

```bash
# 开发
npm run dev          # 仅 Astro 开发服务器
npm run dev:cf       # Astro + 边缘函数（推荐）

# 数据库
npm run init:db      # 初始化本地数据库
npm run init:db:prod # 初始化生产数据库

# 数据同步
npm run fetch-data   # 获取 B 站数据
npm run sync-dynamics # 同步动态数据

# 构建
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

---

## 故障排查

### 问题：`wrangler: command not found`

**解决**:
```bash
npm install -g wrangler
```

如果仍然报错，检查 npm 全局 bin 目录是否在 PATH 中。

---

### 问题：数据库初始化失败

**错误信息**: `D1 database not found`

**解决**:
1. 检查 `wrangler.toml` 中的数据库配置
2. 确认 Wrangler 已正确安装
3. 尝试手动创建数据库：
   ```bash
   wrangler d1 create lovely-site-db
   ```

---

### 问题：管理后台无法登录

**原因**: Token 不匹配

**解决**:
1. 打开 `.dev.vars` 文件
2. 复制 `ADMIN_TOKEN` 的值
3. 在登录页面粘贴

---

### 问题：页面显示"加载失败"

**原因**: API 服务未启动

**解决**:
确保使用 `npm run dev:cf` 启动（不是 `npm run dev`）

边缘函数只在 `dev:cf` 命令下运行。

---

## 下一步

完成本地配置后：

1.  自定义 Timeline 数据
2. 📝 添加更多事件
3.  部署到 Cloudflare Pages
4. 🔐 设置生产环境 Token

---

## 需要帮助？

- 📖 查看完整文档：`docs/` 目录
- 🐛 遇到问题：检查 README.zh-CN.md
- 💬 其他问题：联系开发团队

---

**开发愉快！🎉**
