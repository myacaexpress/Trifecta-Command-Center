import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { openDb } from "./db.js";
import { runCommand } from "./commands.js";

function withDb(fn: (db: ReturnType<typeof openDb>) => void) {
  const dir = mkdtempSync(join(tmpdir(), "trifecta-test-"));
  const db = openDb(join(dir, "test.db"));
  try {
    fn(db);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

test("blocked answer includes licensing status and attention card", () => {
  withDb((db) => {
    const result = runCommand(db, "what is blocked?");
    assert.match(result.response, /Florida Agency License/);
    assert.match(result.response, /Confirm DFS deficiency list/);
  });
});

test("move DFS card to waiting updates lane and status", () => {
  withDb((db) => {
    const result = runCommand(db, "move DFS deficiency to waiting");
    assert.equal(result.changed, true);
    const card = result.state.cards.find((item) => item.id === "confirm-dfs-deficiency-list");
    assert.equal(card?.lane, "Waiting");
    assert.equal(card?.status, "Waiting");
  });
});

test("create card command assigns owner and area", () => {
  withDb((db) => {
    const result = runCommand(db, "create card for Chase signer docs owner Mark in Banking");
    assert.equal(result.changed, true);
    const card = result.state.cards.find((item) => item.title.includes("Chase signer docs"));
    assert.equal(card?.owner, "MF");
    assert.equal(card?.area, "Banking");
  });
});
