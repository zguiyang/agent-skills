---
name: adonisjs
description: >-
  Develop AdonisJS v7 apps using official docs conventions only. Activates when
  working with AdonisJS, Adonis, Lucid ORM, VineJS validation, Edge templates,
  Inertia on Adonis, Ace CLI, Japa tests in an Adonis project, writing controllers
  routes middleware auth sessions, or upgrading Adonis v6 to v7. Prevents outdated
  v5/v6 APIs and inventing non-existent helpers. Use for scaffolding features,
  fixing bugs, writing tests, and looking up official AdonisJS APIs.
license: MIT
activation: /adonisjs
metadata:
  author: agent-skill-creator
  version: 1.0.0
  framework: AdonisJS
  framework_version: "7"
  docs_base: https://docs.adonisjs.com
  docs_pages_indexed: "103"
  created: 2026-08-07
  last_reviewed: 2026-08-07
  review_interval_days: 60
  dependencies:
    - name: AdonisJS Official Docs (v7)
      url: https://docs.adonisjs.com
    - name: AdonisJS Legacy Docs (v6)
      url: https://v6-docs.adonisjs.com
    - name: Jina Reader (optional live doc fetch)
      url: https://r.jina.ai
    - name: Lucid ORM docs
      url: https://lucid.adonisjs.com
    - name: VineJS docs
      url: https://vinejs.dev
    - name: Japa docs
      url: https://japa.dev
---

# /adonisjs

Build and modify **AdonisJS v7** applications strictly according to the official
documentation at https://docs.adonisjs.com. This skill indexes the full public
docs sitemap (103 pages) and ships condensed topic references plus a live docs
lookup script.

## Pinned version (mandatory)

| Item | Value |
|------|--------|
| **Framework** | AdonisJS **v7** |
| **Docs** | https://docs.adonisjs.com |
| **Legacy v6 docs** | https://v6-docs.adonisjs.com (read-only during upgrades) |
| **Node.js** | **≥ 24** for v7 |
| **Language** | TypeScript + **ESM** |

Before writing code, detect the project version:

```bash
python3 scripts/detect_version.py
# or inspect package.json: @adonisjs/core major version
```

- If the project is **v7** (or new): follow this skill and docs.adonisjs.com.
- If the project is **v6**: say so explicitly, prefer v6-docs.adonisjs.com, and
  do **not** apply v7-only APIs (barrel `#generated/*`, `urlFor`, new hooks, etc.)
  unless the user asked to upgrade — then follow `references/upgrade-v6-to-v7.md`
  and https://docs.adonisjs.com/v6-to-v7.
- If version is unclear: ask once, default to **v7 + official docs**.

## Non-negotiable rules

1. **Do not invent APIs.** Only use APIs/methods shown in official docs, this
   skill’s references, or the live page returned by `lookup_docs.py`.
2. **Do not use outdated patterns** from Adonis v5 / blog posts / memory when
   they conflict with v7 docs. See `references/anti-patterns.md`.
3. **Prefer official examples.** Match import paths, folder layout, Ace commands,
   and naming (`snake_case` files like `posts_controller.ts`).
4. **When unsure → look it up**, then code:
   ```bash
   python3 scripts/lookup_docs.py routing
   python3 scripts/lookup_docs.py --fetch validation
   python3 scripts/lookup_docs.py https://docs.adonisjs.com/guides/testing/api-tests
   ```
5. **Cite the docs URL** in your reply when introducing a non-obvious API.
6. **Tests use Japa** (`@japa/runner`, `@japa/plugin-adonisjs`), not Jest/Vitest
   unless the project already did otherwise (still warn).

## Activation

Use for: AdonisJS feature work, controllers/routes/middleware, Lucid, Auth,
VineJS, Edge/Inertia, Ace commands, Japa tests, deployment/config, v6→v7 upgrade.

Do **not** treat generic Node/Express advice as Adonis defaults.

## How to work (agent loop)

```
1. detect_version.py  → pin v6 vs v7
2. Map task → topic in references/docs-index.md
3. Read the matching references/<section>.md (and fetch live if thin/stale)
4. Implement using official patterns + Ace generators when available
5. Add/adjust tests per references/testing.md
6. Cite docs links for non-trivial choices
```

