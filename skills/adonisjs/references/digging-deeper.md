# Digging Deeper — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/digging-deeper/cache](https://docs.adonisjs.com/guides/digging-deeper/cache)
- [guides/digging-deeper/drive](https://docs.adonisjs.com/guides/digging-deeper/drive)
- [guides/digging-deeper/emitter](https://docs.adonisjs.com/guides/digging-deeper/emitter)
- [guides/digging-deeper/health-checks](https://docs.adonisjs.com/guides/digging-deeper/health-checks)
- [guides/digging-deeper/i18n](https://docs.adonisjs.com/guides/digging-deeper/i18n)
- [guides/digging-deeper/locks](https://docs.adonisjs.com/guides/digging-deeper/locks)
- [guides/digging-deeper/logger](https://docs.adonisjs.com/guides/digging-deeper/logger)
- [guides/digging-deeper/mail](https://docs.adonisjs.com/guides/digging-deeper/mail)
- [guides/digging-deeper/opentelemetry](https://docs.adonisjs.com/guides/digging-deeper/opentelemetry)
- [guides/digging-deeper/queues](https://docs.adonisjs.com/guides/digging-deeper/queues)
- [guides/digging-deeper/server-sent-events](https://docs.adonisjs.com/guides/digging-deeper/server-sent-events)

## Condensed excerpts (prefer live docs if conflict)

### guides/digging-deeper/cache
Source: https://docs.adonisjs.com/guides/digging-deeper/cache

Cache (Digging Deeper) - AdonisJS Documentation 

Deeper Cache 

Cache 
This guide covers caching in AdonisJS applications. You will learn how to: 
Configure cache stores with different drivers (Redis, Memory, Database, DynamoDB) 
Store, retrieve, and invalidate cached data 
Use multi-tier caching with L1 (memory) and L2 (distributed) layers 
Organize cache entries with namespaces and tags 
Improve resilience with grace periods, stampede protection, and timeouts 
Use Ace commands to manage your cache 
Overview 
The package provides a unified caching API for your AdonisJS application. Built on top of  [link:https://bentocache.dev] Bentocache , it goes beyond simple key-value storage by offering multi-tier caching, cache stampede protection, grace periods, and more. 
The package introduces two key concepts. A driver is the underlying storage mechanism (Redis, in-memory, database). A store is a configured caching layer that combines one or more drivers. You can configure multiple stores in your application, each with different drivers and settings, and switch between them at runtime. 
Multi-tier caching is the standout feature. By combining an in-memory L1 cache with a distributed L2 cache (like Redis), you get the speed of local memory with the persistence and scalability of a shared cache. This setup can deliver responses between 2,000x and 5,000x faster compared to single-tier approaches. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/cache
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider and command inside the file. 
adonisrc.ts 

```
{
  commands: [
    // ...other commands
    () => import('@adonisjs/cache/commands')
  ],
  providers: [
    // ...other providers
    () => import('@adonisjs/cache/cache_provider')
  ]
}
```

Creates the file. 

Defines the environment variables and their validations for the selected drivers. 

Configuration 
The cache configuration lives in . This file defines your stores, the default store, and driver-specific settings. 
See also:  [link:https://github.com/adonisjs/cache/blob/2.x/stubs/config.stub] Config stub 
config/cache.ts 

```
import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  /**
   * The store to use when none is specified
   */
  default: 'redis',

  /**
   * Default TTL for all cached entries.
   * Can be overridden per-store or per-operation.
   */
  ttl: '30s',

  /**
   * Configure one or more stores. Each store defines
   * its caching layers and driver settings.
   */
  stores: {
    /**
     * A multi-tier store combining in-memory speed
     * with Redis persistence and cross-instance sync.
     */
    redis: store()
      .useL1Layer(drivers.memory({ maxSize: '100mb' }))
      .useL2Layer(drivers.redis({ connectionName: 'main' }))
      .useBus(drivers.redisBus({ connectionName: 'main' })),

    /**
     * A simple in-memory store for single-instance apps
     */
    memory: store()
      .useL1Layer(drivers.memory({ maxSize: '100mb' })),

    /**
     * A database-backed store using your Lucid connection
     */
    database: store()
      .useL2Layer(drivers.database({ connectionName: 'default' })),
  },
})

export default cacheConfig
```

Available drivers 
Redis Uses Redis as a distributed cache. Requires the package to be installed and configured. Compatible with Redis, Upstash, Vercel KV, Valkey, KeyDB, and DragonFly. 
config/cache.ts 

```
{
  stores: {
    redis: store()
      .useL2Layer(drivers.redis({
        connectionName: 'main',
      }))
  }
}
```

See also:  [link:/guides/database/redis] Redis setup guide 

Memory Uses an in-memory LRU (Least Recently Used) cache. Best suited as an L1 layer in a multi-tier setup or for single-instance applications. 
config/cache.ts 

```
{
  stores: {
    memory: store()
      .useL1Layer(drivers.memory({
        maxSize: '100mb',
        maxItems: 1000,
      }))
  }
}
```

Database Uses your database as a cache store. Requires . The cache table is created automatically by default. 
config/cache.ts 

```
{
  stores: {
    database: store()
      .useL2Layer(drivers.database({
        connectionName: 'default',
        tableName: 'cache',
        autoCreateTable: true,
      }))
  }
}
```

DynamoDB Uses AWS DynamoDB as a cache store. Requires 
```
@aws-sdk/client-dynamodb
```
. You must create the table beforehand with a string partition key named and TTL enabled on the attribute. 

```
npm i @aws-sdk/client-dynamodb
```

config/cache.ts 

```
{
  stores: {
    dynamo: store()
      .useL2Layer(drivers.dynamodb({
        table: { name: 'cache' },
        region: 'us-east-1',
        credentials: {
          accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
        },
      }))
  }
}
```

Storing and retrieving data 
Import the cache service to interact with your cache. All cache operations are available through the object. 
app/controllers/posts_controller.ts 

```
import cache from '@adonisjs/cache/services/main'
```

Getting and setting values 
The most common pattern is . It tries to find a value in the cache and, if missing, executes the factory function to compute the value, stores it, and returns it. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import cache from '@adonisjs/cache/services/main'
import Post from '#models/post'

export default class PostsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)

    const posts = await cache.getOrSet({
      key: `posts:page:${page}`,
      ttl: '10m',
      factory: () => Post.query().paginate(page, 20),
    })

    return posts
  }
}
```

You can also use and independently when you need more control over the flow. 
app/services/settings_service.ts 

```
import cache from '@adonisjs/cache/services/main'

/**
 * Store a value with a 5-minute TTL
 */
await cache.set({
  key: 'app:settings',
  value: { maintenance: false, theme: 'dark' },
  ttl: '5m',
})

/**
 * Retrieve a value. Returns undefined if the key
 * does not exist.
 */
const settings = await cache.get({ key: 'app:settings' })

/**
 * Store a value that never expires
 */
await cache.setForever({
  key: 'app:version',
  value: '2.0.0',
})
```

Warning 
Cached data must be serializable to JSON. If you are caching Lucid models, call or before storing them, or use which handles serialization automatically. 

Checking for existence 
Use and to check whether a key exists in the cache without retrieving its value. 
app/controllers/products_controller.ts 

```
import cache from '@adonisjs/cache/services/main'

if (await cache.has({ key: 'products:featured' })) {
  // Key exists in cache
}

if (await cache.missing({ key: 'products:featured' })) {
  // Key does not exist
}
```

Pulling values 
The method retrieves a va

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/drive
Source: https://docs.adonisjs.com/guides/digging-deeper/drive

Drive (Digging Deeper) - AdonisJS Documentation 

Deeper Drive 

Drive 
This guide covers file storage management in AdonisJS using Drive. You will learn how to: 
Install and configure Drive for your application 
Upload files to local or cloud storage using 
Display files using public URLs and signed URLs 
Configure multiple storage services (S3, GCS, R2, DigitalOcean Spaces, Supabase) 
Implement direct uploads from the browser to cloud storage 
Test file uploads using the Drive fakes API 
Overview 
AdonisJS Drive is a wrapper on top of  [link:https://flydrive.dev] FlyDrive (created and maintained by the AdonisJS core team). It provides a unified API for managing user-uploaded files across multiple storage providers, including the local filesystem, Amazon S3, Google Cloud Storage, Cloudflare R2, DigitalOcean Spaces, and Supabase Storage. 
The key benefit of Drive is that you can switch between storage services without changing your application code. During development, you might store files on the local filesystem for convenience. In production, you switch to a cloud provider by changing an environment variable. Your controllers, services, and templates remain unchanged. 
Note 
Drive handles file storage operations like reading, writing, and deleting files. It does not handle HTTP multipart parsing. You should read the  [link:/guides/basics/file-uploads] file uploads guide first to understand how AdonisJS processes uploaded files from HTTP requests. 

Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/drive
```

The command prompts you to select one or more storage services. 
Steps performed by the add command Installs the package and any required peer dependencies for your selected services. 
Registers the Drive service provider in . 
Creates the configuration file with your selected services. 
Adds environment variables for your selected services to and . 

Non-interactive installation 
The command requires interactive service selection. If you need to install Drive non-interactively (for example, in CI scripts), you can perform the steps manually: 
Install the package: 
```
npm install @adonisjs/drive
```

Install peer dependencies for your storage service (e.g., 
```
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```
for S3) 
Register the provider in : add 
```
() => import('@adonisjs/drive/drive_provider')
```
to the array 
Create with your service configuration (see the Configuration section below) 
Add the required environment variables to and 

Configuration 
The configuration for Drive is stored in . The file contents depend on which services you selected during installation. 
The property in the config file determines which service is used when you don't explicitly specify one. The environment variable controls this, allowing you to use locally and switch to in production. 
config/drive.ts 

```
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  services: {
    // Service configurations go here
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
```

Local filesystem 
The local filesystem driver stores files on your server's disk and can serve them via the AdonisJS HTTP server. 
Environment variables .env 

Configuration config/drive.ts 

```
{
  services: {
    fs: services.fs({
      /**
       * The directory where files are stored. Use app.makePath
       * to create an absolute path from your application root.
       */
      location: app.makePath('storage'),

      /**
       * When true, Drive registers a route to serve files
       * from the local filesystem via your AdonisJS server.
       */
      serveFiles: true,

      /**
       * The URL path prefix for serving files. A file stored
       * as "avatars/1.jpg" becomes accessible at "/uploads/avatars/1.jpg".
       */
      routeBasePath: '/uploads',

      /**
       * The default visibility for files. Public files are
       * accessible via URL. Private files require signed URLs.
       */
      visibility: 'public',
    }),
  }
}
```

Tip 
When is enabled, you can verify the route is registered by running . You should see a route like with the handler . 

Amazon S3 
Environment variables .env 

```
DRIVE_DISK=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your_bucket_name
```

Configuration config/drive.ts 

```
{
  services: {
    s3: services.s3({
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: env.get('AWS_REGION'),
      bucket: env.get('S3_BUCKET'),
      visibility: 'public',
    }),
  }
}
```

Google Cloud Storage 
Environment variables .env 

```
DRIVE_DISK=gcs
GCS_KEY=file://gcs_key.json
GCS_BUCKET=your_bucket_name
```

The variable points to a JSON key file for your Google Cloud service account. The prefix indicates the path is relative to your application root. 

Configuration config/drive.ts 

```
{
  services: {
    gcs: services.gcs({
      credentials: env.get('GCS_KEY'),
      bucket: env.get('GCS_BUCKET'),
      visibility: 'public',
    }),
  }
}
```

Cloudflare R2 
Cloudflare R2 uses the S3-compatible API. The must be set to . 
Environment variables .env 

```
DRIVE_DISK=r2
R2_KEY=your_access_key
R2_SECRET=your_secret_key
R2_BUCKET=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

Configuration config/drive.ts 

```
{
  services: {
    r2: services.s3({
      credentials: {
        accessKeyId: env.get('R2_KEY'),
        secretAccessKey: env.get('R2_SECRET'),
      },
      region: 'auto',
      bucket: env.get('R2_BUCKET'),
      endpoint: env.get('R2_ENDPOINT'),
      visibility: 'public',
    }),
  }
}
```

DigitalOcean Spaces 
DigitalOcean Spaces uses the S3-compatible API with a custom endpoint. 
Environment variables .env 

```
DRIVE_DISK=spaces
SPACES_KEY=your_access_key
SPACES_SECRET=your_secret_key
SPACES_REGION=nyc3
SPACES_BUCKET=your_bucket_name
SPACES_ENDPOINT=https://${SPACES_REGION}.digitaloceanspaces.com
```

Configuration config/drive.ts 

```
{
  services: {
    spaces: services.s3({
      credentials: {
        accessKeyId: env.get('SPACES_KEY'),
        secretAccessKey: env.get('SPACES_SECRET'),
      },
      region: env.get('SPACES_REGION'),
      bucket: env.get('SPACES_BUCKET'),
      endpoint: env.get('SPACES_ENDPOINT'),
      visibility: 'public',
    }),
  }
}
```

Supabase Storage 
Supabase Storage uses the S3-compatible API. 
Environment variables .env 

```
DRIVE_DISK=supabase
SUPABASE_STORAGE_KEY=your_access_key
SUPABASE_STORAGE_SECRET=your_secret_key
SUPABASE_STORAGE_REGION=your_region
SUPABASE_STORAGE_BUCKET=your_bucket_nam

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/emitter
Source: https://docs.adonisjs.com/guides/digging-deeper/emitter

Emitter (Digging Deeper) - AdonisJS Documentation 

Deeper Emitter 

Event Emitter 
This guide covers the event emitter in AdonisJS applications. You will learn how to: 
Define and emit type-safe events 
Register listeners using callbacks or classes 
Handle errors and fake events during tests 
Overview 
The event emitter enables event-driven architecture in AdonisJS applications. When you emit an event, all registered listeners execute asynchronously without blocking the code that triggered the event. This pattern is useful for decoupling side effects from your main application logic. 
A common example is user registration: after creating a user account, you might need to send a verification email, provision resources with a payment provider, and log the signup for analytics. Rather than executing all these tasks sequentially in your controller, you can emit a single event and let separate listeners handle each concern independently. 
AdonisJS provides two approaches for defining events. String-based events use TypeScript module augmentation for type-safety, while class-based events encapsulate the event identifier and data in a single class. 
Note 
If you're looking for a list of events emitted by AdonisJS and its official packages, see the  [link:/reference/events] events reference guide . 

Defining events and event data 
An event consists of two parts: an identifier and associated data. The identifier is typically a string like , and the data is whatever payload you want to pass to listeners (for example, an instance of the model). 
Class-based events encapsulate both the identifier and the data within a single class. The class itself serves as the identifier, and instances of the class hold the event data. This approach provides built-in type-safety without additional configuration. 
String-based events 
String-based events use a string identifier like or . To make these events type-safe, you define the event names and their payload types using TypeScript module augmentation. 
Define event types 
Create a file and augment the interface to declare your events and their payload types. 
types/events.ts 

```
import User from '#models/user'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:registered': User
  }
}
```

The interface maps event names to their payload types. In this example, the event carries a model instance as its payload. TypeScript will enforce this contract when you emit events or register listeners. 

Listen for the event 
Create a preload file to register your event listeners. Run the following command to generate the file. 

```
node ace make:preload events
```

This creates , which is loaded automatically when your application boots. Register listeners using the method. 
start/events.ts 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('user:registered', function (user) {
  console.log(user.email)
})
```

The listener callback receives the event payload as its argument. Because you defined the payload type in , TypeScript knows that is an instance of the model. 

Emit the event 
Emit events from anywhere in your application using . The first argument is the event name, and the second is the payload. 
app/controllers/users_controller.ts 

```
import emitter from '@adonisjs/core/services/emitter'
import User from '#models/user'

export default class UsersController {
  async store({ request }: HttpContext) {
    const data = request.only(['email', 'password'])
    const user = await User.create(data)

    emitter.emit('user:registered', user)
    return user
  }
}
```

The method is type-safe. TypeScript will error if you pass an incorrect payload type or use an event name that isn't defined in . 

Class-based events 
Class-based events provide type-safety without module augmentation. The event class acts as both the identifier and a container for the event data. 
Create an event class 
Generate an event class using the command. 

```
node ace make:event UserRegistered
```

This creates an event class that extends . Accept event data through the constructor and expose it as instance properties. 
app/events/user_registered.ts 

```
import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'

export default class UserRegistered extends BaseEvent {
  constructor(public user: User) {
    super()
  }
}
```

The event class has no behavior. It's purely a data container where the constructor parameters define what data the event carries. 

Listen for the event 
Import the event class from the  [link:/guides/concepts/barrel-files] barrel file and use it as the first argument to . 
start/events.ts 

```
import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'

emitter.on(events.UserRegistered, function (event) {
  console.log(event.user.email)
})
```

The listener receives an instance of the event class. Access the event data through the instance properties you defined in the constructor. 

Dispatch the event 
Class-based events are dispatched using the static method instead of . 
app/controllers/users_controller.ts 

```
import User from '#models/user'
import { events } from '#generated/events'

export default class UsersController {
  async store({ request }: HttpContext) {
    const data = request.only(['email', 'password'])
    const user = await User.create(data)

    events.UserRegistered.dispatch(user)
    return user
  }
}
```

The method accepts the same arguments as the event class constructor. There's no need to define types in since the class itself provides complete type information. 

Listeners 
Listeners can be defined as inline callbacks or as dedicated listener classes. Inline callbacks work well for simple logic, while listener classes are better for complex operations that benefit from dependency injection and testability. 
Inline callbacks 
Pass a function directly to for simple listeners. 
start/events.ts 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('user:registered', function (user) {
  console.log(`New user: ${user.email}`)
})
```

The same approach works with class-based events. 
start/events.ts 

```
import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'

emitter.on(events.UserRegistered, function (event) {
  console.log(`New user: ${event.user.email}`)
})
```

Listener classes 
Create a listener class using the command. 

```
node ace make:listener SendVerificationEmail
```

This generates a class with a method that executes when the event fires. 
app/listeners/send_verification_email.ts 

```
export default class SendVerificationEmail {
  async handle() {
    // Send email
  }
}
```

Update the method to accept the event payload. For class-based events, type the parameter as the event class. 
app/listeners/send_verification_email.ts 

```
import { events } from '#generated/events'

export default class SendVerificationEmail {
  async #sendEmail(to: stri

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/health-checks
Source: https://docs.adonisjs.com/guides/digging-deeper/health-checks

Health checks (Digging Deeper) - AdonisJS Documentation 

Deeper Health checks 

Health checks 
This guide covers health checks in AdonisJS applications. You will learn how to: 
Understand the difference between liveness and readiness probes 
Configure health checks using the built-in setup command 
Expose endpoints for monitoring services and orchestrators 
Use built-in checks for disk space, memory, database, and Redis 
Cache health check results for performance optimization 
Create custom health checks for application-specific needs 
Overview 
Health checks allow your application to report its operational status to external systems like load balancers, container orchestrators (Kubernetes, Docker Swarm), and monitoring services. These systems periodically probe your application to determine whether it should receive traffic or be restarted. 
AdonisJS provides a health check system built into the core framework with several ready-made checks for common infrastructure concerns. You can also create custom checks for application-specific requirements like verifying external API connectivity or queue connections. 
Liveness vs readiness 
Before implementing health checks, it's important to understand the two types of probes and when each should be used. 
A liveness probe answers the question: "Is the process alive and responsive?" This is a simple check that verifies your application can respond to HTTP requests. If a liveness probe fails repeatedly, the orchestrator will restart the container. Liveness probes should be lightweight and avoid checking external dependencies, since a database outage shouldn't cause your application to enter a restart loop. 
A readiness probe answers the question: "Is the application ready to accept traffic?" This check verifies that your application and its dependencies (database connections, Redis, external services) are functioning correctly. If a readiness probe fails, the orchestrator removes the instance from the load balancer but does not restart it. This allows the application time to recover, for example, when a database connection is temporarily unavailable. 
Probe Purpose On failure Should check dependencies 
Liveness Is the process alive? Restart container No 
Readiness Can it handle requests? Remove from load balancer Yes 

Configuring health checks 
Run the following command to set up health checks in your application. This creates the configuration file and a controller with both liveness and readiness endpoints. 

```
node ace configure health_checks
```

The command creates two files. The first is the health checks configuration where you register which checks to run. 
start/health.ts 

```
import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck } from '@adonisjs/core/health'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck(),
  new MemoryHeapCheck(),
])
```

The second is a controller that exposes both probe endpoints. 
app/controllers/health_checks_controller.ts 

```
import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  /**
   * Liveness probe: Returns 200 if the process is running.
   * Does not check dependencies.
   */
  async live({ response }: HttpContext) {
    return response.ok()
  }

  /**
   * Readiness probe: Runs all registered health checks
   * and returns the detailed report.
   */
  async ready({ response }: HttpContext) {
    const report = await healthChecks.run()
    if (report.isHealthy) {
      return response.ok(report)
    }

    return response.serviceUnavailable(report)
  }
}
```

The liveness method simply returns a 200 status code, proving the process is alive and can handle HTTP requests. The readiness method runs all registered health checks and returns 200 when healthy or 503 (Service Unavailable) when any check fails. 
Exposing endpoints 
Register the health check routes in your routes file. Using separate paths for each probe allows orchestrators to configure them independently. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/health/live', [controllers.HealthChecks, 'live'])
router.get('/health/ready', [controllers.HealthChecks, 'ready'])
```

With these routes in place, your monitoring system can probe for liveness and for readiness checks. 
Understanding the readiness report 
The readiness endpoint returns a detailed JSON report containing the results of all registered checks. 

```
{
  "isHealthy": true,
  "status": "warning",
  "finishedAt": "2024-06-20T07:09:35.275Z",
  "debugInfo": {
    "pid": 16250,
    "ppid": 16051,
    "platform": "darwin",
    "uptime": 16.271809083,
    "version": "v21.7.3"
  },
  "checks": [
    {
      "name": "Disk space check",
      "isCached": false,
      "message": "Disk usage is 76%, which is above the threshold of 75%",
      "status": "warning",
      "finishedAt": "2024-06-20T07:09:35.275Z",
      "meta": {
        "sizeInPercentage": {
          "used": 76,
          "failureThreshold": 80,
          "warningThreshold": 75
        }
      }
    },
    {
      "name": "Memory heap check",
      "isCached": false,
      "message": "Heap usage is under defined thresholds",
      "status": "ok",
      "finishedAt": "2024-06-20T07:09:35.265Z",
      "meta": {
        "memoryInBytes": {
          "used": 41821592,
          "failureThreshold": 314572800,
          "warningThreshold": 262144000
        }
      }
    }
  ]
}
```

The report contains the following properties: 

Boolean indicating whether all checks passed. Set to if one or more checks fail. 

Overall status: (all passed), (warnings present), or (failures present). 

Timestamp when the checks completed. 

Process information including PID, platform, uptime in seconds, and Node.js version. 

Array containing the detailed result of each registered check. 
Each check in the array includes its name, status, message, whether the result was cached, and any metadata specific to that check type. 

Protecting the readiness endpoint 
The readiness report contains detailed information about your infrastructure that you may not want exposed publicly. You can protect the endpoint using a secret header that your monitoring system includes with each request. 
Kubernetes and most monitoring tools support custom HTTP headers on probe requests, so you can configure them to include your secret. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'

const HealthChecksController = () => import('#controllers/health_checks_controller')

router.get('/health/live', [HealthChecksController, 'live'])
router
  .get('/health/ready', [HealthChecksController, 'ready'])
  .use(({ request, response }, next) => {
    if (request.header('x-monitoring-secret') === 'some_secret_value') {
      return next()
    }
    return response.unauthorized({ message: 'Unauthorized access' })
  })
```

In

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/i18n
Source: https://docs.adonisjs.com/guides/digging-deeper/i18n

I18n (Digging Deeper) - AdonisJS Documentation 

Deeper I18n 

Internationalization and Localization 
This guide covers internationalization (i18n) and localization in AdonisJS applications. You will learn how to: 
Configure the i18n package and set up supported locales 
Store and organize translation files for multiple languages 
Resolve and format translations in controllers and Edge templates 
Translate validation error messages automatically 
Use ICU message format for dynamic content (plurals, dates, numbers, gender) 
Format values like currencies, dates, and relative times 
Create custom translation loaders and formatters 
Overview 
When building applications for a global audience, you need two capabilities: localization (translating text into multiple languages) and internationalization (formatting values like dates, numbers, and currencies according to regional conventions). The package provides both. 
Localization involves writing translations for each language your application supports and referencing them in Edge templates, validation messages, or directly via the i18n API. Instead of hardcoding strings like "Welcome back!" throughout your codebase, you store translations in dedicated files and look them up by key. This makes it straightforward to add new languages without modifying your application code. 
Internationalization handles the formatting side. The same date might display as "January 10, 2026" in the US but "10 janvier 2026" in France. The i18n package uses the browser-standard Intl API under the hood, giving you locale-aware formatting for numbers, currencies, dates, times, and more. 
The package integrates with AdonisJS through middleware that detects the user's preferred language from the header, creates a locale-specific i18n instance, and makes it available throughout the request lifecycle via HTTP Context. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/i18n
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 
adonisrc.ts 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/i18n/i18n_provider')
  ]
}
```

Creates the file. 

Creates 
```
detect_user_locale_middleware
```
inside the directory. 

Registers the following middleware inside the file. 
start/kernel.ts 

```
router.use([
  () => import('#middleware/detect_user_locale_middleware')
])
```

Configuration 
The configuration for the i18n package is stored within the file. 
config/i18n.ts 

```
import app from '@adonisjs/core/services/app'
import { defineConfig, formatters, loaders } from '@adonisjs/i18n'

const i18nConfig = defineConfig({
  defaultLocale: 'en',
  formatter: formatters.icu(),

  loaders: [
    loaders.fs({
      location: app.languageFilesPath()
    })
  ],
})

export default i18nConfig
```

See also:  [link:https://github.com/adonisjs/i18n/blob/3.x/stubs/config/i18n.stub] Config stub 
Configuration options 
Option Description 
The fallback locale when your application does not support the user's language. Translations and value formatting fall back to this locale. 
The message format for storing translations. AdonisJS uses the  [link:https://format-message.github.io/icu-message-format-for-translators/index.html] ICU message format by default, a widely accepted standard supported by translation services like Crowdin and Lokalise. You can also create custom formatters . 
A key-value pair defining fallback relationships between locales. For example, you might show Spanish content to users who speak Catalan. 
An array of locales your application supports. If omitted, this is inferred from your translation files. 
A collection of loaders for loading translations. The default filesystem loader reads from . You can create custom loaders to load translations from a database or remote service. 

Configuring fallback locales 
When a translation is missing for a specific locale, the i18n package can fall back to a related language before using the default locale. This is useful for regional variants. 
config/i18n.ts 

```
export default defineConfig({
  formatter: formatters.icu(),
  defaultLocale: 'en',
  fallbackLocales: {
    'de-CH': 'de',  // Swiss German falls back to German
    'fr-CH': 'fr',  // Swiss French falls back to French
    ca: 'es'        // Catalan falls back to Spanish
  }
})
```

Configuring supported locales 
By default, the package infers supported locales from your translation files. If you have translation directories for , , and , those become your supported locales automatically. To explicitly define supported locales, use the option. 
config/i18n.ts 

```
export default defineConfig({
  formatter: formatters.icu(),
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'it']
})
```

Storing translations 
Translations are stored in the directory. Create a subdirectory for each language using the  [link:https://en.wikipedia.org/wiki/IETF_language_tag] IETF language tag format (like , , ). 

```
resources
├── lang
│   ├── en
│   └── fr
```

For regional variants, create subdirectories with the region code. AdonisJS automatically falls back from regional to base translations when a key is missing. 

```
resources
├── lang
│   ├── en        # English (base)
│   ├── en-us     # English (United States)
│   └── en-gb     # English (United Kingdom)
```

See also:  [link:https://www.andiamo.co.uk/resources/iso-language-codes/] ISO language codes 
Translation file format 
Store translations in or files. You can create nested directories for better organization. 

```
resources
├── lang
│   ├── en
│   │   └── messages.json
│   └── fr
│       └── messages.json
```

Translations use the  [link:https://format-message.github.io/icu-message-format-for-translators/index.html] ICU message syntax , which supports interpolation, pluralization, and formatting. 
resources/lang/en/messages.json 

```
{
  "greeting": "Hello world"
}
```

resources/lang/fr/messages.json 

```
{
  "greeting": "Bonjour le monde"
}
```

Resolving translations 
To look up and format translations, create a locale-specific instance of the I18n class using the method. 
app/services/example_service.ts 

```
import i18nManager from '@adonisjs/i18n/services/main'

/**
 * Create I18n instances for specific locales
 */
const en = i18nManager.locale('en')
const fr = i18nManager.locale('fr')
```

Use the method to format a translation by its key. The key follows the pattern . 
app/services/example_service.ts 

```
import i18nManager from '@adonisjs/i18n/services/main'

const i18n = i18nManager.locale('en')
i18n.t('messages.greeting') // "Hello world"
```

app/services/example_service.ts 

```
import i18nManager from '@adonisjs/i18n/services/main'

const i18n = i18nManager.locale('fr')
i18n.t('messages.greeting') // "Bonjour le monde"
```

Understanding fallback behavior 
Each I18n instance has a pre-configured fallback

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/locks
Source: https://docs.adonisjs.com/guides/digging-deeper/locks

Atomic locks (Digging Deeper) - AdonisJS Documentation 

Deeper Atomic locks 

Atomic Locks 
This guide covers atomic locks in AdonisJS applications. You will learn how to: 
Install and configure the package 
Create and release locks to protect critical sections 
Use different acquisition methods for various scenarios 
Extend lock expiry for long-running operations 
Share locks between different processes 
Overview 
Atomic locks prevent race conditions when multiple processes or parts of your codebase might perform concurrent actions on the same resource. Consider a payment processing scenario where a queue job could be enqueued twice due to a network retry. Without proper locking, the system might charge the user twice. Atomic locks ensure that only one process can execute the critical section at a time. 
The package is a wrapper over  [link:https://verrou.dev] Verrou , a framework-agnostic locking library created and maintained by the AdonisJS core team. It supports three storage backends: Redis, database, and memory. 
Installation 
Install and configure the package using the following command. 

```
node ace add @adonisjs/lock
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 
adonisrc.ts 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/lock/lock_provider')
  ]
}
```

Creates the file. 

Defines the environment variable and its validation inside the file. 

Creates a database migration for the locks table (if using the database store). 

Configuration 
The configuration is stored in the file. 
config/lock.ts 

```
import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/lock'

const lockConfig = defineConfig({
  default: env.get('LOCK_STORE'),
  stores: {
    /**
     * Redis store to manage locks.
     * Requires the @adonisjs/redis package.
     */
    redis: stores.redis({}),

    /**
     * Database store to manage locks.
     * Requires the @adonisjs/lucid package.
     */
    database: stores.database({
      tableName: 'locks'
    }),

    /**
     * Memory store could be used during testing.
     */
    memory: stores.memory()
  },
})

export default lockConfig

declare module '@adonisjs/lock/types' {
  export interface LockStoresList extends InferLockStores<typeof lockConfig> {}
}
```

Redis store 
The store has a peer dependency on the package. You must  [link:/guides/database/redis] configure the Redis package before using the Redis store. 
The is a reference to the connection defined within the file. If not defined, the default Redis connection is used. 
config/lock.ts 

```
{
  redis: stores.redis({
    connectionName: 'main',
  }),
}
```

Database store 
The store has a peer dependency on the package. You must  [link:/guides/database/lucid] configure Lucid before using the database store. 
The is a reference to a database connection defined within the file. If not defined, the default database connection is used. 
config/lock.ts 

```
{
  database: stores.database({
    connectionName: 'postgres',
    tableName: 'my_locks',
  }),
}
```

The data is stored within the table. A migration for this table is automatically created during installation. However, if needed, you can manually create a migration with the following contents. 
Migration file contents database/migrations/xxxx_create_locks_table.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'locks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().primary()
      table.string('owner').notNullable()
      table.bigint('expiration').unsigned().nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

Environment variables 
The default store is configured using the environment variable. 
.env 

Creating locks 
Create a lock using the method from the lock manager service. The method accepts a unique key that identifies the resource being locked and a TTL (time-to-live) that defines how long the lock remains valid. 

```
import lockManager from '@adonisjs/lock/services/main'

const lock = lockManager.createLock('processing_payment:order:42', '30s')
```

The lock key should uniquely identify the resource being protected. A common pattern is to use a descriptive prefix followed by an identifier, such as 
```
processing_payment:order:${orderId}
```
or 
```
sending_email:user:${userId}
```
. 
The TTL accepts either a time expression string (like , , or ) or a number in milliseconds. The TTL acts as a safety mechanism. If a process crashes while holding a lock, the lock will automatically expire after the TTL, preventing deadlocks. 
Acquiring locks 
The package provides several methods for acquiring locks, each suited to different scenarios. 
Running code within a lock 
The method is the recommended way to execute code within a lock. It acquires the lock, executes your callback, and automatically releases the lock when the callback completes (or throws an error). 
app/services/payment_service.ts 

```
import lockManager from '@adonisjs/lock/services/main'

export default class PaymentService {
  async processPayment(order: Order) {
    const lock = lockManager.createLock(
      `processing_payment:order:${order.id}`,
      '30s'
    )
    
    const [acquired, result] = await lock.run(async () => {
      /**
       * This callback only executes after acquiring the lock.
       * The lock is automatically released when the callback
       * completes or throws an error.
       */
      const charge = await this.chargeCustomer(order)
      await order.merge({ status: 'paid', chargeId: charge.id }).save()
      return charge
    })

    if (!acquired) {
      return { success: false, message: 'Payment already in progress' }
    }

    return { success: true, charge: result }
  }
}
```

By default, waits indefinitely until the lock becomes available. You can configure this behavior using options. 
Running immediately or not at all 
The method attempts to acquire the lock without waiting. If the lock is already held by another process, the callback does not execute. 

```
const [acquired, result] = await lock.runImmediately(async () => {
  // Only runs if lock was acquired immediately
})

if (!acquired) {
  // Lock was not available
}
```

Manual lock management 
For more control over the lock lifecycle, use the and methods directly. When using manual acquisition, you must ensure the lock is released, even if an error occurs. 

```
const acquired = await lock.acquire()

if (acquired) {
  try {
    // Perform protected operations
  } finally {
    await lock.release()
  }
}
```

The method attempts to acquire the lock without waiting and returns if successful. 

```
const acquired = await lock.acquireImmediately()

if (!acquired) {
  // Lock was not available, handle accordingly


… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/logger
Source: https://docs.adonisjs.com/guides/digging-deeper/logger

This guide covers logging in AdonisJS applications. You will learn how to:

*   Write logs during HTTP requests using the request-aware logger
*   Configure pretty-printed logs for development and file-based logs for production
*   Define multiple loggers for different parts of your application
*   Inject the logger into services using dependency injection
*   Create child loggers that inherit context from their parent
*   Protect sensitive data from appearing in log output

## Overview

AdonisJS includes an inbuilt logger for writing logs to the terminal, files, and external services. Under the hood, the logger uses [Pino](https://getpino.io/) , one of the fastest logging libraries in the Node.js ecosystem. Logs are produced in the [NDJSON format](https://github.com/ndjson/ndjson-spec) , making them easy to parse and process with standard tooling.

The logger integrates deeply with AdonisJS. During HTTP requests, each request automatically gets its own logger instance that includes the request ID in every log entry, making it straightforward to trace logs back to specific requests.

Note

This guide focuses on logging during HTTP requests. For CLI applications, see the [Ace ANSI logger documentation](https://docs.adonisjs.com/guides/ace/terminal-ui#displaying-log-messages) which provides terminal-friendly colored output designed for command-line tools.

## Writing your first log

Import the logger service and call any of the logging methods to write a message. During development, logs appear in your terminal with pretty formatting that includes timestamps, colors, and readable structure.

```
import router from '@adonisjs/core/services/router'
import logger from '@adonisjs/core/services/logger'

router.get('/', async () => {
  logger.info('Processing home page request')
  return { hello: 'world' }
})
```

When you visit the route, you'll see output like this in your terminal:

```
[10:24:36.842] INFO: Processing home page request
```

The logger provides methods for each log level, from most to least verbose:

```
import logger from '@adonisjs/core/services/logger'

export default class PostsController {
  async store() {
    logger.trace({ config }, 'Using config')      // Most verbose, for tracing execution
    logger.debug('User details: %o', { id: 1 })   // Debug information
    logger.info('Creating new post')              // General information
    logger.warn('Rate limit approaching')         // Warning conditions
    logger.error({ err }, 'Failed to save post')  // Error conditions
    logger.fatal({ err }, 'Database connection lost') // Critical failures
  }
}
```

### Adding context to logs

Pass an object as the first argument to include additional data in the log entry. The object properties are merged into the JSON output.

```
const user = { id: 1, email: 'virk@adonisjs.com' }
logger.info({ user }, 'User logged in')
```

When logging errors, use the `err` key so Pino's built-in serializer formats the error properly with stack traces:

```
try {
  await riskyOperation()
} catch (error) {
  logger.error({ err: error }, 'Operation failed')
}
```

### String interpolation

Log messages support printf-style interpolation for embedding values directly in the message string:

```
logger.info('User %s logged in from %s', username, ipAddress)
logger.debug('Request body: %o', requestBody)  // %o for objects
logger.info('Processing %d items', items.length) // %d for numbers
```

## Request-aware logging

During HTTP requests, use `ctx.logger` instead of importing the logger service directly. The context logger automatically includes the request ID in every log entry, making it easy to correlate all logs from a single request.

```
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async show({ logger, params }: HttpContext) {
    logger.info('Fetching user by id %s', params.id)
    
    const user = await User.find(params.id)
    if (!user) {
      logger.warn('User not found')
      return { error: 'Not found' }
    }
    
    logger.info('User retrieved successfully')
    return user
  }
}
```

The output includes the request ID, allowing you to filter logs for a specific request:

```
[10:24:36.842] INFO (request_id=cjkl3402k0001...): Fetching user by id 42
[10:24:36.901] INFO (request_id=cjkl3402k0001...): User retrieved successfully
```

## Configuring the logger

The logger configuration lives in `config/logger.ts`. The default setup uses pretty-printed output in development and structured JSON in production.

```
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, syncDestination, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      destination: !app.inProduction ? await syncDestination() : undefined,
      transport: {
        targets: [targets.file({ destination: 1 })],
      },
    },
  },
})

export default loggerConfig

declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
```

### Understanding the configuration

The `syncDestination()` helper configures synchronous, pretty-printed output for development. By default, Pino writes logs asynchronously for better performance, but this can make it harder to correlate logs with the code that produced them during debugging. The synchronous destination writes logs inline as your code executes, with human-readable formatting.

In production, the `destination` is left as `undefined`, which means logs flow through the configured transport targets. The `targets.file({ destination: 1 })` target writes JSON logs to stdout (file descriptor 1), which is the standard approach for containerized deployments where a log aggregator collects stdout.

### Configuration reference

| Property | Description |
| --- | --- |
| `default` | The name of the logger to use when calling `logger.info()` without specifying a logger |
| `enabled` | Set to `false` to disable the logger entirely |
| `name` | A name included in every log entry, useful for identifying the source application |
| `level` | The minimum level to log. Messages below this level are ignored |
| `destination` | A custom destination stream. Use `syncDestination()` for synchronous pretty output |
| `transport` | Configuration for Pino transports that process and route logs |

### Log levels

The logger supports six levels, ordered from most to least verbose. When you set a level, the logger produces logs at that level and above.

| Level | Value | Description |
| --- | --- | --- |
| `trace` | 10 | Extremely detailed tracing information |
| `debug` | 20 | Debug information useful during development |
| `info` | 30 | General operational information |
| `warn` | 40 | Warning conditions that should be reviewed |
| `error` | 50 | 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/mail
Source: https://docs.adonisjs.com/guides/digging-deeper/mail

Mail (Digging Deeper) - AdonisJS Documentation 

Deeper Mail 

Mail 
This guide covers sending emails from your AdonisJS application. You will learn how to: 
Configure mail transports for services like SMTP, Resend, Postmark, Mailgun, SparkPost, Brevo, and SES 
Send emails using the fluent Message API 
Queue emails for background delivery 
Organize emails into reusable mail classes 
Add attachments, embed images, and include calendar invites 
Test email functionality with the fake mailer 
Overview 
The package provides a unified API for sending emails through various providers. Built on top of  [link:https://nodemailer.com/] Nodemailer , it adds a fluent configuration API, support for organizing emails as classes, an extensive testing API, and background email delivery through messengers. 
The package introduces two key concepts. A transport is the underlying delivery mechanism (SMTP server, API service like Resend or Mailgun). A mailer is a configured instance of a transport that you use to send emails. You can configure multiple mailers in your application, each using different transports or the same transport with different settings, and switch between them at runtime. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/mail
```

You can pre-select transports during installation: 

```
node ace add @adonisjs/mail --transports=resend --transports=smtp
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider and command inside the file. 
adonisrc.ts 

```
{
  commands: [
    // ...other commands
    () => import('@adonisjs/mail/commands')
  ],
  providers: [
    // ...other providers
    () => import('@adonisjs/mail/mail_provider')
  ]
}
```

Creates the file. 

Defines the environment variables and their validations for the selected mail services. 

Configuration 
The mail configuration lives in . This file defines your mailers, default sender addresses, and transport settings. 
See also:  [link:https://github.com/adonisjs/mail/blob/-/stubs/config/mail.stub] Config stub 
config/mail.ts 

```
import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  /**
   * The mailer to use when none is specified
   */
  default: 'smtp',

  /**
   * Global "from" address used when not set on individual emails
   */
  from: {
    address: 'hello@example.com',
    name: 'My App',
  },

  /**
   * Global "reply-to" address used when not set on individual emails
   */
  replyTo: {
    address: 'support@example.com',
    name: 'My App Support',
  },

  /**
   * Configure one or more mailers. Each mailer uses a transport
   * and can have its own settings.
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
    }),

    resend: transports.resend({
      key: env.get('RESEND_API_KEY'),
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig
```

Option Description 
The mailer to use when you call without specifying one. 
Global sender address. Used unless overridden on individual emails. 
Global reply-to address. Used unless overridden on individual emails. 
An object containing your configured mailers. Each key is a mailer name, each value is a transport configuration. 

Transport configuration 
Each transport accepts provider-specific options. Pick a provider in the switcher below to configure it. 

SMTP 
Any standard SMTP server. 
Install the package with the SMTP transport. 

```
node ace add @adonisjs/mail --transports=smtp
```

Or register the mailer and environment variables in an existing setup. 
config/mail.ts 

```
{
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
      secure: false,

      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME'),
        pass: env.get('SMTP_PASSWORD'),
      },

      tls: {},
      ignoreTLS: false,
      requireTLS: false,
      pool: false,
      maxConnections: 5,
      maxMessages: 100,
    }),
  },
}
```

.env 

```
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
```

SMTP options are forwarded directly to Nodemailer. See also:  [link:https://nodemailer.com/smtp] Nodemailer SMTP documentation 

Resend 
Modern email API for developers. 
Install the package with the Resend transport. 

```
node ace add @adonisjs/mail --transports=resend
```

Or register the mailer and environment variables in an existing setup. 
config/mail.ts 

```
{
  mailers: {
    resend: transports.resend({
      key: env.get('RESEND_API_KEY'),
      baseUrl: 'https://api.resend.com',

      /**
       * Optional: Can be overridden at runtime
       */
      tags: [
        {
          name: 'category',
          value: 'confirm_email',
        },
      ],
    }),
  },
}
```

.env 

Configuration options are sent to Resend's  [link:https://resend.com/docs/api-reference/emails/send-email] API endpoint. 

Postmark 
Reliable transactional email delivery. 
Postmark is not part of the scaffolding, so register the mailer and its environment variable manually. 
config/mail.ts 

```
{
  mailers: {
    postmark: transports.postmark({
      key: env.get('POSTMARK_API_KEY'),
      baseUrl: 'https://api.postmarkapp.com',

      /**
       * Optional: Can be overridden at runtime
       */
      messageStream: 'outbound',
      tag: 'welcome',
      trackOpens: true,
      trackLinks: 'HtmlAndText',
      metadata: {
        userId: '1',
      },
    }),
  },
}
```

.env 

Configuration options are sent to Postmark's  [link:https://postmarkapp.com/developer/api/email-api#send-a-single-email] API endpoint. 

Mailgun 
Powerful email automation and APIs. 
Install the package with the Mailgun transport. 

```
node ace add @adonisjs/mail --transports=mailgun
```

Or register the mailer and environment variables in an existing setup. 
config/mail.ts 

```
{
  mailers: {
    mailgun: transports.mailgun({
      key: env.get('MAILGUN_API_KEY'),
      domain: env.get('MAILGUN_DOMAIN'),
      baseUrl: 'https://api.mailgun.net/v3',

      /**
       * Optional: Can be overridden at runtime
       */
      oDkim: true,
      oTags: ['transactional', 'adonisjs_app'],
      oDeliverytime: new Date(2024, 8, 18),
      oTestMode: false,
      oTracking: false,
      oTrackingClick: false,
      oTrackingOpens: false,
      headers: {},
      variables: {
        appId: '',
        userId: '',
      },
    }),
  },
}
```

.env 

```
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
```

Configuration options are sent to Mailgun's  [link:https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/messages/post-v3--domain-name--messages-mime] API endpoint. 

SparkPost 
High-volume, predictive email delivery. 
Install the package with the SparkPost transport. 

```
node ace add @adonisjs/mail --transports=sparkpost
```

Or register th

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/opentelemetry
Source: https://docs.adonisjs.com/guides/digging-deeper/opentelemetry

OpenTelemetry (Digging Deeper) - AdonisJS Documentation 

Deeper OpenTelemetry 

OpenTelemetry 
This guide covers OpenTelemetry integration in AdonisJS applications. You will learn how to: 
Install and configure the package 
Understand traces, spans, and attributes 
Use automatic instrumentation for HTTP, database, and Redis 
Create custom spans with helpers and decorators 
Propagate trace context across services 
Test your setup locally with Jaeger 
Overview 
OpenTelemetry is an open standard for collecting telemetry data from your applications: traces, metrics, and logs. The package provides a seamless integration between AdonisJS and OpenTelemetry, giving you distributed tracing and automatic instrumentation with sensible defaults. 
Observability is essential for understanding what happens inside your application, especially in production. When a user reports that "the checkout page is slow," tracing lets you see exactly where time is spent. Was it the database query? An external API call? A slow service? Without tracing, you're left guessing. 

This package handles the complexity of OpenTelemetry setup for you. Run a single command, and your application automatically traces HTTP requests, database queries, Redis operations, and more. 
OpenTelemetry concepts 
Before diving into the implementation, you should understand a few core OpenTelemetry concepts. For a comprehensive introduction, see the  [link:https://opentelemetry.io/docs/concepts/observability-primer/] official OpenTelemetry documentation . 
A trace represents the complete journey of a request through your system. When a user hits your API, the trace captures everything that happens: the HTTP request, database queries, cache lookups, calls to external services, and the response. 
A span is a single unit of work within a trace. Each database query, HTTP request, or function call can be a span. Spans have a start time, duration, name, and attributes (key-value metadata). Spans are nested hierarchically: a parent span for the HTTP request contains child spans for each database query made during that request. 
Attributes are key-value pairs attached to spans that provide context. For example, an HTTP span might have attributes like , 
```
http.route: /users/:id
```
, and 
```
http.status_code: 200
```
. 
Installation 
Install and configure the package using the following command. 

```
node ace add @adonisjs/otel
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/otel/otel_provider')
  ]
}
```

Registers the following middleware inside the file. 

```
router.use([
  () => import('@adonisjs/otel/otel_middleware')
])
```

Creates the file. 

Creates the file with OpenTelemetry initialization. 

Adds the import statement at the top of file. 

Defines the following environment variables and their validation rules. 

```
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=
```

That's it. Your application now has automatic tracing for HTTP requests, database queries, and more. 
Configuration 
The configuration file is located at . 
config/otel.ts 

```
import { defineConfig } from '@adonisjs/otel'
import env from '#start/env'

