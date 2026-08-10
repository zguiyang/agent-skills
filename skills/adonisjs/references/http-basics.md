# HTTP basics — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/basics/routing`

## Official pages

Routing · Controllers · HTTP context · Middleware · Request/Response · Body parser · Validation · Uploads · Session · URL builder · Exception handling · Debugging · Static files  
(see docs-index / guides/basics)

## Routing

```ts
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router.get('/posts/:id', [controllers.Posts, 'show']).as('posts.show')
router.resource('posts', controllers.Posts)
router.group(() => {
  router.post('/logout', [controllers.Session, 'destroy'])
}).use(middleware.auth())
```

```bash
node ace make:controller posts
node ace make:service post
node ace list:routes
```

Keep `node ace serve --hmr` running so `#generated/controllers` regenerates.

Controllers: validate / authorize / call **injected** services / return — see [concepts.md](concepts.md) and Controllers DI. Do not elevate tutorial fat-controller stubs to production.

## Middleware stacks

| Stack | When | Examples |
| --- | --- | --- |
| Server | Every request | CORS, logging, Inertia share |
| Router | Matched routes | body parsing |
| Named | Opt-in | auth, guest, rate limits |

## Validation (Vine)

```bash
node ace make:validator post
```

```ts
const payload = await request.validateUsing(createPostValidator)
```

Validate at controller; then trust payload. Lucid rules: `unique` / `exists` when needed.

## URLs (v7)

```ts
import { urlFor } from '@adonisjs/core/services/url_builder'
urlFor('posts.show', { id: 1 })
```

Not `router.makeUrl`. Flash validation: `inputErrorsBag` (not deprecated `errors`).

## Exceptions

Throw; `app/exceptions/handler.ts` `handle` vs `report`. Status pages skipped for JSON Accept (v7).
