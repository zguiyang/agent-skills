# Anti-patterns & common mistakes — Lucid

## Do not

| Anti-pattern | Why |
| --- | --- |
| Edit `database/schema.ts` by hand | Overwritten on migrate / `schema:generate` |
| Expect Prisma/Drizzle code-first diffs | Lucid is migrations + DB introspection |
| Bulk `query().update/delete` expecting hooks | Hooks and auto-timestamps skip |
| Side effects in `afterSave` without commit guard | Runs before commit — use `$trx.after('commit')` |
| `.limit` in preload for top-N per parent | Use `groupLimit` / `groupOrderBy` |
| Paginate inside `preload` / paginate belongsTo|hasOne | Unsupported patterns |
| Write through `hasManyThrough` | Read-only |
| `attach` for idempotent M2M | Prefer `sync` |
| Abandon manual transactions | Starves pool |
| Close pools in HTTP handlers | Breaks the process |
| Concatenate user input into raw SQL | Use bindings |
| Update/delete without `where` | Lucid does not force WHERE |
| `unique` on update without excluding self | Always fails |
| Invent Eloquent/Prisma APIs | Fetch Lucid docs instead |

## Common mistakes → fix

| Mistake | Fix |
| --- | --- |
| Schema edits wiped | Migration + `schema_rules.ts` / model overrides |
| Soft-delete leaks in lists / finds / pages | Same filter on `beforeFind` **and** `beforeFetch`; for `paginate` use `beforePaginate` and mutate **both** `[countQuery, query]` |
| Double relation queries | `preloadOnce` |
| Pivot table missing | Explicit `pivotTable` |
| Unstable pagination | `orderBy` before `paginate` |
| UUID not inserted | `selfAssignPrimaryKey = true` |
| Non-`id` PK broken | `static primaryKey` |
| Seed duplicates | Idempotent upserts (seeders untracked) |
| Silent debug logs | Listener **and** `debug: true` |
| `E_UNMANAGED_DB_CONNECTION` | Register name in `config/database.ts` |
| MySQL `returning` empty | Not supported |
| Replica stale reads | `mode: 'write'` after writes |
