# Reference — AdonisJS v7

Official: https://docs.adonisjs.com/reference/application.md  
Lookup: `python3 scripts/lookup_docs.py --fetch reference/exceptions`

## Official pages

- [Application](https://docs.adonisjs.com/reference/application.md)
- [AdonisRC](https://docs.adonisjs.com/reference/adonisrc-rcfile.md)
- [Commands](https://docs.adonisjs.com/reference/commands.md)
- [Edge helpers](https://docs.adonisjs.com/reference/edge.md)
- [Events](https://docs.adonisjs.com/reference/events.md)
- [Exceptions](https://docs.adonisjs.com/reference/exceptions.md)
- [Helpers](https://docs.adonisjs.com/reference/helpers.md)
- [Types helpers](https://docs.adonisjs.com/reference/types-helpers.md)

## When to open these

| Need | Page |
|------|------|
| Paths, env, app state | Application |
| Providers, aliases, test suites, hooks | AdonisRC (`node ace inspect:rcfile`) |
| Built-in Ace commands | Commands |
| Edge tags/helpers from packages | Edge helpers |
| Framework events to listen for | Events |
| Error classes (`E_*`) | Exceptions |
| Shared utilities | Helpers / Types helpers |

Fetch the page with `--fetch` rather than guessing helper names. v7 removed/renamed several helpers (`cuid`, `getDirname`, `slash`, …) — see [anti-patterns.md](anti-patterns.md).
