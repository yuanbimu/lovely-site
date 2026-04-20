# Task 2 命名与内容不一致问题

## 概述

本文档记录根级伪计划文档中发现的命名与实际内容不一致问题。

---

## 命名错误详情

### admin-dashboard.md ⚠️ 严重不匹配

| 属性 | 值 |
|------|-----|
| 文件名 | `admin-dashboard.md` |
| 预期内容 | 管理员仪表板/控制台页面（显示统计数据、快捷操作） |
| 实际内容 | **登录页面**（管理后台登录表单） |

#### 实际内容详情
```
- generic [ref=e5]:
  - heading "管理后台登录" [level=2] [ref=e6]
  - paragraph [ref=e7]: 东爱璃 Lovely 应援站
  - generic [ref=e8]:
    - textbox "用户名" [ref=e9]: admin
    - textbox "密码" [active] [ref=e10]: admin123
    - button "登录" [ref=e11] [cursor=pointer]
```

#### 问题分析
1. **文件名暗示**: "dashboard"（仪表板/控制台）
2. **实际内容**: 登录表单页面，包含预填的用户名 "admin" 和密码 "admin123"
3. **矛盾**: 这更像是登录成功后的预填充状态，或者这是一个"带默认凭证的登录页面"

#### 类似文件对比
另有 `admin-login.md`，内容也是登录表单（但无预填值）：
- textbox "用户名" [ref=e9] - 空
- textbox "密码" [ref=e10] - 空

#### 结论
- admin-dashboard.md 的实际内容是登录页面
- 建议重命名为 `admin-login-filled.md` 或 `admin-login-with-creds.md`
- 当前命名与内容完全不符，应标记为**命名错误**

---

## 其他观察

### DOM 快照命名模式
大部分根级文件使用 `<page-name>.md` 格式：
- `timeline-page.md` - 时间线页面 ✓
- `showcase-page.md` - 橱窗页面 ✓

### API 响应命名
- `r2-files-api.md` - R2 文件 API 响应 ✓

### 管理后台文件
- `admin-login.md` - 登录页（无预填值）✓
- `admin-after-login.md` - 登录后仪表板 ✓
- `admin-dashboard.md` - **命名错误（实际是登录页）** ✗

---

## 建议操作

| 文件 | 当前状态 | 建议操作 |
|------|----------|----------|
| admin-dashboard.md | 命名错误 | 重命名为 `admin-login-filled.md` |
| admin-login.md | 正常 | 保持不变 |
| admin-after-login.md | 正常 | 保持不变 |