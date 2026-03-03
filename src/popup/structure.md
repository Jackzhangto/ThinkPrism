# Popup 结构设计 (Structure Design)

## 1. 布局骨架 (Layout Skeleton)

ThinkPrism Popup 采用经典的 **Header - Content - Footer** 布局，但在多选模式下会有动态的 **Floating Action Bar**。

### 1.1 核心区域划分

| 区域 | 组件名称 | 职责描述 | 高度/定位 |
| :--- | :--- | :--- | :--- |
| **顶部栏** | `Header` | 展示 Logo、版本号、设置入口、主题切换。 | 固定顶部 (h-14) |
| **持久化状态** | `PersistentStatusBar` | 显示当前激活的持久化模式 (Persistent Mode)，提供快速关闭/切换入口。 | 紧接 Header 下方 |
| **场景推荐** | `SceneRecommender` | 基于用户上下文 (如当前网页类型) 推荐常用场景 (Product, Code, etc.)。 | 可折叠面板 |
| **主内容区** | `MainContent` | 包含搜索栏、Tab 切换、模式列表。 | 弹性伸缩 (flex-1), 滚动区域 |
| **操作栏** | `ActionFloatingBar` | 当用户选中至少一个模式时浮现，提供"生成指令"、"复制"、"清空"操作。 | 底部悬浮 (fixed bottom) |
| **全局反馈** | `ToastContainer` | 显示操作成功/失败的反馈信息。 | 全局覆盖 (z-50) |

---

## 2. 交互流程 (Interaction Flow)

### 2.1 默认状态 (Default State)
- **Header**: Logo + Settings Icon.
- **PersistentStatusBar**: 若有激活的持久化模式，显示该模式的简要信息 (Icon + Title) 和 "Deactivate" 按钮；否则隐藏或显示 "No Persistent Mode Active" (低调提示)。
- **SceneRecommender**: 展示 3-4 个场景标签 (Chips)。
- **Search/Tabs**: 默认选中 "All" 或上次使用的 Tab。
- **ModeList**: 展示模式列表。

### 2.2 搜索/筛选状态 (Filtering State)
- 用户输入关键词 -> `ModeList` 实时过滤。
- 用户点击 Tab (L1/L2/L3) -> `ModeList` 仅展示对应层级。

### 2.3 选择模式状态 (Selection State)
- 用户点击某个 `ModeItem` -> 该模式进入 "Selected" 状态 (边框高亮, Checkmark)。
- **ActionFloatingBar** 从底部滑入/淡入。
- 显示 "Selected: N" 计数。
- 提供主要操作: "Insert to Page" (Primary), "Copy to Clipboard" (Secondary).

### 2.4 注入反馈 (Injection Feedback)
- 点击 "Insert" -> Loading 状态。
- 成功 -> Toast: "Inserted Successfully!" -> 清空选择 -> 收起 Action Bar。
- 失败 -> Toast: "Failed to Insert. Copied to Clipboard instead." -> 保持选择状态 (方便重试) 或 清空。

---

## 3. 响应式与样式策略 (Styling Strategy)

- **尺寸限制**: Chrome Popup 默认最大 800x600，建议固定宽度 (e.g., `w-[400px]`) 以保证一致性，高度自适应但最大不超过 `h-[600px]`。
- **滚动策略**: `Header` 和 `ActionFloatingBar` 固定，仅 `MainContent` 区域滚动 (`overflow-y-auto`)。
- **暗色模式**: 全面支持 Dark Mode，背景色 `bg-background`，文字 `text-foreground`，边框 `border-border` (基于 Tailwind Tokens)。
