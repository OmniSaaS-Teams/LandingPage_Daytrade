import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./InternalHero.module.css";

type InternalHeroProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
};

export function InternalHero({ id, title, description, image, imageAlt, children }: InternalHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby={id}>
      <div className={styles.container}>
        <div className={styles.copy}>
          <h1 id={id}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {children && <div className={styles.actions}>{children}</div>}
        </div>
        <Image src={image} alt={imageAlt} width={700} height={700} sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 900px) 52vw, 470px" preload className={styles.image} />
      </div>
    </section>
  );
}
