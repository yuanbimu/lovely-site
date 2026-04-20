# Admin 后台改进 - 需求记录

## 当前系统状态 (在线)

### 数据库表 (D1)
- `users` - 1条数据
- `timeline_events` - 5条数据
- `songs` - 2条数据
- `showcases` - 有数据 (model-3 ~ model-32)
- `dynamics`, `live_status`, `sessions`, `user_info` - 有表

### R2 存储桶 (lovelymain)
- `showcase/` - model-1.jpg, Gemini_xxx.png
- `model-1/` - 3张图片 (233.HEIC, 811.jpeg, B012.jpeg)
- `model-2/` - 空
- `images/` - avatar.webp

## 已确认的问题

### 1. Admin 布局问题 (所有页面)
- **问题**: 内容偏左，不居中
- **要求**: 内容居中，平铺一行3个方块

### 2. 橱窗图片 404
- **问题**: 数据库 image_url 是 `/images/showcase/model-x.jpg`，但图片不存在
- **迁移**:
  - `showcase/model-1.jpg` → `model-1/model-1.jpg`
  - 复制 model-1 图片作为 model-3 ~ model-32 的占位图
- **数据库更新**: image_url → `https://cdn.yuanbimu.top/model-x/xxx.jpg`

### 3. 橱窗展示页需要轮播图
- **要求**: 支持自动/手动切换
- **图片来源**: R2 model-xxx/ 目录

### 4. 时间线管理
- 删除批量导入框
- 目录字段保持只读

### 5. 验证要求
- 修改后前台不丢失数据

## 待执行
