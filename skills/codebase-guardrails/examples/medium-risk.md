# Example: Medium-Risk Task

Shows how risk grading widens investigation to the touched surface. Task: **change the behavior of an existing API endpoint** in an unfamiliar codebase.

## Flow

1. **Rule entry** — read AGENTS.md / CLAUDE.md; read the rule file for the layer being touched (backend/API rules if present).
2. **API implementation** — read the endpoint handler: request parsing, validation, service call, response construction.
3. **Validation pattern** — find how this project validates input (schema? pipe? manual checks?). Reuse the existing mechanism — do not introduce a new validation library.
4. **Consumers** — search callers of this endpoint (frontend calls, other services, tests) to understand what response shape they expect. Changing the response shape without checking consumers is a contract change — that would escalate to high risk / Stop & Ask.
5. **Types** — update related types/schemas if the change alters inputs or outputs; follow the project's type-sharing pattern (shared package if one exists).
6. **Tests** — if the project has tests for this endpoint, update or extend them following the existing test file style and location. If there are no tests, do not force-create a test framework.
7. **Modify** — make the smallest correct change.
8. **Verification** — run the project's relevant checks: the test command (if tests exist), type check, lint. Report actual results.
9. **Report** — what changed, which consumers were inspected, checks run + results, anything left unverified and why.

## What is NOT done here

- No architecture changes (no moving the endpoint to a new module, no introducing a service layer that does not exist).
- No new dependencies.
- No refactoring of the handler beyond what the change requires.
- No touching unrelated endpoints discovered while searching.

## Decision log

- Risk: medium → investigation covers rule entry + implementation + consumers + types + tests on the touched surface
- Stop & Ask: only if the change breaks the public contract of the endpoint (then Stop & Ask before proceeding)
- Verification: project test/typecheck/lint relevant to the change
