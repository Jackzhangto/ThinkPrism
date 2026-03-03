# Implementation Plan

- [ ] 1. Set up project structure and tooling
  - Create directory layout: `/src` (popup, options, content, shared), `/data` (modes.json, sites.json), `/_locales` or `/src/locales.json`, `/schema`
  - Configure `manifest.json` (Manifest V3) with permissions: `storage`, `activeTab`, `scripting`
  - Set up Vitest + fast-check for testing; configure `vitest.config.ts`
  - _Requirements: 11.1_

- [ ] 2. Implement data layer and ModeStore
- [ ] 2.1 Author `modes.json` with initial built-in modes (L1/L2/L3/persistent) and `sites.json` with default whitelist
  - Each mode must include: `id`, `level`, `title`, `template`; optional: `emoji`, `trigger`, `tags`, `sceneTags`, `nextStep`
  - _Requirements: 1.1, 3.4, 4.3_

- [ ] 2.2 Implement `ModeStore` class
  - Load built-in modes from `modes.json`; merge with `customModes` from `chrome.storage.sync`
  - Implement `getAll()`, `getById()`, `getByScene()`, `search()`, `addCustom()`, `removeCustom()`
  - _Requirements: 1.2, 3.2, 9.1_

- [ ] 2.3 Write property test for search filter correctness
  - **Property 3: Search filter correctness**
  - **Validates: Requirements 1.2**

- [ ] 2.4 Write property test for scene recommendation subset
  - **Property 4: Scene recommendation subset**
  - **Validates: Requirements 3.2, 3.4**

- [ ] 2.5 Write property test for modes.json round-trip serialization
  - **Property 7: modes.json round-trip serialization**
  - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 3. Implement `InstructionBuilder`
- [ ] 3.1 Implement `InstructionBuilder.build()` with assembly order: Persistent → L3 → L2 → L1, separated by double newlines
  - Handle placeholder substitution: replace first `[placeholder]` token with `selectedText` when provided
  - _Requirements: 1.3, 5.2, 6.1_

- [ ] 3.2 Write property test for instruction assembly order
  - **Property 1: Instruction assembly order**
  - **Validates: Requirements 6.1**

- [ ] 3.3 Write property test for placeholder substitution
  - **Property 2: Placeholder substitution**
  - **Validates: Requirements 1.3**

- [ ] 3.4 Write property test for combination clear resets state
  - **Property 9: Combination clear resets state**
  - **Validates: Requirements 6.3**

- [ ] 4. Implement `StorageService` and `FeedbackEngine`
- [ ] 4.1 Implement `StorageService` as a typed wrapper around `chrome.storage.sync` and `.local`
  - Typed keys: `persistentModeId`, `customModes`, `siteConfigs`, `language`, `onboardingDone`, `lastInsert`
  - _Requirements: 5.1, 5.3, 5.4, 7.2, 10.1_

- [ ] 4.2 Implement `FeedbackEngine`
  - `shouldShowFeedback()`: returns true when `Date.now() - timestamp >= 180000`
  - `getSuggestion()`: looks up `mode.nextStep` in ModeStore
  - _Requirements: 4.2, 4.3_

- [ ] 4.3 Write property test for feedback timing gate
  - **Property 5: Feedback timing gate**
  - **Validates: Requirements 4.2**

- [ ] 4.4 Write property test for persistent mode singleton
  - **Property 6: Persistent mode singleton**
  - **Validates: Requirements 5.1, 5.3**

- [ ] 5. Implement `InjectionService` and `content.js`
- [ ] 5.1 Implement `content.js`: receive `{ action: "insert", text }` message, locate input box by selector, insert text without replacing existing content, retry up to 3 times with 500ms delay, respond with `{ success: boolean }`
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 5.2 Implement `InjectionService` in Popup: check whitelist, call `chrome.scripting.executeScript` to inject content.js, handle `injected` vs `clipboard` fallback, show appropriate Toast
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 6. Implement `I18nService` and locale files
- [ ] 6.1 Create `locales.json` (or `_locales/en/messages.json` + `_locales/zh_CN/messages.json`) with all UI strings for Popup and Options page in both `en` and `zh`
  - _Requirements: 10.3_

- [ ] 6.2 Implement `I18nService`: `t(key)` reads from selected language, falls back to `en` for missing keys; `setLanguage()` persists to `chrome.storage.sync`
  - _Requirements: 10.2, 10.4_

- [ ] 6.3 Write property test for i18n fallback completeness
  - **Property 8: i18n fallback completeness**
  - **Validates: Requirements 10.4**

- [ ] 7. Build Popup UI
- [ ] 7.1 Implement Popup HTML/JS skeleton: scene recommender header, mode list with level tabs, search box, combination builder area, insert button, Toast component
  - _Requirements: 1.1, 1.4, 3.1, 6.2_

- [ ] 7.2 Wire scene recommender: clicking a scene button calls `SceneRecommender.recommend()` and renders 1-3 mode cards with one-click insert
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7.3 Wire mode search: input event calls `ModeStore.search()` and re-renders the list
  - _Requirements: 1.2_

- [ ] 7.4 Wire multi-mode combination: Ctrl+click to select/deselect modes, display "已选 N 个模式", "清空组合" button
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7.5 Wire insert button: call `InstructionBuilder.build()` then `InjectionService.inject()`, record `lastInsert` in storage, show Toast
  - _Requirements: 2.1, 4.1_

- [ ] 7.6 Implement feedback card: on Popup open, check `FeedbackEngine.shouldShowFeedback()`; if true, render suggestion card with one-click insert
  - _Requirements: 4.2, 4.4_

- [ ] 7.7 Implement onboarding card: on Popup open, check `onboardingDone`; if false, render welcome card with 3 recommended modes and insert example; set `onboardingDone` after first successful insert
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7.8 Apply i18n to all Popup UI strings using `I18nService.t()`
  - _Requirements: 10.2_

- [ ] 8. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Build Options page UI
- [ ] 9.1 Implement Options page: whitelist table (site label, matches pattern, selector), add/edit/delete rows, save to `StorageService`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 9.2 Implement custom mode editor: list custom modes, add/edit/delete form, validate required fields (id, level, title, template)
  - _Requirements: 9.1_

- [ ] 9.3 Implement import/export: export button generates JSON file download; import button reads JSON file, validates against schema, merges with existing custom modes, prompts on id conflict
  - _Requirements: 9.2, 9.3, 9.4_

- [ ] 9.4 Implement language switcher: "English / 中文" toggle, persists to storage, reloads UI strings
  - _Requirements: 10.1, 10.2_

- [ ] 9.5 Apply i18n to all Options page UI strings
  - _Requirements: 10.2_

- [ ] 10. Persistent mode UI (Popup)
  - Add "持久化" tab in Popup mode list; clicking a persistent mode sets it via `StorageService`; display current active persistent mode name in Popup header; provide clear button
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 11. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.
