import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db } from "../../src/lib/db.ts";
import { migrate } from "../../scripts/migrate.mjs";
import { after, before, beforeEach, mock } from "node:test";

export function databaseFixture() {
  let directory;
  const original = { ...process.env };
  before(async () => {
    directory = await mkdtemp(join(tmpdir(), "daytrade-sqlite-test-"));
    process.env.UPLOAD_DIR = join(directory, "uploads");
    process.env.DATABASE_FILE = join(directory, "test.sqlite");
    await migrate();
  });
  beforeEach(async () => {
    await db.exec("DELETE FROM webhook_jobs; DELETE FROM submissions; DELETE FROM uploads; DELETE FROM admin_sessions; DELETE FROM admin_users; DELETE FROM rate_limits; DELETE FROM blog_posts;");
    delete process.env.N8N_LEAD_WEBHOOK_URL;
    delete process.env.N8N_INVESTOR_WEBHOOK_URL;
    delete process.env.N8N_CAREER_WEBHOOK_URL;
  });
  after(async () => {
    mock.restoreAll();
    await db.close();
    await rm(directory, { recursive: true, force: true });
    for (const key of ["DATABASE_FILE", "UPLOAD_DIR", "N8N_LEAD_WEBHOOK_URL", "N8N_INVESTOR_WEBHOOK_URL", "N8N_CAREER_WEBHOOK_URL"]) {
      if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
    }
  });
  return { get directory() { return process.env.UPLOAD_DIR; } };
}
