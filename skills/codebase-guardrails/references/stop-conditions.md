# Stop & Ask Conditions

When the AI must stop inferring and request a user decision. These are obligations, not suggestions.

## The eleven stop conditions

1. **Rule conflict** — two project conventions contradict each other (e.g. two naming styles both in active use) and no evidence decides which is current.
2. **Rules vs code reality conflict** — project rules and actual code disagree; cannot tell whether rules are stale or code is mid-migration.
3. **User request vs project rules conflict** — the user asks for something the rules forbid or contradict. State the conflict, then ask.
4. **Major new dependency** — a dependency not directly implied by the task (especially ORM, UI framework, state library, or other heavyweight choice).
5. **Database structure change** — adding tables, changing columns, altering migrations — unless the task is explicitly database work.
6. **Auth/permission change** — changing the authentication mechanism or permission model.
7. **Public API contract change** — changing semantics or response shape of an existing endpoint that has consumers.
8. **Architecture-level refactor** — directory reorganization, layering changes, package split/merge, framework migration.
9. **Existing bug found but not requested** — the current implementation is likely wrong, but the user did not ask to fix it. Report and ask whether to fix.
10. **Multiple plausible approaches, evidence cannot decide** — present the options with evidence and a recommendation; let the user choose.
11. **Completion criteria unclear** — cannot define the boundary of the minimum correct change.

## When NOT to stop

Stop & Ask is not "ask about every small thing". Do **not** stop for:

- Reversible, low-cost, local issues (wrong variable name, minor style)
- Choices where any option satisfies the request and the difference is cosmetic
- Information the project itself can answer (read the code, read the rules)

## Decision test

Before stopping, apply this test — stop only if at least one holds:

- **Irreversible** (e.g. data loss, migration applied, public API published)
- **High cost** to redo (large refactor, weeks of migration)
- **Large impact surface** (many consumers, cross-cutting concern)
- **Requires user intent** (the choice depends on what the user wants, not on facts)

If none holds: decide with evidence and proceed.
