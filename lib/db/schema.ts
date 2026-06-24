import { pgTable, text, jsonb, serial } from "drizzle-orm/pg-core";
import type { Lane, Priority, Status, Tone } from "../types";

/**
 * Postgres schema mirroring the original SQLite tables (server/db.ts).
 * `ord` is a serial column used only to preserve the original insertion
 * order that the SQLite UI relied on via implicit rowid.
 */

export const statusSnapshots = pgTable("status_snapshots", {
  id: text("id").primaryKey(),
  ord: serial("ord"),
  title: text("title").notNull(),
  status: text("status").notNull(),
  detail: text("detail").notNull(),
  action: text("action").notNull(),
  tone: text("tone").$type<Tone>().notNull(),
  iconKey: text("icon_key").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const licensingSteps = pgTable("licensing_steps", {
  id: text("id").primaryKey(),
  ord: serial("ord"),
  step: text("step").notNull(),
  status: text("status").$type<Status>().notNull(),
  owner: text("owner").notNull(),
  source: text("source").notNull(),
  detail: text("detail").notNull(),
  sourceReceiptId: text("source_receipt_id"),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  ord: serial("ord"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  priority: text("priority").$type<Priority>().notNull(),
  status: text("status").$type<Status>().notNull(),
  lane: text("lane").$type<Lane>().notNull(),
  owner: text("owner").notNull(),
  due: text("due").notNull(),
  area: text("area").notNull(),
  sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
  history: jsonb("history").$type<string[]>().notNull().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sourceReceipts = pgTable("source_receipts", {
  id: text("id").primaryKey(),
  ord: serial("ord"),
  source: text("source").notNull(),
  date: text("date").notNull(),
  area: text("area").notNull(),
  // Column kept as current_read (matches the original SQLite schema); the
  // app-facing property is `read`.
  read: text("current_read").notNull(),
  confidence: text("confidence").notNull(),
  tone: text("tone").$type<Tone>().notNull(),
  link: text("link"),
  createdAt: text("created_at").notNull(),
});

export const messageEvents = pgTable("message_events", {
  id: text("id").primaryKey(),
  ord: serial("ord"),
  direction: text("direction").notNull(),
  channel: text("channel").notNull(),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  response: text("response"),
  createdAt: text("created_at").notNull(),
});

export const appConfig = pgTable("app_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});
