# Pi Worker Contract

The runner accepts one JSON object on stdin and emits one JSON object on stdout. Progress goes to stderr. It has no persistent global task state: independent processes can run concurrently. Pi is one execution Worker for one Supervisor-defined atomic task; the runner contains no planner, orchestrator, or subagent layer.

`shell: false` is internal to the Node runner's `child_process.spawn` of Pi. The calling Agent launches the runner using its normal local execution API and does not need a `spawn`/`process` API of its own. The Pi child inherits the environment and execution permissions supplied by the host. The host Agent owns sandbox policy and permission requests; the Skill cannot grant itself access.

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
- `provider`, `model`, `thinking`: optional caller selection. Supply provider and model together to override Pi's native default. If both are absent, the runner omits model-selection flags and Pi uses its saved default. The actual provider/model are reported from Pi stream/session metadata when available.
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

## Model selection

Pi's native model setting is the single source of truth for unspecified tasks. Configure it in Pi with `/model` and save the selection with `Ctrl+S`. The runner does not maintain a separate default or model-tier catalog and does not inspect the entire model catalog. If `provider` and `model` are absent, the runner omits `--provider` and `--model`, so Pi uses its own saved default. If both are supplied, they pass through explicitly. Supplying just one returns `blocked`/`NEEDS_DECISION` before launch. Thinking remains caller-selectable.

The Worker must not autonomously change models or start a replacement session. If the selected or Pi-configured model is insufficient, it returns `NEEDS_DECISION`; the Supervisor decides whether to continue with a different model. The result reports the actual provider/model found in the Pi stream or session file when available. Pi records model changes in its session, so continuation uses the session's recorded model when no override is supplied. An explicit provider/model pair that conflicts with the session is blocked before launch. Saving a costly model as Pi's default means unspecified new tasks can use it; the Supervisor is responsible for setting the desired Pi default.

## Host permissions and environment

The Pi process runs with the sandbox and approval policy of the host Agent that launches the runner. The child receives `process.env`; preserve `PATH`, `PI_CODING_AGENT_DIR`, Pi credentials, and other host-provided values. Do not create a temporary Pi configuration or copy credentials. A `SANDBOX_PERMISSION` error reports the denied path when available and `taskStarted`. The host Agent may request permission and retry the same request once only if `taskStarted` is false. Do not retry after execution begins or when its start state is uncertain. This host-neutral contract does not require Codex-specific APIs.

## Decisions before launch

The runner returns `status: "blocked"`, `error.code: "NEEDS_DECISION"`, and a structured `decisionNeeded` object before spawning Pi when:

- the task is obviously vague or non-atomic, or is missing scope/acceptance/constraints;
- a write lacks `allowedWriteScope`, or a direct write lacks `workspaceStateKnown`/`writeAuthorization`;
- provider or model is supplied without the other;
- a continuation omits `sessionFile`, the session metadata cannot establish provider/model, or an explicit model conflicts with the session model.

`decisionNeeded` is `null` when no decision is required.

## Continuation

A continuation requires the original `cwd` plus the exact `sessionFile` from the prior result; `sessionId` alone is not sufficient. The runner reads the session JSONL metadata (session header, `model_change`, assistant message provider/model) to determine the recorded model. With no explicit model override, continuation keeps that recorded model and reports it. An explicit conflicting provider/model, or unavailable session model metadata, is blocked before launch.

## Result

A single JSON object with compatible existing fields plus the structured task report:

- Existing: `status` (`completed`, `failed`, `blocked`, or `timed_out`), `requiresHumanAction`, `taskId`, `sessionId`, `sessionFile`, `cwd`, `workspaceMode`, `writeMode`, `provider`, `model`, `modelSource`, `taskStarted`, `thinking`, `streaming`, `promptTransport`, `fallbackUsed`, `capabilityDiscoveryUsed`, `hardReadOnly`, `exitCode`, `durationMs`, `finalText`, `usage`, `capabilityDiscovery`, and `error` when applicable. Permission failures use `error.code: "SANDBOX_PERMISSION"`, with `permissionDeniedPath`, `taskStarted`, and `hostAction`.
- Task report: `summary`, `changedFiles`, `validation`, `remainingIssue`, `decisionNeeded`, `writeScope`, `scopeExceeded`, `outOfScopeFindings`, `reportParsed`.

Pi's final response must include exactly one JSON object between `---PI_TASK_REPORT---` and `---END_PI_TASK_REPORT---` containing `summary`, `changedFiles`, `validation`, `remainingIssue`, `decisionNeeded`, `writeScope`, `scopeExceeded`, and `outOfScopeFindings`. The runner does not observe file changes or test outcomes itself, so unreported values stay `null`/empty and `reportParsed` is `false`. A zero exit code is a process result, not acceptance; the Supervisor reviews the worktree, diff, and checks independently.

## Event handling

JSON mode is attempted first. The runner uses a streaming `TextDecoder` and splits records strictly on LF, preserving UTF-8 across chunk boundaries. It recognizes assistant `message_update` text/tool deltas, tool execution start/end, the final assistant message, and usage; unknown events are ignored. Malformed records are surfaced as a protocol error. The final result JSON is the only stdout output.

If local Pi rejects piped Prompt input before any task-start event, the runner may retry once with the Prompt as one argv element. If Pi rejects JSON mode before any task-start event, the runner may retry once in text output mode. Either fallback sets `fallbackUsed: true`. No other failure replays a task. Once a start/tool/message event appears, a parser error, broken stream, timeout, or child failure returns control without retry.

## Targeted discovery

Discovery runs only after a matching startup failure:

- `ENOENT` launching Pi → report `PI_NOT_FOUND`; no probe.
- `EACCES`/`EPERM` or an OS permission-denied startup error → report `SANDBOX_PERMISSION`, the denied path when observable, and `taskStarted`; let the host Agent request permission. This is not a discovery trigger and is never automatically retried.
- unsupported CLI option → local `pi --help` once.
- unsupported session option → local `pi --help` once; no implicit session switch.
- unknown explicitly selected model → local `pi --list-models <provider>` once. If Pi's native default failed and its provider is unknown, skip broad model listing.
- authentication, rate limiting, tool errors, task failures, ambiguity → return as observed; no broad discovery, login, model substitution, or automatic retry.

Do not branch behavior on Pi version numbers.

## Concurrency and worktree ownership

The runner does not execute Git or mutate worktree state. Overlapping writes in the same `cwd` must be serialized. Read-only tasks may run concurrently, and isolated writes to disjoint worktrees may run concurrently. Parallelism is multiple runner processes with unique task IDs and either a shared read-only scope or disjoint isolated worktrees; there is no queue, scheduler, lock, or nested agent layer.

## Environment compatibility

On Windows, the runner resolves an npm `.cmd` shim to `process.execPath` plus the `.js` entrypoint before spawning, so Pi starts without a shell. On other platforms the executable is passed through unchanged. Pi is located via `PI_EXECUTABLE` or the `pi` executable on `PATH`.
