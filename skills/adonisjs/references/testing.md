# Testing — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/testing/api-tests](https://docs.adonisjs.com/guides/testing/api-tests)
- [guides/testing/browser-tests](https://docs.adonisjs.com/guides/testing/browser-tests)
- [guides/testing/console-tests](https://docs.adonisjs.com/guides/testing/console-tests)
- [guides/testing/database-assertions](https://docs.adonisjs.com/guides/testing/database-assertions)
- [guides/testing/introduction](https://docs.adonisjs.com/guides/testing/introduction)
- [guides/testing/resetting-state-between-tests](https://docs.adonisjs.com/guides/testing/resetting-state-between-tests)
- [guides/testing/test-doubles](https://docs.adonisjs.com/guides/testing/test-doubles)

## Condensed excerpts (prefer live docs if conflict)

### guides/testing/api-tests
Source: https://docs.adonisjs.com/guides/testing/api-tests

API tests (Testing) - AdonisJS Documentation 

API tests 

API tests 
This guide covers testing JSON API endpoints in AdonisJS applications. You will learn how to: 
Configure the API client and related plugins 
Write tests for API endpoints using route names 
Send JSON and form data with requests 
Work with cookies and sessions during tests 
Authenticate users using sessions or access tokens 
Debug requests and responses 
Assert on response status, body, headers, and more 
Overview 
API testing in AdonisJS uses  [link:https://japa.dev/docs/plugins/api-client] Japa's API client to make real HTTP requests against your application. Unlike mocked or simulated requests, the API client boots your AdonisJS server and sends actual network requests from outside in. This approach tests your entire HTTP layer—routes, middleware, controllers, and responses—exactly as they would behave in production. 
The API client integrates with AdonisJS features like sessions and authentication through dedicated plugins, making it straightforward to test protected endpoints and stateful interactions. 
Configuration 
The starter kit comes pre-configured with three plugins in the file. 
tests/bootstrap.ts 

```
import { apiClient } from '@japa/api-client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import type { Registry } from '../.adonisjs/client/registry/schema.d.ts'

declare module '@japa/api-client/types' {
  interface RoutesRegistry extends Registry {}
}

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  /**
   * Configures Japa's API client for making HTTP requests
   */
  apiClient(),
  /**
   * Adds support for reading/writing session data during requests
   */
  sessionApiClient(app),
  /**
   * Adds support for authenticating users during requests
   */
  authApiClient(app),
]
```

When using sessions during tests, the session driver must be set to in your file. This is configured by default in the starter kit. 
.env.test 

```
SESSION_DRIVER=memory
```

Writing your first test 
Let's test an account creation endpoint that validates input and creates a new user. We'll write two tests: one for validation errors and one for successful creation. 
The route is defined in . 
start/routes.ts 

```
router.post('signup', [controllers.NewAccount, 'store'])
```

The first test verifies that validation errors are returned when required fields are missing. The method accepts a route name and automatically determines the HTTP method and URL pattern from your route definition. 
tests/functional/auth/signup.spec.ts 

```
import { test } from '@japa/runner'

test.group('Auth signup', () => {
  test('return error when required fields are not provided', async ({ client }) => {
    /**
     * Make a POST request to the signup route.
     * Since no data is sent, validation should fail.
     */
    const response = await client.visit('new_account.store')

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'fullName',
          message: 'The fullName field must be defined',
          rule: 'required',
        },
        {
          field: 'email',
          message: 'The email field must be defined',
          rule: 'required',
        },
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
        {
          field: 'passwordConfirmation',
          message: 'The passwordConfirmation field must be defined',
          rule: 'required',
        },
      ],
    })
  })
})
```

The second test sends valid data and verifies the user was created. You can query the database directly in your tests to verify side effects. 
tests/functional/auth/signup.spec.ts 

```
import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth signup', () => {
  test('create user account', async ({ client, assert }) => {
    /**
     * Send JSON data using the fluent .json() method
     */
    const response = await client.visit('new_account.store').json({
      fullName: 'John doe',
      email: 'john@example.com',
      password: 'demo',
      passwordConfirmation: 'demo',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        fullName: 'John doe',
        email: 'john@example.com',
      },
    })

    /**
     * Verify the user was persisted to the database
     */
    const user = await User.findOrFail(response.body().data.id)
    assert.equal(user.email, 'john@example.com')
  })
})
```

Cleaning up database state 
Tests that create database records need cleanup between runs to ensure isolation. The 
```
testUtils.db().truncate()
```
hook migrates the database and truncates all tables after each test. 
See also:  [link:/guides/testing/resetting-state-between-tests] Database testing utilities for additional methods like migrations and seeders. 
tests/functional/auth/signup.spec.ts 

```
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth signup', (group) => {
  /**
   * Truncate tables after each test to ensure
   * a clean state for the next test
   */
  group.each.setup(() => {
    return testUtils.db().truncate()
  })

  test('create user account', async ({ client, assert }) => {
    // ...
  })
})
```

Making requests 
The API client provides two approaches for making HTTP requests: using route names or explicit HTTP methods. 
Using route names 
The method accepts a route name and looks up the HTTP method and URL pattern from your router. This keeps your tests in sync with route changes and also provides type-safety within tests. 

```
const response = await client.visit('posts.store')
```

Using HTTP methods 
When you need to hit a specific URL directly, use the explicit HTTP method functions. 

```
const response = await client.get('/api/posts')
const response = await client.post('/api/posts')
const response = await client.put('/api/posts/1')
const response = await client.patch('/api/posts/1')
const response = await client.delete('/api/posts/1')
```

Sending request data 
JSON data 
Use the method to send a JSON payload. The header is set automatically. 

```
const response = await client.visit('posts.store').json({
  title: 'Hello World',
  content: 'This is my first post',
})
```

Form data 
Use the method to send URL-encoded form data. 

```
const response = await client.visit('posts.store').form({
  title: 'Hello World',
  content: 'This is my first post',
})
```

Multipart data 
Use the method to send multipart form fields. 

```
const response = await client
  .visit('posts.store')
  .field('title', 'Hello World')
  .field('content', 'This is my first post')
```

Cookies 
You can set cookies on outgoing requests using the method and its variants. 

```
/**
 * Set a regular cookie
 */
const response = await client
  .vis

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/testing/browser-tests
Source: https://docs.adonisjs.com/guides/testing/browser-tests

Browser tests (Testing) - AdonisJS Documentation 

Browser tests 

Browser tests 
This guide covers end-to-end browser testing for hypermedia and Inertia applications. You will learn how to: 
Configure browser testing plugins in your test suite 
Control test execution via CLI options (browsers, headed mode, traces, slow motion) 
Write basic page visit tests with assertions 
Reset database state between tests 
Fill and submit forms using Playwright selectors 
Use recording mode to generate test code quickly 
Authenticate users before visiting protected pages 
Overview 
Browser tests verify your application from the outside-in, navigating it exactly as a real user would. Unlike unit tests that examine isolated pieces of code, browser tests exercise the entire stack: routes, controllers, views, database queries, and client-side interactions all working together. 
For hypermedia and Inertia applications, browser tests should form the majority of your test suite. These applications are inherently about user interactions with rendered pages, and browser tests capture this reality directly. When a browser test passes, you have high confidence that the feature actually works for users. When it fails, you've caught a bug that users would have encountered. 
This approach may feel different if you're accustomed to the "testing pyramid" where unit tests dominate. For server-rendered applications, inverting this pyramid makes sense: browser tests provide more value per test because they verify complete user flows rather than implementation details. 
Setup 
Browser testing requires three plugins configured in your file. These are already installed and configured with the official Hypermedia and Inertia starter kits. 
tests/bootstrap.ts 

```
import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),

  /**
   * Configures Playwright and creates a fresh browser
   * context before every test.
   */
  browserClient({ runInSuites: ['browser'] }),

  /**
   * Allows reading and writing session data
   * via the browser context.
   */
  sessionBrowserClient(app),

  /**
   * Enables the loginAs method for authenticating
   * users during tests.
   */
  authBrowserClient(app),
]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
```

CLI options 
Playwright behavior is controlled through command-line flags when running tests. The following options help with debugging and cross-browser verification. 

Run tests in a specific browser. Supported values are , , and . 

```
node ace test --browser=firefox
```

Show the browser window during test execution. By default, tests run in headless mode. 

```
node ace test --headed
```

Open browser devtools automatically when the browser launches. 

```
node ace test --devtools
```

Slow down test actions by the specified number of milliseconds. Useful for visually following what the test is doing. 

```
node ace test --slow=500
```

Record traces for debugging. Use to record only when tests fail, or to record every test. 

```
node ace test --trace=onError
```

Recording traces 
Traces capture a complete timeline of your test execution, including screenshots, network requests, and DOM snapshots. Generate traces only when tests fail or for every test. 

```
# Record traces only when a test fails
node ace test --trace=onError

# Record traces for every test
node ace test --trace=onTest
```

Traces are stored in the directory. Replay them using Playwright's trace viewer. 

```
npx playwright show-trace browsers/path-to-trace.zip
```

Running specific tests 
Run all browser tests or target specific files and folders. 

```
# Run all browser tests
node ace test browser

# Run tests from a specific folder
node ace test --files="posts/*"
```

Basic page visits 
A browser test visits a page and makes assertions about its content. The helper opens a URL, and the returned page object provides assertion methods. 
tests/browser/posts/index.spec.ts 

```
import { test } from '@japa/runner'

test.group('Posts index', () => {
  test('display list of posts', async ({ visit, route }) => {
    /**
     * Visit the posts index page using its named route.
     * The visit helper returns a Playwright page instance
     * extended with assertion methods.
     */
    const page = await visit(route('posts.index'))

    /**
     * Assert that the body contains specific text.
     * This will wait up to 5 seconds for the text to appear.
     */
    await page.assertTextContains('body', 'My first post')
  })
})
```

This test fails because no posts exist in the database. The failure message indicates the assertion timed out waiting for the expected content. 
Output of failing test 

```
ℹ AssertionError: expected 'body' inner text to include 'My first post', timed out after 5000ms

 ⁃ (AssertionError [ERR_ASSERTION]: expected 'body' inner text to include 'My first post':undefined:undefined)
```

Database state 
Tests should start with a known database state. Use the 
```
testUtils.db().truncate()
```
hook to clear tables after each test, then create the specific records your test needs. 
See also:  [link:/guides/testing/resetting-state-between-tests] Database testing utilities for additional methods like migrations and seeders. 
tests/browser/posts/index.spec.ts 

```
import Post from '#models/post'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Posts index', (group) => {
  /**
   * Truncate database tables after each test.
   * This ensures tests don't affect each other.
   */
  group.each.setup(() => testUtils.db().truncate())

  test('display list of posts', async ({ visit, route }) => {
    /**
     * Create the data this test depends on.
     * Each test sets up its own state explicitly.
     */
    const user = await User.create({
      email: 'john@example.com',
      password: 'demo',
    })
    await Post.create({
      title: 'My first post',
      content: 'This is my first post',
      userId: user.id,
    })

    const page = await visit(route('posts.index'))
    await page.assertTextContains('body', 'My first post')
  })
})
```

Form interactions 
Forms are filled using Playwright's locator methods. Select inputs by their label text and use to enter v

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/testing/console-tests
Source: https://docs.adonisjs.com/guides/testing/console-tests

Console tests (Testing) - AdonisJS Documentation 

Console tests 

Console tests 
This guide covers testing Ace commands in AdonisJS applications. You will learn how to: 
Write tests for custom Ace commands 
Capture and assert logger output using raw mode 
Test table rendering in command output 
Trap and respond to CLI prompts programmatically 
Validate prompt input within tests 
Use built-in assertion methods for command results 
Overview 
Console tests allow you to verify that your custom Ace commands behave correctly without manual interaction. Since commands often produce terminal output and prompt users for input, testing them requires special techniques to capture output and simulate user responses. 
AdonisJS provides a dedicated testing API through the service that lets you create command instances, execute them in isolation, and make assertions about their behavior. The API includes tools for capturing log output, intercepting prompts, and verifying exit codes. 
Testing commands is particularly valuable when your commands perform critical operations like database migrations, file generation, or deployment tasks. A failing command in production can have serious consequences, so automated tests help catch issues before they reach users. 
Basic example 
Let's walk through testing a simple command from start to finish. First, create a new command using the generator. 

```
node ace make:command greet

# DONE:    create app/commands/greet.ts
```

The generated command includes a method where you define the command's behavior. Update it to greet the user. 
app/commands/greet.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class Greet extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "Greet"')
  }
}
```

Next, create a test file for the command. If you haven't already defined a unit test suite, see the  [link:/guides/testing/introduction#suites] testing introduction for setup instructions. 

```
node ace make:test commands/greet --suite=unit

# DONE:    create tests/unit/commands/greet.spec.ts
```

The test uses the service to create a command instance, execute it, and verify it completed successfully. The method accepts the command class and an array of arguments (empty in this case since the command takes no arguments). 
tests/unit/commands/greet.spec.ts 

```
import { test } from '@japa/runner'
import Greet from '#commands/greet'
import ace from '@adonisjs/core/services/ace'

test.group('Commands greet', () => {
  test('should greet and exit with code 0', async () => {
    /**
     * Create an instance of the command. The second argument
     * is an array of CLI arguments to pass to the command.
     */
    const command = await ace.create(Greet, [])

    /**
     * Execute the command. This runs the `run` method.
     */
    await command.exec()

    /**
     * Assert the command exited successfully (exit code 0).
     */
    command.assertSucceeded()
  })
})
```

Run the test using the following command. 

```
node ace test --files=commands/greet
```

Testing logger output 
The command writes a log message to the terminal using . By default, this output goes directly to stdout, which makes it difficult to capture and assert against in tests. 
To solve this, you can switch the ace UI library into raw mode . In raw mode, ace stores all output in memory instead of writing to the terminal. This allows you to inspect and assert against the exact messages your command produces. 
Tip 
Raw mode captures all output from , , and other UI methods. Always switch back to normal mode after your test to avoid affecting other tests. 

Use a Japa hook to switch modes automatically before and after each test. 
tests/unit/commands/greet.spec.ts 

```
import { test } from '@japa/runner'
import Greet from '#commands/greet'
import ace from '@adonisjs/core/services/ace'

test.group('Commands greet', (group) => {
  /**
   * Switch to raw mode before each test. The returned function
   * runs after each test to restore normal mode.
   */
  group.each.setup(() => {
    ace.ui.switchMode('raw')
    return () => ace.ui.switchMode('normal')
  })

  test('should log greeting message', async () => {
    const command = await ace.create(Greet, [])
    await command.exec()

    command.assertSucceeded()

    /**
     * Assert the exact log message. In raw mode, colors are
     * represented as function names like `blue()`.
     */
    command.assertLog('[ blue(info) ] Hello world from "Greet"')
  })
})
```

Warning 
Log assertions in raw mode include color function names. The message 
```
this.logger.info('Hello')
```
becomes in raw mode. If your assertion fails, check that you've included the color formatting in your expected string. 

Testing table output 
Commands often display tabular data using . You can test table output the same way as log output by switching to raw mode first. 
Consider a command that displays a table of team members. 
app/commands/list_team.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class ListTeam extends BaseCommand {
  static commandName = 'list:team'
  static description = 'List all team members'

  async run() {
    const table = this.ui.table()
    table.head(['Name', 'Email'])

    table.row(['Harminder Virk', 'virk@adonisjs.com'])
    table.row(['Romain Lanz', 'romain@adonisjs.com'])
    table.row(['Julien-R44', 'julien@adonisjs.com'])

    table.render()
  }
}
```

Use to verify the table contents. Pass a two-dimensional array where each inner array represents a row's cells. 
tests/unit/commands/list_team.spec.ts 

```
import { test } from '@japa/runner'
import ListTeam from '#commands/list_team'
import ace from '@adonisjs/core/services/ace'

test.group('Commands list:team', (group) => {
  group.each.setup(() => {
    ace.ui.switchMode('raw')
    return () => ace.ui.switchMode('normal')
  })

  test('should display team members table', async () => {
    const command = await ace.create(ListTeam, [])
    await command.exec()

    /**
     * Assert table rows match expected data. Each inner array
     * represents one row with its column values.
     */
    command.assertTableRows([
      ['Harminder Virk', 'virk@adonisjs.com'],
      ['Romain Lanz', 'romain@adonisjs.com'],
      ['Julien-R44', 'julien@adonisjs.com'],
    ])
  })
})
```

Trapping prompts 
 [link:/guides/ace/prompts] Prompts pause command execution and wait for user input, which blocks automated tests. To handle this, you must trap prompts before executing the command. A trap intercepts a specific prompt and provides a programmatic response. 
Traps are created using 
```
command.prompt.trap()
```
, which accepts the prompt title as its argument. The title must match exactly, including case. 
Warning 
Prompt titles are case-sensitive. If your 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/testing/database-assertions
Source: https://docs.adonisjs.com/guides/testing/database-assertions

Database assertions (Testing) - AdonisJS Documentation 

Database assertions 

Database assertions 
This guide covers asserting database state in your AdonisJS tests. You will learn how to: 
Configure the database assertions plugin 
Assert that rows exist or are missing in a table 
Check row counts and empty tables 
Verify model instances exist or have been deleted 
Overview 
When testing features that modify the database, you often need to verify the resulting state: was the row created? Was it deleted? Are there exactly the right number of records? Lucid provides a Japa plugin that adds database assertion methods directly to the test context, so you can verify database state without writing raw queries. 
The plugin exposes a object on the test context with methods like , , , and model-level assertions. Each method queries the database and throws an with a clear message when the assertion fails. 
Setup 
Register the plugin in your file. 
tests/bootstrap.ts 

```
import app from '@adonisjs/core/services/app'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  apiClient(),
  dbAssertions(app),
]
```

Once registered, the property is available on the test context. You access it by destructuring the callback argument in your tests. 
tests/functional/users.spec.ts 

```
import { test } from '@japa/runner'

test('creates a user', async ({ db }) => {
  // Use db.assertHas, db.assertMissing, etc.
})
```

Asserting rows exist 
The method checks that at least one row in a table matches the given data. Pass a table name and an object of column/value pairs to match against. 
tests/functional/users.spec.ts 

```
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Users', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('registers a new user', async ({ client, db }) => {
    await client.visit('register.store').json({
      email: 'jul@test.com',
      password: 'demo',
    })

    // Passes if at least one row matches
    await db.assertHas('users', { email: 'jul@test.com' })
  })
})
```

You can pass an optional third argument to assert an exact number of matching rows. 
tests/functional/users.spec.ts 

```
test('promotes multiple users to admin', async ({ client, db }) => {
  await User.createMany([
    { email: 'a@test.com', password: 'demo', role: 'user' },
    { email: 'b@test.com', password: 'demo', role: 'user' },
  ])

  await client.post('/admin/promote-all')

  // Passes only if exactly 2 rows match
  await db.assertHas('users', { role: 'admin' }, 2)
})
```

Asserting rows are missing 
The method is the inverse of . It verifies that no rows in the table match the given data. 
tests/functional/users.spec.ts 

```
test('deletes inactive users', async ({ client, db }) => {
  await User.create({ email: 'old@test.com', password: 'demo', active: false })

  await client.post('/admin/cleanup')

  await db.assertMissing('users', { active: false })
})
```

Asserting row counts 
The method checks the total number of rows in a table, regardless of their content. 
tests/functional/users.spec.ts 

```
test('seeds default users', async ({ client, db }) => {
  await client.post('/setup/seed')

  await db.assertCount('users', 5)
})
```

The method is a shorthand for 
```
assertCount(table, 0)
```
. It verifies that a table has no rows at all. 
tests/functional/tokens.spec.ts 

```
test('clears all expired tokens', async ({ client, db }) => {
  await client.visit('admin.clear_tokens')

  await db.assertEmpty('auth_access_tokens')
})
```

Asserting model existence 
When working with Lucid models, you can assert directly on model instances instead of writing table-level queries. The method checks that the model's primary key still exists in the database. 
tests/functional/users.spec.ts 

```
import User from '#models/user'

