# Security — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/security/cors](https://docs.adonisjs.com/guides/security/cors)
- [guides/security/encryption](https://docs.adonisjs.com/guides/security/encryption)
- [guides/security/hashing](https://docs.adonisjs.com/guides/security/hashing)
- [guides/security/rate-limiting](https://docs.adonisjs.com/guides/security/rate-limiting)
- [guides/security/securing-ssr-applications](https://docs.adonisjs.com/guides/security/securing-ssr-applications)

## Condensed excerpts (prefer live docs if conflict)

### guides/security/cors
Source: https://docs.adonisjs.com/guides/security/cors

CORS (Security) - AdonisJS Documentation 

CORS 

CORS 
This guide covers Cross-Origin Resource Sharing (CORS) in AdonisJS applications. You will learn how to: 
Install and configure the CORS middleware 
Control which origins, methods, and headers are allowed 
Handle credentials in cross-origin requests 
Debug common CORS errors 
Overview 
When a browser makes a request to a different domain than the one serving the current page, it enforces Cross-Origin Resource Sharing (CORS) restrictions. This security mechanism prevents malicious scripts from making unauthorized requests to your API on behalf of users. 
For example, if your frontend runs on and your API runs on , the browser will block requests from the frontend unless your API explicitly allows that origin. The same applies during local development when your frontend runs on and your API on . 
Before making certain cross-origin requests, browsers send a preflight request using the HTTP method. This preflight asks your server which origins, methods, and headers are permitted. Your server must respond with the appropriate CORS headers, and only then will the browser proceed with the actual request. 
AdonisJS handles CORS through the package, which provides middleware that automatically responds to preflight requests and attaches the correct headers to all responses. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/cors
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 
adonisrc.ts 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/cors/cors_provider')
  ]
}
```

Creates the file. This file contains the configuration settings for CORS. 

Registers the following middleware inside the file. 
start/kernel.ts 

```
server.use([
  () => import('@adonisjs/cors/cors_middleware')
])
```

Configuration 
The CORS configuration lives in . Here is the default configuration with all available options: 
config/cors.ts 

```
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: app.inDev ? true : [],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
```

In development, is set to to allow all origins for easy local frontend/backend setup. In production, it defaults to an empty array , which blocks all cross-origin requests until you explicitly configure allowed origins. 
Enabling and disabling CORS 
The option turns the middleware on or off without removing it from the middleware stack. This is useful when you want to disable CORS temporarily during debugging or in specific environments. 
config/cors.ts 

```
{
  enabled: process.env.NODE_ENV !== 'test'
}
```

Configuring allowed origins 
The option controls which domains can make cross-origin requests to your API. This sets the 
```
Access-Control-Allow-Origin
```
response header. 
To allow all origins dynamically (the response header will mirror the requesting origin): 
config/cors.ts 

To disallow all cross-origin requests: 
config/cors.ts 

To allow specific domains, provide an array of origins: 
config/cors.ts 

```
{
  origin: ['https://app.example.com', 'https://admin.example.com']
}
```

To allow any origin using the wildcard: 
config/cors.ts 

Warning 
When is set to , the wildcard cannot be used as the 
```
Access-Control-Allow-Origin
```
header value. Browsers reject this combination for security reasons. AdonisJS automatically handles this by reflecting the requesting origin instead of sending the literal when both and are configured. 

For dynamic origin validation, provide a callback function. This is useful when allowed origins are stored in a database or when you need custom validation logic: 
config/cors.ts 

```
{
  origin: (requestOrigin, ctx) => {
    /**
     * requestOrigin is the value of the Origin header.
     * Return true to allow, false to deny.
     */
    const allowedOrigins = ['https://app.example.com']
    return allowedOrigins.includes(requestOrigin)
  }
}
```

Configuring allowed methods 
The option specifies which HTTP methods are permitted for cross-origin requests. The browser's preflight request includes an 
```
Access-Control-Request-Method
```
header, and the server checks this value against the allowed methods. 
config/cors.ts 

```
{
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE']
}
```

Configuring allowed headers 
The option controls which request headers are permitted in cross-origin requests. The browser's preflight request includes an 
```
Access-Control-Request-Headers
```
header listing the headers the client wants to send. 
To allow all headers: 
config/cors.ts 

To allow specific headers: 
config/cors.ts 

```
{
  headers: ['Content-Type', 'Accept', 'Authorization']
}
```

For dynamic header validation, provide a callback: 
config/cors.ts 

```
{
  headers: (requestHeaders, ctx) => {
    return true
  }
}
```

Exposing response headers 
By default, browsers only expose a limited set of response headers to JavaScript. The option lets you specify additional headers that should be accessible to the client. 
config/cors.ts 

```
{
  exposeHeaders: ['X-Request-Id', 'X-RateLimit-Remaining']
}
```

Allowing credentials 
The option controls whether cookies, authorization headers, and TLS client certificates can be included in cross-origin requests. When enabled, the server sends the 
```
Access-Control-Allow-Credentials: true
```
header. 
config/cors.ts 

```
{
  credentials: true
}
```

Tip 
Enable when your frontend needs to send authentication cookies or the header to your API. Without this, browsers strip credentials from cross-origin requests. 

Caching preflight responses 
The option specifies how long (in seconds) browsers should cache preflight responses. This reduces the number of preflight requests for repeated cross-origin calls. 
config/cors.ts 

Setting to omits the 
```
Access-Control-Max-Age
```
header entirely. Setting it to sends the header but disables caching. 
Common scenarios 
API serving a single-page application 
When your API and frontend are deployed on different domains, configure CORS to allow your frontend's origin with credentials: 
config/cors.ts 

```
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: ['https://app.example.com'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  credentials: true,
  maxAge: 90,
})

export default corsConfig
```

Local development with different ports 
During development, your frontend and backend often run on different ports. Configure CORS to allow your local frontend origin: 
config/cors.ts 

```
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  or

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/security/encryption
Source: https://docs.adonisjs.com/guides/security/encryption

Encryption (Security) - AdonisJS Documentation 

Encryption 

Encryption 
This guide covers encryption and decryption in AdonisJS applications. You will learn how to: 
Encrypt and decrypt sensitive data 
Choose and configure encryption algorithms 
Use purpose-bound encryption for added security 
Set expiration times on encrypted values 
Sign data without encrypting using the message verifier 
Implement key rotation for seamless secret updates 
Overview 
Encryption transforms readable data into ciphertext that can only be decrypted with the correct secret key. Unlike hashing, encryption is a reversible process. You encrypt data to protect it during storage or transmission, then decrypt it when you need to read the original value. 
AdonisJS provides an encryption service with built-in support for three industry-standard algorithms: ChaCha20-Poly1305, AES-256-GCM, and AES-256-CBC. All three are authenticated encryption algorithms, meaning they not only protect confidentiality but also detect tampering. If someone modifies the encrypted data, decryption will fail rather than return corrupted data. 
The encryption service produces output in a structured format that includes the driver identifier, ciphertext, initialization vector, and authentication tag. This self-describing format allows you to switch algorithms or rotate keys while maintaining the ability to decrypt older values. 
Basic usage 
The encryption service provides two primary methods: for encrypting values and for retrieving the original data. 
Encrypting values 
The method accepts any serializable value and returns an encrypted string. 
app/services/api_token_service.ts 

```
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

The encryption service supports encrypting strings, numbers, booleans, arrays, objects, and dates. Complex nested structures are automatically serialized before encryption. 
Decrypting values 
The method takes an encrypted string and returns the original value, or if decryption fails. 
app/services/api_token_service.ts 

```
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

The decryption method returns rather than throwing exceptions when decryption fails. This design prevents timing attacks and simplifies error handling. You should always check for before using the decrypted value. 
Purpose-bound encryption 
Purpose-bound encryption ensures that encrypted values can only be decrypted when the same purpose is provided. This prevents token reuse across different contexts in your application. 
app/services/token_service.ts 

```
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

Without purpose binding, an attacker who obtains a password reset token could potentially reuse it as an email verification token if both contain the same data structure. Purpose-bound encryption prevents this attack by cryptographically binding the purpose to the encrypted value. 
app/services/token_service.ts 

```
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

Expiring encrypted values 
You can set a time-to-live on encrypted values. After the specified duration, the decryption method returns even if the encrypted data is valid. 
app/services/invitation_service.ts 

```
import encryption from '@adonisjs/core/services/encryption'

export default class InvitationService {
  createInvitationLink(email: string, teamId: number) {
    const token = encryption.encrypt({ email, teamId }, {
      expiresIn: '24h'
    })
    return `https://app.example.com/invitations/${token}`
  }

  acceptInvitation(token: string) {
    /**
     * Returns null if the token has expired,
     * even if the encrypted data is still valid.
     */
    const payload = encryption.decrypt(token)
    if (!payload) {
      return { error: 'Invalid or expired invitation' }
    }

    return payload as { email: string; teamId: number }
  }
}
```

Supported duration formats include: 
Format Example Description 
Minutes Expires in 30 minutes 
Hours Expires in 1 hour 
Days Expires in 7 days 

You can combine purpose binding with expiration for maximum security. 
app/services/token_service.ts 

```
/**
 * Create a password reset token that expires in 1 hour
 * and can only be used for password reset operations.
 */
