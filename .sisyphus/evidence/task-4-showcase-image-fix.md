# 任务 4 证据 - ShowcaseList 图片获取和轮播修复（最终版）

## 执行日期
2026-04-22

## 修复历程
1. **第一轮**: 添加 401/403 降级逻辑 → 不满足任务要求
2. **第二轮**: 开放 `/api/r2-files` 公开访问 → API 工作，但轮播不工作
3. **第三轮**: 修复 setInterval 闭包问题 → interval 能工作，但图片不切换
4. **第四轮**: 修复图片优先级 → 当前状态（修复完成）

## 最终修复方案

### 问题根因 (第四轮)
`getCurrentImage()` 先检查 `showcase.image_url`，导致有 folder 图片时也返回固定图，轮播 index 变化但显示不变

### 修复代码 (ShowcaseList.tsx)
```typescript
// 修改前 (错误)
const getCurrentImage = (showcase: Showcase): string => {
  if (showcase.image_url) return showcase.image_url;  // 先检查 image_url
  if (showcase.folder && folderImages[showcase.folder]?.length > 0) {
    return folderImages[showcase.folder][currentImageIndex[showcase.id] || 0];
  }
  return '';
};

// 修改后 (正确)
const getCurrentImage = (showcase: Showcase): string => {
  // 优先使用 folder 图片（支持轮播）
  if (showcase.folder && folderImages[showcase.folder]?.length > 0) {
    const idx = currentImageIndex[showcase.id] || 0;
    return folderImages[showcase.folder][idx];
  }
  // 回退到 image_url
  if (showcase.image_url) return showcase.image_url;
  return '';
};

// 同理修复 getTotalImages() - 优先返回 folder 图片数量
```

## 修改文件
1. `functions/api/[[route]].ts` - 开放 `/api/r2-files` 公开访问
2. `src/components/ShowcaseList.tsx` - 使用 ref 模式修复轮播 + 文件过滤 + 图片优先级

## 验证结果
- `npm run build` 通过 ✅
- 无 TypeScript 错误

## 保留不变
- 3秒轮播间隔
- 悬停暂停逻辑
- `.folder` / 隐藏文件过滤
- 写操作端点认证

## 证据文件
- `.sisyphus/evidence/task4-showcase-page.png`