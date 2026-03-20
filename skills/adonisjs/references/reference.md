# Adonisjs - Reference

**Pages:** 8

---

## Events - AdonisJS

**URL:** https://docs.adonisjs.com/reference/events

**Contents:**
- Events reference
- http:request_completed
- http:server_ready
- container_binding:resolved
- session:initiated
- session:committed
- session:migrated
- i18n:missing:translation
- mail:sending
- mail:sent

In this guide, we look at the list of events dispatched by the framework core and the official packages. Check out the emitter documentation to learn more about its usage.

The http:request_completed event is dispatched after an HTTP request is completed. The event contains an instance of the HttpContext and the request duration. The duration value is the output of the process.hrtime method.

The event is dispatched once the AdonisJS HTTP server is ready to accept incoming requests.

The event is dispatched after the IoC container resolves a binding or constructs a class instance. The event.binding property will be a string (binding name) or a class constructor, and the event.value property is the resolved value.

The @adonisjs/session package emits the event when the session store is initiated during an HTTP request. The event.session property is an instance of the Session class.

The @adonisjs/session package emits the event when the session data is written to the session store during an HTTP request.

The @adonisjs/session package emits the event when a new session ID is generated using the session.regenerate() method.

The event is dispatched by the @adonisjs/i18n package when a translation for a specific key and locale is missing. You may listen to this event to find the missing translations for a given locale.

The @adonisjs/mail package emits the event before sending an email. In the case of the mail.sendLater method call, the event will be emitted when the mail queue processes the job.

After sending the email, the event is dispatched by the @adonisjs/mail package.

The @adonisjs/mail package emits the event before queueing the job to send the email.

After the email has been queued, the event is dispatched by the @adonisjs/mail package.

The event is dispatched when the MemoryQueue implementation of the @adonisjs/mail package is unable to send the email queued using the mail.sendLater method.

If you are using a custom queue implementation, you must capture the job errors and emit this event.

The event is dispatched by the SessionGuard implementation of the @adonisjs/auth package when the auth.login method is called either directly or internally by the session guard.

The event is dispatched by the SessionGuard implementation of the @adonisjs/auth package after a user has been logged in successfully.

You may use this event to track sessions associated with a given user.

The event is dispatched by the @adonisjs/auth package when an attempt is made to validate the request session and check for a logged-in user.

The event is dispatched by the @adonisjs/auth package after the request session has been validated and the user is logged in. You may access the logged-in user using the event.user property.

The event is dispatched by the @adonisjs/auth package when the authentication check fails, and the user is not logged in during the current HTTP request.

The event is dispatched by the @adonisjs/auth package after the user has been logged out.

The event is dispatched by the @adonisjs/auth package when an attempt is made to validate the access token during an HTTP request.

The event is dispatched by the @adonisjs/auth package after the access token has been verified. You may access the authenticated user using the event.user property.

The event is dispatched by the @adonisjs/auth package when the authentication check fails.

The event is dispatched by the @adonisjs/bouncer package after the authorization check has been performed. The event payload includes the final response you may inspect to know the status of the check.

The event is dispatched by the @adonisjs/cache package after the cache has been cleared using the cache.clear method.

The event is dispatched by the @adonisjs/cache package after a cache key has been deleted using the cache.delete method.

The event is dispatched by the @adonisjs/cache package when a cache key is found in the cache store.

The event is dispatched by the @adonisjs/cache package when a cache key is not found in the cache store.

The event is dispatched by the @adonisjs/cache package after a cache key has been written to the cache store.

**Examples:**

Example 1 (javascript):
```javascript
import emitter from '@adonisjs/core/services/emitter'
import string from '@adonisjs/core/helpers/string'

emitter.on('http:request_completed', (event) => {
  const method = event.ctx.request.method()
  const url = event.ctx.request.url(true)
  const duration = event.duration

  console.log(`${method} ${url}: ${string.prettyHrTime(duration)}`)
})
```

Example 2 (javascript):
```javascript
import emitter from '@adonisjs/core/services/emitter'

emitter.on('http:server_ready', (event) => {
  console.log(event.host)
  console.log(event.port)

  /**
   * Time it took to boot the app and start
   * the HTTP server.
   */
  console.log(event.duration)
})
```

Example 3 (javascript):
```javascript
import emitter from '@adonisjs/core/services/emitter'

emitter.on('container_binding:resolved', (event) => {
  console.log(event.binding)
  console.log(event.value)
})
```

Example 4 (javascript):
```javascript
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session:initiated', (event) => {
  console.log(`Initiated store for ${event.session.sessionId}`)
})
```

---

## Types helpers - AdonisJS

**URL:** https://docs.adonisjs.com/reference/types-helpers

