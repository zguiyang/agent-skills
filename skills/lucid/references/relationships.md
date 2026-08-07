# Relationships — Lucid

Cheat-sheet. Deep: `docs/relationships`, `docs/belongs-to`, `docs/has-one`, `docs/has-many`, `docs/has-many-through`, `docs/many-to-many`.

## Declare on the model only

Related model as `() => Model`. Named by **FK ownership**, not cardinality.

| Decorator | Type | FK | Writes |
| --- | --- | --- | --- |
| `@belongsTo` | `BelongsTo` | This model | `associate` / `dissociate` |
| `@hasOne` | `HasOne` | Related (unique) | `save`/`create`/`firstOrCreate`/`updateOrCreate` |
| `@hasMany` | `HasMany` | Related | `save(Many)`/`create(Many)`/upsert helpers |
| `@manyToMany` | `ManyToMany` | Pivot | `attach`/`detach`/`sync`/`save*`/`create*` |
| `@hasManyThrough` | `HasManyThrough` | Through | **None** — persist intermediate |

Options: `foreignKey`, `localKey`, `onQuery` (read paths only — not write helpers), `meta`. M2M: `pivotTable`, `pivotForeignKey`, `pivotRelatedForeignKey`, `pivotColumns`, `pivotTimestamps`.

Default pivot table = alpha-sorted snake (`skill_user`) — set `pivotTable` if wrong.

## Load

- Eager: `preload('posts', (q) => …)` / `preloadOnce`
- Lazy: `related('posts').query()`
- Unloaded: to-one `null`, to-many `[]`

Constraints: `has` / `whereHas` / `doesntHave` (+ count operators on hasMany/M2M).

**Per-parent limit in preload:** `groupLimit` / `groupOrderBy` — plain `.limit` limits all parents combined.

Paginate relations only on lazy `related().query()` — not inside preload; not for belongsTo/hasOne.

## M2M notes

- Pivot attrs → `$extras.pivot_*`; select with `pivotColumns([...])`, filter `wherePivot*`
- `attach` does not dedupe; `sync(ids|attrs, detachMissing=true)` for idempotent sets
- Enforce composite unique on pivot in DB

## hasManyThrough

Read-only. Options: `foreignKey`, `localKey`, `throughForeignKey`, `throughLocalKey`.
