# agent-skills

[English](README.md) | [中文](README.zh-CN.md)

**A personal Agent Skills vault for real developer work** — skills drawn from day-to-day coding scenarios, kept in `SKILL.md` format for Cursor, Claude Code, and other agents that load skills from a folder.

## What this repo is

This is not a framework-specific marketplace, and not a one-shot dump of prompts.

It is a **personal, continuously growing collection of Agent Skills** for situations I actually hit while building software — especially when official or built-in skills do not cover the stack, conventions, or workflow well enough. Each skill is written from a working developer’s angle: what to do, what to avoid, and how an agent should behave in that scenario.

New skills will keep landing here as new work scenarios show up.

## Features

- **Work-scenario driven** — skills come from personal development practice, not abstract demos
- **Fill the gaps** — for stacks and habits that official skills do not cover well
- **Continuously expanding** — more skills will be added over time from ongoing work
- **`SKILL.md` standard** — drop-in folders that compatible agents can load
- **Progressive disclosure** — short entry points, deeper `references/`, concrete `examples/` when needed
- **Easy install** — `npx skills` globally or per project, or copy into `.cursor/skills`

## Skills

Current skills (more will be added from future work scenarios):

| Skill | Description | Path |
| --- | --- | --- |
| **adonisjs** | AdonisJS **v7** development: Controllers + injected Services, Vine validation, Auth/Bouncer, Ace CLI, stack kits, v6→v7 anti-patterns, and live docs lookup. | [`skills/adonisjs/`](skills/adonisjs/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM: models, migrations, relationships, query builders, seeders/factories, schema generation. Prefer over inventing Prisma/Eloquent patterns. | [`skills/lucid/`](skills/lucid/) |
| **codebase-guardrails** | Cross-project AI behavior guardrails: read project rules first, act on evidence, minimum correct changes, Stop & Ask at boundaries, verify before claiming done. | [`skills/codebase-guardrails/`](skills/codebase-guardrails/) |
| **repository-structure** | Place and evolve code by ownership, change boundaries, and real consumers; avoid overloaded units, speculative abstractions, and parallel sources of truth. | [`skills/repository-structure/`](skills/repository-structure/) |
| **test-database-workflow** | Safely use an explicitly isolated test database for integration and functional tests. | [`skills/test-database-workflow/`](skills/test-database-workflow/) |
| **infrastructure-operations** | Diagnose deployment, container, environment, and runtime-state questions from configuration first. | [`skills/infrastructure-operations/`](skills/infrastructure-operations/) |

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
cp -R skills/codebase-guardrails .cursor/skills/codebase-guardrails

# Cursor — user-level
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
cp -R skills/codebase-guardrails ~/.cursor/skills/codebase-guardrails
```

## How it works

Each skill is a self-contained folder:

```text
skills/<name>/
├── SKILL.md           # Agent entry: when to use, hard rules, topic map
├── references/        # Topic cheat-sheets + anti-patterns (optional)
├── examples/          # Vertical slices (optional)
├── scripts/           # Helper scripts (optional)
└── assets/            # Indexes / static data (optional)
```

Typical loop:

1. Hit a real work scenario that needs better agent guidance
2. Capture it as a skill in this repo (or improve an existing one)
3. Install / reload the skill in the agent
4. Reuse it the next time the same kind of work appears

## Requirements

- Agents that load skills from a directory containing `SKILL.md` (e.g. Cursor, Claude Code)
- Python 3 (optional, only for skills that ship helper scripts)

## License

See repository for license details. Skills are provided for use with compatible AI agents.
