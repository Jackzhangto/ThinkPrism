# ThinkPrism 标准前端样式规范

> 工程级 Design Token + 组件分层规范，与 Cursor Rules / 前端设计工作流对齐。目标：**起步不歪，后面永远好改**。

---

## 一、核心原则

| 原则 | 说明 |
|------|------|
| **组件不写具体数值** | 所有 spacing / color / font / radius / shadow 必须来自 **Tailwind Config**，禁止 arbitrary values (如 `w-[123px]`)。 |
| **组件只认语义 Token** | 组件不关心“设计意图”，只消费 Tailwind Utility Class（如 `p-card`、`text-primary`）。 |
| **Layout Token ≠ 视觉 Token** | 页面级 layout（Popup 宽度、Page Padding）仅页面容器使用；普通组件禁止引用 layout。 |
| **业务组件 ≠ 视觉组件** | 纯展示组件（`components/ui/`）封装基础样式；业务组件（`components/business/`）禁止直接写复杂样式，只能组合展示组件。 |
| **卡片层级 ≤ 2** | Card、`.card` 等卡片式容器嵌套深度最多 2 层；新增时先检查当前层级，超过则用扁平结构或拆区块。详见《[组件规范](./组件规范.md)》8.1。 |

---

## 二、推荐目录与资产

```
src/
├── components/
│   ├── ui/                     # 纯展示组件（Headless + Tailwind）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── business/               # 业务组件（组合 UI 组件）
│       ├── ModeList.tsx
│       └── RecommendationCard.tsx
├── popup/
│   ├── App.tsx                 # Popup 入口
│   └── index.css               # Tailwind directives
├── options/
│   └── ...
├── lib/
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
└── tailwind.config.ts          # Design Tokens 单一事实来源
```

**日常 90% 的样式改动只发生在这三类**：`tailwind.config.ts`、`components/ui/*`、页面布局文件。

---

## 三、Design Language（先写、可短）

`docs/ThinkPrism/DESIGN_LANGUAGE.md` 是 AI 的“审美天花板”，必须存在。

示例：
```markdown
# Design Language

## 视觉气质
- 克制、冷静、功能优先、信息密度中等 (适合 Chrome Extension 小窗口)

## 明确排除
- 花哨渐变、强装饰边框、过度阴影、拟物风格

## 交互原则
- hover 必须有反馈，但不抢视觉
- 动效 < 200ms，服务于“理解”而非情绪
```

---

## 四、Design Tokens (Tailwind Config)

在 `tailwind.config.ts` 中扩展 theme，作为全局 Design Tokens。

### 4.1 Spacing (间距)

```ts
// tailwind.config.ts
extend: {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '32px',
    page: '16px',   // Popup 页面内边距
    section: '24px', // 区块间距
    card: '12px',    // 卡片内边距
    stack: '8px',    // 元素堆叠间距
  }
}
```
**使用**：`p-page`, `gap-stack`, `m-section`。

### 4.2 Colors (颜色 - 语义化)

```ts
// tailwind.config.ts
extend: {
  colors: {
    bg: {
      page: '#0F172A',
      panel: '#1E293B',
      hover: '#334155',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      hint: '#64748B',
    },
    brand: {
      DEFAULT: '#38BDF8',
      hover: '#0EA5E9',
    },
    border: {
      DEFAULT: '#334155',
    }
  }
}
```
**使用**：`bg-bg-page`, `text-text-primary`, `border-border`。

### 4.3 Typography (字体)

```ts
// tailwind.config.ts
extend: {
  fontSize: {
    h1: ['20px', { lineHeight: '28px', fontWeight: '600' }],
    h2: ['16px', { lineHeight: '24px', fontWeight: '600' }],
    body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
    sub: ['12px', { lineHeight: '16px', fontWeight: '400' }],
    hint: ['10px', { lineHeight: '14px', fontWeight: '400' }],
  }
}
```
**使用**：`text-h1`, `text-body`。

### 4.4 Radius & Shadow

```ts
// tailwind.config.ts
extend: {
  borderRadius: {
    card: '12px',
    button: '8px',
    input: '6px',
  },
  boxShadow: {
    card: '0 1px 2px rgba(0,0,0,0.2)',
    popover: '0 4px 12px rgba(0,0,0,0.3)',
  }
}
```
**使用**：`rounded-card`, `shadow-card`。

---

## 五、基础 UI 组件与 Token 映射

使用 `class-variance-authority` (cva) 或 `clsx` + `tailwind-merge` (`cn` helper) 管理样式。

### 5.1 布局组件 (Stack)

直接使用 Flexbox + Gap Utility。
```tsx
<div className="flex flex-col gap-stack p-card bg-bg-panel rounded-card">
  {children}
</div>
```

### 5.2 文本组件 (Typography)

**禁止**：在 Text 组件上写 margin。
```tsx
<h1 className="text-h1 text-text-primary">标题</h1>
<p className="text-body text-text-secondary">正文内容</p>
```

### 5.3 Card

**允许使用**：`p-card`, `rounded-card`, `bg-bg-panel`, `shadow-card`。
**卡片层级最多 2 层**。

```tsx
export function Card({ children, className }: Props) {
  return (
    <div className={cn("p-card rounded-card bg-bg-panel border border-border shadow-card", className)}>
      {children}
    </div>
  )
}
```

---

## 六、页面用法约定 (Popup)

ThinkPrism 的 Popup 宽度通常固定（如 400px）。

```tsx
// src/popup/App.tsx
export default function App() {
  return (
    <main className="w-[400px] min-h-[500px] bg-bg-page text-text-primary p-page flex flex-col gap-section">
      <Header />
      
      <section className="flex flex-col gap-stack">
        <h2 className="text-h2">场景推荐</h2>
        <Card>
          <p className="text-body">内容...</p>
        </Card>
      </section>
    </main>
  )
}
```

---

## 七、与 原有 Tora 规范的对应

| Tora / Mini Program | ThinkPrism (Chrome Extension) |
|---------------------|-------------------------------|
| `design/tokens/*.ts` | `tailwind.config.ts` (theme.extend) |
| `variables.scss` | Tailwind Utility Classes |
| `style={{ ... }}` | `className="..."` |
| View / Text | div / p / span / h1... |

---

## 八、推荐下一步

1.  初始化 `tailwind.config.ts`，配置上述语义化 Tokens。
2.  创建 `src/lib/utils.ts` (cn helper)。
3.  搭建 `src/components/ui` 基础组件库。
4.  新建组件时，先查阅 Tailwind Config，**禁止手写 magic values**。

---

*这不是“模板”，而是“前端操作系统内核”：Chrome 扩展、Web App 的正确起手式。*
