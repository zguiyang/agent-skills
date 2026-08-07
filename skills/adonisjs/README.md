# AdonisJS Dev Skill

Official-docs-grounded skill for **AdonisJS v7** development. Indexes the full
public documentation sitemap (103 pages), ships condensed topic references,
anti-pattern guards, and scripts to resolve / fetch live docs.

## Install

```bash
./install.sh --platform cursor --project
# or
./install.sh --all
```

Cursor (this repo / project):

```bash
mkdir -p .cursor/skills
cp -R adonisjs .cursor/skills/adonisjs
```

Also symlinkable to `~/.agents/skills/adonisjs` for universal discovery.

## Use

```
/adonisjs Add a posts resource with VineJS validation and Japa API tests
```

Helper scripts:

```bash
python3 scripts/detect_version.py
python3 scripts/lookup_docs.py validation
python3 scripts/lookup_docs.py --fetch guides/testing/api-tests
```

## Version pin

- Target: **AdonisJS v7** — https://docs.adonisjs.com
- Legacy: https://v6-docs.adonisjs.com
- Upgrade notes: https://docs.adonisjs.com/v6-to-v7

## Coverage

See `references/docs-index.md` for every indexed official URL. Topic playbooks live
under `references/*.md`.
