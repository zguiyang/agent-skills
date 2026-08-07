# Example: Posts resource (Lucid vertical)

End-to-end slice: migration → schema → model with relations/hooks → factory → query. Aligns with Ace generators.

## 1. Scaffold

```bash
node ace make:model Post --migration --factory
node ace make:model User --migration   # if needed for belongsTo
```

## 2. Migration

`database/migrations/*_create_posts_table.ts`:

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('status').notNullable().defaultTo('draft')
      table.text('body').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```bash
node ace migration:run
# regenerates database/schema.ts → PostsSchema
```

## 3. Model (behavior only)

`app/models/post.ts`:

```ts
import { belongsTo, hasMany, beforeSave, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { PostsSchema } from '#database/schema'
import User from '#models/user'
import Comment from '#models/comment'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

type PostBuilder = ModelQueryBuilderContract<typeof Post>

export default class Post extends PostsSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  static published = scope((query: PostBuilder) => {
    query.where('status', 'published')
  })

  @beforeSave()
  static async normalizeTitle(post: Post) {
    if (post.$dirty.title) {
      post.title = post.title.trim()
    }
  }

  publish() {
    this.status = 'published'
  }
}
```

## 4. Factory

`database/factories/post_factory.ts`:

```ts
import { Factory } from '@adonisjs/lucid/factories'
import Post from '#models/post'

export const PostFactory = Factory.define(Post, ({ faker }) => ({
  title: faker.lorem.sentence(),
  status: 'draft',
  body: faker.lorem.paragraphs(2),
}))
  .state('published', (post) => {
    post.status = 'published'
  })
  .build()
```

## 5. Query + preload + paginate

```ts
import Post from '#models/post'
import db from '@adonisjs/lucid/services/db'

const page = await Post.query()
  .withScopes((s) => s.published())
  .preload('user')
  .preload('comments', (q) => q.groupLimit(3).groupOrderBy('id', 'desc'))
  .orderBy('id', 'desc')
  .paginate(1, 20)

// Multi-write with managed transaction
await db.transaction(async (trx) => {
  const post = await Post.create(
    { title: 'Hello', userId: 1, status: 'draft' },
    { client: trx }
  )
  post.publish()
  await post.useTransaction(trx).save()
})
```

## 6. Test sketch

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { PostFactory } from '#database/factories/post_factory'

test.group('Post', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('creates published post via factory state', async ({ assert }) => {
    const post = await PostFactory.apply('published').create()
    assert.equal(post.status, 'published')
  })
})
```

## Rules reinforced

- Do not edit `PostsSchema` columns by hand.
- `groupLimit` for per-parent comment caps.
- `orderBy` before `paginate`.
- Pass `trx` across create/save.
