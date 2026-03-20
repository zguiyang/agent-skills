---
name: adonisjs
description: Use when working with AdonisJS v7, including migration guidance for v6 projects
doc_version: adonisjs
---

# AdonisJS Skill

Use when working with AdonisJS v7, a modern TypeScript backend framework. This skill combines knowledge from the official documentation to provide comprehensive guidance for building server-side applications.

## When to Use This Skill

This skill should be triggered when working with:

### Core Framework Usage
- **AdonisJS v7 Development**: Building any backend application with AdonisJS
- **Project Initialization**: Creating new AdonisJS projects from starter kits
- **TypeScript Development**: Using TypeScript for type-safe backend code

### Feature-Specific Triggers
- **API Development**: Building REST APIs, JSON backends, or GraphQL
- **Authentication**: Implementing user auth with @adonisjs/auth (session, JWT, basic auth)
- **Database Operations**: Using Lucid ORM for database interactions, migrations, seeds
- **Validation**: Using VineJS for request validation
- **File Handling**: Uploading files, serving static assets
- **Caching**: Implementing cache with @adonisjs/cache
- **Sessions**: Managing user sessions with @adonisjs/session

### Frontend Integration
- **Edge Templates**: Server-rendered HTML with Edge template engine
- **Inertia**: Using React/Vue components with server-side routing
- **API-Only**: Building JSON API for separate frontend apps

### Operational
- **Debugging**: Troubleshooting AdonisJS applications
- **Deployment**: Deploying to production (Docker, Node.js, serverless)
- **Testing**: Writing tests with Japa

## Version Scope

- **Target version**: AdonisJS v7
- **Runtime baseline**: Node.js 24 or newer (per official v7 docs)
- **Upgrade path**: For legacy projects, use `references/other.md` and follow the "Upgrade guide - AdonisJS" (`https://docs.adonisjs.com/v6-to-v7`)

## Key Concepts

### Architecture Philosophy

AdonisJS is **deeply opinionated about the backend** but **flexible about the frontend**:

- Built-in: Authentication, Authorization, Validation, Database tooling, Caching
- Your choice: Template engine, frontend framework, or API-only

### Three Application Stacks

1. **Hypermedia (Server-Rendered)**: Edge templates + Alpine.js/HTMX
   - Server generates HTML, browser displays it
   - Minimal JavaScript, simple deployment
   - Best for: Content sites, dashboards, SEO-critical pages

2. **Inertia (React/Vue)**: React/Vue as views + server routing
   - Components render on server, hydration on client
   - SPA experience with monolithic deployment
   - Best for: Modern UX + fast development

3. **API-Only**: JSON backend + separate frontend
   - Clear separation of concerns
   - Multiple clients (web, mobile, external)
   - Best for: Mobile apps, SPAs, public APIs

### Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Routes** | Define URL endpoints | `routes/*.ts` |
| **Controllers** | Handle HTTP requests | `app/controllers/*.ts` |
| **Middleware** | Process requests/responses | `app/middleware/*.ts` |
| **Models** | Database entities (Lucid) | `app/models/*.ts` |
| **Services** | Business logic | `app/services/*.ts` |
| **Migrations** | Database schema | `database/migrations/*.ts` |
| **Validators** | Request validation | `app/validators/*.ts` |

### Important Distinctions

- **public vs resources directories**:
  - `public/`: Files served as-is (favicons, uploads)
  - `resources/`: Processed by Vite bundler (CSS, JS, images)

- **No file-based routing**: Explicit route definitions in `routes/*.ts`

- **No "use server/client"**: Clear server/client code separation

## Quick Reference

### Project Setup

```bash
# Clone starter kit
git clone <REPO_URL>
cd <project-name>
npm install

# Add official packages
node ace add @adonisjs/static
node ace add @adonisjs/cache

# Configure packages
node ace configure @adonisjs/lucid
node ace configure @adonisjs/auth
```

### Environment Variables

```typescript
import { codemods } from '@adonisjs/core'

await codemods.defineEnvVariables({
  API_KEY: 'secret-key-here',
}, {
  omitFromExample: ['API_KEY']
})
```

