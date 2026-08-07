---
name: lucid
description: >-
  AdonisJS Lucid SQL/ORM skill (Knex query builder, Active Record models,
  migrations, generated schema classes). Use when writing or reviewing Lucid
  models, migrations, relationships, query builders, seeders, factories, or
  transactions in an AdonisJS app — or when the user mentions @adonisjs/lucid,
  BaseSchema, schema:generate, preload, or database/schema.ts. Prefer this over
  inventing Prisma/Eloquent/TypeORM patterns.
---

# Lucid (AdonisJS SQL)

## Pinned version

| Item | Value |
| --- | --- |
| Package | **`@adonisjs/lucid`** (current docs at lucid.adonisjs.com) |
| Docs | https://lucid.adonisjs.com/docs/introduction |
| Host framework | AdonisJS (detect app major separately if needed) |

```bash
python3 scripts/detect_version.py
```

Official Lucid docs in-corpus do not pin a Lucid semver — treat `lucid.adonisjs.com` as current. Confirm `@adonisjs/lucid` in the target `package.json` before coding.

## Agent loop

```
1. detect_version.py → confirm @adonisjs/lucid present; pin docs base
2. Map task → topic table below
3. Read matching references/*.md
4. If thin/stale/deep API: python3 scripts/lookup_docs.py --fetch <slug>
5. Implement via node ace make:* / migration:* / schema:* (DB-first)
6. Cite https://lucid.adonisjs.com/docs/<slug> for non-obvious APIs
```

## Topic → reference map

| Task | Read first | Docs slug |
| --- | --- | --- |
| Install / config / drivers | [getting-started.md](references/getting-started.md) | docs/installation, docs/configuration |
| Ace commands | [getting-started.md](references/getting-started.md) | docs/commands |
| `db` service, trx, pagination, debug, connection manager | [database-service.md](references/database-service.md) | docs/database-service, docs/transactions, docs/pagination, docs/debugging, docs/connection-manager |
| Vine `unique` / `exists` DB rules | [database-service.md](references/database-service.md) | docs/validation |
| Models, CRUD, hooks, scopes | [models.md](references/models.md) | docs/models, docs/crud-operations, docs/model-hooks, docs/model-query-builder, docs/model-query-scopes |
| Serialization / transformers | [models.md](references/models.md) | docs/serializing-models |
| Relationships | [relationships.md](references/relationships.md) | docs/relationships, docs/belongs-to, … |
| Migrations + schema generation | [migrations-schema.md](references/migrations-schema.md) | docs/migrations, docs/schema-generation |
| Select/insert/update/raw builders | [query-builders.md](references/query-builders.md) | docs/select-query-builder, … |
| Seeders / factories | [seeders-factories.md](references/seeders-factories.md) | docs/seeders, docs/model-factories |
| Testing | [testing.md](references/testing.md) | docs/testing |
| Dialect / replica deltas | [stack-deltas.md](references/stack-deltas.md) | docs/configuration |
| Package imports | [packages-map.md](references/packages-map.md) | — |
| Wrong / outdated patterns | [anti-patterns.md](references/anti-patterns.md) | — |
| Full URL catalog | [docs-index.md](references/docs-index.md) | — |

## Hard conventions

1. **DB-first**: hand-write migrations → `migration:run` → generated `database/schema.ts` → models extend `*Schema`. Never hand-edit `database/schema.ts`.
2. **Columns on schema, behavior on models**: relations, hooks, scopes, domain methods live on `app/models/*`.
3. **Prefer models for domain**; use `db.from` / insert builders for reports and bulk SQL.
4. **Managed transactions** for multi-write; pass `{ client: trx }` / `useTransaction`; defer side effects with `$trx.after('commit')`.
5. **Preload before transform**; use `groupLimit` for per-parent limits; `hasManyThrough` is read-only.
6. **Bulk `query().update/delete` skip hooks** — intentional; use instance `save()` when hooks matter.
7. **Always `orderBy` before `paginate`**; bind raw SQL — never concatenate user input.
8. Do not invent Prisma/Eloquent APIs; fetch official Lucid pages when unsure.

## Progressive disclosure

- Example vertical: [examples/posts-resource.md](examples/posts-resource.md)
- Anti-patterns: [references/anti-patterns.md](references/anti-patterns.md)
- Lookup: `python3 scripts/lookup_docs.py models` / `--fetch docs/models`
