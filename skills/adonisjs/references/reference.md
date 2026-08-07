# Reference — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [reference/adonisrc-rcfile](https://docs.adonisjs.com/reference/adonisrc-rcfile)
- [reference/application](https://docs.adonisjs.com/reference/application)
- [reference/commands](https://docs.adonisjs.com/reference/commands)
- [reference/edge](https://docs.adonisjs.com/reference/edge)
- [reference/events](https://docs.adonisjs.com/reference/events)
- [reference/exceptions](https://docs.adonisjs.com/reference/exceptions)
- [reference/helpers](https://docs.adonisjs.com/reference/helpers)
- [reference/types-helpers](https://docs.adonisjs.com/reference/types-helpers)

## Condensed excerpts (prefer live docs if conflict)

### reference/adonisrc-rcfile
Source: https://docs.adonisjs.com/reference/adonisrc-rcfile

AdonisRC file (Root) - AdonisJS Documentation 

Reference
            /
            Root AdonisRC file 

AdonisRC file 
This guide covers the configuration file. You will learn how to: 
Register service providers and preload files 
Configure directory paths for scaffolding commands 
Define command aliases for frequently used Ace commands 
Set up assembler hooks for build-time code generation 
Specify meta files to include in production builds 
Configure test suites and runner options 
Overview 
The file serves as the central configuration for your AdonisJS workspace. It controls how the framework boots, where scaffolding commands place generated files, which providers to load, and how the build process behaves. 
This file is processed by multiple tools beyond your main application, including the Ace CLI, the Assembler (which handles the dev server and production builds), and various code generators. Because of this broad usage, the file must remain environment-agnostic and free of application-specific logic. 
The file contains the minimum required configuration to run your application. You can view the complete expanded configuration, including all defaults, by running the 
```
node ace inspect:rcfile
```
command. 

```
node ace inspect:rcfile
```

You can access the parsed RCFile contents programmatically using the service. 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

console.log(app.rcFile)
```

directories 
The object maps logical directory names to their filesystem paths. Scaffolding commands use these mappings to determine where to place generated files. 
If you rename directories in your project structure, update the corresponding paths here so that commands like 
```
node ace make:controller
```
continue to work correctly. 
adonisrc.ts 

```
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
    mailers: 'app/mailers',
    mails: 'app/mails',
    middleware: 'app/middleware',
    policies: 'app/policies',
    validators: 'app/validators',
    events: 'app/events',
    listeners: 'app/listeners',
    transformers: 'app/transformers',
    stubs: 'stubs',
    generatedClient: '.adonisjs/client',
    generatedServer: '.adonisjs/server',
  }
}
```

preloads 
The array specifies files to import during application boot. These files are imported immediately after service providers have been registered and booted, making them ideal for setup code that needs access to the container but should run before the application starts handling requests. 
You can register a preload file to run in all environments or restrict it to specific ones. 
Environment Description 
The HTTP server process 
Ace commands (except ) 
The interactive REPL session 
The test runner process 

The simplest form registers a file to run in all environments. 
adonisrc.ts 

```
{
  preloads: [
    () => import('#start/view')
  ]
}
```

To restrict a preload file to specific environments, use the object form with an array. 
adonisrc.ts 

```
{
  preloads: [
    {
      file: () => import('#start/view'),
      environment: ['web', 'console', 'test']
    },
  ]
}
```

Note 
You can create and register a preload file using the 
```
node ace make:preload
```
command. 

providers 
The array lists  [link:/guides/concepts/service-providers] service providers to load during application boot. Providers are loaded in the order they appear in the array, which matters when providers depend on each other. 
Like preload files, providers can be registered for all environments or restricted to specific ones using the same environment values: , , , and . 
adonisrc.ts 

```
{
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/http_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    () => import('./providers/app_provider.js'),
  ]
}
```

To load a provider only in specific environments, use the object form. 
adonisrc.ts 

```
{
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/http_provider'),
      environment: ['web']
    },
    {
      file: () => import('./providers/app_provider.js'),
      environment: ['web', 'console', 'test']
    },
  ]
}
```

See also:  [link:/guides/concepts/service-providers] Service providers 
commands 
The array registers Ace commands from installed packages. Your application's own commands (in the directory) are discovered automatically and do not need to be registered here. 
adonisrc.ts 

```
{
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands')
  ]
}
```

See also:  [link:/guides/ace/creating-commands] Creating Ace commands 
commandsAliases 
The object creates shortcuts for frequently used commands. This is useful for commands with long names or commands you run often. 
adonisrc.ts 

```
{
  commandsAliases: {
    migrate: 'migration:run'
  }
}
```

You can define multiple aliases pointing to the same command. 
adonisrc.ts 

```
{
  commandsAliases: {
    migrate: 'migration:run',
    up: 'migration:run'
  }
}
```

See also:  [link:/guides/ace/introduction#creating-command-aliases] Creating command aliases 
hooks 
The object registers callbacks that run at specific points during the Assembler lifecycle. The Assembler is the tool responsible for running the dev server, creating production builds, running tests, and performing code generation. 
Hooks can be defined inline or as lazily-imported modules. They run in a separate process from your AdonisJS application and do not have access to the IoC container or framework services. 
adonisrc.ts 

```
import { defineConfig } from '@adonisjs/core/app'
import { indexEntities } from '@adonisjs/core/app'

export default defineConfig({
  hooks: {
    init: [indexEntities()],
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
})
```

The hook generates barrel files for controllers, events, and listeners, enabling lazy-loading and type-safe references. Package hooks like 
```
@adonisjs/vite/build_hook
```
handle build-time asset compilation. 
See also:  [link:/guides/concepts/assembler-hooks] Assembler hooks for a complete reference of available hooks and how to create custom hooks for code generation. 
metaFiles 
The array specifies non-TypeScript files to copy into the folder when creating a production build. This includes templates, language files, and other assets your a

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/application
Source: https://docs.adonisjs.com/reference/application

Application (Root) - AdonisJS Documentation 

Reference
            /
            Root Application 

Application 
This guide covers the Application class in AdonisJS. You will learn how to: 
Access the runtime environment (web, console, repl, test) 
Check the Node.js environment and application state 
Listen for process signals and notify parent processes 
Generate absolute paths to project directories and files 
Use generators for consistent naming conventions 
Overview 
The  [link:https://github.com/adonisjs/application/blob/9.x/src/application.ts] Application class handles the heavy lifting of wiring together an AdonisJS application. It manages the application lifecycle, provides access to environment information, tracks the current state, and offers helper methods for generating paths to various project directories. 
You access the Application instance through the service, which is available throughout your application. 
See also:  [link:/guides/concepts/application-lifecycle] Application lifecycle 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'
```

Environment 
The environment refers to the runtime context in which your application is running. AdonisJS recognizes four distinct environments: 
Environment Description 
The process started for the HTTP server 
Ace commands (except the REPL command) 
The process started using 
The process started using 

You can access the current environment using the method. 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

console.log(app.getEnvironment())
```

Switching the environment 
You can switch the application environment before it has been booted. This is useful when a command needs to run in a different context than it was started in. For example, the command starts in the environment but switches to before presenting the prompt. 
commands/my_command.ts 

```
import app from '@adonisjs/core/services/app'

if (!app.isBooted) {
  app.setEnvironment('repl')
}
```

Node environment 
The property provides access to the Node.js environment, derived from the environment variable. AdonisJS normalizes common variations to ensure consistency across different deployment configurations. 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

console.log(app.nodeEnvironment)
```

NODE_ENV Normalized to 
dev development 
develop development 
stage staging 
prod production 
testing test 

Shorthand properties 
Instead of comparing strings, you can use these boolean properties to check the current environment. 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

/**
 * Check if running in production
 */
app.inProduction
app.nodeEnvironment === 'production'

/**
 * Check if running in development
 */
app.inDev
app.nodeEnvironment === 'development'

/**
 * Check if running tests
 */
app.inTest
app.nodeEnvironment === 'test'
```

State 
The state represents where the application is in its lifecycle. The features you can access depend on the current state—for example, you cannot access  [link:/guides/concepts/dependency-injection#bindings] container bindings or  [link:/guides/concepts/container-services] container services until the app reaches the state. 
State Description 
Default state when Application instance is created 
Environment variables parsed and processed 
Service providers registered and booted 
Application ready to handle requests (meaning varies by environment) 
Application terminated and process will exit shortly 

app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

console.log(app.getState())
```

Shorthand properties 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

/**
 * True when state is past 'initiated'
 */
app.isBooted

/**
 * True when state is 'ready'
 */
app.isReady

/**
 * True when gracefully attempting to terminate
 */
app.isTerminating

/**
 * True when state is 'terminated'
 */
app.isTerminated
```

Listening for process signals 
You can listen for  [link:https://man7.org/linux/man-pages/man7/signal.7.html] POSIX signals using the or methods. These register listeners with the Node.js object. 
start/events.ts 

```
import app from '@adonisjs/core/services/app'

app.listen('SIGTERM', () => {
  // Handle SIGTERM
})

app.listenOnce('SIGTERM', () => {
  // Handle SIGTERM once
})
```

Conditional listeners 
Use or to register listeners only when a condition is met. The listener is registered only when the first argument is truthy. 
start/events.ts 

```
import app from '@adonisjs/core/services/app'

/**
 * Only listen for SIGINT when running under pm2
 */
app.listenIf(app.managedByPm2, 'SIGINT', () => {
  // Handle SIGINT in pm2
})

app.listenOnceIf(app.managedByPm2, 'SIGINT', () => {
  // Handle SIGINT once in pm2
})
```

Notifying parent process 
When your application runs as a child process, you can send messages to the parent using the method. This wraps the method. 
start/events.ts 

```
import app from '@adonisjs/core/services/app'

app.notify('ready')

app.notify({
  isReady: true,
  port: 3333,
  host: 'localhost'
})
```

Making paths to project files 
The Application class provides helper methods that generate absolute paths to files and directories within your project. These helpers respect the directory structure configured in your file, ensuring paths remain correct even if you customize directory locations. 
makePath 
Returns an absolute path to a file or directory within the project root. 
app/services/some_service.ts 

```
import app from '@adonisjs/core/services/app'

app.makePath('app/middleware/auth.ts')
// /project_root/app/middleware/auth.ts
```

makeURL 
Returns a file URL to a file or directory within the project root. This is useful when dynamically importing files. 
app/services/test_runner.ts 

```
import app from '@adonisjs/core/services/app'

const files = [
  './tests/welcome.spec.ts',
  './tests/maths.spec.ts'
]

await Promise.all(files.map((file) => {
  return import(app.makeURL(file).href)
}))
```

tmpPath 
Returns a path to a file inside the directory within the project root. 
app/services/some_service.ts 

```
app.tmpPath('logs/mail.txt')
// /project_root/tmp/logs/mail.txt

app.tmpPath()
// /project_root/tmp
```

configPath 
app/services/some_service.ts 

```
app.configPath('shield.ts')
// /project_root/config/shield.ts

app.configPath()
// /project_root/config
```

publicPath 
app/services/some_service.ts 

```
app.publicPath('style.css')
// /project_root/public/style.css

app.publicPath()
// /project_root/public
```

viewsPath 
app/services/some_service.ts 

```
app.viewsPath('welcome.edge')
// /project_root/resources/views/welcome.edge

app.viewsPath()
// /project_root/resources/views
```

languageFilesPath 
app/services/some_service.ts 

```
app.languageFilesPath('en/messages.json')
// /project_root/resources/lang/en/messages.json

app.languageFilesPath()
// /project_root/resources/lang
```

ht

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/commands
Source: https://docs.adonisjs.com/reference/commands

Commands (Root) - AdonisJS Documentation 

Reference
            /
            Root Commands 

Commands reference 
In this guide, we cover the usage of all the commands shipped with the framework core and the official packages. You may also view the commands help using the command or the 
```
node ace <command-name> --help
```
command. 

The output of the help screen is formatted as per the http://docopt.org standard 

serve 
The uses the  [link:https://github.com/adonisjs/assembler?tab=readme-ov-file#dev-server] @adonisjs/assembler package to start the AdonisJS application in development environment. You can optionally watch for file changes and restart the HTTP server on every file change. 

The command starts the development server (via the file) as a child process. If you want to pass  [link:https://nodejs.org/api/cli.html#options] node arguments to the child process, you can define them before the command name. 

```
node ace --no-warnings --inspect serve --hmr
```

Following is the list of available options you can pass to the command. Alternatively, use the flag to view the command's help. 

Watch the filesystem and reload the server in HMR mode. 

Watch the filesystem and always restart the process on file change. 

Use polling to detect filesystem changes. You might want to use polling when using a Docker container for development. 

Clear the terminal after every file change and before displaying the new logs. Use the flag to retain old logs. 

build 
The command uses the  [link:https://github.com/adonisjs/assembler?tab=readme-ov-file#bundler] @adonisjs/assembler package to create the production build of your AdonisJS application. The following steps are performed to generate the build. 
See also:  [link:/deployment#creating-the-production-build] Creating the production build . 

Following is the list of available options you can pass to the command. Alternatively, use the flag to view the command's help. 

The build command terminates the build process when your project has TypeScript errors. However, you can ignore those errors and finish the build using the flag. 

The build command copies the file alongside the lock file of the package manager your application is using. 
We detect the package manager using the package. However, you can turn off detection by explicitly providing the package manager's name. 

add 
The command combines the 
```
npm install <package-name>
```
and commands. So, instead of running two separate commands, you can install and configure the package in one go using the command. 
The command will automatically detect the package manager used by your application and use that to install the package. However, you can always opt for a specific package manager using the CLI flag. 

```
# Install and configure the @adonisjs/lucid package
node ace add @adonisjs/lucid

# Install the package as a development dependency and configure it
node ace add my-dev-package --dev
```

If the package can be configured using flags, you can pass them directly to the command. Every unknown flag will be passed down to the command. 

```
node ace add @adonisjs/lucid --db=sqlite
```

--verbose 
Enable verbose mode to display the package installation and configuration logs. 
--force 
Passed down to the command. Force overwrite files when configuring the package. See the command for more information. 
--package-manager 
Define the package manager to use for installing the package. The value must be , , or . 
--dev 
Install the package as a development dependency. 
configure 
Configure a package after it has been installed. The command accepts the package name as the first argument. 

```
node ace configure @adonisjs/lucid
```

--verbose 
Enable verbose mode to display the package installation logs. 
--force 
The stubs system of AdonisJS does not overwrite existing files. For example, if you configure the package and your application already has a file, the configure process will not overwrite the existing config file. 
However, you can force overwrite files using the flag. 
eject 
Eject stubs from a given package to your application directory. In the following example, we copy the stubs to our application for modification. 
See also:  [link:/guides/concepts/scaffolding#ejecting-stubs] Customizing stubs 

```
# Copy stub from @adonisjs/core package
node ace eject make/controller

# Copy stub from @adonisjs/bouncer package
node ace eject make/policy --pkg=@adonisjs/bouncer
```

generate:key 
Generate a cryptographically secure random key and write to the file as the environment variable. 
See also:  [link:/guides/security/encryption] App key 

```
node ace generate:key
```

--show 
Display the key on the terminal instead of writing it to the file. By default, the key is written to the env file. 
--force 
The command does not write the key to the file when running your application in production. However, you can use the flag to override this behavior. 
make:controller 
Create a new HTTP controller class. Controllers are created inside the directory and use the following naming conventions. 
Form: 
Suffix: 
Class name example: 
File name example: 

```
node ace make:controller users
```

You also generate a controller with custom action names, as shown in the following example. 

```
# Generates controller with "index", "show", and "store" methods
node ace make:controller users index show store
```

--singular 
Force the controller name to be in singular form. 
--resource 
Generate a controller with methods to perform CRUD operations on a resource. 
--api 
The flag is similar to the flag. However, it does not define the and the methods since they are used to display forms. 
make:middleware 
Create a new middleware for HTTP requests. Middleware are stored inside the directory and uses the following naming conventions. 
Form: 
Suffix: 
Class name example: 
File name example: 
```
body_parser_middleware.ts
```

```
node ace make:middleware bodyparser
```

--stack 
Skip the  [link:/guides/basics/middleware#middleware-stacks] middleware stack selection prompt by defining the stack explicitly. The value must be , , or . 

```
node ace make:middleware bodyparser --stack=router
```

make:event 
Create a new event class. Events are stored inside the directory and use the following naming conventions. 
Form: 
Suffix: 
Class name example: 
File name example: 
Recommendation: You must name your events around the lifecycle of an action. For example: , , , and so on. 

```
node ace make:event orderShipped
```

make:validator 
Create a new VineJS validator file. The validators are stored inside the directory, and each file may export multiple validators. 
Form: 
Suffix: 
File name example: 
Recommendation: You must create validator files around the resources of your application. 

```
# A validator for managing a user
node ace make:validator user

# A validator for managing a post
node ace make:validator post
```

--resource 
Create a validator file with pre-defined validators fo

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/edge
Source: https://docs.adonisjs.com/reference/edge

Edge helpers (Root) - AdonisJS Documentation 

Reference
            /
            Root Edge helpers 

Edge helpers and tags 
In this guide, we will learn about the helpers and the tags contributed to Edge by the AdonisJS official packages. The helpers shipped with Edge are not covered in this guide and must reference  [link:https://edgejs.dev/docs/helpers] Edge documentation for the same. 
request 
Reference to the instance of ongoing  [link:/guides/basics/request] HTTP request . The property is only available when a template is rendered using the method. 

```
{{ request.url() }}
{{ request.input('signature') }}
```

route/signedRoute 
Helper functions to create URL for a route using the  [link:/guides/basics/routing#url-builder] URL builder . Unlike the URL builder, the view helpers do not have a fluent API and accept the following parameters. 
Position Description 
1st The route identifier or the route pattern 
2nd Route params are defined as an array or an object. 
3rd The options object with the following properties. 
: Define query string parameters as an object. 
: Search for routes under a specific domain. 
: Prefix a URL to the output. 
: Enable/disable routes lookup. 

```
<a href="{{ route('posts.show', [post.id]) }}">
  View post
</a>
```

```
<a href="{{
  signedRoute('unsubscribe', [user.id], {
    expiresIn: '3 days',
    prefixUrl: 'https://blog.adonisjs.com'    
  })
}}">
 Unsubscribe
