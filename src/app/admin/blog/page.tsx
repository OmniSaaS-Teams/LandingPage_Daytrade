import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth.ts";
import { db } from "../../../lib/db.ts";
import type { Post } from "../../../lib/blog.ts";
import { AdminShell } from "../../../components/admin/AdminShell";
import { dateLabel } from "../../../lib/admin-data.ts";
import styles from "../admin.module.css";

async function Posts({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const admin = await requireAdmin();
  const page = Math.max(1, Math.min(100000, parseInt((await searchParams).pagina || "1") || 1));
  const posts = await db.query<Post>("SELECT * FROM blog_posts ORDER BY updated_at DESC,id LIMIT 26 OFFSET $1", [(page - 1) * 25]);
  return <AdminShell email={admin.email}><h1>Blog</h1><p>Crie conteúdos e publique quando estiverem prontos.</p><div className={styles.toolbar}><Link className={styles.button} href="/admin/blog/novo">Novo artigo</Link><Link href="/blog" target="_blank">Ver blog público ↗</Link></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Título</th><th>Categoria</th><th>Status</th><th>Atualizado</th></tr></thead><tbody>{posts.rows.slice(0,25).map(post => <tr key={post.id}><td><Link href={`/admin/blog/${post.id}`}>{post.title}</Link><small>/blog/{post.slug}</small></td><td>{post.category}</td><td>{post.published ? "Publicado" : "Rascunho"}</td><td>{dateLabel(post.updated_at)}</td></tr>)}{!posts.rows.length && <tr><td colSpan={4}>Nenhum artigo cadastrado. Comece criando seu primeiro conteúdo.</td></tr>}</tbody></table></div><div className={styles.pagination}>{page > 1 && <Link href={`/admin/blog?pagina=${page-1}`}>← Anterior</Link>}<span>Página {page}</span>{posts.rows.length>25 && <Link href={`/admin/blog?pagina=${page+1}`}>Próxima →</Link>}</div></AdminShell>;
}
export default function PostsPage(props: { searchParams: Promise<{ pagina?: string }> }) { return <Suspense fallback={<p>Carregando artigos…</p>}><Posts {...props} /></Suspense>; }
