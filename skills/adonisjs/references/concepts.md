# Concepts — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/concepts/application-lifecycle](https://docs.adonisjs.com/guides/concepts/application-lifecycle)
- [guides/concepts/assembler-hooks](https://docs.adonisjs.com/guides/concepts/assembler-hooks)
- [guides/concepts/barrel-files](https://docs.adonisjs.com/guides/concepts/barrel-files)
- [guides/concepts/container-services](https://docs.adonisjs.com/guides/concepts/container-services)
- [guides/concepts/dependency-injection](https://docs.adonisjs.com/guides/concepts/dependency-injection)
- [guides/concepts/extending-adonisjs](https://docs.adonisjs.com/guides/concepts/extending-adonisjs)
- [guides/concepts/scaffolding](https://docs.adonisjs.com/guides/concepts/scaffolding)
- [guides/concepts/service-providers](https://docs.adonisjs.com/guides/concepts/service-providers)

## Condensed excerpts (prefer live docs if conflict)

### guides/concepts/application-lifecycle
Source: https://docs.adonisjs.com/guides/concepts/application-lifecycle

Application lifecycle (Core Concepts) - AdonisJS Documentation 

Concepts Application lifecycle 

Application Lifecycle 
This guide covers the application lifecycle in AdonisJS. You will learn: 
The three lifecycle phases (boot, start, and termination) 
When each phase executes and what happens during it 
How to hook into phases using service providers and preload files 
Overview 
The application lifecycle in AdonisJS consists of three distinct phases: boot , start , and termination . Each phase serves a specific purpose in preparing your application, running it, and gracefully shutting it down. 
Understanding the lifecycle is essential when you need to execute code at specific points during your application's runtime. For example, you might want to register custom validation rules before your application starts handling requests, or perform cleanup operations before your application terminates. 
The lifecycle flows chronologically from boot to start, and eventually to termination when the process receives a shutdown signal. Each phase has clearly defined responsibilities and happens in a predictable order, allowing you to hook into the exact moment you need. 
Boot phase 
The boot phase is the initial stage where AdonisJS prepares your application for execution. During this phase, you can use the IoC container to fetch bindings and extend parts of the framework. 
Service providers register their bindings into the container and execute their methods. The framework itself is being configured, but your application isn't yet ready to handle requests or execute commands. 
The boot phase completes before any preload files are imported or application-specific code runs. Think of it as the foundation-laying phase where the framework assembles all the pieces it needs. 

Start phase 
The start phase is where your application comes to life. During this phase, AdonisJS imports preload files and executes the and methods from service providers. 
Application-specific initialization happens here. Routes are registered, event listeners are attached, and setup code runs. By the end of this phase, your application is fully operational and ready to handle HTTP requests, execute Ace commands, or run tests depending on the environment. 

The start phase is environment-aware, meaning you can configure different behavior for the HTTP server, Ace commands, or test environments. All preload files configured for the current environment are imported in parallel for optimal performance. 
Termination phase 
The termination phase happens when AdonisJS begins graceful shutdown. This usually occurs when the process receives the signal, such as when you stop your development server or during a deployment. 
During this phase, service providers execute their methods, allowing them to perform cleanup operations like closing database connections, flushing logs, or canceling pending background jobs. 

Graceful shutdown ensures your application stops cleanly rather than abruptly terminating mid-operation, helping prevent data corruption. 
Hooking into lifecycle phases 
You can hook into different phases of the application lifecycle using service providers and preload files. Service providers offer lifecycle methods ( , , , and ) that execute at specific points, while preload files run during the start phase. 
Hooking into the boot phase 
Use the method in a service provider to execute code during the boot phase. This is where you should extend the framework or configure services that other parts of your application depend on. 
The following example extends VineJS with a custom phoneNumber validation rule. This rule will be available throughout your application. 
providers/app_provider.ts 

```
import { VineString } from '@vinejs/vine'
import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    VineString.macro('phoneNumber', function (this: VineString) {
      return this.use((value, field) => {
        if (typeof value !== 'string') {
          return
        }

        if (!/^\d{10}$/.test(value)) {
          field.report('The {{ field }} must be a valid 10-digit phone number', field)
        }
      })
    })
  }
}
```

Hooking into the start phase 
You can hook into the start phase using either service provider methods or preload files. Service providers offer and methods, while preload files provide a simpler approach for application-specific initialization. 
Using service provider methods 
The method executes after the boot phase completes but before the application is ready. The method executes once the application is fully started and ready to handle requests or commands. 
providers/app_provider.ts 

```
import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async start() {
    const database = await this.app.container.make('lucid.db')
    
    /**
     * Verify database connection is working
     */
    await database.connection().select(1)
  }

  async ready() {
    if (this.app.getEnvironment() === 'web') {
      const logger = await this.app.container.make('logger')
      logger.info('HTTP server is ready to accept requests')
    }
  }
}
```

Using preload files 
Preload files offer a simpler way to run code during the start phase without creating a service provider. They're ideal for application-specific initialization like registering routes, attaching event listeners, or configuring middleware. 
Create a preload file using the command. 

```
node ace make:preload events
```

This command creates a new file in the directory and automatically registers it in your configuration file. 
start/events.ts 

```
import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

emitter.on('user:registered', function (user) {
  logger.info({ userId: user.id }, 'New user registered')
})

emitter.on('order:placed', function (order) {
  logger.info({ orderId: order.id }, 'New order placed')
})
```

You can configure preload files to load only in specific runtime environments. 
adonisrc.ts 

```
{
  preloads: [
    () => import('#start/routes'),
    () => import('#start/kernel'),
    {
      file: () => import('#start/events'),
      environment: ['web', 'console']
    }
  ]
}
```

The property accepts an array of values: (HTTP server), (Ace commands), (test runner), and (REPL environment). 
Hooking into the termination phase 
Use the method in a service provider to execute cleanup operations during graceful shutdown. This ensures resources are properly released before your application terminates. 
providers/app_provider.ts 

```
import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async shutdown() {
    const redis = await this.app.container.make('redis')
   

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/assembler-hooks
Source: https://docs.adonisjs.com/guides/concepts/assembler-hooks

Assembler hooks (Core Concepts) - AdonisJS Documentation 

Concepts Assembler hooks 

Assembler hooks 
This guide covers Assembler hooks in AdonisJS. You will learn how to: 
Register hooks to respond to lifecycle events during development, testing, and builds 
React to file changes in watch mode 
Hook into the routes scanning pipeline 
Generate barrel files and type declarations using the IndexGenerator 
Create custom code generation workflows 
Overview 
Assembler is the build tooling layer of AdonisJS that manages your application as a child process. It handles starting the development server, running tests, and creating production builds. Hooks let you tap into this lifecycle to run custom actions at specific moments, such as generating barrel files when controllers change, creating type declarations when routes are scanned, or displaying custom information when the server starts. 
Because Assembler runs in a separate process from your AdonisJS application, hooks do not have access to framework features like the IoC container, router service, or database connections. Instead, hooks receive purpose-built utilities like the for code generation and scanner instances for route analysis. 
Common use cases for Assembler hooks include generating barrel files for lazy-loading controllers, creating type-safe API clients from route metadata, running code generators when files change, and displaying custom startup information. 
Hooks reference 
The following table lists all available hooks, when they execute, and what parameters they receive. 
Hook Triggered by Description 
DevServer, TestRunner, Bundler First hook executed. Use for initialization tasks 
DevServer Before the child process starts 
DevServer After the child process is running 
TestRunner Before tests begin executing 
TestRunner After tests complete 
Bundler Before production build begins 
Bundler After production build completes 
DevServer, TestRunner When a file is modified in watch mode 
DevServer, TestRunner When a file is created 
DevServer, TestRunner When a file is deleted 
DevServer When routes are registered by the app 
DevServer Before route type scanning begins 
DevServer After route type scanning completes 

Creating and registering hooks 
Hooks are registered in the file under the property. Each hook accepts an array of lazy-loaded imports, allowing you to split hook logic into separate files and only load them when needed. 
adonisrc.ts 

```
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  hooks: {
    devServerStarted: [() => import('./hooks/on_server_started.ts')],
    fileChanged: [() => import('./hooks/on_file_changed.ts')],
  },
})
```

The hook file must export a default function that receives the hook's parameters. Each hook has a typed helper available from that provides full TypeScript support for the parameters. 
hooks/on_server_started.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.devServerStarted((devServer, info, instructions) => {
  /**
   * info.host - The host address the server is bound to
   * info.port - The port number the server is running on
   * instructions - UI helper for displaying formatted output
   */
  console.log(`Server running at http://${info.host}:${info.port}`)
})
```

You can register multiple hooks for the same event. They execute in the order they are registered. 
adonisrc.ts 

```
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  hooks: {
    devServerStarted: [
      () => import('./hooks/log_server_info.ts'),
      () => import('./hooks/notify_external_service.ts'),
    ],
  },
})
```

Warning 
Assembler hooks run in a separate process from your AdonisJS application. They do not have access to the IoC container, router, database, or any other framework services. If you need to interact with your application, use the routes scanning hooks to extract metadata or communicate via HTTP/IPC. 

Init hook 
The hook is the first hook executed when Assembler starts any operation. It receives the parent instance (DevServer, TestRunner, or Bundler), a hooks manager for registering additional runtime hooks, and the IndexGenerator for code generation tasks. 
hooks/init.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.init((parent, hooksManager, indexGenerator) => {
  /**
   * Determine what operation is running by checking the parent type.
   * Use indexGenerator to set up barrel file or type generation.
   */
  console.log('Assembler initialized')
})
```

The hook is the recommended place to configure the IndexGenerator for barrel file and type generation, as it runs before any other operations begin. 
Dev server hooks 
The dev server hooks execute when starting and running the development server. The hook fires before the child process launches, and fires once the server is accepting connections. 
hooks/on_dev_server_starting.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.devServerStarting((devServer) => {
  /**
   * Perform setup tasks before the server starts.
   * The child process has not been spawned yet.
   */
  console.log('Preparing to start dev server...')
})
```

hooks/on_dev_server_started.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.devServerStarted((devServer, info, instructions) => {
  /**
   * The server is now running and accepting connections.
   * Use instructions to add custom UI output.
   */
  instructions.add('custom', `API docs: http://${info.host}:${info.port}/docs`)
})
```

These hooks re-trigger every time the child process restarts, such as when a full reload occurs due to file changes. 
Test runner hooks 
The test runner hooks execute before and after running your test suite. Use to set up test fixtures or databases, and to generate reports or clean up resources. 
hooks/on_tests_starting.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.testsStarting((testRunner) => {
  console.log('Preparing test environment...')
})
```

