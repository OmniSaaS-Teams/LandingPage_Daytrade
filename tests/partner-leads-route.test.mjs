import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { POST } from "../src/app/api/partner-leads/route.ts";
import { db } from "../src/lib/db.ts";
import { databaseFixture } from "./helpers/database.mjs";

databaseFixture();
const partner = { nome: " Maria Silva ", email: " maria@example.test ", telefone: "+55 (11) 99999-8888", experiencia: "sim" };
const request = body => new Request("http://localhost/api/partner-leads", { method: "POST", body: JSON.stringify(body) });

test("saves all partner fields with a trusted origin in the contact inbox", async () => {
  process.env.N8N_LEAD_WEBHOOK_URL = "https://n8n.example.test/client";
  const response = await POST(request({ ...partner, origem: "untrusted", kind: "lead", linkedin: "obsolete", celular: "obsolete", consentimento: "true" }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  const stored = (await db.query("SELECT kind,data FROM submissions WHERE id=$1", [result.id])).rows[0];
  assert.equal(stored.kind, "contact");
  assert.deepEqual(stored.data, { nome: "Maria Silva", email: "maria@example.test", telefone: "5511999998888", experienciaFIDCs: true, origem: "Site DayTrade - Parceiro Indicador" });
  assert.equal((await db.query("SELECT * FROM webhook_jobs")).rows.length, 0);
});

test("accepts a landline and no previous FIDC experience using only the four CTA fields", async () => {
  const response = await POST(request({ ...partner, telefone: "(11) 3333-4444", experiencia: "nao" }));
  const result = await response.json();
  assert.equal(response.status, 200);
  const stored = (await db.query("SELECT data FROM submissions WHERE id=$1", [result.id])).rows[0].data;
  assert.equal(stored.experienciaFIDCs, false);
  assert.equal(stored.telefone, "1133334444");
});

test("rejects missing or invalid CTA fields without saving", async () => {
  for (const body of [null, [], {}]) assert.equal((await POST(request(body))).status, 400);
  const invalid = [{ nome: " " }, { nome: 123 }, { nome: "x".repeat(201) }, { email: "" }, { email: "invalid" }, { email: "x".repeat(255) + "@example.test" }, { telefone: "" }, { telefone: "123" }, { telefone: "abc" }, { telefone: "1".repeat(16) }, { experiencia: "" }, { experiencia: "maybe" }];
  for (const fields of invalid) {
    assert.equal((await POST(request({ ...partner, ...fields }))).status, 400, JSON.stringify(fields));
  }
  assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 0);
});

test("rejects malformed and oversized request bodies", async () => {
  assert.equal((await POST(new Request("http://localhost/api/partner-leads", { method: "POST", body: "{" }))).status, 400);
  assert.equal((await POST(request({ ...partner, nome: "x".repeat(33_000) }))).status, 413);
});

test("rate-limits repeated partner registrations", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await POST(request(partner))).status, 200);
  assert.equal((await POST(request(partner))).status, 429);
});

test("does not report success when saving fails", async () => {
  const broken = mock.method(db, "transaction", async () => { throw new Error("database unavailable"); });
  try { assert.equal((await POST(request(partner))).status, 503); }
  finally { broken.mock.restore(); }
});
