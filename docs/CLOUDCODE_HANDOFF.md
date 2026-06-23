# CloudCode Handoff: Trifecta Command Center

Last updated: 2026-06-23

## Purpose

Trifecta Command Center is the local operating console for Trifecta Benefits LLC. It is focused first on LLC setup, Florida agency licensing, banking readiness, carrier cleanliness, source receipts, and founder accountability.

Hermes is the assistant/persona inside the app and, eventually, inside the founders' iMessage group chat.

## Current Repository

- GitHub: `https://github.com/myacaexpress/Trifecta-Command-Center`
- Local path: `/Users/shawn/Documents/Hermes/Tribe-Founders-Wiki-2`
- App URL when running locally: `http://127.0.0.1:5173/`
- API URL when running locally: `http://127.0.0.1:8787/`

## Current MVP Status

Implemented:

- Vite + React frontend.
- Local Node/TypeScript API.
- SQLite database at `data/trifecta.db`.
- Seeded board/status/source context.
- Deterministic Hermes command interpreter.
- Web Ask Hermes command flow.
- Command audit log.
- Read-only source jobs for saved Proton DFS context and Reagan/UHC context.
- Mac-local iMessage bridge scaffold:
  - reads `~/Library/Messages/chat.db` in read-only mode,
  - stores selected chat GUID and allowlisted senders,
  - sends through AppleScript behind a `MessageTransport` abstraction,
  - replies are off by default.

Not implemented yet:

- Real Playwright browser-control login/check jobs against Proton/MyProfile/Reagan.
- Full iMessage daemon setup on Shawn's Mac with Full Disk Access and selected founder group chat.
- Pluely-style local capture companion.
- LLM-backed natural language parser. The current command interpreter is deterministic by design.
- Multi-user auth/sync. MVP is Mac-local.

## How To Run

Install dependencies:

```bash
npm install
```

Run API and Vite together:

```bash
npm run dev:all
```

Run only the API:

```bash
npm run api
```

Run only Vite:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

Run iMessage poller after local config is set:

```bash
npm run imessage:poll
```

## Architecture

Frontend:

- `src/main.tsx`: React app, live API state, Ask Hermes form, board, source receipts, iMessage config UI, command audit.
- `src/styles.css`: layout and component styles.

Backend:

- `server/index.ts`: HTTP API on `127.0.0.1:8787`.
- `server/db.ts`: SQLite schema, seed data, CRUD helpers.
- `server/types.ts`: shared backend data types.
- `server/commands.ts`: deterministic Hermes command interpreter.
- `server/jobs.ts`: read-only source update jobs using local context summaries.
- `server/imessage.ts`: Messages database reader and AppleScript transport.
- `server/imessage-daemon.ts`: recurring local iMessage poller.
- `server/commands.test.ts`: command interpreter tests.

Database:

- Runtime database path: `data/trifecta.db`.
- `data/` is intentionally ignored by git.
- Seed is created on first API/DB startup.

## API Routes

- `GET /api/state`
  - Returns all current board/status/source/message/iMessage config state.
- `POST /api/command`
  - Body: `{ "text": "show licensing status", "sender": "founder" }`
  - Runs Hermes command and returns updated state.
- `POST /api/jobs/proton-dfs`
  - Creates/updates a source receipt from saved Proton DFS context.
- `POST /api/jobs/reagan-uhc`
  - Creates/updates a source receipt from saved Reagan/UHC context.
- `GET /api/imessage/config`
  - Reads local iMessage bridge config.
- `POST /api/imessage/config`
  - Updates local iMessage bridge config.
- `GET /api/imessage/chats`
  - Attempts read-only recent chat list from macOS Messages database.
- `POST /api/imessage/poll`
  - Reads new allowlisted messages for configured chat and runs commands.

## Hermes Command Examples

Working examples:

- `status`
- `what is blocked?`
- `what is blocking licensing?`
- `show licensing status`
- `sources`
- `owner Shawn`
- `owner Mark`
- `owner Michael`
- `create card for Chase signer docs owner Mark in Banking`
- `move DFS deficiency to waiting`
- `archive Sunbiz filing`
- `check Proton for DFS updates`
- `check Reagan UHC status`

## iMessage Setup Plan

MVP assumes the app runs on Shawn's Mac because iMessage automation requires local macOS Messages access.

Setup sequence:

1. Run API and frontend.
2. Grant Full Disk Access to the terminal/app process running the API.
3. In the web app, use the iMessage Bridge panel.
4. Click Recent Chats.
5. Select the actual Trifecta founder group chat GUID.
6. Enter allowlisted sender handles for Shawn, Michael, and Mark.
7. Enable local reader.
8. Keep Send replies off for initial testing.
9. Text `status` in the group.
10. Click Poll Once and confirm the command appears in Command Audit.
11. Enable Send replies only after the read-only flow is trusted.

Safety:

- The bridge should only respond to the configured chat or allowlisted senders.
- External portal/browser actions should never run from iMessage without explicit confirmation.
- Replies are off by default.

## Browser / Portal Jobs Plan

The current `server/jobs.ts` jobs are safe placeholders that use saved local summaries. The next step is adding real read-only Playwright jobs:

- Proton DFS/MyProfile deficiency email search.
- Proton Chase folder/filter status.
- Reagan UHC/Aetna contract status.
- Florida MyProfile exact deficiency list.
- NIPR/NAIC agency NPN lookup.

Rules:

- Use a persistent local browser profile.
- User logs in manually when needed.
- Read-only by default.
- If session is expired, return "login needed."
- Do not submit forms, delete email, accept contracts, change settings, or send external messages in MVP.

## Sensitive Data Policy

Do not commit:

- SSNs.
- DOBs.
- passwords.
- OTPs / verification codes.
- reset links.
- carrier portal credentials.
- raw email bodies that contain credentials.
- private identity documents.

The external local file `Heartland Medicare Appointment.md` is known to contain sensitive identity/password-adjacent material and must not be copied into the repo.

This repo can store:

- summarized operational facts,
- local file paths,
- source names,
- status reads,
- non-secret business process context,
- code for local retrieval.

## Verification Already Run

On 2026-06-23:

```bash
npm run build
npm test
```

Both passed.

Browser smoke test:

- loaded `http://127.0.0.1:5173/`,
- confirmed Command Center and board render,
- submitted `show licensing status`,
- saw Hermes response in the UI.

