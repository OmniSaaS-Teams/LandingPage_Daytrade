import { Suspense } from "react";
import { connection } from "next/server";
import { instagramFeed, instagramUsername } from "../../../lib/instagram.ts";
import styles from "./Instagram.module.css";

function SkeletonCards() {
  return <div className={styles.grid} role="status" aria-label="Publicações do Instagram ainda não disponíveis">
    {[0, 1, 2, 3, 4].map(index => <div className={`${styles.card} ${styles.skeletonCard}`} key={index} aria-hidden="true">
      <div className={`${styles.media} ${styles.skeleton}`} />
      <div className={styles.content}><div className={`${styles.skeleton} ${styles.skeletonDate}`} /><div className={`${styles.skeleton} ${styles.skeletonLine}`} /><div className={`${styles.skeleton} ${styles.skeletonLine}`} /><div className={`${styles.skeleton} ${styles.skeletonShort}`} /></div>
    </div>)}
  </div>;
}
function FeedSection({ username, children }: { username: string; children: React.ReactNode }) {
  return <section className={styles.section} aria-labelledby="instagram-title">
    <div className={styles.heading}><div><span className={styles.eyebrow}>CONEXÕES QUE APROXIMAM</span><h2 id="instagram-title">Acompanhe a DayTrade</h2><p>Ideias, novidades e o nosso dia a dia no Instagram.</p></div><a className={styles.profile} href={`https://www.instagram.com/${username}/`} target="_blank" rel="noopener noreferrer">@{username} ↗</a></div>
    {children}
  </section>;
}
async function Posts() {
  await connection();
  const feed = await instagramFeed().catch(() => ({ username: instagramUsername(), posts: [] }));
  return <FeedSection username={feed.username}>
    {feed.posts.length > 0 ? <div className={styles.grid}>{feed.posts.map(post => <a key={post.id} className={styles.card} href={post.permalink} target="_blank" rel="noopener noreferrer">
      <div className={styles.media}>{post.imageUrl ? <picture><img src={post.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /></picture> : <span>Ver publicação no Instagram ↗</span>}<span className={styles.badge}>{post.mediaType === "VIDEO" ? "Reel" : post.mediaType === "CAROUSEL_ALBUM" ? "Carrossel" : "Instagram"}</span></div>
      <div className={styles.content}><time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long", year: "numeric" })}</time><p>{post.caption || "Confira esta publicação da DayTrade."}</p><span className={styles.link}>Ver no Instagram ↗</span></div>
    </a>)}</div> : <SkeletonCards />}
  </FeedSection>;
}
export function Instagram() { return <Suspense fallback={<FeedSection username={instagramUsername()}><SkeletonCards /></FeedSection>}><Posts /></Suspense>; }
