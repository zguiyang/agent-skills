# Adonisjs - Guides

**Pages:** 71

---

## Static file server - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/static-file-server

**Contents:**
- Static files server
- Overview
- Installation
- Configuration
- Serving static files
- public directory vs resources directory
- Copying static files to production
- See also

This guide covers serving static files in AdonisJS applications. You will learn how to:

The static file server lets you serve files directly from the file system without creating route handlers for each file. This is essential for assets that don't need processing, like favicons, robots.txt files, user uploads, or downloadable PDFs.

Without a static file server, you would need to create individual routes for every file you want to serve. This quickly becomes unmaintainable:

With the static middleware, all files in the public directory are automatically available. The middleware intercepts HTTP requests before they reach your routes. If a file matching the request path exists, it serves the file with appropriate HTTP headers for caching and performance. If no file exists, the request continues to your route handlers as normal.

The key distinction in AdonisJS: files in the public directory are served as-is without any processing, while files in the resources directory are processed by your assets bundler (like Vite). Use public for files that are already in their final form.

The @adonisjs/static package comes pre-configured with the web starter kit. If you're using a different starter kit, you can install and configure it manually.

Install and configure the package using the following command:

Installs the @adonisjs/static package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/static.ts file.

Registers the following middleware inside the start/kernel.ts file.

The configuration for the static middleware is stored in the config/static.ts file.

The enabled property allows you to temporarily disable the middleware without removing it from the middleware stack. This is useful when debugging or testing different configurations. Set it to false to stop serving static files while keeping the middleware registered.

The etag property controls whether the server generates ETags for cache validation. ETags help browsers determine if their cached version of a file is still valid without downloading it again.

When a browser requests a file it has cached, it sends the ETag value. If the file hasn't changed, the server responds with a 304 Not Modified status, saving bandwidth. This is enabled by default and should generally stay enabled for production.

The lastModified property enables the Last-Modified header. The server uses the file's modification time from the file system (the stat.mtime property) as the header value.

Browsers can use this header along with ETags for cache validation. Like ETags, this is enabled by default.

The dotFiles property defines how to handle requests for files starting with a dot (like .env or .gitignore). You can set one of three values: 'ignore' (default), 'deny', or 'allow'.

The 'ignore' option pretends dot files don't exist and returns a 404 status code. This is the recommended setting for security. The 'deny' option explicitly denies access with a 403 status code. The 'allow' option serves dot files like any other file.

Setting dotFiles to 'allow' can expose sensitive files like .env or .git directories if they're accidentally placed in the public folder. The 'ignore' setting (default) is recommended for security. It returns a 404 response as if the file doesn't exist, preventing information disclosure.

If you need to serve specific files for domain verification (like .well-known/acme-challenge for SSL certificates), create a subdirectory without a leading dot and configure your verification tool to use that path instead.

The acceptRanges property allows browsers to resume interrupted downloads instead of restarting from the beginning. When enabled, the server adds an Accept-Ranges header to responses. This is particularly useful for large files like videos or software downloads. The property defaults to true.

The cacheControl property enables the Cache-Control header. This header tells browsers and CDNs how long to cache files before checking for updates. When enabled, you can use the maxAge and immutable properties to fine-tune caching behavior.

The maxAge property sets the max-age directive for the Cache-Control header. This tells browsers how long they can cache the file before checking for updates. You can specify the value in milliseconds or as a time expression string like '30 mins', '1 day', or '1 year'.

The immutable property adds the immutable directive to the Cache-Control header. This tells browsers that the file will never change during its cache lifetime, allowing more aggressive caching.

Use this for files with versioned or hashed filenames (like app-v2.css or bundle-abc123.js). By default, immutable is disabled.

The immutable directive only works when maxAge is also set. If you enable immutable without setting maxAge, browsers will ignore it. This prevents accidental long-term caching without an explicit expiration time.

The headers property accepts a function that returns custom HTTP headers for specific files. The function receives the file path as the first argument and the file stats object as the second argument. This allows you to set different headers based on file type, size, or other attributes.

The function should return an object where keys are header names and values are header values. If the function returns undefined or doesn't return anything, no additional headers are added for that file.

Once the middleware is registered, you can create files inside the public directory and access them in the browser using their file path. For example, the ./public/css/style.css file can be accessed at http://localhost:3333/css/style.css.

Here's what a typical public directory looks like in production:

Each of these files would be accessible at its corresponding URL:

Understanding when to use the public directory versus the resources directory is crucial for organizing your application's assets correctly.

Use the public directory for files that are already in their final form and don't need any processing:

Use the resources directory with an assets bundler for files that need compilation or optimization:

A common mistake is placing source files (like .scss or modern .ts) in the public directory and expecting them to be compiled. The static middleware serves files exactly as they are without any processing. Source files that need compilation should go in the resources directory and be processed by Vite or your assets bundler.

The files in your public directory are automatically copied to the build folder when you run the node ace build command. This ensures your static files are available in production alongside your compiled application code.

The rule for copying public files is defined in the adonisrc.ts file:

The pattern property uses glob syntax to match all files inside the public directory. The reloadServer: false setting indicates that changes to these files during development don't require restarting the development server.

If you add files to the public directory while your development server is running, you don't need to restart. The static middleware will serve them immediately. However, if you modify the config/static.ts file, you will need to restart the server for the configuration changes to take effect.

**Examples:**

Example 1 (lua):
```lua
// Without static middleware - tedious and error-prone
router.get('/favicon.ico', async ({ response }) => {
  return response.download('public/favicon.ico')
})
router.get('/robots.txt', async ({ response }) => {
  return response.download('public/robots.txt')
})
router.get('/images/logo.png', async ({ response }) => {
  return response.download('public/images/logo.png')
})
// ... potentially hundreds of routes
```

Example 2 (elixir):
```elixir
node ace add @adonisjs/static
```

Example 3 (lua):
```lua
{
      providers: [
        // ...other providers
        () => import('@adonisjs/static/static_provider')
      ]
    }
```

Example 4 (dart):
```dart
server.use([
      () => import('@adonisjs/static/static_middleware')
    ])
```

---

## Cache - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/cache

**Contents:**
- Cache
- Overview
- Installation
- Configuration
  - Available drivers
- Storing and retrieving data
  - Getting and setting values
  - Checking for existence
  - Pulling values
- Deleting data

This guide covers caching in AdonisJS applications. You will learn how to:

The @adonisjs/cache package provides a unified caching API for your AdonisJS application. Built on top of Bentocache, it goes beyond simple key-value storage by offering multi-tier caching, cache stampede protection, grace periods, and more.

The package introduces two key concepts. A driver is the underlying storage mechanism (Redis, in-memory, database). A store is a configured caching layer that combines one or more drivers. You can configure multiple stores in your application, each with different drivers and settings, and switch between them at runtime.

Multi-tier caching is the standout feature. By combining an in-memory L1 cache with a distributed L2 cache (like Redis), you get the speed of local memory with the persistence and scalability of a shared cache. This setup can deliver responses between 2,000x and 5,000x faster compared to single-tier approaches.

Install and configure the package using the following command:

Installs the @adonisjs/cache package using the detected package manager.

Registers the following service provider and command inside the adonisrc.ts file.

Creates the config/cache.ts file.

Defines the environment variables and their validations for the selected drivers.

The cache configuration lives in config/cache.ts. This file defines your stores, the default store, and driver-specific settings.

See also: Config stub

Uses Redis as a distributed cache. Requires the @adonisjs/redis package to be installed and configured. Compatible with Redis, Upstash, Vercel KV, Valkey, KeyDB, and DragonFly.

See also: Redis setup guide

Uses an in-memory LRU (Least Recently Used) cache. Best suited as an L1 layer in a multi-tier setup or for single-instance applications.

Uses your database as a cache store. Requires @adonisjs/lucid. The cache table is created automatically by default.

Uses AWS DynamoDB as a cache store. Requires @aws-sdk/client-dynamodb. You must create the table beforehand with a string partition key named key and TTL enabled on the ttl attribute.

Import the cache service to interact with your cache. All cache operations are available through the cache object.

The most common pattern is getOrSet. It tries to find a value in the cache and, if missing, executes the factory function to compute the value, stores it, and returns it.

You can also use get and set independently when you need more control over the flow.

Cached data must be serializable to JSON. If you are caching Lucid models, call .toJSON() or .serialize() before storing them, or use getOrSet which handles serialization automatically.

Use has and missing to check whether a key exists in the cache without retrieving its value.

The pull method retrieves a value and immediately deletes it from the cache. This is useful for one-time-use data like flash messages or temporary tokens.

Remove individual entries with delete, multiple entries with deleteMany, or all entries with clear.

Tags let you group related cache entries so you can invalidate them together. This is especially useful when a change affects multiple cached values. For example, when a post is updated, you can invalidate all pages that might display it.

You can assign multiple tags to a single entry. An entry is invalidated when any of its tags is invalidated.

Avoid using too many tags per entry. BentoCache uses client-side tagging, which means each retrieval checks tag invalidation timestamps. A large number of tags per entry can slow down lookups.

Namespaces group cache keys under a common prefix, allowing you to clear all entries in a namespace without affecting the rest of your cache.

When you configure multiple stores, you can switch between them using the use method. Without it, the default store is used.

Multi-tier caching combines a fast in-memory L1 cache with a persistent distributed L2 cache. This is the recommended setup for production applications running multiple instances.

When you read a value, the cache checks the L1 (in-memory) layer first. If the value is found, it returns immediately without any network call. If missing, it fetches from the L2 (Redis) layer, stores a copy in L1, and returns it.

When you write or delete a value, both layers are updated. A bus notifies other application instances to evict their stale L1 entries, so every instance stays consistent.

Combine useL1Layer, useL2Layer, and useBus to create a multi-tier store.

If your application runs on a single instance, you can omit the bus. The bus is only necessary when multiple instances need to synchronize their L1 caches.

The bus sends only invalidation messages (not the actual values) to other instances. When an instance receives an invalidation message, it removes the key from its L1 cache. The next read will fetch the updated value from L2.

Grace periods allow you to serve slightly stale cached data while refreshing the value in the background. This makes your application resilient to temporary outages in your data source (database downtime, API failures).

When a cached entry expires but remains within its grace period, the cache returns the stale value to the caller and triggers a background refresh. If the refresh fails (because the database is down, for example), the stale value continues to be served instead of returning an error.

When a factory call fails during the grace period, you probably do not want to retry on every subsequent request. The graceBackoff option sets a delay between retry attempts.

You can also enable grace periods globally in your configuration so you do not have to repeat them on every operation.

A cache stampede occurs when a cache entry expires and many concurrent requests all try to regenerate it at the same time, overwhelming your data source. BentoCache prevents this automatically.

When the first request finds a missing or expired key, it acquires a lock and executes the factory function. All other concurrent requests for the same key wait for the lock to release and then receive the cached result. This means only one factory execution happens, regardless of how many requests arrive simultaneously.

For example, if 10,000 requests hit an expired key at the same time, only one database query is made. The other 9,999 requests receive the cached result once it is available. This protection is built in and requires no configuration.

Timeouts prevent slow factory functions from blocking your responses. BentoCache supports two types.

A soft timeout works alongside grace periods. If the factory takes longer than the timeout and a stale entry exists in the grace window, the stale value is returned immediately while the factory continues running in the background.

Soft timeouts only take effect when a stale entry is available in the grace period. If no stale entry exists (first-time cache population), the request waits for the factory to complete.

A hard timeout sets an absolute limit on how long to wait for the factory. If exceeded, an exception is thrown. The factory continues executing in the background so the cache will be populated for subsequent requests.

You can combine both timeouts. The soft timeout returns stale data quickly, and the hard timeout acts as a safety net.

Adaptive caching lets you dynamically adjust cache options based on the data being cached. This is useful when the ideal TTL depends on the actual value.

The factory function receives a context object with helper methods to adjust cache behavior after inspecting the fetched data.

The context object also provides:

The cache service is available in your Edge templates. You can use it to display cached values directly in your views.

The @adonisjs/cache package provides Ace commands for managing your cache from the terminal.

Remove all entries from a store, namespace, or tag.

Remove a specific key from the cache.

Remove expired entries from drivers that do not support automatic TTL expiration (like the database and filesystem drivers). Redis handles expiration natively and does not need pruning.

All methods are available on the cache object imported from @adonisjs/cache/services/main. They are also available on instances returned by cache.use() and cache.namespace().

Try to get a value from cache. If missing, execute the factory, cache the result, and return it.

Retrieve a value from the cache. Returns undefined if the key does not exist.

Store a value in the cache with an optional TTL.

Store a value in the cache that never expires.

Check if a key exists in the cache.

Check if a key does not exist in the cache.

Retrieve a value from the cache and delete it immediately.

Remove a single key from the cache.

Remove multiple keys from the cache.

Remove all entries associated with the given tags.

Remove all entries from the cache (or from the current namespace).

Return a namespace instance. All operations on the returned instance are scoped to the namespace.

Return a specific store instance by name.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/cache
```

Example 2 (lua):
```lua
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

Example 3 (elixir):
```elixir
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

Example 4 (json):
```json
{
  stores: {
    redis: store()
      .useL2Layer(drivers.redis({
        connectionName: 'main',
      }))
  }
}
```

---

## Hashing - AdonisJS

**URL:** https://docs.adonisjs.com/guides/security/hashing

**Contents:**
- Hashing
- Overview
- Installation
- Basic usage
  - Creating hashes
  - Verifying passwords
- Choosing an algorithm
  - When to choose Argon2
  - When to choose Bcrypt
  - When to choose Scrypt

This guide covers password hashing in AdonisJS applications. You will learn how to:

Password hashing converts plain text passwords into irreversible strings that can be safely stored in your database. Unlike encryption, hashing is a one-way process. You cannot convert a hash back to the original password. Instead, you verify passwords by hashing the input and comparing it to the stored hash.

AdonisJS provides a hash service with built-in support for three industry-standard algorithms: Argon2, Bcrypt, and Scrypt. The service stores hashes in PHC string format, a standardized encoding that embeds the algorithm parameters directly in the hash output.

If you're using the @adonisjs/auth module with Lucid models, password hashing and verification are handled automatically by the AuthFinder mixin. This guide focuses on direct usage of the hash service for cases where you need more control or aren't using the authentication module.

The hash service is included with @adonisjs/core and requires no additional installation for the default Scrypt driver. Scrypt uses Node.js's built-in crypto module, making it available immediately without external dependencies.

For Argon2 or Bcrypt, you must install their respective npm packages.

After installing a package, update your hash configuration to use the new driver.

The hash service provides two primary methods: hash.make for creating hashes and hash.verify for validating passwords against existing hashes.

The hash.make method accepts a plain text string and returns a hash in PHC format.

The hash.verify method compares a plain text password against a stored hash. It returns true if they match, false otherwise.

Each hashing algorithm offers different tradeoffs between security, performance, and compatibility. The right choice depends on your application's requirements.

Argon2 is the recommended choice for new applications. It won the 2015 Password Hashing Competition and provides configurable memory hardness, making it resistant to both GPU-based attacks and specialized hardware. The id variant (the default) combines protection against GPU attacks and side-channel attacks.

Bcrypt remains a solid choice when you need compatibility with existing systems or other platforms. Its security properties are well-understood after decades of analysis. However, be aware that Bcrypt truncates passwords at 72 bytes, so longer passwords are effectively shortened before hashing.

Bcrypt silently truncates passwords longer than 72 bytes. If your application accepts very long passwords or passphrases, users may be able to authenticate with only the first 72 bytes of their password. Consider using Argon2 or Scrypt if this is a concern.

Scrypt is the default driver because it requires no additional npm packages. It uses Node.js's built-in crypto module, making it ideal for applications where minimizing dependencies matters. With proper configuration, Scrypt provides security comparable to Argon2.

The hash configuration lives in config/hash.ts. You define available drivers in the list object and specify which one to use by default.

Argon2 provides fine-grained control over memory usage, iteration count, and parallelism. These parameters directly affect both security and performance.

Define the Argon2 variant.

Algorithm version defined as hex. 0x10 (1.0) or 0x13 (1.3).

Time cost. Higher values increase computation time and security.

Memory cost in KiB. Each parallel thread uses this amount. Higher values resist GPU attacks.

Number of parallel threads for computing the hash.

Length of the random salt in bytes.

Length of the raw hash output in bytes. The final PHC string will be longer.

Argon2 supports an optional secret (sometimes called a "pepper") that adds an additional layer of protection. Unlike the salt which is stored with the hash, the secret is kept separately, typically in environment variables. Even if an attacker obtains your database, they cannot crack the hashes without the secret.

If you add a secret to an existing application, all previously hashed passwords become invalid because they were created without the secret and cannot be verified with it. You must either reset all passwords or implement a migration strategy that rehashes passwords on next login.

Bcrypt configuration centers on the rounds parameter, which controls the computational cost through exponential scaling.

Cost factor as a power of 2. A value of 10 means 2^10 (1024) iterations. Each increment doubles the computation time.

Length of the random salt in bytes.

Bcrypt version identifier. Use '2b' (current) unless you need compatibility with older '2a' hashes.

Scrypt uses memory-hard functions that make attacks expensive on both GPUs and specialized hardware.

CPU/memory cost parameter (N). Must be a power of 2. Higher values increase security and resource usage.

Block size parameter (r). Increases memory usage linearly.

Parallelization parameter (p). Values above 1 allow parallel computation.

Length of the random salt in bytes.

Maximum memory in bytes (32 MiB default). Node.js throws if computed memory exceeds this.

Length of the derived key in bytes.

Security best practices evolve over time, and you may need to strengthen your hashing parameters by increasing iterations, memory usage, or switching algorithms entirely. The PHC format makes this straightforward because each hash contains the parameters used to create it.

The hash.needsReHash method checks whether a stored hash was created with parameters that differ from your current configuration.

Rehashing during login is the standard approach because it's the only time you have access to the plain text password. Over time, as users log in, their passwords gradually migrate to your updated configuration.

Switching from one algorithm to another follows the same pattern as parameter updates. When you change the default driver, needsReHash returns true for any hash created with a different algorithm.

Keep your old driver configured until all users have logged in and their passwords have been rehashed. Removing the old driver before migration completes will prevent users with old hashes from authenticating. Monitor your database to track migration progress before removing the old configuration.

Some applications need to verify hashes created by different systems or support multiple hashing strategies simultaneously. The hash.use method lets you explicitly select a driver.

Each driver specified in hash.use() must be configured in your config/hash.ts file's list object.

If you're not using the @adonisjs/auth module's AuthFinder mixin, you can hash passwords automatically using Lucid model hooks. The $dirty check ensures the password is only hashed when the field has actually changed, preventing rehashing on every save.

Password hashing is intentionally slow, as that's what makes it secure. However, this can significantly slow down your test suite, especially when creating many users through factories. The hash.fake method replaces the real implementation with a fast, insecure version suitable only for testing.

The fake implementation stores plain text and compares strings directly. Always call hash.restore() to prevent the fake from leaking into other tests.

The PHC (Password Hashing Competition) string format is a standardized way to encode hashes that embeds all the information needed to verify them. A PHC string looks like this:

The format breaks down into sections separated by $:

This self-describing format provides several benefits. The verification process can read parameters directly from the hash, allowing you to verify old hashes even after changing your configuration. The needsReHash method compares embedded parameters against current settings to detect when hashes need updating. You can also switch algorithms without losing the ability to verify existing passwords.

For specialized requirements, you can create custom hash drivers. A driver must implement the HashDriverContract interface with four methods: make, verify, isValidHash, and needsReHash.

Register your custom driver in the hash configuration.

**Examples:**

Example 1 (markdown):
```markdown
# For Argon2 (recommended for new applications)
npm i argon2

# For Bcrypt
npm i bcrypt
```

Example 2 (python):
```python
import hash from '@adonisjs/core/services/hash'

export default class UserService {
  async createUser(email: string, password: string) {
    /**
     * Hash the password before storing. The output includes
     * the algorithm, parameters, salt, and hash in one string.
     */
    const hashedPassword = await hash.make(password)
    
    // hashedPassword looks like:
    // $scrypt$n=16384,r=8,p=1$randomsalt$hashoutput...
    
    return User.create({ email, password: hashedPassword })
  }
}
```

Example 3 (javascript):
```javascript
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'

export default class AuthService {
  async validateCredentials(email: string, password: string) {
    const user = await User.findBy('email', email)
    if (!user) {
      return null
    }

    /**
     * Compare the plain text password against the stored hash.
     * The verify method extracts algorithm parameters from the
     * hash itself, so it works even if you've changed your config.
     */
    const isValid = await hash.verify(user.password, password)
    
    return isValid ? user : null
  }
}
```

Example 4 (sql):
```sql
import { defineConfig, drivers } from '@adonisjs/core/hash'

export default defineConfig({
  /**
   * The default driver used by hash.make() and hash.verify()
   * when no driver is explicitly specified.
   */
  default: 'scrypt',

  list: {
    scrypt: drivers.scrypt({
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      saltSize: 16,
      maxMemory: 33554432,
      keyLength: 64,
    }),

    /**
     * Uncomment after installing: npm i argon2
     */
    // argon: drivers.argon2({
    //   version: 0x13,
    //   variant: 'id',
    //   iterations: 3,
    //   memory: 65536,
    //   parallelism: 4,
    //   saltSize: 16,
    //   hashLength: 32,
    // }),

    /**
     * Uncomment after installing: npm i bcrypt
     */
    // bcrypt: drivers.bcrypt({
    //   rounds: 10,
    //   saltSize: 16,
    //   version: '2b',
    // }),
  },
})
```

---

## Request - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/request

**Contents:**
- Request
- Overview
- Reading request body and files
  - Accessing the entire request body
  - Accessing specific fields
  - Accessing uploaded files
  - Available methods
- Reading request query string and route params
  - Accessing query string parameters
  - Accessing route parameters

This guide covers working with HTTP requests in AdonisJS. You will learn about:

The Request class holds all the information related to an HTTP request, including the request body, uploaded files, query string, URL, method, headers, and cookies. You access it via the request property of HttpContext, which is available in route handlers, middleware, and exception handlers.

The request body contains data sent by the client, typically from HTML forms or API requests. AdonisJS uses the bodyparser to automatically parse the request body based on the Content-Type header, converting JSON, form data, and multipart data into JavaScript objects you can easily work with.

Use the all method to retrieve all data from the request body as an object. This is useful when you want to process all submitted fields together.

Type safety and validation: The request body data is not type-safe because the bodyparser only collects and parses the raw request data, it does not validate it. Use the validation system to ensure both runtime safety and TypeScript type safety for your request data.

Use the input method when you need to read a specific field from the request body. This method accepts a field name and an optional default value if the field doesn't exist.

You can also use the only method to retrieve multiple specific fields, or the except method to retrieve all fields except certain ones.

Files uploaded through multipart form data are available using the file method. The method returns a file object with metadata and methods for validation and storage.

See also: File uploads guide for detailed file handling and storage

You can validate files at the time of accessing them by providing validation options.

File validation approaches: You can validate files either when accessing them with request.file() or using the validator. The validator approach is recommended as it provides consistent validation alongside other request data and better error handling.

Query strings and route parameters are two different ways to pass data through URLs. The query string is the portion after the ? in a URL (like ?page=1&limit=10), while route parameters are dynamic segments defined in your route pattern (like /posts/:id).

Use the qs method to retrieve all query string parameters as an object.

You can access individual query parameters using the input method, which works for both body data and query string parameters.

Route parameters are available through the param method or by accessing the params object directly. The params object is also available directly on HttpContext.

Request metadata includes information about how the request was made, where it came from, and what the client expects in response. This includes HTTP headers, the request method (GET, POST, etc.), the requested URL, and the client's IP address.

Use the header method to read a specific header value. Header names are case-insensitive.

You can retrieve all headers using the headers method.

The request method (GET, POST, PUT, DELETE, etc.) is available through the method method.

Use the url method to get the request URL without the domain and protocol, or completeUrl to get the full URL including domain.

The ip method returns the client's IP address. When your application is behind a reverse proxy or load balancer, you need to configure trusted proxies to correctly detect the real client IP.

The ips method returns an array of IP addresses when the request has passed through multiple proxies.

Cookies are small pieces of data stored in the client's browser and sent with every request. AdonisJS provides methods to read both plain and signed/encrypted cookies through the Request class.

Use the cookie method to read a signed cookie value. By default all cookies are signed.

Use encryptedCookie for encrypted cookies. This method automatically decrypt and verify the cookie value.

Every HTTP request in AdonisJS is assigned a unique request ID. This ID is useful for distributed tracing, logging, and correlating related operations across your application and microservices.

Use the id method to retrieve the unique identifier assigned to the current request.

AdonisJS generates request IDs using one of these methods, in order of preference.

You must enable request ID generation in config/app.ts file for AdonisJS to generate request ids (incase X-Request-Id header is missing).

Request IDs are particularly valuable in distributed systems where a single user request might trigger operations across multiple services. By logging the request ID with every operation, you can trace the complete flow of a request through your system.

Content negotiation allows your application to serve different response formats or languages based on what the client accepts. The Request class provides methods to read the Accept, Accept-Language, Accept-Charset, and Accept-Encoding headers and match them against the formats your application supports.

Use the accepts method to determine the best response format based on the client's Accept header. This is useful when your API can return data in multiple formats like JSON, HTML, or XML.

The types method returns all accepted content types in order of client preference.

Use the language method to determine the best language based on the client's Accept-Language header. This helps serve content in the user's preferred language.

The languages method returns all accepted languages in order of client preference.

When your application runs behind a reverse proxy (like Nginx) or load balancer, you need to configure which proxy IP addresses to trust. This allows AdonisJS to correctly read the X-Forwarded-* headers that proxies add to requests.

The trustProxy option accepts any value supported by the proxy-addr package. Common configurations include:

By default, AdonisJS extracts the client IP address from the request using standard methods. However, when running behind proxies or CDNs like Cloudflare, you may need to extract the IP from custom headers.

The getIp method receives the Node.js IncomingMessage object and must return a string IP address or undefined to fall back to default behavior. This is useful when working with CDNs that provide the real client IP in custom headers.

**Examples:**

Example 1 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  const body = request.all()
  console.log(body)
  // { fullName: 'John Doe', email: 'john@example.com', password: 'secret' }
})
```

Example 2 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  const email = request.input('email')
  const newsletter = request.input('newsletter', false)
  
  console.log(email)
  console.log(newsletter)
})
```

Example 3 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  /**
   * Get only fullName and email, ignoring other fields
   */
  const credentials = request.only(['fullName', 'email'])
  console.log(credentials)
  
  /**
   * Get all fields except password
   */
  const safeData = request.except(['password'])
  console.log(safeData)
})
```

Example 4 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

router.post('/avatar', ({ request }) => {
  const avatar = request.file('avatar')
  console.log(avatar)
})
```

---

## Access tokens guard - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/access-tokens-guard

**Contents:**
- Access tokens guard
- Overview
- Configuring the User model
- Creating the tokens table
- Issuing tokens
  - Token abilities
  - Token expiration
  - Token names
- Configuring the guard
- Authenticating requests

This guide covers token-based authentication in AdonisJS. You will learn:

Access tokens authenticate HTTP requests in contexts where the server cannot use cookies. This includes native mobile apps, desktop applications, third-party API integrations, and web applications hosted on a different domain than your API.

AdonisJS uses opaque access tokens rather than JWTs. An opaque token is a cryptographically secure random string with no embedded data. The token is hashed and stored in your database, and verification happens by comparing the provided token against the stored hash. This approach allows you to revoke tokens instantly by deleting them from the database, something that's not possible with JWTs until they expire.

A token consists of three parts: a configurable prefix (oat_ by default), the random token value, and a CRC32 checksum. The prefix and checksum help secret scanning tools identify leaked tokens in codebases.

Before using the access tokens guard, configure a tokens provider on your User model. The provider handles creating, storing, and verifying tokens.

The DbAccessTokensProvider.forModel method accepts the User model as its first argument and an optional configuration object as its second:

The add command creates a migration for the tokens table when you select the access tokens guard. Run the migration to create the table:

If you're configuring access tokens manually, create the migration yourself:

Use the tokens provider on your User model to create tokens. The create method accepts a user instance and returns an AccessToken object:

The token.value property contains the actual token string wrapped in a Secret object. Call .release() to get the plain string value. This value is only available at creation time. Once the response is sent, the plain token cannot be retrieved again because only its hash is stored.

You can also return the token object directly, which serializes to JSON automatically:

Abilities let you restrict what a token can do. For example, you might issue a token that can read projects but not create or delete them.

Abilities are stored as an array of strings. Define whatever abilities make sense for your application. Common patterns include resource-based abilities (projects:read, users:delete) and role-based abilities (admin, editor).

To allow all abilities, use the wildcard:

Check abilities when handling requests:

The AccessToken class provides these methods for checking abilities:

Set an expiration time when creating a token:

You can also set a default expiration in the provider configuration, which applies to all tokens unless overridden.

Assign names to tokens so users can identify them in a management interface:

After setting up the tokens provider, configure the authentication guard in config/auth.ts:

The tokensGuard method creates an instance of AccessTokensGuard.

The tokensUserProvider method accepts two options:

Clients include the token in the Authorization header as a bearer token:

Apply the auth middleware to routes that require authentication:

The middleware throws E_UNAUTHORIZED_ACCESS if the token is missing, invalid, or expired.

To authenticate without the middleware, call auth.authenticate() or auth.authenticateUsing():

Use auth.isAuthenticated to check if the request is authenticated:

Use auth.getUserOrFail() instead of auth.user! to avoid the non-null assertion operator:

After successful authentication, the guard attaches the token to user.currentAccessToken. Use this to check abilities, expiration, or other token properties:

The guard updates the last_used_at column each time a token is used for authentication.

If you reference the User model with currentAccessToken elsewhere in your codebase (such as in Bouncer abilities), declare the property on your model to avoid type errors:

Retrieve all tokens for a user with the all method:

The all method returns both valid and expired tokens. Filter or label expired tokens in your UI:

Delete a token by its identifier:

When using access tokens as your primary authentication method (common for mobile apps), the guard provides createToken and invalidateToken methods that mirror the session guard's login and logout:

When verifying credentials fails, User.verifyCredentials throws E_INVALID_CREDENTIALS. For API clients, include an Accept: application/json header to receive JSON error responses instead of redirects.

If your API is accessed exclusively via access tokens (not from a browser), you may want to disable CSRF protection for API routes. See the shield configuration reference for details.

The access tokens guard emits events during authentication. See the events reference guide for the complete list.

**Examples:**

Example 1 (gdscript):
```gdscript
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
```

Example 2 (css):
```css
static accessTokens = DbAccessTokensProvider.forModel(User, {
  expiresIn: '30 days',
  prefix: 'oat_',
  table: 'auth_access_tokens',
  type: 'auth_token',
  tokenSecretLength: 40,
})
```

Example 3 (unknown):
```unknown
node ace migration:run
```

Example 4 (unknown):
```unknown
node ace make:migration auth_access_tokens
```

---

## Queues - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/queues

**Contents:**
- Queues
- Overview
- Installation
- Configuration
  - Adapter configuration
    - Redis
    - Database
    - Sync
- Creating jobs
  - Job options

The @adonisjs/queue package is currently experimental. Its API may change between minor releases until it reaches a stable version. Pin the package version in your package.json to avoid unexpected breaking changes during updates.

This guide covers background job processing with queues in AdonisJS. You will learn how to:

Web applications often need to perform tasks that are too slow or resource-intensive to run during an HTTP request. Sending emails, generating reports, processing payments, or resizing images are all examples of work that should happen in the background so your users get an immediate response.

The @adonisjs/queue package provides a job queue system for AdonisJS, built on top of @boringnode/queue. You define jobs as classes with typed payloads, dispatch them from your application code, and run a separate worker process that picks up and executes those jobs.

The package supports multiple backends. The Redis adapter is recommended for production, offering atomic operations and high throughput. The Database adapter uses your existing SQL database (PostgreSQL, MySQL, or SQLite) through Lucid. A Sync adapter is also available for development and testing, executing jobs immediately without a separate worker.

Install and configure the package using the following command:

Installs the @adonisjs/queue package using the detected package manager.

Registers the following service provider, commands, and preload file inside the adonisrc.ts file.

Creates the config/queue.ts file.

Creates the start/scheduler.ts preload file for defining scheduled jobs.

Defines the QUEUE_DRIVER environment variable and its validation.

If you select the database driver, creates a migration to set up queue tables.

The configuration file lives at config/queue.ts. It defines your adapters, the default adapter to use, worker settings, and the location of your job files.

See also: Config stub

The name of the adapter to use by default when dispatching jobs. This value is typically set via the QUEUE_DRIVER environment variable.

A record of named adapters. Each adapter is created using one of the drivers helpers: drivers.redis(), drivers.database(), or drivers.sync(). You can configure multiple adapters and switch between them at runtime.

Configuration for the worker process. See Worker configuration for all available options.

An array of glob patterns that point to your job files. The queue system uses these patterns to auto-discover and register job classes.

Global retry configuration applied to all jobs unless overridden at the queue or job level. See Retries and backoff for details.

Per-queue configuration allowing you to set different retry policies or default job options for specific queues.

Default options applied to all jobs. Individual jobs can override these in their static options property.

The Redis adapter uses your @adonisjs/redis connection. It is the recommended choice for production due to its atomic operations and high throughput.

You must have @adonisjs/redis installed and configured for this adapter to work.

The Database adapter uses your @adonisjs/lucid connection with PostgreSQL, MySQL, or SQLite. This is a good choice when you want to avoid adding Redis to your infrastructure.

When selecting the database driver during installation, a migration is automatically created. If you need to create the tables manually, use QueueSchemaService:

You must have @adonisjs/lucid installed and configured for this adapter to work.

The Sync adapter executes jobs immediately in the same process, without a separate worker. This is useful for development and testing when you want to see job results right away.

You can use the QUEUE_DRIVER environment variable to switch between adapters per environment. Use redis or database in production and sync in development.

A job is a class that encapsulates a unit of work to be executed in the background. Each job extends the Job base class with a typed payload.

Generate a new job using the make:job Ace command:

This creates a job class at app/jobs/process_payment.ts:

The Job class provides two methods to implement:

Configure default behavior for your job by setting the static options property.

The queue to dispatch this job to. Defaults to 'default'.

Maximum number of retry attempts before the job fails permanently. Defaults to 3.

Job priority from 1 to 10. Lower numbers are processed first. Defaults to 5.

Maximum execution time before the job is timed out. Accepts a number in milliseconds or a duration string like '30s' or '5m'. No timeout by default.

Whether to mark the job as permanently failed on timeout. When false, the job is retried instead. Defaults to true.

Retry configuration specific to this job, overriding global and queue-level settings. See Retries and backoff.

Controls whether completed jobs are kept in the history. Set to true to remove immediately (default), false to keep forever, or an object with age and/or count constraints.

Controls whether failed jobs are kept in the history. Same format as removeOnComplete.

During execution, you can access metadata about the current job through this.context:

For long-running jobs, you can check this.signal to detect when a timeout has been reached and handle it gracefully:

Jobs are instantiated through the AdonisJS IoC container, so you can use constructor injection to access services:

Dispatch a job from anywhere in your application using the static dispatch method. The job payload is type-safe, matching the generic parameter defined on the job class.

The dispatch method returns a fluent builder that lets you customize job behavior before sending it to the queue:

Send the job to a specific queue instead of the default one.

Set the job priority. Lower numbers are processed first (1 = highest priority, 10 = lowest).

Delay job execution by a specified duration. Accepts milliseconds or a string like '5m', '1h', '7d'.

Assign a group identifier for organizing related jobs. Useful for tracking batch operations.

Use a specific adapter for this job instead of the default one.

When you need to dispatch many jobs of the same type, use dispatchMany for better performance. It uses batched operations (Redis pipelines or SQL batch inserts) under the hood.

When a job throws an error, the queue system automatically retries it according to the configured retry policy. You can configure retries at three levels, with more specific settings taking priority: job > queue > global.

A backoff strategy controls the delay between retry attempts. The package provides four built-in strategies:

Exponential backoff doubles the delay with each attempt: 1s, 2s, 4s, 8s, and so on. This is the recommended strategy for most use cases since it prevents overwhelming failing services.

Linear backoff increases the delay by the base amount each attempt: 5s, 10s, 15s, 20s, and so on.

Fixed backoff uses the same delay for every retry: 10s, 10s, 10s, and so on.

Custom backoff gives you full control over the strategy configuration:

Enable jitter on exponential and linear strategies to add randomness to retry delays. This prevents multiple failed jobs from retrying at the exact same time, which can overload downstream services (a pattern known as "thundering herd").

You can override the retry configuration for specific jobs:

Scheduled jobs run automatically at defined intervals or cron expressions. Define your schedules in the start/scheduler.ts preload file.

Use a cron expression for precise scheduling:

For simpler use cases, schedule jobs at a fixed interval:

The schedule builder supports the following options:

A cron expression defining when the job should run. Mutually exclusive with .every().

A duration interval between runs. Mutually exclusive with .cron().

A custom identifier for the schedule. Defaults to the job class name. If a schedule with this ID already exists, it will be updated.

An IANA timezone for evaluating cron expressions. Defaults to 'UTC'.

Start boundary. No jobs will be dispatched before this date.

End boundary. No jobs will be dispatched after this date.

Shorthand for setting both .from() and .to().

Maximum number of times the schedule will run.

You can manage schedules programmatically using the Schedule class:

The package provides Ace commands for managing schedules from the terminal:

Jobs are not processed until you start a worker. The worker is a long-running process that polls the queue for available jobs and executes them.

Start the worker using the queue:work Ace command:

You must start the worker as a separate process alongside your web server. Jobs dispatched from your application will not be processed until a worker is running.

In production, use a process manager like PM2 or a container orchestrator to keep the worker running and restart it on failure.

Configure worker behavior in your config/queue.ts file:

Maximum number of jobs processed simultaneously. Defaults to 1.

How long the worker waits before polling again when no jobs are available. Defaults to '2s'.

Global maximum execution time for any job. Can be overridden per job via JobOptions.timeout. No timeout by default.

How long a job can run before it is considered stalled (the worker may have crashed). Defaults to '30s'.

How often the worker checks for stalled jobs. Defaults to '30s'.

Maximum number of times a stalled job can be recovered before it is permanently failed. Defaults to 1.

When true, the worker finishes running jobs before stopping on SIGINT/SIGTERM signals. Defaults to true.

The package provides a fake adapter that records dispatched jobs in memory and exposes assertion helpers. This lets you verify that your application dispatches the right jobs without actually processing them.

Use QueueManager.fake() to replace all adapters with the fake adapter, and QueueManager.restore() to revert back:

The fake adapter provides the following assertion methods:

Assert that a job was dispatched. Optionally filter by queue, payload, or delay.

Assert that a job was not dispatched.

Assert the total number of dispatched jobs, optionally filtered by queue.

Assert that no jobs were dispatched at all.

You can use functions for more complex payload matching:

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/queue
```

Example 2 (lua):
```lua
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

Example 3 (python):
```python
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

  locations: ['./app/jobs/**/*.ts'],
})
```

Example 4 (json):
```json
{
  locations: ['./app/jobs/**/*.ts'],
}
```

---

## Basic auth guard - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/basic-auth-guard

**Contents:**
- Basic auth guard
- Overview
- Configuring the guard
- Configuring the User model
- Authenticating requests
  - Using the auth middleware
  - Manual authentication
- Next steps

This guide covers authenticating HTTP requests using the HTTP Basic Authentication protocol. You will learn:

The Basic auth guard implements the HTTP authentication framework. The client sends credentials as a base64-encoded string in the Authorization header with each request. For example, Authorization: Basic am9obkBleGFtcGxlLmNvbTpzZWNyZXQ= contains the email and password for a user.

Basic authentication is stateless because the server does not maintain any persistent sessions or issue tokens. Instead, the client must include the credentials in every request. Because credentials are sent in plain (only base64 encoded), basic authentication must always be used over HTTPS in production.

While simple to set up, basic authentication is not recommended for production applications due to the lack of modern security features like MFA or account management. It is primarily used during early development or for simple internal tools.

First, define the basic auth guard in your config/auth.ts file. You must import basicAuthGuard and basicAuthUserProvider from the @adonisjs/auth/basic_auth module.

The basicAuthUserProvider uses your User model to find and verify credentials. It expects the model to have a verifyCredentials static method, which is typically provided by the AuthFinder mixin.

The basicAuthUserProvider works with any Lucid model that represents your user entity. During installation, the add command generates a User model with the withAuthFinder mixin applied.

Clients must include the Authorization header with the word Basic followed by a space and the base64-encoded credentials (usually email:password).

Apply the auth middleware to routes that require authentication. The middleware automatically reads the header, verifies the credentials using the configured provider, and attaches the user to the HTTP context.

The middleware throws E_UNAUTHORIZED_ACCESS if the credentials are missing or invalid.

To authenticate without the middleware, call auth.authenticate() or auth.authenticateUsing().

Basic authentication performs a database lookup and password verification on every request. This is computationally expensive compared to session or token-based authentication. If performance is a concern, consider moving to the Session guard or Access tokens guard as your application grows.

**Examples:**

Example 1 (javascript):
```javascript
import { defineConfig } from '@adonisjs/auth'
import { basicAuthGuard, basicAuthUserProvider } from '@adonisjs/auth/basic_auth'

const authConfig = defineConfig({
  default: 'basic',
  guards: {
    basic: basicAuthGuard({
      provider: basicAuthUserProvider({
        model: () => import('#models/user'),
      }),
    }),
  },
})

export default authConfig
```

Example 2 (javascript):
```javascript
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

/**
 * Applying the withAuthFinder mixin adds the verifyCredentials
 * static method to your model.
 */
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

Example 3 (yaml):
```yaml
Authorization: Basic am9obkBleGFtcGxlLmNvbTpzZWNyZXQ=
```

Example 4 (elixir):
```elixir
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('/projects', async ({ auth }) => {
    /**
     * The auth.user property is now the authenticated user.
     * Use auth.getUserOrFail() to avoid non-null assertions.
     */
    const user = auth.getUserOrFail()
    return user.related('projects').query()
  })
  .use(middleware.auth({ guards: ['basic'] }))
```

---

## Scaffolding and codemods - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/scaffolding

**Contents:**
- Scaffolding and codemods
- Overview
- Building blocks
- Creating a configure hook
    - Set up the package structure
    - Install @adonisjs/assembler as a peer dependency
    - Export the stubs root
    - Write the configure function
    - Export from the package entry point
- Creating stubs

This guide covers the scaffolding and codemods system in AdonisJS. You will learn how to:

When you run node ace configure @adonisjs/lucid, the package automatically registers its provider, sets up environment variables, and creates a config file in your project. This seamless setup experience is powered by AdonisJS's scaffolding and codemods system.

Scaffolding refers to generating source files from templates called stubs. Codemods are programmatic transformations that modify existing TypeScript source files by parsing and manipulating the AST (Abstract Syntax Tree). Together, they allow package authors to provide the same polished configure experience that official AdonisJS packages offer.

The codemods API is powered by ts-morph and lives in the @adonisjs/assembler package. Since assembler is a development dependency, ts-morph never bloats your production bundle.

Before diving into the tutorial, let's briefly define the key components you'll work with.

Stubs are template files (with a .stub extension) that generate source files. They use Tempura, a lightweight handlebars-style template engine.

Generators are helper functions that enforce AdonisJS naming conventions. They transform input like user into properly formatted names like UsersController or users_controller.ts.

Codemods are high-level APIs for common modifications like registering providers, adding middleware, or defining environment variables. They handle the complexity of AST manipulation for you.

Configure hooks are functions exported by packages that run when a user executes node ace configure <package-name>. This is where you combine stubs and codemods to set up your package.

The most common use of scaffolding and codemods is creating a configure hook for an AdonisJS package. Let's build one step-by-step using a cache package as our example.

A typical AdonisJS package with a configure hook has this structure:

The stubs directory contains your template files, configure.ts holds the configure function, and index.ts exports everything including the configure hook.

The codemods API requires @adonisjs/assembler, which must be installed as a peer dependency in your package. This is important because the host application already has assembler installed as a dev dependency, and it should be shared across all configured packages rather than duplicated.

When users install your package and run node ace configure, the assembler from their project will be used.

Create a stubs/main.ts file that exports the path to your stubs directory. This path is needed when calling makeUsingStub.

The configure function receives the Configure command instance, which provides access to the codemods API. Here's a complete example for a cache package:

Export the configure function from your package's main entry point so the node ace configure command can find it:

When users run node ace configure @adonisjs/cache, AdonisJS imports this file and executes the exported configure function.

Stubs are template files that generate source code. They combine static content with dynamic values computed at runtime.

Stubs use double curly braces for variable interpolation. Here's a simple config stub.

Since Tempura's syntax is compatible with Handlebars, configure your editor to use Handlebars syntax highlighting for .stub files.

The exports function at the top defines metadata about the generated file, most importantly the destination path. The app variable provides access to application paths like configPath, makePath, and httpControllersPath.

When creating stubs that need to follow AdonisJS naming conventions, use the generators module. Generators transform user input into properly formatted names.

The {{#var ...}} syntax creates inline variables within the stub. This approach keeps all the naming logic inside the stub itself, which becomes important when users eject stubs to customize them.

When calling makeUsingStub, pass a data object as the third argument. These values become available in the stub template:

Every stub has access to these built-in variables:

Beyond configure hooks, you can use stubs in your own Ace commands. This is useful for creating scaffolding commands like make:resource or make:service.

Host applications can customize stub templates by ejecting them. The node ace eject command copies stubs from a package into the project's stubs directory.

This copies the controller stub from @adonisjs/core to stubs/make/controller/main.stub in your project. Any future make:controller calls will use your customized version.

Copy an entire directory of stubs:

By default, eject copies from @adonisjs/core. Use the --pkg flag for other packages:

Scaffolding commands share CLI flags with stub templates through the flags variable. You can use this to create custom workflows:

Each package stores its stubs in a stubs directory at the package root. Visit the package's GitHub repository to see what's available.

When you call makeUsingStub, the following happens:

The codemods API provides high-level methods for common source file modifications. All methods are available on the codemods instance returned by command.createCodemods().

The codemods API relies on AdonisJS's default file structure and naming conventions. If you've made significant changes to your project structure, some codemods may not work as expected.

Register providers, commands, meta files, and command aliases in adonisrc.ts.

Add environment variables to .env and .env.example files.

To omit the value from .env.example (useful for secrets), use the omitFromExample option:

This inserts API_KEY=secret-key-here in .env and API_KEY= in .env.example.

Add validation rules to start/env.ts. The codemod does not overwrite existing rules, respecting any customizations the user has made.

Register middleware to one of the middleware stacks: server, router, or named.

Register a Japa testing plugin in tests/bootstrap.ts.

Register bouncer policies in app/policies/main.ts.

Register a Vite plugin in vite.config.ts.

Install npm packages using the project's detected package manager.

**Examples:**

Example 1 (lua):
```lua
my-cache-package/
├── src/
│   └── ...
├── stubs/
│   ├── config.stub
│   └── main.ts
├── configure.ts
├── index.ts
└── package.json
```

Example 2 (json):
```json
{
  "name": "@adonisjs/cache",
  "peerDependencies": {
    "@adonisjs/assembler": "^7.0.0"
  }
}
```

Example 3 (javascript):
```javascript
export const stubsRoot = import.meta.url
```

Example 4 (javascript):
```javascript
import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.ts'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Register the provider and commands in the adonisrc.ts file
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile
      .addProvider('@adonisjs/cache/cache_provider')
      .addCommand('@adonisjs/cache/commands')
  })

  /**
   * Add environment variables to .env and .env.example files
   */
  await codemods.defineEnvVariables({
    CACHE_STORE: 'redis',
  })

  /**
   * Add validation rules to start/env.ts
   */
  await codemods.defineEnvValidations({
    variables: {
      CACHE_STORE: `Env.schema.string()`,
    },
  })

  /**
   * Create the config/cache.ts file from a stub
   */
  await codemods.makeUsingStub(stubsRoot, 'config.stub', {
    store: 'redis',
  })
}
```

---

## Securing SSR apps - AdonisJS

**URL:** https://docs.adonisjs.com/guides/security/securing-ssr-applications

**Contents:**
- Securing server-rendered applications
- Overview
- CSRF protection
  - Protecting forms
  - Handling CSRF errors
  - Enabling CSRF tokens for Ajax requests
  - Exempting routes from CSRF protection
  - CSRF configuration reference
- CSP (Content Security Policy)
  - Enabling CSP

This guide covers security features for AdonisJS server-rendered applications. You will learn how to:

Web applications face constant security threats. Attackers exploit vulnerabilities like form submission forgery, malicious script injection, and clickjacking to compromise your users. The @adonisjs/shield package provides a unified defense layer that protects your server-rendered AdonisJS applications from these common attacks.

Shield works by adding security-focused HTTP headers and middleware to your application. Rather than configuring each protection separately, Shield gives you a single package with sensible defaults that you can customize as needed. All protections are configured through config/shield.ts, making it easy to audit and adjust your security posture.

The package comes pre-configured with the web starter kit. If you need to install it manually, ensure you have the @adonisjs/session package configured first, as Shield depends on sessions to store CSRF tokens.

Installs the @adonisjs/shield package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/shield.ts file.

Registers the following middleware inside the start/kernel.ts file.

CSRF (Cross-Site Request Forgery) attacks trick authenticated users into submitting malicious requests without their knowledge. Imagine a user is logged into your banking application. While browsing another site, that malicious site includes a hidden form that submits a money transfer request to your bank. Because the user's browser automatically includes their session cookie, the bank processes the transfer as if the user intended it.

Shield prevents CSRF attacks by requiring a secret token with every form submission. This token is generated server-side and embedded in your forms. Since attackers cannot access this token from their malicious site, their forged requests will be rejected.

Once Shield is configured, all form submissions without a valid CSRF token will fail automatically. You must include the token in every form using the csrfField Edge helper, which renders a hidden input field containing the token.

The helper generates a hidden input field that Shield's middleware validates on submission.

Shield raises an E_BAD_CSRF_TOKEN exception when a token is missing or invalid. By default, AdonisJS redirects the user back to the form with an error flash message. You can display this message in your template using the @error tag.

For custom error handling, you can catch the exception in your global exception handler. This is useful when you want to render a custom error page or return a specific response format.

Single-page applications and interactive interfaces often submit forms via JavaScript instead of traditional form submissions. For these cases, Shield can expose the CSRF token in a cookie that your frontend code can read.

When enableXsrfCookie is enabled, Shield stores the token in an encrypted cookie named XSRF-TOKEN. Frontend libraries like Axios automatically read this cookie and include it as an X-XSRF-TOKEN header with every request.

Only enable enableXsrfCookie if your application makes Ajax requests. For traditional server-rendered forms that use full page submissions, the hidden input field is sufficient and more secure.

API endpoints that receive webhooks or requests from external services cannot include CSRF tokens. You can exempt specific routes using the exceptRoutes option.

For dynamic exemption logic, pass a function that receives the HTTP context and returns a boolean.

XSS (Cross-Site Scripting) attacks inject malicious scripts into your pages. An attacker might exploit a comment form that doesn't sanitize input, injecting JavaScript that steals user cookies or redirects them to phishing sites. Even with proper input sanitization, XSS vulnerabilities can slip through.

CSP provides a second line of defense by telling browsers which sources of content are trusted. When you define a CSP policy, browsers will block any scripts, styles, or other resources that don't match your allowed sources. Even if an attacker manages to inject a script tag, the browser refuses to execute it because it wasn't loaded from a trusted source.

CSP is disabled by default because policies must be tailored to your application's needs. Enable it and define your directives in the configuration file.

The defaultSrc directive acts as a fallback for any resource type you don't explicitly configure. The 'self' keyword allows resources from your own domain. Each directive controls a specific resource type: scriptSrc for JavaScript, styleSrc for CSS, fontSrc for fonts, and so on.

You can find the complete list of available directives at content-security-policy.com.

Inline scripts and styles are blocked by default under CSP because they're a common XSS attack vector. However, you may need inline code for legitimate purposes. Nonces (number used once) allow specific inline blocks while keeping the general policy strict.

Add the @nonce keyword to your directives, then include the nonce attribute on your inline script and style tags using the cspNonce variable available in Edge templates.

Shield generates a unique nonce for each request. Attackers cannot predict this value, so even if they inject a script tag, it won't have a valid nonce and the browser will block it.

When using Vite for asset bundling, you need to allow assets from the Vite dev server during development. Shield provides special keywords for this purpose.

The @viteDevUrl keyword resolves to the Vite development server URL, while @viteHmrUrl allows the WebSocket connection for hot module replacement.

If you deploy bundled assets to a CDN, replace @viteDevUrl with @viteUrl. This keyword allows assets from both the development server and your production CDN.

Vite currently does not support adding nonce attributes to style tags it injects into the DOM during development. This is a known limitation being addressed by the Vite team. Until resolved, you may need to use 'unsafe-inline' for styleSrc during development, then switch to nonce-based policies in production.

A misconfigured CSP can break your application by blocking legitimate resources. Use reportOnly mode to test your policy without enforcement. In this mode, browsers report violations but don't block resources.

Create an endpoint to collect violation reports. This helps you identify resources you forgot to whitelist before enabling enforcement.

Once you've verified your policy isn't blocking legitimate resources, set reportOnly to false to enable enforcement.

When users type your domain without https://, browsers first connect over insecure HTTP before redirecting to HTTPS. This brief window allows attackers to intercept the initial request through man-in-the-middle attacks, potentially downgrading the connection or stealing sensitive data.

HSTS tells browsers to always use HTTPS for your domain, even when users type http:// or click plain HTTP links. After receiving the HSTS header, browsers automatically upgrade all requests to HTTPS for the specified duration, eliminating the insecure redirect window.

The maxAge option tells browsers how long to remember the HTTPS-only policy. The includeSubDomains option extends this protection to all subdomains, preventing attackers from exploiting insecure subdomains to compromise your main domain.

Only enable HSTS after confirming HTTPS works correctly across your entire domain and all subdomains. Once browsers cache the HSTS policy, they will refuse to connect over HTTP for the duration of maxAge. If your HTTPS configuration breaks, users won't be able to access your site until you fix it or the cached policy expires.

Start with a short maxAge (like 1 day) during testing, then increase it to 180 days or longer once you're confident in your HTTPS setup.

Clickjacking attacks embed your site in an invisible iframe on a malicious page. The attacker overlays deceptive content, tricking users into clicking buttons on your hidden site. A user might think they're clicking a "Play Video" button, but they're actually clicking "Delete Account" on your application.

The X-Frame-Options header prevents your pages from being embedded in frames on other sites.

The DENY action blocks all framing. If you need to embed your site in frames on your own domain (like for an admin panel preview), use SAMEORIGIN instead.

To allow a specific external domain to frame your content, use ALLOW-FROM with the domain.

If you've configured CSP, you can use the frame-ancestors directive instead of X-Frame-Options. The CSP directive offers more flexibility, including support for multiple domains. When using frame-ancestors, you can disable the xFrame guard to avoid redundant headers.

Browsers try to be helpful by guessing content types when servers don't specify them correctly. If your server accidentally serves a user-uploaded file with the wrong content type, browsers might "sniff" the content and execute it as a script. An attacker could upload a file that looks like an image but contains JavaScript, and the browser might execute it.

The X-Content-Type-Options: nosniff header tells browsers to trust the Content-Type header and never guess. This prevents content-type confusion attacks.

This guard has no additional configuration options. When enabled, Shield adds the X-Content-Type-Options: nosniff header to all responses.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/shield
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/shield/shield_provider'),
  ]
}
```

Example 3 (dart):
```dart
router.use([() => import('@adonisjs/shield/shield_middleware')])
```

Example 4 (lua):
```lua
<form method="POST" action="/posts">
  {{-- Renders a hidden input with the CSRF token --}}
  {{ csrfField() }}

  <input type="text" name="title" placeholder="Post title">
  <textarea name="content" placeholder="Write your post..."></textarea>
  <button type="submit">Create Post</button>
</form>
```

---

## I18n - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/i18n

**Contents:**
- Internationalization and Localization
- Overview
- Installation
- Configuration
  - Configuration options
  - Configuring fallback locales
  - Configuring supported locales
- Storing translations
  - Translation file format
- Resolving translations

This guide covers internationalization (i18n) and localization in AdonisJS applications. You will learn how to:

When building applications for a global audience, you need two capabilities: localization (translating text into multiple languages) and internationalization (formatting values like dates, numbers, and currencies according to regional conventions). The @adonisjs/i18n package provides both.

Localization involves writing translations for each language your application supports and referencing them in Edge templates, validation messages, or directly via the i18n API. Instead of hardcoding strings like "Welcome back!" throughout your codebase, you store translations in dedicated files and look them up by key. This makes it straightforward to add new languages without modifying your application code.

Internationalization handles the formatting side. The same date might display as "January 10, 2026" in the US but "10 janvier 2026" in France. The i18n package uses the browser-standard Intl API under the hood, giving you locale-aware formatting for numbers, currencies, dates, times, and more.

The package integrates with AdonisJS through middleware that detects the user's preferred language from the Accept-Language header, creates a locale-specific i18n instance, and makes it available throughout the request lifecycle via HTTP Context.

Install and configure the package using the following command:

Installs the @adonisjs/i18n package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/i18n.ts file.

Creates detect_user_locale_middleware inside the middleware directory.

Registers the following middleware inside the start/kernel.ts file.

The configuration for the i18n package is stored within the config/i18n.ts file.

See also: Config stub

When a translation is missing for a specific locale, the i18n package can fall back to a related language before using the default locale. This is useful for regional variants.

By default, the package infers supported locales from your translation files. If you have translation directories for en, fr, and es, those become your supported locales automatically. To explicitly define supported locales, use the supportedLocales option.

Translations are stored in the resources/lang directory. Create a subdirectory for each language using the IETF language tag format (like en, fr, de).

For regional variants, create subdirectories with the region code. AdonisJS automatically falls back from regional to base translations when a key is missing.

See also: ISO language codes

Store translations in .json or .yaml files. You can create nested directories for better organization.

Translations use the ICU message syntax, which supports interpolation, pluralization, and formatting.

To look up and format translations, create a locale-specific instance of the I18n class using the i18nManager.locale method.

Use the .t method to format a translation by its key. The key follows the pattern filename.path.to.key.

Each I18n instance has a pre-configured fallback language based on your fallbackLocales configuration. When a translation is missing for the main language, the fallback is used.

When a translation is missing in both the main and fallback locales, the .t method returns an error string.

To replace this with a custom fallback value, pass it as the second parameter.

For a global fallback strategy, define a fallback function in your config. This function receives the translation path and locale code, and must return a string.

The detect_user_locale_middleware created during installation handles locale detection automatically. It reads the Accept-Language header from incoming requests, creates an I18n instance for the detected locale, and shares it via HTTP Context.

With this middleware active, you can access translations in controllers and Edge templates.

In Edge templates, use the t helper function.

The middleware is part of your application codebase, so you can modify the getRequestLocale method to use custom detection logic. For example, you might read the locale from a user's profile, a cookie, or a URL parameter instead of the Accept-Language header.

The detect_user_locale_middleware hooks into the Request validator to provide validation messages from your translation files.

Store validation translations in a validator.json file under the shared key. Define messages for validation rules or specific field + rule combinations.

During HTTP requests, the middleware automatically registers a custom messages provider for validation. When using VineJS outside of HTTP requests (in Ace commands or queue jobs), register the messages provider explicitly.

The ICU (International Components for Unicode) message format is the standard for storing translations that need dynamic content. It supports interpolation, number formatting, date formatting, pluralization, and gender-based selection.

Reference dynamic values using single curly braces.

The ICU messages syntax does not support nested data sets. You can only access properties from a flat object during interpolation. If you need nested data, flatten it before passing to the translation function.

To include HTML in translations, use three curly braces in Edge templates to prevent escaping.

Format numeric values using the {key, number, format} syntax. The format can include number skeletons for precise control.

More formatting examples:

Format Date objects or Luxon DateTime instances using the {key, date, format} or {key, time, format} syntax.

ICU provides many patterns, but only the following are available via the ECMA402 Intl API:

ICU has first-class support for pluralization. The plural format selects different text based on a numeric value.

The # token is a placeholder for the numeric value, formatted according to locale rules.

The {key, plural, matches} syntax matches values to these categories:

The select format chooses output by matching a value against multiple options. This is useful for gender-specific text or other categorical choices.

The selectordinal format handles ordinal numbers (1st, 2nd, 3rd, etc.) according to locale rules.

The ordinal categories are the same as plural categories (zero, one, two, few, many, other, =value).

The i18n package provides methods for formatting values according to locale conventions. These methods use the Node.js Intl API with optimized performance.

Format numeric values using the Intl.NumberFormat class.

See: Intl.NumberFormat options

Format a numeric value as currency. This method sets style: 'currency' automatically.

Format a Date object or Luxon DateTime instance using the Intl.DateTimeFormat class.

See: Intl.DateTimeFormat options

Format a date value as a time string. This method sets timeStyle: 'medium' by default.

Format a value as relative time (like "in 2 hours" or "3 days ago") using the Intl.RelativeTimeFormat class.

Use the 'auto' unit to automatically select the most appropriate unit.

See: Intl.RelativeTimeFormat options

Find the plural category for a number using the Intl.PluralRules class. This is useful when you need to handle pluralization in code rather than in translation strings.

See: Intl.PluralRules options

Format an array of strings as a human-readable list using the Intl.ListFormat class.

See: Intl.ListFormat options

Format codes for currencies, languages, regions, and calendars as human-readable names using the Intl.DisplayNames class.

See: Intl.DisplayNames options

The i18n Ally extension for VSCode provides inline translation previews, missing translation detection, and quick editing. To configure it for AdonisJS, create two files in your .vscode directory.

Subscribe to the i18n:missing:translation event to track missing translations in your application. This is useful for logging or alerting during development.

The i18n package loads translation files at startup and caches them in memory. If you modify translation files while the application is running, use the reloadTranslations method to refresh the cache.

A translation loader is responsible for loading translations from a persistent store. The default filesystem loader reads from resources/lang, but you can create custom loaders to read from a database, remote API, or any other source.

A loader must implement the TranslationsLoaderContract interface with a load method that returns translations grouped by locale.

Reference the loader in your config file using the factory function.

A translation formatter processes translation strings according to a specific format. The default ICU formatter handles ICU message syntax, but you can create custom formatters for other formats like Fluent.

A formatter must implement the TranslationsFormatterContract interface with a format method.

Reference the formatter in your config file using the factory function.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/i18n
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/i18n/i18n_provider')
  ]
}
```

Example 3 (dart):
```dart
router.use([
  () => import('#middleware/detect_user_locale_middleware')
])
```

Example 4 (javascript):
```javascript
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

---

## Verifying user credentials - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/verifying-user-credentials

**Contents:**
- Verifying user credentials
- Overview
- Why secure verification matters
- Using the AuthFinder mixin
  - Verifying credentials
- Handling verification errors
- Automatic password hashing

This guide covers secure credential verification in AdonisJS. You will learn:

Before a user can be logged in or issued an access token, you need to verify their credentials. This typically means finding a user by their email (or username) and comparing the provided password against the stored hash.

AdonisJS provides the AuthFinder mixin to handle this securely. The mixin adds a verifyCredentials method to your User model that protects against timing attacks while providing a clean API for credential verification.

A naive approach to credential verification might look like this:

This code is vulnerable to timing attacks. An attacker can measure response times to determine whether an email exists in your database:

This timing difference is enough for attackers to enumerate valid email addresses, which they can then target with password attacks.

The AuthFinder mixin solves the timing attack problem by always performing a password hash comparison, even when the user doesn't exist. This ensures consistent response times regardless of whether the email is valid.

To use the mixin, apply it to your User model:

The withAuthFinder method accepts two arguments. The first is a callback that returns the hasher to use for password verification (scrypt in this example, but you can use any configured hasher). The second is a configuration object with the following properties:

With the mixin applied, use the verifyCredentials static method to verify credentials:

The verifyCredentials method finds the user by the provided UID (email in this case), verifies the password, and returns the user instance. If the credentials are invalid, it throws an E_INVALID_CREDENTIALS exception.

When credentials are invalid, verifyCredentials throws the E_INVALID_CREDENTIALS exception. This exception is self-handling and converts to an appropriate HTTP response based on content negotiation:

To customize error handling, catch the exception in your global exception handler:

The AuthFinder mixin registers a beforeSave hook that automatically hashes passwords when creating or updating users. You don't need to manually hash passwords in your models or controllers:

The hook only hashes the password when the password property has changed, so updating other user fields won't trigger unnecessary rehashing.

**Examples:**

Example 1 (javascript):
```javascript
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    /**
     * Find user by email
     */
    const user = await User.findBy('email', email)
    if (!user) {
      return response.abort('Invalid credentials')
    }

    /**
     * Verify password
     */
    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      return response.abort('Invalid credentials')
    }

    // Login user...
  }
}
```

Example 2 (javascript):
```javascript
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

Example 3 (javascript):
```javascript
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)

    // Login user...
  }
}
```

Example 4 (gdscript):
```gdscript
import { errors } from '@adonisjs/auth'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof errors.E_INVALID_CREDENTIALS) {
      return ctx.response
        .status(error.status)
        .send(error.getResponseMessage(error, ctx))
    }

    return super.handle(error, ctx)
  }
}
```

---

## Session - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/session

**Contents:**
- Sessions
- Overview
- Installation
- Choosing a storage driver
- Configuration
  - Cookie configuration
  - Redis driver
  - Database driver
  - DynamoDB driver
  - File driver

This guide covers working with HTTP sessions in AdonisJS applications. You will learn about:

HTTP is a stateless protocol, meaning each request is independent and the server doesn't retain information between requests. Sessions solve this by providing a way to persist state across multiple HTTP requests and associate that state with a unique session identifier.

In AdonisJS, sessions are primarily used in Hypermedia and Inertia applications to maintain user authentication state and pass temporary data (flash messages) between requests. For example, after a user logs in, their authentication state is stored in the session so they remain logged in across subsequent requests. Similarly, when you redirect after a form submission, flash messages stored in the session can display success or error notifications on the next page.

If you're new to the concept of sessions, we recommend reading this introduction to HTTP sessions before continuing.

Install and configure the sessions package by running the following Ace command:

The session driver determines where your session data is stored. Each driver has different characteristics that make it suitable for specific use cases:

Cookie-based sessions silently truncate data exceeding 4KB. Switch to Redis for production apps with larger session data.

Session configuration is stored in config/session.ts, which is created during installation. Here's the default configuration:

Session lifetime before expiration. Accepts a string duration like '2 hours' or '7 days', or a number in milliseconds. After this period, the session expires and data is deleted.

Controls session expiration behavior. When true, the session expiration resets on every request, keeping users logged in as long as they're active. When false, sessions expire at the exact age regardless of activity (absolute expiration).

For example, with age: '2 hours' and clearWithBrowser: true, a user browsing your site will stay logged in indefinitely as long as they make a request within 2 hours of their last activity.

Determines which session driver to use. Set this using the SESSION_DRIVER environment variable in your .env file. The value must match one of the keys defined in the stores object.

Cookie configuration object that controls how the session cookie behaves. This includes settings for cookie name, domain, path, and security options. See the Cookie configuration section for detailed options.

An object defining all available session stores. Each key represents a driver name, and the value is the store configuration. The driver specified in the store property must exist in this object.

Sessions use cookies to store the session ID (or the entire session data for the cookie driver). Configure cookie behavior with these options:

The name of the cookie that stores the session ID. Only change this if it conflicts with other cookies in your application.

The domain where the cookie is valid. Leave empty to default to the current domain. Set to '.example.com' (with leading dot) to share cookies across subdomains like app.example.com and api.example.com.

The URL path where the cookie is valid. Setting this to '/' makes the cookie available across your entire application.

When true, prevents JavaScript from accessing the cookie through document.cookie, protecting against XSS attacks where malicious scripts try to steal session IDs. Keep this true for security.

When true, ensures cookies are only sent over HTTPS connections, preventing session hijacking on unsecured networks. Automatically enabled in production. Should be false in local development.

Controls when browsers send cookies with cross-site requests, protecting against CSRF attacks.

The Redis driver stores session data in a Redis database, making it ideal for production applications with multiple servers or larger session data.

You may add the redis package using the following command. See the Redis guide for complete setup instructions.

The name of the Redis connection to use for session storage. This connection must be configured in your config/redis.ts file.

The Database driver stores session data in SQL databases, ideal for production applications already using a SQL database infrastructure.

The name of the database connection to use for session storage. This connection must be configured in your config/database.ts file.

The name of the database table where session data will be stored. Defaults to 'sessions'. Make sure to create the migration for the session table using the node ace make:session-table command.

The DynamoDB driver stores session data in AWS DynamoDB, ideal for serverless applications and AWS infrastructure.

Installation: Install the AWS SDK first:

The AWS region where your DynamoDB table is located.

Optional custom endpoint URL for DynamoDB. Useful for local development with DynamoDB Local or when using custom endpoints.

The name of the DynamoDB table where session data will be stored.

The File driver stores session data in the local filesystem, suitable for development and single-server deployments.

The directory path where session files will be stored. Defaults to tmp/sessions within your application root.

Once installed, you can access the session from the HTTP context using the session property. The session store provides a simple key-value API for reading and writing data.

Let's build a simple shopping cart example that demonstrates the core session methods:

You can check if a value exists in the session before trying to retrieve it.

Sometimes you need to get a value and immediately remove it from the session. The pull() method combines both operations.

Sessions provide convenient methods for incrementing and decrementing numeric values, useful for counters or tracking numeric state.

You can retrieve all session data as an object using the all() method.

To remove all data from the session store, use the clear() method.

Flash messages are temporary data stored in the session and available only for the next HTTP request. They're automatically deleted after being accessed once, making them perfect for displaying one-time notifications after redirects.

Use the flashMessages.flash() method to store a message for the next request. The first parameter is the message type (a convention for categorizing messages), and the second is the message content.

AdonisJS uses success and error as standard message type conventions. While you can use any string as a message type, these conventions help organize different kinds of notifications.

If you're using the Hypermedia or Inertia starter kits, flash messages are already displayed automatically in the layout files. The starter kits check for success and error messages and render them with appropriate styling.

For custom layouts or applications, display flash messages in your Edge templates using the global flashMessages helper.

Beyond the standard message types, you can create custom message types for specific use cases.

Display custom messages in your templates.

When an error occurs during form processing and you need to redirect the user back to the form, you can flash the submitted form data to pre-fill the form fields.

You can also flash only specific fields or exclude sensitive fields.

Access flashed form data in templates using the old() helper.

When using AdonisJS validators, validation errors and form data are automatically flashed on validation failure. You don't need to manually flash them.

Sometimes you need to keep flash messages for an additional request. Use reflash() to preserve all messages from the previous request for one more cycle.

You can also selectively re-flash only specific message types.

Session regeneration creates a new session ID while preserving all existing session data. This is a critical security measure to prevent session fixation attacks, where an attacker tricks a user into using a session ID controlled by the attacker.

When a user logs in, their authentication state changes from unauthenticated to authenticated. If the same session ID is kept, an attacker who knew the session ID before login could hijack the authenticated session. Regenerating the session ID after login prevents this attack.

AdonisJS automatically handles session regeneration when using the official Auth package. However, if you're implementing custom authentication, you must manually call session.regenerate() after successful login.

If none of the built-in drivers meet your needs, you can create a custom session store by implementing the SessionStoreContract interface. This is useful for integrating databases like MongoDB or custom storage solutions.

Create a class that implements the four required methods.

Register your custom store in config/session.ts using the factory function.

Set your environment variable to use the custom store.

For complete implementation examples, see the built-in session stores on GitHub.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/session
```

Example 2 (python):
```python
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  age: '2 hours',
  clearWithBrowser: true,
  
  cookie: {
    name: 'adonis-session',
    domain: '',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  },
  
  store: env.get('SESSION_DRIVER'),
  
  stores: {
    cookie: stores.cookie(),
    
    file: stores.file({
      location: app.tmpPath('sessions')
    }),
    
    redis: stores.redis({
      connection: 'main'
    }),
    
    database: stores.database({
      connection: 'postgres',
      tableName: 'sessions',
    }),
    
    dynamodb: stores.dynamodb({
      region: env.get('AWS_REGION'),
      endpoint: env.get('AWS_ENDPOINT'),
      tableName: 'sessions',
    }),
  }
})
```

Example 3 (yaml):
```yaml
age: '2 hours'
// or
age: 7200000 // 2 hours in milliseconds
```

Example 4 (yaml):
```yaml
clearWithBrowser: true
```

---

## Test doubles - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/test-doubles

**Contents:**
- Test doubles
- Overview
- Built-in fakes
  - Emitter fake
  - Hash fake
  - Mail fake
  - Drive fake
- Container swaps
- Time utilities
  - Freezing time

This guide covers test doubles in AdonisJS applications. You will learn how to:

Test doubles replace real implementations with controlled alternatives during testing. They allow you to isolate code under test, avoid side effects like sending real emails, and verify that your code interacts correctly with its dependencies.

AdonisJS takes a pragmatic approach to test doubles. For internal operations like database queries, we recommend hitting the real database rather than mocking query methods. Real database interactions catch issues that mocks would miss, such as constraint violations, incorrect query syntax, or migration problems. However, for external services like email providers, payment gateways, or third-party APIs, fakes prevent unwanted side effects and make tests faster and more reliable.

The framework provides built-in fakes for common services that interact with external systems, along with container swaps for replacing your own dependencies. For edge cases not covered by these tools, you can integrate libraries like Sinon.js.

AdonisJS provides fake implementations for services that typically interact with external systems. Each fake intercepts calls to the real service and captures them for assertions.

The emitter fake prevents event listeners from executing while capturing emitted events for assertions. This is useful when testing code that emits events without triggering side effects like sending notifications or updating external systems.

You can fake specific events while allowing others to execute normally by passing event names or classes to the fake method.

The EventBuffer returned by emitter.fake() provides several assertion methods.

For conditional assertions, pass a callback to assertEmitted that receives the event data and returns true if the event matches your criteria.

The hash fake replaces the real hashing implementation with a fast alternative that performs no actual hashing. Password hashing algorithms like bcrypt and argon2 are intentionally slow for security, but this can significantly slow down test suites that create many users.

The fake stores plain text and compares strings directly. It should only be used in tests where password hashing is not the focus of what you're testing.

The mail fake intercepts all emails and captures them for assertions. This prevents your tests from sending real emails while allowing you to verify that the correct emails would be sent.

The mails object provides assertion methods for both sent and queued emails.

You can also test mail classes in isolation by building them without sending.

The drive fake replaces a disk with a local filesystem implementation. Files are written to ./tmp/drive-fakes and automatically deleted when you restore the fake.

When using dependency injection, you can swap container bindings to replace services with fake implementations. This is useful for faking your own services, such as a payment gateway or external API client.

The recommended approach is to create a dedicated fake implementation that extends or implements the same interface as the real service.

Use container.swap to replace the real service with your fake during tests.

See also: Dependency injection

Japa provides utilities for controlling time during tests. Both freezeTime and timeTravel mock new Date() and Date.now(), and automatically restore the real implementations after the test completes.

The freezeTime function locks time to a specific moment. This is useful when testing code that checks timestamps, such as token expiration.

The timeTravel function moves time forward by a duration. You can pass a human-readable string expression or a Date object.

Both utilities only mock the Date object. They do not affect timers like setTimeout or setInterval.

For stubbing and mocking needs not covered by the built-in fakes, you can use Sinon.js. Install it as a development dependency.

Sinon provides stubs, spies, and mocks for fine-grained control over function behavior. Always call sinon.restore() after tests to clean up.

For comprehensive documentation on stubs, spies, mocks, and fake timers, see the Sinon.js documentation.

**Examples:**

Example 1 (javascript):
```javascript
import { test } from '@japa/runner'
import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'

test.group('User registration', () => {
  test('emits registration event on signup', async ({ client, cleanup }) => {
    /**
     * Fake the emitter to capture events without
     * executing listeners
     */
    const fakeEmitter = emitter.fake()
    cleanup(() => emitter.restore())

    await client.post('/signup').form({
      email: 'jane@example.com',
      password: 'secret123',
    })

    /**
     * Assert the event was emitted
     */
    fakeEmitter.assertEmitted(events.UserRegistered)
  })
})
```

Example 2 (unknown):
```unknown
// Fake only these events, let others execute normally
emitter.fake([events.UserRegistered, events.OrderUpdated])
```

Example 3 (scala):
```scala
fakeEmitter.assertEmitted(events.OrderUpdated, ({ data }) => {
  return data.order.id === orderId
})
```

Example 4 (javascript):
```javascript
import { test } from '@japa/runner'
import hash from '@adonisjs/core/services/hash'
import { UserFactory } from '#database/factories/user_factory'

test.group('Users list', (group) => {
  group.each.setup(() => {
    /**
     * Fake the hash service to make user creation instant.
     * Without this, creating 50 users with bcrypt takes ~5 seconds.
     */
    hash.fake()

    return () => hash.restore()
  })

  test('paginates users correctly', async ({ client }) => {
    await UserFactory.createMany(50)

    const response = await client.get('/users')
    response.assertStatus(200)
  })
})
```

---

## Encryption - AdonisJS

**URL:** https://docs.adonisjs.com/guides/security/encryption

**Contents:**
- Encryption
- Overview
- Basic usage
  - Encrypting values
  - Decrypting values
- Purpose-bound encryption
- Expiring encrypted values
- Encrypting database columns
- Choosing an algorithm
  - When to choose ChaCha20-Poly1305

This guide covers encryption and decryption in AdonisJS applications. You will learn how to:

Encryption transforms readable data into ciphertext that can only be decrypted with the correct secret key. Unlike hashing, encryption is a reversible process. You encrypt data to protect it during storage or transmission, then decrypt it when you need to read the original value.

AdonisJS provides an encryption service with built-in support for three industry-standard algorithms: ChaCha20-Poly1305, AES-256-GCM, and AES-256-CBC. All three are authenticated encryption algorithms, meaning they not only protect confidentiality but also detect tampering. If someone modifies the encrypted data, decryption will fail rather than return corrupted data.

The encryption service produces output in a structured format that includes the driver identifier, ciphertext, initialization vector, and authentication tag. This self-describing format allows you to switch algorithms or rotate keys while maintaining the ability to decrypt older values.

The encryption service provides two primary methods: encryption.encrypt for encrypting values and encryption.decrypt for retrieving the original data.

The encryption.encrypt method accepts any serializable value and returns an encrypted string.

The encryption service supports encrypting strings, numbers, booleans, arrays, objects, and dates. Complex nested structures are automatically serialized before encryption.

The encryption.decrypt method takes an encrypted string and returns the original value, or null if decryption fails.

The decryption method returns null rather than throwing exceptions when decryption fails. This design prevents timing attacks and simplifies error handling. You should always check for null before using the decrypted value.

Purpose-bound encryption ensures that encrypted values can only be decrypted when the same purpose is provided. This prevents token reuse across different contexts in your application.

Without purpose binding, an attacker who obtains a password reset token could potentially reuse it as an email verification token if both contain the same data structure. Purpose-bound encryption prevents this attack by cryptographically binding the purpose to the encrypted value.

You can set a time-to-live on encrypted values. After the specified duration, the decryption method returns null even if the encrypted data is valid.

Supported duration formats include:

You can combine purpose binding with expiration for maximum security.

Encrypt sensitive data before storing it in your database.

Each encryption algorithm offers different tradeoffs between security, performance, and compatibility. The right choice depends on your application's requirements.

ChaCha20-Poly1305 is the recommended choice for new applications. It provides consistent high performance across all platforms, including those without hardware AES acceleration. It's widely deployed in modern protocols including TLS 1.3 and WireGuard.

AES-256-GCM is an excellent choice when you need compatibility with systems that specifically require AES or when running on hardware with AES-NI acceleration. It's the default cipher in many ecosystems, which simplifies interoperability even without explicit AES requirements.

AES-256-CBC is provided primarily for legacy compatibility, mainly to decrypt existing data from older systems. Unlike AEAD ciphers, CBC requires separate HMAC authentication using the Encrypt-then-MAC pattern. For new encryption needs, prefer ChaCha20-Poly1305 or AES-256-GCM.

CBC mode has a history of implementation pitfalls, including padding oracle attacks. AdonisJS handles these concerns internally, but if you're implementing CBC elsewhere, ensure you use Encrypt-then-MAC and constant-time comparison for the authentication tag.

The legacy driver is designed for migrating from AdonisJS v6 to v7. It can only decrypt data that was encrypted with the v6 encryption service. Use this driver when you have existing encrypted data in your database from a v6 application that needs to be migrated.

The recommended migration strategy is:

The encryption configuration lives in config/encryption.ts. You define available drivers in the list object and specify which one to use by default.

All drivers accept the same configuration options.

A unique identifier for this driver configuration. This ID is embedded in the encrypted output, allowing the decryption process to identify which driver was used.

An array of secret keys. The first key is used for encryption, while all keys are tried during decryption. This enables seamless key rotation.

The encryption service supports multiple keys for seamless key rotation. The first key in the array is used for encrypting new values, while all keys are tried during decryption. This allows you to rotate keys without invalidating existing encrypted data.

When rotating keys, follow this process:

Never remove an old key until you're certain all data encrypted with that key has either been re-encrypted with the new key or is no longer needed. Removing a key makes all data encrypted with it permanently unreadable.

When you need to ensure data integrity without hiding the content, use the message verifier. Unlike encryption, the message verifier doesn't encrypt data. It base64-encodes the payload and signs it with HMAC, allowing anyone to read the data while ensuring it hasn't been tampered with.

The message verifier is useful for scenarios where you want to detect tampering but don't need to hide the data, such as OAuth state parameters, CSRF tokens, or webhook signatures.

The message verifier supports the same purpose binding and expiration features as encryption.

Some applications need to encrypt data with different algorithms for different purposes. The encryption.use method lets you explicitly select a driver.

Each driver specified in encryption.use() must be configured in your config/encryption.ts file's list object.

The encryption service requires a cryptographically secure secret key stored in the APP_KEY environment variable. You can generate a new key using the Ace CLI.

This command generates a random 32-character key and writes it to your .env file. The key uses a cryptographically secure random number generator to ensure it cannot be predicted or guessed.

The APP_KEY is critical to your application's security. If this key is compromised, attackers can decrypt all your encrypted data and forge signed cookies. Store it securely, never commit it to version control, and use different keys for each environment.

If you change or lose your APP_KEY, all existing encrypted data becomes permanently unreadable. Cookies signed with the old key will be rejected, and encrypted database values cannot be recovered. Always back up your production keys securely.

**Examples:**

Example 1 (python):
```python
import encryption from '@adonisjs/core/services/encryption'

export default class ApiTokenService {
  createToken(userId: number, permissions: string[]) {
    /**
     * Encrypt the token payload. The service handles
     * serialization, so you can pass objects directly.
     */
    const token = encryption.encrypt({
      userId,
      permissions,
      createdAt: new Date(),
    })

    // token looks like:
    // cbc.base64Ciphertext.base64IV.base64Tag

    return token
  }
}
```

Example 2 (typescript):
```typescript
import encryption from '@adonisjs/core/services/encryption'

export default class ApiTokenService {
  verifyToken(token: string) {
    /**
     * Attempt to decrypt the token. Returns null if the token
     * is invalid, tampered with, or encrypted with a different key.
     */
    const payload = encryption.decrypt(token)

    if (!payload) {
      return null
    }

    return payload as { userId: number; permissions: string[] }
  }
}
```

Example 3 (python):
```python
import encryption from '@adonisjs/core/services/encryption'

export default class TokenService {
  createPasswordResetToken(userId: number) {
    /**
     * The purpose option specifies the encryption purpose.
     * This token can only be decrypted with the same purpose.
     */
    return encryption.encrypt(
      { userId },
      { purpose: 'password-reset' } 
    )
  }

  createEmailVerificationToken(userId: number) {
    return encryption.encrypt(
      { userId },
      { purpose: 'email-verification' } 
    )
  }

  verifyPasswordResetToken(token: string) {
    /**
     * Must provide the same purpose to decrypt.
     * A token created for email verification won't work here.
     */
    return encryption.decrypt(token, 'password-reset')
  }
}
```

Example 4 (json):
```json
const token = encryption.encrypt(
  { userId: 1 },
  { purpose: 'password-reset' }
)

encryption.decrypt(token, 'password-reset')     // => { userId: 1 }

/**
 * Attempting to decrypt with the wrong purpose returns null.
 */
encryption.decrypt(token, 'email-verification') // => null
encryption.decrypt(token)                       // => null
```

---

## Extending AdonisJS - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/extending-adonisjs

**Contents:**
- Extending the framework
- Overview
- Why extend the framework?
- Understanding macros and getters
- Creating your first macro
    - Create the extensions file
    - Import the class you want to extend
    - Add the macro method
    - Add TypeScript type definitions
    - Load extensions in your provider

This guide covers how to extend AdonisJS with custom functionality. You will learn how to:

AdonisJS provides a powerful extension system that lets you add custom methods and properties to framework classes without modifying the framework's source code. This means you can enhance the Request class with custom validation logic, add utility methods to the Response class, or extend any other framework class to fit your application's specific needs.

The extension system is built on two core concepts: macros (custom methods) and getters (computed properties). Both are added at runtime and integrate seamlessly with TypeScript through declaration merging, giving you full type safety and autocomplete in your editor.

This same extension API is used throughout AdonisJS's own first-party packages, making it a proven pattern for building reusable functionality. Whether you're adding a few helper methods for your application or building a package to share with the community, the extension system provides a clean, type-safe way to enhance the framework.

Before diving into the mechanics, let's understand when and why you'd want to extend framework classes.

Without extensions, you'd need to write the same logic repeatedly across your application. For example, checking if a request expects JSON responses:

With a macro, you write this logic once and use it everywhere:

Extensions are ideal when you:

Before we start adding extensions, let's clarify what macros and getters are and when to use each.

Macros are custom methods you add to a class. They work like regular methods and can accept parameters, perform computations, and return values. Use macros when you need functionality that requires input or performs actions.

Getters are computed properties that look like regular properties when you access them. They're calculated on-demand and can optionally cache their result. Use getters for read-only derived data that doesn't require parameters.

Both macros and getters use declaration merging, a TypeScript feature that extends existing type definitions to include your custom additions. This ensures your extensions have full type safety and autocomplete support.

Under the hood, AdonisJS uses the macroable package to implement this functionality. If you want to understand the implementation details, you can refer to that package's documentation.

Let's build a simple macro step-by-step. We'll add a method to the Request class that checks if the incoming request is from a mobile device.

Create a dedicated file to hold all your framework extensions. This keeps your extension code organized in one place.

The file can be named anything you like, but extensions.ts clearly communicates its purpose.

Import the framework class you want to add functionality to. For our example, we'll extend the Request class.

Use the macro method to add your custom functionality. The method receives the class instance as this, giving you access to all the class's existing properties and methods.

The function (this: Request) syntax is important because it gives you the correct this context. Don't use arrow functions here, as they don't preserve the this binding.

Tell TypeScript about your new method using declaration merging. Add this at the end of your extensions file.

The module path in declare module must exactly match the import path you use. The interface name must exactly match the class name.

Import your extensions file in a service provider's boot method to ensure the extensions are registered when your application starts.

Your macro is now available throughout your application with full type safety and autocomplete.

Getters are computed properties that work like regular properties but are calculated on-demand. Let's add a getter to the Request class that provides a cleaned version of the request path.

Notice the type declaration differs from macros. Getters are properties, not methods, so you don't include () in the type definition.

You can use getters like regular properties:

Getter callbacks cannot be async because JavaScript getters are synchronous by design. If you need async computation, use a macro instead.

By default, getters recalculate their value every time you access them. For expensive computations, you can make a getter a singleton, which caches the result after the first calculation.

With singleton getters, the function executes once per instance of the class, and the return value is cached for that instance:

Use singleton getters when the computed value won't change during the instance's lifetime. For example, a request's IP address won't change during a single HTTP request, so caching it makes sense.

Don't use singleton getters for values that might change, like computed properties based on mutable state.

Choosing between macros and getters depends on your use case. Here's a practical guide.

Use macros when you need to:

Use getters when you need to:

Both can coexist on the same class. Choose based on the API you want to provide.

Declaration merging is how TypeScript learns about your runtime extensions. Getting this right is crucial for type safety.

The module path in your declare module statement must exactly match the path you use to import the class:

Why this matters: TypeScript uses the module path to determine which type definition to merge with.

What happens: If the paths don't match, TypeScript won't recognize your extension. You'll see errors like "Property 'isMobile' does not exist on type 'Request'" even though your code runs correctly.

Solution: Always copy the exact import path when writing your declaration:

You can declare multiple extensions in the same declare module block:

Or split them across multiple blocks if you prefer:

Both approaches work identically. Choose based on your organization preferences.

Here are the most common issues developers encounter when extending the framework and how to fix them.

Mistake: Using arrow functions for macros

Why it fails: Arrow functions don't have their own this binding, so you can't access the class instance.

Mistake: Forgetting the singleton parameter defaults to false

What happens: Your getter recalculates every time it's accessed, even if the value won't change.

Mistake: Treating getters like methods

What happens: You'll get errors because getters are properties, not functions.

The following framework classes support macros and getters. Each entry includes the import path and typical use cases.

The main application instance. Extend this to add application-level utilities.

Common use cases: Add custom environment checks, application state getters, or global configuration accessors.

Example: Add a getter to check if the app is running in a specific mode.

The HTTP request class. Extend this to add request validation or parsing logic.

Common use cases: Add methods for checking request characteristics, parsing custom headers, or validating request types.

Example: Add a method to check if the request is an AJAX request.

The HTTP response class. Extend this to add custom response methods or formatters.

Common use cases: Add methods for sending formatted responses, setting common headers, or handling specific response types.

Example: Add a method for sending paginated JSON responses.

The HTTP context class passed to route handlers and middleware. Extend this to add context-level utilities.

Common use cases: Add helpers that combine request and response logic, or add shortcuts for common operations.

Example: Add a method to get the current user or fail.

Individual route instances. Extend this to add custom route configuration methods.

Common use cases: Add methods for applying common middleware patterns, setting route metadata, or configuring routes in specific ways.

Example: Add a method to mark routes as requiring authentication.

Route group instances. Extend this to add custom group-level configuration.

Common use cases: Add methods for applying common patterns to groups of routes.

Example: Add a method to apply API versioning to a group.

Resourceful route instances. Extend this to customize resource route behavior.

Common use cases: Add methods for customizing which resource routes are created or adding resource-specific middleware.

Brisk (quick) route instances used for simple route definitions. Extend this for shortcuts.

Common use cases: Add convenience methods for quick route configurations.

The global exception handler. Extend this to add custom error handling methods.

Common use cases: Add methods for handling specific error types or formatting error responses.

Example: Add a method to handle validation errors consistently.

Uploaded file instances. Extend this to add file validation or processing methods.

Common use cases: Add methods for validating file types, processing images, or generating thumbnails.

Example: Add a method to check if a file is an image.

Beyond macros and getters, many AdonisJS modules provide dedicated extension APIs for adding custom implementations. These are designed for more complex integrations like custom drivers or loaders.

The following modules can be extended with custom implementations:

These extension points go beyond simple methods and properties, allowing you to deeply integrate custom functionality into the framework.

Now that you understand how to extend the framework, you can:

**Examples:**

Example 1 (sass):
```sass
export default class PostsController {
  async index({ request, response }: HttpContext) {
    // Repeated in every action that returns different formats
    const acceptHeader = request.header('accept', '')
    const wantsJSON = acceptHeader.includes('application/json') || 
                      acceptHeader.includes('+json')
    
    if (wantsJSON) {
      return response.json({ posts: [] })
    }
    
    return view.render('posts/index')
  }
}
```

Example 2 (sass):
```sass
import { Request } from '@adonisjs/core/http'

/**
 * Check if the request expects a JSON response based on Accept header
 */
Request.macro('wantsJSON', function (this: Request) {
  const firstType = this.types()[0]
  if (!firstType) {
    return false
  }
  
  return firstType.includes('/json') || firstType.includes('+json')
})
```

Example 3 (php):
```php
export default class PostsController {
  async index({ request, response }: HttpContext) {
    if (request.wantsJSON()) {
      return response.json({ posts: [] })
    }
    
    return view.render('posts/index')
  }
}
```

Example 4 (unknown):
```unknown
// This file contains all framework extensions for your application
```

---

## Middleware - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/middleware

**Contents:**
- Middleware
- Overview
- Middleware stacks
- Creating and using middleware
    - Generating the middleware
    - Implementing the logging logic
    - Registering the middleware
- Named middleware with parameters
    - Creating the authorization middleware
    - Registering the named middleware

This guide covers middleware in AdonisJS applications. You will learn how to:

Middleware are functions that execute during an HTTP request before the request reaches your route handler. Each middleware in the chain can either terminate the request by sending a response or forward it to the next middleware using the next method.

The middleware layer allows you to encapsulate logic that must run during a request into dedicated, reusable functions or classes. Instead of cluttering your controllers with repetitive logic for parsing request bodies, authenticating users, or logging requests, you can offload these responsibilities to dedicated middleware.

Every HTTP request your application handles flows through the middleware pipeline, making it essential to understand how middleware work and how to organize them effectively.

AdonisJS divides middleware into three categories, known as stacks. Each stack serves a different purpose and executes at different points in the request lifecycle.

Server middleware stack

Router middleware stack

Named middleware collection

Let's walk through creating a complete logging middleware that tracks request duration. We'll generate the middleware file, implement the logging logic, and register it to run on all requests.

Create a new middleware using the make:middleware command. This command generates a scaffolded middleware class in the app/middleware directory.

The generated middleware contains a basic class structure with a handle method where we'll add our logging logic:

Now let's implement the actual logging functionality. We'll track how long each request takes by capturing the start time before calling next(), then calculating the duration after the response is ready.

Finally, let's register our logging middleware in the server middleware stack so it runs for every request. We will register it as the first middleware, so that we can precisely time all the requests.

Server middleware are registered in the start/kernel.ts file using lazy imports, and they execute in the order they're registered.

Named middleware provide flexibility by allowing you to apply them selectively to specific routes and pass parameters to customize their behavior. Let's build an authorization middleware that checks user permissions, register it with a name, and apply it to protected routes.

We'll create a middleware that checks if the authenticated user has the required role or permissions to access a route. Named middleware can accept a third parameter for options, making them configurable per-route.

Now let's register our authorization middleware with the name authorize in the start/kernel.ts file. Exporting the middleware collection enables full TypeScript type safety when using it in routes.

Finally, let's apply our authorize middleware to specific routes. Import the middleware collection from start/kernel.ts to get full TypeScript autocomplete and type checking for the options parameter.

Your authorization middleware is now protecting routes with type-safe, configurable permission checks!

Middleware classes are instantiated using the IoC container, allowing you to inject dependencies directly into the middleware constructor. Dependencies can only be injected through the constructor, not as method parameters. The container will automatically resolve and inject your dependencies when creating the middleware instance.

See also: Dependency Injection guide

Middleware execute in two phases: the downstream phase and the upstream phase. Understanding this flow is crucial for knowing where to place your logic within a middleware.

The downstream phase occurs before the await next() call. During this phase, the request travels through each middleware in order.

The upstream phase occurs after the await next() call. During this phase, the response travels back through the middleware in reverse order.

This two-phase execution allows middleware to execute logic both before and after the route handler runs. The logging middleware example demonstrates this pattern by capturing the start time in the downstream phase and calculating the duration in the upstream phase.

Middleware can modify the response during both the downstream and upstream phases. Since the response object is mutable, changes you make in middleware will affect the final response sent to the client.

A common pattern is adding headers to the response after the route handler completes. Placing header logic after await next() ensures the response has been fully constructed by the handler before you modify it.

You can also transform the response body in middleware by accessing and modifying it in the upstream phase. This middleware wraps all response bodies in a consistent format with metadata.

When a middleware throws an exception, AdonisJS's global exception handler catches and processes it just like exceptions thrown from route handlers. The upstream flow continues as normal, meaning any middleware that already executed in the downstream phase will still execute their upstream code.

See also: Exception handling guide

AdonisJS does not provide a way to conditionally register or apply middleware at runtime. However, middleware can use configuration files to decide at runtime whether they should execute for the current request. This pattern lets you control middleware behavior through environment variables or configuration files without changing your middleware registration.

Middleware can add custom properties to the HttpContext object to share data with downstream middleware and route handlers. However, this requires TypeScript module augmentation to ensure the properties appear at the type level.

To make TypeScript aware of the new tenant property, you must augment the HttpContext interface. After augmentation, TypeScript will recognize ctx.tenant in all your middleware and route handlers.

When you augment the HttpContext interface, the type changes are global. However, if you add properties via named middleware that only runs on specific routes, those properties will not exist at runtime on routes where the middleware doesn't execute.

Only augment the HttpContext in server or router middleware that run broadly across your application.

**Examples:**

Example 1 (unknown):
```unknown
node ace make:middleware LogRequests
```

Example 2 (markdown):
```markdown
# CREATE: app/middleware/log_requests_middleware.ts
```

Example 3 (python):
```python
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class LogRequestsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Logic to run before the request handler
     */
    await next()
    /**
     * Logic to run after the request handler
     */
  }
}
```

Example 4 (javascript):
```javascript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import string from '@adonisjs/core/helpers/string'

export default class LogRequestsMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    /**
     * Capture the start time before calling next().
     * This happens in the downstream phase.
     */
    const startTime = process.hrtime()
    
    /**
     * Call next() to execute remaining middleware and route handler.
     * The await ensures we wait for the entire chain to complete.
     */
    await next()
    
    /**
     * After next() completes, we're in the upstream phase.
     * The response is ready, so we can log the completion details.
     */
    const endTime = process.hrtime(startTime)
    const responseStatus = response.getStatus()
    const uri = request.url()
    const method = request.method()
    
    logger.info(`${method} ${uri}: ${responseStatus} (${string.prettyHrTime(endTime)})`)
  }
}
```

---

## Introduction - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/introduction

**Contents:**
- Authentication
- Overview
- What the auth package does not include
- Choosing an auth guard
  - Session guard
  - Access tokens guard
  - Basic auth guard
- Choosing a user provider
- Installation
- The initialize auth middleware

This guide introduces the AdonisJS authentication system. You will learn:

AdonisJS provides a robust authentication system for logging in and authenticating users across different application types, whether you're building a server-rendered application, an API for a SPA, or a backend for mobile apps.

The authentication package is built around two core concepts:

The security primitives of AdonisJS are designed to protect against common vulnerabilities. Passwords and tokens are properly hashed, and the implementation guards against timing attacks and session fixation attacks.

The auth package focuses specifically on authenticating HTTP requests. The following features are outside its scope:

Looking for a complete authentication system? AdonisJS Kit provides full-stack components with ready-to-use flows for user registration, email verification, password recovery, profile management, and more.

AdonisJS ships with three built-in guards. Use the table below to determine which guard fits your application.

The session guard uses the @adonisjs/session package to track logged-in users. After a successful login, the user's identifier is stored in the session, and a session cookie is sent to the browser. Subsequent requests include this cookie, allowing the server to restore the user's authenticated state.

Sessions and cookies have been the standard for web authentication for decades. They work well when your client can accept and send cookies, which is the case for server-rendered applications and SPAs hosted on the same top-level domain as your API.

See also: Session guard documentation

Access tokens are cryptographically secure random strings issued to users after login. The client stores the token and includes it in the Authorization header of subsequent requests. AdonisJS uses opaque access tokens (not JWTs) that are stored as hashes in your database for verification.

Use access tokens when your client cannot work with cookies:

The client application is responsible for storing tokens securely. Access tokens provide unrestricted access to your application on behalf of a user, so leaking them creates security risks.

See also: Access tokens guard documentation

The basic auth guard implements the HTTP authentication framework. The client sends credentials as a base64-encoded string in the Authorization header with each request. If credentials are invalid, the browser displays a native login prompt.

Basic authentication is not recommended for production applications because credentials are sent with every request and the user experience is limited to the browser's built-in prompt. However, it can be useful during early development or for internal tools.

See also: Basic auth guard documentation

User providers handle finding users and verifying tokens during authentication. Each guard type has specific requirements for its provider.

The session guard provider finds users by their ID (stored in the session). The access tokens guard provider additionally verifies tokens against hashed values in the database. AdonisJS ships with Lucid-based providers for all built-in guards, which use your Lucid models to query the database.

The auth package comes pre-configured with the web and api starter kits. To add it to an existing application, run one of the following commands based on your preferred guard:

Installs the @adonisjs/auth package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the User model inside app/models.

Creates database migrations for the users table.

Creates additional migrations based on the selected guard (for example, auth_access_tokens for the access tokens guard).

During setup, the @adonisjs/auth/initialize_auth_middleware is added to your application's middleware stack. This middleware runs on every request and creates an instance of the Authenticator class, which it attaches to ctx.auth.

The initialize auth middleware does not authenticate requests or protect routes. Its only job is to set up the authenticator instance so it's available throughout the request lifecycle. To protect routes, use the auth middleware.

If your application uses Edge templates, the authenticator is also available as the auth variable:

The add command creates a migration for the users table in database/migrations. You can modify this file to match your application's requirements before running the migration.

After modifying the migration, update the User model in app/models/user.ts to reflect any columns you've added, renamed, or removed.

With the auth package installed, you're ready to implement authentication in your application:

**Examples:**

Example 1 (sass):
```sass
# Session guard (recommended for web apps)
node ace add @adonisjs/auth --guard=session

# Access tokens guard (recommended for APIs)
node ace add @adonisjs/auth --guard=access_tokens

# Basic auth guard
node ace add @adonisjs/auth --guard=basic_auth
```

Example 2 (lua):
```lua
{
      providers: [
        // ...other providers
        () => import('@adonisjs/auth/auth_provider')
      ]
    }
```

Example 3 (dart):
```dart
router.use([
      () => import('@adonisjs/auth/initialize_auth_middleware')
    ])
```

Example 4 (dart):
```dart
router.named({
      auth: () => import('#middleware/auth_middleware'),
      // Only registered when using the session guard
      guest: () => import('#middleware/guest_middleware')
    })
```

---

## Command arguments - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/arguments

**Contents:**
- Command arguments
- Overview
- Defining your first argument
- Accepting multiple values
- Customizing argument name and description
- Making arguments optional
  - Providing default values
- Transforming argument values
- Accessing all arguments

This guide covers defining command arguments within custom commands. You will learn about the following topics:

Arguments are positional values that users provide after the command name when executing a command. Unlike flags, which can be specified in any order, arguments must be provided in the exact order they are defined in your command class.

For example, in the command node ace make:controller users --resource, the word users is an argument, while --resource is a flag. Arguments are ideal for required input values that have a natural order, such as filenames, resource names, or entity identifiers.

You define command arguments as class properties decorated with the @args decorator. Ace will accept arguments in the same order as they appear in your class, making the property order significant.

The most common argument type is a string argument, which accepts any text value. Use the @args.string decorator to define string arguments.

Users can now run your command by providing a value for the name argument.

If the user forgets to provide the required argument, Ace will display an error message indicating which argument is missing.

Some commands need to accept multiple values for a single argument. For example, a command that processes multiple files might accept any number of filenames.

Use the @args.spread decorator to accept multiple values. The spread argument must be the last argument in your command, as it captures all remaining values.

Users can now provide any number of values when running the command.

The argument name appears in help screens and error messages. By default, Ace uses the dashed-case version of your property name as the argument name. For example, a property named userName becomes user-name in the help output.

You can customize the argument name using the argumentName option.

Adding a description helps users understand what value they should provide. The description appears in the help screen when users run node ace greet --help.

All arguments are required by default, ensuring users provide necessary input before your command executes. However, you can make an argument optional by setting the required option to false.

Optional arguments must come after all required arguments. This ordering requirement prevents ambiguity in argument parsing.

Now users can run the command with or without the second argument.

You can specify a default value for optional arguments using the default property. When users don't provide a value, Ace uses the default instead.

With a default value, the argument becomes optional but your code can always expect a string value rather than handling undefined.

The parse method allows you to transform or validate the argument value before it's assigned to the class property. This is useful for normalizing input, converting types, or performing validation.

The parse method receives the raw string value from the command line and must return the transformed value.

Now when users provide a name, it will automatically be converted to uppercase before your command's run method executes.

You can also use the parse method for validation by throwing an error when the value is invalid.

You can access all arguments provided by the user, including their raw values, using the this.parsed.args property. This is useful for debugging or when you need to inspect the complete argument list.

**Examples:**

Example 1 (gdscript):
```gdscript
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'
  
  /**
   * Define a required string argument
   */
  @args.string()
  declare name: string

  async run() {
    this.logger.info(`Hello, ${this.name}!`)
  }
}
```

Example 2 (markdown):
```markdown
node ace greet John

# Output: Hello, John!
```

Example 3 (typescript):
```typescript
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet multiple users by name'
  
  /**
   * Accept multiple names as an array
   */
  @args.spread()
  declare names: string[]

  async run() {
    this.names.forEach((name) => {
      this.logger.info(`Hello, ${name}!`)
    })
  }
}
```

Example 4 (markdown):
```markdown
node ace greet John Jane Bob

# Output:
# Hello, John!
# Hello, Jane!
# Hello, Bob!
```

---

## Emitter - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/emitter

**Contents:**
- Event Emitter
- Overview
- Defining events and event data
- String-based events
    - Define event types
    - Listen for the event
    - Emit the event
- Class-based events
    - Create an event class
    - Listen for the event

This guide covers the event emitter in AdonisJS applications. You will learn how to:

The event emitter enables event-driven architecture in AdonisJS applications. When you emit an event, all registered listeners execute asynchronously without blocking the code that triggered the event. This pattern is useful for decoupling side effects from your main application logic.

A common example is user registration: after creating a user account, you might need to send a verification email, provision resources with a payment provider, and log the signup for analytics. Rather than executing all these tasks sequentially in your controller, you can emit a single user:registered event and let separate listeners handle each concern independently.

AdonisJS provides two approaches for defining events. String-based events use TypeScript module augmentation for type-safety, while class-based events encapsulate the event identifier and data in a single class.

If you're looking for a list of events emitted by AdonisJS and its official packages, see the events reference guide.

An event consists of two parts: an identifier and associated data. The identifier is typically a string like user:registered, and the data is whatever payload you want to pass to listeners (for example, an instance of the User model).

Class-based events encapsulate both the identifier and the data within a single class. The class itself serves as the identifier, and instances of the class hold the event data. This approach provides built-in type-safety without additional configuration.

String-based events use a string identifier like user:registered or order:shipped. To make these events type-safe, you define the event names and their payload types using TypeScript module augmentation.

Create a types/events.ts file and augment the EventsList interface to declare your events and their payload types.

The EventsList interface maps event names to their payload types. In this example, the user:registered event carries a User model instance as its payload. TypeScript will enforce this contract when you emit events or register listeners.

Create a preload file to register your event listeners. Run the following command to generate the file.

This creates start/events.ts, which is loaded automatically when your application boots. Register listeners using the emitter.on method.

The listener callback receives the event payload as its argument. Because you defined the payload type in EventsList, TypeScript knows that user is an instance of the User model.

Emit events from anywhere in your application using emitter.emit. The first argument is the event name, and the second is the payload.

The emitter.emit method is type-safe. TypeScript will error if you pass an incorrect payload type or use an event name that isn't defined in EventsList.

Class-based events provide type-safety without module augmentation. The event class acts as both the identifier and a container for the event data.

Generate an event class using the make:event command.

This creates an event class that extends BaseEvent. Accept event data through the constructor and expose it as instance properties.

The event class has no behavior. It's purely a data container where the constructor parameters define what data the event carries.

Import the event class from the #generated/events barrel file and use it as the first argument to emitter.on.

The listener receives an instance of the event class. Access the event data through the instance properties you defined in the constructor.

Class-based events are dispatched using the static dispatch method instead of emitter.emit.

The dispatch method accepts the same arguments as the event class constructor. There's no need to define types in EventsList since the class itself provides complete type information.

Listeners can be defined as inline callbacks or as dedicated listener classes. Inline callbacks work well for simple logic, while listener classes are better for complex operations that benefit from dependency injection and testability.

Pass a function directly to emitter.on for simple listeners.

The same approach works with class-based events.

Create a listener class using the make:listener command.

This generates a class with a handle method that executes when the event fires.

Update the handle method to accept the event payload. For class-based events, type the parameter as the event class.

Register the listener by importing it from the #generated/listeners barrel file.

Listener classes are instantiated through the IoC container, so you can inject dependencies via the constructor using the @inject decorator.

See also dependency injection guide.

The emitter provides several methods for registering listeners, each suited to different use cases.

The on method registers a listener that fires every time the event is emitted throughout the application lifecycle.

The once method registers a listener that fires only once, then automatically unsubscribes.

The listen method registers multiple listeners for a single event in one call.

All listeners execute in parallel when the event fires.

The onAny method registers a listener that fires for every event emitted in the application.

This is useful for logging, debugging, or implementing cross-cutting concerns that apply to all events.

You can remove listeners when they're no longer needed.

The on and once methods return an unsubscribe function. Call it to remove the listener.

The off method removes a specific listener. You need a reference to the exact function or class that was registered.

This works with listener classes too.

Remove all listeners for a specific event with clearListeners.

Remove all listeners for all events with clearAllListeners.

When a listener throws an error, it doesn't affect other listeners since they run in parallel. However, unhandled errors will trigger Node.js unhandledRejection events, which can crash your application or cause unexpected behavior.

Define a global error handler to catch and process errors from all listeners.

The error handler receives three arguments: the event name (or class), the error that was thrown, and the event data that was passed to the listener.

When testing code that emits events, you often want to verify the event was emitted without actually running the listeners. For example, when testing user registration, you might want to confirm the user:registered event fires without sending real emails.

The emitter.fake method prevents listeners from running and returns an EventBuffer that captures emitted events for assertions.

Call emitter.restore() after each test to return to normal event behavior. The cleanup hook ensures restoration happens even if the test fails.

Pass event names or classes to fake to only fake specific events. Other events will continue to trigger their listeners normally.

The EventBuffer returned by fake provides several assertion methods.

Pass a callback to assertEmitted to assert that an event was emitted with specific data.

The callback receives the event data and should return true if the event matches your criteria.

**Examples:**

Example 1 (typescript):
```typescript
import User from '#models/user'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:registered': User
  }
}
```

Example 2 (unknown):
```unknown
node ace make:preload events
```

Example 3 (python):
```python
import emitter from '@adonisjs/core/services/emitter'

emitter.on('user:registered', function (user) {
  console.log(user.email)
})
```

Example 4 (javascript):
```javascript
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

---

## Mail - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/mail

**Contents:**
- Mail
- Overview
- Installation
- Configuration
- Transport configuration
- Sending your first email
- Configuring the message
  - Subject and sender
  - Recipients
  - Email contents

This guide covers sending emails from your AdonisJS application. You will learn how to:

The @adonisjs/mail package provides a unified API for sending emails through various providers. Built on top of Nodemailer, it adds a fluent configuration API, support for organizing emails as classes, an extensive testing API, and background email delivery through messengers.

The package introduces two key concepts. A transport is the underlying delivery mechanism (SMTP server, API service like Resend or Mailgun). A mailer is a configured instance of a transport that you use to send emails. You can configure multiple mailers in your application, each using different transports or the same transport with different settings, and switch between them at runtime.

Install and configure the package using the following command:

You can pre-select transports during installation:

Installs the @adonisjs/mail package using the detected package manager.

Registers the following service provider and command inside the adonisrc.ts file.

Creates the config/mail.ts file.

Defines the environment variables and their validations for the selected mail services.

The mail configuration lives in config/mail.ts. This file defines your mailers, default sender addresses, and transport settings.

See also: Config stub

Each transport accepts provider-specific options. The following sections document the available transports and their configuration.

See also: TypeScript types for config object

SMTP configuration options are forwarded directly to Nodemailer.

See also: Nodemailer SMTP documentation

Configuration options are sent to Resend's /emails API endpoint.

Configuration options are sent to Mailgun's /messages.mime API endpoint.

Configuration options are sent to SparkPost's /transmissions API endpoint.

SES configuration options are forwarded to Nodemailer. You must install the AWS SDK separately.

See also: Nodemailer SES documentation

Import the mail service and call the send method. The callback receives a Message instance for configuring the email.

The mail.send method delivers the email immediately using the default mailer. For production applications with high traffic, you should queue emails for background delivery instead.

The Message class provides a fluent API for building emails. You receive an instance in the callback passed to mail.send or mail.sendLater.

The from method accepts either a string or an object with address and name:

Use to, cc, and bcc to set recipients. Each method accepts a string, an object, or an array.

Set the reply-to address using the replyTo method:

Define HTML and plain text content using html and text methods for inline content, or htmlView and textView to render Edge templates.

For most emails, Edge templates provide better organization:

See also: Configuring Edge

MJML is a markup language that compiles to responsive HTML email markup. Install the package and use the @mjml Edge tag.

Pass MJML options as props to the tag:

Sending emails synchronously blocks request processing while waiting for the mail provider's response. For better performance, queue emails for background delivery using mail.sendLater.

By default, the mail messenger uses an in-memory queue. This means queued emails are lost if your process terminates before sending them.

The in-memory messenger is suitable for development but not recommended for production. If your application crashes or restarts with pending emails in the queue, those emails will never be sent. Use a persistent queue like BullMQ for production deployments.

For production applications, configure a persistent queue using BullMQ and Redis. This ensures emails survive process restarts.

Create a custom messenger that stores email jobs in Redis:

Create a worker to process the queue. Run this in a separate process:

Use mail.use() to send emails through a specific mailer instead of the default.

Mailer instances are cached for the process lifetime. To close a connection and remove it from the cache, use mail.close():

Attach files using the attach method with an absolute file path:

Customize the attachment filename and other options:

Use attachData for dynamic content from streams or buffers:

Do not use attachData with mail.sendLater. Queued emails are serialized to JSON, so streams cannot be stored and buffers significantly increase storage size. Attempting to queue an email with a stream attachment will fail. Instead, save the file to disk first and use attach with the file path.

Embed images directly in HTML content using the embedImage helper in your Edge template. This uses CID (Content-ID) attachments, which display reliably across email clients.

The helper returns a cid: URL and automatically adds the image as an attachment.

For dynamic image data, use embedImageData:

Attach calendar events using the icalEvent method. You can provide raw iCalendar content or use the fluent API.

The calendar object is an instance of ical-generator.

Load invite content from a file or URL:

Add custom headers using the header method:

For headers that should not be encoded or folded, use preparedHeader:

Helper methods simplify common List-* headers for mailing list functionality:

See also: Nodemailer list headers documentation

For complex applications, organize emails into dedicated classes instead of inline callbacks. This improves testability and keeps controllers focused on request handling.

Send the email by passing an instance to mail.send or mail.sendLater:

See also: Make mail command

The mail package provides a fake mailer for testing email functionality without actually sending emails.

Call mail.fake() to intercept all emails. The returned object contains a mails property for assertions.

The mails object provides these assertion methods:

Test mail classes in isolation by building them without sending:

Retrieve the list of sent or queued emails for custom assertions:

Create custom transports to integrate mail providers not included in the package. A transport wraps a Nodemailer transport and normalizes its response.

Create a factory function for use in the config file:

Register the transport in your config:

By default, the mail package uses Edge for rendering email templates. To use a different template engine, override the static templateEngine property on the Message class.

The mail package emits events during the email lifecycle.

See also: Events reference

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/mail
```

Example 2 (sass):
```sass
node ace add @adonisjs/mail --transports=resend --transports=smtp
```

Example 3 (lua):
```lua
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

Example 4 (elixir):
```elixir
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

---

## Resetting state between tests - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/resetting-state-between-tests

**Contents:**
- Resetting state between tests
- Overview
- Database state management
  - Migrating the database
  - Seeding the database
  - Cleaning Up between tests
- Filesystem state management
- Redis state management
- Environment configuration

This guide covers managing application state during testing in AdonisJS. You will learn how to:

Tests that modify application state, such as creating database records, uploading files, or caching data in Redis, need a strategy for resetting that state between test runs. Without proper cleanup, tests can interfere with each other, leading to flaky results that pass or fail depending on execution order.

AdonisJS provides utilities through the testUtils service that handle common state management patterns. The general approach is to run database migrations once before all tests, then reset data between individual tests using either transactions or truncation. For filesystem and Redis, similar patterns ensure each test starts with a clean slate.

Make sure your test environment is configured to use separate databases and storage systems from your development and production environments. Running tests against production data can result in data loss. You can use the .env.test file to override environment variables specifically for tests.

Register a global setup hook in tests/bootstrap.ts to run migrations before any tests execute. The testUtils.db().migrate() method applies all pending migrations to prepare the database schema.

If your application uses multiple database connections, pass the connection name to target a specific database.

If your tests require seed data, add the seed() hook after migration. This runs your database seeders to populate tables with initial data.

While migrations run once globally, you need to clean up data between individual tests to prevent state from leaking. AdonisJS offers two approaches: global transactions and truncation.

Global transactions wrap all database operations within a test inside a transaction, then roll back when the test completes. Nothing is actually persisted to the database, which can result in faster test execution.

The withGlobalTransaction() method returns a cleanup function that Japa calls automatically after each test to roll back the transaction.

Truncation clears all data from tables between tests. This approach actually deletes records rather than rolling back transactions.

Global transactions are generally faster, especially when your database has many tables, since rolling back a transaction is less expensive than truncating every table. Choose the approach that best fits your testing needs.

For tests that create files, use the @japa/file-system plugin. This plugin provides a simple API for managing files and automatically cleans them up after each test.

Install the plugin as a dev dependency.

Register the plugin in your test bootstrap file.

Access the fs object within your tests to create files. Any files created through this API are automatically deleted when the test completes.

Files are created in a temporary directory managed by the plugin. For more configuration options and advanced usage, see the Japa file-system plugin documentation.

For tests that interact with Redis, flush the test database between tests to ensure a clean state. Use a group setup hook to call flushdb() before each test.

The flushdb() command clears all keys in the currently selected Redis database without affecting other databases on the same Redis server. Make sure your test environment is configured to use a different Redis database number than development or production.

Use the .env.test file to override environment variables specifically for your test environment. This file is automatically loaded when running tests.

This ensures your tests run against isolated databases without risking your development or production data.

**Examples:**

Example 1 (javascript):
```javascript
import testUtils from '@adonisjs/core/services/test_utils'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => testUtils.db().migrate()],
  teardown: [],
}
```

Example 2 (javascript):
```javascript
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => testUtils.db().migrate(),
    () => testUtils.db('tenant').migrate(),
  ],
  teardown: [],
}
```

Example 3 (javascript):
```javascript
import testUtils from '@adonisjs/core/services/test_utils'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => testUtils.db().migrate(),
    () => testUtils.db().seed(),
  ],
  teardown: [],
}
```

Example 4 (vue):
```vue
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Users', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('can create a user', async () => {
    // Database changes here are automatically rolled back after the test
  })
})
```

---

## File uploads - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/file-uploads

**Contents:**
- File Uploads
- Overview
- Uploading your first file
    - Create the upload form
    - Register the route
    - Create the controller
- Validating uploaded files
  - Inline validation
  - VineJS validation
  - Combining files with other fields

This guide covers file uploads in AdonisJS, from basic single file uploads to advanced direct uploads with cloud storage providers. You will learn how to:

File uploads allow users to send files from their browsers to your AdonisJS application. Unlike many Node.js frameworks that require additional packages for this functionality, AdonisJS has built-in support for parsing multipart requests and processing file uploads through its bodyparser.

When a file is uploaded, AdonisJS automatically saves it to the server's tmp directory. From there, you can validate the file in your controllers and then move it to permanent storage.

For permanent storage, AdonisJS integrates with FlyDrive, which provides a unified API for working with local file systems as well as cloud storage solutions like Amazon S3, Cloudflare R2, and Google Cloud Storage.

We'll build a feature that allows users to update their profile avatar. This is a common requirement and demonstrates all the essential concepts.

First, create a form that accepts file uploads. The critical part is setting the form encoding to multipart/form-data. Without this, the browser won't send files correctly.

Next, register a route to handle the file upload.

Now create a controller that accepts the uploaded file. The request.file() method gives you access to the uploaded file by its field name.

At this point, your application can receive file uploads. The file is already saved in the tmp directory when you access it. The file object contains useful properties:

Accepting any file without validation is dangerous. Users might upload files that are too large, have incorrect formats, or could even be malicious. AdonisJS provides two approaches for validation.

You can validate files directly in the request.file() call by passing validation options as the second argument.

The validation happens as soon as you call request.file(). If the file is too large or has an invalid extension, the avatar.hasErrors property will be true and the avatar.errors array will contain error messages.

While inline validation works, using VineJS validators is the recommended approach because it provides better error messages, consistent validation patterns, and easier testing.

First, create a validator file.

Then use the validator in your controller.

If validation fails, AdonisJS automatically returns a 422 response with detailed error messages. If validation succeeds, you get the validated data in the payload object. The avatar has passed size and extension checks at this point.

A key security feature of AdonisJS is that it uses magic number detection to validate file types. This means even if someone renames a .exe file to .jpg, AdonisJS will detect the actual file type and reject it. This protects your application from users trying to bypass validation by simply changing file extensions.

When your form includes both file uploads and regular fields, the validated payload contains both. Destructure the file field separately before passing the remaining data to your model — passing a multipart file object directly to Model.create() will cause an error:

The { attachment, ...data } destructuring separates the file from the scalar fields so you can pass data directly to the model and handle the file separately.

Files uploaded through forms are temporarily stored in the tmp directory. Most operating systems automatically clean up temporary files, so you cannot rely on them persisting. For permanent storage, you need to move files to a location where they will be preserved.

AdonisJS uses FlyDrive for permanent file storage. FlyDrive provides a unified API that works with local file systems during development and cloud storage providers like S3 or R2 in production.

Install and configure FlyDrive by running the following command:

This command installs the @adonisjs/drive package and creates a config/drive.ts configuration file with local disk storage ready to use. For cloud storage configuration (S3, R2, GCS), see the Drive documentation.

Once FlyDrive is installed, you can move validated files from the tmp directory to permanent storage. The @adonisjs/drive package extends the file object with a moveToDisk() method that handles this automatically.

We generate a unique filename using UUID to prevent collisions. Multiple users might upload files named "avatar.jpg", so unique names prevent overwriting.

The moveToDisk() method handles the transfer from tmp to permanent storage. It uses the configured disk (local filesystem in development or cloud storage in production).

Store the filename in your database after moving. You'll need it later to display the avatar or generate download links.

The @adonisjs/drive package includes a built-in file server that automatically serves uploaded files. The file server registers routes under /uploads followed by your directory structure.

For example, if you store a file as avatars/123e4567.jpg, it becomes accessible at:

Now, instead of hardcoding this path, use the appropriate method for your application type to generate the URL. This ensures the correct URL is returned whether you're using local storage or cloud providers like S3 or R2.

Use the driveUrl Edge helper in your templates:

In controllers that return JSON or render Inertia pages, use the drive service to generate URLs:

You can include this URL in your API response or Inertia props:

Many applications need to accept multiple files in a single request. For example, allowing users to upload several documents for a project, or multiple product images at once.

To accept multiple files, add the multiple attribute to your file input and use an array-style field name.

Use request.files() (plural) instead of request.file() to access multiple uploaded files. This method returns an array of file objects, even if only one file was uploaded.

With VineJS, use vine.array() to validate an array of files. Each file in the array must meet the specified size and extension requirements.

Loop through the validated files and move each one to permanent storage individually. Each file in the array has the same properties and methods as single files, including moveToDisk().

Direct uploads allow files to be uploaded directly from the browser to cloud storage providers like S3, R2, or Google Cloud Storage, completely bypassing your AdonisJS server.

Instead of the standard flow where files travel from browser → your server → cloud storage, direct uploads go straight from browser → cloud storage. Your server only generates a short-lived signed URL that grants temporary permission to upload to a specific location.

This pattern is recommended when handling large file uploads, typically above 100MB. Building a fault-tolerant and resumable upload server for large files is complex work. By using direct uploads, you offload that responsibility to specialized services designed for this purpose.

Additional benefits include reduced server bandwidth usage, better upload performance for users, and built-in resumable uploads from cloud providers.

You'll need an account with a cloud storage provider like Amazon S3, Cloudflare R2, or Google Cloud Storage. Make sure FlyDrive is configured with your cloud provider credentials (refer to the Drive reference guide for configuration details).

Create an endpoint that generates signed upload URLs.

The client provides the filename they want to upload. You should consider validating this and generating unique filenames to prevent collisions.

The signed URL expires after 30 minutes to prevent long-term unauthorized access. Replace 'r2' with your configured disk name (could be 's3', 'gcs', etc.).

The client-side code is more complex than standard form uploads. You'll need a JavaScript library that handles the upload process, progress tracking, and error handling. Popular libraries include Uppy.io, Filepond, or you can use native JavaScript with the Fetch API for custom implementations.

Here's a high-level example using the Fetch API.

The first step requests a signed URL from your AdonisJS application. The second step uses that URL to upload the file directly to cloud storage.

For production applications, consider using a library like Uppy.io that provides additional features like upload progress tracking, automatic retries, resumable uploads, and user-friendly interfaces.

Now that you understand how to implement file uploads, it's important to secure your application against potential abuse.

By default, AdonisJS processes multipart requests (file uploads) on all routes that use POST, PUT, and PATCH methods. This means any endpoint in your application can potentially receive and process file uploads, even if you didn't intend for it to handle files. This unrestricted access allows attackers to target any endpoint in your application to upload files, potentially straining your server's resources, filling up disk space, or using your application to distribute malicious content.

As a first security measure, you must enable file uploads only on specific routes that actually need to handle files. Configure this in your bodyparser settings.

This configuration ensures that only the specified routes will process multipart requests. All other routes will reject file uploads, preventing attackers from uploading files to random endpoints.

If you have public endpoints that accept file uploads (endpoints that don't require authentication), apply strict rate limiting to prevent abuse. See the rate limiting guide for implementation details.

For comprehensive bodyparser configuration options, refer to the BodyParser guide.

**Examples:**

Example 1 (swift):
```swift
@form({ route: 'profile_avatar.update', enctype: 'multipart/form-data' })
  @field.root({ name: 'avatar' })
    @!input.control({ type: 'file' })
    @!field.label({ text: 'Upload new avatar' })
    @!field.error()
  @end

  @!button({ type: 'Submit', text: 'Update Avatar' })
@end
```

Example 2 (javascript):
```javascript
import { Form } from '@adonisjs/inertia/react'

export default function Profile() {
  return (
    <Form route="profile_avatar.update" encType="multipart/form-data">
      {({ errors }) => (
        <>
          <div>
            <label htmlFor="avatar">Upload new avatar</label>
            <input type="file" name="avatar" id="avatar" />
            {errors.avatar && <div>{errors.avatar}</div>}
          </div>
          <button type="submit">Update Avatar</button>
        </>
      )}
    </Form>
  )
}
```

Example 3 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.put('/profile/avatar', [controllers.profileAvatar, 'update'])
```

Example 4 (javascript):
```javascript
import { HttpContext } from '@adonisjs/core/http'

export default class ProfileAvatarController {
  async update({ request, response }: HttpContext) {
    const avatar = request.file('avatar')
    
    if (!avatar) {
      return response.badRequest('Please upload an avatar image')
    }
    
    console.log(avatar)
    
    return 'Avatar uploaded successfully'
  }
}
```


## Session guard - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/session-guard

**Contents:**
- Session guard
- Overview
- Configuring the guard
- Logging in
- Logging out
- Protecting routes
  - Handling authentication errors
- Accessing the authenticated user
  - Avoiding non-null assertions
  - Checking authentication status

This guide covers session-based authentication in AdonisJS. You will learn:

The session guard uses the @adonisjs/session package to track logged-in users. When a user logs in, their identifier is stored in the session, and a cookie is sent to the browser. On subsequent requests, the session middleware reads this cookie and restores the authenticated state.

Sessions and cookies have been the standard for web authentication for decades. Use the session guard when building server-rendered applications or SPAs hosted on the same top-level domain as your API (for example, your app at example.com with an API at api.example.com).

Authentication guards are defined in config/auth.ts. The following example shows a session guard configuration:

The sessionGuard method creates an instance of the SessionGuard class. It accepts a user provider and an optional configuration object for remember me tokens.

The sessionUserProvider method creates an instance of SessionLucidUserProvider, which uses a Lucid model to find users during authentication.

Use the auth.use('web').login() method to create a session for a user. The method accepts a User model instance and stores their identifier in the session.

The auth.use('web') method returns the guard instance configured under the name web in your config/auth.ts file.

Use the auth.use('web').logout() method to destroy the user's session. If the user has an active remember me token, it will also be deleted.

Use the auth middleware to protect routes from unauthenticated users. The middleware is registered in start/kernel.ts under the named middleware collection:

Apply the middleware to routes that require authentication:

By default, the auth middleware authenticates using the default guard from your config. To specify guards explicitly, pass them as an option:

When multiple guards are specified, authentication succeeds if any of them authenticates the request.

When the auth middleware cannot authenticate a request, it throws the E_UNAUTHORIZED_ACCESS exception. The exception is converted to an HTTP response using content negotiation:

After authentication, the user instance is available via auth.user. This property is populated when using the auth middleware, the silent_auth middleware, or when manually calling auth.authenticate() or auth.check().

If you prefer not to use the non-null assertion operator (!), use the auth.getUserOrFail() method instead. It returns the user or throws E_UNAUTHORIZED_ACCESS:

Use the auth.isAuthenticated property to check if the current request is authenticated:

The silent_auth middleware works like the auth middleware but doesn't throw an exception when the user is unauthenticated. The request continues normally, allowing you to optionally use authentication data when available.

This is useful for pages that work for both guests and authenticated users, such as a homepage that shows personalized content for logged-in users.

Register the middleware in your router middleware stack:

The initialize auth middleware shares the ctx.auth object with Edge templates. Access the authenticated user via auth.user:

On public pages that aren't protected by the auth middleware, call auth.check() to attempt authentication before accessing auth.user:

The "Remember Me" feature keeps users logged in after their session expires by storing a long-lived token in a cookie. When the session expires, AdonisJS uses this token to automatically recreate the session.

Remember me tokens are stored in the database. Create a migration for the tokens table:

Assign the DbRememberMeTokensProvider to your User model:

Enable the feature in your guard configuration:

Pass a boolean as the second argument to login() to generate a remember me token:

The guest middleware redirects authenticated users away from pages like /login or /register. This prevents users from creating multiple sessions on a single device.

By default, the middleware checks authentication using the default guard. To specify guards explicitly:

Configure the redirect path for authenticated users in app/middleware/guest_middleware.ts.

The session guard emits events during authentication. See the events reference guide for the complete list.

**Examples:**

Example 1 (javascript):
```javascript
import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      }),
    }),
  },
})

export default authConfig
```

Example 2 (javascript):
```javascript
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request, auth, response }: HttpContext) {
    /**
     * Get credentials from request body
     */
    const { email, password } = request.only(['email', 'password'])

    /**
     * Verify credentials using the AuthFinder mixin
     */
    const user = await User.verifyCredentials(email, password)

    /**
     * Create session for the user
     */
    await auth.use('web').login(user)

    /**
     * Redirect to a protected page
     */
    return response.redirect('/dashboard')
  }
}
```

Example 3 (python):
```python
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
```

Example 4 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
})
```

---

## Service providers - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/service-providers

**Contents:**
- Service Providers
- Overview
- Understanding service providers
  - Where service providers are registered
  - Built-in service providers
  - Execution order and environments
- When to create a service provider
- Creating a custom service provider
    - Generate the provider
    - Understand the generated code

This guide covers service providers in AdonisJS applications. You will learn how to:

Service providers are JavaScript classes with lifecycle hooks that execute at specific points during application startup and shutdown. This allows you to register bindings to the IoC container, extend framework classes using Macros, perform initialization at precise moments, and clean up resources during graceful shutdown.

The key advantage is centralized initialization logic that runs at predictable times, without modifying core framework code or scattering setup code throughout your application. Every AdonisJS application and package uses service providers to hook into the application lifecycle, making them fundamental to understanding the framework.

Before creating your own service providers, it's helpful to understand how they work within an AdonisJS application.

Service providers are registered in the adonisrc.ts file at the root of your project. This file defines which providers should load and in which runtime environments they should execute.

Providers use lazy imports with the () => import() syntax, ensuring they're only loaded when needed.

A typical AdonisJS application includes several framework providers that handle core functionality.

app_provider - Registers fundamental application services and helpers that every AdonisJS app needs.

hash_provider - Registers the hash service used for password hashing and verification.

repl_provider - Adds REPL-specific bindings. Notice it only runs in the repl and test environments, demonstrating environment restrictions.

http_provider - Sets up the HTTP server and related services for handling web requests.

When you install additional packages like @adonisjs/lucid for database access or @adonisjs/auth for authentication, these packages include their own service providers that you add to this array.

AdonisJS calls lifecycle hooks in phases across all registered providers. First, the register hook runs for all providers in the order they are registered. Then the boot hook runs for all providers in the order they are registered, followed by start, ready, and finally shutdown.

Environment restrictions determine whether a provider runs at all. For instance, a WebSocket provider configured for the web environment won't execute when you run console commands.

This combination of execution order and environment filtering gives you precise control over what runs and when.

Create a custom service provider when you need to register services into the IoC container, extend framework classes with macros, perform initialization at specific lifecycle points, set up resources that require cleanup during shutdown, or configure third-party packages application-wide.

You typically don't need a service provider for simple utility functions, one-off setup that only runs in a single place, or services used within a single controller or middleware. In these cases, use regular modules or inject dependencies directly.

Now that you understand when service providers are appropriate, let's build one that registers a Cache service into the IoC container.

AdonisJS includes a command to generate service provider files.

This command creates the provider file and automatically registers it in your adonisrc.ts file.

Open the generated providers/cache_provider.ts file. You'll see a basic provider structure.

The provider receives the ApplicationService through its constructor, giving you access to the IoC container and other application services. All lifecycle methods are optional. You only implement the hooks you need.

Let's register a simple Cache class into the container using the register method. For this example, we'll create a minimal Cache class in the same file, though in a real-world package this class would typically live elsewhere.

Once registered, you can inject the Cache service into controllers or other container-managed classes.

Service providers offer five lifecycle hooks that run at different stages of your application's lifetime. Here's when each hook executes:

The register method is called as soon as AdonisJS imports your provider, very early in the boot process before any other hooks run. Its primary purpose is to register bindings into the IoC container.

The register hook is synchronous and must remain synchronous. Don't attempt to resolve bindings, perform I/O operations, or access framework services that might not be ready yet.

The boot method runs after all providers have finished registering their bindings. At this point, the container is fully populated and you can safely resolve any binding. This makes boot the natural place to extend framework classes or configure services that depend on other registered bindings.

Use boot to configure validators with custom rules, register Edge template helpers, or set up any service that depends on other container bindings being available.

The start method runs just before the HTTP server starts (in the web environment) or before an Ace command executes (in the console environment). Preload files are imported after this hook completes.

Use start to register routes, warm caches, or perform health checks on external services.

The ready method runs after the HTTP server has started accepting connections (in the web environment) or just before executing an Ace command's run method (in the console environment). This is your last opportunity to perform setup that requires a fully initialized application.

Use ready to integrate services that must attach to the running HTTP server, such as WebSocket servers, or to perform post-startup tasks like sending notifications that the application is online.

The shutdown method runs when AdonisJS receives a signal to terminate gracefully. This is your opportunity to clean up resources, close connections, and ensure your application shuts down without losing data or leaving dangling processes.

Use shutdown to close database connection pools, flush pending log writes, disconnect from Redis, close file handles, or perform any other cleanup necessary for graceful termination. The framework waits for all shutdown hooks to complete before exiting.

**Examples:**

Example 1 (json):
```json
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/http_provider'),
  ],
})
```

Example 2 (unknown):
```unknown
node ace make:provider cache
```

Example 3 (markdown):
```markdown
# Output:
# CREATE: providers/cache_provider.ts
```

Example 4 (python):
```python
import type { ApplicationService } from '@adonisjs/core/types'

export default class CacheProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Called when the provider is registered
   */
  register() {}

  /**
   * Called when the application boots
   */
  async boot() {}

  /**
   * Called when the application starts
   */
  async start() {}

  /**
   * Called when the application is ready
   */
  async ready() {}

  /**
   * Called during graceful shutdown
   */
  async shutdown() {}
}
```

---

## EdgeJS - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/edgejs

**Contents:**
- Edge Templates
- Overview
- Your first template
    - Create the template file
    - Add the template content
    - Define the route
    - Create the controller
    - View the result
- Understanding template state
- Template syntax refresher

This guide covers using Edge templates in AdonisJS applications. You will learn how to render templates from controllers, pass data to templates, work with layouts and components, use the pre-built components from the Hypermedia starter kit, and debug template issues.

Edge is a server-side templating engine for Node.js that allows you to compose HTML markup on the server and send the final static HTML to the browser. Since templates execute entirely on the server-side, they can tap into core framework features like authentication, authorization checks, and the translations system.

When you create a Hypermedia application in AdonisJS, Edge comes pre-configured and ready to use. Templates are stored in the resources/views directory with the .edge file extension, and you render them from your route handlers or controllers using the view property from the HTTP context.

Edge has comprehensive documentation at edgejs.dev, which covers the template syntax, components system, and all available features in detail. This guide focuses specifically on using Edge within AdonisJS applications and introduces the pre-built components included in the Hypermedia starter kit.

Let's create a simple page that displays a list of blog posts. This example demonstrates the fundamental workflow of rendering templates in AdonisJS.

Generate a new template using the Ace command.

Open resources/views/pages/posts/index.edge and add the following content.

A few important things to understand about this template:

The @layout() component wraps your content with a complete HTML document structure (including <html>, <head>, and <body> tags). We'll explore layouts in detail later in this guide.

The @each tag loops over the posts array and renders the content for each post. Edge provides several tags like @if, @else, and @elseif for writing logic in templates. You can learn about all available tags in the Edge syntax reference.

The double curly braces {{ }} evaluate and output a JavaScript expression. The triple curly braces {{{ }}} do the same but don't escape HTML, which is useful for rendering rich content.

Create a route to handle requests to the posts page.

Create a controller that renders the template with post data.

Visit http://localhost:3333/posts in your browser to see the rendered page.

You can also render templates directly from routes without using a controller.

The data object you pass to view.render() is called the template state. All properties in this object become available as variables in your template.

In addition to the data you explicitly pass, AdonisJS automatically shares certain globals with every template:

You can view all available helpers and global properties in the Edge reference guide.

Edge uses a combination of curly braces and tags to add dynamic behavior to your templates. Here's a quick refresher of the most common syntax patterns:

Outputting variables:

Outputting unescaped HTML:

Evaluating JavaScript expressions:

For complete coverage of Edge's template syntax, including advanced features like partials, slots, and custom tags, refer to the Edge syntax reference.

The @layout() component you saw in the first example wraps your page content with a complete HTML document structure. This component is stored at resources/views/components/layout.edge and contains the standard HTML boilerplate:

The $slots.main() method call renders whatever content you place between the opening and closing @layout() tags in your page templates. This is Edge's slots feature, which allows components to accept content from their consumers.

Components in Edge are reusable template fragments stored in the resources/views/components directory. Any template file in this directory becomes available as an Edge tag.

For example, if you create a file at resources/views/components/card.edge:

You can use it in your templates like this:

Components can accept props (parameters) and have multiple named slots for more complex compositions. For a complete guide to building and using components, see the Edge components guide.

The Hypermedia starter kit includes a collection of unstyled components for building forms and common UI patterns. Each component renders at most one HTML element and passes unknown props through as HTML attributes, allowing you to apply classes and other attributes directly.

Renders the HTML document with head and body elements.

Renders an HTML form element with automatic CSRF token injection.

Form field components work together to create accessible form inputs with labels and validation error display.

Container that establishes context for child field components.

Renders a label element associated with the field.

Displays validation errors for the field. Automatically looks up errors by the field name.

Renders an input element. Must be a child of @field.root. It passes all props as HTML attributes to the input element.

Renders a select element with options. Must be a child of @field.root.

Renders a textarea element. Must be a child of @field.root. It passes all props as HTML attributes to the textarea element.

Checkbox components create checkbox inputs with shared naming for form submission.

Container that establishes the shared name for child checkboxes.

Renders a checkbox input. Must be nested within both @checkbox.group and @field.root. It passes all props as HTML attributes. Use value to set the checkbox value.

Radio components create mutually exclusive options within a group.

Container that establishes the shared name for child radio buttons.

Renders a radio input. Must be nested within both @radio.group and @field.root. It passes all props as HTML attributes. Use value to set the radio value.

Alert components display notification messages with optional auto-dismiss behavior.

Container that establishes context for alert title and description.

Renders the alert heading.

Renders the alert body text.

Renders a button element.

Renders an anchor element with route-based URL generation.

Renders either an image or initials for user avatars.

When working with templates, you may need to inspect the data available in your template or debug why certain values aren't displaying as expected. Edge provides the @dump tag for this purpose.

The @dump tag pretty-prints the value of a variable, making it easy to inspect data structures:

To view the entire template state (all variables available in your template), use:

The output appears in your rendered HTML, showing the structure and values of your data. During development, templates automatically reload when you make changes, so you'll see updates immediately in your browser without restarting the server.

Edge comes pre-configured in Hypermedia applications and works out of the box. However, you can customize Edge by creating a preload file if you need to register custom helpers, tags, or plugins.

Create a preload file for Edge configuration:

This creates a preload file where you can customize Edge before your application starts. Inside this file, you can register Edge globals, plugins, and custom tags.

If you need to customize the directory where templates are stored, you can modify the directories option in your adonisrc.ts file. See the AdonisRC reference guide for more details on configuration options.

**Examples:**

Example 1 (markdown):
```markdown
node ace make:view pages/posts/index
# CREATE: resources/views/pages/posts/index.edge
```

Example 2 (elixir):
```elixir
@layout()
  @each(post in posts)
    <div>
      <h2>
        {{ post.title }}
      </h2>
      <div>
        <p>{{{ excerpt(post.content, 280) }}}</p>
      </div>
    </div>
  @end
@end
```

Example 3 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.PostsController, 'index'])
```

Example 4 (python):
```python
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    /**
     * Render the template located at resources/views/pages/posts/index.edge
     * The first parameter is the template path (relative to resources/views)
     * The second parameter is the template state (data to share with the template)
     */
    return view.render('pages/posts/index', {
      posts: await Post.all(),
    })
  }
}
```

---

## Transformers - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/transformers

**Contents:**
- Transformers
- Overview
  - Understanding JSON serialization
- Creating your first transformer
    - Generate the transformer
    - Define the output shape
    - Use the transformer in your controller
    - Register routes
    - Understanding the generated types
- Resource items and collections

This guide covers data transformation in AdonisJS applications. You will learn how to:

Transformers provide a structured way to convert your backend data into JSON responses for HTTP clients. When building APIs or full-stack applications, the data structures you work with in your backend (Lucid models, custom classes, DateTime objects) cannot be sent directly over HTTP—everything must be serialized to JSON first, which is fundamentally a string format.

Rather than letting AdonisJS handle serialization implicitly, transformers give you explicit control over this process. You define exactly which fields to include, how to format them, and what shape your responses should take. This approach offers several benefits:

If you're building an Inertia application or any API that returns JSON data, we highly recommend using transformers for all HTTP responses. The generated TypeScript types eliminate the need to maintain duplicate type definitions, ensuring your frontend and backend stay in sync automatically.

Before diving into transformers, it's important to understand why they exist. When you send data over HTTP, everything must be converted to a string—specifically, a JSON string. This means rich data types from your programming language cannot be transmitted directly.

Consider a Lucid model with a createdAt field that's a Luxon DateTime object. In JavaScript/TypeScript, this is a complex object with methods like .toISO() and .diff(). But when sent over HTTP, it must become a simple string like "2024-01-15T10:30:00.000Z". Similarly, a BigInt value or a custom class instance must be converted to a JSON-compatible format.

Without explicit serialization control, you might accidentally expose sensitive data, send inconsistent date formats, or include internal implementation details that your frontend doesn't need. Transformers solve this by requiring you to be explicit about what gets serialized and how.

Let's start with a practical example. Suppose you have a Post model and need to return post data to your frontend. First, here's what the Post model looks like.

Run the following command to create a transformer for posts.

This creates a file in the app/transformers directory with the following default structure.

The transformer extends BaseTransformer with a generic type parameter specifying what it transforms (in this case, Post). The toObject() method defines the default output shape. The this.resource property gives you access to the Post instance being transformed.

The toObject() method determines what fields appear in your JSON response. The this.pick() helper selects specific fields from the model. Let's expand our transformer to include the fields we want.

This transformer explicitly includes only these five fields. Any other fields on the Post model (like internal metadata or sensitive data) will be excluded from the output.

Now let's use this transformer in a controller to return data. Use node ace make:controller posts command to create a controller, if it does not already exist.

The pattern is straightforward: call PostTransformer.transform() with your data, then wrap the result in the serialize() helper from the HTTP context. The serialize() function handles the actual JSON conversion and sends the response.

The same transformer works for both a single post and a collection of posts. AdonisJS automatically detects whether you're transforming one item or many and structures the output accordingly.

When you start your development server with node ace serve --hmr, AdonisJS automatically generates TypeScript types for your transformers. These types are stored in .adonisjs/client/data.d.ts.

Your frontend code can now import and use these types. In Inertia applications, there's a pre-configured alias that makes this convenient.

This means your frontend automatically knows the exact shape of data coming from your API. If you add or remove fields in your transformer, the TypeScript types update automatically when the dev server reloads. You never need to manually maintain duplicate type definitions.

Transformers handle both single resources and collections automatically. When you call PostTransformer.transform(), it returns either a ResourceItem or ResourceCollection depending on what you pass in.

The serialized output structure differs slightly between items and collections. A single item returns your transformed object directly, while a collection wraps the items in a data array. Both go through the same toObject() method you defined in your transformer.

When working with large datasets, you'll typically paginate results. Lucid's query builder provides a paginate() method that returns both the data rows and pagination metadata. Transformers have a dedicated method for handling paginated responses.

The PostTransformer.paginate() method takes two arguments: the array of data to transform and the pagination metadata. The resulting JSON response includes both the transformed data and the pagination information.

Your frontend can use the metadata object to build pagination controls while the data array contains the transformed posts.

When building Inertia applications, you can pass transformer resources directly to inertia.render() without using the serialize() helper. The Inertia adapter automatically handles serialization of ResourceItem and ResourceCollection objects.

All transformer features work identically with Inertia — including variants, relationships, and custom data. Throughout the rest of this guide, we'll use the serialize() helper in examples, but the same principles apply when using inertia.render().

Transformers can include related data by composing with other transformers. Each entity in your application should have its own transformer, and these transformers can reference each other when including relationships.

First, let's create a transformer for the User model.

Now you can include the post's author in the PostTransformer by using the UserTransformer.

Relationships can only appear as top-level properties in your transformer output. You compose transformers by calling their transform() method with the related model instance.

Transformers do not issue any database queries. They only work with data you've already loaded. If you forget to eager-load a relationship and try to transform it, you'll access undefined data and get a runtime error.

Sometimes a relationship might or might not be loaded depending on the request context. For example, you might only eager-load the author for specific endpoints. In these cases, you need to guard against undefined values explicitly.

The this.whenLoaded() helper checks if a relationship has been loaded before attempting to transform it.

Now if the author relationship hasn't been loaded, the transformer won't throw an error. The author field will simply be omitted from the output. You can also use a ternary operator if you prefer more explicit control.

By default, transformers serialize relationships up to one level deep. This prevents accidentally over-fetching nested data that your frontend might not need. For example, if a User has Posts and each Post has Comments, only the first level (User → Posts) would be serialized by default.

You can control this depth manually using the .depth() method.

With .depth(2), if you eager-load nested relationships, they'll be included in the transformation. This gives you fine-grained control over how deep the serialization goes for each relationship.

How depth works across nested transformers:

A single transformer can produce different output shapes for different contexts. This is useful when the same resource needs to be displayed differently across your application — for example, a lightweight version for list views and a detailed version for single-item views.

Variants are defined by creating additional methods in your transformer alongside toObject(). These methods can be named anything, but we recommend a consistent convention like for<Purpose> to make their intent clear.

The default toObject() method returns basic fields suitable for displaying a list of posts. The forDetailedView() variant extends this with additional computed data—in this case, converting markdown content to HTML. Notice that variant methods can be async if they need to perform asynchronous operations.

You can reuse the default variant by calling this.toObject() and spreading its result, then adding or overriding specific fields. This keeps your variants DRY and ensures consistency.

To use a variant, call the .useVariant() method on the transformed resource.

The .useVariant() method takes the name of the variant method as a string. When the response is serialized, it will call forDetailedView() instead of the default toObject().

The generated TypeScript types include definitions for all your variants. Your frontend code can specify which variant type it expects.

Access variant types using Data.<Resource>.Variants['<variantName>']. This ensures your frontend components receive properly typed props that match the exact shape returned by your API for that specific variant.

Transformer methods can inject dependencies from AdonisJS's IoC container using the @inject() decorator. This is useful when you need access to services or context information during transformation.

A common use case is injecting the HttpContext to access the currently authenticated user. This allows you to compute authorization permissions or user-specific data during transformation.

The @inject() decorator tells AdonisJS to resolve dependencies for this method. You can destructure properties from the injected HttpContext, such as auth, request, or any other context property you need.

When you call PostTransformer.transform(post), it returns a ResourceItem or ResourceCollection object. These objects don't immediately execute your transformer methods. Instead, when you pass them to serialize(), that's when the IoC container resolves dependencies and calls your transformer methods with the injected values.

This means dependency injection happens automatically during the serialization phase in your controller. You don't need to manually pass the HttpContext or other dependencies—the framework handles this for you.

Sometimes you need to pass additional context to your transformer beyond the resource being serialized. For example, you might want to include user-specific data like whether the current user has liked a post, or configuration that affects how the data is transformed.

You can pass custom data to a transformer by accepting additional parameters in the transformer's constructor. These parameters come after the resource parameter in the transform() method.

When calling the transformer, pass the custom data as additional arguments after the resource.

Since the custom data is stored as an instance property, it's automatically available in all variant methods as well. This pattern works seamlessly with dependency injection, variants, and all other transformer features.

Before you start using transformers in your application, it's important to understand what they are and when to use them.

It's important to understand that transformers are not Data Transfer Objects (DTOs) for request validation. They serve a different purpose:

Don't use transformers to validate or transform request data. Use AdonisJS's validation system for that purpose. Transformers are exclusively for serializing your backend data structures into JSON responses for clients.

Use transformers in any situation where your backend returns JSON data to a client:

The generated TypeScript types are most useful in Inertia applications or full-stack TypeScript monorepos where your frontend can directly import types from your backend. Mobile clients typically won't leverage the generated types, but they still benefit from the consistent, well-shaped JSON responses that transformers provide.

**Examples:**

Example 1 (jsx):
```jsx
import User from '#models/user'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>
}
```

Example 2 (markdown):
```markdown
node ace make:transformer post
# CREATE: app/transformers/post_transformer.ts
```

Example 3 (python):
```python
import { BaseTransformer } from '@adonisjs/core/transformers'
import Post from '#models/post'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return this.pick(this.resource, ['id'])
  }
}
```

Example 4 (python):
```python
import { BaseTransformer } from '@adonisjs/core/transformers'
import type Post from '#models/post'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'title', 
      'content',
      'createdAt',
      'updatedAt'
    ])
  }
}
```

---

## Introduction - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/introduction

**Contents:**
- Introduction to testing
- Overview
- Japa and AdonisJS integration
- Project structure
  - Understanding suites
  - Configuring plugins and hooks
- Creating your first test
- Running tests
  - Filtering tests
  - Watch mode

This guide covers the testing setup in AdonisJS applications. You will learn:

AdonisJS has built-in support for testing, and all starter kits come pre-configured with a complete testing setup. You can start writing tests immediately without any additional configuration.

The testing layer is powered by Japa, a testing framework we've built and maintained for over seven years. Unlike general-purpose test runners like Jest or Vitest, Japa is purpose-built for backend applications. It runs natively in Node.js without transpilers and includes plugins specifically designed for backend testing, such as an API client for testing JSON endpoints and a filesystem plugin for managing temporary files during tests.

We chose to build and maintain our own testing framework to avoid the churn that's common in the JavaScript ecosystem. Having seen the community shift from Mocha to Jest to Vitest, we're glad we invested in tooling we control and can evolve alongside AdonisJS.

Japa integrates deeply with AdonisJS through the @japa/plugin-adonisjs package. This plugin extends Japa with AdonisJS-specific utilities, giving your tests access to the application instance, route helpers for computing URLs, and methods for reading and writing cookies during HTTP and browser tests.

The integration means you write tests that feel native to AdonisJS rather than bolting on a generic test runner that doesn't understand your application's structure.

AdonisJS organizes tests into suites, where each suite represents a category of tests with its own configuration. A typical project structure looks like this.

The tests/bootstrap.ts file configures Japa plugins and lifecycle hooks. Individual test files live in suite directories, and each suite can have different timeouts, plugins, and setup logic appropriate for that type of testing.

A test suite groups related tests that share common characteristics. For example, unit tests run quickly and don't need an HTTP server, while browser tests require a running server and have longer timeouts to account for browser automation.

Hypermedia and Inertia starter kits come with two suites pre-configured:

Suites are defined in your adonisrc.ts file.

Each suite specifies a glob pattern for locating test files, a name for filtering, and a timeout in milliseconds. Browser tests have a much longer timeout (5 minutes) because browser automation is inherently slower than in-process unit tests.

The tests/bootstrap.ts file is where you configure Japa plugins and define lifecycle hooks that run before and after your test suites.

The configureSuite function allows you to add setup logic specific to certain suites. In this example, browser, functional, and e2e suites automatically start the HTTP server before tests run.

Generate a new test file using the make:test command.

This creates a test file at tests/browser/posts/index.spec.ts with the following structure.

Tests are organized into groups using test.group(), which helps structure related tests and allows you to apply shared setup and teardown logic. Individual tests are defined with test() and receive a context object containing utilities like assert for making assertions.

Run your entire test suite with the following command.

To run a specific suite, pass the suite name as an argument.

Japa provides several flags for running a subset of tests.

Filter by exact test title.

Filter by test filename (matches against the end of the filename without .spec.ts). The --files flag supports wildcards for running all tests in a directory.

Filter by exact group name.

Filter by tags (prefix with ~ to exclude).

Require all specified tags to match instead of any.

During development, use watch mode to automatically re-run tests when files change.

When a test file changes, only that file's tests are re-run. When a source file changes, all tests are executed.

If you're iterating on a single test, combine watch mode with the --files filter. This ensures any file change runs only the tests you're focused on, providing faster feedback.

Two flags are particularly useful during development.

The --bail flag helps when debugging a failing test by preventing subsequent tests from running. The --failed flag is useful for quickly verifying that your fix resolved all failures without running the entire suite.

AdonisJS automatically loads a .env.test file when running tests, merging its values with your standard .env file. Any variable defined in .env.test overrides the corresponding value from .env.

Create a .env.test file in your project root to configure test-specific settings.

The memory session driver is commonly used in tests because it doesn't persist sessions between requests, ensuring test isolation. Other variables you might override include database connection settings, mail drivers, or any service configuration that should behave differently during testing.

Now that you understand how testing is configured in AdonisJS, explore the specific testing guides:

**Examples:**

Example 1 (unknown):
```unknown
tests/
├── bootstrap.ts
├── unit/
│   └── posts_service.spec.ts
└── browser/
    └── posts.spec.ts
```

Example 2 (json):
```json
{
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec.ts'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/browser/**/*.spec.ts'],
        name: 'browser',
        timeout: 300000,
      },
    ],
    forceExit: false,
  }
}
```

Example 3 (javascript):
```javascript
import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
```

Example 4 (sass):
```sass
node ace make:test posts/index --suite=browser
```

---

## Vite - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/vite

**Contents:**
- Vite
- Overview
- Installation
- Configuration
  - Vite configuration
  - AdonisJS configuration
- Folder structure
- Starting the development server
- Including entrypoints in templates
- Referencing assets in templates

This guide covers frontend asset bundling with Vite in AdonisJS. You will learn how to:

Vite is a modern frontend build tool that provides fast development server startup and instant hot module replacement. AdonisJS embeds Vite directly into the development server rather than running it as a separate process. This embedded approach means you manage a single server during development, and AdonisJS can access Vite's runtime API directly for features like server-side rendering.

The integration handles the complexity of connecting Vite with a backend framework. During development, AdonisJS proxies asset requests to Vite through middleware. In production, AdonisJS reads the manifest file that Vite generates to resolve the correct paths for bundled assets.

The official @adonisjs/vite package provides Edge helpers and tags for generating asset URLs, a dedicated Vite plugin that simplifies configuration, and access to the Vite Runtime API for server-side rendering.

See also: Vite documentation

Run the following command to install and configure the package. This installs both @adonisjs/vite and vite, then creates the necessary configuration files.

After installation, add the following to your adonisrc.ts file to integrate Vite with the build process.

The assetsBundler property disables the default asset bundler management in AdonisJS Assembler. The hooks property registers the Vite build hook to execute the Vite build process when you run node ace build.

See also: Assembler hooks

The setup process creates two configuration files. The vite.config.ts file configures the Vite bundler itself, while config/vite.ts configures how AdonisJS interacts with Vite on the backend.

The vite.config.ts file is a standard Vite configuration file. You can install and register additional Vite plugins here based on your project requirements.

The AdonisJS plugin accepts the following options.

If you change buildDirectory, you must update the same value in config/vite.ts to keep both configurations in sync.

The config/vite.ts file tells AdonisJS where to find Vite's build output and how to generate asset URLs.

You can add custom attributes to the generated script and link tags.

For conditional attributes based on the asset being loaded, pass a function instead.

AdonisJS does not enforce a specific folder structure for frontend assets. However, we recommend storing them in the resources directory with subdirectories for each asset type.

Vite outputs bundled files to public/assets by default. The /assets subdirectory keeps Vite output separate from other static files in the public folder that you may not want Vite to process.

Start your application with the --hmr flag to enable Hot Module Replacement. AdonisJS automatically proxies asset requests to the embedded Vite server.

Hot Module Replacement (HMR) allows Vite to update modules in the browser without a full page reload. When you edit a CSS file or a JavaScript module, the changes appear instantly while preserving application state.

Use the @vite Edge tag to render script and link tags for your entrypoints. The tag accepts an array of entry point paths and generates the appropriate HTML tags.

We recommend importing CSS files inside your JavaScript entry point rather than registering them as separate entrypoints. This approach lets Vite handle CSS processing and hot replacement automatically.

Vite builds a dependency graph of files imported by your entry points and updates their paths in the bundled output. However, Vite cannot detect assets referenced only in Edge templates since it does not parse template files.

Use the asset helper to create URLs for files that Vite processes. During development, the helper returns a URL pointing to the Vite dev server. In production, it returns the path to the bundled file with the content hash in the filename.

Vite ignores static assets that are not imported by your frontend code. Images, fonts, and icons referenced only in Edge templates fall into this category.

To include these assets in the build, use Vite's glob import API in your entry point file. This tells Vite to process the matched files even though they are not directly imported.

After adding the glob import, you can reference these images in your templates using the asset helper.

If you use TypeScript for frontend code, create a separate tsconfig.json inside the resources directory. Vite and your code editor will use this configuration for TypeScript files within the resources directory.

If you use React, add the jsx option.

To enable React Fast Refresh during development, add the @viteReactRefresh Edge tag before the @vite tag in your layout.

Then configure the React plugin in your Vite configuration.

To serve bundled assets from a CDN in production, configure the assetsUrl option in both configuration files. This ensures that URLs in the manifest file and lazy-loaded chunks point to your CDN server.

After building your application with node ace build, upload the contents of public/assets to your CDN.

If assets fail to load in production, verify that Vite has generated the manifest file at public/assets/.vite/manifest.json. The manifest maps source files to their bundled output paths.

If the manifest is missing, ensure the build hook is registered in adonisrc.ts and run node ace build again.

Images and other static assets referenced only in templates are not automatically included in the build. Vite only processes files that are imported by your JavaScript code.

Add a glob import to your entry point to include static assets.

Hot Module Replacement requires the --hmr flag when starting the dev server.

If HMR still does not work, check your browser console for WebSocket connection errors. Firewall or proxy configurations may block the HMR WebSocket connection.

With version 3.x, Vite runs in middleware mode. Rather than spawning Vite as a separate process with its own server, AdonisJS embeds Vite and proxies matching requests through middleware.

The advantages of middleware mode include direct access to the Vite Runtime API for server-side rendering and a single development server to manage. All assets are served through AdonisJS rather than a separate Vite process.

See also: Vite SSR documentation

When you build for production, Vite generates a manifest file alongside the bundled assets. The manifest is a JSON file that maps source file paths to their bundled output paths, including content hashes.

AdonisJS reads this manifest to resolve asset URLs. When you call the asset helper or use the @vite tag in production, AdonisJS looks up the file in the manifest and returns the correct bundled path.

The manifest file is located at public/assets/.vite/manifest.json by default.

See also: Vite backend integration

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/vite
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/vite/vite_provider')
  ]
}
```

Example 3 (javascript):
```javascript
import { defineConfig } from '@adonisjs/core/build/standalone'

export default defineConfig({
  hooks: {
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
})
```

Example 4 (python):
```python
import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entry point files for your frontend code. Each entry point
       * produces a separate output bundle. You can define multiple
       * entry points for different parts of your application.
       */
      entrypoints: ['resources/js/app.js'],

      /**
       * Glob patterns for files that trigger a browser reload when
       * changed. Useful for template files that Vite doesn't track.
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ]
})
```

---

## HTTP context - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/http-context

**Contents:**
- HTTP Context
- Overview
- Accessing HTTP context
  - In route handlers
  - In middleware
- Available properties
- Using dependency injection
  - Injecting into services
  - Using services in controllers
- Using Async local storage

This guide covers the HTTP context object in AdonisJS. You will learn:

The HTTP context is a request-scoped object that holds everything you need to handle an HTTP request. It contains properties like request, response, auth, logger, session, and more. AdonisJS creates a fresh HTTP context instance for every incoming request and passes it to your route handlers and middleware.

Instead of using global variables or importing request/response objects from different modules, the HTTP context provides a clean, type-safe way to access all request-specific data and services in one place. Every property on the context is specifically tied to the current request, ensuring complete isolation between concurrent requests.

The most common way to access the HTTP context is by receiving it as a parameter in your route handlers. You typically destructure only the properties you need rather than working with the full context object.

When using controllers, the pattern is identical. The controller method receives the HTTP context as its first parameter:

Middleware functions also receive the HTTP context as their first parameter. The second parameter is the next function to call the next middleware in the chain.

The HTTP context provides access to many framework services and request-specific data. Here are the most commonly used properties:

When you need to access the HTTP context inside service classes or other parts of your codebase, you can use dependency injection. This pattern is cleaner than passing the context manually through multiple function calls.

To inject the HTTP context into a service, type-hint it in the constructor and mark the class with the @inject() decorator.

To enable automatic dependency injection, you must inject the PostService into the controller method. When the container calls the index method, it will construct the entire tree of dependencies and provide the HTTP context to the PostService.

Async local storage (ALS) allows you to access the HTTP context from anywhere in your application without explicitly passing it through function parameters.

We recommend using dependency injection or passing HttpContext by reference as your primary patterns. Only reach for ALS when it's extremely necessary, such as in utility functions or third-party libraries where passing context explicitly is not feasible.

To use ALS, you must first enable it inside the config/app.ts file under the http block.

Once enabled, you can access the current HTTP context using the static getOrFail() method.

Keep in mind that enabling async local storage has a slight performance overhead. The HttpContext.getOrFail() method will throw an error when called outside the context of an HTTP request, so it only works within the request lifecycle.

You can add custom properties to the HTTP context by augmenting the HttpContext interface in your middleware file. This is useful when you need to share data across multiple middleware and route handlers during the same request.

When writing tests, you often need a dummy HTTP context instance to test route handlers, middleware, or services. Use the testUtils service to create these test instances.

The created context instance is not attached to any route, so ctx.route and ctx.params will be undefined. You can manually assign these properties if your code under test requires them.

The createHttpContext method uses fake values for the underlying Node.js req and res objects by default. If you need to test with real request and response objects, you can provide them.

If you're building a package outside of an AdonisJS application, you can use the HttpContextFactory class directly. The testUtils service is only available within AdonisJS applications, but the factory works anywhere.

**Examples:**

Example 1 (scala):
```scala
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', async ({ params, request, response }) => {
  /**
   * Extract the post ID from route parameters.
   * The params object is a property of HTTP context.
   */
  const id = params.id
  
  /**
   * Access request data like query strings or headers.
   * The request object is another property of HTTP context.
   */
  const include = request.qs().include
  
  /**
   * Return a JSON response using the response object.
   */
  return response.json({ id, include })
})
```

Example 2 (javascript):
```javascript
import { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async show({ params, request, response }: HttpContext) {
    /**
     * Same destructuring pattern works in controller methods.
     * You only extract what you need for this specific action.
     */
    const id = params.id
    const post = await Post.find(id)
    
    return response.json(post)
  }
}
```

Example 3 (javascript):
```javascript
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class LogRequestMiddleware {
  async handle({ request, logger }: HttpContext, next: NextFn) {
    /**
     * Access the logger from the context to log request details.
     * The logger is already configured and ready to use.
     */
    logger.info(`${request.method()} ${request.url()}`)
    
    /**
     * Call next() to continue the request through the middleware chain.
     */
    await next()
  }
}
```

Example 4 (elixir):
```elixir
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

@inject()
export default class PostService {
  constructor(protected ctx: HttpContext) {}
  
  async getVisiblePosts() {
    /**
     * Access the authenticated user from the context.
     * The context is available throughout all service methods.
     */
    const user = this.ctx.auth.user
    
    /**
     * Use the user's permissions to filter visible posts.
     */
    if (user?.isAdmin) {
      return Post.all()
    }
    
    return Post.query().where('published', true)
  }
}
```

---

## Barrel files - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/barrel-files

**Contents:**
- Barrel Files
- Overview
- The problem: Import clutter
- The solution: Barrel files
- How barrel files work
  - File locations and import aliases
- Performance and lazy loading
- Disabling barrel files

This guide covers barrel files in AdonisJS and how they reduce import clutter in your codebase. You will learn about:

A barrel file is an auto-generated collection of exports for a specific entity type in your application. AdonisJS creates barrel files for controllers, bouncer policies, events, and event listeners, storing them in the .adonisjs/server directory.

Barrel files are completely optional. You can continue using direct imports if you prefer, and disable barrel file generation entirely through configuration.

As your application grows, files like start/routes.ts accumulate dozens of controller imports.

In the following example, with just four controllers, the imports already consume significant vertical space. In production applications with 20+ controllers, you spend more time scrolling past imports than working with routes.

Barrel files consolidate all those individual imports into a single import statement. Here's the same routes file using the controllers barrel file:

The difference is immediately visible. Four imports become one, and your routes are right at the top of the file where you need them. The only change to your route definitions is using the controllers namespace to access each controller.

The barrel file itself is remarkably simple. It's just a JavaScript object mapping controller names to lazy import functions. Here's what .adonisjs/server/controllers.ts looks like:

The dev server generates this file automatically when you run node ace serve. As you create or delete controllers during development, the dev server's watcher updates the barrel file to stay in sync with your codebase.

Barrel files are organized in the .adonisjs/server directory with corresponding import aliases:

The .adonisjs/server directory is registered as a subpath import alias in your package.json, allowing you to use the #generated prefix.

The .adonisjs directory contains auto-generated files managed by the framework. You should not manually edit files in this directory, as your changes will be overwritten when the dev server regenerates them.

You might wonder if importing all controllers at once hurts performance. The answer is no, because barrel files use lazy imports.

Each controller in the barrel file is wrapped in a function that returns a dynamic import.

The () => import() function is only called when you actually use that controller in a route. Until then, the controller module is never loaded. This means barrel files have zero performance impact. Controllers are still loaded on-demand, exactly as they would be with direct imports.

If you prefer not to use barrel files, you can disable their generation through the adonisrc.ts configuration file. The generation is managed using the init assembler hook.

After disabling barrel file generation, existing barrel files will remain in the .adonisjs/server directory. You'll need to manually remove them and update any code that references them to use direct imports instead.

**Examples:**

Example 1 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

const NewAccountController = () => import('#controllers/new_account_controller')
const SessionController = () => import('#controllers/session_controller')
const PostsController = () => import('#controllers/posts_controller')
const PostCommentsController = () => import('#controllers/post_comments_controller')

router.get('signup', [NewAccountController, 'create'])
router.post('signup', [NewAccountController, 'store'])
router.get('login', [SessionController, 'create'])
router.post('login', [SessionController, 'store'])
router.get('posts', [PostsController, 'index'])
router.get('posts/:id', [PostsController, 'show'])
router.get('posts/:id/comments', [PostCommentsController, 'index'])
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('signup', [controllers.NewAccount, 'create'])
router.post('signup', [controllers.NewAccount, 'store'])
router.get('login', [controllers.Session, 'create'])
router.post('login', [controllers.Session, 'store'])
router.get('posts', [controllers.Posts, 'index'])
router.get('posts/:id', [controllers.Posts, 'show'])
router.get('posts/:id/comments', [controllers.PostComments, 'index'])
```

Example 3 (javascript):
```javascript
export const controllers = {
  NewAccount: () => import('#controllers/new_account_controller'),
  Session: () => import('#controllers/session_controller'),
  Posts: () => import('#controllers/posts_controller'),
  PostComments: () => import('#controllers/post_comments_controller')
}
```

Example 4 (sql):
```sql
import { controllers } from '#generated/controllers'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'
```

---

## Atomic locks - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/locks

**Contents:**
- Atomic Locks
- Overview
- Installation
- Configuration
  - Redis store
  - Database store
  - Environment variables
- Creating locks
- Acquiring locks
  - Running code within a lock

This guide covers atomic locks in AdonisJS applications. You will learn how to:

Atomic locks prevent race conditions when multiple processes or parts of your codebase might perform concurrent actions on the same resource. Consider a payment processing scenario where a queue job could be enqueued twice due to a network retry. Without proper locking, the system might charge the user twice. Atomic locks ensure that only one process can execute the critical section at a time.

The @adonisjs/lock package is a wrapper over Verrou, a framework-agnostic locking library created and maintained by the AdonisJS core team. It supports three storage backends: Redis, database, and memory.

Install and configure the package using the following command.

Installs the @adonisjs/lock package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/lock.ts file.

Defines the LOCK_STORE environment variable and its validation inside the start/env.ts file.

Creates a database migration for the locks table (if using the database store).

The configuration is stored in the config/lock.ts file.

The redis store has a peer dependency on the @adonisjs/redis package. You must configure the Redis package before using the Redis store.

The connectionName is a reference to the connection defined within the config/redis.ts file. If not defined, the default Redis connection is used.

The database store has a peer dependency on the @adonisjs/lucid package. You must configure Lucid before using the database store.

The connectionName is a reference to a database connection defined within the config/database.ts file. If not defined, the default database connection is used.

The data is stored within the locks table. A migration for this table is automatically created during installation. However, if needed, you can manually create a migration with the following contents.

The default store is configured using the LOCK_STORE environment variable.

Create a lock using the createLock method from the lock manager service. The method accepts a unique key that identifies the resource being locked and a TTL (time-to-live) that defines how long the lock remains valid.

The lock key should uniquely identify the resource being protected. A common pattern is to use a descriptive prefix followed by an identifier, such as processing_payment:order:${orderId} or sending_email:user:${userId}.

The TTL accepts either a time expression string (like '10s', '5m', or '1h') or a number in milliseconds. The TTL acts as a safety mechanism. If a process crashes while holding a lock, the lock will automatically expire after the TTL, preventing deadlocks.

The package provides several methods for acquiring locks, each suited to different scenarios.

The run method is the recommended way to execute code within a lock. It acquires the lock, executes your callback, and automatically releases the lock when the callback completes (or throws an error).

By default, run waits indefinitely until the lock becomes available. You can configure this behavior using options.

The runImmediately method attempts to acquire the lock without waiting. If the lock is already held by another process, the callback does not execute.

For more control over the lock lifecycle, use the acquire and release methods directly. When using manual acquisition, you must ensure the lock is released, even if an error occurs.

The acquireImmediately method attempts to acquire the lock without waiting and returns true if successful.

Prefer the run method over manual acquisition when possible. It handles lock release automatically, including when exceptions occur, which prevents accidental lock leaks.

When acquiring a lock, you can configure retry behavior and timeouts.

Maximum time to wait before giving up on acquiring the lock. Accepts a time expression string or milliseconds.

Maximum number of retry attempts before throwing an error.

Delay between retry attempts. Accepts a time expression string or milliseconds.

You can combine these options for fine-grained control.

You can inspect the current state of a lock using the following methods.

For long-running operations that might exceed the initial TTL, you can extend the lock duration. This is useful when you cannot predict exactly how long an operation will take.

In distributed systems, you might need to acquire a lock in one process and release it in another. The serialize method converts a lock into a string that can be stored and restored elsewhere.

In another process, restore the lock using restoreLock.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/lock
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/lock/lock_provider')
  ]
}
```

Example 3 (typescript):
```typescript
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

Example 4 (css):
```css
{
  redis: stores.redis({
    connectionName: 'main',
  }),
}
```


## Health checks - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/health-checks

**Contents:**
- Health checks
- Overview
- Liveness vs readiness
- Configuring health checks
- Exposing endpoints
  - Understanding the readiness report
  - Protecting the readiness endpoint
- Available health checks
  - DiskSpaceCheck
  - MemoryHeapCheck

This guide covers health checks in AdonisJS applications. You will learn how to:

Health checks allow your application to report its operational status to external systems like load balancers, container orchestrators (Kubernetes, Docker Swarm), and monitoring services. These systems periodically probe your application to determine whether it should receive traffic or be restarted.

AdonisJS provides a health check system built into the core framework with several ready-made checks for common infrastructure concerns. You can also create custom checks for application-specific requirements like verifying external API connectivity or queue connections.

Before implementing health checks, it's important to understand the two types of probes and when each should be used.

A liveness probe answers the question: "Is the process alive and responsive?" This is a simple check that verifies your application can respond to HTTP requests. If a liveness probe fails repeatedly, the orchestrator will restart the container. Liveness probes should be lightweight and avoid checking external dependencies, since a database outage shouldn't cause your application to enter a restart loop.

A readiness probe answers the question: "Is the application ready to accept traffic?" This check verifies that your application and its dependencies (database connections, Redis, external services) are functioning correctly. If a readiness probe fails, the orchestrator removes the instance from the load balancer but does not restart it. This allows the application time to recover, for example, when a database connection is temporarily unavailable.

Run the following command to set up health checks in your application. This creates the configuration file and a controller with both liveness and readiness endpoints.

The command creates two files. The first is the health checks configuration where you register which checks to run.

The second is a controller that exposes both probe endpoints.

The liveness method simply returns a 200 status code, proving the process is alive and can handle HTTP requests. The readiness method runs all registered health checks and returns 200 when healthy or 503 (Service Unavailable) when any check fails.

Register the health check routes in your routes file. Using separate paths for each probe allows orchestrators to configure them independently.

With these routes in place, your monitoring system can probe /health/live for liveness and /health/ready for readiness checks.

The readiness endpoint returns a detailed JSON report containing the results of all registered checks.

The report contains the following properties:

Boolean indicating whether all checks passed. Set to false if one or more checks fail.

Overall status: ok (all passed), warning (warnings present), or error (failures present).

Timestamp when the checks completed.

Process information including PID, platform, uptime in seconds, and Node.js version.

Array containing the detailed result of each registered check.

Each check in the checks array includes its name, status, message, whether the result was cached, and any metadata specific to that check type.

The readiness report contains detailed information about your infrastructure that you may not want exposed publicly. You can protect the endpoint using a secret header that your monitoring system includes with each request.

Kubernetes and most monitoring tools support custom HTTP headers on probe requests, so you can configure them to include your secret.

In Kubernetes, configure the probe to include the header.

AdonisJS provides several built-in health checks that you can register in your start/health.ts file.

Monitors available disk space and reports warnings or errors when usage exceeds configured thresholds.

The default warning threshold is 75% and the failure threshold is 80%. You can customize these values.

Monitors the heap size reported by process.memoryUsage() and alerts when memory consumption exceeds thresholds.

The default warning threshold is 250MB and the failure threshold is 300MB. You can customize these values using human-readable strings.

Monitors the Resident Set Size (total memory allocated for the process) reported by process.memoryUsage().

The default warning threshold is 320MB and the failure threshold is 350MB.

Provided by the @adonisjs/lucid package, this check verifies connectivity to your SQL database.

A successful check returns a report like this.

To monitor multiple database connections, register the check once for each connection.

Monitors active database connections and alerts when the count exceeds thresholds. This check is supported for PostgreSQL and MySQL databases only.

The default warning threshold is 10 connections and the failure threshold is 15 connections.

Provided by the @adonisjs/redis package, this check verifies connectivity to your Redis server, including cluster configurations.

To monitor multiple Redis connections, register the check once for each connection.

Monitors memory consumption on the Redis server and alerts when usage exceeds thresholds.

The default warning threshold is 100MB and the failure threshold is 120MB.

Health checks run every time the readiness endpoint is called. For checks that don't need to run on every request (like disk space, which changes slowly), you can cache results for a specified duration.

In this example, the disk space check runs at most once per hour, returning the cached result for subsequent requests. Memory checks run on every request since memory usage can change rapidly.

When a result is served from cache, the isCached property in the check's report will be true.

You can create custom health checks to verify application-specific requirements like external API connectivity, message queue connections, or business-critical service availability.

A custom health check is a class that extends BaseCheck and implements the run method. You can place custom checks anywhere in your project, though app/health_checks/ is a sensible location.

The Result class provides three factory methods for creating health check results:

Use the mergeMetaData method to include additional information in the check's report, such as latency measurements, connection counts, or version numbers.

Import your custom check in start/health.ts and register it with the others.

Your custom check will now run alongside the built-in checks whenever the readiness endpoint is called.

**Examples:**

Example 1 (unknown):
```unknown
node ace configure health_checks
```

Example 2 (javascript):
```javascript
import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck } from '@adonisjs/core/health'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck(),
  new MemoryHeapCheck(),
])
```

Example 3 (javascript):
```javascript
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

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/health/live', [controllers.HealthChecks, 'live'])
router.get('/health/ready', [controllers.HealthChecks, 'ready'])
```

---

## Custom auth guard - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/custom-auth-guard

**Contents:**
- Creating a custom auth guard
- Overview
- Project structure
- Defining the user provider interface
- Implementing the guard
  - Accepting dependencies
  - Generating tokens
  - Authenticating requests
  - Implementing helper methods
  - Supporting test authentication

This guide covers building custom authentication guards in AdonisJS. You will learn:

AdonisJS ships with session, access token, and basic auth guards that cover most authentication needs. However, you might need a custom guard for specific requirements like JWT authentication, API keys, or integration with external identity providers.

A custom guard consists of two parts: a user provider interface that defines how to find users, and a guard implementation that handles the authentication logic. This separation allows the same guard to work with different data sources (Lucid models, Prisma, external APIs) by swapping the user provider.

This guide walks through building a JWT authentication guard as a practical example. The concepts apply to any custom authentication mechanism.

This is advanced content. Before building a custom guard, verify that the session guard, access tokens guard, or basic auth guard don't meet your needs.

All the code in this guide goes into a single file that you can expand later. Create the file at app/auth/guards/jwt.ts:

Guards should not hardcode how users are fetched from the database. Instead, they define a user provider interface that describes the methods needed for authentication. This lets developers supply their own implementation based on their data layer.

For a JWT guard, the provider needs to find users by their ID (extracted from the token payload). Start by defining the interface:

The JwtGuardUser type acts as a bridge between your actual user object (a Lucid model, Prisma object, or plain object) and the guard. The guard uses getId() to get the user's identifier for the token payload and getOriginal() to return the user object after authentication.

The RealUser generic parameter allows the interface to work with any user type. A Lucid-based provider would return a model instance, while a Prisma-based provider would return a Prisma user object.

The guard must implement the GuardContract interface from @adonisjs/auth. This interface defines the methods and properties that integrate the guard with AdonisJS authentication.

Start with the class structure and required properties:

The guard needs a user provider to find users and HTTP context to read request headers. It also needs configuration options like the JWT secret. Add these as constructor parameters:

Install the jsonwebtoken package to handle JWT creation and verification:

Implement the generate method to create a signed JWT containing the user's ID:

The method uses the user provider to get the user's ID, then signs a JWT with that ID in the payload.

The authenticate method reads the JWT from the request, verifies it, and fetches the corresponding user:

The check method is a non-throwing version of authenticate:

The getUserOrFail method returns the authenticated user or throws:

The authenticateAsClient method is used by Japa's loginAs helper during testing. It returns headers that the test client should include:

Here's the complete guard implementation:

Register your custom guard in config/auth.ts. The JwtUserProviderContract interface is compatible with the session guard's user provider, so you can reuse it:

The guard factory receives the HTTP context and returns a new guard instance for each request.

With the guard registered, use it like any built-in guard:

This implementation provides a foundation for JWT authentication. Consider extending it with:

**Examples:**

Example 1 (unknown):
```unknown
mkdir -p app/auth/guards
touch app/auth/guards/jwt.ts
```

Example 2 (typescript):
```typescript
import { symbols } from '@adonisjs/auth'

/**
 * Bridge between the user provider and the guard.
 * Wraps the actual user object with methods the guard needs.
 */
export type JwtGuardUser<RealUser> = {
  getId(): string | number | BigInt
  getOriginal(): RealUser
}

/**
 * Interface that user providers must implement
 * to work with the JWT guard.
 */
export interface JwtUserProviderContract<RealUser> {
  /**
   * Property for TypeScript to infer the actual user type.
   * Not used at runtime.
   */
  [symbols.PROVIDER_REAL_USER]: RealUser

  /**
   * Create a guard user instance from the actual user object.
   */
  createUserForGuard(user: RealUser): Promise<JwtGuardUser<RealUser>>

  /**
   * Find a user by their ID.
   */
  findById(identifier: string | number | BigInt): Promise<JwtGuardUser<RealUser> | null>
}
```

Example 3 (typescript):
```typescript
import { symbols } from '@adonisjs/auth'
import type { GuardContract } from '@adonisjs/auth/types'

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  /**
   * Events emitted by this guard. JWT guard doesn't emit events,
   * but the property is required by the interface.
   */
  declare [symbols.GUARD_KNOWN_EVENTS]: {}

  /**
   * Unique identifier for this guard type.
   */
  driverName: 'jwt' = 'jwt'

  /**
   * Whether authentication has been attempted during this request.
   */
  authenticationAttempted: boolean = false

  /**
   * Whether the current request is authenticated.
   */
  isAuthenticated: boolean = false

  /**
   * The authenticated user, if any.
   */
  user?: UserProvider[typeof symbols.PROVIDER_REAL_USER]

  async generate(user: UserProvider[typeof symbols.PROVIDER_REAL_USER]) {
    // TODO: implement
  }

  async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {
    // TODO: implement
  }

  async check(): Promise<boolean> {
    // TODO: implement
  }

  getUserOrFail(): UserProvider[typeof symbols.PROVIDER_REAL_USER] {
    // TODO: implement
  }

  async authenticateAsClient(
    user: UserProvider[typeof symbols.PROVIDER_REAL_USER]
  ): Promise<AuthClientResponse> {
    // TODO: implement
  }
}
```

Example 4 (typescript):
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export type JwtGuardOptions = {
  secret: string
}

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  #ctx: HttpContext
  #userProvider: UserProvider
  #options: JwtGuardOptions

  constructor(
    ctx: HttpContext,
    userProvider: UserProvider,
    options: JwtGuardOptions
  ) {
    this.#ctx = ctx
    this.#userProvider = userProvider
    this.#options = options
  }

  // ... rest of the class
}
```

---

## Authorization - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/authorization

**Contents:**
- Authorization
- Overview
- Installation
- Defining abilities
- Using abilities in controllers
- Authorization methods
  - Using allows and denies
  - Using authorize
  - Using execute
- Custom authorization responses

This guide covers authorization in AdonisJS using Bouncer. You will learn how to:

Authorization determines what authenticated users are allowed to do in your application. While authentication answers "who are you?", authorization answers "what can you do?". Bouncer provides a structured way to define and check permissions throughout your AdonisJS application.

Instead of scattering authorization checks throughout your codebase, Bouncer encourages you to extract them into dedicated locations. This keeps your authorization logic centralized, reusable, and testable.

Install and configure Bouncer using the following command.

An ability is a function that checks whether a user is authorized to perform a specific action. Abilities are lightweight and work well when you have a small number of simple authorization checks.

Abilities are defined in the app/abilities/main.ts file using the Bouncer.ability() method. Each ability receives the user as the first parameter, followed by any resources needed to make the authorization decision, then returns a boolean value indicating whether the action is allowed.

The editPost ability checks if a user owns a specific post by comparing user IDs. The sendEmail ability verifies if a user has an admin role. Notice that sendEmail only needs the user parameter since it doesn't check permissions against a specific resource.

You can check abilities in your controllers using the ctx.bouncer object. Import the ability you want to check and pass it to one of the bouncer methods.

Notice that you only pass the post parameter to bouncer.denies(), not the user. The bouncer is already tied to the currently logged-in user and automatically provides it as the first argument to your ability.

Bouncer provides four methods for checking authorization, each suited to different use cases.

The allows method checks if the user is authorized and returns true if they are. The denies method is the opposite, returning true if the user is not authorized.

The authorize method throws an AuthorizationException when authorization fails. This exception is automatically converted to an appropriate HTTP response based on content negotiation.

The execute method returns an AuthorizationResponse object that contains detailed information about the authorization check. This is useful for advanced scenarios where you need to inspect the authorization result beyond a simple boolean.

The AuthorizationResponse object has three properties: authorized (boolean), message (string or undefined), and status (number or undefined). You can use these to create custom error responses with specific status codes and messages.

By default, abilities return boolean values. However, you can return an AuthorizationResponse object to specify custom error messages and status codes.

In this example, when authorization fails, the error message will be "Post not found" with a 404 status code instead of the default 403 Forbidden. This is useful when you want to hide the existence of a resource from unauthorized users.

A policy is a class that groups multiple authorization checks for a specific resource. Policies are recommended when you need structured authorization around specific resources or when you have many authorization checks throughout your application. For example, you might create one policy for your Post model and another for your Comment model.

Policies extend the BasePolicy class and are stored in the app/policies directory. They benefit from dependency injection through the IoC container, making it easy to inject services and other dependencies.

Generate a new policy using the make:policy command.

This creates an empty policy class in the app/policies directory.

Add methods to your policy for each authorization action. Each method receives the user as the first parameter, optionally followed by the resource, and returns an AuthorizerResponse (a boolean or AuthorizationResponse object).

Even when multiple actions have identical logic (like edit and delete in this example), create separate methods for each action. This makes it easier to evolve the logic independently later as your requirements change.

You can use policies in controllers by calling bouncer.with() to select the policy, then using the same authorization methods you use with abilities.

The bouncer.with() method accepts the policy class and returns an object with the same allows, denies, authorize, and execute methods. TypeScript will provide autocomplete for the available actions from your policy.

Instead of importing the policy class, you can reference it by name as a string. This works because Bouncer maintains a barrel file of all policies at .adonisjs/server/policies.ts.

The barrel file is automatically generated when you start your development server and stays up-to-date as you add or remove policies. This file exports an object where each key is the policy name and the value is the lazy import of that policy module.

Policies support before and after hooks that run around authorization checks. These hooks provide powerful ways to create reusable authorization logic.

The before hook runs before the actual authorization method is called. This is useful for implementing logic that applies to all actions in a policy, such as granting full access to administrators.

The before hook receives the user, the action name being checked, and any additional parameters passed to the action method. The return value controls how authorization proceeds.

In this example, any user with the role = 'admin' property will bypass all authorization checks. Regular users will proceed through the normal edit and delete methods.

The after hook runs after the action method completes. This allows you to inspect or override the authorization response.

The after hook receives the user, action name, the authorization response from the action method, and any additional parameters. The return value determines the final result.

The after hook is useful for applying organization-wide policies that override resource-specific checks. For example, you might allow administrators or support staff to access all resources regardless of individual authorization rules.

By default, authorization checks automatically return false when there is no authenticated user. This means guests are denied access unless you explicitly allow them.

To allow guest users in an ability, pass the allowGuest option as the first argument to Bouncer.ability(). The user parameter will be typed as User | null.

Use the @allowGuest decorator on policy methods that should accept guest users.

The @allowGuest decorator expects the type of the user parameter to be User | null, and the authorization check will execute even when no user is authenticated.

You can use authorization checks in Edge templates to conditionally show or hide UI elements. Edge provides @can and @cannot tags that work with both abilities and policies.

Reference abilities by their exported name as a string. Edge will resolve and import them automatically.

Reference policy actions using the format PolicyName.methodName.

During HTTP requests, the InitializeBouncerMiddleware automatically creates a Bouncer instance for the currently logged-in user by fetching it from ctx.auth.user. This instance is available via ctx.bouncer and is also shared with Edge templates.

You can create a custom Bouncer instance for a different user, such as when sending notifications or performing background jobs.

TypeScript will provide intelligent autocomplete based on the user type, suggesting only policies and abilities that accept the same user type.

Policy classes are instantiated using the IoC container, which means you can inject dependencies into the constructor.

The @inject() decorator tells the IoC container to resolve the dependencies automatically.

Abilities and policies are defined server-side and require access to server resources like models, databases, and services. This means you cannot share them directly with frontend code in API or Inertia applications.

However, you can compute the authorization results on the server and include them in your API responses. Your frontend application only needs to know which actions a user can perform to show or hide UI elements appropriately.

For row-level permissions where you need to check authorization for individual records, compute the permissions within transformers.

For application-level permissions that don't vary by record, compute them once as shared data inside the Inertia middleware.

You can test your authorization logic using either unit tests for individual policies and abilities, or functional tests that verify authorization end-to-end through HTTP requests.

Test policy classes directly by instantiating them and calling their methods with the required arguments.

Test authorization end-to-end by making HTTP requests and verifying that unauthorized users receive appropriate error responses.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/bouncer
```

Example 2 (javascript):
```javascript
import User from '#models/user'
import Post from '#models/post'
import { Bouncer } from '@adonisjs/bouncer'

export const editPost = Bouncer.ability((user: User, post: Post) => {
  return user.id === post.userId
})

export const sendEmail = Bouncer.ability((user: User) => {
  return user.role === 'admin'
})
```

Example 3 (javascript):
```javascript
import Post from '#models/post'
import router from '@adonisjs/core/services/router'
import type { HttpContext } from '@adonisjs/core/http'
import { editPost } from '#abilities/main'

export default class PostsController {
  async update({ bouncer, params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    if (await bouncer.denies(editPost, post)) {
      return response.forbidden('You cannot edit this post')
    }

    // Continue with update logic
    return 'Post updated successfully'
  }
}
```

Example 4 (javascript):
```javascript
import Post from '#models/post'
import { editPost } from '#abilities/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async update({ bouncer, params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    if (await bouncer.allows(editPost, post)) {
      return 'You can edit this post'
    }

    return response.forbidden('You cannot edit this post')
  }
}
```

---

## SQL ORM - AdonisJS

**URL:** https://docs.adonisjs.com/guides/database/lucid

**Contents:**
- Lucid - SQL ORM
- Overview
- Configuration
- Using the query builder directly
- Working with models
  - Creating your first migration
  - Auto-generated schema classes
  - Creating a model
  - Basic CRUD operations
  - Accessing the query builder from models

This guide covers Lucid ORM, the official database ORM for AdonisJS. You will learn how to:

Lucid ORM is an Active Record ORM built on top of Knex and deeply integrated within the AdonisJS ecosystem. Unlike standalone ORMs that require extensive configuration, Lucid works seamlessly with AdonisJS features like the validator, authentication layer, caching, rate-limiting, and queues without any additional setup.

Lucid simplifies database interactions by encapsulating common operations using language-specific objects and classes. It's built on top of Knex, which means you can express complex SQL queries using a JavaScript API when needed. Lucid supports multiple databases including MySQL, PostgreSQL, Turso, SQLite, and MSSQL. The class-based model system makes your code intuitive and type-safe, while built-in support for relationships lets you model complex data structures. The migration system provides version control for your database schema, and seeders and factories help you populate databases with test data.

This guide provides a high-level overview of Lucid's features to help you understand what's available and how the pieces fit together. For detailed API references, advanced patterns, and comprehensive documentation on specific features, refer to the official Lucid documentation.

Lucid's configuration lives in the config/database.ts file at the root of your AdonisJS project. This file defines your database connections, migration paths, and other ORM settings.

The configuration specifies which database connection to use by default (typically set via environment variables), and defines the connection details for each database. Each connection includes the client library (like pg for PostgreSQL or mysql2 for MySQL), connection credentials, and paths to migration files.

You can explore all available configuration options, connection pooling settings, and advanced features like read-write replicas in the Lucid configuration documentation.

Before diving into models, you can use Lucid's query builder directly for database operations. The query builder provides a fluent JavaScript API for constructing SQL queries, which is particularly useful for complex queries or when you don't need the full Active Record pattern.

The query builder is available through the db service and works identically to Knex, since Lucid is built on top of it.

The query builder handles parameterized queries automatically, protecting against SQL injection. You can use it for selects, inserts, updates, deletes, joins, aggregations, and any other SQL operation. When you need raw SQL for complex operations, you can use db.rawQuery().

For the complete query builder API including joins, subqueries, aggregations, and advanced where clauses, see the Lucid query builder documentation.

Models provide an object-oriented way to interact with database tables. Each model class represents a table, and each model instance represents a row. Lucid uses a migrations-first approach where you define your schema in migrations, and Lucid automatically generates TypeScript schema classes that your models extend.

Migrations are the foundation of Lucid's schema management. They provide version control for your database schema, allowing you to evolve your schema incrementally over time. Each migration is a TypeScript file with up and down methods that define how to move the schema forward and how to roll it back.

Create a migration for a posts table:

This generates a timestamped migration file in database/migrations/. The timestamp ensures migrations run in the correct order.

Run the migration to create the table:

Lucid executes the migration, creates the posts table in your database, and automatically generates a schema class at database/schema.ts that contains type-safe column definitions.

Migrations run inside transactions by default. If a migration fails, all changes are rolled back automatically, keeping your database in a consistent state.

For more migration operations like altering tables, adding indexes, and working with foreign keys, see the Lucid migrations documentation.

After running migrations, Lucid scans your database and generates TypeScript schema classes that contain all column definitions with proper types. This migrations-first approach keeps your models clean and ensures your TypeScript types always match your actual database schema.

The generated schema class lives at database/schema.ts.

Lucid automatically converts database types to appropriate TypeScript types, snake_case column names to camelCase properties, and timestamp columns to Luxon DateTime objects. The autoCreate option means Lucid sets the timestamp when creating a record, and autoUpdate means it updates the timestamp on every save.

Now create a model that extends the generated schema class:

The model inherits all column definitions from the schema class. You'll add relationships, hooks, and custom methods here, while the schema class handles column definitions.

Never modify the generated schema classes in database/schema.ts directly. These files are regenerated after every migration. Instead, override columns or add custom logic in your model classes, which extend the schema classes and persist your changes.

If you need to change column types or add columns, create a new migration. The schema classes will automatically update after running the migration.

To learn more about customizing type mappings and schema generation rules, see the Lucid schema classes documentation.

With your model ready, you can perform create, read, update, and delete operations using an intuitive API.

For idempotent operations like firstOrCreate, updateOrCreate, and bulk operations like createMany, see the Lucid CRUD operations documentation.

While basic CRUD methods handle common scenarios, you'll often need more complex queries. Every model provides access to the query builder through the query() method, giving you full SQL flexibility while still working with model instances.

The query builder methods return model instances instead of plain objects, which means you get all model functionality like relationships, serialization, and hooks. You can chain any Knex query builder method, including joins, subqueries, grouping, and aggregations.

For the complete query builder API, see the Lucid query builder documentation.

Understanding what SQL queries your application generates helps with debugging and optimization. Lucid provides built-in query debugging that pretty-prints SQL statements to your console during development.

Pretty printing is enabled by default in development mode. You'll see formatted SQL queries in your terminal:

The feature is configured in your database config:

You can also enable debugging on a per-query basis:

For more control over query debugging and logging, including listening to query events, see the Lucid debugging documentation.

Pagination prevents performance issues when working with large datasets by loading records in manageable chunks. Lucid provides offset-based pagination that integrates seamlessly with both the query builder and models.

The paginator provides metadata about the current page:

You can use this metadata to build pagination UI in your templates:

Always include an orderBy clause when paginating. Without explicit ordering, database engines may return records in random order, causing items to appear on multiple pages or be skipped entirely as users navigate.

For cursor-based pagination and customizing the JSON response format, see the Lucid pagination documentation.

Database transactions ensure data integrity by grouping multiple operations into an atomic unit. If any operation fails, the entire transaction rolls back, preventing partial updates that could leave your database in an inconsistent state.

Lucid provides managed transactions that automatically commit on success and rollback on exceptions:

For manual transaction control, isolation levels, and savepoints, see the Lucid transactions documentation.

Hooks allow you to execute code at specific points in a model's lifecycle. You can use hooks to hash passwords before saving, validate data, update related records, or perform any logic that should happen automatically during model operations.

Lucid provides hooks for different lifecycle events. Before hooks (@beforeSave, @beforeCreate, @beforeUpdate, @beforeDelete) run before database operations and can modify data or cancel operations. After hooks (@afterSave, @afterCreate, @afterUpdate, @afterDelete) run after database operations and are useful for side effects like sending notifications. Query hooks (@beforeFind, @afterFind, @beforeFetch, @afterFetch) run during fetch operations and can automatically filter results.

Direct query builder updates bypass hooks entirely. When you use await Post.query().where('id', 1).update({ title: 'New' }), no hooks execute and timestamps don't update automatically.

This behavior exists for performance reasons when updating many records. If you need hooks to run, fetch the model instance first, modify it, and call save().

For complete hook lifecycle information and advanced patterns, see the Lucid hooks documentation.

Relationships define how your models connect to each other, making it easy to work with related data. Lucid supports one-to-one, one-to-many, and many-to-many relationships with both lazy loading and eager loading.

A user has many posts:

A post belongs to a user:

Eager loading fetches relationships upfront, avoiding the N+1 query problem where you execute one query per related record:

You can preload multiple relationships and nest them:

For many-to-many relationships like users belonging to multiple teams:

Attach and detach related records:

For has-one relationships, relationship queries, and advanced patterns like polymorphic relationships, see the Lucid relationships documentation.

When returning models from HTTP endpoints, you need to convert them to plain JavaScript objects. Lucid provides powerful serialization that controls which fields appear in the output, transforms data, and handles relationships.

Control serialization at the model level using column options:

For custom serialization logic, computed properties, and working with transformers, see the Lucid serialization documentation and AdonisJS transformers documentation.

Factories generate fake data for testing and database seeding. Instead of manually creating test records, you define a factory once and generate realistic data on demand.

Create a factory for your model:

Use factories in tests or seeders:

Factories support states for common variations:

For relationship factories, stubbing database calls in tests, and advanced factory patterns, see the Lucid factories documentation.

This guide covered the essential features of Lucid ORM to help you understand how the pieces fit together. You've learned how to configure database connections, create migrations, define models with auto-generated schemas, perform CRUD operations, work with relationships, and generate test data with factories.

For deeper knowledge on any topic, refer to the comprehensive Lucid documentation, which covers advanced query builder methods, relationship customization, query scopes, soft deletes, custom naming strategies, and much more.

You might also want to explore:

**Examples:**

Example 1 (javascript):
```javascript
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

Example 2 (sql):
```sql
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

Example 3 (unknown):
```unknown
node ace make:migration posts
```

Example 4 (elixir):
```elixir
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

---

## Response - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/response

**Contents:**
- Response
- Overview
- Sending response body
  - Returning values from route handlers
  - Using response.send()
  - Forcing JSON responses
- Working with headers
  - Setting headers
  - Setting headers safely
  - Appending to headers

This guide covers the AdonisJS Response class and the methods available to construct HTTP responses. You will learn about:

The Response class provides helpers for constructing HTTP responses in AdonisJS applications. Instead of working directly with Node.js's raw response object, the Response class offers a fluent, expressive API for common tasks like sending JSON, setting headers, handling redirects, and streaming file downloads.

The Response class is available via the ctx.response property. You can access it in route handlers, middleware, and exception handlers throughout your application. For many simple responses, you can return values directly from route handlers, and AdonisJS will automatically use the Response class to send them.

The Response class provides multiple ways to send response bodies. You can either return values directly from route handlers or use explicit response methods.

The simplest approach is to return values directly from your route handler. AdonisJS will automatically serialize the value and set appropriate content headers.

You can also explicitly use the response.send() method, which provides the same automatic content-type detection.

When you need to ensure the response is sent as JSON (even if it might be detected as HTML), use the response.json() method.

See also: Response body serialization

The Response class provides methods for setting, appending, and removing HTTP headers. Headers must be set before the response body is sent.

Use the response.header() method to set a response header. If the header already exists, it will be overridden.

The response.safeHeader() method sets a header only if it doesn't already exist. This is useful when you want to provide a default value without overriding existing headers.

Some headers can have multiple values. Use response.append() to add additional values without removing existing ones.

Remove a previously set header using response.removeHeader().

The response.redirect() method returns an instance of the Redirect class, which provides a fluent API for creating redirect responses with different destinations and options.

Use response.redirect().toPath() to redirect to a specific URI or external URL.

The response.redirect().toRoute() method accepts a route identifier and its parameters, making redirects maintainable when URLs change.

Use response.redirect().back() to redirect to the previous page. This uses the referrer header and falls back to / if the referrer is not available.

By default, redirects use a 302 status code. Use the status() method to set a different redirect status.

Use the withQs() method to forward the current URL's query string to the redirect destination.

Pass an object to withQs() to set custom query parameters. Chain the method multiple times to append additional parameters.

The Response class provides methods for streaming data and serving file downloads. These methods handle proper headers, caching, and cleanup automatically.

Use response.stream() to send a readable stream as the response. AdonisJS waits for the route handler and upstream middleware to finish before beginning to read from the stream.

The response.download() method streams a file and sets appropriate headers for downloads. It accepts an absolute path to the file.

Use response.attachment() to force a download and specify a custom filename. The browser will prompt the user to save the file with the given name.

The Response class provides methods for setting HTTP status codes. Status codes communicate the result of the request to the client.

Use response.status() to set the HTTP status code. This method overrides any previously set status code.

The response.safeStatus() method sets a status code only if one hasn't been set already. This is useful in middleware where you want to provide a default without overriding explicit status codes.

AdonisJS provides shorthand methods that set both the status code and response body in one call.

AdonisJS provides shorthand methods for common HTTP status codes. Each method sets the status code and optionally sends a response body.

The Response class provides methods for setting cookies with different security levels. AdonisJS supports signed cookies, encrypted cookies, and plain cookies.

The response.cookie() method creates a signed cookie. Signed cookies cannot be tamprered but their content is visible to the client.

Use response.encryptedCookie() to encrypt cookie values. The app.appKey encrypts the value, making it unreadable to clients. If the app key changes, the cookie cannot be decrypted.

The response.plainCookie() method creates a base64-encoded cookie without signing or encryption.

Cookie values can be any of the following data types: string, number, bigInt, boolean, null, object, and array.

All cookie methods accept an options object to control cookie behavior. These options match the configuration in config/app.ts under the http.cookie block.

Cookie domain. Empty string means current domain.

Cookie path. Default is /.

Cookie expiry time. Can be a duration string like '2h' or milliseconds.

Prevent JavaScript access to the cookie.

Only send cookie over HTTPS connections.

CSRF protection. Default is 'lax'.

Experimental: Enable cookie partitioning (CHIPS).

Experimental: Cookie priority hint for browsers.

The response.onFinish() method allows you to register callbacks that execute after the response has been sent to the client. This is useful for cleanup tasks, logging, or operations that shouldn't block the response.

A common use case is deleting temporary files after they've been streamed to the client.

You can use onFinish() to log analytics or metrics without delaying the response.

The Response class automatically serializes response bodies and sets appropriate content-type headers based on the data type you send.

When you send a response, AdonisJS performs two operations: it serializes the value into a string format suitable for HTTP transmission, and it sets the appropriate content-type and content-length headers.

This automatic handling means you rarely need to manually set content-type headers.

You can add custom methods and properties to the Response class using macros and getters. This allows you to create reusable response helpers that match your application's needs.

Read the Extending AdonisJS guide if you are new to the concept of macros and getters.

Use Response.macro() to add methods to all Response instances throughout your application.

After adding custom methods, you must inform TypeScript about them by augmenting the Response interface. Otherwise, you will get type errors when trying to use the custom methods.

Once defined, your custom methods are available on all Response instances.

**Examples:**

Example 1 (python):
```python
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  /**
   * Returns plain text with content-type: text/plain
   */
  return 'This is the homepage.'
})

router.get('/welcome', async () => {
  /**
   * Returns HTML fragment with content-type: text/html
   */
  return '<p>This is the homepage</p>'
})

router.get('/api/page', async () => {
  /**
   * Returns JSON with content-type: application/json
   */
  return { page: 'home' }
})

router.get('/timestamp', async () => {
  /**
   * Date instances are converted to ISO strings
   */
  return new Date()
})
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'

router.get('/', async ({ response }) => {
  /**
   * send() method works identically to returning values.
   * Useful when you need to set headers or status before sending.
   */
  response.send('This is the homepage')
})

router.get('/data', async ({ response }) => {
  /**
   * Objects and arrays are automatically stringified
   */
  response.send({ page: 'home' })
})
```

Example 3 (javascript):
```javascript
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ response }: HttpContext) {
    const posts = await Post.all()
    
    /**
     * Explicitly sets content-type to application/json
     * and serializes the posts array
     */
    response.json(posts)
  }
}
```

Example 4 (sass):
```sass
import type { HttpContext } from '@adonisjs/core/http'

export default class ApiController {
  async index({ response }: HttpContext) {
    /**
     * Set custom header for API versioning
     */
    response.header('X-API-Version', 'v1')
    
    /**
     * Set cache control headers
     */
    response.header('Cache-Control', 'public, max-age=3600')
    
    return { status: 'ok' }
  }
}
```

---

## Browser tests - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/browser-tests

**Contents:**
- Browser tests
- Overview
- Setup
- CLI options
  - Recording traces
  - Running specific tests
- Basic page visits
- Database state
- Form interactions
  - Recording mode

This guide covers end-to-end browser testing for hypermedia and Inertia applications. You will learn how to:

Browser tests verify your application from the outside-in, navigating it exactly as a real user would. Unlike unit tests that examine isolated pieces of code, browser tests exercise the entire stack: routes, controllers, views, database queries, and client-side interactions all working together.

For hypermedia and Inertia applications, browser tests should form the majority of your test suite. These applications are inherently about user interactions with rendered pages, and browser tests capture this reality directly. When a browser test passes, you have high confidence that the feature actually works for users. When it fails, you've caught a bug that users would have encountered.

This approach may feel different if you're accustomed to the "testing pyramid" where unit tests dominate. For server-rendered applications, inverting this pyramid makes sense: browser tests provide more value per test because they verify complete user flows rather than implementation details.

Browser testing requires three plugins configured in your tests/bootstrap.ts file. These are already installed and configured with the official Hypermedia and Inertia starter kits.

Playwright behavior is controlled through command-line flags when running tests. The following options help with debugging and cross-browser verification.

Run tests in a specific browser. Supported values are chromium, firefox, and webkit.

Show the browser window during test execution. By default, tests run in headless mode.

Open browser devtools automatically when the browser launches.

Slow down test actions by the specified number of milliseconds. Useful for visually following what the test is doing.

Record traces for debugging. Use onError to record only when tests fail, or onTest to record every test.

Traces capture a complete timeline of your test execution, including screenshots, network requests, and DOM snapshots. Generate traces only when tests fail or for every test.

Traces are stored in the browsers directory. Replay them using Playwright's trace viewer.

Run all browser tests or target specific files and folders.

A browser test visits a page and makes assertions about its content. The visit helper opens a URL, and the returned page object provides assertion methods.

This test fails because no posts exist in the database. The failure message indicates the assertion timed out waiting for the expected content.

Tests should start with a known database state. Use the testUtils.db().truncate() hook to clear tables after each test, then create the specific records your test needs.

See also: Database testing utilities for additional methods like migrations and seeders.

Forms are filled using Playwright's locator methods. Select inputs by their label text and use fill to enter values, then click to submit.

Writing locators manually requires switching between your browser and test file repeatedly. Recording mode launches a browser where your interactions are converted to test code automatically.

Create a new test file and call the record method instead of visit. When you run the test, a browser opens where you can interact with your application. Close the browser when finished, and copy the generated code into your test file.

After recording, replace the record call with visit and paste the generated locators and actions.

Protected pages require an authenticated user. The browserContext.loginAs method authenticates a user for all subsequent page visits within that test.

For authentication to work during tests, set SESSION_DRIVER=memory in your .env.test file. The memory driver allows the test process to manage sessions without file or database overhead.

The browser context provides methods to read and write cookies, sessions, and flash messages during tests. These are useful when your application behavior depends on stored state.

Three methods are available depending on how the cookie should be stored.

Retrieve cookie values after page interactions to verify your application sets them correctly.

Pre-populate session data before visiting a page. This is useful when testing features that depend on session state without going through the UI to establish that state.

Flash messages are session data that persist only for the next request. Set them to test how your UI displays notifications or validation errors.

Verify that your application writes the expected data to the session.

**Examples:**

Example 1 (javascript):
```javascript
import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),

  /**
   * Configures Playwright and creates a fresh browser
   * context before every test.
   */
  browserClient({ runInSuites: ['browser'] }),

  /**
   * Allows reading and writing session data
   * via the browser context.
   */
  sessionBrowserClient(app),

  /**
   * Enables the loginAs method for authenticating
   * users during tests.
   */
  authBrowserClient(app),
]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
```

Example 2 (sass):
```sass
node ace test --browser=firefox
```

Example 3 (unknown):
```unknown
node ace test --headed
```

Example 4 (unknown):
```unknown
node ace test --devtools
```

---

## Application lifecycle - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/application-lifecycle

**Contents:**
- Application Lifecycle
- Overview
- Boot phase
- Start phase
- Termination phase
- Hooking into lifecycle phases
  - Hooking into the boot phase
  - Hooking into the start phase
    - Using service provider methods
    - Using preload files

This guide covers the application lifecycle in AdonisJS. You will learn:

The application lifecycle in AdonisJS consists of three distinct phases: boot, start, and termination. Each phase serves a specific purpose in preparing your application, running it, and gracefully shutting it down.

Understanding the lifecycle is essential when you need to execute code at specific points during your application's runtime. For example, you might want to register custom validation rules before your application starts handling requests, or perform cleanup operations before your application terminates.

The lifecycle flows chronologically from boot to start, and eventually to termination when the process receives a shutdown signal. Each phase has clearly defined responsibilities and happens in a predictable order, allowing you to hook into the exact moment you need.

The boot phase is the initial stage where AdonisJS prepares your application for execution. During this phase, you can use the IoC container to fetch bindings and extend parts of the framework.

Service providers register their bindings into the container and execute their boot methods. The framework itself is being configured, but your application isn't yet ready to handle requests or execute commands.

The boot phase completes before any preload files are imported or application-specific code runs. Think of it as the foundation-laying phase where the framework assembles all the pieces it needs.

The start phase is where your application comes to life. During this phase, AdonisJS imports preload files and executes the start and ready methods from service providers.

Application-specific initialization happens here. Routes are registered, event listeners are attached, and setup code runs. By the end of this phase, your application is fully operational and ready to handle HTTP requests, execute Ace commands, or run tests depending on the environment.

The start phase is environment-aware, meaning you can configure different behavior for the HTTP server, Ace commands, or test environments. All preload files configured for the current environment are imported in parallel for optimal performance.

The termination phase happens when AdonisJS begins graceful shutdown. This usually occurs when the process receives the SIGTERM signal, such as when you stop your development server or during a deployment.

During this phase, service providers execute their shutdown methods, allowing them to perform cleanup operations like closing database connections, flushing logs, or canceling pending background jobs.

Graceful shutdown ensures your application stops cleanly rather than abruptly terminating mid-operation, helping prevent data corruption.

You can hook into different phases of the application lifecycle using service providers and preload files. Service providers offer lifecycle methods (boot, start, ready, and shutdown) that execute at specific points, while preload files run during the start phase.

Use the boot method in a service provider to execute code during the boot phase. This is where you should extend the framework or configure services that other parts of your application depend on.

The following example extends VineJS with a custom phoneNumber validation rule. This rule will be available throughout your application.

You can hook into the start phase using either service provider methods or preload files. Service providers offer start and ready methods, while preload files provide a simpler approach for application-specific initialization.

The start method executes after the boot phase completes but before the application is ready. The ready method executes once the application is fully started and ready to handle requests or commands.

Preload files offer a simpler way to run code during the start phase without creating a service provider. They're ideal for application-specific initialization like registering routes, attaching event listeners, or configuring middleware.

Create a preload file using the make:preload command.

This command creates a new file in the start directory and automatically registers it in your adonisrc.ts configuration file.

You can configure preload files to load only in specific runtime environments.

The environment property accepts an array of values: web (HTTP server), console (Ace commands), test (test runner), and repl (REPL environment).

Use the shutdown method in a service provider to execute cleanup operations during graceful shutdown. This ensures resources are properly released before your application terminates.

**Examples:**

Example 1 (javascript):
```javascript
import { VineString } from '@vinejs/vine'
import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    VineString.macro('phoneNumber', function (this: VineString) {
      return this.use((value, field) => {
        if (typeof value !== 'string') {
          return
        }

        if (!/^\d{10}$/.test(value)) {
          field.report('The {{ field }} must be a valid 10-digit phone number', field)
        }
      })
    })
  }
}
```

Example 2 (javascript):
```javascript
import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async start() {
    const database = await this.app.container.make('lucid.db')
    
    /**
     * Verify database connection is working
     */
    await database.connection().select(1)
  }

  async ready() {
    if (this.app.getEnvironment() === 'web') {
      const logger = await this.app.container.make('logger')
      logger.info('HTTP server is ready to accept requests')
    }
  }
}
```

Example 3 (unknown):
```unknown
node ace make:preload events
```

Example 4 (python):
```python
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

emitter.on('user:registered', function (user) {
  logger.info({ userId: user.id }, 'New user registered')
})

emitter.on('order:placed', function (order) {
  logger.info({ orderId: order.id }, 'New order placed')
})
```

---

## Console tests - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/console-tests

**Contents:**
- Console tests
- Overview
- Basic example
- Testing logger output
- Testing table output
- Trapping prompts
  - Replying to text prompts
  - Choosing options from select prompts
  - Accepting or rejecting confirmation prompts
- Intermediate: Testing prompt validation

This guide covers testing Ace commands in AdonisJS applications. You will learn how to:

Console tests allow you to verify that your custom Ace commands behave correctly without manual interaction. Since commands often produce terminal output and prompt users for input, testing them requires special techniques to capture output and simulate user responses.

AdonisJS provides a dedicated testing API through the ace service that lets you create command instances, execute them in isolation, and make assertions about their behavior. The API includes tools for capturing log output, intercepting prompts, and verifying exit codes.

Testing commands is particularly valuable when your commands perform critical operations like database migrations, file generation, or deployment tasks. A failing command in production can have serious consequences, so automated tests help catch issues before they reach users.

Let's walk through testing a simple command from start to finish. First, create a new command using the make:command generator.

The generated command includes a run method where you define the command's behavior. Update it to greet the user.

Next, create a test file for the command. If you haven't already defined a unit test suite, see the testing introduction for setup instructions.

The test uses the ace service to create a command instance, execute it, and verify it completed successfully. The ace.create method accepts the command class and an array of arguments (empty in this case since the command takes no arguments).

Run the test using the following command.

The Greet command writes a log message to the terminal using this.logger.info(). By default, this output goes directly to stdout, which makes it difficult to capture and assert against in tests.

To solve this, you can switch the ace UI library into raw mode. In raw mode, ace stores all output in memory instead of writing to the terminal. This allows you to inspect and assert against the exact messages your command produces.

Raw mode captures all output from this.logger, this.ui.table(), and other UI methods. Always switch back to normal mode after your test to avoid affecting other tests.

Use a Japa group.each.setup hook to switch modes automatically before and after each test.

Log assertions in raw mode include color function names. The message this.logger.info('Hello') becomes [ blue(info) ] Hello in raw mode. If your assertion fails, check that you've included the color formatting in your expected string.

Commands often display tabular data using this.ui.table(). You can test table output the same way as log output by switching to raw mode first.

Consider a command that displays a table of team members.

Use assertTableRows to verify the table contents. Pass a two-dimensional array where each inner array represents a row's cells.

Prompts pause command execution and wait for user input, which blocks automated tests. To handle this, you must trap prompts before executing the command. A trap intercepts a specific prompt and provides a programmatic response.

Traps are created using command.prompt.trap(), which accepts the prompt title as its argument. The title must match exactly, including case.

Prompt titles are case-sensitive. If your prompt asks "What is your name?" but you trap "what is your name?", the trap won't match and your test will hang waiting for input. Always copy the exact prompt title from your command.

Use replyWith to provide a text response to prompts created with this.prompt.ask().

Traps are consumed when triggered and automatically removed afterward. If a test completes without triggering a trapped prompt, Japa throws an error to alert you that the expected prompt never appeared.

For prompts created with this.prompt.choice() or this.prompt.multiple(), use chooseOption or chooseOptions with zero-based indices.

For boolean prompts created with this.prompt.confirm() or this.prompt.toggle(), use accept or reject.

Prompts can include validation rules that reject invalid input. You can test these validators directly using assertPasses and assertFails without fully executing the command.

The assertFails method accepts the input value and the expected error message. The assertPasses method accepts a value that should pass validation.

You can chain validation assertions with replyWith to both test the validator and provide a final response.

The command instance provides several assertion methods to verify command behavior.

Assert the command exited with exitCode=0, indicating success.

Assert the command exited with a non-zero exitCode, indicating failure.

Assert the command exited with a specific exit code. Useful when your command uses different exit codes to signal different error conditions.

Assert the command did not exit with a specific code.

Assert the command wrote a specific log message. Optionally specify the output stream as stdout or stderr. Requires raw mode.

Assert the command wrote a log message matching a regular expression. Useful when the exact message varies but follows a pattern. Requires raw mode.

Assert the command printed a table with specific rows. Pass a two-dimensional array where each inner array represents a row's column values. Requires raw mode.

**Examples:**

Example 1 (markdown):
```markdown
node ace make:command greet

# DONE:    create app/commands/greet.ts
```

Example 2 (gdscript):
```gdscript
import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class Greet extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "Greet"')
  }
}
```

Example 3 (sass):
```sass
node ace make:test commands/greet --suite=unit

# DONE:    create tests/unit/commands/greet.spec.ts
```

Example 4 (javascript):
```javascript
import { test } from '@japa/runner'
import Greet from '#commands/greet'
import ace from '@adonisjs/core/services/ace'

test.group('Commands greet', () => {
  test('should greet and exit with code 0', async () => {
    /**
     * Create an instance of the command. The second argument
     * is an array of CLI arguments to pass to the command.
     */
    const command = await ace.create(Greet, [])

    /**
     * Execute the command. This runs the `run` method.
     */
    await command.exec()

    /**
     * Assert the command exited successfully (exit code 0).
     */
    command.assertSucceeded()
  })
})
```

---

## Terminal UI - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/terminal-ui

**Contents:**
- Terminal UI
- Overview
- Displaying log messages
  - Adding prefix and suffix
  - Creating loading animations
  - Displaying action status
- Formatting text with colors
- Rendering tables
  - Right-aligning columns
  - Rendering full-width tables

This guide covers different aspects of Terminal UIs. You will learn about the following topics:

The Ace terminal UI is powered by the @poppinss/cliui package, which provides helpers for displaying logs, rendering tables, showing animated tasks, and more.

All terminal UI primitives are built with testing in mind. When writing tests, you can enable "raw" mode to disable colors and formatting, making it easy to collect logs in memory and write assertions against them. This design ensures your commands remain testable while delivering rich visual experiences to users.

The CLI logger provides methods for displaying messages at different severity levels. Each log level uses distinct colors and icons to help users quickly identify message importance.

The error and fatal methods write to stderr rather than stdout, making it easier for users to redirect error output separately from normal output.

You can add prefix and suffix text to log messages for additional context. Both prefix and suffix are displayed with reduced opacity to distinguish them from the main message.

Loading animations display animated dots after a message, providing visual feedback during long-running operations. You can update the message text and stop the animation when the operation completes.

Logger actions provide a consistent way to display the status of operations with automatic styling and color coding. This is particularly useful when performing multiple sequential tasks.

Actions can be marked with three different states:

Ace uses kleur for applying ANSI color codes to text. Access kleur's chained API through the this.colors property to format text with foreground colors, background colors, and text styles.

Tables organize data into rows and columns, making it easy for users to scan and compare information. Create a table using the this.ui.table method, which returns a Table instance for defining headers and rows.

You can apply color formatting to any table cell by wrapping values with color methods.

By default, all columns are left-aligned. You can right-align columns by defining them as objects with an hAlign property. When right-aligning a column, make sure to also right-align the corresponding header.

By default, tables automatically size columns to fit their content. However, you can render tables at full terminal width using the fullWidth method.

In full-width mode, all columns except one use their content width, while the designated "fluid" column expands to fill remaining space. By default, the first column is fluid.

You can change which column expands to fill available space using the fluidColumnIndex method.

Stickers render content inside a bordered box, drawing user attention to important information like server addresses, configuration instructions, or key next steps.

For displaying step-by-step instructions, use the this.ui.instructions method instead. This prefixes each line with an arrow symbol (>), making it clear these are action items.

The tasks widget provides a polished UI for executing and displaying progress of multiple time-consuming operations. It supports two rendering modes: minimal (for production use) and verbose (for debugging).

In minimal mode, only the currently running task is expanded to show progress updates. In verbose mode, every progress message is logged on its own line, making it easier to debug issues.

Create a tasks widget using the this.ui.tasks method, then add individual tasks with the add method.

Each task callback must return a status message. Returning a normal string indicates success, while wrapping the return value in task.error() indicates failure. You can also throw an exception to mark a task as failed.

Instead of using console.log or this.logger inside task callbacks, use the task.update method to report progress. This ensures progress updates are displayed correctly in both minimal and verbose modes.

In minimal mode, only the latest progress message is visible. In verbose mode, all messages are logged as they occur.

You may want to allow users to enable verbose output for debugging. This is commonly done by accepting a --verbose flag.

Users can now run your command with --verbose to see detailed progress logs for debugging.

**Examples:**

Example 1 (gdscript):
```gdscript
import { BaseCommand } from '@adonisjs/core/ace'

export default class DeployCommand extends BaseCommand {
  static commandName = 'deploy'
  
  async run() {
    /**
     * Debug message - helpful for troubleshooting
     */
    this.logger.debug('Loading deployment configuration')
    
    /**
     * Info message - general information
     */
    this.logger.info('Deploying application to production')
    
    /**
     * Success message - operation completed successfully
     */
    this.logger.success('Deployment completed successfully')
    
    /**
     * Warning message - potential issues
     */
    this.logger.warning('SSL certificate expires in 30 days')
    
    /**
     * Error and fatal messages - written to stderr
     */
    this.logger.error(new Error('Failed to upload assets'))
    this.logger.fatal(new Error('Deployment failed completely'))
  }
}
```

Example 2 (css):
```css
/**
 * Add a suffix showing the command being run
 */
this.logger.info('Installing packages', {
  suffix: 'npm i --production'
})

/**
 * Add a prefix showing the process ID
 */
this.logger.info('Starting worker', {
  prefix: process.pid
})
```

Example 3 (typescript):
```typescript
/**
 * Create a loading animation
 */
const animation = this.logger.await('Installing packages', {
  suffix: 'npm i'
})

/**
 * Start the animation
 */
animation.start()

/**
 * Update the message as progress continues
 */
setTimeout(() => {
  animation.update('Unpacking packages', {
    suffix: undefined
  })
}, 2000)

/**
 * Stop the animation when complete
 */
setTimeout(() => {
  animation.stop()
  this.logger.success('Installation complete')
}, 4000)
```

Example 4 (javascript):
```javascript
/**
 * Create an action indicator
 */
const createFile = this.logger.action('creating config/auth.ts')

try {
  await this.createConfigFile()
  
  /**
   * Mark the action as succeeded
   * Optional: display how long it took
   */
  createFile.displayDuration().succeeded()
} catch (error) {
  /**
   * Mark the action as failed with the error
   */
  createFile.failed(error)
}
```

---

## Repl - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/repl

**Contents:**
- REPL
- Overview
- Starting the REPL session
- Using editor mode
- Accessing previous results
  - Accessing the last result
  - Accessing the last error
- Navigating command history
- Exiting the REPL session
- Importing modules

In this guide, you will learn about the following topics:

The AdonisJS REPL extends the standard Node.js REPL with application-aware features that make it easy to interact with your codebase. Unlike the basic Node.js REPL, the AdonisJS REPL boots your application, loads its services, and provides convenient shortcuts for common tasks.

The REPL is particularly useful during development for quick experimentation, debugging, and data exploration. You can import TypeScript files directly, access container services without manual imports, create class instances through the IoC container, and extend the REPL with custom methods specific to your application.

You can start the REPL session using the node ace repl command. This boots your AdonisJS application and opens an interactive prompt where you can execute code.

Once started, you'll see a prompt where you can type JavaScript code and press Enter to execute it. The output appears immediately on the following line, creating a fast feedback loop for testing and exploration.

While the REPL is great for single-line expressions, you sometimes need to write multi-line code blocks. The editor mode allows you to write multiple lines of code before executing them.

Enter editor mode by typing the .editor command at the REPL prompt.

In editor mode, you can write multiple lines of code. Press Ctrl+D to execute the entire code block, or press Ctrl+C to cancel and exit editor mode without executing anything.

The REPL provides special variables for accessing results and errors from previously executed commands, eliminating the need to re-run code when you forget to store a value.

If you execute a statement but forget to assign its result to a variable, you can access it using the _ (underscore) variable.

This is particularly useful when you want to perform additional operations on a result without re-executing the original command.

Similarly, you can access any exception raised by the previous command using the _error variable. This is helpful for inspecting error details without cluttering your code with try/catch blocks.

The REPL maintains a history of all commands you've executed, saved in the .adonisjs_v7_repl_history file in your home directory. This allows you to recall and re-execute previous commands without retyping them.

You can navigate through command history in two ways:

Arrow key navigation: Press the up arrow ↑ key to cycle through previous commands one at a time. Press the down arrow ↓ to move forward through the history.

Search mode: Press Ctrl+R to enter reverse search mode, then type characters to search for matching commands in your history. Press Ctrl+R again to cycle through multiple matches.

You can exit the REPL session either by typing .exit or by pressing Ctrl+C twice in quick succession to exit.

When you exit, AdonisJS performs a graceful shutdown, closing database connections and cleaning up resources before the process terminates.

Note that the REPL session does not automatically reload when you modify your codebase. If you change your application code, you must exit and restart the REPL session for the changes to take effect.

Node.js does not support import statements in REPL sessions, so you must use dynamic import() expressions instead. When importing, you need to destructure the module exports or access specific properties.

The syntax const { default: User } destructures the default export from the module. This can be verbose when you only want the default export.

To simplify importing default exports, the REPL provides an importDefault helper method that automatically extracts the default export.

This is particularly convenient when working with models, services, or any modules that export a single default value.

The REPL includes several built-in helper methods that provide shortcuts for common tasks like importing services, making class instances, and managing the REPL context.

You can view all available helper methods by typing the .ls command.

Instead of manually importing services, you can use the load* helper methods to load them into the REPL context.

Each load* method imports the corresponding service and makes it available as a property in the REPL context, eliminating the need for import statements.

The make method uses the IoC container to create class instances with automatic dependency injection.

This is useful when you want to test services or classes that have constructor dependencies, as the container automatically resolves and injects them.

The p method promisifies callback-based functions, similar to Node.js util.promisify.

You can extend the REPL with custom methods specific to your application. This is useful for creating shortcuts that you use frequently during development, such as loading all models or seeding test data.

Custom methods are typically defined in a preload file that runs only in the REPL environment.

First, generate a preload file configured to run only in the REPL environment.

In the preload file, use repl.addMethod to define custom methods. For example, let's create a method that imports all models from the app/models directory.

The repl.addMethod accepts three parameters:

After restarting the REPL session, your custom method becomes available.

You can define multiple custom methods in the same preload file to create a comprehensive set of development shortcuts tailored to your application's needs.

**Examples:**

Example 1 (unknown):
```unknown
node ace repl
```

Example 2 (sass):
```sass
> (js) .editor
# // Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
```

Example 3 (javascript):
```javascript
> (js) .editor

# // Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
const users = await User.query()
  .where('isActive', true)
  .orderBy('createdAt', 'desc')
  .limit(10)

console.log(`Found ${users.length} active users`)
# // Press Ctrl+D to execute
```

Example 4 (markdown):
```markdown
> (js) helpers.string.random(32)
# 'Z3y8QQ4HFpYSc39O2UiazwPeKYdydZ6M'

> (js) _
# 'Z3y8QQ4HFpYSc39O2UiazwPeKYdydZ6M'

> (js) _.length
# 32
```


## Redis - AdonisJS

**URL:** https://docs.adonisjs.com/guides/database/redis

**Contents:**
- Redis
- Overview
- Installation
- Configuration
  - Connecting via Unix socket
  - Configuring clusters
  - Configuring sentinels
- Usage
  - Switching between connections
  - Quitting connections

This guide covers Redis integration in AdonisJS applications. You will learn how to:

The @adonisjs/redis package is a thin wrapper on top of ioredis (a Node.js Redis client) with better developer experience around Pub/Sub and automatic management of multiple Redis connections.

You can use Redis for caching, session storage, job queues, rate limiting, and real-time messaging. The package provides a clean API to execute Redis commands, manage multiple named connections, and subscribe to Pub/Sub channels without manually managing subscriber connections.

Install and configure the package using the following command:

Installs the @adonisjs/redis package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/redis.ts file with connection configuration for your Redis server.

Defines the following environment variables and their validation rules.

The configuration for the Redis package is stored inside the config/redis.ts file.

See also: Config file stub

The connection property defines which connection to use by default. When you run Redis commands without choosing an explicit connection, they will be executed against the default connection.

The connections property is a collection of multiple named connections. You can define one or more connections inside this object and switch between them using the redis.connection() method.

Every named connection config is identical to the config accepted by ioredis.

You can configure Redis to use a Unix socket for local connections. Use the path property to specify the socket file location.

The @adonisjs/redis package creates a cluster connection when you define an array of cluster nodes in your connection config.

Clusters distribute data across multiple Redis nodes for horizontal scaling and high availability. Use clusters when you need to scale beyond a single server's memory capacity or want automatic sharding of data across nodes.

An array of cluster node addresses. Each node should specify host and port. The package will discover all cluster nodes automatically after connecting to the initial nodes.

Cluster-specific options for controlling behavior.

See the ioredis cluster documentation for the complete list of options.

Sentinels provide high availability through automatic failover. Sentinel nodes monitor your master and replica servers and automatically promote a replica to master if the master fails.

You can configure a Redis connection to use sentinels by defining an array of sentinel nodes within the connection config.

See also: IORedis docs on Sentinels config

An array of sentinel node addresses. Sentinels will automatically detect which server is the current master and redirect connections accordingly.

The name of the master group as configured in your sentinels. This must match the sentinel configuration.

You can execute Redis commands using the redis service exported by the package. The redis service is a singleton instance configured using the settings from your config/redis.ts file.

The commands API is identical to ioredis. Consult the ioredis documentation to view the complete list of available methods.

Commands executed using the redis service are invoked against the default connection defined inside the config file. You can execute commands on a specific connection by first getting an instance of it.

The .connection() method creates and caches a connection instance for the lifetime of the process. Subsequent calls return the same cached instance.

Connections are long-lived and you will get the same instance every time you call the .connection() method. You can quit a connection gracefully using the quit method or force close it immediately using the disconnect method.

You can also quit using the connection instance directly.

Redis connections can fail at any time during your application's lifecycle. Without proper error handling, connection failures will crash your application with unhandled promise rejections.

By default, AdonisJS logs Redis connection errors using the application logger and retries connections up to 10 times before closing them permanently. The retry strategy uses exponential backoff to balance between recovering from brief outages and not wasting resources on prolonged failures.

The retry strategy is defined for each connection in your configuration.

See also: IORedis docs on auto reconnect

Without proper error handling, Redis connection failures will crash your application. The default retry strategy attempts 10 reconnections before giving up. For production deployments, customize the retry strategy based on your availability requirements and monitor Redis connection health.

Customizing for production:

You can disable the default error reporter using the .doNotLogErrors() method. This removes the error event listener from Redis connections.

Pub/Sub (Publish/Subscribe) is a messaging pattern where publishers send messages to channels without knowing who receives them, and subscribers listen to channels without knowing who sent them. This decoupling makes Pub/Sub ideal for real-time features like notifications, live updates, and chat systems.

Redis needs multiple connections for Pub/Sub. The subscriber connection cannot perform regular Redis operations other than subscribing and unsubscribing. When you call the subscribe method for the first time, the package automatically creates a subscriber connection for you.

The subscribe method handles both subscribing to a channel and listening for messages. This is different from the ioredis API where you need to use separate methods.

You can handle subscription lifecycle events using the options parameter.

When using ioredis directly, you need to use two different APIs to subscribe to a channel and listen for messages. The AdonisJS wrapper combines these into a single convenient method.

You can publish messages using the publish method. The method accepts the channel name as the first parameter and the message data as the second parameter.

Make sure to subscribe before publishing messages. Messages published before a subscription is established will be lost since there are no subscribers to receive them.

You can subscribe to channel patterns using wildcards with the psubscribe method. The callback receives both the channel name and the message.

You can unsubscribe from channels or patterns using the unsubscribe and punsubscribe methods.

Lua scripts allow you to execute complex operations atomically on the Redis server. This is useful when you need multiple Redis commands to succeed or fail together without race conditions.

You can register Lua scripts as commands with the Redis service. These commands are automatically applied to all connections.

See also: IORedis docs on Lua Scripting

Once you have defined a command, you can execute it using the runCommand method. Keys are passed first, followed by arguments.

You can execute the same command on a specific connection.

You can also define commands for specific connection instances using the connection event.

You can customize how arguments are sent to Redis and how replies are parsed using the redis.Command property. This is useful when you want to work with JavaScript objects, Maps, or custom data types.

The API is identical to the IORedis transformers API.

Argument transformers modify data before sending it to Redis.

Reply transformers modify data received from Redis.

When testing code that uses Redis, you can configure a separate connection for your tests to isolate test data from development or production data.

First, define a test connection in your Redis configuration.

Then, set the REDIS_CONNECTION environment variable to test when running tests within the .env.test file

Clean up test data after each test to ensure test isolation.

The following events are emitted by Redis connection instances. You can listen to these events using the redis.on('connection') method.

Emitted when a connection is established. The subscriber:connect event is emitted when a subscriber connection is made.

Emitted when the connection is in wait mode because the lazyConnect option is enabled in the config. The connection moves out of wait mode after executing the first command.

Emitted after the connect event when Redis is ready to accept commands. If you enable the enableReadyCheck flag in your config, this event waits for the Redis server to report readiness.

Emitted when unable to connect to the Redis server or when a connection error occurs. See error handling for proper error management.

Emitted when a connection is closed. IORedis might retry establishing a connection after emitting the close event, depending on the retry strategy.

Emitted when attempting to reconnect after a connection closes.

Emitted when the connection has been closed permanently and no further reconnections will be attempted.

Emitted when a new node is added to the cluster. Only applicable to cluster connections.

Emitted when a node is removed from the cluster. Only applicable to cluster connections.

Emitted when unable to connect to a cluster node. Only applicable to cluster connections.

Emitted when a subscription is established on a channel or pattern.

Emitted when unable to subscribe to a channel or pattern.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/redis
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/redis/redis_provider')
  ]
}
```

Example 3 (sass):
```sass
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

Example 4 (javascript):
```javascript
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

---

## Creating commands - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/creating-commands

**Contents:**
- Creating commands
- Creating your first command
- Configuring command metadata
  - Setting the command name
  - Writing command descriptions
  - Adding detailed help text
  - Defining command aliases
- Configuring command options
  - Starting the application
  - Allowing unknown flags

This guide covers creating commands using the Ace command line. You will learn about the following topics:

You can generate a new command using the make:command Ace command. This creates a basic command (within the commands directory) scaffolded with all the necessary boilerplate.

See also: Make command

The generated file contains a command class that extends BaseCommand. At minimum, a command must define a commandName and implement the run method.

You can now execute your command using the command name you defined.

Command metadata controls how your command appears in help screens and how it behaves during execution. The metadata includes the command name, description, help text, aliases, and execution options.

The commandName property defines the name users will type to execute your command. Command names should not contain spaces and should avoid unfamiliar special characters like *, &, or slashes.

Command names can include namespaces by using a colon separator. This helps organize related commands together in the help output.

The command description appears in the commands list and on the help screen for your command. Keep descriptions concise and use the help text for longer explanations.

Help text allows you to provide longer descriptions, usage examples, or additional context that doesn't fit in the brief description. Define help text as an array of strings, where each string represents a line of output.

The {{ binaryName }} variable substitution references the binary used to execute ace commands (typically node ace), ensuring your help text displays the correct command syntax regardless of how the user runs Ace.

Aliases provide alternative names for your command. This is useful when you want to offer shorter or more intuitive names for frequently used commands.

Users can now run your command using any of the defined names.

Command options control the execution behavior of your command. These options are defined using the static options property and affect how Ace boots the application, handles flags, and manages the command's lifecycle.

By default, Ace does not boot your AdonisJS application when running commands. This keeps commands fast and prevents unnecessary application initialization for simple tasks that don't need application state.

However, if your command needs access to models, services, or other application resources, you must tell Ace to start the app before executing the command.

By default, Ace will display an error if you pass a flag that the command doesn't define. This strict parsing helps catch typos and incorrect flag usage.

However, some commands need to accept arbitrary flags and pass them to other tools. You can disable strict flag parsing using the allowUnknownFlags option.

Ace automatically terminates the application after your command's run method completes. This is the desired behavior for most commands that perform a task and exit.

However, if your command needs to run indefinitely (like a queue worker or development server), you must tell Ace not to terminate the application using the staysAlive option.

See also: Terminating the application and Cleaning up before termination

Ace executes command lifecycle methods in a predefined order, allowing you to organize your command logic into distinct phases. Each lifecycle method serves a specific purpose in the command execution flow.

The following table describes each lifecycle method and its intended use:

You don't need to implement all lifecycle methods. Only define the methods your command actually needs. For simple commands, implementing just the run method is sufficient.

Ace constructs and executes commands using the IoC container, enabling you to inject dependencies into any lifecycle method. This is particularly useful for accessing services, repositories, or other resources your command needs.

To inject dependencies, type-hint them as method parameters and decorate the method with the @inject decorator.

The container automatically resolves dependencies, including nested dependencies, making it easy to access your application's services without manual instantiation.

When an exception is thrown from your command, Ace displays the error using the CLI logger and sets the command's exit code to 1, indicating failure. A non-zero exit code signals to the shell or CI/CD system that the command failed.

However, you can also handle errors explicitly using try/catch blocks or the completed lifecycle method. When handling errors yourself, you must update the command's exitCode and error properties to ensure the command reports its status correctly.

Use try/catch blocks to handle errors directly in the method where they might occur. This gives you fine-grained control over error handling.

The completed lifecycle method provides a centralized place to handle errors from any previous lifecycle method. This is useful when you want consistent error handling across all command phases.

Ace automatically terminates the application after executing your command. However, when you enable the staysAlive option for long-running commands, you must explicitly terminate the application when your command is done or when an error occurs.

Use the this.terminate method to shut down the application gracefully. This is commonly used in long-running processes that need to exit based on specific conditions.

Multiple events can trigger application termination, including the SIGTERM signal sent by process managers or when the user presses Ctrl+C. To ensure your command performs necessary cleanup before shutdown, listen for the terminating hook.

The terminating hook should be registered in the prepare lifecycle method, which runs before your command's main logic. This ensures the cleanup handler is in place before any work begins.

**Examples:**

Example 1 (markdown):
```markdown
node ace make:command greet

# CREATE: commands/greet.ts
```

Example 2 (gdscript):
```gdscript
import { BaseCommand } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'

  async run() {
    this.logger.info('Hello world!')
  }
}
```

Example 3 (unknown):
```unknown
node ace greet
```

Example 4 (gdscript):
```gdscript
export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
}
```

---

## Rate limiting - AdonisJS

**URL:** https://docs.adonisjs.com/guides/security/rate-limiting

**Contents:**
- Rate limiting
- Overview
- Installation
- Configuration
  - Environment variables
  - Shared options
  - Redis store
  - Database store
- Throttling HTTP requests
  - Using a custom key

This guide covers rate limiting in AdonisJS applications. You will learn how to:

Rate limiting controls how many requests a user can make to your application within a given time period. When a user exceeds their limit, subsequent requests are rejected until the time window resets.

You need rate limiting to protect your application from abuse. Without it, a single user (or bot) can overwhelm your server with requests, consuming resources meant for legitimate users. Rate limiting also helps prevent brute-force attacks on login forms, protects expensive API endpoints from overuse, and ensures fair access to shared resources.

The @adonisjs/limiter package is built on top of node-rate-limiter-flexible, which provides one of the fastest rate-limiting APIs and uses atomic increments to avoid race conditions.

Install and configure the package using the following command:

Installs the @adonisjs/limiter package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/limiter.ts file.

Creates the start/limiter.ts file for defining HTTP throttle middleware.

Defines the following environment variable and its validation inside the start/env.ts file.

Optionally creates the database migration for the rate_limits table if using the database store.

The rate limiter configuration is stored in the config/limiter.ts file. You define which storage backends are available and which one to use by default.

The default property specifies which store to use for rate limiting. The stores object defines all available storage backends. We recommend always configuring the memory store so you can use it during testing.

See also: Rate limiter config stub

The default store is controlled by the LIMITER_STORE environment variable, allowing you to switch stores between environments. For example, you might use memory during testing and redis in production.

The environment variable must be validated in start/env.ts to ensure only configured stores are allowed:

All storage backends accept the following options:

Prefix for keys in storage. The database store ignores this since separate tables provide isolation.

Adds artificial delay to spread requests evenly across the time window. See smooth out traffic peaks for details.

Number of requests after which to block the key in memory, reducing database queries from abusive users.

How long to block keys in memory. Reduces database load by checking memory first. The inMemoryBlockOnConsumed option is useful when users continue making requests after exhausting their quota. Instead of querying the database for every rejected request, you can block them in memory:

The Redis store requires the @adonisjs/redis package to be configured first.

The Redis connection from config/redis.ts. We recommend using a separate database for the limiter.

When true, rejects rate-limiting requests if Redis connection status is not ready.

The database store requires the @adonisjs/lucid package to be configured first.

The database store only supports MySQL, PostgreSQL, and SQLite. Other databases like MongoDB are not compatible and will throw an error at runtime.

The database connection from config/database.ts. Uses the default connection if not specified.

The database name for SQL queries. Inferred from connection config, but required when using a connection string.

The table for storing rate limit data.

The schema for SQL queries (PostgreSQL only).

When true, clears expired keys every 5 minutes. Only keys expired for more than 1 hour are removed.

The most common use case is throttling HTTP requests with middleware. The limiter.define method creates reusable throttle middleware that you can apply to routes.

Open the start/limiter.ts file to see the pre-defined global throttle middleware. This middleware allows users to make 10 requests per minute based on their IP address:

Apply the middleware to any route:

When a user exceeds 10 requests within a minute, they receive a 429 Too Many Requests response until the time window resets.

By default, requests are rate-limited by the user's IP address. You can specify a different key using the usingKey method. This is useful when you want to limit by user ID, API key, or any other identifier:

You can override the default store for specific middleware using the store method:

The blockFor method extends the lockout period when users continue making requests after exhausting their quota. This discourages abuse more effectively than simply resetting the counter:

Different users often need different rate limits. Authenticated users might get higher limits than guests, or premium subscribers might get unlimited access while free users are restricted.

The callback passed to limiter.define receives the HTTP context, allowing you to apply different limits based on request properties:

When a user exhausts their rate limit, the middleware throws the E_TOO_MANY_REQUESTS exception. The exception is automatically converted to an HTTP response using content negotiation:

See also: E_TOO_MANY_REQUESTS exception reference

You can customize the error message without handling the exception globally using the limitExceeded hook:

If you have configured the @adonisjs/i18n package, define a translation using the errors.E_TOO_MANY_REQUESTS key:

You can also use a custom translation key with interpolated values:

For more control, handle the exception in your global exception handler:

Beyond HTTP middleware, you can use the limiter directly in any part of your application. This is useful for protecting login forms from brute-force attacks, limiting background job execution, or controlling access to expensive operations.

Use the limiter.use method to create a limiter instance with specific settings:

To use the default store, omit the first parameter:

The attempt method executes a callback only if the rate limit hasn't been exceeded. It returns the callback's result, or undefined if the limit was reached:

The penalize method is designed for scenarios where you want to consume a request only when an operation fails. This is perfect for login protection where you want to track failed attempts, not successful ones.

For fine-grained control, you can manually check and consume requests instead of using attempt or penalize.

Calling remaining and increment separately creates a race condition where multiple concurrent requests might both pass the check before either increments the counter. Use the consume method instead, which performs an atomic check-and-increment.

The consume method increments the counter and throws an exception if the limit has been reached:

You can extend the lockout period for users who continue making requests after exhausting their quota. This is more punitive than standard rate limiting and discourages abuse.

Automatic blocking occurs when you create a limiter with the blockDuration option:

You can also block a key manually:

Sometimes you need to restore requests to a user. For example, if a background job completes, you might want to let the user queue another one.

The decrement method reduces the request count by 1:

The decrement method is not atomic. Under high concurrency, the request count might briefly go to -1. Use the delete method if you need to completely reset a key.

The delete method removes a key entirely:

During testing, you typically want to use the memory store instead of Redis or a database. Set the environment variable in your .env.test file:

Clear the rate-limiting storage between tests using the limiter.clear method:

You can also call clear without arguments to flush all configured stores:

When using Redis, the clear method flushes the entire database. Use a separate Redis database for the rate limiter to avoid clearing application data. Configure this in config/redis.ts by creating a dedicated connection.

You can create custom storage providers by implementing the LimiterStoreContract interface. This is useful when you need to use a database not supported by the built-in stores.

Create a helper function to use your store in the config file. The helper should return a LimiterManagerStoreFactory function:

If you're wrapping an existing driver from node-rate-limiter-flexible, use the RateLimiterBridge class for simpler implementation:

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/limiter
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/limiter/limiter_provider')
  ]
}
```

Example 3 (sass):
```sass
LIMITER_STORE=redis
```

Example 4 (typescript):
```typescript
import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  /**
   * The default store is selected via environment variable,
   * allowing different stores in different environments.
   */
  default: env.get('LIMITER_STORE'),

  stores: {
    redis: stores.redis({}),

    database: stores.database({
      tableName: 'rate_limits'
    }),

    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
```

---

## TanStack query - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/tanstack-query

**Contents:**
- TanStack Query Integration
- Overview
- Prerequisites
- Installation
- Setup
  - Retry behavior
- Basic queries
- Queries with parameters
- Mutations
- Infinite queries

This guide covers the TanStack Query integration for Tuyau. You will learn how to install and configure @tuyau/react-query, generate type-safe query and mutation options, implement infinite scrolling and manage cache invalidation.

The @tuyau/react-query package provides seamless integration between Tuyau and TanStack Query. Instead of creating custom hooks, Tuyau generates type-safe options objects that you pass directly to TanStack Query's standard hooks like useQuery, useMutation, and useInfiniteQuery.

This approach gives you complete control over TanStack Query's features while maintaining end-to-end type safety. Query keys are automatically generated based on your route names and parameters, and cache invalidation becomes straightforward and type-safe. The integration works exclusively with route names, ensuring that your API calls remain decoupled from URL structures.

Before using the TanStack Query integration, you must have Tuyau installed and configured in your application. Follow the Tuyau installation guide to set up your Tuyau client first.

You should be familiar with:

Install the TanStack Query integration package in your frontend application:

Make sure @tuyau/react-query and @tuyau/core are on compatible versions. If you see type errors after installing, check that both packages share the same major and prerelease tag (e.g., both on 1.x or both on next).

Create your Tuyau client with TanStack Query integration:

The api object provides access to all your routes with type-safe query and mutation options. The client object is the core Tuyau client, and queryClient is the standard TanStack Query client used for cache management and invalidation.

Tuyau is built on Ky, which has automatic retry enabled by default for failed requests. When using @tuyau/react-query, Ky's retry mechanism is automatically disabled to let TanStack Query handle retries instead, since it also has built-in retry functionality.

This prevents double retries (Ky retrying, then TanStack Query retrying on top) and gives you full control over retry behavior through TanStack Query's configuration:

Use queryOptions() to generate options for TanStack Query's useQuery hook. All queries use route names rather than URLs:

The response data is fully typed based on your backend controller's return value. TypeScript knows the exact shape of postsQuery.data without any manual type annotations.

Pass route parameters and query parameters to queryOptions(). TanStack Query options go in the second argument:

The first argument contains your API parameters (params, query), and the second argument accepts any standard TanStack Query options like staleTime, enabled, or refetchInterval.

Use mutationOptions() to generate options for TanStack Query's useMutation hook:

The mutationOptions() method accepts standard TanStack Query mutation options like onSuccess, onError, and onSettled. All mutation parameters (params, body) are fully typed based on your backend validator.

For pagination and infinite scrolling, use infiniteQueryOptions() with TanStack Query's useInfiniteQuery. This requires coordination between your frontend query configuration and backend validation.

Configure the infinite query with pagination parameters:

The pageParamKey option is critical - it specifies which query parameter holds the page number. This must match the parameter name in your backend validator.

Define a validator that includes the pagination parameter referenced by pageParamKey:

The page parameter in the validator must match the pageParamKey value in your frontend configuration. Tuyau automatically handles passing the page parameter from TanStack Query's pagination system to your backend.

Implement pagination in your controller using the validated parameters:

The getNextPageParam function in your frontend checks lastPage.meta.nextPage to determine if more pages exist. Return null when there are no more pages to load.

When the component mounts, TanStack Query calls your API with page: 1 (the initialPageParam). The response includes both the data and metadata about pagination. The getNextPageParam function examines this metadata to determine what page to fetch next.

When the user clicks "Load More", TanStack Query automatically calls your API again with the next page number, appending the results to the existing data. Tuyau handles injecting the page parameter into your query string transparently.

Tuyau provides multiple methods for cache invalidation with different levels of granularity:

Get the exact query key for a specific query with its parameters:

Use queryKey() when you know exactly which query needs to be invalidated and you have all its parameters available.

Get the base path key without parameters:

Use pathKey() when you want to invalidate a specific endpoint without parameters, such as list queries that don't depend on route parameters.

Get a filter that matches all queries starting with a path:

The pathFilter() method is particularly useful when a mutation might affect multiple related queries and you want to invalidate all of them at once.

Use queryFilter() with a predicate function for fine-grained control over which queries to invalidate:

The predicate function receives the query state and can inspect cached data to make invalidation decisions. This is useful for complex invalidation logic that depends on the actual cached values.

When an API call fails, Tuyau throws an HTTPError (from Ky) that TanStack Query captures and exposes through its standard error state.

TanStack Query surfaces errors through isError and error on the result object:

The error object is a Ky HTTPError with a response property. Use it to inspect the status code:

Rather than checking status codes in every component, configure a global handler using the queryClient default options:

This prevents retrying unauthorized requests and lets you handle 401s consistently across your application.

For more information about TanStack Query's capabilities, see the TanStack Query documentation.

**Examples:**

Example 1 (elixir):
```elixir
npm install @tanstack/react-query @tuyau/react-query
```

Example 2 (javascript):
```javascript
import { registry } from '~registry'
import { createTuyau } from '@tuyau/core/client'
import { QueryClient } from '@tanstack/react-query'
import { createTuyauReactQueryClient } from '@tuyau/react-query'

export const queryClient = new QueryClient()

export const client = createTuyau({ baseUrl: import.meta.env.VITE_API_URL, registry })
export const api = createTuyauReactQueryClient({ client })
```

Example 3 (json):
```json
const postsQuery = useQuery(
  api.posts.index.queryOptions(
    {},
    {
      retry: 3, // TanStack Query handles retries
    }
  )
)
```

Example 4 (javascript):
```javascript
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/client'

export default function PostsList() {
  /**
   * Call the 'posts.index' route using its route name.
   * The queryOptions() method generates the query function,
   * query key, and all type information automatically.
   */
  const postsQuery = useQuery(
    api.posts.index.queryOptions()
  )

  if (postsQuery.isLoading) return <div>Loading...</div>
  if (postsQuery.isError) return <div>Error loading posts</div>

  return (
    <div>
      {postsQuery.data?.posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

---

## Drive - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/drive

**Contents:**
- Drive
- Overview
- Installation
- Configuration
  - Local filesystem
  - Amazon S3
  - Google Cloud Storage
  - Cloudflare R2
  - DigitalOcean Spaces
  - Supabase Storage

This guide covers file storage management in AdonisJS using Drive. You will learn how to:

AdonisJS Drive is a wrapper on top of FlyDrive (created and maintained by the AdonisJS core team). It provides a unified API for managing user-uploaded files across multiple storage providers, including the local filesystem, Amazon S3, Google Cloud Storage, Cloudflare R2, DigitalOcean Spaces, and Supabase Storage.

The key benefit of Drive is that you can switch between storage services without changing your application code. During development, you might store files on the local filesystem for convenience. In production, you switch to a cloud provider by changing an environment variable. Your controllers, services, and templates remain unchanged.

Drive handles file storage operations like reading, writing, and deleting files. It does not handle HTTP multipart parsing. You should read the file uploads guide first to understand how AdonisJS processes uploaded files from HTTP requests.

Install and configure the @adonisjs/drive package using the following command:

The command prompts you to select one or more storage services.

The node ace add command requires interactive service selection. If you need to install Drive non-interactively (for example, in CI scripts), you can perform the steps manually:

The configuration for Drive is stored in config/drive.ts. The file contents depend on which services you selected during installation.

The default property in the config file determines which service is used when you don't explicitly specify one. The DRIVE_DISK environment variable controls this, allowing you to use fs locally and switch to s3 in production.

The local filesystem driver stores files on your server's disk and can serve them via the AdonisJS HTTP server.

When serveFiles is enabled, you can verify the route is registered by running node ace list:routes. You should see a route like /uploads/* with the handler drive.fs.serve.

The GCS_KEY variable points to a JSON key file for your Google Cloud service account. The file:// prefix indicates the path is relative to your application root.

Cloudflare R2 uses the S3-compatible API. The region must be set to 'auto'.

DigitalOcean Spaces uses the S3-compatible API with a custom endpoint.

Supabase Storage uses the S3-compatible API.

Drive extends the AdonisJS MultipartFile class and adds the moveToDisk method. This method moves an uploaded file from its temporary location to your configured storage service.

The following example shows a complete flow for uploading and displaying a user avatar.

Create routes for displaying the profile page and handling avatar uploads.

The controller handles the file upload using moveToDisk. Generate a unique filename using a UUID to avoid collisions when multiple users upload files with the same name.

The template displays the current avatar using the driveUrl helper and provides a form for uploading a new one.

The driveUrl Edge helper generates the public URL for a file. For the local filesystem, this returns a path like /uploads/abc-123.jpg. For cloud providers, it returns the full URL to the file.

By default, moveToDisk uses the disk specified in the DRIVE_DISK environment variable. You can explicitly specify a different disk as the second argument:

The moveToDisk method is different from the move method. The move method moves files within the local filesystem only. The moveToDisk method moves files to your configured Drive storage service, which could be local or cloud-based.

For operations beyond file uploads, you can use the Drive service directly. Import it from @adonisjs/drive/services/main to read files, write files, delete files, and more.

The Drive service provides many more methods for file operations. See the FlyDrive Disk API documentation for the complete list of available methods.

Drive provides two methods for generating file URLs: getUrl for public files and getSignedUrl for private files.

Use getUrl to generate URLs for files with public visibility. Anyone with the URL can access these files.

In Edge templates, use the driveUrl helper:

Use getSignedUrl to generate temporary URLs for files with private visibility. These URLs expire after a specified duration.

Signed URLs are useful when you want to control access to files. For example, you might store invoices with private visibility and generate a signed URL only when an authorized user requests to download one.

In Edge templates, use the driveSignedUrl helper:

Direct uploads allow the browser to upload files directly to your cloud storage provider, bypassing your AdonisJS server. This is useful for large files because the data doesn't flow through your server, reducing memory usage and bandwidth costs.

The flow works as follows:

Create routes for generating signed upload URLs and handling upload completion.

The controller generates signed upload URLs using getSignedUploadUrl and handles upload completion notifications.

On the frontend, request a signed URL and then upload the file directly to the cloud provider.

Drive provides a fakes API for testing file uploads without interacting with real storage. When you fake a disk, all operations are redirected to a temporary local directory instead of the configured storage service.

AdonisJS uses magic byte detection to determine file types, not the filename or content type you pass. A plain Buffer.from('fake-image') has no valid magic bytes, so VineJS file validation will reject it with "Invalid file extension undefined". Use the @poppinss/file-generator package (included in AdonisJS projects) to generate buffers with correct magic bytes for your tests.

You can also fake a specific disk:

Some cloud storage providers have issues with streaming uploads. If your files are corrupted after upload, try using the moveAs: 'buffer' option to read the file into memory before uploading:

This reads the entire file into memory before sending it to the storage provider, which can resolve compatibility issues with certain providers.

Drive supports two visibility levels:

The visibility is set at the disk level in your configuration. All files uploaded to that disk inherit the visibility setting unless overridden.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/drive
```

Example 2 (typescript):
```typescript
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

Example 3 (sass):
```sass
DRIVE_DISK=fs
```

Example 4 (sql):
```sql
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

---

## Server-Sent Events - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/server-sent-events

**Contents:**
- Transmit
- Overview
- Installation
- Configuration
- Registering routes
  - Applying middleware to routes
- Broadcasting events
  - Excluding specific clients
- Channels
  - Authorizing channels

This guide covers real-time server-to-client communication with Transmit in AdonisJS. You will learn how to:

Transmit is a native Server-Sent Events (SSE) module for AdonisJS. It provides a unidirectional communication channel from server to client, allowing you to push real-time updates without the overhead of WebSockets. Because SSE uses standard HTTP, it works through firewalls and proxies that might block WebSocket connections.

Transmit works as a publish/subscribe system built around channels. The server broadcasts messages to named channels, and clients subscribe to the channels they care about. You can protect channels with authorization callbacks to control who receives updates, making it suitable for both public broadcasts and private, user-specific notifications.

For client-to-server communication, you continue to use standard HTTP requests. Transmit only handles the server-to-client push.

Install and configure the server-side package using the following command:

Installs the @adonisjs/transmit package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/transmit.ts file.

Also install the client library in your frontend application:

The configuration file lives at config/transmit.ts. It controls keep-alive behavior and multi-instance synchronization.

See also: Config stub

Controls how often ping messages are sent to keep SSE connections alive. Accepts a number in milliseconds, a duration string like '30s' or '1m', or false to disable pings.

Configures the transport layer for synchronizing events across multiple server instances. Set to null for single-instance deployments.

See Multi-instance synchronization for configuration details.

Transmit requires three HTTP routes to handle client connections, subscriptions, and unsubscriptions. Register them in your routes file using the registerRoutes method.

This registers the following routes:

The registerRoutes method accepts an optional callback to modify each registered route. This is useful for applying middleware, such as requiring authentication for the SSE connection.

You can apply middleware conditionally based on the route pattern.

Import the transmit service and call the broadcast method to send data to all subscribers of a channel.

Use broadcastExcept to send a message to all subscribers except one or more specific clients. This is useful when the sender should not receive their own message.

The third argument accepts a single UID string or an array of UIDs to exclude.

Channel names are case-sensitive strings that support alphanumeric characters and forward slashes. Use forward slashes to create hierarchical structures that match your application's resources.

By default, any client can subscribe to any channel. Use the authorize method to restrict access to sensitive channels. Create a start/transmit.ts preload file to define your authorization rules.

Authorization callbacks receive the current HttpContext and the extracted channel parameters. Return true to allow access or false to deny it.

Channel patterns use the same parameter syntax as AdonisJS routes. Parameters are extracted from the channel name at subscription time and passed to the authorization callback.

Authorization callbacks support both synchronous and asynchronous logic. If the callback throws an error, access is denied.

Channels without an authorize callback are public. Any client can subscribe to them. Only register authorization for channels that require access control.

Create a new Transmit instance with the URL of your AdonisJS server. The client automatically establishes an SSE connection when instantiated.

Use the subscription method to create a subscription, then call create to activate it. Register message handlers with onMessage.

You can register multiple message handlers on a single subscription. Each handler receives the parsed payload from the server.

The onMessage method returns an unsubscribe function to stop a specific handler from receiving messages.

Call delete to unsubscribe from a channel entirely.

The client tracks its connection status and exposes events you can listen to.

The available status events are initializing, connected, disconnected, and reconnecting.

The URL of your AdonisJS server, including the protocol. This is the only required option.

Maximum number of reconnection attempts when the connection drops. Defaults to 5.

Custom function to generate the client's unique identifier. Defaults to crypto.randomUUID().

Hook called before each subscribe request. Use it to modify the request, such as adding custom headers.

Hook called before each unsubscribe request. Works the same as beforeSubscribe.

Callback invoked on each reconnection attempt. Receives the current attempt number.

Callback invoked when the maximum number of reconnection attempts is reached and the client stops trying.

Callback invoked when a subscribe request fails. Receives the Response object from the failed request.

Callback invoked when a subscription is successfully created.

Callback invoked when a subscription is successfully deleted.

Custom factory for creating the EventSource instance. Useful for environments where the native EventSource is not available.

Custom factory for creating the EventTarget used for status change events. Return null to disable status events.

Custom factory for creating the HTTP client used for subscribe and unsubscribe requests.

The server-side transmit instance emits lifecycle events you can listen to for monitoring and debugging.

The connect, disconnect, subscribe, and unsubscribe event callbacks also receive a context property containing the HttpContext of the request.

Use the getSubscribersFor method to retrieve the UIDs of all clients currently subscribed to a channel.

When running multiple server instances behind a load balancer, events broadcast on one instance will not reach clients connected to other instances. Transmit solves this with a transport layer that synchronizes events across all instances using a message bus.

Install the ioredis package and configure the Redis transport.

The transport broadcasts events to all connected instances through the configured message bus. The default broadcast channel is 'transmit::broadcast'. You can customize it if needed.

Server-Sent Events require that the response stream is not compressed. If your reverse proxy applies GZip compression, you must exclude the text/event-stream content type. Compressed SSE streams cause connection instability and message buffering.

You must disable compression for the text/event-stream content type in your reverse proxy. Failing to do so will cause SSE connections to break or buffer messages indefinitely.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/transmit
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/transmit/transmit_provider')
  ]
}
```

Example 3 (elixir):
```elixir
npm install @adonisjs/transmit-client
```

Example 4 (sql):
```sql
import { defineConfig } from '@adonisjs/transmit'

export default defineConfig({
  pingInterval: false,
  transport: null,
})
```

---

## Dependency injection - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/dependency-injection

**Contents:**
- Dependency injection and the IoC container
- Overview
- Your first dependency injection
    - Create the service
    - Inject the service into a controller
    - Register the route
- Method injection
- What can be injected?
  - The import type pitfall
- Which classes support dependency injection

This guide covers dependency injection and the IoC container in AdonisJS. You will learn:

Dependency injection is a design pattern that eliminates the need to manually create and manage class dependencies. Instead of creating dependencies inside a class, you declare them as constructor parameters or method parameters, and the IoC container resolves them automatically.

AdonisJS includes a powerful IoC (Inversion of Control) container that handles dependency injection throughout your application. When you type-hint a class as a dependency, the container automatically creates an instance of that class and injects it where needed.

The IoC container is already integrated into core parts of AdonisJS including controllers, middleware, event listeners, and Ace commands. This means you can type-hint dependencies in these classes and they'll be resolved automatically when the framework constructs them.

AdonisJS uses TypeScript's experimentalDecorators and emitDecoratorMetadata compiler options to enable dependency injection. These are pre-configured in the tsconfig.json file of new AdonisJS projects.

Let's start with a practical example. We'll create an AvatarService that generates Gravatar URLs for users, then inject it into a controller.

First, create a service class that will be injected. This service generates Gravatar avatar URLs based on user email addresses.

Next, create a controller that uses the AvatarService. The @inject() decorator tells the container to automatically resolve and inject the service.

Finally, connect your controller to a route. When you visit this endpoint, AdonisJS automatically constructs the controller using the container.

The @inject() decorator is required on the controller class. Without it, the container won't know to resolve dependencies. The decorator uses TypeScript's reflection capabilities to detect constructor dependencies at runtime.

Method injection works similarly to constructor injection, but instead of resolving dependencies for the entire class, the container resolves dependencies for a specific method. This is useful when only one method needs a particular dependency, or when you want to keep the class constructor simple.

The @inject() decorator must be placed before the method when using method injection.

Notice that HttpContext is always the first parameter for controller methods, followed by any dependencies you want to inject. The container automatically distinguishes between the HTTP context and injectable dependencies.

You can type-hint and inject only classes inside other classes. Since TypeScript types and interfaces are removed at compile time and are not visible to the runtime code, there is no way for the container to resolve them.

If a class has other dependencies like configuration objects that cannot be auto-resolved, you must register the class as a binding within the container. We'll cover bindings later in this guide.

A common issue that causes dependency injection to fail silently is when classes are accidentally imported using TypeScript's import type syntax. This happens frequently because code editors with auto-import features often default to importing classes as types.

When you use import type, TypeScript strips the import entirely during compilation. The container has no class constructor to resolve at runtime, so your dependency becomes undefined.

The following classes are automatically constructed by the container, allowing you to use constructor injection and, in some cases, method injection.

For any other classes you create, you'll need to use the container manually to construct them, which we'll cover in the next section.

While AdonisJS automatically constructs controllers, middleware, and other framework classes using the container, you may need to manually construct your own classes in certain scenarios. For example, if you're implementing a queue system and want each job class to benefit from dependency injection, you'll need to use the container's API directly.

The container.make method accepts a class constructor and returns an instance of it, automatically resolving all constructor dependencies marked with @inject().

Let's demonstrate this with a queue job scenario. We'll create two services:

The container instance is available throughout your AdonisJS application via the app service.

The container recursively resolves the entire dependency tree. If UserService had dependencies, and those dependencies had their own dependencies, the container would resolve them all automatically.

You can perform method injection on any class method using the container.call method. This is useful when you want dependencies injected into a specific method rather than the entire class.

The container.call method accepts the class instance, the method name, and an array of runtime values. Runtime values are passed as the initial parameters, followed by any auto-resolved dependencies.

Bindings are the mechanism you use when classes require dependencies that cannot be auto-resolved with the @inject() decorator. For example, when a class needs a configuration object or a primitive value alongside its class dependencies.

When a binding exists for a class, the container disables its auto-resolution logic and uses your factory function to create instances instead.

Bindings must be registered in the register method of a Service Provider. You can create a new provider using the node ace make:provider command.

Let's create a Cache class that requires both a RedisConnection and a configuration object. Since we're registering this class as a binding, there's no need to use the @inject decorator. The container will use our factory function instead.

Create a provider and register the binding in its register method. The factory function receives a resolver that can create instances of other classes.

The container uses your factory function from the binding instead of trying to auto-resolve dependencies.

Bindings give you complete control over how a class is constructed. The factory function receives a resolver that you can use to create other dependencies, allowing you to build complex dependency trees with custom logic.

Singletons are bindings that are constructed only once and then cached. Multiple calls to container.make for a singleton will return the same instance. This is useful for services that should be shared across your application, like database connections or caching layers.

Now every call to app.container.make(Cache) returns the exact same Cache instance, making it efficient and ensuring shared state when needed.

Aliases provide alternate string-based names for bindings, allowing you to request dependencies using descriptive names instead of class constructors.

To create an alias, register it using container.alias() and update the ContainerBindings interface using TypeScript module augmentation for type safety.

Now you can request the cache using the string alias. TypeScript will know that app.container.make('cache') returns a Cache instance, giving you full autocomplete and type checking.

Sometimes you already have an instance and want to register it directly with the container rather than providing a factory function. The bindValue method binds an existing value to a class constructor or alias, and the container returns that exact value whenever it's requested.

Unlike bind or singleton which accept factory functions, bindValue accepts the instance itself. This is useful when you need to register objects that were created outside the container, such as configuration objects parsed at startup or instances received from external libraries.

The bindValue method is also available on the request-scoped resolver, which is how request-specific instances like HttpContext and Logger are registered during HTTP requests. See Dependency injection during HTTP requests for an example.

The HttpContext object receives an isolated container resolver for each HTTP request. This allows you to register singleton instances that exist only for the duration of that specific request, which is useful for request-scoped services like loggers or user sessions.

These request-scoped bindings should be registered in the app/middleware/container_bindings_middleware.ts file, which is pre-created and automatically registered in new AdonisJS applications.

Throughout the current HTTP request, any classes that type-hint HttpContext or Logger as dependencies will receive the exact instances registered here. This ensures consistency and proper scoping for request-specific data.

Since TypeScript interfaces are removed at runtime, you cannot use them for type-hinting dependencies. However, you can use abstract classes to achieve the same polymorphic behavior. This enables you to implement the Adapter design pattern, where multiple implementations conform to a common contract.

Let's build a payment system that can work with different payment providers while keeping your business logic provider-agnostic.

First, create an abstract class that defines the contract all payment providers must implement. This acts as your interface but remains available at runtime for the container to use as an injection token.

Now create concrete implementations for different payment providers. Each provider implements the abstract class's methods with their specific logic, but they all conform to the same contract.

Notice that both implementations follow the exact same contract. Your application code can depend on PaymentService without knowing which specific provider is being used.

Register a binding that tells the container which concrete implementation to inject when someone requests the abstract PaymentService. This is where you decide whether your application uses Stripe, PayPal, or any other provider.

Now your business logic can depend on the abstract PaymentService without being coupled to any specific provider.

The power of this pattern is in its flexibility. To switch from Stripe to PayPal, you only need to change the binding in AppProvider from new StripeProvider() to new PaypalProvider(). Your controller and all other business logic remains completely unchanged. This separation makes your code more maintainable and testable.

Contextual dependencies allow you to inject different implementations of the same abstract class based on which class is requesting it. This is useful when different parts of your application need different configurations or implementations of the same service.

Building on the PaymentService example from the previous section, imagine you have different business requirements for different parts of your application. User subscriptions should process through Stripe (for recurring billing features), while one-time product purchases should go through PayPal (for broader payment method support).

Let's create two services that both need a PaymentService, but they should use different payment providers based on their specific business requirements.

Both services type-hint PaymentService, but they need different implementations. Without contextual dependencies, you could only bind one provider globally, forcing both services to use the same implementation.

Register contextual dependencies in a Service Provider using the when().asksFor().provide() API. This tells the container when a specific class asks for a dependency, provide a particular implementation.

Now SubscriptionService automatically receives StripeProvider when it's constructed, while OrderService receives PaypalProvider, all through the same PaymentService type hint. This keeps your service code clean and focused on business logic while giving you fine-grained control over which dependencies are injected based on context.

The contextual binding pattern is particularly powerful when combined with the adapter pattern from the previous section. Each service remains completely agnostic about which payment provider it's using, yet each gets exactly the implementation it needs for its specific use case.

When the container resolves a dependency, it checks multiple sources in a specific order. Understanding this priority helps you predict which implementation will be injected and debug unexpected behavior.

The container resolves dependencies in this order, stopping at the first match:

Swaps have the highest priority because they're designed for testing. When you swap a dependency, you want the fake implementation to be used regardless of any other bindings. This ensures your tests remain isolated and predictable.

Contextual bindings come next because they represent intentional, context-specific overrides. When you explicitly say "when ClassA asks for ServiceB, provide this specific implementation," that intent should override general bindings.

If no swap or contextual binding matches, the container checks for values bound to the current resolver scope. During HTTP requests, the HttpContext and request-scoped Logger are bound this way, ensuring each request gets its own instances.

Container-level values and bindings are checked next. These are your application-wide singletons and factories registered in service providers.

Finally, if no binding exists at all, the container attempts auto-construction. It uses TypeScript's reflection metadata to identify constructor dependencies marked with @inject() and recursively resolves them.

This priority order means you can layer your dependency configuration: define general bindings in providers, override them contextually for specific classes, and swap them entirely during tests—all without modifying the original code.

The container provides a straightforward API for swapping dependencies with fake implementations during tests. This allows you to test your code in isolation without hitting real external services.

The container.swap method replaces a binding with a temporary implementation, and container.restore reverts it back to the original. During the swap, any part of your codebase that type-hints the swapped class will receive the fake implementation instead.

Swapping is particularly valuable when testing code that depends on external APIs, payment gateways, email services, or any other resource you don't want to interact with during automated tests. The fake implementation can simulate various scenarios (success, failure, edge cases) without requiring real infrastructure.

The container emits events when it resolves bindings, allowing you to observe and react to dependency resolution. This can be useful for debugging, monitoring, or implementing cross-cutting concerns.

The container emits a single event type: container_binding:resolved. This event is triggered every time the container successfully resolves a class instance, whether through auto-resolution, bindings, or singletons.

You can listen to this event using the application's event emitter.

The event object provides two properties. First, event.binding contains the binding key (either a class constructor or string alias) that was resolved. Second, event.value contains the actual instance that the container created and returned.

This event is fired for every resolution, including nested dependencies. For example, if the container resolves UserService, which depends on LoggerService, you'll receive two events: one for LoggerService and one for UserService.

**Examples:**

Example 1 (php):
```php
import User from '#models/user'
import { createHash } from 'node:crypto'

export class AvatarService {
  protected getGravatarAvatar(user: User) {
    const emailHash = createHash('md5').update(user.email).digest('hex')
    const url = new URL(emailHash, 'https://gravatar.com/avatar/')

    url.searchParams.set('size', '200')
    return url.toString()
  }

  getAvatarFor(user: User) {
    return this.getGravatarAvatar(user)
  }
}
```

Example 2 (elixir):
```elixir
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AvatarService } from '#services/avatar_service'
import User from '#models/user'

@inject()
export default class UsersController {
  /**
   * The AvatarService is automatically injected by the container
   * when this controller is constructed
   */
  constructor(protected avatarService: AvatarService) {}

  async store({ request }: HttpContext) {
    /**
     * Create a new user (simplified for demonstration)
     */
    const user = await User.create(request.only(['email', 'username']))
    
    /**
     * Use the injected service to generate and save the avatar URL
     */
    const avatarUrl = this.avatarService.getAvatarFor(user)
    user.avatarUrl = avatarUrl
    await user.save()
    
    return user
  }
}
```

Example 3 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.post('/users', [controllers.Users, 'store'])
```

Example 4 (elixir):
```elixir
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { AvatarService } from '#services/avatar_service'
import User from '#models/user'

export default class UsersController {
  /**
   * The @inject decorator on the method tells the container
   * to resolve the avatarService parameter automatically
   */
  @inject()
  async store({ request }: HttpContext, avatarService: AvatarService) {
    const user = await User.create(request.only(['email', 'username']))
    
    /**
     * Use the injected service directly as a method parameter
     */
    const avatarUrl = avatarService.getAvatarFor(user)
    user.avatarUrl = avatarUrl
    await user.save()
    
    return user
  }
}
```

---

## Command flags - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/flags

**Contents:**
- Command flags
- Overview
- Defining boolean flags
  - Negating boolean flags
- Defining string flags
- Defining number flags
- Defining array flags
- Customizing flag names and descriptions
- Creating flag aliases
- Setting default values

This guide covers defining command flags within custom commands. You will learn about the following topics:

Flags provide a way to accept optional or named parameters without requiring a specific order. They are specified with either two hyphens (--) for full names or a single hyphen (-) for aliases.

In the following command, both --resource and --singular are flags.

Unlike positional arguments, flags can appear anywhere in the command and can be omitted entirely if they're optional. This makes flags ideal for options that customize command behavior, such as enabling features, specifying output formats, or providing configuration values.

Ace supports multiple flag types including boolean flags for on/off options, string flags for text values, number flags for numeric input, and array flags for multiple values.

Boolean flags represent on/off or yes/no options. They are the simplest flag type and don't require a value - simply mentioning the flag sets it to true.

Use the @flags.boolean decorator to define a boolean flag.

When users mention the flag, its value becomes true. If they omit the flag, its value is undefined.

Boolean flags support negation using the --no- prefix, allowing users to explicitly set a flag to false. This is useful when a flag has a default value of true and users need to disable it.

By default, the negated variant is not shown in help screens to keep output concise. You can display it using the showNegatedVariantInHelp option.

String flags accept text values that users provide after the flag name. Use the @flags.string decorator to define string flags.

Users provide the value after the flag name, separated by a space or equals sign.

If the flag value contains spaces or special characters, users must wrap it in quotes.

Ace will display an error if users mention the flag but don't provide a value, even when the flag is optional.

Number flags are similar to string flags but Ace validates that the provided value is a valid number. This ensures your command receives numeric input rather than arbitrary text.

Use the @flags.number decorator to define number flags.

Users must provide a valid numeric value.

Array flags allow users to specify the same flag multiple times, collecting all values into an array. This is useful when a command needs to accept multiple items of the same type, such as file paths, tags, or permission groups.

Use the @flags.array decorator to define array flags.

Users can specify the flag multiple times to build up the array.

By default, Ace converts your property name to dashed-case for the flag name. For example, a property named startServer becomes --start-server. You can customize this using the flagName option.

Adding a description helps users understand the flag's purpose. The description appears in help screens when users run your command with the --help flag.

Flag aliases provide shorthand names for flags, making commands faster to type for frequently used options. Aliases use a single hyphen (-) and must be a single character.

Users can use either the full flag name or the alias.

Multiple single-character aliases can be combined after a single hyphen.

You can specify default values for flags using the default option. When users don't provide the flag, Ace uses the default value instead of undefined.

Default values ensure your command always has a value to work with, even when users don't specify the flag.

The parse method allows you to transform or validate flag values before they're assigned to your class property. This is useful for normalizing input, looking up configuration values, or performing validation.

The parse method receives the raw string value and must return the transformed value.

Now users can provide short connection names that get expanded to full connection strings.

You can also use the parse method to validate input and throw errors for invalid values.

You can access all flags provided by the user using the this.parsed.flags property. This returns an object containing all flag values as key-value pairs.

The unknownFlags property is particularly useful when you've enabled allowUnknownFlags in your command options and need to process or pass through flags that your command doesn't explicitly define.

**Examples:**

Example 1 (unknown):
```unknown
node ace make:controller users --resource --singular
```

Example 2 (gdscript):
```gdscript
import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class MakeControllerCommand extends BaseCommand {
  static commandName = 'make:controller'
  
  /**
   * Enable resource controller generation
   */
  @flags.boolean()
  declare resource: boolean

  /**
   * Create a singular resource controller
   */
  @flags.boolean()
  declare singular: boolean
  
  async run() {
    if (this.resource) {
      this.logger.info('Creating a resource controller')
    }
  }
}
```

Example 3 (markdown):
```markdown
node ace make:controller users --resource
# this.resource === true

node ace make:controller users
# this.resource === undefined
```

Example 4 (markdown):
```markdown
node ace make:controller users --no-resource
# this.resource === false
```

---

## Container services - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/container-services

**Contents:**
- Container Services
- Overview
- Understanding container services
- Using container services
- Using dependency injection instead
- Available services
- Creating your own services

This guide covers container services in AdonisJS. You will learn:

Container services are a convenience pattern in AdonisJS that simplifies how you access framework functionality. When you need to use features like routing, hashing, or logging, you can import a ready-to-use instance instead of manually constructing classes or interacting with the IoC container directly.

This pattern exists because many framework components require dependencies that the IoC container already knows how to provide. Rather than making you resolve these dependencies yourself in every file, AdonisJS packages expose pre-configured instances as standard ES module exports. You import them like any other module, and they work immediately.

Without container services, you have two options for using framework classes. You could import a class and construct it yourself, manually providing all its dependencies.

Alternatively, you could use the IoC container's make method to construct the class, letting the container handle dependency resolution.

Container services eliminate this ceremony by doing exactly what the second approach does, but packaging it as a convenient import. The service module uses the IoC container internally and exports the resolved instance.

When you import a service, you're getting a singleton instance that was constructed by the IoC container with all its dependencies properly injected. The service itself is just a thin wrapper that makes this instance available as a standard module export.

Container services are available automatically when you install AdonisJS packages. No configuration or registration is required. You simply import the service and use it.

Here's an example using the Drive service to upload a file to S3.

This approach is straightforward and requires no setup beyond importing the service. The Drive service is a singleton, so the same instance is shared across your entire application.

For applications that prefer dependency injection, you can inject the underlying class directly into your services or controllers. This approach makes your code more testable since dependencies can be easily mocked or stubbed.

Here's the same file upload functionality using constructor injection.

With dependency injection, the IoC container automatically resolves and injects the Disk instance. Your class declares what it needs, and the container provides it. This pattern is particularly valuable when writing business logic that needs to remain decoupled from framework specifics.

AdonisJS core and official packages expose the following container services. Each service corresponds to a container binding and provides access to the fully constructed class instance.

If you're building a package or want to expose your own container bindings as services, you can follow the same pattern that AdonisJS uses internally. A container service is simply a module that resolves a binding from the container and exports it.

You can view the complete implementation on GitHub to see how the Drive package creates its service.

The service waits for the application to boot, then resolves the binding from the container and exports it. This ensures all service providers have registered their bindings before the service attempts to resolve them.

**Examples:**

Example 1 (javascript):
```javascript
import { Router } from '@adonisjs/core/http'

export const router = new Router(/** Router dependencies */)
```

Example 2 (javascript):
```javascript
import app from '@adonisjs/core/services/app'
import { Router } from '@adonisjs/core/http'

export const router = await app.make(Router)
```

Example 3 (python):
```python
import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
```

Example 4 (sql):
```sql
import drive from '@adonisjs/drive/services/main'

export class PostsController {
  async store(post: Post, coverImage: File) {
    const coverImageName = 'random_name.jpg'

    /**
     * The drive service gives you direct access to the
     * DriveManager instance. Use it to select a disk
     * and perform file operations.
     */
    const disk = drive.use('s3')
    await disk.put(coverImageName, coverImage)
    
    post.coverImage = coverImageName
    await post.save()
  }
}
```

---

## Debugging - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/debugging

**Contents:**
- Debugging
- Overview
- VSCode debugger
  - Debugging Ace commands
- Node.js inspector
- Framework debug logs
- Edge template debugging
  - The @dump tag
  - The @dd tag
  - Setting up the dumper

This guide covers debugging techniques for AdonisJS applications. You will learn how to:

Debugging is an essential part of development, and AdonisJS supports multiple approaches depending on your needs. For quick checks, a simple console.log statement often suffices. For more complex issues, you can use VSCode's integrated debugger to set breakpoints, step through code, and inspect variables. When you need to understand what's happening inside the framework itself, debug logs provide visibility into AdonisJS internals.

Edge templates have their own debugging tools with @dump and @dd, which render variable contents directly in the browser. During development, the exception handler automatically displays detailed error pages with stack traces and request information when something goes wrong.

The VSCode debugger provides the most powerful debugging experience, allowing you to set breakpoints, step through code line by line, and inspect the call stack and variables. Use this approach when debugging complex issues that can't be resolved with simple log statements.

Create a .vscode/launch.json file in your project root with configurations for the dev server, test runner, and attach mode.

The Dev server configuration launches your application with HMR enabled, perfect for debugging HTTP request handling, middleware, and controllers. The Tests configuration runs your test suite in watch mode, allowing you to debug failing tests by setting breakpoints in your test files or application code.

The Attach Program configuration uses attach mode instead of launching a specific command. This lets you debug any Ace command by starting it with the --inspect flag and then attaching the debugger.

To debug an Ace command:

The debugger will attach to the running process, and your breakpoints will be hit.

If you're not using VSCode or prefer a different debugging interface, you can use the Node.js inspector directly. Start your dev server with the --inspect flag.

This starts the Node.js inspector on port 9229. You can then connect using Chrome DevTools by navigating to chrome://inspect in Chrome, or use any other debugger that supports the Node.js inspector protocol.

AdonisJS packages include debug logs that provide visibility into framework internals. These logs are disabled by default because they're verbose, but they're invaluable when you need to understand what's happening at the framework level.

Enable debug logs by setting the NODE_DEBUG environment variable when starting your application.

The wildcard * enables logs from all AdonisJS packages. If you already know which package you're investigating, specify it directly to reduce noise.

Package names follow the convention adonisjs:<package-name>, where the package name corresponds to the AdonisJS package you want to debug.

When working with Edge templates, you can inspect variables directly in the browser using @dump and @dd. These tags render a formatted representation of any value, making it easy to understand what data your templates are receiving.

The @dump tag outputs a formatted representation of a value and continues rendering the rest of the template:

The @dd tag (dump and die) stops template rendering immediately and displays only the dumped value. Use this when you want to focus on a specific value without the rest of the page's output:

The @dump and @dd tags require the dumper's frontend assets to be loaded. Add the @stack('dumper') directive to your layout's <head> section.

Official AdonisJS starter kits include this setup by default.

You can customize how the dumper formats output by exporting a dumper configuration from config/app.ts.

The following options are available for both console and html printers.

Include non-enumerable properties

Maximum depth for nested structures (objects, arrays, maps, sets)

Include prototype properties. Set to true for all objects, false for none, or 'unless-plain-object' for class instances only.

Include array prototype properties

Include static members of classes

Maximum items to display for arrays, maps, and sets

Maximum characters to display for strings

Array of constructor names that should not be expanded further

During development, AdonisJS displays detailed error pages powered by Youch when an unhandled exception occurs. These pages include the full stack trace, request information, and application state, making it easy to diagnose issues.

Debug mode is enabled automatically in development and disabled in production. This behavior is controlled by the exception handler configuration.

**Examples:**

Example 1 (json):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Dev server",
      "program": "${workspaceFolder}/ace.js",
      "args": ["serve", "--hmr"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Tests",
      "program": "${workspaceFolder}/ace.js",
      "args": ["test", "--watch"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach Program",
      "port": 9229,
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Example 2 (unknown):
```unknown
node --inspect ace migration:run
```

Example 3 (unknown):
```unknown
node ace --inspect serve --hmr
```

Example 4 (sass):
```sass
NODE_DEBUG=adonisjs:* node ace serve --hmr
```

---

## Routing - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/routing

**Contents:**
- Routing
- Overview
- Basic example
  - Using a controller as a route handler
- Viewing registered routes
- Route params
  - Basic route params
  - Multiple route params
  - Optional route params
  - Wildcard route params

This guide covers routing in AdonisJS applications. You will learn how to:

Routing connects incoming HTTP requests to specific handlers in your application. When a user visits URLs like /, /about, or /posts/1, the router examines the HTTP method and URL pattern, then executes the appropriate handler function. This is the foundation of how your application responds to web requests.

A route consists of three main components:

Routes can also include middleware for authentication, rate-limiting, or any logic that should run before the handler executes. Every HTTP request your application handles flows through the routing system, making it essential to understand how routes work and how to organize them effectively.

In AdonisJS, routes are defined inside the start/routes.ts file using the router service.

A route handler is the function that runs when a route matches. It receives the HTTP context and can return a string, an object, or call services to produce a response.

The following example shows static routes and a dynamic route using :id, which matches any value passed in that segment.

Instead of inline callbacks, you can delegate request handling to a controller method. Controllers help organize logic into dedicated classes and make handlers reusable across multiple routes.

See also: Controllers guide and HTTP Context documentation

You can view all routes registered by your application using the Ace CLI command below. This is helpful for debugging, verifying route names, or checking which middleware is attached to specific routes.

If you're using the official VSCode extension, routes are also visible directly from the VSCode activity bar, making it easy to navigate your application's endpoints.

Route params allow parts of the URL to be dynamic, capturing values from specific segments and making them available in your handler. Each param matches any value in that position and is accessible via ctx.params.

A basic route param is defined with a colon : followed by a name. The captured value can be accessed in your handler through the params object.

When someone visits /posts/42, the value 42 is captured and params.id equals "42" (as a string).

You can include more than one param in a single route. Each param must have a unique name and is separated by /.

This matches URLs like /posts/42/comments/7, capturing both values.

Sometimes, a parameter is not always required. You can mark it optional by appending ? to its name. Optional params must be the last segment in the route pattern.

This route matches both /posts and /posts/42.

A wildcard param captures all remaining segments of the URL as an array. It is defined using * and must appear last in the pattern.

When someone visits /docs/guides/sql/orm/query-builder, the wildcard captures ['sql', 'orm', 'query-builder'].

Use wildcard params for:

By default, route params accept any value and are always passed to your handler as strings. You can restrict which values are valid and automatically cast them to the correct type using the .where() method.

When a param fails validation, the router skips that route and continues searching for other matching routes. This allows you to have multiple routes with the same pattern but different validation rules.

Without validation, you need to manually check and convert params in every handler.

With param validation, the router handles this automatically before your handler runs.

Use param validation to:

The .where() method accepts an object with two properties: match for validation and cast for type conversion.

If someone visits /posts/abc, this route won't match because "abc" fails the regex test. The router continues searching for other routes, or returns 404 if none match.

For common patterns like numbers, UUIDs, and slugs, AdonisJS provides shorthand matchers that handle both validation and type casting.

You can apply matchers globally so every route inherits the same validation rules automatically. This is useful when most of your routes follow a convention, like using UUIDs for all IDs.

Global matchers are applied first, then route-specific matchers override them. This pattern helps maintain consistency while allowing exceptions where needed.

The router provides dedicated methods for each standard HTTP verb. Each method corresponds to a specific type of operation in RESTful applications.

To match all HTTP methods or specify custom verbs:

The .any() method is useful for endpoints that need to respond to any HTTP method, such as webhook receivers or catch-all debugging routes.

Middleware are functions that execute before your route handler, allowing you to run code like authentication checks, logging, rate limiting, or request transformation. Think of middleware as a series of checkpoints that requests pass through before reaching your main handler.

See also: Middleware guide

You can also attach inline middleware directly.

Each route can have a unique name that you can use to generate URLs or redirects without hardcoding paths. This keeps your URLs maintainable, if you change a route's path, all references automatically update when using the name.

Named routes are essential for:

You can provide unique names to routes using the .as method.

When using controllers, routes are automatically named after the controller+method name.

See also: URL builder

Route groups let you apply shared configuration to multiple routes at once, eliminating repetition and making your route file easier to maintain. Without groups, you'd need to repeat the same prefix, middleware, or naming convention on every individual route, creating duplication that becomes error-prone as your application grows.

Use route groups when you have multiple routes that share any of the following:

Prefixes are prepended to all routes inside a group. This is especially useful for API versioning, admin areas, or organizing related resources under a common path segment.

When routes inside a group have names, you can prefix their names as well. This creates organized route namespaces that make it clear which routes belong together.

Named route groups make URL generation clearer and help you avoid naming collisions between different sections of your application. For example, you might have both web.users.index and api.users.index routes that serve different purposes.

See also: URL builder

You can attach middleware at the group level. Group middleware executes before any route-level middleware, creating a pipeline where shared logic runs first, followed by route-specific logic.

See also: Middleware guide

Resource routes automatically generate all standard RESTful routes for a controller, eliminating the need to manually define each CRUD route. This is particularly valuable when building traditional web applications with full CRUD interfaces or RESTful APIs.

This single line generates all the following routes with correct HTTP methods, URL patterns, and route names following RESTful conventions.

See also: Resource driven controllers

Sometimes, you may want certain routes to respond only to a specific domain or subdomain. This is useful for multi-tenant applications, separate admin dashboards, or serving different content based on the hostname.

Use .domain() to group routes by hostname:

These routes only respond when the request comes to blog.adonisjs.com. Requests to other domains will not match these routes.

You can define dynamic segments in the domain name, just like route params. This is essential for multi-tenant applications where each customer gets their own subdomain.

Use domain-specific routing for:

When someone visits acme.adonisjs.com/users, subdomains.tenant equals "acme". When they visit bigcorp.adonisjs.com/users, it equals "bigcorp".

If a route's only purpose is to render a view without any logic, use router.on().render() for brevity. This eliminates the need for a controller when you're simply displaying a static or simple dynamic page.

The first argument is the view template name, and the optional second argument is data to pass to the view.

For Inertia.js apps, use the similar router.on().renderInertia() method to render Inertia pages directly from routes without a controller.

This renders the corresponding Vue, React, or Svelte component through Inertia with the provided props.

You can redirect one path to another using redirectToRoute() or redirectToPath(). This is useful for handling deprecated URLs, shortening URLs, or creating aliases.

If your route has dynamic params, you can forward them to the destination route or override them with specific values.

When someone visits /posts/42, they're redirected to the articles.show route with id: 42. When they visit /featured, they're redirected with id: 1.

Redirects can also include query strings via the qs option:

This redirects to /articles?limit=20&page=1.

You can access the currently matched route from the HTTP context via ctx.route. This is useful for debugging, auditing, logging, or implementing route-aware logic like breadcrumbs or active navigation.

To check if the current request matches a specific named route, use request.matchesRoute():

This is particularly useful in middleware or shared logic where you need different behavior based on the current route.

Routes are matched in the order you register them. When a request comes in, the router checks each route sequentially until it finds the first match, then stops searching and executes that route's handler.

This sequential matching means route order matters critically when patterns overlap. If you define a dynamic route before a static route with the same prefix, the dynamic route will capture requests intended for the static route.

Route order matters: Always define static routes before dynamic routes. When someone visits /posts/archived, a route pattern /posts/:id defined first will match with id = "archived" instead of letting the /posts/archived route handle it.

Here's what happens with incorrect ordering:

The correct approach is to define specific routes before dynamic ones:

Quick rule: Order your routes from most specific to least specific. Static segments always beat dynamic ones, so static routes must come first.

When no route matches an incoming request, AdonisJS raises an E_ROUTE_NOT_FOUND exception. You can catch this exception in your global exception handler to render a custom 404 page or return a structured JSON error.

See also: Exception handling guide

AdonisJS classes like Router, Route, and RouteGroup can be extended using macros or getters. This allows you to add custom methods that behave like native APIs, useful when building reusable packages or adding organization-specific conventions to your routing layer.

Read the Extending AdonisJS guide if you are new to the concept of macros and getters.

Add methods or properties directly to the Router class:

Extend individual route instances:

Extend resource routes:

Extend render shortcuts (router.on().render()):

Now that you understand routing, you can:

**Examples:**

Example 1 (javascript):
```javascript
import router from '@adonisjs/core/services/router'

router.get('/', () => 'Hello world from the home page.')

router.get('/about', () => 'This is the about page.')

router.get('/posts/:id', ({ params }) => {
  return `This is post with id ${params.id}`
})

router.post('/users', async ({ request }) => {
  const data = request.all()
  await createUser(data)
  return 'User created successfully'
})
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts/:id', [controllers.Posts, 'show'])
```

Example 3 (unknown):
```unknown
node ace list:routes
```

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', ({ params }) => {
  return `Showing post with id: ${params.id}`
})
```

---

## Inertia - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/inertia

**Contents:**
- Inertia
- Overview
- Rendering pages
- The inertia directory
- Configuration files
- Generated types
- Data loading patterns
  - Optional props
  - Always props
  - Deferred props

This guide covers using Inertia with AdonisJS to build single-page applications. You will learn how to:

Inertia acts as a bridge between AdonisJS and frontend frameworks like React and Vue. It eliminates the need for client-side routing or complex state management libraries by embracing a server-first architecture. You write controllers and routes exactly as you would in a traditional server-rendered application, but instead of returning HTML or JSON, you render Inertia pages that your frontend framework displays.

This approach gives you the best of both worlds: the simplicity of server-side routing and data fetching combined with the rich interactivity of React or Vue for the view layer. AdonisJS officially supports both frameworks through the Inertia starter kit.

See also: How Inertia works on the official Inertia documentation.

Controllers in an Inertia application work the same way as any AdonisJS controller. The difference is that instead of rendering Edge templates or returning JSON, you call inertia.render() to render a frontend component with props.

The controller receives the inertia object from the HTTP context and uses it to render a page component with data.

The page component receives the props and renders the UI. Rather than defining prop types manually, you can rely on auto-generated types from your transformers.

When the first request hits the server, Inertia renders a shell HTML page containing a div with the component name and serialized props. The frontend bundle uses this data to boot the React or Vue application. From that point on, all navigation happens via fetch requests that receive JSON responses, giving you the snappy feel of a SPA without building an API.

See also: Transformers for details on serializing model data for the frontend.

The inertia/ directory contains your frontend application. Here is the structure created by the starter kit:

The pages/ directory is where Inertia looks for components when you call inertia.render(). The path you pass (like posts/index) maps directly to a file in this directory (inertia/pages/posts/index.tsx).

The app.tsx (or app.vue) file is the entrypoint that boots your frontend application. It initializes Inertia with your page components and any global configuration. The ssr.tsx file serves the same purpose for server-side rendering.

You can create additional directories as your project grows, such as components/ for shared UI elements or hooks/ for custom React hooks.

Two configuration files control how Inertia works in your AdonisJS application.

The config/inertia.ts file defines the Inertia adapter settings, including SSR configuration and the page component resolver.

The resources/views/inertia_layout.edge template renders the initial HTML shell that contains the root div where your frontend application mounts.

The Data namespace imported in page components comes from auto-generated types stored at .adonisjs/client/data.d.ts. These types are created by an Assembler hook when you use transformers, ensuring your frontend props stay in sync with your backend serialization logic.

See also: Transformers for details on how types are generated.

Inertia provides several patterns for loading data efficiently. AdonisJS exposes helpers on the inertia object to support each pattern.

Optional props are only evaluated when the frontend explicitly requests them during a partial reload. This is useful for expensive queries that aren't needed on every page load.

See also: Partial reloads on the Inertia documentation.

The always helper ensures a prop is always included in responses, even during partial reloads that don't explicitly request it. This is the opposite of optional props.

Deferred props are loaded after the initial page render, allowing the page to display immediately while slower data loads in the background. The frontend shows a loading state until the deferred data arrives.

You can group deferred props so they load together in a single request.

See also: Deferred props on the Inertia documentation.

Mergeable props are merged with existing frontend data rather than replacing it. This is useful for infinite scrolling or appending new items to a list.

You can combine merging with deferred loading by chaining the merge() method.

By default, data is shallow merged. For nested objects that need recursive merging, use deepMerge() instead.

See also: Merging props on the Inertia documentation.

Inertia provides Link and Form components for navigation and form submissions. AdonisJS wraps these components with additional functionality that lets you reference routes by name instead of hardcoding URLs.

Import the components from the AdonisJS package rather than directly from Inertia.

The Link component creates navigation links using route names defined in your AdonisJS routes.

The Form component handles form submissions with automatic CSRF protection and error handling.

The Form component infers the HTTP method (POST, PUT, PATCH, DELETE) from the route name automatically. You do not need to pass a method prop — in fact, the AdonisJS wrapper omits method and action from the accepted props since both are derived from the route definition.

When validation fails on the server, AdonisJS automatically adds validation errors to the session flash messages. The Inertia middleware then shares these errors with the frontend, making them available through the errors object in your form.

Both Link and Form accept a routeParams prop for routes with dynamic segments. The keys in the object correspond to the parameter names defined in your route:

Pass the matching parameter values through routeParams:

TypeScript enforces that you provide all required parameters with the correct names. Missing or misspelled parameters are caught at compile time.

The Link and Form components use the route prop for type-safe navigation, but they don't accept query parameters directly. To add query parameters (for example, ?page=2), generate the URL with urlFor and pass it as the href prop instead:

When using href, you lose the type-safe route name checking that the route prop provides. Use route with routeParams for standard navigation and fall back to href with urlFor only when you need query parameters.

Shared data is available to every page in your application without explicitly passing it from each controller. This is useful for global data like the authenticated user, flash messages, or application settings.

The InertiaMiddleware defines what data is shared. This middleware is stored at app/middleware/inertia_middleware.ts and contains a share method that returns the shared data.

The share method may be called before the request passes through all middleware or reaches the controller. This happens when rendering error pages or aborting requests early. Always check that context properties exist before accessing them.

Shared data is automatically included in the props for every page. When you define page props using the InertiaProps type helper, it includes both your page-specific props and all shared data.

Pagination in Inertia applications requires coordination between the controller, transformer, and frontend component. Here is a complete example using a posts list.

Use a transformer's paginate method to serialize both the data and pagination metadata, then pass everything to inertia.render():

Type the paginated props using the Data namespace. The pagination metadata includes currentPage, lastPage, and other fields you can use to render controls:

The pagination links use urlFor with the qs option to generate URLs like /posts?page=2. See Transformers for details on the paginate method and the shape of the metadata object.

CSRF protection is automatically configured in the Inertia starter kit. The enableXsrfCookie option in config/shield.ts sets a cookie that Inertia reads and includes with every request. You don't need to manually add CSRF tokens to your forms.

See also: Shield for more details on CSRF protection.

Asset versioning tells the frontend when your JavaScript or CSS bundles have changed, triggering a full page reload instead of a partial update. This ensures users always run the latest version of your frontend code after a deployment.

By default, AdonisJS computes a hash of the .vite/manifest.json file (created when you build your frontend assets) and uses it as the version identifier.

You can define custom versioning logic by adding a version method to your Inertia middleware.

Server-side rendering (SSR) generates the initial HTML on the server, improving perceived performance and SEO. Enabling SSR requires configuration in both Vite and AdonisJS.

First, enable SSR in your Vite configuration. This tells Vite to create a separate SSR bundle using your ssr.tsx or ssr.vue entrypoint.

Then enable SSR in your AdonisJS configuration so the server knows to use the SSR bundle for rendering.

Understanding how requests flow through an Inertia application helps when debugging or extending the default behavior.

When a user first visits your application, the request follows this path:

For subsequent navigation (clicking links or submitting forms):

This architecture gives you the developer experience of a traditional server-rendered app with the user experience of a modern SPA.

**Examples:**

Example 1 (unknown):
```unknown
router.get('/posts', [controllers.Posts, 'index'])
```

Example 2 (csharp):
```csharp
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  async index({ inertia }: HttpContext) {
    const posts = await Post.all()

    /**
     * The first argument is the page component path relative to inertia/pages/.
     * The second argument is the props object passed to that component.
     */
    return inertia.render('posts/index', {
      posts: PostTransformer.transform(posts)
    })
  }
}
```

Example 3 (typescript):
```typescript
import { InertiaProps } from '~/types'
import { Data } from '~/generated/data'

type PageProps = InertiaProps<{ posts: Data.Post[] }>

export default function PostsIndex({ posts }: PageProps) {
  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
        </div>
      ))}
    </>
  )
}
```

Example 4 (vue):
```vue
<script setup lang="ts">
import { Data } from '~/generated/data'

defineProps<{ posts: Data.Post[] }>()
</script>

<template>
  <div v-for="post in posts" :key="post.id">
    <h2>{{ post.title }}</h2>
  </div>
</template>
```

---

## OpenTelemetry - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/opentelemetry

**Contents:**
- OpenTelemetry
- Overview
- OpenTelemetry concepts
- Installation
- Configuration
  - Service identification
  - Exporters
  - Multiple destinations (fan-out)
  - Debug mode
  - Enabling and disabling

This guide covers OpenTelemetry integration in AdonisJS applications. You will learn how to:

OpenTelemetry is an open standard for collecting telemetry data from your applications: traces, metrics, and logs. The @adonisjs/otel package provides a seamless integration between AdonisJS and OpenTelemetry, giving you distributed tracing and automatic instrumentation with sensible defaults.

Observability is essential for understanding what happens inside your application, especially in production. When a user reports that "the checkout page is slow," tracing lets you see exactly where time is spent. Was it the database query? An external API call? A slow service? Without tracing, you're left guessing.

This package handles the complexity of OpenTelemetry setup for you. Run a single command, and your application automatically traces HTTP requests, database queries, Redis operations, and more.

Before diving into the implementation, you should understand a few core OpenTelemetry concepts. For a comprehensive introduction, see the official OpenTelemetry documentation.

A trace represents the complete journey of a request through your system. When a user hits your API, the trace captures everything that happens: the HTTP request, database queries, cache lookups, calls to external services, and the response.

A span is a single unit of work within a trace. Each database query, HTTP request, or function call can be a span. Spans have a start time, duration, name, and attributes (key-value metadata). Spans are nested hierarchically: a parent span for the HTTP request contains child spans for each database query made during that request.

Attributes are key-value pairs attached to spans that provide context. For example, an HTTP span might have attributes like http.method: GET, http.route: /users/:id, and http.status_code: 200.

Install and configure the package using the following command.

Installs the @adonisjs/otel package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Registers the following middleware inside the start/kernel.ts file.

Creates the config/otel.ts file.

Creates the bin/otel.ts file with OpenTelemetry initialization.

Adds the import statement at the top of bin/server.ts file.

Defines the following environment variables and their validation rules.

That's it. Your application now has automatic tracing for HTTP requests, database queries, and more.

The configuration file is located at config/otel.ts.

The package resolves service metadata from multiple sources.

The name of your service. This value is resolved from OTEL_SERVICE_NAME or APP_NAME environment variables.

The version of your service. This value is resolved from the APP_VERSION environment variable and defaults to 0.0.0.

The environment where your service is running. This value is resolved from the APP_ENV environment variable and defaults to development.

By default, the package exports traces using OTLP over gRPC to localhost:4317. This is the standard OpenTelemetry Collector endpoint. If you're running an OpenTelemetry Collector locally or in your infrastructure, traces will be sent there automatically.

You can configure the exporter endpoint using environment variables without changing any code.

For authentication or custom headers:

See the OpenTelemetry environment variable specification for all available options, and check Advanced configuration for even more customization.

When you need to export telemetry to multiple backends at once, use the destinations option.

The package provides a generic OTLP destination helper via destinations.otlp(). Each destination can receive all signals (traces, metrics, logs) or only a subset.

When you set endpoint, the package automatically derives per-signal endpoints by appending:

You can also provide explicit endpoints per signal:

destinations is optional. If you do not define it, the package keeps the default OpenTelemetry behavior and environment variable configuration (OTEL_EXPORTER_OTLP_*, OTEL_TRACES_EXPORTER, OTEL_METRICS_EXPORTER, OTEL_LOGS_EXPORTER).

Enable debug mode to print spans to the console during development.

This adds a ConsoleSpanExporter that outputs spans to your terminal, helping you visualize traces without setting up a collector.

OpenTelemetry is automatically disabled when NODE_ENV === 'test' to avoid noise during tests. You can override this behavior.

In high-traffic production environments, tracing every single request generates enormous amounts of data. Sampling controls what percentage of traces are collected.

The sampler uses parent-based sampling, meaning child spans inherit the sampling decision from their parent. This ensures you always get complete traces rather than fragments.

See also: OpenTelemetry Sampling documentation

If you provide a custom sampler option, samplingRatio is ignored.

The package automatically instruments common libraries without any code changes. Out of the box, you get tracing for HTTP requests (incoming and outgoing), Lucid database queries (via Knex), and Redis operations.

To reduce noise, the following endpoints are excluded from tracing by default.

You can configure individual instrumentations or add custom ignored URLs.

Jaeger is a popular open-source distributed tracing platform that implements the OpenTelemetry standard. It provides a web UI for visualizing traces, making it perfect for local development.

Run Jaeger in a Docker container. The all-in-one image includes the collector, query service, and UI.

This command exposes:

Your AdonisJS application is already configured to send traces to localhost:4317 by default, so no additional configuration is needed.

Make requests to your application to generate traces. You can use curl, your browser, or any HTTP client.

Open the Jaeger UI at http://localhost:16686. You should see your service listed in the dropdown. Select your service and click "Find Traces" to see all captured traces.

Click on any trace to see the complete timeline of operations: the HTTP request, database queries, and any custom spans you've created.

Keep Jaeger running during development. It accumulates traces over time, making it easy to compare slow and fast requests or spot patterns in your application's behavior.

While automatic instrumentation covers most common operations, you'll often want to trace custom business logic. The package provides helpers and decorators for this purpose.

The record helper creates a span around a code section:

For class methods, decorators provide a cleaner syntax.

To automatically trace all methods of a class, use the @spanAll decorator.

Use setAttributes to add metadata to the currently active span without creating a new one.

Events are time-stamped annotations within a span. Use them to mark significant moments.

When your application calls other services or processes background jobs, you need to propagate the trace context so all operations appear in the same trace.

Inject trace context into outgoing HTTP request headers.

When dispatching background jobs, include the trace context.

In your queue worker, extract the context and continue the trace.

When @adonisjs/auth is installed, the middleware automatically sets user attributes on spans if a user is authenticated. This includes user.id, user.email (if available), and user.roles (if available).

You can customize this behavior or add additional user attributes.

You can also manually set user context anywhere in your code.

The package automatically injects trace context into Pino logs, adding trace_id and span_id to each log entry. This lets you correlate logs with traces in your observability platform.

When using pino-pretty for development, you can hide these fields for cleaner output.

To keep specific fields visible.

The defineConfig function accepts all options from the OpenTelemetry Node SDK, giving power users full control.

See the OpenTelemetry JS documentation for all available options.

OpenTelemetry adds some overhead to your application. The SDK needs to create span objects, record timing information, and export data to your collector. In most applications, this overhead is negligible, but you should be aware of it.

For high-traffic production environments, consider these recommendations:

Use sampling to reduce the volume of traces. A samplingRatio of 0.1 (10%) is often sufficient to identify issues while dramatically reducing overhead and storage costs.

Use batch processing (the default) rather than sending spans immediately. The BatchSpanProcessor queues spans and sends them in batches, reducing network overhead.

Be selective with custom spans. Automatic instrumentation covers most needs. Only add custom spans for business-critical operations where you need additional visibility. Don't over-instrument by using a @spanAll decorator on every single class.

See also: OpenTelemetry Sampling documentation

All helpers are available from @adonisjs/otel/helpers.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/otel
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/otel/otel_provider')
  ]
}
```

Example 3 (dart):
```dart
router.use([
  () => import('@adonisjs/otel/otel_middleware')
])
```

Example 4 (unknown):
```unknown
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=
```

---

## API tests - AdonisJS

**URL:** https://docs.adonisjs.com/guides/testing/api-tests

**Contents:**
- API tests
- Overview
- Configuration
- Writing your first test
- Cleaning up database state
- Making requests
  - Using route names
  - Using HTTP methods
- Sending request data
  - JSON data

This guide covers testing JSON API endpoints in AdonisJS applications. You will learn how to:

API testing in AdonisJS uses Japa's API client to make real HTTP requests against your application. Unlike mocked or simulated requests, the API client boots your AdonisJS server and sends actual network requests from outside in. This approach tests your entire HTTP layer—routes, middleware, controllers, and responses—exactly as they would behave in production.

The API client integrates with AdonisJS features like sessions and authentication through dedicated plugins, making it straightforward to test protected endpoints and stateful interactions.

The api starter kit comes pre-configured with three plugins in the tests/bootstrap.ts file.

When using sessions during tests, the session driver must be set to memory in your .env.test file. This is configured by default in the starter kit.

Let's test an account creation endpoint that validates input and creates a new user. We'll write two tests: one for validation errors and one for successful creation.

The route is defined in start/routes.ts.

The first test verifies that validation errors are returned when required fields are missing. The client.visit() method accepts a route name and automatically determines the HTTP method and URL pattern from your route definition.

The second test sends valid data and verifies the user was created. You can query the database directly in your tests to verify side effects.

Tests that create database records need cleanup between runs to ensure isolation. The testUtils.db().truncate() hook migrates the database and truncates all tables after each test.

See also: Database testing utilities for additional methods like migrations and seeders.

The API client provides two approaches for making HTTP requests: using route names or explicit HTTP methods.

The client.visit() method accepts a route name and looks up the HTTP method and URL pattern from your router. This keeps your tests in sync with route changes and also provides type-safety within tests.

When you need to hit a specific URL directly, use the explicit HTTP method functions.

Use the json() method to send a JSON payload. The Content-Type header is set automatically.

Use the form() method to send URL-encoded form data.

Use the field() method to send multipart form fields.

You can set cookies on outgoing requests using the withCookie() method and its variants.

The withSession() method populates the session store before making a request. This is useful for testing flows that depend on existing session state.

The loginAs() method authenticates a user for the request using your default auth guard. You must create the user before making the authenticated request.

When using access tokens or a different auth guard, chain the withGuard() method before loginAs() to specify which guard to use.

Make sure your route middleware allows authentication using the specified guard.

Chain the dump() method when building a request to log the request details before it's sent.

The response object provides methods to inspect what was returned.

Use hasFatalError() to check if the server returned a 500-level error.

The response object provides assertion methods for validating status codes, body content, headers, cookies, and session data.

See also: Japa API Client documentation

**Examples:**

Example 1 (python):
```python
import { apiClient } from '@japa/api-client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import type { Registry } from '../.adonisjs/client/registry/schema.d.ts'

declare module '@japa/api-client/types' {
  interface RoutesRegistry extends Registry {}
}

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  /**
   * Configures Japa's API client for making HTTP requests
   */
  apiClient(),
  /**
   * Adds support for reading/writing session data during requests
   */
  sessionApiClient(app),
  /**
   * Adds support for authenticating users during requests
   */
  authApiClient(app),
]
```

Example 2 (sass):
```sass
SESSION_DRIVER=memory
```

Example 3 (unknown):
```unknown
router.post('signup', [controllers.NewAccount, 'store'])
```

Example 4 (javascript):
```javascript
import { test } from '@japa/runner'

test.group('Auth signup', () => {
  test('return error when required fields are not provided', async ({ client }) => {
    /**
     * Make a POST request to the signup route.
     * Since no data is sent, validation should fail.
     */
    const response = await client.visit('new_account.store')

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'fullName',
          message: 'The fullName field must be defined',
          rule: 'required',
        },
        {
          field: 'email',
          message: 'The email field must be defined',
          rule: 'required',
        },
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
        {
          field: 'passwordConfirmation',
          message: 'The passwordConfirmation field must be defined',
          rule: 'required',
        },
      ],
    })
  })
})
```

---

## Social authentication - AdonisJS

**URL:** https://docs.adonisjs.com/guides/auth/social-authentication

**Contents:**
- Social authentication
- Overview
- Installation
- Configuration
  - Registering callback URLs with providers
- Redirecting users to the provider
  - Requesting scopes
  - Adding query parameters
- Handling the callback
- User properties

This guide covers social authentication in AdonisJS using the Ally package. You will learn:

Social authentication allows users to log in using their existing accounts from services like GitHub, Google, or Twitter. Instead of creating a new username and password, users authorize your application to access their profile information from the provider.

AdonisJS provides the @adonisjs/ally package for social authentication. Ally handles the OAuth flow (redirecting users, exchanging codes for tokens, fetching user data) and provides a consistent API across different providers. It supports OAuth 1.0 (Twitter) and OAuth 2.0 (most other providers).

Ally does not store users or tokens in your database. It handles the OAuth flow and returns user information, which you then use to create or find a user in your database and log them in using an auth guard.

Install and configure the package using the add command:

Installs the @adonisjs/ally package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates config/ally.ts with configuration for the selected providers.

Defines environment variables for CLIENT_ID and CLIENT_SECRET for each provider.

Configure your OAuth providers in config/ally.ts. Each provider requires a client ID, client secret, and callback URL:

OAuth providers require you to register your callback URL in their developer console. For example, to use GitHub authentication:

The callback URL in your config must exactly match what you register with the provider.

Create a route that redirects users to the OAuth provider. Use ally.use() to get the driver instance and call redirect():

Scopes define what data your application can access. Each provider has different available scopes. Configure them in config/ally.ts or during the redirect:

Some providers accept additional parameters. For example, Google's prompt parameter controls the consent screen behavior:

To remove a parameter set in the config, use clearParam:

After the user authorizes (or denies) access, the provider redirects them to your callback URL. Handle this redirect to complete authentication:

The user() method returns a normalized user object with consistent properties across all providers:

Providers handle email verification differently. Check emailVerificationState before trusting the email:

The token property contains the OAuth token for making additional API calls to the provider:

Access provider-specific data through the original property:

Ally provides user information but doesn't create users or sessions. After getting the user data from the provider, you need to:

For server-rendered applications, create a session after social authentication:

For APIs and mobile apps, issue an access token after social authentication:

By default, Ally uses a CSRF token stored in a cookie to prevent cross-site request forgery. If your application cannot use cookies (for example, a mobile app using a webview), enable stateless mode:

Both the redirect and callback must use stateless mode. Without the CSRF check, ensure your application has other protections against unauthorized OAuth flows.

If you already have an access token (for example, from a mobile app's native OAuth flow), fetch user information directly:

For OAuth 1 providers (Twitter), use userFromTokenAndSecret:

Handle multiple providers with a single route using route parameters:

Each provider accepts specific configuration options. The following examples show all available options for each built-in provider.

If you need to integrate with a provider not included in Ally, you can create a custom driver. AdonisJS provides a starter kit for building and publishing custom drivers. See the starter kit README for implementation details.

**Examples:**

Example 1 (sass):
```sass
node ace add @adonisjs/ally

# Specify providers during installation
node ace add @adonisjs/ally --providers=github --providers=google
```

Example 2 (lua):
```lua
{
      providers: [
        // ...other providers
        () => import('@adonisjs/ally/ally_provider')
      ]
    }
```

Example 3 (python):
```python
import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

export default defineConfig({
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:3333/github/callback',
  }),
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:3333/google/callback',
  }),
})
```

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'

router.get('/github/redirect', ({ ally }) => {
  return ally.use('github').redirect()
})
```

---

## Validation - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/validation

**Contents:**
- Validation
- Overview
- VineJS - The validation library
- Creating your first validator
    - Generate the validator file
    - Define your validation schema
    - Use the validator in your controller
- Understanding error handling
  - How content negotiation works
- Customizing error messages

This guide covers validation in AdonisJS using VineJS validators at the controller level. You will learn how to:

Validation in AdonisJS happens at the controller level, allowing you to validate and abort requests early if the provided data is invalid. This approach lets you model validations around forms or expected request data rather than coupling validations to your models layer.

Once data passes validation, you can trust it completely and pass it to other layers of your application (whether services, data models, or business logic) without additional checks. This creates a clear trust boundary in your application architecture.

AdonisJS comes pre-bundled with VineJS, a superfast validation library. While you can use a different validation library and uninstall VineJS, VineJS provides additional validation rules specifically designed for AdonisJS, such as checking for uniqueness within the database or validating multipart file uploads.

Validators in AdonisJS are stored in the app/validators directory, with one file per resource containing all validators for that resource's actions. Let's create a validator for blog posts.

Run the following command to create a new validator.

This creates an empty validator file at app/validators/post.ts with the VineJS import.

Add a validator for creating posts. We'll validate the title, body, and publishedAt fields.

Import the validator into your controller and use the request.validateUsing() method to validate the request body.

The request.validateUsing() method automatically validates the request body. You don't need to explicitly pass the body data (the request object already has access to it). If validation fails, an exception is thrown and handled automatically. The validated payload is returned and safe to use throughout your application.

When validation fails, the request.validateUsing() method throws an exception. You don't need to manually handle this exception. AdonisJS's global exception handler automatically converts it into an appropriate response based on the request type using content negotiation.

AdonisJS detects what kind of response the client expects and formats validation errors accordingly.

For hypermedia applications (traditional server-rendered apps)

For Inertia applications

For API requests (clients expecting JSON)

This automatic handling means you write validation logic once, and it works correctly for all application types without additional code.

You don't need to wrap validateUsing() in try/catch blocks. The global exception handler already converts validation exceptions into proper responses. Only use try/catch if you need custom error handling logic that differs from the default behavior.

By default, VineJS provides generic error messages. You can customize these messages globally in two ways. You can use a custom VineJS error messages provider, or you can use the i18n package for localized messages.

Create a start/validator.ts file to configure global custom messages. First, generate the preload file.

Then define your custom messages using the SimpleMessagesProvider.

The {{ field }} placeholder is automatically replaced with the actual field name. Field-specific messages (like username.required) take precedence over global messages.

For applications that need multiple languages, use the @adonisjs/i18n package to define validation messages in translation files. This allows you to provide validation errors in different languages based on the user's locale.

First, install and configure the i18n package (see the i18n guide for full setup instructions). Then define your messages in language-specific JSON files.

The fields object defines human-readable names for your form fields, while the messages object defines the error messages. This separation allows you to reuse field names across different messages.

While the request body is the most common data source to validate, you often need to validate other parts of the HTTP request, such as query strings, route parameters, headers, or cookies.

Define nested objects in your schema for each data source you want to validate.

The validator automatically extracts data from the correct location based on these property names (params, qs, cookies, headers).

When you call request.validateUsing(), all these sources are validated simultaneously.

This approach allows you to validate all incoming request data in one place, creating a complete trust boundary for your controller logic.

Sometimes validators need access to request-specific information that isn't part of the data being validated. A common example is validating email uniqueness while allowing the current user to keep their existing email.

Use the withMetaData() method to define what metadata your validator expects.

The withMetaData<T>() method accepts a TypeScript type defining the shape of your metadata. Inside validation rules, you can access this metadata via field.meta. In this example, the filter callback excludes the current user's row when checking for uniqueness.

Provide the metadata when calling validateUsing().

The validator uses the provided userId to exclude the user's own record from the uniqueness check. This pattern is useful whenever validation logic needs information from the current request context, such as the authenticated user, tenant ID, or other request-specific values.

Validators aren't limited to HTTP requests. You can use them anywhere you need to validate data, such as in background jobs, console commands, or service classes.

Call the validate() method directly on your compiled validator.

The validate() method returns the validated payload if successful, or throws an exception if validation fails. Unlike request.validateUsing(), you'll typically want to handle these exceptions yourself in non-HTTP contexts, as there's no automatic error response.

This approach ensures consistent validation logic across your entire application, whether handling HTTP requests, processing background jobs, or validating data in any other context.

Now that you understand validation in AdonisJS, you can:

**Examples:**

Example 1 (unknown):
```unknown
node ace make:validator post
```

Example 2 (python):
```python
import vine from '@vinejs/vine'
```

Example 3 (javascript):
```javascript
import vine from '@vinejs/vine'

export const createPostValidator = vine.create({
  title: vine.string(),
  body: vine.string(),
  publishedAt: vine.date()
})
```

Example 4 (elixir):
```elixir
import { createPostValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    
    // Now you can trust and use the payload
    // Create post, save to database, etc.
  }
}
```

---

## Exception handling - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/exception-handling

**Contents:**
- Exception Handling
- Overview
  - The global exception handler
  - How errors flow through the handler
  - Handling specific error types
  - Debug mode and Youch
  - Status pages
- Reporting errors
  - Adding context to error reports
  - Ignoring errors from reports

This guide covers exception handling in AdonisJS applications. You will learn how to:

Exception handling in AdonisJS provides a centralized system for managing errors during HTTP requests. Instead of wrapping every route handler and middleware in try/catch blocks, you let errors bubble up naturally to a global exception handler that converts them into appropriate HTTP responses.

This approach keeps your code clean while ensuring consistent error handling across your application.

When you create a new AdonisJS project, the global exception handler is created in app/exceptions/handler.ts. It extends the base ExceptionHandler class and provides two primary methods:

Here's what the default handler looks like:

The inline comments explain each property's purpose. We'll explore debug, renderStatusPages, and statusPages in detail later in this guide.

When an error occurs during an HTTP request, AdonisJS automatically catches it and forwards it to the global exception handler. Let's see this in action.

In development mode (with debug enabled), visiting this route displays a beautifully formatted error page powered by Youch, showing the error message, full stack trace, and request context.

In production mode (with debug disabled), the same error returns a simple JSON or plain text response containing only the error message, without exposing your application's internal structure.

The global exception handler's handle method receives all unhandled errors. You can inspect the error type and provide custom handling for specific exceptions while letting others fall through to the default behavior.

Here's an example of handling validation errors with a custom response format.

This pattern of checking error types using instanceof and providing custom handling is powerful and flexible. You can add as many conditional branches as needed for different error types in your application.

Here's how you might use this custom validation error handling in a route.

The debug property controls whether errors are displayed using Youch, an error visualization tool that creates beautiful, interactive error pages. When debug mode is enabled, Youch displays the error message, complete stack trace, request details, and even shows the exact code where the error occurred with syntax highlighting.

In production, debug mode should always be disabled to prevent exposing sensitive information. When disabled, errors are converted to simple responses using content negotiation (JSON for API requests, plain text for others) containing only the error message without implementation details.

The default configuration protected debug = !app.inProduction automatically handles this for you, enabling debug mode in development and disabling it in production.

Status pages allow you to display custom HTML pages for specific HTTP status codes. This feature is particularly useful for user-facing applications where you want to provide a branded, helpful error experience rather than a generic error message.

The statusPages property is a key-value map where keys are HTTP status codes or ranges, and values are callback functions that render and return HTML content. The callback receives the error object and the HTTP context, giving you full access to view rendering and error details.

Status pages are only rendered when the renderStatusPages property is set to true. The default configuration enables them in production (app.inProduction) where custom error pages provide a better user experience, while keeping them disabled in development where detailed Youch error pages are more useful for debugging.

The report method logs errors or sends them to external monitoring services. Unlike handle, it should never send HTTP responses. These are two distinct concerns that should remain separated.

The base ExceptionHandler class provides a default implementation of report that logs errors using AdonisJS's logger. You can override this method to add custom reporting logic, such as integrating with error monitoring services.

The context method allows you to define additional data that should be included with every error report. This contextual information helps you understand the circumstances under which an error occurred, making debugging much easier.

By default, the context includes the request ID (x-request-id header). You can override this method to include any additional information relevant to your application.

This context data is automatically included whenever an error is reported, giving you rich information about each error's circumstances without manually adding this data to every report call.

Not all errors need to be reported. Some errors, like validation failures or unauthorized access attempts, are expected parts of normal application flow and don't require logging or monitoring. You can configure which errors to exclude from reporting using the ignoreStatuses and ignoreCodes properties.

The base ExceptionHandler class checks these properties in its shouldReport method before reporting an error. If you implement custom reporting logic, you must respect this check.

This approach ensures consistent error filtering across your application, preventing your logs and monitoring services from being overwhelmed with expected errors.

Custom exceptions allow you to create specialized error classes for specific error conditions in your application's business logic. A custom exception extends the base Exception class and can implement its own handle and report methods, encapsulating both the error condition and its handling logic in a single, self-contained class.

You can create a custom exception using the make:exception command.

This generates a new exception class in the app/exceptions directory. Here's what a complete custom exception looks like with both handling and reporting logic.

When you throw this custom exception anywhere in your application, AdonisJS automatically calls its handle method to generate the HTTP response and its report method to log the error. The global exception handler is bypassed entirely for custom exceptions that implement these methods.

Custom exceptions are ideal when you need to throw meaningful, business-logic-specific errors throughout your application. They're particularly useful for error conditions that require specialized handling or reporting. Unlike handling errors in the global exception handler, custom exceptions encapsulate both the error condition and its handling logic, making your error handling more organized and maintainable.

The global exception handler, on the other hand, is meant to change the default behavior for how exceptions are handled application-wide. It's the right place for cross-cutting concerns like formatting all API errors consistently or integrating with monitoring services.

Use custom exceptions when the error is specific to your domain and requires unique handling. Use the global exception handler when you need to modify how a category of errors is processed across your entire application.

The exception handler class provides several configuration options that control error handling behavior:

When true, displays detailed error pages with stack traces using Youch. Should be false in production. Default: !app.inProduction

When true, renders custom HTML pages for configured status codes. Default: app.inProduction

Maps HTTP status codes or ranges to view rendering callbacks for custom error pages.

Array of HTTP status codes that should not be reported via the report method.

Array of error codes that should not be reported via the report method.

**Examples:**

Example 1 (scala):
```scala
import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * Controls verbose error display with stack traces.
   * Automatically disabled in production to protect sensitive info.
   */
  protected debug = !app.inProduction

  /**
   * Enables custom HTML error pages for specific status codes.
   * Typically enabled in production for better user experience.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Maps status codes or ranges to view templates.
   * Keys can be specific codes like '404' or ranges like '500..599'.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { view }) => {
      return view.render('pages/errors/not_found', { error })
    },
    '500..599': (error, { view }) => {
      return view.render('pages/errors/server_error', { error })
    },
  }

  /**
   * Converts errors into HTTP responses for the client.
   * Override to customize error response formatting.
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  /**
   * Logs errors or sends them to monitoring services.
   * Never attempt to send HTTP responses from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'
import { Exception } from '@adonisjs/core/exceptions'

router.get('fatal', () => {
  /**
   * Throwing an exception with a 500 status code
   * and a custom error code for identification
   */
  throw new Exception('Something went wrong', { 
    status: 500, 
    code: 'E_RUNTIME_EXCEPTION' 
  })
})
```

Example 3 (gdscript):
```gdscript
import { errors as vineJSErrors } from '@vinejs/vine'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Check if the error is a VineJS validation error
     * using instanceof to safely identify the error type
     */
    if (error instanceof vineJSErrors.E_VALIDATION_ERROR) {
      /**
       * Return validation messages directly as JSON
       * with a 422 Unprocessable Entity status
       */
      ctx.response.status(422).send(error.messages)
      return
    }

    /**
     * For all other errors, delegate to the parent class
     * which handles the default error conversion logic
     */
    return super.handle(error, ctx)
  }
}
```

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'
import { createPostValidator } from '#validators/post'

router.post('posts', async ({ request }) => {
  /**
   * If validation fails, VineJS throws E_VALIDATION_ERROR
   * which is caught by our custom handler and returns
   * the validation messages with a 422 status code
   */
  await request.validateUsing(createPostValidator)
})
```

---

## Type-safe API Client - AdonisJS

**URL:** https://docs.adonisjs.com/guides/frontend/api-client

**Contents:**
- Tuyau
- Overview
- Installation
  - Inertia applications
    - Step 1. Install the package
    - Step 2. Configure the assembler hook
    - Step 3. Configure TypeScript paths
    - Step 4. Configure Vite aliases
    - Step 5. Create the Tuyau client
  - Monorepo applications

This guide covers Tuyau, a type-safe HTTP client for AdonisJS applications. You will learn how to install and configure Tuyau, make type-safe API calls using route names, handle request parameters and validation, work with file uploads, generate URLs programmatically, and understand type-level serialization for end-to-end type safety between your backend and frontend.

Tuyau is a type-safe HTTP client that enables end-to-end type safety between your AdonisJS backend and frontend application. Instead of manually writing API client code and managing types, Tuyau automatically generates a fully typed client based on your routes, controllers, and validators.

The key benefit of Tuyau is eliminating the gap between your backend API definition and frontend consumption. When you define a route with validation in AdonisJS, Tuyau ensures your frontend calls use the exact same types for request bodies, query parameters, route parameters, and response data. This means TypeScript will catch errors at compile time rather than discovering them at runtime.

Tuyau works by analyzing your AdonisJS routes and generating a registry that maps route names to their types. Your frontend imports this registry and uses it to make type-safe API calls. Every parameter, every field in your request body, and every property in your response is fully typed and autocompleted in your IDE.

The library is built on top of Ky, a modern fetch wrapper, which means you get all of Ky's features like automatic retries, timeout handling, and request/response hooks while maintaining full type safety.

Tuyau installation differs depending on whether you're using Inertia (single repository) or a monorepo setup with separate frontend and backend applications.

For Inertia applications, installation is straightforward since your frontend and backend live in the same repository.

The assembler hook automatically generates the Tuyau registry whenever your codebase changes. Add the generateRegistry hook to your adonisrc.ts file:

The generateRegistry hook runs during initialization and generates files in the .adonisjs/client directory. These files contain the type information Tuyau needs to provide type safety.

Configure path aliases in your Inertia tsconfig.json to import the generated registry:

Add matching aliases to your vite.config.ts:

Create a file to initialize your Tuyau client:

The baseUrl should point to your API server. Using an environment variable allows different URLs for development and production.

Recommended approach: Instead of manual setup, use the React Starter Kit which comes with Tuyau pre-configured and ready to use.

For monorepo setups where your frontend and backend are separate packages, the setup requires additional configuration to share types between workspaces.

This guide assumes you're using npm workspaces with Turborepo (as used by the API Starter Kit), but the concepts apply to other monorepo tools like pnpm or Yarn workspaces with slight variations in syntax.

Organize your monorepo with separate workspaces for your API and frontend application:

In your frontend workspace, install Tuyau and add your API as a dependency:

The "*" version range tells npm to resolve @my-app/backend from your local workspace. Make sure the package name matches the name field in your backend's package.json.

Tuyau uses TypeScript decorators internally. Enable them in your frontend tsconfig.json:

In your backend AdonisJS application, add the generateRegistry hook just like in the Inertia setup:

Configure your backend package.json to export the generated Tuyau files so your frontend can import them:

These exports allow your frontend to import the registry using @my-app/backend/registry.

In your frontend, create a file to initialize Tuyau:

The baseUrl should use an environment variable so you can configure different API URLs for development and production environments.

Reference implementation: Check out this monorepo starter kit for a complete working example of Tuyau in a monorepo setup.

Let's build a complete example showing how Tuyau provides end-to-end type safety from your backend route to your frontend API call.

Create a route with a name using the as method:

The route name auth.register is what you'll use to call this endpoint from your frontend.

Define validation rules using VineJS:

Create a controller action that uses the validator:

The call to request.validateUsing() is essential for Tuyau to understand the shape of your request body and provide accurate types on the frontend.

Import your Tuyau client and call the route using its name:

Notice how the route name auth.register becomes a method chain tuyau.auth.register(). The body parameter is fully typed based on your validator - your IDE will autocomplete the fields and TypeScript will catch any mistakes.

Tuyau provides three different ways to make API calls, each suited for different use cases. All three approaches provide full type safety, but they differ in syntax and flexibility.

The recommended approach is using route names with the proxy syntax. Route names map directly to method chains on your Tuyau client:

Each segment of the route name becomes a property access. The route users.show becomes tuyau.users.show(). This syntax provides excellent autocomplete and keeps your code clean.

Route name segments that contain underscores are converted to camelCase in the proxy syntax. For example, a route named auth.new_account.store becomes tuyau.auth.newAccount.store().

If the proxy syntax does not resolve types for a particular route name, use the request() method as a fallback — it supports all route names and is functionally identical:

The request method provides an alternative syntax that explicitly passes the route name as a string:

This approach is functionally identical to the proxy syntax but can be useful when you want to store route names in variables or generate them dynamically.

For cases where you need to work directly with URLs instead of route names, Tuyau provides HTTP method functions:

This syntax mirrors the fetch API but maintains type safety for parameters and responses.

Which method should I use?

We recommend using route names (proxy syntax or request method) over URL-based calls. Route names provide a layer of indirection - if you change a URL, you only need to update it in one place (the route definition) rather than searching through your frontend codebase for every hardcoded URL string.

The proxy syntax (tuyau.auth.register()) is slightly more ergonomic with better autocomplete, while the request method is useful when route names come from variables or configuration.

API calls often require different types of parameters: route parameters for dynamic URL segments, query parameters for filtering or pagination, and request bodies for data submission. Tuyau handles all of these with full type safety.

Route parameters substitute dynamic segments in your URLs. When you define a route with parameters, Tuyau automatically types them:

Pass route parameters using the params option:

TypeScript will enforce that you provide all required parameters with the correct names. Your IDE will autocomplete parameter names and catch typos or missing parameters at compile time.

Query parameters append to the URL for filtering, pagination, or passing optional data. Use the query option to pass them:

Query parameters are automatically URL-encoded and appended to the request. If your backend validates query parameters, those types are inferred on the frontend.

For POST, PUT, and PATCH requests, send data using the body option:

The request body types are automatically inferred from your validator. Every field is typed, and TypeScript will prevent you from sending fields that don't exist in your validator or with incorrect types.

You can combine route parameters, query parameters, and body in a single request:

Tuyau handles building the complete URL, encoding query parameters, and serializing the body while maintaining type safety for all three parameter types.

The connection between your backend validators and frontend types is what makes Tuyau's type safety possible. Understanding how this works is crucial for getting the most out of Tuyau.

For Tuyau to infer types from your validators, you must use request.validateUsing() in your controller actions:

Without request.validateUsing(), Tuyau cannot determine what shape your request body should have, and your frontend types will fall back to any.

Use VineJS to define validation schemas. Every field you define becomes part of the type signature on the frontend:

On your frontend, the body parameter will have this exact shape:

TypeScript will enforce required fields, prevent extra fields, and ensure correct types for each property.

Query parameters can also be validated and typed. Define a validator for query parameters and use it in your controller:

The frontend query parameters are now typed:

Tuyau supports both throwing and non-throwing error handling.

By default, requests behave like regular promises. Successful responses resolve to the response payload, while failed requests throw. HTTP failures throw a TuyauHTTPError, and transport failures such as DNS issues, refused connections, or offline states throw a TuyauNetworkError.

If you prefer not to throw, call .safe() on the request. It returns a tuple where the first element is the data and the second element is the error:

The error returned by .safe() is always typed as TuyauError. This gives you a single error shape for both HTTP and network failures.

When your controller returns typed non-2xx responses, Tuyau automatically extracts those error payloads from the controller's return type and makes them available on the client. Use isStatus() to narrow the error to a specific status code:

After error.isStatus(404), TypeScript narrows error.response to the exact payload shape returned by response.notFound() in the controller.

Routes that use request.validateUsing() automatically get a typed 422 error response. The type uses SimpleError from @vinejs/vine/types. Use isValidationError() as a shorthand for isStatus(422):

You can customize the error type or disable it via the validationErrorType option in the generateRegistry hook in case your API returns a different shape for validation errors:

The TuyauError type includes a kind property. Use it when you need to treat network failures differently from server responses:

For network failures, status and response are undefined because the server did not send a response.

If you prefer the throwing flow, cast the caught error using Route.Error to get full type narrowing:

Tuyau provides two type helper namespaces, Path and Route, that let you extract request, response, and error types from your API definition. This is useful when you need to type a variable, a function parameter, or a return type based on your API schema.

Both helpers are imported from @tuyau/core/types and expose the same utilities: Request, Response, Error, Params, Body, and Query. Route extracts types by route name, while Path extracts types by HTTP method and URL pattern.

The Error helper resolves to TuyauError, which means it models both HTTP and network failures while still supporting isStatus() for HTTP error narrowing.

Tuyau automatically handles file uploads by detecting File objects in your request body and switching to FormData encoding. You don't need to manually construct FormData or change content types.

When you pass a File object in your request body, Tuyau converts the entire payload to FormData:

The presence of the File object triggers FormData encoding automatically. The description field is included in the same FormData payload.

When Tuyau detects a File object in the body, it converts the entire payload to FormData. A few things to keep in mind:

On the backend, handle file uploads using AdonisJS's standard file validation:

Upload multiple files by including multiple File objects in your payload:

Tuyau handles the FormData serialization for arrays of files automatically.

Tuyau provides the urlFor helper to generate URLs from route names in a type-safe way. This is useful when you need URLs for links, redirects, or sharing, rather than making an actual API call.

The urlFor method searches across all HTTP methods and returns the URL as a string:

TypeScript ensures you provide the correct route name and required parameters. Invalid route names or missing parameters are caught at compile time.

For more control, use method-specific variants like urlFor.get or urlFor.post. These return an object containing both the HTTP method and URL:

This is useful when you need to know both the URL and which HTTP method should be used, for example when building generic link components.

Add query parameters to generated URLs using the qs option:

Query parameters are automatically URL-encoded and appended to the generated URL.

For routes with wildcard parameters, pass them as arrays:

Instead of an object, you can pass parameters as an array in the order they appear in the route:

Positional parameters can be convenient when parameter names are obvious from context.

Tuyau provides two methods for inspecting routes at runtime: has() to check if a route exists in the registry, and current() to determine which route matches the current page URL.

The has() method checks whether a route name exists in the registry:

This is useful for conditionally rendering UI elements based on whether a route is available in the current application.

The current() method uses window.location to determine which route the user is currently on. It only matches navigable routes (GET or HEAD).

Without arguments, it returns the current route name, or undefined if no route matches (or when running server-side):

With a route name, it returns true if the current URL matches that route:

With wildcard patterns, you can match groups of routes using *:

With options, you can additionally verify that the current URL params and/or query string match expected values:

Both has() and current() provide autocomplete for known route names. current() also accepts arbitrary strings for wildcard patterns like 'users.*'.

current() returns undefined (no args) or false (with route name) when running server-side since window.location is not available.

An important concept to understand when working with Tuyau is type-level serialization. This refers to how types are automatically transformed to match what actually gets sent over the network as JSON.

When you pass a Date object from your backend to the frontend, it cannot be transmitted as a Date object through JSON. Instead, it's serialized to a string. Tuyau's types automatically reflect this transformation:

On the frontend, Tuyau automatically infers the type as string, not Date:

This makes sense because dates are serialized to ISO string format when sent over HTTP. Tuyau's type system reflects this reality at compile time.

A common mistake is returning Lucid models directly from your controllers. When you do this, Tuyau cannot accurately infer the response types because models serialize to a generic ModelObject type that contains almost no useful type information:

On the frontend, you'll get a generic ModelObject type with no specific fields:

To maintain type safety, explicitly transform your models using HTTP Transformers to plain objects before returning them:

Now the frontend has accurate types:

By default, Tuyau parses responses based on the Content-Type header: JSON for application/json, ArrayBuffer for application/octet-stream, and text for everything else.

You can override this per-request with the responseType option ('json', 'text', 'arrayBuffer', or 'blob'):

The createTuyau function accepts several configuration options to customize how your API client behaves.

baseUrl (string, required) The base URL of your API server. All requests are prefixed with this URL. Use environment variables to configure different URLs for development and production:

registry (object, required) The generated registry that maps route names to URLs and types. Import this from the generated files in .adonisjs/client or from your backend package in a monorepo setup.

These optional settings are highly recommended for most applications:

headers (object, optional) Default headers sent with every request. Setting Accept: 'application/json' ensures your API returns JSON responses rather than HTML error pages or other formats:

credentials (string, optional) Controls whether cookies are sent with cross-origin requests. Set to 'include' to send cookies for authentication:

This is essential for session-based authentication where your frontend and backend are on different domains.

When credentials: 'include' is set, Tuyau automatically handles CSRF protection. It reads the XSRF-TOKEN cookie and sends it as an X-XSRF-TOKEN header with every request — no extra configuration needed.

Tuyau is built on top of Ky, which means you can pass any Ky option to createTuyau. Some useful advanced options include:

timeout (number, optional) Request timeout in milliseconds. Requests that exceed this duration are automatically aborted:

retry (number | object, optional) Configure automatic retry behavior for failed requests:

hooks (object, optional) Add request/response interceptors for logging, authentication, or error handling:

For APIs that use access token authentication (like the API Starter Kit), use the hooks.beforeRequest option to dynamically attach the Authorization header to every request:

This pattern reads the token from storage before each request. You can adapt it to read from a different source (e.g., a state management store or cookie) depending on where your application stores the token after login.

For a complete list of available options, see the Ky documentation.

All Ky options can also be passed per-request, not just at client creation. This is useful for setting a custom timeout, attaching an AbortSignal, or adding headers for a single call:

By default, generateRegistry includes all named routes. Use the routes option to include or exclude specific routes from the generated registry:

Filters accept strings (substring match), RegExp, or functions. You cannot use only and except together.

Tuyau integrates with several parts of the AdonisJS ecosystem and provides additional packages for specific use cases.

If you're using Inertia, Tuyau provides enhanced type safety for Inertia-specific features. The @adonisjs/inertia package exports a <TuyauProvider> component that enables type-safe routing and other cool features:

The <Link> component's route prop is fully typed - TypeScript ensures you use valid route names and provide required parameters. See the Inertia documentation for complete details on this integration and additional features.

The @tuyau/tanstack-query package provides React hooks that integrate Tuyau with TanStack Query (formerly React Query) for data fetching, caching, and state management. See the TanStack Query guide for instructions on setting up and using these hooks in your React components.

Rather than setting up Tuyau manually, consider using one of these starter kits with Tuyau pre-configured:

These repositories serve as reference implementations showing best practices for Tuyau configuration.

**Examples:**

Example 1 (elixir):
```elixir
npm install @tuyau/core
```

Example 2 (lua):
```lua
import { defineConfig } from '@adonisjs/core/app'
import { generateRegistry } from '@tuyau/core/hooks'

export default defineConfig({
  // ... other config
  hooks: {
    init: [generateRegistry()],
  },
})
```

Example 3 (json):
```json
{
  "compilerOptions": {
    // ... other options
    "paths": {
      "~/*": ["./*"],
      "~/generated/*": ["../.adonisjs/client/*"],
      "~registry": ["../.adonisjs/client/registry.ts"]
    }
  }
}
```

Example 4 (python):
```python
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/vite'

export default defineConfig({
  plugins: [
    react(),
    inertia({ ssr: { enabled: false, entrypoint: 'inertia/ssr.tsx' } }),
    adonisjs({ entrypoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/inertia/`,
      '~registry': `${import.meta.dirname}/.adonisjs/client/registry.ts`, 
    },
  },
})
```

---

## Assembler hooks - AdonisJS

**URL:** https://docs.adonisjs.com/guides/concepts/assembler-hooks

**Contents:**
- Assembler hooks
- Overview
- Hooks reference
- Creating and registering hooks
- Init hook
- Dev server hooks
- Test runner hooks
- Bundler hooks
- Watcher hooks
- Routes hooks

This guide covers Assembler hooks in AdonisJS. You will learn how to:

Assembler is the build tooling layer of AdonisJS that manages your application as a child process. It handles starting the development server, running tests, and creating production builds. Hooks let you tap into this lifecycle to run custom actions at specific moments, such as generating barrel files when controllers change, creating type declarations when routes are scanned, or displaying custom information when the server starts.

Because Assembler runs in a separate process from your AdonisJS application, hooks do not have access to framework features like the IoC container, router service, or database connections. Instead, hooks receive purpose-built utilities like the IndexGenerator for code generation and scanner instances for route analysis.

Common use cases for Assembler hooks include generating barrel files for lazy-loading controllers, creating type-safe API clients from route metadata, running code generators when files change, and displaying custom startup information.

The following table lists all available hooks, when they execute, and what parameters they receive.

Hooks are registered in the adonisrc.ts file under the hooks property. Each hook accepts an array of lazy-loaded imports, allowing you to split hook logic into separate files and only load them when needed.

The hook file must export a default function that receives the hook's parameters. Each hook has a typed helper available from @adonisjs/core/app that provides full TypeScript support for the parameters.

You can register multiple hooks for the same event. They execute in the order they are registered.

Assembler hooks run in a separate process from your AdonisJS application. They do not have access to the IoC container, router, database, or any other framework services. If you need to interact with your application, use the routes scanning hooks to extract metadata or communicate via HTTP/IPC.

The init hook is the first hook executed when Assembler starts any operation. It receives the parent instance (DevServer, TestRunner, or Bundler), a hooks manager for registering additional runtime hooks, and the IndexGenerator for code generation tasks.

The init hook is the recommended place to configure the IndexGenerator for barrel file and type generation, as it runs before any other operations begin.

The dev server hooks execute when starting and running the development server. The devServerStarting hook fires before the child process launches, and devServerStarted fires once the server is accepting connections.

These hooks re-trigger every time the child process restarts, such as when a full reload occurs due to file changes.

The test runner hooks execute before and after running your test suite. Use testsStarting to set up test fixtures or databases, and testsFinished to generate reports or clean up resources.

When running tests in watch mode, these hooks re-trigger each time the test suite re-runs.

The bundler hooks execute when creating a production build with node ace build. Use buildStarting for pre-build tasks like asset optimization, and buildFinished to display build statistics or run post-build scripts.

The watcher hooks fire when files change during development or test watch mode. In HMR mode, Assembler relies on hot-hook to detect changes; otherwise, the built-in file watcher handles detection.

Each watcher hook receives both the relative path (from your application root, using Unix-style slashes) and the absolute path to the affected file.

The routes hooks provide access to your application's route definitions and their associated types. These hooks only execute during dev server operation, not during builds or tests.

The routesCommitted hook fires when your AdonisJS application registers its routes. The routes are transmitted from the child process to Assembler via IPC, giving you access to route metadata without parsing files yourself.

The routesScanning hook fires before Assembler begins analyzing your routes to extract request and response types. Use this hook to configure the scanner, such as skipping certain routes from analysis.

The routesScanned hook fires after route analysis completes. The scanner contains extracted type information that you can use to generate API clients or type declarations.

The types extracted by the routes scanner are internal import references pointing to your controllers and validators. They are not fully resolved standalone types that can be used in a separate project. Generating standalone types requires additional tooling like Tuyau.

The IndexGenerator is a utility for watching directories and generating barrel files or type declarations from their contents. It handles file watching automatically, regenerating output files when source files are added or removed.

Register IndexGenerator configurations in the init hook. Each configuration specifies a source directory to watch, an output file to generate, and how to transform the source files.

The configuration options are:

When as is set to 'barrelFile', the IndexGenerator scans the source directory recursively and generates a barrel file that exports lazy-loaded imports. The directory structure is preserved as nested objects.

Given this controller structure:

The IndexGenerator produces:

This barrel file enables lazy-loading controllers in your routes without manual import management. The file automatically updates when you add or remove controllers.

For generating type declarations or other custom output, pass a callback function to the as option. The callback receives a collection of files and a writer utility for building the output string.

The files collection is a key-value object where each key is the relative path (without extension) from the source directory, and each value contains the file's importPath, relativePath, and absolutePath.

This generates a type declaration file that maps page component paths to their prop types, enabling type-safe Inertia.js page rendering.

The following example shows a complete init hook that configures barrel file generation for controllers, events, and listeners—the default setup used by the AdonisJS framework.

**Examples:**

Example 1 (javascript):
```javascript
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  hooks: {
    devServerStarted: [() => import('./hooks/on_server_started.ts')],
    fileChanged: [() => import('./hooks/on_file_changed.ts')],
  },
})
```

Example 2 (javascript):
```javascript
import { hooks } from '@adonisjs/core/app'

export default hooks.devServerStarted((devServer, info, instructions) => {
  /**
   * info.host - The host address the server is bound to
   * info.port - The port number the server is running on
   * instructions - UI helper for displaying formatted output
   */
  console.log(`Server running at http://${info.host}:${info.port}`)
})
```

Example 3 (javascript):
```javascript
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  hooks: {
    devServerStarted: [
      () => import('./hooks/log_server_info.ts'),
      () => import('./hooks/notify_external_service.ts'),
    ],
  },
})
```

Example 4 (elixir):
```elixir
import { hooks } from '@adonisjs/core/app'

export default hooks.init((parent, hooksManager, indexGenerator) => {
  /**
   * Determine what operation is running by checking the parent type.
   * Use indexGenerator to set up barrel file or type generation.
   */
  console.log('Assembler initialized')
})
```


## Body parser - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/body-parser

**Contents:**
- Body Parser
- Overview
- Configuration
- Global parsing options
- JSON parser
- Form parser
- Multipart parser
- Raw parser for custom content types
- Form Method Spoofing

This guide covers the body parser configuration in AdonisJS. You will learn how to:

The body parser is responsible for parsing incoming request bodies before they reach your route handlers. It automatically detects the content type of each request and applies the appropriate parser to convert the raw request data into a usable format.

AdonisJS includes three built-in parsers: the JSON parser handles JSON-encoded data, the form parser handles URL-encoded form submissions, and the multipart parser handles file uploads and multipart form data. Each parser can be configured independently through the config/bodyparser.ts file.

You don't interact with the body parser directly in your application code. Instead, you access the parsed data through the Request class using methods like request.all(), request.body(), or request.file(). The body parser runs as middleware and processes request bodies automatically before your route handlers execute.

See also: Request class documentation for accessing parsed request data.

The body parser is configured in the config/bodyparser.ts file. The configuration file is created automatically when you create a new AdonisJS application.

The allowedMethods array defines which HTTP methods should have their request bodies parsed. By default, only POST, PUT, PATCH, and DELETE requests are processed. GET requests are excluded because they typically don't include request bodies.

Two global options are available across all parsers: convertEmptyStringsToNull and trimWhitespaces. These options help normalize incoming data before it reaches your application logic.

The convertEmptyStringsToNull option converts all empty strings in the request body to null values. This option solves a common problem with HTML forms.

When an HTML form input field has no value, browsers send an empty string in the request body rather than omitting the field entirely. This behavior creates challenges for database normalization, especially with nullable columns.

Consider a user registration form with an optional "country" field. Your database has a nullable country column, and you want to store null when the user doesn't select a country. However, the HTML form sends an empty string, which means you would insert an empty string into the database instead of leaving the column as null.

Enabling convertEmptyStringsToNull handles this inconsistency automatically. The body parser converts all empty strings to null before your validation or database logic runs.

The trimWhitespaces option removes leading and trailing whitespace from all string values in the request body. This helps eliminate accidental whitespace that users might include when submitting forms.

Instead of manually trimming values in your controllers or validators, you can enable this option and let the body parser handle whitespace removal globally.

The JSON parser handles requests with JSON-encoded bodies. It processes several content types by default, including application/json, application/json-patch+json, application/vnd.api+json, and application/csp-report.

The encoding option specifies the character encoding to use when converting the request body Buffer to a string. The default is utf-8, which handles most use cases. You can use any encoding supported by the iconv-lite package.

The limit option sets the maximum size of request body data the parser will accept. Requests that exceed this limit will receive a 413 Payload Too Large error response.

The strict option controls whether the parser accepts only objects and arrays as top-level JSON values. When enabled, the parser rejects primitive values like strings, numbers, or booleans at the root level.

The types array defines which content types the JSON parser should handle. You can add custom content types if your application receives JSON data with non-standard content type headers.

The form parser handles URL-encoded form data, typically from HTML forms with application/x-www-form-urlencoded content type.

The encoding option specifies the character encoding to use when converting the request body Buffer to a string. The default is utf-8, which handles most use cases. You can use any encoding supported by the iconv-lite package.

The limit option sets the maximum size of request body data the parser will accept. Requests that exceed this limit will receive a 413 Payload Too Large error response.

The queryString option allows you to configure how the URL-encoded string is parsed into an object. These options are passed directly to the qs package, which handles the parsing.

See also: qs documentation for all available options.

The types array defines which content types the form parser should handle. By default, it processes application/x-www-form-urlencoded requests.

The multipart parser handles file uploads and multipart form data. It processes requests with the multipart/form-data content type, which browsers use when submitting forms that include file inputs.

The autoProcess option controls whether uploaded files are automatically moved to your operating system's temporary directory. When enabled, the parser streams files to disk as the request is processed.

After automatic processing, you can access uploaded files in your controllers using request.file(), validate them, and move them to a permanent location or cloud storage service.

You can specify an array of route patterns to enable automatic processing for specific routes only. The values must be route patterns, not URLs.

The processManually array lets you disable automatic file processing for selected routes while keeping it enabled globally. This is useful when you have a few routes that need custom file handling but want the convenience of automatic processing everywhere else.

The values must be route patterns, not URLs.

The encoding option specifies the character encoding to use when converting text fields in the multipart request to strings. The default is utf-8, which handles most use cases. You can use any encoding supported by the iconv-lite package.

The limit option sets the maximum total size of all uploaded files in a single request. Requests that exceed this limit will receive a 413 Payload Too Large error response.

The fieldsLimit option sets the maximum total size of all form fields (not files) in the multipart request. This prevents abuse through extremely large text field submissions. Requests that exceed this limit will receive a 413 Payload Too Large error response.

The tmpFileName option accepts a function that generates custom names for temporary files. By default, the parser generates random file names.

The types array defines which content types the multipart parser should handle. By default, it processes multipart/form-data requests.

The body parser includes a raw parser that can handle content types not supported by the default parsers. The raw parser provides the request body as a string, which you can then process using custom middleware.

This is useful when your application receives data in formats like XML, YAML, or other specialized content types that don't have built-in parsers.

After enabling the raw parser for specific content types, create custom middleware to parse the string data into a usable format.

See also: Middleware documentation

HTML forms only support GET and POST methods. Method spoofing allows you to specify other HTTP methods (PUT, PATCH, DELETE) via a query parameter, enabling full RESTful routing with standard HTML forms.

With method spoofing enabled, you can use the _method query parameter in your forms:

**Examples:**

Example 1 (sass):
```sass
import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  form: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: ['application/x-www-form-urlencoded'],
  },

  json: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  multipart: {
    autoProcess: true,
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    processManually: [],
    limit: '20mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
```

Example 2 (yaml):
```yaml
json: {
  convertEmptyStringsToNull: true,
}
```

Example 3 (yaml):
```yaml
form: {
  trimWhitespaces: true,
}
```

Example 4 (yaml):
```yaml
json: {
  encoding: 'utf-8',
}
```

---

## Prompts - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/prompts

**Contents:**
- Prompts
- Overview
- Displaying text input
  - Adding validation
  - Providing default values
- Collecting passwords
- Creating choice lists
  - Customizing choice display
- Allowing multiple selections
- Confirming actions

This guide covers using prompts within custom commands. You will learn about the following topics:

Prompts enable interactive command line experiences by allowing users to provide input through intuitive terminal widgets rather than command line arguments or flags. This is particularly useful for commands that need to guide users through multi-step processes, collect sensitive information like passwords, or allow selection from a list of options.

Ace prompts are powered by the @poppinss/prompts package, which supports multiple prompt types including text input, password fields, confirmations, single and multi-select lists, and autocomplete searches. All prompts support validation, default values, and transformation of user input before it's returned to your command.

A key feature of Ace prompts is their testing support. When writing tests, you can trap prompts and respond to them programmatically, making it easy to test interactive commands without manual input.

The text input prompt accepts free-form text from users. Use the this.prompt.ask method to display a text input prompt, providing the prompt message as the first parameter.

You can validate user input by providing a validate function in the options object. The function receives the user's input and should return true to accept the value, or an error message string to reject it.

If validation fails, the prompt displays the error message and asks for input again until the user provides a valid value.

Default values appear as suggestions that users can accept by pressing Enter. This is useful for providing common values or sensible defaults.

The password prompt masks user input in the terminal, replacing each character with an asterisk or bullet point. This is essential for collecting sensitive information like passwords, API keys, or tokens.

Use the this.prompt.secure method to display a password prompt.

You can add validation to password prompts just like text inputs.

The choice prompt displays a list of options that users can navigate with arrow keys and select with Enter. This is ideal when you need users to pick from predefined options.

Use the this.prompt.choice method to display a single-select list. The method accepts the prompt message as the first parameter and an array of choices as the second parameter.

When you want the displayed text to differ from the returned value, define choices as objects with name and message properties. The name is what your command receives, while the message is what users see.

The multi-select prompt lets users select multiple options from a list using the spacebar to toggle selections. This is useful when users need to choose multiple features, packages, or configurations.

Use the this.prompt.multiple method to display a multi-select list. The parameters are the same as the choice prompt.

The method returns an array of selected values. Users can select all, some, or none of the options.

Confirmation prompts ask users to answer yes or no questions. They're essential for destructive operations or actions that need explicit user consent.

Use the this.prompt.confirm method to display a yes/no confirmation. The method returns a boolean value.

If you want to customize the yes/no labels to something more contextual, use the this.prompt.toggle method. This method accepts an array of two strings for the yes and no labels.

The autocomplete prompt combines selection with search functionality, allowing users to fuzzy search through a large list of options. This is particularly useful when dealing with many choices that would be unwieldy in a standard selection list.

Use the this.prompt.autocomplete method to display a searchable list.

Users can type to filter the list, and the prompt will show matching options based on fuzzy search.

All prompt types accept a common set of options through the second parameter. These options allow you to customize prompt behavior, validate input, and transform return values.

The result function transforms the value returned by the prompt. This is useful for converting user input to a different format or type.

The format function changes how the input appears in the terminal as users type, without affecting the actual return value.

Hints provide additional context or instructions that appear next to the prompt.

**Examples:**

Example 1 (javascript):
```javascript
import { BaseCommand } from '@adonisjs/core/ace'

export default class MakeModelCommand extends BaseCommand {
  static commandName = 'make:model'
  
  async run() {
    /**
     * Ask for the model name
     */
    const modelName = await this.prompt.ask('Enter the model name')
    
    this.logger.info(`Creating model: ${modelName}`)
  }
}
```

Example 2 (javascript):
```javascript
const modelName = await this.prompt.ask('Enter the model name', {
  validate(value) {
    return value.length > 0
      ? true
      : 'Model name is required'
  }
})
```

Example 3 (javascript):
```javascript
const modelName = await this.prompt.ask('Enter the model name', {
  default: 'User'
})
```

Example 4 (javascript):
```javascript
import { BaseCommand } from '@adonisjs/core/ace'

export default class SetupCommand extends BaseCommand {
  static commandName = 'setup'
  
  async run() {
    /**
     * Collect the database password securely
     */
    const password = await this.prompt.secure('Enter database password')
    
    this.logger.info('Password collected securely')
  }
}
```

---

## Logger - AdonisJS

**URL:** https://docs.adonisjs.com/guides/digging-deeper/logger

**Contents:**
- Logger
- Overview
- Writing your first log
  - Adding context to logs
  - String interpolation
- Request-aware logging
- Configuring the logger
  - Understanding the configuration
  - Configuration reference
  - Log levels

This guide covers logging in AdonisJS applications. You will learn how to:

AdonisJS includes an inbuilt logger for writing logs to the terminal, files, and external services. Under the hood, the logger uses Pino, one of the fastest logging libraries in the Node.js ecosystem. Logs are produced in the NDJSON format, making them easy to parse and process with standard tooling.

The logger integrates deeply with AdonisJS. During HTTP requests, each request automatically gets its own logger instance that includes the request ID in every log entry, making it straightforward to trace logs back to specific requests.

This guide focuses on logging during HTTP requests. For CLI applications, see the Ace ANSI logger documentation which provides terminal-friendly colored output designed for command-line tools.

Import the logger service and call any of the logging methods to write a message. During development, logs appear in your terminal with pretty formatting that includes timestamps, colors, and readable structure.

When you visit the route, you'll see output like this in your terminal:

The logger provides methods for each log level, from most to least verbose:

Pass an object as the first argument to include additional data in the log entry. The object properties are merged into the JSON output.

When logging errors, use the err key so Pino's built-in serializer formats the error properly with stack traces:

Log messages support printf-style interpolation for embedding values directly in the message string:

During HTTP requests, use ctx.logger instead of importing the logger service directly. The context logger automatically includes the request ID in every log entry, making it easy to correlate all logs from a single request.

The output includes the request ID, allowing you to filter logs for a specific request:

The logger configuration lives in config/logger.ts. The default setup uses pretty-printed output in development and structured JSON in production.

The syncDestination() helper configures synchronous, pretty-printed output for development. By default, Pino writes logs asynchronously for better performance, but this can make it harder to correlate logs with the code that produced them during debugging. The synchronous destination writes logs inline as your code executes, with human-readable formatting.

In production, the destination is left as undefined, which means logs flow through the configured transport targets. The targets.file({ destination: 1 }) target writes JSON logs to stdout (file descriptor 1), which is the standard approach for containerized deployments where a log aggregator collects stdout.

The logger supports six levels, ordered from most to least verbose. When you set a level, the logger produces logs at that level and above.

Set the level in your .env file:

To write logs to a file instead of stdout, configure the targets.file() helper with a file path:

Pino does not include built-in file rotation. Use either a system tool like logrotate or the pino-roll package.

Use the targets() helper to build the targets array with conditional logic. This is cleaner than spreading arrays with ternary operators.

The pushIf method only adds the target when the condition is true, keeping your configuration readable.

Define multiple loggers in your configuration when different parts of your application need separate logging behavior. For example, you might want payment-related logs to go to a separate file with a different retention policy.

Access a specific logger using the logger.use() method:

Calling logger.use() without arguments returns the default logger.

When using dependency injection, type-hint the Logger class and the IoC container resolves an instance of the default logger. If the class is constructed during an HTTP request, the container automatically injects the request-aware logger with the request ID included.

A child logger inherits configuration and bindings from its parent while allowing you to add additional context. This is useful when you want all logs from a particular operation to include shared metadata.

Every log entry from orderLogger automatically includes the orderId field. You can also override the log level for a child logger:

If computing data for a log message is expensive, check whether the level is enabled before doing the work:

The ifLevelEnabled method provides a callback-based alternative:

Logs can inadvertently expose sensitive data. Use the redact option to automatically hide values for specific keys. Under the hood, this uses the fast-redact package.

Customize the placeholder or remove the keys entirely:

An alternative to redaction is wrapping sensitive values in the Secret class. The logger automatically redacts any Secret instance.

See also: Secret class documentation

The @adonisjs/core/logger module re-exports Pino's static methods and properties for advanced use cases.

See the Pino documentation for details on these exports.

**Examples:**

Example 1 (python):
```python
import router from '@adonisjs/core/services/router'
import logger from '@adonisjs/core/services/logger'

router.get('/', async () => {
  logger.info('Processing home page request')
  return { hello: 'world' }
})
```

Example 2 (json):
```json
[10:24:36.842] INFO: Processing home page request
```

Example 3 (python):
```python
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

Example 4 (elixir):
```elixir
const user = { id: 1, email: 'virk@adonisjs.com' }
logger.info({ user }, 'User logged in')
```

---

## URL builder - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/url-builder

**Contents:**
- URL Builder
- Overview
- Defining named routes
- Generating URLs in templates
- Generating URLs during redirects
- Generating URLs in other contexts
- Passing route parameters
- Adding query strings
- Signed URLs
  - Creating signed URLs

This guide covers URL generation in AdonisJS applications. You will learn how to:

The URL builder provides a type-safe API for generating URLs from named routes. Instead of hard-coding URLs throughout your application in templates, frontend components, API responses, or redirects, you reference routes by name. This ensures that when you change a route's path, you don't need to hunt down and update every URL reference across your codebase.

Once a route is named, you can generate URLs for it using the urlFor helper in templates, the response.redirect().toRoute() method for redirects, or by importing the urlFor function from the URL builder service for other contexts.

The URL builder is type-safe, meaning your IDE will provide autocompletion for route names and TypeScript will catch errors if you reference a non-existent route. This eliminates an entire class of bugs where URLs might break silently after refactoring routes.

Every route using a controller is automatically assigned a name based on the controller and method name. The naming convention follows the pattern controller.method (explained in detail in the routing guide).

For routes without controllers, you must explicitly assign a name using the .as() method.

You can view all named routes in your application using the following Ace command.

Edge templates have access to the urlFor helper by default. This helper generates URLs for named routes and accepts route parameters as either an array or an object.

When using the Hypermedia starter kit, you can also use the @link component, which accepts the route and parameters as component props.

When redirecting users to a different page, use the response.redirect().toRoute() method instead of hard-coding URLs. You can only redirect to GET routes.

For contexts outside of templates and HTTP responses, such as background jobs, email notifications, or service classes, import the urlFor function from the URL builder service.

Route parameters can be passed as either an array (positional matching) or an object (named matching). Choose the approach that makes your code more readable.

Array (positional parameters): Parameters are matched by position to the route pattern.

Object (named parameters): Parameters are matched by name to the route pattern.

Query strings can be added to generated URLs by passing a third options parameter with a qs property. The query string object can contain nested values, which are automatically serialized into the proper format.

The same qs option works in templates and redirects.

Signed URLs include a cryptographic signature that prevents tampering. If someone modifies the URL, the signature becomes invalid and the request can be rejected. This is useful for scenarios where URLs are publicly accessible but need protection against manipulation, such as newsletter unsubscribe links or password reset tokens.

Signed URLs are created using the signedUrlFor helper exported from the URL builder service. The API is identical to urlFor, but the generated URL includes a signature.

The expiresIn option sets when the signed URL expires. After expiration, the signature is no longer valid. The prefixUrl option is required when the URL will be shared externally, such as in emails or external notifications, to ensure the URL includes the full domain. For internal app navigation, relative URLs without the domain are sufficient.

The generated signed URL includes a signature query parameter appended to the URL.

Signed URLs can only be created in backend code, not in frontend applications. This is because they rely on the encryption module, which uses a secret key. Exposing this key to the frontend would compromise security.

The route for which the signed URL was generated can verify the signature using the request.hasValidSignature() method during an HTTP request. This method checks both the signature and expiration.

The URL builder service is available only within the backend application since that's where routes are defined. However, applications using Inertia or a separate frontend inside a monorepo can generate a similar URL builder for the frontend codebase.

AdonisJS enforces a clear boundary between frontend and backend codebases to prevent issues like leaking sensitive information to the client. Routes on the backend contain details about controller mappings and internal application structure. Making all this information available on the frontend would not only leak unnecessary information but also significantly increase your bundle size.

Additionally, from a runtime perspective, you cannot share an object between two different runtimes (Node.js and the browser). Creating the illusion of a shared URL builder is not something we support or believe in.

The Inertia React and Vue starter kits come with the URL builder pre-configured. The URL builder (along with the API client) is generated using Tuyau and written to the .adonisjs/client directory.

Import and use the URL builder in your frontend components with an identical API to the backend version.

The usage API is identical to the backend URL builder service, supporting both array and object parameters, as well as query strings.

You can configure which routes are available in the frontend URL builder to reduce bundle size and prevent exposing internal routes. The URL builder is generated using an Assembler hook named generateRegistry registered in your adonisrc.ts file.

Define routes to exclude using the exclude option.

The exclude pattern can use one of the following approaches, tested against the route name:

Exclude all routes starting with the prefix before the wildcard.

Use a custom regular expression to exclude matching routes.

Write a custom function for advanced filtering logic. Return false to skip the route and true to include it.

You can combine multiple patterns for complex filtering requirements.

**Examples:**

Example 1 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// Automatically named as 'posts.show'
router.get('/posts/:id', [controllers.posts, 'show'])

// Automatically named as 'posts.index'
router.get('/posts', [controllers.posts, 'index'])
```

Example 2 (scala):
```scala
router.get('/about', async () => {
  return 'About page'
}).as('about')
```

Example 3 (unknown):
```unknown
node ace list:routes
```

Example 4 (jsx):
```jsx
<a href="{{ urlFor('posts.show', { id: post.id }) }}">
  View post
</a>
```

---

## CORS - AdonisJS

**URL:** https://docs.adonisjs.com/guides/security/cors

**Contents:**
- CORS
- Overview
- Installation
- Configuration
  - Enabling and disabling CORS
  - Configuring allowed origins
  - Configuring allowed methods
  - Configuring allowed headers
  - Exposing response headers
  - Allowing credentials

This guide covers Cross-Origin Resource Sharing (CORS) in AdonisJS applications. You will learn how to:

When a browser makes a request to a different domain than the one serving the current page, it enforces Cross-Origin Resource Sharing (CORS) restrictions. This security mechanism prevents malicious scripts from making unauthorized requests to your API on behalf of users.

For example, if your frontend runs on app.example.com and your API runs on api.example.com, the browser will block requests from the frontend unless your API explicitly allows that origin. The same applies during local development when your frontend runs on localhost:3000 and your API on localhost:3333.

Before making certain cross-origin requests, browsers send a preflight request using the OPTIONS HTTP method. This preflight asks your server which origins, methods, and headers are permitted. Your server must respond with the appropriate CORS headers, and only then will the browser proceed with the actual request.

AdonisJS handles CORS through the @adonisjs/cors package, which provides middleware that automatically responds to preflight requests and attaches the correct headers to all responses.

Install and configure the package using the following command:

Installs the @adonisjs/cors package using the detected package manager.

Registers the following service provider inside the adonisrc.ts file.

Creates the config/cors.ts file. This file contains the configuration settings for CORS.

Registers the following middleware inside the start/kernel.ts file.

The CORS configuration lives in config/cors.ts. Here is the default configuration with all available options:

The enabled option turns the middleware on or off without removing it from the middleware stack. This is useful when you want to disable CORS temporarily during debugging or in specific environments.

The origin option controls which domains can make cross-origin requests to your API. This sets the Access-Control-Allow-Origin response header.

To allow all origins dynamically (the response header will mirror the requesting origin):

To disallow all cross-origin requests:

To allow specific domains, provide an array of origins:

To allow any origin using the wildcard:

When credentials is set to true, the wildcard * cannot be used as the Access-Control-Allow-Origin header value. Browsers reject this combination for security reasons. AdonisJS automatically handles this by reflecting the requesting origin instead of sending the literal * when both origin: '*' and credentials: true are configured.

For dynamic origin validation, provide a callback function. This is useful when allowed origins are stored in a database or when you need custom validation logic:

The methods option specifies which HTTP methods are permitted for cross-origin requests. The browser's preflight request includes an Access-Control-Request-Method header, and the server checks this value against the allowed methods.

The headers option controls which request headers are permitted in cross-origin requests. The browser's preflight request includes an Access-Control-Request-Headers header listing the headers the client wants to send.

To allow all headers:

To allow specific headers:

For dynamic header validation, provide a callback:

By default, browsers only expose a limited set of response headers to JavaScript. The exposeHeaders option lets you specify additional headers that should be accessible to the client.

The credentials option controls whether cookies, authorization headers, and TLS client certificates can be included in cross-origin requests. When enabled, the server sends the Access-Control-Allow-Credentials: true header.

Enable credentials when your frontend needs to send authentication cookies or the Authorization header to your API. Without this, browsers strip credentials from cross-origin requests.

The maxAge option specifies how long (in seconds) browsers should cache preflight responses. This reduces the number of preflight requests for repeated cross-origin calls.

Setting maxAge to null omits the Access-Control-Max-Age header entirely. Setting it to -1 sends the header but disables caching.

When your API and frontend are deployed on different domains, configure CORS to allow your frontend's origin with credentials:

During development, your frontend and backend often run on different ports. Configure CORS to allow your local frontend origin:

If your API is public and does not require cookies or authentication headers, you can use a permissive configuration:

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/cors
```

Example 2 (lua):
```lua
{
  providers: [
    // ...other providers
    () => import('@adonisjs/cors/cors_provider')
  ]
}
```

Example 3 (dart):
```dart
server.use([
  () => import('@adonisjs/cors/cors_middleware')
])
```

Example 4 (javascript):
```javascript
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
```

---

## Controllers - AdonisJS

**URL:** https://docs.adonisjs.com/guides/basics/controllers

**Contents:**
- Controllers
- Overview
- Creating your first controller
    - Generate the controller
    - Add your first action
    - Connect the controller to a route
    - Test it out
- The barrel file
- Understanding controller lifecycle
- Dependency injection

This guide covers controllers in AdonisJS applications. You will learn how to:

Prerequisite: You should be familiar with routing before learning about controllers, as controllers are connected to your application through routes.

Controllers organize route handlers into dedicated JavaScript classes, solving the problem of route file bloat. Instead of defining all your route logic inline, controllers let you group related request handlers into a single class, where each method (called an action) handles a specific route.

A typical controller represents a resource (like Users, Posts, or Comments) and defines actions for creating, reading, updating, and deleting that resource. Controllers keep your routes file clean and readable, enable dependency injection for services and other dependencies, and follow RESTful conventions for resource-based CRUD operations.

Without controllers, your routes file becomes cluttered with inline handlers.

With controllers, you organize handlers into reusable classes.

Controllers are stored in the app/controllers directory. The easiest way to create a controller is using the make:controller command.

This command creates a controller scaffolded with a plain JavaScript class and a default export.

A controller action is simply a method that handles an HTTP request. Let's add an index method to list all posts.

A few important things to know about controller actions:

Now bind your controller action to a route.

The first argument (controllers.Posts) references your PostsController class, while the second argument ('index') specifies which method to call. The controller is lazy-loaded, meaning it's only imported when the route is accessed.

Start your development server if it's not already running.

Visit http://localhost:3333/posts in your browser. You should see the JSON response from your controller.

The #generated/controllers import you used in the routing step is powered by a barrel file - a single file that consolidates all your controller imports into one convenient location. This barrel file is automatically generated and maintained by AdonisJS.

The barrel file is located at .adonisjs/server/controllers.ts and is automatically created when you start your development server. It stays up-to-date as you add or remove controllers.

Without the barrel file, you would need to manually import each controller individually in your routes file.

The barrel file eliminates this repetition.

See also: Barrel files generation guide for detailed configuration options.

Controllers in AdonisJS are instantiated per request. Every time an HTTP request matches a route bound to a controller, AdonisJS creates a fresh instance of that controller class using the IoC container.

Controllers support dependency injection, allowing you to inject services, repositories, or other classes into your controller methods or constructors. The IoC container automatically resolves and injects these dependencies for you.

See also: Dependency Injection guide for a comprehensive understanding of how dependency injection works in AdonisJS.

Constructor injection injects dependencies once when the controller is instantiated. Use this when all or most methods in your controller need the same dependencies.

Method injection injects dependencies into individual controller methods. Use this when only specific methods need certain dependencies, or different methods require different dependencies.

With method injection:

Resource-driven controllers follow RESTful conventions for handling CRUD (Create, Read, Update, Delete) operations on a resource. AdonisJS provides special routing methods that automatically map HTTP verbs to standard controller methods.

A typical resourceful controller defines seven methods that handle all CRUD operations.

Create a controller with all seven methods pre-filled using the --resource flag. This generates a controller with all seven method stubs already in place, saving you time and ensuring you follow RESTful conventions.

Instead of manually defining seven individual routes, use the router.resource() method to create all seven routes in a single line.

This generates the following routes.

Nested resources represent hierarchical relationships between resources. For example, comments that belong to posts.

This creates routes with both parent and child IDs.

Your controller receives both parent and child parameters.

Shallow resources omit the parent ID from routes where the child resource can be uniquely identified on its own. This is useful when the child ID is globally unique and doesn't need to be scoped to the parent.

With shallow resources, the show, edit, update, and destroy actions omit the parent ID since a comment can be looked up by its own ID:

Use shallow nesting when the child resource has a globally unique identifier and doesn't require the parent ID for lookup. This creates cleaner, shorter URLs while maintaining the hierarchical relationship where needed (creation and listing).

Routes created by router.resource() are automatically named using a combination of the resource name and the controller action. The resource name is converted to snake_case and concatenated with the action name using a dot (.) separator.

For example, router.resource('posts', controllers.Posts) generates route names like:

You can customize the route names using the .as() method.

This changes the route names while keeping the URL paths the same.

Naming routes is important because it allows you to reference routes by name rather than hardcoding URLs throughout your application.

By default, router.resource() creates all seven RESTful routes. You can filter which routes are generated using several methods.

When building APIs, you typically don't need the create and edit routes since forms are displayed by client-side code. The .apiOnly() method excludes these routes and creates only five routes: index, store, show, update, and destroy:

For more granular control, use the .only() or .except() methods. These methods accept an array of action names.

The .only() method creates only the specified routes.

The .except() method creates all routes except the specified ones.

By default, resource routes use :id as the parameter name. You can customize this using the .params() method, which accepts an object where the key is the resource name and the value is the desired parameter name.

This changes the URL parameters from :id to :post:

The same approach works for nested resources, generating URLs like /posts/:post/comments/:comment.

You can apply middleware to specific resource routes using the .use() method. This method accepts an array of action names and the middleware to apply. For example, to apply authentication middleware only to routes that modify data (create, store, update, destroy) while leaving read-only routes (index, show) public.

To apply middleware to all resource routes, use the wildcard * to ensure all routes in the resource require authentication.

Controllers work out of the box with no initial configuration required. However, you can customize certain aspects of how controllers are generated and organized.

By default, controllers are stored in the app/controllers directory. You can change this location in your adonisrc.ts file.

See also: AdonisRC reference

The auto-generated barrel file at #generated/controllers can be customized to control which controllers are included or excluded, and how the file is generated.

See also: Barrel files generation guide

**Examples:**

Example 1 (python):
```python
import router from '@adonisjs/core/services/router'

router.get('/posts', async () => {
  // Logic to fetch all posts
  return { posts: [] }
})

router.get('/posts/:id', async ({ params }) => {
  // Logic to fetch a single post
  return { post: {} }
})

router.post('/posts', async ({ request }) => {
  // Logic to create a post
  return { post: {} }
})

// This file becomes unmanageable as routes grow
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// Clean, organized route definitions
router.get('/posts', [controllers.Posts, 'index'])
router.get('/posts/:id', [controllers.Posts, 'show'])
router.post('/posts', [controllers.Posts, 'store'])
```

Example 3 (python):
```python
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ serialize }: HttpContext) {
    // Logic to fetch all posts
    return serialize({ posts: [] })
  }

  async show({ params, serialize }: HttpContext) {
    // Logic to fetch a single post
    return serialize({ post: {} })
  }

  async store({ request, serialize }: HttpContext) {
    // Logic to create a post
    return serialize({ post: {} })
  }
}
```

Example 4 (unknown):
```unknown
node ace make:controller posts
```

---

## Introduction - AdonisJS

**URL:** https://docs.adonisjs.com/guides/ace/introduction

**Contents:**
- Ace Command line
- Overview
- Running Ace commands
- Viewing available commands
- Getting help for specific commands
- Controlling color output
- Creating command aliases
  - How alias expansion works
- Running commands programmatically

This guide introduces you to the Ace command line. You will learn about the following topics:

Ace is AdonisJS's command line framework that powers all console commands in your application. Whether you're running database migrations, creating controllers, or building custom CLI tools, Ace provides the foundation for all command line interactions.

The framework handles command parsing, argument validation, interactive prompts, and terminal output formatting, allowing you to focus on building command logic rather than dealing with CLI boilerplate. Every AdonisJS application includes Ace by default, accessible through the ace.js entry point file in your project root.

Understanding how to use Ace effectively is essential for AdonisJS development, as you'll interact with it constantly during development and deployment.

You can execute Ace commands using the ace.js file located in your project root. This file serves as the entry point for all command line operations.

Do not modify the ace.js file directly. If you need to add custom code that runs before Ace starts, put it in the bin/console.ts file instead.

To see a list of all available commands in your application, run the ace entry point without any arguments or use the list command explicitly.

Both commands display the same help screen, showing all registered commands organized by category.

The help output follows the docopt standard, a specification for command line interfaces that ensures consistent documentation formatting across different tools.

Every Ace command includes built-in help documentation. To view detailed information about a specific command, including its arguments, flags, and usage examples, append the --help flag to any command.

The help screen shows the command's description, required and optional arguments, available flags with their descriptions, and usage examples.

Ace automatically detects your terminal environment and disables colorful output when the terminal doesn't support ANSI colors. However, you can manually control color output using the --ansi flag.

Disabling colors is useful when redirecting command output to files or when running commands in CI/CD environments that don't support colored terminal output.

Command aliases provide shortcuts for frequently used commands with specific flag combinations. This is particularly useful when you find yourself repeatedly typing the same command with the same flags.

You can define aliases in the adonisrc.ts file using the commandsAliases object. Each alias maps a short name to a complete command with its flags.

Once defined, you can use the alias name instead of typing the full command. Any additional arguments you provide are appended to the expanded command.

When you run a command, Ace follows this expansion process:

For example, if you run:

The expansion preserves argument order and allows you to add additional flags beyond those defined in the alias.

You can execute Ace commands from within your application code using the ace service. This is useful for building workflows that need to trigger commands programmatically, such as running migrations during application setup or generating files based on user actions.

The ace service is available after your application has been booted, ensuring all necessary services and providers are loaded before command execution.

Before executing commands, you should verify that the command exists to avoid runtime errors. Use the ace.hasCommand method to check command availability.

The ace.boot() method loads all commands if they haven't been loaded already. This ensures the hasCommand check works correctly by verifying against the complete command registry.

**Examples:**

Example 1 (unknown):
```unknown
node ace
node ace make:controller
node ace migration:run
```

Example 2 (markdown):
```markdown
node ace

# Same as above
node ace list
```

Example 3 (unknown):
```unknown
node ace make:controller --help
```

Example 4 (markdown):
```markdown
# Disable colors
node ace list --no-ansi

# Force enable colors
node ace list --ansi
```

---
