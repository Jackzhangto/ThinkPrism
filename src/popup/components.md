# Popup 组件拆解 (Component Decomposition)

## 1. 组件树 (Component Tree)

### 1.1 UI Components (src/components/ui)

| 组件 | 名称 | 职责 | 属性 (Props) |
| :--- | :--- | :--- | :--- |
| **基础按钮** | `Button` | 触发操作，包含 Primary, Secondary, Ghost, Outline 变体。 | `variant`, `size`, `icon`, `onClick` |
| **图标按钮** | `IconButton` | 仅包含图标的按钮，用于 Settings, Close 等。 | `icon`, `onClick` |
| **卡片容器** | `Card` | 模式卡片的基础容器，包含 Header, Content, Footer 插槽。 | `className`, `children` |
| **标签页** | `Tabs` | L1/L2/L3 模式层级切换。 | `items`, `active`, `onChange` |
| **输入框** | `Input` | 搜索框，包含 Icon 插槽。 | `value`, `onChange`, `placeholder` |
| **徽章** | `Badge` | 模式标签 (e.g. "Product", "Risk")。 | `variant`, `children` |
| **Toast** | `Toast` | 消息通知容器。 | `message`, `type` (success/error/info) |
| **Skeleton** | `Skeleton` | 加载占位符。 | `className` |
| **Switch** | `Switch` | 设置开关 (Options)。 | `checked`, `onChange` |

### 1.2 Business Components (src/components/business)

| 组件 | 名称 | 职责 | 状态/Store 依赖 |
| :--- | :--- | :--- | :--- |
| **头部导航** | `PopupHeader` | Logo, Settings Link, Theme Toggle. | `useThemeStore` |
| **场景推荐** | `SceneRecommender` | 根据当前 URL/Title 推荐场景模式 (Chips)。 | `useRecommendation` |
| **持久化状态** | `PersistentStatusBar` | 显示当前 Persistent Mode, 提供 Deactivate 操作。 | `useModeStore.persistentMode` |
| **搜索与过滤** | `SearchFilterBar` | 包含 `Input` 和 `Tabs`，控制模式列表过滤。 | `useModeStore.setFilter` |
| **模式列表** | `ModeList` | 渲染过滤后的模式列表 (`ModeItem` 集合)。 | `useModeStore.filteredModes` |
| **模式项** | `ModeItem` | 单个模式卡片，处理点击选择/取消选择逻辑。 | `isSelected`, `onSelect` |
| **操作浮层** | `ActionFloatingBar` | 当有选中模式时显示，提供 Generate/Copy/Clear 操作。 | `useSelectionStore` |
| **反馈卡片** | `FeedbackCard` | 根据上次注入时间判断是否显示反馈请求。 | `useFeedbackStore` |

---

## 2. 状态管理 (State Management - Zustand)

### 2.1 ModeStore (Existing)
- `modes`: 所有加载的模式。
- `searchQuery`: 当前搜索词。
- `activeTab`: 当前激活的 Tab (All/L1/L2/L3)。
- `persistentMode`: 当前激活的持久化模式 ID。

### 2.2 SelectionStore (New)
- `selectedModeIds`: 当前选中的模式 ID 集合 (Set<string>)。
- `addSelection(id)`: 添加选中。
- `removeSelection(id)`: 移除选中。
- `clearSelection()`: 清空所有选中。
- `toggleSelection(id)`: 切换选中状态。

### 2.3 UIStore (New/Optional)
- `isActionVisible`: ActionFloatingBar 是否可见 (computed based on selection > 0)。
- `toast`: 当前 Toast 消息 { message, type, visible }。
- `showToast(msg, type)`: 显示 Toast。

---

## 3. 关键交互逻辑

### 3.1 模式选择与组合
1. 用户点击 `ModeItem` -> `toggleSelection(id)`.
2. `SelectionStore` 更新 -> `selectedModeIds` 变化.
3. `ActionFloatingBar` 监听 `selectedModeIds.size` -> > 0 时显示.
4. Bar 显示 "Generate (N)" 按钮.

### 3.2 生成指令
1. 用户点击 "Generate".
2. 调用 `InstructionBuilder.build({ persistentMode, selectedModes })`.
3. 生成最终 Prompt 字符串.
4. 调用 `InjectionService.inject(prompt)`.
5. 根据结果显示 Toast.

### 3.3 持久化模式切换
1. 用户点击 `PersistentStatusBar` 上的 "Deactivate".
2. 调用 `ModeStore.setPersistentMode(null)`.
3. UI 更新，Bar 隐藏或变为 "Select a Persistent Mode" 提示.
4. 用户在列表或专门区域选择新的 Persistent Mode -> `ModeStore.setPersistentMode(newId)`.
