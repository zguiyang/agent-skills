# Digging deeper — AdonisJS v7

Lookup: `python3 scripts/lookup_docs.py --fetch guides/digging-deeper/<package>`  
Queues: `python3 scripts/lookup_docs.py --fetch guides/digging-deeper/queues`

## Official pages

Cache · Drive · Emitter · Health checks · I18n · Locks · Logger · Mail · **Queues** · SSE (Transmit) · OpenTelemetry

## Integration rule

```bash
node ace add @adonisjs/<package>
```

Read the matching guide for config keys; implement the minimal feature the user asked for; `--fetch` for API depth. Do not invent Express/Bull/Laravel queue APIs.

## Queues (`@adonisjs/queue` — experimental)

Pin the package version in `package.json` (API may change between minors).

```bash
node ace add @adonisjs/queue
# → config/queue.ts, providers, scheduler preload, commands
```

Backends: **Redis** (prod), **Database**, **Sync** (dev/test). Prefer `QUEUE_DRIVER` per environment.

### Minimal job spine

```bash
node ace make:job process_payment
```

```ts
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'

interface ProcessPaymentPayload {
  orderId: number
  amount: number
}

export default class ProcessPayment extends Job<ProcessPaymentPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    // use this.payload.*
  }
}
```

```ts
import ProcessPayment from '#jobs/process_payment'

await ProcessPayment.dispatch({ orderId: 1, amount: 100 })
// optional: .toQueue('payments') | .priority(1) | .in('24h') | .with('redis')
```

### Workers

Jobs are **not** processed by the HTTP process alone:

```bash
node ace queue:work
node ace queue:work --queue=payments,emails --concurrency=10
```

Run a separate worker beside the web server (PM2 / orchestrator in prod). For depth (retries, batches, fakes): `--fetch guides/digging-deeper/queues`.
