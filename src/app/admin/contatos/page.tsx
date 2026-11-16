import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth.ts";
import { dateLabel, jobStatuses, kinds, listSubmissions, statuses } from "../../../lib/admin-data.ts";
import { AdminShell } from "../../../components/admin/AdminShell";
import styles from "../admin.module.css";

async function Contacts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const kind = params.tipo && kinds[params.tipo] ? params.tipo : "";
  const status = params.status && statuses[params.status] ? params.status : "";
  const search = String(params.busca || "").slice(0, 200);
  const page = Math.max(1, Math.min(100000, Number.parseInt(params.pagina || "1") || 1));
  const { rows, total } = await listSubmissions(kind, status, search, page);
  const url = (next: number) => `/admin/contatos?${new URLSearchParams({ tipo: kind, status, busca: search, pagina: String(next) })}`;
  return <AdminShell email={admin.email}><h1>Contatos e currículos</h1><p>Consulte os envios e acompanhe o atendimento.</p><div className={styles.toolbar}><form><select name="tipo" defaultValue={kind} aria-label="Tipo"><option value="">Todos os formulários</option>{Object.entries(kinds).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select name="status" defaultValue={status} aria-label="Status"><option value="">Todos os status</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><input name="busca" defaultValue={search} placeholder="Nome, e-mail ou telefone" aria-label="Buscar contatos" maxLength={200} /><button>Filtrar</button></form></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nome</th><th>Formulário</th><th>Recebido em</th><th>Status</th><th>n8n</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><Link href={`/admin/contatos/${row.id}`}>{row.data.nome || "Contato"}</Link><small>{row.data.email || row.data.telefone}</small></td><td>{kinds[row.kind]}{row.upload_id && <small>Currículo anexado</small>}</td><td>{dateLabel(row.created_at)}</td><td>{statuses[row.status]}</td><td>{row.job_status ? jobStatuses[row.job_status] : "Sem encaminhamento"}</td></tr>)}{!rows.length && <tr><td colSpan={5}>Nenhum cadastro encontrado.</td></tr>}</tbody></table></div><div className={styles.pagination}>{page > 1 && <Link href={url(page - 1)}>← Anterior</Link>}<span>{total} cadastros · Página {page}</span>{page * 25 < total && <Link href={url(page + 1)}>Próxima →</Link>}</div></AdminShell>;
}
export default function ContactsPage(props: { searchParams: Promise<Record<string, string | undefined>> }) { return <Suspense fallback={<p>Carregando cadastros…</p>}><Contacts {...props} /></Suspense>; }
