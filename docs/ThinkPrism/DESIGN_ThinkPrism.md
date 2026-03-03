# DESIGN_ThinkPrism: 技术架构设计文档

## 1. 系统概述

**ThinkPrism** 是一款基于 React + Vite + TypeScript 构建的 Chrome 扩展 (Manifest V3)。
它作为 AI 对话的"思维模式增强器"，通过 Popup 界面提供多层级指令（L1/L2/L3/Persistent）的快速选择、组合与注入功能。

### 1.1 设计目标

- **高性能**: Popup 冷启动 < 200ms (基于 React + Vite 优化构建)。
- **零依赖**: 纯客户端运行，无后端服务，所有数据存储在 `chrome.storage`。
- **类型安全**: 全面采用 TypeScript，确保核心逻辑（如指令组装）的正确性。
- **可测试性**: 核心业务逻辑与 UI 解耦，支持 Vitest + fast-check 进行属性测试。
- **易维护**: 组件化架构，样式与逻辑分离 (Tailwind CSS)。

---

## 2. 系统架构

### 2.1 整体架构图

```mermaid
graph TD
    subgraph Chrome Browser
        Popup[Popup UI (React)]
        Options[Options UI (React)]
        Content[Content Script (TS)]
        Storage[(chrome.storage)]
    end

    Popup -->|Read/Write| Storage
    Options -->|Read/Write| Storage
    Popup -->|Inject/Msg| Content
    Content -->|DOM Ops| AI_Page[AI Chat Page]

    subgraph Core Logic (Shared)
        Store[Zustand Store]
        Builder[Instruction Builder]
        Recommender[Scene Recommender]
        I18n[I18n Service]
    end

    Popup -.-> Store
    Popup -.-> Builder
    Popup -.-> Recommender
    Popup -.-> I18n
    Options -.-> Store
    Options -.-> I18n
```

### 2.2 目录结构

```
/src
  /assets           # 静态资源 (icons, etc.)
  /components       # UI 组件 (Button, Card, Modal, etc.)
  /core             # 核心业务逻辑 (与 UI 无关)
    /builder        # 指令组装器
    /storage        # 存储服务封装
    /recommend      # 推荐算法
    /feedback       # 反馈逻辑
  /hooks            # React Hooks (useMode, useStorage)
  /store            # Zustand Stores
  /lib              # 工具库 (Logger, Constants)
  /locales          # i18n 翻译文件
  /popup            # Popup 入口
  /options          # Options 入口
  /content          # Content Script
  /types            # TypeScript 类型定义
/data
  modes.json        # 内置思维模式数据
  sites.json        # 内置白名单配置
```

---

## 3. 核心模块设计

### 3.1 数据模型 (TypeScript Interfaces)

```typescript
// 思维模式定义
interface Mode {
  id: string;             // 唯一标识 (kebab-case)
  level: 'L1' | 'L2' | 'L3' | 'persistent';
  title: string;          // 显示名称
  emoji?: string;         // 图标
  template: string;       // 指令模板，支持占位符 [内容]
  description?: string;   // 简短描述
  trigger?: string;       // 快捷指令 (e.g. "/redteam")
  tags: string[];         // 标签 (e.g. ["风险", "对抗"])
  sceneTags?: SceneKey[]; // 关联场景 (用于推荐)
  nextStep?: string;      // 推荐后续模式 ID
  isCustom?: boolean;     // 是否为用户自定义
}

type SceneKey = 'product' | 'code' | 'decision' | 'learning';

// 存储结构
interface StorageSchema {
  // Sync Storage
  userSettings: {
    language: 'en' | 'zh';
    theme: 'light' | 'dark' | 'auto';
    whitelist: SiteConfig[];
  };
  customModes: Mode[];
  persistentModeId: string | null;

  // Local Storage
  appState: {
    onboardingDone: boolean;
    lastInsertion: {
      modeId: string;
      timestamp: number;
    } | null;
  };
}

interface SiteConfig {
  id: string;
  urlPattern: string; // glob pattern
  selector: string;   // CSS Selector
}
```

### 3.2 核心服务 (Core Services)

