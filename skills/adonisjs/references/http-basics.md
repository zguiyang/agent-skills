# HTTP basics — AdonisJS v7

Official section: https://docs.adonisjs.com/guides/basics/routing.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/basics/routing`

## Official pages

- [Routing](https://docs.adonisjs.com/guides/basics/routing.md)
- [Controllers](https://docs.adonisjs.com/guides/basics/controllers.md)
- [HTTP context](https://docs.adonisjs.com/guides/basics/http-context.md)
- [Middleware](https://docs.adonisjs.com/guides/basics/middleware.md)
- [Request](https://docs.adonisjs.com/guides/basics/request.md) · [Response](https://docs.adonisjs.com/guides/basics/response.md)
- [Body parser](https://docs.adonisjs.com/guides/basics/body-parser.md)
- [Validation](https://docs.adonisjs.com/guides/basics/validation.md)
- [File uploads](https://docs.adonisjs.com/guides/basics/file-uploads.md)
- [Session](https://docs.adonisjs.com/guides/basics/session.md)
- [URL builder](https://docs.adonisjs.com/guides/basics/url-builder.md)
- [Exception handling](https://docs.adonisjs.com/guides/basics/exception-handling.md)
- [Debugging](https://docs.adonisjs.com/guides/basics/debugging.md)
- [Static files](https://docs.adonisjs.com/guides/basics/static-file-server.md)

## Routing

```ts
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router.get('/', [controllers.Home, 'index'])
router.get('/posts/:id', [controllers.Posts, 'show']).as('posts.show')
router.resource('posts', controllers.Posts)
router
  .group(() => {
    router.get('/me', [controllers.Profile, 'show'])
  })
  .use(middleware.auth())
```

```bash
node ace make:controller posts
node ace list:routes
```

## Controllers

```ts
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    return response.ok({ page })
  }
}
```

Prefer `#generated/controllers` barrels over walls of `() => import('#controllers/...')` on v7.

## Validation (VineJS)

```bash
node ace make:validator post
```

```ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3),
    body: vine.string().trim(),
  })
)

// controller
const payload = await request.validateUsing(createPostValidator)
```

Do **not** wrap `validateUsing` in try/catch unless you need custom handling — the exception handler negotiates HTML / Inertia / JSON.

## URL builder

```ts
import { urlFor } from '@adonisjs/core/services/url_builder'

urlFor('posts.show', { id: 1 })
```

**Not** `router.makeUrl` (v6 / removed).

## Middleware

```bash
node ace make:middleware log_request
```

Register in `start/kernel.ts` (server / named / router). Access auth via `ctx.auth` after auth middleware.

## Session / flash

```ts
session.put('key', value)
session.flash('success', 'Saved')
// After v7 upgrade, input errors use inputErrorsBag.* (see upgrade guide)
```

## Uploads

```ts
const image = request.file('image', { size: '2mb', extnames: ['jpg', 'png'] })
if (!image?.isValid) {
  return response.badRequest(image?.errors)
}
await image.move(app.makePath('storage/uploads'))
```

## Exceptions

Use framework errors (`errors.E_ROUTE_NOT_FOUND`, Lucid `E_ROW_NOT_FOUND`, etc.) and the global handler in `app/exceptions/handler.ts`.
