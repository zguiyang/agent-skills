# AdonisJS Dev Skill

Official-docs-grounded skill for **AdonisJS v7**. Short topic cheat-sheets, anti-pattern
guards, a full docs URL index, and scripts to resolve / fetch live official Markdown.

## Install

```bash
./install.sh --platform cursor --project
# or
./install.sh --all
```

Cursor (from this repo):

```bash
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs
```

## Use

Ask the agent to follow the `adonisjs` skill, e.g.:

> Add a posts resource with VineJS validation and Japa API tests

Helpers:

```bash
python3 scripts/detect_version.py
python3 scripts/lookup_docs.py validation
python3 scripts/lookup_docs.py --fetch guides/testing/api-tests
```

## Version pin

- Target: **AdonisJS v7** — https://docs.adonisjs.com
- Legacy: https://v6-docs.adonisjs.com
- Upgrade: https://docs.adonisjs.com/v6-to-v7.md

## Layout

```
adonisjs/
├── SKILL.md              # Agent operating rules
├── AGENTS.md             # Short activation card
├── references/           # Slim topic cheat-sheets + docs-index + llms.md
├── scripts/              # detect_version.py, lookup_docs.py, …
└── assets/               # doc-index.json, doc-urls.txt
```
