# AdonisJS

> AdonisJS is a TypeScript-first web framework for Node.js for creating full-stack web apps and API servers. It ships with a set of first-party packages for routing, validation, the Lucid ORM, authentication, testing, and more.

This file indexes the official documentation as Markdown for LLMs. Every page is also available as raw Markdown by appending `.md` to its URL. A single file containing the entire documentation is available at https://docs.adonisjs.com/llms-full.txt.

## Getting started

- [Introduction](https://docs.adonisjs.com/introduction.md): An overview of AdonisJS and the design principles behind it.
- [Pick your path](https://docs.adonisjs.com/stacks-and-starter-kits.md): Understand AdonisJS's approach to frontend development and choose between Hypermedia, Inertia, and API-only stacks for your application.
- [Installation](https://docs.adonisjs.com/installation.md): Learn how to create a new AdonisJS application and start the development server.
- [Folder structure](https://docs.adonisjs.com/folder-structure.md): Understand the default folder structure of an AdonisJS application and the role of each file and directory.
- [Development environment setup](https://docs.adonisjs.com/dev-environment.md): Learn how to configure an efficient development environment for building applications with AdonisJS.
- [Configuration & Environment](https://docs.adonisjs.com/configuration.md): Learn how to manage configuration and environment variables in AdonisJS applications with type-safe validation.
- [Deployment](https://docs.adonisjs.com/deployment.md): Learn how to build and deploy AdonisJS applications to production, including creating standalone builds and configuring production environments.
- [FAQs](https://docs.adonisjs.com/faqs.md): Quick answers to the most common questions about AdonisJS, including framework sustainability, technical capabilities, and production readiness.

## FullStack tutorial

- [Overview (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/overview.md): Build a fully functional community showcase website with AdonisJS and learn how to create hypermedia-driven web applications.
- [Overview (React)](https://docs.adonisjs.com/tutorial/react/overview.md): Build a fully functional community showcase website with AdonisJS, Inertia, and React, and learn how to create modern full-stack web applications.
- [Commandline and REPL (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/cli-and-repl.md): Learn to use the AdonisJS Ace CLI and REPL to generate files and interact with your application during the DevShow tutorial.
- [Commandline and REPL (React)](https://docs.adonisjs.com/tutorial/react/cli-and-repl.md): Learn to use the AdonisJS Ace CLI and REPL to generate files and interact with your application during the DevShow React tutorial.
- [Database and models (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/database-and-models.md): Create models and database migrations for the DevShow tutorial application, define relationships, and seed test data using factories.
- [Database and models (React)](https://docs.adonisjs.com/tutorial/react/database-and-models.md): Create models and database migrations for the DevShow React tutorial application, define relationships, and seed test data using factories.
- [Routes, controllers and views (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/routes-controller-views.md): Build routes, controllers, and Edge template views for the DevShow tutorial application to display posts and comments.
- [Routes, controllers and views (React)](https://docs.adonisjs.com/tutorial/react/routes-controller-views.md): Build routes, controllers, and React views using Inertia for the DevShow tutorial application to display posts and comments.
- [Forms and validation (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/forms-and-validation.md): Add form handling and validation to the DevShow tutorial application to allow users to create posts and comments.
- [Forms and validation (React)](https://docs.adonisjs.com/tutorial/react/forms-and-validation.md): Add form handling and validation to the DevShow React tutorial application to allow users to create posts and comments using Inertia forms.
- [Styling and cleanup (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/styling-and-cleanup.md): Style and improve the user experience of the DevShow tutorial application by adding navigation, CSS, and visual polish.
- [Styling and cleanup (React)](https://docs.adonisjs.com/tutorial/react/styling-and-cleanup.md): Style and improve the user experience of the DevShow React tutorial application by adding navigation, CSS, and visual polish.
- [Authorization (Hypermedia)](https://docs.adonisjs.com/tutorial/hypermedia/authorization.md): Add authorization to the DevShow tutorial application using AdonisJS Bouncer policies to restrict editing and deleting of posts and comments.
- [Authorization (React)](https://docs.adonisjs.com/tutorial/react/authorization.md): Add authorization to the DevShow React tutorial application using AdonisJS Bouncer policies to restrict editing and deleting of posts and comments.

## Resources

- [Contributing](https://docs.adonisjs.com/contributing.md): Contributing to AdonisJS projects is a great way to give back to the community. This guide provides a general overview of how you can contribute to any AdonisJS project.
- [Releases](https://docs.adonisjs.com/releases.md): AdonisJS release history and changelog, including new features, bug fixes, and breaking changes.
- [Governance](https://docs.adonisjs.com/governance.md): Governance model for the AdonisJS project, outlining roles, responsibilities, and decision-making processes.
- [Upgrade guide](https://docs.adonisjs.com/v6-to-v7.md)

## Basics

- [Routing](https://docs.adonisjs.com/guides/basics/routing.md): Define URL patterns, handle dynamic routes, create resource routes, and use the type-safe URL builder for navigation.
- [Controllers](https://docs.adonisjs.com/guides/basics/controllers.md): Learn how to create and use controllers to organize your route handlers in AdonisJS applications.
- [HTTP context](https://docs.adonisjs.com/guides/basics/http-context.md): Learn about the HTTP context object in AdonisJS and how to access request-specific data and services.
- [Middleware](https://docs.adonisjs.com/guides/basics/middleware.md): Learn how to use and create middleware in AdonisJS to handle cross-cutting concerns during HTTP requests.
- [Request](https://docs.adonisjs.com/guides/basics/request.md): Learn how to work with HTTP requests in AdonisJS, including reading request data, headers, cookies, and handling trusted proxies.
- [Response](https://docs.adonisjs.com/guides/basics/response.md): Learn how to construct HTTP responses in AdonisJS, including sending different response formats, headers, cookies, redirects, and file downloads.
- [Body parser](https://docs.adonisjs.com/guides/basics/body-parser.md): Learn how to configure the body parser to handle JSON, form data, and file uploads in AdonisJS applications.
- [Validation](https://docs.adonisjs.com/guides/basics/validation.md): Learn how to validate user input in AdonisJS using VineJS validators at the controller level.
- [File uploads](https://docs.adonisjs.com/guides/basics/file-uploads.md): Learn how to handle file uploads in AdonisJS, from basic single file uploads to advanced direct uploads with cloud storage providers.
- [Session](https://docs.adonisjs.com/guides/basics/session.md): Learn how to use sessions to persist state across HTTP requests in AdonisJS applications.
- [URL builder](https://docs.adonisjs.com/guides/basics/url-builder.md): Learn how to generate type-safe URLs for named routes in templates, redirects, and frontend applications.
- [Exception handling](https://docs.adonisjs.com/guides/basics/exception-handling.md): Learn how to handle and report exceptions during HTTP requests in AdonisJS applications.
- [Debugging](https://docs.adonisjs.com/guides/basics/debugging.md): Learn how to debug AdonisJS applications using VSCode, Node.js inspector, debug logs, and Edge template helpers.
- [Static file server](https://docs.adonisjs.com/guides/basics/static-file-server.md): Learn how to serve static files from the public directory using the @adonisjs/static package.

## Frontend

- [EdgeJS](https://docs.adonisjs.com/guides/frontend/edgejs.md): Learn how to use Edge templates in AdonisJS applications to render HTML on the server-side.
- [Inertia](https://docs.adonisjs.com/guides/frontend/inertia.md): Learn how to build modern single-page applications using Inertia with AdonisJS, React, and Vue.
- [Transformers](https://docs.adonisjs.com/guides/frontend/transformers.md): Learn how to transform and serialize data in AdonisJS applications, including converting models to JSON and generating TypeScript types for frontend use.
- [Type-safe API Client](https://docs.adonisjs.com/guides/frontend/api-client.md): Learn how to use Tuyau, a type-safe HTTP client for AdonisJS applications that enables end-to-end type safety between backend and frontend.
- [TanStack query](https://docs.adonisjs.com/guides/frontend/tanstack-query.md): Learn how to integrate TanStack Query with Tuyau for type-safe API calls, infinite scrolling, and cache management in AdonisJS applications.
- [Vite](https://docs.adonisjs.com/guides/frontend/vite.md): Learn how to use Vite to bundle frontend assets in AdonisJS applications.

## Data Layer

- [SQL ORM](https://docs.adonisjs.com/guides/database/lucid.md): Learn how to use Lucid ORM, the official SQL ORM for AdonisJS, including models, query builder, migrations, and relationships.
- [Redis](https://docs.adonisjs.com/guides/database/redis.md): Use Redis inside your AdonisJS applications using the @adonisjs/redis package.

## Auth

- [Introduction](https://docs.adonisjs.com/guides/auth/introduction.md): Learn about the authentication system in AdonisJS and how to authenticate users in your application.
- [Verifying user credentials](https://docs.adonisjs.com/guides/auth/verifying-user-credentials.md): Learn how to securely verify user credentials in an AdonisJS application using the AuthFinder mixin.
- [Session guard](https://docs.adonisjs.com/guides/auth/session-guard.md): Learn how to authenticate users using the session guard in AdonisJS.
- [Access tokens guard](https://docs.adonisjs.com/guides/auth/access-tokens-guard.md): Learn how to authenticate HTTP requests using opaque access tokens in AdonisJS.
- [Basic auth guard](https://docs.adonisjs.com/guides/auth/basic-auth-guard.md): Learn how to authenticate HTTP requests using the HTTP Basic Authentication protocol in AdonisJS.
- [Custom auth guard](https://docs.adonisjs.com/guides/auth/custom-auth-guard.md): Learn how to create a custom authentication guard for AdonisJS.
- [Social authentication](https://docs.adonisjs.com/guides/auth/social-authentication.md): Implement social authentication in your AdonisJS applications using the @adonisjs/ally package.
- [Authorization](https://docs.adonisjs.com/guides/auth/authorization.md): Learn how to implement authorization in AdonisJS using abilities and policies with the Bouncer package.

## Security

- [Hashing](https://docs.adonisjs.com/guides/security/hashing.md): Learn how to securely hash and verify passwords using the AdonisJS hash service.
- [Encryption](https://docs.adonisjs.com/guides/security/encryption.md): Learn how to encrypt and decrypt sensitive data in your AdonisJS applications.
- [CORS](https://docs.adonisjs.com/guides/security/cors.md): Learn how to implement CORS in AdonisJS to control cross-origin access to your API.
- [Securing SSR apps](https://docs.adonisjs.com/guides/security/securing-ssr-applications.md): Learn how to protect your server-rendered applications from common web attacks using the @adonisjs/shield package.
- [Rate limiting](https://docs.adonisjs.com/guides/security/rate-limiting.md): Protect your web application or API server from abuse by implementing rate limits using the @adonisjs/limiter package.

## Core Concepts

- [Application lifecycle](https://docs.adonisjs.com/guides/concepts/application-lifecycle.md): Learn about the application lifecycle in AdonisJS, including the boot, start, and termination phases.
- [Dependency injection](https://docs.adonisjs.com/guides/concepts/dependency-injection.md): Learn how dependency injection works in AdonisJS and how to use the IoC container to manage class dependencies automatically.
- [Service providers](https://docs.adonisjs.com/guides/concepts/service-providers.md): Learn about service providers in AdonisJS and how to use lifecycle hooks to execute code during application startup and shutdown.
- [Container services](https://docs.adonisjs.com/guides/concepts/container-services.md): Learn about container services in AdonisJS and how they provide convenient access to framework components through ES module imports.
- [Barrel files](https://docs.adonisjs.com/guides/concepts/barrel-files.md): Understand what barrel files are, why AdonisJS uses them, and how they help reduce visual clutter in your codebase.
- [Assembler hooks](https://docs.adonisjs.com/guides/concepts/assembler-hooks.md): Learn how to use Assembler hooks to run custom actions during the development, testing, and build lifecycle of your AdonisJS application.
- [Scaffolding and codemods](https://docs.adonisjs.com/guides/concepts/scaffolding.md): Learn how to create configure hooks for AdonisJS packages using stubs and codemods.
- [Extending AdonisJS](https://docs.adonisjs.com/guides/concepts/extending-adonisjs.md): Learn how to extend the AdonisJS framework using macros and getters.

## Digging Deeper

- [Cache](https://docs.adonisjs.com/guides/digging-deeper/cache.md): Learn how to use caching in AdonisJS applications to improve performance with multiple cache stores, multi-tier caching, and resiliency features.
- [Drive](https://docs.adonisjs.com/guides/digging-deeper/drive.md): Learn how to manage user-uploaded files using AdonisJS Drive, a unified API for local filesystem and cloud storage services like S3, GCS, R2, and more.
- [Emitter](https://docs.adonisjs.com/guides/digging-deeper/emitter.md): Learn how to use the AdonisJS event emitter to build event-driven applications with type-safe events and listeners.
- [Health checks](https://docs.adonisjs.com/guides/digging-deeper/health-checks.md): Learn how to add health checks to your AdonisJS application for monitoring liveness and readiness in production environments.
- [I18n](https://docs.adonisjs.com/guides/digging-deeper/i18n.md): Learn how to create web apps for multiple regions and languages using the @adonisjs/i18n package.
- [Atomic locks](https://docs.adonisjs.com/guides/digging-deeper/locks.md): Learn how to use atomic locks in AdonisJS to prevent race conditions and coordinate concurrent operations.
- [Logger](https://docs.adonisjs.com/guides/digging-deeper/logger.md): Learn how to use the AdonisJS logger to write logs to the console, files, and external services. Built on top of Pino, the logger is fast and supports multiple targets.
- [Mail](https://docs.adonisjs.com/guides/digging-deeper/mail.md): Learn how to send emails from your AdonisJS application using the @adonisjs/mail package.
- [Queues](https://docs.adonisjs.com/guides/digging-deeper/queues.md): Learn how to use job queues in AdonisJS to process tasks in the background with support for retries, scheduling, and multiple backends.
- [Server-Sent Events](https://docs.adonisjs.com/guides/digging-deeper/server-sent-events.md): Learn how to push real-time updates from server to client using Server-Sent Events with Transmit in AdonisJS.
- [OpenTelemetry](https://docs.adonisjs.com/guides/digging-deeper/opentelemetry.md): Add distributed tracing and observability to your AdonisJS application with OpenTelemetry.

## Command line

- [Introduction](https://docs.adonisjs.com/guides/ace/introduction.md): Ace is a command line framework used by AdonisJS to create and run console commands.
- [Creating commands](https://docs.adonisjs.com/guides/ace/creating-commands.md): Learn how to create custom Ace commands in AdonisJS
- [Command arguments](https://docs.adonisjs.com/guides/ace/arguments.md): Learn about defining and processing command arguments in Ace commands.
- [Command flags](https://docs.adonisjs.com/guides/ace/flags.md): Learn how to define and process command flags in Ace commands.
- [Prompts](https://docs.adonisjs.com/guides/ace/prompts.md): Prompts are terminal widgets for user input, using the @poppinss/prompts package. They support various types like input, password, and select, and are designed for easy testing integration.
- [Terminal UI](https://docs.adonisjs.com/guides/ace/terminal-ui.md): Ace Terminal UI utilizes the @poppinss/cliui package, offering tools to display logs, tables, and animations. Designed for testing, it includes a 'raw' mode to simplify log collection and assertions.
- [Repl](https://docs.adonisjs.com/guides/ace/repl.md): AdonisJS offers an application-aware REPL to interact with your application from the command line.

## Testing

- [Introduction](https://docs.adonisjs.com/guides/testing/introduction.md): Learn how testing is configured in AdonisJS applications using Japa, and how to create, run, and filter tests.
- [API tests](https://docs.adonisjs.com/guides/testing/api-tests.md): Learn how to test JSON API endpoints in AdonisJS using Japa's API client.
- [Browser tests](https://docs.adonisjs.com/guides/testing/browser-tests.md): Learn how to write end-to-end browser tests for hypermedia and Inertia applications using Playwright.
- [Console tests](https://docs.adonisjs.com/guides/testing/console-tests.md): Learn how to test custom Ace commands in AdonisJS applications.
- [Resetting state between tests](https://docs.adonisjs.com/guides/testing/resetting-state-between-tests.md): Learn how to manage application state during testing in AdonisJS, including database migrations, state cleanup, and test environment configuration.
- [Database assertions](https://docs.adonisjs.com/guides/testing/database-assertions.md): Learn how to assert database state in your AdonisJS tests using Lucid's database assertions plugin.
- [Test doubles](https://docs.adonisjs.com/guides/testing/test-doubles.md): Learn how to use test doubles in AdonisJS, including built-in fakes for Mail, Hash, Emitter, and Drive, container swaps for dependency injection, and time utilities for testing time-sensitive code.

## Reference

- [Application](https://docs.adonisjs.com/reference/application.md): Learn about the Application class and how to access the environment, state, and make paths to project files.
- [AdonisRC file](https://docs.adonisjs.com/reference/adonisrc-rcfile.md): The adonisrc.ts file is used to configure the workspace settings of your application.
- [Commands](https://docs.adonisjs.com/reference/commands.md): Learn about the commands shipped with the AdonisJS framework core and official packages.
- [Edge helpers](https://docs.adonisjs.com/reference/edge.md): Learn about the helpers and tags contributed by the AdonisJS official packages to the Edge templating engine.
- [Events](https://docs.adonisjs.com/reference/events.md): Learn about the events dispatched by the AdonisJS framework core and official packages.
- [Exceptions](https://docs.adonisjs.com/reference/exceptions.md): Learn about the exceptions raised by the AdonisJS framework core and official packages.
- [Helpers](https://docs.adonisjs.com/reference/helpers.md): AdonisJS bundles its utilities into the helpers module and makes them available to your application code.
- [Types helpers](https://docs.adonisjs.com/reference/types-helpers.md): Reference guide for TypeScript type helper utilities available in AdonisJS for type inference and manipulation.
