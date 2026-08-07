# Getting started — AdonisJS v7

Docs: https://docs.adonisjs.com/installation.md  
Lookup: `python3 scripts/lookup_docs.py --fetch installation`

## Official pages

- [Introduction](https://docs.adonisjs.com/introduction.md)
- [Pick your path](https://docs.adonisjs.com/stacks-and-starter-kits.md)
- [Installation](https://docs.adonisjs.com/installation.md)
- [Folder structure](https://docs.adonisjs.com/folder-structure.md)
- [Configuration & Environment](https://docs.adonisjs.com/configuration.md)
- [Deployment](https://docs.adonisjs.com/deployment.md)
- [FAQs](https://docs.adonisjs.com/faqs.md)

## Create

```bash
npm create adonisjs@latest my-app
# kits: hypermedia | react | vue | api (API kit often Turborepo monorepo)
node ace serve --hmr
```

## Layout (kit-dependent)

`app/` domain · `start/` routes/kernel/env · `config/` · `database/` · `resources/views` (Edge) · `inertia/` (Inertia) · `adonisrc.ts` · `bin/`

## Config triad

1. `config/*` — structured settings  
2. `.env` + `start/env.ts` validation — secrets  
3. `adonisrc.ts` — providers, preloads, **hooks** (`indexEntities`, …)
