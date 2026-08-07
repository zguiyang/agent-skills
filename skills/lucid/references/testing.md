# Testing — Lucid

Cheat-sheet. Deep: `docs/testing`.

## DB helpers

```ts
import testUtils from '@adonisjs/core/services/test_utils'

// Runner setup: migrate once; cleanup = migration:reset
await testUtils.db().migrate()

// Per-test isolation
group.each.setup(() => testUtils.db().truncate())
// optional: seed after truncate

// Fast rollback isolation (not for concurrent txs / subprocesses needing commits)
group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

// Named connection
testUtils.db('analytics')
```

Deprecated alias: `withGlobalTransaction()`.

## Assertions

```ts
import { dbAssertions } from '@adonisjs/lucid/plugins/japa/db'
// assertHas, assertMissing, assertCount, assertEmpty,
// assertModelExists, assertModelMissing
// db.connection(name) for multi-DB
```

## Practices

- Prefer factories + truncate over fragile fixtures.
- Do not close the connection manager inside individual tests unless the suite owns the process lifecycle.
- Use Quietly APIs only when intentionally skipping hooks in fixtures.
