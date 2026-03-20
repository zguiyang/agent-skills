# Adonisjs - Other

**Pages:** 11

---

## Pick your path - AdonisJS

**URL:** https://docs.adonisjs.com/stacks-and-starter-kits

**Contents:**
- Pick your path
- Overview
- The three approaches
  - Hypermedia
  - Inertia (React or Vue)
  - API-only
- The same controller, three different returns
- What NOT to expect
- Starter kits
- Next steps

This guide introduces AdonisJS's approach to frontend development and the three primary stacks you can choose from. You will learn:

AdonisJS is deeply opinionated about the backend, providing built-in authentication, authorization, validation, database tooling, and more, but deliberately flexible about the frontend. This backend-first philosophy means you get a robust foundation for building your server-side logic while choosing how you build your user interface.

You can create traditional server-rendered applications, modern single-page applications, or anything in between, all using the same backend framework. A marketing website has different requirements than an admin dashboard, which differs from a mobile app's API backend. Rather than forcing you into a single approach, AdonisJS lets you choose the frontend stack that fits your needs.

AdonisJS supports three primary approaches to building your frontend. Each approach represents a different way of thinking about the View layer in your application's architecture.

Hypermedia applications generate complete HTML pages on the server and send them to the browser. You build your interface using a template engine (AdonisJS provides Edge) and add interactivity using lightweight JavaScript libraries like Alpine.js or HTMX/Unpoly when needed.

The term "Hypermedia" refers to HTML as a medium for building interactive applications, where the server drives the application state and the client (browser) displays it. If you're new to this concept, the HTMX project has an excellent essay explaining Hypermedia-driven applications in depth.

In a Hypermedia application:

This approach embraces the web's native capabilities and keeps most of your application's logic on the server where you have full control.

Choose this approach when you want to build applications with the server in control, or you want to minimize the amount of JavaScript your users download. Hypermedia applications can be highly interactive using libraries like Alpine.js and HTMX while keeping your frontend codebase lean and your deployment simple.

Inertia.js provides a middle ground between server-rendered templates and SPAs. You use React or Vue components as your views while keeping server-side routing and controllers. AdonisJS officially supports building applications with React or Vue through Inertia, giving you the component-based development experience of modern frontend frameworks without the complexity of maintaining a separate single-page application.

Inertia also simplifies form submissions and data fetching while keeping your application a monolithic deployment. You get a modern, reactive user experience without building and maintaining a separate API layer.

Choose this approach when you want to use React or Vue but prefer server-side routing, you want to avoid the complexity of separate frontend and backend deployments, or you want a tightly integrated full-stack development experience. Visit inertiajs.com to learn more about how Inertia bridges the gap between server-side and client-side frameworks.

You can build a JSON API backend with AdonisJS while your frontend lives in a completely separate codebase. This approach creates a clear separation where AdonisJS handles all backend logic and exposes data through API endpoints, while your frontend application (built with any framework) consumes these endpoints.

In an API-only setup:

In monorepos, you can use a type-safe API client for true end-to-end typing across backend and frontend. Transformers also produce reusable, independent response types, so your UI can rely directly on the serialized API contract.

This approach covers a wide variety of applications: APIs for mobile apps (iOS, Android), web applications built with any frontend framework, desktop applications, or even multiple frontends (web and mobile) consuming the same API. The separation provides flexibility in how you deploy and scale each layer independently.

Choose this approach when you're building an API that serves multiple client applications, your team prefers working with separate frontend and backend repositories, you need independent deployment and scaling of frontend and backend, or you're building a public API that external developers will consume.

In the following example, you can see us using the same route, same controller, same data fetching logic. Only the return statement changes.

If you're coming from meta-frameworks, there are some patterns you won't find in AdonisJS. These differences are intentional and provide clarity about how your application works.

AdonisJS is designed to be the backend that powers your frontend applications, not a replacement for meta-frameworks. You can use AdonisJS alongside frameworks like TanStack Start, Nuxt, Next.js, or others, with clear boundaries and well-defined API contracts between the two.

No file-based routing: AdonisJS uses explicit route definitions in your route files. Routes are declared using the router API, giving you full control and visibility over your application's URL structure. This makes it easy to see all your routes in one place and apply middleware or constraints as needed.

No compiler magic with "use" directives: You won't find magical statements like "use server" or "use client" that blur the boundaries between where code executes. AdonisJS maintains a clear separation between your backend code (which runs on the server) and your frontend code (which runs in the browser).

No mixing of server and client code: Your backend logic lives in controllers, models, and services. Your frontend code lives in templates, components, or a separate frontend application. There's no ambiguity about where code runs, which makes debugging straightforward and helps teams work with well-defined boundaries.

This separation provides clarity about where code executes, makes debugging predictable, and allows teams to work with clear contracts between frontend and backend. When your frontend needs data from your backend, you work with explicit API calls or template data passing, not magical boundaries that blur at compile time.

AdonisJS provides starter kits for each approach that come with opinionated configurations and best practices already in place. You don't have to configure everything from scratch.

These starter kits include properly configured build tools, authentication scaffolding, and all the necessary integrations set up correctly. When you create a new AdonisJS application, you can choose which starter kit to use based on the approach you've decided on.

This gives you a "flexible but not on your own" experience. You get to choose your stack, but once you've chosen, you get a fully configured setup that works out of the box.

Now that you understand all different approaches AdonisJS supports, you're ready to create your first application. The installation guide will walk you through using the starter kits to set up a new project with your chosen stack.

**Examples:**

Example 1 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.Posts, 'index'])
```

Example 2 (javascript):
```javascript
import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    const posts = await Post.all()
    return view.render('posts/index', { posts }) 
  }
}
```

Example 3 (elixir):
```elixir
@each(post in posts)
  <div>
    <h2>{{ post.title }}</h2>
  <div>
@end
```

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.Posts, 'index'])
```

---

## Folder structure - AdonisJS

**URL:** https://docs.adonisjs.com/folder-structure

**Contents:**
- Folder structure
- Overview
- app/
- bin/
- config/
- database/
- providers/
- public/
- resources/
- inertia/

When you create a new AdonisJS application, it comes with a thoughtful default folder structure designed to keep projects tidy, predictable, and easy to refactor.

This structure reflects conventions that work well for most projects, but AdonisJS does not lock you into them. You are free to reorganize files and directories to suit your team's workflow.

Depending on the starter kit you select, some files or directories may differ. For example, the Inertia starter kit contains a top-level inertia folder, whereas the Hypermedia starter kit does not include this folder.

Here's what a freshly created AdonisJS project looks like.

The API starter kit is a monorepo with two workspaces managed by Turborepo:

The apps/backend directory contains a standard AdonisJS application — all the sections below (app/, config/, start/, etc.) apply to that directory. The apps/frontend directory is where you set up your frontend framework (TanStack Start, Next.js, Nuxt, or others).

The root package.json defines the workspaces:

And turbo.json configures the dev, build, and other scripts to run across both apps. When you run npm run dev from the project root, Turborepo starts both the backend and frontend dev servers in parallel.

Each directory and file has a specific purpose. The sections below explain the role of each item and what you are likely to find there.

The app directory organizes code for the domain logic of your application. For example, the controllers, models, mails, middleware, etc., all live within the app directory.

Feel free to create additional folders in the app directory to better organize your codebase.

The bin directory contains the entry point files used to start your AdonisJS application in different environments.

You usually won't need to modify these files unless you want to customize how the app boots in a specific context.

All application and third-party configuration files live inside the config directory. You can also store config local to your application inside this directory.

