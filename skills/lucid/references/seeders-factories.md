# Seeders & factories — Lucid

Cheat-sheet. Deep: `docs/seeders`, `docs/model-factories`.

## Seeders

```bash
node ace make:seeder User
node ace db:seed          # --files, -i, --connection
```

- Extends `BaseSeeder`, `async run()`
- **Not tracked** — re-runs always → idempotent upserts for reference data
- `static environment = ['development','test']` to gate fixtures
- Multi-DB: pass `{ client: this.client }` to model APIs
- Order: numbered filenames or main seeder + `seeders.paths`

## Factories

```bash
node ace make:factory Post
```

```ts
import { Factory } from '@adonisjs/lucid/factories'
import Post from '#models/post'
import { UserFactory } from '#database/factories/user_factory'

export const PostFactory = Factory.define(Post, ({ faker }) => ({
  title: faker.lorem.sentence(),
  status: 'draft',
}))
  .relation('user', () => UserFactory)
  .build()

// Satisfy required FKs when creating a child:
await PostFactory.with('user').create()
```

| Mode | Behavior |
| --- | --- |
| `create` / `createMany` | Persist |
| `make` / `makeMany` | In-memory, no DB |
| `makeStubbed*` | Fake PK |

Also: `.state` + `.apply`, `.relation` + `.with`, `.merge` / `.mergeRecursive`, `.connection()` / `.client()`, hooks `before/after('create'|'makeStubbed')`.