### Routes and Controllers

```typescript
// routes/web.ts
import router from '@adonisjs/core/services/router'
const UsersController = () => import('#controllers/users_controller')

router.get('/users', [UsersController, 'index'])
router.post('/users', [UsersController, 'store'])
router.get('/users/:id', [UsersController, 'show']).param('id')
```

```typescript
// app/controllers/users_controller.ts
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    // ... fetch users
    return response.json({ data: [] })
  }

  async show({ params, response }: HttpContext) {
    return response.json({ id: params.id })
  }
}
```

### Database with Lucid

```typescript
// app/models/user.ts
import { UsersSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class User extends UsersSchema {
  // Override serialization behavior in model layer when needed.
  @column({ serializeAs: null })
  declare password: string
}
```

```typescript
// Querying (schema classes are auto-generated from migrations)
const users = await User.query().where('active', true).paginate(1, 10)
const user = await User.findOrFail(params.id)
await user.related('posts').create({ title: 'Hello' })
```

```bash
# v7 workflow: create model + migration, then run migrations
node ace make:model User -m
node ace migration:run
```

```text
Important: Never edit database/schema.ts manually.
It is generated from migrations after migration:run.
```

### Authentication

```bash
# Install hashers
npm i argon2  # Recommended for new apps
# or
npm i bcrypt
```

```typescript
// Basic auth setup with @adonisjs/auth
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')

router.post('/login', [AuthController, 'login'])
router.post('/register', [AuthController, 'register'])
```

### Validation with VineJS

```typescript
// app/validators/create_user.ts
import vine from '@vinejs/vine'

export const createUserValidator = vine.create({
  email: vine.string().email(),
  password: vine.string().minLength(8).confirmed(),
  name: vine.string().minLength(2),
})

// Usage in controller
export default class UsersController {
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    // ... create user
  }
}
```

### Request Extensions

```typescript
// src/extensions/request.ts
import type { Request } from '@adonisjs/core/http'

Request.macro('hasRole', function (this: Request, role: string) {
  const user = this.ctx.auth.user
  return user?.role === role
})

// Usage: if (request.hasRole('admin')) { ... }
```

### Static Files Configuration

```typescript
// config/static.ts
{
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',  // Security: don't expose .env, .git
  acceptRanges: true,
  cacheControl: {
    maxAge: '1 year',
    immutable: true  // For versioned/hashed filenames
  }
}
```

### Event System

```typescript
import emitter from '@adonisjs/core/services/emitter'

// HTTP request completed - for logging/monitoring
emitter.on('http:request_completed', (event) => {
  const { method, url } = event.ctx.request
  const duration = event.duration
  console.log(`${method} ${url}: ${duration}ms`)
})

// Server ready
emitter.on('http:server_ready', (event) => {
  console.log(`Server running on ${event.host}:${event.port}`)
})
```

### Type Helpers

```typescript
import type { InferRouteParams } from '@adonisjs/core/helpers/types'

// Type-safe route parameters
type UserParams = InferRouteParams<'/users/:id'>
// Result: { id: string }
```

### Helpers

```typescript
import string from '@adonisjs/core/helpers/string'
import is from '@adonisjs/core/helpers/is'

string.camelCase('hello_world')  // 'helloWorld'
string.slug('Hello World')        // 'hello-world'
string.capitalize('hello')        // 'Hello'

is.email('test@example.com')      // true
is.url('https://example.com')     // true
```

## Reference Files

This skill combines documentation from multiple sources:

| File | Description | Pages | Confidence |
|------|-------------|-------|------------|
| **api.md** | API reference documentation | 1 | Medium |
| **guides.md** | Core feature guides | 71 | Medium |
| **other.md** | Stacks, starter kits, path selection | 11 | Medium |
| **reference.md** | Events, helpers, types | 8 | Medium |
| **index.md** | Documentation index | 1 | Medium |

### Source Analysis

**Primary Source**: Official AdonisJS Documentation (docs.adonisjs.com)

All content is derived from the official documentation with medium confidence. The documentation covers:

- Guides: Static files, routing, controllers, middleware, authentication
- Reference: Events, helpers, type utilities
- Starter kits: Web, API, Inertia templates

