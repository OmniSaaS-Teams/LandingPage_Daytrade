import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { POST } from "../src/app/api/leads/route.ts";
import { db } from "../src/lib/db.ts";
import { databaseFixture } from "./helpers/database.mjs";
databaseFixture();
const lead = { nome: " João Silva ", razaoSocial: " Empresa LTDA ", cnpj: "12.345.678/0001-90", telefone: "+55 (11) 99999-9999", email: " joao@example.test " };
const request = body => new Request("http://localhost/api/leads", { method: "POST", body: JSON.stringify(body) });
test("persists normalized lead with server-defined context before confirming success", async () => {
  const response = await POST(request({ ...lead, idEmpresa: "malicious" }));
  assert.equal(response.status,200);
  const result = await response.json();
  assert.equal(result.success,true);
  const stored = (await db.query("SELECT data FROM submissions WHERE id=$1",[result.id])).rows[0].data;
  assert.equal(stored.nome,"João Silva"); assert.equal(stored.telefone,"5511999999999"); assert.equal(stored.cnpj,"12345678000190"); assert.equal(stored.idEmpresa,"001");
});
test("rejects invalid inputs before creating any record", async () => {
  for(const body of [null,[],{}, {...lead,nome:" "},{...lead,razaoSocial:123},{...lead,cnpj:"123"},{...lead,telefone:"abc"},{...lead,email:"invalid"}]) assert.equal((await POST(request(body))).status,400);
  assert.equal((await db.query("SELECT * FROM submissions")).rows.length,0);
});
test("rejects malformed JSON", async () => { assert.equal((await POST(new Request("http://localhost/api/leads",{method:"POST",body:"{"}))).status,400); });
test("saves a lead and atomically queues n8n instead of contacting the network", async () => {
  process.env.N8N_LEAD_WEBHOOK_URL="https://n8n.example.test/lead";
  const fetchMock=mock.method(globalThis,"fetch",async()=>{throw new Error("Network must not be called in the request");});
  try { assert.equal((await POST(request(lead))).status,200); assert.equal(fetchMock.mock.callCount(),0); assert.equal((await db.query("SELECT * FROM webhook_jobs")).rows.length,1); }
  finally { fetchMock.mock.restore(); }
});
test("rate-limits repeated submissions", async()=>{for(let i=0;i<5;i++) assert.equal((await POST(request(lead))).status,200); assert.equal((await POST(request(lead))).status,429);});
test("does not confirm success when the database transaction fails",async()=>{
  const broken=mock.method(db,"transaction",async()=>{throw new Error("database unavailable");});
  try { assert.equal((await POST(request(lead))).status,503); } finally { broken.mock.restore(); }
});