test('creates a user record', async ({ client, db }) => {
  await client.visit('register.store').json({
    email: 'jul@test.com',
    password: 'demo',
  })

  const user = await User.findByOrFail('email', 'jul@test.com')
  await db.assertModelExists(user)
})
```

The method verifies that the model instance no longer exists in the database. This is useful for testing deletion operations. 
tests/functional/users.spec.ts 

```
test('deletes a user', async ({ client, db }) => {
  const user = await User.create({
    email: 'jul@test.com',
    password: 'demo',
  })

  await client.delete(`/users/${user.id}`)

  await db.assertModelMissing(user)
})
```

Assertions reference 
Method Description 

```
assertHas(table, data, count?)
```
Verifies rows matching exist. When is provided, checks the exact number of matches. 

```
assertMissing(table, data)
```
Verifies no rows match . 

```
assertCount(table, count)
```
Verifies the table has exactly total rows. 
Verifies the table has no rows. Shorthand for 
```
assertCount(table, 0)
```
. 

```
assertModelExists(model)
```
Verifies the model instance exists in the database by primary key. 

```
assertModelMissing(model)
```
Verifies the model instance does not exist in the database. 

 [link:/guides/testing/resetting-state-between-tests] Previous  [link:/guides/testing/test-doubles] Test doubles Learn how to use test doubles in AdonisJS, including built-in fakes for Mail, Hash, Emitter, and Drive, container swaps for dependency injection, and time utilities for testing time-sensitive code. 

Next

---

### guides/testing/introduction
Source: https://docs.adonisjs.com/guides/testing/introduction

Introduction (Testing) - AdonisJS Documentation 

Introduction 

Introduction to testing 
This guide covers the testing setup in AdonisJS applications. You will learn: 
About Japa, the testing framework used by AdonisJS 
How testing is configured through suites and plugins 
How to create and run your first test 
How to filter tests by file, name, tags, or suite 
How to use watch mode for rapid development 
How to override environment variables for testing 
Overview 
AdonisJS has built-in support for testing, and all starter kits come pre-configured with a complete testing setup. You can start writing tests immediately without any additional configuration. 
The testing layer is powered by  [link:https://japa.dev] Japa , a testing framework we've built and maintained for over seven years. Unlike general-purpose test runners like Jest or Vitest, Japa is purpose-built for backend applications. It runs natively in Node.js without transpilers and includes plugins specifically designed for backend testing, such as an API client for testing JSON endpoints and a filesystem plugin for managing temporary files during tests. 
We chose to build and maintain our own testing framework to avoid the churn that's common in the JavaScript ecosystem. Having seen the community shift from Mocha to Jest to Vitest, we're glad we invested in tooling we control and can evolve alongside AdonisJS. 
Japa and AdonisJS integration 
Japa integrates deeply with AdonisJS through the 
```
@japa/plugin-adonisjs
```
package. This plugin extends Japa with AdonisJS-specific utilities, giving your tests access to the application instance, route helpers for computing URLs, and methods for reading and writing cookies during HTTP and browser tests. 
The integration means you write tests that feel native to AdonisJS rather than bolting on a generic test runner that doesn't understand your application's structure. 
Project structure 
AdonisJS organizes tests into suites, where each suite represents a category of tests with its own configuration. A typical project structure looks like this. 

```
tests/
├── bootstrap.ts
├── unit/
│   └── posts_service.spec.ts
└── browser/
    └── posts.spec.ts
