# Anti-patterns & outdated APIs (AdonisJS)

Use this checklist to avoid steering a v7 project with obsolete habits.
When upgrading, prefer https://docs.adonisjs.com/v6-to-v7.md and [upgrade-v6-to-v7.md](upgrade-v6-to-v7.md).

## Version confusion

| Wrong | Right (v7) |
|-------|------------|
| Assume docs.adonisjs.com is still v6 | Current site is **v7**; v6 lives at **v6-docs.adonisjs.com** |
| Node 18/20 as default for new apps | **Node.js ≥ 24** required for v7 |
| Copy v5 IoC `use('App/...')` style | Modern imports / container services per v7 docs |

## Routing & URLs

| Avoid | Prefer |
|-------|--------|
| `router.makeUrl(...)` / `router.makeSignedUrl(...)` | `urlFor(...)` from `@adonisjs/core/services/url_builder` |
| Edge `route(...)` helper (legacy) | `urlFor(...)` in templates per upgrade guide |
| Huge walls of `const X = () => import('#controllers/...')` on v7 | `#generated/controllers` barrel: `[controllers.Posts, 'index']` |

## HTTP types & helpers

| Avoid | Prefer |
|-------|--------|
| Importing `Request` / `Response` class names from `@adonisjs/core/http` (v7 rename) | `HttpRequest` / `HttpResponse` where docs say so; handlers use `HttpContext` |
| `getDirname()` / `getFilename()` from `@adonisjs/core/helpers` | `import.meta.dirname` / `import.meta.filename` |
| `cuid()` / `isCuid()` from core helpers | UUIDs (per upgrade guide) |
| `slash(...)` helper | `stringHelpers.toUnixSlash(...)` |

## Tooling

| Avoid | Prefer |
|-------|--------|
| `ts-node` / `ts-node-maintained` as JIT on v7 | `@poppinss/ts-exec` in `ace.js` |
| Assembler hooks `onBuildStarting`, `onDevServerStarted`, … | `buildStarting`, `devServerStarted`, `fileChanged`, `buildFinished`, … |
| `assetsBundler` in `adonisrc.ts` | Remove (unused in v7) |
| Test globs `*.spec(.ts|.js)` | `*.spec.{ts,js}` |

## Auth, session, flash

| Avoid | Prefer |
|-------|--------|
| Inventing Passport-style / JWT-first flows by default | Official Auth guards (session / access tokens / basic / custom) |
| Flash key `errors.*` after upgrade | `inputErrorsBag.*` (v7 flash change) |

## Encryption

| Avoid | Prefer |
|-------|--------|
| Relying only on `export const appKey` from `config/app.ts` for encryption | Dedicated `config/encryption.ts` + drivers (`legacy` when migrating) |

## Validation

| Avoid | Prefer |
|-------|--------|
| Model-layer-only validation as the primary gate | Controller-level VineJS + `request.validateUsing()` |
| Unnecessary try/catch around `validateUsing` | Let the global exception handler negotiate HTML/Inertia/JSON |

## Testing

| Avoid | Prefer |
|-------|--------|
| Jest / Vitest as the default Adonis stack | **Japa** + `@japa/plugin-adonisjs` |
| Mocking the HTTP stack when docs show API client tests | Real requests via Japa API client |

## Frontend / Inertia (if used)

| Avoid | Prefer |
|-------|--------|
| Old `config/inertia.ts` `entrypoint` / `sharedData` / nested `history.encrypt` | v7 Inertia middleware + `encryptHistory` per upgrade guide |
| `inertia/app/app.tsx` path assumptions from v6 | Flattened paths per upgrade guide |

## General agent mistakes

- Translating Laravel/Rails/Nest snippets literally without checking Adonis APIs.
- Using blog posts from 2022–2024 without verifying against current docs.
- Claiming an API exists because “frameworks usually have X”.
- Skipping Ace generators (`node ace make:*`) that keep barrels/indexes in sync.
- Loading giant scraped dumps into context instead of topic cheat-sheets + `--fetch`.