**Contents:**
- Types helpers
- InferRouteParams
- Prettify
- Primitive
- OneOrMore
- Constructor<T, Arguments>
- AbstractConstructor<T, Arguments>
- LazyImport
- UnWrapLazyImport
- NormalizeConstructor

Infer params of a route pattern. The params must be defined as per the AdonisJS routing syntax.

Prettifies the complex TypeScript types to a simplified type for a better viewing experience. For example:

Union of primitive types. It includes null | undefined | string | number | boolean | symbol | bigint

Specify a union that accepts either T or T[].

Represent a class constructor. The T refers to the class instance properties, and Arguments refers to the constructor arguments.

Represent a class constructor that could also be abstract. The T refers to the class instance properties, and Arguments refers to the constructor arguments.

Represent a function that lazily imports a module with export default.

Unwrap the default export of a LazyImport function.

Normalizes the constructor arguments of a class for use with mixins. The helper is created to work around TypeScript issue#37142.

Define an opaque type to distinguish between similar properties.

Unwrap the value from an opaque type.

Extract all the functions from an object. Optionally specify a list of methods to ignore.

You may use the IgnoreList to ignore methods from a known parent class

Check if all the top-level properties of an object are optional.

Extract properties that are undefined or are a union with undefined values.

Extract properties that are not undefined nor is a union with undefined values.

Define a union with the value or a PromiseLike of the value.

**Examples:**

Example 1 (swift):
```swift
import type { InferRouteParams } from '@adonisjs/core/helpers/types'

InferRouteParams<'/users'> // {}
InferRouteParams<'/users/:id'> // { id: string }
InferRouteParams<'/users/:id?'> // { id?: string }
InferRouteParams<'/users/:id/:slug?'> // { id: string; slug?: string }
InferRouteParams<'/users/:id.json'> // { id: string }
InferRouteParams<'/users/*'> // { '*': string[] }
InferRouteParams<'/posts/:category/*'> // { 'category': string; '*': string[] }
```

Example 2 (typescript):
```typescript
import type { Prettify } from '@adonisjs/core/helpers/types'
import type { ExtractDefined, ExtractUndefined } from '@adonisjs/core/helpers/types'

type Values = {
  username: string | undefined
  email: string
  fullName: string | undefined
  age: number | undefined
}

// When not using prettify helper
type WithUndefinedOptional = {
  [K in ExtractDefined<Values>]: Values[K]
} & {
  [K in ExtractUndefined<Values>]: Values[K]
}

// When using prettify helper
type WithUndefinedOptionalPrettified = Prettify<
  {
    [K in ExtractDefined<Values>]: Values[K]
  } & {
    [K in ExtractUndefined<Values>]: Values[K]
  }
>
```

Example 3 (python):
```python
import type { Primitive } from '@adonisjs/core/helpers/types'

function serialize(
  values:
    | Primitive
    | Record<string, Primitive | Primitive[]>
    | Primitive[]
    | Record<string, Primitive | Primitive[]>[]
) {}
```

Example 4 (python):
```python
import type { OneOrMore } from '@adonisjs/core/helpers/types'
import type { Primitive } from '@adonisjs/core/helpers/types'

function serialize(
  values: OneOrMore<Primitive> | OneOrMore<Record<string, Primitive | Primitive[]>>
) {}
```

---

## Helpers - AdonisJS

**URL:** https://docs.adonisjs.com/reference/helpers

**Contents:**
- Helpers reference
- escapeHTML
- encodeSymbols
- prettyHrTime
- isEmpty
- truncate
- excerpt
- slug
- interpolate
- plural

AdonisJS bundles its utilities into the helpers module and makes them available to your application code. Since these utilities are already installed and used by the framework, the helpers module does not add any additional bloat to your node_modules.

The helper methods are exported from the following modules.

Escape HTML entities in a string value. Under the hood, we use the he package.

Optionally, you can encode non-ASCII symbols using the encodeSymbols option.

You may encode non-ASCII symbols in a string value using the encodeSymbols helper. Under the hood, we use he.encode method.

Pretty print the diff of process.hrtime method.

Check if a string value is empty.

Truncate a string at a given number of characters.

By default, the string is truncated exactly at the given index. However, you can instruct the method to wait for the words to complete.

You can customize the suffix using the suffix option.

The excerpt method is identical to the truncate method. However, it strips the HTML tags from the string.

Generate slug for a string value. The method is exported from the slugify package; therefore, consult its documentation for available options.

You can add custom replacements for Unicode values as follows.

Interpolate variables inside a string. The variables must be inside double curly braces.

Curly braces can be escaped using the \\ prefix.

Convert a word to its plural form. The method is exported from the pluralize package.

