import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { publishedPosts } from "../../lib/blog.ts";
import { blogCategories } from "../../lib/blog-options.ts";
import styles from "./blog.module.css";

export const metadata: Metadata = { title: "Blog | DayTrade", description: "Conteúdos sobre crédito, câmbio, investimentos e gestão financeira." };
async function Posts({ searchParams }: { searchParams: Promise<{ categoria?: string; pagina?: string }> }) {
  await connection();
  const params = await searchParams;
  const category = blogCategories.includes(params.categoria || "") ? params.categoria! : "";
  const page = Math.max(1, Math.min(100000, parseInt(params.pagina || "1") || 1));
  const posts = await publishedPosts(category, page, 12);
  const url = (next: number) => `/blog?${new URLSearchParams({ categoria: category, pagina: String(next) })}`;
  return <div className={styles.container}><nav className={styles.categories} aria-label="Categorias"><Link href="/blog" aria-current={!category ? "page" : undefined}>Todos</Link>{blogCategories.map(item => <Link key={item} href={`/blog?categoria=${encodeURIComponent(item)}`} aria-current={category === item ? "page" : undefined}>{item}</Link>)}</nav><div className={styles.grid}>{posts.map(post => <article key={post.id} className={styles.card}><Link href={`/blog/${post.slug}`}><div className={styles.cover}><Image src={post.cover} alt="" fill sizes="(max-width:640px) 100vw,33vw" /></div><div className={styles.cardCopy}><span className={styles.meta}>{post.category} · {new Date(post.published_at!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span><h2>{post.title}</h2><p>{post.excerpt}</p><span>Leia o artigo →</span></div></Link></article>)}</div>{!posts.length && <p className={styles.empty}>Novos conteúdos em breve.</p>}<div className={styles.pagination}>{page > 1 && <Link href={url(page-1)}>← Anterior</Link>}{posts.length === 12 && <Link href={url(page+1)}>Próxima →</Link>}</div></div>;
}
export default function BlogPage(props: { searchParams: Promise<{ categoria?: string; pagina?: string }> }) { return <><Navbar /><main className={styles.page}><div className={styles.heading}><h1>Ideias para os próximos passos.</h1><p>Conteúdos DayTrade sobre finanças e negócios.</p></div><Suspense fallback={<div className={styles.container}>Carregando conteúdos…</div>}><Posts {...props} /></Suspense></main><Footer /></>; }
