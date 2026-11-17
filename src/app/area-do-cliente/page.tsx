import { InternalHero } from "../../components/layout/InternalHero";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { CallToAction } from "../../components/sections/CTA/cta";
import styles from "../setores/industria/Industry.module.css";
import clientStyles from "./ClientArea.module.css";

const capabilities = [
  "Visão financeira",
  "Fluxo de caixa",
  "Documentos",
  "Solicitações",
  "Acompanhamento",
  "Atendimento",
];

type ClientResource = {
  eyebrow: string;
  title: string;
  description: string;
  tone: "blue" | "mint" | "lavender";
  href?: string;
  actionLabel?: string;
};

const highlights: ClientResource[] = [
  {
    eyebrow: "Banco Digital",
    title: "Acesse seu Banco Digital DayTrade.",
    description:
      "Entre no ambiente do Banco Digital da DayTrade para acessar sua conta.",
    tone: "blue",
    href: "https://daytrade.hub.moneyp.com.br/acesso",
    actionLabel: "Acessar Banco Digital",
  },
  {
    eyebrow: "Carteira de recebíveis",
    title: "Consulte sua carteira de recebíveis.",
    description:
      "Acesse o portal para visualizar sua carteira de recebíveis e consultar as informações dos seus títulos.",
    tone: "mint",
    href: "https://iwbarecebiveis.wba.com.br/iwba/pages/index.jsf",
    actionLabel: "Acessar minha carteira",
  },
  {
    eyebrow: "Carteira de investimentos",
    title: "Acompanhe sua carteira de investimentos.",
    description:
      "Acesse o portal para visualizar sua carteira e consultar as informações dos seus investimentos.",
    tone: "lavender",
    href: "https://auth.wba.com.br/realms/portal/protocol/openid-connect/auth?client_id=portal-angular&redirect_uri=https%3A%2F%2Fportal.wba.com.br%2F4d9f09bb-b532-4ad0-8f39-b0d9bf957033&state=be655c5e-9940-47b9-929d-dd4dfa469645&response_mode=fragment&response_type=code&scope=openid&nonce=476ae6a6-ae89-466d-8038-75bd709712e6",
    actionLabel: "Acessar meus investimentos",
  },
  {
    eyebrow: "Acesso comercial",
    title: "Acesse seu ambiente comercial.",
    description: "Entre no portal comercial da DayTrade para acessar seu ambiente de trabalho.",
    tone: "blue",
    href: "https://new.wba.com.br/login/5d42d85f-87a1-4acb-ad77-8eea77ae2ee6",
    actionLabel: "Acessar portal comercial",
  },
  {
    eyebrow: "Assinatura Digital",
    title: "Acesse a plataforma de assinatura digital.",
    description: "Entre na plataforma para acessar e assinar seus documentos digitalmente.",
    tone: "mint",
    href: "https://plataforma.crdc.com.br:8443/",
    actionLabel: "Acessar Assinatura Digital",
  },
  {
    eyebrow: "Trokee",
    title: "Antecipação e gestão de recebíveis.",
    description: "Acesse a plataforma Trokee para antecipação de recebíveis, gestão de ativos elegíveis e risco sacado.",
    tone: "lavender",
    href: "https://www.trokee.com.br/",
    actionLabel: "Acessar Trokee",
  },
];

const benefits = [
  ["Mais visibilidade", "Entenda o cenário atual com informações organizadas e fáceis de consultar."],
  ["Menos idas e vindas", "Acompanhe solicitações e documentos sem precisar procurar em diferentes canais."],
  ["Próximos passos claros", "Saiba o que está em andamento e quais decisões merecem sua atenção."],
  ["Relação próxima", "Conte com a DayTrade em uma experiência construída para acompanhar seu negócio."],
];

