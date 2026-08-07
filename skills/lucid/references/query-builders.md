# Query builders — Lucid

Cheat-sheet. Deep: `docs/select-query-builder`, `docs/insert-query-builder`, `docs/update-and-delete-queries`, `docs/raw-query-builder`. Fetch those slugs for full method lists.

## When to use which

| Surface | Entry | Use when |
| --- | --- | --- |
| Model QB | `Model.query()` | Typed instances, preload, hooks path |
| Select | `db.from(table)` / `db.query()` | Reports, joins, aggregates, CTE/locks → plain objects |
| Insert | `db.table(table)` / `db.insertQuery()` | Bulk insert, upserts, `returning` |
| Update/Delete | select builder + `.update`/`.delete`/`.increment` | Bulk mutations; no model hooks |
| Raw | `db.rawQuery(sql, bindings)` / `db.raw(...)` | Only when builders cannot express |

Prefer `Model.create` / `save` for domain inserts.

## Select — must-know surface

| Area | Methods |
| --- | --- |
| Columns / from | `select`, `from`, `as` |
| Where | `where*`, `whereColumn`, `whereLike`/`whereILike`, `whereIn`, `whereNull`, `whereBetween`, `whereExists`, `whereRaw`, `wrapExisting` |
| JSON where | `whereJsonPath`, `whereJson`, `whereJsonSuperset`, `whereJsonSubset` |
| Joins | `join` / `leftJoin` / …, `joinRaw`, `on*` |
| Aggregate | `groupBy`, `having`, `count`/`sum`/`avg`/…, `distinct`, `distinctOn` (PG) |
| Order / page | `orderBy`, `offset`/`limit`, `forPage` |
| Set ops | `union`/`unionAll`, `intersect`, `except` |
| CTE | `with`, `withMaterialized`/`withNotMaterialized`, `withRecursive` |
| Locks (inside trx client) | `forUpdate`, `forShare`, `skipLocked`, `noWait` |
| Fetch helpers | `first`, `firstOrFail` |

Locks must run on the **transaction client** (`trx`), not a separate `db` connection.

## Insert — must-know surface

| Method | Notes |
| --- | --- |
| `insert(row)` | Dialect return differs; prefer `returning` where supported |
| `multiInsert(rows)` | Single multi-VALUES statement; faster than looped insert |
| `returning(cols\|\*)` | PG/MSSQL/Oracle/SQLite 3.35+; **MySQL ignores** |
| `onConflict(cols?).ignore()` | Skip on unique conflict |
| `onConflict(cols?).merge(…)` | Upsert |

## Update / delete

- `.update(values)`, `.increment` / `.decrement`, `.delete()` / `.del()`
- Always add `where` — Lucid does not force it
- Read replica clients refuse writes — use `mode: 'write'`

## Raw

- Execute: `db.rawQuery(sql, bindings)`
- Fragment: `db.raw(sql, bindings)` / `db.ref(identifier)`
- Never concatenate user input into SQL strings

## Hard rules

- Domain rows → models; reports/bulk SQL → these builders
- Bindings on raw SQL
- `returning` ignored on MySQL
- Deep chains / dialect edge cases → `lookup_docs.py --fetch docs/select-query-builder` (etc.)
