# B站动态同步问题记录

## 问题描述

GitHub Actions 自动同步 B站动态失败，错误信息：
```
❌ 获取动态失败: API 返回错误：request was banned (code: -412)
```

## 原因分析

**`-412` 错误 = 请求被封禁**

GitHub Actions 的 IP 地址被 B站风控拉黑。B站对自动化请求有严格限制。

## 已完成的修改

### 1. 禁用 GitHub Actions 自动同步

文件：`.github/workflows/sync-dynamics.yml`

```yaml
name: Sync Bilibili Dynamics

on:
  # 已禁用自动同步 (B站 -412 风控封禁 GitHub Actions IP)
  # schedule:
  #   - cron: '*/30 * * * *'
  workflow_dispatch:
    # 允许手动触发
```

### 2. 增强错误处理

文件：`scripts/sync-dynamics.js`

- 添加 30 秒超时机制
- 检测 HTML 响应（风控拦截）
- 识别常见错误码（-352 风控, -101 未登录）

---

## 现有工具

### Python 脚本（推荐）

位置：`tools/getdym/getDynamics.py`

**优势：**
- 使用 `bilibili_api` 库（社区维护）
- TLS 指纹模拟真实浏览器（`impersonate: "chrome131"`）
- 指数退避重试机制
- 断点续传支持
- 已有 Cookie 配置：`tools/getdym/config.json`

**运行方式：**
```bash
cd tools/getdym
python getDynamics.py
```

**输出：**
- `result.json` - 动态数据
- `pics/` - 下载的图片

---

## 待处理：上传方案

用户选择 **方案 B：D1 数据库 + R2 图片**

### 当前架构

| 组件 | 存储位置 | API 读取 |
|-----|---------|---------|
| 动态元数据 | D1 数据库 | `functions/api/dynamics.ts` |
| 图片 | R2 存储桶 | R2 公开 URL |

### 需要的脚本

将 `tools/getdym/result.json` 的数据上传到：
1. **D1 数据库** - 动态元数据
2. **R2 存储桶** - 图片文件

### D1 数据库结构

```sql
CREATE TABLE dynamics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT,
  images TEXT,           -- JSON 数组
  local_images TEXT,     -- R2 路径 JSON 数组
  author TEXT,
  publish_time INTEGER,
  likes INTEGER,
  comments INTEGER,
  reposts INTEGER,
  created_at INTEGER,
  updated_at INTEGER
);
```

### R2 存储桶配置

```toml
# wrangler.toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "lovely-site-images"
```

---

## 下一步

1. **创建上传脚本**：把 `result.json` 转换格式并写入 D1 + 上传图片到 R2
2. **或者改用纯 R2**：JSON 文件直接存 R2，简化流程（不需要维护 D1）

---

## 相关文件

| 文件 | 用途 |
|-----|------|2
| `tools/getdym/getDynamics.py` | Python 抓取脚本 |
| `tools/getdym/config.json` | Cookie 配置 |
| `tools/getdym/result.json` | 抓取结果 |
| `scripts/sync-dynamics.js` | JS 同步脚本（已增强错误处理） |
| `scripts/upload-to-r2.py` | 上传到 R2 的脚本（需修改） |
| `functions/api/dynamics.ts` | 动态 API |
| `functions/lib/db.ts` | 数据库操作 |
| `d1-schema.sql` | D1 表结构 |

---

## 注意事项

- `SESSDATA` Cookie 会过期，需要定期更新
- B站风控严格，本地脚本比 GitHub Actions 更稳定
- Python 脚本的反风控机制更完善