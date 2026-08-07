# Testing — AdonisJS v7

Lookup:

- `python3 scripts/lookup_docs.py --fetch guides/testing/introduction`
- `python3 scripts/lookup_docs.py --fetch guides/testing/api-tests`
- `python3 scripts/lookup_docs.py --fetch guides/testing/browser-tests`
- `python3 scripts/lookup_docs.py --fetch guides/testing/mocks-and-fakes`

## Stack

**Japa** + `@japa/plugin-adonisjs` (not Jest/Vitest by default).

```bash
node ace test
```

v7 globs use `*.spec.{ts,js}` (see `adonisrc.ts`).

## Bootstrap (API kit pattern)

`tests/bootstrap.ts` typically registers:

- `pluginAdonisJS(app)`
- `apiClient()` (`@japa/api-client`)
- `sessionApiClient(app)` / `authApiClient(app)` when testing session or tokens

## API tests

Real HTTP against the app (not mocked Express handlers):

```ts
import { test } from '@japa/runner'

test.group('Posts API', () => {
  test('lists posts', async ({ client }) => {
    const response = await client.get('/api/posts')
    response.assertStatus(200)
  })

  test('creates post', async ({ client }) => {
    const response = await client.visit('posts.store').json({
      title: 'Hello',
      content: 'Body',
    })
    response.assertStatus(200)
  })
})
```

Also: `client.post|put|patch|delete(url)`. Prefer route names via `visit` when the registry is typed.

Protect routes: use auth/session API-client plugins from the docs — do not invent Passport helpers.

## Practices

- Reset DB / state between tests per official “resetting state” guide
- Prefer framework fakes (mail, hash, emitter, drive) and container swaps
- Browser tests → Playwright guide; console tests → Ace command guide
- Assert with Japa assert API on status / body / cookies

When unsure: `--fetch` the matching testing guide before inventing a runner.