hooks/on_tests_finished.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.testsFinished((testRunner) => {
  console.log('Tests complete, generating coverage report...')
})
```

When running tests in watch mode, these hooks re-trigger each time the test suite re-runs. 
Bundler hooks 
The bundler hooks execute when creating a production build with . Use for pre-build tasks like asset optimization, and to display build statistics or run post-build scripts. 
hooks/on_build_starting.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.buildStarting((bundler) => {
  console.log('Starting production build...')
})
```

hooks/on_build_finished.ts 

```
import { hooks } from '@adonisjs/core/app'

export default hooks.buildFinished((bundler, instructions) => {
  instructions.add('deploy', 'Run `npm run start` in the build folder to start the server')
})
```

Watcher hooks 
The watcher hooks fire

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/barrel-files
Source: https://docs.adonisjs.com/guides/concepts/barrel-files

Barrel files (Core Concepts) - AdonisJS Documentation 

Concepts Barrel files 

Barrel Files 
This guide covers barrel files in AdonisJS and how they reduce import clutter in your codebase. You will learn about: 
What barrel files are and where they're stored 
Why they exist (reducing import clutter) 
How auto-generation works 
How to disable them if needed 
Overview 
A barrel file is an auto-generated collection of exports for a specific entity type in your application. AdonisJS creates barrel files for controllers, bouncer policies, events, and event listeners, storing them in the directory. 
Barrel files are completely optional. You can continue using direct imports if you prefer, and disable barrel file generation entirely through configuration. 
The problem: Import clutter 
As your application grows, files like accumulate dozens of controller imports. 
In the following example, with just four controllers, the imports already consume significant vertical space. In production applications with 20+ controllers, you spend more time scrolling past imports than working with routes. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'

