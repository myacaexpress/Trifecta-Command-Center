# Deploy Runbook — Trifecta Command Center → Vercel preview

Hand this file to Codex (or any agent/operator). It is self-contained.

## Facts

- **Repo:** `myacaexpress/trifecta-command-center`
- **Deploy this branch:** `claude/eloquent-ride-8ccu8l` (the Next.js rebuild).
  `main` still has the old MVP — do **not** deploy `main`.
- **Framework:** Next.js 16 (App Router, Turbopack). Vercel auto-detects it.
- **Build:** `npm run build` · **Start:** `npm run start`
- **Vercel team:** `Agentsly` (slug `agentsly`, id `team_AaHVS3H3az9Lalq37b6jvWmZ`)
- **Build is confirmed green and needs no env vars.** With `DATABASE_URL` unset,
  the app boots an in-memory PGlite DB that is auto-migrated and auto-seeded, so
  the UI renders with demo data on the first deploy. (Caveat: writes don't persist
  across serverless cold starts, and the Hermes LLM fallback is off until an
  Anthropic API key is set. Deterministic commands all work.)

## The one thing only the human can provide

A **Vercel access token** (for the CLI path) OR a one-time **dashboard import**
(no token shared). Pick a track below.

---

## Track A — CLI deploy (Codex does everything; needs a token)

1. Human: create a token at <https://vercel.com/account/tokens>, scope it to the
   **Agentsly** team, and export it:
   ```bash
   export VERCEL_TOKEN=xxxxxxxx
   ```
2. From the repo root, on branch `claude/eloquent-ride-8ccu8l`:
   ```bash
   git checkout claude/eloquent-ride-8ccu8l
   npx vercel@latest deploy --yes --scope agentsly --token "$VERCEL_TOKEN"
   ```
   First run creates the project and prints a **preview URL**. That URL is the
   deliverable — open it. (This is the zero-config demo: in-memory seeded DB.)

### Make it fully functional (persistent data + Hermes LLM)

3. Provision a free **Neon** Postgres (<https://neon.tech>). Copy the **pooled**
   connection string (host contains `-pooler`).
4. Initialize the schema + seed data **once**, against Neon (not in the build):
   ```bash
   DATABASE_URL="postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require" \
     npm run db:setup
   ```
   (`db:setup` = `db:migrate` then `db:seed`. Migrations live in `./drizzle`.)
5. Add the env vars to the Vercel project (repeat for `production` if desired):
   ```bash
   printf '%s' "$DATABASE_URL"      | npx vercel env add DATABASE_URL preview --scope agentsly --token "$VERCEL_TOKEN"
   printf '%s' "$ANTHROPIC_API_KEY" | npx vercel env add ANTHROPIC_API_KEY preview --scope agentsly --token "$VERCEL_TOKEN"
   # optional, defaults to claude-opus-4-8; use claude-sonnet-4-6 / claude-haiku-4-5 to cut cost
   printf '%s' "claude-sonnet-4-6"  | npx vercel env add ANTHROPIC_MODEL preview --scope agentsly --token "$VERCEL_TOKEN"
   ```
   > The `ANTHROPIC_API_KEY` must be an **Anthropic API** key from
   > <https://console.anthropic.com> (pay-as-you-go). A Claude.ai Pro/Max
   > **subscription** does not work for API calls — different product, separate billing.
6. Redeploy so the env vars take effect:
   ```bash
   npx vercel deploy --yes --scope agentsly --token "$VERCEL_TOKEN"        # preview
   # or promote to production:
   npx vercel deploy --prod --yes --scope agentsly --token "$VERCEL_TOKEN"
   ```

---

## Track B — Dashboard import (human, ~2 min, no token shared)

1. Go to <https://vercel.com/new>, select the **Agentsly** team.
2. Import `myacaexpress/trifecta-command-center`.
3. Set **Production Branch** (or the branch to deploy) to
   `claude/eloquent-ride-8ccu8l`. Framework auto-detects as Next.js — leave build
   settings default.
4. (Optional, for full functionality) add env vars in **Settings → Environment
   Variables**: `DATABASE_URL` (Neon pooled URL), `ANTHROPIC_API_KEY`,
   and optionally `ANTHROPIC_MODEL`. Then run step A‑4 (`npm run db:setup`) once
   against the Neon DB and redeploy.
5. Deploy. Vercel prints the preview URL. After import, every push to the branch
   auto-deploys.

---

## Verify the deploy

- Open the URL → the Command Center board renders with seeded demo data.
- Try a command in the Hermes bar, e.g. `status` or `licensing` → deterministic
  answer returns even without an API key.
- If `DATABASE_URL` is set: state changes (e.g. advancing a card) persist across
  refresh. If unset: they reset on cold start — expected.

## Env var reference

| Var | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | For persistence | Neon **pooled** connection string. Unset → in-memory PGlite (demo only). |
| `ANTHROPIC_API_KEY` | Optional | Enables Hermes free-form LLM fallback. Anthropic **API** key (console.anthropic.com), not a Claude.ai subscription. |
| `ANTHROPIC_MODEL` | Optional | Defaults to `claude-opus-4-8`. |
