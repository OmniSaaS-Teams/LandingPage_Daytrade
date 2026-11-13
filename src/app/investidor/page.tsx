import type { Metadata } from "next";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { InternalHero } from "../../components/layout/InternalHero";
import { InvestmentSimulator, InvestorContactForm } from "./InvestorForms";
import styles from "./Investor.module.css";

export const metadata: Metadata = {
  title: "Investidor | DayTrade Invest",
  description: "Conheça a estrutura de investimento da DayTrade: recebíveis, política de alocação, gestão de risco e garantias. Simule seu investimento e converse com nossa equipe.",
};

const structure = [
  ["Política de investimento disciplinada", "Capital direcionado para operações estruturadas de compra de recebíveis e ativos financeiros, com critérios definidos de seleção e alocação."],
  ["Garantias vinculadas às operações", "Recebíveis como duplicatas, cheques e créditos originados de vendas reais compõem o lastro das operações."],
  ["Estratégia conservadora de risco", "A preservação do capital orienta a análise de risco, a gestão de liquidez e o acompanhamento de cada operação."],
  ["Foco em recebíveis performados", "Operações estruturadas sobre créditos existentes, originados de vendas e serviços já realizados por empresas."],
  ["Gestão ativa da carteira", "Diversificação entre empresas e setores, com monitoramento diário da liquidez e da performance dos ativos."],
  ["Qualificação rigorosa das partes", "Empresas cedentes e sacados passam por análise de crédito e de capacidade operacional antes de integrar a estrutura."],
];

const guarantees = [
  ["Lastro na economia real", "Os recursos estão vinculados a créditos originados de transações comerciais, como duplicatas e outros recebíveis."],
  ["Carteira diversificada", "A distribuição entre diferentes empresas e setores busca reduzir a concentração de risco."],
  ["Acompanhamento contínuo", "Liquidez e performance dos ativos são acompanhadas para orientar a gestão da carteira."],
  ["Alinhamento de interesses", "Uma estrutura que busca aproximar os interesses da empresa, de seus acionistas e dos investidores."],
];

const questions = [
  ["O que é investimento em recebíveis?", "É a alocação de recursos em créditos originados de vendas ou serviços realizados por empresas. Duplicatas, cheques e outros recebíveis comerciais servem como base para as operações estruturadas de investimento."],
  ["Como funciona a securitização de recebíveis?", "Recebíveis empresariais são utilizados como lastro para estruturar operações financeiras, permitindo a participação de investidores em renda fixa vinculada a créditos da economia real."],
  ["Como funcionam as garantias do investimento?", "As garantias estão vinculadas aos ativos e às condições de cada operação. A qualidade dos recebíveis, a análise das empresas envolvidas e o acompanhamento da carteira fazem parte da gestão de risco. A existência de garantias não elimina os riscos do investimento."],
  ["Como os recursos dos investidores são utilizados?", "Os recursos são direcionados para a compra de recebíveis empresariais e ativos financeiros vinculados a transações comerciais reais. A política de alocação e as condições devem ser consultadas na documentação da operação."],
  ["A operação envolve empréstimos tradicionais?", "O modelo apresentado é baseado em operações estruturadas sobre recebíveis originados de vendas e serviços realizados por empresas, em vez de empréstimos pessoais ou crédito direto."],
  ["Como o risco é gerenciado?", "Por meio da análise das empresas envolvidas, da diversificação entre setores, das garantias vinculadas às operações e do monitoramento contínuo da liquidez e da performance dos ativos."],
  ["Existe valor mínimo para investir?", "A referência inicial é de R$ 50.000,00. O valor mínimo, os prazos e as demais condições podem variar conforme a estrutura e a emissão. Consulte nossa equipe para conhecer as condições disponíveis."],
  ["Como iniciar um investimento?", "Simule o valor e o prazo desejados e solicite uma apresentação. Nossa equipe explica a estrutura e as condições disponíveis. A participação está sujeita à análise do perfil do investidor e à aprovação."],
];

