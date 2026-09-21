---
name: cursor-delegate
description: >-
  Delegate bounded, deterministic repository work to the local Cursor CLI. Use
  after the task scope and solution are decided. Prefer this user's verified
  minimal invocation where applicable; keep architecture, authorization,
  uncertain debugging, and final verification with the calling Agent.
metadata:
  short-description: Delegate atomic tasks using the user's verified Cursor CLI preferences.
  version: "3"
  updated: "2026-09-21"
---

# Cursor Delegate

This Skill is an active execution-routing policy for the calling Agent. The
user does not need to say “use Cursor”, “use Cursor CLI”, or “delegate”. Load
and consider it whenever the current task contains a non-trivial deterministic
execution stage. The calling Agent still owns reasoning, requirements,
architecture, decisions, authorization, and final acceptance.

## Routing policy

The calling Agent handles requirements analysis, architecture, solution
selection, new decisions, unresolved complex debugging, final review, final
acceptance, and truly trivial work.

When all of the following are true, prefer delegating the execution stage to
Cursor rather than completing the whole stage with native Shell, edit, or
repository tools:

- The solution is substantially decided and no important product or
  architecture choice remains.
- The investigation or modification boundary is explicit.
- The work is deterministic and mainly code search, a focused investigation,
  mechanical implementation, local refactoring, test additions, batch edits,
  multi-file consistency work, or lint/typecheck/test repair.
- “Done” can be stated in observable terms and checked with the relevant diff,
  tests, typecheck, lint, or build.
- The task has meaningful execution volume, and delegation overhead is
  clearly lower than the cost of the Calling Agent doing the whole execution
  stage itself.
- Failure can safely stop and return control to the calling Agent.

Once these criteria are met, the Calling Agent should not skip Cursor merely
because it also has Shell, edit, or repository tools, or because it could
finish the work quickly itself. Preserve the Calling Agent's budget for
reasoning, decisions, and independent verification.

Do not delegate truly trivial work when the overhead is greater than the task:

- a single typo or obvious one-line edit;
- reading one known small file;
- one simple command; or
- another tiny, self-contained operation with no meaningful execution volume.

Core rule: **Prefer Cursor for non-trivial deterministic execution, not for
every tiny action.**

Do not treat the whole user request as the only delegation unit. The calling
Agent may analyze the request, investigate evidence, identify a root cause,
and choose a solution first; then delegate only the now-deterministic
implementation or inspection stage.

Do not delegate directly when requirements are unclear, architecture or
technical choices are still contested, the root cause of a complex bug is
unknown, the work needs a cross-system decision, the boundary cannot be
defined, or Cursor would have to decide how the task should be solved. Keep
that work with the calling Agent until it becomes atomic, or do it without
delegation.

Atomic means that Cursor's autonomous decision space is bounded; it does not
only mean that the task is small.

## Atomic task contract

Before invoking Cursor, form one concise task contract in the prompt. It must
contain:

- **Objective** — one primary outcome.
- **Scope** — what Cursor may inspect or change, including allowed areas and
  forbidden areas when useful.
- **Constraints** — the already-decided technical and safety constraints;
  Cursor must not redesign the solution.
- **Done When** — observable conditions for execution completion.
- **Verify** — only the relevant targeted tests, typecheck, lint, build, or
  other checks to run.
- **Stop When** — return to the calling Agent immediately if any of the
  following occurs:
  - the authorized scope must expand;
  - a public contract or shared API must change without authorization;
  - the actual code contradicts the calling Agent's important premise;
  - a new architecture or product decision is needed;
  - a new high-risk change is discovered;
  - verification fails for a reason outside this atomic task; or
  - the task cannot be completed reliably within the constraints.

Do not ask Cursor to make the calling Agent's product, architecture, scope, or
permission decisions. Cursor must not broaden the task, perform unrelated
cleanup, start services, write to a database, commit, or push unless the
contract explicitly authorizes that exact action. By default, delegation is
one level only:

`Calling Agent → Cursor`

