# Database service — Lucid

Cheat-sheet. Deep: `docs/database-service`, `docs/transactions`, `docs/pagination`, `docs/debugging`, `docs/connection-manager`, `docs/validation`.

## Entry

```ts
import db from '@adonisjs/lucid/services/db'
```

| API | Use |
| --- | --- |
| `db.from(table)` | Select builder |
| `db.table(table)` | Insert builder |
| `db.query()` / `db.insertQuery()` | No preselected table |
| `db.rawQuery(sql, bindings)` | Execute raw |
| `db.raw` / `db.ref` | SQL fragments |
| `db.transaction` | Managed/manual trx |
| `db.connection(name, { mode? })` | Named / replica mode |
| `db.modelQuery(Model)` | Dynamic model QB |
| `db.knexQuery()` | Escape hatch |

Prefer `Model.query()` in app code.

## Transactions

- Prefer `await db.transaction(async (trx) => { … })`.
- Manual: must `commit`/`rollback`.
- Nesting = savepoints. Isolation levels dialect-specific; SQLite ignores `isolationLevel`.
- Wire: `{ client: trx }`, `user.useTransaction(trx)`, `User.query({ client: trx })`, `Model.transaction(...)`.
- After-commit work: `trx.after('commit', …)` / `$trx.after('commit', …)`.

## Pagination

`.paginate(page, perPage)` — offset only; default perPage 20. Always `orderBy`. Relation pagination: hasMany / manyToMany / hasManyThrough only.

## Debugging

`db:query` fires only if a listener is subscribed **and** `debug: true` (or `.debug(true)`). Dev: `prettyPrintDebugQueries`, `asyncStackTraces`. EXPLAIN via `.toSQL()` + `db.rawQuery('EXPLAIN …', bindings)`.

## Connection manager

`db.manager`: `has`, `get`, `connect`, `close`/`closeAll`, `release`, `add`, `patch`. Close only in scripts/workers/tests — **not** HTTP handlers. Unregistered name → `E_UNMANAGED_DB_CONNECTION`.

Advisory locks: `getAdvisoryLock` / `releaseAdvisoryLock` — PG + MySQL only.

## Vine DB rules

`.unique({ table, column?, filter?, … })` / `.exists({ … })` on string/number. Updates need `filter` excluding current row. Messages: `database.unique` / `database.exists`.

## Health

`DbCheck`, `DbConnectionCountCheck` from `@adonisjs/lucid/database`.
