import Image, { getImageProps } from "next/image";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { partnerContent } from "../../data/partner";
import { publicPageMetadata } from "../../lib/seo";
import { PartnerForm } from "./PartnerForm";
import styles from "./Partner.module.css";

export const metadata = publicPageMetadata("/parceiro-indicador");

const iconPaths = {
  clock: <><circle cx="24" cy="24" r="17" /><path d="M24 13v12l8 5M10 7 5 12m33-5 5 5" /></>,
  globe: <><circle cx="24" cy="24" r="18" /><ellipse cx="24" cy="24" rx="8" ry="18" /><path d="M7 17h34M7 31h34" /></>,
  building: <><rect x="10" y="5" width="28" height="38" rx="2" /><path d="M17 13h3m8 0h3m-14 8h3m8 0h3m-14 8h3m8 0h3M21 43V35h6v8M5 43h38" /></>,
  home: <><path d="m5 22 19-16 19 16M11 20v23h26V20M20 43V30h8v13" /></>,
  balance: <><path d="M24 8v34M15 42h18M7 15h34M12 15l-7 14h14l-7-14Zm24 0-7 14h14l-7-14ZM5 29a7 7 0 0 0 14 0m10 0a7 7 0 0 0 14 0" /><circle cx="24" cy="9" r="3" /></>,
  team: <><circle cx="24" cy="14" r="6" /><path d="M13 41v-7a11 11 0 0 1 22 0v7M10 22a5 5 0 1 1 4-9M38 22a5 5 0 1 0-4-9M4 38v-6a8 8 0 0 1 7-8m33 14v-6a8 8 0 0 0-7-8" /></>,
  gift: <><rect x="6" y="18" width="36" height="9" rx="2" /><path d="M10 27v16h28V27M24 18v25M24 18H15a6 6 0 1 1 6-7l3 7Zm0 0h9a6 6 0 1 0-6-7l-3 7Z" /></>,
  portfolio: <><rect x="5" y="15" width="38" height="27" rx="3" /><path d="M16 15V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6M5 25a44 44 0 0 0 38 0M21 26v6h6v-6" /></>,
  chart: <><path d="M7 5v37h36M15 34V24h6v10m7 0V16h6v18M12 17l11-7 7 2 10-7" /></>,
  transparency: <><path d="M13 5h17l8 8v30H10V8a3 3 0 0 1 3-3ZM29 5v10h9M17 22h14m-14 7h14m-14 7h8" /></>,
  growth: <><path d="M6 40h36M10 34l11-12 8 6L41 9M30 9h11v11" /></>,
  contract: <><path d="M23 41H10V6h24v14M16 14h12m-12 7h9m-9 7h6m8-1 5-5 7 7-5 5m-7-7-9 9-2 7 7-2 9-9-5-5Z" /></>,
};

export default function PartnerPage() {
  const { hero } = partnerContent;
  const { props: { srcSet: mobileHeroSrcSet } } = getImageProps({
    src: hero.mobileImage,
    alt: hero.imageAlt,
    fill: true,
    sizes: "100vw",
  });

  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="partner-title">
          <picture>
            <source media="(max-width: 767px)" srcSet={mobileHeroSrcSet} sizes="100vw" />
            <Image src={hero.image} alt={hero.imageAlt} fill sizes="100vw" loading="eager" fetchPriority="high" className={styles.heroImage} />
          </picture>
          <div className={styles.heroShade} />
          <div className={styles.container}>
            <div className={styles.heroCopy}>
              <h1 id="partner-title">{hero.title}</h1>
              <p>{hero.description}</p>
              <div className={styles.heroActions}>
                <a href="#formulario-parceiro">Seja um parceiro</a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.benefits} aria-label="Benefícios da parceria">
          <div className={`${styles.container} ${styles.benefitsGrid}`}>
            {partnerContent.benefits.map((benefit) => (
              <article key={benefit.icon} className={styles.benefitCard}>
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {iconPaths[benefit.icon]}
                </svg>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.introduction} aria-label="Uma parceria para crescer">
          <div className={styles.narrowContainer}>
            {partnerContent.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        <section id="formulario-parceiro" className={styles.application} aria-labelledby="application-title">
          <div className={styles.applicationCopy}>
            <h2 id="application-title">{partnerContent.application.title}</h2>
            <p>{partnerContent.application.description}</p>
          </div>
          <PartnerForm />
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div className={styles.closingCopy}>
              <h2 id="closing-title">{partnerContent.closing.title}</h2>
              {partnerContent.closing.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p>Vamos construir novas oportunidades juntos.</p>
              <a href="#formulario-parceiro" className={styles.primaryAction}>Seja um parceiro <span aria-hidden="true">↗</span></a>
            </div>
            <div className={styles.closingVisual}>
              <Image src={partnerContent.closing.image} alt={partnerContent.closing.imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className={styles.closingImage} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
