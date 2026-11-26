import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { InternalHero } from "../../components/layout/InternalHero";
import { SpecialistContactButton } from "../../components/contact/SpecialistContact";
import styles from "./Sectors.module.css";
import careerStyles from "../carreira/Careers.module.css";

export const metadata: Metadata = {
  title: "Condomínios, Indústria e Construtora | Daytrade Invest",
  description:
    "Conheça as soluções financeiras da Daytrade para condomínios, indústrias e construtoras.",
};

const sectors = [
  {
    id: "condominios",
    label: "Condomínios",
    title: "Planejamento para cuidar do condomínio.",
    description:
      "Soluções financeiras para as despesas do dia a dia e os próximos projetos do condomínio.",
    image: "/images/setores-condominios.webp",
    imageAlt: "Edifícios de um condomínio residencial vistos de um pátio arborizado",
    paragraphs: [
      "Organize o fluxo de caixa para despesas recorrentes, como manutenção, segurança e conservação das áreas comuns. Um orçamento planejado ajuda a lidar com imprevistos e a manter os pagamentos em dia.",
      "Para reformas e melhorias, converse com um especialista sobre alternativas de crédito que se encaixem no orçamento e no cronograma do condomínio.",
    ],
  },
  {
    id: "industria",
    label: "Indústria",
    title: "Capital para a produção avançar.",
    description:
      "Soluções financeiras para manter a operação em movimento e preparar os próximos investimentos.",
    image: "/images/setores-industria.png",
    imageAlt: "Dois profissionais de capacete consultam um tablet no chão de fábrica",
    paragraphs: [
      "Tenha recursos para matéria-prima, folha de pagamento e custos fixos, sem travar a produção. Transforme duplicatas e vendas a prazo em caixa para ganhar previsibilidade no fluxo financeiro.",
      "Na hora de investir, conte com crédito estruturado para financiar máquinas, automação e a ampliação da capacidade da sua indústria.",
    ],
  },
  {
    id: "construtora",
    label: "Construtora",
    title: "Uma base sólida para cada obra.",
    description:
      "Crédito e planejamento alinhados ao cronograma, do canteiro ao próximo projeto.",
    image: "/images/setores-construtora.png",
    imageAlt: "Equipe de capacete e colete acompanha o trabalho em um canteiro de obras",
    paragraphs: [
      "Conte com capital para materiais, mão de obra e etapas do cronograma, sem deixar a obra desacelerar. Antecipe as parcelas das unidades vendidas e libere caixa para a próxima etapa do projeto.",
      "Do terreno aos lançamentos, encontre crédito estruturado para financiar novos projetos e a próxima fase do seu negócio.",
    ],
  },
];

export default function SectorsPage() {
  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <InternalHero
          id="sectors-title"
          className={styles.hero}
          fullBackground
          title="Condomínios, Indústria e Construtora."
          description="Soluções financeiras para a gestão de condomínios, a produção industrial e o andamento de obras."
          image="/images/setores-hero.png"
          imageAlt="Quatro profissionais conversando em um escritório"
        >
          <SpecialistContactButton>Fale com um especialista</SpecialistContactButton>
          <a className={styles.sectorsLink} href="#condominios">Conheça os setores <span aria-hidden="true">↓</span></a>
        </InternalHero>

        <section className={styles.intro} aria-labelledby="sectors-intro-title">
          <p className={styles.eyebrow}>Setores que movem negócios</p>
          <h2 id="sectors-intro-title">Soluções para administrar,<br />produzir e <span>construir.</span></h2>
          <p>{metadata.description}</p>
        </section>

        {sectors.map((sector, index) => (
          <section
            key={sector.id}
            id={sector.id}
            className={styles.sector}
            aria-labelledby={`${sector.id}-title`}
          >
            <div className={`${styles.story} ${index % 2 === 1 ? styles.reverse : ""}`}>
              <div className={styles.storyCopy}>
                <p className={styles.eyebrow}>{sector.label}</p>
                <h2 id={`${sector.id}-title`}>{sector.title}</h2>
                <p>{sector.description}</p>
                {sector.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <SpecialistContactButton className={`${careerStyles.textLink} ${styles.contactButton}`}>
                  Fale com um especialista <span aria-hidden="true">↗</span>
                </SpecialistContactButton>
              </div>
              <div className={styles.storyPhoto}>
                <Image src={sector.image} alt={sector.imageAlt} fill sizes="(max-width: 767px) 88vw, 45vw" />
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
