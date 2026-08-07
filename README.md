# agent-skills

A collection of AI Agent Skills (`SKILL.md` format). Works with Cursor, Claude Code, and other agents that load skills from a folder containing `SKILL.md`.

## Skills

| Skill | Description | Path | Docs |
| --- | --- | --- | --- |
| **adonisjs** | AdonisJS **v7** development: official-docs conventions, topic cheat-sheets, Ace CLI, v6→v7 anti-patterns, and live docs lookup. Prevents outdated v5/v6 APIs. | [`skills/adonisjs/`](skills/adonisjs/) | [docs.adonisjs.com](https://docs.adonisjs.com/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM: models, migrations, relationships, query builders, seeders/factories, and schema generation. Prefer over inventing Prisma/Eloquent patterns. | [`skills/lucid/`](skills/lucid/) | [lucid.adonisjs.com](https://lucid.adonisjs.com/docs/introduction) |

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