</a>
```

app 
Reference to the  [link:/reference/application] Application instance . 

```
{{ app.getEnvironment() }}
```

config 
A helper function to reference configuration values inside Edge templates. You may use the method to check if the value for a key exists. 

```
@if(config.has('app.appUrl'))
  <a href="{{ config('app.appUrl') }}"> Home </a>
@else
  <a href="/"> Home </a>
@end
```

session 
A read-only copy of the  [link:/guides/basics/session#reading-and-writing-data] session object . You cannot mutate session data within Edge templates. The property is only available when the template is rendered using the method. 

```
Post views: {{ session.get(`post.${post.id}.visits`) }}
```

flashMessages 
A read-only copy of  [link:/guides/basics/session#flash-messages] session flash messages . The property is only available when the template is rendered using the method. 

```
@if(flashMessages.has('inputErrorsBag.title'))
  <p>{{ flashMessages.get('inputErrorsBag.title') }}</p>
@end

@if(flashMessages.has('notification'))
  <div class="notification {{ flashMessages.get('notification').type }}">
    {{ flashMessages.get('notification').message }}
  </div>
@end
```

old 
The method is a shorthand for the method. 

```
<input
  type="text"
  name="email"
  value="{{ old('name') || '' }}"
/>
```

t 
The method is contributed by the package to display translations using the  [link:/guides/digging-deeper/i18n#resolving-translations] i18n class . The method accepts the translation key identifier, message data and a fallback message as the parameters. 

```
<h1> {{ t('messages.greeting') }} </h1>
```

i18n 
Reference to an instance of the I18n class configured using the application's default locale. However, the  [link:/guides/digging-deeper/i18n#detecting-user-locale-during-an-http-request] 
```
DetectUserLocaleMiddleware
```
overrides this property with an instance created for the current HTTP request locale. 

```
{{ i18n.formatCurrency(200, { currency: 'USD' }) }}
```

auth 
Reference to the  [link:/guides/basics/http-context#http-context-properties] ctx.auth property shared by the  [link:https://github.com/adonisjs/auth/blob/10.x/src/middleware/initialize_auth_middleware.ts#L19-L48] InitializeAuthMiddleware . You may use this property to access information about the logged-in user. 

```
@if(auth.isAuthenticated)
  <p> {{ auth.user.email }} </p>
