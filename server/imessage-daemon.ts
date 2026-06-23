import { openDb } from "./db.js";
import { pollIMessage } from "./imessage.js";

const db = openDb();
const intervalMs = Number(process.env.TRIFECTA_IMESSAGE_POLL_MS ?? 3000);

console.log(`Trifecta iMessage poller running every ${intervalMs}ms. Replies are controlled by local config.`);

async function tick() {
  const result = await pollIMessage(db);
  if (result.ok && result.processed) {
    console.log(`Processed ${result.processed} iMessage command(s).`);
  }
}

setInterval(() => {
  tick().catch((error) => console.error(error));
}, intervalMs);
