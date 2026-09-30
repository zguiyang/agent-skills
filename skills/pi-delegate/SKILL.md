---
name: pi-delegate
description: Delegate a bounded coding or repository investigation task to a local Pi Coding Agent, with explicit model and session control. Use after the calling agent has decided the task and must independently review the result.
metadata:
  short-description: Delegate one bounded task to a local Pi worker.
---

# Pi Delegate

Use this skill after the calling Agent has understood the request, decided the approach, and bounded one task. The calling Agent owns architecture, task splitting, model/thinking choices, authorization, review, and final acceptance. Pi is one Worker for one task and one Session; do not build orchestration or subagents inside Pi. Parallel work means separate calls with separate task IDs and isolated worktrees, selected by the calling Agent.

## Runner

Use `scripts/pi-worker.mjs` when Node.js is available. It reads one JSON request from stdin, writes one final JSON result to stdout, and sends progress to stderr. Invoke the script through the host's process API with an argument array and `shell: false`; never construct a shell command string. The runner passes the complete Prompt through Pi's stdin by default. Only a confirmed pre-execution stdin rejection may retry once with the Prompt as a single argv element after `--`. Markdown, backticks, `$`, quotes, newlines, Unicode, and code blocks are never shell-expanded.

The host Agent should start the runner with its native process API, for example `spawn(process.execPath, [runnerPath], { cwd: request.cwd, shell: false, stdio: ['pipe', 'pipe', 'pipe'] })`, then write `JSON.stringify(request)` to stdin and parse its single stdout JSON result. This is an API shape, not a shell command to copy.

Request fields:

```json
{
  "action": "delegate",
  "taskId": "task-123",
  "cwd": "/absolute/path/to/repository-or-worktree",
  "workspaceMode": "existing",
  "provider": "deepseek",
  "model": "deepseek-flash",
  "thinking": "low",
  "profile": "implementation",
  "prompt": "Implement the approved change...",
  "acceptance": ["Run the relevant unit tests"]
}
```

`action` is `delegate` or `continue`; `taskId`, `cwd`, and `prompt` are required. `workspaceMode` is `existing` or `delegated` and defaults to `existing`. `sessionId` defaults to `taskId`; it identifies the Pi Session but is not a reliable lookup handle across cwd changes. A `continue` keeps the same `sessionId`, `workspaceMode`, and workspace. For delegated work, pass both the prior turn's actual worktree path as `cwd` and the returned `sessionFile`, which reopens the exact Session. The runner remains stateless. The runner does not silently substitute a model. Optional `timeoutMs` sets a task timeout.

Profiles: `readonly` limits Pi to `read,grep,find,ls` and reports `hardReadOnly: true` only when that allowlist is applied. `implementation` keeps Pi's configured tools and is not read-only. `verification` enables read/search tools plus `bash` for checks and therefore reports `hardReadOnly: false`; shell access is not a read-only boundary. If the local CLI rejects a requested option, the runner reports a targeted diagnostic rather than pretending the restriction was enforced.

## Worktree and authorization

For any task that may write files, isolate it from the user's main checkout. In `existing` mode, the calling Agent supplies the workspace; Pi works only there and neither creates nor switches worktrees. In `delegated` mode, the calling Agent supplies the repository root; Pi first reads project instructions and follows a project worktree Skill/rule to create an isolated worktree. If none exists or creation fails, Pi stops and returns `[NEEDS_DECISION]`; it must not edit the root checkout or invent a fallback. Never require a clean main checkout; never reset, stash, clean, overwrite a branch, push, merge, deploy, or touch production data unless that exact action is explicitly authorized. A `continue` in delegated mode receives the actual prior worktree path and reuses it without creating another. Do not let concurrent workers share a mutable worktree.

The runner does not create, clean, or switch worktrees. It passes `cwd` and `workspaceMode` to Pi and adds the corresponding workspace policy to the task Prompt.

## Recovery and result handling

The normal path starts Pi directly in JSON streaming mode; do not preflight with version/help/model scans. The runner frames stdout on LF using a streaming UTF-8 decoder, renders progress to stderr, and returns the final assistant text and usage only when present in Pi events. Malformed event lines are reported; usage is never invented.

Only a recognized startup capability failure triggers targeted discovery: unsupported options consult local `pi --help`; an unknown model consults `pi --list-models <provider>`; a missing `pi` is reported directly. Current Pi accepts piped Prompt input; if a future CLI explicitly rejects it before execution, the runner may retry with argv transport. A confirmed pre-execution rejection of JSON mode may retry once in Pi's final text mode. If any event indicates that the task started, a stream/parser/transport failure must never re-run the task. Return the uncertain/failed state with its session and workspace intact so the calling Agent can inspect or continue deliberately. Authentication errors and rate limits are returned to the calling Agent without login attempts, model substitution, or automatic retry.

If Node.js or the runner is unavailable but Pi can run, the calling Agent may invoke Pi through its native process API using an argument array and `shell: false`, then capture the final text output. This fallback is non-streaming; it must preserve the same session, model, tool-profile, and worktree constraints. Never emulate it with a shell command string.

Read [references/worker-contract.md](references/worker-contract.md) when building requests, interpreting runner results, or reviewing failure recovery details.

## Examples

- One-time task: `action: "delegate"`, stable `taskId`, selected provider/model/thinking, one explicit objective and acceptance criteria.
- Review correction: use `action: "continue"` with the same `taskId`/`sessionId`, same worktree, and concrete review findings; thinking may change.
- Read-only investigation: use `profile: "readonly"`, forbid edits in the prompt, and request file/symbol evidence.
- Write task with `workspaceMode: "existing"`: point `cwd` at its isolated worktree; Pi will neither create nor switch worktrees.
- Write task with `workspaceMode: "delegated"`: point `cwd` at the repository root; Pi must use a project worktree Skill/rule or stop for a Supervisor decision.
- Multiple independent tasks: the calling Agent starts separate workers with disjoint scopes, unique task/session IDs, and distinct worktrees; Pi itself does not schedule them.
- Streaming unsupported: only a confirmed startup rejection may use the runner's one-time text-mode fallback. A started task is never replayed.
- Pi missing or model unavailable: return the local error/discovery evidence to the calling Agent; do not install Pi or silently select another model.
