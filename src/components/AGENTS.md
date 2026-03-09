# AGENTS.md - 组件开发指南

**位置**: `src/components/`  
**类型**: React (TSX) + Astro 混合  
**风格**: Islands 架构

---

## 目录结构

```
components/
├── ui/                 # 基础 UI 组件 (按钮、卡片等)
├── home/               # 首页专用组件
├── Avatar.tsx          # React 组件 (可交互)
├── LiveStatus.tsx      # React 组件 (实时状态)
├── DynamicsList.tsx    # React 组件 (列表)
├── Footer.astro        # Astro 组件 (静态)
├── Navigation.astro    # Astro 组件 (静态)
└── QuickNav.astro      # Astro 组件 (静态)
```

---

## 组件选择规则

| 场景 | 类型 | 原因 |
|------|------|------|
| 需要状态/交互 | React (TSX) | Hooks 支持 |
| 纯展示/静态 | Astro | 零 JS 输出 |
| 需要客户端 API | React (TSX) | useEffect/useQuery |
| SEO 关键内容 | Astro | 服务端渲染 |

---

## React 组件模式

### 基础模板

```tsx
import { useState, useEffect } from 'react';
import './ComponentName.css';

interface Props {
  size?: number;
  className?: string;
}

export default function ComponentName({ size = 280, className = '' }: Props) {
  const [state, setState] = useState<ValueType>(initialValue);
  
  useEffect(() => {
    // 客户端逻辑
  }, []);
  
  return (
    <div className={`component-wrapper ${className}`}>
      {/* JSX */}
    </div>
  );
}
```

### Props 规范
- 所有 props 必须定义接口
- 可选参数用 `?` 标注
- 提供默认值：`{ size = 280 }`
- 事件处理器类型：`React.MouseEventHandler<HTMLButtonElement>`

### 状态管理
- 简单状态：`useState`
- 副作用：`useEffect`
- 复杂状态：考虑 Zustand (未引入)

### 数据获取
```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint');
      const data = await response.json();
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  fetchData();
}, []);
```

---

## Astro 组件模式

### 基础模板

```astro
---
// Frontmatter - 服务端逻辑
import { formatDate } from '../../lib/utils';

interface Props {
  title: string;
  date?: string;
}

const { title, date = new Date().toISOString() } = Astro.props;
const formatted = formatDate(date);
---

<!-- 模板部分 -->
<div class="component">
  <h2>{title}</h2>
  <time>{formatted}</time>
</div>

<style>
  /* 作用域样式 */
  .component {
    /* 样式 */
  }
</style>
```

### Props 传递
- 服务端数据：直接 frontmatter 导入
- 客户端数据：通过 props 传递给 React 组件

---

## 混合模式 (React Islands)

```astro
---
// Astro 父组件
import Avatar from '../components/Avatar';
---

<!-- 客户端交互组件 -->
<Avatar client:load size={280} />

<!-- 或延迟加载 -->
<Avatar client:visible size={200} />
```

### client:* 指令
| 指令 | 时机 | 用途 |
|------|------|------|
| `client:load` | 立即 | 关键交互 (导航、英雄区) |
| `client:visible` | 可见时 | 懒加载组件 |
| `client:idle` | 空闲时 | 非关键功能 |
| `client:only` | 仅客户端 | 纯前端组件 |

---

## 样式约定

### 命名规范
```css
/* 组件包装器 */
.component-wrapper { }

/* 内部元素 */
.component-header { }
.component-content { }
.component-footer { }

/* 状态修饰 */
.component.is-active { }
.component.is-loading { }

/* 变体 */
.component--large { }
.component--primary { }
```

### 设计系统变量
```css
/* 配色 */
var(--brown-500)      /* 主色 */
var(--blue-200)       /* 强调色 */
var(--purple-600)     /* 特殊状态 */

/* 间距 */
var(--space-sm)       /* 4px */
var(--space-md)       /* 16px */
var(--space-lg)       /* 24px */

/* 圆角 */
var(--radius-md)      /* 12px */
var(--radius-lg)      /* 16px */
var(--radius-full)    /* 9999px */

/* 阴影 */
var(--shadow-md)      /* 常规 */
var(--shadow-lg)      /* 悬停 */
var(--shadow-glow)    /* 强调 */
```

---

## 大型组件 (>200 行)

当前项目大型组件：
- `HeroBanner.astro` (288 行) - 英雄区展示
- `Footer.astro` (265 行) - 页脚
- `AboutSection.astro` (225 行) - 关于页面
- `DynamicsList.tsx` - B 站动态列表

**拆分建议**:
- 提取重复 UI 为 `ui/` 子组件
- 长列表拆分为 `ListItem` + `ListContainer`
- 内联样式提取到独立 CSS 文件

---

## 测试建议

```tsx
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders with default props', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick} />);
    // ...
  });
});
```
