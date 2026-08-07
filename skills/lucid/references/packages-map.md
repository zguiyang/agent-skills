# Packages map — Lucid

Install/config + entrypoints only. Deep APIs → official docs via `lookup_docs.py`.

## Install

```bash
npm i @adonisjs/lucid
node ace configure @adonisjs/lucid --db=sqlite
```

Provider: `@adonisjs/lucid/database_provider` · Commands: `@adonisjs/lucid/commands`

## Imports

| Import | Use |
| --- | --- |
| `@adonisjs/lucid/services/db` | `db` |
| `@adonisjs/lucid/orm` | `BaseModel`, `column`, relations, hooks, `scope` |
| `@adonisjs/lucid/schema` | `BaseSchema` |
| `@adonisjs/lucid/factories` | `{ Factory }` |
| `@adonisjs/lucid/seeders` | `BaseSeeder` |
| `@adonisjs/lucid/database` | Health checks |
| `@adonisjs/lucid/types/relations` | Relation types |
| `@adonisjs/lucid/types/model` | QB / paginator contracts |
| `@adonisjs/lucid/types/schema_generator` | `SchemaRules` |
| `@adonisjs/lucid/plugins/japa/db` | `dbAssertions` |
| `@adonisjs/lucid/migration` | `MigrationRunner`, `SchemaDumper` |
| `#database/schema` | Generated `*Schema` |
| `#models/*` | App models |
| `@adonisjs/core/transformers` | `BaseTransformer` |
| `@adonisjs/core/services/test_utils` | `testUtils.db()` |

## Related Adonis integration

VineJS `unique`/`exists` · Auth user models · Japa DB helpers · Health `DbCheck`
