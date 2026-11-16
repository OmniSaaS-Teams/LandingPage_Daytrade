import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db.ts";
import { hashPassword } from "../src/lib/passwords.ts";

const terminal = createInterface({ input: stdin, output: stdout });
const email = (process.env.ADMIN_EMAIL || await terminal.question("E-mail do administrador: ")).trim().toLowerCase();
// Password arrives through a process environment or piped input; never a CLI argument.
const password = process.env.ADMIN_PASSWORD || "";
terminal.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 256) throw new Error("Configure ADMIN_PASSWORD (12 a 256 caracteres) e informe um e-mail válido. Não passe a senha como argumento.");
try {
  await db.transaction(async client => {
    const result = await client.query("INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash RETURNING id", [randomUUID(), email, await hashPassword(password)]);
    await client.query("DELETE FROM admin_sessions WHERE user_id=$1", [result.rows[0].id]);
  });
  console.log("Administrador salvo; sessões anteriores revogadas.");
} finally { await db.close(); }
