import { Suspense } from "react";
import { requireAdmin } from "../../../lib/auth.ts";
import { instagramFeed } from "../../../lib/instagram.ts";
import { instagramConnectionStatus } from "../../../lib/instagram-settings.ts";
import { AdminShell } from "../../../components/admin/AdminShell";
import { refresh, saveConnection } from "./actions";
import styles from "../admin.module.css";
import instagramStyles from "./InstagramAdmin.module.css";

const messages: Record<string, string> = {
  saved: "Conexão salva. A sincronização automática já pode usar os dados informados. Você também pode clicar em Sincronizar agora.",
  updated: "Publicações atualizadas.",
  cached: "Atualização já em andamento ou cache atualizado.",
  not_configured: "Preencha o usuário e o token de acesso para conectar sua conta.",
  token_expired: "A autorização expirou ou foi revogada. Gere um novo token na Meta e atualize o campo abaixo.",
  wrong_account: "O token não corresponde ao usuário informado. Confira os dados da conta.",
  rate_limited: "Aguarde alguns minutos antes de tentar novamente.",
  api_unavailable: "Não foi possível consultar o Instagram. O sistema tentará novamente.",
  invalid_config: "Confira a versão da API configurada no servidor.",
  invalid_media: "A API não retornou publicações válidas.",
  invalid_username: "Informe apenas o nome de usuário do Instagram, sem o endereço do perfil.",
  invalid_token: "Cole o token completo, sem espaços ou quebras de linha (20 a 4.096 caracteres).",
  token_required: "Informe o token de acesso para salvar a conexão.",
  new_token_required: "Ao trocar o usuário, informe também um token da nova conta.",
  storage_error: "Não foi possível salvar a conexão. Confira o armazenamento do servidor e tente novamente.",
  credentials_unavailable: "Não foi possível ler o token salvo. Restaure a chave privada do servidor ou salve um novo token.",
};

async function Content({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const admin = await requireAdmin();
  const [feed, settings] = await Promise.all([instagramFeed(), instagramConnectionStatus()]);
  const status = (await searchParams).status;
  const message = status && Object.hasOwn(messages, status) ? messages[status] : null;
  const success = status === "saved" || status === "updated";

  return (
    <AdminShell email={admin.email}>
      <h1>Instagram</h1>
      <p>Conecte sua conta para mostrar as cinco publicações mais recentes na home.</p>
      {message && <p className={success ? styles.success : styles.alert} role={success ? "status" : "alert"}>{message}</p>}
      <div className={instagramStyles.grid}>
        <section className={styles.card} aria-labelledby="instagram-connection-title">
          <h2 id="instagram-connection-title" className={instagramStyles.heading}>Conexão da conta</h2>
          <p className={instagramStyles.description}>Preencha os dados da conta profissional que deseja exibir no site.</p>
          <form action={saveConnection} className={`${styles.form} ${instagramStyles.form}`}>
            <label htmlFor="instagram-username">
              Usuário do Instagram
              <input id="instagram-username" name="username" type="text" defaultValue={settings.username} placeholder="seu.usuario" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={31} required />
              <small>Informe o nome do perfil, com ou sem @.</small>
            </label>
            <label htmlFor="instagram-access-token">
              Token de acesso
              <input id="instagram-access-token" name="accessToken" type="password" placeholder={settings.configured ? "Deixe em branco para manter o token atual" : "Cole o token gerado na Meta"} autoComplete="new-password" spellCheck={false} minLength={20} maxLength={4096} required={!settings.configured} aria-describedby="instagram-token-help" />
              <small id="instagram-token-help">{settings.configured ? "Já existe um token configurado. Cole um novo somente para substituí-lo." : "Use o token da conta profissional com a permissão instagram_business_basic."} O valor é protegido no servidor e não será exibido novamente.</small>
            </label>
            <button type="submit">Salvar conexão</button>
          </form>
        </section>
        <section className={styles.card} aria-labelledby="instagram-sync-title">
          <h2 id="instagram-sync-title" className={instagramStyles.heading}>Sincronização</h2>
          <dl className={instagramStyles.status}>
            <div><dt>Perfil</dt><dd>@{feed.username}</dd></div>
            <div><dt>Token de acesso</dt><dd>{settings.configured ? "Configurado" : "Ainda não informado"}</dd></div>
            <div><dt>Configuração</dt><dd>{settings.source === "admin" ? "Salva neste painel" : "Ambiente do servidor"}</dd></div>
            <div><dt>Última sincronização</dt><dd>{feed.lastSuccess ? new Date(feed.lastSuccess).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Ainda não realizada"}</dd></div>
            <div><dt>Publicações disponíveis</dt><dd>{feed.posts.length}</dd></div>
          </dl>
          {feed.lastError && <p className={styles.alert}>{messages[feed.lastError] || messages.api_unavailable}</p>}
          <form action={refresh}><button type="submit" disabled={!settings.configured}>Sincronizar agora</button></form>
          <p className={instagramStyles.description}>A atualização automática acontece a cada 15 minutos. Ao renovar o token, basta salvá-lo neste painel.</p>
        </section>
      </div>
    </AdminShell>
  );
}

export default function InstagramAdmin(props: { searchParams: Promise<{ status?: string }> }) {
  return <Suspense fallback={<p>Carregando Instagram…</p>}><Content {...props} /></Suspense>;
}
