# 贡献指南

感谢你对 東愛璃 Lovely 应援站的支持！本指南面向 AI 开发者。

## 开发流程

### 1. 创建分支

从 `main` 创建功能分支：

```bash
git checkout -b feature/功能名
# 例如: feature/add-about-page
```

分支命名规范：
- `feature/` - 新功能
- `fix/` -  bug 修复
- `refactor/` - 代码重构
- `docs/` - 文档更新

### 2. 开发与提交

#### 提交规范 ( Conventional Commits )

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**type 类型：**
| 类型 | 说明 |
|---|---|
| `feat` | 新功能 |
| `fix` | bug 修复 |
| `refactor` | 重构（不变功能） |
| `style` | 样式调整 |
| `docs` | 文档 |
| `chore` | 构建/工具 |
| `perf` | 性能优化 |

**示例：**

```bash
git commit -m "feat(home): add live status component"
git commit -m "fix(nav): mobile menu close on click outside"
git commit -m "refactor(utils): simplify date formatting"
```

### 3. 测试

提交前运行本地检查：

```bash
npm run build    # 构建检查
```

确保无错误后方可推送。

### 4. 推送与 PR

```bash
git push -u origin feature/your-feature
```

推送后 GitHub Actions 会：
1. 自动创建 Pull Request
2. 运行 build 检查
3. 检查通过后 auto-merge 到 main
4. 自动部署到 Cloudflare Pages

## 代码规范

### TypeScript

- 严格模式，禁止 `any`
- 所有类型定义在 `src/types/index.ts`
- 优先使用已有类型

### 样式

- 使用设计系统变量：`var(--brown-500)`、`var(--blue-200)`
- 响应式断点：`600px`、`1000px`
- 移动优先

### 组件

- React 组件：`.tsx` + 大驼峰命名
- Astro 组件：`.astro` + 大驼峰命名
- 页面：`.astro` + 小写命名

## 分支策略

```
main (生产分支)
└── feature/xxx (功能分支)
```

- **禁止直接 push 到 main**
- 所有修改通过 PR 合并
- PR 创建后自动合并（无需 human review）

## 常见任务

### 添加新页面

1. 在 `src/pages/` 创建 `*.astro`
2. 使用现有布局：`Layout.astro`
3. 遵循页面命名规范

### 添加组件

1. 在 `src/components/` 创建
2. 遵循组件规范（见 `AGENTS.md`）
3. 导出并在需要处引入

### 更新数据

1. 修改 `src/data/` 下的 JSON 文件
2. 运行 `npm run fetch-data`（如有脚本）
3. 注意：GitHub Action 会自动更新头像等数据

## 自动部署流程

```
push → PR created → Build check → Auto-merge → Deploy to Cloudflare Pages
```

如 build 失败，PR 会标记失败并通知修复。

## 问题处理

### 构建失败

检查错误信息并修复：
- TypeScript 错误 → 检查类型
- lint 错误 → 遵循代码规范

### 部署失败

Cloudflare 部署问题：
- 检查 `wrangler.toml` 配置
- 确认环境变量已配置

---

**有问题？** 提交 issue 或自行修复后提交 PR。