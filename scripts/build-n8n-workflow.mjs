import { writeFile } from "node:fs/promises";
import { processWebhook } from "../n8n/process-webhook.mjs";

const code = `const processWebhook = ${processWebhook.toString()};
const items = $input.all();
const result = [];
for (let index = 0; index < items.length; index++) {
  const item = await processWebhook(items[index], {
    executionId: $execution.id,
    receivedAt: new Date().toISOString(),
    readBinary: (key) => this.helpers.getBinaryDataBuffer(index, key),
  });
  item.pairedItem = { item: index };
  result.push(item);
}
return result;`;

const workflow = {
  name: "Daytrade | Recepção universal de payloads",
  active: false,
  nodes: [
    {
      id: "45c576c6-3b89-4d18-b71e-a85d97665811",
      name: "Receber payload",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2.1,
      position: [0, 0],
      webhookId: "1a725ef3-9b9a-428c-a8d8-f305b88f0b92",
      parameters: { httpMethod: "POST", path: "daytrade/entrada", authentication: "none", responseMode: "responseNode", options: { rawBody: true } },
    },
    {
      id: "a0c809b6-98f6-4c25-8417-134a7dab417e",
      name: "Processar payload universal",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [300, 0],
      parameters: { mode: "runOnceForAllItems", language: "javaScript", jsCode: code },
    },
    {
      id: "22c3ef83-3559-47e1-adc5-458238f82906",
      name: "Confirmar processamento",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.4,
      position: [620, 0],
      parameters: { respondWith: "json", responseBody: "={{ $json.resposta }}", options: { responseCode: 200, responseHeaders: { entries: [{ name: "Cache-Control", value: "no-store" }] } } },
    },
    {
      id: "71c587c8-6388-4797-a137-fcfb36d99a65",
      name: "Sobre esta etapa",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: [-40, -280],
      parameters: { width: 940, height: 220, content: "## Entrada universal — etapa 1\nPOST /daytrade/entrada → organizar dados → confirmar HTTP 200.\n\nSem schema obrigatório. Preserva dados, query, parâmetros e binários; gera índice de campos e sugestões por nome de chave. Formatos opacos continuam disponíveis no original.\n\nAs cinco variáveis N8N_*_WEBHOOK_URL podem apontar para a mesma Production URL. Não deduplica nem envia para outros serviços. Ver docs/n8n.md para importação, contrato e limites." },
    },
  ],
  connections: {
    "Receber payload": { main: [[{ node: "Processar payload universal", type: "main", index: 0 }]] },
    "Processar payload universal": { main: [[{ node: "Confirmar processamento", type: "main", index: 0 }]] },
  },
  settings: { executionOrder: "v1", timezone: "America/Sao_Paulo", saveDataSuccessExecution: "all", saveDataErrorExecution: "all" },
  pinData: {},
  tags: [],
};

await writeFile(new URL("../n8n/daytrade-recepcao-universal.json", import.meta.url), `${JSON.stringify(workflow, null, 2)}\n`);
