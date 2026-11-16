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

export default function Home() {
  return (
    <>
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
