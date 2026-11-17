# n8n: recepção universal de payloads

O workflow desta primeira etapa recebe um POST, organiza os dados em uma estrutura
comum e confirma o processamento. Não exige um schema de formulário, nomes de
campos, origem ou tipo de cadastro. Não envia dados para outros serviços.

Arquivo para importar: [`n8n/daytrade-recepcao-universal.json`](../n8n/daytrade-recepcao-universal.json).

## Importação e conexão

1. No editor do n8n, escolha **Import from File** e selecione o JSON.
2. Abra **Receber payload**. Para testar, clique em **Listen for test event** e
   copie a **Test URL** exibida pelo próprio n8n.
3. Envie um POST de teste e veja a saída de **Processar payload universal**.
4. Publique/ative o workflow e copie a **Production URL**. O caminho configurado
   é `daytrade/entrada`; use a URL completa mostrada na sua instância.
5. Configure essa mesma Production URL nas variáveis desejadas do servidor:

```dotenv
N8N_LEAD_WEBHOOK_URL=https://SEU-N8N/webhook/daytrade/entrada
N8N_INVESTOR_WEBHOOK_URL=https://SEU-N8N/webhook/daytrade/entrada
N8N_PARTNER_WEBHOOK_URL=https://SEU-N8N/webhook/daytrade/entrada
N8N_CONTACT_WEBHOOK_URL=https://SEU-N8N/webhook/daytrade/entrada
N8N_CAREER_WEBHOOK_URL=https://SEU-N8N/webhook/daytrade/entrada
```

Reinicie a aplicação/worker após configurar o ambiente. O site só enfileira envios
novos quando o destino está configurado; isso não reenfileira cadastros antigos.
O arquivo importado fica inicialmente inativo e usa somente nós nativos: Webhook
2.1, Code 2 e Respond to Webhook 1.4. Não requer community nodes ou APIs externas.
O Webhook está sem autenticação, compatível com o emissor atual da plataforma.

## O que significa universal nesta etapa

A organização independe da estrutura dos campos. Isso não significa interpretar
semanticamente todo formato de arquivo possível.

| Entrada | Processamento |
| --- | --- |
| JSON com objeto, array, string, número, booleano ou `null` | Mantém estrutura e tipos; indexa os campos |
| JSON em texto ou com MIME `+json` | Tenta decodificar como JSON |
| `application/x-www-form-urlencoded` | Mantém campos, incluindo chaves repetidas |
| `multipart/form-data` | Mantém campos e todos os anexos, independentemente dos nomes |
| XML | Usa a estrutura que o próprio n8n interpretou e preserva os bytes originais |
| Texto, CSV e outros formatos `text/*` | Preserva como texto; não pressupõe colunas ou separadores |
| Arquivo binário ou formato opaco | Mantém o arquivo no binário, sem conversão destrutiva |
| Corpo vazio | Gera envelope com `dados: null`, preservando query e parâmetros |

Campos multipart continuam strings: `"false"`, `"001"` e `"50000"` não são
convertidos automaticamente. Arrays permanecem um único evento, com índices nos
caminhos; não são divididos nem fundidos em um contato. Estruturas desconhecidas
continuam disponíveis em `dados`, mesmo sem nenhuma sugestão de campo reconhecido.

## Identificação dos formulários da plataforma

Cada novo cadastro recebe três campos no nível principal do payload:

```json
{
  "formulario": "parceiro_indicador",
  "caminho_origem": "/parceiro-indicador",
  "endpoint_origem": "/api/partner-leads"
}
```

| Formulário | `formulario` | `endpoint_origem` |
| --- | --- | --- |
| Seja cliente | `seja_cliente` | `/api/leads` |
| Investidor: simulador | `investidor_simulador` | `/api/investor-leads` |
| Investidor: apresentação | `investidor_apresentacao` | `/api/investor-leads` |
| Parceiro Indicador | `parceiro_indicador` | `/api/partner-leads` |
| Contato WhatsApp | `contato_whatsapp` | `/api/contacts` |
| Carreira | `carreira` | `/api/careers` |

O servidor define o identificador do formulário e o endpoint. O cliente HTTP comum
informa o pathname da página em `X-Daytrade-Page-Path`; o servidor valida o caminho
local e descarta query e fragmento. Assim, os modais de cliente e WhatsApp registram
a página em que foram enviados, inclusive em páginas internas. Essa informação é
atribuição informada pelo navegador, não uma garantia de autenticidade da origem.

Sem o header, o servidor tenta um `Referer` da mesma origem e depois usa o caminho
fixo da página, quando existe. Para modais compartilhados, a ausência de origem
resulta em `caminho_origem: null`, em vez de presumir a home. Cadastros anteriores
permanecem com os dados originalmente salvos; retries mantêm a origem do primeiro
envio. O campo anterior `origem` permanece com seu significado atual.

