"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../lib/db.ts";
import { createSession, sessionCookie, tokenHash } from "../../lib/auth.ts";
import { verifyPassword } from "../../lib/passwords.ts";
import { allowAttempt } from "../../lib/rate-limit.ts";

export async function login(form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (email.length > 254 || !email || password.length > 256 || !password) redirect("/admin/login?erro=credenciais");
  let success = false;
  try {
    if (!await allowAttempt("login", email, 5, 900) || !await allowAttempt("login-global", "all", 100, 900)) redirect("/admin/login?erro=limite");
    const result = await db.query<{ id: string; password_hash: string }>("SELECT id,password_hash FROM admin_users WHERE email=$1", [email]);
    // Equal-cost verification when the account does not exist.
    const hash = result.rows[0]?.password_hash || `scrypt:${"0".repeat(64)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(password, hash);
    if (result.rows[0] && valid) {
      await createSession(result.rows[0].id);
      success = true;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    redirect("/admin/login?erro=indisponivel");
  }
  redirect(success ? "/admin" : "/admin/login?erro=credenciais");
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) await db.query("DELETE FROM admin_sessions WHERE token_hash=$1", [tokenHash(token)]);
  jar.delete(sessionCookie);
  redirect("/admin/login");
}
