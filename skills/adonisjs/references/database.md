# Database — AdonisJS v7

Official overview: https://docs.adonisjs.com/guides/database/lucid.md  
Deep API: https://lucid.adonisjs.com  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/database/lucid`

## Official pages

- [Lucid ORM](https://docs.adonisjs.com/guides/database/lucid.md)
- [Redis](https://docs.adonisjs.com/guides/database/redis.md)

## Setup

```bash
node ace configure @adonisjs/lucid   # usually preconfigured in kits
node ace make:model post -m          # model + migration
node ace make:migration alter_posts
node ace migration:run
node ace db:seed
```

Config: `config/database.ts`. Default kit DB is often SQLite (`tmp/db.sqlite`).

## Query builder

```ts
import db from '@adonisjs/lucid/services/db'

const posts = await db
  .from('posts')
  .where('status', 'published')
  .orderBy('created_at', 'desc')
```

## Models

```ts
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Comment from '#models/comment'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>
}

const post = await Post.create({ title: 'Hello' })
const found = await Post.findOrFail(1)
await post.merge({ title: 'Hi' }).save()
```

## Relationships / preload

```ts
const posts = await Post.query().preload('comments').paginate(page, 20)
```

## Transactions

```ts
await db.transaction(async (trx) => {
  const post = await Post.create({ title: 'x' }, { client: trx })
  await post.related('comments').create({ body: '…' })
})
```

## Redis

```bash
node ace add @adonisjs/redis
```

See https://docs.adonisjs.com/guides/database/redis.md for connection + client usage.

## Notes

- Lucid overview in Adonis docs is high-level; use lucid.adonisjs.com for advanced query/relationship APIs.
- Prefer Ace generators so barrels and naming stay consistent.