```

The file configures Japa plugins and lifecycle hooks. Individual test files live in suite directories, and each suite can have different timeouts, plugins, and setup logic appropriate for that type of testing. 
Understanding suites 
A test suite groups related tests that share common characteristics. For example, unit tests run quickly and don't need an HTTP server, while browser tests require a running server and have longer timeouts to account for browser automation. 
Hypermedia and Inertia starter kits come with two suites pre-configured: 
unit tests isolated pieces of code like services, utilities, and models 
browser tests run end-to-end with Playwright, simulating real user interactions 
Suites are defined in your file. 
adonisrc.ts 

```
{
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec.ts'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/browser/**/*.spec.ts'],
        name: 'browser',
        timeout: 300000,
      },
    ],
    forceExit: false,
  }
}
```

Each suite specifies a glob pattern for locating test files, a name for filtering, and a timeout in milliseconds. Browser tests have a much longer timeout (5 minutes) because browser automation is inherently slower than in-process unit tests. 
Configuring plugins and hooks 
The file is where you configure Japa plugins and define lifecycle hooks that run before and after your test suites. 
tests/bootstrap.ts 

```
import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
```

The function allows you to add setup logic specific to certain suites. In this example, browser, functional, and e2e suites automatically start the HTTP server before tests run. 
Creating your first test 
Generate a new test file using the command. 

```
node ace make:test posts/index --suite=browser
```

This creates a test file at 
```
tests/browser/posts/index.spec.ts
```
with the following structure. 
tests/browser/posts/index.spec.ts 

```
import { test } from '@japa/runner'

