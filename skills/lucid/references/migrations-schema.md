# Migrations & schema — Lucid

Cheat-sheet. Deep: `docs/migrations`, `docs/schema-builder`, `docs/table-builder`, `docs/schema-classes`, `docs/schema-generation`, `docs/schema-dumps`.

## Loop

1. `node ace make:migration posts --create=posts` (or `make:model --migration`)
2. Implement `up`/`down` on `BaseSchema` from `@adonisjs/lucid/schema`
3. `node ace migration:run` → records in `adonis_schema` + regenerates `database/schema.ts`
4. Model: `class Post extends PostsSchema {}`
5. Customize types: `schema_rules.ts` / model `@column` overrides — **never** edit generated schema

Skip auto-generate: `--no-schema-generate`. Manual: `schema:generate` (legacy adopt / recover).

## BaseSchema helpers

`this.schema` (DDL), `this.now()`, `this.raw(sql, bindings?)`, `this.defer(cb)` (data), `this.knex()`, `this.db`, `static disableTransactions = true` (e.g. concurrent indexes).

## Table builder (selected)

`increments`/`bigIncrements`, integers, `string`/`text`, `boolean`, dates/`timestamps`, `uuid`, `json`/`jsonb`, `enu`, FK `.references().inTable()`, checks, `alter()` / drops.

`timestamps(...)` returns void — use explicit `timestamp` for tz/precision/indexes.

## Schema classes & rules

Generated: `UsersSchema extends BaseModel`, `@column` / `@column.dateTime`, snake→camel.

`SchemaRules`: `types`, `columns`, `tables` (+ `skipColumns`, per-table `primaryKey`). Prefer app-level status over native enums. Non-`id` PK → `static primaryKey` on model. Single PK only.

## Dumps

`schema:dump` → SQL + meta for fast empty-DB bootstrap. `--prune` baselines by deleting migration files — commit dump+manifest+deletes together. Does not replace forward migrations.

## Production

Forward-only; `disableRollbacksInProduction`; advisory locks (PG/MySQL); `--dry-run` before risky runs (`defer` skipped in dry-run).
