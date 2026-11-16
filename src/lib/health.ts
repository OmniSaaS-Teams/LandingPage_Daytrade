import { db } from "./db.ts";

export async function healthResponse() {
  try {
    const schema = await db.query("SELECT name FROM schema_migrations WHERE name IN ('003_submission_processing.sql','004_instagram_connection.sql')");
    if (schema.rows.length !== 2) throw new Error("Migrações pendentes.");
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
