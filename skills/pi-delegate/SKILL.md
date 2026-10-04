---
name: pi-delegate
description: Delegate one bounded atomic coding or investigation task to a local Pi worker with a structured task contract, explicit model/session control, direct-or-isolated write policy, and a structured result. Use after the calling agent has decided the task and must independently review the result.
metadata:
  short-description: Delegate one atomic task to a local Pi worker.
---

# Pi Delegate

Use this skill after the calling Agent has understood the request, decided the approach, and bounded one atomic task. The calling Agent is the Supervisor: it owns architecture, task splitting, model/thinking choices, authorization, review, and final acceptance. Pi is one Worker for one task and one Session. Do not build orchestration, planners, or subagents inside Pi.

## Runner

Use `scripts/pi-worker.mjs` when Node.js is available. It reads one JSON request from stdin, writes one final JSON result to stdout, and sends progress to stderr. Invoke it through the host's process API with an argument array; `shell: false` is internal to the Node runner's `child_process.spawn` of Pi. The calling Agent only needs its normal way to invoke the runner. Never build a shell command string. The runner passes the complete Prompt through Pi's stdin by default. Only a confirmed pre-execution stdin rejection may retry once with the Prompt as a single argv element after `--`. Markdown, backticks, `$`, quotes, newlines, Unicode, and code blocks are never shell-expanded.

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

## Models and authorization

Provider/model are resolved in the runner before Pi argv is built and the effective values are reported. Absent provider/model resolves to `deepseek` / `deepseek-flash`. Thinking stays caller-selectable; higher thinking on Flash is allowed. The runner passes the selected provider/model explicitly and tells Pi to stay on it. If the model is insufficient, Pi returns a structured decision request; neither runner nor Worker switches to a costlier model or starts a replacement session. An explicit Pro/expensive request without `allowProModel: true` returns `blocked` with `decisionNeeded` carrying `reason`, `current_model`, `suggested_model`, and `why_upgrade_is_needed`, and Pi is not launched. Grant `allowProModel` only with the Supervisor's explicit authorization.

## Workspace and concurrency

`direct` writes stay in the Supervisor-supplied `cwd` and write only inside `allowedWriteScope`. `isolated` writes use the Supervisor-supplied isolated worktree. In both modes Pi must not create, switch, or clean worktrees or checkouts, and must not reset, stash, clean, checkout over user state, commit, push, or merge. Pi reports out-of-scope findings without changing them and returns `[NEEDS_DECISION]` when a needed change falls outside the allowed write scope.

Serialization: overlapping writes in the same `cwd` must run one at a time. Read-only tasks may run in parallel, and isolated writes to disjoint worktrees may run concurrently. V1 `workspaceMode` `existing`/`delegated` semantics remain accepted for callers that do not use `writeMode`; `delegated` keeps the legacy "follow a project worktree Skill/rule or stop" policy but must not be combined with `writeMode`.

## Continuation

A `continue` requires the original `cwd` plus the exact `sessionFile` from the prior result, not `sessionId` alone. The runner inspects the session JSONL metadata for its recorded provider/model. If metadata cannot establish the model, or the recorded model conflicts with the authorized/effective model, the runner returns a `blocked` model-mismatch `decisionNeeded` and does not launch. Matching sessions continue normally.

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
- Pro requested: without `allowProModel`, expect a blocked decision; supply authorization only when the Supervisor approves the cost.
- Multiple independent tasks: separate runner processes with unique task IDs, disjoint scopes, and isolated worktrees for writes; Pi does not schedule them.
- Streaming unsupported or Pi missing: only a confirmed startup rejection may fall back; a started task is never replayed.
