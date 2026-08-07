# Eval Spec: adonisjs

Structural gates for the DoD-complete AdonisJS skill.

## Criteria

1. **docs-index-coverage** — ≥ 90 official doc URLs
2. **version-pin-v7** — SKILL.md pins v7 + docs.adonisjs.com
3. **lookup-resolves** — lookup_docs.py resolves core topics
4. **anti-patterns-present** — anti-patterns mentions urlFor
5. **example-present** — examples/crud-resource.md exists
6. **schema-workflow** — database.md mentions generated schema / not hand-edit

## Commands (run from skill root)

```bash
python3 -c "from pathlib import Path; u=[l for l in Path('assets/doc-urls.txt').read_text().splitlines() if 'docs.adonisjs.com' in l]; assert len(u) >= 90, len(u)"
python3 -c "t=open('SKILL.md').read(); assert 'AdonisJS v7' in t and 'docs.adonisjs.com' in t"
python3 scripts/lookup_docs.py validation
python3 -c "t=open('references/anti-patterns.md').read(); assert 'urlFor' in t"
test -f examples/crud-resource.md
python3 -c "t=open('references/database.md').read(); assert 'schema.ts' in t and 'hand-edit' in t.lower() or 'Do not hand-edit' in t"
```
