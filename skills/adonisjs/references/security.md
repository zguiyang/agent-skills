# Security — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/security/cors`

## Official pages

Hashing · Encryption · CORS · Securing SSR (Shield) · Rate limiting

```bash
node ace add @adonisjs/cors
node ace add @adonisjs/shield
node ace add @adonisjs/limiter
```

## v7 encryption

- `config/encryption.ts` + `EncryptionManager`
- Migrating v6 data: `legacy` driver with `APP_KEY`
- Container `'encryption'` binding is the **manager**, not raw `Encryption`

## Practices

- Prefer framework hashing helpers / AuthFinder for credentials
- Configure CORS deliberately for APIs; pair public APIs with limiter
- Keep Shield/CSRF intact for SSR form apps