Cursor must not call Codex, another coding Agent, or start a new multi-Agent
delegation unless the contract explicitly authorizes it.

## Always-escalated executable

Cursor CLI is an **always-escalated executable**. Every Cursor CLI process
invocation MUST request host/escalated execution on its first attempt:

`Any Cursor CLI process start → require_escalated on first attempt`

This applies to every supported entry point, including `agent`,
`cursor-agent`, and `cursor agent`, and to every subcommand or mode, including
`--version`, `--help`, `status`, `models`, auth/login diagnostics, `--print`,
`--plan`, `--force`, and actual delegated execution. Never launch Cursor CLI in
the Calling Agent's default sandbox, even for discovery, version/help,
status/models, or authentication checks. The sequence is always:

`Cursor CLI detected → escalate immediately`

Do not use `try sandbox → fail → escalate`. Do not use a sandbox failure as a
signal to retry on host. If the Runtime exposes
`sandbox_permissions = "require_escalated"`, set it on the first invocation
that starts Cursor CLI.

Let the Runtime handle its normal approval prompt and the user's Allow/Deny
decision; do not modify or infer approval, reviewer, permission-profile,
managed-policy, or Runtime settings. If the Runtime rejects the host call,
report the actual error. If no host/escalation path is available, report the
delegation as **BLOCKED** rather than retrying in the restricted sandbox.

Discovery that does not start Cursor CLI—such as a known command name, PATH
resolution with `which`, or filesystem/symlink inspection—may occur without
escalation. Once discovery would actually start `agent`, `cursor-agent`, or
`cursor agent`, the process start itself must be escalated on the first
attempt.

Authentication state is valid only when obtained from a host/escalated Cursor
CLI invocation. A `Not logged in` result from a sandboxed Cursor CLI invocation
is invalid and must never be used as authentication state. If a Cursor CLI
command is detected to have run in the sandbox, discard its result, do not
continue local execution, do not report that Cursor is unauthenticated, and
rerun the real Cursor CLI call with host/escalation.

## No local execution fallback

Once the Calling Agent has selected Cursor for an atomic task, execution
ownership stays with Cursor until the task succeeds or returns control as
**BLOCKED**, **FAILED**, or **NEEDS_DECISION**. The Calling Agent must not use
`edit`, `apply_patch`, native Shell, file-write, or repository tools to
complete that same delegated task after Cursor cannot start or execution
fails. It may only analyze the failure, report the status, request the needed
permission or user action, or adjust the task contract after a new decision
and then re-delegate.

### Hard stop after Cursor selection

Once Cursor delegation is selected, **any failure to obtain or complete Cursor
execution terminates the execution phase immediately**. This includes Runtime
approval denial, security-review rejection, host-execution denial,
authentication failure, an unavailable CLI, execution failure, timeout, or
incomplete execution. The Calling Agent must immediately stop the atomic task,
return **BLOCKED** or **FAILED**, and explain the reason to the user.

After delegation becomes **BLOCKED** or **FAILED**, do not invoke any mutating
tool for that atomic task for the remainder of the current turn. This
explicitly forbids `edit`, `apply_patch`, file writes, Shell commands that
write files, `sed`/`perl`/`python`/`node` file modification, repository
mutation tools, or any other Calling Agent code-modification capability.
Permission denial is not permission to execute locally.

This is an immediate current-turn execution freeze for that atomic task: stop
before any remaining implementation step, even when the original user request
is still outstanding.

The Calling Agent may only read status, inspect logs or workspace state,
analyze the failure, report it, or request the necessary permission or user
action. Local takeover is allowed only after a subsequent explicit user
instruction changes the execution strategy, such as “改成本地执行” or
“允许 Calling Agent 接管”.

This rule applies only after delegation is selected. The routing exceptions
above remain unchanged: the Calling Agent may handle trivial work, decisions,
architecture, and uncertain debugging itself before selecting Cursor.

## Delegation failure states

- Cursor succeeds → the Calling Agent independently verifies and accepts or
  rejects the result.