@end
```

If you are displaying the logged-in user info on a public page (not protected by the auth middleware), then you may want to first silently check if the user is logged-in or not. 

```
{{-- Check if user is logged-in --}}
@eval(await auth.use('web').check())

@if(auth.use('web').isAuthenticated)
  <p> {{ auth.use('web').user.email }} </p>
@end
```

asset 
Resolve the URL of an asset processed by Vite. Learn more about  [link:/guides/frontend/vite#referencing-assets-inside-edge-templates] referencing assets inside Edge templates . 

```
<img src="{{ asset('resources/images/hero.jpg') }}" />
```

embedImage / embedImageData 
The and the helpers are added by the  [link:/guides/digging-deeper/mail#embedding-images] mail package and are only available when rendering a template to send an email. 

```
<img src="{{
  embedImage(app.makePath('assets/hero.jpg'))
}}" />
```

@flashMessage 
The tag provides a better DX for reading flash messages for a given key conditionally. 
Instead of writing conditionals 

```
@if(flashMessages.has('notification'))
  <div class="notification {{ flashMessages.get('notification').type }}">
    {{ flashMessages.get('notification').message }}
  </div>
@end
```

You may prefer using the tag 

```
@flashMessage('notification')
  <div class="notification {{ $message.type }}">
    {{ $message.message }}
  </div>
