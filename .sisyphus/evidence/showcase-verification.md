# ShowcaseList 验证证据

## 验证时间
2026-04-21T09:57 UTC

## 验证目标
验证 /showcase/ 页面按 folder 显示图片、model-1 自动轮播、悬停暂停、空目录橱窗不报错

## 证据文件

### 1. 网络请求日志
- `/api/showcases` → 200 OK
- `/api/r2-files?recursive=true` → 200 OK  
- `https://cdn.yuanbimu.top/showcase/model-1/a.jpg` → [FAILED] **404 Not Found**
- `https://cdn.yuanbimu.top/showcase/model-2/c.jpg` → [FAILED] **404 Not Found**

### 2. API 返回数据
```json
{
  "success": true,
  "data": {
    "files": [
      { "key": "showcase/model-1/a.jpg", "url": "https://cdn.yuanbimu.top/showcase/model-1/a.jpg" },
      { "key": "showcase/model-1/b.jpg", "url": "https://cdn.yuanbimu.top/showcase/model-1/b.jpg" },
      { "key": "showcase/model-2/.folder", "url": "https://cdn.yuanbimu.top/showcase/model-2/.folder" },
      { "key": "showcase/model-2/c.jpg", "url": "https://cdn.yuanbimu.top/showcase/model-2/c.jpg" },
      { "key": "showcase/model-empty/.folder", "url": "https://cdn.yuanbimu.top/showcase/model-empty/.folder" }
    ]
  }
}
```

### 3. Component 过滤逻辑验证
- `.folder` 文件被正则 `/\.(jpg|jpeg|png|gif|webp)$/i` 正确过滤
- 目录解析正确：`showcase/model-1/xxx.jpg` → `model-1`

### 4. 页面渲染状态
- 3 个橱窗卡片渲染成功
- model-1: 显示占位符 🖼️（因 CDN 404）
- model-2: 显示占位符 🖼️（因 CDN 404）
- model-empty: 显示占位符 🖼️（正确，无图片）
- 无 JS 错误

## 根本原因

**图片文件不存在于 R2 存储桶中**
- API 返回的 CDN URL 是正确的 (`https://cdn.yuanbimu.top/showcase/model-1/a.jpg`)
- 但访问这些 URL 返回 404 Not Found
- 可能是本地开发环境的 R2 模拟器没有这些图片文件
- 或生产 R2 桶中也没有这些图片

## 结论

| 验证项 | 状态 |
|--------|------|
| 页面显示真实图片 | ❌ FAIL - CDN 404 |
| model-1 自动轮播 | ⚠️ N/A - 无图片可轮播 |
| 悬停暂停 | ⚠️ N/A - 无图片可测试 |
| model-2 过滤 .folder | ✅ PASS - 逻辑正确 |
| model-empty 空态 | ✅ PASS - 显示占位符 |

**总结**: 功能逻辑正确，但图片资源缺失导致无法完全验证轮播功能。