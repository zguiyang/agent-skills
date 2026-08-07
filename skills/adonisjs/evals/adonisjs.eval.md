# Eval Spec: adonisjs

Structural gates for the docs-grounded AdonisJS development skill. Validates
that the official URL index, version pin, lookup tooling, and anti-pattern
guards remain intact.

## Criteria

1. **docs-index-coverage** — at least 90 official doc URLs indexed.
2. **version-pin-v7** — SKILL.md pins AdonisJS v7 and docs.adonisjs.com.
3. **lookup-resolves** — lookup_docs.py resolves core topics to official URLs.
4. **anti-patterns-present** — outdated API guard file exists and mentions urlFor.
5. **scripts-executable** — detect_version and lookup_docs import cleanly.

## Spec

```json
{
  "skill": "adonisjs",
  "run": "python3 scripts/lookup_docs.py {input} > {output}",
  "criteria": [
    {
      "id": "docs-index-coverage",
      "text": "assets/doc-urls.txt lists at least 90 official docs.adonisjs.com URLs",
      "type": "command",
      "cmd": "python3 -c \"from pathlib import Path; u=[l for l in Path('assets/doc-urls.txt').read_text().splitlines() if 'docs.adonisjs.com' in l]; assert len(u) >= 90, len(u)\""
    },
    {
      "id": "version-pin-v7",
      "text": "SKILL.md pins framework_version 7 and docs.adonisjs.com",
      "type": "command",
      "cmd": "python3 -c \"t=open('SKILL.md').read(); assert 'framework_version: \\\"7\\\"' in t or 'framework_version: \\'7\\'' in t or 'AdonisJS **v7**' in t; assert 'docs.adonisjs.com' in t\""
    },
    {
      "id": "lookup-resolves",
      "text": "lookup_docs.py resolves routing to guides/basics/routing",
      "type": "command",
      "cmd": "python3 -c \"import subprocess; o=subprocess.check_output(['python3','scripts/lookup_docs.py','routing'], text=True); assert 'guides/basics/routing' in o\""
    },
    {
      "id": "anti-patterns-present",
      "text": "anti-patterns.md warns against router.makeUrl and prefers urlFor",
      "type": "command",
      "cmd": "python3 -c \"t=open('references/anti-patterns.md').read(); assert 'makeUrl' in t and 'urlFor' in t\""
    },
    {
      "id": "scripts-executable",
      "text": "detect_version.py runs and reports docs URL",
      "type": "command",
      "cmd": "python3 -c \"import subprocess; o=subprocess.check_output(['python3','scripts/detect_version.py'], text=True); assert 'docs.adonisjs.com' in o or 'v6-docs' in o\""
    }
  ],
  "golden": [
    {
      "id": "case-routing",
      "input": "golden/case-routing/input.txt",
      "expected": "golden/case-routing/expected.txt",
      "split": "val",
      "compare": "none",
      "expected_status": "pass"
    },
    {
      "id": "case-testing",
      "input": "golden/case-testing/input.txt",
      "expected": "golden/case-testing/expected.txt",
      "split": "val",
      "compare": "none",
      "expected_status": "pass"
    },
    {
      "id": "case-upgrade",
      "input": "golden/case-upgrade/input.txt",
      "expected": null,
      "split": "test",
      "compare": "none",
      "expected_status": "pending-first-green"
    }
  ]
}
```
