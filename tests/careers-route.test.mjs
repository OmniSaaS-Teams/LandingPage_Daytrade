import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { POST } from "../src/app/api/careers/route.ts";

const original = process.env.N8N_CAREER_WEBHOOK_URL;
function request(overrides = {}, file = new File(["%PDF-1.7\nexample"], "meu-curriculo.pdf", { type: "application/pdf" })) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ nome: " Maria Silva ", email: "maria@example.test", telefone: "(15) 99999-9999", area: "Tecnologia e dados", mensagem: "Minha trajetória", consentimento: "true", ...overrides })) data.set(key, value);
  if (file) data.set("curriculo", file);
  return new Request("http://localhost/api/careers", { method: "POST", body: data });
}
beforeEach(() => {
  process.env.N8N_CAREER_WEBHOOK_URL = "https://rh.example.test/webhook";
  mock.method(globalThis, "fetch", async () => new Response(null, { status: 204 }));
});
afterEach(() => {
  mock.restoreAll();
  if (original === undefined) delete process.env.N8N_CAREER_WEBHOOK_URL;
  else process.env.N8N_CAREER_WEBHOOK_URL = original;
});

test("forwards normalized candidate data and the attachment as multipart", async () => {
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, "https://rh.example.test/webhook");
  assert.equal(options.body.get("nome"), "Maria Silva");
  assert.equal(options.body.get("telefone"), "15999999999");
  assert.equal(options.body.get("consentimento"), "true");
  assert.equal(options.body.get("curriculo").name, "curriculo.pdf");
  assert.equal(await options.body.get("curriculo").text(), "%PDF-1.7\nexample");
  assert.equal(options.redirect, "error");
  assert.ok(options.signal instanceof AbortSignal);
});
test("rejects invalid candidate fields and missing consent before forwarding", async () => {
  for (const data of [{ nome: "" }, { email: "invalid" }, { telefone: "abc" }, { area: "unknown" }, { mensagem: "x".repeat(2001) }, { consentimento: "false" }]) assert.equal((await POST(request(data))).status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});
test("rejects missing files, disguised extensions, and oversized attachments", async () => {
  assert.equal((await POST(request({}, null))).status, 400);
  assert.equal((await POST(request({}, new File(["not a PDF"], "fake.pdf")))).status, 400);
  assert.equal((await POST(request({}, new File(["%PDF-1.7"], "file.exe")))).status, 400);
  assert.equal((await POST(request({}, new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.pdf")))).status, 413);
  assert.equal(fetch.mock.callCount(), 0);
});
test("limits streamed bodies even without a Content-Length header", async () => {
  const input = new Request("http://localhost/api/careers", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=test" }, body: new Uint8Array(6 * 1024 * 1024) });
  assert.equal((await POST(input)).status, 413);
  assert.equal(fetch.mock.callCount(), 0);
});
test("rejects unsupported content types and malformed multipart", async () => {
  assert.equal((await POST(new Request("http://localhost/api/careers", { method: "POST", body: "{}" }))).status, 400);
  assert.equal((await POST(new Request("http://localhost/api/careers", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=test" }, body: "invalid" }))).status, 400);
});
test("never reports success when the destination is missing or fails", async () => {
  delete process.env.N8N_CAREER_WEBHOOK_URL;
  assert.equal((await POST(request())).status, 503);
  assert.equal(fetch.mock.callCount(), 0);
  process.env.N8N_CAREER_WEBHOOK_URL = "https://rh.example.test/webhook";
  fetch.mock.mockImplementation(async () => new Response("private information", { status: 500 }));
  const response = await POST(request());
  assert.equal(response.status, 502);
  assert.ok(!JSON.stringify(await response.json()).includes("private information"));
  fetch.mock.mockImplementation(async () => { throw new DOMException("timed out", "TimeoutError"); });
  assert.equal((await POST(request())).status, 502);
  assert.equal(fetch.mock.callCount(), 2);
});
