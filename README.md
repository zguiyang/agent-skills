# agent-skills

[English](README.md) | [中文](README.zh-CN.md)

**A personal Agent Skills vault for real developer work** — skills drawn from day-to-day coding scenarios, kept in `SKILL.md` format for Cursor, Claude Code, and other agents that load skills from a folder.

## What this repo is

This is not a framework-specific marketplace, and not a one-shot dump of prompts.

It is a **personal, continuously growing collection of Agent Skills** for situations I actually hit while building software — especially when official or built-in skills do not cover the stack, conventions, or workflow well enough. Each skill is written from a working developer’s angle: what to do, what to avoid, and how an agent should behave in that scenario.

New skills will keep landing here as new work scenarios show up.

## Features

- **Work-scenario driven** — skills come from personal development practice, not abstract demos
- **Fill the gaps** — for stacks and habits that official skills do not cover well
- **Continuously expanding** — more skills will be added over time from ongoing work
- **`SKILL.md` standard** — drop-in folders that compatible agents can load
- **Progressive disclosure** — short entry points, deeper `references/`, concrete `examples/` when needed
- **Easy install** — `npx skills` globally or per project, or copy into `.cursor/skills`

## Skills

Current skills (more will be added from future work scenarios):

| Skill | Description | Path |
| --- | --- | --- |
| **adonisjs** | AdonisJS **v7** development: Controllers + injected Services, Vine validation, Auth/Bouncer, Ace CLI, stack kits, v6→v7 anti-patterns, and live docs lookup. | [`skills/adonisjs/`](skills/adonisjs/) |
| **lucid** | AdonisJS **Lucid** SQL/ORM: models, migrations, relationships, query builders, seeders/factories, schema generation. Prefer over inventing Prisma/Eloquent patterns. | [`skills/lucid/`](skills/lucid/) |
| **codebase-guardrails** | Cross-project AI behavior guardrails: read project rules first, act on evidence, minimum correct changes, Stop & Ask at boundaries, verify before claiming done. | [`skills/codebase-guardrails/`](skills/codebase-guardrails/) |
| **repository-structure** | Place and evolve code by ownership, change boundaries, and real consumers; avoid overloaded units, speculative abstractions, and parallel sources of truth. | [`skills/repository-structure/`](skills/repository-structure/) |
| **test-database-workflow** | Safely use an explicitly isolated test database for integration and functional tests. | [`skills/test-database-workflow/`](skills/test-database-workflow/) |
| **infrastructure-operations** | Diagnose deployment, container, environment, and runtime-state questions from configuration first. | [`skills/infrastructure-operations/`](skills/infrastructure-operations/) |
| **cursor-delegate** | Prefer delegating bounded, non-trivial execution to the user's local Cursor CLI. Uses this user's verified minimal invocation where applicable, checks CLI help only when needed, and leaves scope, authorization, and final verification with the calling Agent. | [`skills/cursor-delegate/`](skills/cursor-delegate/) |
| **pi-delegate** | MCP-native policy for deciding when bounded Pi Worker delegation is worthwhile; preserves Supervisor ownership of decisions, integration, and final review. | [`skills/pi-delegate/`](skills/pi-delegate/) |

## Installation

### With `npx skills` (recommended)

```bash
# Install all skills globally
npx skills add zguiyang/agent-skills -g --all

# Install all skills into the current project
npx skills add zguiyang/agent-skills --all

# Install a single skill (example: lucid)
npx skills add zguiyang/agent-skills --skill lucid
```

### Install `pi-delegate` for Codex

`pi-worker-mcp` and this Skill are independent projects. Install the MCP first
for the Host and scope you actually use; it owns the Pi runtime, worker
lifecycle, RPC, and worktree creation:

```bash
npx -y @zguiyang/pi-worker-mcp@0.1.1 setup
```

Then, optionally install the Skill from the root of any project where Codex
should apply its delegation policy:

```bash
npx skills add zguiyang/agent-skills --skill pi-delegate -a codex -y
```

This installs only `pi-delegate`, only for Codex, at project scope. `-y` skips
the confirmation prompt. The current `skills` CLI installs project skills for
Codex under `.agents/skills/`. To review the choices interactively, omit `-y`.

The MCP requires Node.js 20+, a locally configured `pi` executable, and Git
for worktree mode. It is started by the Host, not by this Skill. `pi-delegate`
does not contain a Pi runner, configure providers or credentials, install the
MCP, or replace Pi's default model. When the Supervisor leaves out `model`, Pi
uses its saved local default.

The Supervisor uses Pi by default for a concrete, bounded atomic execution
task—whether it is a small file read, one targeted test, a one-file fix, a
mechanical edit, or a larger implementation. Task size is not the gate: the
objective, context, operating boundary, completion check, and side effects
must be clear. The Supervisor retains requirements, product and architecture
decisions, planning, permission and risk decisions, task dependencies,
integration, review, and final acceptance. Complex goals are split into
coherent, independently verifiable tasks before dispatch; related follow-ups
prefer `pi_continue`.

The registered MCP tools are `pi_list`, `pi_spawn`, `pi_status`, `pi_steer`,
`pi_continue`, and `pi_abort`. Independent read-only investigations can run in
parallel. Writes must avoid conflicts: use deliberate `direct` work only with
a known workspace state, or use MCP-managed `worktree` mode for isolated
implementation. `PI_WORKER_ALLOWED_ROOTS` is a path allowlist, not an OS
sandbox. Atomicity does not authorize destructive data work, sensitive
configuration, production operations, irreversible changes, Git-history
rewriting, or scope expansion. Spawn acceptance and `settled` state are not
proof of correctness; the Supervisor verifies source evidence, diffs, scope,
checks, and side effects before accepting a result. See the [Skill instructions](skills/pi-delegate/SKILL.md)
and [MCP contract](skills/pi-delegate/references/mcp-contract.md).

### Manual copy

```bash
# Cursor — project-level
mkdir -p .cursor/skills
cp -R skills/adonisjs .cursor/skills/adonisjs
cp -R skills/lucid .cursor/skills/lucid
cp -R skills/codebase-guardrails .cursor/skills/codebase-guardrails
cp -R skills/cursor-delegate .cursor/skills/cursor-delegate
cp -R skills/pi-delegate .cursor/skills/pi-delegate

# Cursor — user-level
mkdir -p ~/.cursor/skills
cp -R skills/adonisjs ~/.cursor/skills/adonisjs
cp -R skills/lucid ~/.cursor/skills/lucid
cp -R skills/codebase-guardrails ~/.cursor/skills/codebase-guardrails
cp -R skills/cursor-delegate ~/.cursor/skills/cursor-delegate
cp -R skills/pi-delegate ~/.cursor/skills/pi-delegate
```

## How it works

Each skill is a self-contained folder:

```text
skills/<name>/
├── SKILL.md           # Agent entry: when to use, hard rules, topic map
├── references/        # Topic cheat-sheets + anti-patterns (optional)
├── examples/          # Vertical slices (optional)
├── scripts/           # Helper scripts (optional)
└── assets/            # Indexes / static data (optional)
```

Typical loop:

1. Hit a real work scenario that needs better agent guidance
2. Capture it as a skill in this repo (or improve an existing one)
3. Install / reload the skill in the agent
4. Reuse it the next time the same kind of work appears

## Requirements

- Agents that load skills from a directory containing `SKILL.md` (e.g. Cursor, Claude Code)
- Python 3 (optional, only for skills that ship helper scripts)

## License

See repository for license details. Skills are provided for use with compatible AI agents.
