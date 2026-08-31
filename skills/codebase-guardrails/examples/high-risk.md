# Example: High-Risk Task

Shows when investigation is broad and the AI must Stop & Ask before touching anything. Task: **add a new field to a core data record** (database schema change) in an unfamiliar codebase.

## Flow

1. **Rule entry** — read AGENTS.md / CLAUDE.md; read all rule files covering database discipline, migrations, and layering.
2. **Current state** — read the schema definition, the existing migrations, and how the field's table is used.
3. **Design docs** — read ADRs / architecture notes / domain model docs that describe this entity. A domain doc may forbid the very field being requested or prescribe its naming.
4. **Consumers** — inventory everywhere the entity is read/written: backend services, queries, frontend forms, sync jobs. A new field touches all of them.
5. **Stop & Ask** — this task triggers stop conditions (database change; possibly rule-vs-reality conflict if docs and code disagree). Present the user:
   - what the change involves (schema + migration + consumer updates + verification),
   - any conflicts found between docs, rules, and code,
   - the recommended approach (e.g. nullable field + backfill vs required + data migration).
   Wait for the user's decision before writing anything.
6. **After the decision** — implement per the chosen approach: schema change via the project's migration mechanism (never hand-written SQL in a project that has a migration tool), update types/schemas following the project's type-sharing pattern, update consumers.
7. **Full verification** — run the project's migration check, type check, test suite (especially any integration tests with a real database), and lint. Report each command and its actual result.
8. **Report** — the decision taken, what changed, migrations created, all verification output, and any remaining risk.

## What is NOT done here

- No silent schema changes (no `sync({alter:true})`-style shortcuts in projects that use migrations).
- No choosing between "rules say X, code does Y" without asking.
- No adding a new database library or tool.
- No unrelated schema improvements spotted during investigation.

## Decision log

- Risk: high → full evidence investigation, then Stop & Ask before any change
- Stop & Ask: mandatory (database structure change, possibly rule-vs-reality conflict, multiple approaches)
- Verification: complete project verification including migration and integration checks
