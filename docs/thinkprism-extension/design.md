# Design Document: ThinkPrism Extension

## Overview

ThinkPrism is a Chrome extension (Manifest V3) that lets users inject structured AI thinking-mode instructions into any supported AI chat page with a single click. The extension is purely client-side: no backend, no telemetry. All state lives in `chrome.storage`. The UI is a Popup (≤ 400px wide) and an Options page, built with Vanilla JS or Preact for minimal bundle size.

Key design goals:
- Popup cold-start < 200 ms
- Bundle size < 500 KB
- Zero network requests at runtime (optional remote modes.json fetch is opt-in)
- Fully auditable open-source code (MIT)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser Tab (AI chat page)                         │
│  ┌──────────────────────────────────────────────┐   │
│  │  content.js  (injected on demand via         │   │
│  │              chrome.scripting.executeScript) │   │
│  │  - Finds input box by selector               │   │
│  │  - Inserts text / retries / falls back       │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         ▲  chrome.tabs.sendMessage / executeScript
         │
┌────────┴────────────────────────────────────────────┐
│  popup.html + popup.js  (Popup UI)                  │
│  - Scene recommender                                │
│  - Mode list / search / tabs                        │
│  - Combination builder                              │
│  - Feedback card                                    │
│  - Onboarding card                                  │
└────────┬────────────────────────────────────────────┘
         │  chrome.storage.sync / .local
┌────────┴────────────────────────────────────────────┐
│  options.html + options.js  (Options Page)          │
│  - Whitelist & selector editor                      │
│  - Custom mode editor                               │
│  - Import / Export                                  │
│  - Language switcher                                │
└─────────────────────────────────────────────────────┘
         │
┌────────┴────────────────────────────────────────────┐
│  /data/modes.json   (bundled, read-only at runtime) │
│  /data/sites.json   (bundled default whitelist)     │
│  /src/locales.json  (en + zh UI strings)            │
└─────────────────────────────────────────────────────┘
```

No persistent background service worker is required for MVP. `chrome.scripting.executeScript` is called from the Popup directly when the user clicks Insert.

---

## Components and Interfaces

### 1. ModeStore

Responsible for loading and merging built-in modes (from `modes.json`) with user-defined custom modes (from `chrome.storage.sync`).

```ts
interface Mode {
  id: string;           // unique, kebab-case, e.g. "red-team"
  level: "L1" | "L2" | "L3" | "persistent";
  title: string;
  emoji?: string;
  template: string;     // may contain placeholders like [内容]
  trigger?: string;     // e.g. "/redteam"
  tags?: string[];      // e.g. ["风险", "对抗"]
  nextStep?: string;    // id of recommended follow-up mode
  sceneTags?: SceneKey[]; // which scene buttons surface this mode
}

type SceneKey = "product" | "code" | "decision" | "learning";

interface ModeStore {
  getAll(): Mode[];
  getById(id: string): Mode | undefined;
  getByScene(scene: SceneKey): Mode[];
  search(query: string): Mode[];
  addCustom(mode: Mode): Promise<void>;
  removeCustom(id: string): Promise<void>;
}
```

### 2. InstructionBuilder

Assembles the final instruction string from selected modes and user input.

```ts
interface InstructionBuilder {
  build(params: {
    persistent?: Mode;
    l3?: Mode;
    l2?: Mode;
    l1Modes: Mode[];
    selectedText?: string;
  }): string;
}
```

Assembly order: `[persistent]\n\n[l3]\n\n[l2]\n\n[l1 combination] [placeholder or selectedText]`

### 3. InjectionService

Handles communication with the content script and clipboard fallback.

```ts
interface InjectionResult {
  success: boolean;
  method: "injected" | "clipboard";
  error?: string;
}

