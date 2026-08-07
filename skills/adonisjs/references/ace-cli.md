# Ace CLI — AdonisJS v7

Official: https://docs.adonisjs.com/guides/ace/introduction.md  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/ace/creating-commands`

## Official pages

- [Introduction](https://docs.adonisjs.com/guides/ace/introduction.md)
- [Creating commands](https://docs.adonisjs.com/guides/ace/creating-commands.md)
- [Arguments](https://docs.adonisjs.com/guides/ace/arguments.md)
- [Flags](https://docs.adonisjs.com/guides/ace/flags.md)
- [Prompts](https://docs.adonisjs.com/guides/ace/prompts.md)
- [Terminal UI](https://docs.adonisjs.com/guides/ace/terminal-ui.md)
- [REPL](https://docs.adonisjs.com/guides/ace/repl.md)
- [Commands reference](https://docs.adonisjs.com/reference/commands.md)

## Everyday commands

```bash
node ace                         # help / list
node ace serve --hmr
node ace build
node ace list:routes
node ace make:controller posts
node ace make:model post -m
node ace make:validator post
node ace make:middleware auth_guest
node ace make:test posts/store --suite=functional
node ace migration:run
node ace migration:rollback
node ace db:seed
node ace test
node ace repl
node ace add @adonisjs/mail
node ace configure @adonisjs/lucid
```

There is **no** separate project-level generator outside the app — use `npm create adonisjs@latest` once, then **`node ace` inside the app**.

## Custom commands

```bash
node ace make:command greet
```

Define args/flags as decorated class properties; keep commands testable (prompts/UI support raw mode). See creating-commands + arguments/flags guides.

## REPL

```bash
node ace repl
```

App-aware REPL for models/services during development. Optional helpers via `start/repl.ts`.