The database directory holds artifacts related to the database layer. By default, AdonisJS ships with Lucid ORM configured for SQLite; switching databases does not require reorganizing this folder.

See also: Lucid documentation

The providers directory is used to store the service providers used by your application. You can create new providers using the node ace make:provider command.

The public directory contains raw static assets that are served directly to the browser without any compilation step. Files in this directory are publicly accessible over HTTP using the http://localhost:3333/public/<file-name> URL.

Typical examples of files stored in this folder include:

The resources directory stores Edge templates and uncompiled frontend assets such as CSS and JavaScript files.

For applications using Inertia (alongside Vue or React), the frontend code is kept within the inertia directory, and the resources directory contains only the root Edge template. Think of this root template as the index.html file that contains the HTML shell for your frontend application.

The inertia directory exists only in projects using the Inertia starter kit. It represents a sub-application containing the frontend source code, including React or Vue components, pages, and supporting utilities.

You are free to create additional subfolders, such as components/, layouts/, or utils/, to organize your frontend code.

AdonisJS maintains a clear boundary between the backend and the frontend. You should never import backend code (such as models, services, or transformers) into your frontend application.

In practice, your frontend communicates with the backend through HTTP requests and receives plain JSON data. AdonisJS encourages you to model this reality explicitly. Data is fetched and transformed via API responses, rather than being hidden behind shared abstractions.

The frontend can still rely on shared TypeScript types automatically generated by AdonisJS. These are stored inside the .adonisjs/client directory and include type definitions for routes, props, and other shared contracts.

This approach allows frontend code to remain strongly typed without compromising the separation between the client and the server.

We recommend reading the types generation docs to understand how AdonisJS creates shared types.

The start directory contains the files you want to import during the boot lifecycle of the application. For example, the files to register routes and define event listeners should live within this directory.

AdonisJS does not auto-import files from the start directory. It is merely used as a convention to group similar files. We recommend reading about preload files and the application boot lifecycle to have a better understanding of which files to keep under the start directory.

The tests directory contains automated tests. AdonisJS uses the Japa test runner.

Tests are organized within specific sub-folders. When running unit tests, AdonisJS boots the application but does not start the HTTP server. Whereas, during functional tests, we start the HTTP server and the Vite Dev-server.

See also: Testing docs

The temporary files generated by your application are stored within the tmp directory. For example, these could be user-uploaded files (generated during development) or logs written to the disk.

The tmp directory must be ignored by the .gitignore rules, and you should not copy it to the production server either.

The ace.js file is the entry point for executing Ace commands. This file configures a JIT TypeScript compiler and then imports the bin/console.ts file.

adonisrc.ts is the project manifest. It tells AdonisJS how to discover and load parts of your application and includes configuration for:

See also: AdonisRC file reference

This file configures ESLint for the project. The default rules are tuned for TypeScript and AdonisJS conventions. You can modify or extend this configuration to match your team's style.

tsconfig.json controls TypeScript compiler options, module resolution, and path aliases. The provided configuration is suitable for both development and production builds. However, you can adjust the compiler settings to match your specific workflow.

AdonisJS relies on experimentalDecorators for Dependency Injection, Ace commands, and the Lucid ORM.

The following configuration options are required for AdonisJS internals to work correctly.

When the project uses Vite (Edge or Inertia starter kits), vite.config.ts defines how frontend assets are compiled and served. Customize entry points, aliases, and plugin settings here if you need specialized bundling behavior.

**Examples:**

Example 1 (unknown):
```unknown
├── app
├── bin
├── config
├── database
├── resources
├── start
├── tests
├── ace.js
├── adonisrc.ts
├── eslint.config.js
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Example 2 (lua):
```lua
├── apps
│   ├── backend           # AdonisJS application
│   │   ├── app
│   │   ├── bin
│   │   ├── config
│   │   ├── database
│   │   ├── start
│   │   ├── tests
│   │   ├── ace.js
│   │   ├── adonisrc.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend          # Your frontend application
│       ├── package.json
│       └── ...
├── package.json          # Root package.json with workspaces
├── package-lock.json
└── turbo.json            # Turborepo pipeline configuration
```

Example 3 (json):
```json
{
  "workspaces": ["apps/*"]
}
```

Example 4 (unknown):
```unknown
├── app
│   ├── controllers
│   ├── exceptions
│   ├── mails
│   ├── middleware
│   ├── models
│   └── validators
```

---

## Contributing - AdonisJS

**URL:** https://docs.adonisjs.com/contributing

**Contents:**
- Contributing
- Reporting bugs
- Having a discussion
- Educating others
- Creating pull requests
- Repository setup
- Tools in use
- Commands
- Coding style
- Getting recognized as a contributor

This is a general contribution guide for all of the AdonisJS repos. Please read this guide thoroughly before contributing to any of the repos

Code is not the only way to contribute. Following are also some ways to contribute and become part of the community.

Many issues reported on open source projects are usually questions or misconfiguration at the reporter's end. Therefore, we highly recommend you properly troubleshoot your issues before reporting them.

If you're reporting a bug, include as much information as possible with the code samples you have written. The scale of good to bad issues looks as follows.

PERFECT ISSUE: You isolate the underlying bug. Create a failing test in the repo and open a Github issue around it.

GOOD ISSUE: You isolate the underlying bug and provide a minimal reproduction of it as a Github repo. Antfu has written a great article on Why Reproductions are Required.

DECENT ISSUE: You correctly state your issue. Share the code that produces the issue in the first place. Also, include the related configuration files and the package version you use.

Last but not least is to format every code block properly by following the Github markdown syntax guide.

POOR ISSUE: You dump the question you have with the hope that the other person will ask the relevant questions and help you. These kinds of issues are closed automatically without any explanation.

You often want to discuss a topic or maybe share some ideas. In that case, create a discussion in the discussions forum under the 💡Ideas category.

Educating others is one of the best ways to contribute to any community and earn recognition.

You can use the 📚 Cookbooks category on our discussion forum to share an article with others. The cookbooks section is NOT strictly moderated, except the shared knowledge should be relevant to the project.

It is never a good experience to have your pull request declined after investing a lot of time and effort in writing the code. Therefore, we highly recommend you to kick off a discussion before starting any new work on your side.

Just start a discussion and explain what are you planning to contribute?

Are you trying to create a PR to fix a bug: PRs for bugs are mostly accepted once the bug has been confirmed.

Are you planning to add a new feature: Please thoroughly explain why this feature is required and share links to the learning material we can read to educate ourselves.

For example: If you are adding support for snapshot testing to Japa or AdonisJS. Then share the links I can use to learn more about snapshot testing in general.

Note: You should also be available to open additional PRs for documenting the contributed feature or improvement.

Start by cloning the repo on your local machine.

Install dependencies on your local. Please do not update any dependencies along with a feature request. If you find stale dependencies, create a separate PR to update them.

We use npm for managing dependencies, therefore do not use yarn or any other tool.

Run tests by executing the following command.

Following is the list of tools in use.

All of our projects are written in TypeScript and are moving to pure ESM.

Also, make sure to run the following commands before pushing the code.

We rely on GitHub to list all the repo contributors in the right-side panel of the repo. Following is an example of the same.

Also, we use the auto generate release notes feature of Github, which adds a reference to the contributor profile within the release notes.

**Examples:**

Example 1 (typescript):
```typescript
git clone <REPO_URL>
```

Example 2 (unknown):
```unknown
npm install
```

Example 3 (julia):
```julia
# Formats using prettier
npm run format