Find if a word already is in plural form.

This method combines the singular and the plural methods and uses one or the other based on the count. For example:

The pluralize property exports additional methods to register custom uncountable, irregular, plural, and singular rules.

Convert a word to its singular form. The method is exported from the pluralize package.

Find if a word is already in a singular form.

Convert a string value to camelcase.

Following are some of the conversion examples.

Convert a string value to a capital case.

Following are some of the conversion examples.

Convert a string value to a dash case.

Optionally, you can capitalize the first letter of each word.

Following are some of the conversion examples.

Convert a string value to a dot case.

Optionally, you can convert the first letter of all the words to lowercase.

Following are some of the conversion examples.

Remove all sorts of casing from a string value.

Following are some of the conversion examples.

Convert a string value to a Pascal case. Great for generating JavaScript class names.

Following are some of the conversion examples.

Convert a value to a sentence.

Following are some of the conversion examples.

Convert value to snake case.

Following are some of the conversion examples.

Convert a string value to the title case.

Following are some of the conversion examples.

Generate a cryptographically secure random string of a given length. The output value is a URL-safe base64 encoded string.

Convert an array of words to a comma-separated sentence.

You can replace the and with an or by specifying the options.lastSeparator property.

In the following example, the two words are combined using the and separator, not the comma (usually advocated in English). However, you can use a custom separator for a pair of words.

Remove multiple whitespaces from a string to a single whitespace.

Parse a string-based time expression to seconds.

Passing a numeric value to the parse method is returned as it is, assuming the value is already in seconds.

You can format seconds to a pretty string using the format method.

Parse a string-based time expression to milliseconds.

Passing a numeric value to the parse method is returned as it is, assuming the value is already in milliseconds.

Using the format method, you can format milliseconds to a pretty string.

Parse a string-based unit expression to bytes.

Passing a numeric value to the parse method is returned as it is, assuming the value is already in bytes.

Using the format method, you can format bytes to a pretty string. The method is exported directly from the bytes package. Please reference the package README for available options.

Get the ordinal letter for a given number.

Check if two buffer or string values are the same. This method does not leak any timing information and prevents timing attack.

Under the hood, this method uses Node.js crypto.timeSafeEqual method, with support for comparing string values. (crypto.timeSafeEqual does not support string comparison)

Create a secure, collision-resistant ID optimized for horizontal scaling and performance. This method uses the @paralleldrive/cuid2 package under the hood.

You can use the isCuid method to check if a value is a valid CUID.

The compose helper allows you to use TypeScript class mixins with a cleaner API. Following is an example of mixin usage without the compose helper.

Following is an example with the compose helper.

Utility methods to base64 encode and decode values.

Like the encode method, you can use the urlEncode to generate a base64 string safe to pass in a URL.

The urlEncode method performs the following replacements.

You can use the decode and the urlDecode methods to decode a previously encoded base64 string.

The decode and the urlDecode methods return null when the input value is an invalid base64 string. You can turn on the strict mode to raise an exception instead.

Get a list of all the files from a directory. The method recursively fetches files from the main and the sub-folders. The dotfiles are ignored implicitly.

You can also pass the options along with the directory path as the second argument.

The fsImportAll method imports all the files recursively from a given directory and sets the exported value from each module on an object.

The second param is the option to customize the import behavior.

The StringBuilder class offers a fluent API to perform transformations on a string value. You may get an instance of string builder using the string.create method.

The MessageBuilder class offers an API to serialize JavaScript data types with an expiry and purpose. You can either store the serialized output in safe storage like your application database or encrypt it (to avoid tampering) and share it publicly.

In the following example, we serialize an object with the token property and set its expiry to be 1 hour.

Once you have the JSON string with the expiry and the purpose, you can encrypt it (to prevent tampering) and share it with the client.

During the token verification, you can decrypt the previously encrypted value and use the MessageBuilder to verify the payload and convert it to a JavaScript object.

The Secret class lets you hold sensitive values within your application without accidentally leaking them inside logs and console statements.

For example, the appKey value defined inside the config/app.ts file is an instance of the Secret class. If you try to log this value to the console, you will see [redacted] and not the original value.

For demonstration, let's fire up a REPL session and try it.

You can call the config.appKey.release method to read the original value. The purpose of the Secret class is not to prevent your code from accessing the original value. Instead, it provides a safety net from exposing sensitive data inside logs.

You can wrap custom values inside the Secret class as follows.

We export the @sindresorhus/is module from the helpers/is import path, and you may use it to perform the type detection in your apps.

**Examples:**

Example 1 (python):
```python
import is from '@adonisjs/core/helpers/is'
import * as helpers from '@adonisjs/core/helpers'
import string from '@adonisjs/core/helpers/string'
```