export default defineConfig({
  serviceName: env.get('APP_NAME'),
  serviceVersion: env.get('APP_VERSION'),
  environment: env.get('APP_ENV'),
})
```

Service identification 
The package resolves service metadata from multiple sources. 
string 

The name of your service. This value is resolved from or environment variables. 

```
export default defineConfig({
  serviceName: 'my-api'
})
```

string 

The version of your service. This value is resolved from the environment variable and defaults to . 

```
export default defineConfig({
  serviceVersion: '1.2.3'
})
```

string 

The environment where your service is running. This value is resolved from the environment variable and defaults to . 

```
export default defineConfig({
  environment: 'production'
})
```

Exporters 
By default, the package exports traces using OTLP over gRPC to . This is the standard OpenTelemetry Collector endpoint. If you're running an OpenTelemetry Collector locally or in your infrastructure, traces will be sent there automatically. 
You can configure the exporter endpoint using environment variables without changing any code. 

```
# title: .env
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector.example.com:4317
```

For authentication or custom headers: 

```
# title: .env
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-api-key
```

See the  [link:https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/] OpenTelemetry environment variable specification for all available options, and check Advanced configuration for even more customization. 
Multiple destinations (fan-out) 
When you need to export telemetry to multiple backends at once, use the option. 
The package provides a generic OTLP destination helper via . Each destination can receive all signals ( , , ) or only a subset. 
config/otel.ts 

```
import { defineConfig, destinations } from '@adonisjs/otel'

