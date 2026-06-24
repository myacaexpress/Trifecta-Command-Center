import { addReceipt, getState, updateStatus } from "./db/state";
import type { CommandResult } from "./types";

/**
 * Cloud-safe source-check jobs.
 *
 * The original app read context files off the founder's Mac. That cannot run on
 * Vercel, so these stubs refresh the corresponding source receipt from a stored
 * summary plus a fresh timestamp — preserving the "Add Source" / "Check Reagan"
 * button behavior. Phase 2: re-wire these against the local companion's real
 * Proton / Reagan reads (or live Gmail/Drive MCP pulls).
 */

const PROTON_DFS_READ =
  "Proton context still points to DFS/MyProfile deficiencies: fingerprints reviewed, with agency name and FEIN/legal documentation needing exact portal confirmation.";

const REAGAN_UHC_READ =
  "Reagan context says UHC is Sent to Agent with no writing number, appointment, or RTS evidence.";

export async function runReadOnlyJob(kind: string): Promise<CommandResult> {
  if (kind === "proton-dfs") return checkProtonDfs();
  if (kind === "reagan-uhc") return checkReaganUhc();
  return {
    response: `I do not know the read-only check "${kind}" yet. Try "check Proton for DFS updates" or "check Reagan UHC status."`,
    changed: false,
    state: await getState(),
  };
}

async function checkProtonDfs(): Promise<CommandResult> {
  await addReceipt({
    id: "proton-dfs-on-demand",
    source: "On-demand Proton DFS check",
    date: today(),
    area: "DFS/MyProfile",
    read: PROTON_DFS_READ,
    confidence: "Medium",
    tone: "amber",
    link: "(stored Proton DFS summary — Phase 2: live read)",
  });
  await updateStatus("fl-agency-license", {
    status: "Blocked",
    detail:
      "DFS/MyProfile still needs exact deficiency wording confirmed before the next upload.",
    tone: "red",
    action: "Check MyProfile",
  });
  return {
    response:
      "Proton/DFS receipt updated. Licensing is still treated as blocked until MyProfile is read directly and the exact active deficiency wording is captured.",
    changed: true,
    state: await getState(),
  };
}

async function checkReaganUhc(): Promise<CommandResult> {
  await addReceipt({
    id: "reagan-uhc-on-demand",
    source: "On-demand Reagan UHC check",
    date: today(),
    area: "Carrier readiness",
    read: REAGAN_UHC_READ,
    confidence: "High",
    tone: "green",
    link: "(stored Reagan UHC summary — Phase 2: live read)",
  });
  await updateStatus("uhc-clean-check", {
    status: "Likely Clean",
    detail:
      "Latest Reagan context still shows no UHC writing number, appointment, or RTS evidence.",
    tone: "green",
    action: "Show evidence",
  });
  return {
    response:
      "Reagan/UHC receipt updated. Current evidence still supports Likely Clean: no writing number, active appointment, or ready-to-sell record found in the saved context.",
    changed: true,
    state: await getState(),
  };
}

function today() {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}