#### 3.2.1 ModeStore (Zustand)
负责管理所有模式数据的加载、搜索与过滤。
- **State**: `builtInModes`, `customModes`, `searchQuery`, `activeTab`.
- **Actions**: `loadModes()`, `search(query)`, `addCustomMode(mode)`, `getRecommendations(scene)`.
- **Logic**: 启动时合并 `modes.json` 与 `chrome.storage.sync` 中的自定义模式。

#### 3.2.2 InstructionBuilder
纯函数类，负责将选中的模式组装成最终指令文本。
- **Assembly Order**: `Persistent -> L3 -> L2 -> L1`
- **Separator**: `\n\n` (双换行)
- **Placeholder**: 将模板中的 `[内容]` 替换为用户选中的文本（如有）。

```typescript
class InstructionBuilder {
  static build(params: {
    persistentMode?: Mode;
    selectedModes: Mode[]; // L1, L2, L3 混合
    userSelection?: string;
  }): string {
    // Implementation logic...
  }
}
```

#### 3.2.3 InjectionService
负责与 Content Script 通信。
- **Flow**:
  1. Popup 调用 `inject(text)`。
  2. 检查当前 Tab 是否在白名单。
  3. 若在白名单 -> `chrome.scripting.executeScript` 注入/调用 Content Script。
  4. Content Script 尝试查找输入框 (Retry x3)。
  5. 成功 -> 插入文本；失败 -> 回退到剪贴板。
  6. 返回结果给 Popup (Success/Clipboard/Fail)。

### 3.3 UI 组件设计 (React)

#### 3.3.1 Popup 组件树
- `App`
  - `Header` (Logo + Settings Link)
  - `SceneRecommender` (场景按钮: "我在做产品"...) -> 展示 `RecommendationCard`
  - `FeedbackCard` (条件渲染: 距上次注入 > 3分钟)
  - `PersistentModeBar` (显示当前持久化模式)
  - `ModeTabs` (L1/L2/L3/Persistent 切换)
  - `SearchBar`
  - `ModeList` -> `ModeItem`
  - `CombinationBar` (多选时显示: "已选 N 个", "清空", "生成")
  - `ToastContainer`

#### 3.3.2 Options 组件树
- `SettingsLayout`
  - `GeneralSettings` (语言, 主题)
  - `WhitelistManager` (表格: 站点, URL, Selector)
  - `CustomModeManager` (列表 + 编辑 Modal)
  - `DataManagement` (导入/导出 JSON)

---

## 4. 正确性属性 (Correctness Properties)

为了确保核心逻辑的健壮性，我们将使用 **Vitest** + **fast-check** 验证以下关键属性：

1.  **指令组装顺序不变性 (Instruction Assembly Order)**
    -   *Property*: 无论输入模式的顺序如何，输出始终遵循 Persistent -> L3 -> L2 -> L1 的顺序。
2.  **占位符替换完整性 (Placeholder Substitution)**
    -   *Property*: 如果提供了选中文本，所有选中模式中的第一个 `[内容]` 占位符都应被正确替换；若无选中文本，占位符保持原样。
3.  **搜索过滤准确性 (Search Filter Correctness)**
    -   *Property*: 搜索结果必须包含查询词（在标题、Tag 或 Emoji 中）。
4.  **持久化模式单例性 (Persistent Mode Singleton)**
    -   *Property*: 任何时刻只能有一个激活的持久化模式；新设置应覆盖旧设置。
5.  **反馈触发时序 (Feedback Timing Gate)**
    -   *Property*: 仅当 `CurrentTime - LastInsertionTime > 3 mins` 时，`shouldShowFeedback` 返回 true。
6.  **JSON 序列化往返 (Round-trip Serialization)**
    -   *Property*: 导出的配置 JSON 必须能被完整导入且数据无损。

---

## 5. 开发规范

- **组件**: 使用 Functional Components + Hooks。
- **样式**: Tailwind CSS (Utility-first)。
- **状态**: 全局状态用 Zustand，局部状态用 React `useState`。
- **异步**: 所有的 `chrome.storage` 操作封装为 Promise。
- **Lint**: ESLint + Prettier。
