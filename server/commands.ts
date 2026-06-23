import type Database from "better-sqlite3";
import { addMessageEvent, createCard, getState, laneToStatus, normalizeLane, updateCard } from "./db.js";
import { runReadOnlyJob } from "./jobs.js";
import type { AppState, Card, CommandResult } from "./types.js";

const owners: Record<string, string> = {
  shawn: "SM",
  sean: "SM",
  mark: "MF",
  michael: "MK",
  mike: "MK",
  sm: "SM",
  mf: "MF",
  mk: "MK",
};

export function runCommand(
  db: Database.Database,
  text: string,
  channel: "web" | "imessage" = "web",
  sender = "founder",
): CommandResult {
  const input = text.trim();
  const lower = input.toLowerCase();
  let response = "";
  let changed = false;

  if (!input) {
    response = "Ask for status, blocked items, licensing, sources, or say things like create card or move DFS to waiting.";
  } else if (/(check|search|read).*(proton|dfs|myprofile)/i.test(input)) {
    const result = runReadOnlyJob(db, "proton-dfs");
    response = result.response;
    changed = result.changed;
  } else if (/(check|search|read).*(reagan|uhc|united)/i.test(input)) {
    const result = runReadOnlyJob(db, "reagan-uhc");
    response = result.response;
    changed = result.changed;
  } else if (/\b(create|add)\s+(a\s+)?card\b/i.test(input)) {
    response = handleCreateCard(db, input);
    changed = true;
  } else if (/\b(move|mark)\b/i.test(input)) {
    const result = handleMoveCard(db, input);
    response = result.response;
    changed = result.changed;
  } else if (/\barchive\b/i.test(input)) {
    const result = handleArchiveCard(db, input);
    response = result.response;
    changed = result.changed;
  } else {
    response = answerFromState(getState(db), lower);
  }

  addMessageEvent(db, { direction: "inbound", channel, sender, text: input, response });
  return { response, changed, state: getState(db) };
}

function handleCreateCard(db: Database.Database, input: string) {
  const title = cleanTitle(
    input
      .replace(/^\s*(hermes[:,]?\s*)?/i, "")
      .replace(/\b(create|add)\s+(a\s+)?card\s*(for|called|titled)?\s*/i, ""),
  );
  const owner = parseOwner(input) ?? "SM";
  const area = parseArea(input) ?? "Licensing";
  const priority = /high|urgent|blocked/i.test(input) ? "High" : /low|backlog/i.test(input) ? "Low" : "Medium";
  const card = createCard(db, {
    title: title || "New follow-up",
    body: "Created from a Hermes language command.",
    owner,
    area,
    priority,
    status: priority === "High" ? "In Progress" : "Not Started",
    lane: priority === "High" ? "Needs Attention" : "Ready",
    due: /today/i.test(input) ? "Today" : "Next",
  });
  return `Created card "${card.title}" in ${card.area}, owned by ${card.owner}.`;
}

function handleMoveCard(db: Database.Database, input: string) {
  const lane = normalizeLane(input);
  if (!lane) return { response: "I could not tell which lane to move that to. Try waiting, ready, needs attention, or done.", changed: false };

  const card = findCard(getState(db).cards, input);
  if (!card) return { response: "I could not match that to a board card yet. Try using a few words from the card title.", changed: false };

  const updated: Card = {
    ...card,
    lane,
    status: laneToStatus(lane),
    history: [...card.history, `Moved to ${lane} by Hermes command.`],
  };
  updateCard(db, updated);
  return { response: `Moved "${card.title}" to ${lane}.`, changed: true };
}

function handleArchiveCard(db: Database.Database, input: string) {
  const card = findCard(getState(db).cards, input.replace(/\barchive\b/i, ""));
  if (!card) return { response: "I could not find the card to archive. Try a few words from the card title.", changed: false };
  updateCard(db, {
    ...card,
    lane: "Done",
    status: "Complete",
    history: [...card.history, "Archived by Hermes command."],
  });
  return { response: `Archived "${card.title}" to Done.`, changed: true };
}

