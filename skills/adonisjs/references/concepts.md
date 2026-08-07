# Concepts — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/concepts/dependency-injection`

## Lifecycle

Boot → Start (`start`/`ready`, preloads) → Termination (`shutdown`, reverse order in v7)

## IoC

- `@inject()` on controllers/middleware/listeners/commands for DI
- Container services via `@adonisjs/.../services/...`
- Swaps for tests

## Providers & preloads

- Providers: register bindings / lifecycle hooks
- Preloads: simpler start-phase wiring (`make:preload`)

## Assembler / hooks

v7 `adonisrc.ts` `hooks.init` should include `indexEntities()`; add Inertia/Tuyau/Bouncer/Vite hooks as needed. Renames: `onBuildStarting` → `buildStarting`, etc. See upgrade guide.

## Extending

Macros/getters on framework classes; prefer official extension guides over monkey-patching.