function ClientDashboard() {
  return (
    <div className={styles.dashboard} aria-hidden="true">
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardBrand}><span>D</span> DayTrade</div>
        <div className={styles.dashboardHeaderActions}><i /><i /><b>Meu perfil</b></div>
      </div>
      <div className={styles.dashboardBody}>
        <aside className={styles.dashboardSidebar}>
          <span className={styles.sidebarActive}>Visão geral</span>
          <span>Minha operação</span>
          <span>Solicitações</span>
          <span>Documentos</span>
          <span>Atendimento</span>
        </aside>
        <div className={styles.dashboardContent}>
          <div className={styles.dashboardTitle}>
            <div><strong>Olá, Marcos</strong><span>Veja o resumo da sua operação</span></div>
            <button type="button">+ Nova solicitação</button>
          </div>
          <div className={styles.metrics}>
            <div><span>Solicitações ativas</span><strong>03</strong><em>Atualizado hoje</em></div>
            <div><span>Documentos recentes</span><strong>12</strong><em>↑ 4 esta semana</em></div>
            <div><span>Próxima conversa</span><strong>14:30</strong><em>Quinta-feira</em></div>
          </div>
          <div className={styles.chartPanel}>
            <div className={styles.chartHeading}><span>Atividades recentes</span><small>Últimos 30 dias</small></div>
            <div className={styles.chartArea}>
              <svg viewBox="0 0 800 220" preserveAspectRatio="none" role="presentation">
                <defs>
                  <linearGradient id="client-area-chart-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1e78a7" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#1e78a7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 177 C68 158 111 165 177 138 S276 145 349 100 S439 118 518 78 S638 92 703 48 S755 36 800 24 L800 220 L0 220 Z" fill="url(#client-area-chart-fill)" />
                <path d="M0 177 C68 158 111 165 177 138 S276 145 349 100 S439 118 518 78 S638 92 703 48 S755 36 800 24" fill="none" stroke="#1e78a7" strokeWidth="4" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className={styles.chartAxis}><span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span><span>Hoje</span><span>Próximo passo</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientAreaPage() {
  return (
    <>
      <Navbar background="gradient" />
      <main className={styles.page}>
        <InternalHero
          fullBackground
          id="client-area-title"
          title="Área do Cliente"
          description="Acompanhe sua relação com a DayTrade de forma simples, com mais contexto para cada conversa, solicitação e próximo passo."
          image="/images/portfolio-products.webp"
          imageAlt="Profissional utilizando um tablet para acompanhar informações"
        >
          <a href="#acessar-area">Acessar minha área</a>
          <a href="#recursos">Conheça os recursos</a>
        </InternalHero>
        <div className={clientStyles.preview}><ClientDashboard /></div>

        <section className={styles.capabilityStrip} aria-label="Recursos disponíveis">
          <div>{capabilities.concat(capabilities).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
        </section>

        <section id="recursos" className={styles.solutions} aria-labelledby="resources-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>O que você encontra</p>
            <h2 id="resources-title">Uma experiência feita para deixar cada decisão mais próxima.</h2>
            <p>Da visão financeira ao acompanhamento de solicitações, sua Área do Cliente reúne o contexto que ajuda a seguir em frente.</p>
          </div>
          <div className={styles.solutionGrid}>
            {highlights.map((highlight, index) => (
              <article key={highlight.eyebrow} className={`${styles.solutionCard} ${styles[highlight.tone]} ${clientStyles.resourceCard}`}>
                <div className={styles.solutionVisual}><span>0{index + 1}</span><i /><i /><i /></div>
                <p>{highlight.eyebrow}</p>
                <h3>{highlight.title}</h3>
                <span className={clientStyles.resourceDescription}>{highlight.description}</span>
                {highlight.href ? (
                  <a className={clientStyles.resourceAction} href={highlight.href}>{highlight.actionLabel ?? "Conhecer"} <b aria-hidden="true">→</b></a>
                ) : (
                  <button className={clientStyles.resourceAction} type="button" disabled title="Link a definir">Conhecer <b aria-hidden="true">→</b></button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.context} aria-labelledby="context-title">
          <div className={styles.contextIntro}>
            <p className={styles.eyebrow}>Acompanhamento sem ruído</p>
            <h2 id="context-title">Uma visão clara para saber o que precisa da sua atenção.</h2>
            <p>Organizamos informações relevantes para que você acompanhe a operação e aproveite melhor cada conversa com a DayTrade.</p>
            <a href="#acessar-area">Explorar a Área do Cliente <span>→</span></a>
          </div>
          <div className={styles.contextVisual} aria-hidden="true">
            <div className={styles.contextTop}><span>Próximos passos</span><i /></div>
            <div className={styles.contextRows}>
              <div><i /><span><b>Documentos solicitados</b><small>2 itens pendentes</small></span><em>Ver agora</em></div>
              <div><i /><span><b>Conversa com especialista</b><small>Quinta-feira, 14:30</small></span><em>Detalhes</em></div>
              <div><i /><span><b>Atualização da operação</b><small>Disponível hoje</small></span><em>Acessar</em></div>
            </div>
          </div>
        </section>

        <section className={styles.benefits} aria-labelledby="benefits-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Feita para o seu dia a dia</p>
            <h2 id="benefits-title">Mais contexto para cuidar melhor das decisões do seu negócio.</h2>
          </div>
          <div className={styles.benefitGrid}>
            {benefits.map(([title, description], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <div id="acessar-area">
          <CallToAction
            id="client-area-cta"
            highlight="Sua operação merece uma visão mais próxima."
            title="Acesse a Área do Cliente e acompanhe seus próximos passos."
            primaryLabel="Acessar minha área"
            primaryHref="#acessar-area"
            secondaryLabel="Falar com a DayTrade"
            secondaryHref="/#faq"
            note="Caso precise de ajuda, nossa equipe está pronta para conversar."
            showPixels={false}
            variant="blue"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
