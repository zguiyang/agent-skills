# Pi Worker Contract

The runner accepts one JSON object on stdin and emits one JSON object on stdout. Progress goes to stderr. It has no persistent global task state: independent processes can run concurrently. Pi is one execution Worker for one Supervisor-defined atomic task; the runner contains no planner, orchestrator, or subagent layer.

`shell: false` is internal to the Node runner's `child_process.spawn` of Pi. The calling Agent uses its normal process API to launch the runner; there is no shell command to build or escape.

## Request

Common required fields:

- `action`: `delegate` or `continue`.
- `taskId`: stable, non-empty task identifier.
- `cwd`: existing absolute directory. Meaning depends on the write/workspace policy.
- `objective`: the single bounded outcome. `prompt` may be supplied as legacy task text or additional context, but a structured objective is required.

Atomic task fields for `delegate`:

- `scope`: files/modules/areas in play (string or string array). Required, non-empty.
- `constraints`: array of strings; may be empty but must be present.
- `acceptance`: non-empty array of acceptance criteria.

Write fields (required when the task modifies files):

- `writeMode`: `direct` or `isolated`.
- `allowedWriteScope`: non-empty string or string array; the only place Pi may write.
- `direct` additionally requires `workspaceStateKnown: true` (Supervisor knows the workspace state) and `writeAuthorization: true` (Supervisor authorizes in-place writes).
- `isolated` means the Supervisor supplied and owns the isolated worktree; no `workspaceStateKnown` or `writeAuthorization` is required.

Other optional fields:

- `sessionId`: stable Pi session ID; defaults to `taskId`.
- `workspaceMode`: `existing` (default) or `delegated`. V1 compatibility only; `delegated` must not be combined with `writeMode`.
- `provider`, `model`, `thinking`: caller selection. Absent provider/model resolves to `deepseek` / `deepseek-flash` and the effective values are reported.
- `allowProModel`: boolean authorization required before launching a Pro/expensive model.
- `profile`: `readonly`, `implementation` (default), or `verification`.
- `workspaceState`: optional human-readable note about the direct-write workspace state.
- `timeoutMs`: positive finite process timeout.
- `sessionFile`: exact session path returned by a prior run; required for every continuation.

Prompt text is sent through Pi stdin by default. Control options remain separate argv elements. A single argv-element fallback is allowed only after an explicit pre-execution stdin rejection. The runner never concatenates Prompt content into shell source. Keep credentials out of prompts and logs.

### Write policy

- `direct`: work in the Supervisor-supplied `cwd`, write only inside `allowedWriteScope`. The Supervisor declares `workspaceStateKnown` and `writeAuthorization`.
- `isolated`: work in the Supervisor-supplied isolated worktree and write only inside `allowedWriteScope`; the Supervisor owns the worktree lifecycle.
- In both modes Pi must not create, switch, or clean worktrees or checkouts, and must not reset, stash, clean, checkout over user state, commit, push, or merge.
- Pi reports out-of-scope findings without changing them; if a needed change falls outside `allowedWriteScope`, it stops with `[NEEDS_DECISION]`.

### Legacy workspace modes

For callers not using `writeMode`, V1 `workspaceMode` semantics remain accepted:

- `existing`: the supplied `cwd` is the entire allowed workspace; Pi neither creates nor switches worktrees.
- `delegated` + `delegate`: `cwd` is the repository root; Pi follows a project worktree Skill/rule or stops with `[NEEDS_DECISION]`. No in-place fallback.
- `continue`: pass the exact prior workspace path as `cwd`, keep the same mode, and pass the prior `sessionFile`.

## Model resolution and authorization

The runner resolves provider/model before building Pi argv and reports the effective `provider`/`model`. Defaults: `deepseek` / `deepseek-flash`. Thinking remains caller-selectable, including higher thinking levels on Flash.

The runner never auto-upgrades to a Pro or clearly expensive Pro-tier model. Requesting one without `allowProModel: true` returns a `blocked` result whose `decisionNeeded` contains `reason`, `current_model`, `suggested_model`, and `why_upgrade_is_needed`; Pi is not launched. The task prompt also tells Pi to stay on the selected model and return those decision fields if it is insufficient; neither runner nor Worker switches models or starts a replacement session. The same pre-launch block applies when a session's recorded model conflicts with the effective model.

