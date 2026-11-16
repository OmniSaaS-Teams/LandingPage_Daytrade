import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { db } from "../src/lib/db.ts";

export async function migrate(database = db) {
  await database.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))");
  const directory = new URL("../db/migrations/", import.meta.url);
  for (const name of (await readdir(directory)).filter(name => name.endsWith(".sql")).sort()) {
    const sql = (await readFile(new URL(name, directory), "utf8")).replaceAll("\r\n", "\n");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await database.transaction(async client => {
      const previous = await client.query("SELECT checksum FROM schema_migrations WHERE name=$1", [name]);
      if (previous.rows.length) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`Migração alterada após aplicação: ${name}`);
        return;
      }
      await client.exec(sql);
      await client.query("INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)", [name, checksum]);
      console.log(`Migração aplicada: ${name}`);
    });
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { await migrate(); } finally { await db.close(); }
}
