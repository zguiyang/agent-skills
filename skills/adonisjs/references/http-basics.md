# Http Basics — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/basics/body-parser](https://docs.adonisjs.com/guides/basics/body-parser)
- [guides/basics/controllers](https://docs.adonisjs.com/guides/basics/controllers)
- [guides/basics/debugging](https://docs.adonisjs.com/guides/basics/debugging)
- [guides/basics/exception-handling](https://docs.adonisjs.com/guides/basics/exception-handling)
- [guides/basics/file-uploads](https://docs.adonisjs.com/guides/basics/file-uploads)
- [guides/basics/http-context](https://docs.adonisjs.com/guides/basics/http-context)
- [guides/basics/middleware](https://docs.adonisjs.com/guides/basics/middleware)
- [guides/basics/request](https://docs.adonisjs.com/guides/basics/request)
- [guides/basics/response](https://docs.adonisjs.com/guides/basics/response)
- [guides/basics/routing](https://docs.adonisjs.com/guides/basics/routing)
- [guides/basics/session](https://docs.adonisjs.com/guides/basics/session)
- [guides/basics/static-file-server](https://docs.adonisjs.com/guides/basics/static-file-server)
- [guides/basics/url-builder](https://docs.adonisjs.com/guides/basics/url-builder)
- [guides/basics/validation](https://docs.adonisjs.com/guides/basics/validation)

## Condensed excerpts (prefer live docs if conflict)

### guides/basics/body-parser
Source: https://docs.adonisjs.com/guides/basics/body-parser

This guide covers the body parser configuration in AdonisJS. You will learn how to:

*   Configure parsers for different content types (JSON, form data, multipart)
*   Set global parsing options like empty string conversion and whitespace trimming
*   Adjust file upload limits and request size restrictions
*   Control automatic file processing for specific routes
*   Handle custom content types using the raw parser

## Overview

The body parser is responsible for parsing incoming request bodies before they reach your route handlers. It automatically detects the content type of each request and applies the appropriate parser to convert the raw request data into a usable format.

AdonisJS includes three built-in parsers: the **JSON parser** handles JSON-encoded data, the **form parser** handles URL-encoded form submissions, and the **multipart parser** handles file uploads and multipart form data. Each parser can be configured independently through the `config/bodyparser.ts` file.

You don't interact with the body parser directly in your application code. Instead, you access the parsed data through the Request class using methods like `request.all()`, `request.body()`, or `request.file()`. The body parser runs as middleware and processes request bodies automatically before your route handlers execute.

See also: [Request class documentation](https://docs.adonisjs.com/guides/basics/request) for accessing parsed request data.

## Configuration

The body parser is configured in the `config/bodyparser.ts` file. The configuration file is created automatically when you create a new AdonisJS application.

```
import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  form: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: ['application/x-www-form-urlencoded'],
  },

  json: {
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  multipart: {
    autoProcess: true,
    convertEmptyStringsToNull: true,
    trimWhitespaces: true,
    processManually: [],
    limit: '20mb',
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
```

```
allowedMethods
```

The `allowedMethods` array defines which HTTP methods should have their request bodies parsed. By default, only `POST`, `PUT`, `PATCH`, and `DELETE` requests are processed. GET requests are excluded because they typically don't include request bodies.

## Global parsing options

Two global options are available across all parsers: `convertEmptyStringsToNull` and `trimWhitespaces`. These options help normalize incoming data before it reaches your application logic.

```
convertEmptyStringsToNull
```

The `convertEmptyStringsToNull` option converts all empty strings in the request body to `null` values. This option solves a common problem with HTML forms.

When an HTML form input field has no value, browsers send an empty string in the request body rather than omitting the field entirely. This behavior creates challenges for database normalization, especially with nullable columns.

Consider a user registration form with an optional "country" field. Your database has a nullable `country` column, and you want to store `null` when the user doesn't select a country. However, the HTML form sends an empty string, which means you would insert an empty string into the database instead of leaving the column as `null`.

Enabling `convertEmptyStringsToNull` handles this inconsistency automatically. The body parser converts all empty strings to `null` before your validation or database logic runs.

```
json: {
  convertEmptyStringsToNull: true,
}
```

```
trimWhitespaces
```

The `trimWhitespaces` option removes leading and trailing whitespace from all string values in the request body. This helps eliminate accidental whitespace that users might include when submitting forms.

Instead of manually trimming values in your controllers or validators, you can enable this option and let the body parser handle whitespace removal globally.

```
form: {
  trimWhitespaces: true,
}
```

## JSON parser

The JSON parser handles requests with JSON-encoded bodies. It processes several content types by default, including `application/json`, `application/json-patch+json`, `application/vnd.api+json`, and `application/csp-report`.

```
encoding
```

The `encoding` option specifies the character encoding to use when converting the request body Buffer to a string. The default is `utf-8`, which handles most use cases. You can use any encoding supported by the [iconv-lite](https://www.npmjs.com/package/iconv-lite) package.

```
json: {
  encoding: 'utf-8',
}
```

```
limit
```

The `limit` option sets the maximum size of request body data the parser will accept. Requests that exceed this limit will receive a `413 Payload Too Large` error response.

```
json: {
  limit: '1mb',
}
```

```
strict
```

The `strict` option controls whether the parser accepts only objects and arrays as top-level JSON values. When enabled, the parser rejects primitive values like strings, numbers, or booleans at the root level.

```
json: {
  strict: true,
}
```

```
types
```

The `types` array defines which content types the JSON parser should handle. You can add custom content types if your application receives JSON data with non-standard content type headers.

```
json: {
  types: [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report',
    'application/custom+json',
  ]
}
```

## Form parser

The form parser handles URL-encoded form data, typically from HTML forms with `application/x-www-form-urlencoded` content type.

```
encoding
```

The `encoding` option specifies the character encoding to use when converting the request body Buffer to a string. The default is `utf-8`, which handles most use cases. You can use any encoding supported by the [iconv-lite](https://www.npmjs.com/package/iconv-lite) package.

```
form: {
  encoding: 'utf-8',
}
```

```
limit
```

The `limit` option sets the maximum size of request body data the parser will accept. Requests that exceed this limit will receive a `413 Payload Too Large` error response.

```
form: {
  limit: '1mb',
}
```

```
queryString
```

The `queryString` option allows you to configure how the URL-encoded string is parsed into an object. These options are passed directly to the [qs](https://www.npmjs.com/package/qs) package, which handles the parsing.

```
form: {
  queryString: {
    depth: 5,
    parameterLimit: 1000,
  },
}
```

See also: [qs documentation](https://www.npmjs.com/package/qs) for all available options.

```
types
```

The `types` array defines which content types the form parser should handle. By default, it processes `application/x-www-form-url

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/controllers
Source: https://docs.adonisjs.com/guides/basics/controllers

This guide covers controllers in AdonisJS applications. You will learn how to:

*   Create and organize controllers to handle HTTP requests
*   Use the barrel file system for importing controllers
*   Understand the controller lifecycle and request handling
*   Inject dependencies into controllers using the IoC container
*   Build RESTful resource-driven controllers following conventions
*   Configure controller locations and barrel file generation

Note

**Prerequisite**: You should be familiar with [routing](https://docs.adonisjs.com/guides/basics/routing) before learning about controllers, as controllers are connected to your application through routes.

## Overview

Controllers organize route handlers into dedicated JavaScript classes, solving the problem of route file bloat. Instead of defining all your route logic inline, controllers let you group related request handlers into a single class, where each method (called an action) handles a specific route.

A typical controller represents a resource (like Users, Posts, or Comments) and defines actions for creating, reading, updating, and deleting that resource. Controllers keep your routes file clean and readable, enable dependency injection for services and other dependencies, and follow RESTful conventions for resource-based CRUD operations.

Without controllers, your routes file becomes cluttered with inline handlers.

```
import router from '@adonisjs/core/services/router'

router.get('/posts', async () => {
  // Logic to fetch all posts
  return { posts: [] }
})

router.get('/posts/:id', async ({ params }) => {
  // Logic to fetch a single post
  return { post: {} }
})

router.post('/posts', async ({ request }) => {
  // Logic to create a post
  return { post: {} }
})

// This file becomes unmanageable as routes grow
```

With controllers, you organize handlers into reusable classes.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// Clean, organized route definitions
router.get('/posts', [controllers.Posts, 'index'])
router.get('/posts/:id', [controllers.Posts, 'show'])
router.post('/posts', [controllers.Posts, 'store'])
```

```
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ serialize }: HttpContext) {
    // Logic to fetch all posts
    return serialize({ posts: [] })
  }

  async show({ params, serialize }: HttpContext) {
    // Logic to fetch a single post
    return serialize({ post: {} })
  }

  async store({ request, serialize }: HttpContext) {
    // Logic to create a post
    return serialize({ post: {} })
  }
}
```

## Creating your first controller

1.   #### Generate the controller

Controllers are stored in the `app/controllers` directory. The easiest way to create a controller is using the `make:controller` command.

`node ace make:controller posts` ```
# Output
DONE:    create app/controllers/posts_controller.ts
``` 
This command creates a controller scaffolded with a plain JavaScript class and a default export.

```
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
}
``` 
2.   #### Add your first action

A controller action is simply a method that handles an HTTP request. Let's add an `index` method to list all posts.

```
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  /**
   * Handle GET requests to list all posts
   */
  async index({ response }: HttpContext) {
    const posts = [
      { id: 1, title: 'Getting started with AdonisJS' },
      { id: 2, title: 'Understanding controllers' },
    ]
    
    return response.json({ posts })
  }
}
``` 
A few important things to know about controller actions:

    *   The first parameter is always the **HTTPContext** object
    *   You can destructure specific properties like `request`, `response`, `params`, `session`, or `auth`
    *   Controller methods can return values directly (objects, arrays) or explicitly call `response.json()` or `response.send()`

3.   #### Connect the controller to a route

Now bind your controller action to a route.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])
``` 
The first argument (`controllers.Posts`) references your `PostsController` class, while the second argument (`'index'`) specifies which method to call. The controller is lazy-loaded, meaning it's only imported when the route is accessed.

4.   #### Test it out

Start your development server if it's not already running.

`node ace serve --hmr` 
Visit [`http://localhost:3333/posts`](http://localhost:3333/posts) in your browser. You should see the JSON response from your controller.

```
{
  "posts": [
    { "id": 1, "title": "Getting started with AdonisJS" },
    { "id": 2, "title": "Understanding controllers" }
  ]
}
``` 

## The barrel file

The `#generated/controllers` import you used in the routing step is powered by a **barrel file** - a single file that consolidates all your controller imports into one convenient location. **This barrel file is automatically generated and maintained by AdonisJS**.

The barrel file is located at `.adonisjs/server/controllers.ts` and is automatically created when you start your development server. It stays up-to-date as you add or remove controllers.

Without the barrel file, you would need to manually import each controller individually in your routes file.

```
import router from '@adonisjs/core/services/router'

const PostsController = () => import('#controllers/posts_controller')
const UsersController = () => import('#controllers/users_controller')
const CommentsController = () => import('#controllers/comments_controller')
// ...dozens more imports as your app grows

router.get('/posts', [PostsController, 'index'])
router.get('/users', [UsersController, 'index'])
router.get('/comments', [CommentsController, 'index'])
```

The barrel file eliminates this repetition.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])
router.get('/users', [controllers.Users, 'index'])
router.get('/comments', [controllers.Comments, 'index'])
```

See also: [Barrel files generation guide](https://docs.adonisjs.com/guides/concepts/barrel-files) for detailed configuration options.

## Understanding controller lifecycle

Controllers in AdonisJS are **instantiated per request**. Every time an HTTP request matches a route bound to a controller, AdonisJS creates a fresh instance of that controller class using the IoC container.

This means:

*   Each request gets its own isolated controller instance
*   No risk of state leakage between requests
*   You can safely use instance properties if needed
*   The controller instance is garbage collected after the request completes

```
import type { HttpContext } f

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/debugging
Source: https://docs.adonisjs.com/guides/basics/debugging

This guide covers debugging techniques for AdonisJS applications. You will learn how to:

*   Configure VSCode to debug your application with breakpoints
*   Use the Node.js inspector from the command line
*   View framework-level debug logs with `NODE_DEBUG`
*   Inspect variables in Edge templates with `@dump` and `@dd`
*   Enable pretty error pages during development

## Overview

Debugging is an essential part of development, and AdonisJS supports multiple approaches depending on your needs. For quick checks, a simple `console.log` statement often suffices. For more complex issues, you can use VSCode's integrated debugger to set breakpoints, step through code, and inspect variables. When you need to understand what's happening inside the framework itself, debug logs provide visibility into AdonisJS internals.

Edge templates have their own debugging tools with `@dump` and `@dd`, which render variable contents directly in the browser. During development, the exception handler automatically displays detailed error pages with stack traces and request information when something goes wrong.

## VSCode debugger

The VSCode debugger provides the most powerful debugging experience, allowing you to set breakpoints, step through code line by line, and inspect the call stack and variables. Use this approach when debugging complex issues that can't be resolved with simple log statements.

Create a `.vscode/launch.json` file in your project root with configurations for the dev server, test runner, and attach mode.

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Dev server",
      "program": "${workspaceFolder}/ace.js",
      "args": ["serve", "--hmr"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Tests",
      "program": "${workspaceFolder}/ace.js",
      "args": ["test", "--watch"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach Program",
      "port": 9229,
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

The **Dev server** configuration launches your application with HMR enabled, perfect for debugging HTTP request handling, middleware, and controllers. The **Tests** configuration runs your test suite in watch mode, allowing you to debug failing tests by setting breakpoints in your test files or application code.

### Debugging Ace commands

The [**Attach Program**](https://code.visualstudio.com/blogs/2018/07/12/introducing-logpoints-and-auto-attach#_autoattaching-to-node-processes) configuration uses attach mode instead of launching a specific command. This lets you debug any Ace command by starting it with the `--inspect` flag and then attaching the debugger.

To debug an Ace command:

1.   Open the Command Palette with `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2.   Search for **Debug: Select and Start Debugging**
3.   Select the **Attach Program** option
4.   Run your Ace command with the `--inspect` flag.

`node --inspect ace migration:run`

The debugger will attach to the running process, and your breakpoints will be hit.

## Node.js inspector

If you're not using VSCode or prefer a different debugging interface, you can use the Node.js inspector directly. Start your dev server with the `--inspect` flag.

`node ace --inspect serve --hmr`

This starts the Node.js inspector on port 9229. You can then connect using Chrome DevTools by navigating to `chrome://inspect` in Chrome, or use any other debugger that supports the Node.js inspector protocol.

## Framework debug logs

AdonisJS packages include debug logs that provide visibility into framework internals. These logs are disabled by default because they're verbose, but they're invaluable when you need to understand what's happening at the framework level.

Enable debug logs by setting the `NODE_DEBUG` environment variable when starting your application.

`NODE_DEBUG=adonisjs:* node ace serve --hmr`

The wildcard `*` enables logs from all AdonisJS packages. If you already know which package you're investigating, specify it directly to reduce noise.

```
# Debug only the HTTP layer
NODE_DEBUG=adonisjs:http node ace serve --hmr

# Debug session handling
NODE_DEBUG=adonisjs:session node ace serve --hmr

# Debug the application lifecycle
NODE_DEBUG=adonisjs:app node ace serve --hmr
```

Package names follow the convention `adonisjs:<package-name>`, where the package name corresponds to the AdonisJS package you want to debug.

## Edge template debugging

When working with Edge templates, you can inspect variables directly in the browser using `@dump` and `@dd`. These tags render a formatted representation of any value, making it easy to understand what data your templates are receiving.

### The @dump tag

The `@dump` tag outputs a formatted representation of a value and continues rendering the rest of the template:

```
{{-- Inspect component props --}}
@dump($props.all())

{{-- Inspect the entire template state --}}
@dump(state)

{{-- Inspect a specific variable --}}
@dump(post)
```

### The @dd tag

The `@dd` tag (dump and die) stops template rendering immediately and displays only the dumped value. Use this when you want to focus on a specific value without the rest of the page's output:

```
@dd(post)

{{-- Nothing below this line will render --}}
<h1>{{ post.title }}</h1>
```

### Setting up the dumper

The `@dump` and `@dd` tags require the dumper's frontend assets to be loaded. Add the `@stack('dumper')` directive to your layout's `<head>` section.

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @stack('dumper')
  </head>
  <body>
    @!section('content')
  </body>
</html>
```

Official AdonisJS starter kits include this setup by default.

### Configuring the dumper

You can customize how the dumper formats output by exporting a `dumper` configuration from `config/app.ts`.

```
import { defineConfig as dumperConfig } from '@adonisjs/core/dumper'

export const dumper = dumperConfig({
  /**
   * Settings for console output (e.g., console.log)
   */
  console: {
    depth: 10,
    collapse: ['DateTime', 'Date'],
    inspectStaticMembers: true,
  },

  /**
   * Settings for HTML output (@dump and @dd)
   */
  html: {
    depth: 10,
    inspectStaticMembers: true,
  },
})
```

The following options are available for both `console` and `html` printers.

```
showHidden
```

boolean  false

Include non-enumerable properties

```
depth
```

number  5

Maximum depth for nested structures (objects, arrays, maps, sets)

```
inspectObjectPrototype
```

boolean | string  unless-plain-object

Include prototype properties. Set to `true` for all objects, `false` for none, or `'unless-plain-object'` for class instances only.

```
inspectArrayP

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/exception-handling
Source: https://docs.adonisjs.com/guides/basics/exception-handling

This guide covers exception handling in AdonisJS applications. You will learn how to:

*   Use the global exception handler to convert errors into HTTP responses
*   Customize error handling for specific error types
*   Report errors to logging services
*   Create custom exception classes with self-contained handling logic
*   Configure debug mode and status pages for different environments

## Overview

Exception handling in AdonisJS provides a centralized system for managing errors during HTTP requests. Instead of wrapping every route handler and middleware in try/catch blocks, you let errors bubble up naturally to a global exception handler that converts them into appropriate HTTP responses.

This approach keeps your code clean while ensuring consistent error handling across your application.

### The global exception handler

When you create a new AdonisJS project, the global exception handler is created in `app/exceptions/handler.ts`. It extends the base `ExceptionHandler` class and provides two primary methods:

*   The `handle` converts errors into HTTP responses.
*   The `report` logs errors or sends them to monitoring services.

Here's what the default handler looks like:

```
import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * Controls verbose error display with stack traces.
   * Automatically disabled in production to protect sensitive info.
   */
  protected debug = !app.inProduction

  /**
   * Enables custom HTML error pages for specific status codes.
   * Typically enabled in production for better user experience.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Maps status codes or ranges to view templates.
   * Keys can be specific codes like '404' or ranges like '500..599'.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { view }) => {
      return view.render('pages/errors/not_found', { error })
    },
    '500..599': (error, { view }) => {
      return view.render('pages/errors/server_error', { error })
    },
  }

  /**
   * Converts errors into HTTP responses for the client.
   * Override to customize error response formatting.
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  /**
   * Logs errors or sends them to monitoring services.
   * Never attempt to send HTTP responses from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
```

The inline comments explain each property's purpose. We'll explore `debug`, `renderStatusPages`, and `statusPages` in detail later in this guide.

### How errors flow through the handler

When an error occurs during an HTTP request, AdonisJS automatically catches it and forwards it to the global exception handler. Let's see this in action.

```
import router from '@adonisjs/core/services/router'
import { Exception } from '@adonisjs/core/exceptions'

router.get('fatal', () => {
  /**
   * Throwing an exception with a 500 status code
   * and a custom error code for identification
   */
  throw new Exception('Something went wrong', { 
    status: 500, 
    code: 'E_RUNTIME_EXCEPTION' 
  })
})
```

In development mode (with `debug` enabled), visiting this route displays a beautifully formatted error page powered by Youch, showing the error message, full stack trace, and request context.

In production mode (with `debug` disabled), the same error returns a simple JSON or plain text response containing only the error message, without exposing your application's internal structure.

### Handling specific error types

The global exception handler's `handle` method receives all unhandled errors. You can inspect the error type and provide custom handling for specific exceptions while letting others fall through to the default behavior.

Here's an example of handling validation errors with a custom response format.

```
import { errors as vineJSErrors } from '@vinejs/vine'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction
  protected renderStatusPages = app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Check if the error is a VineJS validation error
     * using instanceof to safely identify the error type
     */
    if (error instanceof vineJSErrors.E_VALIDATION_ERROR) {
      /**
       * Return validation messages directly as JSON
       * with a 422 Unprocessable Entity status
       */
      ctx.response.status(422).send(error.messages)
      return
    }

    /**
     * For all other errors, delegate to the parent class
     * which handles the default error conversion logic
     */
    return super.handle(error, ctx)
  }
}
```

This pattern of checking error types using `instanceof` and providing custom handling is powerful and flexible. You can add as many conditional branches as needed for different error types in your application.

Here's how you might use this custom validation error handling in a route.

```
import router from '@adonisjs/core/services/router'
import { createPostValidator } from '#validators/post'

router.post('posts', async ({ request }) => {
  /**
   * If validation fails, VineJS throws E_VALIDATION_ERROR
   * which is caught by our custom handler and returns
   * the validation messages with a 422 status code
   */
  await request.validateUsing(createPostValidator)
})
```

### Debug mode and Youch

The `debug` property controls whether errors are displayed using Youch, an error visualization tool that creates beautiful, interactive error pages. When debug mode is enabled, Youch displays the error message, complete stack trace, request details, and even shows the exact code where the error occurred with syntax highlighting.

In production, debug mode should always be disabled to prevent exposing sensitive information. When disabled, errors are converted to simple responses using content negotiation (JSON for API requests, plain text for others) containing only the error message without implementation details.

The default configuration `protected debug = !app.inProduction` automatically handles this for you, enabling debug mode in development and disabling it in production.

### Status pages

Status pages allow you to display custom HTML pages for specific HTTP status codes. This feature is particularly useful for user-facing applications where you want to provide a branded, helpful error experience rather than a generic error message.

The `statusPages` property is a key-value map where keys are HTTP status codes or ranges, and values are callback functions that render and return HTML content. The callback receives the error object and 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/file-uploads
Source: https://docs.adonisjs.com/guides/basics/file-uploads

This guide covers file uploads in AdonisJS, from basic single file uploads to advanced direct uploads with cloud storage providers. You will learn how to:

*   Accept and validate file uploads in your application
*   Store files permanently using FlyDrive
*   Handle multiple file uploads and direct cloud uploads
*   Secure your file upload endpoints

## Overview

File uploads allow users to send files from their browsers to your AdonisJS application. Unlike many Node.js frameworks that require additional packages for this functionality, AdonisJS has built-in support for parsing multipart requests and processing file uploads through its bodyparser.

When a file is uploaded, AdonisJS automatically saves it to the server's `tmp` directory. From there, you can validate the file in your controllers and then move it to permanent storage.

For permanent storage, AdonisJS integrates with [FlyDrive](https://flydrive.dev/docs/introduction) , which provides a unified API for working with local file systems as well as cloud storage solutions like Amazon S3, Cloudflare R2, and Google Cloud Storage.

## Uploading your first file

We'll build a feature that allows users to update their profile avatar. This is a common requirement and demonstrates all the essential concepts.

1.   #### Create the upload form

First, create a form that accepts file uploads. The critical part is setting the form encoding to `multipart/form-data`. Without this, the browser won't send files correctly.

```
@form({ route: 'profile_avatar.update', enctype: 'multipart/form-data' })
  @field.root({ name: 'avatar' })
    @!input.control({ type: 'file' })
    @!field.label({ text: 'Upload new avatar' })
    @!field.error()
  @end

  @!button({ type: 'Submit', text: 'Update Avatar' })
@end
``` ```
import { Form } from '@adonisjs/inertia/react'

export default function Profile() {
  return (
    <Form route="profile_avatar.update" encType="multipart/form-data">
      {({ errors }) => (
        <>
          <div>
            <label htmlFor="avatar">Upload new avatar</label>
            <input type="file" name="avatar" id="avatar" />
            {errors.avatar && <div>{errors.avatar}</div>}
          </div>
          <button type="submit">Update Avatar</button>
        </>
      )}
    </Form>
  )
}
``` 
2.   #### Register the route

Next, register a route to handle the file upload.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.put('/profile/avatar', [controllers.profileAvatar, 'update'])
``` 
3.   #### Create the controller

Now create a controller that accepts the uploaded file. The `request.file()` method gives you access to the uploaded file by its field name.

```
import { HttpContext } from '@adonisjs/core/http'

export default class ProfileAvatarController {
  async update({ request, response }: HttpContext) {
    const avatar = request.file('avatar')
    
    if (!avatar) {
      return response.badRequest('Please upload an avatar image')
    }
    
    console.log(avatar)
    
    return 'Avatar uploaded successfully'
  }
}
``` 
At this point, your application can receive file uploads. The file is already saved in the tmp directory when you access it. The file object contains useful properties:

    *   `tmpPath` - Where the file is currently stored on your server
    *   `clientName` - The original filename from the user's computer
    *   `size` - File size in bytes
    *   `extname` - File extension (e.g., 'jpg', 'png')
    *   `type` - MIME type (e.g., 'image/jpeg')

## Validating uploaded files

Accepting any file without validation is dangerous. Users might upload files that are too large, have incorrect formats, or could even be malicious. AdonisJS provides two approaches for validation.

### Inline validation

You can validate files directly in the `request.file()` call by passing validation options as the second argument.

```
import { HttpContext } from '@adonisjs/core/http'

export default class ProfileAvatarController {
  async update({ request, response }: HttpContext) {
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg']
    })

    if (!avatar) {
      return response.badRequest('Please upload an avatar image')
    }
    
    if (avatar.hasErrors) {
      return response.badRequest(avatar.errors)
    }
    
    return 'Avatar uploaded and validated successfully'
  }
}
```

The validation happens as soon as you call `request.file()`. If the file is too large or has an invalid extension, the `avatar.hasErrors` property will be `true` and the `avatar.errors` array will contain error messages.

### VineJS validation

While inline validation works, using VineJS validators is the recommended approach because it provides better error messages, consistent validation patterns, and easier testing.

First, create a validator file.

```
import vine from '@vinejs/vine'

export const updateAvatarValidator = vine.create({
  avatar: vine.file({
    size: '2mb',
    extnames: ['jpg', 'png', 'jpeg']
  })
})
```

Then use the validator in your controller.

```
import { HttpContext } from '@adonisjs/core/http'
import { updateAvatarValidator } from '#validators/user'

export default class ProfileAvatarController {
  async update({ request }: HttpContext) {
    const payload = await request.validateUsing(updateAvatarValidator)    

    console.log(payload.avatar)    
    return 'Avatar uploaded and validated successfully'
  }
}
```

If validation fails, AdonisJS automatically returns a 422 response with detailed error messages. If validation succeeds, you get the validated data in the payload object. The avatar has passed size and extension checks at this point.

Security feature

A key security feature of AdonisJS is that it uses [magic number detection](https://en.wikipedia.org/wiki/Magic_number_(programming)) to validate file types. This means even if someone renames a `.exe` file to `.jpg`, AdonisJS will detect the actual file type and reject it. This protects your application from users trying to bypass validation by simply changing file extensions.

### Combining files with other fields

When your form includes both file uploads and regular fields, the validated payload contains both. Destructure the file field separately before passing the remaining data to your model — passing a multipart file object directly to `Model.create()` will cause an error:

```
import vine from '@vinejs/vine'

export const createTaskValidator = vine.create({
  title: vine.string(),
  description: vine.string().optional(),
  attachment: vine.file({ size: '5mb', extnames: ['pdf', 'jpg', 'png'] }).optional(),
})
```

```
import { HttpContext } from '@adonisjs/core/http'
import { createTaskValidator } from '#validators/task'

export default class TasksController {
  async store({ request }: HttpContext) {
    const { attachment, ...data } = await request.validateUsing(createTaskValidator)

    const task = await

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/http-context
Source: https://docs.adonisjs.com/guides/basics/http-context

This guide covers the HTTP context object in AdonisJS. You will learn:

*   What the HTTP context is and why it exists
*   How to access it in route handlers and middleware
*   What properties the HTTP context exposes and when each is available
*   How to inject it into services using dependency injection
*   How to add custom properties to the context
*   How to access it via async local storage

## Overview

The **HTTP context** is a request-scoped object that holds everything you need to handle an HTTP request. It contains properties like `request`, `response`, `auth`, `logger`, `session`, and more. AdonisJS creates a fresh HTTP context instance for every incoming request and passes it to your route handlers and middleware.

Instead of using global variables or importing request/response objects from different modules, the HTTP context provides a clean, type-safe way to access all request-specific data and services in one place. Every property on the context is specifically tied to the current request, ensuring complete isolation between concurrent requests.

## Accessing HTTP context

### In route handlers

The most common way to access the HTTP context is by receiving it as a parameter in your route handlers. You typically destructure only the properties you need rather than working with the full context object.

```
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', async ({ params, request, response }) => {
  const id = params.id
  const include = request.qs().include

  return response.json({ id, include })
})
```

When using controllers, the pattern is identical. The controller method receives the HTTP context as its first parameter:

```
import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class PostsController {
  async show({ params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    return response.json(post)
  }
}
```

### In middleware

Middleware functions also receive the HTTP context as their first parameter. The second parameter is the `next` function that passes control to the next middleware in the chain. The logger used below is already request-scoped, so every log line is automatically tagged with the current request id.

```
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class LogRequestMiddleware {
  async handle({ request, logger }: HttpContext, next: NextFn) {
    logger.info(`${request.method()} ${request.url()}`)
    await next()
  }
}
```

## Available properties

The HTTP context bundles together everything you need to handle a request: the incoming data, the response you are building, logging, authentication, and more. The properties on it come from three sources: the core framework, optional packages you install, and middleware or providers that live inside your project.

### Always available

These properties are attached to every HTTP context instance by the framework itself.

```
request
```

HttpRequest

The [`HttpRequest`](https://github.com/adonisjs/http-server/blob/-/src/request.ts) instance exposes the incoming request data: the query string, the request body, headers, cookies, uploaded files, the client IP, the hostname, and the HTTP method. Use it whenever you need to read something the client sent.

```
const page = ctx.request.input('page', 1)
const agent = ctx.request.header('user-agent')
```

```
response
```

HttpResponse

The [`HttpResponse`](https://github.com/adonisjs/http-server/blob/-/src/response.ts) instance is used to build and send the response. It provides methods to set the status code, headers, and cookies, to send JSON, HTML, files, or rendered views, to redirect the client, to stream content, and to abort the request early.

`return ctx.response.status(201).json({ id: post.id })`

```
params
```

Record<string, any>

A plain object holding the route parameters parsed from the URL. For a route defined as `/posts/:id/comments/:commentId`, a request to `/posts/1/comments/42` makes `params` equal to `{ id: '1', commentId: '42' }`. Parameter values are always strings. Cast them inside your handler if you need another type.

```
route
```

Route | undefined

A reference to the [route](https://github.com/adonisjs/http-server/blob/-/src/types/route.ts#L149) definition that matched the current request, including the pattern, the HTTP methods, the registered middleware stack, and the handler. This is `undefined` for requests that did not match any route, which typically only happens inside the exception handler.

```
logger
```

Logger

A request-scoped [`Logger`](https://github.com/adonisjs/logger/blob/-/src/logger.ts) instance. Log lines written through `ctx.logger` are automatically tagged with a unique request id, which makes it straightforward to trace all output belonging to a single request across your application.

`ctx.logger.info({ postId: id }, 'Loading post')`

### Available with optional packages

These properties are contributed by optional packages. They only exist on the context when the corresponding package is installed and its middleware (where applicable) is registered.

```
session
```

Session

A [`Session`](https://github.com/adonisjs/session/blob/-/src/session.ts) instance for reading and writing session data, including flash messages, for the current request. Available when `@adonisjs/session` is installed and the session middleware is registered.

```
auth
```

Authenticator

An [`Authenticator`](https://github.com/adonisjs/auth/blob/-/src/authenticator.ts) instance used to authenticate the request and access the currently logged-in user. Available when `@adonisjs/auth` is installed and the auth middleware is registered.

```
view
```

EdgeRenderer

An [Edge](https://github.com/edge-js/edge/blob/-/src/edge/renderer.ts) renderer scoped to the current request, used to render server-side templates. Available when `edge.js` is installed and registered via the view provider.

```
inertia
```

Inertia

An [`Inertia`](https://github.com/adonisjs/inertia/blob/-/src/inertia.ts) instance used to render React or Vue pages through Inertia.js. Available when `@adonisjs/inertia` is installed and the Inertia middleware is registered.

```
bouncer
```

Bouncer

A [`Bouncer`](https://github.com/adonisjs/bouncer/blob/-/src/bouncer.ts) instance used to authorize actions against the authenticated user through Bouncer abilities and policies. Available when `@adonisjs/bouncer` is installed.

```
i18n
```

I18n

An [`I18n`](https://github.com/adonisjs/i18n/blob/-/src/i18n.ts) instance scoped to the request's detected language, used to translate messages and format dates, numbers, and currencies. Available when `@adonisjs/i18n` is installed and the i18n middleware is registered.

### Added by project scaffolding

These properties are attached by middleware or providers that live inside your project rather than being provided by the framework or a

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/middleware
Source: https://docs.adonisjs.com/guides/basics/middleware

This guide covers middleware in AdonisJS applications. You will learn how to:

*   Work with the three middleware stacks (server, router, and named)
*   Create custom middleware to handle cross-cutting concerns
*   Register middleware in the appropriate stack
*   Pass parameters to named middleware for route-specific logic
*   Use dependency injection in middleware constructors
*   Modify requests and responses during the middleware pipeline
*   Handle exceptions within middleware
*   Augment the HttpContext with custom properties

## Overview

Middleware are functions that execute during an HTTP request before the request reaches your route handler. Each middleware in the chain can either terminate the request by sending a response or forward it to the next middleware using the `next` method.

The middleware layer allows you to encapsulate logic that must run during a request into dedicated, reusable functions or classes. Instead of cluttering your controllers with repetitive logic for parsing request bodies, authenticating users, or logging requests, you can offload these responsibilities to dedicated middleware.

Every HTTP request your application handles flows through the middleware pipeline, making it essential to understand how middleware work and how to organize them effectively.

## Middleware stacks

AdonisJS divides middleware into three categories, known as stacks. Each stack serves a different purpose and executes at different points in the request lifecycle.

**Server middleware stack**

*   Executes for **every** HTTP request, even when no route matches
*   Runs **before** the router attempts to find a matching route
*   Use for: logging, CORS, security headers, logging

**Router middleware stack**

*   Executes **only** when a matching route is found
*   Runs **after** route matching but **before** named middleware and handlers
*   Use for: loading shared data, parsing request bodies

**Named middleware collection**

*   Applied **explicitly** to individual routes or route groups
*   Can accept parameters for per-route customization
*   Use for: role-based authorization, route-specific rate limiting, feature flags

## Creating and using middleware

Let's walk through creating a complete logging middleware that tracks request duration. We'll generate the middleware file, implement the logging logic, and register it to run on all requests.

1.   #### Generating the middleware

Create a new middleware using the `make:middleware` command. This command generates a scaffolded middleware class in the `app/middleware` directory.

`node ace make:middleware LogRequests` `# CREATE: app/middleware/log_requests_middleware.ts` 
The generated middleware contains a basic class structure with a `handle` method where we'll add our logging logic:

```
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class LogRequestsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Logic to run before the request handler
     */
    await next()
    /**
     * Logic to run after the request handler
     */
  }
}
``` 
2.   #### Implementing the logging logic

Now let's implement the actual logging functionality. We'll track how long each request takes by capturing the start time before calling `next()`, then calculating the duration after the response is ready.

```
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import string from '@adonisjs/core/helpers/string'

export default class LogRequestsMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    /**
     * Capture the start time before calling next().
     * This happens in the downstream phase.
     */
    const startTime = process.hrtime()
    
    /**
     * Call next() to execute remaining middleware and route handler.
     * The await ensures we wait for the entire chain to complete.
     */
    await next()
    
    /**
     * After next() completes, we're in the upstream phase.
     * The response is ready, so we can log the completion details.
     */
    const endTime = process.hrtime(startTime)
    const responseStatus = response.getStatus()
    const uri = request.url()
    const method = request.method()
    
    logger.info(`${method} ${uri}: ${responseStatus} (${string.prettyHrTime(endTime)})`)
  }
}
``` 
3.   #### Registering the middleware

Finally, let's register our logging middleware in the server middleware stack so it runs for every request. We will register it as the first middleware, so that we can precisely time all the requests.

Server middleware are registered in the `start/kernel.ts` file using lazy imports, and they execute in the order they're registered.

```
import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.use([
  () => import('#middleware/log_requests_middleware'), 
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
])

router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])
``` 

## Named middleware with parameters

Named middleware provide flexibility by allowing you to apply them selectively to specific routes and pass parameters to customize their behavior. Let's build an authorization middleware that checks user permissions, register it with a name, and apply it to protected routes.

1.   #### Creating the authorization middleware

We'll create a middleware that checks if the authenticated user has the required role or permissions to access a route. Named middleware can accept a third parameter for options, making them configurable per-route.

```
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

type AuthorizationOptions = 
  | { permissions: string[] }
  | { role: string }

export default class AuthorizeRequestMiddleware {
  /**
   * The third parameter 'options' contains the authorization requirements
   * specified when applying this middleware to a route.
   */
  async handle({ auth, response }: HttpContext, next: NextFn, options: AuthorizationOptions) {
    /**
     * Get the authenticated user or throw an exception
     */
    const user = auth.getUserOrFail()
    
    /**
     * Check if the user has the required role
     */
    if ('role' in options && user.role !== options.role) {
      return response.unauthorized('Not authorized to access this route')
    }
    
    /**
     * Check if the user has all required permissions
     */
    if ('permissions' in options) {
      const hasPermission = options.permissions.every(permission => 
        user.permissions.includes(permission)
      )
      
      if (!hasPermission) {
        return response.unauthorized('Not authorized to access this route')
      }
    }
    
    /**
     * User is authorized, continue to the next middl

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/request
Source: https://docs.adonisjs.com/guides/basics/request

This guide covers working with HTTP requests in AdonisJS. You will learn about:

*   Reading request body and uploaded files
*   Accessing query strings and route parameters
*   Working with request headers and metadata
*   Reading cookies
*   Understanding request ID generation
*   Configuring trusted proxies and IP address extraction

## Overview

The Request class holds all the information related to an HTTP request, including the request body, uploaded files, query string, URL, method, headers, and cookies. You access it via the `request` property of HttpContext, which is available in route handlers, middleware, and exception handlers.

## Reading request body and files

The request body contains data sent by the client, typically from HTML forms or API requests. AdonisJS uses the [bodyparser](https://docs.adonisjs.com/guides/basics/body-parser) to automatically parse the request body based on the `Content-Type` header, converting JSON, form data, and multipart data into JavaScript objects you can easily work with.

### Accessing the entire request body

Use the `all` method to retrieve all data from the request body as an object. This is useful when you want to process all submitted fields together.

```
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  const body = request.all()
  console.log(body)
  // { fullName: 'John Doe', email: 'john@example.com', password: 'demo' }
})
```

Note

**Type safety and validation:** The request body data is not type-safe because the bodyparser only collects and parses the raw request data, it does not validate it. Use the [validation system](https://docs.adonisjs.com/guides/basics/validation) to ensure both runtime safety and TypeScript type safety for your request data.

### Accessing specific fields

Use the `input` method when you need to read a specific field from the request body. This method accepts a field name and an optional default value if the field doesn't exist.

```
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  const email = request.input('email')
  const newsletter = request.input('newsletter', false)
  
  console.log(email)
  console.log(newsletter)
})
```

You can also use the `only` method to retrieve multiple specific fields, or the `except` method to retrieve all fields except certain ones.

```
import router from '@adonisjs/core/services/router'

router.post('/signup', ({ request }) => {
  /**
   * Get only fullName and email, ignoring other fields
   */
  const credentials = request.only(['fullName', 'email'])
  console.log(credentials)
  
  /**
   * Get all fields except password
   */
  const safeData = request.except(['password'])
  console.log(safeData)
})
```

### Accessing uploaded files

Files uploaded through multipart form data are available using the `file` method. The method returns a file object with metadata and methods for validation and storage.

See also: [File uploads guide](https://docs.adonisjs.com/guides/basics/file-uploads) for detailed file handling and storage

```
import router from '@adonisjs/core/services/router'

router.post('/avatar', ({ request }) => {
  const avatar = request.file('avatar')
  console.log(avatar)
})
```

You can validate files at the time of accessing them by providing validation options.

```
import router from '@adonisjs/core/services/router'

router.post('/avatar', ({ request }) => {
  const avatar = request.file('avatar', {
    size: '2mb',
    extnames: ['jpg', 'png', 'jpeg']
  })
  
  console.log(avatar)
})
```

Tip

**File validation approaches:** You can validate files either when accessing them with `request.file()` or using the validator. The validator approach is recommended as it provides consistent validation alongside other request data and better error handling.

### Available methods

| Method | Description |
| --- | --- |
| `all()` | Returns all request body data as an object |
| `body()` | Alias for `all()` method |
| `input(key, defaultValue?)` | Returns a specific field value with optional default |
| `only(keys)` | Returns only the specified fields |
| `except(keys)` | Returns all fields except the specified ones |
| `file(key, options?)` | Returns an uploaded file with optional validation |

## Reading request query string and route params

Query strings and route parameters are two different ways to pass data through URLs. The query string is the portion after the `?` in a URL (like `?page=1&limit=10`), while route parameters are dynamic segments defined in your route pattern (like `/posts/:id`).

### Accessing query string parameters

Use the `qs` method to retrieve all query string parameters as an object.

```
import router from '@adonisjs/core/services/router'

router.get('/posts', ({ request }) => {
  const queryString = request.qs()
  console.log(queryString)
  // { page: '1', limit: '10', orderBy: 'created_at' }
})
```

You can access individual query parameters using the `input` method, which works for both body data and query string parameters.

```
import router from '@adonisjs/core/services/router'

router.get('/posts', ({ request }) => {
  const page = request.input('page', 1)
  const limit = request.input('limit', 20)
  const orderBy = request.input('orderBy', 'id')
  
  console.log({ page, limit, orderBy })
})
```

### Accessing route parameters

Route parameters are available through the `param` method or by accessing the `params` object directly. The params object is also available directly on HttpContext.

```
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', ({ request }) => {
  const id = request.param('id')
  console.log(id)
})
```

### Available methods

| Method | Description |
| --- | --- |
| `qs()` | Returns all query string parameters as an object |
| `param(key, defaultValue?)` | Returns a specific route parameter with optional default |
| `params()` | Returns all route parameters as an object |

## Reading request headers, method, URL, and IP address

Request metadata includes information about how the request was made, where it came from, and what the client expects in response. This includes HTTP headers, the request method (GET, POST, etc.), the requested URL, and the client's IP address.

Use the `header` method to read a specific header value. Header names are case-insensitive.

```
import router from '@adonisjs/core/services/router'

router.get('/profile', ({ request }) => {
  const authToken = request.header('Authorization')
  const userAgent = request.header('User-Agent')
  
  console.log(authToken)
  console.log(userAgent)
})
```

You can retrieve all headers using the `headers` method.

```
import router from '@adonisjs/core/services/router'

router.get('/debug', ({ request }) => {
  const allHeaders = request.headers()
  console.log(allHeaders)
})
```

### Accessing the request method

The request method (GET, POST, PUT, DELETE, etc.) is available through the `method` method.

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/response
Source: https://docs.adonisjs.com/guides/basics/response

This guide covers the AdonisJS Response class and the methods available to construct HTTP responses. You will learn about:

*   Sending response bodies in different formats
*   Working with headers and cookies
*   Handling redirects and file downloads
*   Understanding how the response serialization works
*   Extending the Response class with custom methods

## Overview

The Response class provides helpers for constructing HTTP responses in AdonisJS applications. Instead of working directly with Node.js's raw response object, the Response class offers a fluent, expressive API for common tasks like sending JSON, setting headers, handling redirects, and streaming file downloads.

The Response class is available via the `ctx.response` property. You can access it in route handlers, middleware, and exception handlers throughout your application. For many simple responses, you can return values directly from route handlers, and AdonisJS will automatically use the Response class to send them.

## Sending response body

The Response class provides multiple ways to send response bodies. You can either return values directly from route handlers or use explicit response methods.

### Returning values from route handlers

The simplest approach is to return values directly from your route handler. AdonisJS will automatically serialize the value and set appropriate content headers.

```
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  /**
   * Returns plain text with content-type: text/plain
   */
  return 'This is the homepage.'
})

router.get('/welcome', async () => {
  /**
   * Returns HTML fragment with content-type: text/html
   */
  return '<p>This is the homepage</p>'
})

router.get('/api/page', async () => {
  /**
   * Returns JSON with content-type: application/json
   */
  return { page: 'home' }
})

router.get('/timestamp', async () => {
  /**
   * Date instances are converted to ISO strings
   */
  return new Date()
})
```

### Using response.send()

You can also explicitly use the `response.send()` method, which provides the same automatic content-type detection.

```
import router from '@adonisjs/core/services/router'

router.get('/', async ({ response }) => {
  /**
   * send() method works identically to returning values.
   * Useful when you need to set headers or status before sending.
   */
  response.send('This is the homepage')
})

router.get('/data', async ({ response }) => {
  /**
   * Objects and arrays are automatically stringified
   */
  response.send({ page: 'home' })
})
```

### Forcing JSON responses

When you need to ensure the response is sent as JSON (even if it might be detected as HTML), use the `response.json()` method.

See also: [Response body serialization](https://docs.adonisjs.com/guides/basics/response#response-body-serialization)

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ response }: HttpContext) {
    const posts = await Post.all()
    
    /**
     * Explicitly sets content-type to application/json
     * and serializes the posts array
     */
    response.json(posts)
  }
}
```

The Response class provides methods for setting, appending, and removing HTTP headers. Headers must be set before the response body is sent.

Use the `response.header()` method to set a response header. If the header already exists, it will be overridden.

```
import type { HttpContext } from '@adonisjs/core/http'

export default class ApiController {
  async index({ response }: HttpContext) {
    /**
     * Set custom header for API versioning
     */
    response.header('X-API-Version', 'v1')
    
    /**
     * Set cache control headers
     */
    response.header('Cache-Control', 'public, max-age=3600')
    
    return { status: 'ok' }
  }
}
```

The `response.safeHeader()` method sets a header only if it doesn't already exist. This is useful when you want to provide a default value without overriding existing headers.

```
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CorsMiddleware {
  async handle({ response }: HttpContext, next: NextFn) {
    /**
     * Set CORS header only if not already set by another middleware
     */
    response.safeHeader('Access-Control-Allow-Origin', '*')
    
    await next()
  }
}
```

Some headers can have multiple values. Use `response.append()` to add additional values without removing existing ones.

```
import type { HttpContext } from '@adonisjs/core/http'

export default class DownloadsController {
  async show({ response }: HttpContext) {
    /**
     * Append multiple Set-Cookie headers for different cookies
     */
    response.append('Set-Cookie', 'session=abc123; HttpOnly')
    response.append('Set-Cookie', 'preferences=dark-mode; Path=/')
    
    return { download: 'ready' }
  }
}
```

Remove a previously set header using `response.removeHeader()`.

```
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityMiddleware {
  async handle({ response }: HttpContext, next: NextFn) {
    await next()
    
    /**
     * Remove server header to hide server implementation details
     */
    response.removeHeader('X-Powered-By')
  }
}
```

## Handling redirects

The `response.redirect()` method returns an instance of the `Redirect` class, which provides a fluent API for creating redirect responses with different destinations and options.

### Redirecting to a path

Use `response.redirect().toPath()` to redirect to a specific URI or external URL.

```
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async logout({ response, auth }: HttpContext) {
    await auth.logout()
    
    /**
     * Redirect to the home page after logout
     */
    response.redirect().toPath('/')
  }
  
  async external({ response }: HttpContext) {
    /**
     * Redirect to an external website
     */
    response.redirect().toPath('https://adonisjs.com')
  }
}
```

### Redirecting to a named route

The `response.redirect().toRoute()` method accepts a route identifier and its parameters, making redirects maintainable when URLs change.

```
import Post from '#models/post'
import { createPostValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async store({ request, response }: HttpContext) {
    /**
     * Validate the incoming request data
     */
    const payload = await request.validateUsing(createPostValidator)
    
    /**
     * Create the post
     */
    const post = await Post.create(payload)
    
    /**
     * Redirect to the show page for the newly created post
     */
    response.redirect().toRoute('posts.show', [post.id])
  }
}
```

### Redirecting back

Use `response.redirect().back()` to redirect to 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/routing
Source: https://docs.adonisjs.com/guides/basics/routing

This guide covers routing in AdonisJS applications. You will learn how to:

*   Define routes for different HTTP methods
*   Handle dynamic route parameters with validation
*   Organize routes into groups with shared configuration
*   Generate RESTful resource routes
*   Apply middleware to routes
*   Register domain-specific routes
*   Build type-safe URLs using the URL builder
*   Extend the router with custom functionality

## Overview

Routing connects incoming HTTP requests to specific handlers in your application. When a user visits URLs like `/`, `/about`, or `/posts/1`, the router examines the HTTP method and URL pattern, then executes the appropriate handler function. This is the foundation of how your application responds to web requests.

A route consists of three main components:

*   **HTTP method** – The type of request (GET, POST, PUT, DELETE, etc.)
*   **URI pattern** – The URL path that should match, which can include dynamic segments
*   **Handler** – The function or [controller](https://docs.adonisjs.com/guides/basics/controllers) method that processes the request and returns a response

Routes can also include [middleware](https://docs.adonisjs.com/guides/basics/middleware) for authentication, rate-limiting, or any logic that should run before the handler executes. Every HTTP request your application handles flows through the routing system, making it essential to understand how routes work and how to organize them effectively.

## Basic example

In AdonisJS, routes are defined inside the `start/routes.ts` file using the router service.

A route handler is the function that runs when a route matches. It receives the HTTP context and can return a string, an object, or call services to produce a response.

The following example shows static routes and a dynamic route using `:id`, which matches any value passed in that segment.

```
import router from '@adonisjs/core/services/router'

router.get('/', () => 'Hello world from the home page.')

router.get('/about', () => 'This is the about page.')

router.get('/posts/:id', ({ params }) => {
  return `This is post with id ${params.id}`
})

router.post('/users', async ({ request }) => {
  const data = request.all()
  await createUser(data)
  return 'User created successfully'
})
```

### Using a controller as a route handler

Instead of inline callbacks, you can delegate request handling to a controller method. Controllers help organize logic into dedicated classes and make handlers reusable across multiple routes.

See also: [Controllers guide](https://docs.adonisjs.com/guides/basics/controllers) and [HTTP Context documentation](https://docs.adonisjs.com/guides/basics/http-context)

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts/:id', [controllers.Posts, 'show'])
```

## Viewing registered routes

You can view all routes registered by your application using the Ace CLI command below. This is helpful for debugging, verifying route names, or checking which middleware is attached to specific routes.

`node ace list:routes`

If you're using the [official VSCode extension](https://marketplace.visualstudio.com/items?itemName=jripouteau.adonis-vscode-extension) , routes are also visible directly from the VSCode activity bar, making it easy to navigate your application's endpoints.

## Route params

Route params allow parts of the URL to be dynamic, capturing values from specific segments and making them available in your handler. Each param matches any value in that position and is accessible via `ctx.params`.

### Basic route params

A basic route param is defined with a colon `:` followed by a name. The captured value can be accessed in your handler through the `params` object.

```
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', ({ params }) => {
  return `Showing post with id: ${params.id}`
})
```

When someone visits `/posts/42`, the value `42` is captured and `params.id` equals `"42"` (as a string).

### Multiple route params

You can include more than one param in a single route. Each param must have a unique name and is separated by `/`.

```
import router from '@adonisjs/core/services/router'

router.get('/posts/:id/comments/:commentId', ({ params }) => {
  console.log(params.id)        // Post ID
  console.log(params.commentId) // Comment ID
})
```

This matches URLs like `/posts/42/comments/7`, capturing both values.

### Optional route params

Sometimes, a parameter is not always required. You can mark it optional by appending `?` to its name. Optional params must be the last segment in the route pattern.

```
import router from '@adonisjs/core/services/router'

router.get('/posts/:id?', ({ params }) => {
  if (!params.id) {
    return 'Showing all posts'
  }
  return `Showing post with id ${params.id}`
})
```

This route matches both `/posts` and `/posts/42`.

### Wildcard route params

A wildcard param captures all remaining segments of the URL as an array. It is defined using `*` and must appear last in the pattern.

```
import router from '@adonisjs/core/services/router'

router.get('/docs/:category/*', ({ params }) => {
  console.log(params.category)  // 'guides'
  console.log(params['*'])      // ['sql', 'orm', 'query-builder']
})
```

When someone visits `/docs/guides/sql/orm/query-builder`, the wildcard captures `['sql', 'orm', 'query-builder']`.

Use wildcard params for:

*   Documentation paths with nested sections
*   File browsers with directory structures
*   Catch-all routes that need to capture arbitrary depth

## Route param validation

By default, route params accept any value and are always passed to your handler as strings. You can restrict which values are valid and automatically cast them to the correct type using the `.where()` method.

When a param fails validation, the router skips that route and continues searching for other matching routes. This allows you to have multiple routes with the same pattern but different validation rules.

### Why validate params

Without validation, you need to manually check and convert params in every handler.

```
router.get('/posts/:id', ({ params, response }) => {
  if (!/^[0-9]+$/.test(params.id)) {
    return response.badRequest('Invalid ID format')
  }
  const id = Number(params.id)
  // Now use id...
})
```

With param validation, the router handles this automatically before your handler runs.

```
router
  .get('/posts/:id', ({ params }) => {
    console.log(typeof params.id) // 'number'
    // params.id is already validated and cast to number
  })
  .where('id', {
    match: /^[0-9]+$/,
    cast: (value) => Number(value),
  })
```

Use param validation to:

*   Ensure IDs are numeric before querying databases
*   Validate UUIDs match the correct format
*   Verify slugs contain only URL-safe characters
*   Prevent invalid data from reaching your handler
*   Automatically cast strings to proper types (number, boolean, etc.)

##

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/session
Source: https://docs.adonisjs.com/guides/basics/session

## Sessions

This guide covers working with HTTP sessions in AdonisJS applications. You will learn about:

*   Installing and configuring the session package
*   Storing and retrieving session data
*   Working with flash messages
*   Choosing the right storage driver
*   Implementing custom session stores

## Overview

HTTP is a stateless protocol, meaning each request is independent and the server doesn't retain information between requests. Sessions solve this by providing a way to persist state across multiple HTTP requests and associate that state with a unique session identifier.

In AdonisJS, sessions are primarily used in Hypermedia and Inertia applications to maintain user authentication state and pass temporary data (flash messages) between requests. For example, after a user logs in, their authentication state is stored in the session so they remain logged in across subsequent requests. Similarly, when you redirect after a form submission, flash messages stored in the session can display success or error notifications on the next page.

Note

## Installation

Install and configure the sessions package by running the following Ace command:

`node ace add @adonisjs/session`

See steps performed by the add command

1.   Installs the `@adonisjs/session` package using the detected package manager.
2.   Registers the `@adonisjs/session/session_provider` service provider inside the `adonisrc.ts` file.
3.   Creates the `config/session.ts` configuration file.
4.   Defines the `SESSION_DRIVER` environment variable.
5.   Registers the `@adonisjs/session/session_middleware` middleware inside the `start/kernel.ts` file.

## Choosing a storage driver

The session driver determines where your session data is stored. Each driver has different characteristics that make it suitable for specific use cases:

Note

Cookie-based sessions silently truncate data exceeding 4KB. Switch to Redis for production apps with larger session data.

| Driver | Description | Best For |
| --- | --- | --- |
| `cookie` | Stores data in an encrypted cookie (max ~4KB) | Simple apps, small data, no backend storage |
| `file` | Stores data in local filesystem | Development, single-server deployments |
| `redis` | Stores data in Redis database | Production, multiple servers, larger data |
| `dynamodb` | Stores data in AWS DynamoDB | AWS infrastructure, serverless apps |
| `database` | Stores data in SQL databases | Production apps using SQL, existing database infrastructure |
| `memory` | Stores data in memory (lost on restart) | Testing only |

## Configuration

Session configuration is stored in `config/session.ts`, which is created during installation. Here's the default configuration:

```
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  enabled: true,
  cookieName: 'adonis-session',
  clearWithBrowser: false,
  age: '2h',

  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  store: env.get('SESSION_DRIVER'),

  stores: {
    cookie: stores.cookie(),

    file: stores.file({
      location: app.tmpPath('sessions')
    }),

    redis: stores.redis({
      connection: 'main'
    }),

    database: stores.database({
      connection: 'postgres',
      tableName: 'sessions',
    }),

    dynamodb: stores.dynamodb({
      region: env.get('AWS_REGION'),
      endpoint: env.get('AWS_ENDPOINT'),
      tableName: 'sessions',
    }),
  }
})
```

```
age
```

Session lifetime before expiration. Accepts a string duration like `'2 hours'` or `'7 days'`, or a number in milliseconds. After this period, the session expires and data is deleted.

```
age: '2 hours'
// or
age: 7200000 // 2 hours in milliseconds
```

```
clearWithBrowser
```

boolean

When `true`, the session cookie is deleted when the user closes the browser, regardless of the configured `age`. When `false` (the default), the session persists for the configured `age` duration even after the browser is closed.

`clearWithBrowser: false`

```
store
```

string

Determines which session driver to use. Set this using the `SESSION_DRIVER` environment variable in your `.env` file. The value must match one of the keys defined in the `stores` object.

`SESSION_DRIVER=cookie`

```
cookie
```

Cookie configuration object that controls how the session cookie behaves. This includes settings for cookie name, domain, path, and security options. See the [Cookie configuration](https://docs.adonisjs.com/guides/basics/session#cookie-configuration) section for detailed options.

```
stores
```

An object defining all available session stores. Each key represents a driver name, and the value is the store configuration. The driver specified in the `store` property must exist in this object.

### Cookie configuration

Sessions use cookies to store the session ID (or the entire session data for the cookie driver). Configure cookie behavior with these options:

```
cookie.name
```

string

The name of the cookie that stores the session ID. Only change this if it conflicts with other cookies in your application.

```
cookie: {
  name: 'adonis-session'
}
```

```
cookie.domain
```

string

The domain where the cookie is valid. Leave empty to default to the current domain. Set to `'.example.com'` (with leading dot) to share cookies across subdomains like `app.example.com` and `api.example.com`.

```
cookie: {
  domain: '' // Current domain only
  // or
  domain: '.example.com' // All subdomains
}
```

```
cookie.path
```

string

The URL path where the cookie is valid. Setting this to `'/'` makes the cookie available across your entire application.

```
cookie: {
  path: '/'
}
```

```
cookie.httpOnly
```

boolean

When `true`, prevents JavaScript from accessing the cookie through `document.cookie`, protecting against XSS attacks where malicious scripts try to steal session IDs. Keep this `true` for security.

```
cookie: {
  httpOnly: true
}
```

```
cookie.secure
```

boolean

When `true`, ensures cookies are only sent over HTTPS connections, preventing session hijacking on unsecured networks. The starter kit uses `app.inProduction` to automatically enable this in production while keeping it disabled during local development over HTTP.

```
cookie: {
  secure: app.inProduction
}
```

```
cookie.sameSite
```

'lax' | 'strict' | 'none'

Controls when browsers send cookies with cross-site requests, protecting against CSRF attacks.

*   `'lax'`: Cookies sent on top-level navigation (clicking links). Default and recommended for most applications.
*   `'strict'`: Cookies never sent on cross-site requests. Most secure but may break legitimate flows.
*   `'none'`: Cookies always sent. Requires `secure: true` and rarely needed.

```
cookie: {
  sameSite: 'lax'
}
```

### Redis driver

The Redis driver stores session data in a Redis database, making it ideal for production applications with multiple servers or larger 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/static-file-server
Source: https://docs.adonisjs.com/guides/basics/static-file-server

## Static files server

This guide covers serving static files in AdonisJS applications. You will learn how to:

*   Install and configure the static files middleware
*   Understand when to use static files versus compiled assets
*   Configure caching, ETags, and HTTP headers for optimal performance
*   Control access to dot files for security
*   Set up custom headers for specific file types
*   Copy static files to production builds

## Overview

The static file server lets you serve files directly from the file system without creating route handlers for each file. This is essential for assets that don't need processing, like favicons, robots.txt files, user uploads, or downloadable PDFs.

Without a static file server, you would need to create individual routes for every file you want to serve. This quickly becomes unmaintainable:

```
// Without static middleware - tedious and error-prone
router.get('/favicon.ico', async ({ response }) => {
  return response.download('public/favicon.ico')
})
router.get('/robots.txt', async ({ response }) => {
  return response.download('public/robots.txt')
})
router.get('/images/logo.png', async ({ response }) => {
  return response.download('public/images/logo.png')
})
// ... potentially hundreds of routes
```

With the static middleware, all files in the `public` directory are automatically available. The middleware intercepts HTTP requests before they reach your routes. If a file matching the request path exists, it serves the file with appropriate HTTP headers for caching and performance. If no file exists, the request continues to your route handlers as normal.

Warning

The AdonisJS static file server is convenient during development, but in production you should prefer serving static files through a reverse proxy (Nginx, Caddy, Traefik, Apache) or a CDN. These tools are purpose-built for static file delivery and offer better performance, caching, and compression than a Node.js process. This frees your AdonisJS server to focus on handling dynamic requests.

See the [deployment guide](https://docs.adonisjs.com/deployment#serving-static-files-in-production) for recommended production setups.

The key distinction in AdonisJS: files in the `public` directory are served as-is without any processing, while files in the `resources` directory are processed by your assets bundler (like Vite). Use `public` for files that are already in their final form.

## Installation

The `@adonisjs/static` package comes pre-configured with the `web` starter kit. If you're using a different starter kit, you can install and configure it manually.

Install and configure the package using the following command:

`node ace add @adonisjs/static`

See steps performed by the add command

1.   Installs the `@adonisjs/static` package using the detected package manager.

2.   Registers the following service provider inside the `adonisrc.ts` file.

```
{
      providers: [
        // ...other providers
        () => import('@adonisjs/static/static_provider')
      ]
    }
```

1.   Creates the `config/static.ts` file.

2.   Registers the following middleware inside the `start/kernel.ts` file.

```
server.use([
      () => import('@adonisjs/static/static_middleware')
    ])
```

## Configuration

The configuration for the static middleware is stored in the `config/static.ts` file.

```
import { defineConfig } from '@adonisjs/static'

const staticServerConfig = defineConfig({
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',
})

export default staticServerConfig
```

```
enabled
```

The `enabled` property allows you to temporarily disable the middleware without removing it from the middleware stack. This is useful when debugging or testing different configurations. Set it to `false` to stop serving static files while keeping the middleware registered.

```
{
  enabled: true
}
```

```
etag
```

The `etag` property controls whether the server generates [ETags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) for cache validation. ETags help browsers determine if their cached version of a file is still valid without downloading it again.

When a browser requests a file it has cached, it sends the ETag value. If the file hasn't changed, the server responds with a `304 Not Modified` status, saving bandwidth. This is enabled by default and should generally stay enabled for production.

```
{
  etag: true
}
```

```
lastModified
```

The `lastModified` property enables the [Last-Modified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified) header. The server uses the file's modification time from the file system (the [stat.mtime](https://nodejs.org/api/fs.html#statsmtime) property) as the header value.

Browsers can use this header along with ETags for cache validation. Like ETags, this is enabled by default.

```
{
  lastModified: true
}
```

```
dotFiles
```

The `dotFiles` property defines how to handle requests for files starting with a dot (like `.env` or `.gitignore`). You can set one of three values: `'ignore'` (default), `'deny'`, or `'allow'`.

The `'ignore'` option pretends dot files don't exist and returns a `404` status code. This is the recommended setting for security. The `'deny'` option explicitly denies access with a `403` status code. The `'allow'` option serves dot files like any other file.

```
{
  dotFiles: 'ignore' // Recommended
}
```

Warning

Setting `dotFiles` to `'allow'` can expose sensitive files like `.env` or `.git` directories if they're accidentally placed in the public folder. The `'ignore'` setting (default) is recommended for security. It returns a `404` response as if the file doesn't exist, preventing information disclosure.

If you need to serve specific files for domain verification (like `.well-known/acme-challenge` for SSL certificates), create a subdirectory without a leading dot and configure your verification tool to use that path instead.

```
acceptRanges
```

The `acceptRanges` property allows browsers to resume interrupted downloads instead of restarting from the beginning. When enabled, the server adds an `Accept-Ranges` header to responses. This is particularly useful for large files like videos or software downloads. The property defaults to `true`.

```
{
  acceptRanges: true
}
```

```
cacheControl
```

The `cacheControl` property enables the [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) header. This header tells browsers and CDNs how long to cache files before checking for updates. When enabled, you can use the `maxAge` and `immutable` properties to fine-tune caching behavior.

```
{
  cacheControl: true
}
```

```
maxAge
```

The `maxAge` property sets the [max-age](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#max-age) directive for the `Cache-Control` header. This tells browsers how long they can cache the file before checking for updates. You can specify the value in milliseconds 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/url-builder
Source: https://docs.adonisjs.com/guides/basics/url-builder

This guide covers URL generation in AdonisJS applications. You will learn how to:

*   Generate URLs for named routes with type-safe autocompletion
*   Pass route parameters using arrays or objects
*   Add query strings to generated URLs
*   Create signed URLs with cryptographic signatures for secure links
*   Verify signed URLs to prevent tampering
*   Integrate URL generation into frontend applications using Inertia

## Overview

The URL builder provides a type-safe API for generating URLs from named routes. Instead of hard-coding URLs throughout your application in templates, frontend components, API responses, or redirects, you reference routes by name. This ensures that when you change a route's path, you don't need to hunt down and update every URL reference across your codebase.

Once a route is named, you can generate URLs for it using the `urlFor` helper in templates, the `response.redirect().toRoute()` method for redirects, or by importing the `urlFor` function from the URL builder service for other contexts.

The URL builder is type-safe, meaning your IDE will provide autocompletion for route names and TypeScript will catch errors if you reference a non-existent route. This eliminates an entire class of bugs where URLs might break silently after refactoring routes.

## Defining named routes

Every route using a controller is automatically assigned a name based on the controller and method name. The naming convention follows the pattern `controller.method` (explained in detail in the [routing guide](https://docs.adonisjs.com/guides/basics/routing#route-identifiers) ).

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

// Automatically named as 'posts.show'
router.get('/posts/:id', [controllers.posts, 'show'])

// Automatically named as 'posts.index'
router.get('/posts', [controllers.posts, 'index'])
```

For routes without controllers, you must explicitly assign a name using the `.as()` method.

```
router.get('/about', async () => {
  return 'About page'
}).as('about')
```

You can view all named routes in your application using the following Ace command.

`node ace list:routes`

## Generating URLs in templates

Edge templates have access to the `urlFor` helper by default. This helper generates URLs for named routes and accepts route parameters as either an array or an object.

```
<a href="{{ urlFor('posts.show', { id: post.id }) }}">
  View post
</a>
```

When using the Hypermedia starter kit, you can also use the `@link` component, which accepts the route and parameters as component props.

```
@link({ route: 'posts.show', routeParams: { id: post.id } })
  View post
@end
```

## Generating URLs during redirects

When redirecting users to a different page, use the `response.redirect().toRoute()` method instead of hard-coding URLs. You can only redirect to `GET` routes.

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class PostsController {
  async store({ request, response }: HttpContext) {
    const post = await Post.create(request.all())
    
    return response
      .redirect()
      .toRoute('posts.show', { id: post.id })
  }
}
```

## Generating URLs in other contexts

For contexts outside of templates and HTTP responses, such as background jobs, email notifications, or service classes, import the `urlFor` function from the URL builder service.

```
import { urlFor } from '@adonisjs/core/services/url_builder'

export default class NotificationService {
  async sendPostNotification(post: Post) {
    const postUrl = urlFor('posts.show', { id: post.id })
    
    await mail.send({
      subject: 'New post published',
      html: `<a href="${postUrl}">View post</a>`
    })
  }
}
```

## Passing route parameters

Route parameters can be passed as either an array (positional matching) or an object (named matching). Choose the approach that makes your code more readable.

**Array (positional parameters):** Parameters are matched by position to the route pattern.

```
// Route: /posts/:id
urlFor('posts.show', [1])
// Output: /posts/1

// Route: /users/:userId/posts/:postId
urlFor('users.posts.show', [5, 10])
// Output: /users/5/posts/10
```

**Object (named parameters):** Parameters are matched by name to the route pattern.

```
// Route: /posts/:id
urlFor('posts.show', { id: 1 })
// Output: /posts/1

// Route: /users/:userId/posts/:postId
urlFor('users.posts.show', { userId: 5, postId: 10 })
// Output: /users/5/posts/10
```

## Adding query strings

Query strings can be added to generated URLs by passing a third options parameter with a `qs` property. The query string object can contain nested values, which are automatically serialized into the proper format.

```
import { urlFor } from '@adonisjs/core/services/url_builder'

const url = urlFor('posts.index', [], {
  qs: {
    filters: {
      title: 'typescript',
    },
    order: {
      direction: 'asc',
      column: 'id'
    },
  }
})

// Output: /posts?filters[title]=typescript&order[direction]=asc&order[column]=id
```

The same `qs` option works in templates and redirects.

```
<a href="{{ urlFor('posts.index', [], { qs: { page: 2, sort: 'title' } }) }}">
  Next page
</a>
```

```
response.redirect().toRoute('posts.index', [], {
  qs: { page: 2, sort: 'title' }
})
```

## Signed URLs

Signed URLs include a cryptographic signature that prevents tampering. If someone modifies the URL, the signature becomes invalid and the request can be rejected. This is useful for scenarios where URLs are publicly accessible but need protection against manipulation, such as newsletter unsubscribe links or password reset tokens.

### Creating signed URLs

Signed URLs are created using the `signedUrlFor` helper exported from the URL builder service. The API is identical to `urlFor`, but the generated URL includes a signature.

```
import User from '#models/user'
import { appUrl } from '#config/app'
import { BaseMail } from '@adonisjs/mail'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'

export default class NewsletterMail extends BaseMail {
  subject = 'Weekly Newsletter'

  constructor(protected user: User) {
    super()
  }

  prepare() {
    const unsubscribeUrl = signedUrlFor(
      'newsletter.unsubscribe',
      { email: this.user.email },
      {
        expiresIn: '30 days',
        prefixUrl: appUrl,
      }
    )

    this.message.htmlView('emails/newsletter', {
      user: this.user,
      unsubscribeUrl
    })
  }
}
```

The `expiresIn` option sets when the signed URL expires. After expiration, the signature is no longer valid. The `prefixUrl` option is required when the URL will be shared externally, such as in emails or external notifications, to ensure the URL includes the full domain. For internal app navigation, relative URLs without the domain are sufficient.

The generated signed URL includes a signature query parameter appended to the URL.

`https://example.com/n

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/basics/validation
Source: https://docs.adonisjs.com/guides/basics/validation

This guide covers validation in AdonisJS using VineJS validators at the controller level. You will learn how to:

*   Create and use VineJS validators in controllers
*   Handle validation errors with automatic content negotiation
*   Customize error messages globally or with i18n
*   Validate query strings, params, headers, and cookies
*   Pass metadata to validators for context-specific validation
*   Use Lucid ORM database validation rules with VineJS
*   Use validators outside HTTP requests in jobs and commands

## Overview

Validation in AdonisJS happens at the controller level, allowing you to validate and abort requests early if the provided data is invalid. This approach lets you model validations around forms or expected request data rather than coupling validations to your models layer.

Once data passes validation, you can trust it completely and pass it to other layers of your application (whether services, data models, or business logic) without additional checks. This creates a clear trust boundary in your application architecture.

## VineJS - The validation library

AdonisJS comes pre-bundled with [VineJS](https://vinejs.dev/) , a superfast validation library. While you can use a different validation library and uninstall VineJS, VineJS provides additional validation rules specifically designed for AdonisJS, such as checking for uniqueness within the database or validating multipart file uploads.

Lucid validation rules

When using Lucid ORM, you can use database validation rules such as `unique` and `exists` in your VineJS schemas. These rules query your database during validation, which is useful when checking unique emails or ensuring a foreign key points to an existing row. See the [Lucid validation rules documentation](https://lucid.adonisjs.com/docs/validation) for the full list of available database rules and options.

## Creating your first validator

Validators in AdonisJS are stored in the `app/validators` directory, with one file per resource containing all validators for that resource's actions. Let's create a validator for blog posts.

1.   #### Generate the validator file

Run the following command to create a new validator.

`node ace make:validator post` 
This creates an empty validator file at `app/validators/post.ts` with the VineJS import.

`import vine from '@vinejs/vine'` 
2.   #### Define your validation schema

Add a validator for creating posts. We'll validate the `title`, `body`, and `publishedAt` fields.

```
import vine from '@vinejs/vine'

export const createPostValidator = vine.create({
  title: vine.string(),
  body: vine.string(),
  publishedAt: vine.date()
})
``` 
3.   #### Use the validator in your controller

Import the validator into your controller and use the `request.validateUsing()` method to validate the request body.

```
import { createPostValidator } from '#validators/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    
    // Now you can trust and use the payload
    // Create post, save to database, etc.
  }
}
``` 
The `request.validateUsing()` method automatically validates the request body. You don't need to explicitly pass the body data (the `request` object already has access to it). If validation fails, an exception is thrown and handled automatically. The validated payload is returned and safe to use throughout your application.

## Understanding error handling

When validation fails, the `request.validateUsing()` method throws an exception. You don't need to manually handle this exception. AdonisJS's [global exception handler](https://docs.adonisjs.com/guides/basics/exception-handling) automatically converts it into an appropriate response based on the request type using content negotiation.

### How content negotiation works

AdonisJS detects what kind of response the client expects and formats validation errors accordingly.

| Application Type | Behavior | Error Format |
| --- | --- | --- |
| Hypermedia (server-rendered) | Redirects back to form | Flash messages in session |
| Inertia | Redirects back to form | Shared via Inertia state |
| API (JSON) | Returns 422 status | JSON with `errors` array |

**For hypermedia applications (traditional server-rendered apps)**

*   The user is redirected back to the form
*   Error messages are flashed to the session using AdonisJS's session flash store
*   You can display these errors in your template using the `@field.error` component

**For Inertia applications**

*   The user is redirected back to the form
*   Error messages are shared via Inertia's shared state
*   Errors are automatically available in your frontend components

**For API requests (clients expecting JSON)**

*   A JSON response is returned with status code 422
*   The response contains an `errors` array with all validation error messages
*   Each error includes the field name, rule that failed, and error message

```
{
  "errors": [
    {
      "field": "title",
      "rule": "required",
      "message": "The title field is required"
    },
    {
      "field": "publishedAt",
      "rule": "date",
      "message": "The publishedAt field must be a valid date"
    }
  ]
}
```

This automatic handling means you write validation logic once, and it works correctly for all application types without additional code.

Common confusion

You don't need to wrap `validateUsing()` in try/catch blocks. The global exception handler already converts validation exceptions into proper responses. Only use try/catch if you need custom error handling logic that differs from the default behavior.

## Customizing error messages

By default, VineJS provides generic error messages. You can customize these messages globally in two ways. You can use a custom [VineJS error messages provider](https://vinejs.dev/docs/custom_error_messages#creating-a-messages-provider) , or you can use the i18n package for localized messages.

### Using a custom messages provider

Create a `start/validator.ts` file to configure global custom messages. First, generate the preload file.

`node ace make:preload validator`

Then define your custom messages using the `SimpleMessagesProvider`.

```
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Global messages applicable to all fields
  'required': 'The {{ field }} field is required',
  'string': 'The value of {{ field }} field must be a string',
  'email': 'The value is not a valid email address',
  
  // Field-specific messages override global messages
  'username.required': 'Please choose a username for your account',
})
```

The `{{ field }}` placeholder is automatically replaced with the actual field name. Field-specific messages (like `username.required`) take precedence over global messages.

### Using i18n for localized messages

For applications that nee

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