Example 2 (python):
```python
import string from '@adonisjs/core/helpers/string'

string.escapeHTML('<p> foo © bar </p>')
// &lt;p&gt; foo © bar &lt;/p&gt;
```

Example 3 (python):
```python
import string from '@adonisjs/core/helpers/string'

string.escapeHTML('<p> foo © bar </p>', {
  encodeSymbols: true,
})
// &lt;p&gt; foo &#xA9; bar &lt;/p&gt;
```

Example 4 (python):
```python
import string from '@adonisjs/core/helpers/string'

string.encodeSymbols('foo © bar ≠ baz 𝌆 qux')
// 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'
```

---

## AdonisRC file - AdonisJS

**URL:** https://docs.adonisjs.com/reference/adonisrc-rcfile

**Contents:**
- AdonisRC file
- Overview
- directories
- preloads
- providers
- commands
- commandsAliases
- hooks
- metaFiles
- tests

This guide covers the adonisrc.ts configuration file. You will learn how to:

The adonisrc.ts file serves as the central configuration for your AdonisJS workspace. It controls how the framework boots, where scaffolding commands place generated files, which providers to load, and how the build process behaves.

This file is processed by multiple tools beyond your main application, including the Ace CLI, the Assembler (which handles the dev server and production builds), and various code generators. Because of this broad usage, the file must remain environment-agnostic and free of application-specific logic.

The file contains the minimum required configuration to run your application. You can view the complete expanded configuration, including all defaults, by running the node ace inspect:rcfile command.

You can access the parsed RCFile contents programmatically using the app service.

The directories object maps logical directory names to their filesystem paths. Scaffolding commands use these mappings to determine where to place generated files.

If you rename directories in your project structure, update the corresponding paths here so that commands like node ace make:controller continue to work correctly.

The preloads array specifies files to import during application boot. These files are imported immediately after service providers have been registered and booted, making them ideal for setup code that needs access to the container but should run before the application starts handling requests.

You can register a preload file to run in all environments or restrict it to specific ones.

The simplest form registers a file to run in all environments.

To restrict a preload file to specific environments, use the object form with an environment array.

You can create and register a preload file using the node ace make:preload command.

The providers array lists service providers to load during application boot. Providers are loaded in the order they appear in the array, which matters when providers depend on each other.

Like preload files, providers can be registered for all environments or restricted to specific ones using the same environment values: web, console, repl, and test.

To load a provider only in specific environments, use the object form.

See also: Service providers

The commands array registers Ace commands from installed packages. Your application's own commands (in the commands directory) are discovered automatically and do not need to be registered here.

See also: Creating Ace commands

The commandsAliases object creates shortcuts for frequently used commands. This is useful for commands with long names or commands you run often.

You can define multiple aliases pointing to the same command.

See also: Creating command aliases

The hooks object registers callbacks that run at specific points during the Assembler lifecycle. The Assembler is the tool responsible for running the dev server, creating production builds, running tests, and performing code generation.

Hooks can be defined inline or as lazily-imported modules. They run in a separate process from your AdonisJS application and do not have access to the IoC container or framework services.

The indexEntities() hook generates barrel files for controllers, events, and listeners, enabling lazy-loading and type-safe references. Package hooks like @adonisjs/vite/build_hook handle build-time asset compilation.

See also: Assembler hooks for a complete reference of available hooks and how to create custom hooks for code generation.

The metaFiles array specifies non-TypeScript files to copy into the build folder when creating a production build. This includes templates, language files, and other assets your application needs at runtime.

Each entry accepts a glob pattern and an optional reloadServer flag that triggers a dev server restart when matching files change.

The tests object configures the test runner, including global timeout settings and test suite definitions.

See also: Introduction to testing

**Examples:**

Example 1 (unknown):
```unknown
node ace inspect:rcfile
```

Example 2 (python):
```python
import app from '@adonisjs/core/services/app'

console.log(app.rcFile)
```

Example 3 (json):
```json
{
  directories: {
    config: 'config',
    commands: 'commands',
    contracts: 'contracts',
    public: 'public',
    providers: 'providers',
    languageFiles: 'resources/lang',
    migrations: 'database/migrations',
    seeders: 'database/seeders',
    factories: 'database/factories',
    views: 'resources/views',
    start: 'start',
    tmp: 'tmp',
    tests: 'tests',
    httpControllers: 'app/controllers',
    models: 'app/models',
    services: 'app/services',
    exceptions: 'app/exceptions',
    mails: 'app/mails',
    middleware: 'app/middleware',
    policies: 'app/policies',
    validators: 'app/validators',
    events: 'app/events',
    listeners: 'app/listeners',
    stubs: 'stubs',
  }
}
```

