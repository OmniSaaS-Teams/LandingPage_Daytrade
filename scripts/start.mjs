import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { migrate } from "./migrate.mjs";
import { db, databaseFile } from "../src/lib/db.ts";

const dev = process.argv.includes("--dev");
// Resolve once so all child processes use the same database, even with standalone.
process.env.DATABASE_FILE = databaseFile();
process.env.UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || "./data/private");
await migrate();
await db.close();

let web;
if (dev) {
  web = ["node_modules/next/dist/bin/next", "dev"];
} else if (existsSync("server.js")) {
  web = ["server.js"];
} else if (existsSync(".next/standalone/server.js")) {
  await cp("public", ".next/standalone/public", { recursive: true });
  await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
  web = [".next/standalone/server.js"];
} else {
  throw new Error("Execute npm run build antes de npm start.");
}

const children = new Set();
let stopping = false;
let exitCode = 0;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  for (const child of children) child.kill("SIGTERM");
  if (!children.size) process.exit(code);
  setTimeout(() => {
    for (const child of children) child.kill("SIGKILL");
    process.exit(exitCode);
  }, 10000).unref();
}
for (const args of [web, ["scripts/worker.mjs"]]) {
  const child = spawn(process.execPath, args, { stdio: "inherit", env: process.env });
  children.add(child);
  child.on("error", () => { console.error("Não foi possível iniciar um dos processos."); stop(1); });
  child.on("exit", code => {
    children.delete(child);
    if (!stopping) stop(code || 1);
    else if (!children.size) process.exit(exitCode);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
// Allows local test harnesses to shut down gracefully on Windows as well.
process.on("message", message => { if (message === "daytrade:stop") stop(); });
