# Database — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/database/lucid](https://docs.adonisjs.com/guides/database/lucid)
- [guides/database/redis](https://docs.adonisjs.com/guides/database/redis)

## Condensed excerpts (prefer live docs if conflict)

### guides/database/lucid
Source: https://docs.adonisjs.com/guides/database/lucid

## Lucid - SQL ORM

This guide covers Lucid ORM, the official database ORM for AdonisJS. You will learn how to:

*   Configure database connections
*   Use the query builder and models
*   Create migrations and define relationships
*   Work with transactions and hooks
*   Serialize models and generate test data

## Overview

Lucid ORM is an Active Record ORM built on top of Knex and deeply integrated within the AdonisJS ecosystem. Unlike standalone ORMs that require extensive configuration, Lucid works seamlessly with AdonisJS features like the validator, authentication layer, caching, rate-limiting, and queues without any additional setup.

Lucid simplifies database interactions by encapsulating common operations using language-specific objects and classes. It's built on top of Knex, which means you can express complex SQL queries using a JavaScript API when needed. Lucid supports multiple databases including MySQL, PostgreSQL, Turso, SQLite, and MSSQL. The class-based model system makes your code intuitive and type-safe, while built-in support for relationships lets you model complex data structures. The migration system provides version control for your database schema, and seeders and factories help you populate databases with test data.

This guide provides a high-level overview of Lucid's features to help you understand what's available and how the pieces fit together. For detailed API references, advanced patterns, and comprehensive documentation on specific features, refer to the [official Lucid documentation](https://lucid.adonisjs.com/) .

## Configuration

Lucid's configuration lives in the `config/database.ts` file at the root of your AdonisJS project. This file defines your database connections, migration paths, and other ORM settings.

```
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
```

The configuration specifies which database connection to use by default (typically set via environment variables), and defines the connection details for each database. Each connection includes the client library (like `pg` for PostgreSQL or `mysql2` for MySQL), connection credentials, and paths to migration files.

You can explore all available configuration options, connection pooling settings, and advanced features like read-write replicas in the [Lucid configuration documentation](https://lucid.adonisjs.com/docs/installation#configuration) .

## Using the query builder directly

Before diving into models, you can use Lucid's query builder directly for database operations. The query builder provides a fluent JavaScript API for constructing SQL queries, which is particularly useful for complex queries or when you don't need the full Active Record pattern.

The query builder is available through the `db` service and works identically to Knex, since Lucid is built on top of it.

```
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ response }: HttpContext) {
    /**
     * Select all published posts ordered by creation date.
     * This returns an array of plain objects.
     */
    const posts = await db
      .from('posts')
      .select('*')
      .where('status', 'published')
      .orderBy('created_at', 'desc')

    return response.json(posts)
  }

  async store({ request, response }: HttpContext) {
    const { title, content } = request.only(['title', 'content'])

    /**
     * Insert a new post and return the generated ID.
     * Insert queries return an array of IDs.
     */
    const [id] = await db
      .insertQuery()
      .table('posts')
      .insert({
        title,
        content,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
      })

    return response.created({ id })
  }
}
```

The query builder handles parameterized queries automatically, protecting against SQL injection. You can use it for selects, inserts, updates, deletes, joins, aggregations, and any other SQL operation. When you need raw SQL for complex operations, you can use `db.rawQuery()`.

For the complete query builder API including joins, subqueries, aggregations, and advanced where clauses, see the [Lucid query builder documentation](https://lucid.adonisjs.com/docs/select-query-builder) .

## Working with models

Models provide an object-oriented way to interact with database tables. Each model class represents a table, and each model instance represents a row. Lucid uses a migrations-first approach where you define your schema in migrations, and Lucid automatically generates TypeScript schema classes that your models extend.

### Creating your first migration

Migrations are the foundation of Lucid's schema management. They provide version control for your database schema, allowing you to evolve your schema incrementally over time. Each migration is a TypeScript file with `up` and `down` methods that define how to move the schema forward and how to roll it back.

Create a migration for a posts table:

`node ace make:migration posts`

This generates a timestamped migration file in `database/migrations/`. The timestamp ensures migrations run in the correct order.

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    /**
     * The up method creates the table structure.
     * Use the schema builder to define columns and constraints.
     */
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.string('status').defaultTo('draft')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    /**
     * The down method reverses the up method's changes.
     * This enables rolling back migrations if needed.
     */
    this.schema.dropTable(this.tableName)
  }
}
```

Run the migration to create the table:

`node ace migration:run`

Lucid executes the migration, creates the `posts` table in your database, and automatically generates a schema class at `database/schema.ts` that contains type-safe column definitions.

Tip

Migrations run inside transactions by default. If a migration fails, all changes are rolled back automatically, keeping your database in a consistent state.

For more migration operations like altering tables, adding indexes, and working with foreign keys, see the [L

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/database/redis
Source: https://docs.adonisjs.com/guides/database/redis

Redis (Data Layer) - AdonisJS Documentation 

Layer Redis 

Redis 
This guide covers Redis integration in AdonisJS applications. You will learn how to: 
Install and configure the package 
Execute Redis commands 
Manage multiple connections 
Use Pub/Sub messaging 
Handle connection errors 
Configure clusters and sentinels 
Overview 
The package is a thin wrapper on top of ioredis (a Node.js Redis client) with better developer experience around Pub/Sub and automatic management of multiple Redis connections. 
You can use Redis for caching, session storage, job queues, rate limiting, and real-time messaging. The package provides a clean API to execute Redis commands, manage multiple named connections, and subscribe to Pub/Sub channels without manually managing subscriber connections. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/redis
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/redis/redis_provider')
  ]
}
```

Creates the file with connection configuration for your Redis server. 

Defines the following environment variables and their validation rules. 

```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

Configuration 
The configuration for the Redis package is stored inside the file. 
See also:  [link:https://github.com/adonisjs/redis/blob/10.x/stubs/config/redis.stub] Config file stub 
config/redis.ts 

```
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: '',
    },
  },
})