## Decisions before launch

The runner returns `status: "blocked"`, `error.code: "NEEDS_DECISION"`, and a structured `decisionNeeded` object before spawning Pi when:

- the task is obviously vague or non-atomic, or is missing scope/acceptance/constraints;
- a write lacks `allowedWriteScope`, or a direct write lacks `workspaceStateKnown`/`writeAuthorization`;
- the effective model is Pro/expensive and `allowProModel` is not set;
- a continuation omits `sessionFile`, the session metadata cannot establish provider/model, or the session model conflicts with the effective model.

`decisionNeeded` is `null` when no decision is required.

## Continuation

A continuation requires the original `cwd` plus the exact `sessionFile` from the prior result; `sessionId` alone is not sufficient. The runner reads the session JSONL metadata (session header, `model_change`, assistant message provider/model) to determine the recorded model. Matching sessions continue; unknown or conflicting models are blocked with a model-mismatch decision and Pi is not launched. Stable matching sessions keep their behavior.

## Result

A single JSON object with compatible existing fields plus the structured task report:

- Existing: `status` (`completed`, `failed`, `blocked`, or `timed_out`), `requiresHumanAction`, `taskId`, `sessionId`, `sessionFile`, `cwd`, `workspaceMode`, `writeMode`, `provider`, `model`, `thinking`, `streaming`, `promptTransport`, `fallbackUsed`, `capabilityDiscoveryUsed`, `hardReadOnly`, `exitCode`, `durationMs`, `finalText`, `usage`, `capabilityDiscovery`, and `error` when applicable.
- Task report: `summary`, `changedFiles`, `validation`, `remainingIssue`, `decisionNeeded`, `writeScope`, `scopeExceeded`, `outOfScopeFindings`, `reportParsed`.

Pi's final response must include exactly one JSON object between `---PI_TASK_REPORT---` and `---END_PI_TASK_REPORT---` containing `summary`, `changedFiles`, `validation`, `remainingIssue`, `decisionNeeded`, `writeScope`, `scopeExceeded`, and `outOfScopeFindings`. The runner does not observe file changes or test outcomes itself, so unreported values stay `null`/empty and `reportParsed` is `false`. A zero exit code is a process result, not acceptance; the Supervisor reviews the worktree, diff, and checks independently.

## Event handling

JSON mode is attempted first. The runner uses a streaming `TextDecoder` and splits records strictly on LF, preserving UTF-8 across chunk boundaries. It recognizes assistant `message_update` text/tool deltas, tool execution start/end, the final assistant message, and usage; unknown events are ignored. Malformed records are surfaced as a protocol error. The final result JSON is the only stdout output.

If local Pi rejects piped Prompt input before any task-start event, the runner may retry once with the Prompt as one argv element. If Pi rejects JSON mode before any task-start event, the runner may retry once in text output mode. Either fallback sets `fallbackUsed: true`. No other failure replays a task. Once a start/tool/message event appears, a parser error, broken stream, timeout, or child failure returns control without retry.

## Targeted discovery

Discovery runs only after a matching startup failure:

- `ENOENT` launching Pi → report `PI_NOT_FOUND`; no probe.
- unsupported CLI option → local `pi --help` once.
- unsupported session option → local `pi --help` once; no implicit session switch.
- unknown model → local `pi --list-models <provider>` once.
- authentication, rate limiting, tool errors, task failures, ambiguity → return as observed; no broad discovery, login, model substitution, or automatic retry.

Do not branch behavior on Pi version numbers.

## Concurrency and worktree ownership

The runner does not execute Git or mutate worktree state. Overlapping writes in the same `cwd` must be serialized. Read-only tasks may run concurrently, and isolated writes to disjoint worktrees may run concurrently. Parallelism is multiple runner processes with unique task IDs and either a shared read-only scope or disjoint isolated worktrees; there is no queue, scheduler, lock, or nested agent layer.

## Environment compatibility

On Windows, the runner resolves an npm `.cmd` shim to `process.execPath` plus the `.js` entrypoint before spawning, so Pi starts without a shell. On other platforms the executable is passed through unchanged. Pi is located via `PI_EXECUTABLE` or the `pi` executable on `PATH`.