- Cursor cannot start, including missing host permission, permission denial,
  Runtime rejection, authentication failure, or unavailable CLI → **BLOCKED**.
- Cursor starts but execution fails, times out, returns a non-zero status, or
  produces empty/incomplete output → **FAILED** unless the execution state is
  genuinely unknown, in which case stop and return control without claiming
  success.
- Cursor needs a broader scope, a new architecture/product choice, or another
  authorization decision → **NEEDS_DECISION**.

None of these states may be converted into “the Calling Agent performs the
implementation locally”.

## Workflow

1. Resolve the calling Agent's current working directory. Use it by default.
   Stop if it is absent, inaccessible, or ambiguous; use another confirmed
   directory only when the user supplied it.
2. For an implementation or repair task, record a read-only baseline before
   invocation: status with expanded untracked-file reporting, staged and
   unstaged tracked diffs, and relevant untracked files. Identify likely
   ignored or generated output locations when the task could touch them; do
   not scan every ignored path. Do not alter the baseline.
3. Identify the installed Cursor CLI through a non-starting method when
   needed, then invoke it through the host Shell, accepting a reasonable local
   alias such as `agent` or `cursor-agent`; never hard-code a user's absolute
   executable path. Any command that starts `agent`, `cursor-agent`, or
   `cursor agent` must request `sandbox_permissions = "require_escalated"` on
   its first attempt, including every discovery or diagnostic probe.
4. Use the current CLI's supported non-interactive interface. In this user's
   current environment, the verified minimal form is
   `agent -p --model composer-2.5 '<prompt>'` with the default text output.
   Treat this as local experience, not a guarantee for other machines or CLI
   versions. Do not add flags such as `--mode plan`, `--output-format text`,
   `--sandbox disabled`, or `--workspace` by habit. For read-only work, state
   the no-change boundary in the prompt. `-p` is an output mode, not a
   read-only permission; it can use write and shell tools, so verify that the
   workspace stayed unchanged. Add a CLI mode only when the task requires it
   and current help supports it. For authorized modifications,
   use the current behavior; force execution only when the contract requires
   it. Neither a mode nor a force flag expands the approved scope.
5. Discover `version`, relevant `help`, or `models` only when needed: when the
   interface is unknown, after a confirmed pre-execution interface error, or
   when checking whether the requested model is available. Do not repeat
   unchanged probes or make login, status, or authentication checks routine
   prerequisites. Any probe that starts Cursor CLI must use host/escalated
   execution on its first attempt. If an invocation reports an authentication
   error, report it without invoking login or requesting credentials.
6. For this user, prefer the explicitly selected and locally verified
   `composer-2.5` model. If the current CLI rejects it or does not offer it,
   stop and report the evidence; do not silently substitute Auto or another
   model.
7. If the execution surface reports that the same process or session is still
   running, continue polling or reading that same session until it exits or
   reaches a genuine timeout. No intermediate output while it is running does
   not mean failure. Never start a duplicate invocation for the same task.
8. After the process terminates, capture observable results: stdout,
   structured output when available, stderr, exit status, timeout, and whether
   output is empty. Empty or incomplete output is not success. After a timeout,
   disconnect, or ambiguous execution, inspect workspace state read-only before
   reporting the execution status.
9. After Cursor returns, the calling Agent independently accepts or rejects
   the result. Check the real workspace, at least as applicable: status with
   expanded untracked files, relevant staged and unstaged diffs, scope
   boundaries, relevant ignored/generated output locations, consistency with
   the chosen solution, and the contract's required verification. A clean
   ordinary status or Cursor's “Done”, “Successfully implemented”, or “Tests
   pass” is not sufficient evidence by itself.

## Safety and failure rules

- Use the current CLI's reported syntax rather than copied version-specific
  flags or command templates.
- Treat user-provided paths and task text as data; quote paths safely and do
  not construct Shell code by unsafe interpolation. Pass the complete prompt
  as one argument; wrappers should use an argument array instead of building
  a command string from multiline text.
