import type { Card, Lane } from "./types";

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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
