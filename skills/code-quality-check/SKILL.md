---
name: code-quality-check
description: 按项目规范执行后端代码质量检查（IDE Linter、Pylint、日志占位符 %s 扫描），并产出或更新《代码质量检查报告》。用户说「检查代码质量」「代码质量检查」「跑一遍质量检查」时使用本技能。
---

# 代码质量检查技能

本技能用于对 **CloudBlessings 后端（backend）** 执行统一的代码质量检查，并产出或更新 `docs/代码质量检查报告.md`。

**统一原则**：后端可执行检查项与违规级别以 **`backend/docs/代码质量检查/后端代码质量检查规范.md`** 为准；该规范与同目录《后端代码开发规范》一致，且已在 `docs/代码开发规则new.md` 中显式对接。其余参考：`docs/代码开发规则new.md`、`.cursor/rules/logging-standards.mdc`、`docs/backend代码检查-pylint.md`。

**底线要求（必须遵守）**：规范规定「不通过者禁止合并」。本技能执行时必须覆盖以下底线，任一**一级违规**未通过则报告 Assessment 必须为**不可合并**；**Code Review 必核清单** 5 条须逐条核对并在报告中勾选通过/未通过/未检查。
- **一级违规**（规范 7.3）：裸 SQL、日志使用 `%s`、长 I/O 持连不释放、响应结构违反协议 → 必须检查并记录，不通过即不可合并。
- **Code Review 必核清单**（规范 7.2）：① 日志仅用 logger 且占位符 `{}`；② Session 短连接、用毕即关，长任务先释放再重开；③ API 响应结构符合协议；④ 无硬编码密钥、裸 SQL、未校验输入；⑤ 类型注解与复杂度达标。
- **CI 卡点**（规范 7.1）：pylint/flake8、mypy、测试 — 技能能执行则执行并写入报告；不能则报告中明确「合并前须在 CI 或本地通过」。

**思路参考（Superpowers）**：本技能在「规范 + 静态检查」上与 Superpowers 的 **requesting-code-review** / **code-quality-reviewer** 思路对齐——**问题按严重程度分级**（Critical/Important/Minor，对应规范中的一级/二级/三级违规）、**输出含 Strengths / Issues / Recommendations / Assessment**、**建议在任务完成后/大功能后/合并前执行**。可与 Superpowers 的 code-reviewer 配合使用：本技能侧重规范符合度与静态检查（E/T/L/D/A/Q），code-reviewer 侧重架构、测试、需求符合度与生产就绪。

---

## 何时使用

- 用户说：**「检查代码质量」**、**「代码质量检查」**、**「跑一遍质量检查」**、**「做一次代码质量检查」**。
- **建议时机**（与 Superpowers 的 review early, review often 一致）：
  - **任务完成后**：单次开发任务完成后做一次自检；
  - **大功能/迭代完成后**：功能合入前做规范与静态检查；
  - **提交/合并前**：提交前或合并到主分支前做一次检查；
  - 需要产出或更新《代码质量检查报告》时。

---

## 执行步骤

### 1. 读取规范与报告（必做）

- 读取 `docs/代码质量检查报告.md`（若存在），了解当前检查项与历史整改。
- **后端检查依据**：以 `backend/docs/代码质量检查/后端代码质量检查规范.md` 为可执行检查项来源（E/T/L/D/A/Q 及违规级别）；审查清单与卡点与该文档保持一致。
- 必要时参考：
  - `.cursor/rules/logging-standards.mdc`（日志占位符须用 `{}` 禁止 `%s`）；
  - `docs/backend代码检查-pylint.md`（Pylint 使用方式）。

### 2. IDE 诊断（Linter）

- 对 `backend/api`、`backend/core`、`backend/kefu` 等关键目录执行 **ReadLints**（或等价 IDE 诊断）。
- 记录：是否有报错；若有，列出文件与行号。

### 3. 日志占位符扫描（loguru 规范）— 一级违规