export default function InvestorPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <InternalHero
          id="investor-title"
          title="Invista com uma visão mais clara do seu futuro."
          description="Conheça nossas debêntures estruturadas a partir de operações reais de antecipação de recebíveis, com garantias vinculadas e gestão ativa de risco."
          image="/images/features/investimento-executivo.png"
          imageAlt="Profissional analisando informações para uma decisão de investimento"
        >
          <a href="#investimento">Simular investimento <span aria-hidden="true">↗</span></a>
          <a href="#politica">Conheça nossa política</a>
        </InternalHero>

        <nav className={styles.sectionNav} aria-label="Nesta página">
          <a href="#politica">Política de investimento</a>
          <a href="#estrutura">Nossa estrutura</a>
          <a href="#garantias">Garantias e gestão</a>
          <a href="#investimento">Simulador</a>
          <a href="#faq">Dúvidas frequentes</a>
        </nav>

        <section id="politica" className={styles.policy} aria-labelledby="policy-title">
          <div className={styles.container}>
            <div className={styles.twoColumns}>
              <div>
                <p className={styles.eyebrow}>Seja nosso investidor</p>
                <h2 id="policy-title">Seu capital conectado à economia real.</h2>
              </div>
              <div className={styles.policyCopy}>
                <p>Uma estrutura de renda fixa que direciona recursos à compra de recebíveis e ativos financeiros. Por trás de cada operação, existem créditos originados de vendas e serviços realizados por empresas.</p>
                <p>A seleção dos ativos, as garantias vinculadas e o acompanhamento da carteira orientam nossa política de investimento, com foco em transparência e controle de risco.</p>
                <a className={styles.textLink} href="#contato">Receber a apresentação completa <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className={styles.pillars}>
              <div><span>01 / Lastro</span><h3>Ativos reais</h3><p>Recebíveis e garantias vinculadas à estrutura de cada operação.</p></div>
              <div><span>02 / Gestão</span><h3>Controle diário</h3><p>Acompanhamento da carteira, da liquidez e da performance dos ativos.</p></div>
              <div><span>03 / Relação</span><h3>Mais clareza</h3><p>Informações sobre a estrutura para apoiar sua decisão de investir.</p></div>
            </div>
          </div>
        </section>

        <section id="estrutura" className={styles.structure} aria-labelledby="structure-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Como o investimento é estruturado</p>
              <h2 id="structure-title">Critérios em cada etapa.<br />Acompanhamento em cada operação.</h2>
              <p>Da seleção dos recebíveis à gestão da carteira, conheça os pilares que orientam a alocação dos recursos.</p>
            </div>
            <div className={styles.structureGrid}>
              {structure.map(([title, description], index) => (
                <article key={title}>
                  <span className={styles.number}>0{index + 1}</span>
                  <h3>{title}</h3><p>{description}</p>
                </article>
              ))}
            </div>
            <a className={styles.textLink} href="#contato">Conheça a estrutura completa <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section id="garantias" className={styles.guarantees} aria-labelledby="guarantees-title">
          <div className={`${styles.container} ${styles.twoColumns}`}>
            <div className={styles.guaranteeIntro}>
              <p className={styles.eyebrow}>Garantias e gestão de risco</p>
              <h2 id="guarantees-title">Confiança começa com entender onde você investe.</h2>
              <p>Critérios de análise, diversificação e monitoramento para acompanhar os ativos que sustentam a operação.</p>
              <a className={styles.textLink} href="#faq">Tire suas dúvidas <span aria-hidden="true">↗</span></a>
            </div>
            <div className={styles.guaranteeList}>
              {guarantees.map(([title, description], index) => (
                <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        <section id="investimento" className={styles.simulator} aria-labelledby="simulation-title">
          <div className={styles.container}>
            <InvestmentSimulator />
          </div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div className={`${styles.container} ${styles.faqGrid}`}>
            <div><p className={styles.eyebrow}>Antes de investir</p><h2 id="faq-title">Informação para decidir com clareza.</h2><p>Entenda a operação, os critérios e os próximos passos.</p></div>
            <div className={styles.questions}>
              {questions.map(([question, answer], index) => (
                <details key={question} open={index === 0}>
                  <summary>{question}<span aria-hidden="true">+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className={styles.contact} aria-labelledby="contact-title">
          <div className={`${styles.container} ${styles.twoColumns}`}>
            <div><p className={styles.eyebrow}>Vamos conversar</p><h2 id="contact-title">Conheça os detalhes.<br />Avalie as possibilidades.</h2><p>Solicite uma apresentação da estrutura de investimento. Nossa equipe entra em contato para entender seu momento e esclarecer suas dúvidas.</p><a className={styles.textLink} href="https://wa.me/5515981166112?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20investimento" target="_blank" rel="noopener noreferrer">Prefiro conversar pelo WhatsApp <span aria-hidden="true">↗</span></a></div>
            <InvestorContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
