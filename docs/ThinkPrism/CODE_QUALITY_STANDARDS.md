# ThinkPrism 代码质量立法文件

本文档作为 ThinkPrism 项目的**最高技术规范**，定义了不可触犯的代码质量底线。

## 1. 核心设计原则

### 1.1 面向对象优先 (OOP First)
- **核心逻辑封装**：业务逻辑、状态管理、服务层必须采用 `Class` 进行封装。
- **单例模式**：全局服务（如 `StorageService`, `I18nService`）必须使用单例模式。
- **React 组件**：仅 UI 组件使用函数式组件 (Functional Component)，且应保持无状态或仅包含 UI 状态。

### 1.2 单一职责原则 (SRP)
- **一个类/函数只做一件事**。
- 如果一个函数包含 `if-else` 分支超过 3 层，必须拆分。
- 如果一个文件包含多个无关的类/接口，必须拆分。

## 2. 硬性代码指标

违反以下指标的代码**禁止提交**：

| 指标 | 阈值 | 说明 |
| :--- | :--- | :--- |
| **函数行数** | < 100 行 (推荐) <br> **< 500 行 (绝对红线)** | 超过 500 行的函数必须拆解。 |
| **圈复杂度** | < 15 | 逻辑分支过于复杂，必须重构。 |
| **注释覆盖率** | 100% (Exported) | 所有导出的类、方法、函数必须包含 JSDoc 注释。 |
| **嵌套深度** | < 4 层 | 避免回调地狱或深层循环。 |

## 3. 命名与注释规范

### 3.1 命名约定
- **变量/属性**：`camelCase` (e.g., `userProfile`)
- **类/接口/类型**：`PascalCase` (e.g., `StorageService`)
- **常量**：`UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **布尔值**：必须加前缀 `is`, `has`, `should`, `can` (e.g., `isVisible`)

### 3.2 中文注释强制令
- **所有注释必须使用中文**。
- **函数级注释**：必须包含 `功能描述`、`@param`、`@returns`。
- **示例**：
  ```typescript
  /**
   * 计算最终价格。
   * 
   * @param basePrice 基础价格
   * @param discount 折扣率 (0-1)
   * @returns 计算后的最终价格
   */
  public calculatePrice(basePrice: number, discount: number): number { ... }
  ```

## 4. 调试与日志规范

- **严禁使用 `console.log`**：生产环境代码中不得出现裸写的 console.log。
- **统一使用 `DebugLogger`**：
  - 必须通过 `DebugLogger.info()`, `DebugLogger.warn()`, `DebugLogger.error()` 输出。
  - 日志输出受全局配置 `isDebug` 控制。
- **调试信息开关**：
  - 开发环境 (`process.env.NODE_ENV === 'development'`) 默认开启。
  - 生产环境默认关闭，可通过特定操作（如连续点击版本号）开启。

## 5. 开发流程约束

1. **先设计，后编码**：必须先更新 `docs/` 下的设计文档，再编写代码。
2. **测试驱动 (TDD)**：核心逻辑必须先写测试用例 (Unit/Property Test)。
3. **自检流程**：提交前必须运行 `npm run verify` (包含 lint, type-check, test)。

---
**本文件由项目架构师制定，任何修改需经架构委员会（或用户）审批。**
