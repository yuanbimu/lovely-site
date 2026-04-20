# Task 7 参考安全性方案

**任务**: 防止迁移后链接断裂和角色混淆  
**日期**: 2026-04-16

---

## 1. 链接断裂风险分析

### 1.1 可能被引用的位置
根据项目当前状态，以下位置可能引用根级document：

| 潜在引用位置 | 引用方式 | 风险等级 |
|--------------|----------|----------|
| .sisyphus/plans/*.md | 内链 `[timeline-page.md]` | 高 |
| .sisyphus/drafts/*.md | 内链 `[admin-login.md]` | 高 |
| AGENTS.md | 文档引用 | 中 |
| src/pages/*.astro | 可能引用的资源 | 低 |

### 1.2 断裂场景
- 直接链接路径失效（如 `../timeline-page.md`）
- 相对引用无法找到文件
- 使用文档作为参考时路径错误

---

## 2. 链接防护方案

### 方案A: 重定向存根文件（推荐）

**原理**: 在原位置创建简短存根文件，指向新位置

```markdown
# timeline-page.md
# 此文件已迁移至 .sisyphus/evidence/evidence-timeline-snapshot-dom.md
```

**优势**:
- 零破坏性，现有引用仍然有效
- 自动重定向用户到正确位置
- 简单易实现

**实施**:
```bash
# 为每个迁移的文件创建存根
echo "# 此文件已迁移至 .sisyphus/evidence/evidence-timeline-snapshot-dom.md" > timeline-page.md
echo "# 此文件已迁移至 .sisyphus/evidence/evidence-showcase-snapshot-dom.md" > showcase-page.md
# ... 以此类推
```

### 方案B: 批量搜索替换

**原理**: 迁移前搜索所有引用，统一替换为新路径

**步骤**:
1. 执行 `grep -r "timeline-page.md" --include="*.md"`
2. 将 `timeline-page.md` 替换为 `evidence-timeline-snapshot-dom.md`
3. 对于其他文件重复

**劣势**:
- 可能遗漏非标准引用
- 需要遍历所有md文件
- 工作量大

---

## 3. 角色混淆防护

### 3.1 问题背景
根级document被误用为计划文档（见Task 1-4），原因：
- 文件名缺乏明确类型标识
- 位于根目录，与项目根文件混在一起

### 3.2 防护措施

| 措施 | 说明 |
|------|------|
| evidence-前缀 | 所有证据文件必须以`evidence-`开头 |
| 类型后缀 | 必须包含`-snapshot-dom`/`-snapshot-api`等后缀 |
| 目录分离 | 强制存放在`.sisyphus/evidence/`目录下 |
| 无执行属性 | 证据文件禁止包含执行指令或TODO |

### 3.3 验收检查
迁移后，执行以下检查：

```bash
# 检查根目录是否还有未迁移的snapshot文件
ls -la *.md | grep -v "README\|CONTRIBUTING\|QUICK_START"

# 检查evidence目录命名是否符合规范
ls .sisyphus/evidence/evidence-*-snapshot-*.md
```

---

## 4. 快速恢复方案

如迁移后发现链接问题，可执行回滚：

```bash
# 从证据目录恢复回根目录
mv .sisyphus/evidence/evidence-timeline-snapshot-dom.md timeline-page.md
mv .sisyphus/evidence/evidence-showcase-snapshot-dom.md showcase-page.md
# ... 其他文件同理
```

---

## 5. 总结

| 防护层 | 方法 | 优先级 |
|--------|------|--------|
| 第一层 | 重定向存根文件 | P0 |
| 第二层 | evidence-前缀+目录分离 | P0 |
| 第三层 | 类型后缀强制 | P1 |
| 第四层 | 批量搜索验证 | P2 |

**推荐实施**: 方案A（重定向存根）+ 方案B验证结合