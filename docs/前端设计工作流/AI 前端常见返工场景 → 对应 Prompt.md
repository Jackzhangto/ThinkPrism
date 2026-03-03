# AI 前端常见返工场景 → 对应 Prompt

> **用途**：给 Cursor 用的「返工止血手册」——按现象选场景，按场景用固定 Prompt。
> **适用**：ThinkPrism (React + Tailwind CSS)。
> **原则**：返工不是“再生成一次”，而是**回到正确的那一层改**（Tailwind Config → 组件 → 结构）。

---

## 一、适用范围与约束

| 项目 | 说明 |
|------|------|
| **适用** | ThinkPrism Chrome Extension (React + Tailwind CSS) |
| **使用方式** | Cursor Chat / Inline 中粘贴对应 Prompt。 |
| **禁止** | 说“帮我整体优化一下页面”而不选具体场景；在未定位层级前就改代码。 |

---

## 二、场景总览（先定位再动手）

| 你的感觉 / 现象 | 实际问题层级 | 推荐 Prompt |
|-----------------|--------------|-------------|
| 不好看，但说不上来 | Tailwind Config (Theme) | AF-01 |
| 有点挤 / 有点空 | Spacing Token | AF-02 |
| 重点不突出，看着累 | Typography / Colors | AF-03 |
| 越改越乱 | 越权修改（层级混乱） | AF-06（强约束） |
| 改一个全炸 | Token 未集中 / Arbitrary Values | AF-04 |
| AI 老爱重写结构 | Prompt 边界不清 | AF-00 + AF-06 |
| 只想改一个组件 | 组件职责边界 | AF-05 |
| 只想轻微好一点 | 微调节奏 | AF-07 |

---

## 三、标准 Prompt 清单（可复制）

### AF-00｜强制工程约束（开局必用）

**用途**：对话开头挂上，防止 AI 越权改结构、写 Arbitrary Values。

```
你是前端工程助手，而不是 UI 设计师。

约束：
- 不允许新增 / 删除组件
- 不允许调整组件层级
- 不允许直接写 Arbitrary Values (如 w-[123px], text-[#333])
- 所有视觉修改必须使用 tailwind.config.ts 中定义的 Utility Classes (如 p-card, text-primary)

如你认为必须改结构，请先说明理由并停止。
```

---

### AF-01｜页面不好看 / 不高级（最常用）

**用途**：页面丑、不耐看；本质是 Tailwind Theme 配置问题。

```
当前页面功能正确，但整体视觉不够克制。

请：
1. 不修改任何组件结构
2. 不修改 JSX/TSX
3. 仅通过修改 tailwind.config.ts 中的 theme (spacing / colors / fontSize / borderRadius) 来调整
4. 目标：更轻、更冷静、更耐看

禁止新增 token key，只调整现有 token 的值。
```

---

### AF-02｜页面太挤 / 太空

**用途**：信息密度不合理；本质是 spacing 层级混乱。

```
页面信息密度不合理。

请：
- 只检查并调整 tailwind.config.ts 中的 spacing tokens (如 page / section / card / stack)
- 明确 page / section / card / stack 的层级关系
- 不修改组件代码

输出：建议调整的 config 值与原因。
```

---

### AF-03｜信息没主次，看着累

**用途**：层级不清晰；本质是 Typography/Color 未分层。

```
当前页面信息层级不清晰。

请只分析（不写代码）：
1. 哪些信息应为主信息
2. 哪些为次信息
3. 应通过哪些 Tailwind class (text-h1/h2, text-primary/secondary) 体现

最后指出应在组件中替换的 class，或在 config 中调整的 token 值。
```

---

### AF-04｜一改就炸（牵一发而动全身）

**用途**：本质是 Arbitrary Values 泛滥或 Token 不集中。

```
当前页面修改存在“牵一发而动全身”的问题。

请：
1. 找出代码中使用的 Arbitrary Values (如 p-[10px], text-[#123456])
2. 找出不合理的 class 组合
3. 提出将其收敛到 tailwind.config.ts 的建议

不要修改代码，先列出清单。
```

---

### AF-05｜只改一个组件

**用途**：局部优化，不影响全局。

```
请只针对【组件名】进行优化。

规则：
1. 不修改 tailwind.config.ts
2. 不修改其他组件
3. 不改变组件 props 接口
4. 仅优化该组件内部的 Tailwind Utility Classes 组合 (使用现有的 token)
```

---

### AF-06｜防止 AI 擅自改结构（止损用）

**用途**：AI 开始新增/删组件、改层级时立刻插入。

```
⚠️ 强约束说明：

你不被允许：
- 新增组件
- 删除组件
- 调整组件层级

你只被允许：
- 修改 tailwind.config.ts
- 或调整已有 Utility Classes 在组件中的使用方式

如你认为必须改结构，请先说明理由并停止。
```

---

### AF-07｜克制型微调（不想大改）

**用途**：只想“稍微好一点点”。

```
这是一次克制型微调。

请：
- 总体视觉变化不超过 10%
- 主要通过 gap-stack / text-sub / text-secondary 等现有 token 微调
- 保持整体设计风格不变
```
