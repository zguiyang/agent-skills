# agent-skills

[English](README.md) | [中文](README.zh-CN.md)

**面向真实开发工作的个人 Agent Skills 仓库** — 从日常编码场景中沉淀技能，以 `SKILL.md` 格式整理，适用于 Cursor、Claude Code 等从目录加载 skill 的 Agent。

## 这是什么

这不是某个框架的官方技能市场，也不是一次性堆满的提示词合集。

这是一份**持续增长的个人 Agent Skills 记录库**：技能来自我作为开发者在实际工作里碰到的场景——尤其是官方或内置技能覆盖不到、或不够贴合技术栈 / 约定 / 工作流的时候。每份 skill 都从个人开发者的使用角度出发：该怎么做、不该怎么做、Agent 在该场景下应如何表现。

后续会随着新的工作场景，**持续新增**更多技能。

## 特性

- **工作场景驱动** — 来自个人开发实践，而非抽象演示
- **补齐缺口** — 面向官方技能覆盖不足的技术栈与习惯
- **持续扩充** — 会随日常工作不断加入新技能
- **遵循 `SKILL.md` 约定** — 可直接放入兼容 Agent 的 skills 目录
- **渐进披露** — 精简入口；需要时再展开 `references/` 与 `examples/`
- **安装简单** — 支持 `npx skills` 全局/项目安装，或手动复制到 `.cursor/skills`

## 技能列表

当前已收录的技能（后续会从新的工作场景中继续补充）：

