# Site DayTrade

Site institucional, APIs, painel administrativo e blog no mesmo projeto Next.js.

## Recursos

- `/admin`: painel com login, resumo dos cadastros, filtros e status de atendimento.
- Contatos de clientes, investidores, WhatsApp e carreira salvos no SQLite.
- Currículos em armazenamento privado, com download autenticado e limite de 5 MB.
- Blog com categorias, capas existentes, editor de texto, rascunhos e publicação.
- Integração n8n por fila persistente, com até cinco tentativas e revisão pelo painel.
- Docker Compose com um único serviço para aplicação, SQLite e worker na mesma VPS.

## Publicação

Siga [o guia da VPS](docs/vps.md) para configurar `.env`, iniciar o Compose,
criar o primeiro administrador, instalar o proxy HTTPS e fazer backups.
Não há senha padrão nem cadastro público de administradores.

## Desenvolvimento

Requer Node 24 ou superior. Não é necessário instalar um servidor de banco.
Copie `.env.example` para `.env.local` se quiser configurar caminhos ou webhooks.

```sh
npm ci
npm run dev
```

O comando aplica migrações, abre `data/daytrade.sqlite` e inicia Next.js e worker
juntos. Os currículos ficam em `data/private`. Para produção sem Docker, execute
`npm run build` e `npm start`. Na VPS com Docker: `docker compose up -d --build`.

Crie o usuário com `npm run admin:user`, fornecendo `ADMIN_EMAIL` e
`ADMIN_PASSWORD` temporariamente no ambiente do processo. Não coloque senhas no Git.

## Formulários e confirmação

Os formulários confirmam sucesso **depois de persistir os dados**, independentemente
da disponibilidade do n8n. Se o banco falhar, não confirmam o envio. Se houver webhook
configurado no momento do cadastro, uma tarefa de entrega é criada na mesma transação.
A fila e os anexos sobrevivem à atualização da aplicação.

| Rota | Cadastro | Webhook opcional |
| --- | --- | --- |
| `POST /api/leads` | Seja cliente | `N8N_LEAD_WEBHOOK_URL` |
| `POST /api/investor-leads` | Apresentação e simulador | `N8N_INVESTOR_WEBHOOK_URL` |
| `POST /api/careers` | Candidato e currículo | `N8N_CAREER_WEBHOOK_URL` |
| `POST /api/contacts` | Contato antes de abrir o WhatsApp | Sem encaminhamento |

O contrato comercial do n8n mantém `lead` e os metadados definidos no servidor:
empresa `001`/Daytrade, produto `10`/Antecipação de Recebíveis e campanha `1001`/Google Ads.
A campanha continua fixa; não é inferida da URL. Investidores mantêm as origens
`simulador_investimento` e `solicitar_apresentacao`. O destino antigo de staging
não é mais usado automaticamente. RH recebe multipart com os dados e `curriculo`.

As entregas são pelo menos uma vez: deduplique o `Idempotency-Key` no n8n. Configure
os destinos por ambiente e veja o status no detalhe do cadastro no painel.
O cadastro comercial no Leads2b é independente: a confirmação do site corresponde
à gravação no banco, não à captura no painel do Leads2b. O snippet continua ativo
nas páginas públicas em desktop e não é carregado ao abrir `/admin`.

O simulador do Investidor mantém as premissas ilustrativas preexistentes: CDI
hipotético de 11,25% a.a., fatores de 69%, 100% e 120%, composição anual, sem impostos
ou taxas e sem consulta a taxas atuais. Os dados dos formulários são salvos no banco.

## Blog

Crie o conteúdo em `/admin/blog`. Só artigos publicados aparecem na home e nas rotas
`/blog` e `/blog/slug`. Nenhum artigo fictício é publicado automaticamente.
Capas e categorias usam opções predefinidas. O texto aceita parágrafos e subtítulos
com `##`; HTML é exibido como texto. Não há upload de novas capas nesta versão.

## Verificações

```sh
npm test
npm run lint
npm run build
```

Os testes usam arquivos SQLite reais e temporários isolados;
não precisam de banco de produção nem enviam dados reais aos webhooks.