### Multi-Source Synthesis

This skill uses a single source type (official documentation), so synthesis is straightforward:

1. **Official Documentation** (docs.adonisjs.com) - Primary source
   - Guides, reference, tutorials
   - Code examples with TypeScript
   - Configuration options

No conflicts detected between sources - all content is from the official AdonisJS documentation.

## Working with This Skill

### For Beginners

1. Start with `references/other.md` to understand the three application stacks
2. Read `references/tutorial.md` for step-by-step learning
3. Use Quick Reference above for your first project setup
4. Check `references/guides.md` for specific feature implementations

### For Intermediate Users

1. Study `references/reference.md` for events, helpers, and type utilities
2. Use Quick Reference for common patterns
3. Explore `references/guides.md` for detailed configuration
4. Implement custom Request/Response macros

### For Advanced Users

1. Use event system for application monitoring and logging
2. Implement advanced static file caching strategies
3. Configure custom authentication guards
4. Build reusable service providers

### Navigating Reference Files

| Need | File to Check |
|------|---------------|
| Quick answer | Quick Reference section above |
| Detailed explanation | `references/guides.md` |
| API method signatures | `references/api.md` |
| Events and listeners | `references/reference.md` |
| Choosing frontend stack | `references/other.md` |
| Step-by-step tutorial | `references/tutorial.md` |

## Common Patterns

### Route Groups with Middleware

```typescript
router.group(() => {
  router.get('/dashboard', [DashboardController, 'index'])
  router.get('/profile', [ProfileController, 'show'])
}).use(middleware.auth())
```

### Error Handling

```typescript
import errors from '@adonisjs/core/errors'

// In your controller
try {
  const user = await User.findOrFail(params.id)
} catch (error) {
  if (error.code === 'E_ROW_NOT_FOUND') {
    return response.notFound({ message: 'User not found' })
  }
  throw error
}
```

### Database Transactions

```typescript
import db from '@adonisjs/lucid/services/db'

await db.transaction(async (trx) => {
  const user = await User.create({ email: 'test@example.com' }, { client: trx })
  await user.related('profile').create({ bio: 'Hello' }, { client: trx })
})
```

### File Uploads

```typescript
import { extname } from 'node:path'

async store({ request, response }: HttpContext) {
  const coverImage = request.file('cover_image')

  if (coverImage) {
    const fileName = `${Date.now()}${extname(coverImage.fileName)}`
    await coverImage.moveToDisk(`./${fileName}`)
  }

  return response.created({ message: 'Uploaded' })
}
```

## Known Discrepancies

No major discrepancies detected. All content is synthesized from the official AdonisJS documentation with medium confidence. The documentation is well-maintained and consistent.

**Note**: This skill targets AdonisJS v7. For older applications, validate compatibility before applying patterns from this skill.

## Resources

### references/
Organized documentation extracted from official sources:
- Detailed explanations of all features
- Code examples with TypeScript/JavaScript annotations
- Links to original documentation
- Table of contents for quick navigation

### scripts/
Add helper scripts here for common automation tasks:
- Database seeding scripts
- Deployment scripts
- Development utilities

### assets/
Add templates, boilerplate, or example projects here:
- Sample controller patterns
- Middleware templates
- Service provider examples

## Notes

- This skill was generated from the official AdonisJS documentation
- Reference files preserve the structure and examples from source docs
- Code examples primarily use TypeScript (AdonisJS's default)
- Quick reference patterns are extracted from common usage examples
- AdonisJS v7 is the current major version for this skill
- All examples assume the use of official starter kits

## Updating

To refresh this skill with updated documentation:
1. Re-run the documentation scraper with the same configuration
2. The skill will be rebuilt with the latest information from docs.adonisjs.com

## Official Links

- **Documentation**: https://docs.adonisjs.com/
- **Upgrade guide (v6 -> v7)**: https://docs.adonisjs.com/v6-to-v7
- **GitHub**: https://github.com/adonisjs/core
- **Official Packages**: https://github.com/adonisjs
- **Discord**: https://discord.gg/vzc5sWh