- 在 `backend` 下搜索：`logger.(info|debug|warning|error|exception)([^)]*%s`（即 logger 调用中仍使用 `%s` 的位置）。
- 若存在违规：
  - 列出所有**文件路径与行号**；
  - 在报告中列为「一级违规·待整改」，并给出正确示例：`logger.xxx("msg {}", arg)` 或 `logger.xxx(f"msg {arg}")`；
  - 若用户要求**一并整改**，则将所有 `%s` 改为 `{}`（或 f-string），并更新报告为「已整改」。
- **底线**：任一违规则 Assessment 为不可合并。

### 4. 底线检查（一级违规 + 必核清单）

- **裸 SQL（一级违规）**：在 backend 下 grep 拼接 SQL 或未参数化执行（如 `execute(.*\+|.*%|text\s*\(\s*["\'].*%|raw\s*\(` 等），或搜索 `execute(`、`raw_sql` 与字符串拼接组合；若存在则列文件:行号，报告为一级违规。
- **硬编码密钥/密码/token（必核④）**：grep 常见模式（如 `password\s*=\s*["\'][^"\']+["\']`、`api_key\s*=\s*["\']`、`secret\s*=\s*["\']`、`token\s*=\s*["\'][A-Za-z0-9_-]{20,}` 等），排除注释与 `os.getenv`/`settings.` 用法；若存在则列文件:行号，报告为二级或必核未通过。
- **Code Review 必核清单 5 条**：逐条核对并在报告中勾选：
  1. 日志仅用 `logger` 且占位符为 `{}`？ → 由步骤 3 覆盖，勾选通过/未通过。
  2. Session 短连接、用毕即关，长任务先释放再重开？ → R：可 grep `SessionLocal()`、`get_db()` 使用处并注明「已抽查/未抽查/待人工确认」。
  3. API 响应结构符合《API-v1-前后端通信协议》？ → R：需人工或 T 类验证，报告中注明「未检查/待测试」。
  4. 无硬编码密钥、裸 SQL、未校验输入？ → 由本步裸 SQL 与密钥扫描 + 步骤 3 覆盖，勾选通过/未通过。
  5. 类型注解与复杂度达标？ → 由 IDE Linter 与 Pylint 部分覆盖；可注明「见 Pylint/mypy 结果」。
- **长 I/O 持连不释放（一级违规）**：R：需人工抽查长任务（如 Celery 中视频生成、HTTP 调用前是否 close db）；报告中注明「未抽查/已抽查：见 X 文件」；若已知违规须列出一级违规。
- **响应结构违反协议（一级违规）**：R：需人工或接口测试；报告中注明「未检查/待测试」。
- 任一一级违规未通过则报告 **Assessment = 不可合并**。

### 5. Pylint 检查（CI 卡点）

- **优先在技能内执行**：在可执行环境中运行 Pylint，**执行命令**（Windows PowerShell，项目根为工作目录时）：
  ```powershell
  cd backend; .\run_pylint.bat
  ```
  **注意**：PowerShell 用 `;` 连接命令，不要用 `&&`；不要用 `cd /d`（那是 CMD 语法）。若工作目录已在 backend，则直接执行 `.\run_pylint.bat`。Pylint 可能耗时较长（1～2 分钟），执行时建议 timeout≥120000ms 或执行后轮询 `backend/logs/pylint.log` 是否存在再读取。完整输出会写入 `backend/logs/pylint.log`。执行完成后读取该日志，汇总 E/F 类问题及数量，写入报告。若存在 E/F 且规范要求「报错即失败」，报告中须注明「Pylint 未通过，合并前须修复」。
- **若无法执行**（无 backend 环境、脚本不存在、超时、权限等）：在报告中记录 Pylint 为「本次未执行」，并写明「合并前须在 CI 或本地执行 `.\run_pylint.bat` 通过」；同时给出执行方式与日志路径。
- **报告内容**：Pylint 结果摘要（已执行：通过/问题数及 E/F 列表；未执行：说明原因与合并前须通过）；全量检查建议（执行方式、日志位置、优先处理 E/F）。

### 6. 产出/更新《代码质量检查报告》

