# Example: Low-Risk Task

Shows how risk grading keeps investigation minimal. Task: **rename a utility function** in an unfamiliar codebase.

## Flow

1. **Rule entry** — read AGENTS.md / CLAUDE.md (skim; look for naming or tooling constraints only).
2. **Target file** — open the file containing the function; read the function and its immediate surroundings.
3. **Adjacent conventions** — check 2–3 sibling functions in the same file: naming style, export style, whether JSDoc/annotations are used. Match them.
4. **Modify** — rename the function; update its direct callers in the same file if any.
5. **Relevant verification** — run the project's type check or lint script if present (low-cost, touches the file). If the project has neither, state that plainly.
6. **Report** — summarize: renamed X to Y; checks run and results; note any other callers found outside the file as an observation (do not go fix them unless asked).

## What is NOT done here

- No full-project search for all callers (that is a medium-risk investigation; for a rename, confirm the local surface, and if the tooling is a language server or refactor tool, use it).
- No unrelated cleanup noticed in the same file.
- No adding documentation, no test expansion, no dependency checks.

## Decision log

- Risk: low → investigation limited to rule entry + target file + neighbors
- Stop & Ask: none needed (reversible, local)
- Verification: smallest project check that touches the file
