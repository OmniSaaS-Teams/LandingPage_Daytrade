import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test, mock } from "node:test";
import { processWebhook } from "../n8n/process-webhook.mjs";
import { databaseFixture } from "./helpers/database.mjs";
import { captureSubmission } from "../src/lib/submissions.ts";
import { processNextWebhook } from "../src/lib/webhooks.ts";
import { db } from "../src/lib/db.ts";

databaseFixture();
const workflow = JSON.parse(await readFile(new URL("../n8n/daytrade-recepcao-universal.json", import.meta.url), "utf8"));
const code = workflow.nodes.find((node) => node.type === "n8n-nodes-base.code").parameters.jsCode;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const execute = new AsyncFunction("$input", "$execution", code);
async function run(item, bytes) {
  return (await execute.call({ helpers: { getBinaryDataBuffer: async (_index, key) => {
    assert.equal(key, "data");
    assert.ok(bytes, "unexpected binary read");
    return bytes;
  } } }, { all: () => [item] }, { id: "test-123" }))[0];
}
function raw(bytes, mime, body) {
  return {
    json: { headers: mime ? { "content-type": mime } : {}, ...(body === undefined ? {} : { body }) },
    binary: { data: { data: bytes.toString("base64"), mimeType: mime || "application/octet-stream" } },
  };
}

test("export embeds current source and responds only after processing", () => {
  assert.ok(code.includes(processWebhook.toString()), "Run node scripts/build-n8n-workflow.mjs after editing the processor");
  assert.equal(workflow.active, false);
  const webhook = workflow.nodes.find((node) => node.type === "n8n-nodes-base.webhook");
  assert.equal(webhook.parameters.responseMode, "responseNode");
  assert.equal(webhook.parameters.options.rawBody, true);
  assert.equal(workflow.connections[webhook.name].main[0][0].node, "Processar payload universal");
  assert.equal(workflow.connections["Processar payload universal"].main[0][0].node, "Confirmar processamento");
  const response = workflow.nodes.find((node) => node.type === "n8n-nodes-base.respondToWebhook");
  assert.equal(response.parameters.responseBody, "={{ $json.resposta }}");
  assert.equal(response.parameters.options.responseCode, 200);
});

test("arbitrary nested schemas keep original types, empty values and unambiguous paths", async () => {
  const payload = { "a.b": 0, "a/b": false, "~": null, a: { b: "" }, list: [{ EMAIL: "User@Example.test" }, [], {}], "__proto__": "literal" };
  const item = { json: { body: payload, query: { campaign: "x" }, params: { source: "any" }, headers: { "Idempotency-Key": "external-key-7" } } };
  const result = await run(item);
  assert.deepEqual(result.json.dados, payload);
  assert.deepEqual(result.json.campos.map((field) => field.caminho), ["/a.b", "/a~1b", "/~0", "/a/b", "/list/0/EMAIL", "/list/1", "/list/2"]);
  assert.deepEqual(result.json.identificados.email, [{ caminho: "/list/0/EMAIL", valor: "User@Example.test" }]);
  assert.equal(result.json.recebimento.id, "external-key-7");
  assert.deepEqual(result.json.contexto.query, item.json.query);
  assert.deepEqual(result.json.contexto.params, item.json.params);
  assert.equal(result.json.resposta.success, true);
  assert.equal(JSON.stringify(result.json.resposta).includes("User@"), false);
});

test("JSON arrays, scalars, null and missing fields require no business schema", async () => {
  for (const value of [[{ custom: 1 }, { other: false }], "hello", 0, false, null, {}, []]) {
    const bytes = Buffer.from(JSON.stringify(value));
    const item = raw(bytes, "application/vnd.anything+json");
    const result = await run(item, bytes);
    assert.deepEqual(result.json.dados, value);
    assert.equal(result.json.recebimento.formato, "json");
    assert.deepEqual(result.binary, item.binary);
  }
});

