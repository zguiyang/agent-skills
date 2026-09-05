---
name: infrastructure-operations
description: >-
  Use for deployment, containers, environment variables, service runtime state,
  or operational diagnosis. Do not use for ordinary application changes without
  an operational question.
---

# Infrastructure operations

Establish declared configuration before inspecting or changing runtime state.
Use the narrowest repository-supported operation that can answer the question.

1. Read the relevant environment template, deployment configuration, service
   definition, documentation, and package/task scripts.
2. Inspect runtime state only when it is needed to answer a current-state
   question or configuration alone is insufficient.
3. Prefer a repository wrapper or documented command; otherwise use the native
   service CLI or declared container/orchestrator path. Avoid ad-hoc scripts
   unless no supported route exists.
4. Do not print, commit, or widen access to secrets; do not mutate production
   data or infrastructure without explicit authorization.

Project-specific service topology, credential handling, deployment procedures,
and verification requirements remain owned by that project.
