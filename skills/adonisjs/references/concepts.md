# Core concepts — AdonisJS v7

Official: https://docs.adonisjs.com/guides/concepts/application-lifecycle.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/concepts/dependency-injection`

## Official pages

- [Application lifecycle](https://docs.adonisjs.com/guides/concepts/application-lifecycle.md)
- [Dependency injection](https://docs.adonisjs.com/guides/concepts/dependency-injection.md)
- [Service providers](https://docs.adonisjs.com/guides/concepts/service-providers.md)
- [Container services](https://docs.adonisjs.com/guides/concepts/container-services.md)
- [Barrel files](https://docs.adonisjs.com/guides/concepts/barrel-files.md)
- [Assembler hooks](https://docs.adonisjs.com/guides/concepts/assembler-hooks.md)
- [Scaffolding and codemods](https://docs.adonisjs.com/guides/concepts/scaffolding.md)
- [Extending AdonisJS](https://docs.adonisjs.com/guides/concepts/extending-adonisjs.md)

## Practical rules

- Prefer **container services** via ESM imports (`import router from '@adonisjs/core/services/router'`) over inventing service locators.
- **Providers** register bindings and boot hooks — keep `adonisrc.ts` free of app business logic.
- **Barrels** (`#generated/*`) reduce lazy-import walls; regenerate via Ace / assembler — don’t hand-edit generated barrels casually.
- **Assembler hooks** (v7 names): `buildStarting`, `devServerStarted`, `fileChanged`, `buildFinished`, … — not old `onBuildStarting` names.
- Package `configure` hooks use stubs + codemods (`node ace configure <pkg>`).

## Scaffolding

```bash
node ace make:controller posts
node ace make:middleware force_json
node ace make:provider cache
node ace make:command greet
```

When writing package configure hooks, follow the scaffolding guide for `codemods.defineEnvVariables`, stubs, and RC updates.