const token = encryption.encrypt(
  { userId: 1 },
  { expiresIn: '1h', purpose: 'password-reset' }
)

/**
 * Must provide the correct purpose to decrypt.
 * Returns null if expired or purpose doesn't match.
 */
const payload = encryption.decrypt(token, 'password-reset')
```

Encrypting database columns 
Encrypt sensitive data before storing it in your database. 
app/models/user.ts 

```
import { UserSchema } from '#database/schema'
import { beforeSave } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'

export default class User extends UserSchema {
  @beforeSave()
  static encryptSensitiveData(user: User) {
    if (user.$dirty.ssn && user.ssn) {
      user.ssn = encryption.encrypt(user.ssn)
    }
  }

  decryptSsn(): string | null {
    if (!this.ssn) {
      return null
    }
    return encryption.decrypt(this.ssn)
  }
}
```

Choosing an algorithm 
Each encryption algorithm offers diff

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/security/hashing
Source: https://docs.adonisjs.com/guides/security/hashing

Hashing (Security) - AdonisJS Documentation 

Hashing 

Hashing 
This guide covers password hashing in AdonisJS applications. You will learn how to: 
Hash and verify passwords 
Choose and configure hashing algorithms 
Detect and perform rehashing after configuration changes 
Speed up tests by faking the hash service 
Create custom hash drivers 
Overview 
Password hashing converts plain text passwords into irreversible strings that can be safely stored in your database. Unlike encryption, hashing is a one-way process. You cannot convert a hash back to the original password. Instead, you verify passwords by hashing the input and comparing it to the stored hash. 
AdonisJS provides a hash service with built-in support for three industry-standard algorithms: Argon2, Bcrypt, and Scrypt. The service stores hashes in  [link:https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md] PHC string format , a standardized encoding that embeds the algorithm parameters directly in the hash output. 
Note 
If you're using the module with Lucid models, password hashing and verification are handled automatically by the mixin. This guide focuses on direct usage of the hash service for cases where you need more control or aren't using the authentication module. 

Installation 
The hash service is included with and requires no additional installation for the default Scrypt driver. Scrypt uses Node.js's built-in module, making it available immediately without external dependencies. 
For Argon2 or Bcrypt, you must install their respective npm packages. 

```
# For Argon2 (recommended for new applications)
npm i argon2

