# Getting started — Lucid

Cheat-sheet. Deep pages: `docs/introduction`, `docs/installation`, `docs/configuration`, `docs/commands`.

## Install

```bash
npm i @adonisjs/lucid
node ace configure @adonisjs/lucid --db=sqlite
```

Creates provider, commands, `config/database.ts`, env validations, installs driver.

## Mental model

Migrations change DB → Lucid regenerates `database/schema.ts` → models extend `*Schema` and add relations/hooks/domain.

Knex underneath: PG, MySQL, SQLite, LibSQL, MSSQL.

## Config essentials

`config/database.ts`: `connection` (default name), `connections`, optional `prettyPrintDebugQueries`.

| DB | `client` | Package |
| --- | --- | --- |
| SQLite | `better-sqlite3` / `sqlite3` | same |
| LibSQL | `libsql` | `@libsql/sqlite3` |
| MySQL | `mysql2` | `mysql2` |
| PostgreSQL | `pg` | `pg` |
| MSSQL | `mssql` | `tedious` |

Env: `DB_*` or `DATABASE_URL` / `connectionString` — one credential source of truth.

Notable: `replicas` (not SQLite/LibSQL), `pool`, PG `searchPath`, MySQL `timezone: 'Z'`, MSSQL uses `server` not `host`, `migrations` / `seeders` / `schemaGeneration` / `wipe.ignoreTables`.

## Ace families

- `make:migration|model|factory|seeder`
- `migration:run|rollback|reset|refresh|fresh|status`
- `db:seed|wipe|truncate`
- `schema:generate|dump`

Useful flags: `--connection`, `migration:run --dry-run`, `--no-schema-generate`, `--force` (prod), `make:model --migration --factory`.

## Paths

`database/migrations/`, `database/schema.ts`, `database/schema_rules.ts`, `database/seeders/`, `database/factories/`, `app/models/`.
