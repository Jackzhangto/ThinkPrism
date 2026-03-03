# Requirements Document

## Introduction

ThinkPrism 是一款开源的 Google Chrome 浏览器插件，基于《AI 思维模式激活指令手册 (Lyra Edition · V3.0)》，让用户在与 ChatGPT、Claude、DeepSeek、通义千问、豆包、Grok 等 AI 进行对话时，能够快速激活多层级思维模式指令（L1 微指令、L2 黄金剧本、L3 百科模式、持久化设定），实现热键式无缝切换，提升对话质量与深度。插件采用 Manifest V3、Vanilla JS / Preact，纯本地运行，无后端服务器，MIT 开源。

## Glossary

- **ThinkPrism**：本插件产品名称
- **Popup**：点击浏览器扩展图标后弹出的主操作界面
- **选项页（Options Page）**：扩展的设置页面，用于配置白名单、selector、语言等
- **Content Script**：注入到目标网页中运行的脚本，负责向输入框插入文本
- **L1 微指令**：单条思维标签，如 `🔴 红队：`、`🧠 推理：`，即插即用
- **L2 黄金剧本**：多步骤思维链触发指令，如 `/product-polish`、`/code-fortress`
- **L3 百科模式**：完整长指令框架，如 Lyra 标准版、事前验尸等
- **持久化模式**：整段对话保持同一人设/风格的设定，如 🅰️ 硬核批判伙伴
- **模式推荐引擎**：根据用户当前场景推荐合适思维模式的功能模块
- **模式执行反馈**：用户插入指令后约 3 分钟，再次打开 Popup 时展示后续建议的功能
- **占位符**：指令模板中的可替换文本，如 `[内容]`、`[待分析文本]`
- **Toast**：操作后短暂显示的轻量通知提示
- **modes.json**：存储所有内置思维模式数据的 JSON 配置文件
- **selector**：用于定位目标网页输入框的 CSS 选择器字符串
- **白名单**：允许插件自动注入的 AI 站点列表
- **Manifest V3**：Chrome 扩展的第三代清单规范
- **chrome.storage**：Chrome 扩展提供的本地/同步存储 API
- **Onboarding**：新用户首次安装后的引导流程

---

## Requirements

### Requirement 1

**User Story:** As a user, I want to browse, search, and select thinking modes from the Popup, so that I can quickly find and apply the right mode for my current task.

#### Acceptance Criteria

1. WHEN the user opens the Popup, THE ThinkPrism SHALL display thinking modes organized by level tabs (L1 / L2 / L3 / Persistent).
2. WHEN the user types in the search box, THE ThinkPrism SHALL filter the displayed modes in real time to show only those whose title, emoji, or tags match the input.
3. WHEN the user selects a mode that contains a placeholder (e.g., `[内容]`), THE ThinkPrism SHALL pre-fill the placeholder with any text the user has selected on the current AI page; if no text is selected, THE ThinkPrism SHALL retain the placeholder as-is.
4. WHEN the user clicks the insert button with no mode selected, THE ThinkPrism SHALL disable the insert button and display a Toast: "请先选择至少一个思维模式".
5. WHEN the Popup opens, THE ThinkPrism SHALL complete rendering and become fully interactive within 200 milliseconds.

---

### Requirement 2

**User Story:** As a user, I want the extension to automatically inject the generated instruction into the AI chat input box, so that I don't have to copy and paste manually.

#### Acceptance Criteria

1. WHEN the user clicks the insert button on a whitelisted AI site, THE ThinkPrism SHALL inject the generated instruction text into the page's input box without replacing existing content.
2. WHEN the Content Script cannot locate the input box selector on the first attempt, THE ThinkPrism SHALL retry up to 3 times with a 500ms delay between each attempt before falling back to clipboard copy.
3. IF the current page is not on the whitelist, THEN THE ThinkPrism SHALL copy the instruction to the clipboard and display a Toast: "当前页面不支持自动插入，已复制到剪贴板".
4. IF the Content Script fails to find the input box after all retries, THEN THE ThinkPrism SHALL copy the instruction to the clipboard and display a Toast: "未找到输入框，已复制到剪贴板。请手动粘贴。"
5. WHEN the instruction text exceeds the input box's maxLength attribute, THE ThinkPrism SHALL truncate the instruction and display a Toast: "指令过长，已截断".

---

### Requirement 3

**User Story:** As a user, I want a scene-based recommendation engine at the top of the Popup, so that I can get relevant mode suggestions without having to browse the full list.

#### Acceptance Criteria

1. WHEN the Popup opens, THE ThinkPrism SHALL display a fixed header area with the prompt "你现在在做什么？" and four scene buttons: "我在做产品" / "我在写代码" / "我在做决策" / "我在学习".
2. WHEN the user clicks a scene button, THE ThinkPrism SHALL display 1 to 3 recommended modes for that scene and provide a one-click insert action for each.
3. WHEN the user clicks a recommended mode's insert button, THE ThinkPrism SHALL generate and inject the instruction following the same rules as Requirement 2.
4. THE ThinkPrism SHALL derive scene-to-mode mappings from the `tags` field or a dedicated scene mapping in modes.json, so that adding new modes with matching tags automatically updates recommendations.

---

### Requirement 4

**User Story:** As a user, I want the extension to suggest a follow-up action after I have used a mode, so that I can deepen my thinking without having to remember what to do next.

#### Acceptance Criteria

