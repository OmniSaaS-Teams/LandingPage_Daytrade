import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { databaseFixture } from "./helpers/database.mjs";
import { db } from "../src/lib/db.ts";
import { captureSubmission } from "../src/lib/submissions.ts";
import { processNextWebhook } from "../src/lib/webhooks.ts";
import { simulateInvestment } from "../src/lib/investment-simulation.ts";
import { formatSubmissionValue, listSubmissions } from "../src/lib/admin-data.ts";
import { POST as investor } from "../src/app/api/investor-leads/route.ts";
import { POST as contact } from "../src/app/api/contacts/route.ts";
import { POST as partner } from "../src/app/api/partner-leads/route.ts";
import { healthResponse as health } from "../src/lib/health.ts";
import { POST as career } from "../src/app/api/careers/route.ts";
import { createFormRequest } from "../src/lib/form-request.ts";

const fixture = databaseFixture();
const request = (path, data, key = randomUUID()) => new Request(`http://localhost/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(data) });
const person = { nome: "Maria", email: "Maria@Example.test", telefone: "(11) 99999-9999" };

test("simulator ignores client-calculated returns and saves the exact server result before returning it", async () => {
  const body = { ...person, origem: "simulador_investimento", valor: 50000, periodo: "3", simulation: { values: { carteira: 1e30 } }, annualCdi: 100 };
  const key = randomUUID();
  const response = await investor(request("investor-leads", body, key));
  assert.equal(response.status, 200);
  const receipt = await response.json();
  assert.deepEqual(receipt.simulation, simulateInvestment(50000, 3));
  assert.equal(receipt.simulation.values.carteira, 73106.77);
  const stored = (await db.query("SELECT data,created_at FROM submissions WHERE id=$1", [receipt.id])).rows[0];
  assert.deepEqual(stored.data.simulacao, receipt.simulation);
  assert.equal(stored.data.email, "maria@example.test");
  assert.equal(receipt.createdAt, stored.created_at);
  assert.deepEqual(await (await investor(request("investor-leads", body, key))).json(), receipt);
  assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 1);
});

test("simulation validates all supported periods and bounds on the server", () => {
  for (const years of [1, 3, 5]) {
    const simulation = simulateInvestment(50000, years);
    assert.ok(simulation.values.carteira > simulation.values.cdb);
    assert.ok(simulation.values.cdb > simulation.values.poupanca);
  }
  for (const [amount, years] of [[NaN, 1], [Infinity, 1], [49999, 1], [1e9 + 1, 1], [50000, 2], [50000, 0]]) assert.throws(() => simulateInvestment(amount, years));
});

test("sequential and concurrent retries create one record and one webhook job", async () => {
  process.env.N8N_PARTNER_WEBHOOK_URL = "https://n8n.example.test/partner";
  const body = { ...person, experiencia: "nao" }, key = randomUUID();
  const responses = await Promise.all(Array.from({ length: 4 }, () => partner(request("partner-leads", body, key))));
  const receipts = await Promise.all(responses.map(response => response.json()));
  assert.ok(receipts.every(receipt => receipt.success && receipt.id === receipts[0].id));
  for (let i = 0; i < 6; i++) assert.equal((await partner(request("partner-leads", body, key))).status, 200);
  assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 1);
  assert.equal((await db.query("SELECT destination FROM webhook_jobs")).rows[0].destination, "partner");
  assert.equal((await listSubmissions("partner", "", "Maria", 1)).total, 1);
});

test("reusing a request key with different data is rejected without replacing the first record", async () => {
  const key = randomUUID();
  assert.equal((await partner(request("partner-leads", { ...person, experiencia: "sim" }, key))).status, 200);
  assert.equal((await partner(request("partner-leads", { ...person, experiencia: "nao" }, key))).status, 409);
  assert.equal((await db.query("SELECT data FROM submissions")).rows[0].data.experienciaFIDCs, true);
  assert.equal((await partner(request("partner-leads", { ...person, experiencia: "nao" }, "invalid-key"))).status, 400);
});

test("concurrent resume retries do not leave duplicate uploads or files", async () => {
  const key = randomUUID();
  const send = () => captureSubmission("career", { ...person, origem: "Carreira" }, new File(["%PDF-1.7 test"], "curriculo.pdf", { type: "application/pdf" }), request("careers", {}, key));
  const responses = await Promise.all([send(), send()]);
  const receipts = await Promise.all(responses.map(response => response.json()));
  assert.equal(receipts[0].id, receipts[1].id);
  assert.equal((await db.query("SELECT * FROM uploads")).rows.length, 1);
  assert.equal((await readdir(fixture.directory)).length, 1);
  const changed = await captureSubmission("career", { ...person, origem: "Carreira" }, new File(["%PDF-1.7 changed"], "curriculo.pdf", { type: "application/pdf" }), request("careers", {}, key));
  assert.equal(changed.status, 409);
  assert.equal((await readdir(fixture.directory)).length, 1);
});

test("WhatsApp destination and message come from validated server data after persistence", async () => {
  const body = { nome: " Maria ", empresa: " Empresa & Cia ", telefone: "(11) 3333-4444", whatsappUrl: "https://evil.test" };
  const response = await contact(request("contacts", body));
  const receipt = await response.json();
  assert.equal(response.status, 200);
  const url = new URL(receipt.whatsappUrl);
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5515991269893");
  assert.equal(url.searchParams.get("text"), "Olá, sou Maria, da empresa Empresa & Cia. Vim pelo site e gostaria de mais informações.");
  assert.equal((await db.query("SELECT id FROM submissions WHERE id=$1", [receipt.id])).rows.length, 1);
});

test("partner and WhatsApp integrations use separate server-configured destinations", async () => {
  process.env.N8N_PARTNER_WEBHOOK_URL = "https://n8n.example.test/partner";
  process.env.N8N_CONTACT_WEBHOOK_URL = "https://n8n.example.test/contact";
  await partner(request("partner-leads", { ...person, experiencia: "sim" }));
  await contact(request("contacts", { ...person, empresa: "Empresa" }));
  const network = mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
  try {
    await processNextWebhook();
    await processNextWebhook();
    const deliveries = network.mock.calls.map(({ arguments: [url, options] }) => ({ url, body: JSON.parse(options.body) }));
    assert.equal(deliveries.find(item => item.url === process.env.N8N_PARTNER_WEBHOOK_URL).body.experienciaFIDCs, true);
    assert.equal(deliveries.find(item => item.url === process.env.N8N_CONTACT_WEBHOOK_URL).body.empresa, "Empresa");
    assert.ok((await db.query("SELECT status FROM webhook_jobs")).rows.every(row => row.status === "sent"));
  } finally { network.mock.restore(); }
});

test("migration preserves existing contacts, resumes and queued deliveries, classifying old partners", async () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("PRAGMA foreign_keys=ON");
    for (const file of ["001_initial.sql", "002_instagram_feed.sql"]) sqlite.exec(await readFile(new URL(`../db/migrations/${file}`, import.meta.url), "utf8"));
    sqlite.exec("INSERT INTO uploads(id,path,original_name,mime,bytes) VALUES('upload','resume.pdf','resume.pdf','application/pdf',10)");
    const insert = sqlite.prepare("INSERT INTO submissions(id,kind,data,status,upload_id) VALUES(?,?,?,?,?)");
    insert.run("partner", "contact", JSON.stringify({ origem: "Site Daytrade - Parceiro Indicador".replace("trade", "Trade"), nome: "Parceiro antigo" }), "em_atendimento", null);
    insert.run("contact", "contact", JSON.stringify({ origem: "Contato WhatsApp" }), "novo", null);
    insert.run("career", "career", JSON.stringify({ nome: "Candidato" }), "concluido", "upload");
    sqlite.exec("INSERT INTO webhook_jobs(id,submission_id,destination,status,attempts,last_error) VALUES('job','career','career','failed',5,'HTTP 500')");
    const before = { uploads: sqlite.prepare("SELECT * FROM uploads").all(), jobs: sqlite.prepare("SELECT * FROM webhook_jobs").all() };
    sqlite.exec("BEGIN");
    sqlite.exec(await readFile(new URL("../db/migrations/003_submission_processing.sql", import.meta.url), "utf8"));
    sqlite.exec("COMMIT");
    assert.equal(sqlite.prepare("SELECT kind FROM submissions WHERE id='partner'").get().kind, "partner");
    assert.equal(sqlite.prepare("SELECT kind FROM submissions WHERE id='contact'").get().kind, "contact");
    assert.equal(sqlite.prepare("SELECT status FROM submissions WHERE id='partner'").get().status, "em_atendimento");
    assert.deepEqual(sqlite.prepare("SELECT * FROM uploads").all(), before.uploads);
    assert.deepEqual(sqlite.prepare("SELECT * FROM webhook_jobs").all(), before.jobs);
    assert.equal(sqlite.prepare("PRAGMA foreign_key_check").all().length, 0);
    sqlite.exec("DELETE FROM submissions WHERE id='career'");
    assert.equal(sqlite.prepare("SELECT count(*) AS total FROM webhook_jobs").get().total, 0);
  } finally { sqlite.close(); }
});

test("admin displays saved structured simulation values instead of an object placeholder", () => {
  assert.equal(formatSubmissionValue(true), "Sim");
  assert.equal(formatSubmissionValue(false), "Não");
  assert.equal(JSON.parse(formatSubmissionValue({ carteira: 56750 })).carteira, 56750);
});

test("health check requires the updated schema and fails closed on database errors", async () => {
  assert.equal((await health()).status, 200);
  const unavailable = mock.method(db, "query", async () => ({ rows: [] }));
  try { assert.equal((await health()).status, 503); }
  finally { unavailable.mock.restore(); }
});

test("browser retries after a lost response reuse the saved receipt without duplicating a partner", async () => {
  const send = createFormRequest();
  let calls = 0;
  const network = mock.method(globalThis, "fetch", async (path, options) => {
    const response = await partner(new Request(`http://localhost${path}`, options));
    if (++calls === 1) throw new TypeError("Response lost after committing");
    return response;
  });
  try {
    const data = { ...person, experiencia: "sim" };
    await assert.rejects(() => send("/api/partner-leads", data), /Verifique sua conexão/);
    assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 1);
    const receipt = await send("/api/partner-leads", data);
    assert.equal(receipt.success, true);
    assert.equal(network.mock.calls[0].arguments[1].headers["Idempotency-Key"], network.mock.calls[1].arguments[1].headers["Idempotency-Key"]);
    assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 1);
    await send("/api/partner-leads", { ...data, email: "other@example.test" });
    assert.notEqual(network.mock.calls[1].arguments[1].headers["Idempotency-Key"], network.mock.calls[2].arguments[1].headers["Idempotency-Key"]);
  } finally { network.mock.restore(); }
});

test("shared browser sender uploads resumes with an automatic multipart boundary and reports server errors", async () => {
  const send = createFormRequest();
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...person, area: "Tecnologia e dados", consentimento: "true" })) data.set(key, value);
  data.set("curriculo", new File(["%PDF-1.7 test"], "curriculo.pdf", { type: "application/pdf" }));
  const network = mock.method(globalThis, "fetch", async (path, options) => {
    assert.equal(options.headers["Content-Type"], undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return career(new Request(`http://localhost${path}`, options));
  });
  try {
    assert.equal((await send("/api/careers", data, 25_000)).success, true);
    data.set("consentimento", "false");
    await assert.rejects(() => send("/api/careers", data), /Autorize o uso dos dados/);
    assert.equal((await db.query("SELECT * FROM submissions")).rows.length, 1);
  } finally { network.mock.restore(); }
});
