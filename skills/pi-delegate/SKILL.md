---
name: pi-delegate
description: >-
  MCP-native delegation policy for bounded atomic execution tasks: delegate
  clear investigation, implementation, testing, and mechanical work to local
  Pi workers regardless of task size. Keep requirements, architecture, risk
  decisions, coordination, integration, and final acceptance with the
  Supervisor.
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

## Atomic execution first

Use Pi by default for a concrete execution task once the Supervisor can state
its objective, relevant context, operating boundary, completion check, and
expected side effects. Task size is not the gate: a one-file edit, a read-only
search, a single test run, a small bug fix, or a mechanical change can each be
a valid atomic delegation. Atomic means one bounded outcome and accountable
execution, not one file or one command.

The Supervisor first understands the user request and makes any product,
architecture, risk, authorization, and dependency decisions. It then delegates
the decided execution work: investigation, file reading/search, implementation,
bug fixing, tests, builds, validation, and mechanical changes. Do not delegate
an ambiguous request, an unresolved design choice, or final acceptance.

The Supervisor may directly perform coordination, workspace-state checks,
result verification, and an extremely low-cost action where delegation is
plainly less efficient. This is a narrow efficiency exception, not a rule that
uses task size to keep execution local. Do not create a Worker for every
microscopic operation when it adds no useful execution boundary.

Before an implementation worker, record the workspace state and give it the
objective, allowed scope, constraints, expected result, and validation. A
Worker must not make product, architecture, authorization, or integration
decisions, broaden scope, commit, push, merge, reset, stash, or clean unless
the Supervisor explicitly authorizes that exact action.

## Complex work: split, dispatch, review

Never hand an ambiguous large goal to one Worker. The Supervisor clarifies the
overall objective, maps dependencies, splits it into independently verifiable
atomic tasks, and selects serial or parallel execution. Dispatch independent
tasks separately; parallel work must not overlap writes. Review each result,
then steer a running Worker or use `pi_continue` for a related follow-up that
benefits from its context. Integrate only after the Supervisor's review and
final acceptance.

Atomic tasks can span multiple files or commands when that is the smallest
coherent responsibility boundary. Do not fragment work merely to increase
Worker count, and do not force independent-looking tasks to run in parallel.

## Profile, mode, and continuation

Choose profile and mode at `pi_spawn` time; `pi_continue` preserves both.
`inspect` exposes only `read`, `grep`, `find`, and `ls`. It is for investigation
and cannot run `bash`, so it cannot run tests, builds, lint, or any other shell
command—even when the intended command is logically read-only. Those commands
need an `implement` Worker, whose tools include `read`, `edit`, `write`,
`bash`, `grep`, `find`, and `ls`; account for command-generated files and other
side effects before using it.

Use `pi_continue` only for a related task that stays within the existing
Worker's profile and mode. An `inspect` Worker can continue a read-only
investigation, but cannot continue into a code change or shell-based
verification: create a new `implement` Worker instead. Continuation is not a
permission upgrade.

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
   `pi_continue` with its `workerId` only for a related follow-up that fits its
   unchanged profile and mode; create a new Worker for unrelated work or a
   capability change.
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

MCP worktrees start from Git `HEAD`. Uncommitted changes and untracked files do
not automatically enter them. Before spawning a worktree Worker, check the
current workspace, decide whether the task depends on uncommitted work, and
confirm that `HEAD` is the intended baseline. Never auto-commit user work or
rewrite Git history to manufacture that baseline.

There is no `allowedWriteScope` parameter. Put the intended file boundary in
the `pi_spawn.task`, then verify actual changed and newly created files after
the Worker runs. That textual scope, and `PI_WORKER_ALLOWED_ROOTS`, are not
filesystem sandboxes; `implement` also has `bash`. A direct-worker failure may
leave partial edits. Inspect the actual workspace before retrying any failed or
timed-out write task, and never create replacement workers merely to bypass a
permission, sandbox, authentication, or scope failure.

Atomicity is necessary but not authorization for high-risk work. The
Supervisor retains the decision and must obtain any required user authorization
before destructive data operations, secrets or sensitive configuration work,
production operations, irreversible changes, Git-history rewriting, or action
outside the user's approved scope. Pi must not expand permissions or scope.

## Worker availability and release

Workers use `--no-session` and are held by the current MCP Server only.
`workerId` identifies that live in-memory Worker; it is not a durable session
handle and cannot be relied on after an MCP restart or Host reconnection. Use
`pi_continue` only while the same server still has an operable, non-terminal
Worker. An aborted or otherwise terminal Worker cannot be revived; inspect its
result and spawn a new Worker if needed. Release a settled Worker with
`pi_abort` after related work is complete.

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
