# Auth — AdonisJS v7

Lookup:

- `python3 scripts/lookup_docs.py --fetch guides/auth/introduction`
- `python3 scripts/lookup_docs.py --fetch guides/auth/verifying-user-credentials`
- `python3 scripts/lookup_docs.py --fetch guides/auth/session-guard`
- `python3 scripts/lookup_docs.py --fetch guides/auth/access-tokens-guard`
- `python3 scripts/lookup_docs.py --fetch guides/auth/authorization`

Auth package authenticates HTTP requests — not full product signup/reset flows (kits / custom).

## Guards

| Need | Guard | Install flag |
| --- | --- | --- |
| SSR / same-site SPA | **Session** (`web`) | `--guard=session` |
| Cross-origin SPA / mobile / 3rd party | **Access tokens** (`api`, opaque hashed — not JWT) | `--guard=access_tokens` |
| Prototype / internal | Basic | `--guard=basic_auth` (avoid for production user apps) |

```bash
node ace add @adonisjs/auth --guard=session
node ace add @adonisjs/bouncer
```

## Verify credentials (AuthFinder)

Use **AuthFinder** — do not hand-roll `findBy` + `hash.verify` (timing attacks).

Official auth pages often show `compose(BaseModel, AuthFinder)`. For **v7 schema-codegen** apps, compose the same mixin with generated `UserSchema` instead of re-declaring `@column`s:

```ts
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { UserSchema } from '#database/schema'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(UserSchema, AuthFinder) {}
```

If the project still uses columns-on-model, follow the docs’ `compose(BaseModel, AuthFinder)` sample — do not mix both styles on one model.

```ts
const user = await User.verifyCredentials(email, password)
// invalid → E_INVALID_CREDENTIALS (content-negotiated)
```

## Session login / logout / protect

```ts
await auth.use('web').login(user)
await auth.use('web').logout()
```

```ts
import { middleware } from '#start/kernel'

router.post('/login', …).use(middleware.guest())
router.post('/logout', …).use(middleware.auth())
router.resource('posts', …).use(middleware.auth())
```

Prefer `verifyCredentials` → `auth.use('web').login(user)` → redirect (`toIntendedRoute` when applicable).

## Access tokens

```ts
const token = await User.accessTokens.create(user)
// plain value only at creation:
return { type: 'bearer', value: token.value!.release() }

await User.accessTokens.delete(user, tokenId)
```

Guard helpers (mobile/API primary auth):

```ts
const user = await User.verifyCredentials(email, password)
return await auth.use('api').createToken(user)
// logout-equivalent:
await auth.use('api').invalidateToken()
```

Client sends `Authorization: Bearer <token>`. Do not invent Passport/JWT stacks.

## Bouncer (authorization ≠ auth)

```bash
node ace make:policy post
```

```ts
await bouncer.with(PostPolicy).authorize('edit', post) // throws 403
const ok = await bouncer.with(PostPolicy).allows('edit', post)
```

- Edge: `@can('PostPolicy.edit', post)`
- Inertia: compute `can.*` in transformers via `allows`; still `authorize` in controllers
- Never import policies into React
