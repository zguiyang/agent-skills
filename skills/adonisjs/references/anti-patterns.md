# Anti-patterns — AdonisJS v7

Read before suggesting “familiar Node” shortcuts.

| Avoid | Prefer |
| --- | --- |
| Express `app.get` style apps | Adonis router + controllers |
| Tutorial fat-controller / generator stub as production pattern (`Post.create`, mail, tokens in the action) | `make:service` + `@inject()` Service; controller validates / authorizes / calls service / returns ([Controllers DI](https://docs.adonisjs.com/guides/basics/controllers.md#dependency-injection)) |
| `new XxxService()` in controllers | Container injection via `@inject()` |
| Returning raw Lucid models as the default public JSON/Inertia props | Official transformer / serialize path when the kit recommends it |
| Invented JWT/Passport stacks | Official session / access-token / basic / custom guards |
| `router.makeUrl` / Edge `route()` | `urlFor` |
| Flash `errors.*` after v7 | `inputErrorsBag.*` |
| `ts-node` JIT on v7 | `@poppinss/ts-exec` |
| v6 lazy controller import walls | `#generated/controllers` |
| Hand-editing `database/schema.ts` | Migrations → regenerate schema |
| Columns-only-on-model as default for new apps | Schema-codegen workflow |
| Skipping `validateUsing` | Vine at controller, then trust payload into services |
| UI-only `@can` / `can.*` | Always `authorize` on mutating actions |
| Importing Bouncer policies into React | Transformer `allows` flags |
| Nest Repository / UseCase towers for their own sake | Practical Adonis Controllers + Services (official DI) |
| Doc-dumping entire guides into context | Topic map + `lookup_docs.py --fetch` |
| Unpinned `@adonisjs/queue` in prod | Pin experimental package versions |

Upgrade-related footguns: see [upgrade-v6-to-v7.md](upgrade-v6-to-v7.md).
