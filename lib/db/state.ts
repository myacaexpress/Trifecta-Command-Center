import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  appConfig,
  cards,
  licensingSteps,
  messageEvents,
  sourceReceipts,
  statusSnapshots,
} from "./schema";
import { makeId } from "../ids";
import {
  type AppState,
  type Card,
  DEFAULT_IMESSAGE,
  type IMessageConfig,
  type MessageEvent,
  type SourceReceipt,
  type StatusSnapshot,
} from "../types";

function stripOrd<T extends { ord?: number }>(row: T): Omit<T, "ord"> {
  const { ord: _ord, ...rest } = row;
  return rest;
}

export async function getState(): Promise<AppState> {
  const db = await getDb();
  const [metrics, steps, cardRows, receipts, events] = await Promise.all([
    db.select().from(statusSnapshots).orderBy(asc(statusSnapshots.ord)),
    db.select().from(licensingSteps).orderBy(asc(licensingSteps.ord)),
    db.select().from(cards).orderBy(asc(cards.ord)),
    db.select().from(sourceReceipts).orderBy(asc(sourceReceipts.ord)),
    db.select().from(messageEvents).orderBy(desc(messageEvents.ord)).limit(30),
  ]);
  const imessage = await getConfig<IMessageConfig>("imessage", DEFAULT_IMESSAGE);
  return {
    metrics: metrics.map(stripOrd) as AppState["metrics"],
    licensingSteps: steps.map(stripOrd) as AppState["licensingSteps"],
    cards: cardRows.map(stripOrd) as AppState["cards"],
    receipts: receipts.map(stripOrd) as AppState["receipts"],
    messageEvents: events.map(stripOrd) as AppState["messageEvents"],
    imessage,
  };
}

export async function getConfig<T>(key: string, fallback: T): Promise<T> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(appConfig)
    .where(eq(appConfig.key, key));
  if (!rows.length) return fallback;
  return rows[0].value as T;
}

export async function setConfig(key: string, value: unknown) {
  const db = await getDb();
  await db
    .insert(appConfig)
    .values({ key, value })
    .onConflictDoUpdate({ target: appConfig.key, set: { value } });
}

export async function addMessageEvent(
  event: Omit<MessageEvent, "id" | "createdAt">,
) {
  const db = await getDb();
  await db.insert(messageEvents).values({
    id: makeId("msg"),
    direction: event.direction,
    channel: event.channel,
    sender: event.sender,
    text: event.text,
    response: event.response ?? null,
    createdAt: new Date().toISOString(),
  });
}

export async function addReceipt(
  receipt: Omit<SourceReceipt, "id" | "createdAt"> & { id?: string },
) {
  const db = await getDb();
  const id = receipt.id ?? makeId("receipt");
  const values = {
    id,
    source: receipt.source,
    date: receipt.date,
    area: receipt.area,
    read: receipt.read,
    confidence: receipt.confidence,
    tone: receipt.tone,
    link: receipt.link ?? null,
    createdAt: new Date().toISOString(),
  };
  await db
    .insert(sourceReceipts)
    .values(values)
    .onConflictDoUpdate({
      target: sourceReceipts.id,
      set: {
        date: values.date,
        area: values.area,
        read: values.read,
        confidence: values.confidence,
        tone: values.tone,
        link: values.link,
      },
    });
  return id;
}

export async function updateStatus(
  id: string,
  patch: Partial<Pick<StatusSnapshot, "status" | "detail" | "tone" | "action">>,
) {
  const db = await getDb();
  await db
    .update(statusSnapshots)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(statusSnapshots.id, id));
}

export async function updateCard(card: Card) {
  const db = await getDb();
  await db
    .update(cards)
    .set({
      title: card.title,
      body: card.body,
      priority: card.priority,
      status: card.status,
      lane: card.lane,
      owner: card.owner,
      due: card.due,
      area: card.area,
      sourceIds: card.sourceIds,
      history: card.history,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(cards.id, card.id));
}

export async function createCard(
  input: Pick<Card, "title" | "body" | "owner" | "area"> & Partial<Card>,
): Promise<Card> {
  const db = await getDb();
  const now = new Date().toISOString();
  const card: Card = {
    id: input.id ?? makeId("card"),
    title: input.title,
    body: input.body,
    priority: input.priority ?? "Medium",
    status: input.status ?? "Not Started",
    lane: input.lane ?? "Ready",
    owner: input.owner,
    due: input.due ?? "Next",
    area: input.area,
    sourceIds: input.sourceIds ?? [],
    history: input.history ?? ["Created by Hermes command."],
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(cards).values(card);
  return card;
}

export async function findCardById(id: string): Promise<Card | null> {
  const db = await getDb();
  const rows = await db.select().from(cards).where(eq(cards.id, id));
  if (!rows.length) return null;
  return stripOrd(rows[0]) as Card;
}
