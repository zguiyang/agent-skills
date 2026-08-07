# Security — AdonisJS v7

Official: https://docs.adonisjs.com/guides/security/hashing.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/security/rate-limiting`

## Official pages

- [Hashing](https://docs.adonisjs.com/guides/security/hashing.md)
- [Encryption](https://docs.adonisjs.com/guides/security/encryption.md)
- [CORS](https://docs.adonisjs.com/guides/security/cors.md)
- [Securing SSR apps (Shield)](https://docs.adonisjs.com/guides/security/securing-ssr-applications.md)
- [Rate limiting](https://docs.adonisjs.com/guides/security/rate-limiting.md)

## Hashing

```ts
import hash from '@adonisjs/core/services/hash'

const hashed = await hash.make(password)
const ok = await hash.verify(hashed, password)
```

Prefer Argon2 for new apps (see docs). AuthFinder uses the hash service under the hood.

## Encryption

v7 uses dedicated `config/encryption.ts` (not `appKey` alone from `config/app.ts`). When migrating, see the upgrade guide `legacy` driver notes.

```ts
import encryption from '@adonisjs/core/services/encryption'

const encrypted = encryption.encrypt(value)
const plain = encryption.decrypt(encrypted)
```

## CORS

Configure `@adonisjs/cors` for cross-origin API access (`config/cors.ts`).

## Shield (SSR)

```bash
node ace add @adonisjs/shield
```

CSRF, CSP, and related protections for server-rendered apps.

## Rate limiting

```bash
node ace add @adonisjs/limiter
```

Apply limiters to routes/groups; store backends documented in the rate-limiting guide.
