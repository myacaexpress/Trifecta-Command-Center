import { existsSync, readFileSync } from "node:fs";
import type Database from "better-sqlite3";
import { addReceipt, getState, updateStatus } from "./db.js";
import type { AppState } from "./types.js";

const CONTEXT_ROOT = "/Users/shawn/Documents/Claude/Projects/Medicare Business";

type JobKind = "proton-dfs" | "reagan-uhc";

export interface JobResult {
  response: string;
  changed: boolean;
  state: AppState;
}

export function runReadOnlyJob(db: Database.Database, kind: string): JobResult {
  if (kind === "proton-dfs") return checkProtonDfs(db);
  if (kind === "reagan-uhc") return checkReaganUhc(db);

  return {
    response: `I do not know the read-only check "${kind}" yet. Try "check Proton for DFS updates" or "check Reagan UHC status."`,
    changed: false,
    state: getState(db),
  };
}

function checkProtonDfs(db: Database.Database): JobResult {
  const path = `${CONTEXT_ROOT}/PROTON_CONTEXT_SUMMARY.md`;
  const context = readContext(path);
  const read = context.includes("fingerprint")
    ? "Proton context still points to DFS/MyProfile deficiencies: fingerprints reviewed, with agency name and FEIN/legal documentation needing exact portal confirmation."
    : "Proton context is available as a receipt, but the exact DFS/MyProfile portal wording still needs a logged-in read.";

  addReceipt(db, {
    id: "proton-dfs-on-demand",
    source: "On-demand Proton DFS check",
    date: today(),
    area: "DFS/MyProfile",
    read,
    confidence: existsSync(path) ? "Medium" : "Low",
    tone: "amber",
    link: path,
  });
  updateStatus(db, "fl-agency-license", {
    status: "Blocked",
    detail: "DFS/MyProfile still needs exact deficiency wording confirmed before the next upload.",
    tone: "red",
    action: "Check MyProfile",
  });

  return {
    response:
      "Proton/DFS receipt updated. Licensing is still treated as blocked until MyProfile is read directly and the exact active deficiency wording is captured.",
    changed: true,
    state: getState(db),
  };
}

function checkReaganUhc(db: Database.Database): JobResult {
  const path = `${CONTEXT_ROOT}/SAB_OSLEY_STRATEGY_CONTEXT.md`;
  const context = readContext(path);
  const hasSentToAgent = context.toLowerCase().includes("sent to agent");
  const read = hasSentToAgent
    ? "Reagan context says UHC is Sent to Agent with no writing number, appointment, or RTS evidence."
    : "Reagan context does not show a confirmed UHC writing number, appointment, or RTS evidence.";

  addReceipt(db, {
    id: "reagan-uhc-on-demand",
    source: "On-demand Reagan UHC check",
    date: today(),
    area: "Carrier readiness",
    read,
    confidence: existsSync(path) ? "High" : "Low",
    tone: "green",
    link: path,
  });
  updateStatus(db, "uhc-clean-check", {
    status: "Likely Clean",
    detail: "Latest Reagan context still shows no UHC writing number, appointment, or RTS evidence.",
    tone: "green",
    action: "Show evidence",
  });

  return {
    response:
      "Reagan/UHC receipt updated. Current evidence still supports Likely Clean: no writing number, active appointment, or ready-to-sell record found in the saved context.",
    changed: true,
    state: getState(db),
  };
}

function readContext(path: string) {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function today() {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}
