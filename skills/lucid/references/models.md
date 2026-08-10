# Models & CRUD — Lucid

Cheat-sheet. Deep: `docs/models`, `docs/crud-operations`, `docs/model-query-builder`, `docs/model-hooks`, `docs/model-query-scopes`, `docs/serializing-models`.

## Schema vs model

- `*Schema` in `#database/schema` — generated columns (`@column`). Do not edit.
- Model in `app/models` — `class User extends UsersSchema` — relations, hooks, scopes, methods.

```bash
node ace make:model User --migration --factory
```

Conventions: table snake plural; PK `id`; snake→camel; FK `{model}_id`; timestamps `createdAt`/`updatedAt`. Override: `static table`, `primaryKey`, `connection`, `selfAssignPrimaryKey`.

## CRUD

| Intent | API |
| --- | --- |
| Create | `create`, `new` + `save`, `fill`/`merge` + `save` |
| Bulk create | `createMany` (per-row + hooks); huge imports → `db.table().multiInsert` |
| Read | `find`/`findOrFail`, `findBy*`, `findMany*`, `first*`, `all` |
| Update | mutate + `save` (dirty only); bulk `query().update` — **no hooks** |
| Delete | `delete()`; bulk `query().delete()` — no hooks |
| Upsert | `firstOrCreate`, `updateOrCreate`, `fetchOrCreateMany`, `updateOrCreateMany` |
| Skip hooks | `*Quietly` variants |

`fill` replaces attrs; `merge` patches. `findMany` order = PK desc, not input order. Missing `findOrFail` → `E_ROW_NOT_FOUND`.

## Model query builder

`Model.query()` = DB QB + `preload`/`preloadOnce`, `withCount`/`withAggregate`, `has`/`whereHas`, `withScopes`/`apply`, `pojo()`, `sideload`, `paginate` → `ModelPaginator`.

Preload = one extra query per relationship. Nested via callback. Prefer `preloadOnce` in shared helpers.

## Hooks

Decorators from `@adonisjs/lucid/orm`: `before/after` Save|Create|Update|Delete|Find|Fetch|Paginate.

Create order: `beforeCreate → beforeSave → INSERT → afterCreate → afterSave`.

`beforePaginate` gets `[countQuery, query]` — mutate both. Side effects after commit: `$trx.after('commit', …)`. Soft-delete: filter in `beforeFind` **and** `beforeFetch`.

## Scopes

```ts
static active = scope((query) => query.where('active', true))
// User.query().withScopes((s) => s.active())
```

## Serialization (transformers)

Recommended path: AdonisJS `BaseTransformer` (see also Adonis transformers guide). Lucid-specific patterns:

Relation names must match the model (`user` in the Skill vertical — official Lucid serializing docs may use `author` as an illustration).

```ts
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { HttpContext } from '@adonisjs/core/http'
import type Post from '#models/post'
import UserTransformer from '#transformers/user_transformer'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'createdAt']),
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}

// HTTP JSON (serialize from HttpContext helpers — see Adonis transformers / Lucid serializing docs)
async index({ serialize }: HttpContext) {
  const posts = await Post.query().preload('user')
  return serialize(PostTransformer.transform(posts))
}

// Paginate
const page = await Post.query().orderBy('id', 'desc').paginate(1, 20)
return serialize(PostTransformer.paginate(page.all(), page.getMeta()))
```

Rules:

- Transformers **do not query** — preload what you read; use `whenLoaded` for optional relations.
- Dates via `pick` → Luxon `DateTime.toJSON()` (ISO).
- Aggregates / pivots live on `$extras` (coerce counts with `Number`).
- Sync getters work with `pick`; async work belongs in async `toObject`.
- Inertia: pass transformer/paginator results to `inertia.render` without wrapping in `serialize`.

Deep: `docs/serializing-models`.
