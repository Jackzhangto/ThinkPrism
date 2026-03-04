# ThinkPrism 思棱

> 激发 AI 深度思考的棱镜 · Chrome 扩展

ThinkPrism 是一款开源的 Chrome 浏览器扩展，基于《AI 思维模式激活指令手册》设计，帮助你在与 ChatGPT、Claude、千问、DeepSeek 等 AI 对话时，一键注入**场景化思维模式**，提升提问质量与回答深度。

---

## 特性

- **多场景思维模式**：产品、代码、决策、学习四大场景，红队测试、第一性原理、费曼技巧、苏格拉底导师等 20+ 模式
- **Lyra 交互协议**：反转式引导，通过提问澄清需求后再输出方案
- **智能注入**：支持自动填入当前页面输入框，或复制到剪贴板；兼容 React/Vue 等框架页面
- **中英双语**：界面与内置模式均支持中文 / English 切换
- **完全本地**：无后端、无上报，数据仅存于本地

## 安装

### 从源码安装（推荐开发者）

```bash
git clone https://github.com/Jackzhangto/ThinkPrism.git
cd ThinkPrism
npm install
npm run build
```

1. 打开 Chrome → `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择项目下的 `dist` 目录

### 从发布包安装

从 [Releases](https://github.com/Jackzhangto/ThinkPrism/releases) 下载 `think-prism-vX.X.X.zip`，解压后按上述步骤 2–3 加载该文件夹。

## 使用

- **快捷键**：`Alt+P` 打开扩展弹窗（可在 `chrome://extensions/shortcuts` 中修改）
- 在弹窗中选择场景与思维模式，点击「使用」：若已开启「自动注入」，内容会写入当前页输入框（或页面主输入框）；否则会复制到剪贴板

## 开发

### 技术栈

- React 19 + TypeScript  
- Vite + @crxjs/vite-plugin (Chrome Extension)  
- Tailwind CSS · Zustand · Lucide React  

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（热更新） |
| `npm run build` | 构建生产包到 `dist/` |
| `npm run test` | 运行测试 |
| `npm run lint` | 代码检查 |
| `npm run verify` | 类型检查 + Lint + 测试 |
| `npm run package` | 打包发布用 zip（需先 `build`） |

### 目录结构

```
src/
├── components/   # 业务组件与 UI 组件
├── content/      # Content Script（页面注入）
├── core/         # 核心逻辑（模式、注入、存储、i18n）
├── options/      # 扩展选项页
├── store/        # Zustand 状态
├── App.tsx       # Popup 入口
└── ...
dist/             # 构建输出（用于加载扩展）
docs/             # 设计文档与说明
```

## 开源协议

本项目采用 [MIT License](LICENSE)。你可自由使用、修改与再分发，请保留版权与许可声明。

## 致谢

- 思维模式设计参考《AI 思维模式激活指令手册 (Lyra Edition)》
- 图标与 UI 使用 [Lucide](https://lucide.dev/)

---

如对你有帮助，欢迎 Star 或提 Issue / PR。