# For Bcrypt
npm i bcrypt
```

After installing a package, update your hash configuration to use the new driver. 
Basic usage 
The hash service provides two primary methods: for creating hashes and for validating passwords against existing hashes. 
Creating hashes 
The method accepts a plain text string and returns a hash in PHC format. 
app/services/user_service.ts 

```
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

Verifying passwords 
The method compares a plain text password against a stored hash. It returns if they match, otherwise. 
app/services/auth_service.ts 

```
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

Choosing an algorithm 
Each hashing algorithm offers different tradeoffs between security, performance, and compatibility. The right choice depends on your application's requirements. 
When to choose Argon2 
Argon2 is the recommended choice for new applications. It won the 2015 Password Hashing Competition and provides configurable memory hardness, making it resistant to both GPU-based attacks and specialized hardware. The variant (the default) combines protection against GPU attacks and side-channel attacks. 
When to choose Bcrypt 
Bcrypt remains a solid choice when you need compatibility with existing systems or other platforms. Its security properties are well-understood after decades of analysis. However, be aware that Bcrypt truncates passwords at 72 bytes, so longer passwords are effectively shortened before hashing. 
Warning 
Bcrypt silently truncates passwords longer than 72 bytes. If your application accepts very long passwords or passphrases, users may be able to authenticate with only the first 72 bytes of their password. Consider using Argon2 or Scrypt if this is a concern. 

When to choose Scrypt 
Scrypt is the default driver because it requires no additional npm packages. It uses Node.js's built-in module, making it ideal for applications where minimizing dependencies matters. With proper configuration, Scrypt provides security comparable to Argon2. 
Configuration 
The hash configuration lives in . You define available drivers in the object and specify which one to use by default. 
config/hash.ts 

```
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