export default defineConfig({
  serviceName: 'my-app',

  destinations: {
    grafana: destinations.otlp({
      endpoint: 'https://grafana-otlp.example.com',
      headers: {
        Authorization: `Basic ${process.env.GRAFANA_BASIC_AUTH}`,
      },
      signals: 'all',
    }),

    honeycomb: destinations.otlp({
      endpoint: 'https://api.honeycomb.io',
      headers: {
        'x-honeycomb-team': process.env.HONEYCOMB_API_KEY!,
        'x-honeycomb-dataset': process.env.HONEYCOMB_DATASET!,
      },
      signals: 'all',
    }),
  },
})
```

When you set , the package automatically derives per-signal endpoints by appending: 

You can also provide explicit endpoints per signal: 
config/otel.ts 

```
import { defineConfig, destinations } from '@adonisjs/otel'

export default defineConfig({
  serviceName: 'my-app',

  destinations: {
    custom: destinations.otlp({
      signals: ['traces', 'logs'],
      endpoints: {
        traces: 'https://collector-a.example.com/v1/traces',
        logs: 'https://collector-b.example.com/v1/logs',
      },
    }),
  },
})
```

Note 
is optional. If you do not define it, the package keeps the default OpenTelemetry behavior and environment variable configuration ( , , 
```
OTEL_METRICS_EXPORTER
```
, ). 

Debug mode 
Enable debug mode to print spans to the console during development. 
config/otel.ts 

```
import { defineConfig } from '@adonisjs/otel'

