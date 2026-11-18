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
        const appliedChecksum = previous.rows[0].checksum;
        // Migration 003 now recognizes both spellings of the partner origin.
        const isPartnerOriginRename = name === "003_submission_processing.sql"
          && appliedChecksum === "6b00e4914925e779c7fa33cceacc87a065e9b40fc3cf994a50782c68f0432eaf"
          && checksum === "9bfdf098da2f97866554315f2e450f4ebab2593c2b823b39135de64d069baed1";
        if (appliedChecksum !== checksum && !isPartnerOriginRename) throw new Error(`Migração alterada após aplicação: ${name}`);
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