function answerFromState(state: AppState, lower: string) {
  if (/\b(blocked|blocking|stuck)\b/.test(lower)) {
    const blockedStatuses = state.metrics.filter((metric) => /blocked/i.test(metric.status));
    const blockedCards = state.cards.filter((card) => card.status === "Blocked" || card.lane === "Needs Attention");
    const statusText = blockedStatuses.map((metric) => `${metric.title}: ${metric.detail}`).join(" ");
    const cardText = blockedCards.map((card) => `${card.title} (${card.owner})`).join(", ");
    return `Blocked now: ${statusText || "no blocked status snapshots"}. Board attention: ${cardText || "none"}.`;
  }

  if (/\b(licensing|license|licence|npn|dfs|myprofile)\b/.test(lower)) {
    const license = state.metrics.find((metric) => metric.id === "fl-agency-license");
    const npn = state.metrics.find((metric) => metric.id === "agency-npn");
    const open = state.licensingSteps.filter((step) => step.status !== "Complete").map((step) => `${step.step}: ${step.status}`).join("; ");
    return `Licensing: ${license?.status ?? "Unknown"} - ${license?.detail ?? "No detail"}. Agency NPN: ${npn?.status ?? "Unknown"} - ${npn?.detail ?? "No detail"}. Open steps: ${open}.`;
  }

  if (/\b(sources|receipts|evidence)\b/.test(lower)) {
    return `Source receipts: ${state.receipts.map((receipt) => `${receipt.source} (${receipt.confidence})`).join(", ")}.`;
  }

  const ownerMatch = lower.match(/\bowner\s+([a-z]+)/);
  if (ownerMatch) {
    const owner = owners[ownerMatch[1]];
    if (!owner) return "I know Shawn/Sean, Michael, and Mark as owners right now.";
    const cards = state.cards.filter((card) => card.owner === owner && card.lane !== "Done");
    return `${owner} owns: ${cards.map((card) => `${card.title} [${card.lane}]`).join(", ") || "no active cards"}.`;
  }

  if (/\b(changed|updates|latest)\b/.test(lower)) {
    const latestReceipts = state.receipts.slice(-3).map((receipt) => `${receipt.source}: ${receipt.read}`).join(" ");
    return `Latest receipts: ${latestReceipts || "no receipts yet"}.`;
  }

  if (/\b(status|summary)\b/.test(lower)) {
    return state.metrics.map((metric) => `${metric.title}: ${metric.status}`).join("; ");
  }

  return "I can answer status, blocked, licensing, sources, owner Shawn/Mark/Michael, or run commands like create card, move card to waiting, archive card, check Proton for DFS updates, and check Reagan UHC status.";
}

function findCard(cards: Card[], input: string) {
  const words = input
    .toLowerCase()
    .replace(/\b(move|mark|archive|card|to|as|waiting|ready|done|complete|blocked|progress|needs|attention|hermes)\b/g, " ")
    .split(/\W+/)
    .filter((word) => word.length > 2);
  if (!words.length) return null;

  return (
    cards
      .map((card) => ({
        card,
        score: words.filter((word) => card.title.toLowerCase().includes(word) || card.body.toLowerCase().includes(word)).length,
      }))
      .sort((a, b) => b.score - a.score)[0]?.score
      ? cards
          .map((card) => ({
            card,
            score: words.filter((word) => card.title.toLowerCase().includes(word) || card.body.toLowerCase().includes(word)).length,
          }))
          .sort((a, b) => b.score - a.score)[0].card
      : null
  );
}

function parseOwner(input: string) {
  const lower = input.toLowerCase();
  for (const [name, initials] of Object.entries(owners)) {
    if (new RegExp(`\\b${name}\\b`).test(lower)) return initials;
  }
  return null;
}

function parseArea(input: string) {
  const match = input.match(/\b(area|in)\s+([a-z /-]+)/i);
  if (!match) return null;
  return cleanTitle(match[2]).replace(/\s+owner\b.*/i, "");
}

function cleanTitle(value: string) {
  return value.replace(/\s+(owner|for)\s+(shawn|sean|mark|michael|sm|mf|mk)\b.*$/i, "").trim();
}
