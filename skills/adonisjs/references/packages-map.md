# Packages map — AdonisJS

Install with Ace so providers/commands/hooks wire correctly: `node ace add @adonisjs/<pkg>`.

| Area | Package | Touch points | Deep docs |
| --- | --- | --- | --- |
| ORM | `@adonisjs/lucid` | `config/database.ts`, `database/` | https://lucid.adonisjs.com |
| Redis | `@adonisjs/redis` | `config/redis.ts` | docs guides/database/redis |
| Auth | `@adonisjs/auth` | `config/auth.ts`, guards | docs guides/auth |
| Bouncer | `@adonisjs/bouncer` | policies, `indexPolicies` hook | docs guides/auth/authorization |
| Queues | `@adonisjs/queue` (**experimental** — pin version) | `config/queue.ts`, workers | docs guides/digging-deeper/queues |
| Mail | `@adonisjs/mail` | `config/mail.ts` | docs digging-deeper/mail |
| Drive | `@adonisjs/drive` | disks | docs digging-deeper/drive |
| Cache | `@adonisjs/cache` | stores | docs digging-deeper/cache |
| Limiter | `@adonisjs/limiter` | rate limits | docs security/rate-limiting |
| Shield | `@adonisjs/shield` | SSR hardening | docs securing-ssr |
| CORS | `@adonisjs/cors` | CORS config | docs security/cors |
| Inertia | `@adonisjs/inertia` | middleware share, pages | docs frontend/inertia |
| Vite | `@adonisjs/vite` | `buildStarting` hook | docs frontend/vite |
| Ally | `@adonisjs/ally` | social auth | docs guides/auth/social-authentication |

Agent rule: wire via Ace + config; implement minimal usage; `--fetch` the guide for depth. Do not paste manuals into the Skill.
