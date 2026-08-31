# Owner Preferences

Default preferences for how the user (JoyZhao) likes software built. These are **defaults, not project rules**.

## Override order

Project rules, project reality, and explicit user requests all override these preferences. When a preference conflicts with the project, the project wins (see [decision-priority.md](../references/decision-priority.md)). When in doubt whether a preference applies, follow the project first and note the difference in the report.

## The three preferences

### 1. Simple first
Prefer the simplest solution that fully satisfies the task. Fewer moving parts, fewer layers, less ceremony. Evidence basis: repeated removals of interceptors, custom exception classes, and response wrappers across the user's projects in favor of framework built-ins and plain code.

### 2. Few dependencies
Prefer solving with existing dependencies and the project's own utilities. A new dependency requires asking (stop condition #4). Evidence basis: the user maintains their own utility library and reuses it across projects; dependency lists across projects are consistently lean.

### 3. Small steps
Prefer small, coherent changes and small commits over large batches. One logical change per step; refactors are separate steps, not mixed into feature work. Evidence basis: high-frequency small commits and fine-grained refactor commits across the user's repositories.

## Explicitly NOT in this file

- Specific commit prefixes (e.g. `upd:`, `ui:`) — historical, superseded by conventional commits
- Commit message language — decided per project
- Jest-specific usage — decided per project
- Any framework, ORM, directory layout, or architecture pattern — decided per project
- Any deprecated or abandoned personal patterns (self-built DI frameworks, EJS+jQuery rendering, custom response envelope `{code:'OK'}`, fixed port ranges, template passwords)
