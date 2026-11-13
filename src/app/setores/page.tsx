import type { Metadata } from "next";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { InternalHero } from "../../components/layout/InternalHero";
import { CallToAction } from "../../components/sections/CTA/cta";
import styles from "./Sectors.module.css";

export const metadata: Metadata = {
  title: "Agro, Indústria e Construtora | DayTrade Invest",
  description:
    "Conheça as soluções financeiras da DayTrade para o agronegócio, a indústria e a construção em um só lugar.",
};

const sectors = [
  {
    id: "agronegocio",
    label: "Agro",
    title: "Recursos no ritmo da sua safra.",
    description:
      "Planejamento e crédito para acompanhar cada ciclo, do plantio à expansão do negócio.",
    tone: "mint",
    solutions: [
      { title: "Custeio da produção", description: "Antecipe recebíveis da safra e tenha capital para insumos, sementes e operação no momento certo." },
      { title: "Planejamento financeiro", description: "Alinhe entradas e saídas ao calendário do campo e reduza o descompasso entre gastos e recebimentos." },
      { title: "Expansão do negócio", description: "Financie máquinas, tecnologia e novas áreas com uma estrutura de crédito pensada para o agro." },
    ],
  },
  {
    id: "industria",
    label: "Indústria",
    title: "Capital para a produção avançar.",
    description:
      "Soluções financeiras para manter a operação em movimento e preparar os próximos investimentos.",
    tone: "blue",
    solutions: [
      { title: "Capital de giro", description: "Recursos para matéria-prima, folha de pagamento e custos fixos, sem travar a produção." },
      { title: "Máquinas e expansão", description: "Transforme duplicatas e vendas a prazo em caixa e ganhe previsibilidade no fluxo financeiro." },
      { title: "Gestão de caixa", description: "Financie máquinas, automação e ampliação da capacidade com crédito estruturado para a indústria." },
    ],
  },
  {
    id: "construtora",
    label: "Construtora",
    title: "Uma base sólida para cada obra.",
    description:
      "Crédito e planejamento alinhados ao cronograma, do canteiro ao próximo projeto.",
    tone: "lavender",
    solutions: [
      { title: "Financiamento de obras", description: "Capital para materiais, mão de obra e etapas do cronograma, sem deixar a obra desacelerar." },
      { title: "Antecipação de recebíveis", description: "Antecipe as parcelas das unidades vendidas e libere caixa para a próxima etapa do projeto." },
      { title: "Novos projetos", description: "Financie terrenos, lançamentos e a próxima fase do negócio com crédito estruturado para o setor." },
    ],
  },
];

export default function SectorsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <InternalHero
          id="sectors-title"
          title="Agro, Indústria e Construtora."
          description="Soluções financeiras para planejar, produzir e construir os próximos passos do seu negócio."
          image="/images/portfolio-products.webp"
          imageAlt="Profissional planejando negócios com uma caneta e um tablet"
        >
          <a href="#agronegocio">Agro ↓</a>
          <a href="#industria">Indústria ↓</a>
          <a href="#construtora">Construtora ↓</a>
        </InternalHero>
        {sectors.map((sector, index) => (
          <section
            key={sector.id}
            id={sector.id}
            className={`${styles.sector} ${styles[sector.tone]}`}
            aria-labelledby={`${sector.id}-title`}
          >
            <div className={styles.sectorHeading}>
              <div>
                <p className={styles.eyebrow}>
                  <span className={styles.sectorNumber}>0{index + 1}</span>
                  {sector.label}
                </p>
                <h2 id={`${sector.id}-title`}>{sector.title}</h2>
              </div>
              <p className={styles.sectorDescription}>{sector.description}</p>
            </div>
            <div className={styles.solutionGrid}>
              {sector.solutions.map((solution) => (
                <article key={solution.title} className={styles.solutionCard}>
                  <h3>{solution.title}</h3>
                  <p>{solution.description}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
        <CallToAction
          id="sectors-cta"
          highlight="Seu próximo passo começa com uma conversa."
          title="Encontre a solução financeira para o seu negócio."
          primaryLabel="Fale com um especialista"
          primaryHref="/#faq"
          secondaryLabel="Conheça a DayTrade"
          secondaryHref="/sobre-nos"
          showPixels={false}
          variant="blue"
        />
      </main>
      <Footer />
    </>
  );
}
