"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./Blog.module.css";

type BlogArticle = { id: string; slug: string; title: string; category: string; date: string; cover: string; };
const categories = ["Todos", "Crédito", "Câmbio", "Investimentos", "Gestão financeira", "Institucional"];

export function BlogCarousel({ articles }: { articles: BlogArticle[] }) {
  const [category, setCategory] = useState("Todos");
  const filtered = articles.filter(article => category === "Todos" || article.category === category);
  const carouselRef = useRef<HTMLDivElement>(null);

  const showNextArticles = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      left: carousel.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  const showPreviousArticles = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      left: -carousel.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <section id="blog" className={styles.section} aria-label="Conteúdos Daytrade">
      <div className={styles.container}>
        <nav className={styles.categories} aria-label="Categorias do blog">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? styles.categoryActive : styles.categoryLink}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </nav>

        <Link href="/blog" className={styles.categoryLink}>Ver todos os conteúdos ↗</Link>
        <div className={styles.divider} />

        <div className={styles.carousel}>
          <div ref={carouselRef} id="blog-articles" className={styles.grid}>
            {filtered.map((article) => (
              <article key={article.title} className={styles.card}>
                <Link className={styles.cardLink} href={`/blog/${article.slug}`}>
                  <div className={styles.preview}><Image src={article.cover} alt="" fill sizes="(max-width:767px) 85vw,33vw" style={{ objectFit: "cover" }} /></div>
                  <p className={styles.meta}>
                    {article.date}
                    <span aria-hidden="true">•</span>
                    {article.category}
                  </p>
                  <h2 className={styles.cardTitle}>{article.title}</h2>
                </Link>
              </article>
            ))}
            {!filtered.length && <p>Novos conteúdos em breve.</p>}
          </div>

          <button
            type="button"
            className={styles.previousButton}
            aria-label="Ver artigos anteriores"
            aria-controls="blog-articles"
            onClick={showPreviousArticles}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m11 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.nextButton}
            aria-label="Ver próximos artigos"
            aria-controls="blog-articles"
            onClick={showNextArticles}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
