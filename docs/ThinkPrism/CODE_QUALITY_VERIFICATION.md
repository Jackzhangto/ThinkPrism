# ThinkPrism 代码质量检测约定

本文档定义了如何执行和验证 `CODE_QUALITY_STANDARDS.md` 中的规定。

## 1. 自动化检测工具链

我们使用以下工具链进行自动化检测：

| 维度 | 工具 | 配置文件 | 执行命令 |
| :--- | :--- | :--- | :--- |
| **代码风格 & 质量** | ESLint | `eslint.config.js` | `npm run lint` |
| **类型检查** | TypeScript (tsc) | `tsconfig.json` | `npm run type-check` |
| **单元测试** | Vitest | `vite.config.ts` | `npm run test` |
| **格式化** | Prettier | `.prettierrc` | `npm run format` |

## 2. 质量检测脚本

项目根目录提供了统一的质量验证命令：

```bash
npm run verify
```

该命令将按顺序执行：
1. `npm run type-check`：确保没有类型错误。
2. `npm run lint`：确保符合代码规范（包括复杂度、行数限制、注释要求）。
3. `npm run test`：确保所有测试通过。

## 3. 具体检测规则配置 (ESLint)

### 3.1 复杂度与行数
```javascript
// eslint.config.js
rules: {
  'complexity': ['error', 15], // 圈复杂度上限 15
  'max-lines-per-function': ['error', { "max": 500, "skipBlankLines": true, "skipComments": true }], // 函数行数上限 500
  'max-depth': ['error', 4], // 嵌套深度上限 4
}
```

### 3.2 注释强制 (JSDoc)
```javascript
// eslint.config.js
plugins: ['jsdoc'],
rules: {
  'jsdoc/require-jsdoc': ['error', {
    require: {
      FunctionDeclaration: true,
      MethodDefinition: true,
      ClassDeclaration: true,
      ArrowFunctionExpression: false, // 组件内简单箭头函数可豁免
      FunctionExpression: true
    }
  }]
}
```

### 3.3 调试日志 (No Console)
```javascript
// eslint.config.js
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }] // 禁止 console.log，允许 warn/error (但推荐用 DebugLogger)
}
```

## 4. 人工审查清单 (Code Review Checklist)

在自动化工具之外，Reviewer 需人工检查：

- [ ] **命名语义**：变量名是否清晰表达了意图？
- [ ] **注释质量**：注释是否是中文？是否解释了"为什么"而不仅仅是"是什么"？
- [ ] **OOP 结构**：核心逻辑是否封装在 Class 中？是否滥用了全局变量？
- [ ] **调试信息**：是否使用了 `DebugLogger`？

## 5. 违规处理

- **CI/CD 拦截**：任何一项自动化检测失败，流水线将直接终止。
- **强制重构**：对于违反 "绝对红线" (如函数 > 500行) 的代码，必须立即重构，不得通过。
