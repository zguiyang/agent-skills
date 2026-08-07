# Stack deltas — Lucid

Single product path (AdonisJS SQL). Deltas are dialect / deployment.

| Feature | PG | MySQL | SQLite / LibSQL | MSSQL |
| --- | --- | --- | --- | --- |
| Read replicas | Yes | Yes | No | Yes |
| Advisory locks | Yes | Yes | No | No |
| `searchPath` | Yes | — | — | — |
| Host key | `host` | `host` | file/url | `server` |
| `returning` | Yes | Ignored | Dialect | Dialect |
| Trx `isolationLevel` | Yes | Yes | Ignored | + `snapshot` |
| Concurrent indexes | + `disableTransactions` | — | — | — |
| Materialized views | Schema builder | — | — | — |

- Dual-mode replicas: force `mode: 'write'` after writes.
- Multi-connection: Ace `--connection`; models `static connection`; dumps per connection.
- Composite PK: introspection keeps a single PK column — limitation.
- App frontend stacks (Edge/Inertia/API) are AdonisJS concerns, not Lucid variants.
