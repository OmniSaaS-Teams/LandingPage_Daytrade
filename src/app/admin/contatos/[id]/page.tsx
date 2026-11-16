import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth.ts";
import { db } from "../../../../lib/db.ts";
import { dateLabel, jobStatuses, kinds, statuses, validId, type Submission } from "../../../../lib/admin-data.ts";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { deleteSubmission, retryWebhook, updateSubmission } from "../actions";
import styles from "../../admin.module.css";

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!validId(id)) notFound();
  const result = await db.query<Submission>("SELECT s.*,j.status AS job_status,j.attempts,j.last_error FROM submissions s LEFT JOIN webhook_jobs j ON j.submission_id=s.id WHERE s.id=$1", [id]);
  const item = result.rows[0];
  if (!item) notFound();
  return <AdminShell email={admin.email}><Link href="/admin/contatos">← Todos os cadastros</Link><h1>{item.data.nome || "Contato"}</h1><p>{kinds[item.kind]} · Recebido em {dateLabel(item.created_at)}</p><dl className={styles.detail}>{Object.entries(item.data).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{typeof value === "boolean" ? value ? "Sim" : "Não" : String(value)}</dd></div>)}</dl>{item.upload_id && <a className={styles.button} href={`/api/admin/curriculos/${item.upload_id}`}>Baixar currículo</a>}<form action={updateSubmission} className={styles.actions}><input type="hidden" name="id" value={id} /><label>Status <select name="status" defaultValue={item.status}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button>Salvar status</button></form><div className={styles.card}><h2>Encaminhamento ao n8n</h2><p>{item.job_status ? `${jobStatuses[item.job_status]} · ${item.attempts} tentativa(s)` : "Não configurado no momento do envio. O cadastro está salvo neste painel."}</p>{item.last_error && <p className={styles.muted}>{item.last_error}</p>}{item.job_status === "failed" && <form action={retryWebhook}><input type="hidden" name="id" value={id} /><button>Tentar encaminhar novamente</button></form>}</div><details className={styles.actions}><summary>Excluir cadastro e anexo</summary><form action={deleteSubmission}><input type="hidden" name="id" value={id} /><p>Esta ação remove os dados e o currículo deste sistema. Não apaga cópias já encaminhadas ao n8n.</p><label><input type="checkbox" name="confirmar" required /> Confirmo a exclusão permanente.</label><p><button className={styles.danger}>Excluir cadastro</button></p></form></details></AdminShell>;
}
export default function DetailPage(props: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Carregando cadastro…</p>}><Detail {...props} /></Suspense>; }
