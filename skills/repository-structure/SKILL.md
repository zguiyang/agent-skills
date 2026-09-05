---
name: repository-structure
description: >-
  Use when adding, deleting, splitting, moving, or promoting files, modules, or
  shared code. Do not use for ordinary local fixes, copy/style edits, or
  abstractions justified only by hypothetical reuse.
---

# Repository structure

Choose the smallest structure supported by real consumers and the repository's
own conventions. Read its project rules and neighboring code before deciding.

## Decide the shape

- Use an existing owner when it already fits; keep one-consumer code colocated.
- Create a shared module only for two or more real consumers, or when the
  framework's required layout makes the ownership unambiguous.
- Split by distinct responsibility, not a line-count target. Preserve a clear
  composition/orchestration point when separating UI or workflow pieces.
- Promote code only after reuse is demonstrated. Do not introduce wrapper
  layers, parallel types, or directory depth merely to make a structure look
  more general.

## Change safely

- Before deleting or moving a public module, inspect imports, exports, callers,
  tests, and generated/configuration references.
- Keep one authoritative owner for each fact or contract; import or derive it
  rather than copying it into a second location.
- Update references and remove dangling exports in the same change.
- Apply the repository's path, dependency, and package-boundary rules when
  they are more specific than this Skill.
