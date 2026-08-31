# Investigation Depth

How much to investigate before acting, graded by task risk. The goal: enough evidence to avoid assumptions, but no full-project scans on every task.

## Risk levels

### Low risk
Typical tasks: rename a variable/function, fix a comment, adjust styling, add a small self-contained file.

Required investigation:
1. Rule entry point (AGENTS.md / CLAUDE.md / rule directory) — skim for constraints touching this task
2. The target file itself
3. Adjacent code in the same directory (naming, structure, conventions)

Explicitly avoid: global structure scans, consumer searches, test inventory. Budget: ~5 minutes of reading.

### Medium risk
Typical tasks: modify an API endpoint or handler, change component/function logic, adjust error handling, change a validation rule.

Required investigation (all of Low, plus):
1. The relevant rules for that layer/module
2. Consumers of the thing being changed (who calls it)
3. Related types and schemas
4. Related tests, if any
5. Same-directory conventions

Budget: bounded to the touched surface; do not read unrelated modules.

### High risk
Typical tasks: database schema or migration changes, authentication/authorization changes, public API contract changes, architecture-level refactors, large restructuring.

Required investigation (all of Medium, plus):
1. Schema / migrations / seed data as applicable
2. Rule sections covering architecture, layering, database discipline
3. ADRs, design docs, architecture notes
4. All known consumers and their expectations
5. Stop-condition check — most high-risk tasks trigger Stop & Ask before any change (see [stop-conditions.md](stop-conditions.md))

No shortcuts here: high-risk decisions are expensive to reverse.

## Evidence checklist (used selectively, never all at once)

- Project rules
- Project structure
- Relevant implementation
- Existing abstractions
- Existing dependencies
- Existing tests
- Existing scripts
- Existing configuration
- Related documentation

Pick only the items that sit on the task's contact surface. A comment fix does not require the dependency list.

## Existing Capability Discovery

Before introducing anything new (a dependency, a helper, a wrapper, a script), discover what the project already has **on this task's contact surface**:

| Task touches | Check for |
|---|---|
| API work | request layer, validation, error handling, existing API helpers |
| New feature | utilities, shared packages, existing abstractions, related dependencies |
| Backend logic | service/controller patterns, error classes, logging setup, auth helpers |
| Data work | database access layer, migration tooling, seed scripts |
| Anything | package.json scripts, package manager, lint/format/test commands |

"Do the project already have something that does this?" is asked **once, on the touched surface** — not as a repository-wide search.

## Investigation economy

- Low risk → minimal reading, act quickly
- Medium risk → read the touched surface, then act
- High risk → read broadly, then stop and confirm before acting
- Never re-read what you already verified in this session; cite it instead
