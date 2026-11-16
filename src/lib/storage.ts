import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

export function privatePath(name: string) {
  if (!/^[a-f0-9-]{36}\.(pdf|doc|docx)$/.test(name)) throw new Error("Arquivo inválido.");
  const root = resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./data/private");
  const path = resolve(root, name);
  if (!path.startsWith(root + sep)) throw new Error("Arquivo inválido.");
  return path;
}
export async function storeResume(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const name = `${randomUUID()}.${extension}`;
  const path = privatePath(name);
  await mkdir(resolve(path, ".."), { recursive: true, mode: 0o700 });
  await writeFile(path, Buffer.from(await file.arrayBuffer()), { flag: "wx", mode: 0o600 });
  return name;
}
export async function readResume(name: string) { return readFile(/* turbopackIgnore: true */ privatePath(name)); }
export async function removeResume(name: string) {
  try { await unlink(privatePath(name)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}
