# Tutorial — DevShow (get-started only)

Official Hypermedia / React tutorial tracks under `/tutorial/*`.

## How to use

1. Match the user’s kit (Hypermedia vs React).
2. `python3 scripts/lookup_docs.py --fetch tutorial/react/overview` (or hypermedia).
3. Mirror Ace + folder conventions from that chapter.
4. Treat early tutorial controller stubs (`// Logic to create…`, Lucid `create` in the action) as **teaching scaffolds** — not production defaults.
5. For production-shaped CRUD, use [../examples/crud-resource.md](../examples/crud-resource.md) (Controller + `@inject` Service + optional Transformer).
6. Do not paste entire tutorials into context — one chapter at a time.

## Distilled deltas

See [stacks.md](stacks.md) for Hypermedia vs Inertia differences (transformers, `@can` vs `can.*`).
