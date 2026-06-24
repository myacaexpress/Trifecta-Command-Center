import { beforeEach, describe, expect, it } from "vitest";
import { __setDb, createPglite } from "@/lib/db/client";
import { findCardById, getState } from "@/lib/db/state";
import { runReadOnlyJob } from "@/lib/jobs";
import { runCommand } from "@/lib/hermes/commands";

// Hermetic: a fresh, migrated + seeded in-memory PGlite database per test, and
// no ANTHROPIC_API_KEY so the Claude fallback never makes a network call.
beforeEach(async () => {
  delete process.env.DATABASE_URL;
  delete process.env.ANTHROPIC_API_KEY;
  __setDb(await createPglite());
});

describe("Hermes deterministic parser", () => {
  it("answers what is blocked from seeded state", async () => {
    const result = await runCommand("what is blocked?");
    expect(result.changed).toBe(false);
    expect(result.response).toContain("Florida Agency License");
    expect(result.response).toContain("Confirm DFS deficiency list");
  });

  it("moves a card to a new lane by fuzzy title match", async () => {
    const result = await runCommand("move DFS deficiency to waiting");
    expect(result.changed).toBe(true);
    const card = await findCardById("confirm-dfs-deficiency-list");
    expect(card?.lane).toBe("Waiting");
    expect(card?.status).toBe("Waiting");
  });

  it("creates a card with parsed owner and area", async () => {
    const result = await runCommand(
      "create card for Chase signer docs owner Mark in Banking",
    );
    expect(result.changed).toBe(true);
    const created = result.state.cards.find(
      (card) => card.title === "Chase signer docs",
    );
    expect(created).toBeTruthy();
    expect(created?.owner).toBe("MF");
    expect(created?.area).toBe("Banking");
  });

  it("routes 'owner Mark' to the owner lookup, not the move verb", async () => {
    const result = await runCommand("owner Mark");
    expect(result.response).toContain("MF owns");
  });

  it("summarizes status", async () => {
    const result = await runCommand("status");
    expect(result.response).toContain("Florida Agency License: Blocked");
  });
});

describe("Claude fallback graceful degradation", () => {
  it("falls back to deterministic help text when no API key is set", async () => {
    const result = await runCommand("tell me a joke about insurance");
    expect(result.changed).toBe(false);
    expect(result.response).toContain("I can answer status");
  });
});

describe("Source check jobs (cloud-safe stubs)", () => {
  it("proton-dfs refreshes a receipt and keeps licensing blocked", async () => {
    const result = await runReadOnlyJob("proton-dfs");
    expect(result.changed).toBe(true);
    expect(
      result.state.receipts.some((r) => r.id === "proton-dfs-on-demand"),
    ).toBe(true);
    expect(
      result.state.metrics.find((m) => m.id === "fl-agency-license")?.status,
    ).toBe("Blocked");
  });

  it("reagan-uhc refreshes a receipt and keeps UHC likely clean", async () => {
    const result = await runReadOnlyJob("reagan-uhc");
    expect(result.changed).toBe(true);
    expect(
      result.state.receipts.some((r) => r.id === "reagan-uhc-on-demand"),
    ).toBe(true);
    expect(
      result.state.metrics.find((m) => m.id === "uhc-clean-check")?.status,
    ).toBe("Likely Clean");
  });

  it("returns a no-op for an unknown job kind", async () => {
    const result = await runReadOnlyJob("nope");
    expect(result.changed).toBe(false);
    expect(result.response).toContain("I do not know");
  });
});

describe("Data layer", () => {
  it("seeds the expected counts and round-trips jsonb arrays", async () => {
    const state = await getState();
    expect(state.metrics).toHaveLength(4);
    expect(state.licensingSteps).toHaveLength(6);
    expect(state.cards).toHaveLength(6);
    expect(state.receipts).toHaveLength(5);
    expect(Array.isArray(state.cards[0].sourceIds)).toBe(true);
    expect(Array.isArray(state.cards[0].history)).toBe(true);
  });
});
