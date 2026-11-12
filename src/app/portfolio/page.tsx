import type { Metadata } from "next";
import Image from "next/image";
import portfolioImage from "../../../public/images/portfolio-products.webp";
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
    title: "Folha Flex",
    description:
      "Tenha sua folha de pagamento e seu vale garantidos todos os meses.",
  },
  {
    title: "Novo Crédito",
    description:
      "Receba recursos para regularizar seu CNPJ nos cartórios com pagamento parcelado.",
  },
  {
    title: "Mãos à Obra",
    description:
      "Obtenha recursos para iniciar sua obra com garantias reais dos sócios ou de terceiros, permitindo prazos estendidos para pagamento sem impactar o caixa da empresa.",
  },
];

const products = [
  {
    title: "Capital de Giro",
    description:
      "Pague parcelado seu décimo terceiro salário dos funcionários, ganhe desconto na compra de sua matéria-prima, parcele a compra das suas máquinas e equipamentos.",
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
    title: "Conta Corrente",
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
    title: "CPR",
    description:
      "São operações onde a CPR financeira (Cédula do Produtor Rural) é colocada em garantia.",
  },
  {
    title: "Barter",
    description:
      "Para clientes do agronegócio que recebem seus pagamentos em mercadoria.",
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

export default function PortfolioPage() {
  return (
    <>
      <Navbar variant="light" />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="portfolio-title">
          <div className={`${styles.container} ${styles.heroContent}`}>
            <h1 id="portfolio-title">
              Portfólio de
              <br />
              Produtos
            </h1>
            <Image
              src={portfolioImage}
              alt="Profissional de negócios com uma caneta e um tablet nas mãos"
              sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 900px) 52vw, 470px"
              preload
              className={styles.heroImage}
            />
          </div>
        </section>

        <div className={styles.container}>
          <section
            className={styles.exclusives}
            aria-labelledby="exclusive-products-title"
          >
            <h2 id="exclusive-products-title">
              Exclusivos
              <br />
              DayTrade
            </h2>
            <div className={styles.productGrid}>
              {exclusiveProducts.map((product) => (
                <article key={product.title} className={styles.product}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            className={styles.products}
            aria-labelledby="products-title"
          >
            <h2 id="products-title">Produtos</h2>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <article key={product.title} className={styles.product}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
