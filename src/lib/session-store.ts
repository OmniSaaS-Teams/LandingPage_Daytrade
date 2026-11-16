import { createHash } from "node:crypto";
import { db } from "./db.ts";
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export async function findSession(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await db.query<{ id: string; email: string }>("SELECT u.id,u.email FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>strftime('%Y-%m-%dT%H:%M:%fZ','now')", [tokenHash(token)]);
  return result.rows[0] || null;
}