# Lints using Eslint
npm run lint
```

---

## Deployment - AdonisJS

**URL:** https://docs.adonisjs.com/deployment

**Contents:**
- Deployment
- Overview
- Understanding the standalone build
- NODE_ENV during build and runtime
- Creating the production build
- Build output contents
- Static files
- Running the production build
- User-uploaded files
- Logging

This guide covers deploying AdonisJS applications to production. You will learn how to:

AdonisJS applications are written in TypeScript and must be compiled to JavaScript before running in production. The build process creates a standalone build, which means the compiled output contains everything needed to run your application without the original TypeScript source files.

Since AdonisJS apps run on the Node.js runtime, your deployment platform must support Node.js version 24 or later. The build process compiles your TypeScript code, bundles frontend assets (if using Vite), and copies necessary files to a build directory that you can deploy directly to your production server.

The standalone build is the compiled output of your AdonisJS application. After creating the build, you only need to deploy the build directory to your production server. The original source files, development dependencies, and TypeScript configuration are not required in production.

This approach offers several benefits. The deployment size is significantly smaller since you are not shipping TypeScript source files or development tooling. The production environment only needs the JavaScript runtime, and you can treat the build folder as an independent, self-contained application.

The NODE_ENV environment variable behaves differently during the build process versus runtime, and understanding this distinction is important for successful deployments.

During the build process, you need development dependencies installed because the build tooling (TypeScript compiler, Vite, and other build tools) are typically listed as devDependencies in your package.json. If you are creating the build in a CI environment or a sandbox where dependencies are not already installed, set NODE_ENV=development before running npm install to ensure all dependencies are available.

During runtime in production, NODE_ENV should be set to production. This enables production optimizations and disables development-only features like detailed error pages.

Run the build command from your project root.

This executes node ace build under the hood. The build process performs the following steps in order:

If there are TypeScript errors in your code, the build will fail. You must fix these errors before creating a production build. If you need to bypass TypeScript errors temporarily, use the --ignore-ts-errors flag.

The --package-manager flag controls which lock file is copied to the build output. If not specified, the build command detects your package manager based on how you invoked the command (for example, npm run build versus pnpm build).

After a successful build, the build directory contains your compiled application. Here is what you will find inside:

Environment files (.env, .env.example) are intentionally excluded from the build output. Environment variables are not portable between environments, and you must configure them separately for each deployment target through your hosting platform's environment variable management.

Static files that need to be included in the production build are configured using the metaFiles array in your adonisrc.ts file. These are non-TypeScript files that your application needs at runtime, such as Edge templates or public assets.

The pattern property accepts glob patterns to match files. The reloadServer property controls whether file changes trigger a server restart during development and has no effect on the production build.

For Hypermedia and Inertia applications, Vite compiles frontend assets and places them in the public directory. These are then copied to build/public during the build process. If your hosting platform has special configuration for serving static files, point it to this directory. Otherwise, AdonisJS will serve these files automatically when requests come through your application server.

If you plan to serve frontend assets from a CDN, update the assetsUrl option in your Vite configuration to point to your CDN URL.

To run your application in production, treat the build directory as the root of your application. Change into the build directory, install production dependencies, and start the server.

Using npm ci --omit=dev instead of npm install ensures a clean, reproducible installation using only the lock file and skips development dependencies. You must also provide all required environment variables before starting the server. Your hosting platform should have a mechanism for configuring environment variables. You can reference your env.ts file or .env.example to see which variables your application requires.

User-uploaded files require persistent storage that survives deployments. When you deploy a new version of your application, the previous build directory is typically replaced, which means any files stored locally within that directory are lost.

For production deployments, use a cloud storage provider such as Amazon S3, Cloudflare R2, or Google Cloud Storage. These services provide durable, persistent storage that is independent of your application deployments.

If you must store files locally on your server, configure a directory outside of your application's build folder and ensure this directory persists across deployments. The specific approach depends on your hosting platform and deployment strategy.

AdonisJS uses Pino for logging, which outputs structured logs in NDJSON format to stdout. This format is well-suited for production environments because most logging services and log aggregators can parse NDJSON directly.

Configure your hosting platform to capture stdout from your application process. Most platforms provide built-in integrations with logging services like Datadog, Logtail, or Papertrail. Alternatively, you can pipe your application's output to a log shipping agent.

Pino's structured JSON output includes timestamps, log levels, and any additional context you attach to log messages, making it straightforward to search and filter logs in your logging service.

Run migrations in production using the migration:run command with the --force flag.

The --force flag is required because running migrations is disabled by default in production environments. This is a safety measure to prevent accidental schema changes.

AdonisJS migrations are idempotent and use exclusive locking. If multiple processes attempt to run migrations simultaneously (for example, during a rolling deployment), only one process will execute the migrations while others wait. This prevents race conditions and duplicate migration attempts.

If your deployment platform supports lifecycle hooks or has a dedicated mechanism for running database migrations, use that instead of running migrations as part of your application startup. This separation ensures migrations complete successfully before any application instances start serving traffic.

Rolling back migrations in production is disabled by default and is not recommended. Instead of rolling back, create a new migration that reverses the changes you need to undo. This approach maintains a clear history of all schema changes and avoids the risks associated with rollbacks in production.

The following Dockerfile creates an optimized production image using multi-stage builds. The first stage installs all dependencies and creates the build, while the final stage contains only the production runtime.

This Dockerfile follows a multi-stage pattern where each stage has a specific purpose. The deps stage installs all dependencies needed for the build. The build stage compiles the TypeScript application. The production stage creates a minimal image with only production dependencies.

To build and run the Docker image:

Pass environment variables using the --env-file flag or individual -e flags. The container exposes port 3333 by default, which you can map to any host port.

For containerized deployments, you have two options for running migrations. You can run them as a separate command before starting your application containers:

Alternatively, you can create an entrypoint script that runs migrations before starting the server. Create this file in your project root:

Update your Dockerfile to use this entrypoint:

With this setup, setting MIGRATE=true as an environment variable will run migrations before starting the server. For horizontal scaling where multiple containers start simultaneously, the migration locking ensures only one container runs migrations while others wait.

**Examples:**

Example 1 (sass):
```sass
# In CI/CD or fresh environments
NODE_ENV=development npm install
npm run build
```

Example 2 (unknown):
```unknown
npm run build
```

Example 3 (unknown):
```unknown
npm run build -- --ignore-ts-errors
```

Example 4 (sass):
```sass
npm run build -- --package-manager=pnpm
```

---

## Introduction - AdonisJS

**URL:** https://docs.adonisjs.com/introduction

**Contents:**
- Introduction
- Who is AdonisJS for?
- Why AdonisJS
- What can you build with AdonisJS?
- Practical, not overengineered
- How AdonisJS compares
- MVC with a configurable view layer
- Ecosystem and stability
- Next steps

AdonisJS is a backend-first, type-safe framework for building web applications with Node.js and TypeScript. It provides the core building blocks for writing and maintaining complete backends, eliminating the need for third-party services to handle common features such as authentication, file uploads, caching, and rate limiting.

Each AdonisJS application is written in TypeScript, runs in ESM mode, and offers end-to-end type safety across the entire stack.

AdonisJS is designed for developers building production web applications who need more structure than Express but less ceremony than enterprise frameworks. If you're building REST APIs, server-rendered applications, or full-stack web apps, and you value conventions over configuration, AdonisJS will feel natural.

If you're coming from Laravel, Rails, or Django, you'll recognize the MVC patterns and conventions. If you've worked with Express or Fastify, you'll appreciate having structure and batteries included without sacrificing simplicity.

AdonisJS provides the structure, consistency, and tooling expected from a full-featured framework, while remaining lightweight and modern in design.

It is suitable for teams that value:

Ownership of backend logic: Build critical features in-house rather than depending on external services for authentication, rate-limiting, or background jobs.

Cohesive developer experience: Every AdonisJS application follows the same conventions and directory structure, making it easy to onboard new developers and share knowledge across teams.

Unified ecosystem: Core features are maintained together under consistent quality standards, eliminating dependency fragmentation.

Extensibility and freedom: Core features are built from low-level packages that you can use directly to create custom flows, integrations, or abstractions.

AdonisJS is designed to provide everything you need for real-world backend applications, while remaining approachable and easy to configure.

AdonisJS is designed for real-world backend applications:

REST APIs: Build type-safe APIs for mobile apps or SPAs. Companies use AdonisJS to power APIs serving millions of requests.

Full-stack web applications: Use Edge templates for server-rendered pages, or pair with Vue/React for hybrid applications. The MVC structure keeps your backend organized as your app grows.

SaaS platforms: Build multi-tenant applications without relying on third-party services for core functionality like authentication, authorization, or background jobs.

Whether you're building a startup MVP or a production system serving thousands of users, AdonisJS provides the foundation without getting in your way.

Many frameworks introduce enterprise abstractions that complicate projects without adding clarity. AdonisJS focuses on a different approach.

It offers a practical development model that focuses on clarity, type safety, and maintainability rather than patterns for their own sake. The framework encourages good structure through conventions but never enforces heavy architectural layers.

The framework includes batteries such as routing, middleware, validation, and ORM out of the box, allowing teams to focus on application logic instead of building common patterns repeatedly.

AdonisJS APIs are functional and modern. You can use class-based components where a structured approach is helpful, such as in controllers, models, and services.

vs. Express/Fastify: AdonisJS provides structure and conventions that Express lacks, while remaining just as performant. Instead of assembling packages yourself, you get an integrated toolkit out of the box.

vs. NestJS: AdonisJS focuses on practical patterns over enterprise abstractions. No decorators everywhere, no dependency injection containers to configure, just straightforward TypeScript code that follows clear conventions.

vs. Laravel/Rails: If you love Laravel or Rails but work in Node.js, AdonisJS brings that same cohesive experience: migrations, seeders, factories, model relationships, and consistent conventions.

Choose AdonisJS when you want the productivity of a full-featured framework without the complexity of enterprise patterns or the fragmentation of minimal frameworks.

AdonisJS uses the Model-View-Controller (MVC) pattern to keep data, logic, and presentation separate. The view layer is optional and can be configured to fit your needs.

Most backend code, such as routing, controllers, models, and middleware, stays the same no matter how you render views. This flexibility allows you to start with server-side rendering and transition to a modern SPA setup later, without modifying your core backend logic.

AdonisJS has been in active development since 2015, with version 7 representing years of real-world usage and refinement. The framework is maintained by its creator full-time, with support from the core team members and an active community.

The ecosystem includes official packages for common backend needs, all maintained by the core team with the same quality standards. Community packages extend functionality for specific needs like payment processing, cloud storage, and third-party integrations.

All documentation, tooling, and packages follow semantic versioning, ensuring stable upgrades and long-term maintainability.

AdonisJS documentation is organized to guide both new and experienced developers:

If this is your first time using AdonisJS, then continue reading all the docs in the Start section and eventually build an app by following the Tutorial.

If you already know the basics, explore the Guides to learn specific topics like validation, database management, or testing.

---

## Installation - AdonisJS

**URL:** https://docs.adonisjs.com/installation

**Contents:**
- Installation
- Prerequisites
- Creating a new application
  - Available starter kits
- Project defaults
- Starting the development server
- What you just installed
  - Dev-server modes
- Exploring other commands
- Next steps

This guide explains how to set up a new AdonisJS application from scratch. It covers the prerequisites, project creation, and starting the development server. You do not need prior experience with AdonisJS, but basic knowledge of Node.js is useful.

Before you begin, make sure you have the following tools installed.

You can verify your installed versions using the following commands.

Check that your Node.js and npm versions meet these requirements before continuing. You can download the latest versions from the Node.js website or use a version manager like Volta/nvm.

AdonisJS provides the create-adonisjs initializer package to scaffold new applications. This package creates a new project directory with all necessary files, dependencies, and configuration based on your selections during the setup process.

Replace [project-name] with your desired project name. The initializer will create a new directory with that name and set up your AdonisJS application inside it.

This command starts an interactive setup and asks you to select a starter kit, or you may pre-define a starter kit using the --kit CLI option.

AdonisJS offers four official starter kits. Each kit sets up a different type of application, depending on how you want to build your user interface and manage interactivity.

Hypermedia Starter Kit. Uses Edge as the server-side templating engine and integrates Alpine.js to add lightweight, reactive behavior to your frontend. Ideal for applications that primarily render HTML on the server and only need minimal frontend logic.

React Starter Kit. Uses Inertia.js alongside React to build a fullstack React application powered by the AdonisJS backend. It can operate as a server-rendered app or a Single Page Application (SPA), depending on your configuration.

Vue Starter Kit. Similar to the React setup, but with Vue as the frontend framework. It utilizes Inertia.js and provides the same full-stack capabilities, including backend-driven routing, shared state, and SPA support.

API Starter Kit. A monorepo setup with two apps: an AdonisJS backend and an empty frontend project where you can configure any frontend framework of your choice (TanStack Start, Nuxt, Next.js, or others). End-to-end type-safety and shared transformer types are already configured between the backend and frontend.

All starter kits come pre-configured with sensible defaults, streamlined development workflows, and ready-to-use authentication features. For a detailed comparison and usage guidance, see the Pick your path guide.

Every newly created AdonisJS application includes:

These features help you get started quickly. You can customize, extend, or remove them as your project grows.

After creating your app, move into your project directory and start the development server.

Once the server is running, open your browser and visit http://localhost:3333. You should see the AdonisJS welcome page confirming your installation was successful.

The API starter kit is a monorepo managed by Turborepo. Start all apps from the project root:

This starts both the backend (AdonisJS) and frontend dev servers. The backend runs at http://localhost:3333 and returns a JSON response:

Your starter kit includes:

Pre-configured development environment. TypeScript, ESLint, Prettier, and Vite are set up with sensible defaults.

Database setup. Lucid ORM is configured with SQLite, ready for you to start building models and running migrations.

Organized project structure. Routes are defined in start/routes.ts, models live in app/models/, controllers are in app/controllers/, and middleware resides in app/middleware/. This convention keeps your codebase organized as it grows.

Working authentication. All starter kits include a fully functional authentication system with signup and login flows.

Try creating an account at http://localhost:3333/signup and logging in at http://localhost:3333/login. The users table already exists in your SQLite database (tmp/db.sqlite).

The authentication endpoints are available at POST /api/v1/auth/signup and POST /api/v1/auth/login. You can test them with any HTTP client (curl, Postman, or your frontend app). The users table already exists in your SQLite database (apps/backend/tmp/db.sqlite).

Hot Module Replacement (--hmr). This is the recommended approach for most development scenarios. HMR updates your application in the browser without requiring a full page reload, preserving your application's state while reflecting code changes instantly. This provides the fastest development feedback loop, especially when working on frontend components or styles.

File watching (--watch). This mode automatically restarts the entire server process when you make changes to your code. While this approach takes slightly longer than HMR since it requires a full restart, it ensures a clean application state with every change and can be useful when working on server-side logic or when HMR updates aren't sufficient.

The ace command-line tool includes many commands for development and production workflows.

To see all available commands, run the following.

**Examples:**

Example 1 (unknown):
```unknown
node -v
npm -v
```

Example 2 (elixir):
```elixir
npm create adonisjs@latest [project-name]
```

Example 3 (sass):
```sass
npm create adonisjs@latest [project-name] -- --kit=hypermedia
npm create adonisjs@latest [project-name] -- --kit=react
npm create adonisjs@latest [project-name] -- --kit=vue
npm create adonisjs@latest [project-name] -- --kit=api
```

Example 4 (unknown):
```unknown
node ace serve --hmr
```

---

## Governance - AdonisJS

**URL:** https://docs.adonisjs.com/governance

**Contents:**
- Governance
- Roles and responsibilities
  - Authors
  - Project Leads
  - Core team
    - Active Core Team Members
    - Core Team Emeriti
  - Contributors
  - Users
- Support

This document is based upon the Benevolent Dictator Governance Model by Ross Gardler and Gabriel Hanganu, licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. This document itself is also licensed under the same license.

Harminder Virk (the creator of AdonisJS) serves as the Project Author. The project author is responsible for the project's governance, standards, and direction. To summarize:

AdonisJS is a combination of several packages created and managed by the core team. All of these packages are led by a project lead selected by the project Author.

In almost every case, the creator of the package serves as the project lead since they are the ones who have put the initial efforts into bringing the idea to life.

The project lead has the final say in all aspects of decision-making within the project. However, because the community always has the ability to fork, this person is fully answerable to the community. It is the project lead's responsibility to set the strategic objectives of the project and communicate these clearly to the community. They also have to understand the community as a whole and strive to satisfy as many conflicting needs as possible while ensuring that the project survives in the long term.

In many ways, the role of the project lead is about diplomacy. The key is to ensure that, as the project expands, the right people are given influence over it, and the community rallies behind the vision of the project lead. The lead's job is then to ensure that the core team members (see below) make the right decisions on behalf of the project. Generally speaking, as long as the core team members are aligned with the project's strategy, the project lead will allow them to proceed as desired.

A project lead cannot archive or decide to remove the project from the AdonisJS umbrella. They can decide to stop working on the project, and in that case, we will find a new project lead.

Members of the core team are contributors who have made multiple valuable contributions to the project and are now relied upon to both write code directly to the repository and screen the contributions of others. In many cases, they are programmers, but it is also possible that they contribute in a different role, for example, community engagement. Typically, a core team member will focus on a specific aspect of the project and will bring a level of expertise and understanding that earns them the respect of the community and the project lead. The role of core team member is not an official one, it is simply a position that influential members of the community will find themselves in as the project lead looks to them for guidance and support.

Core team members have no authority over the overall direction of the project. However, they do have the ear of the project lead. It is a core team member's job to ensure that the lead is aware of the community's needs and collective objectives, and to help develop or elicit appropriate contributions to the project. Often, core team members are given informal control over their specific areas of responsibility, and are assigned rights to directly modify certain areas of the source code. That is, although core team members do not have explicit decision-making authority, they will often find that their actions are synonymous with the decisions made by the lead.

Active Core Team Members contribute to the project on a regular basis. An active core team member usually has one or more focus areas - in the most common cases, they will be responsible for the regular issue triaging, bug fixing, documentation improvements or feature development in a subproject repository.

Some core team members who have made valuable contributions in the past may no longer be able to commit to the same level of participation today due to various reasons. That is perfectly normal, and any past contributions to the project are still highly appreciated. These core team members are honored for their contributions as Core Team Emeriti, and are welcome to resume active participation at any time.

Contributors are community members who either have no desire to become core team members, or have not yet been given the opportunity by the project lead. They make valuable contributions, such as those outlined in the list below, but generally do not have the authority to make direct changes to the project code. Contributors engage with the project through communication tools, such as the RFC discussions, GitHub issues and pull requests, Discord chatroom, and the forum.

Anyone can become a contributor. There is no expectation of commitment to the project, no specific skill requirements and no selection process. To become a contributor, a community member simply has to perform one or more actions that are beneficial to the project.

Some contributors will already be engaging with the project as users, but will also find themselves doing one or more of the following:

As contributors gain experience and familiarity with the project, they may find that the project lead starts relying on them more and more. When this begins to happen, they gradually adopt the role of core team member, as described above.

Users are community members who have a need for the project. They are the most important members of the community: without them, the project would have no purpose. Anyone can be a user; there are no specific requirements.

Users should be encouraged to participate in the life of the project and the community as much as possible. User contributions enable the project team to ensure that they are satisfying the needs of those users. Common user activities include (but are not limited to):

Users who continue to engage with the project and its community will often find themselves becoming more and more involved. Such users may then go on to become contributors, as described above.

All participants in the community are encouraged to provide support for new users within the project management infrastructure. This support is provided as a way of growing the community. Those seeking support should recognize that all support activity within the project is voluntary and is therefore provided as and when time allows. A user requiring guaranteed response times or results should therefore seek to purchase a support contract. However, for those willing to engage with the project on its terms, and willing to help support other users, the community support channels are ideal.

For an open development project, money is less important than active contribution. However, some people or organizations are cash-rich and time-poor and would prefer to make their contribution in the form of cash. If you want to make a significant donation, you may be able to sponsor us to implement a new feature or fix some bugs. The project website provides clear guidance on how to go about donating.

If you run a business using the project as a revenue-generating product, it makes business sense to sponsor its development. It ensures the project that your product relies on stays healthy and actively maintained. It can also improve exposure in our community and make it easier to attract new developers.

AdonisJS (spelled with "JS" at the end) is a registered trademark of Harminder Virk.

Only the projects under the @adonisjs npm scope and the AdonisJS GitHub organization are managed and officially supported by the core team.

Also, you must not use the AdonisJS name or logos in a way that could mistakenly imply any official connection with or endorsement of AdonisJS. Any use of the AdonisJS name or logos in a manner that could cause customer confusion is not permitted.

This includes naming a product or service in a way that emphasizes the AdonisJS brand, like "AdonisJS UIKit" or "AdonisJS Studio", as well as in domain names like "adonisjs-studio.com".

Instead, you must use your own brand name in a way that clearly distinguishes it from AdonisJS.

Additionally, you may not use our trademarks for t-shirts, stickers, or other merchandise without explicit written consent.

Projects under the AdonisJS umbrella are the intellectual property of the Project Author. Once a project created by a project lead becomes part of the "AdonisJS GitHub organization," or if it is published under the @adonisjs npm scope, the project leads cannot delete or abandon the project.

---

## Development environment setup - AdonisJS

**URL:** https://docs.adonisjs.com/dev-environment

**Contents:**
- Development environment setup
- Overview
- Code editors and extensions
- TypeScript setup
  - Required TypeScript configuration
  - Development mode (JIT compilation)
  - Production mode (ahead-of-time compilation)
- ESLint and Prettier configuration
  - ESLint
  - Prettier

This guide covers the recommended development environment for AdonisJS applications. You will learn how to:

AdonisJS applications come with a fully configured development environment out of the box. TypeScript, ESLint, and Prettier are pre-configured with sensible defaults, allowing you to start building immediately without manual setup.

This guide explains what's already configured in your project, recommends optional editor extensions that enhance the development experience, and provides guidance on choosing a database for local development. Understanding these configurations helps you leverage the full capabilities of the framework and maintain consistency across your team.

AdonisJS works with any modern code editor that supports TypeScript. The framework does not rely on custom domain-specific languages (DSLs), so most editors provide full language support out of the box. The only framework-specific syntax is the Edge templating engine, which benefits from dedicated syntax highlighting extensions.

Provides IntelliSense for AdonisJS APIs, file generators, and command palette integration for running Ace commands.

Test runner integration for running individual tests or test suites directly from the editor.

Full syntax highlighting and basic autocomplete for Edge template files.

TypeScript is a first-class citizen in AdonisJS. Every application is created and runs using TypeScript by default, with all configuration handled automatically. Understanding how TypeScript works in development versus production, and the required compiler options, helps you make informed decisions about deployment and tooling.

AdonisJS requires specific TypeScript compiler options to function correctly. The framework relies heavily on experimental decorators for dependency injection, model definitions, and Ace commands.

The following tsconfig.json configuration represents the bare minimum required for AdonisJS applications.

In development, AdonisJS uses a Just-in-Time (JIT) compiler provided by the @poppinss/ts-exec package. This approach executes TypeScript files directly without a separate compilation step, enabling instant feedback when you save changes.

This differs from Node.js' native TypeScript support because AdonisJS requires:

Since Node.js' built-in TypeScript loader does not support these features, @poppinss/ts-exec provides the necessary compatibility layer.

For production deployments, AdonisJS compiles your TypeScript code into JavaScript using the official TypeScript compiler (tsc). This process generates a build/ directory containing transpiled .js files optimized for the Node.js runtime.

The compiled output includes:

See also: Deploying to production

AdonisJS projects include pre-configured ESLint and Prettier setups that enforce TypeScript best practices and maintain consistent code formatting across your team.

Most code editors support running ESLint and Prettier automatically on file save. Configuring this in your editor eliminates manual formatting steps and catches linting issues immediately.

The default ESLint configuration extends the AdonisJS base config, which includes rules for TypeScript, async/await patterns, and framework conventions. You can override or extend these rules in eslint.config.js as needed.

Prettier configuration is defined in package.json, ensuring all files are formatted consistently. The AdonisJS preset includes sensible defaults for indentation, quotes, and line length.

Run Prettier manually:

See also: ESLint configuration reference, Prettier configuration reference

AdonisJS applications are pre-configured with SQLite, a lightweight file-based database. SQLite requires no installation and stores data in a local tmp/database.sqlite file, allowing you to start building immediately without setting up external database servers.

However, most applications use PostgreSQL or MySQL in production. We recommend switching to your production database engine early in development to avoid schema differences and driver-specific behavior that can cause deployment issues.

You can use the following tools to run PostgreSQL or MySQL locally:

**Examples:**

Example 1 (json):
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "isolatedModules": true,
    "declaration": false,
    "outDir": "./build",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  },
  "include": ["**/*", ".adonisjs/server/**/*"]
}
```