test("JSON sent as plain text or without a content type is detected without changing values", async () => {
  const bytes = Buffer.from('\uFEFF{"custom":{"value":0}}');
  for (const mime of ["text/plain", undefined, "application/octet-stream"]) {
    const result = await run(raw(bytes, mime), bytes);
    assert.deepEqual(result.json.dados, { custom: { value: 0 } });
    assert.equal(result.json.recebimento.formato, "json");
  }
});

test("plain text, CSV and unfamiliar textual formats remain intact", async () => {
  for (const [mime, value] of [["text/plain", "Olá\nlinha 2"], ["text/csv", 'nome;valor\n"A;B";10'], ["text/x-custom", "alpha=bravo"]]) {
    const bytes = Buffer.from(value);
    const result = await run(raw(bytes, mime), bytes);
    assert.equal(result.json.dados, value);
    assert.equal(result.json.recebimento.formato, "texto");
    assert.equal(result.json.arquivos[0].papel, "corpo_original");
  }
});

test("malformed JSON reaching the Code node is retained and flagged", async () => {
  const bytes = Buffer.from('{"incomplete":');
  const result = await run(raw(bytes, "application/json"), bytes);
  assert.equal(result.json.dados, bytes.toString());
  assert.equal(result.json.avisos.length, 1);
  assert.ok(result.binary.data);
});

test("form-urlencoded keeps duplicate and unusual keys without prototype mutation", async () => {
  const bytes = Buffer.from("email=a%40example.test&tag=one&tag=two&name=Ana+Maria&__proto__=literal&empty=&bad=%ZZ");
  const result = await run(raw(bytes, "application/x-www-form-urlencoded"), bytes);
  assert.deepEqual(result.json.dados.tag, ["one", "two"]);
  assert.equal(result.json.dados.email, "a@example.test");
  assert.equal(result.json.dados.name, "Ana Maria");
  assert.equal(result.json.dados.__proto__, "literal");
  assert.equal(result.json.dados.empty, "");
  assert.equal(result.json.dados.bad, "%ZZ");
  assert.equal(Object.getPrototypeOf(result.json.dados), Object.prototype);
  assert.ok(result.json.avisos.length);
});

test("XML uses n8n's parsed structure and preserves original XML bytes", async () => {
  const bytes = Buffer.from('<event code="1"><custom>Olá</custom></event>');
  const parsed = { event: { $: { code: "1" }, custom: "Olá" } };
  const result = await run(raw(bytes, "application/xml", parsed), bytes);
  assert.deepEqual(result.json.dados, parsed);
  assert.equal(result.json.recebimento.formato, "xml");
  assert.ok(result.binary.data);
});

test("multipart accepts arbitrary file fields, multiple files and a file named data", async () => {
  const item = { json: { headers: { "content-type": "multipart/form-data; boundary=test" }, body: { arbitrary: "true", empty: "" } }, binary: {
    data: { data: "filesystem-v2", fileName: "photo.png", mimeType: "image/png" },
    invoice0: { data: "opaque-reference", fileName: "invoice.pdf", mimeType: "application/pdf" },
  } };
  const result = await run(item);
  assert.deepEqual(result.json.dados, item.json.body);
  assert.deepEqual(result.binary, item.binary);
  assert.equal(result.json.arquivos.every((file) => file.papel === "anexo"), true);
  assert.equal(result.json.resposta.totalAnexos, 2);
});

test("opaque binary data is never converted to text or discarded", async () => {
  const bytes = Buffer.from([0, 255, 16, 254, 0]);
  for (const mime of ["application/octet-stream", "application/x-protobuf"]) {
    const item = raw(bytes, mime);
    const result = await run(item, bytes);
    assert.equal(result.json.recebimento.formato, "binario");
    assert.equal(result.json.dados, null);
    assert.deepEqual(result.binary, item.binary);
  }
});

