import Image, { getImageProps } from "next/image";
import type { ReactNode } from "react";
import styles from "./InternalHero.module.css";

type InternalHeroProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  children?: ReactNode;
  className?: string;
  fullBackground?: boolean;
};

export function InternalHero({ id, title, description, image, mobileImage, imageAlt, children, className = "", fullBackground = false }: InternalHeroProps) {
  const mobileSource = fullBackground && mobileImage
    ? getImageProps({ src: mobileImage, alt: imageAlt, fill: true, sizes: "100vw" }).props.srcSet
    : undefined;
  const background = fullBackground && (
    <Image
      src={image}
      alt={imageAlt}
      fill
      sizes="100vw"
      preload={!mobileSource}
      loading={mobileSource ? "eager" : undefined}
      fetchPriority={mobileSource ? "high" : undefined}
      className={styles.backgroundImage}
    />
  );

  return (
    <section className={`${styles.hero} ${fullBackground ? styles.fullBackground : ""} ${className}`} aria-labelledby={id}>
      {mobileSource ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSource} sizes="100vw" />
          {background}
        </picture>
      ) : background}
      <div className={styles.container}>
        <div className={styles.copy}>
          <h1 id={id}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {children && <div className={styles.actions}>{children}</div>}
        </div>
        {!fullBackground && <Image src={image} alt={imageAlt} width={700} height={700} sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 900px) 52vw, 470px" preload className={styles.image} />}
      </div>
    </section>
  );
}
