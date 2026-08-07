# adonisjs

Develop AdonisJS **v7** applications using official documentation conventions only.
Prevents outdated APIs and undocumented inventiveness.

## Activation

Triggers on AdonisJS / Adonis / Lucid / VineJS / Edge / Ace / Japa-in-Adonis work,
including upgrades from v6 → v7.

## Version pin

- Current target: **AdonisJS v7** — https://docs.adonisjs.com
- Legacy: v6 — https://v6-docs.adonisjs.com
- Detect with `python3 scripts/detect_version.py`

## Usage

1. Detect project major version.
2. Open the matching section under `references/` (see topic map in [SKILL.md](SKILL.md)).
3. If unsure of an API: `python3 scripts/lookup_docs.py --fetch <topic>`.
4. Implement with Ace generators + official examples; add Japa tests.
5. Cite official doc URLs for non-obvious APIs.

## Full instructions

See [SKILL.md](SKILL.md) for operating rules, topic map, testing requirements, and
anti-patterns. Read `references/anti-patterns.md` before suggesting older APIs.