interface InjectionService {
  inject(tabId: number, text: string): Promise<InjectionResult>;
}
```

Content script (`content.js`) logic:
1. Receive `{ action: "insert", text }` message
2. Try `document.querySelector(selector)` → focus → set value / dispatchEvent
3. On failure: wait 500 ms, retry up to 3 times
4. On final failure: respond with `{ success: false }`

### 4. StorageService

Thin wrapper around `chrome.storage` with typed keys.

```ts
interface StorageData {
  persistentModeId?: string;
  customModes?: Mode[];
  siteConfigs?: SiteConfig[];
  language?: "en" | "zh";
  onboardingDone?: boolean;
  lastInsert?: { modeId: string; timestamp: number };
}
```

### 5. SceneRecommender

```ts
interface SceneRecommender {
  recommend(scene: SceneKey): Mode[];  // returns 1-3 modes
}
```

Derived from `Mode.sceneTags` — no hard-coded mapping in JS.

### 6. FeedbackEngine

```ts
interface FeedbackEngine {
  shouldShowFeedback(lastInsert: { modeId: string; timestamp: number }): boolean;
  getSuggestion(modeId: string, store: ModeStore): Mode | undefined;
}
// shouldShowFeedback returns true when Date.now() - timestamp >= 3 * 60 * 1000
```

### 7. I18nService

```ts
interface I18nService {
  t(key: string): string;  // falls back to "en" if key missing in selected lang
  setLanguage(lang: "en" | "zh"): void;
}
```

---

## Data Models

### modes.json (single entry example)

```json
{
  "id": "red-team",
  "level": "L1",
  "title": "红队测试",
  "emoji": "🔴",
  "template": "🔴 红队：[内容]",
  "trigger": "/redteam",
  "tags": ["风险", "对抗", "批判"],
  "sceneTags": ["product", "code"],
  "nextStep": "metacognition-check"
}
```

### sites.json (single entry example)

```json
{
  "id": "chatgpt",
  "label": "ChatGPT",
  "matches": "*://chat.openai.com/*",
  "selector": "textarea[id^='prompt-textarea']",
  "note": "经常改版，需社区监控"
}
```

### chrome.storage schema

```json
{
  "persistentModeId": "hardcore-critic",
  "customModes": [],
  "siteConfigs": [],
  "language": "zh",
  "onboardingDone": false,
  "lastInsert": { "modeId": "red-team", "timestamp": 1709123456789 }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Instruction assembly order

*For any* combination of persistent, L3, L2, and L1 modes, the assembled instruction string SHALL contain the persistent section before L3, L3 before L2, and L2 before L1.

**Validates: Requirements 6.1**

---

### Property 2: Placeholder substitution

*For any* mode template containing one or more placeholder tokens (e.g., `[内容]`) and any non-empty selected text, the built instruction SHALL contain the selected text in place of the first placeholder and SHALL NOT contain the raw placeholder token.

**Validates: Requirements 1.3**

---

### Property 3: Search filter correctness

*For any* search query string and any mode list, every mode returned by `ModeStore.search()` SHALL have its title, emoji, or at least one tag containing the query string (case-insensitive); no mode whose title, emoji, and tags all exclude the query SHALL appear in the results.

**Validates: Requirements 1.2**

---

### Property 4: Scene recommendation subset

*For any* scene key, every mode returned by `SceneRecommender.recommend()` SHALL have that scene key present in its `sceneTags` array, and the count of returned modes SHALL be between 1 and 3 inclusive (when at least one matching mode exists).

**Validates: Requirements 3.2, 3.4**

---

### Property 5: Feedback timing gate

*For any* `lastInsert` record, `FeedbackEngine.shouldShowFeedback()` SHALL return `true` if and only if the elapsed time since `timestamp` is greater than or equal to 180,000 milliseconds (3 minutes).

**Validates: Requirements 4.2**

---

### Property 6: Persistent mode singleton

*For any* sequence of persistent-mode set operations, after each operation the value stored under `persistentModeId` in chrome.storage SHALL equal the id of the most recently set mode; at most one persistent mode id SHALL be stored at any time.

**Validates: Requirements 5.1, 5.3**

---

### Property 7: modes.json round-trip serialization

*For any* valid `Mode` object, serializing it to JSON and deserializing it SHALL produce an object that is deeply equal to the original.

**Validates: Requirements 9.1, 9.2, 9.3**

---

### Property 8: i18n fallback completeness

*For any* locale key present in the `en` locale file, `I18nService.t(key)` SHALL return a non-empty string regardless of the currently selected language.

**Validates: Requirements 10.4**

---

### Property 9: Combination clear resets state

*For any* non-empty mode selection, after the user clicks "清空组合", `InstructionBuilder.build()` called with the cleared state SHALL return an empty string (or the persistent-only prefix if a persistent mode is active).

**Validates: Requirements 6.3**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Input box not found after 3 retries | Copy to clipboard + Toast "未找到输入框，已复制到剪贴板。请手动粘贴。" |
| Page not on whitelist | Copy to clipboard + Toast "当前页面不支持自动插入，已复制到剪贴板" |
| Instruction exceeds maxLength | Truncate + Toast "指令过长，已截断" |
| Insert clicked with no mode selected | Button disabled; Toast "请先选择至少一个思维模式" |
| Import JSON schema invalid | Toast "导入文件格式错误，请使用 JSON 或兼容 Markdown" |
| Options: empty selector on save | Inline validation error, save blocked |
| i18n key missing | Silent fallback to `en` locale |

---

## Testing Strategy

### Property-Based Testing

Library: **fast-check** (TypeScript/JavaScript, well-maintained, works in Jest/Vitest).

Each correctness property above maps to exactly one property-based test. Tests are configured to run a minimum of **100 iterations** each.

Every property-based test MUST be tagged with a comment in this exact format:
`// Feature: thinkprism-extension, Property {N}: {property_text}`

### Unit Testing

Framework: **Vitest** (fast, ESM-native, compatible with browser extension code).

Unit tests cover:
- `InstructionBuilder.build()` with specific mode combinations
- `FeedbackEngine.shouldShowFeedback()` boundary values (179,999 ms → false, 180,000 ms → true)
- `I18nService.t()` with known keys and missing keys
- `StorageService` read/write with mocked `chrome.storage`
- Content script injection logic with a mocked DOM

### Integration / E2E

Framework: **Playwright** with `chrome` channel (optional, marked as non-MVP).

Covers the full user flow: open Popup → select mode → click insert → verify text appears in a test page's textarea.
