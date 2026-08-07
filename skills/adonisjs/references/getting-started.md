# Getting started — AdonisJS v7

Official: https://docs.adonisjs.com  
When unsure: `python3 scripts/lookup_docs.py --fetch installation`

## Official pages

- [Introduction](https://docs.adonisjs.com/introduction.md)
- [Pick your path](https://docs.adonisjs.com/stacks-and-starter-kits.md)
- [Installation](https://docs.adonisjs.com/installation.md)
- [Folder structure](https://docs.adonisjs.com/folder-structure.md)
- [Dev environment](https://docs.adonisjs.com/dev-environment.md)
- [Configuration & env](https://docs.adonisjs.com/configuration.md)
- [Deployment](https://docs.adonisjs.com/deployment.md)
- [FAQs](https://docs.adonisjs.com/faqs.md)

## Prerequisites

- Node.js **≥ 24**, npm **≥ 11**

```bash
node -v && npm -v
npm create adonisjs@latest my-app
# kits: --kit=hypermedia | react | vue | api
```

## Starter kits

| Kit | UI | Notes |
|-----|-----|--------|
| Hypermedia | Edge + Alpine | SSR HTML |
| React / Vue | Inertia | Full-stack SPA-like |
| API | Monorepo (Turborepo) | Backend + empty frontend; Tuyau types |

Defaults in new apps: Lucid (SQLite), Auth (signup/login), ESLint, Prettier, Vite.

## Dev server

```bash
# Hypermedia / Inertia kits
node ace serve --hmr

# API kit (from monorepo root)
npm run dev
```

App: http://localhost:3333

## Folder conventions (typical)

| Path | Role |
|------|------|
| `start/routes.ts` | Routes |
| `app/controllers/` | Controllers |
| `app/models/` | Lucid models |
| `app/middleware/` | Middleware |
| `app/validators/` | VineJS validators |
| `config/` | Typed config |
| `database/migrations/` | Migrations |
| `public/` | Static as-is |
| `resources/` / `inertia/` | Bundled frontend assets |

## Commands

```bash
node ace                 # list commands
node ace list:routes
node ace add @adonisjs/mail
node ace configure @adonisjs/lucid
```
