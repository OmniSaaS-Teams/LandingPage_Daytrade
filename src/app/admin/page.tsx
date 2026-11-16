import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../lib/auth.ts";
import { db } from "../../lib/db.ts";
import { kinds } from "../../lib/admin-data.ts";
import { AdminShell } from "../../components/admin/AdminShell";
import styles from "./admin.module.css";

async function Dashboard() {
  const admin = await requireAdmin();
  const counts = await db.query<{ kind: string; total: string }>("SELECT kind,count(*) AS total FROM submissions GROUP BY kind");
  const jobs = await db.query<{ total: string }>("SELECT count(*) AS total FROM webhook_jobs WHERE status IN ('pending','failed','processing')");
  const posts = await db.query<{ total: string }>("SELECT count(*) AS total FROM blog_posts");
  return <AdminShell email={admin.email}><h1>Visão geral</h1><p>Acompanhe os cadastros recebidos pelo site.</p><div className={styles.cards}>{Object.entries(kinds).map(([key, label]) => <div key={key} className={styles.card}><span>{label}</span><strong>{counts.rows.find(row => row.kind === key)?.total || 0}</strong><Link href={`/admin/contatos?tipo=${key}`}>Ver cadastros →</Link></div>)}<div className={styles.card}><span>Artigos</span><strong>{posts.rows[0].total}</strong><Link href="/admin/blog">Gerenciar blog →</Link></div></div><p className={styles.muted}>{jobs.rows[0].total} encaminhamento(s) ao n8n aguardando processamento ou revisão. Os cadastros já estão salvos.</p></AdminShell>;
}
export default function AdminPage() { return <Suspense fallback={<p>Carregando painel…</p>}><Dashboard /></Suspense>; }
