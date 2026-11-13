This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Página do Investidor

A rota `/investidor` adapta a landing page `landpage-investidor` à identidade visual
do projeto, com links no menu e no rodapé, política de investimento, estrutura,
garantias, simulador, FAQ e solicitação de apresentação.

Os formulários enviam JSON para `POST /api/investor-leads`. A rota valida os dados
e preserva os campos e as origens da referência (`simulador_investimento` e
`solicitar_apresentacao`). Por padrão, usa o mesmo webhook de staging da referência;
configure `N8N_INVESTOR_WEBHOOK_URL` para substituir o destino em produção.
Os testes interceptam as chamadas e não enviam dados ao webhook real.

O simulador utiliza as premissas ilustrativas da referência: CDI fixo hipotético
de 11,25% a.a. e fatores de 69%, 100% e 120%, com composição anual, sem impostos
ou taxas. Não consulta taxas atuais. Os dados pessoais não são salvos no navegador.
O resultado e a confirmação de interesse são exibidos após a aceitação do webhook.

### Página de Carreira e envio de currículos

A página `/carreira` está vinculada ao menu e ao rodapé. Seu formulário envia
`multipart/form-data` para `POST /api/careers`, com `nome`, `email`, `telefone`,
`area`, `mensagem` (opcional), `consentimento` e o arquivo `curriculo`.

Configure `N8N_CAREER_WEBHOOK_URL` no servidor com um webhook dedicado ao RH.
Ele recebe esses campos, `origem` e o anexo binário `curriculo`. Configure no n8n
o armazenamento/encaminhamento para o RH e as regras de retenção e acesso aos dados.
Essa rota não reutiliza o webhook comercial de leads nem salva arquivos em `public`.
Sem a variável, retorna 503 e o formulário informa indisponibilidade, sem confirmar envio.

São aceitos PDF, DOC e DOCX de até 5 MB. O servidor limita o corpo da requisição,
valida campos, extensão e assinatura inicial do arquivo. Essa verificação não substitui
antivírus: o fluxo receptor deve inspecionar os anexos antes de abri-los ou distribuí-los.
O webhook tem timeout de 15 segundos e não recebe tentativas automáticas. A confirmação
significa que ele aceitou a requisição; não confirma uma candidatura a vaga específica.
Garanta que a hospedagem aceite uploads multipart desse tamanho ou ajuste o limite.

### Envio do formulário Seja Cliente

Copie `.env.example` para `.env.local` e configure `N8N_LEAD_WEBHOOK_URL`.
No ambiente de hospedagem, configure essa mesma variável e reinicie ou publique novamente a aplicação.
Ela é usada apenas no servidor; não adicione o prefixo `NEXT_PUBLIC_`.

O formulário envia os cinco campos para `POST /api/leads`. Essa rota valida os dados,
remove a formatação de CNPJ e telefone e monta o JSON enviado ao webhook do n8n.
Os valores fixos de empresa (`001`/`Daytrade`), produto (`10`/`Antecipação de Recebíveis`)
e campanha (`1001`/`Google Ads`) ficam em `src/app/api/leads/route.ts`.
A campanha é fixa; não é inferida de parâmetros da URL.

O formulário só confirma o envio após uma resposta HTTP de sucesso do n8n.
Erros de validação, conexão ou do webhook permitem corrigir ou tentar novamente,
mantendo os dados preenchidos. O envio tem limite de espera de 15 segundos e não faz tentativas automáticas.

### Leads2b

O snippet do Leads2b é carregado uma vez no layout global, com a configuração do token
antes do script externo. O formulário possui o ID `seja-cliente` e os campos têm IDs
e rótulos explícitos para a captura pelo snippet. O envio para `/api/leads` e n8n continua ativo.

Na integração de leads do Leads2b, habilite a captura/conversão de formulários para esse token.
Apenas o rastreamento de visitas (`formTracking`) não habilita a captura (`formConversion`).
Se usar uma configuração específica, associe o ID `seja-cliente` à URL publicada do site.
O recebimento no Leads2b deve ser conferido no painel da plataforma; a mensagem de sucesso
do formulário confirma a resposta do n8n.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
