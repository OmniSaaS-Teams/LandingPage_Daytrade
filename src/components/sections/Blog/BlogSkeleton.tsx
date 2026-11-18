import Link from "next/link";
import styles from "./Blog.module.css";

export function BlogSkeletonCards() {
  return <div className={styles.grid} role="status" aria-label="Conteúdos do blog ainda não disponíveis">
    {[0, 1, 2].map(index => <div className={styles.card} key={index} aria-hidden="true">
      <div className={`${styles.preview} ${styles.skeleton}`} />
      <div className={`${styles.skeleton} ${styles.skeletonMeta}`} />
      <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonShort}`} />
    </div>)}
  </div>;
}

export function BlogSkeleton() {
  return <section id="blog" className={styles.section} aria-label="Conteúdos Daytrade"><div className={styles.container}>
    <div className={styles.categories} aria-hidden="true">{["Todos", "Crédito", "Câmbio", "Investimentos", "Gestão financeira", "Institucional"].map(category => <span key={category} className={styles.categoryLink}>{category}</span>)}</div>
    <Link href="/blog" className={styles.categoryLink}>Ver todos os conteúdos ↗</Link>
    <div className={styles.divider} />
    <BlogSkeletonCards />
  </div></section>;
}