Example 2 (json):
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "isolatedModules": true,
    "declaration": false,
    "outDir": "./build",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  },
  "references": [
    {
      "path": "./inertia/tsconfig.json"
    }
  ],
  "include": ["**/*", ".adonisjs/server/**/*"]
}
```

Example 3 (unknown):
```unknown
node ace build
```

Example 4 (sql):
```sql
import { configApp } from '@adonisjs/eslint-config'
export default configApp()
```

---

## Configuration & Environment - AdonisJS

**URL:** https://docs.adonisjs.com/configuration

**Contents:**
- Configuration & Environment
- Overview
- Configuration files
  - When config files are loaded
  - Accessing config in Edge templates
- Environment variables
  - The APP_KEY
  - Using environment variables in config files
  - Variable interpolation
  - Environment-specific .env files

This guide covers configuration in AdonisJS applications. You will learn about:

Configuration in AdonisJS is organized into three distinct systems, each serving a specific purpose.

Config files contain your application settings. These files live in the config directory and define things like database connections, mail settings, and session configuration.

Environment variables stored in the .env file hold runtime secrets and values that change between environments. API keys, database passwords, and environment-specific URLs belong here. AdonisJS supports multiple .env files for different environments and provides type-safe validation to catch missing variables at startup.

The adonisrc.ts file configures the framework itself. It tells AdonisJS how your workspace is organized, which providers to load, and which commands are available.

Configuration files live in the config directory at the root of your project. Each file exports a configuration object for a specific part of your application (database connections, mail settings, authentication, session handling, and so on).

A typical AdonisJS project includes several config files out of the box. The config/database.ts file configures database connections, config/mail.ts handles email delivery, and config/auth.ts defines authentication settings.

Here's what a database configuration file looks like.

Mail configuration follows a similar pattern.

Notice how this config file references environment variables through env.get(). This is the correct way to use environment-specific values in your configuration. The config file defines the structure and defaults, while the .env file provides the actual values.

Configuration files are loaded during the application boot cycle, before your routes and controllers are ready. This means you should keep config files simple and avoid importing application-level code like models, services, or controllers.

Config files should only import framework utilities, define configuration objects, and reference environment variables. Importing application code creates circular dependencies and will cause your app to fail during startup.

Edge templates have access to your application's configuration through the config global. This allows you to reference configuration values directly in your views without passing them explicitly from controllers.

The config() helper accepts a dot-notation path to any configuration value. The path corresponds to the config file name and the property within it. For example, config('database.connection') reads the connection property from config/database.ts.

You can also provide a default value as the second argument.

Environment variables store secrets and configuration that varies between environments. During development, you define these variables in the .env file. In production, you must define them through your hosting provider's UI or configuration interface.

A typical .env file looks like this.

The .env file is already listed in .gitignore in AdonisJS starter kits, so you won't accidentally commit secrets to your repository.

The APP_KEY is a special environment variable that AdonisJS uses for encrypting cookies, signing sessions, and other cryptographic operations. Every AdonisJS application requires an APP_KEY to function securely.

Run the generate:key command to create your APP_KEY.

This creates a cryptographically secure random key and adds it to your .env file automatically.

The APP_KEY must remain secret. Anyone with access to this key can decrypt your application's encrypted data and forge session tokens. When you deploy to production, use a different APP_KEY for each environment (development, staging, production). Never reuse keys across environments.

If your APP_KEY is compromised, generate a new one immediately. This will invalidate all existing user sessions and encrypted data.

Config files access environment variables through the env service, which provides type-safe access to your .env file values. You import the env service and call env.get() with the variable name.

This pattern keeps your configuration organized and validated. The env service ensures required variables are present and throws clear errors if they're missing.

You should never access environment variables directly in your controllers, services, or other application code. Always access them through config files. This creates a single source of truth for configuration.

The .env file supports variable interpolation, allowing you to reference other environment variables within a value. Use the $VAR or ${VAR} syntax to interpolate variables.

In this example, APP_URL resolves to http://localhost:3333. This is useful when you need to compose values from other variables without repeating yourself.

You can also use curly braces for clarity or when the variable name is adjacent to other characters.

To include a literal dollar sign in a value, escape it with a backslash.

AdonisJS supports multiple .env files for different environments and use cases. The framework loads these files in a specific order, with later files overriding earlier ones.

The loading order depends on your NODE_ENV value. For NODE_ENV=development, AdonisJS loads files in this order:

For NODE_ENV=test, the order is:

Note that .env.local is not loaded during tests. This prevents local development settings from interfering with test runs.

The .env.example file serves as documentation for your team. It lists all required environment variables with placeholder values, helping new developers set up their local environment. Unlike other .env files, you should commit .env.example to version control.

AdonisJS validates environment variables at startup through the start/env.ts file. This validation ensures your application won't start with missing or invalid configuration, catching errors early rather than at runtime when they're harder to debug.

The start/env.ts file uses schema based validation to define which environment variables your application expects, their types, and any constraints.

When your application starts, AdonisJS reads the .env file and validates each variable against this schema. If a required variable is missing or has an invalid value, the application throws a descriptive error and refuses to start.

The schema provides several validation methods.

Validates the value is a non-empty string. You can validate the string format by speficying one of the following formats.

Validates and casts the value to a number

Validates and casts the value to a boolean

Validates the value is one of the allowed options

Any schema method can be made optional by chaining .optional(). Optional variables return undefined if not set.

After validation, the env service provides full TypeScript type inference. When you call env.get('NODE_ENV'), TypeScript knows the return type is 'development' | 'production' | 'test' based on your schema definition.

The adonisrc.ts file configures the framework itself, not your application. While config files define your app's behavior and .env stores secrets, adonisrc.ts tells AdonisJS how your workspace is structured and which framework features to load.

You rarely need to modify this file directly. Most operations that require changes to adonisrc.ts are handled automatically by Ace commands. When you run node ace make:provider or node ace make:command, those commands register the new provider or command in your adonisrc.ts file for you.

Here's what a basic adonisrc.ts file contains.

The providers array lists all service providers that AdonisJS should load when your application starts. Providers set up framework features like database access, authentication, and session handling.

The commands array registers Ace commands from packages. Your application's commands in the commands directory are automatically discovered, so you only list package commands here.

The hooks object defines functions that run during specific lifecycle events. The buildStarting hook runs when you build your application for production.

You can learn more about the available properties in the AdonisRC file reference guide

**Examples:**

Example 1 (javascript):
```javascript
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'sqlite',
  prettyPrintDebugQueries: true,
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
```

Example 2 (typescript):
```typescript
import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: env.get('MAIL_MAILER'),

  from: {
    address: env.get('MAIL_FROM_ADDRESS'),
    name: env.get('MAIL_FROM_NAME'),
  },

  mailers: {
    resend: transports.resend({
      key: env.get('RESEND_API_KEY'),
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
```

Example 3 (html):
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{ config('app.appName') }}</title>
</head>
<body>
  <footer>
    <p>Running in {{ config('app.nodeEnv') }} mode</p>
  </footer>
</body>
</html>
```

Example 4 (typescript):
```typescript
<p>{{ config('app.timezone', 'UTC') }}</p>
```

---

## Upgrade guide - AdonisJS

**URL:** https://docs.adonisjs.com/v6-to-v7

**Contents:**
- Upgrading from v6 to v7
- Helpful links
- Upgrade to Node.js 24
- Upgrade using a coding agent
- Upgrade all packages
- Replace the TypeScript JIT compiler
- Install Youch as a project dependency
- Configure hooks in adonisrc.ts
- Assembler hooks have been renamed
- Update the tests glob pattern

AdonisJS v7 is a major release after two years of v6. This guide covers the changes you must make to upgrade your existing v6 application.

We have worked hard to keep the breaking changes surface area low. Yet, there are some breaking changes, and certain updates are necessary. At a foundational level:

AdonisJS v7 requires Node.js 24 or above. Older Node.js versions are no longer supported. Make sure you update your local development environment, CI pipelines, and production servers before proceeding with the rest of this guide.

Use the following prompt with your coding agent (Cursor, Claude Code, Copilot, etc.) to handle the mechanical parts of the upgrade. Review the changes it makes against the breaking changes listed above.

Update every @adonisjs/* package in your project to its latest version. You must also upgrade @vinejs/vine, edge.js and Inertia depedencies to their latest versions.

Following is a cross-platform script you can run to automatically find AdonisJS specific dependencies within your project's package.json file and update them in one go.

We have replaced ts-node (and ts-node-maintained) with @poppinss/ts-exec as the JIT compiler. Remove the old packages and install the new one.

Then update the import in your ace.js file.

Youch is no longer bundled inside @adonisjs/ace and @adonisjs/http-server. It has been rewritten from scratch, but this does not impact your application code since Youch is consumed internally by the framework. You just need to install it as a dev dependency.

v7 introduces a new hooks system in adonisrc.ts. You must add the indexEntities hook at a minimum. Depending on your stack, you will need additional hooks for Inertia, Tuyau, Bouncer, and Vite.

If your app uses Tuyau, make sure to install the @tuyau/core package.

The following example shows a complete hooks configuration. Include only the hooks relevant to your stack.

The assembler hook names have changed. If you were using the onBuildStarting hook (the most common one, used for Vite), update it to buildStarting.

The full list of renamed hooks is as follows.

We replaced the glob package with the Node.js built-in glob helper. This requires a small syntax change in the test file patterns inside adonisrc.ts.

The assetsBundler property in adonisrc.ts is no longer in use. Remove it to resolve the TypeScript error you will see after upgrading.

The appKey export from config/app.ts is no longer used for encryption. Instead, you must create a dedicated config/encryption.ts file. The APP_KEY environment variable is still in use.

v6 apps must use the legacy driver to continue decrypting existing data. Learn more about new Encryption drivers

Resolving the encryption binding from the container now returns an instance of EncryptionManager instead of the Encryption class. This is because the rewritten encryption package supports multiple algorithms and uses a manager to switch between them.

If you were resolving the Encryption class from the container and passing it as a dependency, fix this by resolving the class constructor directly.

The router.makeUrl and router.makeSignedUrl methods have been deprecated. Use the new type-safe urlFor helper instead.

Inside Edge templates, the route helper is deprecated in favor of urlFor.

The following helpers have been removed from @adonisjs/core/helpers. Each one has a straightforward replacement.

The Request and Response classes in the HTTP package have been renamed to HttpRequest and HttpResponse. This avoids conflicts with the globally available platform-native Request and Response classes.

Most projects will not be affected since the majority of codebases interact with the HttpContext object rather than importing these classes directly. However, you will need to update your code if you extend these classes, use module augmentation to add custom properties, or register macros on them.

The deprecated errors key has been removed from the flash messages store.

Validation errors have always been available under the inputErrorsBag key. The errors key was a duplicate that unnecessarily increased session payload size.

If your templates or frontend code read from errors, update them to use inputErrorsBag instead.

Calling request.all() method now returns a merged object containing both request fields and multipart files. Previously, it only returned fields.

The request.allFiles(), request.file(name), and request.files(name) methods continue to work as before.

Routes that use controllers now automatically receive a generated name. This can cause a conflict:

The status pages rendered by the global exception handler are no longer returned when the request's Accept header asks for a JSON response. API clients will now receive JSON error responses instead of rendered HTML pages. This was a bug fix, but it changes behavior if your API consumers were previously receiving HTML error pages.

The BaseModifiers class has been removed in the latest version of VineJS. In most cases, this will not affect your application. However, if you were extending or directly using BaseModifiers for a custom use case, you will need to adjust your implementation. See the VineJS v4 release notes for details.

Shutdown hooks now execute in reverse order (last registered, first executed). This is a bug fix that aligns with the expected behavior of cleanup logic, but it may affect your app if you relied on the previous (incorrect) ordering.

The Inertia integration has been significantly reworked in v7. The goals were to bring end-to-end type safety to the render method and page props, add first-class support for Transformers when computing props, and align with upstream changes in the Inertia ecosystem.

The inertia.render method is now type-safe. This may surface TypeScript errors in your application where invalid or incomplete data was previously allowed.

The following changes have been made to the config/inertia.ts file.

The Inertia entrypoint and SSR files have been moved out of the app subdirectory and now live directly in the inertia root.

The exact file extension depends on your framework. For example, Vue apps will use inertia/app.ts and inertia/ssr.ts.

The sharedData property in config/inertia.ts has been removed. You must create an Inertia middleware to define shared data instead and register it as a server middleware in the kernel file.

The share method receives the HttpContext, which may not be fully hydrated if a response is sent before the request reaches the route handler (for example, during a 404). Guard your property access carefully.

Following is the default middleware file. Since, you are upgrading from v6, there will not be a UserTransformer in your app. So feel free to remove this import and serialize the user as you are doing it in other parts of your codebase.

You must create a new tsconfig.inertia.json file to avoid circular reference issues between the Inertia frontend codebase and the backend codebase.

This circular reference occurs because the codegen has the Inertia app referencing backend code, and the backend code referencing Inertia pages for inferring prop types.

Create the file in the root of your project.

Then add a references entry to your main tsconfig.json.

Add the following entries to the imports field in your package.json. These are in addition to any existing aliases your project already has.

**Examples:**

Example 1 (javascript):
```javascript
npm i $(node -e "const pkg = require('./package.json'); const deps = {...pkg.dependencies, ...pkg.devDependencies}; console.log(Object.keys(deps).filter(k => k.startsWith('@adonisjs/') || k === '@vinejs/vine' || k === 'edge.js' || k === '@japa/plugin-adonisjs' || k === 'vite' || k === 'argon2').map(k => k + '@latest').join(' '))") --force
```

Example 2 (elixir):
```elixir
npm uninstall ts-node ts-node-maintained @swc/core
npm install -D @poppinss/ts-exec
```

Example 3 (elixir):
```elixir
import 'ts-node-maintained/register/esm'
import '@poppinss/ts-exec'
```

Example 4 (unknown):
```unknown
npm install -D youch
```

---

## FAQs - AdonisJS

**URL:** https://docs.adonisjs.com/faqs

**Contents:**
- Frequently Asked Questions
- Is AdonisJS actively maintained?
- How does AdonisJS compare to Express, NestJS, and Fastify?
- Is AdonisJS production-ready?
- Does AdonisJS support TypeScript natively?
- Who maintains AdonisJS?
- Where can I get help with AdonisJS?
- Can I use AdonisJS for building APIs?

Yes, AdonisJS is actively maintained with regular updates, bug fixes, and feature additions. The framework has been consistently developed since 2015 and receives continuous attention from its core team.

You can verify maintenance activity by checking OSS Insights, which shows comprehensive metrics across the entire AdonisJS GitHub organization including recent commits, responsive issue discussions, and release patterns.

AdonisJS is a full-stack, batteries-included framework that provides complete development solutions out of the box. This contrasts with Express and Fastify's minimalist approach and differs from NestJS's heavily opinionated enterprise architecture.

Compared to Express: AdonisJS offers built-in features for authentication, validation, ORM, and sessions, whereas Express requires you to choose and integrate these pieces yourself. AdonisJS provides more structure and convention, while Express offers maximum flexibility.

Compared to NestJS: Both frameworks support TypeScript natively and provide structured architecture. NestJS emphasizes Angular-style decorators and enterprise patterns, while AdonisJS follows Laravel-inspired conventions with a simpler learning curve. AdonisJS is also faster to embrace modern Node.js primitives like ESM, making it more aligned with current JavaScript ecosystem standards.

Compared to Fastify: Fastify focuses on maximum performance with minimal overhead, while AdonisJS prioritizes developer productivity with comprehensive built-in features. Both deliver excellent performance, but AdonisJS includes more functionality by default.

Choose AdonisJS when you want a complete framework with built-in solutions and Laravel-style development experience in Node.js. Choose alternatives when you need maximum flexibility (Express), enterprise patterns (NestJS), or minimal abstraction (Fastify).

Yes, AdonisJS is production-ready and has powered thousands of applications since 2015, ranging from small startups to large-scale enterprise systems. The framework handles high-traffic scenarios efficiently and follows security best practices by default.

Companies using AdonisJS in production include Marie Claire, Ledger, Kayako, Renault Group, Zakodium, FIVB, Petpooja, Paytm, Verifiables, Pappers, Edmond de Rothschild, France Travail, and many more.

While production-ready, consider that the AdonisJS community is smaller than Express or Next.js communities, which means fewer Stack Overflow answers and potentially more challenging hiring. However, developers familiar with TypeScript and modern frameworks become productive quickly, and the official documentation is comprehensive.

The framework deploys successfully to all major hosting platforms including traditional VPS providers, Docker containers, and modern platforms like Railway, Render, and Fly.io.

Yes, AdonisJS is built with TypeScript from the ground up and provides first-class TypeScript support. Unlike frameworks where TypeScript is an optional add-on, AdonisJS is designed specifically for TypeScript and leverages its full power.

When you create a new AdonisJS project, TypeScript is already configured with optimal settings. The build system, type checking, and development workflow work seamlessly without additional setup. Every framework API is fully typed, providing complete IntelliSense and compile-time error checking.

The framework uses advanced TypeScript features to infer types automatically, meaning you get type safety without writing excessive type annotations. For example, validation schemas automatically infer the validated data type, and models automatically provide types for all properties and methods.

TypeScript compiles away during the build process, so there's no runtime overhead. Your production code runs as optimized JavaScript with the same performance as hand-written JavaScript.

AdonisJS is primarily maintained by Harminder Virk , who created the framework in 2015 and continues to lead its development. The framework also has a small core team of contributors who help with specific areas like documentation, package maintenance, and community support.

Harminder works on AdonisJS full-time as his primary professional focus, not as a side project. This ensures consistent attention, timely issue responses, and regular feature development. The framework receives financial support through the Insiders and Partners programs, enabling sustainable full-time maintenance.

While some developers worry about frameworks maintained primarily by one person, this model has proven sustainable for nearly a decade. A single maintainer ensures coherent vision, consistent code quality, and fast decision-making. Many successful open-source projects (Linux, Ruby on Rails, Laravel, Vue.js) have followed similar models successfully.

The codebase is well-documented and structured to enable community contributions. The framework is open source under the MIT license, ensuring the code remains accessible regardless of future circumstances.

The primary support channel is the official Discord server, where community members and core team typically respond within hours. The server has dedicated channels for different topics including general help, database questions, and deployment issues.

For longer-form questions or architectural advice, use GitHub Discussions. For bug reports and feature requests, use GitHub Issues. The official documentation is comprehensive and answers most common questions.

To get better answers faster, provide clear context, share relevant code snippets, include complete error messages, specify your environment (versions), and explain what you've already tried.

Yes, AdonisJS is excellent for building APIs and many developers choose it primarily for API development. The framework provides extensive built-in features specifically designed for APIs, including RESTful resource routing, built-in validation with VineJS, multiple authentication schemes, transformers for serializing data, CORS handling, and rate limiting support.

---

## Releases (Resources) - AdonisJS

**URL:** https://docs.adonisjs.com/releases

**Contents:**
- Framework and package release timeline
- Version tags and changelog links
- Monthly release groups

The releases page lists changes across the AdonisJS ecosystem and links each entry to its GitHub release note.

Use this page to verify the latest stable versions and to cross-check breaking changes before upgrades.

For migration planning, pair this page with the official upgrade guide.

---
