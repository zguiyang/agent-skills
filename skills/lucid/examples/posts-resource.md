# Example: Posts resource (Lucid vertical)

End-to-end slice: migration → schema → model with relations/hooks → factory → query. Aligns with Ace generators and official Lucid docs.

Sources:

- https://lucid.adonisjs.com/docs/schema-generation
- https://lucid.adonisjs.com/docs/models
- https://lucid.adonisjs.com/docs/model-hooks
- https://lucid.adonisjs.com/docs/has-many (`groupLimit`)
- https://lucid.adonisjs.com/docs/model-factories
- https://lucid.adonisjs.com/docs/transactions
- https://lucid.adonisjs.com/docs/pagination

## 1. Scaffold

```bash
node ace make:model User --migration --factory
node ace make:model Post --migration --factory
node ace make:model Comment --migration
```

## 2. Migrations

`database/migrations/*_create_users_table.ts` (create first):

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

`database/migrations/*_create_posts_table.ts` (after users table exists):

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

`database/migrations/*_create_comments_table.ts`:

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE')
      table.text('body').notNullable()
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
# regenerates database/schema.ts → UsersSchema, PostsSchema, CommentsSchema
```

## 3. Models (behavior only)

`app/models/user.ts` (minimal — columns come from `UsersSchema`):

```ts
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { UsersSchema } from '#database/schema'
import Post from '#models/post'

export default class User extends UsersSchema {
  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>
}
```

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

`app/models/comment.ts`:

```ts
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { CommentsSchema } from '#database/schema'
import Post from '#models/post'

export default class Comment extends CommentsSchema {
  @belongsTo(() => Post)
  declare post: BelongsTo<typeof Post>
}
```

## 4. Factories

`database/factories/user_factory.ts`:

```ts
import { Factory } from '@adonisjs/lucid/factories'
import User from '#models/user'
import { PostFactory } from '#database/factories/post_factory'

export const UserFactory = Factory.define(User, ({ faker }) => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
}))
  .relation('posts', () => PostFactory)
  .build()
```

`database/factories/post_factory.ts`:

```ts
import { Factory } from '@adonisjs/lucid/factories'
import Post from '#models/post'
import { UserFactory } from '#database/factories/user_factory'

export const PostFactory = Factory.define(Post, ({ faker }) => ({
  title: faker.lorem.sentence(),
  status: 'draft',
  body: faker.lorem.paragraphs(2),
}))
  .relation('user', () => UserFactory)
  .state('published', (post) => {
    post.status = 'published'
  })
  .build()
```

Create a post with required FK via belongsTo:

```ts
const post = await PostFactory.with('user').apply('published').create()
```

Or from the parent: `await UserFactory.with('posts', 1, (p) => p.apply('published')).create()`.

## 5. Query + preload + paginate

```ts
import Post from '#models/post'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

const page = await Post.query()
  .withScopes((s) => s.published())
  .preload('user')
  .preload('comments', (q) => q.groupLimit(3).groupOrderBy('id', 'desc'))
  .orderBy('id', 'desc')
  .paginate(1, 20)

await db.transaction(async (trx) => {
  const user = await User.create(
    { email: 'a@example.com', password: 'secret' },
    { client: trx }
  )
  const post = await Post.create(
    { title: 'Hello', userId: user.id, status: 'draft' },
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
    const post = await PostFactory.with('user').apply('published').create()
    assert.equal(post.status, 'published')
    assert.exists(post.userId)
  })
})
```

## Rules reinforced

- Scaffold every model the example preloads (`User`, `Post`, `Comment`).
- Do not edit `*Schema` columns by hand.
- Factory must satisfy required FKs (`user_id`) via `.relation` + `.with('user')`.
- `groupLimit` for per-parent comment caps.
- `orderBy` before `paginate`.
- Pass `trx` across create/save.
