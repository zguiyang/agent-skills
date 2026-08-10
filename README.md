# agent-skills

[English](README.md) | [中文](README.zh-CN.md)

**Curated AI Agent Skills for AdonisJS** — official-docs conventions in `SKILL.md` format, ready for Cursor, Claude Code, and other agents that load skills from a folder.

## Why this project

AI coding agents often invent Express / Nest / Laravel / Prisma patterns when working on AdonisJS. This repo packages **docs-grounded skills** so agents follow current official APIs, Ace generators, and production layering — instead of outdated v5/v6 habits or framework mix-ups.

## Features

- **Official-docs first** — conventions distilled from [docs.adonisjs.com](https://docs.adonisjs.com/) and [lucid.adonisjs.com](https://lucid.adonisjs.com/)
- **Progressive disclosure** — short `SKILL.md` entry points, deep `references/` cheat-sheets, end-to-end `examples/`
- **Live docs lookup** — scripts to resolve topics and optionally `--fetch` the latest official Markdown
- **Anti-pattern guards** — explicit “do not invent” rules for legacy Adonis and foreign ORM APIs
- **Easy install** — `npx skills` globally or per project, or copy into `.cursor/skills`

## Skills

| Skill | Description | Path | Docs |
| --- | --- | --- | --- |
| **adonisjs** | AdonisJS **v7** development: Controllers + injected Services, Vine validation, Auth/Bouncer, Ace CLI, stack kits, v6→v7 anti-patterns, and live docs lookup. | [`skills/adonisjs/`](skills/adonisjs/) | [docs.adonisjs.com](https://docs.adonisjs.com/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM: models, migrations, relationships, query builders, seeders/factories, schema generation. Prefer over inventing Prisma/Eloquent patterns. | [`skills/lucid/`](skills/lucid/) | [lucid.adonisjs.com](https://lucid.adonisjs.com/docs/introduction) |

## Installation

### With `npx skills` (recommended)

```bash
# Install all skills globally
npx skills add zguiyang/agent-skills -g --all

# Install all skills into the current project
npx skills add zguiyang/agent-skills --all

# Install a single skill (example: lucid)
npx skills add zguiyang/agent-skills --skill lucid
```

### Manual copy

```bash
# Cursor — project-level
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs
cp -R skills/lucid .cursor/skills/lucid

# Cursor — user-level
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
```

## How it works

Each skill is a self-contained folder:

```text
skills/<name>/
├── SKILL.md           # Agent entry: when to use, hard rules, topic map
├── references/        # Topic cheat-sheets + anti-patterns
├── examples/          # Vertical slices (e.g. CRUD resource)
├── scripts/           # detect_version.py, lookup_docs.py, …
└── assets/            # Doc URL index for lookup
```

Typical agent loop:

1. Detect framework / package version
2. Map the task → matching `references/*.md`
3. If thin or stale → `lookup_docs.py --fetch <slug>`
4. Implement with Ace `make:*` / official patterns
5. Cite docs for non-obvious APIs

## Requirements

- Agents that load skills from a directory containing `SKILL.md` (e.g. Cursor, Claude Code)
- Python 3 (optional, for version detect / docs lookup scripts inside each skill)

## License

See repository for license details. Skills are provided for use with compatible AI agents.