Example 4 (json):
```json
{
  preloads: [
    () => import('./start/view.js')
  ]
}
```

---

## Commands - AdonisJS

**URL:** https://docs.adonisjs.com/reference/commands

**Contents:**
- Commands reference
- serve
- build
- add
- configure
- eject
- generate:key
- make:controller
- make:middleware
- make:event

In this guide, we cover the usage of all the commands shipped with the framework core and the official packages. You may also view the commands help using the node ace list command or the node ace <command-name> --help command.

The output of the help screen is formatted as per the http://docopt.org standard

The serve uses the @adonisjs/assembler package to start the AdonisJS application in development environment. You can optionally watch for file changes and restart the HTTP server on every file change.

The serve command starts the development server (via the bin/server.ts file) as a child process. If you want to pass node arguments to the child process, you can define them before the command name.

Following is the list of available options you can pass to the serve command. Alternatively, use the --help flag to view the command's help.

Watch the filesystem and reload the server in HMR mode.

Watch the filesystem and always restart the process on file change.

Use polling to detect filesystem changes. You might want to use polling when using a Docker container for development.

Clear the terminal after every file change and before displaying the new logs. Use the --no-clear flag to retain old logs.

The build command uses the @adonisjs/assembler package to create the production build of your AdonisJS application. The following steps are performed to generate the build.

See also: Creating the production build.

Following is the list of available options you can pass to the build command. Alternatively, use the --help flag to view the command's help.

The build command terminates the build process when your project has TypeScript errors. However, you can ignore those errors and finish the build using the --ignore-ts-errors flag.

The build command copies the package.json file alongside the lock file of the package manager your application is using.

We detect the package manager using the @antfu/install-pkg package. However, you can turn off detection by explicitly providing the package manager's name.

The add command combines the npm install <package-name> and node ace configure commands. So, instead of running two separate commands, you can install and configure the package in one go using the add command.

The add command will automatically detect the package manager used by your application and use that to install the package. However, you can always opt for a specific package manager using the --package-manager CLI flag.

If the package can be configured using flags, you can pass them directly to the add command. Every unknown flag will be passed down to the configure command.

Enable verbose mode to display the package installation and configuration logs.

Passed down to the configure command. Force overwrite files when configuring the package. See the configure command for more information.

Define the package manager to use for installing the package. The value must be npm, pnpm, bun or yarn.

Install the package as a development dependency.

Configure a package after it has been installed. The command accepts the package name as the first argument.

Enable verbose mode to display the package installation logs.

The stubs system of AdonisJS does not overwrite existing files. For example, if you configure the @adonisjs/lucid package and your application already has a config/database.ts file, the configure process will not overwrite the existing config file.

However, you can force overwrite files using the --force flag.

Eject stubs from a given package to your application stubs directory. In the following example, we copy the make/controller stubs to our application for modification.

See also: Customizing stubs

Generate a cryptographically secure random key and write to the .env file as the APP_KEY environment variable.

Display the key on the terminal instead of writing it to the .env file. By default, the key is written to the env file.

The generate:key command does not write the key to the .env file when running your application in production. However, you can use the --force flag to override this behavior.

Create a new HTTP controller class. Controllers are created inside the app/controllers directory and use the following naming conventions.

You also generate a controller with custom action names, as shown in the following example.

Force the controller name to be in singular form.

Generate a controller with methods to perform CRUD operations on a resource.

The --api flag is similar to the --resource flag. However, it does not define the create and the edit methods since they are used to display forms.

Create a new middleware for HTTP requests. Middleware are stored inside the app/middleware directory and uses the following naming conventions.

Skip the middleware stack selection prompt by defining the stack explicitly. The value must be server, named, or router.

Create a new event class. Events are stored inside the app/events directory and use the following naming conventions.

Create a new VineJS validator file. The validators are stored inside the app/validators directory, and each file may export multiple validators.

Create a validator file with pre-defined validators for create and update actions.

Create a new event listener class. The listener classes are stored inside the app/listeners directory and use the following naming conventions.

Generate an event class alongside the event listener.

Create a new service class. Service classes are stored inside the app/services directory and use the following naming conventions.

A service has no pre-defined meaning, and you can use it to extract the business logic inside your application. For example, if your application generates a lot of PDFs, you may create a service called PdfGeneratorService and reuse it in multiple places.

Create a new custom exception class. Exceptions are stored inside the app/exceptions directory.

Create a new Ace command. By default, the commands are stored inside the commands directory at the root of your application.

Commands from this directory are imported automatically by AdonisJS when you try to execute any Ace command. You may prefix the filename with an _ to store additional files that are not Ace commands in this directory.

