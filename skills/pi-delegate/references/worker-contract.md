# Pi Worker Contract

The runner accepts a single JSON object on stdin and emits a single JSON object on stdout. Progress is written to stderr. It has no persistent global task state: independent processes can run concurrently. `sessionId` (default: `taskId`) identifies the requested Pi Session, but Pi's project-local lookup by ID is cwd-scoped and is not a reliable cross-cwd locator. Delegated calls use a per-session directory under Pi's configured session root and return the exact `sessionFile` for continuation.

## Request

Required:

- `action`: `delegate` or `continue`.
- `taskId`: stable, non-empty task identifier.
- `sessionId`: optional stable Pi session ID; defaults to `taskId`.
- `cwd`: existing absolute directory. Its meaning depends on `workspaceMode`.
- `workspaceMode`: `existing` (default) or `delegated`.
- `prompt`: the already-decided task contract: objective, scope, constraints, done conditions, verification, and stop conditions.

Optional:

- `provider`, `model`, `thinking`: passed through as selected by the calling Agent. Missing values are left to Pi defaults. The runner does not pick or substitute models.
- `profile`: `readonly`, `implementation` (default), or `verification`.
- `acceptance`: string array appended as explicit acceptance criteria.
- `timeoutMs`: positive finite process timeout.
- `sessionFile`: exact session path returned by a prior delegated run; required for delegated continuation.

Prompt text is sent through Pi stdin by default. Control options remain separate argv elements; `shell` is always false. The runner never concatenates Prompt content into shell source. A single argv-element fallback is allowed only after an explicit pre-execution stdin rejection. Keep credentials out of prompts and logs.

### Workspace modes

- `existing`: the supplied `cwd` is the entire allowed workspace. Pi must not create or switch worktrees.
- `delegated` + `delegate`: `cwd` is the target repository root. Before writes, Pi reads the repository's `AGENTS.md` and relevant Skills/rules. It follows a project worktree Skill/rule to create an isolated worktree. If no safe project rule exists or creation fails, it stops with `[NEEDS_DECISION]`; there is no in-place fallback.
- `continue`: the Supervisor supplies the same workspace path from the prior worker's final report as `cwd`, keeps the same `workspaceMode` and `sessionId`, and expects the worker to reuse that workspace without creating another worktree. For delegated tasks, it also passes the prior result's `sessionFile`; Pi opens that exact transcript instead of looking up a project-local session by cwd. The runner stores no workspace or task state.

## Result

Result fields include `status` (`completed`, `failed`, `blocked`, or `timed_out`), `requiresHumanAction`, `taskId`, `sessionId`, `sessionFile`, `cwd`, `workspaceMode`, `provider`, `model`, `thinking`, `streaming`, `promptTransport`, `fallbackUsed`, `capabilityDiscoveryUsed`, `hardReadOnly`, `exitCode`, `durationMs`, `finalText`, `usage`, the detailed `capabilityDiscovery` array, and an `error` object when applicable. `cwd` is the input path; for delegated creation, the actual worktree path must be reported in `finalText` and supplied as `cwd` on continuation. `sessionFile` is returned for delegated sessions and must be passed back on continuation. Fields Pi does not provide remain null or absent; the runner does not infer changed files, test outcomes, costs, or task success from prose. A zero exit code is a process result, not acceptance: the calling Agent reviews the worktree, diff, and required checks independently.

## Event handling

JSON mode is attempted first. The runner uses a streaming `TextDecoder` and splits records strictly on LF, preserving UTF-8 across chunk boundaries. It recognizes Pi's assistant text deltas, tool execution start/end, agent completion, and usage-bearing assistant messages; unknown event types are ignored. Malformed records are surfaced as a protocol error. Progress goes to stderr; the final result JSON is the only stdout output.

If the local Pi rejects piped Prompt input before any task-start event, the runner may retry once with the Prompt as one argv element. If Pi rejects JSON mode before any task-start event, the runner may retry once in text output mode. Either fallback sets `fallbackUsed: true`. No other failure is a reason to replay a task. Once a start/tool/message event appears, a parser error, broken stream, timeout, or child failure returns control without retry so that the calling Agent can inspect the existing session and workspace.

## Targeted discovery

Discovery runs only after a matching startup failure:

- `ENOENT` launching Pi → report `PI_NOT_FOUND`; do not probe help.
- unsupported CLI option → run local `pi --help` once and include relevant output.
- unsupported session option → run local `pi --help` once and include relevant output; do not switch to a new session implicitly.
- unknown model → run local `pi --list-models <provider>` once.
- authentication, rate limiting, tool errors, task failures, and ambiguous execution → return as observed; no broad discovery, login, model substitution, or automatic retry.

Do not branch behavior on Pi version numbers. The installed CLI's actual behavior is authoritative; if the narrow local discovery does not resolve the issue, report the uncertainty to the calling Agent.

## Worktree ownership and concurrency

The runner does not execute Git or mutate worktree state. In `existing` mode the caller supplies the isolated path. In `delegated` mode Pi uses the project's worktree Skill/rule; absent a safe rule, it stops for the caller to decide. On continuation the caller passes back the exact workspace path from the prior result. Never reset, stash, clean, checkout over user state, push, or merge. Parallelism is multiple runner processes with unique task/session IDs and separate mutable worktrees; there is no queue, scheduler, lock, or nested agent layer.
