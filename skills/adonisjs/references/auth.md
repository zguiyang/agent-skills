# Auth — AdonisJS v7

Official: https://docs.adonisjs.com/guides/auth/introduction.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/auth/session-guard`

## Official pages

- [Introduction](https://docs.adonisjs.com/guides/auth/introduction.md)
- [Verifying credentials](https://docs.adonisjs.com/guides/auth/verifying-user-credentials.md)
- [Session guard](https://docs.adonisjs.com/guides/auth/session-guard.md) — web apps
- [Access tokens guard](https://docs.adonisjs.com/guides/auth/access-tokens-guard.md) — APIs / mobile
- [Basic auth](https://docs.adonisjs.com/guides/auth/basic-auth-guard.md)
- [Custom guard](https://docs.adonisjs.com/guides/auth/custom-auth-guard.md)
- [Social (Ally)](https://docs.adonisjs.com/guides/auth/social-authentication.md)
- [Authorization (Bouncer)](https://docs.adonisjs.com/guides/auth/authorization.md)

## Choose a guard

| Need | Guard |
|------|--------|
| Cookie sessions (SSR / Inertia) | **Session** |
| Bearer tokens (SPA on other domain, mobile) | **Access tokens** (opaque `oat_…`, not JWT by default) |
| Simple internal tools over HTTPS | Basic auth |

```bash
node ace add @adonisjs/auth   # usually already in starter kits
node ace add @adonisjs/bouncer
node ace add @adonisjs/ally    # social
```

## Credentials

User models typically use AuthFinder (`withAuthFinder`) and `User.verifyCredentials(email, password)`.

## Session guard (web)

```ts
await auth.use('web').login(user)
await auth.use('web').logout()
const user = auth.user // after middleware.auth()
```

Protect routes with `middleware.auth()` from `#start/kernel`.

## Access tokens (API)

Configure tokens provider on the User model. Issue / revoke tokens via the provider API; send `Authorization: Bearer …`. Prefer official docs examples over inventing JWT.

## Authorization (Bouncer)

```bash
node ace make:policy post
```

```ts
// abilities / policies — check with bouncer
await bouncer.with('PostPolicy').authorize('edit', post)
```

## Do not

- Invent Passport-style stacks by default.
- Assume JWT is the Adonis default for APIs (opaque access tokens are).
- Skip HTTPS for basic auth in production.
