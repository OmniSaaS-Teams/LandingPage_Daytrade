import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth.ts";
import { instagramFeed, syncInstagram } from "../../../lib/instagram.ts";
import { allowAttempt } from "../../../lib/rate-limit.ts";
import { AdminShell } from "../../../components/admin/AdminShell";
import styles from "../admin.module.css";

async function refresh() {
  "use server";
  const admin = await requireAdmin();
  const result = await allowAttempt("instagram-sync", admin.email, 4, 600) ? await syncInstagram(true) : "rate_limited";
  revalidatePath("/");
  revalidatePath("/admin/instagram");
  redirect(`/admin/instagram?status=${encodeURIComponent(result)}`);
}
const messages: Record<string, string> = { updated: "Publicações atualizadas.", cached: "Atualização já em andamento ou cache atualizado.", not_configured: "Configure a autorização no servidor para importar publicações.", token_expired: "A autorização expirou ou foi revogada. Renove o token na Meta.", wrong_account: "A conta autorizada não corresponde ao perfil configurado.", rate_limited: "Aguarde alguns minutos antes de atualizar novamente.", api_unavailable: "Não foi possível consultar o Instagram. O sistema tentará novamente.", invalid_config: "Confira a versão da API configurada no servidor.", invalid_media: "A API não retornou publicações válidas." };
async function Content({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const admin = await requireAdmin();
  const feed = await instagramFeed();
  const status = (await searchParams).status;
  return <AdminShell email={admin.email}><h1>Instagram</h1><p>Últimas cinco publicações de @{feed.username}, com sincronização automática a cada 15 minutos.</p>{status && messages[status] && <p className={status === "updated" ? styles.success : styles.alert}>{messages[status]}</p>}<div className={styles.card}><p>Autorização no servidor: {feed.configured ? "Configurada" : "Pendente"}</p><p>Última sincronização: {feed.lastSuccess ? new Date(feed.lastSuccess).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Ainda não realizada"}</p><p>Publicações disponíveis: {feed.posts.length}</p>{feed.lastError && <p className={styles.alert}>{messages[feed.lastError] || messages.api_unavailable}</p>}<form action={refresh}><button>Sincronizar agora</button></form></div><p className={styles.muted}>Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USERNAME no ambiente do servidor. A conta deve ser profissional e autorizar a permissão instagram_business_basic. Nunca coloque o token no código público. Consulte docs/instagram.md para instalação e renovação.</p></AdminShell>;
}
export default function InstagramAdmin(props: { searchParams: Promise<{ status?: string }> }) { return <Suspense fallback={<p>Carregando Instagram…</p>}><Content {...props} /></Suspense>; }
