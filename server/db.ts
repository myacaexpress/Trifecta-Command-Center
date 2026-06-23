import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { AppState, Card, IMessageConfig, Lane, LicensingStep, SourceReceipt, StatusSnapshot } from "./types.js";

const DB_PATH = resolve(process.cwd(), "data/trifecta.db");

export function openDb(path = DB_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  migrate(db);
  seed(db);
  return db;
}

export type Db = ReturnType<typeof openDb>;

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS status_snapshots (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      detail TEXT NOT NULL,
      action TEXT NOT NULL,
      tone TEXT NOT NULL,
      icon_key TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS licensing_steps (
      id TEXT PRIMARY KEY,
      step TEXT NOT NULL,
      status TEXT NOT NULL,
      owner TEXT NOT NULL,
      source TEXT NOT NULL,
      detail TEXT NOT NULL,
      source_receipt_id TEXT
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      lane TEXT NOT NULL,
      owner TEXT NOT NULL,
      due TEXT NOT NULL,
      area TEXT NOT NULL,
      source_ids TEXT NOT NULL DEFAULT '[]',
      history TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS source_receipts (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      date TEXT NOT NULL,
      area TEXT NOT NULL,
      current_read TEXT NOT NULL,
      confidence TEXT NOT NULL,
      tone TEXT NOT NULL,
      link TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_events (
      id TEXT PRIMARY KEY,
      direction TEXT NOT NULL,
      channel TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      response TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seed(db: Database.Database) {
  const seeded = db.prepare("SELECT value FROM app_config WHERE key = 'seeded_v1'").get();
  if (seeded) return;

  const now = new Date().toISOString();
  const insertStatus = db.prepare(`
    INSERT INTO status_snapshots (id, title, status, detail, action, tone, icon_key, updated_at)
    VALUES (@id, @title, @status, @detail, @action, @tone, @iconKey, @updatedAt)
  `);
  const insertStep = db.prepare(`
    INSERT INTO licensing_steps (id, step, status, owner, source, detail, source_receipt_id)
    VALUES (@id, @step, @status, @owner, @source, @detail, @sourceReceiptId)
  `);
  const insertCard = db.prepare(`
    INSERT INTO cards (id, title, body, priority, status, lane, owner, due, area, source_ids, history, created_at, updated_at)
    VALUES (@id, @title, @body, @priority, @status, @lane, @owner, @due, @area, @sourceIds, @history, @createdAt, @updatedAt)
  `);
  const insertReceipt = db.prepare(`
    INSERT INTO source_receipts (id, source, date, area, current_read, confidence, tone, link, created_at)
    VALUES (@id, @source, @date, @area, @read, @confidence, @tone, @link, @createdAt)
  `);

  const receipts: SourceReceipt[] = [
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

  const statuses: StatusSnapshot[] = [
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

  const steps: LicensingStep[] = [
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
      detail: "DFS indicated fingerprints reviewed; individual FL license issued 05/12/2026",
      sourceReceiptId: "proton-context",
    },
    {
      id: "dfs-deficiencies",
      step: "DFS deficiencies",
      status: "Blocked",
      owner: "SM",
      source: "Proton / MyProfile",
      detail: "Current blockers appear to be agency name plus FEIN/legal documentation",
      sourceReceiptId: "proton-context",
    },
    {
      id: "myprofile-exact-list",
      step: "MyProfile exact list",
      status: "Not Started",
      owner: "SM",
      source: "dice.fldfs.com",
      detail: "Need portal check to confirm active deficiency wording and required uploads",
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

  const cards: Card[] = [
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

  const tx = db.transaction(() => {
    for (const receipt of receipts) insertReceipt.run(receipt);
    for (const status of statuses) insertStatus.run(status);
    for (const step of steps) insertStep.run(step);
    for (const card of cards) {
      insertCard.run({
        ...card,
        sourceIds: JSON.stringify(card.sourceIds),
        history: JSON.stringify(card.history),
      });
    }
    setConfig(db, "imessage", {
      enabled: false,
      chatGuid: "",
      allowedSenders: [],
      lastRowId: 0,
      sendReplies: false,
    } satisfies IMessageConfig);
    db.prepare("INSERT INTO app_config (key, value) VALUES ('seeded_v1', 'true')").run();
  });
  tx();
}

export function getState(db: Database.Database): AppState {
  return {
    metrics: db
      .prepare("SELECT id, title, status, detail, action, tone, icon_key as iconKey, updated_at as updatedAt FROM status_snapshots ORDER BY rowid")
      .all() as StatusSnapshot[],
    licensingSteps: db
      .prepare("SELECT id, step, status, owner, source, detail, source_receipt_id as sourceReceiptId FROM licensing_steps ORDER BY rowid")
      .all() as LicensingStep[],
    cards: (db
      .prepare("SELECT id, title, body, priority, status, lane, owner, due, area, source_ids as sourceIds, history, created_at as createdAt, updated_at as updatedAt FROM cards ORDER BY rowid")
      .all() as Array<Omit<Card, "sourceIds" | "history"> & { sourceIds: string; history: string }>).map((card) => ({
      ...card,
      sourceIds: safeParse<string[]>(card.sourceIds, []),
      history: safeParse<string[]>(card.history, []),
    })),
    receipts: db
      .prepare("SELECT id, source, date, area, current_read as read, confidence, tone, link, created_at as createdAt FROM source_receipts ORDER BY rowid")
      .all() as SourceReceipt[],
    messageEvents: db
      .prepare("SELECT id, direction, channel, sender, text, response, created_at as createdAt FROM message_events ORDER BY rowid DESC LIMIT 30")
      .all() as AppState["messageEvents"],
    imessage: getConfig<IMessageConfig>(db, "imessage", {
      enabled: false,
      chatGuid: "",
      allowedSenders: [],
      lastRowId: 0,
      sendReplies: false,
    }),
  };
}

export function setConfig(db: Database.Database, key: string, value: unknown) {
  db.prepare(
    "INSERT INTO app_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, JSON.stringify(value));
}

export function getConfig<T>(db: Database.Database, key: string, fallback: T): T {
  const row = db.prepare("SELECT value FROM app_config WHERE key = ?").get(key) as { value: string } | undefined;
  if (!row) return fallback;
  return safeParse<T>(row.value, fallback);
}

export function addMessageEvent(
  db: Database.Database,
  event: Omit<AppState["messageEvents"][number], "id" | "createdAt">,
) {
  db.prepare(`
    INSERT INTO message_events (id, direction, channel, sender, text, response, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(makeId("msg"), event.direction, event.channel, event.sender, event.text, event.response ?? null, new Date().toISOString());
}

export function addReceipt(db: Database.Database, receipt: Omit<SourceReceipt, "id" | "createdAt"> & { id?: string }) {
  const id = receipt.id ?? makeId("receipt");
  db.prepare(`
    INSERT INTO source_receipts (id, source, date, area, current_read, confidence, tone, link, created_at)
    VALUES (@id, @source, @date, @area, @read, @confidence, @tone, @link, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      date = excluded.date,
      area = excluded.area,
      current_read = excluded.current_read,
      confidence = excluded.confidence,
      tone = excluded.tone,
      link = excluded.link
  `).run({ ...receipt, id, createdAt: new Date().toISOString() });
  return id;
}

export function updateStatus(db: Database.Database, id: string, patch: Partial<Pick<StatusSnapshot, "status" | "detail" | "tone" | "action">>) {
  const current = db.prepare("SELECT * FROM status_snapshots WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!current) return;
  db.prepare(`
    UPDATE status_snapshots
    SET status = @status, detail = @detail, tone = @tone, action = @action, updated_at = @updatedAt
    WHERE id = @id
  `).run({
    id,
    status: patch.status ?? current.status,
    detail: patch.detail ?? current.detail,
    tone: patch.tone ?? current.tone,
    action: patch.action ?? current.action,
    updatedAt: new Date().toISOString(),
  });
}

export function updateCard(db: Database.Database, card: Card) {
  db.prepare(`
    UPDATE cards
    SET title = @title, body = @body, priority = @priority, status = @status, lane = @lane,
      owner = @owner, due = @due, area = @area, source_ids = @sourceIds, history = @history, updated_at = @updatedAt
    WHERE id = @id
  `).run({
    ...card,
    sourceIds: JSON.stringify(card.sourceIds),
    history: JSON.stringify(card.history),
    updatedAt: new Date().toISOString(),
  });
}

export function createCard(db: Database.Database, input: Pick<Card, "title" | "body" | "owner" | "area"> & Partial<Card>) {
  const now = new Date().toISOString();
  const card: Card = {
    id: input.id ?? makeId("card"),
    title: input.title,
    body: input.body,
    priority: input.priority ?? "Medium",
    status: input.status ?? "Not Started",
    lane: input.lane ?? "Ready",
    owner: input.owner,
    due: input.due ?? "Next",
    area: input.area,
    sourceIds: input.sourceIds ?? [],
    history: input.history ?? ["Created by Hermes command."],
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO cards (id, title, body, priority, status, lane, owner, due, area, source_ids, history, created_at, updated_at)
    VALUES (@id, @title, @body, @priority, @status, @lane, @owner, @due, @area, @sourceIds, @history, @createdAt, @updatedAt)
  `).run({
    ...card,
    sourceIds: JSON.stringify(card.sourceIds),
    history: JSON.stringify(card.history),
  });
  return card;
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function laneToStatus(lane: Lane): Card["status"] {
  if (lane === "Done") return "Complete";
  if (lane === "Waiting") return "Waiting";
  if (lane === "Ready") return "Not Started";
  return "In Progress";
}

export function normalizeLane(input: string): Lane | null {
  const text = input.toLowerCase();
  if (/(done|complete|archive|archived)/.test(text)) return "Done";
  if (/(wait|waiting|pending)/.test(text)) return "Waiting";
  if (/(ready|next|todo|to do)/.test(text)) return "Ready";
  if (/(attention|blocked|doing|progress)/.test(text)) return "Needs Attention";
  return null;
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
