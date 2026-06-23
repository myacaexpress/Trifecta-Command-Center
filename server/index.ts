import { createServer } from "node:http";
import { openDb, getConfig, getState, setConfig } from "./db.js";
import { runCommand } from "./commands.js";
import { runReadOnlyJob } from "./jobs.js";
import { listRecentChats, pollIMessage } from "./imessage.js";
import type { IMessageConfig } from "./types.js";

const db = openDb();
const port = Number(process.env.TRIFECTA_API_PORT ?? 8787);

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);

    if (req.method === "GET" && url.pathname === "/api/state") {
      return sendJson(res, 200, getState(db));
    }

    if (req.method === "POST" && url.pathname === "/api/command") {
      const body = await readJson<{ text?: string; sender?: string }>(req);
      return sendJson(res, 200, runCommand(db, body.text ?? "", "web", body.sender ?? "founder"));
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/jobs/")) {
      const kind = url.pathname.split("/").pop() ?? "";
      return sendJson(res, 200, runReadOnlyJob(db, kind));
    }

    if (req.method === "GET" && url.pathname === "/api/imessage/config") {
      return sendJson(res, 200, getConfig<IMessageConfig>(db, "imessage", defaultIMessageConfig()));
    }

    if (req.method === "POST" && url.pathname === "/api/imessage/config") {
      const body = await readJson<Partial<IMessageConfig>>(req);
      const current = getConfig<IMessageConfig>(db, "imessage", defaultIMessageConfig());
      const next = {
        ...current,
        ...body,
        allowedSenders: Array.isArray(body.allowedSenders) ? body.allowedSenders : current.allowedSenders,
      };
      setConfig(db, "imessage", next);
      return sendJson(res, 200, next);
    }

    if (req.method === "GET" && url.pathname === "/api/imessage/chats") {
      return sendJson(res, 200, listRecentChats());
    }

    if (req.method === "POST" && url.pathname === "/api/imessage/poll") {
      const result = await pollIMessage(db);
      return sendJson(res, 200, { ...result, state: getState(db) });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Trifecta Command Center API running at http://127.0.0.1:${port}`);
});

function defaultIMessageConfig(): IMessageConfig {
  return { enabled: false, chatGuid: "", allowedSenders: [], lastRowId: 0, sendReplies: false };
}

function sendJson(res: Parameters<typeof createServer>[0] extends never ? never : import("node:http").ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json",
  });
  res.end(status === 204 ? "" : JSON.stringify(data));
}

function readJson<T>(req: import("node:http").IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) return resolve({} as T);
      try {
        resolve(JSON.parse(body) as T);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}