### Topic → reference map

| Task | Read first | Docs |
|------|------------|------|
| New app / kit / folders | `getting-started.md` | /installation, /stacks-and-starter-kits, /folder-structure |
| Routes, HTTP, validation, uploads | `http-basics.md` | /guides/basics/* |
| Edge, Inertia, Vite, Tuyau | `frontend.md` | /guides/frontend/* |
| Lucid, Redis | `database.md` | /guides/database/* |
| Auth / Bouncer | `auth.md` | /guides/auth/* |
| Hash, encrypt, CORS, rate limit | `security.md` | /guides/security/* |
| Providers, DI, barrels, scaffolding | `concepts.md` | /guides/concepts/* |
| Cache, Drive, Mail, Queues, OTel… | `digging-deeper.md` | /guides/digging-deeper/* |
| Ace CLI / REPL | `ace-cli.md` | /guides/ace/* |
| Writing & wiring tests | `testing.md` | /guides/testing/* |
| API / helpers reference | `reference.md` | /reference/* |
| Hands-on walkthrough | `tutorial.md` | /tutorial/* |
| Upgrade | `upgrade-v6-to-v7.md` | /v6-to-v7 |
| Full URL catalog | `docs-index.md` | sitemap (103 pages) |

## v7 conventions cheat-sheet

- Routes live in `start/routes.ts`; import `router` from `@adonisjs/core/services/router`.
- Prefer controllers via barrel: `import { controllers } from '#generated/controllers'` then
  `router.get('/posts', [controllers.Posts, 'index'])`.
- Generate with Ace: `node ace make:controller posts`, `make:validator`, `make:middleware`,
  `make:model`, `make:test`, etc.
- Validation: VineJS + `request.validateUsing(validator)` — do **not** wrap in try/catch
  unless custom handling is required (global exception handler + content negotiation).
- Dev server: `node ace serve --hmr` (or kit’s `npm run dev`).
- List routes: `node ace list:routes`.
- URL generation: `urlFor` from `@adonisjs/core/services/url_builder` — **not**
  `router.makeUrl` (removed/deprecated in v7).
- Subpath imports: `#controllers/*`, `#models/*`, `#validators/*`, `#generated/*`, etc.
- Starter kits (v7): opinionated; Lucid + Auth included; kits include Hypermedia, API,
  React, Vue (see stacks docs).

## Testing (must follow docs)

- Framework: **Japa** with `@japa/plugin-adonisjs`.
- Suites configured in `adonisrc.ts`; plugins in `tests/bootstrap.ts`.
- Create: `node ace make:test posts/index --suite=unit` (or `browser` / functional).
- Run: `node ace test` (filter by suite/file/tags per docs).
- API tests: Japa API client + `client.visit('route.name')` / `.json()`; auth via
  `authApiClient`; sessions via `sessionApiClient`; `.env.test` often uses
  `SESSION_DRIVER=memory`.
- DB isolation: `testUtils.db().truncate()` (or migrate/seed helpers) in group hooks.
- Details: `references/testing.md` + https://docs.adonisjs.com/guides/testing/introduction

## When information is missing

1. Search `references/docs-index.md` for the slug.
2. Run `python3 scripts/lookup_docs.py --fetch <topic>` to pull the latest page.
3. If still missing (package-specific Lucid deep dive, VineJS core, etc.), open the
   linked ecosystem docs (e.g. https://lucid.adonisjs.com, https://vinejs.dev) and
   state that you consulted them.
4. Never fill gaps with Express/Nest/Laravel-translated guesses without labeling them
   as **non-Adonis** suggestions.

## Anti-goals

- Do not scaffold Express-style `app.get` apps inside Adonis.
- Do not recommend `ts-node` as the v7 JIT (v7 uses `@poppinss/ts-exec`).
- Do not use v6 lazy `() => import('#controllers/...')` walls when `#generated/controllers`
  barrels are available on v7.
- Do not claim coverage of private/unpublished APIs.

## Scripts

```bash
python3 scripts/detect_version.py [--path /path/to/project]
python3 scripts/lookup_docs.py <query>           # resolve topic → official URL + local excerpt
python3 scripts/lookup_docs.py --fetch <query>   # also download latest page text
python3 scripts/run_evals.py --validate
```
