---
name: adonisjs
description: >-
  Develop AdonisJS v7 apps using official docs conventions only. Use when working
  with AdonisJS, Adonis, Lucid ORM, VineJS, Edge, Inertia on Adonis, Ace CLI, Japa
  tests, controllers, routes, middleware, auth, sessions, or upgrading Adonis v6
  to v7. Prevents outdated v5/v6 APIs and invented helpers.
---

# AdonisJS (v7)

Build and modify **AdonisJS v7** apps per https://docs.adonisjs.com only.
Do not invent APIs or copy Express/Nest/Laravel patterns without labeling them as non-Adonis.

## Pinned version

| Item | Value |
|------|--------|
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
3. Read the matching references/*.md (short cheat-sheet)
4. If thin/stale: lookup_docs.py --fetch <slug>
5. Implement with Ace make:* + official patterns
6. Add/adjust Japa tests; cite docs for non-trivial choices
```

## Topic → reference map

| Task | Read first | Official docs |
|------|------------|---------------|
| New app / kits / folders | [getting-started.md](references/getting-started.md) | `/installation.md`, `/stacks-and-starter-kits.md` |
| Routes, HTTP, VineJS, uploads | [http-basics.md](references/http-basics.md) | `/guides/basics/*` |
| Edge, Inertia, Vite, Tuyau | [frontend.md](references/frontend.md) | `/guides/frontend/*` |
| Lucid, Redis | [database.md](references/database.md) | `/guides/database/*` |
| Auth / Bouncer | [auth.md](references/auth.md) | `/guides/auth/*` |
| Hash, encrypt, CORS, limiter | [security.md](references/security.md) | `/guides/security/*` |
| DI, providers, barrels, codemods | [concepts.md](references/concepts.md) | `/guides/concepts/*` |
| Cache, Drive, Mail, Queues… | [digging-deeper.md](references/digging-deeper.md) | `/guides/digging-deeper/*` |
| Ace CLI / REPL | [ace-cli.md](references/ace-cli.md) | `/guides/ace/*` |
| Japa tests | [testing.md](references/testing.md) | `/guides/testing/*` |
| API / helpers reference | [reference.md](references/reference.md) | `/reference/*` |
| Hands-on tutorial | [tutorial.md](references/tutorial.md) | `/tutorial/*` |
| Full URL catalog | [docs-index.md](references/docs-index.md) | [llms.md](references/llms.md) |
| Avoid outdated APIs | [anti-patterns.md](references/anti-patterns.md) | — |

Official pages also expose Markdown: append `.md` to any docs URL (e.g. `…/guides/basics/routing.md`).

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
    // …
    return response.redirect().toRoute('posts.index')
  }
}
```

- URLs: `urlFor` from `@adonisjs/core/services/url_builder` — **not** `router.makeUrl`.
- Subpaths: `#controllers/*`, `#models/*`, `#validators/*`, `#generated/*`.
- Validation errors: let the global exception handler negotiate HTML / Inertia / JSON — avoid unnecessary try/catch around `validateUsing`.

## Anti-goals

- No Express-style `app.get` apps inside Adonis.
- No `ts-node` as v7 JIT (use `@poppinss/ts-exec`).
- No v6 lazy `() => import('#controllers/...')` walls when `#generated/controllers` exists.
- No inventing Passport/JWT “because APIs usually have it” — use official guards (session / access tokens / basic / custom).
- Do not load entire doc dumps into context; use the topic map + `--fetch`.
