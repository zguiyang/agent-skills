# Upgrade V6 To V7 — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [v6-to-v7](https://docs.adonisjs.com/v6-to-v7)

## Condensed excerpts (prefer live docs if conflict)

### v6-to-v7
Source: https://docs.adonisjs.com/v6-to-v7

Upgrade guide (Resources) - AdonisJS Documentation 

Start
            /
            Resources Upgrade guide 

Upgrading from v6 to v7 
AdonisJS v7 is a major release after two years of v6. This guide covers the changes you must make to upgrade your existing v6 application. 
We have worked hard to keep the breaking changes surface area low. Yet, there are some breaking changes, and certain updates are necessary. At a foundational level: 
AdonisJS v7 requires Node.js 24 
Works with TypeScript 5.9/6.0 and ESLint 10 
And the Vite integration has been updated to work with Vite 7 
Helpful links 
 [link:https://v6-docs.adonisjs.com] v6 documentation - In case you need to reference the old APIs during the upgrade. 
 [link:https://github.com/orgs/adonisjs/discussions/5051] Report Upgrade issues - Running into something unexpected? Post it here and we'll help. 
Upgrade to Node.js 24 
AdonisJS v7 requires Node.js 24 or above. Older Node.js versions are no longer supported. Make sure you update your local development environment, CI pipelines, and production servers before proceeding with the rest of this guide. 

Upgrade using a coding agent 
Use the following prompt with your coding agent (Cursor, Claude Code, Copilot, etc.) to handle the mechanical parts of the upgrade. Review the changes it makes against the breaking changes listed above. 
# AdonisJS v6 → v7 Upgrade Agent

You are an upgrade agent. Execute every step below in order against the current project. Do NOT skip steps. After each step, verify the change was applied before moving on. If a step does not apply (file or pattern not found), say so and continue to the next step.

## Pre-flight
- Confirm Node.js >= 24 is available by running `node -v`. Abort if not.
- Confirm this is an AdonisJS v6 project by checking for `adonisrc.ts` and `@adonisjs/core` in `package.json`.

## Step 1 — Upgrade all packages
Run the following command to upgrade every AdonisJS-related dependency to its latest version:

```sh
npm i $(node -e "const pkg = require('./package.json'); const deps = {...pkg.dependencies, ...pkg.devDependencies}; console.log(Object.keys(deps).filter(k => k.startsWith('@adonisjs/') || k === '@vinejs/vine' || k === 'edge.js' || k === '@japa/plugin-adonisjs' || k === 'vite' || k === 'argon2').map(k => k + '@latest').join(' '))") --force
```

## Step 2 — Replace the TypeScript JIT compiler
- Run: `npm uninstall ts-node ts-node-maintained @swc/core`
- Run: `npm install -D @poppinss/ts-exec`
- In `ace.js`, replace `import 'ts-node-maintained/register/esm'`
  (or any `ts-node` import) with `import '@poppinss/ts-exec'`.

## Step 3 — Install Youch
Run: `npm install -D youch`

## Step 4 — Configure hooks in `adonisrc.ts`
Add the `hooks` property to the `defineConfig` call. At minimum add:

```ts
import { indexEntities } from '@adonisjs/core'

hooks: {
  init: [
    indexEntities(),
  ],
},
```

Then conditionally add more hooks based on what the project uses:

- **If the project uses `@adonisjs/inertia`**: add `indexPages({ framework: '<detected_framework>' })` to `init`.
  Detect the framework from the existing inertia config or frontend files
  (react/vue/svelte/solid).
- **If the project uses `@tuyau/core`**: run `npm install @tuyau/core`,
  then add `generateRegistry()` and `indexEntities({ transformers: { enabled: true, withSharedProps: true } })` to `init`.
- **If the project uses `@adonisjs/bouncer`**: add `indexPolicies()` to `init`.
- **If the project uses `@adonisjs/vite`**: add to `hooks`:
  ```ts
  buildStarting: [() => import('@adonisjs/vite/build_hook')],
  ```

## Step 5 — Rename assembler hooks
In `adonisrc.ts`, rename any existing assembler hooks:

| Old name               | New name           |
|------------------------|--------------------|
| `onSourceFileChanged`  | `fileChanged`      |
| `onDevServerStarted`   | `devServerStarted` |
| `onBuildCompleted`     | `buildFinished`    |
| `onBuildStarting`      | `buildStarting`    |

## Step 6 — Update test glob patterns
In `adonisrc.ts`, inside `tests.suites[*].files`, replace parenthesized
alternation syntax with brace expansion:

- Replace `(.ts|.js)` with `.{ts,js}`
- Example: `tests/unit/**/*.spec(.ts|.js)` → `tests/unit/**/*.spec.{ts,js}`

Apply to ALL suites (unit, functional, e2e, etc.).

## Step 7 — Remove the `assetsBundler` property
Delete the `assetsBundler` property from `adonisrc.ts` if it exists.

## Step 8 — Encryption config changes
- In `config/app.ts`, remove the line `export const appKey = env.get('APP_KEY')`.
- Create `config/encryption.ts` with:

```ts
import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

export default defineConfig({
  default: 'legacy',
  list: {
    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
})
```

## Step 9 — Replace deprecated `router.makeUrl` / `router.makeSignedUrl`
Search the entire codebase for:
- `router.makeUrl(` → replace with `urlFor(` (import `urlFor` from `@adonisjs/core/services/url_builder`)
- `router.makeSignedUrl(` → replace with the equivalent URL builder call
- Remove now-unused `import router from '@adonisjs/core/services/router'`
  (only if `router` is no longer referenced elsewhere in that file).

In Edge templates, replace `route(` helper calls with `urlFor(`.

## Step 10 — Replace removed helpers
Search the entire codebase and replace:

| Find                                          | Replace with                                  |
|-----------------------------------------------|-----------------------------------------------|
| `getDirname()` from `@adonisjs/core/helpers`  | `import.meta.dirname`                         |
| `getFilename()` from `@adonisjs/core/helpers` | `import.meta.filename`                        |
| `slash(...)` from `@adonisjs/core/helpers`     | `stringHelpers.toUnixSlash(...)` from `@adonisjs/core/helpers/string` |
| `cuid()` / `isCuid()` from helpers            | Use UUIDs instead                             |

Remove unused imports of removed helpers.

## Step 11 — Rename `Request` / `Response` classes
Search the entire codebase for:
- `import { Request }` or `import { Request,` from `@adonisjs/core/http` → rename to `HttpRequest`
- `import { Response }` or `import { Response,` from `@adonisjs/core/http` → rename to `HttpResponse`
- In `declare module '@adonisjs/core/http'` blocks, rename `interface Request` → `interface HttpRequest`, `interface Response` → `interface HttpResponse`.
- Replace `Request.macro(` → `HttpRequest.macro(`, `Response.macro(` → `HttpResponse.macro(`

## Step 12 — Flash messages `errors` key
Search Edge templates and frontend code for `flashMessages.get('errors.` and
replace with `flashMessages.get('inputErrorsBag.`.

## Step 13 — Inertia integration (only if project uses `@adonisjs/inertia`)

### 13a — Config changes in `config/inertia.ts`
- Remove the `entrypoint` property.
- Replace `history: { encrypt: true }` with `encryptHistory: true`.
- Remove the `sharedData` property entirely (will be moved to middleware).

### 13b — Move Inertia entrypoint files
- Move `inertia/app/app.{tsx,ts}` → `inertia/app.{tsx,ts}`
- Move `inertia/app/ssr.{tsx,ts}` → `inertia/ssr.{tsx,ts}` (if exists)
- Update any import paths that referenced the old locations.

### 13c — Create Inertia middleware
Run: `node ace make:middleware inertia_middleware`

Populate `app/middleware/inertia_middleware.ts` with the shared data that
was previously in `config/inertia.ts`'s `sharedData`. Use this template:

```ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  share(ctx: HttpContext) {
    const { session, auth } = ctx as Partial<HttpContext>
    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: session?.flashMessages.get('error'),
        success: session?.flashMessages.get('success'),
      }),
      user: ctx.inertia.always(auth?.user ?? undefined),
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    const output = await next()
    this.dispose(ctx)
    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
```

Register in `start/kernel.ts`:
```ts
server.use([
  () => import('#middleware/inertia_middleware'),
])
```

### 13d — Create `tsconfig.inertia.json`
Create `tsconfig.inertia.json` in the project root:

```json
{
  "extends": "./inertia/tsconfig.json",
  "compilerOptions": {
    "rootDir": "./inertia",
    "composite": true
  },
  "include": ["./inertia/**/*.ts", "./inertia/**/*.tsx"]
}
```

Add `"references": [{ "path": "./tsconfig.inertia.json" }]` to the
root `tsconfig.json`.

## Step 14 — Add new subpath imports to `package.json`
Merge these entries into the `imports` field of `package.json`
(do not remove existing entries):

```json
{
  "#generated/*": "./.adonisjs/server/*.js",
  "#transformers/*": "./app/transformers/*.js",
  "#database/*": "./database/*.js"
}
```

## Step 15 — Verify
- Run `node ace build` or `npm run build` and report any errors.
- Run `npm run dev` and confirm the server starts.
- Run `node ace test` and report test results.

Report a summary of all changes made and any issues found. 
Upgrade all packages 
Update every package in your project to its latest version. You must also upgrade , and Inertia depedencies to their latest versions. 
Following is a cross-platform script you can run to automatically find AdonisJS specific dependencies within your project's file and update them in one go. 

```
npm i $(node -e "const pkg = require('./package.json'); const deps = {...pkg.dependencies, ...pkg.devDependencies}; console.log(Object.keys(deps).filter(k => k.startsWith('@adonisjs/') || k === '@vinejs/vine' || k === 'edge.js' || k === '@japa/plugin-adonisjs' || k === 'vite' || k === 'argon2').map(k => k + '@latest').join(' '))") --force
```

Replace the TypeScript JIT compiler 
We have replaced (and ) with as the JIT compiler. Remove the old packages and install the new one. 

```
npm uninstall ts-node ts-node-maintained @swc/core
npm install -D @poppinss/ts-exec
```

Then update the import in your file. 
ace.js 

```
import 'ts-node-maintained/register/esm'
import '@poppinss/ts-exec'
```

Install Youch as a project dependency 
Youch is no longer bundled inside and 
```
@adonisjs/http-server
```
. It has been rewritten from scratch, but this does not impact your application code since Youch is consumed internally by the framework. You just need to install it as a dev dependency. 

Configure hooks in 
v7 introduces a new hooks system in . You must add the hook at a minimum. Depending on your stack, you will need additional hooks for Inertia, Tuyau, Bouncer, and Vite. 
If your app uses Tuyau, make sure to install the package. 

```
npm install @tuyau/core
```

The following example shows a complete hooks configuration. Include only the hooks relevant to your stack. 
adonisrc.ts 

```
import { indexEntities } from '@adonisjs/core'
import { indexPages } from '@adonisjs/inertia'
import { defineConfig } from '@adonisjs/core/app'
import { indexPolicies } from '@adonisjs/bouncer'
import { generateRegistry } from '@tuyau/core/hooks'

export default defineConfig({
  hooks: {
    init: [
      // Always needed
      indexEntities(),

      // If using Inertia (adjust framework to match yours)
      indexPages({ framework: 'react' }),
      generateRegistry(),
      indexEntities({
        transformers: { enabled: true, withSharedProps: true },
      }),

      // If using Bouncer
      indexPolicies(),
    ],
    buildStarting: [
      // If using Vite
      () => import('@adonisjs/vite/build_hook'),
    ],
  },
})
```

Assembler ho

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
