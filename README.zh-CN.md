# agent-skills

[English](README.md) | [中文](README.zh-CN.md)

**面向 AdonisJS 的 AI Agent Skills 合集** — 基于官方文档约定的 `SKILL.md` 技能包，适用于 Cursor、Claude Code 等从目录加载 skill 的 Agent。

## 为什么需要这个项目

在 AdonisJS 项目上，AI 编码 Agent 容易套用 Express / Nest / Laravel / Prisma 等外来模式，或沿用过时的 v5/v6 API。本仓库将**以官方文档为准的约定**打包成 Skill，让 Agent 优先使用当前官方 API、Ace 生成器与生产级分层，而不是臆造辅助函数或混用其他框架习惯。

## 特性

- **官方文档优先** — 约定提炼自 [docs.adonisjs.com](https://docs.adonisjs.com/) 与 [lucid.adonisjs.com](https://lucid.adonisjs.com/)
- **渐进披露** — 精简的 `SKILL.md` 入口、深入的 `references/` 速查、完整的 `examples/` 垂直示例
- **在线文档检索** — 内置脚本按主题定位，并可 `--fetch` 拉取最新官方 Markdown
- **反模式约束** — 明确禁止过时 Adonis API 与外来 ORM 写法
- **安装简单** — 支持 `npx skills` 全局/项目安装，或手动复制到 `.cursor/skills`

## 技能列表

| 技能 | 说明 | 路径 | 文档 |
| --- | --- | --- | --- |
| **adonisjs** | AdonisJS **v7** 开发：Controller + 注入式 Service、Vine 校验、Auth/Bouncer、Ace CLI、Starter Kit、v6→v7 反模式，以及在线文档查找。 | [`skills/adonisjs/`](skills/adonisjs/) | [docs.adonisjs.com](https://docs.adonisjs.com/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM：模型、迁移、关联、查询构建器、Seeder/Factory、Schema 生成。优先于臆造 Prisma/Eloquent 模式。 | [`skills/lucid/`](skills/lucid/) | [lucid.adonisjs.com](https://lucid.adonisjs.com/docs/introduction) |

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

# Cursor — 用户级
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
```

## 工作原理

每个技能是一个独立目录：

```text
skills/<name>/
├── SKILL.md           # Agent 入口：何时启用、硬性约定、主题索引
├── references/        # 主题速查 + 反模式
├── examples/          # 垂直切片示例（如 CRUD 资源）
├── scripts/           # detect_version.py、lookup_docs.py 等
└── assets/            # 文档 URL 索引（供 lookup 使用）
```

典型 Agent 流程：

1. 检测框架 / 包版本
2. 将任务映射到对应的 `references/*.md`
3. 若内容偏薄或可能过时 → `lookup_docs.py --fetch <slug>`
4. 使用 Ace `make:*` / 官方模式实现
5. 对非显而易见的 API 引用官方文档

## 使用要求

- 支持从包含 `SKILL.md` 的目录加载技能的 Agent（如 Cursor、Claude Code）
- Python 3（可选，用于各技能内的版本检测 / 文档查找脚本）

## 许可证

详见仓库说明。本仓库技能供兼容的 AI Agent 使用。