test("unknown character encodings and empty requests retain a valid envelope", async () => {
  const bytes = Buffer.from("opaque");
  const result = await run(raw(bytes, "text/plain; charset=unknown"), bytes);
  assert.ok(result.json.avisos.length);
  assert.ok(result.binary.data);
  const empty = await run({ json: { headers: {}, query: { token: "sample" } } });
  assert.equal(empty.json.recebimento.formato, "vazio");
  assert.deepEqual(empty.json.contexto.query, { token: "sample" });
  assert.equal(empty.json.recebimento.id, "n8n:test-123");
  const zeroBytes = Buffer.alloc(0);
  const emptyRaw = await run(raw(zeroBytes, "text/plain"), zeroBytes);
  assert.equal(emptyRaw.json.recebimento.formato, "vazio");
  assert.equal(emptyRaw.json.dados, null);
  assert.ok(emptyRaw.binary.data);
});

test("index bounds do not truncate the stored payload", async () => {
  const value = Array.from({ length: 10005 }, (_, index) => ({ value: index }));
  const result = await run({ json: { body: value } });
  assert.equal(result.json.dados.length, 10005);
  assert.equal(result.json.campos.length, 10000);
  assert.ok(result.json.avisos.length);
  let deep = "original";
  for (let index = 0; index < 80; index++) deep = { child: deep };
  const nested = await run({ json: { body: deep } });
  assert.deepEqual(nested.json.dados, deep);
  assert.ok(nested.json.avisos.length);
});

test("a failure reading the original body propagates instead of acknowledging success", async () => {
  const bytes = Buffer.from("hello");
  await assert.rejects(() => processWebhook(raw(bytes, "text/plain"), {
    executionId: "123", receivedAt: new Date().toISOString(), readBinary: async () => { throw new Error("unavailable"); },
  }), /unavailable/);
});

test("all current platform destinations can use the same universal workflow", async () => {
  const url = "https://example.test/webhook/daytrade/entrada";
  for (const kind of ["LEAD", "INVESTOR", "PARTNER", "CONTACT", "CAREER"]) process.env[`N8N_${kind}_WEBHOOK_URL`] = url;
  const processed = [];
  const network = mock.method(globalThis, "fetch", async (destination, options) => {
    assert.equal(destination, url);
    const request = new Request(destination, options);
    const headers = Object.fromEntries(request.headers);
    let item;
    let bytes;
    if (request.headers.get("content-type").startsWith("multipart/")) {
      const form = await request.formData();
      const body = {};
      const binary = {};
      for (const [key, value] of form) {
        if (typeof value === "string") body[key] = value;
        else binary[key] = { data: Buffer.from(await value.arrayBuffer()).toString("base64"), mimeType: value.type, fileName: value.name };
      }
      item = { json: { headers, body }, binary };
    } else {
      bytes = Buffer.from(await request.arrayBuffer());
      item = raw(bytes, headers["content-type"], JSON.parse(bytes.toString()));
      item.json.headers = headers;
    }
    const result = await run(item, bytes);
    processed.push(result);
    return Response.json(result.json.resposta);
  });
  try {
    const submissions = [
      ["lead", { nome: "Lead", cnpj: "ABC12345678912", email: "lead@example.test", idEmpresa: "001" }],
      ["investor", { nome: "Investor", origem: "solicitar_apresentacao", perfil: "Outro" }],
      ["partner", { nome: "Partner", experienciaFIDCs: false }],
      ["contact", { nome: "Contact", origem: "Contato WhatsApp" }],
      ["career", { nome: "Career", consentimento: true }, new File(["%PDF-1.7 sample"], "curriculo.pdf", { type: "application/pdf" })],
    ];
    for (const [kind, body, file] of submissions) {
      const response = await captureSubmission(kind, body, file);
      const receipt = await response.json();
      assert.equal(response.status, 200);
      assert.equal(await processNextWebhook(), true);
      assert.equal(processed.at(-1).json.recebimento.id, receipt.id);
    }
    assert.equal(processed.length, 5);
    assert.equal(processed[0].json.dados.lead.cnpj, "ABC12345678912");
    assert.equal(processed[2].json.dados.experienciaFIDCs, false);
    assert.equal(processed[4].json.dados.consentimento, "true");
    assert.ok(processed[4].binary.curriculo);
    assert.equal((await db.query("SELECT * FROM webhook_jobs WHERE status='sent'")).rows.length, 5);
  } finally { network.mock.restore(); }
});
