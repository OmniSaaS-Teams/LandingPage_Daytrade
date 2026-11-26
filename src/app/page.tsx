import { Hero } from "../components/sections/Hero/Hero";
import { Insights } from "../components/sections/Insights/Insights";
import { Features } from "../components/sections/Platform/Platform";
import { Process } from "../components/sections/Process/Process";
import { BankCTA } from "../components/sections/CTA/BankCTA";
import { Blog } from "../components/sections/Blog/Blog";
import { FAQ } from "../components/sections/FAQ/FAQ";
import { Footer } from "../components/layout/Footer";
import { BrandWaves } from "../components/ui/BrandWaves";
import styles from "./page.module.css";
import { Instagram } from "../components/sections/Instagram/Instagram";
import { brand } from "../data/brand";
import { faq } from "../data/faq";
import { publicPageMetadata, siteUrl } from "../lib/seo";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata = {
  ...publicPageMetadata("/"),
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

const organizationId = siteUrl("/#organizacao");
const websiteId = siteUrl("/#site");
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: brand.name,
      legalName: brand.legalName,
      taxID: brand.cnpj,
      url: siteUrl("/"),
      logo: siteUrl(brand.logo),
      description: brand.description,
      areaServed: brand.areaServed,
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl("/"),
      name: brand.name,
      inLanguage: "pt-BR",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Service",
      "@id": siteUrl("/#credito-empresarial"),
      url: siteUrl("/portfolio#credito"),
      name: "Crédito para empresas",
      description: "Crédito empresarial com soluções de antecipação de recebíveis e capital de giro. As condições são apresentadas após a análise de crédito.",
      provider: { "@id": organizationId },
      areaServed: brand.areaServed,
      audience: { "@type": "BusinessAudience", audienceType: "Empresas que buscam capital de giro ou antecipação de recebíveis" },
    },
    {
      "@type": "FAQPage",
      "@id": siteUrl("/#faq"),
      url: siteUrl("/"),
      inLanguage: "pt-BR",
      isPartOf: { "@id": websiteId },
      mainEntity: faq.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }} />
      <main>
        <Hero />
        <Insights />
        <div className={`${styles.sectionDivider} ${styles.blueDivider}`} aria-hidden="true" />
        <Features />
        <div className={styles.sectionDivider} aria-hidden="true" />
        <Process />
        <div className={styles.waveDivider}><BrandWaves className={styles.waves} /></div>
        <Blog />
        <Instagram />
        <BankCTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
