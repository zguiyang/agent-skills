---
name: adonisjs
description: Use when working with adonisjs
doc_version: 
---

# Adonisjs Skill

Use when working with adonisjs, generated from official documentation.

## When to Use This Skill

This skill should be triggered when:
- Working with adonisjs
- Asking about adonisjs features or APIs
- Implementing adonisjs solutions
- Debugging adonisjs code
- Learning adonisjs best practices

## Quick Reference

### Common Patterns

**Pattern 1:** Start / Resources Contributing Start Guides Reference Roadmap Getting started Introduction Pick your path Installation Folder structure Development...

```
git clone <REPO_URL>
```

**Pattern 2:** Start / FullStack tutorial Routes, controllers and views Start Guides Reference Roadmap Getting started Introduction Pick your path Installation Fo...

```
node ace serve --hmr
```

**Pattern 3:** When you use a controller in your route definition, AdonisJS automatically generates a route name based on the controller and method names

```
[controllers.Posts, 'index']
```

**Pattern 4:** Guides / Command line Repl Start Guides Reference Roadmap Basics Routing Controllers HTTP context Middleware Request Response Body parser Validatio...

```
node ace repl
```

**Pattern 5:** Start / Resources Upgrade guide Start Guides Reference Roadmap Getting started Introduction Pick your path Installation Folder structure Developmen...

```
node -v
```

**Pattern 6:** # AdonisJS v6 → v7 Upgrade Agent You are an upgrade agent

```
@adonisjs/*
```

**Pattern 7:** Guides / Core Concepts Scaffolding and codemods Start Guides Reference Roadmap Basics Routing Controllers HTTP context Middleware Request Response ...

```
node ace configure @adonisjs/lucid
```

**Pattern 8:** await codemods

```
await codemods.defineEnvVariables({
  API_KEY: 'secret-key-here',
}, {
  omitFromExample: ['API_KEY']
})
```

### Example Code Patterns

**Example 1** (sh):
```sh
node ace list
```

**Example 2** (sh):
```sh
node ace serve --hmr
```

**Example 3** (ts):
```ts
import { errors } from '@adonisjs/core'
if (error instanceof errors.E_ROUTE_NOT_FOUND) {
  // handle error
}
```

**Example 4** (ts):
```ts
import { errors as lucidErrors } from '@adonisjs/lucid'
if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
  // handle error
  console.log(`${error.model?.name || 'Row'} not found`)
}
```

**Example 5** (elixir):
```elixir
node ace add @adonisjs/bouncer
```

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **ace.md** - Ace documentation
- **api.md** - Api documentation
- **auth.md** - Auth documentation
- **basics.md** - Basics documentation
- **concepts.md** - Concepts documentation
- **guides.md** - Guides documentation
- **index.html.md.md** - Index.Html.Md documentation
- **other.md** - Other documentation
- **reference.md** - Reference documentation
- **tutorial.md** - Tutorial documentation

Use `view` to read specific reference files when detailed information is needed.

## Working with This Skill

### For Beginners
Start with the getting_started or tutorials reference files for foundational concepts.

### For Specific Features
Use the appropriate category reference file (api, guides, etc.) for detailed information.

### For Code Examples
The quick reference section above contains common patterns extracted from the official docs.

## Resources

### references/
Organized documentation extracted from official sources. These files contain:
- Detailed explanations
- Code examples with language annotations
- Links to original documentation
- Table of contents for quick navigation

### scripts/
Add helper scripts here for common automation tasks.

### assets/
Add templates, boilerplate, or example projects here.

## Notes

- This skill was automatically generated from official documentation
- Reference files preserve the structure and examples from source docs
- Code examples include language detection for better syntax highlighting
- Quick reference patterns are extracted from common usage examples in the docs

## Updating

To refresh this skill with updated documentation:
1. Re-run the scraper with the same configuration
2. The skill will be rebuilt with the latest information
