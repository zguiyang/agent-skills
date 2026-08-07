# Frontend — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/frontend/api-client](https://docs.adonisjs.com/guides/frontend/api-client)
- [guides/frontend/edgejs](https://docs.adonisjs.com/guides/frontend/edgejs)
- [guides/frontend/inertia](https://docs.adonisjs.com/guides/frontend/inertia)
- [guides/frontend/tanstack-query](https://docs.adonisjs.com/guides/frontend/tanstack-query)
- [guides/frontend/transformers](https://docs.adonisjs.com/guides/frontend/transformers)
- [guides/frontend/vite](https://docs.adonisjs.com/guides/frontend/vite)

## Condensed excerpts (prefer live docs if conflict)

### guides/frontend/api-client
Source: https://docs.adonisjs.com/guides/frontend/api-client

This guide covers Tuyau, a type-safe HTTP client for AdonisJS applications. You will learn how to:

*   Install and configure Tuyau for Inertia and monorepo setups
*   Make type-safe API calls using route names
*   Handle request parameters, validation, and error responses
*   Work with file uploads
*   Generate URLs programmatically
*   Understand type-level serialization for end-to-end type safety

## Overview

Tuyau is a type-safe HTTP client that enables end-to-end type safety between your AdonisJS backend and frontend application. Instead of manually writing API client code and managing types, Tuyau automatically generates a fully typed client based on your routes, controllers, and validators.

The key benefit of Tuyau is eliminating the gap between your backend API definition and frontend consumption. When you define a route with validation in AdonisJS, Tuyau ensures your frontend calls use the exact same types for request bodies, query parameters, route parameters, and response data. This means TypeScript will catch errors at compile time rather than discovering them at runtime.

Tuyau works by analyzing your AdonisJS routes and generating a registry that maps route names to their types. Your frontend imports this registry and uses it to make type-safe API calls. Every parameter, every field in your request body, and every property in your response is fully typed and autocompleted in your IDE.

The library is built on top of [Ky](https://github.com/sindresorhus/ky) , a modern fetch wrapper, which means you get all of Ky's features like automatic retries, timeout handling, and request/response hooks while maintaining full type safety.

## Installation

Tuyau installation differs depending on whether you're using Inertia (single repository) or a monorepo setup with separate frontend and backend applications.

### Inertia applications

For Inertia applications, installation is straightforward since your frontend and backend live in the same repository. **Official starter kits for [React](https://github.com/adonisjs/starter-kits/tree/main/inertia-react) and [Vue](https://github.com/adonisjs/starter-kits/tree/main/inertia-vue) come pre-configured with Tuyau, hence no manual setup is required.**

1.   #### Install the package

`npm install @tuyau/core` 
2.   #### Configure the assembler hook

The assembler hook automatically generates the Tuyau registry whenever your codebase changes. Add the `generateRegistry` hook to your `adonisrc.ts` file. The `indexEntities` hook indexes your models and transformers for type generation, `indexPages` indexes your Inertia page components, and `generateRegistry` generates the Tuyau registry files in the `.adonisjs/client` directory.

```
import { indexPages } from '@adonisjs/inertia'
import { indexEntities } from '@adonisjs/core'
import { defineConfig } from '@adonisjs/core/app'
import { generateRegistry } from '@tuyau/core/hooks'

export default defineConfig({
  // ... other config
  hooks: {
    init: [
      indexEntities({ transformers: { enabled: true, withSharedProps: true } }),
      indexPages({ framework: 'react' }),
      generateRegistry(),
    ],
  },
})
``` 
3.   #### Configure TypeScript paths

Configure path aliases in your Inertia `tsconfig.json` to import the generated registry.

```
{
  "compilerOptions": {
    // ... other options
    "paths": {
      "~/*": ["./*"],
      "@generated/*": ["../.adonisjs/client/*"]
    }
  }
}
``` 
4.   #### Configure Vite aliases

Add matching aliases to your `vite.config.ts`.

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/vite'

export default defineConfig({
  plugins: [
    react(),
    inertia({ ssr: { enabled: false, entrypoint: 'inertia/ssr.tsx' } }),
    adonisjs({ entrypoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/inertia/`,
      '@generated': `${import.meta.dirname}/.adonisjs/client/`,
    },
  },
})
``` 
5.   #### Create the Tuyau client

Create a file to initialize your Tuyau client.

```
import { registry } from '@generated/registry'
import { createTuyau } from '@tuyau/core/client'

export const client = createTuyau({
  baseUrl: '/',
  registry,
})

export const urlFor = client.urlFor
``` 
The `baseUrl` is set to `'/'` since the frontend and backend are served from the same origin in an Inertia application.

### Monorepo applications

For monorepo setups where your frontend and backend are separate packages, the setup requires additional configuration to share types between workspaces.

This guide assumes you're using npm workspaces with Turborepo (as used by the [API Starter Kit](https://github.com/adonisjs/api-starter-kit) ), but the concepts apply to other monorepo tools like pnpm or Yarn workspaces with slight variations in syntax.

1.   #### Structure your monorepo

Organize your monorepo with separate workspaces for your API and frontend application.

```
my-app/
├── apps/
│   ├── backend/      # AdonisJS backend
│   └── frontend/     # Frontend (React, Vue, etc)
└── package.json
``` 
2.   #### Install Tuyau in the backend

Install `@tuyau/core` in your backend workspace. It handles both the assembler hook (registry generation) and exposes the client for your frontend to import.

```
{
  "name": "@my-app/backend",
  "private": true,
  "type": "module",
  "dependencies": {
    "@tuyau/core": "^1.0.0"
  }
}
``` 
Then, in your frontend workspace, add your backend as a workspace dependency so it can import the generated registry and the Tuyau client.

```
{
  "name": "@my-app/frontend",
  "private": true,
  "type": "module",
  "dependencies": {
    "@my-app/backend": "*"
  }
}
``` 
The `"*"` version range tells npm to resolve `@my-app/backend` from your local workspace. Make sure the package name matches the `name` field in your backend's `package.json`.

3.   #### Enable experimental decorators

Tuyau uses TypeScript decorators internally. Enable them in your frontend `tsconfig.json`. You also need to include your backend source files so TypeScript can resolve the shared types during type-checking.

```
{
  "compilerOptions": {
    "experimentalDecorators": true, 
    // ... other options
  },
  "include": [
    "./**/*.ts",
    "./**/*.tsx",
    "../backend/**/*.ts",
    "../backend/.adonisjs/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "../backend/build",
    "../backend/node_modules"
  ]
}
``` 
4.   #### Configure the backend

In your backend AdonisJS application, add the `generateRegistry` hook just like in the Inertia setup.

```
import { indexEntities } from '@adonisjs/core'
import { defineConfig } from '@adonisjs/core/app'
import { generateRegistry } from '@tuyau/core/hooks'

export default defineConfig({
  hooks: {
    init: [
      indexEntities({ transformers: { enabled: true } }),
      generateRegistry(),
    ],
  },
})
``` 
5.   #### Ex

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/frontend/edgejs
Source: https://docs.adonisjs.com/guides/frontend/edgejs

## Edge Templates

This guide covers using Edge templates in AdonisJS applications. You will learn how to render templates from controllers, pass data to templates, work with layouts and components, use the pre-built components from the Hypermedia starter kit, and debug template issues.

## Overview

Edge is a server-side templating engine for Node.js that allows you to compose HTML markup on the server and send the final static HTML to the browser. Since templates execute entirely on the server-side, they can tap into core framework features like authentication, authorization checks, and the translations system.

When you create a Hypermedia application in AdonisJS, Edge comes pre-configured and ready to use. Templates are stored in the `resources/views` directory with the `.edge` file extension, and you render them from your route handlers or controllers using the `view` property from the HTTP context.

Edge has comprehensive documentation at [edgejs.dev](https://edgejs.dev/) , which covers the template syntax, components system, and all available features in detail. This guide focuses specifically on using Edge within AdonisJS applications and introduces the pre-built components included in the Hypermedia starter kit.

## Your first template

Let's create a simple page that displays a list of blog posts. This example demonstrates the fundamental workflow of rendering templates in AdonisJS.

1.   #### Create the template file

Generate a new template using the Ace command.

```
node ace make:view pages/posts/index
# CREATE: resources/views/pages/posts/index.edge
``` 
2.   #### Add the template content

Open `resources/views/pages/posts/index.edge` and add the following content.

```
@layout()
  @each(post in posts)
    <div>
      <h2>
        {{ post.title }}
      </h2>
      <div>
        <p>{{{ excerpt(post.content, 280) }}}</p>
      </div>
    </div>
  @end
@end
``` 
A few important things to understand about this template:

    *   The `@layout()` component wraps your content with a complete HTML document structure (including `<html>`, `<head>`, and `<body>` tags). We'll explore layouts in detail later in this guide.

    *   The `@each` tag loops over the `posts` array and renders the content for each post. Edge provides several tags like `@if`, `@else`, and `@elseif` for writing logic in templates. You can learn about all available tags in the [Edge syntax reference](https://edgejs.dev/docs/syntax_specification) .

    *   The double curly braces `{{ }}` evaluate and output a JavaScript expression. The triple curly braces `{{{ }}}` do the same but don't escape HTML, which is useful for rendering rich content.

3.   #### Define the route

Create a route to handle requests to the posts page.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.PostsController, 'index'])
``` 
4.   #### Create the controller

Create a controller that renders the template with post data.

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    /**
     * Render the template located at resources/views/pages/posts/index.edge
     * The first parameter is the template path (relative to resources/views)
     * The second parameter is the template state (data to share with the template)
     */
    return view.render('pages/posts/index', {
      posts: await Post.all(),
    })
  }
}
``` 
5.   #### View the result

Visit `http://localhost:3333/posts` in your browser to see the rendered page.

You can also render templates directly from routes without using a controller.

```
import router from '@adonisjs/core/services/router'

/**
 * The router.on().render() shorthand renders a template directly.
 * The first parameter is the template path.
 */
router.on('/').render('pages/home')
```

## Understanding template state

The data object you pass to `view.render()` is called the **template state**. All properties in this object become available as variables in your template.

In addition to the data you explicitly pass, AdonisJS automatically shares certain globals with every template:

*   The `request` object for accessing request data
*   The `auth` object for checking authentication status
*   Edge helpers like `excerpt()`, `truncate()`, and route helpers

You can view all available helpers and global properties in the [Edge reference guide](https://docs.adonisjs.com/reference/edge) .

## Template syntax refresher

Edge uses a combination of curly braces and tags to add dynamic behavior to your templates. Here's a quick refresher of the most common syntax patterns:

**Outputting variables:**

`{{ post.title }}`

**Outputting unescaped HTML:**

`{{{ post.content }}}`

**Conditionals:**

```
@if(user)
  <p>Welcome back, {{ user.name }}</p>
@else
  <p>Please log in</p>
@end
```

**Loops:**

```
@each(post in posts)
  <h2>{{ post.title }}</h2>
@end
```

**Evaluating JavaScript expressions:**

```
{{ post.createdAt.toFormat('dd LLL yyyy') }}
{{ posts.length > 0 ? 'Posts available' : 'No posts yet' }}
```

For complete coverage of Edge's template syntax, including advanced features like partials, slots, and custom tags, refer to the [Edge syntax reference](https://edgejs.dev/docs/syntax_specification) .

## Working with layouts and components

The `@layout()` component you saw in the first example wraps your page content with a complete HTML document structure. This component is stored at `resources/views/components/layout.edge` and contains the standard HTML boilerplate:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
</head>
<body>
  {{{ await $slots.main() }}}
</body>
</html>
```

The `$slots.main()` method call renders whatever content you place between the opening and closing `@layout()` tags in your page templates. This is Edge's slots feature, which allows components to accept content from their consumers.

### Creating components

Components in Edge are reusable template fragments stored in the `resources/views/components` directory. Any template file in this directory becomes available as an Edge tag.

For example, if you create a file at `resources/views/components/card.edge`:

```
<div class="card">
  {{{ await $slots.main() }}}
</div>
```

You can use it in your templates like this:

```
@card()
  <h2>Card title</h2>
  <p>Card content</p>
@end
```

Components can accept props (parameters) and have multiple named slots for more complex compositions. For a complete guide to building and using components, see the [Edge components guide](https://edgejs.dev/docs/components/introduction) .

## Starter kit components

The Hypermedia starter kit includes a collection of unstyled components for building forms and common UI patterns. Each component renders at most one

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/frontend/inertia
Source: https://docs.adonisjs.com/guides/frontend/inertia

This guide covers using Inertia with AdonisJS to build single-page applications. You will learn how to:

*   Render Inertia pages from controllers and routes and pass props to frontend components
*   Scaffold page components with the `make:page` command
*   Structure the `inertia/` directory and understand key configuration files
*   Generate end-to-end types for pages and shared data
*   Use data loading patterns like optional, deferred, and mergeable props
*   Build forms and navigation with the `Link` and `Form` components
*   Share data globally and scope validation errors with error bags
*   Customize the root Edge template with the `@inertia` and `@inertiaHead` tags
*   Control redirects, browser history, and history encryption
*   Enable server-side rendering (SSR)
*   Understand the request lifecycle in Inertia applications

## Overview

Inertia acts as a bridge between AdonisJS and frontend frameworks like React and Vue. It eliminates the need for client-side routing or complex state management libraries by embracing a server-first architecture. You write controllers and routes exactly as you would in a traditional server-rendered application, but instead of returning HTML or JSON, you render Inertia pages that your frontend framework displays.

This approach gives you the best of both worlds: the simplicity of server-side routing and data fetching combined with the rich interactivity of React or Vue for the view layer. AdonisJS officially supports both frameworks through the Inertia starter kit.

See also: [How Inertia works](https://inertiajs.com/how-it-works) on the official Inertia documentation.

## Basic example

Let's walk through rendering a posts list end-to-end. The flow has three pieces: a route, a controller that calls `inertia.render()`, and a page component inside `inertia/pages/`.

1.   #### Register a route

Routes look identical to any other AdonisJS route. There is no special routing layer for Inertia.

`router.get('/posts', [controllers.Posts, 'index'])` 
2.   #### Render a page from the controller

The HTTP context exposes an `inertia` object. Call `inertia.render()` with two arguments: the page component path (relative to `inertia/pages/`) and an object of props the component receives.

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  async index({ inertia }: HttpContext) {
    const posts = await Post.all()

    return inertia.render('posts/index', {
      posts: PostTransformer.transform(posts)
    })
  }
}
``` 
Use a [transformer](https://docs.adonisjs.com/guides/frontend/transformers) to serialize model instances into plain objects. Transformers also generate frontend types under the `Data` namespace, keeping props in sync with the backend.

3.   #### Create the page component

The string `'posts/index'` resolves to `inertia/pages/posts/index.tsx` (or `.vue`). Scaffold the file with `node ace make:page posts/index`. The component receives the props from `inertia.render()` directly.

```
import { InertiaProps } from '~/types'
import { Data } from '@generated/data'

type PageProps = InertiaProps<{ posts: Data.Post[] }>

export default function PostsIndex({ posts }: PageProps) {
  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
        </div>
      ))}
    </>
  )
}
``` ```
<script setup lang="ts">
import { Data } from '@generated/data'

defineProps<{ posts: Data.Post[] }>()
</script>

<template>
  <div v-for="post in posts" :key="post.id">
    <h2>{{ post.title }}</h2>
  </div>
</template>
``` 
The `InertiaProps` helper merges your page-specific props with [shared data](https://docs.adonisjs.com/guides/frontend/inertia#shared-data) , so global props like `user` or `flash` are typed alongside `posts`.

### Rendering from a route

For pages without controller logic, skip the controller and render directly from the route definition using `renderInertia()`.

```
router.on('/about').renderInertia('about')

router.on('/pricing').renderInertia('marketing/pricing', {
  plans: ['starter', 'pro', 'enterprise'],
})
```

The component name is type-checked against the generated `InertiaPages` interface, so typos are caught at compile time.

### What happens behind the scenes

On the very first request to `/posts`, Inertia returns an HTML shell containing a root `<div>` with the page component name and serialized props as a `data-page` attribute. The frontend bundle reads that attribute and boots React or Vue.

For every subsequent navigation (link clicks, form submits) Inertia issues a `fetch` request with an `X-Inertia` header. The server runs the same controller but returns a JSON page object instead of HTML. The client swaps in the new component and updates the URL. No full page reload, no separate API.

## The inertia directory

The `inertia/` directory contains your frontend application. Here is the structure created by the starter kit:

```
inertia/
├── app.tsx (or app.vue)     # Frontend application entrypoint
├── client.ts                # Tuyau API client setup
├── ssr.tsx (or ssr.vue)     # SSR entrypoint (when enabled)
├── tsconfig.json            # TypeScript config for frontend code
├── types.ts                 # Shared type definitions
├── css/
│   └── app.css              # Global styles
├── layouts/                 # Reusable layout components
│   └── default.tsx
└── pages/                   # Page components rendered by controllers
    └── home.tsx
```

The `pages/` directory is where Inertia looks for components when you call `inertia.render()`. The path you pass (like `posts/index`) maps directly to a file in this directory (`inertia/pages/posts/index.tsx`).

The `app.tsx` (or `app.vue`) file is the entrypoint that boots your frontend application. It initializes Inertia with your page components and any global configuration. The `ssr.tsx` file serves the same purpose for server-side rendering.

You can create additional directories as your project grows, such as `components/` for shared UI elements or `hooks/` for custom React hooks.

## Configuration files

Two configuration files control how Inertia works in your AdonisJS application.

The `config/inertia.ts` file defines the Inertia adapter settings.

```
import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  ssr: {
    enabled: false,
    entrypoint: 'inertia/ssr.tsx',
  },
})

export default inertiaConfig
```

The supported options are:

```
rootView
```

The Edge template that renders the initial HTML shell. Defaults to `inertia_layout`. Pass a function to choose a different template per request, for example to render a marketing layout for unauthenticated users.

`rootView: (ctx) => ctx.auth.isAuthenticated ? 'app_layout' : 'marketing_layout'`

```
encryptHistory
```

Encrypts sensitive page props stored in the 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/frontend/tanstack-query
Source: https://docs.adonisjs.com/guides/frontend/tanstack-query

## TanStack Query Integration

This guide covers the TanStack Query integration for Tuyau. You will learn how to:

*   Install and configure `@tuyau/react-query` or `@tuyau/vue-query`
*   Generate type-safe query and mutation options
*   Implement infinite scrolling with pagination
*   Manage cache invalidation at different levels of granularity
*   Handle errors from failed API calls

## Overview

The `@tuyau/react-query` and `@tuyau/vue-query` packages provide seamless integration between Tuyau and [TanStack Query](https://tanstack.com/query) . Instead of creating custom hooks or composables, Tuyau generates type-safe options objects that you pass directly to TanStack Query's standard primitives like `useQuery`, `useMutation`, and `useInfiniteQuery`.

This approach gives you complete control over TanStack Query's features while maintaining end-to-end type safety. Query keys are automatically generated based on your route names and parameters, and cache invalidation becomes straightforward and type-safe. The integration works exclusively with route names, ensuring that your API calls remain decoupled from URL structures.

Both adapters share the same API surface. The only differences are framework-specific imports and component syntax.

## Prerequisites

Before using the TanStack Query integration, you must have Tuyau installed and configured in your application. Follow the [Tuyau installation guide](https://docs.adonisjs.com/guides/frontend/api-client) to set up your Tuyau client first.

You should be familiar with:

*   [TanStack Query basics](https://tanstack.com/query/latest/docs/framework/react/overview) (understanding queries, mutations, and cache management)
*   Tuyau route names and API calls

## Installation

Install the TanStack Query integration package in your frontend application.

`npm install @tanstack/react-query @tuyau/react-query`

`npm install @tanstack/vue-query @tuyau/vue-query`

Note

Make sure `@tuyau/react-query` (or `@tuyau/vue-query`) and `@tuyau/core` are on compatible versions. If you see type errors after installing, check that both packages share the same major and prerelease tag (e.g., both on `1.x` or both on `next`).

## Setup

Create your Tuyau client with TanStack Query integration. The `api` object provides access to all your routes with type-safe query and mutation options. The `client` object is the core Tuyau client, and `queryClient` is the standard TanStack Query client used for cache management and invalidation.

```
import { registry } from '~registry'
import { createTuyau } from '@tuyau/core/client'
import { QueryClient } from '@tanstack/react-query'
import { createTuyauReactQueryClient } from '@tuyau/react-query'

export const queryClient = new QueryClient()

export const client = createTuyau({ baseUrl: import.meta.env.VITE_API_URL, registry })
export const api = createTuyauReactQueryClient({ client })
```

```
import { registry } from '~registry'
import { createTuyau } from '@tuyau/core/client'
import { QueryClient } from '@tanstack/vue-query'
import { createTuyauVueQueryClient } from '@tuyau/vue-query'

export const queryClient = new QueryClient()

export const client = createTuyau({ baseUrl: import.meta.env.VITE_API_URL, registry })
export const api = createTuyauVueQueryClient({ client })
```

### Retry behavior

Tuyau is built on [Ky](https://github.com/sindresorhus/ky) , which has automatic retry enabled by default for failed requests. When using the TanStack Query integration, Ky's retry mechanism is automatically disabled to let TanStack Query handle retries instead, since it also has built-in retry functionality.

This prevents double retries (Ky retrying, then TanStack Query retrying on top) and gives you full control over retry behavior through TanStack Query's configuration.

```
const postsQuery = useQuery(
  api.posts.index.queryOptions(
    {},
    {
      retry: 3, // TanStack Query handles retries
    }
  )
)
```

## Basic queries

Use `queryOptions()` to generate options for TanStack Query's `useQuery` hook. All queries use route names rather than URLs. The response data is fully typed based on your backend controller's return value, so TypeScript knows the exact shape of the data without any manual type annotations.

```
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/client'

export default function PostsList() {
  const postsQuery = useQuery(
    api.posts.index.queryOptions()
  )

  if (postsQuery.isLoading) return <div>Loading...</div>
  if (postsQuery.isError) return <div>Error loading posts</div>

  return (
    <div>
      {postsQuery.data?.posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

```
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { api } from '~/lib/client'

const { data, isLoading, isError } = useQuery(
  api.posts.index.queryOptions()
)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error loading posts</div>
  <div v-else>
    <article v-for="post in data?.posts" :key="post.id">
      <h2>{{ post.title }}</h2>
      <p>{{ post.content }}</p>
    </article>
  </div>
</template>
```

## Queries with parameters

Pass route parameters and query parameters to `queryOptions()` as the first argument. The second argument accepts any standard TanStack Query options like `staleTime`, `enabled`, or `refetchInterval`.

```
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/client'

export default function PostDetail({ postId }: { postId: string }) {
  const postQuery = useQuery(
    api.posts.show.queryOptions(
      {
        params: { id: postId },
        query: { include: 'comments' }
      },
      {
        staleTime: 5000,
        refetchOnWindowFocus: false
      }
    )
  )

  return <div>{postQuery.data?.post.title}</div>
}
```

```
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { api } from '~/lib/client'

const props = defineProps<{ postId: string }>()

const { data } = useQuery(
  api.posts.show.queryOptions(
    {
      params: { id: props.postId },
      query: { include: 'comments' }
    },
    {
      staleTime: 5000,
      refetchOnWindowFocus: false
    }
  )
)
</script>

<template>
  <div>{{ data?.post.title }}</div>
</template>
```

## Conditional queries with skipToken

Use `skipToken` to conditionally disable a query while preserving type safety. This is cleaner than using the `enabled` option for conditional fetching because the query function signature stays the same whether or not the query is active. When `skipToken` is passed, TanStack Query skips the query entirely. Once the value becomes truthy, the query fetches automatically.

```
import { useQuery, skipToken } from '@tanstack/react-query'
import { api } from '~/lib/client'

export default function UserProfile({ userId }: { userId: string | null

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/frontend/transformers
Source: https://docs.adonisjs.com/guides/frontend/transformers

This guide covers data transformation in AdonisJS applications. You will learn how to:

*   Serialize rich data types like classes, BigInt, and Lucid models to JSON while retaining type information
*   Shape API responses by including or excluding fields
*   Use transformer variants for different output contexts
*   Handle relationships and pagination
*   Generate TypeScript types that eliminate duplicate type definitions between your backend and frontend

## Overview

Transformers provide a structured way to convert your backend data into JSON responses for HTTP clients. When building APIs or full-stack applications, the data structures you work with in your backend (Lucid models, custom classes, DateTime objects) cannot be sent directly over HTTP—everything must be serialized to JSON first, which is fundamentally a string format.

Rather than letting AdonisJS handle serialization implicitly, transformers give you explicit control over this process. You define exactly which fields to include, how to format them, and what shape your responses should take. This approach offers several benefits:

*   You can keep sensitive information out of responses
*   Apply consistent formatting rules across your application
*   Shape responses around your frontend's needs rather than your database structure
*   And generate TypeScript types that your frontend can reference directly

Tip

If you're building an Inertia application or any API that returns JSON data, we highly recommend using transformers for all HTTP responses. The generated TypeScript types eliminate the need to maintain duplicate type definitions, ensuring your frontend and backend stay in sync automatically.

### Understanding JSON serialization

Before diving into transformers, it's important to understand why they exist. When you send data over HTTP, everything must be converted to a string—specifically, a JSON string. This means rich data types from your programming language cannot be transmitted directly.

Consider a Lucid model with a `createdAt` field that's a Luxon DateTime object. In JavaScript/TypeScript, this is a complex object with methods like `.toISO()` and `.diff()`. But when sent over HTTP, it must become a simple string like `"2024-01-15T10:30:00.000Z"`. Similarly, a BigInt value or a custom class instance must be converted to a JSON-compatible format.

Without explicit serialization control, you might accidentally expose sensitive data, send inconsistent date formats, or include internal implementation details that your frontend doesn't need. Transformers solve this by requiring you to be explicit about what gets serialized and how.

## Creating your first transformer

Let's start with a practical example. Suppose you have a Post model and need to return post data to your frontend. First, here's what the Post model looks like.

```
import User from '#models/user'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>
}
```

1.   #### Generate the transformer

Run the following command to create a transformer for posts.

```
node ace make:transformer post
# CREATE: app/transformers/post_transformer.ts
``` 
This creates a file in the `app/transformers` directory with the following default structure.

```
import { BaseTransformer } from '@adonisjs/core/transformers'
import Post from '#models/post'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return this.pick(this.resource, ['id'])
  }
}
``` 
The transformer extends `BaseTransformer` with a generic type parameter specifying what it transforms (in this case, `Post`). The `toObject()` method defines the default output shape. The `this.resource` property gives you access to the Post instance being transformed.

2.   #### Define the output shape

The `toObject()` method determines what fields appear in your JSON response. The `this.pick()` helper selects specific fields from the model. Let's expand our transformer to include the fields we want.

```
import { BaseTransformer } from '@adonisjs/core/transformers'
import type Post from '#models/post'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'title', 
      'content',
      'createdAt',
      'updatedAt'
    ])
  }
}
``` 
This transformer explicitly includes only these five fields. Any other fields on the Post model (like internal metadata or sensitive data) will be excluded from the output.

3.   #### Use the transformer in your controller

Now let's use this transformer in a controller to return data. Use `node ace make:controller posts` command to create a controller, if it does not already exist.

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  async index({ serialize }: HttpContext) {
    const posts = await Post.all()
    return serialize(PostTransformer.transform(posts))
  }

  async show({ serialize, params }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    return serialize(PostTransformer.transform(post))
  }
}
``` 
The pattern is straightforward: call `PostTransformer.transform()` with your data, then wrap the result in the `serialize()` helper from the HTTP context. The `serialize()` function handles the actual JSON conversion and sends the response.

The same transformer works for both a single post and a collection of posts. AdonisJS automatically detects whether you're transforming one item or many and structures the output accordingly.

4.   #### Register routes

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('posts', [controllers.Posts, 'index'])
router.get('posts/:id', [controllers.Posts, 'show'])
``` 
5.   #### Understanding the generated types

When you start your development server with `node ace serve --hmr`, AdonisJS automatically generates TypeScript types for your transformers. These types are stored in `.adonisjs/client/data.d.ts`.

```
import type { InferData, InferVariants } from '@adonisjs/core/types/transformers'
import type PostTransformer from '#transformers/post_transformer'

export namespace Data {
  export type Post = InferData<PostTransformer>
  
  export namespace Post {
    export type Variants = InferVariants<PostTransformer>
  }
}
``` 
Your frontend cod

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/frontend/vite
Source: https://docs.adonisjs.com/guides/frontend/vite

This guide covers frontend asset bundling with Vite in AdonisJS. You will learn how to:

*   Install and configure the Vite integration
*   Define entrypoints and reference assets in Edge templates
*   Process static assets like images and fonts
*   Configure TypeScript for frontend code
*   Enable Hot Module Replacement with React
*   Deploy bundled assets to a CDN

## Overview

Vite is a modern frontend build tool that provides fast development server startup and instant hot module replacement. AdonisJS embeds Vite directly into the development server rather than running it as a separate process. This embedded approach means you manage a single server during development, and AdonisJS can access Vite's runtime API directly for features like server-side rendering.

The integration handles the complexity of connecting Vite with a backend framework. During development, AdonisJS proxies asset requests to Vite through middleware. In production, AdonisJS reads the manifest file that Vite generates to resolve the correct paths for bundled assets.

The official `@adonisjs/vite` package provides Edge helpers and tags for generating asset URLs, a dedicated Vite plugin that simplifies configuration, and access to the Vite Runtime API for server-side rendering.

See also: [Vite documentation](https://vitejs.dev/)

## Installation

Run the following command to install and configure the package. This installs both `@adonisjs/vite` and `vite`, then creates the necessary configuration files.

`node ace add @adonisjs/vite`

See steps performed by the configure command

1.   Registers the following service provider inside the `adonisrc.ts` file.

```
{
  providers: [
    // ...other providers
    () => import('@adonisjs/vite/vite_provider')
  ]
}
```

1.   Creates `vite.config.ts` and `config/vite.ts` configuration files.
2.   Creates the frontend entry point file at `resources/js/app.js`.

After installation, add the following to your `adonisrc.ts` file to integrate Vite with the build process.

```
import { defineConfig } from '@adonisjs/core/build/standalone'

export default defineConfig({
  hooks: {
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
})
```

The `assetsBundler` property disables the default asset bundler management in AdonisJS Assembler. The `hooks` property registers the Vite build hook to execute the Vite build process when you run `node ace build`.

See also: [Assembler hooks](https://docs.adonisjs.com/guides/concepts/assembler-hooks)

## Configuration

The setup process creates two configuration files. The `vite.config.ts` file configures the Vite bundler itself, while `config/vite.ts` configures how AdonisJS interacts with Vite on the backend.

### Vite configuration

The `vite.config.ts` file is a standard Vite configuration file. You can install and register additional Vite plugins here based on your project requirements.

The AdonisJS plugin accepts the following options.

```
import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entry point files for your frontend code. Each entry point
       * produces a separate output bundle. You can define multiple
       * entry points for different parts of your application.
       */
      entrypoints: ['resources/js/app.js'],

      /**
       * Glob patterns for files that trigger a browser reload when
       * changed. Useful for template files that Vite doesn't track.
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ]
})
```

| Option | Description | Default |
| --- | --- | --- |
| `entrypoints` | Array of entry point files for your frontend code. Each entry point produces a separate bundle. | Required |
| `buildDirectory` | Relative path to the output directory. Passed to Vite as `build.outDir`. | `public/assets` |
| `reload` | Array of glob patterns for files that trigger browser reload on change. | `[]` |
| `assetsUrl` | URL prefix for asset links in production. Set this to your CDN URL when deploying assets to a CDN. | `/assets` |

Tip

If you change `buildDirectory`, you must update the same value in `config/vite.ts` to keep both configurations in sync.

### AdonisJS configuration

The `config/vite.ts` file tells AdonisJS where to find Vite's build output and how to generate asset URLs.

```
import { defineConfig } from '@adonisjs/vite'

export default defineConfig({
  /**
   * Path to Vite's build output directory. Must match the
   * buildDirectory option in vite.config.ts.
   */
  buildDirectory: 'public/assets',

  /**
   * URL prefix for asset links. Set to your CDN URL in production
   * if you deploy assets to a CDN.
   */
  assetsUrl: '/assets',
})
```

| Option | Description |
| --- | --- |
| `buildDirectory` | Path to Vite's build output directory. Must match the value in `vite.config.ts`. |
| `assetsUrl` | URL prefix for asset links in production. Set to your CDN URL when deploying assets to a CDN. |
| `scriptAttributes` | Key-value pairs of attributes to add to script tags generated by the `@vite` tag. |
| `styleAttributes` | Key-value pairs of attributes to add to link tags generated by the `@vite` tag. |

You can add custom attributes to the generated script and link tags.

```
import { defineConfig } from '@adonisjs/vite'

export default defineConfig({
  buildDirectory: 'public/assets',
  assetsUrl: '/assets',
  scriptAttributes: {
    defer: true,
  },
})
```

For conditional attributes based on the asset being loaded, pass a function instead.

```
import { defineConfig } from '@adonisjs/vite'

export default defineConfig({
  buildDirectory: 'public/assets',
  assetsUrl: '/assets',
  styleAttributes: ({ src, url }) => {
    if (src === 'resources/css/admin.css') {
      return {
        'data-turbo-track': 'reload'
      }
    }
  }
})
```

## Folder structure

AdonisJS does not enforce a specific folder structure for frontend assets. However, we recommend storing them in the `resources` directory with subdirectories for each asset type.

```
resources
├── css
│   └── app.css
├── js
│   └── app.js
├── fonts
└── images
```

Vite outputs bundled files to `public/assets` by default. The `/assets` subdirectory keeps Vite output separate from other static files in the `public` folder that you may not want Vite to process.

## Starting the development server

Start your application with the `--hmr` flag to enable Hot Module Replacement. AdonisJS automatically proxies asset requests to the embedded Vite server.

`node ace serve --hmr`

**Hot Module Replacement (HMR)** allows Vite to update modules in the browser without a full page reload. When you edit a CSS file or a JavaScript module, the changes appear instantly while preserving application state.

## Including entrypoints in templates

Use the `@vite` Edge tag to render script and link tags for your entrypoints. The tag accepts an array of entry point paths and generates the appropriate HTML tags.

```
<!D

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
