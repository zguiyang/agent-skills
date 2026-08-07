# Digging deeper — AdonisJS v7

Official index: see [llms.md](llms.md) → Digging Deeper  
Lookup: `python3 scripts/lookup_docs.py --fetch guides/digging-deeper/mail`

## Official pages

- [Cache](https://docs.adonisjs.com/guides/digging-deeper/cache.md)
- [Drive](https://docs.adonisjs.com/guides/digging-deeper/drive.md)
- [Emitter](https://docs.adonisjs.com/guides/digging-deeper/emitter.md)
- [Health checks](https://docs.adonisjs.com/guides/digging-deeper/health-checks.md)
- [I18n](https://docs.adonisjs.com/guides/digging-deeper/i18n.md)
- [Atomic locks](https://docs.adonisjs.com/guides/digging-deeper/locks.md)
- [Logger](https://docs.adonisjs.com/guides/digging-deeper/logger.md)
- [Mail](https://docs.adonisjs.com/guides/digging-deeper/mail.md)
- [Queues](https://docs.adonisjs.com/guides/digging-deeper/queues.md)
- [Server-Sent Events](https://docs.adonisjs.com/guides/digging-deeper/server-sent-events.md)
- [OpenTelemetry](https://docs.adonisjs.com/guides/digging-deeper/opentelemetry.md)

## Install pattern

```bash
node ace add @adonisjs/mail
node ace add @adonisjs/cache
node ace add @adonisjs/drive
# …same pattern for other first-party packages
```

Always prefer `node ace add` / `configure` so providers, env, and stubs land correctly.

## Quick intent map

| Need | Package / guide |
|------|-----------------|
| Background jobs | Queues |
| Email | Mail |
| File storage (S3/R2/local) | Drive |
| App cache | Cache |
| Domain events | Emitter |
| i18n | I18n |
| Liveness/readiness | Health checks |
| Realtime push | Transmit / SSE |
| Tracing | OpenTelemetry |
| Mutex across processes | Locks |
| Structured logs | Logger (Pino) |

Fetch the specific guide before implementing — APIs differ by package version.
