# Decision Priority Model

The full reference for how to resolve conflicts between sources of guidance.

## The seven-level order

```
1. User explicit request        — the goal; cannot be overridden
2. Project-specific rules       — written project rules (AGENTS.md, CLAUDE.md, .cursor/rules, .ai-rules, ...)
3. Actual project state         — what the code actually does today
4. Existing project conventions — unwritten patterns inferred from real code
5. Owner default preferences — defaults when 1–4 have no answer
6. Generic best practices       — fallback when 5 has no answer
7. AI assumptions               — never a decision basis; must be labeled and verified
```

## Layer responsibilities

| Level | Responsibility | Active when |
|---|---|---|
| 1 User request | Final goal; never violated | Always |
| 2 Project rules | Project's persisted intent | Rules exist |
| 3 Project state | Ground truth; anti-hallucination anchor | All evidence gathering |
| 4 Conventions | Inferred norms from actual code | Rules silent |
| 5 Owner defaults | Defaults (simple, few deps, small steps) | 1–4 have no answer |
| 6 Best practices | Generic fallback | 5 has no answer |
| 7 Assumptions | Explicitly labeled, awaiting verification | Never a basis for decisions |

## Rules ≠ Reality

Project rules may describe a **target state** while the code is still mid-migration:

- Rules may prohibit a legacy model that still exists in code.
- Rules may define a new directory layout that only half the repo follows.
- Rules may document a convention the code contradicts (naming, response shapes).

The code is evidence of **current state**; the rules are evidence of **intended direction**. Neither silently wins.

## Conflict handling

When rules and code reality conflict:

```
Do not silently choose either side.
→ Report the conflict with both pieces of evidence.
→ Ask the user which side is authoritative (or whether this is a migration in progress).
```

Same rule for any other adjacent levels: user request vs rules, conventions vs preferences, etc.

## Project-internal priority

If the project's own rules define an internal priority order (e.g. "user > AGENTS.md > .ai-rules/*.md > official docs"), follow the project's order. This skill only defines the **order between levels**, never a competing order inside a project's own rule set.

## The failure this prevents

The AI overrides project reality because "my personal habits say so" — or overrides project rules because "the code contradicts them". Both are wrong without a user decision.