test.group('Posts index', () => {
  test('display a list of all posts', async ({ assert }) => {})
})
```

Tests are organized into groups using , which helps structure related tests and allows you to apply shared setup and teardown logic. Individual tests are defined with and receive a context object containing utilities like for making assertions. 
Running tests 
Run your entire test suite with the following command. 

To run a specific suite, pass the suite name as an argument. 

```
node ace test unit
node ace test browser
```

Filtering tests 
Japa provides several flags for running a subset of tests. 

Filter by exact test title. 

```
# Run tests with exact title match
node ace test --tests="can list all posts"
```

Filter by test filename (matches against the end of the filename without ). The flag supports wildcards for running all tests in a directory. 

```
# Run a specific test file
node ace test --files="posts/index"

# Run all tests in the posts directory
node ace test --files="posts/*"
```

Filter by exact group name. 

```
# Run all tests in a specific group
node ace test --groups="Posts index"
```

Filter by tags (prefix with to exclude). 

Require all specified tags to match instead of any. 

Watch mode 
During development, use watch mode to automatically re-run tests when files change. 

```
node ace test --watch
```

When a test file changes, only that file's tests are re-run. When a source file changes, all tests are executed. 
Tip 
If you're iterating on a single test, combine watch mode with the filter. This ensures any fil

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/testing/resetting-state-between-tests
Source: https://docs.adonisjs.com/guides/testing/resetting-state-between-tests

Resetting state between tests (Testing) - AdonisJS Documentation 

Resetting state between tests 

Resetting state between tests 
This guide covers managing application state during testing in AdonisJS. You will learn how to: 
Migrate and seed the database before running tests 
Clean up database state between individual tests using transactions or truncation 
Manage filesystem state with automatic cleanup 
Reset Redis data between tests 
Configure separate test databases using environment overrides 
Overview 
Tests that modify application state, such as creating database records, uploading files, or caching data in Redis, need a strategy for resetting that state between test runs. Without proper cleanup, tests can interfere with each other, leading to flaky results that pass or fail depending on execution order. 
AdonisJS provides utilities through the service that handle common state management patterns. The general approach is to run database migrations once before all tests, then reset data between individual tests using either transactions or truncation. For filesystem and Redis, similar patterns ensure each test starts with a clean slate. 
Warning 
Make sure your test environment is configured to use separate databases and storage systems from your development and production environments. Running tests against production data can result in data loss. You can use the file to override environment variables specifically for tests. 

Database state management 
Migrating the database 
Register a global setup hook in to run migrations before any tests execute. The 
```
testUtils.db().migrate()
```
method applies all pending migrations to prepare the database schema. 
tests/bootstrap.ts 

```
import testUtils from '@adonisjs/core/services/test_utils'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => testUtils.db().migrate()],
  teardown: [],
}
```

If your application uses multiple database connections, pass the connection name to target a specific database. 
tests/bootstrap.ts 

```
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => testUtils.db().migrate(),
    () => testUtils.db('tenant').migrate(),
  ],
  teardown: [],
}
```

Seeding the database 
If your tests require seed data, add the hook after migration. This runs your database seeders to populate tables with initial data. 
tests/bootstrap.ts 

```
import testUtils from '@adonisjs/core/services/test_utils'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => testUtils.db().migrate(),
    () => testUtils.db().seed(),
  ],
  teardown: [],
}
```

Cleaning Up between tests 
While migrations run once globally, you need to clean up data between individual tests to prevent state from leaking. AdonisJS offers two approaches: global transactions and truncation. 
Global transactions wrap all database operations within a test inside a transaction, then roll back when the test completes. Nothing is actually persisted to the database, which can result in faster test execution. 
tests/functional/users.spec.ts 

```
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Users', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('can create a user', async () => {
    // Database changes here are automatically rolled back after the test
  })
})
```

The 
```
withGlobalTransaction()
```
method returns a cleanup function that Japa calls automatically after each test to roll back the transaction. 
Truncation clears all data from tables between tests. This approach actually deletes records rather than rolling back transactions. 
tests/functional/posts.spec.ts 

```
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Posts', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('can create a post', async () => {
    // Tables are truncated before each test
  })
})
```

Global transactions are generally faster, especially when your database has many tables, since rolling back a transaction is less expensive than truncating every table. Choose the approach that best fits your testing needs. 
Filesystem state management 
For tests that create files, use the plugin. This plugin provides a simple API for managing files and automatically cleans them up after each test. 
Install the plugin as a dev dependency. 

```
npm i -D @japa/file-system
```

Register the plugin in your test bootstrap file. 
tests/bootstrap.ts 

```
import { fileSystem } from '@japa/file-system'

