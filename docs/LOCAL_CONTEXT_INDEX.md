# Local Context Index

Last updated: 2026-06-23

This file tells CloudCode or another local agent where context lives on Shawn's Mac. The remote GitHub repo cannot read these local files by itself, but a local coding agent with filesystem access can.

Base external context folder:

```text
/Users/shawn/Documents/Claude/Projects/Medicare Business/
```

Repository folder:

```text
/Users/shawn/Documents/Hermes/Tribe-Founders-Wiki-2/
```

## Read First

These are the safest, most useful context files to read first:

- `/Users/shawn/Documents/Claude/Projects/Medicare Business/CONTEXT_HANDOFF.md`
  - broad business context and file inventory.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/PROTON_CONTEXT_SUMMARY.md`
  - Proton Mail operational summary: DFS, MyProfile, Chase, Alliance.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/EMAIL_CONTEXT_SUMMARY.md`
  - group Gmail summary for Shawn/Mark/Michael.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/SAB_OSLEY_STRATEGY_CONTEXT.md`
  - SAB/Osley contracting roadmap and Reagan/UHC read.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/LIFE_ANCILLARY_CONTRACTING_CONTEXT.md`
  - life/ancillary status.

## Sensitive / Do Not Copy

- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Heartland Medicare Appointment.md`
  - contains SSN/DOB/password-adjacent identity material in plaintext.
  - read only when explicitly necessary and authorized.
  - never commit its raw contents.

Also do not commit:

- OTPs,
- verification codes,
- passwords,
- reset links,
- raw credential-bearing emails,
- identity documents,
- complete bank/account records.

## External File Inventory

### Top-level business context and summaries

- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Archon_Evaluation_for_TriBe_Founder.md`
  - evaluation of Archon for early TriBe founder tooling.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Archon_PRD_Task_Evaluation.md`
  - PRD/task tooling evaluation.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Bootstrap_Manifesto.docx`
  - business plan / bootstrap narrative.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/CONTEXT_HANDOFF.md`
  - master context handoff.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/EMAIL_CONTEXT_SUMMARY.md`
  - Gmail-derived founder group context.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Email_to_Mark_Michael_License_Next_Steps.md`
  - draft/action note for licensing next steps.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/HFG Communications Policy & Procedures.md`
  - HFG communications policy.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/HFG Lead Acquisition Guidelines.md`
  - HFG lead acquisition guidance.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Heartland - 2024 CMS Compliance Rules and Regulations.pdf`
  - HFG/CMS compliance reference.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Heartland - HFG Lead Acquisition Guidelines.pdf`
  - HFG lead acquisition PDF.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Heartland - Medicare Advantage Producer Policies and Procedures.pdf`
  - HFG MA producer policies.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Heartland Medicare Appointment.md`
  - sensitive Heartland/Reagan appointment details.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Integrity Medicare Compliance Guide PY25.md`
  - Integrity compliance guide.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Investor_Manifesto.docx`
  - investor business plan version.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/LIFE_ANCILLARY_CONTRACTING_CONTEXT.md`
  - life/ancillary carrier status.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Medicare_Manifesto_with_Numbers.docx`
  - business model with numbers.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/NIPR-Application-Review-04122026.pdf`
  - NIPR agency application review.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/NIPR-DOI-Source-of-Truth-Analysis.md`
  - NIPR vs DOI source-of-truth analysis.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/NIPR-Order-23760454-Detail.pdf`
  - NIPR order detail PDF.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/PROTON_CONTEXT_SUMMARY.md`
  - Proton-derived operations summary.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/SAB_OSLEY_STRATEGY_CONTEXT.md`
  - SAB/Osley contracting strategy.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Sacramento_Virtual_Office_Briefing.md`
  - virtual office briefing.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Task_Master_Setup_Guide.md`
  - Claude Task Master setup.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Trifecta_Banking_Resolution.docx`
  - Chase/LLC banking resolution.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Trifecta_Banking_Resolution.pdf`
  - PDF copy of banking resolution.

### Chase account opening folder

- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Chase_Account_Opening/Articles_of_Organization_Tribe_Benefits.pdf`
  - Articles of Organization.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Chase_Account_Opening/EIN_TODO.md`
  - EIN/CP575/147C action notes.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Chase_Account_Opening/Email_to_Mark_Michael.txt`
  - draft partner email for account opening.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Chase_Account_Opening/Tribe_Chase_Account_Index.pdf`
  - banking document index.

### Tribe Founder historical app folder

- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Tribe Founder/prd.md`
  - early PRD.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Tribe Founder/tribe-design-decisions.md`
  - design decisions.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Tribe Founder/tribe-phase-1-spec.md`
  - phase 1 spec.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Tribe Founder/tribe-phase-2-spec.md`
  - phase 2 spec.
- `/Users/shawn/Documents/Claude/Projects/Medicare Business/Tribe Founder/tribe-phase-3-spec.md`
  - phase 3 spec.

## Current Repo File Summary

- `.gitignore`
  - ignores `node_modules/`, `dist/`, `data/`, `.DS_Store`, local env files.
- `index.html`
  - Vite app entry.
- `package.json`
  - scripts and dependencies.
- `vite.config.ts`
  - React plugin and `/api` proxy to `127.0.0.1:8787`.
- `tsconfig.json`
  - TypeScript config including `src` and `server`.
- `src/main.tsx`
  - React UI and API client.
- `src/styles.css`
  - app styling.
- `server/db.ts`
  - SQLite schema, seed, and data helpers.
- `server/types.ts`
  - backend types.
- `server/index.ts`
  - local API.
- `server/commands.ts`
  - Hermes command interpreter.
- `server/jobs.ts`
  - read-only context check jobs.
- `server/imessage.ts`
  - iMessage bridge.
- `server/imessage-daemon.ts`
  - recurring iMessage poller.
- `server/commands.test.ts`
  - tests.

## CloudCode Suggested Read Order

1. `docs/CLOUDCODE_HANDOFF.md`
2. `docs/BUSINESS_CONTEXT.md`
3. `docs/LOCAL_CONTEXT_INDEX.md`
4. `src/main.tsx`
5. `server/db.ts`
6. `server/commands.ts`
7. `server/imessage.ts`
8. `server/jobs.ts`
9. external summaries in the Read First section above

