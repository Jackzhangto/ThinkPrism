# ThinkPrism Design Language

## 1. 核心气质 (Core Mood)
- **专业 (Professional)**: 高效、可信赖的 AI 助手形象。
- **克制 (Restrained)**: 信息密度适中，避免过度装饰，专注于内容处理。
- **流畅 (Fluid)**: 交互响应迅速 (<200ms)，操作路径清晰。
- **紧凑 (Compact)**: 针对 Chrome Extension Popup (固定宽 400px-600px) 优化空间利用率。

## 2. 视觉原则 (Visual Principles)
- **层级分明**: 通过字号、颜色深浅、间距区分信息层级，而非复杂的装饰线。
- **语义化色彩**: 颜色仅用于传递状态（成功、警告、错误、选中），而非装饰。
- **无干扰**: 背景色深沉 (Dark Mode 优先)，减少长时间使用的视觉疲劳。

## 3. 交互原则 (Interaction Principles)
- **键盘优先**: 核心功能支持快捷键操作。
- **即时反馈**: Hover、Click 必须有微交互反馈。
- **状态可见**: 加载中、处理中、成功/失败状态必须明确。

## 4. 布局约束 (Layout Constraints)
- **Popup 宽度**: 固定 (推荐 400px - 600px)。
- **最大嵌套**: Card/Container 嵌套不超过 2 层。
- **滚动策略**: 尽量避免多重滚动条，主内容区滚动。
