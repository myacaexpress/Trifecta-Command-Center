import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import type { DB } from "./client";
import {
  appConfig,
  cards,
  licensingSteps,
  sourceReceipts,
  statusSnapshots,
} from "./schema";
import { getSeedData } from "./seed-data";
import { DEFAULT_IMESSAGE } from "../types";

/**
 * Idempotently seed the database. Guarded by a `seeded_v1` flag in app_config,
 * so re-running is a safe no-op. Returns true if rows were inserted.
 */
export async function seedDb(db: DB): Promise<boolean> {
  const existing = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, "seeded_v1"));
  if (existing.length) return false;

  const now = new Date().toISOString();
  const { receipts, statuses, steps, cardRows } = getSeedData(now);

  await db.insert(sourceReceipts).values(receipts);
  await db.insert(statusSnapshots).values(statuses);
  await db.insert(licensingSteps).values(steps);
  await db.insert(cards).values(cardRows);
  await db.insert(appConfig).values([
    { key: "imessage", value: DEFAULT_IMESSAGE },
    { key: "seeded_v1", value: true },
  ]);
  return true;
}

// Script entrypoint: `npm run db:seed` (tsx lib/db/seed.ts).
async function main() {
  const { getDb } = await import("./client");
  const db = await getDb();
  const inserted = await seedDb(db);
  console.log(
    inserted ? "Seeded Trifecta database." : "Already seeded — no changes.",
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
