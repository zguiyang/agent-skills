---
name: adonisjs
description: >-
  Develop AdonisJS v7 apps using official docs conventions only. Use when working
  with AdonisJS, Adonis, Lucid ORM, VineJS, Edge, Inertia on Adonis, Ace CLI, Japa
  tests, controllers, routes, middleware, auth, Bouncer, queues, or upgrading
  Adonis v6 to v7. Prevents outdated v5/v6 APIs and invented helpers.
---

# AdonisJS (v7)

Build and modify **AdonisJS v7** apps per https://docs.adonisjs.com only.
Do not invent APIs or copy Express/Nest/Laravel patterns without labeling them as non-Adonis.

## Pinned version

| Item | Value |
| --- | --- |
| Framework | **AdonisJS v7** |
| Docs | https://docs.adonisjs.com |
| Legacy v6 | https://v6-docs.adonisjs.com |
| Node.js | **≥ 24** |
| Module system | TypeScript + **ESM** |

```bash
python3 scripts/detect_version.py
# or: package.json → @adonisjs/core major
```

- **v7 / new app** → this skill + docs.adonisjs.com
- **v6** → v6-docs only; do not apply v7-only APIs unless upgrading
- **Upgrade** → [upgrade-v6-to-v7.md](references/upgrade-v6-to-v7.md) + https://docs.adonisjs.com/v6-to-v7.md
- **Unclear** → ask once; default to v7

## Non-negotiable rules

1. Only use APIs from official docs, this skill’s references, or `lookup_docs.py --fetch`.
2. Read [anti-patterns.md](references/anti-patterns.md) before suggesting older APIs.
3. Match official import paths, `snake_case` filenames (`posts_controller.ts`), and Ace generators.
4. When unsure → look up, then code:
   ```bash
   python3 scripts/lookup_docs.py routing
   python3 scripts/lookup_docs.py --fetch validation
   python3 scripts/lookup_docs.py --fetch guides/testing/api-tests
   ```
5. Cite the docs URL for non-obvious APIs.
6. Tests use **Japa** (`@japa/plugin-adonisjs`), not Jest/Vitest, unless the project already does otherwise (warn if so).

## Agent loop

```
1. detect_version.py → pin v6 vs v7
2. Map task → topic table below
3. Read the matching references/*.md (short cheat-sheet + distilled rules)
4. If thin/stale: lookup_docs.py --fetch <slug>
5. Implement with Ace make:* / ace add + official patterns
6. Add/adjust Japa tests; cite docs for non-trivial choices
```

## Topic → reference map

| Task | Read first | Official docs |
| --- | --- | --- |
| New app / kits / folders | [getting-started.md](references/getting-started.md) | `/installation.md`, `/stacks-and-starter-kits.md` |
| Routes, HTTP, VineJS, uploads | [http-basics.md](references/http-basics.md) | `/guides/basics/*` |
| Edge, Inertia, Vite, Tuyau | [frontend.md](references/frontend.md) | `/guides/frontend/*` |
| Stack deltas (Hypermedia vs Inertia) | [stacks.md](references/stacks.md) | tutorials + frontend guides |
| Lucid, Redis | [database.md](references/database.md) | `/guides/database/*` |
| Auth / Bouncer | [auth.md](references/auth.md) | `/guides/auth/*` |
| Hash, encrypt, CORS, limiter | [security.md](references/security.md) | `/guides/security/*` |
| DI, providers, barrels, hooks | [concepts.md](references/concepts.md) | `/guides/concepts/*` |
| Cache, Drive, Mail, Queues… | [digging-deeper.md](references/digging-deeper.md) | `/guides/digging-deeper/*` |
| Ace CLI / REPL | [ace-cli.md](references/ace-cli.md) | `/guides/ace/*` |
| Japa tests | [testing.md](references/testing.md) | `/guides/testing/*` |
| API / helpers reference | [reference.md](references/reference.md) | `/reference/*` |
| Hands-on / CRUD vertical | [tutorial.md](references/tutorial.md), [examples/crud-resource.md](examples/crud-resource.md) | `/tutorial/*` |
| Full URL catalog | [docs-index.md](references/docs-index.md) | `llms.txt` |
| Avoid outdated APIs | [anti-patterns.md](references/anti-patterns.md) | — |

Official pages also expose Markdown: append `.md` to any docs URL.

## Hard conventions (distilled)

1. Prefer controllers + `#generated/controllers` over fat route closures; keep HMR server on when scaffolding.
2. Validate at controller with Vine (`request.validateUsing`); then trust the payload.
3. Auth ≠ authorization: guards authenticate; **Bouncer** authorizes (`authorize` on server always).
4. Lucid: columns in **migrations**; models extend generated `*Schema`; add relations on the model; `preload` before reading relations. Do not hand-edit `database/schema.ts`.
5. URLs: `urlFor` — **not** `router.makeUrl` / deprecated Edge `route`.
6. Inertia: transformers for props; permission flags via `allows` → `can.*`; **never** import policies into React.
7. Pick stack early (Hypermedia / Inertia / API); same backend, different returns — see [stacks.md](references/stacks.md).
8. Deep Lucid/Queues APIs: integration only here → `--fetch` official guide (Queues package is **experimental** — pin version).

## v7 conventions (quick)

```bash
npm create adonisjs@latest my-app          # kits: hypermedia | react | vue | api
node ace serve --hmr                       # API kit: npm run dev from monorepo root
node ace list:routes
node ace make:controller posts
node ace make:validator post
node ace make:model post -m
node ace test
```

```ts
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])
router.resource('posts', controllers.Posts)
```

```ts
import type { HttpContext } from '@adonisjs/core/http'
import { createPostValidator } from '#validators/post'

export default class PostsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    return response.redirect().toRoute('posts.index')
  }
}
```

- Subpaths: `#controllers/*`, `#models/*`, `#validators/*`, `#generated/*`, `#transformers/*`
- Validation errors: global exception handler negotiates HTML / Inertia / JSON; after v7 use `inputErrorsBag` not flash `errors`

## Anti-goals

Defer the full avoid/prefer table to [anti-patterns.md](references/anti-patterns.md). In short: no Express-in-Adonis, no invented JWT/Passport, no doc-dumping whole guides into context — use the topic map + `--fetch`.