Create a new Edge.js template file. The templates are created inside the resources/views directory.

Create a service provider file. Providers are stored inside the providers directory at the root of your application and use the following naming conventions.

Define environments in which the provider should get imported. Learn more about app environments

Create a new preload file. Preload files are stored inside the start directory.

Define environments in which the preload file should get imported. Learn more about app environments

Create a new test file inside the tests/<suite> directory.

Define the suite for which you want to create the test file. Otherwise, the command will display a prompt for suite selection.

Create a new mail class inside the app/mails directory. The mail classes are suffixed with the Notification keyword. However, you may define a custom suffix using the --intent CLI flag.

Define a custom intent for the mail.

Create a new Bouncer policy class. The policies are stored inside the app/policies folder and use the following naming conventions.

View the contents of the adonisrc.ts file after merging the defaults. You may use this command to inspect the available configuration options and override them per your application requirements.

See also: AdonisRC file

View list of routes registered by your application. This command will boot your AdonisJS application in the console environment.

Also, you can see the routes list from the VSCode activity bar if you are using our official VSCode extension.

View routes as a JSON string. The output will be an array of object.

View routes inside a CLI table. By default, we display routes inside a compact, pretty list.

Filter routes list and include the ones using the mentioned middleware. You may use the * keyword to include routes using one or more middleware.

Filter routes list and include the ones NOT using the mentioned middleware. You may use the * keyword to include routes that do not use any middleware.

The env:add command allows you to add a new environment variables to the .env, .env.example files and will also define the validation rules in the start/env.ts file.

You can just run the command and it will prompt you for the variable name, value, and validation rules. Or you can pass them as arguments.

Define the type of the environment variable. The value must be one of the following: string, boolean, number, enum.

Define the allowed values for the environment variable when the type is enum.

**Examples:**

Example 1 (unknown):
```unknown
node ace list
```

Example 2 (unknown):
```unknown
node ace serve --hmr
```

Example 3 (unknown):
```unknown
node ace --no-warnings --inspect serve --hmr
```

Example 4 (unknown):
```unknown
node ace build
```

---

## Application - AdonisJS

**URL:** https://docs.adonisjs.com/reference/application

**Contents:**
- Application
- Overview
- Environment
  - Switching the environment
- Node environment
  - Shorthand properties
- State
  - Shorthand properties
- Listening for process signals
  - Conditional listeners

This guide covers the Application class in AdonisJS. You will learn how to:

The Application class handles the heavy lifting of wiring together an AdonisJS application. It manages the application lifecycle, provides access to environment information, tracks the current state, and offers helper methods for generating paths to various project directories.

You access the Application instance through the app service, which is available throughout your application.

See also: Application lifecycle

The environment refers to the runtime context in which your application is running. AdonisJS recognizes four distinct environments:

You can access the current environment using the getEnvironment method.

You can switch the application environment before it has been booted. This is useful when a command needs to run in a different context than it was started in. For example, the node ace repl command starts in the console environment but switches to repl before presenting the prompt.

The nodeEnvironment property provides access to the Node.js environment, derived from the NODE_ENV environment variable. AdonisJS normalizes common variations to ensure consistency across different deployment configurations.

Instead of comparing strings, you can use these boolean properties to check the current environment.

The state represents where the application is in its lifecycle. The features you can access depend on the current state—for example, you cannot access container bindings or container services until the app reaches the booted state.

You can listen for POSIX signals using the app.listen or app.listenOnce methods. These register listeners with the Node.js process object.

Use listenIf or listenOnceIf to register listeners only when a condition is met. The listener is registered only when the first argument is truthy.

When your application runs as a child process, you can send messages to the parent using the app.notify method. This wraps the process.send method.

The Application class provides helper methods that generate absolute paths to files and directories within your project. These helpers respect the directory structure configured in your adonisrc.ts file, ensuring paths remain correct even if you customize directory locations.

Returns an absolute path to a file or directory within the project root.

Returns a file URL to a file or directory within the project root. This is useful when dynamically importing files.

Returns a path to a file inside the tmp directory within the project root.

Returns a path to a file inside the .adonisjs/server directory, which contains server-side barrel files like controller imports.

Returns a path to a file inside the .adonisjs/client directory, which contains client-side generated files.

Generators create consistent class names and file names for different entities in your application. They ensure naming conventions are followed when creating new files programmatically.

See the generators.ts source code for the complete list of available generators.

**Examples:**

Example 1 (python):
```python
import app from '@adonisjs/core/services/app'
```

Example 2 (python):
```python
import app from '@adonisjs/core/services/app'

console.log(app.getEnvironment())
```