No n8n, os campos ficam em `dados.formulario`, `dados.caminho_origem` e
`dados.endpoint_origem` após o processamento. Para RH, são campos multipart junto
do currículo. O workflow universal existente já recebe esses campos adicionais;
não é necessário reimportá-lo.

## Saída interna

- `versao`: versão do envelope, inicialmente `1`.
- `recebimento`: ID, execução, instante UTC, MIME, formato e chave de idempotência.
- `dados`: payload interpretado, com seus nomes e tipos preservados.
- `campos`: índice com `caminho`, `chave`, `tipo` e `valor`. Os caminhos usam
  JSON Pointer: `/lead/nome`, `/clientes/0/email`; raiz é `""`.
- `identificados`: sugestões opcionais de nome, e-mail, telefone, documento,
  empresa e origem, reconhecidas pelo nome da chave. Cada sugestão inclui seu
  caminho; não valida identidade nem vincula pessoas de registros diferentes.
- `arquivos`: metadados dos binários e seu papel: `corpo_original` ou `anexo`.
- `contexto`: headers, query, parâmetros e contexto de execução do Webhook.
- `avisos`: situações em que a interpretação ou o índice foram limitados.
- `resposta`: confirmação HTTP, sem ecoar os dados pessoais do payload.

Os binários continuam em `item.binary`, sob suas chaves originais. Com **Raw Body**
ligado, corpos não multipart ficam também em `binary.data`. Isso preserva o
conteúdo antes de transformações do parser, inclusive do XML. No multipart, um
arquivo cujo campo se chame `data` continua classificado como anexo.

Novos currículos mantêm o nome original do arquivo, incluindo espaços, acentos e
a extensão, desde o upload até o envio multipart ao n8n e em eventuais tentativas
de reenvio. O nome aparece em `arquivos[].nome` e no `fileName` do binário. O
armazenamento privado usa um identificador interno separado. Para anexos antigos
cujo nome já foi substituído por `curriculo.pdf`, `curriculo.doc` ou `curriculo.docx`,
o nome anterior não pode ser recuperado automaticamente.

Uma resposta de sucesso tem esta forma:

```json
{
  "success": true,
  "id": "chave-recebida-ou-n8n:123",
  "executionId": "123",
  "formato": "json",
  "totalCampos": 5,
  "totalAnexos": 0
}
```

HTTP 200 sai somente depois do nó de processamento. Uma falha inesperada antes
da resposta falha a execução; não habilite `Continue On Fail` nesse nó.

## Limites e continuidade

O workflow não deduplica: preserva `Idempotency-Key` quando recebido, sem exigir
UUID. Sem chave, usa o ID da execução. A plataforma entrega pelo menos uma vez;
uma nova tentativa pode gerar outra execução. Antes de acrescentar ações externas,
a etapa seguinte deverá deduplicar de forma persistente e atômica.

Os dados ficam no histórico de execuções, conforme a retenção e o armazenamento
binário da instância. Esse histórico não substitui uma base permanente de entrada.
O workflow solicita salvar execuções de sucesso e erro para esta fase de inspeção.

Os limites de tamanho, sintaxe e charset do Webhook/proxy continuam valendo. Por
exemplo, o n8n pode rejeitar JSON/XML malformado antes de executar o nó Code.
O parser nativo de formulário também possui limites próprios. Bytes recebidos pelo
nó Code são preservados; nenhum workflow pode recuperar dados rejeitados antes dele.
Texto bruto é decodificado em UTF-8, UTF-16LE, Latin-1 ou ASCII; outros charsets
ficam preservados no binário com um aviso. Formatos opacos exigirão um parser
específico se uma próxima etapa precisar interpretar seu conteúdo.

O índice tem limite de 10.000 campos e 64 níveis, com aviso explícito quando
atingido. Esses limites não removem informações de `dados` ou `binary`.
O endpoint recebe POST; negociações de assinatura, desafios de verificação e
outros protocolos específicos ainda não fazem parte desta etapa.

## Manutenção e verificação local

O código-fonte do processamento fica em [`n8n/process-webhook.mjs`](../n8n/process-webhook.mjs).
Depois de editar, regenere o JSON e execute os testes:

```sh
node scripts/build-n8n-workflow.mjs
node --test tests/n8n-workflow.test.mjs
```

Os testes executam o código embarcado no JSON com as interfaces de entrada e
binários do n8n simuladas. Também passam os cinco destinos atuais pelo worker real,
com banco temporário e transporte HTTP simulado, incluindo currículo multipart.
Não substituem a importação e um teste HTTP na versão instalada da sua instância.

Referências oficiais: [Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/),
[Respond to Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)
e [leitura de binários](https://docs.n8n.io/code/cookbook/code-node/get-binary-data-buffer/).
