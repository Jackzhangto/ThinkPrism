---
name: frontend-design
description: 前端设计技能。支持 Web、React、Vue、Taro（含小程序与 H5）。按「前端设计工作流」分阶段执行，遵守 Design Token 与组件规范强约束；在 blessing-app-multi（爱祝福小程序）下必须同时遵守《微信小程序样式规范-爱祝福实施》。Invoke when user says "前端设计技能" or for web/Taro components, pages, or any UI requiring distinctive visual execution.
---

# Frontend Design Skill

**呼唤词**：说「前端设计技能」即可唤起。唤起后按**项目绑定**→**工作流**→**Token/组件规则**→**强约束**执行，再进入美学方向与实现。

---

## 0. 项目绑定（优先）

- **若当前项目为 blessing-app-multi（爱祝福小程序）**：  
  **必须**同时遵守项目内 `docs/微信小程序样式规范-爱祝福实施.md`。包括但不限于：
  - 三层 CSS 架构：`app.scss` 仅引入 variables / reset / utilities；Design Tokens 在 `styles/variables.scss` 的 `page` 与 `[data-theme="red"], .theme-red` 下。
  - App 根节点与各 tab 页根节点必须带 `className` 包含 `theme-red`、`data-theme="red"`。
  - 页面/组件样式禁止 Hex、裸 rpx；必须使用 `var(--color-*)`、`var(--spacing-*)` 等与 `utilities.scss` 工具类；组件定制通过 externalClasses。
- **其他项目**：按本节之后的工作流与 Token/组件规则执行；Token 可落地为 `design/tokens.json` 或 `design/tokens/*.ts` 或项目既有 variables 体系。通用标准可参考项目内 `docs/前端设计工作流/ThinkPrism 标准前端样式规范.md`。

---

## 1. 前端设计工作流（DESIGN）

**原则**：一个阶段 = 一个 Prompt；一个 Prompt 只做一件事；**输出必须保存为文件**（md / json）。禁止一个 Prompt 既设计又写代码、不保存中间产物、或笼统“整体优化页面”。

| 阶段 | 产出 | 说明 |
|------|------|------|
| **01 设计语言冻结** | `design/DESIGN_LANGUAGE.md` | 设计气质关键词、排除风格、页面密度、视觉层级、交互克制；不输出代码。 |
| **02 页面结构草图** | `pages/{page-name}/structure.md` | 一级区块（Header/Main/Aside/Footer）、存在目的、主/次信息与操作区；不描述颜色/字体/尺寸，不提具体 UI 组件名。 |
| **03 组件树拆解** | `pages/{page-name}/components.md` | 树状组件层级、职责、纯展示 vs 业务组件；不写样式与代码，一组件一职责。 |
| **04 Design Tokens** | `design/tokens.json`（或项目既有 variables） | spacing / fontSize / color / radius（及 shadow）；语义化命名、无 magic number、不与具体组件强绑定。 |
| **05 组件/页面实现** | 代码 | 严格按组件树 + 只引用 tokens；不写临时数值、不擅自改结构。Taro 项目用 Taro 组件与项目规范（如爱祝福实施）。 |
| **06 安全改样式** | 仅改 tokens / variables | 不改组件结构、不新增组件；只通过调整 design tokens 优化视觉节奏。 |
| **07 局部组件优化** | 仅该组件 | 只针对指定组件优化 spacing/typography；不改 tokens、不改其他组件、不改变 props 接口。 |
| **08 视觉问题定位** | 诊断结论（不写代码） | 从信息层级、留白节奏、视觉重心、重复元素分析；给出「改 token / 结构 / 内容」建议。 |
| **09 重构前警告** | 风险提示 | 从可维护性、视觉一致性、扩展成本给出“若直接改代码”的风险。 |

**推荐目录**：`design/`（DESIGN_LANGUAGE.md、tokens.json）、`pages/{page-name}/`（structure.md、components.md、index.tsx）。上下文齐全时再写代码。

---

## 2. Token 与组件规范（组件规范）

### 2.1 总体原则

- 组件**永远不直接使用具体数值**（禁止 magic number）。
- 组件只认识**语义 Token**，不认识设计意图。
- **Layout Token ≠ 视觉 Token**（页面级 layout 仅页面容器用；普通组件不准引用 layout）。
- **业务组件 ≠ 视觉组件**：展示组件可用 tokens；业务组件不准直接引用 design tokens，只能组合展示组件。

### 2.2 Token 分层（概念层，与爱祝福 variables 对应）

