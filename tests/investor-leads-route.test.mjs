import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { POST } from "../src/app/api/investor-leads/route.ts";

const originalWebhook = process.env.N8N_INVESTOR_WEBHOOK_URL;
const presentation = {
  nome: " Maria Silva ", email: " maria@example.com ",
  perfil: "Investidor pessoa física", origem: "solicitar_apresentacao",
  pagina_origem: "http://localhost/investidor",
};
const simulation = {
  nome: "Maria Silva", email: "maria@example.com", telefone: "(15) 99999-9999",
  valor: 50000, periodo: "3", origem: "simulador_investimento",
  pagina_origem: "http://localhost/investidor",
};
const request = (body) => new Request("http://localhost/api/investor-leads", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

beforeEach(() => {
  process.env.N8N_INVESTOR_WEBHOOK_URL = "https://n8n.example.test/investidor";
  mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
});
afterEach(() => {
  mock.restoreAll();
  if (originalWebhook === undefined) delete process.env.N8N_INVESTOR_WEBHOOK_URL;
  else process.env.N8N_INVESTOR_WEBHOOK_URL = originalWebhook;
});

test("forwards the presentation fields without unrelated fields", async () => {
  const response = await POST(request({ ...presentation, razaoSocial: "ignore", webhook: "ignore" }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, process.env.N8N_INVESTOR_WEBHOOK_URL);
  assert.equal(options.redirect, "error");
  assert.deepEqual(JSON.parse(options.body), { ...presentation, nome: "Maria Silva", email: "maria@example.com" });
});

test("preserves the simulation webhook contract and normalizes phone", async () => {
  assert.equal((await POST(request(simulation))).status, 200);
  const payload = JSON.parse(fetch.mock.calls[0].arguments[1].body);
  assert.deepEqual(payload, { ...simulation, telefone: "15999999999" });
});

test("rejects invalid fields, origin, amount and period without forwarding", async () => {
  for (const body of [null, [], {}, { ...presentation, nome: " " }, { ...presentation, email: "bad" },
    { ...presentation, perfil: "unknown" }, { ...presentation, origem: "unknown" },
    { ...simulation, telefone: "abc15999999999" }, { ...simulation, valor: 49999 },
    { ...simulation, valor: "50000" }, { ...simulation, valor: 1e12 },
    { ...simulation, periodo: "2" }, { ...simulation, periodo: 3 }]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("does not confirm delivery when the upstream rejects or times out", async () => {
  fetch.mock.mockImplementation(async () => new Response(null, { status: 500 }));
  let response = await POST(request(presentation));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, undefined);
  fetch.mock.mockImplementation(async () => { throw new Error("timeout"); });
  response = await POST(request(simulation));
  assert.equal(response.status, 502);
});

test("rejects malformed JSON", async () => {
  const response = await POST(new Request("http://localhost/api/investor-leads", { method: "POST", body: "{" }));
  assert.equal(response.status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});