export default redisConfig
```

The property defines which connection to use by default. When you run Redis commands without choosing an explicit connection, they will be executed against the default connection. 

The property is a collection of multiple named connections. You can define one or more connections inside this object and switch between them using the method. 
Every named connection config is identical to the  [link:https://redis.github.io/ioredis/index.html#RedisOptions] config accepted by ioredis . 

Connecting via Unix socket 
You can configure Redis to use a Unix socket for local connections. Use the property to specify the socket file location. 
config/redis.ts 

```
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      /**
       * Path to the Unix socket file.
       * Remove host and port when using socket connections.
       */
      path: env.get('REDIS_SOCKET_PATH'),
      db: 0,
      keyPrefix: '',
    },
  },
})

export default redisConfig
```

Configuring clusters 
The package creates a  [link:https://github.com/redis/ioredis#cluster] cluster connection when you define an array of cluster nodes in your connection config. 
Clusters distribute data across multiple Redis nodes for horizontal scaling and high availability. Use clusters when you need to scale beyond a single server's memory capacity or want automatic sharding of data across nodes. 
config/redis.ts 

```
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      // highlight-start
      clusters: [
        { host: '127.0.0.1', port: 6380 },
        { host: '127.0.0.1', port: 6381 },
      ],
      clusterOptions: {
        scaleReads: 'slave',
        slotsRefreshTimeout: 10 * 1000,
      },
      // highlight-end
    },
  },
})

export default redisConfig
```

An array of cluster node addresses. Each node should specify and . The package will discover all cluster nodes automatically after connecting to the initial nodes. 

Cluster-specific options for controlling behavior. 
Common options: 
: How to distribute read operations ( , , or ) 
: How often to refresh cluster slot information (in milliseconds) 
See the  [link:https://github.com/redis/ioredis#cluster] ioredis cluster documentation for the complete list of options. 

Configuring sentinels 
Sentinels provide high availability through automatic failover. Sentinel nodes monitor your master and replica servers and automatically promote a replica to master if the master fails. 
You can configure a Redis connection to use sentinels by defining an array of sentinel nodes within the connection config. 
See also:  [link:https://github.com/redis/ioredis?tab=readme-ov-file#sentinel] IORedis docs on Sentinels config 
config/redis.ts 

```
import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      // highlight-start
      sentinels: [
        { host: 'localhost', port: 26379 },
        { host: 'localhost', port: 26380 },
      ],
      name: 'mymaster',
      // highlight-end
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
    },
  },
})

export default redisConfig
```

An array of sentinel node addresses. Sentinels will automatically detect which server is the current master and redirect connections accordingly. 

The name of the master group as configured in your sentinels. This must match the sentinel configuration. 

Usage 
You can execute Redis commands using the service exported by the package. The redis service is a singleton instance configured using the settings from your file. 
Note 
The commands API is identical to  [link:https://redis.github.io/ioredis/classes/Redis.html] ioredis . Consult the ioredis documentation to view the complete list of available methods. 

```
import redis from '@adonisjs/redis/services/main'

await redis.set('username', 'virk')
const username = await redis.get('username')
```

Switching between connections 
Commands executed using the service are invoked against the default connection defined inside the config file. You can execute commands on a specific connection by first getting an instance of it. 
The method creates and caches a connection instance for the lifetime of the process. Subsequent calls return the same cached instance. 

```
import redis from '@adonisjs/redis/services/main'

/**
 * Get connection instance
 */
const redisMain = redis.connection('main')

await redisMain.set('username', 'virk')
const username = await redisMain.get('username')
```

Quitting connections 
Connections are long-lived and you will get the same instance every time you call the method. You can quit a connection gracefully using the method or force close it immediately using the method. 

```
import redis from '@adonisjs/redis/services/main'

/**
 * Quit the main connection gracefully
 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
