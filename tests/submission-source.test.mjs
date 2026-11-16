import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, mock } from "node:test";
import { databaseFixture } from "./helpers/database.mjs";
import { db } from "../src/lib/db.ts";
import { submissionSource } from "../src/lib/submission-source.ts";
import { createFormRequest } from "../src/lib/form-request.ts";
import { processNextWebhook } from "../src/lib/webhooks.ts";
import { POST as lead } from "../src/app/api/leads/route.ts";
import { POST as investor } from "../src/app/api/investor-leads/route.ts";
import { POST as partner } from "../src/app/api/partner-leads/route.ts";
import { POST as contact } from "../src/app/api/contacts/route.ts";
import { POST as career } from "../src/app/api/careers/route.ts";

databaseFixture();
const base = "http://localhost";
const person = { nome: "Teste origem", email: "origem@example.test", telefone: "11900000000" };
const request = (path, body, page, key = randomUUID()) => new Request(`${base}${path}`, {
  method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key, "X-Daytrade-Page-Path": page }, body: JSON.stringify(body),
});

test("all six forms persist and deliver server-defined identity and the actual page path", async () => {
  for (const kind of ["LEAD", "INVESTOR", "PARTNER", "CONTACT", "CAREER"]) process.env[`N8N_${kind}_WEBHOOK_URL`] = "https://example.test/webhook";
  const cases = [
    [lead, "/api/leads", "/setores/industria", "seja_cliente", { ...person, razaoSocial: "Empresa", cnpj: "12345678000190" }],
    [investor, "/api/investor-leads", "/investidor", "investidor_apresentacao", { ...person, origem: "solicitar_apresentacao", perfil: "Outro" }],
    [investor, "/api/investor-leads", "/investidor", "investidor_simulador", { ...person, origem: "simulador_investimento", valor: 50000, periodo: "3" }],
    [partner, "/api/partner-leads", "/parceiro-indicador", "parceiro_indicador", { ...person, experiencia: "nao" }],
    [contact, "/api/contacts", "/blog/artigo-teste", "contato_whatsapp", { ...person, empresa: "Empresa" }],
    [career, "/api/careers", "/carreira", "carreira", { ...person, area: "Tecnologia e dados", consentimento: "true" }],
  ];
  const deliveries = [];
  const network = mock.method(globalThis, "fetch", async (_url, options) => {
    deliveries.push(options.body instanceof FormData ? Object.fromEntries(options.body) : JSON.parse(options.body));
    return Response.json({ success: true });
  });
  try {
    for (const [post, endpoint, path, form, body] of cases) {
      let req = request(endpoint, { ...body, formulario: "forged", caminho_origem: "/forged", endpoint_origem: "/forged" }, `${path}?secret=hidden#section`);
      if (post === career) {
        const data = new FormData();
        for (const [key, value] of Object.entries(body)) data.set(key, String(value));
        data.set("curriculo", new File(["%PDF-1.7 sample"], "curriculo.pdf", { type: "application/pdf" }));
        req = new Request(`${base}${endpoint}`, { method: "POST", headers: { "X-Daytrade-Page-Path": path }, body: data });
      }
      const response = await post(req);
      assert.equal(response.status, 200);
      const receipt = await response.json();
      const stored = (await db.query("SELECT data FROM submissions WHERE id=$1", [receipt.id])).rows[0].data;
      const expected = { formulario: form, caminho_origem: path, endpoint_origem: endpoint };
      for (const [key, value] of Object.entries(expected)) assert.equal(stored[key], value);
      assert.equal(await processNextWebhook(), true);
      const delivered = deliveries.at(-1);
      for (const [key, value] of Object.entries(expected)) assert.equal(delivered[key], value);
      if (post === lead) assert.equal(delivered.lead.nome, person.nome);
      if (post === career) assert.ok(delivered.curriculo instanceof File);
    }
    assert.equal(deliveries.length, 6);
  } finally { network.mock.restore(); }
});

test("invalid and foreign page locations fall back to local Referer or known fixed pages", () => {
  for (const value of ["https://evil.test/path", "//evil.test/path", "/\\evil.test/path", "/" + "x".repeat(4100)]) {
    const req = new Request(`${base}/api/contacts`, { headers: { "X-Daytrade-Page-Path": value, Referer: `${base}/sobre-nos?token=private#cta` } });
    assert.equal(submissionSource("contact", {}, req).caminho_origem, "/sobre-nos");
  }
  const foreign = new Request(`${base}/api/partner-leads`, { headers: { Referer: "https://evil.test/page" } });
  assert.equal(submissionSource("partner", {}, foreign).caminho_origem, "/parceiro-indicador");
  assert.equal(submissionSource("contact", {}).caminho_origem, null);
  assert.equal(submissionSource("lead", {}).caminho_origem, null);
});

test("retries preserve the original page and receipt even if attribution changes", async () => {
  const key = randomUUID();
  const body = { ...person, empresa: "Empresa" };
  const first = await (await contact(request("/api/contacts", body, "/sobre-nos", key))).json();
  const second = await (await contact(request("/api/contacts", body, "/", key))).json();
  assert.equal(first.id, second.id);
  const stored = (await db.query("SELECT data FROM submissions WHERE id=$1", [first.id])).rows[0].data;
  assert.equal(stored.caminho_origem, "/sobre-nos");
});

test("the shared browser sender includes the page for both JSON and multipart requests", async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { pathname: "/setores/agronegocio" } } });
  const network = mock.method(globalThis, "fetch", async () => Response.json({ success: true, id: randomUUID() }));
  try {
    await createFormRequest()("/api/leads", person);
    const multipart = new FormData();
    multipart.set("nome", person.nome);
    await createFormRequest()("/api/careers", multipart);
    for (const call of network.mock.calls) assert.equal(call.arguments[1].headers["X-Daytrade-Page-Path"], "/setores/agronegocio");
    assert.equal(network.mock.calls[1].arguments[1].headers["Content-Type"], undefined);
  } finally {
    network.mock.restore();
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
  }
});
