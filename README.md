# ThinkPrism (思棱)

ThinkPrism 是一款 AI 驱动的浏览器扩展，旨在增强您的阅读和写作体验。通过智能化的文本处理和场景化推荐，帮助用户更高效地完成信息获取与创作任务。

## 主要功能

- **智能模式选择**：提供结构化、润色、创意等多种预设模式，满足不同场景需求。
- **场景化推荐**：根据当前浏览内容（如产品页面、代码片段、邮件等），智能推荐最合适的处理模式。
- **一键处理**：选中网页文本，即可快速进行摘要、翻译、解释或润色。
- **自定义模式**：支持用户创建个性化的 Prompt 模板，灵活扩展功能。
- **深色模式支持**：完美适配系统深色主题，提供舒适的阅读体验。
- **完全本地化**：优先支持中文环境，界面友好。

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
- **构建工具**: Vite
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
  - `components/`: React 组件
  - `content/`: Content Script (注入页面的脚本)
  - `core/`: 核心逻辑与工具类
  - `options/`: 选项页面
  - `popup/`: 弹出窗口页面
  - `store/`: 状态管理
- `dist/`: 构建输出目录
- `public/`: 静态资源
- `docs/`: 项目文档

## 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目。

## 许可证

MIT License
