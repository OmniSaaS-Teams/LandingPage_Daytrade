import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { publishedPost } from "../../../lib/blog.ts";
import { blogCoverAlt } from "../../../lib/blog-options";
import { pageMetadata } from "../../../lib/seo";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import styles from "../blog.module.css";

const getPost = cache(publishedPost);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connection();
  const post = await getPost((await params).slug);
  if (!post) return { title: "Artigo não encontrado | Daytrade", robots: { index: false } };

  return pageMetadata(`/blog/${encodeURIComponent(post.slug)}`, {
    title: `${post.title} | Daytrade Invest`,
    description: post.excerpt,
  }, {
    publishedTime: new Date(post.published_at!).toISOString(),
    modifiedTime: new Date(post.updated_at).toISOString(),
  });
}
async function Article({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <main className={styles.page}><div className={styles.heading}><Link className={styles.back} href="/blog">← Conteúdos Daytrade</Link><h1>{post.title}</h1><p>{post.category} · {new Date(post.published_at!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p></div><div className={styles.articleCover}><Image src={post.cover} alt={blogCoverAlt(post.cover)} fill sizes="(max-width:1152px) 100vw,1152px" preload /></div><article className={styles.body}>{post.content.split(/\r?\n\s*\r?\n/).map((part, index) => part.startsWith("## ") ? <h2 key={index}>{part.slice(3)}</h2> : <p key={index}>{part}</p>)}</article></main>;
}
export default function ArticlePage(props: { params: Promise<{ slug: string }> }) { return <><Suspense fallback={null}><Navbar /></Suspense><Suspense fallback={<div className={styles.heading}>Carregando artigo…</div>}><Article {...props} /></Suspense><Footer /></>; }
