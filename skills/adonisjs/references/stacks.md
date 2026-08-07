# Stacks — Hypermedia vs Inertia

| Concern | Hypermedia | Inertia React |
| --- | --- | --- |
| Home | `render('pages/home')` | `renderInertia('home')` |
| Page | `view.render` | `inertia.render` + transformers |
| UI scaffold | `make:view` | `make:page` |
| Forms | Edge `@form` / `@field` | `<Form route>` (`@adonisjs/inertia/react`) |
| Authz UI | `@can('PostPolicy.edit', post)` | `allows` → `can.*` in transformer (**no policy imports in React**) |
| Nav | `urlFor` / anchors | `<Link>` |

Backend spine (routes, Vine, Lucid, Bouncer `authorize`) stays shared.

Vertical example: [../examples/crud-resource.md](../examples/crud-resource.md).
