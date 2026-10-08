# pi-worker MCP contract (v0.1.1)

This reference describes the public interface of
[`@zguiyang/pi-worker-mcp` v0.1.1](https://github.com/zguiyang/pi-worker-mcp/tree/v0.1.1).
It is deliberately a delegation aid, not a second implementation of the
runtime.

## Dependency and installation

Install and configure the MCP for the chosen Host and scope first:

```sh
npx -y @zguiyang/pi-worker-mcp@0.1.1 setup
```

The Host starts the MCP. Do not run `npx … serve` from this Skill. The runtime
needs Node.js 20+, a configured local `pi` executable, and Git for `worktree`
mode. Skill and MCP are independent repositories; installing this Skill does
not install or configure the MCP.

## Delegation policy

Delegate a concrete, bounded execution task when its objective, context,
operating boundary, completion check, and side effects are understood. This
includes small one-file edits, read-only inspection, one targeted test, small
bug fixes, and mechanical changes as well as larger implementation work. Task
size is not an eligibility rule.

The Supervisor keeps requirement interpretation, product and architecture
decisions, task decomposition, dependency and concurrency planning, risk and
permission decisions, integration, review, and final acceptance. For a complex
goal, split work into coherent, independently verifiable atomic tasks before
calling `pi_spawn`; then choose serial or non-overlapping parallel dispatch.
Use `pi_continue` for related follow-up after review, rather than repeatedly
creating unrelated replacement workers.

Do not create a Worker for every microscopic operation when delegation supplies
no useful execution boundary. The Supervisor may directly coordinate, inspect
the workspace baseline, and verify results. Atomicity does not authorize
destructive data work, secrets or sensitive configuration handling, production
operations, irreversible changes, Git-history rewriting, or work outside user
authorization; retain those decisions and obtain any needed approval first.

## Tools and exact inputs

| Tool | Required input | Optional input | Meaning |
| --- | --- | --- | --- |
| `pi_list` | none | none | Lists worker snapshots, newest first. |
| `pi_spawn` | `task`, absolute `cwd`, `mode` | `profile`, `taskTimeoutMs`, `model` | Starts a bounded worker. `mode` is `direct` or `worktree`; `profile` is `inspect` or `implement` (default `implement`). |
| `pi_status` | `workerId` | none | Returns the current snapshot. |
| `pi_steer` | `workerId`, `task` | none | Corrects the current task of a running worker. |
| `pi_continue` | `workerId`, `task` | none | Queues a related follow-up while running or begins a new activity cycle after settlement. |
| `pi_abort` | `workerId` | none | Stops or releases a worker. |

`workerId` is the UUID returned by `pi_spawn` or shown by `pi_list`.
`taskTimeoutMs`, when needed, is an integer from 1,000 to 86,400,000. `model`
is an optional per-worker override; omit it to inherit Pi's local default.
There is no `sessionFile`, `sessionId`, provider field, CLI prompt transport,
or Skill-managed worker registry.

## Mode, profile, and safety

`direct` uses the supplied checkout. `worktree` asks the MCP to create a Git
worktree under `.pi-worker-mcp/worktrees`; it creates a `pi-worker/<id>` branch.
Worktree edits are not automatically merged or deleted. The MCP creates the
worktree from Git `HEAD`; unstaged, staged, and untracked source-checkout
changes do not automatically appear there. Before choosing `worktree`, inspect
the workspace, determine whether the task needs uncommitted work, and confirm
that `HEAD` is the correct baseline. Never auto-commit user work or alter Git
history to create one.

`inspect` has exactly `read`, `grep`, `find`, and `ls`. It has no `bash`, so it
cannot run tests, builds, lint, or any other shell command, even if the command
is conceptually read-only. `implement` has `read`, `edit`, `write`, `bash`,
`grep`, `find`, and `ls`; use it for shell-based verification and account for
command-generated files and side effects. Mode and profile are selected at
spawn and are not changed by `pi_continue`.

The supplied `cwd` must be an existing absolute directory inside
`PI_WORKER_ALLOWED_ROOTS` (or the runtime's default allowed root). That path
check is not an OS sandbox. There is no `allowedWriteScope` input: state the
intended file boundary in `task`, then inspect actual changed files, newly
created files, and effects on pre-existing user work. Task wording is not a
filesystem sandbox, and an `implement` Worker can run `bash`.

Before a direct implementation, preserve and inspect the workspace baseline.
Never place concurrent direct writes on overlapping scope. Use independent
worktrees for concurrent implementation workers, and keep their intended write
scope disjoint. A failed direct worker may have made partial edits; inspect
before a retry or recovery.

## State and lifecycle

Snapshots use `state`/`status`: `starting`, `running`, `settled`, `failed`,
`stalled`, `timed_out`, `aborting`, `aborted`, or `crashed`. They also include
observable fields such as `processAlive`, `pid`, `cwd`, `mode`, `profile`,
`lastOutput`, `recentEvents`, `failure`, and timing data.

`pi_spawn` and `pi_continue` success means the runtime accepted the task; it
does not mean the work is completed or correct. `settled` means only that the
current activity cycle ended. A settled worker still occupies a live-worker
slot and can be reused by `pi_continue`; release it with `pi_abort` once no
related work remains. `pi_continue` cannot reuse aborting or terminal workers,
and it retains the profile and mode chosen at spawn. Use an `inspect` Worker
only for further read-only investigation; start a new `implement` Worker for
edits or shell-based verification. `pi_abort` neither reverts direct edits nor
deletes a worktree.

Workers launch Pi with `--no-session` and are stored only in the active MCP
Server's worker map. `workerId` is not a durable cross-restart session token:
after an MCP restart or Host reconnection, start a new Worker. An aborted or
otherwise terminal Worker cannot be revived by `pi_continue`.

Use `pi_steer` only while a worker is running, to correct its current task.
For a related next task after settlement, use `pi_continue`. Avoid busy
polling; inspect state at meaningful milestones or when the next decision
depends on it.

## Failure handling and supervisor acceptance

The MCP does not grant permissions, solve authentication, or provide a
general-purpose approval proxy. On permission, sandbox, authentication,
timeout, stalled, crash, or scope problems, surface the evidence to the
Supervisor. Do not repeat a potentially writing task blindly, and do not use
new workers to work around the failure.

The Supervisor independently checks source evidence for investigations and the
real diff, scope, validation results, side effects, and request satisfaction
for implementations. A worker's textual report, accepted call, clean exit, or
`settled` status is not final acceptance.

## Invocation examples

Small, bounded execution work is eligible for delegation:

```text
pi_spawn({ task: "Read src/config.ts and report whether the timeout is parsed as milliseconds, citing the relevant lines.", cwd: "/project", mode: "direct", profile: "inspect" })
```

Independent read-only investigations may run in parallel:

```text
pi_spawn({ task: "Inspect error handling in src/api; report cited findings only.", cwd: "/project", mode: "direct", profile: "inspect" })
pi_spawn({ task: "Inspect current test coverage in tests/api; report gaps only.", cwd: "/project", mode: "direct", profile: "inspect" })
```

An authorized, isolated implementation:

```text
pi_spawn({ task: "Implement the specified parser fix only in src/parser and add focused tests. Run the named test command and report changed files.", cwd: "/project", mode: "worktree", profile: "implement" })
```

Follow-up after reviewing the same worker:

```text
pi_continue({ workerId: "<uuid>", task: "Add the missing regression case identified in review; do not broaden scope." })
```
