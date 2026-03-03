# DESIGN Workflow (React + Tailwind)

使用说明（非常重要）
👉 正确使用方式
一个阶段 = 一个 Prompt
一个 Prompt 只干一件事
输出必须保存为文件

---

## Prompt 01｜设计语言冻结（一次一项目）

📁 保存为：`/docs/ThinkPrism/DESIGN_LANGUAGE.md`

你是一个资深 SaaS / 工具类产品设计总监。

请为【Chrome 浏览器扩展程序 (Popup)】定义一套【长期可复用】的设计语言规范，包括：

1. 设计气质关键词（5–7 个）
2. 明确排除的风格（至少 5 条）
3. 页面密度策略（宽松 / 中等 / 紧凑，并说明原因）
4. 视觉层级原则（信息主次如何体现）
5. 交互克制原则（hover / active / 动效）

规则：
- 不允许输出任何代码
- 不允许使用模糊词（如“高级感”不解释）
- 必须偏向工程可实现性 (Tailwind CSS)

输出为 Markdown。

---

## Prompt 02｜页面结构草图（只做骨架）

📁 保存为：`/src/popup/structure.md` (或对应页面目录)

你是产品架构师。

基于 DESIGN_LANGUAGE.md，
请为【页面名称】输出页面结构草图：

要求：
1. 列出页面一级区块（Header / Main / Footer 等）
2. 每个区块说明「存在目的」
3. 明确主信息 / 次信息 / 操作区

限制：
- 不允许描述颜色、字体、尺寸
- 不允许提 UI 组件名（Button / Card 等）

只输出结构化列表。

---

## Prompt 03｜组件树拆解（决定是否好改）

📁 保存为：`/src/popup/components.md`

你是前端架构师。

基于页面结构草图，请拆解组件树：

1. 使用树状结构表示组件层级
2. 标注每个组件的职责
3. 指出哪些是「纯展示组件」(components/ui)
4. 指出哪些是「业务组件」(components/business)

规则：
- 不写样式
- 不写代码
- 一个组件只允许一个职责

输出为 Markdown。

---

## Prompt 04｜Design Tokens 生成 (Tailwind Config)

📁 保存为：`tailwind.config.ts` (Snippet)

你是设计系统工程师。

基于 DESIGN_LANGUAGE.md，
请生成一套 Design Tokens，用于 Tailwind CSS 配置。

必须包含 `theme.extend` 下的：
- spacing (page / section / card / stack / ...)
- fontSize (h1 / body / sub / hint / ...)
- colors (bg / text / border / brand / ...)
- borderRadius
- boxShadow

规则：
- 命名必须语义化
- 不允许出现 magic number
- 不要和具体组件强绑定

输出为 TypeScript 代码片段。

---

## Prompt 05｜组件实现（第一次写代码）

📁 Cursor 中直接使用

你现在是资深前端工程师。

输入资料：
- DESIGN_LANGUAGE.md
- components.md
- tailwind.config.ts (Tokens)

实现要求：
1. 严格按组件树实现
2. 样式只能引用 Tailwind Utility Classes (基于 Config)
3. 不允许写 Arbitrary Values (如 `w-[100px]`)
4. 不允许调整结构

请使用 React + Tailwind CSS 实现。

---

## Prompt 06｜安全修改样式（最常用）

📁 Cursor 中直接使用

请在【不修改组件结构、不新增组件】的前提下：

- 仅通过调整 `tailwind.config.ts` 中的 tokens
- 优化整体视觉节奏
- 目标：更轻、更克制、更耐看

禁止：
- 重写样式逻辑
- 修改 JSX / 结构代码

👉 这是你之后用得最多的 Prompt
