# ShowcasePicker - Learnings

## Task: 创建 ShowcasePicker 组件

### What we learned
- 项目使用 React Islands 架构，组件需要 client:load 指令
- Showcase 接口: id, name, description, folder, image_url, sort_order
- API 端点: `/api/showcases` 返回格式 `{ success: true, data: Showcase[] }`
- 配色方案: #6B5637 (棕色主色), #C4A77D (浅棕色), #8B7355 (次要文字)
- 下拉选择框需要自定义样式以匹配项目风格

### Key patterns discovered
1. API 调用使用 fetch + useEffect，在组件挂载时获取数据
2. 使用 React useState 管理状态
3. 样式使用内联 <style> 标签嵌入组件，保持自包含
4. 加载状态使用 spinner，空状态显示提示

### Reference files
- `src/components/ShowcaseList.tsx` - 现有橱窗列表，使用相同 API
- `src/components/home/AboutSection.astro` - 需要集成的目标组件
- `src/config/site.config.ts` - getShowcaseImageUrl 工具函数
- `functions/api/[[route]].ts` - API 端点实现

### Created
- 2026-04-08
- ShowcasePicker.tsx 组件

---

## Task 8 成果: 状态语义规则 (2026-04-16)

### 新增文件
- `.sisyphus/evidence/task-8_status_semantics.md` - 状态语义规则定义
- `.sisyphus/evidence/task-8_status_counterexamples.md` - 状态语义反例

### 核心规则
1. **三级状态模型**: Plan → Execution → Verification
2. **TODO [x] = 代码已写，不是验证通过**
3. **AC [x] = 验证通过**
4. **任务完成 = TODO [x] + AC [x]**

### 解决的问题
- showcase-picker.md: "TODO 已完成但 AC 未检查" 冲突
- admin-improvements.md: "Final Verification 是口号" 问题