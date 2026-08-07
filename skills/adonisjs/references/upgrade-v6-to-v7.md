# Upgrade v6 → v7

Official: https://docs.adonisjs.com/v6-to-v7.md  
Lookup: `python3 scripts/lookup_docs.py --fetch v6-to-v7`

## Checklist

1. Node.js **24+** (local/CI/prod)
2. Bump `@adonisjs/*`, Vine, Edge, Inertia, Vite, related deps
3. Replace JIT with `@poppinss/ts-exec`; fix `ace.js`; remove ts-node
4. `npm i -D youch`
5. `adonisrc.ts` hooks: `indexEntities()` + stack hooks; rename assembler hooks (`buildStarting`, …)
6. Tests glob `*.spec.{ts,js}`; remove `assetsBundler`
7. `config/encryption.ts`; drop `appKey` export; use `legacy` driver for old ciphertext
8. `urlFor` instead of `makeUrl` / Edge `route`
9. `HttpRequest` / `HttpResponse` if macros/augmentation used Request/Response
10. Flash: `inputErrorsBag`
11. Inertia: file moves, shared props → middleware, `tsconfig.inertia.json`
12. `package.json` imports: `#generated/*`, `#transformers/*`, `#database/*`
13. Boot; fix duplicate auto route names + typed `inertia.render` errors

Re-fetch the official page when executing — pins change.