export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  fileSystem(),
]
```

Access the object within your tests to create files. Any files created through this API are automatically deleted when the test completes. 
tests/functional/uploads.spec.ts 

```
import { test } from '@japa/runner'

test('can process an uploaded file', async ({ fs }) => {
  await fs.create('document.pdf', 'file contents')

  // Test your file processing logic
  // The file is automatically cleaned up after the test
})
```

Files are created in a temporary directory managed by the plugin. For more configuration options and advanced usage, see the  [link:https://japa.dev/docs/plugins/file-system] Japa file-system plugin documentation . 
Redis state management 
For tests that interact with Redis, flush the test database between tests to ensure a clean state. Use a group setup hook to call before each test. 
tests/functional/cache.spec.ts 

```
import { test } from '@japa/runner'
import redis from '@adonisjs/redis/services/main'

test.group('Cache', (group) => {
  group.each.teardown(async () => {
    await redis.flushdb()
  })

  test('can cache a value', async () => {
    // Redis is empty at the start of each test
  })
})
```

The command clears all keys in the currently selected Redis database without affecting other databases on the same Redis server. Make sure your test environment is configured to use a different Redis database number than development or production. 
Environment configuration 
Use the file to override environment variables specifically for your test environment. This file is automatically loaded when running tests. 
.env.test 

```
DB_DATABASE=my_app_test
REDIS_DB=1
```

This ensures your tests run against isolated databases without risking your development or production data. 

 [link:/guides/testing/console-tests] Previous  [link:/guides/testing/database-assertions] Database assertions Learn how to assert database state in your AdonisJS tests using Lucid's database assertions plugin. 

Next 

 

## Key code samples

```
testUtils.db().migrate()
```

```
import testUtils from '@adonisjs/core/services/test_utils'

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [() => testUtils.db().migrate()],
  teardown: [],
}
```

```
export cons

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/testing/test-doubles
Source: https://docs.adonisjs.com/guides/testing/test-doubles

