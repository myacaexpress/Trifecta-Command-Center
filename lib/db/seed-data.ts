import {
  cards,
  licensingSteps,
  sourceReceipts,
  statusSnapshots,
} from "./schema";

type ReceiptInsert = typeof sourceReceipts.$inferInsert;
type StatusInsert = typeof statusSnapshots.$inferInsert;
type StepInsert = typeof licensingSteps.$inferInsert;
type CardInsert = typeof cards.$inferInsert;

/**
 * Seed content ported verbatim from the original server/db.ts. The only change
 * is that `now` is injected so timestamps reflect the time of seeding.
 */
export function getSeedData(now: string): {
  receipts: ReceiptInsert[];
  statuses: StatusInsert[];
  steps: StepInsert[];
  cardRows: CardInsert[];
} {
  const receipts: ReceiptInsert[] = [
    {
      id: "context-handoff",
      source: "CONTEXT_HANDOFF.md",
      date: "06/22/2026",
      area: "Operating context",
      read: "Trifecta has two active buckets: Shawn personal book and TriFecta LLC",
      confidence: "High",
      tone: "green",
      link: "/Users/shawn/Documents/Claude/Projects/Medicare Business/CONTEXT_HANDOFF.md",
      createdAt: now,
    },
    {
      id: "proton-context",
      source: "PROTON_CONTEXT_SUMMARY.md",
      date: "06/23/2026",
      area: "DFS/MyProfile",
      read: "Fingerprints reviewed; remaining deficiencies appear name + FEIN/legal docs",
      confidence: "Medium",
      tone: "amber",
      link: "/Users/shawn/Documents/Claude/Projects/Medicare Business/PROTON_CONTEXT_SUMMARY.md",
      createdAt: now,
    },
    {
      id: "sab-osley-context",
      source: "SAB_OSLEY_STRATEGY_CONTEXT.md",
      date: "06/23/2026",
      area: "Carrier readiness",
      read: "UHC in Reagan is Sent to Agent; no writing number, appointment, or RTS evidence",
      confidence: "High",
      tone: "green",
      link: "/Users/shawn/Documents/Claude/Projects/Medicare Business/SAB_OSLEY_STRATEGY_CONTEXT.md",
      createdAt: now,
    },
    {
      id: "email-context",
      source: "EMAIL_CONTEXT_SUMMARY.md",
      date: "06/23/2026",
      area: "Chase banking",
      read: "All three signers and proof docs are part of account-opening path",
      confidence: "High",
      tone: "green",
      link: "/Users/shawn/Documents/Claude/Projects/Medicare Business/EMAIL_CONTEXT_SUMMARY.md",
      createdAt: now,
    },
    {
      id: "life-ancillary-context",
      source: "LIFE_ANCILLARY_CONTRACTING_CONTEXT.md",
      date: "06/23/2026",
      area: "Life / ancillary",
      read: "HIC evidence confirms American-Amicable, Corebridge, and RNA status nuances",
      confidence: "Medium",
      tone: "amber",
      link: "/Users/shawn/Documents/Claude/Projects/Medicare Business/LIFE_ANCILLARY_CONTRACTING_CONTEXT.md",
      createdAt: now,
    },
  ];

  const statuses: StatusInsert[] = [
    {
      id: "fl-agency-license",
      title: "Florida Agency License",
      status: "Blocked",
      detail: "DFS/MyProfile deficiencies still need exact confirmation",
      action: "View blockers",
      tone: "red",
      iconKey: "shield",
      updatedAt: now,
    },
    {
      id: "agency-npn",
      title: "Agency NPN",
      status: "Not Assigned",
      detail: "Generated only after FL agency license issues",
      action: "Check NIPR",
      tone: "amber",
      iconKey: "users",
      updatedAt: now,
    },
    {
      id: "chase-banking",
      title: "Chase Banking",
      status: "In Progress",
      detail: "Filter created; account messages moved to Chase folder",
      action: "View banking",
      tone: "blue",
      iconKey: "bank",
      updatedAt: now,
    },
    {
      id: "uhc-clean-check",
      title: "UHC Clean Check",
      status: "Likely Clean",
      detail: "Reagan shows Sent to Agent, no writing number or RTS",
      action: "Show evidence",
      tone: "green",
      iconKey: "flag",
      updatedAt: now,
    },
  ];

  const steps: StepInsert[] = [
    {
      id: "sunbiz-filed",
      step: "Sunbiz - LLC filed",
      status: "Complete",
      owner: "SM",
      source: "Sunbiz #200471360472",
      detail: "Articles filed 04/07/2026; AMBRs Shawn, Mark, Michael",
      sourceReceiptId: "context-handoff",
    },
    {
      id: "nipr-application",
      step: "NIPR agency application",
      status: "Complete",
      owner: "SM",
      source: "Order #23760454",
      detail: "FL Resident Business Entity application submitted 04/12/2026",
      sourceReceiptId: "context-handoff",
    },
    {
      id: "fingerprints-michael",
      step: "Fingerprints - Michael",
      status: "Complete",
      owner: "MK",
      source: "DFS email",
      detail:
        "DFS indicated fingerprints reviewed; individual FL license issued 05/12/2026",
      sourceReceiptId: "proton-context",
    },
    {
      id: "dfs-deficiencies",
      step: "DFS deficiencies",
      status: "Blocked",
      owner: "SM",
      source: "Proton / MyProfile",
      detail:
        "Current blockers appear to be agency name plus FEIN/legal documentation",
      sourceReceiptId: "proton-context",
    },
    {
      id: "myprofile-exact-list",
      step: "MyProfile exact list",
      status: "Not Started",
      owner: "SM",
      source: "dice.fldfs.com",
      detail:
        "Need portal check to confirm active deficiency wording and required uploads",
      sourceReceiptId: "proton-context",
    },
    {
      id: "agency-npn-lookup",
      step: "Agency NPN lookup",
      status: "Waiting",
      owner: "SM",
      source: "NIPR / NAIC",
      detail: "FEIN lookup was not found as of 06/22/2026",
      sourceReceiptId: "context-handoff",
    },
  ];

  const cardRows: CardInsert[] = [
    {
      id: "confirm-dfs-deficiency-list",
      title: "Confirm DFS deficiency list",
      body: "Log into MyProfile and capture the exact active deficiency language before uploading documents.",
      priority: "High",
      status: "Blocked",
      lane: "Needs Attention",
      owner: "SM",
      due: "Today",
      area: "Licensing",
      sourceIds: ["proton-context"],
      history: ["Seeded from Proton context."],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "upload-fein-legal-docs",
      title: "Upload FEIN/legal docs",
      body: "Use CP575B if accepted; request IRS 147C only if DFS or Chase rejects current proof.",
      priority: "High",
      status: "In Progress",
      lane: "Needs Attention",
      owner: "SM",
      due: "Next",
      area: "Licensing",
      sourceIds: ["email-context", "proton-context"],
      history: ["Seeded from Gmail and Proton context."],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fix-alliance-mailbox-proof",
      title: "Fix Alliance mailbox proof",
      body: "Alliance needs the document type to match the PS 1583 address evidence selected.",
      priority: "Medium",
      status: "Waiting",
      lane: "Waiting",
      owner: "SM",
      due: "This week",
      area: "Business Identity",
      sourceIds: ["proton-context"],
      history: ["Seeded from Proton context."],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ask-osley-about-aetna",
      title: "Ask Osley about Aetna",
      body: "Clarify whether Aetna submitted-but-not-appointed through HFG blocks fresh SAB placement.",
      priority: "Medium",
      status: "Pending",
      lane: "Waiting",
      owner: "SM",
      due: "Before contracting",
      area: "Carrier Readiness",
      sourceIds: ["sab-osley-context"],
      history: ["Seeded from SAB/Osley context."],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "build-uhc-release-tracker",
      title: "Build UHC release tracker",
      body: "Track each recruiting prospect's UHC top-of-line, release status, NPN, and owner.",
      priority: "Low",
      status: "Not Started",
      lane: "Ready",
      owner: "MF",
      due: "Sprint",
      area: "Recruiting",
      sourceIds: ["sab-osley-context"],
      history: ["Seeded from SAB/Osley recruiting sprint."],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "archive-sunbiz-filing-receipt",
      title: "Archive Sunbiz filing receipt",
      body: "Keep the formation receipt as operating history; no active founder decision needed.",
      priority: "Backlog",
      status: "Complete",
      lane: "Done",
      owner: "SM",
      due: "Archived",
      area: "LLC Setup",
      sourceIds: ["context-handoff"],
      history: ["Seeded as completed formation history."],
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { receipts, statuses, steps, cardRows };
}
