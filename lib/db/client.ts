import type { PgDatabase } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * A driver-agnostic Drizzle handle. Both the Neon HTTP driver (production) and
 * the PGlite driver (local dev / tests) satisfy this shape — query methods come
 * from PgDatabase and result rows are typed from the table passed to `.from()`.
 */
export type DB = PgDatabase<any, any, any>;

let dbPromise: Promise<DB> | null = null;

/**
 * Lazily construct the database handle.
 *
 * - If DATABASE_URL points at Postgres (Neon in production), use the Neon HTTP
 *   serverless driver — no connection pool to exhaust across serverless calls.
 * - Otherwise fall back to an in-memory PGlite database that is auto-migrated
 *   and auto-seeded. This makes `npm run dev` and the test suite work with zero
 *   database setup. PGlite data is NOT persisted across processes.
 *
 * Construction is lazy so importing this module never connects (keeps
 * `next build` side-effect free).
 */
export function getDb(): Promise<DB> {
  if (!dbPromise) dbPromise = init();
  return dbPromise;
}

/** Test/seed helper: replace the cached handle (e.g. with an isolated PGlite). */
export function __setDb(db: DB) {
  dbPromise = Promise.resolve(db);
}

async function init(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema }) as unknown as DB;
  }
  return createPglite();
}

/** In-memory PGlite handle, migrated + seeded. Used for dev, tests, and CI. */
export async function createPglite(): Promise<DB> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as DB;
  await migrate(db as any, { migrationsFolder: "drizzle" });
  const { seedDb } = await import("./seed");
  await seedDb(db);
  return db;
}
