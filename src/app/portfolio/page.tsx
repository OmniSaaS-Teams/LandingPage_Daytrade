import type { Metadata } from "next";
import { InternalHero } from "../../components/layout/InternalHero";
import { SpecialistContactButton } from "../../components/contact/SpecialistContact";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import styles from "./Portfolio.module.css";

export const metadata: Metadata = {
  title: "Portfólio de Produtos | DayTrade",
  description:
    "Conheça o portfólio de produtos da DayTrade e as soluções financeiras para sua empresa.",
};

const exclusiveProducts = [
  {
    title: "Programa de benefício ao fornecedor",
    description:
      "Um programa que permite aos fornecedores dos nossos clientes antecipar os valores que têm a receber dessas empresas.",
  },
];

const products = [
  {
    title: "Capital de Giro",
    description:
      "Pague parcelado o décimo terceiro salário dos seus funcionários, ganhe desconto na compra de sua matéria-prima, parcele a compra das suas máquinas e equipamentos.",
  },
  {
    title: "Comissária",
    description:
      "Faça operações de antecipação de recebíveis para clientes que não aceitam pagar para terceiros, ou só pagam boletos em nome da sua empresa.",
  },
  {
    title: "Vendor",
    description:
      "Aumente seu faturamento tendo a possibilidade de vender mais para os seus clientes que possuem limite de crédito tomado na sua empresa.",
  },
  {
    title: "Escrow",
    description:
      "Tenha disponível uma conta-corrente para recebimento de clientes que não aceitam pagamento de terceiros. Desta forma, você pode concentrar um risco maior em operações de antecipação para esses clientes.",
  },
  {
    title: "Risco Sacado",
    description:
      "Conheça os benefícios de também ser sacado da DayTrade. Melhore seu fluxo de caixa tendo mais prazo de pagamento das suas duplicatas, indicando seus fornecedores para a DayTrade.",
  },
  {
    title: "Boleto Especial",
    description:
      "Para aquele cliente em que há vedação de negociação de títulos. Mande um boleto em seu nome em que o crédito irá para a DayTrade.",
  },
  {
    title: "Conta-Corrente",
    description:
      "Utilize nossa conta-corrente com todas as funcionalidades de um grande banco digital e aumente seus limites conosco.",
  },
  {
    title: "Conta Garantida",
    description:
      "Obtenha capital de giro parcelado para sua empresa, colocando títulos em garantia e recebendo seu recurso à vista.",
  },
  {
    title: "Fomento",
    description:
      "Receba o recurso para a compra de matéria-prima e produza sua mercadoria.",
  },
  {
    title: "Tranche",
    description:
      "Antecipe seus recebíveis sem a necessidade de sua mercadoria já estar entregue no seu cliente.",
  },
  {
    title: "Intercompany",
    description: "Faça operações entre as empresas do mesmo grupo.",
  },
  {
    title: "Nota Comercial",
    description: "Capital de giro com alíquota zero de IOF.",
  },
  {
    title: "Antecipação de Contratos",
    description:
      "Receba à vista os recebíveis futuros de contratos com prazos mais longos.",
  },
];

const serviceSections = [
  {
    id: "cambio",
    title: "Câmbio",
    products: [
      { title: "Câmbio para importação", description: "Soluções para pagamentos a fornecedores no exterior, de acordo com as necessidades de importação da sua empresa." },
      { title: "Câmbio para exportação", description: "Conversão de valores recebidos do exterior nas operações de exportação de produtos e serviços." },
      { title: "Remessas internacionais", description: "Envio e recebimento de recursos internacionais para compromissos e negócios da sua empresa." },
    ],
  },
  {
    id: "bpo-financeiro",
    title: "BPO Financeiro",
    products: [
      { title: "Contas a pagar", description: "Organização dos compromissos financeiros e da programação de pagamentos para acompanhar os vencimentos da empresa." },
      { title: "Contas a receber", description: "Acompanhamento dos recebimentos e das cobranças para dar mais clareza às entradas previstas no caixa." },
      { title: "Conciliação bancária", description: "Conferência das movimentações bancárias com os registros financeiros para identificar diferenças e manter as informações organizadas." },
      { title: "Fluxo de caixa", description: "Organização das entradas e saídas para apoiar o planejamento financeiro e a visão dos próximos compromissos." },
      { title: "Relatórios financeiros", description: "Consolidação das informações da rotina financeira para apoiar a análise dos resultados e a tomada de decisão." },
    ],
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <InternalHero
          id="portfolio-title"
          fullBackground
          title="Portfólio de Produtos"
          description="Conheça o portfólio de produtos da DayTrade e as soluções financeiras para sua empresa."
          image="/images/portfolio-products.webp"
          imageAlt="Profissional de negócios com uma caneta e um tablet nas mãos"
        >
          <SpecialistContactButton>Fale com um especialista</SpecialistContactButton>
          <a className={styles.productsLink} href="#produtos">Conheça nossos produtos <span aria-hidden="true">↓</span></a>
        </InternalHero>

        <div className={styles.container}>
          <section
            id="produtos"
            className={styles.exclusives}
            aria-labelledby="exclusive-products-title"
          >
            <h2 id="exclusive-products-title">
              Exclusividade da DayTrade
            </h2>
            <div className={styles.exclusiveGrid}>
              {exclusiveProducts.map((product) => (
                <article key={product.title} className={styles.product}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="credito"
            className={styles.products}
            aria-labelledby="credit-title"
          >
            <h2 id="credit-title">Crédito</h2>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <article key={product.title} className={styles.product}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </article>
              ))}
            </div>
          </section>
          {serviceSections.map((section) => (
            <section key={section.id} id={section.id} className={styles.products} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <div className={styles.productGrid}>
                {section.products.map((product) => (
                  <article key={product.title} className={styles.product}>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
