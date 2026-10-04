---
name: pi-delegate
description: Delegate one bounded atomic coding or investigation task to a local Pi worker with a structured task contract, explicit model/session control, direct-or-isolated write policy, and a structured result. Use after the calling agent has decided the task and must independently review the result.
metadata:
  short-description: Delegate one atomic task to a local Pi worker.
---

# Pi Delegate

Use this skill after the calling Agent has understood the request, decided the approach, and bounded one atomic task. The calling Agent is the Supervisor: it owns architecture, task splitting, model/thinking choices, authorization, review, and final acceptance. Pi is one Worker for one task and one Session. Do not build orchestration, planners, or subagents inside Pi.

## Runner

Use `scripts/pi-worker.mjs` when Node.js is available. It reads one JSON request from stdin, writes one final JSON result to stdout, and sends progress to stderr. Invoke it through the host's normal local execution API with an argument array. The runner launches Pi with `child_process.spawn(..., { shell: false })`; this is an internal runner safety requirement and does not require the calling Agent to have a process API of its own. The child inherits the host-provided environment and execution permissions. The host Agent owns sandbox policy and any permission request; the runner cannot grant itself access. Never build a shell command string. The runner passes the complete Prompt through Pi's stdin by default. Only a confirmed pre-execution stdin rejection may retry once with the Prompt as a single argv element after `--`. Markdown, backticks, `$`, quotes, newlines, Unicode, and code blocks are never shell-expanded.

Example invocation shape (API shape, not a shell command):

```js
spawn(process.execPath, [runnerPath], { cwd: request.cwd, shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
// then write JSON.stringify(request) to stdin and parse the single stdout JSON result
```

## Atomic task contract

Every `delegate` task must be a supervisor-defined atomic task. Required fields:

- `objective`: one concrete, bounded outcome.
- `cwd`: existing absolute workspace directory.
- `scope`: files/modules/areas in play (string or string[]).
- `constraints`: array of constraints, possibly empty.
- `acceptance`: non-empty array of acceptance criteria.

Writes additionally require `allowedWriteScope` (non-empty) and `writeMode` (`direct` or `isolated`). `direct` also requires `workspaceStateKnown: true` and `writeAuthorization: true`; `isolated` means the Supervisor supplied the isolated worktree and owns its lifecycle. Reads, targeted tests, migrations, lint/typecheck/build tasks are all valid Pi work; write mode is not read-only by default, and profile `readonly` is only for pure reads.

The runner rejects obviously vague/non-atomic requests, missing scope/acceptance, and incomplete write declarations with a `blocked` result and `decisionNeeded` **before** launching Pi. Ordinary implementation detail stays Worker-owned.

Example request:

```json
{
  "action": "delegate",
  "taskId": "task-123",
  "cwd": "/absolute/path/to/worktree",
  "objective": "Implement the token refresh guard in src/auth.",
  "scope": ["src/auth"],
  "constraints": ["Do not change public APIs"],
  "acceptance": ["Unit tests for the guard pass"],
  "profile": "implementation",
  "writeMode": "isolated",
  "allowedWriteScope": ["src/auth"],
  "thinking": "low"
}
```

## Model selection

Pi's native model selection is the source of truth. Configure the desired default in Pi with `/model`, then save it with `Ctrl+S`. When the request omits both `provider` and `model`, the runner omits model-selection flags and lets Pi use that default; it does not keep a second model default or model-tier catalog. When a request explicitly supplies both fields, the runner passes them through. Supplying only one is blocked before launch. Thinking remains caller-selectable. The Worker must not change models or create a replacement session on its own; if the selected or configured model is insufficient, it reports `NEEDS_DECISION`. Results report the model found in Pi's stream/session metadata when available. A new task uses Pi's configured default; a continuation uses the model stored in that session.

Because model choice belongs to Pi, a Pro model saved as Pi's default can be used by an unspecified task. The Supervisor should ensure the Pi default reflects the intended cost policy. No per-task confirmation is needed for the configured default.

## Host permissions

