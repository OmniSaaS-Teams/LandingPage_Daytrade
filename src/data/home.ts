import heroImage from "../../public/images/hero-office.png";

export const siteContent = {
  brand: {
    name: "DayTrade",
    logo: {
      src: "/images/daytrade-logo-home.png",
      alt: "DayTrade",
      width: 515,
      height: 167,
    },
  },
  navigation: [
    { label: "DayTrade", type: "menu" },
    { label: "Portfólio", type: "link", href: "/portfolio" },
    { label: "Investimento", type: "demo" },
    { label: "Setores", type: "menu" },
    { label: "Carreira", type: "link", href: "/carreira" },
    { label: "Blog", type: "demo" },
  ],
  actions: {
    login: "Log in",
    primary: "Start now",
  },
  hero: {
    compliance: "CNPJ: 29.270.075/0001-74 - DayTrade Invest Securitizadora S/A",
    complianceHref: "/security",
    title: "Crédito Inteligente.",
    description:
      "Estruturamos soluções de crédito sob medida para empresas que buscam capital com agilidade, segurança e condições competitivas, do primeiro contato à liberação dos recursos.",
    cta: "Fale com um especialista",
    ctaHref: "/login",
    ctaNote: "**Sujeito à análise de crédito",
    trusted: "Atendimento em Sorocaba e Região.",
    image: {
      src: heroImage,
      alt: "",
    },
  },
  feedback: {
    contact: "Funcionalidade de contato disponível em breve.",
    navigation: "Esta área será disponibilizada em uma próxima etapa.",
  },
};
