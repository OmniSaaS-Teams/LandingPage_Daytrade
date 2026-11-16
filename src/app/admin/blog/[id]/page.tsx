import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../lib/auth.ts";
import { db } from "../../../../lib/db.ts";
import { validId } from "../../../../lib/admin-data.ts";
import type { Post } from "../../../../lib/blog.ts";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { PostEditor } from "../../../../components/admin/PostEditor";
import { deletePost } from "../actions";
import styles from "../../admin.module.css";

async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!validId(id)) notFound();
  const post = (await db.query<Post>("SELECT * FROM blog_posts WHERE id=$1", [id])).rows[0];
  if (!post) notFound();
  const { erro } = await searchParams;
  return <AdminShell email={admin.email}><Link href="/admin/blog">← Artigos</Link><h1>Editar artigo</h1>{post.published && <p><Link href={`/blog/${post.slug}`} target="_blank">Ver artigo publicado ↗</Link></p>}{erro && <p className={styles.alert} role="alert">{erro === "slug" ? "Este endereço já está em uso." : "Verifique os campos e os limites indicados."}</p>}<PostEditor post={post} /><details className={styles.actions}><summary>Excluir artigo</summary><form action={deletePost}><input type="hidden" name="id" value={id} /><label><input type="checkbox" name="confirmar" required /> Confirmo a exclusão permanente deste artigo.</label><p><button className={styles.danger}>Excluir artigo</button></p></form></details></AdminShell>;
}
export default function EditPostPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) { return <Suspense fallback={<p>Carregando editor…</p>}><EditPost {...props} /></Suspense>; }
