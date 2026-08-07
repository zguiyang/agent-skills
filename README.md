# agent-skills

A collection of AI Agent Skills (Agent Skills / `SKILL.md` format). Portable across Cursor, Claude Code, and other agents that load skills from a folder containing `SKILL.md`.

## Skills

### adonisjs

AdonisJS **v7** development skill: official-docs conventions, slim topic cheat-sheets, Ace CLI usage, v6→v7 anti-patterns, and `lookup_docs.py` for live `.md` pages. App CLI is `node ace` inside the project (`npm create adonisjs@latest` to scaffold).

- **Path**: `skills/adonisjs/`
- **Docs**: https://docs.adonisjs.com/

## Installation

```bash
# Example: Cursor project skill
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs

# Example: user-level
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
```

Or with a skills installer, if you publish this repo:

```bash
npx skills add <owner>/<repo> -g --all
```
