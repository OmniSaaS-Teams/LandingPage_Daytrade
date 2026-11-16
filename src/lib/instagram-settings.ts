import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { db, databaseFile } from "./db.ts";

type Connection = { username: string; token_ciphertext: string; updated_at: string };
export class InstagramSettingsError extends Error {}

// The key lives beside SQLite in the persistent data volume, outside public/ and Git.
function keyPath() { return join(dirname(databaseFile()), "secrets", "instagram.key"); }

async function encryptionKey(create = false) {
  const path = keyPath();
  if (create) {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    try { await writeFile(path, randomBytes(32), { flag: "wx", mode: 0o600 }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  }
  const key = await readFile(path);
  if (key.length !== 32) throw new Error("Chave de conexão indisponível.");
  return key;
}

async function encrypt(token: string, username: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await encryptionKey(true), iv);
  cipher.setAAD(Buffer.from(username));
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

async function decrypt(value: string, username: string) {
  const [version, iv, tag, encrypted, extra] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted || extra) throw new Error("Conexão indisponível.");
  const decipher = createDecipheriv("aes-256-gcm", await encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(username));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function environmentInstagramUsername() {
  const username = (process.env.INSTAGRAM_USERNAME || "daytradesa").replace(/^@/, "").toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(username) ? username : "daytradesa";
}

async function savedConnection() {
  return (await db.query<Connection>("SELECT username,token_ciphertext,updated_at FROM instagram_connection WHERE id=1")).rows[0];
}

// Safe metadata for the admin and public feed. Never return ciphertext or a token hint.
export async function instagramConnectionStatus() {
  const saved = await savedConnection();
  return saved
    ? { username: saved.username, configured: true, source: "admin" as const, updatedAt: saved.updated_at }
    : { username: environmentInstagramUsername(), configured: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN), source: "environment" as const, updatedAt: null };
}

// Only the server-side synchronizer consumes this object.
export async function instagramConnection() {
  const saved = await savedConnection();
  return saved
    ? { username: saved.username, token: await decrypt(saved.token_ciphertext, saved.username), userId: "" }
    : { username: environmentInstagramUsername(), token: process.env.INSTAGRAM_ACCESS_TOKEN || "", userId: process.env.INSTAGRAM_USER_ID || "" };
}

export async function saveInstagramConnection(usernameValue: unknown, tokenValue: unknown) {
  const username = typeof usernameValue === "string" ? usernameValue.trim().replace(/^@/, "").toLowerCase() : "";
  const providedToken = typeof tokenValue === "string" ? tokenValue.trim() : "";
  if (!/^[a-z0-9._]{1,30}$/.test(username)) throw new InstagramSettingsError("invalid_username");
  if (providedToken && !/^[\x21-\x7e]{20,4096}$/.test(providedToken)) throw new InstagramSettingsError("invalid_token");
  const previous = await instagramConnectionStatus();
  if (!providedToken && previous.username !== username) throw new InstagramSettingsError("new_token_required");
  const token = providedToken || (await instagramConnection()).token;
  if (!token) throw new InstagramSettingsError("token_required");
  const encrypted = await encrypt(token, username);
  await db.transaction(async client => {
    await client.query("INSERT INTO instagram_connection(id,username,token_ciphertext) VALUES(1,$1,$2) ON CONFLICT(id) DO UPDATE SET username=excluded.username,token_ciphertext=excluded.token_ciphertext,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')", [username, encrypted]);
    // The running worker sees the new configuration without an application restart.
    await client.query("INSERT INTO instagram_feeds(username) VALUES($1) ON CONFLICT(username) DO UPDATE SET next_attempt_at=0,last_error=null", [username]);
  });
}
