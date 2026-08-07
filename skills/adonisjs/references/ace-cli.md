# Ace CLI — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/ace/introduction`

```bash
node ace list:routes
node ace make:controller posts
node ace make:validator post
node ace make:model Post -m
node ace make:middleware …
node ace make:policy post
node ace make:transformer post
node ace make:view posts/index      # Hypermedia
node ace make:page posts/index      # Inertia
node ace make:preload …
node ace add @adonisjs/bouncer
node ace migration:run
node ace repl
node ace test
```

Custom commands: `guides/ace/creating-commands`. Prefer Ace generators so naming/barrels/codemods stay consistent.
