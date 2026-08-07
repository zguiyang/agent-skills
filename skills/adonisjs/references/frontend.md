# Frontend — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/frontend/inertia`  
Transformers: `python3 scripts/lookup_docs.py --fetch guides/frontend/transformers`

## Official pages

EdgeJS · Inertia · Transformers · Tuyau API client · TanStack Query · Vite

## Same controller, three returns

```ts
return view.render('posts/index', { posts })           // Hypermedia
return inertia.render('posts/index', { posts: ... }) // Inertia
return response.json(...)                              // API
```

## Transformers (Inertia / API)

```bash
node ace make:transformer post
```

```ts
import { BaseTransformer } from '@adonisjs/core/transformers'
import type Post from '#models/post'
import UserTransformer from '#transformers/user_transformer'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'url', 'summary', 'createdAt']),
      author: UserTransformer.transform(this.resource.user),
      // permissions: can.edit via bouncer.allows in a variant / inject — never import policies into React
    }
  }
}
```

Prefer transformers over raw Lucid models as props. For `can.*` flags, compute with `allows` on the server (see tutorial authorization + [auth.md](auth.md)).

## Inertia v7 notes

- Shared props → Inertia **server middleware** (`share`), not config `sharedData`
- Entrypoints under `inertia/app.tsx` (not `inertia/app/app.tsx`)
- `tsconfig.inertia.json` project references for codegen cycles
- Typed `inertia.render` — fix props rather than bypassing

Stack comparison: [stacks.md](stacks.md).
