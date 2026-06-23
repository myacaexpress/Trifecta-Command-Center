# Next Steps

Last updated: 2026-06-23

## Immediate Priority

Make the current app useful as a founder-facing operating board before expanding into more automation.

Priority order:

1. iMessage setup.
2. Licensing workflow depth.
3. Source ingestion/check jobs.
4. Carrier/release tracker.
5. Pluely-style capture.

## 1. iMessage Setup

Goal:

- A founder can text `what is blocking licensing?` in the founder group and get the same answer shown in the app.
- A founder can text `move DFS deficiency to waiting` and see the board update.

Work:

- Add stronger iMessage setup UX.
- Show Full Disk Access status or clear failure state.
- Add chat picker from `GET /api/imessage/chats`.
- Save selected chat GUID and allowlisted handles.
- Add dry-run mode:
  - read incoming message,
  - run command,
  - log response,
  - do not send reply.
- Add send-replies confirmation toggle.
- Add unit tests around fixture-shaped `chat.db` rows.

Do not:

- send replies by default,
- read every message from all chats,
- perform browser/portal external actions from iMessage without confirmation.

## 2. Licensing Workflow Depth

Goal:

- Turn the initial licensing checklist into a durable tracker that becomes history once complete.

Work:

- Add richer data model for licensing artifacts:
  - entity legal name,
  - Sunbiz amendment status,
  - DFS deficiency item,
  - required proof,
  - submitted date,
  - source receipt,
  - owner,
  - outcome.
- Add "archive completed flow" behavior:
  - completed licensing steps stay in history,
  - active board uses cards only for unresolved/next actions.
- Add command examples:
  - `what is left for agency NPN?`
  - `mark Sunbiz amendment filed`
  - `create DFS upload card for Shawn`
  - `show licensing evidence`

## 3. Source Ingestion / Portal Checks

Goal:

- Hermes can create/update source receipts from live read-only checks.

Work:

- Add Playwright with persistent local browser profile.
- Add check runner abstraction:
  - `SourceCheckJob`
  - job name,
  - read-only steps,
  - extracted facts,
  - confidence,
  - status updates,
  - receipts.
- Implement:
  - Proton DFS search/check,
  - Proton Chase folder/filter check,
  - Reagan UHC/Aetna check,
  - Florida MyProfile exact deficiency list,
  - NIPR agency NPN lookup.

Rules:

- User logs in manually when required.
- If session expired, return `login needed`.
- No deleting mail.
- No changing Proton filters/settings in MVP unless the user explicitly asks.
- No form submissions.
- No accepting carrier contracts.
- No external sending.

## 4. Carrier / Release Tracker

Goal:

- Track SAB/Osley recruiting sprint and UHC release cleanliness.

Work:

- Add `agents` or `release_tracker` table:
  - first name,
  - last name,
  - NPN,
  - state/license status,
  - current UHC hierarchy,
  - release status,
  - release request date,
  - immediate-release eligibility,
  - clean/new-contract eligibility,
  - owner,
  - notes/source.
- Add board views:
  - Clean now,
  - Release requested,
  - Blocked,
  - Unknown.
- Add CSV import/export.
- Use Spark worksheet structure as a template.

## 5. Pluely-Style Capture

Goal:

- Each founder can locally capture meetings and publish approved summaries/actions to the Command Center.

Phase 2 work:

- Manual transcript import first.
- Then Tauri capture companion:
  - local audio capture,
  - speech-to-text,
  - local transcript storage,
  - review/edit,
  - publish approved source receipt/action items.

Rules:

- Raw transcripts stay local by default.
- Shared board gets approved summaries, decisions, risks, and tasks.

## 6. Data / Privacy Hardening

Work:

- Encrypt or protect local SQLite if sensitive operational data increases.
- Add backup/export command.
- Add redaction helper for source receipts.
- Keep `.env` and `data/` out of git.
- Do not store passwords/OTPs.
- For credentials, integrate password manager references rather than storing secrets.

## 7. UI Improvements

Work:

- Add real card creation modal.
- Add card detail drawer with source receipt history.
- Add status snapshot edit form.
- Add command suggestions.
- Add iMessage setup wizard.
- Add mobile-friendly board scrolling controls.

## 8. Testing

Current:

- Basic command tests pass.

Add:

- API route tests.
- DB migration tests.
- iMessage fixture tests.
- Browser job fixture tests.
- Frontend interaction tests.
- Responsive layout smoke checks.

