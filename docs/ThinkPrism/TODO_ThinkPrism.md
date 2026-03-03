# 待办事项清单 (TODO_ThinkPrism)

## 1. 紧急待办 (Immediate)
- **发布准备**: 
  - [已完成] 打包扩展程序 (zip)。
  - [已完成] 完善 README 文档。
  - 准备 Chrome Web Store 素材 (图标、截图、描述)。
- **用户反馈收集**: 上线后增加简单的反馈机制 (如 Google Form 链接)。
- **英文内容对齐**: 需将 Lyra V3.0 指令手册翻译为英文，并更新 `modes.json` 中的英文配置 (作为后续迭代)。

## 2. 功能增强 (Enhancement)
- **自定义模式编辑器**: 在 Options 页面提供可视化的 Prompt 变量插入与测试功能。
- **快捷键绑定**: 允许用户为常用模式绑定快捷键 (Chrome Commands API)。
- **历史记录**: 记录最近使用的模式，并在 Popup 顶部快速访问。

## 3. 运维配置 (Ops)
- **CI/CD**: 配置 GitHub Actions 自动构建与发布。
- **监控**: 集成 Sentry 或类似工具监控生产环境错误。
- **Chrome Store 素材**: 准备 128x128 图标、截图 (1280x800)、宣传视频。

## 4. 已知问题 (Known Issues)
- **复杂 DOM 注入**: 在部分高度动态的网页 (如 Google Docs, Notion) 中，直接替换选文可能受限，需针对性适配。
- **暗黑模式适配**: 部分组件在极端深色背景下对比度可能不足，需微调 Tailwind 颜色变量。

---
请根据优先级安排后续迭代计划。
