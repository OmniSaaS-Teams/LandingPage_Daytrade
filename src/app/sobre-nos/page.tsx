import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InternalHero } from "../../components/layout/InternalHero";
import { SpecialistContactButton } from "../../components/contact/SpecialistContact";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "Sobre nós | DayTrade Invest",
  description: "Conheça a DayTrade Invest: nossa origem, a proximidade com cada cliente e as soluções de crédito e investimento que conectam histórias a novas possibilidades.",
};

const solutions = [
  {
    number: "01",
    title: "Crédito para o seu negócio",
    description: "Trabalhamos com linhas de antecipação de recebíveis em diversos segmentos, ajudando empresas a transformar oportunidades em novos negócios.",
    href: "/portfolio#credito",
    label: "Conheça as soluções de crédito",
  },
  {
    number: "02",
    title: "Investimentos para o seu futuro",
    description: "Oferecemos investimentos com rentabilidade atrativa e alta liquidez, aproximando investidores das possibilidades que movimentam a economia.",
    href: "/investidor",
    label: "Conheça nossos investimentos",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <InternalHero
          id="about-title"
          fullBackground
          title="Sobre nós"
          description="Conheça a DayTrade Invest e a ideia que nos move: aproximar investidores e empresas para potencializar novos negócios."
          image="/images/features/bpo.png"
          imageAlt="Profissionais trocando ideias e colaborando em um escritório"
        >
          <SpecialistContactButton>Fale com um especialista</SpecialistContactButton>
          <a className={styles.historyLink} href="#quem-somos">Conheça nossa história <span aria-hidden="true">↓</span></a>
        </InternalHero>

        <section id="quem-somos" className={styles.origin} aria-labelledby="origin-title">
          <div className={`${styles.container} ${styles.originGrid}`}>
            <div>
              <p className={styles.eyebrow}>Quem somos</p>
              <h2 id="origin-title">Uma ideia que conecta <span>novas possibilidades.</span></h2>
            </div>
            <div className={styles.originCopy}>
              <p>A DayTrade Invest nasceu de uma ideia central:</p>
              <blockquote>
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                <p>Remunerar melhor nossos investidores e dar crédito a empresas com potencial para novos negócios.</p>
              </blockquote>
              <p>Esse propósito orienta a forma como nos relacionamos com cada cliente e desenvolvemos nossas soluções financeiras.</p>
            </div>
          </div>
        </section>

        <section id="nossa-forma-de-atuar" className={styles.approach} aria-labelledby="approach-title">
          <div className={`${styles.container} ${styles.approachGrid}`}>
            <div className={styles.storyPhoto}>
              <Image src="/images/features/credito-cafe.png" alt="Profissionais conversando e analisando possibilidades para um negócio" fill sizes="(max-width: 767px) calc(100vw - 48px), 45vw" />
            </div>
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}>Cada cliente, uma história</p>
              <h2 id="approach-title">Antes de propor, <span>a gente escuta.</span></h2>
              <p>Em cada visita, ouvimos o que o cliente tem a dizer. Sabemos que cada pessoa percorreu caminhos diferentes, escreveu suas próprias histórias e acumulou experiências valiosas em seu ramo de atuação.</p>
              <p>É a partir dessa troca que ajudamos a potencializar seus negócios. Aprendemos com seus acertos e erros, valorizando tudo o que faz parte de sua trajetória.</p>
              <p>Ao atender, nosso ponto de partida é entender o que podemos ajudar a solucionar. Encaramos cada nova situação como um novo desafio.</p>
              <SpecialistContactButton className={styles.primaryButton}>Converse com a DayTrade <span aria-hidden="true">↗</span></SpecialistContactButton>
            </div>
          </div>
        </section>

        <section className={styles.difference} aria-labelledby="difference-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Nosso diferencial</p>
                <h2 id="difference-title">Soluções financeiras que começam <span>por você.</span></h2>
              </div>
              <p>Desenvolvemos soluções adequadas a cada cliente por meio de serviços financeiros. Entender a realidade de quem está do outro lado é o que nos permite encontrar caminhos para seus negócios e investimentos.</p>
            </div>
            <div className={styles.solutionsGrid}>
              {solutions.map((solution) => (
                <article key={solution.number} className={styles.solution}>
                  <span className={styles.solutionNumber}>{solution.number}</span>
                  <h3>{solution.title}</h3>
                  <p>{solution.description}</p>
                  <Link href={solution.href}>{solution.label} <span aria-hidden="true">↗</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
