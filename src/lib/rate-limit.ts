import { createHash } from "node:crypto";
import { db } from "./db.ts";

export async function allowAttempt(scope: string, identity: string, max = 10, seconds = 900) {
  const key = createHash("sha256").update(`${scope}:${identity.toLowerCase()}`).digest("hex");
  const result = await db.query<{ count: number }>(`
    INSERT INTO rate_limits(key,count,reset_at) VALUES($1,1,strftime('%Y-%m-%dT%H:%M:%fZ','now','+' || $2 || ' seconds'))
    ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN rate_limits.reset_at<strftime('%Y-%m-%dT%H:%M:%fZ','now') THEN 1 ELSE rate_limits.count+1 END,
      reset_at=CASE WHEN rate_limits.reset_at<strftime('%Y-%m-%dT%H:%M:%fZ','now') THEN strftime('%Y-%m-%dT%H:%M:%fZ','now','+' || $2 || ' seconds') ELSE rate_limits.reset_at END
    RETURNING count`, [key, seconds]);
  return result.rows[0].count <= max;
}