Example 3 (python):
```python
import app from '@adonisjs/core/services/app'

if (!app.isBooted) {
  app.setEnvironment('repl')
}
```

Example 4 (python):
```python
import app from '@adonisjs/core/services/app'

console.log(app.nodeEnvironment)
```

---

## Exceptions - AdonisJS

**URL:** https://docs.adonisjs.com/reference/exceptions

**Contents:**
- Exceptions reference
- E_ROUTE_NOT_FOUND
- E_ROW_NOT_FOUND
- E_AUTHORIZATION_FAILURE
- E_TOO_MANY_REQUESTS
- E_BAD_CSRF_TOKEN
- E_OAUTH_MISSING_CODE
- E_OAUTH_STATE_MISMATCH
- E_UNAUTHORIZED_ACCESS
- E_INVALID_CREDENTIALS

In this guide we will go through the list of known exceptions raised by the framework core and the official packages. Some of the exceptions are marked as self-handled. Self-handled exceptions can convert themselves to an HTTP response.

The exception is raised when the HTTP server receives a request for a non-existing route. By default, the client will get a 404 response, and optionally, you may render an HTML page using status pages.

The exception is raised when the database query for finding one item fails e.g when using Model.findOrFail(). By default, the client will get a 404 response, and optionally, you may render an HTML page using status pages.

The exception is raised when a bouncer authorization check fails. The exception is self-handled and uses content-negotiation to return an appropriate error response to the client.

The exception is raised by the @adonisjs/rate-limiter package when a request exhausts all the requests allowed during a given duration. The exception is self-handled and uses content-negotiation to return an appropriate error response to the client.

The exception is raised when a form using CSRF protection is submitted without the CSRF token, or the CSRF token is invalid.

The E_BAD_CSRF_TOKEN exception is self-handled, and the user will be redirected back to the form, and you can access the error using the flash messages.

The @adonisjs/ally package raises the exception when the OAuth service does not provide the OAuth code during the redirect.

You can avoid this exception if you handle the errors before calling the .accessToken or .user methods.

The @adonisjs/ally package raises the exception when the CSRF state defined during the redirect is missing.

You can avoid this exception if you handle the errors before calling the .accessToken or .user methods.

The exception is raised when one of the authentication guards is not able to authenticate the request. The exception is self-handled and uses content-negotiation to return an appropriate error response to the client.

The exception is raised when the auth finder is not able to verify the user credentials. The exception is handled and use content-negotiation to return an appropriate error response to the client.

The exception is raised when you attempt to create a URL for a route using the URL builder.

The E_HTTP_EXCEPTION is a generic exception for throwing errors during an HTTP request. You can use this exception directly or create a custom exception extending it.

The E_HTTP_REQUEST_ABORTED is a sub-class of the E_HTTP_EXCEPTION exception. This exception is raised by the response.abort method.

The exception is raised when the length of appKey is smaller than 16 characters. You can use the generate:key ace command to generate a secure app key.

The exception is raised when the appKey property is not defined inside the config/app.ts file. By default, the value of the appKey is set using the APP_KEY environment variable.

The exception is raised when one or more environment variables fail the validation. The detailed validation errors can be accessed using the error.help property.

The exception is raised when a command does not define the commandName property or its value is an empty string.

The exception is raised by Ace when unable to find a command.

The exception is raised when executing a command without passing a required CLI flag.

The exception is raised when trying to execute a command without providing any value to a non-boolean CLI flag.

The exception is raised when executing a command without defining the required arguments.

The exception is raised when executing a command without defining the value for a required argument.

The exception is raised when executing a command with an unknown CLI flag.

The exception is raised when the value provided for a CLI flag is invalid—for example, passing a string value to a flag that accepts numeric values.

The @adonisjs/redis package raises the exception when you attempt to subscribe to a given pub/sub channel multiple times.

The @adonisjs/redis package raises the exception when you attempt to subscribe to a given pub/sub pattern multiple times.

The exception is raised by the @adonisjs/mail package when unable to send the email using a given transport. Usually, this will happen when the HTTP API of the email service returns a non-200 HTTP response.

You may access the network request error using the error.cause property. The cause property is the error object returned by got (npm package).

The exception is raised by the @adonisjs/session package when the session store is initiated in the read-only mode.

The exception is raised by the @adonisjs/session package when the session store has not been initiated yet. This will be the case when you are not using the session middleware.

The exception is raised when the pattern property is missing in the metaFile.

The exception is raised when a preload file registered in the adonisrc.ts file cannot be found.

The exception is raised when the preload file property is not a function.

The exception is raised when a service provider file registered in the adonisrc.ts file cannot be found.

The exception is raised when the provider file property is not a function.