Argon2 configuration 
Argon2 provides fine-grained control over memory usage, iteration count, and parallelism. These parameters directly affect both security and performance. 
config/hash.ts 

```
import { defineConfig, drivers } from '@adonisjs/core/hash'

export default defineConfig({
  default: 'argon',

  list: {
    argon: drivers.argon2({
      version: 0x13,
      variant: 'id',
      iterations: 3,
      memory: 65536,
      parallelism: 4,
      saltSize: 16,
      hashLength: 32,
    }),
  },
})
```

string id 

Define the Argon2 variant. 
resists GPU attacks (for cryptocurrency). 
resists side-channel attacks (slower). 
combines both protections (recommended for passwords). 

number 0x13 

Algorithm version defined as hex. (1.0) or (1.3). 

number 3 

Time cost. Higher values increase computation time and security. 

number 65536 

Memory cost in KiB. Each parallel thread uses this amount. Higher values resist GPU attacks. 

number 4 

Number of parallel threads for computing the hash. 

number 16 

Length of the random salt in bytes. 

number 32 

Length of the raw hash output in bytes. The final PHC string will be longer. 

Using secrets with Argon2 
Argon2 supports an optional secret (sometimes called a "pepper") that adds an additional layer of protection. Unlike the salt which

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/security/rate-limiting
Source: https://docs.adonisjs.com/guides/security/rate-limiting

Rate limiting (Security) - AdonisJS Documentation 

Rate limiting 

