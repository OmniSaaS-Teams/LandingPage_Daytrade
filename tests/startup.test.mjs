import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { once } from "node:events";
import { setTimeout } from "node:timers/promises";
import { DatabaseSync } from "node:sqlite";

test("one startup command migrates SQLite and serves the APIs without a database service", { skip: !existsSync(".next/standalone/server.js"), timeout: 30000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "daytrade-startup-"));
  const portProbe = createServer();
  portProbe.listen(0, "127.0.0.1");
  await once(portProbe, "listening");
  const port = portProbe.address().port;
  await new Promise(resolve => portProbe.close(resolve));
  const child = spawn(process.execPath, ["scripts/start.mjs"], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(port), HOSTNAME: "127.0.0.1", DATABASE_FILE: join(directory, "site.sqlite"), UPLOAD_DIR: join(directory, "private"), N8N_LEAD_WEBHOOK_URL: "", N8N_INVESTOR_WEBHOOK_URL: "", N8N_CAREER_WEBHOOK_URL: "" },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let logs = "";
  child.stdout.on("data", data => { logs += data; });
  child.stderr.on("data", data => { logs += data; });
  const stopped = once(child, "exit");
  try {
    let ready = false;
    for (let attempt=0; attempt<100; attempt++) {
      if (child.exitCode !== null) throw new Error(`Startup failed: ${logs}`);
      try { ready = (await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1000) })).ok; } catch {}
      if (ready) break;
      await setTimeout(100);
    }
    assert.ok(ready, logs);
    const response = await fetch(`http://127.0.0.1:${port}/api/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: "Teste de inicialização", empresa: "Exemplo", telefone: "15999999999" }) });
    assert.equal(response.status, 200, await response.text());
    const sqlite = new DatabaseSync(join(directory, "site.sqlite"));
    try {
      assert.equal(sqlite.prepare("SELECT count(*) AS total FROM submissions").get().total, 1);
      assert.equal(sqlite.prepare("PRAGMA journal_mode").get().journal_mode, "wal");
    } finally { sqlite.close(); }
    const privateFile = await fetch(`http://127.0.0.1:${port}/api/admin/curriculos/00000000-0000-0000-0000-000000000000`);
    assert.equal(privateFile.status,401);
  } finally {
    if (child.connected) child.send("daytrade:stop");
    else child.kill("SIGTERM");
    const killTimer = globalThis.setTimeout(() => child.kill("SIGKILL"), 12000);
    try { await stopped; } finally { globalThis.clearTimeout(killTimer); }
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + (process.platform === "win32" ? "\\" : "/")));
    await rm(directory, { recursive: true, force: true });
  }
});
