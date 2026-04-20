# Task 7 快照文档迁移计划

**任务**: 为6个根级快照文档设计迁移方案  
**日期**: 2026-04-16

---

## 1. 文档分类总览

| 原文件名 | 类型 | 内容摘要 | 迁移操作 |
|---------|------|----------|----------|
| timeline-page.md | DOM 快照 | 时间线页面，含4条事件 | **迁移** → evidence目录 |
| showcase-page.md | DOM 快照 | 橱窗页面，32套服装 | **迁移** → evidence目录 |
| r2-files-api.md | API 响应 | R2文件API JSON | **迁移** → evidence目录 |
| admin-after-login.md | DOM 快照 | 登录后仪表板 | **迁移** → evidence目录 |
| admin-dashboard.md | DOM 快照 | 登录页面（命名错误） | **重命名+迁移** |
| admin-login.md | DOM 快照 | 登录页面 | **迁移** → evidence目录 |

---

## 2. 命名规范定义

### 2.1 证据文件命名模板
```
evidence-<主题>-<类型>.md
```

**组成规则**:
- `evidence-` 前缀固定
- `<主题>`: 简短主题词（2-4个字母或全小写）
- `<类型>`: snapshot-dom / snapshot-api / snapshot-data 等

### 2.2 类型后缀对照

| 类型 | 后缀 | 说明 |
|------|------|------|
| DOM 快照 | `-snapshot-dom` | 页面HTML渲染输出 |
| API 响应 | `-snapshot-api` | JSON API响应体 |
| 数据快照 | `-snapshot-data` | 结构化数据文件 |
| 配置快照 | `-snapshot-config` | 配置文件内容 |

### 2.3 主题词规范

| 原文件 | 主题词 | 新文件名 |
|--------|--------|----------|
| timeline-page.md | timeline | evidence-timeline-snapshot-dom.md |
| showcase-page.md | showcase | evidence-showcase-snapshot-dom.md |
| r2-files-api.md | r2-api | evidence-r2-snapshot-api.md |
| admin-after-login.md | admin-dashboard | evidence-admin-dashboard-snapshot-dom.md |
| admin-dashboard.md | admin-login-filled | evidence-admin-login-filled-snapshot-dom.md |
| admin-login.md | admin-login | evidence-admin-login-snapshot-dom.md |

> 注: admin-dashboard.md 命名错误问题在Task 2已识别，现已修正为`admin-login-filled`（表示已填写admin123的登录状态）

---

## 3. 迁移操作清单

### 3.1 步骤1: 移动文件到证据目录
```
# 当前位置: 根目录/
# 目标位置: .sisyphus/evidence/

mv timeline-page.md .sisyphus/evidence/evidence-timeline-snapshot-dom.md
mv showcase-page.md .sisyphus/evidence/evidence-showcase-snapshot-dom.md
mv r2-files-api.md .sisyphus/evidence/evidence-r2-snapshot-api.md
mv admin-after-login.md .sisyphus/evidence/evidence-admin-dashboard-snapshot-dom.md
mv admin-login.md .sisyphus/evidence/evidence-admin-login-snapshot-dom.md
```

### 3.2 步骤2: 重命名+移动
```
# admin-dashboard.md 需要先重命名再移动
mv admin-dashboard.md admin-login-filled.md
mv admin-login-filled.md .sisyphus/evidence/evidence-admin-login-filled-snapshot-dom.md
```

### 3.3 步骤3: 创建重定向存根（防链接断裂）
```
# 在原位置创建简短重定向文件，指向新位置
# 文件: timeline-page.md
# 内容: 迁移到 .sisyphus/evidence/evidence-timeline-snapshot-dom.md
```

---

## 4. 实施顺序

1. **创建目标目录**（如不存在）: `.sisyphus/evidence/`
2. **执行文件移动和重命名**
3. **创建重定向存根文件**
4. **更新引用**（如有引用这些文件的地方）
5. **验证无断裂链接**

---

## 5. 扩展规则

### 5.1 未来新增证据文件
- 新证据文件必须遵循 `evidence-<topic>-<type>.md` 格式
- 类型后缀必须从预定义列表中选择
- 在 `.sisyphus/evidence/` 目录下创建

### 5.2 禁止规则
- ❌ 禁止在根目录创建新的snapshot文件
- ❌ 禁止使用非标准后缀
- ❌ 禁止创建空占位文件而不移动实际内容