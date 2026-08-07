# Anti-patterns — AdonisJS v7

Read before suggesting “familiar Node” shortcuts.

| Avoid | Prefer |
| --- | --- |
| Express `app.get` style apps | Adonis router + controllers |
| Invented JWT/Passport stacks | Official session / access-token / basic / custom guards |
| `router.makeUrl` / Edge `route()` | `urlFor` |
| Flash `errors.*` after v7 | `inputErrorsBag.*` |
| `ts-node` JIT on v7 | `@poppinss/ts-exec` |
| v6 lazy controller import walls | `#generated/controllers` |
| Hand-editing `database/schema.ts` | Migrations → regenerate schema |
| Columns-only-on-model as default for new apps | Schema-codegen workflow (tutorials) |
| Skipping `validateUsing` | Vine at controller |
| UI-only `@can` / `can.*` | Always `authorize` on mutating actions |
| Importing Bouncer policies into React | Transformer `allows` flags |
| Nest-style ceremony for its own sake | Practical Adonis conventions |
| Doc-dumping entire guides into context | Topic map + `lookup_docs.py --fetch` |
| Unpinned `@adonisjs/queue` in prod | Pin experimental package versions |

Upgrade-related footguns: see [upgrade-v6-to-v7.md](upgrade-v6-to-v7.md).
