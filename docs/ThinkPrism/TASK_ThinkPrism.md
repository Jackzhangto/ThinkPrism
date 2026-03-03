# TASK_ThinkPrism: 任务拆分文档

> 🔴 **重要提示**：所有 UI 开发任务必须严格遵循 `docs/前端设计工作流` 中的规范。
> 核心原则：Design Tokens 驱动，禁止 Arbitrary Values，UI/业务组件分离。

## 阶段 1: 项目初始化 (Project Initialization)

- [ ] **T1.1: 初始化项目骨架**
    - 使用 Vite 创建 React + TypeScript 项目。
    - 安装核心依赖: `zustand`, `clsx`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, `class-variance-authority`, `tailwind-merge`。
    - 安装开发依赖: `@crxjs/vite-plugin`, `vitest`, `fast-check`。
    - 配置 `manifest.json` (Manifest V3)。
    - **配置 Tailwind CSS**: 初始化 `tailwind.config.ts`，准备好 `theme.extend` 结构。

- [ ] **T1.2: 目录结构搭建**
    - 创建 `/src/core`, `/src/store`, `/src/hooks`, `/src/lib` (utils.ts) 等目录。
    - **UI 目录分层**: 创建 `/src/components/ui` (纯展示) 和 `/src/components/business` (业务逻辑)。
    - 准备基础图标和静态资源。

- [ ] **T1.3: 设计语言与 Token 定义 (Design Workflow)**
    - **[Prompt 01]** 创建 `docs/ThinkPrism/DESIGN_LANGUAGE.md`: 定义设计气质、密度策略、交互原则。
    - **[Prompt 04]** 定义 Design Tokens: 在 `tailwind.config.ts` 中配置语义化 Tokens (colors, spacing, typography, radius, shadow)。
    - 确保无 Magic Numbers，所有样式值均来自 Tokens。

## 阶段 2: 核心逻辑与测试 (Core Logic & Tests)

- [ ] **T2.1: 实现数据模型与 I18n**
    - 定义 TypeScript 接口 (`Mode`, `StorageSchema` 等)。
    - 创建 `locales/en.json` 和 `locales/zh.json`。
    - 实现 `I18nService` 并编写单元测试。

- [ ] **T2.2: 实现 ModeStore (Zustand)**
    - 创建 `modes.json` (内置数据)。
    - 实现 `useModeStore`，包含加载、搜索、过滤逻辑。
    - 编写 Property Test: 验证搜索过滤的准确性 (Property #3)。

- [ ] **T2.3: 实现 InstructionBuilder**
    - 实现 `InstructionBuilder.build()` 方法。
    - 编写 Property Test: 验证指令组装顺序 (Property #1)。
    - 编写 Property Test: 验证占位符替换逻辑 (Property #2)。

- [ ] **T2.4: 实现 StorageService**
    - 封装 `chrome.storage` 操作，提供类型安全的读写接口。
    - 实现 `PersistentMode` 的存取逻辑。
    - 编写 Property Test: 验证持久化模式单例性 (Property #4)。

## 阶段 3: Popup UI 开发 (Popup UI Implementation)

- [ ] **T3.0: Popup 设计拆解 (Design Workflow)**
    - **[Prompt 02]** 创建 `src/popup/structure.md`: 定义 Popup 页面骨架与区块目的。
    - **[Prompt 03]** 创建 `src/popup/components.md`: 拆解组件树，明确 UI/Business 边界。

- [ ] **T3.1: 基础 UI 组件库 (Components/UI)**
    - 基于 Token 开发 `Button`, `Card`, `Tabs`, `Input`, `Badge` 等 Headless 组件。
    - **强约束**: 仅使用 Tailwind Utility Classes，禁止 Arbitrary Values。
    - 确保支持暗色模式 (Dark Mode)。

- [ ] **T3.2: Popup 核心布局**
    - 实现 `Header`, `Footer`, `ModeTabs` (L1/L2/L3/Persistent)。
    - 实现 `SceneRecommender` (场景推荐) 组件。
    - **检查**: 卡片嵌套深度 ≤ 2 层。

- [ ] **T3.3: 模式列表与搜索交互**
    - 实现 `ModeList` 和 `ModeItem` (组合 UI 组件)。
    - 集成搜索功能，实时过滤列表。
    - 实现多选组合逻辑 (`CombinationBar`)。

- [ ] **T3.4: 反馈与引导组件**
    - 实现 `FeedbackCard` (基于时间判断是否显示)。
    - 实现 `OnboardingCard` (新手引导)。

## 阶段 4: 注入服务与 Content Script (Injection Service)

- [ ] **T4.1: 开发 Content Script**
    - 实现 DOM 查找与文本插入逻辑。
    - 处理 React合成事件与原生事件的兼容性。
    - 实现重试机制 (Retry Policy)。

- [ ] **T4.2: 集成 InjectionService**
    - 在 Popup 中调用 `chrome.scripting.executeScript`。
    - 处理白名单检测与错误回退 (Clipboard fallback)。
    - 实现 Toast 提示系统 (遵循 UI 规范)。

## 阶段 5: 选项页与高级功能 (Options & Advanced)

- [ ] **T5.1: Options 页面设计与开发**
    - **[Design Workflow]**: 执行 Options 页面的 Structure -> Components 拆解。
    - 实现白名单管理表格 (增删改查)。
    - 实现自定义模式编辑器 (JSON 导入/导出)。
    - 实现语言与主题设置。

- [ ] **T5.2: 整体集成测试**
    - 验证 Popup -> Content Script -> DOM 的完整链路。
    - 验证数据持久化与跨页面同步。

## 阶段 6: 发布准备 (Release Readiness)

- [ ] **T6.1: 构建优化与 UI 验收**
    - 配置 Vite 生产环境构建参数。
    - **UI 验收**: 检查是否所有页面均符合 Design Language，无样式 hardcode。
    - 检查包体积 (< 500KB)。

- [ ] **T6.2: 文档与合规**
    - 更新 `README.md`。
    - 确认隐私政策合规性 (无远程请求)。
    - 准备发布所需的图标与截图。
