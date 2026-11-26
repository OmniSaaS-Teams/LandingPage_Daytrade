import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { publishedPosts } from "../../lib/blog.ts";
import { blogCategories } from "../../lib/blog-options.ts";
import { pageMetadata, publicPages } from "../../lib/seo";
import styles from "./blog.module.css";

type BlogPageProps = { searchParams: Promise<{ categoria?: string; pagina?: string }> };

function blogFilters({ categoria = "", pagina = "1" }: Awaited<BlogPageProps["searchParams"]>) {
  return {
    category: blogCategories.includes(categoria) ? categoria : "",
    page: Math.max(1, Math.min(100000, parseInt(pagina, 10) || 1)),
  };
}

function blogUrl(category: string, page: number) {
  const query = new URLSearchParams();
  if (category) query.set("categoria", category);
  if (page > 1) query.set("pagina", String(page));
  return query.size ? `/blog?${query}` : "/blog";
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const { category, page } = blogFilters(await searchParams);
  return pageMetadata(blogUrl(category, page), publicPages["/blog"]);
}

async function Posts({ searchParams }: BlogPageProps) {
  await connection();
  const { category, page } = blogFilters(await searchParams);
  const posts = await publishedPosts(category, page, 12);
  const url = (next: number) => blogUrl(category, next);
  return <div className={styles.container}><nav className={styles.categories} aria-label="Categorias"><Link href="/blog" aria-current={!category ? "page" : undefined}>Todos</Link>{blogCategories.map(item => <Link key={item} href={`/blog?categoria=${encodeURIComponent(item)}`} aria-current={category === item ? "page" : undefined}>{item}</Link>)}</nav><div className={styles.grid}>{posts.map(post => <article key={post.id} className={styles.card}><Link href={`/blog/${post.slug}`}><div className={styles.cover}><Image src={post.cover} alt="" fill sizes="(max-width:640px) 100vw,33vw" /></div><div className={styles.cardCopy}><span className={styles.meta}>{post.category} · {new Date(post.published_at!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span><h2>{post.title}</h2><p>{post.excerpt}</p><span>Leia o artigo →</span></div></Link></article>)}</div>{!posts.length && <p className={styles.empty}>Novos conteúdos em breve.</p>}<div className={styles.pagination}>{page > 1 && <Link href={url(page-1)}>← Anterior</Link>}{posts.length === 12 && <Link href={url(page+1)}>Próxima →</Link>}</div></div>;
}
export default function BlogPage(props: BlogPageProps) { return <><Navbar /><main className={styles.page}><div className={styles.heading}><h1>Ideias para os próximos passos.</h1><p>Conteúdos Daytrade sobre finanças e negócios.</p></div><Suspense fallback={<div className={styles.container}>Carregando conteúdos…</div>}><Posts {...props} /></Suspense></main><Footer /></>; }