1. WHEN the user successfully inserts an instruction, THE ThinkPrism SHALL record the insertion timestamp and the mode id in chrome.storage.local.
2. WHEN the user reopens the Popup and at least 3 minutes have elapsed since the last recorded insertion, THE ThinkPrism SHALL display a follow-up suggestion card (e.g., "是否使用 🔍 元认知自检？") with a one-click insert action.
3. THE ThinkPrism SHALL derive follow-up suggestions from a configurable "next-step" mapping in modes.json (e.g., red-team → metacognition-check), so that the logic is data-driven and not hard-coded.
4. WHEN the user inserts the suggested follow-up instruction, THE ThinkPrism SHALL clear the suggestion card and update the last-insertion record.

---

### Requirement 5

**User Story:** As a user, I want to set a persistent mode that automatically prepends a persona instruction to every message, so that I can maintain a consistent thinking style throughout a conversation.

#### Acceptance Criteria

1. WHEN the user selects a persistent mode and confirms, THE ThinkPrism SHALL write the selected mode id to chrome.storage.sync and display a Toast: "已设置持久化模式为：[模式名]".
2. WHILE a persistent mode is active, THE ThinkPrism SHALL prepend the persistent instruction before any other instruction text when generating the final combined instruction.
3. WHEN the user selects a different persistent mode, THE ThinkPrism SHALL overwrite the previous setting; only one persistent mode SHALL be active at a time.
4. WHEN the user clears the persistent mode, THE ThinkPrism SHALL remove the setting from chrome.storage.sync and display a Toast confirming the reset.

---

### Requirement 6

**User Story:** As a user, I want to combine multiple modes into a single instruction, so that I can apply layered thinking in one action.

#### Acceptance Criteria

1. WHEN the user selects multiple modes (via Ctrl+click or a combination builder), THE ThinkPrism SHALL assemble the final instruction in the order: Persistent → L3 → L2 → L1, separated by double newlines.
2. WHEN the user has selected N modes, THE ThinkPrism SHALL display "已选 N 个模式" and provide a "清空组合" button.
3. WHEN the user clicks "清空组合", THE ThinkPrism SHALL deselect all modes and reset the combination area.

---

### Requirement 7

**User Story:** As a new user, I want an onboarding experience when I first install the extension, so that I can understand how to use it and complete my first successful insertion.

#### Acceptance Criteria

1. WHEN the user opens the Popup for the first time (onboarding_done is not set in chrome.storage), THE ThinkPrism SHALL display a welcome card with 3 recommended modes and a one-click insert example.
2. WHEN the user successfully completes one insertion during onboarding, THE ThinkPrism SHALL set onboarding_done in chrome.storage and hide the welcome card.
3. WHERE the user has previously dismissed onboarding, THE ThinkPrism SHALL not display the welcome card on subsequent Popup opens.

---

### Requirement 8

**User Story:** As a user, I want to manage supported sites and input box selectors in the Options page, so that I can fix broken site integrations without waiting for an extension update.

#### Acceptance Criteria

1. WHEN the user opens the Options page, THE ThinkPrism SHALL display the current whitelist of AI sites with their corresponding CSS selectors.
2. WHEN the user edits a selector and saves, THE ThinkPrism SHALL persist the updated selector to chrome.storage.sync and use it for all subsequent injections on that site.
3. WHEN the user adds a new site entry with a valid URL pattern and selector, THE ThinkPrism SHALL add it to the whitelist and make it available immediately.
4. IF the user saves a site entry with an empty selector, THEN THE ThinkPrism SHALL display a validation error and prevent saving.

---

### Requirement 9

**User Story:** As a user, I want to create, edit, import, and export custom modes, so that I can extend the extension with my own thinking patterns.

#### Acceptance Criteria

1. WHEN the user creates a custom mode with a unique id, level, title, and template, THE ThinkPrism SHALL save it to chrome.storage.sync and display it in the mode list alongside built-in modes.
2. WHEN the user exports configuration, THE ThinkPrism SHALL generate a JSON file containing all custom modes and the current whitelist configuration.
3. WHEN the user imports a JSON file, THE ThinkPrism SHALL merge the imported custom modes with existing ones; IF a mode id already exists, THEN THE ThinkPrism SHALL prompt the user to confirm overwrite.
4. IF the imported JSON file does not conform to the modes.json schema, THEN THE ThinkPrism SHALL display a Toast: "导入文件格式错误，请使用 JSON 或兼容 Markdown".

---

### Requirement 10

**User Story:** As a user, I want the extension UI to support both English and Chinese, so that I can use it in my preferred language.

#### Acceptance Criteria

1. WHEN the user selects a language (English / 中文) in the Options page, THE ThinkPrism SHALL persist the selection to chrome.storage.sync.
2. WHEN the Popup or Options page loads, THE ThinkPrism SHALL render all UI text (labels, buttons, Toasts, error messages) in the language stored in chrome.storage.sync.
3. THE ThinkPrism SHALL provide complete locale files for both `en` and `zh` covering all UI strings in the Popup and Options page.
4. WHEN a locale key is missing in the selected language file, THE ThinkPrism SHALL fall back to the `en` locale for that key.

---

### Requirement 11

**User Story:** As a developer or auditor, I want the extension to operate with minimal permissions and no background data collection, so that I can trust it is safe to install.

#### Acceptance Criteria

1. THE ThinkPrism SHALL request only the permissions: `storage`, `activeTab`, and `scripting` in its manifest.
2. THE ThinkPrism SHALL not transmit any user input text, conversation content, or personal data to any external server.
3. THE ThinkPrism SHALL not execute any content script injection unless the user explicitly clicks the insert button.
4. THE ThinkPrism SHALL not register any persistent background listeners that monitor keyboard input or page content.