Pi runs within the execution permissions granted to the host Agent. Preserve the caller's environment and Pi's native configuration and credentials; do not replace Pi's config directory or copy credentials into a temporary config. If startup fails with a permission denial, return `SANDBOX_PERMISSION`, the denied path when known, and whether task execution began. Only the host Agent can request permission. It may retry the same request once only when the runner reports that execution did not start. Never replay after a task-start event or when start state is ambiguous.

## Workspace and concurrency

`direct` writes stay in the Supervisor-supplied `cwd` and write only inside `allowedWriteScope`. `isolated` writes use the Supervisor-supplied isolated worktree. In both modes Pi must not create, switch, or clean worktrees or checkouts, and must not reset, stash, clean, checkout over user state, commit, push, or merge. Pi reports out-of-scope findings without changing them and returns `[NEEDS_DECISION]` when a needed change falls outside the allowed write scope.

Serialization: overlapping writes in the same `cwd` must run one at a time. Read-only tasks may run in parallel, and isolated writes to disjoint worktrees may run concurrently. V1 `workspaceMode` `existing`/`delegated` semantics remain accepted for callers that do not use `writeMode`; `delegated` keeps the legacy "follow a project worktree Skill/rule or stop" policy but must not be combined with `writeMode`.

## Continuation

A `continue` requires the original `cwd` plus the exact `sessionFile` from the prior result, not `sessionId` alone. The runner inspects the session JSONL metadata for its recorded provider/model. Without an explicit model override, Pi continues with the session's recorded model and returns it in the result. If the metadata is unavailable, or an explicit provider/model conflicts with the session, the runner returns a `blocked` model-mismatch `decisionNeeded` before launch.

## Recovery and result handling

The normal path starts Pi directly in JSON streaming mode; do not preflight with version/help/model scans. The runner frames stdout on LF with a streaming UTF-8 decoder, parses `message_update` text/tool deltas, tool start/end, and the final assistant message, and returns the final text and usage only when present. Malformed event lines are reported; usage is never invented.

Only a recognized startup capability failure triggers targeted discovery: unsupported options consult local `pi --help`; an unknown model consults `pi --list-models <provider>`; a missing `pi` is reported directly. Current Pi accepts piped Prompt input; if a future CLI explicitly rejects it before execution, the runner may retry once with argv transport. A confirmed pre-execution rejection of JSON mode may retry once in final text mode. If any event indicates that the task started, a stream/parser/transport failure must never re-run the task. Authentication errors and rate limits are returned without login attempts, model substitution, or automatic retry. No behavior branches on Pi version numbers.

Pi's final response must include a structured report block. The runner exposes compatible fields plus a task report: `status`, `summary`, `changedFiles`, `validation`, `remainingIssue`, `decisionNeeded`, `cwd`, `sessionId`/`sessionFile`, `provider`/`model`, `writeScope`, `scopeExceeded`, and `outOfScopeFindings`. The runner cannot observe source changes or validation itself, so unreported values stay `null`/empty and `reportParsed` records whether Pi followed the format. A zero exit code is a process result, not acceptance: the Supervisor reviews the worktree, diff, and required checks independently.

If Node.js or the runner is unavailable but Pi can run, the calling Agent may invoke Pi through its native process API with an argument array and `shell: false`, capture the final text, and preserve the same session, model, tool-profile, and write policy. Never emulate it with a shell command string.

Read [references/worker-contract.md](references/worker-contract.md) for the full JSON schema, decision triggers, and result fields.

## Examples

- One-time read: `action: "delegate"`, `profile: "readonly"`, one objective, explicit scope, acceptance evidence.
- Direct write: `writeMode: "direct"`, `allowedWriteScope`, `workspaceStateKnown: true`, `writeAuthorization: true`.
- Isolated write: Supervisor supplies an isolated worktree as `cwd`; `writeMode: "isolated"` with `allowedWriteScope`.
- Review correction: `action: "continue"` with the same `cwd`, the prior `sessionFile`, and concrete findings; thinking may change.
- Model override requested: pass provider and model together only when the task or Supervisor explicitly selects them; otherwise let Pi use its native default.
- Multiple independent tasks: separate runner processes with unique task IDs, disjoint scopes, and isolated worktrees for writes; Pi does not schedule them.
- Streaming unsupported or Pi missing: only a confirmed startup rejection may fall back; a started task is never replayed.
