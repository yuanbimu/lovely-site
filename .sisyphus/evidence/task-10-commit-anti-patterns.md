# 提交反模式清单

本文档列出需要避免的提交模式，确保提交信息符合项目规范。

## 禁止的模式

### 1. 英文提交信息

**描述**：使用英文编写提交信息

**错误示例**：
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve layout issue"
git commit -m "chore: update dependencies"
```

**正确示例**：
```bash
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复布局问题"
git commit -m "chore: 更新依赖包"
```

**原因**：项目 AGENTS.md 明确规定所有回复和提交信息必须使用简体中文

---

### 2. 繁体中文提交信息

**描述**：使用繁体中文编写提交信息

**错误示例**：
```bash
git commit -m "feat: 添加用戶登入功能"
git commit -m "fix: 修復首頁載入問題"
git commit -m "chore: 更新專案配置"
```

**正确示例**：
```bash
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复首页加载问题"
git commit -m "chore: 更新项目配置"
```

**原因**：AGENTS.md 明确禁止使用繁体中文（如"裡""為""發"等），必须转换为简体

---

### 3. 模糊范围描述

**描述**：提交描述过于模糊，无法理解具体变更内容

**错误示例**：
```bash
git commit -m "fix: 修复问题"
git commit -m "feat: 添加功能"
git commit -m "chore: 更新"
git commit -m "refactor: 优化代码"
```

**正确示例**：
```bash
git commit -m "fix: 修复移动端导航栏溢出问题"
git commit -m "feat: 添加动态详情页图片展示功能"
git commit -m "chore: 更新 package.json 依赖版本"
git commit -m "refactor: 重构 API 请求封装逻辑"
```

**原因**：模糊的描述无法帮助理解代码变更历史，降低代码审查效率

---

### 4. 不允许的提交前缀

**描述**：使用项目规定之外的前缀

**错误示例**：
```bash
git commit -m "test: 添加单元测试"
git commit -m "style: 调整代码格式"
git commit -m "perf: 优化性能"
git commit -m "hotfix: 紧急修复"
```

**正确示例**：
```bash
git commit -m "chore: 添加组件单元测试"
git commit -m "chore: 调整代码格式（prettier）"
git commit -m "refactor: 优化图片加载性能"
git commit -m "fix: 修复线上紧急问题"
```

**原因**：AGENTS.md 明确规定只能使用 `feat:` `fix:` `chore:` `refactor:` 四个前缀

---

### 5. 无意义的提交信息

**描述**：提交信息与实际变更无关或无实际意义

**错误示例**：
```bash
git commit -m "wip"
git commit -m "asdf"
git commit -m "草稿"
git commit -m ""
```

**正确示例**：
```bash
git commit -m "feat: 添加用户设置页面"
git commit -m "fix: 修复表单验证逻辑"
```

**原因**：无意义的提交信息会污染提交历史，影响代码审查和回溯

---

### 6. 混合语言提交

**描述**：同一提交信息中混合使用中英文

**错误示例**：
```bash
git commit -m "feat: 添加Button组件"
git commit -m "fix: 修复API返回的data格式"
git commit -m "chore: 更新README.md文件"
```

**正确示例**：
```bash
git commit -m "feat: 添加按钮组件"
git commit -m "fix: 修复接口返回数据格式问题"
git commit -m "chore: 更新项目说明文档"
```

**原因**：保持语言一致性，使提交历史更加清晰

---

## 验证方式

项目可通过以下方式验证提交是否符合规范：

1. **Git Hook 校验**：使用 commit-msg 钩子验证提交格式
2. **CI/CD 检查**：在流水线中检查提交信息
3. **代码审查**：Reviewer 负责检查提交是否符合规范

## 违规处理

- **轻微违规**（如格式问题）：要求提交者修改后重新提交
- **严重违规**（如语言错误）：拒绝合并，要求重新提交
- **多次违规**：团队内部沟通，明确规范重要性