Rate limiting 
This guide covers rate limiting in AdonisJS applications. You will learn how to: 
Install and configure the limiter package with Redis, database, or memory stores 
Create throttle middleware for HTTP requests 
Apply dynamic rate limits based on user authentication 
Use rate limiting directly for login protection and job queues 
Handle rate limit exceptions and customize error messages 
Create custom storage providers 
Overview 
Rate limiting controls how many requests a user can make to your application within a given time period. When a user exceeds their limit, subsequent requests are rejected until the time window resets. 
You need rate limiting to protect your application from abuse. Without it, a single user (or bot) can overwhelm your server with requests, consuming resources meant for legitimate users. Rate limiting also helps prevent brute-force attacks on login forms, protects expensive API endpoints from overuse, and ensures fair access to shared resources. 
The package is built on top of  [link:https://github.com/animir/node-rate-limiter-flexible] node-rate-limiter-flexible , which provides one of the fastest rate-limiting APIs and uses atomic increments to avoid race conditions. 
Installation 
Install and configure the package using the following command: 

```
node ace add @adonisjs/limiter
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/limiter/limiter_provider')
  ]
}
```

Creates the file. 

Creates the file for defining HTTP throttle middleware. 

Defines the following environment variable and its validation inside the file. 

Optionally creates the database migration for the table if using the store. 

Configuration 
The rate limiter configuration is stored in the file. You define which storage backends are available and which one to use by default. 
config/limiter.ts 

```
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

The property specifies which store to use for rate limiting. The object defines all available storage backends. We recommend always configuring the store so you can use it during testing. 
See also:  [link:https://github.com/adonisjs/limiter/blob/2.x/stubs/config/limiter.stub] Rate limiter config stub 
Environment variables 
The default store is controlled by the environment variable, allowing you to switch stores between environments. For example, you might use during testing and in production. 
The environment variable must be validated in to ensure only configured stores are allowed: 
start/env.ts 

```
{
  LIMITER_STORE: Env.schema.enum(['redis', 'database', 'memory'] as const),
}
```

Shared options 
All storage backends accept the following options: 
config/limiter.ts 

```
{
  duration: '1 minute',
  requests: 10,

  /**
   * After 12 requests, block the key in memory
   * and stop querying the database.
   */
  inMemoryBlockOnConsumed: 12,
  inMemoryBlockDuration: '1 min'
}
```

Prefix for keys in storage. The database store ignores this since separate tables provide isolation. 

Adds artificial delay to spread requests evenly across the time window. See  [link:https://github.com/animir/node-rate-limiter-flexible/wiki/Smooth-out-traffic-peaks] smooth out traffic peaks for details. 

```
inMemoryBlockOnConsumed
```

Number of requests after which to block the key in memory, reducing database queries from abusive users. 

```
inMemoryBlockDuration
```

How long to block keys in memory. Reduces database load by checking memory first. The 
```
inMemoryBlockOnConsumed
```
option is useful when users continue making requests after exhausting their quota. Instead of querying the database for every rejected request, you can block them in memory: 

Redis store 
The Redis store requires the package to be configured first. 
config/limiter.ts 

```
{
  redis: stores.redis({
    connectionName: 'main',
    rejectIfRedisNotReady: false,
  }),
}
```

The Redis connection from . We recommend using a separate database for the limiter. 

```
rejectIfRedisNotReady
```

When , rejects rate-limiting requests if Redis connection status is not . 

Database store 
The database store requires the package to be configured first. 
Warning 
The database store only supports MySQL, PostgreSQL, and SQLite. Other databases like MongoDB are not compatible and will throw an error at runtime. 

config/limiter.ts 

```
{
  database: stores.database({
    connectionName: 'mysql',
    dbName: 'my_app',
    tableName: 'rate_limits',
    schemaName: 'public',
    clearExpiredByTimeout: false,
  }),
}
```

The database connection from . Uses the default connection if not specified. 

The database name for SQL queries. Inferred from connection config, but required when using a connection string. 

The table for storing rate limit data. 

The schema for SQL queries (PostgreSQL only). 

```
clearExpiredByTimeout
```

When , clears expired keys every 5 minutes. Only keys expired for more than 1 hour are removed. 

Throttling HTTP requests 
The most common use case is throttling HTTP requests with middleware. The method creates reusable throttle middleware that you can apply to routes. 
Open the file to see the pre-defined global throttle middleware. This middleware allows users to make 10 requests per minute based on their IP address: 
start/limiter.ts 

```
import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})
```

Apply the middleware to any route: 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { throttle } from '#start/limiter'

router
  .get('/', () => {})
  .use(throttle)
```

When a user exceeds 10 requests within a minute, they receive a 
```
429 Too Many Requests
```
response until the time window resets. 
Using a custom key 
By default, requests are rate-limited by the user's IP address. You can specify a different key using the method. This is useful when you want to limit by user ID, API key, or any other identifier: 
start/limiter.ts 

