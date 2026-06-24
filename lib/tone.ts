import type { Tone } from "./types";

// Full literal class strings so Tailwind's JIT includes them.
export const toneText: Record<Tone, string> = {
  red: "text-tone-red",
  amber: "text-tone-amber",
  blue: "text-tone-blue",
  green: "text-tone-green",
  gray: "text-tone-gray",
};

export const toneBgSoft: Record<Tone, string> = {
  red: "bg-tone-red/10 text-tone-red",
  amber: "bg-tone-amber/10 text-tone-amber",
  blue: "bg-tone-blue/10 text-tone-blue",
  green: "bg-tone-green/10 text-tone-green",
  gray: "bg-tone-gray/10 text-tone-gray",
};

export const toneDot: Record<Tone, string> = {
  red: "bg-tone-red",
  amber: "bg-tone-amber",
  blue: "bg-tone-blue",
  green: "bg-tone-green",
  gray: "bg-tone-gray",
};

const statusToneMap: Record<string, Tone> = {
  Blocked: "red",
  "In Progress": "blue",
  Pending: "amber",
  Waiting: "amber",
  "Not Started": "gray",
  Complete: "green",
};

export function statusTone(status: string): Tone {
  return statusToneMap[status] ?? "gray";
}

const priorityToneMap: Record<string, Tone> = {
  High: "red",
  Medium: "amber",
  Low: "blue",
  Backlog: "gray",
};

export function priorityTone(priority: string): Tone {
  return priorityToneMap[priority] ?? "gray";
}
