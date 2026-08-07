# Getting Started — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [introduction](https://docs.adonisjs.com/introduction)
- [stacks-and-starter-kits](https://docs.adonisjs.com/stacks-and-starter-kits)
- [installation](https://docs.adonisjs.com/installation)
- [folder-structure](https://docs.adonisjs.com/folder-structure)
- [dev-environment](https://docs.adonisjs.com/dev-environment)
- [configuration](https://docs.adonisjs.com/configuration)
- [deployment](https://docs.adonisjs.com/deployment)
- [faqs](https://docs.adonisjs.com/faqs)
- [releases](https://docs.adonisjs.com/releases)
- [contributing](https://docs.adonisjs.com/contributing)
- [governance](https://docs.adonisjs.com/governance)

## Condensed excerpts (prefer live docs if conflict)

### introduction
Source: https://docs.adonisjs.com/introduction

Introduction (Getting started) - AdonisJS Documentation 

Introduction 

Introduction 
AdonisJS is a backend-first, type-safe framework for building web applications with Node.js and TypeScript. It provides the core building blocks for writing and maintaining complete backends, eliminating the need for third-party services to handle common features such as authentication, file uploads, caching, and rate limiting . 
Each AdonisJS application is written in TypeScript, runs in ESM mode, and offers end-to-end type safety across the entire stack. 
Who is AdonisJS for? 
AdonisJS is designed for developers building production web applications who need more structure than Express but less ceremony than enterprise frameworks. If you're building REST APIs, server-rendered applications, or full-stack web apps, and you value conventions over configuration, AdonisJS will feel natural. 
If you're coming from Laravel, Rails, or Django, you'll recognize the MVC patterns and conventions. If you've worked with Express or Fastify, you'll appreciate having structure and batteries included without sacrificing simplicity. 
Why AdonisJS 
AdonisJS provides the structure, consistency, and tooling expected from a full-featured framework, while remaining lightweight and modern in design. 
It is suitable for teams that value: 
Ownership of backend logic : Build critical features in-house rather than depending on external services for authentication, rate-limiting, or background jobs. 

Cohesive developer experience : Every AdonisJS application follows the same conventions and directory structure, making it easy to onboard new developers and share knowledge across teams. 

Unified ecosystem : Core features are maintained together under consistent quality standards, eliminating dependency fragmentation. 

Extensibility and freedom : Core features are built from low-level packages that you can use directly to create custom flows, integrations, or abstractions. 

AdonisJS is designed to provide everything you need for real-world backend applications, while remaining approachable and easy to configure. 
What can you build with AdonisJS? 
AdonisJS is designed for real-world backend applications: 
REST APIs : Build type-safe APIs for mobile apps or SPAs. Companies use AdonisJS to power APIs serving millions of requests. 

Full-stack web applications : Use Edge templates for server-rendered pages, or pair with Vue/React for hybrid applications. The MVC structure keeps your backend organized as your app grows. 

SaaS platforms : Build multi-tenant applications without relying on third-party services for core functionality like authentication, authorization, or background jobs. 

Whether you're building a startup MVP or a production system serving thousands of users, AdonisJS provides the foundation without getting in your way. 
Practical, not overengineered 
Many frameworks introduce enterprise abstractions that complicate projects without adding clarity. AdonisJS focuses on a different approach. 
It offers a practical development model that focuses on clarity, type safety, and maintainability rather than patterns for their own sake. The framework encourages good structure through conventions but never enforces heavy architectural layers. 
The framework includes batteries such as routing, middleware, validation, and ORM out of the box, allowing teams to focus on application logic instead of building common patterns repeatedly. 
AdonisJS APIs are functional and modern. You can use class-based components where a structured approach is helpful, such as in controllers, models, and services. 
How AdonisJS compares 
vs. Express/Fastify : AdonisJS provides structure and conventions that Express lacks, while remaining just as performant. Instead of assembling packages yourself, you get an integrated toolkit out of the box. 
vs. NestJS : AdonisJS focuses on practical patterns over enterprise abstractions. No decorators everywhere, no dependency injection containers to configure, just straightforward TypeScript code that follows clear conventions. 
vs. Laravel/Rails : If you love Laravel or Rails but work in Node.js, AdonisJS brings that same cohesive experience: migrations, seeders, factories, model relationships, and consistent conventions. 
Choose AdonisJS when you want the productivity of a full-featured framework without the complexity of enterprise patterns or the fragmentation of minimal frameworks. 
MVC with a configurable view layer 
AdonisJS uses the Model-View-Controller (MVC) pattern to keep data, logic, and presentation separate. The view layer is optional and can be configured to fit your needs. 
You can use: 
Edge , the official server-side templating engine, for traditional full-stack applications. 
Vue , React , or another frontend framework to build a single-page or hybrid application. 
Or skip the view layer entirely when building an API-first or backend-only service. 
Most backend code, such as routing, controllers, models, and middleware, stays the same no matter how you render views. This flexibility allows you to start with server-side rendering and transition to a modern SPA setup later, without modifying your core backend logic. 
Ecosystem and stability 
AdonisJS has been in active development since 2015, with version 7 representing years of real-world usage and refinement. The framework is maintained by its creator full-time, with support from the core team members and an active community. 
The ecosystem includes  [link:https://adonisjs.com/packages] official packages for common backend needs, all maintained by the core team with the same quality standards. Community packages extend functionality for specific needs like payment processing, cloud storage, and third-party integrations. 
All documentation, tooling, and packages follow semantic versioning, ensuring stable upgrades and long-term maintainability. 
Next steps 
AdonisJS documentation is organized to guide both new and experienced developers: 
If this is your first time using AdonisJS, then continue reading all the docs in the Start section and eventually build an app by following the  [link:/tutorial/hypermedia/overview] Tutorial . 

If you already know the basics, explore the  [link:/guides/basics/routing] Guides to learn specific topics like validation, database management, or testing. 

 [link:/stacks-and-starter-kits] Pick your path Understand AdonisJS's approach to frontend development and choose between Hypermedia, Inertia, and API-only stacks for your application. 

Next

---

### stacks-and-starter-kits
Source: https://docs.adonisjs.com/stacks-and-starter-kits

Pick your path (Getting started) - AdonisJS Documentation 

Pick your path 

Pick your path 
This guide introduces AdonisJS's approach to frontend development and the three primary stacks you can choose from. You will learn: 
Why AdonisJS is backend-first but frontend-flexible. 
Understand the difference between Hypermedia, Inertia, and API-only approaches. 
See how the View layer works in each stack. 
Learn about the starter kits that provide opinionated setups for each approach. 
Overview 
AdonisJS is deeply opinionated about the backend, providing built-in authentication, authorization, validation, database tooling, and more, but deliberately flexible about the frontend . This backend-first philosophy means you get a robust foundation for building your server-side logic while choosing how you build your user interface. 
You can create traditional server-rendered applications, modern single-page applications, or anything in between, all using the same backend framework. A marketing website has different requirements than an admin dashboard, which differs from a mobile app's API backend. Rather than forcing you into a single approach, AdonisJS lets you choose the frontend stack that fits your needs. 
The three approaches 
AdonisJS supports three primary approaches to building your frontend. Each approach represents a different way of thinking about the View layer in your application's architecture. 
Hypermedia 
Hypermedia applications generate complete HTML pages on the server and send them to the browser. You build your interface using a template engine (AdonisJS provides  [link:https://edgejs.dev] Edge ) and add interactivity using lightweight JavaScript libraries like Alpine.js or HTMX/Unpoly when needed. 
What is Hypermedia 
The term "Hypermedia" refers to HTML as a medium for building interactive applications, where the server drives the application state and the client (browser) displays it. If you're new to this concept, the HTMX project has an excellent essay explaining  [link:https://htmx.org/essays/hypermedia-driven-applications/] Hypermedia-driven applications in depth. 

In a Hypermedia application: 
The server is responsible for rendering your views. 
Your controllers return HTML instead of JSON. 
Navigation between pages happens through traditional page loads or progressively enhanced requests. 
This approach embraces the web's native capabilities and keeps most of your application's logic on the server where you have full control. 
Choose this approach when you want to build applications with the server in control, or you want to minimize the amount of JavaScript your users download. Hypermedia applications can be highly interactive using libraries like Alpine.js and HTMX while keeping your frontend codebase lean and your deployment simple. 
Inertia (React or Vue) 
Inertia.js provides a middle ground between server-rendered templates and SPAs. You use React or Vue components as your views while keeping server-side routing and controllers. AdonisJS officially supports building applications with React or Vue through Inertia, giving you the component-based development experience of modern frontend frameworks without the complexity of maintaining a separate single-page application. 
With Inertia: 
Your backend routes map directly to frontend components, eliminating the complexity of dual routing systems. 
Your controllers return data to Inertia components instead of rendering templates or returning JSON. 
Navigation feels like a single-page application with smooth transitions, but your routing logic stays on the server where it's easier to protect and maintain. 
Inertia also simplifies form submissions and data fetching while keeping your application a monolithic deployment. You get a modern, reactive user experience without building and maintaining a separate API layer. 
Choose this approach when you want to use React or Vue but prefer server-side routing, you want to avoid the complexity of separate frontend and backend deployments, or you want a tightly integrated full-stack development experience. Visit  [link:https://inertiajs.com] inertiajs.com to learn more about how Inertia bridges the gap between server-side and client-side frameworks. 
API-only 
You can build a JSON API backend with AdonisJS while your frontend lives in a completely separate codebase. This approach creates a clear separation where AdonisJS handles all backend logic and exposes data through API endpoints, while your frontend application (built with any framework) consumes these endpoints. 
In an API-only setup: 
Your controllers return JSON responses. 
Your frontend and backend are separate deployments with their own build processes, repositories (or monorepo), and deployment pipelines. 
The two communicate exclusively through HTTP requests to your API endpoints. 
Note 
In monorepos, you can use a  [link:/guides/frontend/api-client] type-safe API client for true end-to-end typing across backend and frontend.  [link:/guides/frontend/transformers] Transformers also produce reusable, independent response types, so your UI can rely directly on the serialized API contract. 

This approach covers a wide variety of applications: APIs for mobile apps (iOS, Android), web applications built with any frontend framework, desktop applications, or even multiple frontends (web and mobile) consuming the same API. The separation provides flexibility in how you deploy and scale each layer independently. 
Choose this approach when you're building an API that serves multiple client applications, your team prefers working with separate frontend and backend repositories, you need independent deployment and scaling of frontend and backend, or you're building a public API that external developers will consume. 
The same controller, three different returns 
In the following example, you can see us using the same route, same controller, same data fetching logic. Only the return statement changes. 
Hypermedia Inertia API-only start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.Posts, 'index'])
```

app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    const posts = await Post.all()
    return view.render('posts/index', { posts }) 
  }
}
```

views/pages/posts/index.edge 

```
@each(post in posts)
  <div>
    <h2>{{ post.title }}</h2>
  <div>
@end
```

start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.Posts, 'index'])
```

app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### installation
Source: https://docs.adonisjs.com/installation

Installation (Getting started) - AdonisJS Documentation 

Installation 

Installation 
This guide explains how to set up a new AdonisJS application from scratch. It covers the prerequisites, project creation, and starting the development server. You do not need prior experience with AdonisJS, but basic knowledge of Node.js is useful. 
Prerequisites 
Before you begin, make sure you have the following tools installed. 
Node.js ≥ 24.x 
npm ≥ 11.x 
You can verify your installed versions using the following commands. 

Check that your Node.js and npm versions meet these requirements before continuing. You can download the latest versions from the  [link:https://nodejs.org/] Node.js website or use a version manager like Volta/nvm. 
Creating a new application 
AdonisJS provides the initializer package to scaffold new applications. This package creates a new project directory with all necessary files, dependencies, and configuration based on your selections during the setup process. 
Replace with your desired project name. The initializer will create a new directory with that name and set up your AdonisJS application inside it. 

```
npm create adonisjs@latest [project-name]
```

This command starts an interactive setup and asks you to select a starter kit, or you may pre-define a starter kit using the CLI option. 
Create a new Hypermedia application 

```
npm create adonisjs@latest [project-name] -- --kit=hypermedia
```

Create a new React application 

```
npm create adonisjs@latest [project-name] -- --kit=react
```

Create a new Vue application 

```
npm create adonisjs@latest [project-name] -- --kit=vue
```

Create a new API application 

```
npm create adonisjs@latest [project-name] -- --kit=api
```

Official starter kits 
AdonisJS offers four official starter kits. Each kit sets up a different type of application, depending on how you want to build your user interface and manage interactivity. 
 [link:https://github.com/adonisjs/starter-kits/tree/main/hypermedia] Hypermedia Starter Kit . Uses Edge as the server-side templating engine and integrates Alpine.js to add lightweight, reactive behavior to your frontend. Ideal for applications that primarily render HTML on the server and only need minimal frontend logic. 

 [link:https://github.com/adonisjs/starter-kits/tree/main/inertia-react] React Starter Kit . Uses Inertia.js alongside React to build a fullstack React application powered by the AdonisJS backend. It can operate as a server-rendered app or a Single Page Application (SPA), depending on your configuration. 

 [link:https://github.com/adonisjs/starter-kits/tree/main/inertia-vue] Vue Starter Kit . Similar to the React setup, but with Vue as the frontend framework. It utilizes Inertia.js and provides the same full-stack capabilities, including backend-driven routing, shared state, and SPA support. 

 [link:https://github.com/adonisjs/starter-kits/tree/main/api] API Starter Kit . A monorepo setup with two apps: an AdonisJS backend and an empty frontend project where you can configure any frontend framework of your choice (TanStack Start, Nuxt, Next.js, or others). End-to-end type-safety and shared transformer types are already configured between the backend and frontend. 

All starter kits come pre-configured with sensible defaults, streamlined development workflows, and ready-to-use authentication features. For a detailed comparison and usage guidance, see the  [link:/stacks-and-starter-kits] Pick your path guide. 
Community starter kits 
In addition to the official kits, the AdonisJS community also maintains starter kits for specific use cases. 
 [link:https://github.com/batosai/adonisjs-slim-starter-kit] Slim Starter Kit . A minimal AdonisJS v7 setup with the framework core and Japa test runner, designed for teams that want to start from a lightweight foundation. 

 [link:https://github.com/batosai/adonisjs-mcp-starter-kit] MCP Starter Kit . A minimal AdonisJS v7 setup with built-in MCP support, useful when you want to expose MCP tools, resources, and prompts in your application. 

Project defaults 
Every newly created AdonisJS application includes: 
Opinionated folder structure. 
 [link:https://lucid.adonisjs.com] Lucid ORM configured with SQLite as the default database. 
Built-in authentication flows for login and signup. 
ESLint and Prettier setup with pre-defined configuration. 
These features help you get started quickly. You can customize, extend, or remove them as your project grows. 
Starting the development server 
After creating your app, move into your project directory and start the development server. 
Hypermedia / Inertia kits API kit 

Once the server is running, open your browser and visit  [link:http://localhost:3333] http://localhost:3333 . You should see the AdonisJS welcome page confirming your installation was successful. 

The API starter kit is a monorepo managed by  [link:https://turbo.build/repo] Turborepo . Start all apps from the project root: 

This starts both the backend (AdonisJS) and frontend dev servers. The backend runs at  [link:http://localhost:3333] http://localhost:3333 and returns a JSON response: 

What you just installed 
Your starter kit includes: 
Pre-configured development environment . TypeScript, ESLint, Prettier, and Vite are set up with sensible defaults. 

Database setup . Lucid ORM is configured with SQLite, ready for you to start building models and running migrations. 

Organized project structure . Routes are defined in , models live in , controllers are in , and middleware resides in . This convention keeps your codebase organized as it grows. 

Working authentication . All starter kits include a fully functional authentication system with signup and login flows. 

Hypermedia / Inertia kits API kit Try creating an account at  [link:http://localhost:3333/signup] http://localhost:3333/signup and logging in at  [link:http://localhost:3333/login] http://localhost:3333/login . The table already exists in your SQLite database ( ). 

The authentication endpoints are available at 
```
POST /api/v1/auth/signup
```
and 
```
POST /api/v1/auth/login
```
. You can test them with any HTTP client (curl, Postman, or your frontend app). The table already exists in your SQLite database ( 
```
apps/backend/tmp/db.sqlite
```
). 

Dev-server modes 
Hot Module Replacement (--hmr) . This is the recommended approach for most development scenarios. HMR updates your application in the browser without requiring a full page reload, preserving your application's state while reflecting code changes instantly. This provides the fastest development feedback loop, especially when working on frontend components or styles. 

File watching (--watch) . This mode automatically restarts the entire server process when you make changes to your code. While this approach takes slightly longer than HMR since it requires a full restart, it ensures a clean application state with every change and can be useful when working on server-side logic or when HMR

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### folder-structure
Source: https://docs.adonisjs.com/folder-structure

Folder structure (Getting started) - AdonisJS Documentation 

Folder structure 

Folder structure 
When you create a new AdonisJS application, it comes with a thoughtful default folder structure designed to keep projects tidy, predictable, and easy to refactor. 
This structure reflects conventions that work well for most projects, but AdonisJS does not lock you into them. You are free to reorganize files and directories to suit your team's workflow. 
Depending on the starter kit you select, some files or directories may differ. For example, the Inertia starter kit contains a top-level folder, whereas the Hypermedia starter kit does not include this folder. 
Overview 
Here's what a freshly created AdonisJS project looks like. 
Hypermedia / Inertia kits API kit 
```
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

The API starter kit is a monorepo with two workspaces managed by  [link:https://turbo.build/repo] Turborepo : 

```
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

The directory contains a standard AdonisJS application — all the sections below ( , , , etc.) apply to that directory. The directory is where you set up your frontend framework (TanStack Start, Next.js, Nuxt, or others). 
The root defines the workspaces: 

```
{
  "workspaces": ["apps/*"]
}
```

And configures the , , and other scripts to run across both apps. When you run from the project root, Turborepo starts both the backend and frontend dev servers in parallel. 

Each directory and file has a specific purpose. The sections below explain the role of each item and what you are likely to find there. 

The directory organizes code for the domain logic of your application. For example, the controllers, models, mails, middleware, etc., all live within the directory. 
Feel free to create additional folders in the directory to better organize your codebase. 

```
├── app
│   ├── controllers
│   ├── exceptions
│   ├── mails
│   ├── middleware
│   ├── models
│   ├── transformers
│   └── validators
```

The directory contains the entry point files used to start your AdonisJS application in different environments. 
The file uses the Ace commandline framework to execute CLI commands. 
The file starts the application in the web environment to listen for HTTP requests. 
The file is used to boot the application for the testing environment. 
You usually won't need to modify these files unless you want to customize how the app boots in a
specific context. 

```
├── bin
│   ├── console.ts
│   ├── server.ts
│   └── test.ts
```

All application and third-party configuration files live inside the directory. You can also store config local to your application inside this directory. 

```
├── config
│   ├── app.ts
│   ├── auth.ts
│   ├── bodyparser.ts
│   ├── database.ts
│   ├── hash.ts
│   ├── limiter.ts
│   ├── logger.ts
│   ├── mail.ts
│   ├── session.ts
│   ├── shield.ts
│   ├── static.ts
│   └── vite.ts
```

The directory holds artifacts related to the database layer. By default, AdonisJS ships with Lucid ORM configured for SQLite; switching databases does not require reorganizing this folder. 
- versioned schema changes 
- scripts to insert initial or test data 
- blueprints for generating model instances in tests or seeders 
- auto-generated database schema used by models 
- auto-generated schema rules used by validators 
See also:  [link:https://lucid.adonisjs.com] Lucid documentation 

```
database/
  ├── migrations/
  ├── seeders/
  ├── factories/
  ├── schema.ts
  └── schema_rules.ts
```

The directory is used to store the  [link:/guides/concepts/service-providers] service providers used by your application. You can create new providers using the 
```
node ace make:provider
```
command. 

```
├── providers
│  └── app_provider.ts
```

The directory contains raw static assets that are served directly to the browser without any compilation step. Files in this directory are publicly accessible over HTTP using the 
```
http://localhost:3333/public/<file-name>
```
URL. 
Note 
The API starter kit does not include a directory, since the backend serves only JSON responses and does not serve static assets. 

Typical examples of files stored in this folder include: 
Favicon 
Robots file 
Static images 
```
(logo.png, social-banner.jpg)
```

Downloadable assets 

The directory stores Edge templates and uncompiled frontend assets such as CSS and JavaScript files. 
Note 
The API starter kit does not include a directory, since the backend serves only JSON responses and does not render HTML templates. 

For applications using Inertia (alongside Vue or React), the frontend code is kept within the directory, and the directory contains only the root Edge template. Think of this root template as the file that contains the HTML shell for your frontend application. 
Hypermedia app Inertia app 
```
├── resources
│   ├── css
│   ├── js
│   └── views
│       ├── home.edge
```

```
├── resources
│   └── views
│       └── inertia_layout.edge
```

The directory exists only in projects using the Inertia starter kit. It represents a sub-application containing the frontend source code, including React or Vue components, pages, and supporting utilities. 
- stores your Inertia pages written in React or Vue. 
- the main entry point for the client-side application. 
- the entry point for server-side rendering (SSR). 
- The TypeScript config file for the frontend codebase. The defaults are optimized for browser environments, JSX/TSX syntax, and Vite-based builds 
You are free to create additional subfolders, such as , , or , to organize your frontend code. 

```
├── inertia
│   ├── css
│   ├── layouts
│   ├── pages
│   │   └── home.tsx
│   ├── app.tsx
│   ├── ssr.tsx
│   ├── tsconfig.json
│   └── types.ts
```

Clear separation between frontend and backend 
AdonisJS maintains a clear boundary between the backend and the frontend. You should never import backend code (such as models, services, or transformers) into your frontend application. 
In practice, your frontend communicates with the backend through HTTP requests and receives plain JSON data . AdonisJS encourages you to model this reality explicitly. Data is fetched and transformed via API responses, rather than being hidden behind shared abstractions. 
Shared types 
The frontend can still rely on shared TypeScript types automatically generated by AdonisJS. These are stored inside the dir

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### dev-environment
Source: https://docs.adonisjs.com/dev-environment

Development environment setup (Getting started) - AdonisJS Documentation 

Development environment setup 

Development environment setup 
This guide covers the recommended development environment for AdonisJS applications. You will learn how to: 
Configure TypeScript with required compiler options 
Set up ESLint and Prettier for code quality 
Install recommended code editor extensions 
Choose a database for local development 
Overview 
AdonisJS applications come with a fully configured development environment out of the box. TypeScript, ESLint, and Prettier are pre-configured with sensible defaults, allowing you to start building immediately without manual setup. 
This guide explains what's already configured in your project, recommends optional editor extensions that enhance the development experience, and provides guidance on choosing a database for local development. Understanding these configurations helps you leverage the full capabilities of the framework and maintain consistency across your team. 
Code editors and extensions 
AdonisJS works with any modern code editor that supports TypeScript . The framework does not rely on custom domain-specific languages (DSLs), so most editors provide full language support out of the box. The only framework-specific syntax is the Edge templating engine , which benefits from dedicated syntax highlighting extensions. 

AdonisJS Extension Provides IntelliSense for AdonisJS APIs, file generators, and command palette integration for running Ace commands. 

 [link:https://marketplace.visualstudio.com/items?itemName=jripouteau.adonis-vscode-extension] VSCode 

Japa Extension Test runner integration for running individual tests or test suites directly from the editor. 

 [link:https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode] VSCode 

Edge Templates Extension Full syntax highlighting and basic autocomplete for Edge template files. 

 [link:https://marketplace.visualstudio.com/items?itemName=AdonisJS.vscode-edge] VSCode  [link:https://zed.dev/extensions/edge] Zed  [link:https://packagecontrol.io/packages/Edge%20templates%20extension] Sublime Text 

TypeScript setup 
TypeScript is a first-class citizen in AdonisJS. Every application is created and runs using TypeScript by default, with all configuration handled automatically. Understanding how TypeScript works in development versus production, and the required compiler options, helps you make informed decisions about deployment and tooling. 
Required TypeScript configuration 
AdonisJS requires specific TypeScript compiler options to function correctly. The framework relies heavily on experimental decorators for dependency injection, model definitions, and Ace commands. 
The following configuration represents the bare minimum required for AdonisJS applications. 
Non-Inertia apps Inertia apps 
```
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

```
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

Development mode (JIT compilation) 
In development, AdonisJS uses a Just-in-Time (JIT) compiler provided by the package. This approach executes TypeScript files directly without a separate compilation step, enabling instant feedback when you save changes. 
This differs from Node.js' native TypeScript support because AdonisJS requires: 
Experimental decorators support (used for dependency injection and model decorators) 
JSX compilation (if you replace Edge with a JSX-based template engine like Inertia) 
Since Node.js' built-in TypeScript loader does not support these features,  [link:https://github.com/poppinss/ts-exec] provides the necessary compatibility layer. 
Production mode (ahead-of-time compilation) 
For production deployments, AdonisJS compiles your TypeScript code into JavaScript using the official TypeScript compiler ( ). This process generates a directory containing transpiled files optimized for the Node.js runtime. 

The compiled output includes: 
Transpiled JavaScript files with decorators transformed 
Copied static assets and templates 
The and your package manager lock file. You must into the build directory, install dependencies and start the production server. 
See also:  [link:/deployment] Deploying to production 
ESLint and Prettier configuration 
AdonisJS projects include pre-configured ESLint and Prettier setups that enforce TypeScript best practices and maintain consistent code formatting across your team. 
Tip 
Most code editors support running ESLint and Prettier automatically on file save. Configuring this in your editor eliminates manual formatting steps and catches linting issues immediately. 

ESLint 
The default ESLint configuration extends the AdonisJS base config, which includes rules for TypeScript, async/await patterns, and framework conventions. You can override or extend these rules in as needed. 
eslint.config.js 

```
import { configApp } from '@adonisjs/eslint-config'
export default configApp()
```

Run ESLint manually: 

Prettier 
Prettier configuration is defined in , ensuring all files are formatted consistently. The AdonisJS preset includes sensible defaults for indentation, quotes, and line length. 
package.json 

```
{
  "prettier": "@adonisjs/prettier-config"
}
```

Run Prettier manually: 

See also:  [link:https://github.com/adonisjs/tooling-config/tree/main/packages/eslint-config] ESLint configuration reference ,  [link:https://github.com/adonisjs/tooling-config/tree/main/packages/prettier-config] Prettier configuration reference 
Database setup 
AdonisJS applications are pre-configured with SQLite , a lightweight file-based database. SQLite requires no installation and stores data in a local file, allowing you to start building immediately without setting up external database servers. 
However, most applications use PostgreSQL or MySQL in production. We recommend  [link:/guides/database/lucid#configuration] switching to your production database engine early in development to avoid schema differences and driver-specific behavior that can cause deployment issues. 
Local database tools 
You can use the following tools to run PostgreSQL or MySQL locally: 
 [link:https://dbngin.com/] Dbngin (macOS and Windows) for managing PostgreSQL and MySQL through a GUI 
 [link:https://www.docker.com/] Docker for running databases in isolated containers 
 [link:https://postgresapp.com/] Postgres.app for native PostgreSQL on macOS 

 [link:/

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### configuration
Source: https://docs.adonisjs.com/configuration

Configuration & Environment (Getting started) - AdonisJS Documentation 

Configuration & Environment 

Configuration & Environment 
This guide covers configuration in AdonisJS applications. You will learn about: 
Config files in the directory 
Environment variables and the file 
Validating environment variables with type safety 
Variable interpolation within files 
Environment-specific files for development, testing, and production 
Accessing configuration in Edge templates 
The file for framework configuration 
Overview 
Configuration in AdonisJS is organized into three distinct systems, each serving a specific purpose. 
Config files contain your application settings. These files live in the directory and define things like database connections, mail settings, and session configuration. 

Environment variables stored in the file hold runtime secrets and values that change between environments. API keys, database passwords, and environment-specific URLs belong here. AdonisJS supports multiple files for different environments and provides type-safe validation to catch missing variables at startup. 

The adonisrc.ts file configures the framework itself. It tells AdonisJS how your workspace is organized, which providers to load, and which commands are available. 

Configuration files 
Configuration files live in the directory at the root of your project. Each file exports a configuration object for a specific part of your application (database connections, mail settings, authentication, session handling, and so on). 
A typical AdonisJS project includes several config files out of the box. The file configures database connections, handles email delivery, and defines authentication settings. 
Here's what a database configuration file looks like. 
config/database.ts 

```
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

Mail configuration follows a similar pattern. 
config/mail.ts 

```
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

Notice how this config file references environment variables through . This is the correct way to use environment-specific values in your configuration. The config file defines the structure and defaults, while the file provides the actual values. 
When config files are loaded 
Configuration files are loaded during the application boot cycle, before your routes and controllers are ready. This means you should keep config files simple and avoid importing application-level code like models, services, or controllers. 
Config files should only import framework utilities, define configuration objects, and reference environment variables. Importing application code creates circular dependencies and will cause your app to fail during startup . 
Accessing config in Edge templates 
Edge templates have access to your application's configuration through the global. This allows you to reference configuration values directly in your views without passing them explicitly from controllers. 
resources/views/layouts/main.edge 

```
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

The helper accepts a dot-notation path to any configuration value. The path corresponds to the config file name and the property within it. For example, 
```
config('database.connection')
```
reads the property from . 
You can also provide a default value as the second argument. 

```
<p>{{ config('app.timezone', 'UTC') }}</p>
```

Environment variables 
Environment variables store secrets and configuration that varies between environments. During development, you define these variables in the file. In production, you must define them through your hosting provider's UI or configuration interface. 
A typical file looks like this. 
.env 

```
HOST=0.0.0.0
PORT=3333
APP_KEY=your-secret-app-key-here
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME=My App
RESEND_API_KEY=re_your_api_key_here
```

The file is already listed in in AdonisJS starter kits, so you won't accidentally commit secrets to your repository. 
The APP_KEY 
The is a special environment variable that AdonisJS uses for encrypting cookies, signing sessions, and other cryptographic operations. Every AdonisJS application requires an APP_KEY to function securely. 
Run the command to create your APP_KEY. 

```
node ace generate:key
```

This creates a cryptographically secure random key and adds it to your file automatically. 
The APP_KEY must remain secret. Anyone with access to this key can decrypt your application's encrypted data and forge session tokens. When you deploy to production, use a different APP_KEY for each environment (development, staging, production). Never reuse keys across environments. 
If your APP_KEY is compromised, generate a new one immediately. This will invalidate all existing user sessions and encrypted data. 
Using environment variables in config files 
Config files access environment variables through the service, which provides type-safe access to your file values. You import the env service and call with the variable name. 

```
import env from '#start/env'

const apiKey = env.get('RESEND_API_KEY')
```

This pattern keeps your configuration organized and validated. The env service ensures required variables are present and throws clear errors if they're missing. 
You should never access environment variables directly in your controllers, services, or other application code. Always access them through config files. This creates a single source of truth for configuration. 
Variable interpolation 
The file supports variable interpolation, allowing you to reference other environment variables within a value. Use the or syntax to interpolate variables. 
.env 

```
HOST=localhost
PORT=3333
APP_URL=http://$HOST:$PORT
```

In this example, resolves to 
```
http://localhost:3333
```
. This is useful when you need to compose values from other variables without repeating yourself. 
You can also use curly brace

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### deployment
Source: https://docs.adonisjs.com/deployment

Deployment (Getting started) - AdonisJS Documentation 

Deployment 

Deployment 
This guide covers deploying AdonisJS applications to production. You will learn how to: 
Understand the standalone build and why your source files are not needed in production 
Configure correctly during build and runtime 
Create a production build using the command 
Configure static files to be copied to the build output 
Run your application in production 
Handle user-uploaded files with persistent storage 
Configure logging for production environments 
Run database migrations safely in production 
Create a Docker image using a multi-stage Dockerfile 
Overview 
AdonisJS applications are written in TypeScript and must be compiled to JavaScript before running in production. The build process creates a standalone build , which means the compiled output contains everything needed to run your application without the original TypeScript source files. 
Since AdonisJS apps run on the Node.js runtime, your deployment platform must support Node.js version 24 or later. The build process compiles your TypeScript code, bundles frontend assets (if using Vite), and copies necessary files to a directory that you can deploy directly to your production server. 
Understanding the standalone build 
The standalone build is the compiled output of your AdonisJS application. After creating the build, you only need to deploy the directory to your production server. The original source files, development dependencies, and TypeScript configuration are not required in production. 
This approach offers several benefits. The deployment size is significantly smaller since you are not shipping TypeScript source files or development tooling. The production environment only needs the JavaScript runtime, and you can treat the folder as an independent, self-contained application. 
NODE_ENV during build and runtime 
The environment variable behaves differently during the build process versus runtime, and understanding this distinction is important for successful deployments. 
During the build process, you need development dependencies installed because the build tooling (TypeScript compiler, Vite, and other build tools) are typically listed as in your . If you are creating the build in a CI environment or a sandbox where dependencies are not already installed, set before running to ensure all dependencies are available. 

```
# In CI/CD or fresh environments
NODE_ENV=development npm install
npm run build
```

During runtime in production, should be set to . This enables production optimizations and disables development-only features like detailed error pages. 
Creating the production build 
Run the build command from your project root. 

This executes under the hood. The build process performs the following steps in order: 
Removes the existing folder if one exists 
Rewrites the file to remove the TypeScript loader import 
Compiles frontend assets using Vite (if configured) 
Compiles TypeScript source code to JavaScript using 
Copies non-TypeScript files registered in the array to 
Copies and your package manager lock file to 
If there are TypeScript errors in your code, the build will fail. You must fix these errors before creating a production build. If you need to bypass TypeScript errors temporarily, use the flag. 

```
npm run build -- --ignore-ts-errors
```

The flag controls which lock file is copied to the build output. If not specified, the build command detects your package manager based on how you invoked the command (for example, versus ). 

```
npm run build -- --package-manager=pnpm
```

Build output contents 
After a successful build, the directory contains your compiled application. Here is what you will find inside: 
Compiled JavaScript files mirroring your source directory structure 
The and lock file for installing production dependencies 
Static files and other assets configured in 
Frontend assets in (for Vite-powered applications) 
Environment files ( , ) are intentionally excluded from the build output. Environment variables are not portable between environments, and you must configure them separately for each deployment target through your hosting platform's environment variable management. 
Static files 
Static files that need to be included in the production build are configured using the array in your file. These are non-TypeScript files that your application needs at runtime, such as Edge templates or public assets. 
adonisrc.ts 

```
{
  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],
}
```

The property accepts glob patterns to match files. The property controls whether file changes trigger a server restart during development and has no effect on the production build. 
For Hypermedia and Inertia applications, Vite compiles frontend assets and places them in the directory. These are then copied to during the build process. 
Adjust for reverse proxy and node balancers 
Real-world apps are usually not accessed directly, but behind reverse proxy and node balancers, e.g. Nginx. 
By default, Node.js closes idle connections after 5 seconds, but Nginx may try to keep them open for 60+ seconds. When Nginx tries to reuse an old connection it thinks is open, but Node.js has already silently closed it, Nginx throws errors. 
To avoid this issue, you need to change AdonisJS server's to larger than Nginx's (50s by default). 
config/app.ts 

```
{
  keepAliveTimeout: 55000,
}
```

Serving static files in production 
While AdonisJS includes a  [link:/guides/basics/static-file-server] static file server , you should offload static file serving to a dedicated tool in production. Every static file request handled by your Node.js process is a request that cannot be spent on dynamic work. A reverse proxy or CDN is purpose-built for this job and will deliver files faster with less resource usage. 
You have two main options depending on your infrastructure. 
Reverse proxy (Nginx, Caddy, Traefik, Apache) 
Configure your reverse proxy to serve the directory directly for static file requests and forward everything else to your AdonisJS server. This way, static files never reach your Node.js process. 
With Nginx, you can add a block that tries to serve files from the directory first and falls back to the AdonisJS server for dynamic routes. 

```
server {
    listen 80;
    server_name example.com;

    root /path/to/your/app/build/public;

    location / {
        try_files $uri @adonis;
    }

    location @adonis {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

CDN 
For the best performance, upload your compiled assets to a CDN. This requires updating the option in your Vite configuration

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### faqs
Source: https://docs.adonisjs.com/faqs

FAQs (Getting started) - AdonisJS Documentation 

FAQs 

Frequently Asked Questions 
Is AdonisJS actively maintained? 
Yes, AdonisJS is actively maintained with regular updates, bug fixes, and feature additions. The framework has been consistently developed since 2015 and receives continuous attention from its core team. 
You can verify maintenance activity by checking  [link:https://next.ossinsight.io/analyze/adonisjs] OSS Insights , which shows comprehensive metrics across the entire AdonisJS GitHub organization including recent commits, responsive issue discussions, and release patterns. 
How does AdonisJS compare to Express, NestJS, and Fastify? 
AdonisJS is a full-stack, batteries-included framework that provides complete development solutions out of the box. This contrasts with Express and Fastify's minimalist approach and differs from NestJS's heavily opinionated enterprise architecture. 
Compared to Express : AdonisJS offers built-in features for authentication, validation, ORM, and sessions, whereas Express requires you to choose and integrate these pieces yourself. AdonisJS provides more structure and convention, while Express offers maximum flexibility. 
Compared to NestJS : Both frameworks support TypeScript natively and provide structured architecture. NestJS emphasizes Angular-style decorators and enterprise patterns, while AdonisJS follows Laravel-inspired conventions with a simpler learning curve. AdonisJS is also faster to embrace modern Node.js primitives like ESM, making it more aligned with current JavaScript ecosystem standards. 
Compared to Fastify : Fastify focuses on maximum performance with minimal overhead, while AdonisJS prioritizes developer productivity with comprehensive built-in features. Both deliver excellent performance, but AdonisJS includes more functionality by default. 
Choose AdonisJS when you want a complete framework with built-in solutions and Laravel-style development experience in Node.js. Choose alternatives when you need maximum flexibility (Express), enterprise patterns (NestJS), or minimal abstraction (Fastify). 
Is AdonisJS production-ready? 
Yes, AdonisJS is production-ready and has powered thousands of applications since 2015, ranging from small startups to large-scale enterprise systems. The framework handles high-traffic scenarios efficiently and follows security best practices by default. 
Companies using AdonisJS in production include  [link:https://www.marieclaire.com/] Marie Claire ,  [link:https://www.ledger.com/] Ledger ,  [link:https://kayako.com/] Kayako ,  [link:https://www.renaultgroup.com/en/] Renault Group ,  [link:https://www.zakodium.com/] Zakodium ,  [link:https://www.fivb.com/] FIVB ,  [link:https://www.petpooja.com/] Petpooja ,  [link:https://paytm.com/] Paytm ,  [link:https://verifiables.com] Verifiables ,  [link:https://www.pappers.fr/] Pappers ,  [link:https://www.edmond-de-rothschild.com/en/home] Edmond de Rothschild ,  [link:https://www.francetravail.fr/accueil/] France Travail , and many more. 
While production-ready, consider that the AdonisJS community is smaller than Express or Next.js communities, which means fewer Stack Overflow answers and potentially more challenging hiring. However, developers familiar with TypeScript and modern frameworks become productive quickly, and the official documentation is comprehensive. 
The framework deploys successfully to all major hosting platforms including traditional VPS providers, Docker containers, and modern platforms like Railway, Render, and Fly.io. 
Does AdonisJS support TypeScript natively? 
Yes, AdonisJS is built with TypeScript from the ground up and provides first-class TypeScript support. Unlike frameworks where TypeScript is an optional add-on, AdonisJS is designed specifically for TypeScript and leverages its full power. 
When you create a new AdonisJS project, TypeScript is already configured with optimal settings. The build system, type checking, and development workflow work seamlessly without additional setup. Every framework API is fully typed, providing complete IntelliSense and compile-time error checking. 
The framework uses advanced TypeScript features to infer types automatically, meaning you get type safety without writing excessive type annotations. For example, validation schemas automatically infer the validated data type, and models automatically provide types for all properties and methods. 
TypeScript compiles away during the build process, so there's no runtime overhead. Your production code runs as optimized JavaScript with the same performance as hand-written JavaScript. 
Who maintains AdonisJS? 
AdonisJS is primarily maintained by Harminder Virk , who created the framework in 2015 and continues to lead its development. The framework also has a  [link:https://adonisjs.com/team] small core team of contributors who help with specific areas like documentation, package maintenance, and community support. 
Harminder works on AdonisJS full-time as his primary professional focus, not as a side project. This ensures consistent attention, timely issue responses, and regular feature development. The framework receives financial support through the  [link:https://adonisjs.com/insiders] Insiders and  [link:https://adonisjs.com/partner] Partners programs, enabling sustainable full-time maintenance. 
While some developers worry about frameworks maintained primarily by one person, this model has proven sustainable for nearly a decade. A single maintainer ensures coherent vision, consistent code quality, and fast decision-making. Many successful open-source projects (Linux, Ruby on Rails, Laravel, Vue.js) have followed similar models successfully. 
The codebase is well-documented and structured to enable community contributions. The framework is open source under the MIT license, ensuring the code remains accessible regardless of future circumstances. 
Where can I get help with AdonisJS? 
The primary support channel is the official  [link:https://discord.gg/vDcEjq6] Discord server , where community members and core team typically respond within hours. The server has dedicated channels for different topics including general help, database questions, and deployment issues. 
For longer-form questions or architectural advice, use  [link:https://github.com/adonisjs/core/discussions] GitHub Discussions . For bug reports and feature requests, use  [link:https://github.com/adonisjs/core/issues] GitHub Issues . The official  [link:https://docs.adonisjs.com] documentation is comprehensive and answers most common questions. 
To get better answers faster, provide clear context, share relevant code snippets, include complete error messages, specify your environment (versions), and explain what you've already tried. 
Can I use AdonisJS for building APIs? 
Yes, AdonisJS is excellent for building APIs and many developers choose it primarily for API development. The framework provides extensive built-in features specifically designed for APIs, includi

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### releases
Source: https://docs.adonisjs.com/releases

Releases (Resources) - AdonisJS Documentation 

Start
            /
            Resources Releases 

Releases 
Jul 2026 
Description Tag 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.4.0] Fix unsubscribe-post header issue and upgrade dependencies 
 [link:https://github.com/adonisjs/content/releases/tag/v1.7.1] Throw contextual errors when API fails 
Jun 2026 
Description Tag 
 [link:https://github.com/adonisjs/core/releases/tag/v7.3.4] Fix legacy encryption driver iv encoding issue 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.3.0] Add support for Postmark transport 
 [link:https://github.com/adonisjs/i18n/releases/tag/v3.0.1] Translate otherField and originalField names in validation error messages 
 [link:https://github.com/adonisjs/lucid-slugify/releases/tag/v4.0.0] Upgrade to work with v7 and Lucid 22 
 [link:https://github.com/adonisjs/http-server/releases/tag/v9.1.0] Escape exception messages in HTML responses and add request.prefetch method 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.2.1] Escape exception messages in HTML responses 
 [link:https://github.com/adonisjs/inertia/releases/tag/v5.0.0-next.0] Release 5.0.0-next.0 
 [link:https://github.com/adonisjs/queue/releases/tag/v0.6.2] Queue deduplication, heartbeats, and safer job loading 
May 2026 
Description Tag 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.2.1] Support MJML 5 and SMTP pool config options 
 [link:https://github.com/adonisjs/bodyparser/releases/tag/v10.1.5] prevent nested prototype pollution 
 [link:https://github.com/adonisjs/bodyparser/releases/tag/v11.0.3] prevent nested prototype pollution 
 [link:https://github.com/adonisjs/http-server/releases/tag/v9.0.2] Make Router class macroable to be extended from outside-in 
 [link:https://github.com/adonisjs/http-server/releases/tag/v9.0.1] Use internal host method when returning request authority 
 [link:https://github.com/adonisjs/http-server/releases/tag/v9.0.0] HTTP/2 authority support for redirect referrer validation 
 [link:https://github.com/adonisjs/application/releases/tag/v9.0.1] Use correct env var for detecting pm2 environment 
 [link:https://github.com/adonisjs/vite/releases/tag/v6.0.0-next.0] Migrate to Vite 8 and add loadServerModule API for SSR-only TypeScript modules 
 [link:https://github.com/adonisjs/vite/releases/tag/v5.1.1] Fix broken assets issue when the first request hit server before Vite devserver is ready 
 [link:https://github.com/adonisjs/eslint-config/releases/tag/v3.1.0] Add presets for React and Vue 
 [link:https://github.com/adonisjs/prettier-config/releases/tag/v1.5.0] Use the official edge prettier plugin 
 [link:https://github.com/adonisjs/queue/releases/tag/v0.6.1] Queue Worker Job Loading Fix 
Apr 2026 
Description Tag 
 [link:https://github.com/adonisjs/core/releases/tag/v7.3.1] Preventing open-redirect vulnerabilities during referer based redirects 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.4.2] Custom schema rules correctly override default decorators 
 [link:https://github.com/adonisjs/auth/releases/tag/v10.1.0] Automatic intended-URL storage on unauthorized redirects 
 [link:https://github.com/adonisjs/ally/releases/tag/v6.3.0] Consider email_verified flag in LinkedIN OC response and better defaults 
 [link:https://github.com/adonisjs/ally/releases/tag/v6.2.0] Self-handled exceptions with content negotiation and origin-URL redirects 
 [link:https://github.com/adonisjs/ally/releases/tag/v6.1.0] Twitter X driver and support for provider-level signup policies 
 [link:https://github.com/adonisjs/bodyparser/releases/tag/v11.0.1] Fixed gzip request body parsing 
 [link:https://github.com/adonisjs/session/releases/tag/v8.1.0] Session-aware redirects with intended URL support 
 [link:https://github.com/adonisjs/http-server/releases/tag/v7.8.1] Security fix: open redirect in response.redirect().back() 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.2.0] Add isValidRedirectUrl helper to be re-used by other packages 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.1.3] Secure redirect-back with host validation and new configuration options 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.1.2] Catch malformed URIs and return 400 
 [link:https://github.com/adonisjs/cache/releases/tag/v1.3.2] Release 1.3.2 
 [link:https://github.com/adonisjs/cache/releases/tag/v2.1.0] Add --force flag to cache:clear 
 [link:https://github.com/adonisjs/create-adonisjs/releases/tag/v3.4.0] Display AI-friendly error when invoked via AI agents 
 [link:https://github.com/adonisjs/content/releases/tag/v1.7.0] Add loader to fetch Github projects and cache them 
Mar 2026 
Description Tag 
 [link:https://github.com/adonisjs/core/releases/tag/v7.3.0] Allow make commands to override existing files via --force flag 
 [link:https://github.com/adonisjs/core/releases/tag/v7.2.0] Safe timing helpers, vine.create usage in validator stub and create building using custom tsconfig file 
 [link:https://github.com/adonisjs/core/releases/tag/v7.1.1] Fix indexEntities to create manifest file when is true 
 [link:https://github.com/adonisjs/core/releases/tag/v7.1.0] Add JSONL route formatter for AI agents 
 [link:https://github.com/adonisjs/core/releases/tag/v7.0.1] Drop hardcoded @next package tags 
 [link:https://github.com/adonisjs/ace/releases/tag/v14.1.0] Allow passing a custom ui instance to commands 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.4.1] Unlock Knex version 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.4.0] Add test assertion helpers, support for multiple decorators and bug fixes 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.3.0] Make transformer alongside model and update scaffolding commands to accept stub path from CLI 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.2.0] Pin Knex to version 3.1.0 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.1.1] Fix primary keys detection in schema generation and generate schema classes for non-public PostgreSQL schemas 
 [link:https://github.com/adonisjs/lucid/releases/tag/v22.1.0] Add support for CTE and onConflict expression builder support to InsertQueryBuilder 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.2.0] Add support for creating mail from pre-defined contents 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.1.1] Set dummy valid values for environment variables 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.1.0] Using symbol.dispose for disposing fake instance 
 [link:https://github.com/adonisjs/mail/releases/tag/v10.0.1] Fix SMTP_PORT Env validation to use schema.number 
 [link:https://github.com/adonisjs/logger/releases/tag/v7.1.1] Fix typo 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.1.1] Fix build issue 
 [link:https://github.com/adonisjs/http-server/releases/tag/v8.1.0] Pass original trust proxy fn to getIp method 
 [link:https://github.com/adonisjs/events/rele

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### contributing
Source: https://docs.adonisjs.com/contributing

Contributing (Resources) - AdonisJS Documentation 

Start
            /
            Resources Contributing 

Contributing 
This is a general contribution guide for all of the  [link:https://github.com/adonisjs] AdonisJS repos. Please read this guide thoroughly before contributing to any of the repos 
Code is not the only way to contribute. Following are also some ways to contribute and become part of the community. 
Fixing typos in the documentation 
Improving existing docs 
Writing cookbooks or blog posts to educate others in the community 
Triaging issues 
Sharing your opinion on existing issues 
Help the community on  [link:https://discord.gg/vDcEjq6] discord and in the discussion forums. 
Reporting bugs 
Many issues reported on open source projects are usually questions or misconfiguration at the reporter's end. Therefore, we highly recommend you properly troubleshoot your issues before reporting them. 
If you're reporting a bug, include as much information as possible with the code samples you have written. The scale of good to bad issues looks as follows. 
PERFECT ISSUE : You isolate the underlying bug. Create a failing test in the repo and open a Github issue around it. 

GOOD ISSUE : You isolate the underlying bug and provide a minimal reproduction of it as a Github repo. Antfu has written a great article on  [link:https://antfu.me/posts/why-reproductions-are-required] Why Reproductions are Required . 

DECENT ISSUE : You correctly state your issue. Share the code that produces the issue in the first place. Also, include the related configuration files and the package version you use. 
Last but not least is to format every code block properly by following the  [link:https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax] Github markdown syntax guide . 

POOR ISSUE : You dump the question you have with the hope that the other person will ask the relevant questions and help you. These kinds of issues are closed automatically without any explanation. 

Having a discussion 
You often want to discuss a topic or maybe share some ideas. In that case, create a discussion in the discussions forum under the 💡Ideas category. 
Educating others 
Educating others is one of the best ways to contribute to any community and earn recognition. 
You can use the 📚 Cookbooks category on our discussion forum to share an article with others. The cookbooks section is NOT strictly moderated, except the shared knowledge should be relevant to the project. 
Creating pull requests 
It is never a good experience to have your pull request declined after investing a lot of time and effort in writing the code. Therefore, we highly recommend you to  [link:https://github.com/orgs/adonisjs/discussions] kick off a discussion before starting any new work on your side. 
Just start a discussion and explain what are you planning to contribute? 
Are you trying to create a PR to fix a bug : PRs for bugs are mostly accepted once the bug has been confirmed. 

Are you planning to add a new feature : Please thoroughly explain why this feature is required and share links to the learning material we can read to educate ourselves. 
For example: If you are adding support for snapshot testing to Japa or AdonisJS. Then share the links I can use to learn more about snapshot testing in general. 

Note: You should also be available to open additional PRs for documenting the contributed feature or improvement. 
Repository setup 
Start by cloning the repo on your local machine. 

Install dependencies on your local. Please do not update any dependencies along with a feature request. If you find stale dependencies, create a separate PR to update them. 
We use for managing dependencies, therefore do not use or any other tool. 

Run tests by executing the following command. 

Tools in use 
Following is the list of tools in use. 
Tool Usage 
TypeScript All of the repos are authored in TypeScript. The compiled JavaScript and Type-definitions are published on npm. 
TS Node We use  [link:https://typestrong.org/ts-node/] ts-node to run tests or scripts without compiling TypeScript. The main goal of ts-node is to have a faster feedback loop during development 
SWC  [link:https://swc.rs/] SWC is a Rust based TypeScript compiler. TS Node ships with first-class support for using SWC over the TypeScript official compiler. The main reason for using SWC is the speed gain. 
Release-It We use  [link:https://github.com/release-it/release-it] release-it to publish our packages on npm. It does all the heavy lifting of creating a release and publishes it on npm and Github. Its config is defined within the file. 
ESLint ESLint helps us enforce a consistent coding style across all the repos with multiple contributors. All our ESLint rules are published under the  [link:https://github.com/adonisjs-community/eslint-plugin-adonis] eslint-plugin-adonis package. 
Prettier We use prettier to format the codebase for consistent visual output. If you are confused about why we are using ESLint and Prettier both, then please read  [link:https://prettier.io/docs/en/comparison.html] Prettier vs. Linters doc on the Prettier website. 
EditorConfig The file in the root of every project configures your Code editor to use a set of rules for indentation and whitespace management. Again, Prettier is used for post formatting your code, and Editorconfig is used to configure the editor in advance. 
Conventional Changelog All of the commits across all the repos uses  [link:https://github.com/conventional-changelog/commitlint/#what-is-commitlint] commitlint to enforce consistent commit messages. 
Husky We use  [link:https://typicode.github.io/husky/#/] husky to enforce commit conventions when committing the code. Husky is a git hooks system written in Node 

Commands 
Command Description 
Run project tests using 
Compile the TypeScript project to JavaScript. The compiled output is written inside the directory 
Start the release process using 
Lint the codebase using ESlint 
Format the codebase using Prettier 
Sync the labels defined inside the file with Github. This command is for the project admin only. 

Coding style 
All of our projects are written in TypeScript and are moving to pure ESM. 
You can learn more about  [link:https://github.com/thetutlage/meta/discussions/3] my coding style here 
Check out the setup I follow for  [link:https://github.com/thetutlage/meta/discussions/2] ESM and TypeScript here 
Also, make sure to run the following commands before pushing the code. 

```
# Formats using prettier
npm run format

# Lints using Eslint
npm run lint
```

Getting recognized as a contributor 
We rely on GitHub to list all the repo contributors in the right-side panel of the repo. Following is an example of the same. 
Also, we use the  [link:https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes#about-automatically-gene

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### governance
Source: https://docs.adonisjs.com/governance

Governance (Resources) - AdonisJS Documentation 

Start
            /
            Resources Governance 

Governance 
This document is based upon the  [link:http://oss-watch.ac.uk/resources/benevolentdictatorgovernancemodel] Benevolent Dictator Governance Model by Ross Gardler and Gabriel Hanganu, licensed under a  [link:https://creativecommons.org/licenses/by-sa/4.0/] Creative Commons Attribution-ShareAlike 4.0 International License . This document itself is also licensed under the same license. 
Roles and responsibilities 
Authors 
Harminder Virk (the creator of AdonisJS) serves as the Project Author. The project author is responsible for the project's governance, standards, and direction. To summarize: 
The project author decides which new projects should live under the AdonisJS umbrella. 
The project author is responsible for assigning leads to projects and transferring projects to a new lead when an existing lead steps down. 
It is the author's responsibility to share/document the framework's vision and keep project leads in sync with the same. 
Project Leads 
AdonisJS is a combination of several packages created and managed by the core team. All of these packages are led by a project lead selected by the project Author. 
In almost every case, the creator of the package serves as the project lead since they are the ones who have put the initial efforts into bringing the idea to life. 
The project lead has the final say in all aspects of decision-making within the project. However, because the community always has the ability to fork, this person is fully answerable to the community. It is the project lead's responsibility to set the strategic objectives of the project and communicate these clearly to the community. They also have to understand the community as a whole and strive to satisfy as many conflicting needs as possible while ensuring that the project survives in the long term. 
In many ways, the role of the project lead is about diplomacy. The key is to ensure that, as the project expands, the right people are given influence over it, and the community rallies behind the vision of the project lead. The lead's job is then to ensure that the core team members (see below) make the right decisions on behalf of the project. Generally speaking, as long as the core team members are aligned with the project's strategy, the project lead will allow them to proceed as desired. 
Note 
A project lead cannot archive or decide to remove the project from the AdonisJS umbrella. They can decide to stop working on the project, and in that case, we will find a new project lead. 

Core team 
Members of the core team are contributors who have made multiple valuable contributions to the project and are now relied upon to both write code directly to the repository and screen the contributions of others. In many cases, they are programmers, but it is also possible that they contribute in a different role, for example, community engagement. Typically, a core team member will focus on a specific aspect of the project and will bring a level of expertise and understanding that earns them the respect of the community and the project lead. The role of core team member is not an official one, it is simply a position that influential members of the community will find themselves in as the project lead looks to them for guidance and support. 
Core team members have no authority over the overall direction of the project. However, they do have the ear of the project lead. It is a core team member's job to ensure that the lead is aware of the community's needs and collective objectives, and to help develop or elicit appropriate contributions to the project. Often, core team members are given informal control over their specific areas of responsibility, and are assigned rights to directly modify certain areas of the source code. That is, although core team members do not have explicit decision-making authority, they will often find that their actions are synonymous with the decisions made by the lead. 
Active Core Team Members 
Active Core Team Members contribute to the project on a regular basis. An active core team member usually has one or more focus areas - in the most common cases, they will be responsible for the regular issue triaging, bug fixing, documentation improvements or feature development in a subproject repository. 
Core Team Emeriti 
Some core team members who have made valuable contributions in the past may no longer be able to commit to the same level of participation today due to various reasons. That is perfectly normal, and any past contributions to the project are still highly appreciated. These core team members are honored for their contributions as Core Team Emeriti, and are welcome to resume active participation at any time. 
Contributors 
Contributors are community members who either have no desire to become core team members, or have not yet been given the opportunity by the project lead. They make valuable contributions, such as those outlined in the list below, but generally do not have the authority to make direct changes to the project code. Contributors engage with the project through communication tools, such as the RFC discussions, GitHub issues and pull requests, Discord chatroom, and the forum. 
Anyone can become a contributor. There is no expectation of commitment to the project, no specific skill requirements and no selection process. To become a contributor, a community member simply has to perform one or more actions that are beneficial to the project. 
Some contributors will already be engaging with the project as users, but will also find themselves doing one or more of the following: 
Supporting new users (current users often provide the most effective new user support) 
Reporting bugs 
Identifying requirements 
Programming 
Assisting with project infrastructure 
Fixing bugs 
Adding features 
As contributors gain experience and familiarity with the project, they may find that the project lead starts relying on them more and more. When this begins to happen, they gradually adopt the role of core team member, as described above. 
Users 
Users are community members who have a need for the project. They are the most important members of the community: without them, the project would have no purpose. Anyone can be a user; there are no specific requirements. 
Users should be encouraged to participate in the life of the project and the community as much as possible. User contributions enable the project team to ensure that they are satisfying the needs of those users. Common user activities include (but are not limited to): 
Evangelizing about the project. 
Informing developers of project strengths and weaknesses from a new user's perspective. 
Providing moral support (a 'thank you' goes a long way). 
Providing financial support through GitHub Sponsors. 
Users who continue to engage with the project and its community will often find themselves becoming mor

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
