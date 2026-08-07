# Eval Spec: lucid

Structural gates for a DoD-complete skill (Track A operating system).

## Criteria

1. **docs-index-coverage** — ≥ 30 official Lucid doc URLs.
2. **version-pin** — SKILL.md pins `@adonisjs/lucid` and lucid.adonisjs.com.
3. **lookup-resolves** — `scripts/lookup_docs.py` resolves `models`.
4. **anti-patterns-present** — `references/anti-patterns.md` exists.
5. **example-present** — at least one file under `examples/`.

## Spec

```json
{
  "skill": "lucid",
  "criteria": [
    {
      "id": "docs-index-coverage",
      "type": "command",
      "cmd": "python3 -c \"from pathlib import Path; u=[l for l in Path('assets/doc-urls.txt').read_text().splitlines() if l.strip()]; assert len(u) >= 30, len(u)\""
    },
    {
      "id": "version-pin",
      "type": "command",
      "cmd": "python3 -c \"t=open('SKILL.md').read(); assert '@adonisjs/lucid' in t and 'lucid.adonisjs.com' in t\""
    },
    {
      "id": "lookup-resolves",
      "type": "command",
      "cmd": "python3 scripts/lookup_docs.py models"
    },
    {
      "id": "anti-patterns-present",
      "type": "command",
      "cmd": "test -f references/anti-patterns.md"
    },
    {
      "id": "example-present",
      "type": "command",
      "cmd": "test -n \\\"$(ls examples 2>/dev/null)\\\" "
    }
  ]
}
```

Run from `output/skills/lucid/`.