```
export const throttle = limiter.define('global', (ctx) => {
  return limiter
    .allowRequests(10)
    .every('1 minute')
    .usingKey(`user_${ctx.auth.user.i

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/security/securing-ssr-applications
Source: https://docs.adonisjs.com/guides/security/securing-ssr-applications

Securing SSR apps (Security) - AdonisJS Documentation 

Securing SSR apps 

Securing server-rendered applications 
This guide covers security features for AdonisJS server-rendered applications. You will learn how to: 
Protect forms from CSRF (Cross-Site Request Forgery) attacks 
Define CSP (Content Security Policy) rules to prevent XSS attacks 
Configure HSTS to enforce HTTPS connections 
Prevent clickjacking with X-Frame-Options headers 
Disable MIME sniffing to avoid content-type attacks 
Overview 
Web applications face constant security threats. Attackers exploit vulnerabilities like form submission forgery, malicious script injection, and clickjacking to compromise your users. The package provides a unified defense layer that protects your server-rendered AdonisJS applications from these common attacks. 
Shield works by adding security-focused HTTP headers and middleware to your application. Rather than configuring each protection separately, Shield gives you a single package with sensible defaults that you can customize as needed. All protections are configured through , making it easy to audit and adjust your security posture. 
The package comes pre-configured with the web starter kit. If you need to install it manually, ensure you have the package configured first, as Shield depends on sessions to store CSRF tokens. 

```
node ace add @adonisjs/shield
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/shield/shield_provider'),
  ]
}
```

Creates the file. 

Registers the following middleware inside the file. 

```
router.use([() => import('@adonisjs/shield/shield_middleware')])
```

CSRF protection 
CSRF (Cross-Site Request Forgery) attacks trick authenticated users into submitting malicious requests without their knowledge. Imagine a user is logged into your banking application. While browsing another site, that malicious site includes a hidden form that submits a money transfer request to your bank. Because the user's browser automatically includes their session cookie, the bank processes the transfer as if the user intended it. 
Shield prevents CSRF attacks by requiring a secret token with every form submission. This token is generated server-side and embedded in your forms. Since attackers cannot access this token from their malicious site, their forged requests will be rejected. 
Protecting forms 
Once Shield is configured, all form submissions without a valid CSRF token will fail automatically. You must include the token in every form using the Edge helper, which renders a hidden input field containing the token. 
resources/views/posts/create.edge 

```
<form method="POST" action="/posts">
  {{-- Renders a hidden input with the CSRF token --}}
  {{ csrfField() }}

  <input type="text" name="title" placeholder="Post title">
  <textarea name="content" placeholder="Write your post..."></textarea>
  <button type="submit">Create Post</button>
</form>
```

The helper generates a hidden input field that Shield's middleware validates on submission. 
Output HTML 

```
<form method="POST" action="/posts">
  <input type="hidden" name="_csrf" value="Q9ghWSf0-3FD9eCiu5YxvKaxLEZ6F_K4DL8o"/>
  
  <input type="text" name="title" placeholder="Post title">
  <textarea name="content" placeholder="Write your post..."></textarea>
  <button type="submit">Create Post</button>
</form>
```

Handling CSRF errors 
Shield raises an exception when a token is missing or invalid. By default, AdonisJS redirects the user back to the form with an error flash message. You can display this message in your template using the tag. 
resources/views/posts/create.edge 

```
@error('E_BAD_CSRF_TOKEN')
  <p class="error">{{ $message }}</p>
@end

<form method="POST" action="/posts">
  {{ csrfField() }}
  {{-- form fields --}}
</form>
```

For custom error handling, you can catch the exception in your global exception handler. This is useful when you want to render a custom error page or return a specific response format. 
app/exceptions/handler.ts 

```
import app from '@adonisjs/core/services/app'
import { errors } from '@adonisjs/shield'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Check if the error is a CSRF token error and return
     * a custom response instead of the default redirect.
     */
    if (error instanceof errors.E_BAD_CSRF_TOKEN) {
      return ctx.response
        .status(error.status)
        .send('Your session has expired. Please refresh the page and try again.')
    }

    return super.handle(error, ctx)
  }
}
```

Enabling CSRF tokens for Ajax requests 
Single-page applications and interactive interfaces often submit forms via JavaScript instead of traditional form submissions. For these cases, Shield can expose the CSRF token in a cookie that your frontend code can read. 
When is enabled, Shield stores the token in an encrypted cookie named . Frontend libraries like Axios automatically read this cookie and include it as an header with every request. 
config/shield.ts 

```
import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true, 
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

export default shieldConfig
```

Tip 
Only enable if your application makes Ajax requests. For traditional server-rendered forms that use full page submissions, the hidden input field is sufficient and more secure. 

Exempting routes from CSRF protection 
API endpoints that receive webhooks or requests from external services cannot include CSRF tokens. You can exempt specific routes using the option. 
config/shield.ts 

```
import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  csrf: {
    enabled: true,
    exceptRoutes: [
      '/api/webhooks/*',
      '/api/payments/callback',
    ],
    enableXsrfCookie: false,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

export default shieldConfig
```

For dynamic exemption logic, pass a function that receives the HTTP context and returns a boolean. 
config/shield.ts 

```
import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  csrf: {
    enabled: true,
    exceptRoutes: (ctx) => {
      /**
       * Exempt all routes starting with /api/ since these
       * are consumed by external services with their own
       * authentication mechanisms.
       */
      return ctx.request.url().startsWith('/api/')
    },
    enableXsrfCookie: false,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

export default shieldConfig
```

CSRF configuration reference 
Option Type Description 
Turn CSRF protection on or off. 
or Routes to exempt

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