@end
```

@error 
The tag provides a better DX for reading error messages stored inside the key in . 
Instead of writing conditionals 

```
@if(flashMessages.has('errorsBag.E_BAD_CSRF_TOKEN'))
  <p>{{ flashMessages.get('errorsBag.E_BAD_CSRF_TOKEN') }}</p>
@end
```

You may prefer using the tag 

```
@error('E_BAD_CSRF_TOKEN')
  <p>{{ $message }}</p>
@end
```

@inputError 
The tag provides a better DX for reading validation error messages stored inside the key in . 
Instead of writing conditionals 

```
@if(flashMessages.has('inputErrorsBag.title'))
  @each(message in flashMessages.get('inputErrorsBag.title'))
    <p>{{ message }}</p>
  @end
@end
```

You may prefer using the tag 

```
@inputError('title')
  @each(message in $messages)
    <p>{{ message }}</p>
  @end
@end
```

@vite 
The tag accepts an array of entry point paths and returns the and the tags for the same. The path you provide to the tag should match exactly the path registered inside the file. 

```
export default defineConfig({
  plugins: [
    adonisjs({
      // highlight-start
      entrypoints: ['resources/js/app.js'],
      // highlight-end
    }),
  ]
})
```

```
@vite(['resources/js/app.js'])
```

You can define the script tag attributes as the 2nd argument. For example: 

```
@vite(['resources/js/app.js'], {
  defer: true,
})
```

@viteReactRefresh 
The tag returns a  [link:https://vitejs.dev/guide/backend-integration.html#:~:text=you%27ll%20also%20need%20to%20add%20this%20before%20the%20above%20scripts] script tag to enable React HMR for project using the  [link:https://www.npmjs.com/package/@vitejs/plugin-react] @vitejs/plugin-react package. 

Output HTML 

```
<script type="module">
  import RefreshRuntime from 'http://localhost:5173/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/events
Source: https://docs.adonisjs.com/reference/events

Events (Root) - AdonisJS Documentation 

Reference
            /
            Root Events 

