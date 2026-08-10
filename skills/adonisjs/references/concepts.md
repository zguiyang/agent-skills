# Concepts — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/concepts/dependency-injection`

## Lifecycle

Boot → Start (`start`/`ready`, preloads) → Termination (`shutdown`, reverse order in v7)

## IoC / services (recommended layering)

SSOT: [Controllers — Dependency injection](https://docs.adonisjs.com/guides/basics/controllers.md#dependency-injection) · [Dependency injection guide](https://docs.adonisjs.com/guides/concepts/dependency-injection.md) · Ace `make:service`

```bash
node ace make:service post   # → app/services/post_service.ts (PostService)
```

Ace: a service has no fixed framework meaning — use it to **extract application business logic** for reuse.

```ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PostService from '#services/post_service'

@inject()
export default class PostsController {
  constructor(protected posts: PostService) {}

  async store({ request }: HttpContext) {
    // validate → this.posts.create(...)
  }
}
```

- Class `@inject()` + constructor: when most actions need the same deps
- Method `@inject()`: first arg stays `HttpContext`, then type-hinted services
- Framework container services: `@adonisjs/.../services/...`
- Swaps for tests via the container
- **Never** `new PostService()` in controllers

Vertical: [../examples/crud-resource.md](../examples/crud-resource.md)

## Providers & preloads

- Providers: register bindings / lifecycle hooks
- Preloads: simpler start-phase wiring (`make:preload`)

## Assembler / hooks

v7 `adonisrc.ts` `hooks.init` should include `indexEntities()`; add Inertia/Tuyau/Bouncer/Vite hooks as needed. Renames: `onBuildStarting` → `buildStarting`, etc. See upgrade guide.

## Extending

Macros/getters on framework classes; prefer official extension guides over monkey-patching.
