# Example: Posts resource (production layering)

End-to-end slice using official **recommended** structure: Ace generators → Vine validate → injected Service → response (redirect / transformer).  
**Not** the tutorial fat-controller stub (`Post.create` inside the action).

Sources (SSOT):

- https://docs.adonisjs.com/guides/basics/controllers.md#dependency-injection
- https://docs.adonisjs.com/guides/concepts/dependency-injection.md
- Ace `make:service` (services extract app business logic → `app/services/*_service.ts`)
- Transformers (Inertia): https://docs.adonisjs.com/guides/frontend/transformers.md (when kit uses Inertia)

Tutorial get-started only: `/tutorial/*` — do not copy its inline Lucid writes as production defaults.

## 1. Model + migration

```bash
node ace make:model Post -m
# edit migration columns (title, url, summary, user_id, …)
node ace migration:run
```

Add FK migration if needed; on the model extend generated schema and declare `@belongsTo(() => User)` / `@hasMany` as required.

## 2. Validator

```bash
node ace make:validator post
```

```ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})
```

## 3. Service (business logic)

```bash
node ace make:service post
```

```ts
// app/services/post_service.ts
import Post from '#models/post'
import User from '#models/user'

export default class PostService {
  async createForUser(user: User, payload: { title: string; url: string; summary: string }) {
    return Post.create({ ...payload, userId: user.id })
  }

  async listNewest() {
    return Post.query().preload('user').orderBy('createdAt', 'desc')
  }
}
```

## 4. Controller + DI + routes

```bash
node ace make:controller posts   # keep ace serve --hmr running
```

```ts
// app/controllers/posts_controller.ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { createPostValidator } from '#validators/post'
import PostService from '#services/post_service'

@inject()
export default class PostsController {
  constructor(protected posts: PostService) {}

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    await this.posts.createForUser(auth.getUserOrFail(), payload)
    return response.redirect().toRoute('posts.index')
  }

  async index({ view }: HttpContext) {
    const posts = await this.posts.listNewest()
    return view.render('posts/index', { posts })
  }
}
```

```ts
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router
  .resource('posts', controllers.Posts)
  .use(['store', 'update', 'destroy'], middleware.auth())
```

Protect mutating routes with `middleware.auth()`. Login path: `User.verifyCredentials` → `auth.use('web').login(user)` (see [auth.md](../references/auth.md)).

**Avoid:** `new PostService()` in the controller — use `@inject()` so the container resolves it.

## 5. List / shape (stack-specific)

- Hypermedia: `view.render('posts/index', { posts })` as above
- Inertia: `node ace make:transformer post` → transform after service load, then `inertia.render(...)` (permission flags via `allows` → `can.*`; never import policies into React)
- API: return transformer / `serialize` output — not raw ORM models as the default contract

## 6. Authorization

```bash
node ace add @adonisjs/bouncer
node ace make:policy post
```

```ts
await bouncer.with(PostPolicy).authorize('edit', post)
```

Authorize in the controller (or a dedicated policy-aware service method) before mutating. Edge: `@can('PostPolicy.edit', post)`.

## 7. URLs

```ts
import { urlFor } from '@adonisjs/core/services/url_builder'
urlFor('posts.show', { id: post.id })
```

## Rules reinforced

1. Validate at controller → trust payload → call **injected** service.
2. Lucid writes / queries live in the service (or model methods), not fat controller bodies.
3. Filenames match Ace: `posts_controller.ts`, `post_service.ts`, `post_transformer.ts`.
4. Use `urlFor`; authorize mutating actions with Bouncer.