const NewAccountController = () => import('#controllers/new_account_controller')
const SessionController = () => import('#controllers/session_controller')
const PostsController = () => import('#controllers/posts_controller')
const PostCommentsController = () => import('#controllers/post_comments_controller')

router.get('signup', [NewAccountController, 'create'])
router.post('signup', [NewAccountController, 'store'])
router.get('login', [SessionController, 'create'])
router.post('login', [SessionController, 'store'])
router.get('posts', [PostsController, 'index'])
router.get('posts/:id', [PostsController, 'show'])
router.get('posts/:id/comments', [PostCommentsController, 'index'])
```

The solution: Barrel files 
Barrel files consolidate all those individual imports into a single import statement. Here's the same routes file using the controllers barrel file: 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('signup', [controllers.NewAccount, 'create'])
router.post('signup', [controllers.NewAccount, 'store'])
router.get('login', [controllers.Session, 'create'])
router.post('login', [controllers.Session, 'store'])
router.get('posts', [controllers.Posts, 'index'])
router.get('posts/:id', [controllers.Posts, 'show'])
router.get('posts/:id/comments', [controllers.PostComments, 'index'])
```

The difference is immediately visible. Four imports become one, and your routes are right at the top of the file where you need them. The only change to your route definitions is using the namespace to access each controller. 
How barrel files work 
The barrel file itself is remarkably simple. It's just a JavaScript object mapping controller names to lazy import functions. Here's what 
```
.adonisjs/server/controllers.ts
```
looks like: 
.adonisjs/server/controllers.ts 

```
export const controllers = {
  NewAccount: () => import('#controllers/new_account_controller'),
  Session: () => import('#controllers/session_controller'),
  Posts: () => import('#controllers/posts_controller'),
  PostComments: () => import('#controllers/post_comments_controller')
}
```

The dev server generates this file automatically when you run . As you create or delete controllers during development, the dev server's watcher updates the barrel file to stay in sync with your codebase. 
File locations and import aliases 
Barrel files are organized in the directory with corresponding import aliases: 
Barrel File Import Path Purpose 

```
#generated/controllers
```
Controller exports 
Bouncer policies exports 
Event exports 
Event listener exports 

The directory is registered as a subpath import alias in your , allowing you to use the prefix. 

```
import { controllers } from '#generated/controllers'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'
```

Note 
The directory contains auto-generated files managed by the framework. You should not manually edit files in this directory, as your changes will be overwritten when the dev server regenerates them. 

Tip 
You should commit the directory to version control. These files are required for TypeScript to resolve imports like 
```
#generated/controllers
```
, and without them your production builds and CI pipelines will fail. 

Performance and lazy loading 
You might wonder if importing all controllers at once hurts performance. The answer is no, because barrel files use lazy imports . 
Each controller in the barrel file is wrapped in a function that returns a dynamic import. 

```
{
  Posts: () => import('#controllers/posts_controller')
}
```

The function is only called when you actually use that controller in a route. Until then, the controller module is never loaded. This means barrel files have zero performance impact. Controllers are still loaded on-demand, exactly as they would be with direct imports. 
Disabling barrel files 
If you prefer not to use barrel files, you can disable their generation through the configuration file. The generation is managed using the assembler hook. 
adonisrc.ts 

```
import { indexEntities } from '@adonisjs/core'
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  // ...other config
  
  hooks: {
    init: [
      indexEntities({
        controllers: {
          enabled: false,
        },
        events: {
          enabled: false,
        },
        listeners: {
          enabled: false,
        }
      })
    ]
  }
})
```

After disabling barrel file generation, existing barrel files will remain in the directory. You'll need to manually remove them and update any code that references them to use direct imports instead. 

 [link:/guides/concepts/container-services] Previous  [link:/guides/concepts/assembler-hooks] Assembler hooks Learn how to use Assembler hooks to run custom actions during the development, testing, and build lifecycle of your AdonisJS application. 

Next

---

### guides/concepts/container-services
Source: https://docs.adonisjs.com/guides/concepts/container-services

Container services (Core Concepts) - AdonisJS Documentation 

Concepts Container services 

