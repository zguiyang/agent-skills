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
export const PostFactory = Factory.define(Post, ({ faker }) => ({
  title: faker.lorem.sentence(),
})).build()
```

| Mode | Behavior |
| --- | --- |
| `create` / `createMany` | Persist |
| `make` / `makeMany` | In-memory, no DB |
| `makeStubbed*` | Fake PK |

Also: `.state` + `.apply`, `.relation` + `.with`, `.merge` / `.mergeRecursive`, `.connection()` / `.client()`, hooks `before/after('create'|'makeStubbed')`.
