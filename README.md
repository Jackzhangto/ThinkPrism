# ThinkPrism (思棱)

ThinkPrism 是一款 AI 驱动的浏览器扩展，旨在通过**场景化思维模型**增强您的阅读、决策与创作体验。它不仅仅是一个提示词工具，更是您的数字思维棱镜，帮助您从产品、代码、决策、学习等多个维度深度解析信息。

## 核心特性

- **四大核心场景**：
  - **🛠️ 产品 (Product)**：集成 4-D (Discover/Define/Design/Deliver) 方法论，辅助需求分析与方案设计。
  - **🛡️ 代码 (Code)**：提供红队测试、代码重构风暴等模式，从安全与架构视角审查代码。
  - **🧭 决策 (Decision)**：运用第二层思维、决策矩阵等模型，辅助复杂局面的战略判断。
  - **🎓 学习 (Learning)**：基于费曼技巧与知识联想模式，加速新知识的内化与迁移。

- **🚀 Lyra 专属交互协议**：
  - 内置 Lyra 交互模式，采用反转式交互引导，通过苏格拉底式提问澄清需求，而非直接生成答案。

- **⚡ 智能注入技术**：
  - **广泛兼容**：采用原生 Setter 绕过机制，完美支持 React、Vue 等现代前端框架构建的网页。
  - **双重保障**：自动注入的同时将指令复制到剪贴板，确保在任何环境下（如 Notion、飞书文档、GitHub）都能无缝使用。
  - **零隐私风险**：扩展程序**不监听**用户的实时输入，仅通过静态前缀（如“内容如下：”）拼接指令，保障数据安全。

- **多维思维模式**：
  - **L1 极速模式**：红队测试、第一性原理、简单解释。
  - **L2 剧本模式**：创意 SCAMPER、六顶思考帽。
  - **L3 百科模式**：深度角色沉浸与系统化教学。

- **完全本地化**：优先支持中文环境，界面友好，适配深色模式。

## 快捷键

- **Alt+P**: 快速唤醒/打开 ThinkPrism 扩展窗口 (可在 `chrome://extensions/shortcuts` 自定义)。

## 安装指南

### 开发环境安装

1. 克隆本项目到本地。
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
4. 打开 Chrome 浏览器，进入扩展程序管理页面 (`chrome://extensions/`)。
5. 开启右上角的“开发者模式”。
6. 点击“加载已解压的扩展程序”，选择本项目下的 `dist` 目录。

### 发布包安装

1. 获取最新的发布包 (`think-prism-vX.X.X.zip`)。
2. 解压该文件。
3. 按照上述步骤 4-6，加载解压后的文件夹。

## 开发指南

### 技术栈

- **前端框架**: React + TypeScript
- **构建工具**: Vite + CRXJS
- **样式库**: Tailwind CSS
- **状态管理**: Zustand
- **测试框架**: Vitest + React Testing Library

### 常用命令

- `npm run dev`: 启动开发服务器（支持热重载）。
- `npm run build`: 构建生产版本。
- `npm run lint`: 运行代码检查。
- `npm run test`: 运行单元测试。
- `npm run verify`: 执行全量检查（类型检查 + Lint + 测试）。
- `npm run package`: 打包生成发布用的 zip 文件（需先执行 build）。

## 目录结构

- `src/`: 源代码目录
  - `components/`: React 组件 (Business/UI)
  - `content/`: Content Script (注入页面的脚本)
  - `core/`: 核心逻辑 (Mode/Injection/Bridge)
  - `options/`: 选项页面
  - `store/`: 状态管理 (Zustand)
- `dist/`: 构建输出目录
- `release/`: 发布包存放目录
- `docs/`: 项目文档与 Prompt 设定义

## 许可证

MIT License
