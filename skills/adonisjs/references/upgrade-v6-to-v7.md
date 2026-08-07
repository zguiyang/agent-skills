# Upgrade v6 → v7

Official: https://docs.adonisjs.com/v6-to-v7.md  
Legacy docs: https://v6-docs.adonisjs.com  
Lookup: `python3 scripts/lookup_docs.py --fetch v6-to-v7`

Also read [anti-patterns.md](anti-patterns.md).

## Baseline requirements

- **Node.js ≥ 24**
- TypeScript 5.9/6.x, ESLint 10 ecosystem as per upgrade guide
- Vite 7 integration updates

## High-impact breaking changes (agent checklist)

Work through the official guide in order. Common mechanical items:

| Area | Action |
|------|--------|
| Node | Upgrade runtime + CI/prod to ≥ 24 |
| Ace JIT | `@poppinss/ts-exec` instead of `ts-node` |
| Controllers in routes | Prefer `#generated/controllers` barrels |
| URLs | `urlFor` instead of `router.makeUrl` / legacy Edge `route()` |
| HTTP types | `HttpRequest` / `HttpResponse` renames where applicable |
| Helpers | Drop removed helpers (`cuid`, `getDirname`, …) |
| Assembler hooks | New hook names (`buildStarting`, …) |
| Flash errors | `inputErrorsBag.*` |
| Encryption | `config/encryption.ts` |
| Inertia | New config/middleware/paths |
| Tests | Glob `*.spec.{ts,js}` |

## Process

1. Confirm the app is v6 (`@adonisjs/core` major 6) and Node ≥ 24 available.
2. Fetch and follow https://docs.adonisjs.com/v6-to-v7.md step by step.
3. After each cluster of changes: `node ace list:routes`, `node ace test`, fix compile errors.
4. Do not mix v6 blog snippets with v7 APIs mid-upgrade.

## Official upgrade agent prompt

The docs include a ready-made “Upgrade Agent” prompt — when the user asks for an automated upgrade, fetch the live page and follow **that** prompt rather than inventing steps.