Events reference 
In this guide, we look at the list of events dispatched by the framework core and the official packages. Check out the  [link:/guides/digging-deeper/emitter] emitter documentation to learn more about its usage. 
http:request_completed 
The  [link:https://github.com/adonisjs/http-server/blob/8.x/src/types/server.ts#L65-L81] 
```
http:request_completed
```
event is dispatched after an HTTP request is completed. The event contains an instance of the  [link:/guides/basics/http-context] HttpContext and the request duration. The value is the output of the method. 

```
import emitter from '@adonisjs/core/services/emitter'
import string from '@adonisjs/core/helpers/string'

emitter.on('http:request_completed', (event) => {
  const method = event.ctx.request.method()
  const url = event.ctx.request.url(true)
  const duration = event.duration

  console.log(`${method} ${url}: ${string.prettyHrTime(duration)}`)
})
```

http:server_ready 
The event is dispatched once the AdonisJS HTTP server is ready to accept incoming requests. 

```
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

container_binding:resolved 
The event is dispatched after the IoC container resolves a binding or constructs a class instance. The property will be a string (binding name) or a class constructor, and the property is the resolved value. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('container_binding:resolved', (event) => {
  console.log(event.binding)
  console.log(event.value)
})
```

session:initiated 
The package emits the event when the session store is initiated during an HTTP request. The property is an instance of the  [link:https://github.com/adonisjs/session/blob/8.x/src/session.ts] Session class . 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session:initiated', (event) => {
  console.log(`Initiated store for ${event.session.sessionId}`)
})
```

session:committed 
The package emits the event when the session data is written to the session store during an HTTP request. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session:committed', (event) => {
  console.log(`Persisted data for ${event.session.sessionId}`)
})
```

session:migrated 
The package emits the event when a new session ID is generated using the method. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session:migrated', (event) => {
  console.log(`Migrating data to ${event.toSessionId}`)
  console.log(`Destroying session ${event.fromSessionId}`)
})
```

i18n:missing:translation 
The event is dispatched by the package when a translation for a specific key and locale is missing. You may listen to this event to find the missing translations for a given locale. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('i18n:missing:translation', function (event) {
  console.log(event.identifier)
  console.log(event.hasFallback)
  console.log(event.locale)
})
```

mail:sending 
The package emits the event before sending an email. In the case of the method call, the event will be emitted when the mail queue processes the job. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('mail:sending', (event) => {
  console.log(event.mailerName)
  console.log(event.message)
  console.log(event.views)
})
```

mail:sent 
After sending the email, the event is dispatched by the package. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('mail:sent', (event) => {
  console.log(event.response)

  console.log(event.mailerName)
  console.log(event.message)
  console.log(event.views)
})
```

mail:queueing 
The package emits the event before queueing the job to send the email. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('mail:queueing', (event) => {
  console.log(event.mailerName)
  console.log(event.message)
  console.log(event.views)
})
```

mail:queued 
After the email has been queued, the event is dispatched by the package. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('mail:queued', (event) => {
  console.log(event.mailerName)
  console.log(event.message)
  console.log(event.views)
})
```

queued:mail:error 
The event is dispatched when the  [link:https://github.com/adonisjs/mail/blob/10.x/src/messengers/memory_queue.ts] MemoryQueue implementation of the package is unable to send the email queued using the method. 
If you are using a custom queue implementation, you must capture the job errors and emit this event. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('queued:mail:error', (event) => {
  console.log(event.error)
  console.log(event.mailerName)
})
```

session_auth:login_attempted 
The event is dispatched by the  [link:https://github.com/adonisjs/auth/blob/10.x/modules/session_guard/guard.ts] SessionGuard implementation of the package when the method is called either directly or internally by the session guard. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session_auth:login_attempted', (event) => {
  console.log(event.guardName)
  console.log(event.user)
})
```

session_auth:login_succeeded 
The event is dispatched by the  [link:https://github.com/adonisjs/auth/blob/10.x/modules/session_guard/guard.ts] SessionGuard implementation of the package after a user has been logged in successfully. 
You may use this event to track sessions associated with a given user. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session_auth:login_succeeded', (event) => {
  console.log(event.guardName)
  console.log(event.sessionId)
  console.log(event.user)
  console.log(event.rememberMeToken) // (if created one)
})
```

session_auth:authentication_attempted 
The event is dispatched by the package when an attempt is made to validate the request session and check for a logged-in user. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session_auth:authentication_attempted', (event) => {
  console.log(event.guardName)
  console.log(event.sessionId)
})
```

session_auth:authentication_succeeded 
The event is dispatched by the package after the request session has been validated and the user is logged in. You may access the logged-in user using the property. 

```
import emitter from '@adonisjs/core/services/emitter'

emitter.on('session_auth:authentication_succeeded', (event) => {
  console.log(event.guardName)
  console.log(event.sessionId)

  console.log(event.user)
  console.log(event.rememberMeToken) // if authenticated using token
})
```

session_auth:authentication_failed 
The event is dispatched by the package when the authenticati

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/exceptions
Source: https://docs.adonisjs.com/reference/exceptions

Exceptions (Root) - AdonisJS Documentation 

Reference
            /
            Root Exceptions 