| 技能 | 说明 | 路径 |
| --- | --- | --- |
| **adonisjs** | AdonisJS **v7** 开发：Controller + 注入式 Service、Vine 校验、Auth/Bouncer、Ace CLI、Starter Kit、v6→v7 反模式，以及在线文档查找。 | [`skills/adonisjs/`](skills/adonisjs/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM：模型、迁移、关联、查询构建器、Seeder/Factory、Schema 生成。优先于臆造 Prisma/Eloquent 模式。 | [`skills/lucid/`](skills/lucid/) |
| **codebase-guardrails** | 跨项目 AI 行为护栏：先读项目规则、基于证据行动、最小正确修改、边界处 Stop & Ask、完成前验证。 | [`skills/codebase-guardrails/`](skills/codebase-guardrails/) |
| **repository-structure** | 按所有权、变更边界与真实使用方放置和演进代码；避免巨型单元、预防性抽象与重复事实来源。 | [`skills/repository-structure/`](skills/repository-structure/) |
| **test-database-workflow** | 为集成和功能测试安全使用明确隔离的测试数据库。 | [`skills/test-database-workflow/`](skills/test-database-workflow/) |
| **infrastructure-operations** | 从配置优先地诊断部署、容器、环境变量与运行时状态问题。 | [`skills/infrastructure-operations/`](skills/infrastructure-operations/) |
| **cursor-delegate** | 当任务边界明确且执行量非琐碎时，优先委派给用户本机的 Cursor CLI；适用时优先使用用户验证过的最简调用，仅在需要时检查 CLI 帮助，并由调用方 Agent 保留范围、授权和最终验收。 | [`skills/cursor-delegate/`](skills/cursor-delegate/) |
| **pi-delegate** | 用于判断何时值得通过 MCP 委派给 Pi Worker 的策略；Supervisor 仍负责决策、整合和最终验收。 | [`skills/pi-delegate/`](skills/pi-delegate/) |

## 安装

### 使用 `npx skills`（推荐）

```bash
# 全局安装全部技能
npx skills add zguiyang/agent-skills -g --all

# 安装到当前项目
npx skills add zguiyang/agent-skills --all

# 只安装单个技能（示例：lucid）
npx skills add zguiyang/agent-skills --skill lucid
```

### 为 Codex 安装 `pi-delegate`

`pi-worker-mcp` 与本 Skill 是两个独立项目。请先为实际使用的 Host 与作用域安装 MCP；它负责 Pi Runtime、Worker 生命周期、RPC 与 Worktree 创建：

```bash
npx -y @zguiyang/pi-worker-mcp@0.1.1 setup
```

然后可选地在希望 Codex 应用委派策略的任意项目根目录安装 Skill：

```bash
npx skills add zguiyang/agent-skills --skill pi-delegate -a codex -y
```

此命令仅在项目级安装 `pi-delegate`，且只安装给 Codex。`-y` 会跳过确认提示。当前 `skills` CLI 会将 Codex 项目级 Skill 安装到 `.agents/skills/`。若要交互式确认选项，可省略 `-y`。

MCP 需要 Node.js 20+、已在本机配置好的 `pi` 可执行文件，以及用于 worktree 模式的 Git。MCP 由 Host 启动，不由此 Skill 启动。`pi-delegate` 不包含 Pi runner、不配置 Provider 或凭据、不安装 MCP，也不会替换 Pi 默认模型。Supervisor 不传 `model` 时，Pi 使用已保存的本机默认模型。

对于一个具体、边界明确的原子执行任务，Supervisor 默认优先使用 Pi：无论它是读取一个小文件、运行一次定向测试、单文件修复、机械修改，还是更大的实现。任务大小不是门槛；目标、上下文、操作边界、完成检查和副作用必须清楚。Supervisor 保留需求理解、产品与架构决策、规划、权限与风险判断、任务依赖、整合、审查和最终验收。复杂目标应先拆成连贯、可独立验收的任务再派发；相关后续工作优先使用 `pi_continue`。

已经注册的 MCP 工具为：`pi_list`、`pi_spawn`、`pi_status`、`pi_steer`、`pi_continue` 和 `pi_abort`。独立的只读调查可以并行。写入必须避免冲突：仅在明确且已检查工作区状态时使用 `direct`，或者使用 MCP 管理的 `worktree` 模式执行隔离实现。`PI_WORKER_ALLOWED_ROOTS` 是路径允许列表，而不是操作系统沙箱。原子化不等于获得破坏性数据操作、敏感配置处理、生产环境操作、不可逆修改、Git 历史重写或扩大范围的授权。Spawn 被接受或 Worker 状态为 `settled` 都不表示结果正确；Supervisor 必须在验收前核对源码证据、diff、范围、检查结果和副作用。详细说明见 [Skill 文档](skills/pi-delegate/SKILL.md) 和 [MCP 契约](skills/pi-delegate/references/mcp-contract.md)。

`inspect` 仅有读取与搜索工具，不能运行 `bash`；测试、构建、lint 或任何 Shell 命令都要使用 `implement`，并审查命令副作用。Worktree 基于 Git `HEAD` 创建，不包含未提交或未跟踪文件。`pi_continue` 保持 Worker 的 profile 和 mode，且仅在当前 MCP Server 中该 Worker 仍为非终止状态时有效；Worker 使用 `--no-session`，因此 `workerId` 不能跨 MCP 重启使用。

### 手动复制

```bash
# Cursor — 项目级
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs
cp -R skills/lucid .cursor/skills/lucid
cp -R skills/codebase-guardrails .cursor/skills/codebase-guardrails
cp -R skills/cursor-delegate .cursor/skills/cursor-delegate
cp -R skills/pi-delegate .cursor/skills/pi-delegate

# Cursor — 用户级
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
cp -R skills/codebase-guardrails ~/.cursor/skills/codebase-guardrails
cp -R skills/cursor-delegate ~/.cursor/skills/cursor-delegate
cp -R skills/pi-delegate ~/.cursor/skills/pi-delegate
```

## 工作原理

每个技能是一个独立目录：

```text
skills/<name>/
├── SKILL.md           # Agent 入口：何时启用、硬性约定、主题索引
├── references/        # 主题速查 + 反模式（可选）
├── examples/          # 垂直切片示例（可选）
├── scripts/           # 辅助脚本（可选）
└── assets/            # 索引 / 静态数据（可选）
```

典型循环：

1. 在真实工作中碰到需要更好 Agent 引导的场景
2. 在本仓库沉淀为新 skill（或改进已有 skill）
3. 在 Agent 中安装 / 重新加载
4. 下次同类工作时直接复用

## 使用要求

- 支持从包含 `SKILL.md` 的目录加载技能的 Agent（如 Cursor、Claude Code）
- Python 3（可选，仅部分技能附带辅助脚本时需要）

## 许可证

详见仓库说明。本仓库技能供兼容的 AI Agent 使用。