The exception is raised when a test suite configuration in the adonisrc.ts file is missing the required name property.

The exception is raised when a test suite configuration in the adonisrc.ts file is missing the required files property.

The exception is raised when an unknown assembler hook is defined in the adonisrc.ts file.

The exception is raised when the hooks configuration in the adonisrc.ts file is not an array of lazy imports.

The exception is raised when the presets configuration is not an array of preset functions.

The exception is raised when a preset is not defined as a function.

The exception is raised when an error occurs during preset execution.

The exception is raised when one or more environment variables are invalid as per the rules defined within the start/env.ts file.

The exception is raised when trying to override the implementation of an Env identifier. Consider using Env.defineIdentifierIfMissing method instead.

**Examples:**

Example 1 (sql):
```sql
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_ROUTE_NOT_FOUND) {
  // handle error
}
```

Example 2 (swift):
```swift
import { errors as lucidErrors } from '@adonisjs/lucid'
if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
  // handle error
  console.log(`${error.model?.name || 'Row'} not found`)
}
```

Example 3 (sql):
```sql
import { errors as bouncerErrors } from '@adonisjs/bouncer'
if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
}
```

Example 4 (sql):
```sql
import { errors as limiterErrors } from '@adonisjs/limiter'
if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
}
```

---

## Edge helpers - AdonisJS

**URL:** https://docs.adonisjs.com/reference/edge

**Contents:**
- Edge helpers and tags
- request
- route/signedRoute
- app
- config
- session
- flashMessages
- old
- t
- i18n

In this guide, we will learn about the helpers and the tags contributed to Edge by the AdonisJS official packages. The helpers shipped with Edge are not covered in this guide and must reference Edge documentation for the same.

Reference to the instance of ongoing HTTP request. The property is only available when a template is rendered using the ctx.view.render method.

Helper functions to create URL for a route using the URL builder. Unlike the URL builder, the view helpers do not have a fluent API and accept the following parameters.

The options object with the following properties.

Reference to the Application instance.

A helper function to reference configuration values inside Edge templates. You may use the config.has method to check if the value for a key exists.

A read-only copy of the session object. You cannot mutate session data within Edge templates. The session property is only available when the template is rendered using the ctx.view.render method.

A read-only copy of session flash messages. The flashMessages property is only available when the template is rendered using the ctx.view.render method.

The old method is a shorthand for the flashMessages.get method.

The t method is contributed by the @adonisjs/i18n package to display translations using the i18n class. The method accepts the translation key identifier, message data and a fallback message as the parameters.

Reference to an instance of the I18n class configured using the application's default locale. However, the DetectUserLocaleMiddleware overrides this property with an instance created for the current HTTP request locale.

Reference to the ctx.auth property shared by the InitializeAuthMiddleware. You may use this property to access information about the logged-in user.

If you are displaying the logged-in user info on a public page (not protected by the auth middleware), then you may want to first silently check if the user is logged-in or not.

Resolve the URL of an asset processed by Vite. Learn more about referencing assets inside Edge templates.

The embedImage and the embedImageData helpers are added by the mail package and are only available when rendering a template to send an email.

The @flashMessage tag provides a better DX for reading flash messages for a given key conditionally.

Instead of writing conditionals

You may prefer using the tag

The @error tag provides a better DX for reading error messages stored inside the errorsBag key in flashMessages.

Instead of writing conditionals

You may prefer using the tag

The @inputError tag provides a better DX for reading validation error messages stored inside the inputErrorsBag key in flashMessages.

Instead of writing conditionals

You may prefer using the tag

The @vite tag accepts an array of entry point paths and returns the script and the link tags for the same. The path you provide to the @vite tag should match exactly the path registered inside the vite.config.js file.

You can define the script tag attributes as the 2nd argument. For example:

The @viteReactRefresh tag returns a script tag to enable React HMR for project using the @vitejs/plugin-react package.

The @can and @cannot tags allows you write authorization checks in Edge templates by referencing the ability name or the policy name as a string.

The first argument is the ability or the policy reference followed by the arguments accepted by the check.

See also: Pre-registering abilities and policies

**Examples:**

Example 1 (json):
```json
{{ request.url() }}
{{ request.input('signature') }}
```

Example 2 (jsx):
```jsx
<a href="{{ route('posts.show', [post.id]) }}">
  View post
</a>
```

Example 3 (jsx):
```jsx
<a href="{{
  signedRoute('unsubscribe', [user.id], {
    expiresIn: '3 days',
    prefixUrl: 'https://blog.adonisjs.com'    
  })
}}">
 Unsubscribe
</a>
```

Example 4 (json):
```json
{{ app.getEnvironment() }}
```

---
