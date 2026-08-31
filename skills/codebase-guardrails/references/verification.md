# Verification Contract

A universal verification model that adapts to each project instead of hard-coding commands.

## Flow

```
Discover available verification commands
    (read package.json scripts / project rule command lists)
        ↓
Select relevant checks
    (only those touching the change: type check → logic tests → lint/format → build)
        ↓
Run minimum sufficient verification
    (the project's own commands; run the selected set once)
        ↓
Inspect result
    (look at the real output; exit status + relevant failure lines)
        ↓
Report actual result
    (pass / fail / not run + reason)
```

## Forbidden

- Claiming "verified" without executing the check
- "Tests should be fine", "looks fine", "probably works"
- Claiming a command passed that was never run
- Inventing verification commands from habit instead of the project's own tooling

## Allowed report formats

```
Verification command: <project command>
Result: passed
```

```
The project has no test script (package.json has no test entry)
Result: tests not run
```

```
Verification failed
Reason: <actual error output>
```

## Project tooling first

- Use the project's own commands (e.g. the workspace's lint script, the configured test runner, its typecheck script).
- If the project has pre-push gates or CI checks, verification should cover what the gates cover.
- If the project has no verification facility, state that plainly; do not invent a substitute and claim it as verification.

## Verification discipline

- Verify per logical unit during long tasks, not only at the end.
- When a check fails: inspect the failure, fix, re-run — do not declare done.
- A report must distinguish: what was run, what passed, what failed, what was not run and why.
