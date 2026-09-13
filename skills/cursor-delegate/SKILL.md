---
name: cursor-delegate
description: >-
  Delegate a small, clearly scoped implementation or read-only task from one
  coding Agent to the Cursor CLI installed on the user's machine. Use the
  current host shell and working directory by default, discover the installed
  CLI's current interface before retrying failures, and return observable
  results to the calling Agent. Do not use this for architecture, product
  decisions, authorization decisions, or final acceptance.
metadata:
  short-description: Delegate atomic tasks to the user's local Cursor CLI.
  version: "1"
  updated: "2026-09-13"
---

# Cursor Delegate

## Use When

- A coding Agent has already made the design, scope, and permission decisions.
- A small implementation, mechanical change, focused investigation, or
  follow-up fix should be executed by the Cursor CLI installed on the user's
  machine.
- The result must be produced in the current local project and then inspected
  by the calling Agent.

## Don't Use When

- The task needs product, architecture, API, deployment, or permission
  decisions; the calling Agent owns those decisions first.
- The task is too broad to express as one observable responsibility and a
  bounded input/output contract.
- The available execution surface cannot run commands on the user's host.
- The task requires creating a persistent session, Worker, Worktree, ACP
  service, SDK integration, or general multi-Agent orchestration.

## Workflow

1. Confirm that the user has requested or explicitly approved the delegation.
   Reduce the request to one atomic responsibility. State the target, allowed
   changes, forbidden actions, and observable completion conditions in the
   prompt. A general request to "use Cursor" does not authorize unrelated work.
2. Resolve the working directory. Use the calling Agent's current working
   directory by default. If it is absent, inaccessible, or ambiguous, stop and
   ask the user. Use an explicit workspace argument only when the user gave a
   different confirmed directory or the current directory cannot be used.
3. For an implementation or repair task, record a worktree baseline before
   invocation: status, existing tracked diff, and relevant untracked files.
   This lets the calling Agent distinguish pre-existing changes from changes
   made by Cursor. Do not alter the baseline while recording it.
4. Invoke the installed Cursor CLI through the host Shell, not through a
   restricted in-process or sandbox-only substitute. Do not claim that this
   Skill can bypass the calling platform's permission or sandbox controls.
5. Before the first task, and after an interface-related failure, discover the
   current executable, version, top-level help, relevant subcommand help, and
   available models using the CLI's own supported inspection facilities.
   Prefer the executable and syntax that the current installation reports.
6. Select the CLI's current non-interactive output mode. For investigation,
   select its current read-only or planning mode. For implementation, use
   force execution only when the calling Agent has authorized the change and
   the task requires it.
7. Use the default Auto model unless the user or calling Agent specified a
   model. If a requested model is not listed by the current CLI, stop and
   report it; do not silently substitute another model.
8. Capture stdout, structured output when available, stderr, exit status,
   timeout, and whether the output is empty. Return these facts along with a
   concise task result.
9. The calling Agent independently checks the real workspace, diff, and
   relevant project verification. A successful CLI exit or Cursor summary is
   not proof that the task is complete.

## Rules

- Describe stable intent, not version-specific short flags or copied command
  templates. CLI spelling, aliases, modes, and output options may change.
- Treat user-provided paths and task text as data. Quote paths safely and do
  not construct Shell code by interpolating untrusted text.
- Use the host shell and the confirmed local working directory. Do not create
  or select a branch, Worktree, Worker, persistent session, or alternate
  checkout unless the user explicitly requests and authorizes it.
- Keep prompts atomic. Cursor may implement or inspect; it must not be asked
  to make the calling Agent's product, architecture, scope, or permission
  decisions.
- Never enable automatic approval of MCP servers, broad "run everything"
  behavior, or equivalent unrestricted execution by default.
- Force execution authorizes execution of the already approved task only. It
  does not authorize scope expansion, unrelated cleanup, configuration changes,
  service startup, database writes, commits, or pushes.
- Do not log, print, persist, or transmit API keys, login tokens, cookies,
  email addresses, headers, or other credentials. Do not log in, change MCP
  configuration, install or update the CLI, or repair the user's environment.
- If the CLI, login, model, MCP, permission, or host environment is broken,
  first perform safe local diagnosis using the CLI's current help and status
  facilities. Do not alter that environment; report the remaining problem to
  the user.
- Stop on ambiguity, authorization failure, unexpected file changes, missing
  output, timeout, non-zero exit, or a failed retry. Do not turn an error into
  a success claim.
- Retry only a confirmed pre-execution interface or argument failure after
  consulting current help. Never blindly retry after a timeout, disconnect,
  empty output, or any state in which Cursor may already have run or edited
  files; inspect the baseline and workspace first.
- Parallel delegation is allowed only for independent tasks with disjoint
  files and no shared mutable state. Keep conflicting edits, shared config,
  migrations, services, and dependent steps sequential.

## Examples

- “在当前项目修复这个明确的解析错误” → inspect the current CLI interface,
  delegate only the fix, then have the calling Agent review the diff.
- “调研这个模块当前如何处理缓存，不要改代码” → use the current CLI's
  read-only/planning semantics and return evidence, not a design proposal.
- “把这三个互不相关的机械改动交给 Cursor” → delegate independent atomic
  tasks in parallel only after checking that their files and state do not
  overlap.
- “Cursor 报未知参数” → inspect current version and help, adapt the syntax
  once only if the task did not start, and report the error if the current
  interface remains unclear.

## Edge Cases

- If no host Shell is available, do not emulate a local call inside the
  sandbox. Report that the execution surface cannot satisfy this Skill.
- If neither a local Cursor executable nor a supported alias can be found,
  report the discovery result and let the user install or configure it.
- If authentication is missing or expired, report it. Do not invoke login or
  ask the user to paste a credential into a prompt, URL, or output log.
- If a requested model is absent, report the available-model evidence and stop.
- If help output contradicts prior instructions, trust the current CLI's
  observed interface for this invocation, but preserve the task's semantic
  permissions and scope.
- If a command exits successfully but returns no meaningful output, classify
  the delegation as incomplete or unknown until the workspace and expected
  result are independently checked.
- If a task times out or disconnects after it may have started, do not launch a
  duplicate task. Inspect the workspace and report whether execution remains
  unknown.
- If Cursor changes files outside the approved scope, stop before cleanup or
  rollback and report the exact observed boundary violation.
- If a task would run a migration, seed, database write, service, external
  integration, or authenticated MCP call, require separate explicit approval
  and the project's own safety workflow.
- If a parallel task fails, do not hide the failure behind successful sibling
  results; report each task separately.

## References

This Skill intentionally has no bundled command reference: the installed CLI
is the source of truth. Consult its current help, version, status, model, and
relevant subcommand documentation at invocation time. Use the calling
project's own rules and verification commands for all project-specific work.
