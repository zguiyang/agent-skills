# Example: CRUD resource (DevShow-style)

Build a user-owned `Post` resource. Adapt the view layer to the project stack.

## 1. Model + migration

```bash
node ace make:model Post -m
# edit migration columns
node ace migration:run
```

Add FK migration; on the model extend generated schema and declare `@belongsTo` / `@hasMany`.

## 2. Validator

```bash
node ace make:validator post
```

```ts
export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})
```

## 3. Controller + routes

```bash
node ace make:controller posts   # keep ace serve --hmr running
```

```ts
async store({ request, response, auth }: HttpContext) {
  const payload = await request.validateUsing(createPostValidator)
  await Post.create({ ...payload, userId: auth.user!.id })
  return response.redirect().toRoute('posts.index')
}
```

Protect mutating routes with `middleware.auth()`. Login path: `User.verifyCredentials` → `auth.use('web').login(user)` (see [auth.md](../references/auth.md)).

## 4. List

```ts
const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
```

- Hypermedia: `view.render('posts/index', { posts })`
- Inertia: `PostTransformer.transform(posts)` then `inertia.render(...)`

## 5. Authorization

```bash
node ace add @adonisjs/bouncer
node ace make:policy post
```

```ts
await bouncer.with(PostPolicy).authorize('edit', post)
```

- Edge: `@can('PostPolicy.edit', post)`
- Inertia: expose `can.edit` via transformer `allows`; still authorize in controller

## 6. URLs

```ts
import { urlFor } from '@adonisjs/core/services/url_builder'
urlFor('posts.show', { id: post.id })
```