Exceptions reference 
In this guide we will go through the list of known exceptions raised by the framework core and the official packages. Some of the exceptions are marked as self-handled .  [link:/guides/basics/exception-handling#defining-the-handle-method] Self-handled exceptions can convert themselves to an HTTP response. 
E_ROUTE_NOT_FOUND 
The exception is raised when the HTTP server receives a request for a non-existing route. By default, the client will get a 404 response, and optionally, you may render an HTML page using  [link:/guides/basics/exception-handling#status-pages] status pages . 
Status code : 404 
Self handled : No 

```
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_ROUTE_NOT_FOUND) {
  // handle error
}
```

E_ROW_NOT_FOUND 
The exception is raised when the database query for finding one item fails e.g when using . By default, the client will get a 404 response, and optionally, you may render an HTML page using  [link:/guides/basics/exception-handling#status-pages] status pages . 
Status code : 404 
Self handled : No 

```
import { errors as lucidErrors } from '@adonisjs/lucid'
if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
  // handle error
  console.log(`${error.model?.name || 'Row'} not found`)
}
```

E_AUTHORIZATION_FAILURE 
The exception is raised when a bouncer authorization check fails. The exception is self-handled and  [link:/guides/auth/authorization#throwing-authorizationexception] uses content-negotiation to return an appropriate error response to the client. 
Status code : 403 
Self handled : Yes 
Translation identifier : 
```
errors.E_AUTHORIZATION_FAILURE
```

```
import { errors as bouncerErrors } from '@adonisjs/bouncer'
if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
}
```

E_TOO_MANY_REQUESTS 
The exception is raised by the  [link:/guides/security/rate-limiting] @adonisjs/rate-limiter package when a request exhausts all the requests allowed during a given duration. The exception is self-handled and  [link:/guides/security/rate-limiting#handling-throttleexception] uses content-negotiation to return an appropriate error response to the client. 
Status code : 429 
Self handled : Yes 
Translation identifier : 
```
errors.E_TOO_MANY_REQUESTS
```

```
import { errors as limiterErrors } from '@adonisjs/limiter'
if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
}
```

E_BAD_CSRF_TOKEN 
The exception is raised when a form using  [link:/guides/security/securing-ssr-applications#csrf-protection] CSRF protection is submitted without the CSRF token, or the CSRF token is invalid. 
Status code : 403 
Self handled : Yes 
Translation identifier : 
```
errors.E_BAD_CSRF_TOKEN
```

```
import { errors as shieldErrors } from '@adonisjs/shield'
if (error instanceof shieldErrors.E_BAD_CSRF_TOKEN) {
}
```

The exception is  [link:https://github.com/adonisjs/shield/blob/9.x/src/errors.ts#L23-L66] self-handled , and the user will be redirected back to the form, and you can access the error using the flash messages. 

```
@error('E_BAD_CSRF_TOKEN')
  <p>
    {{ message }}
  </p>
@end
```

E_OAUTH_MISSING_CODE 
The package raises the exception when the OAuth service does not provide the OAuth code during the redirect. 
You can avoid this exception if you  [link:/guides/auth/social-authentication#handling-callback-response] handle the errors before calling the or methods. 
Status code : 500 
Self handled : No 

```
import { errors as allyErrors } from '@adonisjs/ally'
if (error instanceof allyErrors.E_OAUTH_MISSING_CODE) {
}
```

E_OAUTH_STATE_MISMATCH 
The package raises the exception when the CSRF state defined during the redirect is missing. 
You can avoid this exception if you  [link:/guides/auth/social-authentication#handling-callback-response] handle the errors before calling the or methods. 
Status code : 400 
Self handled : No 

```
import { errors as allyErrors } from '@adonisjs/ally'
if (error instanceof allyErrors.E_OAUTH_STATE_MISMATCH) {
}
```

E_UNAUTHORIZED_ACCESS 
The exception is raised when one of the authentication guards is not able to authenticate the request. The exception is self-handled and uses  [link:/guides/auth/session-guard#handling-authentication-exception] content-negotiation to return an appropriate error response to the client. 
Status code : 401 
Self handled : Yes 
Translation identifier : 
```
errors.E_UNAUTHORIZED_ACCESS
```

```
import { errors as authErrors } from '@adonisjs/auth'
if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
}
```

E_INVALID_CREDENTIALS 
The exception is raised when the auth finder is not able to verify the user credentials. The exception is handled and use  [link:/guides/auth/verifying-user-credentials#handling-exceptions] content-negotiation to return an appropriate error response to the client. 
Status code : 400 
Self handled : Yes 
Translation identifier : 
```
errors.E_INVALID_CREDENTIALS
```

```
import { errors as authErrors } from '@adonisjs/auth'
if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
}
```

E_CANNOT_LOOKUP_ROUTE 
The exception is raised when you attempt to create a URL for a route using the  [link:/guides/basics/routing#url-builder] URL builder . 
Status code : 500 
Self handled : No 

```
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_CANNOT_LOOKUP_ROUTE) {
  // handle error
}
```

E_HTTP_EXCEPTION 
The is a generic exception for throwing errors during an HTTP request. You can use this exception directly or create a custom exception extending it. 
Status code : Defined at the time of raising the exception 
Self handled : Yes 

```
// title: Throw exception
import { errors } from '@adonisjs/core'

throw errors.E_HTTP_EXCEPTION.invoke(
  {
    errors: ['Cannot process request'],
  },
  422
)
```

```
// title: Handle exception
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_HTTP_EXCEPTION) {
  // handle error
}
```

E_HTTP_REQUEST_ABORTED 
The 
```
E_HTTP_REQUEST_ABORTED
```
is a sub-class of the exception. This exception is raised by the  [link:/guides/basics/response#aborting-request-with-an-error] response.abort method. 

```
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_HTTP_REQUEST_ABORTED) {
  // handle error
}
```

E_INSECURE_APP_KEY 
The exception is raised when the length of is smaller than 16 characters. You can use the  [link:/reference/commands#generatekey] generate:key ace command to generate a secure app key. 
Status code : 500 
Self handled : No 

```
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_INSECURE_APP_KEY) {
  // handle error
}
```

E_MISSING_APP_KEY 
The exception is raised when the property is not defined inside the file. By default, the value of the is set using the environment variable. 
Status code : 500 
Self handled : No 

```
import { errors } from '@adonisjs/core'
if (error instanceof error

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/helpers
Source: https://docs.adonisjs.com/reference/helpers

Helpers (Root) - AdonisJS Documentation 

Reference
            /
            Root Helpers 

Helpers reference 
AdonisJS bundles its utilities into the module and makes them available to your application code. Since these utilities are already installed and used by the framework, the module does not add any additional bloat to your . 
The helper methods are exported from the following modules. 

```
import is from '@adonisjs/core/helpers/is'
import * as helpers from '@adonisjs/core/helpers'
import string from '@adonisjs/core/helpers/string'
```

escapeHTML 
Escape HTML entities in a string value. Under the hood, we use the  [link:https://www.npmjs.com/package/he#heescapetext] he package. 

```
import string from '@adonisjs/core/helpers/string'

string.escapeHTML('<p> foo © bar </p>')
// <p> foo © bar </p>
```

Optionally, you can encode non-ASCII symbols using the option. 

```
import string from '@adonisjs/core/helpers/string'

string.escapeHTML('<p> foo © bar </p>', {
  encodeSymbols: true,
})
// <p> foo © bar </p>
```

encodeSymbols 
You may encode non-ASCII symbols in a string value using the helper. Under the hood, we use  [link:https://www.npmjs.com/package/he#heencodetext-options] he.encode method. 

```
import string from '@adonisjs/core/helpers/string'

string.encodeSymbols('foo © bar ≠ baz 𝌆 qux')
// 'foo © bar ≠ baz 𝌆 qux'
```

prettyHrTime 
Pretty print the diff of  [link:https://nodejs.org/api/process.html#processhrtimetime] process.hrtime method. 

```
import { hrtime } from 'node:process'
import string from '@adonisjs/core/helpers/string'

const startTime = hrtime()
await someOperation()
const endTime = hrtime(startTime)

console.log(string.prettyHrTime(endTime))
```

isEmpty 
Check if a string value is empty. 

```
import string from '@adonisjs/core/helpers/string'

string.isEmpty('') // true
string.isEmpty('      ') // true
```

truncate 
Truncate a string at a given number of characters. 

```
import string from '@adonisjs/core/helpers/string'

string.truncate('This is a very long, maybe not that long title', 12)
// Output: This is a ve...
```

By default, the string is truncated exactly at the given index. However, you can instruct the method to wait for the words to complete. 

```
string.truncate('This is a very long, maybe not that long title', 12, {
  completeWords: true,
})
// Output: This is a very...
```

You can customize the suffix using the option. 

```
string.truncate('This is a very long, maybe not that long title', 12, {
  completeWords: true,
  suffix: '... <a href="/1"> Read more </a>',
})
// Output: This is a very... <a href="/1"> Read more </a>
```

excerpt 
The method is identical to the method. However, it strips the HTML tags from the string. 

```
import string from '@adonisjs/core/helpers/string'

string.excerpt('<p>This is a <strong>very long</strong>, maybe not that long title</p>', 12, {
  completeWords: true,
})
// Output: This is a very...
```

slug 
Generate slug for a string value. The method is exported from the  [link:https://www.npmjs.com/package/slugify] slugify package ; therefore, consult its documentation for available options. 

```
import string from '@adonisjs/core/helpers/string'

console.log(string.slug('hello ♥ world'))
// hello-love-world
```

You can add custom replacements for Unicode values as follows. 

```
string.slug.extend({ '☢': 'radioactive' })

console.log(string.slug('unicode ♥ is ☢'))
// unicode-love-is-radioactive
```

interpolate 
Interpolate variables inside a string. The variables must be inside double curly braces. 

```
import string from '@adonisjs/core/helpers/string'

string.interpolate('hello {{ user.username }}', {
  user: {
    username: 'virk'
  }
})
// hello virk
```

Curly braces can be escaped using the prefix. 

```
string.interpolate('hello \\{{ users.0 }}', {})
// hello {{ users.0 }}
```

plural 
Convert a word to its plural form. The method is exported from the  [link:https://www.npmjs.com/package/pluralize] pluralize package . 

```
import string from '@adonisjs/core/helpers/string'

string.plural('test')
// tests
```

isPlural 
Find if a word already is in plural form. 

```
import string from '@adonisjs/core/helpers/string'

string.isPlural('tests') // true
```

pluralize 
This method combines the and the methods and uses one or the other based on the count. For example: 

```
import string from '@adonisjs/core/helpers/string'

string.pluralize('box', 1) // box
string.pluralize('box', 2) // boxes
string.pluralize('box', 0) // boxes

string.pluralize('boxes', 1) // box
string.pluralize('boxes', 2) // boxes
string.pluralize('boxes', 0) // boxes
```

The property exports  [link:https://www.npmjs.com/package/pluralize] additional methods to register custom uncountable, irregular, plural, and singular rules. 

```
import string from '@adonisjs/core/helpers/string'

string.pluralize.addUncountableRule('paper')
string.pluralize.addSingularRule(/singles$/i, 'singular')
```

singular 
Convert a word to its singular form. The method is exported from the  [link:https://www.npmjs.com/package/pluralize] pluralize package . 

```
import string from '@adonisjs/core/helpers/string'

string.singular('tests')
// test
```

isSingular 
Find if a word is already in a singular form. 

```
import string from '@adonisjs/core/helpers/string'

string.isSingular('test') // true
```

camelCase 
Convert a string value to camelcase. 

```
import string from '@adonisjs/core/helpers/string'

string.camelCase('user_name') // userName
```

Following are some of the conversion examples. 
Input Output 
'test' 'test' 
'test string' 'testString' 
'Test String' 'testString' 
'TestV2' 'testV2' 
' foo_bar ' 'fooBar' 
'version 1.2.10' 'version1210' 
'version 1.21.0' 'version1210' 

capitalCase 
Convert a string value to a capital case. 

```
import string from '@adonisjs/core/helpers/string'

string.capitalCase('helloWorld') // Hello World
```

Following are some of the conversion examples. 
Input Output 
'test' 'Test' 
'test string' 'Test String' 
'Test String' 'Test String' 
'TestV2' 'Test V 2' 
'version 1.2.10' 'Version 1.2.10' 
'version 1.21.0' 'Version 1.21.0' 

dashCase 
Convert a string value to a dash case. 

```
import string from '@adonisjs/core/helpers/string'

string.dashCase('helloWorld') // hello-world
```

Optionally, you can capitalize the first letter of each word. 

```
string.dashCase('helloWorld', { capitalize: true }) // Hello-World
```

Following are some of the conversion examples. 
Input Output 
'test' 'test' 
'test string' 'test-string' 
'Test String' 'test-string' 
'Test V2' 'test-v2' 
'TestV2' 'test-v-2' 
'version 1.2.10' 'version-1210' 
'version 1.21.0' 'version-1210' 

dotCase 
Convert a string value to a dot case. 

```
import string from '@adonisjs/core/helpers/string'

string.dotCase('helloWorld') // hello.World
```

Optionally, you can convert the first letter of all the words to lowercase. 

```
string.dotCase('helloWorld', { lowerCase: true }) // hello.world
```

Following are s

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### reference/types-helpers
Source: https://docs.adonisjs.com/reference/types-helpers

Types helpers (Root) - AdonisJS Documentation 

Reference
            /
            Root Types helpers 

Types helpers 
InferRouteParams 
Infer params of a route pattern. The params must be defined as per the AdonisJS routing syntax. 

```
import type { InferRouteParams } from '@adonisjs/core/helpers/types'

InferRouteParams<'/users'> // {}
InferRouteParams<'/users/:id'> // { id: string }
InferRouteParams<'/users/:id?'> // { id?: string }
InferRouteParams<'/users/:id/:slug?'> // { id: string; slug?: string }
InferRouteParams<'/users/:id.json'> // { id: string }
InferRouteParams<'/users/*'> // { '*': string[] }
InferRouteParams<'/posts/:category/*'> // { 'category': string; '*': string[] }
```

Prettify 
Prettifies the complex TypeScript types to a simplified type for a better viewing experience. For example: 

```
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

Primitive 
Union of primitive types. It includes 
```
null | undefined | string | number | boolean | symbol | bigint
```

```
import type { Primitive } from '@adonisjs/core/helpers/types'

function serialize(
  values:
    | Primitive
    | Record<string, Primitive | Primitive[]>
    | Primitive[]
    | Record<string, Primitive | Primitive[]>[]
) {}
```

OneOrMore 
Specify a union that accepts either or . 

```
import type { OneOrMore } from '@adonisjs/core/helpers/types'
import type { Primitive } from '@adonisjs/core/helpers/types'

function serialize(
  values: OneOrMore<Primitive> | OneOrMore<Record<string, Primitive | Primitive[]>>
) {}
```

Constructor<T, Arguments> 
Represent a class constructor. The refers to the class instance properties, and refers to the constructor arguments. 

```
import type { Constructor } from '@adonisjs/core/helpers/types'

function make<Args extends any[]>(Klass: Constructor<any, Args>, ...args: Args) {
  return new Klass(...args)
}
```

AbstractConstructor<T, Arguments> 
Represent a class constructor that could also be abstract. The refers to the class instance properties, and refers to the constructor arguments. 

```
import type { AbstractConstructor } from '@adonisjs/core/helpers/types'
function log<Args extends any[]>(Klass: AbstractConstructor<any, Args>, ...args: Args) {}
```

LazyImport 
Represent a function that lazily imports a module with . 

```
import type { LazyImport, Constructor } from '@adonisjs/core/helpers/types'

function middleware(list: LazyImport<Constructor<{ handle(): any }>>[]) {}
```

UnWrapLazyImport 
Unwrap the default export of a function. 

```
import type { LazyImport, UnWrapLazyImport } from '@adonisjs/core/helpers/types'

type Middleware = LazyImport<Constructor<{ handle(): any }>>
type MiddlewareClass = UnWrapLazyImport<Middleware>
```

NormalizeConstructor 
Normalizes the constructor arguments of a class for use with mixins. The helper is created to work around  [link:https://github.com/microsoft/TypeScript/issues/37142] TypeScript issue#37142 . 

```
// title: Usage without NormalizeConstructor
class Base {}

function DatesMixin<TBase extends typeof Base>(superclass: TBase) {
  // A mixin class must have a constructor with a single rest parameter of type 'any[]'. ts(2545)
  return class HasDates extends superclass {
    //          ❌ ^^
    declare createdAt: Date
    declare updatedAt: Date
  }
}

// Base constructors must all have the same return type.ts(2510)
class User extends DatesMixin(Base) {}
//                    ❌ ^^
```

```
// title: Using NormalizeConstructor
import type { NormalizeConstructor } from '@adonisjs/core/helpers/types'

class Base {}

function DatesMixin<TBase extends NormalizeConstructor<typeof Base>>(superclass: TBase) {
  return class HasDates extends superclass {
    declare createdAt: Date
    declare updatedAt: Date
  }
}

class User extends DatesMixin(Base) {}
```

Opaque 
Define an opaque type to distinguish between similar properties. 

```
import type { Opaque } from '@adonisjs/core/helpers/types'

type Username = Opaque<string, 'username'>
type Password = Opaque<string, 'password'>

function checkUser(_: Username) {}

// ❌ Argument of type 'string' is not assignable to parameter of type 'Opaque<string, "username">'.
checkUser('hello')

// ❌ Argument of type 'Opaque<string, "password">' is not assignable to parameter of type 'Opaque<string, "username">'.
checkUser('hello' as Password)

checkUser('hello' as Username)
```

UnwrapOpaque 
Unwrap the value from an opaque type. 

```
import type { Opaque, UnwrapOpaque } from '@adonisjs/core/helpers/types'

type Username = Opaque<string, 'username'>
type Password = Opaque<string, 'password'>

type UsernameValue = UnwrapOpaque<Username> // string
type PasswordValue = UnwrapOpaque<Password> // string
```

ExtractFunctions<T, IgnoreList> 
Extract all the functions from an object. Optionally specify a list of methods to ignore. 

```
import type { ExtractFunctions } from '@adonisjs/core/helpers/types'

class User {
  declare id: number
  declare username: string

  create() {}
  update(_id: number, __attributes: any) {}
}

type UserMethods = ExtractFunctions<User> // 'create' | 'update'
```

You may use the to ignore methods from a known parent class 

```
import type { ExtractFunctions } from '@adonisjs/core/helpers/types'

class Base {
  save() {}
}

class User extends Base {
  declare id: number
  declare username: string

  create() {}
  update(_id: number, __attributes: any) {}
}

type UserMethods = ExtractFunctions<User> // 'create' | 'update'
type UserMethodsWithParent = ExtractFunctions<User, ExtractFunctions<Base>> // 'create' | 'update'
```

AreAllOptional 
Check if all the top-level properties of an object are optional. 

```
import type { AreAllOptional } from '@adonisjs/core/helpers/types'

AreAllOptional<{ id: string; name?: string }> // false
AreAllOptional<{ id?: string; name?: string }> // true
```

ExtractUndefined 
Extract properties that are or are a union with values. 

```
import type { ExtractUndefined } from '@adonisjs/core/helpers/types'

type UndefinedProperties = ExtractUndefined<{ id: string; name: string | undefined }>
```

ExtractDefined 
Extract properties that are not nor is a union with values. 

```
import type { ExtractDefined } from '@adonisjs/core/helpers/types'

type UndefinedProperties = ExtractDefined<{ id: string; name: string | undefined }>
```

AsyncOrSync 
Define a union with the value or a of the value. 

```
import type { AsyncOrSync } from '@adonisjs/core

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