export default defineConfig({
  serviceName: 'my-app',
  debug: true,
})
```

This adds a that outputs spans to your terminal, helping you visualize traces without setting up a collector. 
Enabling and disabling 
OpenTelemetry is automatically disabled when to avoid noise during tests. You can override this behavior. 
config/otel.ts 

```
import { defineConfig } from '@

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/queues
Source: https://docs.adonisjs.com/guides/digging-deeper/queues

Queues (Digging Deeper) - AdonisJS Documentation 

Deeper Queues 

Queues 
Warning 
The package is currently experimental. Its API may change between minor releases until it reaches a stable version. Pin the package version in your to avoid unexpected breaking changes during updates. 

This guide covers background job processing with queues in AdonisJS. You will learn how to: 
Install and configure the queue system with Redis or Database backends 
Create jobs and dispatch them for background processing 
Prevent duplicate jobs with dispatch-time deduplication 
Delay jobs, set priorities, and dispatch in batches 
Configure retry strategies with exponential, linear, or fixed backoff 
Schedule recurring jobs using cron expressions or intervals 
Start workers to process jobs from queues 
Test job dispatching with the fake adapter 
Overview 
Web applications often need to perform tasks that are too slow or resource-intensive to run during an HTTP request. Sending emails, generating reports, processing payments, or resizing images are all examples of work that should happen in the background so your users get an immediate response. 
The package provides a job queue system for AdonisJS, built on top of  [link:https://github.com/boringnode/queue] @boringnode/queue . You define jobs as classes with typed payloads, dispatch them from your application code, and run a separate worker process that picks up and executes those jobs. 
The package supports multiple backends. The Redis adapter is recommended for production, offering atomic operations and high throughput. The Database adapter uses your existing SQL database (PostgreSQL, MySQL, or SQLite) through Lucid. A Sync adapter is also available for development and testing, executing jobs immediately without a separate worker. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/queue
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider, commands, and preload file inside the file. 
adonisrc.ts 

```
{
  commands: [
    // ...other commands
    () => import('@adonisjs/queue/commands')
  ],
  providers: [
    // ...other providers
    () => import('@adonisjs/queue/queue_provider')
  ],
  preloads: [
    // ...other preloads
    () => import('#start/scheduler')
  ]
}
```

Creates the file. 

Creates the preload file for defining scheduled jobs. 

Defines the environment variable and its validation. 

If you select the database driver, creates a migration to set up queue tables. 

Configuration 
The configuration file lives at . It defines your adapters, the default adapter to use, worker settings, and the location of your job files. 
See also:  [link:https://github.com/adonisjs/queue/blob/-/stubs/config/queue.stub] Config stub 
config/queue.ts 

```
import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: env.get('QUEUE_DRIVER', 'redis'),

  adapters: {
    redis: drivers.redis({
      connectionName: 'main',
    }),
    sync: drivers.sync(),
  },

  worker: {
    concurrency: 5,
    idleDelay: '2s',
  },

  locations: ['./app/jobs/**/*.{ts,js}'],
})
```

string 

The name of the adapter to use by default when dispatching jobs. This value is typically set via the environment variable. 

Record<string, AdapterFactory> 

A record of named adapters. Each adapter is created using one of the helpers: , , or . You can configure multiple adapters and switch between them at runtime. 

WorkerConfig 

Configuration for the worker process. See Worker configuration for all available options. 

string[] 

An array of glob patterns that point to your job files. The queue system uses these patterns to auto-discover and register job classes. 
config/queue.ts 

```
{
  locations: ['./app/jobs/**/*.{ts,js}'],
}
```

RetryConfig 

Global retry configuration applied to all jobs unless overridden at the queue or job level. See Retries and backoff for details. 

Record<string, QueueConfig> 

Per-queue configuration allowing you to set different retry policies or default job options for specific queues. 
config/queue.ts 

```
{
  queues: {
    emails: {
      retry: {
        maxRetries: 5,
      },
    },
  },
}
```

JobOptions 

Default options applied to all jobs. Individual jobs can override these in their property. 

Adapter configuration 
Redis 
The Redis adapter uses your connection. It is the recommended choice for production due to its atomic operations and high throughput. 
config/queue.ts 

```
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: 'redis',
  adapters: {
    redis: drivers.redis({
      // Uses the 'main' connection from config/redis.ts
      connectionName: 'main',
    }),
  },
  // ...
})
```

You must have installed and configured for this adapter to work. 
Database 
The Database adapter uses your connection with PostgreSQL, MySQL, or SQLite. This is a good choice when you want to avoid adding Redis to your infrastructure. 
config/queue.ts 

```
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: 'database',
  adapters: {
    database: drivers.database({
      connectionName: 'primary',
    }),
  },
  // ...
})
```

When selecting the database driver during installation, a migration is automatically created. If you need to create the tables manually, use : 
database/migrations/xxxx_create_queue_tables.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'
import { QueueSchemaService } from '@adonisjs/queue'

export default class extends BaseSchema {
  async up() {
    const schemaService = new QueueSchemaService(this.db.getWriteClient())

    await schemaService.createJobsTable()
    await schemaService.createSchedulesTable()
  }

  async down() {
    const schemaService = new QueueSchemaService(this.db.getWriteClient())

    await schemaService.dropSchedulesTable()
    await schemaService.dropJobsTable()
  }
}
```

You must have installed and configured for this adapter to work. 
Sync 
The Sync adapter executes jobs immediately in the same process, without a separate worker. This is useful for development and testing when you want to see job results right away. 
config/queue.ts 

```
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: 'sync',
  adapters: {
    sync: drivers.sync(),
  },
  // ...
})
```

Tip 
You can use the environment variable to switch between adapters per environment. Use or in production and in development. 

Creating jobs 
A job is a class that encapsulates a unit of work to be executed in the background. Each job extends the base class with a typed payload. 
Generate a new job using the Ace command: 

```
node ace make:job process_payment
```

This creates a job class at 
```
app/jobs/process_payment.ts
```
: 
app/jobs/process_payment.ts 

```
import { J

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/digging-deeper/server-sent-events
Source: https://docs.adonisjs.com/guides/digging-deeper/server-sent-events

Server-Sent Events (Digging Deeper) - AdonisJS Documentation 

Deeper Server-Sent Events 

Transmit 
This guide covers real-time server-to-client communication with Transmit in AdonisJS. You will learn how to: 
Install and configure Transmit for Server-Sent Events 
Register routes and broadcast events to connected clients 
Define channels and authorize access to private channels 
Set up the client library to receive events in real time 
Synchronize events across multiple server instances using transports 
Authenticate clients for private channel subscriptions 
Listen to lifecycle hooks for monitoring connections 
Test broadcasts and channel authorization with Japa 
Overview 
Transmit is a native Server-Sent Events (SSE) module for AdonisJS. It provides a unidirectional communication channel from server to client, allowing you to push real-time updates without the overhead of WebSockets. Because SSE uses standard HTTP, it works through firewalls and proxies that might block WebSocket connections. 
Transmit works as a publish/subscribe system built around channels. The server broadcasts messages to named channels, and clients subscribe to the channels they care about. You can protect channels with authorization callbacks to control who receives updates, making it suitable for both public broadcasts and private, user-specific notifications. 
For client-to-server communication, you continue to use standard HTTP requests. Transmit only handles the server-to-client push. 
Installation 
Install and configure the server-side package using the following command: 

```
node ace add @adonisjs/transmit
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 
adonisrc.ts 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/transmit/transmit_provider')
  ]
}
```

Creates the file. 

Also install the client library in your frontend application: 

```
npm install @adonisjs/transmit-client
```

Configuration 
The configuration file lives at . It controls keep-alive behavior and multi-instance synchronization. 
See also:  [link:https://github.com/adonisjs/transmit/blob/-/stubs/config/transmit.stub] Config stub 
config/transmit.ts 

```
import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  pingInterval: false,
  transport: null,
})
```

Duration | false 

Controls how often ping messages are sent to keep SSE connections alive. Accepts a number in milliseconds, a duration string like or , or to disable pings. 
config/transmit.ts 

```
import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  pingInterval: '30s',
  transport: null,
})
```

object | null 

Configures the transport layer for synchronizing events across multiple server instances. Set to for single-instance deployments. 
See Multi-instance synchronization for configuration details. 

Registering routes 
Transmit requires three HTTP routes to handle client connections, subscriptions, and unsubscriptions. Register them in your routes file using the method. 
start/routes.ts 

```
import transmit from '@adonisjs/transmit/services/main'

transmit.registerRoutes()
```

This registers the following routes: 
Route Method Purpose 
GET Establishes the SSE connection 
POST Subscribes the client to a channel 

```
__transmit/unsubscribe
```
POST Unsubscribes the client from a channel 

Applying middleware to routes 
The method accepts an optional callback to modify each registered route. This is useful for applying middleware, such as requiring authentication for the SSE connection. 
start/routes.ts 

```
import transmit from '@adonisjs/transmit/services/main'
import { middleware } from '#start/kernel'

transmit.registerRoutes((route) => {
  route.middleware(middleware.auth())
})
```

You can apply middleware conditionally based on the route pattern. 
start/routes.ts 

```
import transmit from '@adonisjs/transmit/services/main'
import { middleware } from '#start/kernel'

transmit.registerRoutes((route) => {
  // Only require authentication for the SSE connection
  if (route.getPattern() === '__transmit/events') {
    route.middleware(middleware.auth())
  }
})
```

Broadcasting events 
Import the transmit service and call the method to send data to all subscribers of a channel. 
app/controllers/posts_controller.ts 

```
import transmit from '@adonisjs/transmit/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async store({ request }: HttpContext) {
    const post = await Post.create(request.all())

    // Broadcast the new post to all subscribers
    transmit.broadcast('posts', { id: post.id, title: post.title })

    return post
  }
}
```

Excluding specific clients 
Use to send a message to all subscribers except one or more specific clients. This is useful when the sender should not receive their own message. 
app/controllers/messages_controller.ts 

```
import transmit from '@adonisjs/transmit/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class MessagesController {
  async store({ request }: HttpContext) {
    const { uid, content } = request.all()

    // Send to everyone in the chat except the sender
    transmit.broadcastExcept('chats/1/messages', { content }, uid)
  }
}
```

The third argument accepts a single UID string or an array of UIDs to exclude. 
Channels 
Channel names are case-sensitive strings that support alphanumeric characters and forward slashes. Use forward slashes to create hierarchical structures that match your application's resources. 

```
// Public channel for global notifications
transmit.broadcast('notifications', { message: 'System update' })

// Resource-specific channel
transmit.broadcast('chats/1/messages', { content: 'Hello!' })

// User-specific channel
transmit.broadcast('users/42', { type: 'profile_updated' })
```

Authorizing channels 
By default, any client can subscribe to any channel. Use the method to restrict access to sensitive channels. Create a preload file to define your authorization rules. 

```
node ace make:preload transmit
```

Authorization callbacks receive the current and the extracted channel parameters. Return to allow access or to deny it. 
start/transmit.ts 

```
import transmit from '@adonisjs/transmit/services/main'

// Only allow users to subscribe to their own channel
transmit.authorize<{ id: string }>('users/:id', (ctx, { id }) => {
  return ctx.auth.user?.id === +id
})
```

Channel patterns use the same parameter syntax as AdonisJS routes. Parameters are extracted from the channel name at subscription time and passed to the authorization callback. 
start/transmit.ts 

```
import transmit from '@adonisjs/transmit/services/main'
import Chat from '#models/chat'

transmit.authorize<{ chatId: string }>(
  'chats/:chatId/messages',
  async (ctx, { chatId }) => {
    const chat = await Chat.findOrFai

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
