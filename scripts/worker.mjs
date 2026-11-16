import { setTimeout } from "node:timers/promises";
import { processNextWebhook } from "../src/lib/webhooks.ts";
import { db } from "../src/lib/db.ts";
import { syncInstagram } from "../src/lib/instagram.ts";

let stopping = false;
process.on("SIGTERM", () => { stopping = true; });
process.on("SIGINT", () => { stopping = true; });
let cleanupAt = 0;
while (!stopping) {
  try {
    if (Date.now() > cleanupAt) {
      await db.query("DELETE FROM admin_sessions WHERE expires_at<strftime('%Y-%m-%dT%H:%M:%fZ','now')");
      await db.query("DELETE FROM rate_limits WHERE reset_at<strftime('%Y-%m-%dT%H:%M:%fZ','now')");
      cleanupAt = Date.now() + 3600000;
    }
    await syncInstagram();
    if (!await processNextWebhook()) await setTimeout(5000);
  } catch {
    console.error("[worker] Banco indisponível; nova tentativa em 10 segundos.");
    await setTimeout(10000);
  }
}
await db.close();
process.exit(0);