Container Services 
This guide covers container services in AdonisJS. You will learn: 
What container services are and how they work 
How to use existing services in your application 
When to use services versus dependency injection 
How to create your own services for packages 
Overview 
Container services are a convenience pattern in AdonisJS that simplifies how you access framework functionality. When you need to use features like routing, hashing, or logging, you can import a ready-to-use instance instead of manually constructing classes or interacting with the IoC container directly. 
This pattern exists because many framework components require dependencies that the IoC container already knows how to provide. Rather than making you resolve these dependencies yourself in every file, AdonisJS packages expose pre-configured instances as standard ES module exports. You import them like any other module, and they work immediately. 
Understanding container services 
Without container services, you have two options for using framework classes. You could import a class and construct it yourself, manually providing all its dependencies. 
Manual construction 

```
import { Router } from '@adonisjs/core/http'

export const router = new Router(/** Router dependencies */)
```

Alternatively, you could use the IoC container's method to construct the class, letting the container handle dependency resolution. 
Using app.make() 

```
import app from '@adonisjs/core/services/app'
import { Router } from '@adonisjs/core/http'

export const router = await app.make(Router)
```

Container services eliminate this ceremony by doing exactly what the second approach does, but packaging it as a convenient import. The service module uses the IoC container internally and exports the resolved instance. 
Using a container service 

```
import router from '@adonisjs/core/services/router'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
```

When you import a service, you're getting a singleton instance that was constructed by the IoC container with all its dependencies properly injected. The service itself is just a thin wrapper that makes this instance available as a standard module export. 
Using container services 
Container services are available automatically when you install AdonisJS packages. No configuration or registration is required. You simply import the service and use it. 
Here's an example using the Drive service to upload a file to S3. 
app/controllers/posts_controller.ts 

```
import drive from '@adonisjs/drive/services/main'

export class PostsController {
  async store(post: Post, coverImage: File) {
    const coverImageName = 'random_name.jpg'

    /**
     * The drive service gives you direct access to the
     * DriveManager instance. Use it to select a disk
     * and perform file operations.
     */
    const disk = drive.use('s3')
    await disk.put(coverImageName, coverImage)
    
    post.coverImage = coverImageName
    await post.save()
  }
}
```

This approach is straightforward and requires no setup beyond importing the service. The Drive service is a singleton, so the same instance is shared across your entire application. 
Using dependency injection instead 
For applications that prefer dependency injection, you can inject the underlying class directly into your services or controllers. This approach makes your code more testable since dependencies can be easily mocked or stubbed. 
Here's the same file upload functionality using constructor injection. 
app/services/post_service.ts 

```
import { Disk } from '@adonisjs/drive'
import { inject } from '@adonisjs/core'

@inject()
export class PostService {
  /**
   * The Disk instance is injected by the IoC container.
   * This makes it easy to swap implementations during
   * testing or use different disk configurations.
   */
  constructor(protected disk: Disk) {
  }

  async save(post: Post, coverImage: File) {
    const coverImageName = 'random_name.jpg'

    await this.disk.put(coverImageName, coverImage)
    
    post.coverImage = coverImageName
    await post.save()
  }
}
```

