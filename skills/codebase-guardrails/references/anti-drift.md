# Anti-Drift Model

Behavioral constraints against eight ways an agent drifts away from the project and from the truth. This is a behavior document, not a detection system — no scripts, no tooling.

---

## 1. Architecture Drift

- **Problem**: The AI changes module boundaries, layering, or package structure on its own.
- **Detection**: Diff contains directory moves, new abstraction layers, cross-layer calls; package-graph rules are violated.
- **Prevention**: Read architecture rules before touching structure. Architecture-level changes trigger Stop & Ask.
- **Required behavior**: Work inside the existing structure by default. Put new files where the existing pattern places them. Moving/renaming/creating layers requires a stated reason and user confirmation.

## 2. Convention Drift

- **Problem**: The AI writes code that does not match the project's naming, formatting, or patterns.
- **Detection**: New code differs from neighboring files; project lint/format would complain; naming rules are violated.
- **Prevention**: Look at 2–3 adjacent files before writing. Run the project's own lint/format, not personal preferences.
- **Required behavior**: Copy the conventions of neighboring code. Format only with the project's formatter. When the project has no formatter, match existing file style manually.

## 3. Dependency Drift

- **Problem**: The AI adds or upgrades dependencies casually.
- **Detection**: package.json diff contains new dependencies; version style changes (exact pin vs caret) differ from the project's style.
- **Prevention**: Before adding, check existing dependencies and shared packages for the capability. Adding a dependency requires asking the user.
- **Required behavior**: Solve with existing dependencies by default. New dependency → Stop & Ask. Version style follows the project.

## 4. Scope Drift

- **Problem**: The AI does things the user did not ask for (drive-by refactors, unrelated bug fixes, whole-repo formatting).
- **Detection**: One commit contains multiple topics; diff touches unrelated files.
- **Prevention**: Define the completion criteria at task start. Review the diff before finishing. One logical change per commit.
- **Required behavior**: Touch only task-related files. Findings outside the task go into the report, not into the diff — unless the user asks.

## 5. Abstraction Drift

- **Problem**: The AI introduces over-abstraction (generic factories, base classes, interceptors) without demand.
- **Detection**: A new abstraction has exactly one consumer; the project's own history shows removals of such abstractions.
- **Prevention**: Abstraction requires 2+ consumers. KISS/YAGNI check before creating any shared structure.
- **Required behavior**: Abstract only when repeated need demonstrates it. Reuse existing abstractions. Otherwise write the direct implementation.

## 6. Documentation Drift

- **Problem**: The AI changes code but ignores docs and rules that describe it.
- **Detection**: Rule files or docs describe behavior that no longer matches the code.
- **Prevention**: When a change affects something a doc/rule explicitly describes, update it or flag the staleness.
- **Required behavior**: If the change touches README/AGENTS.md/DESIGN.md/architecture notes, update them or explicitly report "documentation is now stale" to the user.

## 7. Verification Drift

- **Problem**: The AI claims completion without actually verifying.
- **Detection**: Report claims "verified/works" with no command output; CI or hooks would fail.
- **Prevention**: Verification is mandatory for any code change; results are reported verbatim.
- **Required behavior**: Run the project's verification commands relevant to the change, inspect real output, and report "ran X, result Y". Never claim a check that was not run (see [verification.md](verification.md)).

## 8. Assumption Drift

- **Problem**: The AI asserts facts about the project without evidence (file paths, function signatures, conventions) based on general knowledge.
- **Detection**: References a file or API that does not exist; "common practice" is substituted for "project practice".
- **Prevention**: Evidence-before-action discipline ([investigation-depth.md](investigation-depth.md)); no unverified claims in reports.
- **Required behavior**: Confirm before asserting. If confirmation is impossible, label the claim "unverified" or ask the user.