- **Layout**：页面级（pageMaxWidth、pagePaddingX、sectionGap、headerHeight 等）→ 仅页面容器使用。
- **Spacing**：xs/sm/md/lg/xl 及 page/section/card/stack → 用于 gap、padding；严禁随意写 14、18 等。
- **Typography**：h1/h2/h3、body/sub/hint；fontWeight。组件不准自定义字号；标题用 h*，正文用 body/sub。
- **Color**：按用途命名（bg、text、brand、border），禁止 blue500 / gray300 类命名。
- **Radius / Shadow**：统一语义（如 card、button、sm/md/lg）。

在 **爱祝福** 项目中，以上对应到 `styles/variables.scss` 的 `--spacing-*`、`--font-*`、`--color-*`、`--radius-*`、`--shadow-*`；禁止在业务 scss 中写 Hex、裸 rpx。

### 2.3 组件与 Token 映射

- **布局组件**：只允许使用 spacing、color.bg、radius；禁止 font/shadow。
- **文本组件**：只使用 fontSize、color、fontWeight；**禁止在 Text 上设 margin**，由外层容器负责 spacing。
- **Card 类**：承载内容、不处理业务逻辑；样式来自 padding/radius/background/shadow tokens。
- **Button 类**：padding、radius、background、hover 等来自 tokens。

---

## 3. 强约束规则（Cursor Rules）

- **角色**：你是工程执行者，不是自由创作设计师。不允许凭感觉优化 UI、未明确指示下改变视觉风格、或同时改结构+样式+逻辑。
- **Design Token 强制**：禁止在组件中直接写数值样式（margin/padding/gap、font-size、color、radius、shadow）。所有样式必须来自 Design Tokens；禁止 magic number；禁止私自新增 Token（除非用户明确要求）。
- **结构安全**：未明确要求前，禁止删除/新增组件、调整组件层级。用户说“优化/微调/更好看”时，**默认只允许修改 Design Tokens**，不改 JSX/结构。需改结构时先说明原因，等用户确认后再动。
- **修改前自检**：输出前确认——是否所有样式都来自 tokens？是否误改了层级或破坏了组件职责边界？任一条不满足则停止并调整方案。
- **输出风格**：代码优先可读性；不输出多余解释与“设计理由”（除非用户要求）；稳定 > 漂亮，可维护 > 一次性效果。

---

## 4. Operating Mode（美学执行顺序）

在遵守 0–3 的前提下，写代码前完成：

1. **Context**：目的、用户、领域、内容密度；输出问题陈述。
2. **Aesthetic Direction**：从 Section 5 选一个 archetype 并明确声明。
3. **Differentiator**：一个可记忆的锚点（交互、排版、布局、纹理等）。
4. **System**：与项目 Token 对齐（type scale、spacing、palette、elevation）。
5. **Implementation**：先结构/交互提纲，再实现；不偏离已冻结的设计语言与组件树。

**Directive**：选定方向后贯彻到底，不把多种风格折中成平庸中间态。

---

## 5. Aesthetic Archetypes

选一个作为基础：Editorial / Swiss / Brutalist / Minimalist / Maximalist / Retro-Futuristic / Organic / Industrial / Art Deco / Lo-Fi（具体描述见原技能，此处略）。

---

## 6. Technical Implementation

- **Typography / Color / Motion / Spatial / Depth**：与项目 tokens 对齐，禁止裸数值；排版层级、配色、动效、留白、阴影均从 Token 或设计语言推导，不写 magic number。
- **Taro / 小程序**：  
  - 变量用 `page { }` 与 `[data-theme]`、`.theme-red`（爱祝福必须）；组件用 Taro 组件；单位以 rpx 为主；动效与阴影在小程序端克制。  
  - **爱祝福项目**：必须同时满足 `docs/微信小程序样式规范-爱祝福实施.md`（三层架构、theme 根节点、var + 工具类、externalClasses）。

---

## 7. Anti-Patterns

禁止：系统字体栈、Inter/Roboto/Arial、均匀字号；紫色白底渐变、低对比；居中卡片网格、hero→cards→footer 套路；无意义动效、linear 缓动；通用插画/图标；无意图的占位结构。

---

## 8. Output Contract

- 声明方向（archetype + differentiator）。
- 可运行代码，且样式全部来自 tokens / variables。
- 响应式或小程序多端可接受。

---

## 9. Finish Checklist

- 每个视觉选择是否符合已声明的 archetype 与设计语言？
- 是否所有样式都来自 tokens，无 Hex/裸 rpx（爱祝福）或 magic number？
- 是否未擅自改结构或组件职责？

---

**与爱祝福实施、Tora 标准的关系**：当项目为 blessing-app-multi 时，本节 1–9 与 `docs/微信小程序样式规范-爱祝福实施.md` 同时生效；冲突时以该文档为准。爱祝福实施本身对齐《一个 Tora 的标准前端样式规范》；非爱祝福项目可直接以 Tora 标准 + 本技能工作流执行。