With dependency injection, the IoC container automatically resolves and injects the Disk instance. Your class declares what it needs, and the container provides it. This pattern is particularly valuable when writing business logic that needs to remain decoupled from framework specifics. 
Available services 
AdonisJS core and official packages expose the following container services. Each service corresponds to a container binding and provides access to the fully constructed class instance. 
Binding Class Service 
 [link:https://github.com/adonisjs/application/blob/9.x/src/application.ts] Application 
```
@adonisjs/core/services/app
```

 [link:https://github.com/adonisjs/core/blob/main/modules/ace/kernel.ts] Kernel 
```
@adonisjs/core/services/kernel
```

 [link:https://github.com/adonisjs/config/blob/6.x/src/config.ts] Config 
```
@adonisjs/core/services/config
```

 [link:https://github.com/boringnode/encryption/blob/1.x/src/encryption.ts] Encryption 
```
@adonisjs/core/services/encryption
```

 [link:https://github.com/adonisjs/events/blob/10.x/src/emitter.ts] Emitter 
```
@adonisjs/core/services/emitter
```

 [link:https://github.com/adonisjs/hash/blob/10.x/src/hash_manager.ts] HashManager 
```
@adonisjs/core/services/hash
```

 [link:https://github.com/adonisjs/logger/blob/7.x/src/logger_manager.ts] LoggerManager 
```
@adonisjs/core/services/logger
```

 [link:https://github.com/adonisjs/repl/blob/main/src/repl.ts] Repl 
```
@adonisjs/core/services/repl
```

 [link:https://github.com/adonisjs/http-server/blob/8.x/src/router/main.ts] Router 
```
@adonisjs/core/services/router
```

 [link:https://github.com/adonisjs/http-server/blob/8.x/src/server/main.ts] Server 
```
@adonisjs/core/services/server
```

 [link:https://github.com/adonisjs/core/blob/main/src/test_utils/main.ts] TestUtils 
```
@adonisjs/core/services/test_utils
```

Creating your own services 
If you're building a package or want to expose your own container bindings as services, you can follow the same pattern that AdonisJS uses internally. A container service is simply a module that resolves a binding from the container and exports it. 
You can view the  [link:https://github.com/adonisjs/drive/blob/4.x/services/main.ts#L19-L21] complete implementation on GitHub to see how the Drive package creates its service. 
Example service structure 

```
import app from '@adonisjs/core/services/app'

let drive: DriveManager

await app.booted(async () => {
  drive = await app.container.make('drive')
})

export { drive as default }
```

The service waits for the application to boot, then resolves the binding from the container and exports it. This ensures all service providers have registered their bindings before the service attempts to resol

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/dependency-injection
Source: https://docs.adonisjs.com/guides/concepts/dependency-injection

Dependency injection (Core Concepts) - AdonisJS Documentation 

Concepts Dependency injection 

Dependency injection and the IoC container 
This guide covers dependency injection and the IoC container in AdonisJS. You will learn: 
How to use the decorator for automatic dependency resolution 
The difference between constructor and method injection 
When and how to use the IoC container manually 
How to register bindings and singletons for complex dependencies 
How to implement the adapter pattern using abstract classes 
How to swap dependencies during testing 
Overview 
Dependency injection is a design pattern that eliminates the need to manually create and manage class dependencies. Instead of creating dependencies inside a class, you declare them as constructor parameters or method parameters, and the IoC container resolves them automatically. 
AdonisJS includes a powerful IoC (Inversion of Control) container that handles dependency injection throughout your application. When you type-hint a class as a dependency, the container automatically creates an instance of that class and injects it where needed. 
The IoC container is already integrated into core parts of AdonisJS including  [link:/guides/basics/controllers] controllers ,  [link:/guides/basics/middleware] middleware ,  [link:/guides/digging-deeper/emitter] event listeners , and  [link:/guides/ace/introduction] Ace commands . This means you can type-hint dependencies in these classes and they'll be resolved automatically when the framework constructs them. 
Note 
AdonisJS uses TypeScript's 
```
experimentalDecorators
```
and 
```
emitDecoratorMetadata
```
compiler options to enable dependency injection. These are pre-configured in the file of new AdonisJS projects. 

Your first dependency injection 
Let's start with a practical example. We'll create an that generates Gravatar URLs for users, then inject it into a controller. 
Create the service 
First, create a service class that will be injected. This service generates Gravatar avatar URLs based on user email addresses. 
app/services/avatar_service.ts 

```
import User from '#models/user'
import { createHash } from 'node:crypto'

export class AvatarService {
  protected getGravatarAvatar(user: User) {
    const emailHash = createHash('md5').update(user.email).digest('hex')
    const url = new URL(emailHash, 'https://gravatar.com/avatar/')

    url.searchParams.set('size', '200')
    return url.toString()
  }

  getAvatarFor(user: User) {
    return this.getGravatarAvatar(user)
  }
}
```

Inject the service into a controller 
Next, create a controller that uses the . The decorator tells the container to automatically resolve and inject the service. 
app/controllers/users_controller.ts 

```
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { AvatarService } from '#services/avatar_service'
import User from '#models/user'

@inject()
export default class UsersController {
  /**
   * The AvatarService is automatically injected by the container
   * when this controller is constructed
   */
  constructor(protected avatarService: AvatarService) {}

  async store({ request }: HttpContext) {
    /**
     * Create a new user (simplified for demonstration)
     */
    const user = await User.create(request.only(['email', 'username']))
    
    /**
     * Use the injected service to generate and save the avatar URL
     */
    const avatarUrl = this.avatarService.getAvatarFor(user)
    user.avatarUrl = avatarUrl
    await user.save()
    
    return user
  }
}
```

Register the route 
Finally, connect your controller to a route. When you visit this endpoint, AdonisJS automatically constructs the controller using the container. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.post('/users', [controllers.Users, 'store'])
```

The decorator is required on the controller class. Without it, the container won't know to resolve dependencies. The decorator uses TypeScript's reflection capabilities to detect constructor dependencies at runtime. 

Method injection 
Method injection works similarly to constructor injection, but instead of resolving dependencies for the entire class, the container resolves dependencies for a specific method. This is useful when only one method needs a particular dependency, or when you want to keep the class constructor simple. 
The decorator must be placed before the method when using method injection. 
app/controllers/users_controller.ts 

```
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { AvatarService } from '#services/avatar_service'
import User from '#models/user'

export default class UsersController {
  /**
   * The @inject decorator on the method tells the container
   * to resolve the avatarService parameter automatically
   */
  @inject()
  async store({ request }: HttpContext, avatarService: AvatarService) {
    const user = await User.create(request.only(['email', 'username']))
    
    /**
     * Use the injected service directly as a method parameter
     */
    const avatarUrl = avatarService.getAvatarFor(user)
    user.avatarUrl = avatarUrl
    await user.save()
    
    return user
  }
}
```

Notice that is always the first parameter for controller methods, followed by any dependencies you want to inject. The container automatically distinguishes between the HTTP context and injectable dependencies. 
What can be injected? 
You can type-hint and inject only classes inside other classes. Since TypeScript types and interfaces are removed at compile time and are not visible to the runtime code, there is no way for the container to resolve them. 
If a class has other dependencies like configuration objects that cannot be auto-resolved, you must register the class as a binding within the container. We'll cover bindings later in this guide . 
The import type pitfall 
A common issue that causes dependency injection to fail silently is when classes are accidentally imported using TypeScript's syntax. This happens frequently because code editors with auto-import features often default to importing classes as types. 
When you use , TypeScript strips the import entirely during compilation. The container has no class constructor to resolve at runtime, so your dependency becomes . 
Wrong: Imported as a type 

```
import { inject } from '@adonisjs/core'
import type { AvatarService } from '#services/avatar_service'

@inject()
export default class UsersController {
  constructor(protected avatarService: AvatarService) {}
}
```

Correct: Imported as a value 

```
import { inject } from '@adonisjs/core'
import { AvatarService } from '#services/avatar_service'

@inject()
export default class UsersController {
  constructor(protected avatarService: AvatarService) {}
}
```

Which classes support dependency injection 
The following classes are automatically constructe

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/extending-adonisjs
Source: https://docs.adonisjs.com/guides/concepts/extending-adonisjs

Extending AdonisJS (Core Concepts) - AdonisJS Documentation 

Concepts Extending AdonisJS 

Extending the framework 
This guide covers how to extend AdonisJS with custom functionality. You will learn how to: 
Add custom methods to framework classes using macros 
Create computed properties with getters 
Ensure type safety with TypeScript declaration merging 
Organize extension code in your application 
Extend specific framework modules like Hash, Session, and Authentication 
Overview 
AdonisJS provides a powerful extension system that lets you add custom methods and properties to framework classes without modifying the framework's source code. This means you can enhance the class with custom validation logic, add utility methods to the class, or extend any other framework class to fit your application's specific needs. 
The extension system is built on two core concepts: macros (custom methods) and getters (computed properties). Both are added at runtime and integrate seamlessly with TypeScript through declaration merging, giving you full type safety and autocomplete in your editor. 
This same extension API is used throughout AdonisJS's own first-party packages, making it a proven pattern for building reusable functionality. Whether you're adding a few helper methods for your application or building a package to share with the community, the extension system provides a clean, type-safe way to enhance the framework. 
Why extend the framework? 
Before diving into the mechanics, let's understand when and why you'd want to extend framework classes. 
Without extensions, you'd need to write the same logic repeatedly across your application. For example, checking if a request expects JSON responses: 
app/controllers/posts_controller.ts 

```
export default class PostsController {
  async index({ request, response }: HttpContext) {
    // Repeated in every action that returns different formats
    const acceptHeader = request.header('accept', '')
    const wantsJSON = acceptHeader.includes('application/json') || 
                      acceptHeader.includes('+json')
    
    if (wantsJSON) {
      return response.json({ posts: [] })
    }
    
    return view.render('posts/index')
  }
}
```

With a macro, you write this logic once and use it everywhere: 
src/extensions.ts 

```
import { HttpRequest } from '@adonisjs/core/http'

/**
 * Check if the request expects a JSON response based on Accept header
 */
HttpRequest.macro('wantsJSON', function (this: HttpRequest) {
  const firstType = this.types()[0]
  if (!firstType) {
    return false
  }
  
  return firstType.includes('/json') || firstType.includes('+json')
})
```

app/controllers/posts_controller.ts 

```
export default class PostsController {
  async index({ request, response }: HttpContext) {
    if (request.wantsJSON()) {
      return response.json({ posts: [] })
    }
    
    return view.render('posts/index')
  }
}
```

Extensions are ideal when you: 
Have framework-specific logic reused across your application 
Want to maintain AdonisJS's fluent API style 
Are building a package that integrates deeply with the framework 
Need type-safe custom functionality with autocomplete support 
Understanding macros and getters 
Before we start adding extensions, let's clarify what macros and getters are and when to use each. 
Macros are custom methods you add to a class. They work like regular methods and can accept parameters, perform computations, and return values. Use macros when you need functionality that requires input or performs actions. 
Getters are computed properties that look like regular properties when you access them. They're calculated on-demand and can optionally cache their result. Use getters for read-only derived data that doesn't require parameters. 
Both macros and getters use declaration merging , a TypeScript feature that extends existing type definitions to include your custom additions. This ensures your extensions have full type safety and autocomplete support. 
Under the hood, AdonisJS uses the  [link:https://github.com/poppinss/macroable] macroable package to implement this functionality. If you want to understand the implementation details, you can refer to that package's documentation. 
Creating your first macro 
Let's build a simple macro step-by-step. We'll add a method to the class that checks if the incoming request is from a mobile device. 
Create the extensions file 
Create a dedicated file to hold all your framework extensions. This keeps your extension code organized in one place. 
src/extensions.ts 

```
// This file contains all framework extensions for your application
```

The file can be named anything you like, but clearly communicates its purpose. 

Import the class you want to extend 
Import the framework class you want to add functionality to. For our example, we'll extend the class. 
src/extensions.ts 

```
import { HttpRequest } from '@adonisjs/core/http'
```

Add the macro method 
Use the method to add your custom functionality. The method receives the class instance as , giving you access to all the class's existing properties and methods. 
src/extensions.ts 

```
import { HttpRequest } from '@adonisjs/core/http'

HttpRequest.macro('isMobile', function (this: HttpRequest) {
  /**
   * Get the User-Agent header, defaulting to empty string if not present
   */
  const userAgent = this.header('user-agent', '')
  
  /**
   * Check if the User-Agent contains common mobile identifiers
   */
  return /mobile|android|iphone|ipad|phone/i.test(userAgent)
})
```

The 
```
function (this: HttpRequest)
```
syntax is important because it gives you the correct context. Don't use arrow functions here, as they don't preserve the binding. 

Add TypeScript type definitions 
Tell TypeScript about your new method using declaration merging. Add this at the end of your extensions file. 
src/extensions.ts 

```
declare module '@adonisjs/core/http' {
  interface HttpRequest {
    isMobile(): boolean
  }
}
```

The module path in must exactly match the import path you use. The interface name must exactly match the class name. 

Load extensions in your provider 
Import your extensions file in a service provider's method to ensure the extensions are registered when your application starts. 
providers/app_provider.ts 

```
export default class AppProvider {
  async boot() {
    await import('../src/extensions.ts')
  }
}
```

Use your macro 
Your macro is now available throughout your application with full type safety and autocomplete. 
app/controllers/home_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ request, view }: HttpContext) {
    /**
     * TypeScript knows about isMobile() and provides autocomplete
     */
    if (request.isMobile()) {
      return view.render('mobile/home')
    }
    
    return view.render('home')
  }
}
```

Creating your first getter 
Getters are computed properties that work like regular proper

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/scaffolding
Source: https://docs.adonisjs.com/guides/concepts/scaffolding

Scaffolding and codemods (Core Concepts) - AdonisJS Documentation 

Concepts Scaffolding and codemods 

Scaffolding and codemods 
This guide covers the scaffolding and codemods system in AdonisJS. You will learn how to: 
Create a configure hook for your AdonisJS package 
Use codemods to modify the host application's source files 
Create stubs to scaffold configuration files and other source code 
Customize stub templates with generators and variables 
Eject and modify stubs from existing packages 
Overview 
When you run 
```
node ace configure @adonisjs/lucid
```
, the package automatically registers its provider, sets up environment variables, and creates a config file in your project. This seamless setup experience is powered by AdonisJS's scaffolding and codemods system. 
Scaffolding refers to generating source files from templates called stubs. Codemods are programmatic transformations that modify existing TypeScript source files by parsing and manipulating the AST (Abstract Syntax Tree). Together, they allow package authors to provide the same polished configure experience that official AdonisJS packages offer. 
The codemods API is powered by  [link:https://github.com/dsherret/ts-morph] ts-morph and lives in the package. Since assembler is a development dependency, ts-morph never bloats your production bundle. 
Building blocks 
Before diving into the tutorial, let's briefly define the key components you'll work with. 
Stubs are template files (with a extension) that generate source files. They use  [link:https://github.com/lukeed/tempura] Tempura , a lightweight handlebars-style template engine. 
Generators are helper functions that enforce AdonisJS naming conventions. They transform input like into properly formatted names like or . 
Codemods are high-level APIs for common modifications like registering providers, adding middleware, or defining environment variables. They handle the complexity of AST manipulation for you. 
Configure hooks are functions exported by packages that run when a user executes 
```
node ace configure <package-name>
```
. This is where you combine stubs and codemods to set up your package. 
Creating a configure hook 
The most common use of scaffolding and codemods is creating a configure hook for an AdonisJS package. Let's build one step-by-step using a cache package as our example. 
Set up the package structure 
A typical AdonisJS package with a configure hook has this structure: 

```
my-cache-package/
├── src/
│   └── ...
├── stubs/
│   ├── config.stub
│   └── main.ts
├── configure.ts
├── index.ts
└── package.json
```

The directory contains your template files, holds the configure function, and exports everything including the configure hook. 

Install @adonisjs/assembler as a peer dependency 
The codemods API requires , which must be installed as a peer dependency in your package. This is important because the host application already has assembler installed as a dev dependency, and it should be shared across all configured packages rather than duplicated. 
package.json 

```
{
  "name": "@adonisjs/cache",
  "peerDependencies": {
    "@adonisjs/assembler": "^7.0.0"
  }
}
```

When users install your package and run , the assembler from their project will be used. 

Export the stubs root 
Create a file that exports the path to your stubs directory. This path is needed when calling . 
stubs/main.ts 

```
export const stubsRoot = import.meta.url
```

Write the configure function 
The configure function receives the Configure command instance, which provides access to the codemods API. Here's a complete example for a cache package: 
configure.ts 

```
import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.ts'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Register the provider and commands in the adonisrc.ts file
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile
      .addProvider('@adonisjs/cache/cache_provider')
      .addCommand('@adonisjs/cache/commands')
  })

  /**
   * Add environment variables to .env and .env.example files
   */
  await codemods.defineEnvVariables({
    CACHE_STORE: 'redis',
  })

  /**
   * Add validation rules to start/env.ts
   */
  await codemods.defineEnvValidations({
    variables: {
      CACHE_STORE: `Env.schema.string()`,
    },
  })

  /**
   * Create the config/cache.ts file from a stub
   */
  await codemods.makeUsingStub(stubsRoot, 'config.stub', {
    store: 'redis',
  })
}
```

Export from the package entry point 
Export the configure function from your package's main entry point so the command can find it: 
index.ts 

```
export { configure } from './configure.ts'
```

When users run 
```
node ace configure @adonisjs/cache
```
, AdonisJS imports this file and executes the exported function. 

Creating stubs 
Stubs are template files that generate source code. They combine static content with dynamic values computed at runtime. 
Basic stub syntax 
Stubs use double curly braces for variable interpolation. Here's a simple config stub. 
Tip 
Since Tempura's syntax is compatible with Handlebars, configure your editor to use Handlebars syntax highlighting for files. 

stubs/config.stub 

```
{{{
  exports({
    to: app.configPath('cache.ts')
  })
}}}
import { defineConfig, stores } from '@adonisjs/cache'

export default defineConfig({
  default: '{{ store }}',
  
  stores: {
    redis: stores.redis({}),
  },
})
```

The function at the top defines metadata about the generated file, most importantly the destination path. The variable provides access to application paths like , , and . 
Using generators for naming conventions 
When creating stubs that need to follow AdonisJS naming conventions, use the generators module. Generators transform user input into properly formatted names. 
stubs/resource.stub 

```
{{#var entity = generators.createEntity(name)}}
{{#var modelName = generators.modelName(entity.name)}}
{{#var modelReference = string.camelCase(modelName)}}
{{#var resourceFileName = string(modelName).snakeCase().suffix('_resource').ext('.ts').toString()}}
{{{
  exports({
    to: app.makePath('app/api_resources', entity.path, resourceFileName)
  })
}}}
export default class {{ modelName }}Resource {
  serialize({{ modelReference }}: {{ modelName }}) {
    return {{ modelReference }}.toJSON()
  }
}
```

The syntax creates inline variables within the stub. This approach keeps all the naming logic inside the stub itself, which becomes important when users eject stubs to customize them. 
Passing data to stubs 
When calling , pass a data object as the third argument. These values become available in the stub template: 
configure.ts 

```
await codemods.makeUsingStub(stubsRoot, 'config.stub', {
  store: 'dynamodb',
  region: 'us-east-1',
})
```

stubs/config.stub 

```
{{{
  exports({
    to: app.configPath('cache.ts')
  })
}}}
export default defineConfig({
  default: '{{ store 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/concepts/service-providers
Source: https://docs.adonisjs.com/guides/concepts/service-providers

Service providers (Core Concepts) - AdonisJS Documentation 

Concepts Service providers 

Service Providers 
This guide covers service providers in AdonisJS applications. You will learn how to: 
Use lifecycle hooks to execute code at specific points during application startup and shutdown 
Create custom service providers 
Register bindings into the IoC container 
Overview 
Service providers are JavaScript classes with lifecycle hooks that execute at specific points during application startup and shutdown. This allows you to register bindings to the IoC container, extend framework classes using Macros, perform initialization at precise moments, and clean up resources during graceful shutdown. 
The key advantage is centralized initialization logic that runs at predictable times, without modifying core framework code or scattering setup code throughout your application. Every AdonisJS application and package uses service providers to hook into the application lifecycle, making them fundamental to understanding the framework. 
Understanding service providers 
Before creating your own service providers, it's helpful to understand how they work within an AdonisJS application. 
Where service providers are registered 
Service providers are registered in the file at the root of your project. This file defines which providers should load and in which runtime environments they should execute. 
adonisrc.ts 

```
import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/http_provider'),
  ],
})
```

Providers use lazy imports with the syntax, ensuring they're only loaded when needed. 
Built-in service providers 
A typical AdonisJS application includes several framework providers that handle core functionality. 
app_provider - Registers fundamental application services and helpers that every AdonisJS app needs. 

hash_provider - Registers the hash service used for password hashing and verification. 

repl_provider - Adds REPL-specific bindings. Notice it only runs in the and environments, demonstrating environment restrictions. 

http_provider - Sets up the HTTP server and related services for handling web requests. 

When you install additional packages like for database access or for authentication, these packages include their own service providers that you add to this array. 
Execution order and environments 
AdonisJS calls lifecycle hooks in phases across all registered providers. First, the hook runs for all providers in the order they are registered. Then the hook runs for all providers in the order they are registered, followed by , , and finally . 
Environment restrictions determine whether a provider runs at all. For instance, a WebSocket provider configured for the environment won't execute when you run console commands. 
This combination of execution order and environment filtering gives you precise control over what runs and when. 
When to create a service provider 
Create a custom service provider when you need to register services into the IoC container, extend framework classes with macros, perform initialization at specific lifecycle points, set up resources that require cleanup during shutdown, or configure third-party packages application-wide. 
You typically don't need a service provider for simple utility functions, one-off setup that only runs in a single place, or services used within a single controller or middleware. In these cases, use regular modules or inject dependencies directly. 
Creating a custom service provider 
Now that you understand when service providers are appropriate, let's build one that registers a service into the IoC container. 
Generate the provider 
AdonisJS includes a command to generate service provider files. 

```
node ace make:provider cache
```

```
# Output:
# CREATE: providers/cache_provider.ts
```

This command creates the provider file and automatically registers it in your file. 

Understand the generated code 
Open the generated 
```
providers/cache_provider.ts
```
file. You'll see a basic provider structure. 
providers/cache_provider.ts 

```
import type { ApplicationService } from '@adonisjs/core/types'

export default class CacheProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Called when the provider is registered
   */
  register() {}

  /**
   * Called when the application boots
   */
  async boot() {}

  /**
   * Called when the application starts
   */
  async start() {}

  /**
   * Called when the application is ready
   */
  async ready() {}

  /**
   * Called during graceful shutdown
   */
  async shutdown() {}
}
```

The provider receives the through its constructor, giving you access to the IoC container and other application services. All lifecycle methods are optional. You only implement the hooks you need. 

Register a container binding 
Let's register a simple Cache class into the container using the method. For this example, we'll create a minimal Cache class in the same file, though in a real-world package this class would typically live elsewhere. 
providers/cache_provider.ts 

```
import type { ApplicationService } from '@adonisjs/core/types'

/**
 * A simple Cache service.
 * In real-world packages, this would be in a separate
 * file like src/cache.ts
 */
export class Cache {
  get(key: string) {
    // Implementation would go here
    return null
  }
  
  set(key: string, value: any) {
    // Implementation would go here
  }
}

export default class CacheProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.bind(Cache, () => {
      return new Cache()
    })
  }
}
```

Use your registered service 
Once registered, you can inject the Cache service into controllers or other container-managed classes. 
app/controllers/posts_controller.ts 

```
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  @inject()
  constructor(protected cache: Cache) {}

  async index({ response }: HttpContext) {
    const cachedPosts = this.cache.get('posts')
    
    if (cachedPosts) {
      return response.json(cachedPosts)
    }

    // Fetch from database and cache...
    return response.json([])
  }
}
```

Understanding all lifecycle hooks 
Service providers offer five lifecycle hooks that run at different stages of your application's lifetime. Here's when each hook executes: 
Hook Type When It Runs Common Use Cases 
Sync Immediately on provider import Register IoC container bindings 
Async After all providers registered Extend framework classes, configure services 
Async Before HTTP server starts / command runs Register routes, warm caches 
Async After HT

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