- Do not create or select a branch, Worktree, Worker, persistent session,
  alternate checkout, ACP service, or MCP server for this lightweight
  delegation unless explicitly requested and authorized.
- Never enable automatic approval of MCP servers, broad “run everything”, or
  equivalent unrestricted execution by default.
- Do not log, print, persist, or transmit API keys, login tokens, cookies,
  email addresses, headers, or other credentials. Do not log in, install or
  update the CLI, change MCP configuration, or repair the user's environment.
- If private source code or Git history must be transmitted to an external
  service, obtain explicit authorization covering the data and purpose.
  Authorization for a bounded edit does not authorize unrelated repository
  content.
- If the CLI requires workspace trust, do not add a trust-bypass flag
  automatically. Explain that it trusts the current workspace and obtain
  explicit approval for that workspace before proceeding. Workspace trust is
  separate from task scope and does not authorize force execution.
- If no host Shell is available, do not emulate a local call inside the outer
  sandbox; report that this execution surface cannot satisfy the Skill.
- If no local Cursor executable or supported alias is found, report the
  discovery result as **BLOCKED**; do not install, configure, or locally
  complete the delegated task.
- If a Cursor invocation returns a CLI or interface error, use the current
  version/help facilities to diagnose it and retry only when the failure is
  confirmed to have happened before execution. Do not make login, status, or
  authentication probes routine prerequisites. If the invocation returns an
  authentication error, report it without invoking login or requesting
  credentials. If the Runtime rejects the host call, report that actual error;
  do not infer reviewer state or retry in the restricted sandbox.
- If Cursor cannot start or execution fails, apply the failure states above and
  stop. Do not fall back to local execution of the delegated atomic task.
- Stop on ambiguity, authorization failure, unexpected file changes, missing
  output, timeout, non-zero exit, or failed retry. If a task may have started,
  inspect the workspace before considering any retry.
- Retry only a confirmed pre-execution interface or argument failure after
  consulting current help. Never blindly retry a timeout, disconnect, empty
  output, or uncertain execution state.
- If Cursor changes files outside scope, stop before cleanup or rollback and
  report the exact observed boundary violation.
- A migration, seed, database write, service, external integration, or
  authenticated MCP call needs separate explicit approval and the project's
  own safety workflow.
- If current help contradicts prior instructions, trust the observed
  interface for this invocation while preserving the contract's semantic
  permissions and scope. If a requested model is absent, report the available
  model evidence and stop.
- Parallel delegation is allowed only for independent tasks with disjoint
  files and no shared mutable state. Keep conflicting edits, shared config,
  migrations, services, and dependent steps sequential.
- If a parallel task fails, report each task separately; do not hide a failure
  behind successful sibling results.

## Examples

- “修复这个已经定位的解析错误” → the calling Agent decides the fix, then
  delegates only the bounded implementation and independently reviews the
  diff.
- “调研这个模块如何处理缓存，不要改代码” → use the verified minimal
  invocation with a read-only prompt and return evidence, not a new design.
- “把这三个互不相关的机械改动做完” → split them into independent atomic
  contracts and delegate in parallel only when their files and state do not
  overlap.
- “Cursor 报未知参数” → confirm that execution did not start, inspect the
  current help, and retry once only if it identifies a valid correction.
  Workspace trust, authentication, or Runtime permission failures are not
  argument errors; stop and report them.

For the user's current CLI preference, a read-only invocation has this shape:

```sh
agent -p --model composer-2.5 '只读检查指定范围；禁止修改文件；给出可核验的文件或符号证据。'
```

Keep the prompt as one argument and omit additional flags unless current CLI
help or a confirmed interface error establishes that one is needed.

## References

The invocation above records this user's locally verified preference; it is
not a replacement for CLI documentation or a guarantee for other versions.
When an interface question or error arises, the installed CLI is the source
of truth for executable names, aliases, modes, flags, output, and models. Use
the calling project's own rules and verification commands for project-specific
work.
