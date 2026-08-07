# Frontend — AdonisJS v7

Official: https://docs.adonisjs.com/guides/frontend/edgejs.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/frontend/inertia`

## Official pages

- [EdgeJS](https://docs.adonisjs.com/guides/frontend/edgejs.md)
- [Inertia](https://docs.adonisjs.com/guides/frontend/inertia.md)
- [Transformers](https://docs.adonisjs.com/guides/frontend/transformers.md)
- [Type-safe API client (Tuyau)](https://docs.adonisjs.com/guides/frontend/api-client.md)
- [TanStack Query](https://docs.adonisjs.com/guides/frontend/tanstack-query.md)
- [Vite](https://docs.adonisjs.com/guides/frontend/vite.md)

## Pick a stack

| Stack | When |
|-------|------|
| Edge | Server-rendered HTML (Hypermedia kit) |
| Inertia + React/Vue | Monolith SPA-like UX |
| API + Tuyau | Separate frontend; end-to-end types |

## Edge

```ts
return view.render('pages/posts/index', { posts })
```

Templates under `resources/views`. Use `urlFor` in templates (v7), not legacy `route()`.

## Inertia

```ts
return inertia.render('posts/index', { posts })
```

Follow v7 Inertia config/middleware (entrypoint / shared data shapes changed from v6 — see upgrade guide).

## Transformers

Serialize models/DTOs for JSON or Inertia props; generate frontend types when using the API kit / Tuyau flow. Prefer official transformer stubs:

```bash
node ace make:transformer post
```

## Tuyau + TanStack Query

Type-safe HTTP client for Adonis routes. Integrate with TanStack Query for caching/infinite scroll — follow `/guides/frontend/api-client.md` and `/guides/frontend/tanstack-query.md`.

## Vite

Asset bundling for Edge/Inertia kits. Entrypoints live under `resources/` or kit-specific paths. Dev HMR via `node ace serve --hmr`.
