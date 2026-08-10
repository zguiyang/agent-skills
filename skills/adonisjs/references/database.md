# Database — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/database/lucid`  
Deep API: https://lucid.adonisjs.com

## Official pages

- [Lucid ORM](https://docs.adonisjs.com/guides/database/lucid.md)
- [Redis](https://docs.adonisjs.com/guides/database/redis.md)

## Setup

```bash
node ace make:model Post -m
node ace migration:run
node ace make:factory Post
node ace db:seed
```

Config: `config/database.ts`.

## Preferred model workflow (schema-codegen)

Current AdonisJS docs/tutorials document migrations → generated `database/schema.ts` → models extend `*Schema`. Prefer that for new apps (tutorial tracks teach it; production Skills should still keep writes out of fat controllers — see Controllers DI / services).

1. Define columns in **migrations** (`up` / `down`).
2. Run migrations → auto-generate `database/schema.ts` (`PostSchema`, …). Use **generated** names; do not hardcode `Post` vs `Posts` guesses.
3. Model extends schema; add **relationships / business logic** only.
4. **Do not hand-edit** `database/schema.ts`.

```ts
import { PostSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Comment from '#models/comment'

export default class Post extends PostSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>
}
```

DB `snake_case` ↔ model `camelCase` is automatic.

### Auth User + schema-codegen

Official AuthFinder samples still show `BaseModel` + `@column`. For new v7 apps: `compose(UserSchema, AuthFinder)` — see [auth.md](auth.md). Do not mix schema-codegen with columns-on-model on the same class.

## Querying

```ts
const posts = await Post.query().preload('user').orderBy('createdAt', 'desc')
```

Query builder: `import db from '@adonisjs/lucid/services/db'` for complex SQL.

## Redis

```bash
node ace add @adonisjs/redis
```

## Notes

- Adonis Lucid page is overview-level; use lucid.adonisjs.com for advanced APIs.
- Older samples may show `BaseModel` + `@column`; prefer schema-codegen for new v7 apps unless the project already uses columns-on-model.
