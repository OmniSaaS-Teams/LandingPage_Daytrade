# Publicação na VPS com SQLite

## Um projeto e um serviço

Site, APIs, painel e blog rodam no Next.js. O SQLite é um arquivo no mesmo servidor,
sem serviço de banco separado. A inicialização aplica as migrações antes de iniciar
Next.js e o worker do n8n. Um supervisor encerra ambos se um falhar; o Docker reinicia
o serviço. No desenvolvimento, `npm run dev` também inicia tudo junto.

Requer Node 24 ou superior. A imagem Docker já contém SQLite no Node; não é
necessário instalar PostgreSQL, SQLite ou drivers nativos separadamente.

## Primeira publicação

Copie `.env.example` para `.env`. Configure apenas os webhooks desejados; os demais
podem ficar vazios. Não há senha padrão nem cadastro público de administradores.
Não grave `ADMIN_PASSWORD` no arquivo permanente ou no Git.

```sh
chmod 600 .env
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 app
```

O único serviço `app` usa um volume persistente em `/app/data`, contendo:

- `daytrade.sqlite`: contatos, sessões, blog e fila de encaminhamentos.
- `daytrade.sqlite-wal` e `-shm`: arquivos auxiliares do SQLite/WAL.
- `private/`: currículos, fora da pasta pública.

A porta no host é `127.0.0.1:3000`. Adapte `deploy/nginx.conf.example` ao domínio e
certificado HTTPS. Preserve Host, X-Forwarded-Host e X-Forwarded-Proto para cookies
e formulários administrativos. O proxy admite 6 MB para currículos de até 5 MB.

## Criar ou redefinir administrador

No Bash da VPS, leia a senha sem exibi-la ou gravá-la no histórico:

```sh
read -r -p 'E-mail do administrador: ' ADMIN_EMAIL
read -r -s -p 'Senha (mínimo 12 caracteres): ' ADMIN_PASSWORD
printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD
docker compose run --rm --no-deps -e ADMIN_EMAIL -e ADMIN_PASSWORD app node scripts/admin-user.mjs
unset ADMIN_PASSWORD ADMIN_EMAIL
```

Acesse `https://SEU-DOMINIO/admin`. O comando também redefine senhas e revoga sessões
anteriores desse administrador. Sessões duram 8 horas, com cookie HttpOnly,
SameSite=Lax e Secure em produção. O login tem limite de tentativas.

## Sem Docker e desenvolvimento

Com Node 24+, configure `.env.local` a partir de `.env.example`:

```sh
npm ci
npm run dev
```

O comando prepara o banco e inicia aplicação e worker. Para produção sem Docker,
rode `npm run build` e `npm start`, usando seu gerenciador de processos na raiz do
projeto. Para criar o administrador, forneça ADMIN_EMAIL e ADMIN_PASSWORD no ambiente
temporário e execute `npm run admin:user`.

Os padrões são `DATABASE_FILE=./data/daytrade.sqlite` e `UPLOAD_DIR=./data/private`.
Não há mais DATABASE_URL, POSTGRES_PASSWORD, DB_POOL_MAX ou `npm run dev:db`.
`npm run db:migrate` e `npm run worker` continuam disponíveis para manutenção;
não precisam ser iniciados separadamente no uso normal.

## Persistência e migrações

Use disco local da VPS; não use NFS ou banco compartilhado entre servidores. SQLite
usa WAL, chaves estrangeiras, sincronização FULL e espera de 5 segundos por escrita.
Transações assíncronas são serializadas por processo. Os bloqueios do SQLite
coordenam a aplicação e o worker. A fila reserva tarefas atomicamente, com lease
para recuperação após reinício.

Essa configuração atende uma instância no mesmo servidor. Para múltiplas VPS ou
alta concorrência de escrita, reavalie um banco servidor.

As migrações SQL em `db/migrations/` são transacionais e verificadas por checksum.
Não edite uma migração já aplicada; crie um novo arquivo numerado. Dados de um
PostgreSQL anterior não são importados automaticamente. Caso existam dados reais,
preserve o backup e planeje a importação antes de substituir a produção. Os arquivos
e volumes anteriores não são removidos por esta alteração.

## Formulários, currículos e blog

Os formulários confirmam sucesso após gravar no SQLite. Quando há webhook configurado,
a tarefa é criada na mesma transação. Ausência de webhook não impede o cadastro;
falha de gravação retorna 503. Há limite de cinco envios por identidade em dez minutos.

O worker tenta entregar ao n8n até cinco vezes, com espera crescente e timeout de
15 segundos. O painel permite revisar e reenfileirar falhas. Deduplique o cabeçalho
Idempotency-Key no receptor: a entrega é pelo menos uma vez e pode se repetir se a
resposta se perder. Ativar um webhook não reenfileira os cadastros antigos.
O webhook de staging de investidores não é mais usado como destino automático.
O contato do WhatsApp é salvo antes de abrir a conversa.

Currículos PDF/DOC/DOCX de até 5 MB têm extensão e assinatura inicial verificadas;
isso não substitui antivírus. O download exige login e `data` não deve ser servido
publicamente. Defina inspeção, acesso e retenção conforme a política da organização.
A exclusão local não apaga cópias já entregues ao n8n ou em backups.

O blog permite criar, editar, publicar, retirar de publicação e excluir artigos.
Somente publicados aparecem na home e em `/blog`. Categorias e capas são opções
predefinidas do projeto. O editor aceita texto, parágrafos e subtítulos com `##`;
HTML não é executado. Não há upload de capas nem publicação automática de exemplos.
Leads2b permanece independente dos cadastros e não carrega ao abrir o painel.

## Atualização e backup

Antes de atualizar, execute `sh scripts/backup.sh`. Ele para o serviço completo,
compacta banco, WAL e currículos no mesmo ponto e reinicia. Guarde uma cópia externa.
Não copie somente o arquivo principal enquanto houver processos escrevendo no WAL.

```sh
git pull --ff-only
docker compose up -d --build
```

Não use `docker compose down -v` sem um plano de exclusão: isso remove o volume.
Para restaurar em um volume novo e isolado, configure `.env`, construa a imagem
e extraia o backup antes de iniciar:

```sh
docker compose build
docker compose run --rm --no-deps -T --entrypoint tar app -xzf - -C /app/data < backups/DATA/daytrade.tar.gz
docker compose up -d
```

Não sobreponha uma base em uso. Preserve banco e arquivos auxiliares juntos, com a
aplicação parada. O volume deve ser legível e gravável pelo usuário node (UID 1000).
Teste login, consulta, download e artigos após restaurar. Sessões também voltam no
backup; redefina a senha para revogá-las, se necessário. Agende e teste seus backups.

## Verificações

`npm test` usa arquivos SQLite temporários reais, sem banco externo ou webhooks de
produção. Execute também `npm run lint` e `npm run build`. A rota `/api/health`
retorna 200 quando o banco com as migrações está disponível.
