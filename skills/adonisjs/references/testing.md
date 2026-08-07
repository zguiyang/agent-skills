# Testing — AdonisJS v7

Official: https://docs.adonisjs.com/guides/testing/introduction.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/testing/api-tests`

## Official pages

- [Introduction](https://docs.adonisjs.com/guides/testing/introduction.md)
- [API tests](https://docs.adonisjs.com/guides/testing/api-tests.md)
- [Browser tests](https://docs.adonisjs.com/guides/testing/browser-tests.md)
- [Console tests](https://docs.adonisjs.com/guides/testing/console-tests.md)
- [Resetting state](https://docs.adonisjs.com/guides/testing/resetting-state-between-tests.md)
- [Database assertions](https://docs.adonisjs.com/guides/testing/database-assertions.md)
- [Test doubles](https://docs.adonisjs.com/guides/testing/test-doubles.md)

## Stack

- Runner: **Japa** + `@japa/plugin-adonisjs`
- Suites in `adonisrc.ts`; plugins in `tests/bootstrap.ts`
- Prefer real HTTP via API client over mocking the stack

```bash
node ace make:test posts/index --suite=functional
node ace test
node ace test --files=posts/index
```

## API tests (pattern)

```ts
import { test } from '@japa/runner'

test.group('Posts API', () => {
  test('list posts', async ({ client }) => {
    const response = await client.get('/posts')
    response.assertStatus(200)
  })
})
```

Use `client.visit('route.name')` when working with named routes; enable `authApiClient` / `sessionApiClient` as documented. `.env.test` often sets `SESSION_DRIVER=memory`.

## DB isolation

```ts
test.group('Posts', (group) => {
  group.each.setup(async () => {
    // truncate / migrate helpers from testUtils.db() — see resetting-state guide
  })
})
```

## Fakes

Mail, Hash, Emitter, Drive fakes + container swaps — see test-doubles guide. Prefer fakes over monkey-patching internals.

## Do not

- Default to Jest/Vitest for new Adonis apps.
- Skip DB cleanup between tests that write data.
