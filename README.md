# Trifecta Command Center

A founder-facing operations console for **Trifecta Benefits LLC** (a forming Florida
insurance agency): LLC setup, Florida DFS/MyProfile licensing, Chase banking,
carrier/UHC cleanliness, source receipts, and founder accountability. **Hermes** is the
in-app assistant.

This is a Next.js web app deployable to Vercel and reachable by all three founders from
any browser or phone.

## Stack

- **Next.js** (App Router) + TypeScript
- **shadcn/ui** + Tailwind CSS (light/dark via `next-themes`)
- **Postgres on Neon** via **Drizzle ORM** (`drizzle-orm/neon-http`)
- **Hermes** = a deterministic command parser with a **Claude API fallback**
  (`@anthropic-ai/sdk`) for natural-language questions
- **PGlite** in-memory fallback so local dev and tests run with zero database setup

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

With **no `DATABASE_URL`** set, the app runs on an in-memory **PGlite** database that is
auto-migrated and auto-seeded — handy for development, but data is **not** persisted
across restarts. To run against a real Postgres (Neon), see _Database_ below.

Copy `.env.example` to `.env.local` and fill in values as needed.

## Hermes (the assistant)

- **Deterministic commands** (fast, free, offline): `status`, `what is blocked?`,
  `show licensing status`, `sources`, `owner Shawn/Mark/Michael`,
  `create card for <title> owner <name> in <area>`, `move <card> to waiting`,
  `archive <card>`, `check Proton for DFS updates`, `check Reagan UHC status`.
- **Natural-language fallback**: anything the parser can't match is answered by Claude,
  grounded in the current board state. Requires `ANTHROPIC_API_KEY`. If it is unset, Hermes
  degrades gracefully to its built-in help text — the command bar never breaks.
- Default model is `claude-opus-4-8`; set `ANTHROPIC_MODEL` (e.g. `claude-sonnet-4-6` or
  `claude-haiku-4-5`) to lower cost.

## Database

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (use the pooled host). Required in production. |
| `ANTHROPIC_API_KEY` | Enables the Claude fallback. Optional. |
| `ANTHROPIC_MODEL` | Hermes model override. Defaults to `claude-opus-4-8`. |

With `DATABASE_URL` set, apply the schema and seed once:

```bash
npm run db:migrate   # apply drizzle/ migrations to the database
npm run db:seed      # idempotently seed the board (guarded by a seeded_v1 flag)
# or both:
npm run db:setup
```

Regenerate migrations after a schema change in `lib/db/schema.ts`:

```bash
npm run db:generate
```

## Test & build

```bash
npm test       # vitest — runs against an isolated in-memory PGlite DB (offline)
npm run build  # Next.js production build (type-checked)
```

## Deploy (Vercel)

1. **Make this GitHub repo private first** — it holds business operational data and a
   hosted database URL. See _Security_ below.
2. Import the repo into Vercel (framework auto-detected as Next.js).
3. Set project env vars: `DATABASE_URL` (Neon), and optionally `ANTHROPIC_API_KEY` /
   `ANTHROPIC_MODEL`.
4. Run `npm run db:setup` once against the production Neon branch (not in the build step).

## Project layout

```
app/                 # App Router pages + API route handlers (/api/state, /command, /jobs/[kind])
components/          # shadcn-based UI (sidebar, board, tables, command bar, ...)
  ui/                # shadcn primitives
lib/
  db/                # Drizzle schema, Neon/PGlite client, getState + CRUD, seed
  hermes/            # deterministic command parser (+ tests)
  anthropic.ts       # Claude fallback
  jobs.ts            # cloud-safe source-check stubs
  types.ts           # shared types
docs/                # business context + original handoff notes (see below)
```

## Status & roadmap

**Built (this iteration):** the full shadcn dashboard at feature parity — status metrics,
command board, licensing table, source receipts, command audit, and the Ask-Hermes bar,
on a shared hosted database.

**Deferred to a Phase-2 local companion:** the iMessage bridge and live Proton/Reagan
portal reads require a Mac with local access and cannot run on Vercel. The source-check
buttons currently refresh receipts from stored summaries as placeholders. The recruiting /
UHC release tracker, CSV import/export, and live Gmail/Drive/Calendar receipts are future
work — see [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md).

## Business context

Operational facts and the original product handoff live in `docs/` (describing the prior
local-first MVP — kept for context):

1. [`docs/CLOUDCODE_HANDOFF.md`](docs/CLOUDCODE_HANDOFF.md)
2. [`docs/BUSINESS_CONTEXT.md`](docs/BUSINESS_CONTEXT.md)
3. [`docs/LOCAL_CONTEXT_INDEX.md`](docs/LOCAL_CONTEXT_INDEX.md)
4. [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md)

## Security

- **Keep the repo private.** It contains real operational context (filing numbers, DFS
  deficiency notes, banking context) and would hold a hosted DB URL.
- Secrets live only in env (`.env.local` locally; Vercel project env in production) and are
  gitignored. Never commit `DATABASE_URL` or `ANTHROPIC_API_KEY`.
- No SSNs/DOBs/OTPs/passwords/credentials or raw sensitive documents are committed. Hermes
  is instructed never to reveal or invent secrets.
