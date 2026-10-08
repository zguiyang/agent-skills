---
name: pi-delegate
description: >-
  MCP-native policy for deciding when to delegate bounded, non-trivial coding
  or investigation work to local Pi workers. Use when independent file
  investigation, mechanical changes, focused implementation, or verification
  can save supervisor context or run safely in parallel; keep trivial,
  ambiguous, architectural, and supervisor-context-dependent work local.
metadata:
  short-description: Delegate bounded work through the registered pi-worker MCP.
  version: "4"
  updated: "2026-10-08"
---

# Pi Delegate

This is a delegation policy, not a Pi runtime. The Supervisor owns requirement
interpretation, architecture, task decomposition, authorization, integration,
review, and final acceptance. `pi-worker-mcp` owns Pi processes, RPC,
worker IDs, concurrency, continuation, steering, timeouts, and release.

Use the Host's already registered `pi-worker-mcp` tools directly. Never start
the package through a shell, install it automatically, modify MCP
configuration, change Pi credentials or defaults, or fall back to the legacy
Pi CLI runner. If the MCP tools are unavailable, report the missing dependency
and give the installation route in [the reference](references/mcp-contract.md).

## Decide first

Consider Pi only when the task is bounded and the expected result is clear,
and delegation materially saves Supervisor context or enables useful parallel
progress. Good candidates include:

- independent, evidence-heavy multi-module investigation;
- a non-trivial implementation with a fixed scope and acceptance checks;
- focused test or verification work; and
- mechanical edits with clear boundaries.

Do the work directly when it is a short question, a one-file trivial change, a
quick command, ambiguous work, a product or architecture decision, or depends
on the Supervisor's current context. Do not delegate merely because Pi exists.

Before an implementation worker, record the workspace state and define the
objective, allowed scope, constraints, expected result, and validation. A
Worker must not make product, architecture, authorization, or integration
decisions, broaden scope, commit, push, merge, reset, stash, or clean unless
the Supervisor explicitly authorizes that exact action.

## MCP workflow

1. Call `pi_list` before spawning when capacity or reusable workers are
   relevant.
2. Call `pi_spawn` with a bounded `task`, absolute `cwd`, `mode`, and
   `profile`. Use `inspect` for read-only work and `implement` for authorized
   changes. Omit `model` by default so Pi uses its locally configured default.
3. Use `pi_status` sparingly to inspect progress and the terminal result. A
   successful spawn or a `settled` worker is not proof that the result is
   correct.
4. Use `pi_steer` only to correct a running worker's current task. Use
   `pi_continue` with its `workerId` for a related follow-up that benefits from
   the same worker context; create a new worker for unrelated work.
5. Call `pi_abort` when a worker is incorrect or no longer needed, including
   after reviewing a settled worker with no follow-up. Then use `pi_list` when
   needed to confirm active capacity and release.

Read [the MCP contract](references/mcp-contract.md) for exact v0.1.1
parameters, state semantics, failures, and examples.

## Parallelism and writes

Run multiple `inspect` workers only for genuinely independent read-only
questions. For writes, avoid overlapping paths and user changes. Use `direct`
only for a deliberate, authorized in-place change. Use `worktree` for isolated
implementation work; the MCP creates that Git worktree and does not merge or
delete it automatically. Parallel implementation workers require separate
worktrees and non-overlapping scope.

`PI_WORKER_ALLOWED_ROOTS` limits eligible `cwd` paths; it is not an operating
system sandbox or a complete permission boundary. A direct-worker failure may
leave partial edits. Inspect the actual workspace before retrying any failed or
timed-out write task, and never create replacement workers merely to bypass a
permission, sandbox, authentication, or scope failure.

## Model, failures, and acceptance

Do not specify `model` unless the user or Supervisor has a concrete reason.
Pi owns its providers, credentials, available models, and default selection;
the Worker must not silently change or upgrade models. Report unavailable
models, permissions, sandbox rejection, authentication failure, timeout,
stall, crash, or scope conflict to the Supervisor for a decision.

Pi output is evidence, not acceptance. For an investigation, verify key source
evidence before using its conclusions. For edits, independently inspect the
diff and scope, run or verify relevant checks, assess side effects, and confirm
the original request is met. Only the Supervisor may declare the overall task
complete.
