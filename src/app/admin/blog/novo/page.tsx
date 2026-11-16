import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../../lib/auth.ts";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { PostEditor } from "../../../../components/admin/PostEditor";
import styles from "../../admin.module.css";

async function NewPost({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const admin = await requireAdmin();
  const { erro } = await searchParams;
  return <AdminShell email={admin.email}><Link href="/admin/blog">← Artigos</Link><h1>Novo artigo</h1>{erro && <p role="alert" className={styles.alert}>{erro === "slug" ? "Este endereço já está em uso." : "Verifique os campos. Título: 3 a 180 caracteres; resumo: 10 a 400; conteúdo: 30 a 100.000."}</p>}<PostEditor /></AdminShell>;
}
export default function NewPostPage(props: { searchParams: Promise<{ erro?: string }> }) { return <Suspense fallback={<p>Carregando editor…</p>}><NewPost {...props} /></Suspense>; }
