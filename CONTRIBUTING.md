# 贡献指南

感谢你对東愛璃 Lovely 应援站的支持。本指南以当前仓库真实流程为准，避免使用已经过期的历史说明。

## 开发前

- 先阅读根目录 `AGENTS.md`
- 尽量从 `main` 拉出功能分支进行修改
- 提交前至少运行一次 `npm run build`

## 推荐流程

### 1. 创建分支

```bash
git checkout -b feature/your-change
```

分支命名建议：

- `feature/`：新功能
- `fix/`：问题修复
- `refactor/`：重构
- `docs/`：文档更新

### 2. 开发与验证

常用本地命令：

```bash
npm install
npm run dev
npm run dev:cf
npm run build
```

如果改动涉及 D1 或本地 Pages 环境，可按需执行：

```bash
npm run login
npm run setup
npm run init:db
```

### 3. 提交规范

提交信息请尽量使用简洁明确的前缀：

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `chore:`

示例：

```bash
git commit -m "feat: add timeline admin improvements"
git commit -m "fix: correct live status fallback handling"
git commit -m "docs: align readme with repository state"
```

### 4. 推送与 Pull Request

```bash
git push -u origin feature/your-change
```

仓库当前包含 GitHub Actions 自动 PR / build / 合并相关流程，但它们应被视为仓库自动化实现，而不是你可以依赖的唯一开发步骤。提交前仍应自行确认：

- 构建可通过
- 修改符合仓库规范
- 文档与代码状态一致

## 代码约定

### TypeScript

- 使用严格模式
- 不要引入 `any`、`@ts-ignore`、`@ts-expect-error`
- 优先复用已有类型定义

### 组件与页面

- React 组件使用 `.tsx`
- Astro 组件和页面使用 `.astro`
- 组件名使用大驼峰，页面文件名保持语义化

### 样式

- 优先复用现有设计系统变量和样式约定
- 修改 UI 时注意移动端与桌面端表现一致性

## 文档约定

- README 只保留当前真实状态，不写不存在的脚本和文件
- 历史说明、快照存根和中间文档应归入 `docs/archive/`
- 数据库参考文档位于 `docs/database-schema.md`

## 发现问题时

- 构建失败：先修复再提交
- 文档过期：和代码一起更新
- 自动化行为与文档不一致：以当前代码和工作流配置为准
