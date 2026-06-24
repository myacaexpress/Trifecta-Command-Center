import type { AppState } from "./types";

const HERMES_SYSTEM = `You are Hermes, the operations assistant for Trifecta Benefits LLC, a forming Florida insurance agency (LLC setup, Florida DFS/MyProfile licensing, Chase banking, carrier/UHC cleanliness, founder accountability).

Answer ONLY from the JSON state provided below — do not invent facts. Lead with the answer in 1-3 concise sentences. When relevant, use owner / action / date and cite the source receipt name you relied on. Tone: practical, operational, low ceremony.

Never reveal or invent secrets, passwords, SSNs, DOBs, OTPs, or verification codes. If the state does not contain the answer, say so plainly and suggest who could confirm (Shawn/SM, Mark/MF, Michael/MK, or Osley/SAB).`;

/**
 * Natural-language fallback for Hermes. Only invoked when the deterministic
 * parser cannot match the input. Returns null (so the caller falls back to the
 * deterministic help text) when no API key is configured or anything goes
 * wrong — a Claude outage must never break the command bar.
 */
export async function askClaude(
  question: string,
  state: AppState,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 1024,
      system: `${HERMES_SYSTEM}\n\nCurrent state (JSON):\n${compactState(state)}`,
      messages: [{ role: "user", content: question }],
    });

    if (res.stop_reason === "refusal") return null;

    const text = res.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    return text || null;
  } catch (error) {
    console.error("Hermes Claude fallback failed:", error);
    return null;
  }
}

/** A trimmed, token-cheap projection of the board for grounding answers. */
function compactState(state: AppState): string {
  return JSON.stringify({
    statuses: state.metrics.map((m) => ({
      title: m.title,
      status: m.status,
      detail: m.detail,
    })),
    licensingSteps: state.licensingSteps.map((s) => ({
      step: s.step,
      status: s.status,
      owner: s.owner,
      source: s.source,
    })),
    cards: state.cards.map((c) => ({
      title: c.title,
      lane: c.lane,
      status: c.status,
      owner: c.owner,
      area: c.area,
      due: c.due,
    })),
    receipts: state.receipts.map((r) => ({
      source: r.source,
      area: r.area,
      read: r.read,
      confidence: r.confidence,
    })),
  });
}
