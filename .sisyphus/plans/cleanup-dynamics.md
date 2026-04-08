# 清理 B 站动态相关代码 - 剩余工作

## TL;DR

> 清理项目中剩余的 B 站动态相关代码，保留 dynamics.astro 页面但移除后端逻辑。

**已完成**:
- ✅ 删除 `src/data/dynamics.json`
- ✅ 删除 `scripts/sync-dynamics.js`, `convert-dynamics.py`, `fetch-dynamics.py`
- ✅ 删除 `src/components/DynamicsList.tsx`, `DynamicsList.css`, `DynamicsPreview.astro`
- ✅ 删除 `src/pages/api/dynamics.ts`

**待完成**:
- 修改边缘函数，移除 dynamics API
- 清理 site.config.ts 配置
- 清理导航链接
- 删除 sync-dynamics.yml workflow

---

## 待完成任务

### 1. 修改边缘函数 - 移除 dynamics 路由

**文件**: `functions/api/[[route]].ts`

需要修改：

1. **移除 getDynamics import** (第 3-4 行)
   ```typescript
   // 从:
   import { 
     getDynamics,
     getTimelineEvents,
   
   // 改为:
   import { 
     getTimelineEvents,
   ```

2. **删除 /api/dynamics 路由** (约 406-411 行)
   ```typescript
   app.get('/api/dynamics', async (c) => {
     const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 50);
     const offset = parseInt(c.req.query('offset') || '0', 10);
     const dynamics = await getDynamics(c.env.DB, limit, offset);
     return c.json({ data: dynamics, hasMore: dynamics.length === limit });
   });
   ```

---

### 2. 检查 site.config.ts 配置

**文件**: `src/config/site.config.ts`

检查是否有 dynamics 相关配置，如有则移除。

---

### 3. 检查导航链接

**文件**: 
- `src/components/Navigation.astro`
- `src/components/QuickNav.astro`

检查是否有指向 dynamics 页面的链接，如有需要移除或确认保留。

---

### 4. 删除 sync-dynamics.yml

**文件**: `.github/workflows/sync-dynamics.yml`

此 workflow 已经无用（自动同步已禁用），建议删除。

---

### 5. 检查 types/index.ts

**文件**: `src/types/index.ts`

检查 Dynamics 相关的类型定义是否还被其他代码使用，如无则可清理。

---

## 验证

修改完成后运行：

```bash
npm run build
```

确保构建成功，无 dynamics 相关错误。
