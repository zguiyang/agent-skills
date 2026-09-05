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
| **repository-structure** | 以真实所有权与使用方证据安全调整目录和模块，避免预防性抽象与重复事实来源。 | [`skills/repository-structure/`](skills/repository-structure/) |
| **test-database-workflow** | 为集成和功能测试安全使用明确隔离的测试数据库。 | [`skills/test-database-workflow/`](skills/test-database-workflow/) |
| **infrastructure-operations** | 从配置优先地诊断部署、容器、环境变量与运行时状态问题。 | [`skills/infrastructure-operations/`](skills/infrastructure-operations/) |

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

### 手动复制

```bash
# Cursor — 项目级
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs
cp -R skills/lucid .cursor/skills/lucid
cp -R skills/codebase-guardrails .cursor/skills/codebase-guardrails

# Cursor — 用户级
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
cp -R skills/codebase-guardrails ~/.cursor/skills/codebase-guardrails
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