- 若不存在则创建 `docs/代码质量检查报告.md`；若存在则在其基础上更新。
- 报告须包含（结构参考 Superpowers code-reviewer：分级 + Strengths/Issues/Recommendations/Assessment），并**严格遵守底线**：
  - **一、检查项汇总**：表格列出「IDE 诊断」「Pylint」「日志占位符」「裸 SQL」「硬编码密钥」「必核清单」等及结果（通过/待整改/未检查）。
  - **二、Code Review 必核清单（5 条）**：逐条列出并勾选 **通过 / 未通过 / 未检查**；未检查项须注明原因（如 R/T 需人工或测试）。
  - **三、日志占位符**：当前状态说明（loguru 须用 `{}`）；若已扫描，列出违规文件或「已整改」文件列表。
  - **四、Pylint 全量检查建议**：执行方式、日志路径、优先级（先 E/F）；若未执行须写明「合并前须在 CI 或本地通过」。
  - **五、规范审查清单**：与 `backend/docs/代码质量检查/后端代码质量检查规范.md` 一致（E/T/L/D/A/Q）；勾选已达标项。
  - **六、问题分级（与规范违规级别对应）**：
    - **Critical / 一级违规**：裸 SQL、日志 `%s`、长 I/O 持连不释放、响应结构违反协议等，必须立即整改；**任一项未通过则 Assessment = 不可合并**。
    - **Important / 二级违规**：缺类型注解、Session 未关闭、未做输入校验等，应限期修正；
    - **Minor / 三级违规**：绕过 CI、私自关闭检查等，需记录并改进流程。
  - **七、Strengths / Issues / Recommendations / Assessment**（必填）：
    - **Strengths**：已达标项或做得好的地方（具体到检查项或文件）；
    - **Issues**：按上述分级列出问题，每项含「文件:行号」「问题」「修复建议」；
    - **Recommendations**：后续改进建议（如补充测试、统一 Pylint 配置）；
    - **Assessment**：**Ready to merge?** 是/否/整改后可以；**若任一一级违规或必核未通过，必须为「否」**，并简要理由。
  - **八、建议行动**：提交前执行 Pylint、后续避免新增 `%s` 等；若 Pylint/mypy/测试未在本技能中执行，须写明合并前须在 CI 或本地通过。

### 7. 可选：按报告整改

- 若用户明确要求「按报告整改」或「一并整改」，则按报告中的违规列表逐项修改（优先日志占位符），并在报告中更新为「已整改」及整改记录。

---

## 规范要点（速查）

| 项 | 要求 |
|----|------|
| **底线** | 一级违规（裸 SQL、日志 %s、长 I/O 持连、响应结构违反协议）任一项不通过 → **不可合并**；必核 5 条须逐条勾选。 |
| 日志占位符 | 使用 loguru 时**禁止 `%s`**，须用 `{}` 或 f-string。 |
| 裸 SQL / 密钥 | 步骤 4 执行 grep 扫描；若存在则列出一级/二级违规。 |
| Pylint | 在 backend 下执行 `.\run_pylint.bat`，结果见 `logs/pylint.log`；优先处理 E/F；未执行须写明合并前须通过。 |
| 报告位置 | `docs/代码质量检查报告.md`。 |

---

## 参考（Superpowers 思路来源）

- **问题分级与输出结构**：`skills/superpowers-main/skills/requesting-code-review/`（Review early, review often；Critical/Important/Minor）。
- **Code reviewer 清单与输出格式**：`skills/superpowers-main/skills/requesting-code-review/code-reviewer.md`（Checklist、Strengths/Issues/Recommendations/Assessment）。
- **子 agent 中的质量评审**：`skills/superpowers-main/skills/subagent-driven-development/code-quality-reviewer-prompt.md`（先 spec 合规再 code quality；可与本技能配合：本技能做规范与静态检查，code-reviewer 做架构/测试/需求符合度）。

---

## 输出要求

- 给用户一段**简洁结论**：各检查项通过与否、有无待整改项、报告路径。
- **结构化结论**（参考 Superpowers code-reviewer）：若有问题，按 Critical/Important/Minor 分级简述；可附带 **Assessment**（如「整改后可以合并」）及 1～2 条 **Recommendations**。
- 若存在待整改项，明确列出并说明如何改（含示例）；若已执行整改，说明已改文件与报告已更新。