Test doubles (Testing) - AdonisJS Documentation 

Test doubles 

Test doubles 
This guide covers test doubles in AdonisJS applications. You will learn how to: 
Use built-in fakes for Mail, Hash, Emitter, and Drive services 
Swap container bindings to fake dependencies using and 
Freeze and travel through time when testing time-sensitive code 
Integrate Sinon.js for additional stubbing and mocking needs 
Overview 
Test doubles replace real implementations with controlled alternatives during testing. They allow you to isolate code under test, avoid side effects like sending real emails, and verify that your code interacts correctly with its dependencies. 
AdonisJS takes a pragmatic approach to test doubles. For internal operations like database queries, we recommend hitting the real database rather than mocking query methods. Real database interactions catch issues that mocks would miss, such as constraint violations, incorrect query syntax, or migration problems. However, for external services like email providers, payment gateways, or third-party APIs, fakes prevent unwanted side effects and make tests faster and more reliable. 
The framework provides built-in fakes for common services that interact with external systems, along with container swaps for replacing your own dependencies. For edge cases not covered by these tools, you can integrate libraries like Sinon.js. 
Built-in fakes 
AdonisJS provides fake implementations for services that typically interact with external systems. Each fake intercepts calls to the real service and captures them for assertions. 
All built-in fakes support  [link:https://github.com/tc39/proposal-explicit-resource-management] Explicit Resource Management via the keyword. When the variable goes out of scope (at the end of the test function), the fake is automatically restored. If you prefer manual control, you can still call directly or use the hook. 
Emitter fake 
The emitter fake prevents event listeners from executing while capturing emitted events for assertions. This is useful when testing code that emits events without triggering side effects like sending notifications or updating external systems. 
tests/functional/users/register.spec.ts 

```
import { test } from '@japa/runner'
import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'

test.group('User registration', () => {
  test('emits registration event on signup', async ({ client }) => {
    /**
     * Fake the emitter to capture events without
     * executing listeners. The `using` keyword automatically
     * restores the emitter when the test ends.
     */
    using fakeEmitter = emitter.fake()

    await client.post('/signup').form({
      email: 'jane@example.com',
      password: 'demo',
    })

    /**
     * Assert the event was emitted
     */
    fakeEmitter.assertEmitted(events.UserRegistered)
  })
})
```

You can fake specific events while allowing others to execute normally by passing event names or classes to the method. 

```
// Fake only these events, let others execute normally
emitter.fake([events.UserRegistered, events.OrderUpdated])
```

The returned by provides several assertion methods. 
Method Description 
Assert an event was emitted 

```
assertNotEmitted(event)
```
Assert an event was not emitted 

```
assertEmittedCount(event, count)
```
Assert an event was emitted a specific number of times 
Assert no events were emitted 

For conditional assertions, pass a callback to that receives the event data and returns if the event matches your criteria. 
tests/functional/orders/update.spec.ts 

```
fakeEmitter.assertEmitted(events.OrderUpdated, ({ data }) => {
  return data.order.id === orderId
})
```

See also:  [link:/guides/digging-deeper/emitter] Events 
Hash fake 
The hash fake replaces the real hashing implementation with a fast alternative that performs no actual hashing. Password hashing algorithms like bcrypt and argon2 are intentionally slow for security, but this can significantly slow down test suites that create many users. 
tests/functional/users/list.spec.ts 

```
import { test } from '@japa/runner'
import hash from '@adonisjs/core/services/hash'
import { UserFactory } from '#database/factories/user_factory'

test.group('Users list', () => {
  test('paginates users correctly', async ({ client }) => {
    /**
     * Fake the hash service to make user creation instant.
     * Without this, creating 50 users with bcrypt takes ~5 seconds.
     * The `using` keyword automatically restores the real
     * implementation when the test ends.
     */
    using _hash = hash.fake()

    await UserFactory.createMany(50)

    const response = await client.get('/users')
    response.assertStatus(200)
  })
})
```

The fake stores plain text and compares strings directly. It should only be used in tests where password hashing is not the focus of what you're testing. 
See also:  [link:/guides/security/hashing] Hashing 
Mail fake 
The mail fake intercepts all emails and captures them for assertions. This prevents your tests from sending real emails while allowing you to verify that the correct emails would be sent. 
tests/functional/users/register.spec.ts 

```
import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email'

test.group('User registration', () => {
  test('sends verification email on signup', async ({ client }) => {
    /**
     * Fake the mailer. The `using` keyword automatically
     * restores the real mailer when the test ends.
     */
    using fake = mail.fake()

    await client.visit('register.store').form({ email: 'user@example.com', password: 'demo' })

    /**
     * Assert the email was sent with correct recipient and subject
     */
    fake.mails.assertSent(VerifyEmailNotification, ({ message }) => {
      return message.hasTo('user@example.com').hasSubject('Please verify your email address')
    })
  })

  test('does not send reset email for unknown user', async ({ client }) => {
    using fake = mail.fake()

    await client.visit('password.forgot').form({ email: 'unknown@example.com' })

    fake.mails.assertNotSent(PasswordResetNotification)
  })
})
```

The object provides assertion methods for both sent and queued emails. 
Method Description 

```
assertSent(Mail, finder?)
```
Assert an email class was sent 

```
assertNotSent(Mail, finder?)
```
Assert an email class was not sent 

```
assertSentCount(count)
```
Assert total number of emails sent 

```
assertSentCount(Mail, count)
```
Assert count for a specific email class 
Assert no emails were sent 

```
assertQueued(Mail, finder?)
```
Assert an email was queued via 

```
assertNotQueued(Mail, finder?)
```
Assert an email was not queued 

```
assertQueuedCount(count)
```
Assert total number of queued emails 
Assert no emails were queued 

You can also test mail classes in isolation by building them without sending. 
tests/unit/mails/verify_email.spec.

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
