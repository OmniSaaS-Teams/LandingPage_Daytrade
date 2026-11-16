# Instagram na home

A home mostra até cinco publicações mais recentes de @daytradesa. O worker do projeto consulta a API oficial a cada 15 minutos e mantém o resultado no SQLite. Não é necessário iniciar outro serviço. Imagens e miniaturas são servidas pelo CDN da Meta; cada card abre a publicação original.

## Configuração na VPS

1. Use uma conta profissional (Business ou Creator) e um aplicativo Meta com Instagram API com Instagram Login. Autorize a permissão `instagram_business_basic` para a conta @daytradesa. Para contas fora dos papéis de teste do aplicativo, cumpra os requisitos de publicação e revisão da Meta.
2. Gere um token da conta no painel Meta. Siga a documentação oficial: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/get-started
3. Defina no `.env.local` (ou ambiente/arquivo usado pelo serviço na VPS):

```dotenv
INSTAGRAM_USERNAME=daytradesa
INSTAGRAM_ACCESS_TOKEN=token_obtido_na_meta
INSTAGRAM_USER_ID=
INSTAGRAM_GRAPH_VERSION=v27.0
```

`INSTAGRAM_USER_ID` é opcional e permite conferir também o ID da conta autorizada. O sistema verifica o nome da conta antes de importar. Não use prefixo `NEXT_PUBLIC_`, não versione tokens e não envie esses valores por chat.

4. Execute `npm run db:migrate`, gere o build e reinicie o serviço do projeto. O supervisor já inicia o worker junto com o Next.js. Em Docker, use as mesmas variáveis no ambiente do serviço app e preserve o volume de dados.
5. Acesse `/admin/instagram` e clique em **Sincronizar agora**. O painel mostra a última sincronização e possíveis erros sem expor o token.

## Renovação e indisponibilidade

Tokens expiram e podem ser revogados. Renove conforme o fluxo da Meta e atualize o ambiente do serviço, depois reinicie. Esta implementação não executa OAuth nem renova tokens automaticamente. O painel avisa quando a API retorna autorização inválida.

Em uma falha temporária, os posts anteriores ficam disponíveis por até 24 horas. Após esse prazo, ou antes da primeira sincronização, a home exibe apenas a chamada com link para o perfil. Uma sincronização bem-sucedida substitui o cache, inclusive quando a conta não tem publicações. Não há posts fictícios nem scraping.
