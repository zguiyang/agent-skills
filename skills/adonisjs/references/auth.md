# Auth — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/auth/access-tokens-guard](https://docs.adonisjs.com/guides/auth/access-tokens-guard)
- [guides/auth/authorization](https://docs.adonisjs.com/guides/auth/authorization)
- [guides/auth/basic-auth-guard](https://docs.adonisjs.com/guides/auth/basic-auth-guard)
- [guides/auth/custom-auth-guard](https://docs.adonisjs.com/guides/auth/custom-auth-guard)
- [guides/auth/introduction](https://docs.adonisjs.com/guides/auth/introduction)
- [guides/auth/session-guard](https://docs.adonisjs.com/guides/auth/session-guard)
- [guides/auth/social-authentication](https://docs.adonisjs.com/guides/auth/social-authentication)
- [guides/auth/verifying-user-credentials](https://docs.adonisjs.com/guides/auth/verifying-user-credentials)

## Condensed excerpts (prefer live docs if conflict)

### guides/auth/access-tokens-guard
Source: https://docs.adonisjs.com/guides/auth/access-tokens-guard

This guide covers token-based authentication in AdonisJS. You will learn:

*   How access tokens work and when to use them
*   How to configure the tokens provider on your User model
*   How to issue tokens with abilities and expiration
*   How to authenticate requests using tokens
*   How to manage tokens (list, delete, revoke)

## Overview

Access tokens authenticate HTTP requests in contexts where the server cannot use cookies. This includes native mobile apps, desktop applications, third-party API integrations, and web applications hosted on a different domain than your API.

AdonisJS uses opaque access tokens rather than JWTs. An opaque token is a cryptographically secure random string with no embedded data. The token is hashed and stored in your database, and verification happens by comparing the provided token against the stored hash. This approach allows you to revoke tokens instantly by deleting them from the database, something that's not possible with JWTs until they expire.

A token consists of three parts: a configurable prefix (`oat_` by default), the random token value, and a CRC32 checksum. The prefix and checksum help [secret scanning tools](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) identify leaked tokens in codebases.

## Configuring the User model

Before using the access tokens guard, configure a tokens provider on your User model. The provider handles creating, storing, and verifying tokens.

```
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

The `DbAccessTokensProvider.forModel` method accepts the User model as its first argument and an optional configuration object as its second:

```
static accessTokens = DbAccessTokensProvider.forModel(User, {
  expiresIn: '30 days',
  prefix: 'oat_',
  table: 'auth_access_tokens',
  type: 'auth_token',
  tokenSecretLength: 40,
})
```

| Option | Description |
| --- | --- |
| `expiresIn` | Default token lifetime. Accepts seconds as a number or a time expression like `'30 days'`. Tokens don't expire by default. Can be overridden when creating individual tokens. |
| `prefix` | Prefix for the public token value. Helps secret scanners identify your tokens. Defaults to `oat_`. Changing this invalidates existing tokens. |
| `table` | Database table for storing tokens. Defaults to `auth_access_tokens`. |
| `type` | Identifier for this token type. Useful when your application issues multiple types of tokens. Defaults to `auth_token`. |
| `tokenSecretLength` | Length of the random token value in characters. Defaults to `40`. |

## Creating the tokens table

The `add` command creates a migration for the tokens table when you select the access tokens guard. Run the migration to create the table:

`node ace migration:run`

If you're configuring access tokens manually, create the migration yourself:

`node ace make:migration auth_access_tokens`

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('tokenable_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## Issuing tokens

Use the tokens provider on your User model to create tokens. The `create` method accepts a user instance and returns an [AccessToken](https://github.com/adonisjs/auth/blob/10.x/modules/access_tokens_guard/access_token.ts) object:

```
import User from '#models/user'
import router from '@adonisjs/core/services/router'

// Official pattern: define a POST route that creates User.accessTokens for a user.
// Full sample: https://docs.adonisjs.com/guides/auth/access-tokens-guard
async function issueBearerCredential({ params }) {
  const user = await User.findOrFail(params.id)
  const accessCredential = await User.accessTokens.create(user)
  return {
    type: 'bearer',
    value: accessCredential.value!.release(),
  }
}
// Bind issueBearerCredential with router.<http-verb> in start/routes.ts
```

The `token.value` property contains the actual token string wrapped in a [Secret](https://docs.adonisjs.com/reference/helpers#secret) object. Call `.release()` to get the plain string value. This value is only available at creation time. After the HTTP response completes, the plain credential string cannot be retrieved again because only its hash is stored.

You can also return the token object directly, which serializes to JSON automatically:

```
async function issueBearerCredentialObject({ params }) {
  const user = await User.findOrFail(params.id)
  return await User.accessTokens.create(user) // serializes to JSON
}
// Bind with the framework router HTTP verb helper in start/routes.ts
// Docs: https://docs.adonisjs.com/guides/auth/access-tokens-guard

/**
 * Response:
 * {
 *   "type": "bearer",
 *   "value": "oat_MTA.aWFQUmo2WkQzd3M5cW0zeG5JeHdiaV9rOFQzUWM1aTZSR2xJaDZXYzM5MDE4MzA3NTU",
 *   "expiresAt": null
 * }
 */
```

### Token abilities

Abilities let you restrict what a token can do. For example, you might issue a token that can read projects but not create or delete them.

`const token = await User.accessTokens.create(user, ['projects:read', 'projects:list'])`

Abilities are stored as an array of strings. Define whatever abilities make sense for your application. Common patterns include resource-based abilities (`projects:read`, `users:delete`) and role-based abilities (`admin`, `editor`).

To allow all abilities, use the wildcard:

`const token = await User.accessTokens.create(user, ['*'])`

Check abilities when handling requests:

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .delete('/projects/:id', async ({ auth, response }) => {
    if (!auth.user!.currentAccessToken.allows('projects:delete')) {
      return response.forbidden('Token lacks projects:delete ability')
    }

    // Delete project...
  })
  .use(middleware.auth({ guards: ['api'] }))
```

The `AccessToken` class provides these methods for checking abilities:

| Method | Description |
| --- | --- |
| `allows(ability)` | Returns `true` if the token has the specified ability or the wildcard (`*`). |
| `denies(ability)` | Returns `true` if the token does not have the specified ability. |

### Token expiration

Set an expirati

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/authorization
Source: https://docs.adonisjs.com/guides/auth/authorization

Authorization (Auth) - AdonisJS Documentation 

Authorization 

Authorization 
This guide covers authorization in AdonisJS using Bouncer. You will learn how to: 
Define authorization checks as abilities and policies 
Use authorization throughout your application (controllers, templates, APIs) 
Handle advanced scenarios like guest users and policy hooks 
Implement authorization in API and Inertia applications 
Overview 
Authorization determines what authenticated users are allowed to do in your application. While authentication answers "who are you?", authorization answers "what can you do?". Bouncer provides a structured way to define and check permissions throughout your AdonisJS application. 
Instead of scattering authorization checks throughout your codebase, Bouncer encourages you to extract them into dedicated locations. This keeps your authorization logic centralized, reusable, and testable. 
Installation 
Install and configure Bouncer using the following command. 

```
node ace add @adonisjs/bouncer
```

Steps performed by the add command Registers the 
```
@adonisjs/bouncer/bouncer_provider
```
service provider and 
```
@adonisjs/bouncer/commands
```
inside the file. 
Creates the 
```
app/abilities/main.ts
```
file to define and export abilities. 
Creates the 
```
initialize_bouncer_middleware.ts
```
file inside the middleware directory and registers it within the file. 

Defining abilities 
An ability is a function that checks whether a user is authorized to perform a specific action. Abilities are lightweight and work well when you have a small number of simple authorization checks. 
Abilities are defined in the 
```
app/abilities/main.ts
```
file using the method. Each ability receives the user as the first parameter, followed by any resources needed to make the authorization decision, then returns a boolean value indicating whether the action is allowed. 
app/abilities/main.ts 

```
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

The ability checks if a user owns a specific post by comparing user IDs. The ability verifies if a user has an admin role. Notice that only needs the user parameter since it doesn't check permissions against a specific resource. 
Using abilities in controllers 
You can check abilities in your controllers using the object. Import the ability you want to check and pass it to one of the bouncer methods. 
app/controllers/posts_controller.ts 

```
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

Notice that you only pass the parameter to , not the user. The bouncer is already tied to the currently logged-in user and automatically provides it as the first argument to your ability. 
Authorization methods 
Bouncer provides four methods for checking authorization, each suited to different use cases. 
Using allows and denies 
The method checks if the user is authorized and returns if they are. The method is the opposite, returning if the user is not authorized. 
app/controllers/posts_controller.ts 

```
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

Using authorize 
The method throws an 
```
AuthorizationException
```
when authorization fails. This exception is automatically converted to an appropriate HTTP response based on content negotiation. 
app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import { editPost } from '#abilities/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async update({ bouncer, params }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    await bouncer.authorize(editPost, post)

    // If we reach here, authorization succeeded
    return 'Post updated successfully'
  }
}
```

Using execute 
The method returns an 
```
AuthorizationResponse
```
object that contains detailed information about the authorization check. This is useful for advanced scenarios where you need to inspect the authorization result beyond a simple boolean. 
app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import { editPost } from '#abilities/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async update({ bouncer, params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    const result = await bouncer.execute(editPost, post)

    if (!result.authorized) {
      return response
        .status(result.status || 403)
        .send({ error: result.message || 'Unauthorized' })
    }

    return 'Post updated successfully'
  }
}
```

The 
```
AuthorizationResponse
```
object has three properties: (boolean), (string or undefined), and (number or undefined). You can use these to create custom error responses with specific status codes and messages. 
Custom authorization responses 
By default, abilities return boolean values. However, you can return an 
```
AuthorizationResponse
```
object to specify custom error messages and status codes. 
app/abilities/main.ts 

```
import User from '#models/user'
import Post from '#models/post'
import { Bouncer, AuthorizationResponse } from '@adonisjs/bouncer'

export const editPost = Bouncer.ability((user: User, post: Post) => {
  if (user.id === post.userId) {
    return AuthorizationResponse.allow()
  }
  
  return AuthorizationResponse.deny('Post not found', 404)
})
```

In this example, when authorization fails, the error message will be "Post not found" with a 404 status code instead of the default 403 Forbidden. This is useful when you want to hide the existence of a resource from unauthorized users. 
Defining policies 
A policy is a class that groups multiple authorization checks for a specific resource. Policies are recommended when you need structured authorization around specific resources or when you have many authorization checks throughout your application. For example, you mig

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/basic-auth-guard
Source: https://docs.adonisjs.com/guides/auth/basic-auth-guard

Basic auth guard (Auth) - AdonisJS Documentation 

Basic auth guard 

Basic auth guard 
This guide covers authenticating HTTP requests using the HTTP Basic Authentication protocol. You will learn: 
How basic authentication works and when to use it 
How to configure the basic auth guard and user provider 
How to authenticate requests using basic auth 
How to protect routes with the auth middleware 
Overview 
The Basic auth guard implements the  [link:https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication] HTTP authentication framework . The client sends credentials as a base64-encoded string in the header with each request. For example, 
```
Authorization: Basic am9obkBleGFtcGxlLmNvbTpzZWNyZXQ=
```
contains the email and password for a user. 
Basic authentication is stateless because the server does not maintain any persistent sessions or issue tokens. Instead, the client must include the credentials in every request. Because credentials are sent in plain (only base64 encoded), basic authentication must always be used over HTTPS in production. 
While simple to set up, basic authentication is not recommended for production applications due to the lack of modern security features like MFA or account management. It is primarily used during early development or for simple internal tools. 
Configuring the guard 
First, define the basic auth guard in your file. You must import and 
```
basicAuthUserProvider
```
from the 
```
@adonisjs/auth/basic_auth
```
module. 
config/auth.ts 

```
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

The 
```
basicAuthUserProvider
```
uses your User model to find and verify credentials. It expects the model to have a static method, which is typically provided by the  [link:/guides/auth/verifying-user-credentials#using-the-authfinder-mixin] AuthFinder mixin . 
Configuring the User model 
The 
```
basicAuthUserProvider
```
works with any Lucid model that represents your user entity. During installation, the command generates a model with the mixin applied. 
app/models/user.ts 

```
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

Authenticating requests 
Clients must include the header with the word followed by a space and the base64-encoded credentials (usually ). 

```
Authorization: Basic am9obkBleGFtcGxlLmNvbTpzZWNyZXQ=
```

Using the auth middleware 
Apply the middleware to routes that require authentication. The middleware automatically reads the header, verifies the credentials using the configured provider, and attaches the user to the HTTP context. 
start/routes.ts 

```
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

The middleware throws  [link:/reference/exceptions#e_unauthorized_access] E_UNAUTHORIZED_ACCESS if the credentials are missing or invalid. 
Manual authentication 
To authenticate without the middleware, call or 
```
auth.authenticateUsing()
```
. 
start/routes.ts 

```
router.get('/projects', async ({ auth }) => {
  /**
   * Authenticate using the default guard.
   * Throws E_UNAUTHORIZED_ACCESS on failure.
   */
  const user = await auth.authenticate()
  
  return user.related('projects').query()
})
```

Warning 
Basic authentication performs a database lookup and password verification on every request. This is computationally expensive compared to session or token-based authentication. If performance is a concern, consider moving to the  [link:/guides/auth/session-guard] Session guard or  [link:/guides/auth/access-tokens-guard] Access tokens guard as your application grows. 

Next steps 
 [link:/guides/auth/verifying-user-credentials] Verifying user credentials : Learn how the User model handles password verification. 
 [link:/guides/auth/session-guard] Session guard : Cookie-based authentication for web apps. 
 [link:/guides/auth/access-tokens-guard] Access tokens guard : Token-based authentication for APIs and mobile apps. 

 [link:/guides/auth/access-tokens-guard] Previous  [link:/guides/auth/custom-auth-guard] Custom auth guard Learn how to create a custom authentication guard for AdonisJS. 

Next

---

### guides/auth/custom-auth-guard
Source: https://docs.adonisjs.com/guides/auth/custom-auth-guard

Custom auth guard (Auth) - AdonisJS Documentation 

Custom auth guard 

Creating a custom auth guard 
This guide covers building custom authentication guards in AdonisJS. You will learn: 
When to create a custom guard instead of using built-in options 
How to design a user provider interface for your guard 
How to implement the guard contract 
How to generate and verify tokens 
How to register and use your custom guard 
Overview 
AdonisJS ships with session, access token, and basic auth guards that cover most authentication needs. However, you might need a custom guard for specific requirements like JWT authentication, API keys, or integration with external identity providers. 
A custom guard consists of two parts: a user provider interface that defines how to find users, and a guard implementation that handles the authentication logic. This separation allows the same guard to work with different data sources (Lucid models, Prisma, external APIs) by swapping the user provider. 
This guide walks through building a JWT authentication guard as a practical example. The concepts apply to any custom authentication mechanism. 
Note 
This is advanced content. Before building a custom guard, verify that the  [link:/guides/auth/session-guard] session guard ,  [link:/guides/auth/access-tokens-guard] access tokens guard , or  [link:/guides/auth/basic-auth-guard] basic auth guard don't meet your needs. 

Project structure 
All the code in this guide goes into a single file that you can expand later. Create the file at 
```
app/auth/guards/jwt.ts
```
: 

```
mkdir -p app/auth/guards
touch app/auth/guards/jwt.ts
```

Defining the user provider interface 
Guards should not hardcode how users are fetched from the database. Instead, they define a user provider interface that describes the methods needed for authentication. This lets developers supply their own implementation based on their data layer. 
For a JWT guard, the provider needs to find users by their ID (extracted from the token payload). Start by defining the interface: 
app/auth/guards/jwt.ts 

```
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

The type acts as a bridge between your actual user object (a Lucid model, Prisma object, or plain object) and the guard. The guard uses to get the user's identifier for the token payload and to return the user object after authentication. 
The generic parameter allows the interface to work with any user type. A Lucid-based provider would return a model instance, while a Prisma-based provider would return a Prisma user object. 
Implementing the guard 
The guard must implement the interface from . This interface defines the methods and properties that integrate the guard with AdonisJS authentication. 
Start with the class structure and required properties: 
app/auth/guards/jwt.ts 

```
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

Accepting dependencies 
The guard needs a user provider to find users and HTTP context to read request headers. It also needs configuration options like the JWT secret. Add these as constructor parameters: 
app/auth/guards/jwt.ts 

```
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

Generating tokens 
Install the package to handle JWT creation and verification: 

```
npm i jsonwebtoken @types/jsonwebtoken
```

Implement the method to create a signed JWT containing the user's ID: 
app/auth/guards/jwt.ts 

```
import jwt from 'jsonwebtoken'

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  // ... constructor and properties

  async generate(user: UserProvider[typeof symbols.PROVIDER_REAL_USER]) {
    const providerUser = await this.#userProvider.createUserForGuard(user)
    const token = jwt.sign({ userId: providerUser.getId() }, this.#options.secret)

    return {
      type: 'bearer',
      token: token,
    }
  }
}
```

The method uses the user provider to get the user's ID, then signs a JWT with that ID in the payload. 
Authenticating requests 
The method reads the JWT from the request, verifies it, and fetches the corresponding user: 
app/auth/guards/jwt.ts 

```
import { errors, symbols } from '@adonisjs/auth'

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/introduction
Source: https://docs.adonisjs.com/guides/auth/introduction

## Authentication

This guide introduces the AdonisJS authentication system. You will learn:

*   How guards and providers work together to authenticate users
*   Which guard to choose for your application type
*   How to install and configure the auth package
*   What the Initialize auth middleware does

## Overview

AdonisJS provides a robust authentication system for logging in and authenticating users across different application types, whether you're building a server-rendered application, an API for a SPA, or a backend for mobile apps.

The authentication package is built around two core concepts:

*   **Guards** are end-to-end implementations of a specific authentication method. For example, the session guard authenticates users via cookies and sessions, while the access tokens guard authenticates requests using bearer tokens.
*   **Providers** handle user lookup and token verification from your database. You can use the built-in Lucid provider or implement your own for custom data sources.

The security primitives of AdonisJS are designed to protect against common vulnerabilities. Passwords and tokens are properly hashed, and the implementation guards against [timing attacks](https://en.wikipedia.org/wiki/Timing_attack) and [session fixation attacks](https://owasp.org/www-community/attacks/Session_fixation) .

## What the auth package does not include

The auth package focuses specifically on authenticating HTTP requests. The following features are outside its scope:

*   User registration (forms, email verification, account activation)
*   Account management (password recovery, email updates)
*   Authorization and permissions (use [Bouncer](https://docs.adonisjs.com/guides/auth/authorization) instead)

Tip

Looking for a complete authentication system? [AdonisJS Kit](https://plus.adonisjs.com/kit) provides full-stack components with ready-to-use flows for user registration, email verification, password recovery, profile management, and more.

## Choosing an auth guard

AdonisJS ships with three built-in guards. Use the table below to determine which guard fits your application.

| Application Type | Recommended Guard | Why |
| --- | --- | --- |
| Server-rendered web app | Session | Cookies work naturally with browser requests |
| SPA on the same domain | Session | Share cookies between `api.example.com` and `example.com` |
| SPA on a different domain | Access tokens | Cross-origin requests cannot share cookies |
| Mobile app | Access tokens | Native apps cannot use cookie-based sessions |
| Third-party API access | Access tokens | Clients need long-lived tokens they can store |
| Quick prototyping | Basic auth | Simple to set up, no database tables required |

### Session guard

The session guard uses the [@adonisjs/session](https://docs.adonisjs.com/guides/basics/session) package to track logged-in users. After a successful login, the user's identifier is stored in the session, and a session cookie is sent to the browser. Subsequent requests include this cookie, allowing the server to restore the user's authenticated state.

Sessions and cookies have been the standard for web authentication for decades. They work well when your client can accept and send cookies, which is the case for server-rendered applications and SPAs hosted on the same top-level domain as your API.

See also: [Session guard documentation](https://docs.adonisjs.com/guides/auth/session-guard)

### Access tokens guard

Access tokens are cryptographically secure random strings issued to users after login. The client stores the token and includes it in the `Authorization` header of subsequent requests. AdonisJS uses opaque access tokens (not JWTs) that are stored as hashes in your database for verification.

Use access tokens when your client cannot work with cookies:

*   Native mobile applications
*   Desktop applications
*   Web applications on a different domain than your API
*   Third-party integrations that need programmatic API access

The client application is responsible for storing tokens securely. Access tokens provide unrestricted access to your application on behalf of a user, so leaking them creates security risks.

See also: [Access tokens guard documentation](https://docs.adonisjs.com/guides/auth/access-tokens-guard)

### Basic auth guard

The basic auth guard implements the [HTTP authentication framework](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) . The client sends credentials as a base64-encoded string in the `Authorization` header with each request. If credentials are invalid, the browser displays a native login prompt.

Basic authentication is not recommended for production applications because credentials are sent with every request and the user experience is limited to the browser's built-in prompt. However, it can be useful during early development or for internal tools.

See also: [Basic auth guard documentation](https://docs.adonisjs.com/guides/auth/basic-auth-guard)

## Choosing a user provider

User providers handle finding users and verifying tokens during authentication. Each guard type has specific requirements for its provider.

The session guard provider finds users by their ID (stored in the session). The access tokens guard provider additionally verifies tokens against hashed values in the database. AdonisJS ships with Lucid-based providers for all built-in guards, which use your Lucid models to query the database.

## Installation

The auth package comes pre-configured with the `web` and `api` starter kits. To add it to an existing application, run one of the following commands based on your preferred guard:

```
# Session guard (recommended for web apps)
node ace add @adonisjs/auth --guard=session

# Access tokens guard (recommended for APIs)
node ace add @adonisjs/auth --guard=access_tokens

# Basic auth guard
node ace add @adonisjs/auth --guard=basic_auth
```

See steps performed by the add command

1.   Installs the `@adonisjs/auth` package using the detected package manager.

2.   Registers the following service provider inside the `adonisrc.ts` file.

```
{
      providers: [
        // ...other providers
        () => import('@adonisjs/auth/auth_provider')
      ]
    }
```

1.   Creates and registers the following middleware inside the `start/kernel.ts` file.

```
router.use([
      () => import('@adonisjs/auth/initialize_auth_middleware')
    ])
```

```
router.named({
      auth: () => import('#middleware/auth_middleware'),
      // Only registered when using the session guard
      guest: () => import('#middleware/guest_middleware')
    })
```

1.   Creates the `User` model inside `app/models`.

2.   Creates database migrations for the `users` table.

3.   Creates additional migrations based on the selected guard (for example, `auth_access_tokens` for the access tokens guard).

## The initialize auth middleware

During setup, the `@adonisjs/auth/initialize_auth_middleware` is added to your application's middleware stack. T

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/session-guard
Source: https://docs.adonisjs.com/guides/auth/session-guard

Session guard (Auth) - AdonisJS Documentation 

Session guard 

Session guard 
This guide covers session-based authentication in AdonisJS. You will learn: 
How to configure the session guard 
How to log users in and out 
How to protect routes from unauthenticated access 
How to access the authenticated user 
How to implement "Remember Me" functionality 
How to prevent logged-in users from accessing guest-only pages 
Overview 
The session guard uses the  [link:/guides/basics/session] @adonisjs/session package to track logged-in users. When a user logs in, their identifier is stored in the session, and a cookie is sent to the browser. On subsequent requests, the session middleware reads this cookie and restores the authenticated state. 
Sessions and cookies have been the standard for web authentication for decades. Use the session guard when building server-rendered applications or SPAs hosted on the same top-level domain as your API (for example, your app at with an API at ). 
Configuring the guard 
Authentication guards are defined in . The following example shows a session guard configuration: 
config/auth.ts 

```
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

The method creates an instance of the  [link:https://github.com/adonisjs/auth/blob/10.x/modules/session_guard/guard.ts] SessionGuard class. It accepts a user provider and an optional configuration object for remember me tokens. 
The method creates an instance of  [link:https://github.com/adonisjs/auth/blob/10.x/modules/session_guard/user_providers/lucid.ts] SessionLucidUserProvider , which uses a Lucid model to find users during authentication. 
Logging in 
Use the 
```
auth.use('web').login()
```
method to create a session for a user. The method accepts a User model instance and stores their identifier in the session. 
app/controllers/session_controller.ts 

```
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

The method returns the guard instance configured under the name in your file. 
Logging out 
Use the 
```
auth.use('web').logout()
```
method to destroy the user's session. If the user has an active remember me token, it will also be deleted. 
app/controllers/session_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
```

Protecting routes 
Use the middleware to protect routes from unauthenticated users. The middleware is registered in under the named middleware collection: 
start/kernel.ts 

```
import router from '@adonisjs/core/services/router'

export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
})
```

Apply the middleware to routes that require authentication: 
start/routes.ts 

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('dashboard', ({ auth }) => {
    return `Welcome ${auth.user!.fullName}`
  })
  .use(middleware.auth())
```

By default, the auth middleware authenticates using the guard from your config. To specify guards explicitly, pass them as an option: 
start/routes.ts 

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('dashboard', ({ auth }) => {
    return `Welcome ${auth.user!.fullName}`
  })
  .use(
    middleware.auth({
      guards: ['web', 'api'],
    })
  )
```

When multiple guards are specified, authentication succeeds if any of them authenticates the request. 
Handling authentication errors 
When the auth middleware cannot authenticate a request, it throws the  [link:https://github.com/adonisjs/auth/blob/10.x/src/errors.ts#L21] E_UNAUTHORIZED_ACCESS exception. The exception is converted to an HTTP response using content negotiation: 
Requests with 
```
Accept: application/json
```
receive an array of error objects. 
Requests with 
```
Accept: application/vnd.api+json
```
receive errors formatted per the JSON API specification. 
Server-rendered applications redirect to . You can customize this path in 
```
app/middleware/auth_middleware.ts
```
. 
Accessing the authenticated user 
After authentication, the user instance is available via . This property is populated when using the middleware, the middleware, or when manually calling or . 
start/routes.ts 

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('dashboard', async ({ auth }) => {
    const user = auth.user!
    return await user.getAllMetrics()
  })
  .use(middleware.auth())
```

Avoiding non-null assertions 
If you prefer not to use the non-null assertion operator ( ), use the method instead. It returns the user or throws  [link:/reference/exceptions#e_unauthorized_access] E_UNAUTHORIZED_ACCESS : 
start/routes.ts 

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('dashboard', async ({ auth }) => {
    const user = auth.getUserOrFail()
    return await user.getAllMetrics()
  })
  .use(middleware.auth())
```

Checking authentication status 
Use the property to check if the current request is authenticated: 
start/routes.ts 

```
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .get('dashboard', async ({ auth }) => {
    if (auth.isAuthenticated) {
      return await auth.user!.getAllMetrics()
    }
  })
  .use(middleware.auth())
```

Silent authentication 
The middleware works like the middleware but doesn't throw an exception when the user is unauthenticated. The request continues normally, allowing you to optionally use authentication data when available. 
This is useful for pages that work for both guests and authenticated users, such as a homepage that shows personalized content for logged-in users. 
Register the middleware in your router middleware stack: 
start/kernel.ts 

```
import router from '@adonisjs/core/services/router'

router.use([
  // ...other m

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/social-authentication
Source: https://docs.adonisjs.com/guides/auth/social-authentication

Social authentication (Auth) - AdonisJS Documentation 

Social authentication 

Social authentication 
This guide covers social authentication in AdonisJS using the Ally package. You will learn: 
How to install and configure Ally with OAuth providers 
How to redirect users to a provider and handle callbacks 
How to access user information from the provider 
How to create or find users and log them in 
How to use stateless authentication for SPAs and mobile apps 
How to create custom social drivers 
Overview 
Social authentication allows users to log in using their existing accounts from services like GitHub, Google, X (formerly Twitter), or Discord. Instead of creating a new username and password, users authorize your application to access their profile information from the provider. 
AdonisJS provides the package for social authentication. Ally handles the OAuth flow (redirecting users, exchanging codes for tokens, fetching user data) and provides a consistent API across different providers. It supports OAuth 1.0 (Twitter) and OAuth 2.0 (X, GitHub, Google, and most other providers). 
Ally does not store users or tokens in your database. It handles the OAuth flow and returns user information, which you then use to create or find a user in your database and log them in using an  [link:/guides/auth/introduction] auth guard . 
Installation 
Install and configure the package using the command: 

```
node ace add @adonisjs/ally

# Specify providers during installation
node ace add @adonisjs/ally --providers=github --providers=google
```

See steps performed by the add command Installs the package using the detected package manager. 

Registers the following service provider inside the file. 

```
{
      providers: [
        // ...other providers
        () => import('@adonisjs/ally/ally_provider')
      ]
    }
```

Creates with configuration for the selected providers. 

Defines environment variables for and for each provider. 

Configuration 
Configure your OAuth providers in . Each provider requires a client ID, client secret, and callback URL: 
config/ally.ts 

```
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

Registering callback URLs with providers 
OAuth providers require you to register your callback URL in their developer console. For example, to use GitHub authentication: 
Go to  [link:https://github.com/settings/developers] GitHub Developer Settings 
Create a new OAuth App 
Set the Authorization callback URL to match your in the config 
The callback URL in your config must exactly match what you register with the provider. 
Redirecting users to the provider 
Create a route that redirects users to the OAuth provider. Use to get the driver instance and call . 
Before redirecting, store in the session so that error handlers and calls redirect the user to the correct page in your application instead of the OAuth provider's domain. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'

router.get('/github/redirect', ({ ally, session }) => {
  session.put('redirect.previousUrl', '/login')
  return ally.use('github').redirect()
})
```

Requesting scopes 
Scopes define what data your application can access. Each provider has different available scopes. Configure them in or during the redirect: 
config/ally.ts 

```
github: services.github({
  clientId: env.get('GITHUB_CLIENT_ID'),
  clientSecret: env.get('GITHUB_CLIENT_SECRET'),
  callbackUrl: 'http://localhost:3333/github/callback',
  scopes: ['user:email', 'read:user'],
}),
```

start/routes.ts 

```
router.get('/github/redirect', ({ ally }) => {
  return ally.use('github').redirect((request) => {
    request.scopes(['user:email', 'read:user'])
  })
})
```

Adding query parameters 
Some providers accept additional parameters. For example, Google's parameter controls the consent screen behavior: 
start/routes.ts 

```
router.get('/google/redirect', ({ ally }) => {
  return ally.use('google').redirect((request) => {
    request.param('prompt', 'select_account')
    request.param('access_type', 'offline')
  })
})
```

To remove a parameter set in the config, use : 
start/routes.ts 

```
router.get('/google/redirect', ({ ally }) => {
  return ally.use('google').redirect((request) => {
    request.clearParam('prompt')
  })
})
```

Handling the callback 
After the user authorizes (or denies) access, the provider redirects them to your callback URL. Call on the driver to exchange the authorization code for an access token and fetch the user's profile. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'

router.get('/github/callback', async ({ ally }) => {
  const github = ally.use('github')
  const githubUser = await github.user()

  return githubUser
})
```

If something goes wrong during the callback (the user denied access, the state token doesn't match, or the authorization code is missing), the method throws a self-handled exception. The exception content-negotiates the response automatically: 
HTML requests with a session : the error message is flashed to the session and the user is redirected back. If you stored in the session before the OAuth redirect, the user returns to that page. 
JSON requests : a JSON error response is returned with the appropriate status code. 
JSONAPI requests : a JSONAPI-formatted error response is returned. 
If you need to handle specific error cases yourself, you can still check for them before calling . 
start/routes.ts 

```
router.get('/github/callback', async ({ ally, response }) => {
  const github = ally.use('github')

  if (github.accessDenied()) {
    return response.redirect().toPath('/login?error=access_denied')
  }

  const githubUser = await github.user()
  return githubUser
})
```

User properties 
The method returns a normalized user object with consistent properties across all providers: 
Property Description 
Unique identifier from the provider 
User's email address (may be if not requested or not available) 

```
emailVerificationState
```
One of , , or 
User's display name 
Username or handle (same as if provider doesn't support nicknames) 
URL to the user's profile picture 
Access token object for making API calls 
Raw response from the provider 

Email verification state 
Providers handle email verification differently. Check 
```
emailVerificationState
```
before trusting the email: 
: The provider has verified this email address 
: The email exists but isn't verified 
: The provider doesn't share verification status 
Access token 
The property contains the OAuth token for making addi

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/auth/verifying-user-credentials
Source: https://docs.adonisjs.com/guides/auth/verifying-user-credentials

Verifying user credentials (Auth) - AdonisJS Documentation 

Verifying user credentials 

Verifying user credentials 
This guide covers secure credential verification in AdonisJS. You will learn: 
Why naive password verification is vulnerable to timing attacks 
How to use the AuthFinder mixin for secure credential verification 
How password hashing is handled automatically 
How to handle verification errors 
Overview 
Before a user can be logged in or issued an access token, you need to verify their credentials. This typically means finding a user by their email (or username) and comparing the provided password against the stored hash. 
AdonisJS provides the AuthFinder mixin to handle this securely. The mixin adds a method to your User model that protects against timing attacks while providing a clean API for credential verification. 
Why secure verification matters 
A naive approach to credential verification might look like this: 
app/controllers/session_controller.ts 

```
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

This code is vulnerable to  [link:https://en.wikipedia.org/wiki/Timing_attack] timing attacks . An attacker can measure response times to determine whether an email exists in your database: 
When the email doesn't exist, the response returns quickly because no password hashing occurs. 
When the email exists but the password is wrong, the response takes longer because password hashing algorithms are intentionally slow. 
This timing difference is enough for attackers to enumerate valid email addresses, which they can then target with password attacks. 
Using the AuthFinder mixin 
The AuthFinder mixin solves the timing attack problem by always performing a password hash comparison, even when the user doesn't exist. This ensures consistent response times regardless of whether the email is valid. 
To use the mixin, apply it to your User model: 
app/models/user.ts 

```
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

The method accepts two arguments. The first is a callback that returns the hasher to use for password verification (scrypt in this example, but you can use any configured hasher). The second is a configuration object with the following properties: 
Property Description 
An array of model properties that can identify a user. If your application allows login by username or phone number, include those fields here. 
The model property that stores the hashed password. 

Verifying credentials 
With the mixin applied, use the static method to verify credentials: 
app/controllers/session_controller.ts 

```
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

The method finds the user by the provided UID (email in this case), verifies the password, and returns the user instance. If the credentials are invalid, it throws an 
```
E_INVALID_CREDENTIALS
```
exception. 
Handling verification errors 
When credentials are invalid, throws the  [link:/reference/exceptions#e_invalid_credentials] E_INVALID_CREDENTIALS exception. This exception is self-handling and converts to an appropriate HTTP response based on content negotiation: 
Requests with 
```
Accept: application/json
```
receive an array of error objects with a property. 
Requests with 
```
Accept: application/vnd.api+json
```
receive errors formatted per the JSON API specification. 
Requests using sessions are redirected back with errors available via  [link:/guides/basics/session#flash-messages] flash messages . 
All other requests receive a plain text error response. 
To customize error handling, catch the exception in your  [link:/guides/basics/exception-handling] global exception handler : 
app/exceptions/handler.ts 

```
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

Automatic password hashing 
The AuthFinder mixin registers a  [link:https://github.com/adonisjs/auth/blob/10.x/src/mixins/lucid.ts#L88-L95] beforeSave hook that automatically hashes passwords when creating or updating users. You don't need to manually hash passwords in your models or controllers: 
app/controllers/users_controller.ts 

```
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async store({ request }: HttpContext) {
    const data = request.only(['email', 'password', 'fullName'])
    
    /**
     * Password is automatically hashed before saving
     */
    const user = await User.create(data)
    
    return user
  }
}
```

The hook only hashes the password when the property has changed, so updating other user fields won't trigger unnecessary rehashing. 

 [link:/guides/auth/introduction] Previous  [link:/guides/auth/session-guard] Session guard Learn how to authenticate users using the session guard in AdonisJS. 

Next

---
