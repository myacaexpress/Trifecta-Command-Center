import Database from "better-sqlite3";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { getConfig, setConfig } from "./db.js";
import { runCommand } from "./commands.js";
import type { IMessageConfig } from "./types.js";

const execFileAsync = promisify(execFile);

export interface RecentChat {
  guid: string;
  displayName: string;
  lastMessage: string;
  lastRowId: number;
}

export interface MessageTransport {
  send(chatGuid: string, text: string): Promise<void>;
}

export class AppleScriptMessageTransport implements MessageTransport {
  async send(chatGuid: string, text: string) {
    const script = `
      tell application "Messages"
        set targetChat to chat id ${appleScriptString(chatGuid)}
        send ${appleScriptString(text)} to targetChat
      end tell
    `;
    await execFileAsync("osascript", ["-e", script]);
  }
}

export function getMessagesDbPath() {
  return join(homedir(), "Library/Messages/chat.db");
}

export function listRecentChats(limit = 20): { ok: true; chats: RecentChat[] } | { ok: false; error: string } {
  const path = getMessagesDbPath();
  if (!existsSync(path)) {
    return { ok: false, error: "Messages database not found. Grant Full Disk Access to the terminal/app running this service." };
  }

  try {
    const messages = new Database(path, { readonly: true, fileMustExist: true });
    const chats = messages
      .prepare(
        `
        SELECT
          chat.guid as guid,
          COALESCE(chat.display_name, chat.chat_identifier, chat.guid) as displayName,
          COALESCE(message.text, '') as lastMessage,
          message.ROWID as lastRowId
        FROM chat
        JOIN chat_message_join ON chat.ROWID = chat_message_join.chat_id
        JOIN message ON message.ROWID = chat_message_join.message_id
        WHERE message.text IS NOT NULL
        GROUP BY chat.ROWID
        ORDER BY MAX(message.ROWID) DESC
        LIMIT ?
      `,
      )
      .all(limit) as RecentChat[];
    messages.close();
    return { ok: true, chats };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function pollIMessage(appDb: Database.Database, transport: MessageTransport = new AppleScriptMessageTransport()) {
  const config = getConfig<IMessageConfig>(appDb, "imessage", {
    enabled: false,
    chatGuid: "",
    allowedSenders: [],
    lastRowId: 0,
    sendReplies: false,
  });

  if (!config.enabled || !config.chatGuid) {
    return { ok: false, processed: 0, error: "iMessage bridge is not configured." };
  }

  const path = getMessagesDbPath();
  if (!existsSync(path)) {
    return { ok: false, processed: 0, error: "Messages database not found. Full Disk Access is probably needed." };
  }

  const messages = new Database(path, { readonly: true, fileMustExist: true });
  try {
    const rows = messages
      .prepare(
        `
        SELECT
          message.ROWID as rowId,
          COALESCE(handle.id, 'unknown') as sender,
          message.text as text
        FROM message
        JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
        JOIN chat ON chat.ROWID = chat_message_join.chat_id
        LEFT JOIN handle ON message.handle_id = handle.ROWID
        WHERE chat.guid = ?
          AND message.ROWID > ?
          AND message.is_from_me = 0
          AND message.text IS NOT NULL
        ORDER BY message.ROWID ASC
      `,
      )
      .all(config.chatGuid, config.lastRowId) as Array<{ rowId: number; sender: string; text: string }>;

    let processed = 0;
    let lastRowId = config.lastRowId;
    for (const row of rows) {
      lastRowId = Math.max(lastRowId, row.rowId);
      const allowed = !config.allowedSenders.length || config.allowedSenders.includes(row.sender);
      if (!allowed) continue;
      const result = runCommand(appDb, row.text, "imessage", row.sender);
      processed += 1;
      if (config.sendReplies) {
        await transport.send(config.chatGuid, result.response);
      }
    }

    setConfig(appDb, "imessage", { ...config, lastRowId });
    return { ok: true, processed, lastRowId };
  } catch (error) {
    return { ok: false, processed: 0, error: error instanceof Error ? error.message : String(error) };
  } finally {
    messages.close();
  }
}

function appleScriptString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
