# Trifecta Command Center

Local operating board for Trifecta Benefits LLC, with Hermes as the assistant for LLC setup, licensing, banking, carrier readiness, source receipts, and founder accountability.

## Start Here

For CloudCode or another planning agent, read these first:

1. [`docs/CLOUDCODE_HANDOFF.md`](docs/CLOUDCODE_HANDOFF.md)
2. [`docs/BUSINESS_CONTEXT.md`](docs/BUSINESS_CONTEXT.md)
3. [`docs/LOCAL_CONTEXT_INDEX.md`](docs/LOCAL_CONTEXT_INDEX.md)
4. [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md)

## Run Locally

```bash
npm install
npm run dev:all
```

Frontend:

```text
http://127.0.0.1:5173/
```

API:

```text
http://127.0.0.1:8787/
```

## Test

```bash
npm test
npm run build
```

## Current MVP

- React/Vite frontend.
- Local Node/TypeScript API.
- SQLite board state at `data/trifecta.db`.
- Hermes deterministic command interpreter.
- Web Ask Hermes command flow.
- iMessage bridge scaffold for macOS Messages.
- Read-only source receipt jobs for saved Proton DFS and Reagan/UHC context.

## Privacy Note

This repo intentionally excludes runtime database files, credentials, verification codes, SSNs/DOBs, and raw sensitive local documents. Local context paths are indexed in `docs/LOCAL_CONTEXT_INDEX.md` so a local agent can read approved files from Shawn's Mac when needed.

