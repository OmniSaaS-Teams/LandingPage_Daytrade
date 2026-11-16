import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { databaseFixture } from "./helpers/database.mjs";
import { captureSubmission } from "../src/lib/submissions.ts";
databaseFixture();
test("worker loop delivers queued contacts after session cleanup", async () => {
  let received;
  const delivered = new Promise(resolve => { received=resolve; });
  const server=createServer((req,res) => { req.resume(); req.on("end",() => { res.end("ok"); received(); }); });
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  process.env.N8N_LEAD_WEBHOOK_URL=`http://127.0.0.1:${server.address().port}/lead`;
  await captureSubmission("lead",{nome:"Teste worker",email:"worker@example.test"});
  const child=spawn(process.execPath,["scripts/worker.mjs"],{env:{...process.env,INSTAGRAM_ACCESS_TOKEN:""},stdio:"ignore"});
  let timer;
  try {
    await Promise.race([delivered,new Promise((_,reject) => {timer=setTimeout(() => reject(new Error("worker did not deliver queued contact")),8000);})]);
    assert.ok(true);
  } finally {
    clearTimeout(timer);
    child.kill();
    await once(child,"exit");
    await new Promise(resolve => server.close(resolve));
  }
});
