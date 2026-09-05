---
name: repository-structure
description: >-
  Use when adding, deleting, splitting, moving, or promoting files, modules, or
  shared code, or deciding where code belongs. Do not use for ordinary local
  fixes, copy/style edits, or abstractions justified only by hypothetical reuse.
---

# Repository structure

Choose the smallest structure supported by real consumers, change boundaries,
and the repository's own conventions. Read its project rules and neighboring
code before deciding.

## Placement principles

The filesystem is an evolving implementation, not the architecture. Treat an
existing directory shape as evidence and an example, not a template that every
future change must preserve.

Classify ownership before creating or moving code:

- Keep business-capability behavior together when it changes for the same
  domain or user-facing reason.
- Keep technical capabilities (transport, persistence, framework glue, queues,
  logging, or vendor integration) at a boundary; do not let their types or
  lifecycle become the domain behavior's default interface.
- Keep a cross-boundary fact, contract, or policy with one authoritative owner.
  Promote it only when real consumers need the same thing.

Framework-required layouts and project-specific dependency boundaries take
precedence over this guidance.

## Decide the shape

- Use an existing owner when it already fits; keep one-consumer code colocated.
- Create a shared module only for two or more real consumers, or when the
  framework's required layout makes the ownership unambiguous.
- Split by distinct reasons to change, independent dependencies, independent
  state or lifecycle, or independently testable behavior — not a line-count
  target. Preserve a clear composition or orchestration point when separating
  UI or workflow pieces.
- Promote code only after reuse is demonstrated. Do not introduce wrapper
  layers, parallel types, or directory depth merely to make a structure look
  more general.

## Avoid overloaded units

Do not let a component, module, service, hook, or shared package become a home
for unrelated behavior. Split it when the boundaries above make the ownership
clear. Do not split merely to make a file shorter: cohesion, ownership, and
dependency direction matter more than size.

## Change safely

- Before deleting or moving a public module, inspect imports, exports, callers,
  tests, and generated/configuration references.
- Keep one authoritative owner for each fact or contract; import or derive it
  rather than copying it into a second location.
- Update references and remove dangling exports in the same change.
- Apply the repository's path, dependency, and package-boundary rules when
  they are more specific than this Skill.
