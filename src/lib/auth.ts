import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db.ts";
import { findSession, tokenHash } from "./session-store.ts";
export { findSession, tokenHash } from "./session-store.ts";

export const sessionCookie = "daytrade_admin";
export async function currentAdmin() { return findSession((await cookies()).get(sessionCookie)?.value); }
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.query("INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,strftime('%Y-%m-%dT%H:%M:%fZ','now','+8 hours'))", [tokenHash(token), userId]);
  (await cookies()).set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
