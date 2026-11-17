import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { CareerForm } from "../../components/careers/CareerForm";
import { BrandWaves } from "../../components/ui/BrandWaves";
import styles from "./Careers.module.css";

export const metadata: Metadata = {
  title: "Carreira | DayTrade Invest",
  description: "Conheça a DayTrade e apresente sua trajetória. Envie seu currículo para futuras oportunidades em nosso time.",
};

const principles = [
  ["01", "Pessoas no centro", "Escutar com atenção, respeitar diferentes perspectivas e construir relações de confiança."],
  ["02", "Conhecimento que move", "Ter curiosidade para aprender, compartilhar experiências e encontrar caminhos mais claros."],
  ["03", "Responsabilidade em cada decisão", "Agir com cuidado, transparência e compromisso com o que fazemos."],
];

export default function CareersPage() {
  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="career-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>CARREIRA NA DAYTRADE</p>
              <h1 id="career-title">Seu próximo passo.<br /><span>Nosso futuro.</span></h1>
              <p className={styles.description}>Boas ideias ganham força com as pessoas certas. Traga sua trajetória e ajude a construir novos caminhos para os negócios.</p>
              <a className={styles.primaryButton} href="#candidate-se">Faça parte do nosso time <span aria-hidden="true">↗</span></a>
              <a className={styles.heroTextLink} href="#nossa-cultura">Conheça o que nos move <span aria-hidden="true">↓</span></a>
            </div>
            <div className={styles.heroPhoto}>
              <Image src="/images/features/bpo.png" alt="Pessoas colaborando em uma mesa de trabalho" fill preload sizes="(max-width: 767px) 90vw, 38vw" />
              <span className={styles.photoCaption}>Conexões que abrem caminhos.</span>
            </div>
          </div>
          <BrandWaves className={styles.waves} />
        </section>

        <section id="nossa-cultura" className={styles.intro} aria-labelledby="culture-title">
          <p className={styles.eyebrow}>GENTE QUE FAZ A DIFERENÇA</p>
          <h2 id="culture-title">O futuro dos negócios<br />começa com <span>pessoas.</span></h2>
          <p>Por trás de cada solução financeira, existe uma conversa, uma ideia e alguém disposto a fazer acontecer. É essa conexão que queremos construir com você.</p>
        </section>

        <section className={styles.stories} aria-label="Conheça a DayTrade">
          <div className={styles.story}>
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}>UM TRABALHO COM PROPÓSITO</p>
              <h2>Seu talento pode abrir novos caminhos.</h2>
              <p>A DayTrade conecta empresas a soluções financeiras. Nosso trabalho começa por entender cada negócio e encontrar possibilidades para que ele siga em frente.</p>
              <p>Se você se identifica com esse olhar, queremos conhecer sua experiência e o que deseja construir na próxima etapa da sua carreira.</p>
              <Link className={styles.textLink} href="/sobre-nos">Conheça a DayTrade <span aria-hidden="true">↗</span></Link>
            </div>
            <div className={styles.storyPhoto}><Image src="/images/features/carreira-equipe.png" alt="Profissionais analisando informações em um notebook" fill sizes="(max-width: 767px) 90vw, 45vw" /></div>
          </div>
          <div className={`${styles.story} ${styles.reverse}`}>
            <div className={styles.storyPhoto}><Image src="/images/features/carreira-retrato-corporativo.png" alt="Conversa e troca de ideias em um ambiente de trabalho" fill sizes="(max-width: 767px) 90vw, 45vw" /></div>
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}>DIFERENTES TRAJETÓRIAS. NOVAS POSSIBILIDADES.</p>
              <h2>Há muito valor no que só você traz.</h2>
              <p>Experiências diferentes ampliam a forma de olhar para um desafio. Valorizamos a vontade de aprender, a escuta e a colaboração para transformar ideias em soluções.</p>
              <p>Do início da jornada aos próximos desafios profissionais, seu repertório faz parte dessa conversa.</p>
              <a className={styles.textLink} href="#candidate-se">Apresente sua trajetória <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>

        <section className={styles.values} aria-labelledby="values-title">
          <div className={styles.valuesHeading}><p className={styles.eyebrow}>O QUE NOS MOVE</p><h2 id="values-title">A forma de trabalhar<br />também importa.</h2></div>
          <div className={styles.valuesGrid}>{principles.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className={styles.belonging} aria-labelledby="belonging-title">
          <span className={styles.asterisk} aria-hidden="true">✳</span>
          <p className={styles.eyebrow}>ESPAÇO PARA NOVOS OLHARES</p>
          <h2 id="belonging-title">Uma boa equipe se constrói<br />com diferentes perspectivas.</h2>
          <p>Queremos conhecer pessoas, suas histórias e suas possibilidades. Apresente quem você é, o que já aprendeu e onde quer chegar.</p>
        </section>

        <div className={styles.waveDivider}><BrandWaves className={styles.bottomWaves} /></div>

        <section id="candidate-se" className={styles.application} aria-labelledby="application-title">
          <div className={styles.applicationCopy}>
            <p className={styles.eyebrow}>VAMOS NOS CONHECER</p>
            <h2 id="application-title">O próximo capítulo<br />pode começar <span>aqui.</span></h2>
            <p>Conte um pouco sobre você e envie seu currículo para futuras oportunidades na DayTrade.</p>
            <div className={styles.applicationNote}><span aria-hidden="true">↗</span><p>Este é um cadastro de interesse. O envio não está vinculado a uma vaga específica nem garante participação em um processo seletivo.</p></div>
          </div>
          <CareerForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
