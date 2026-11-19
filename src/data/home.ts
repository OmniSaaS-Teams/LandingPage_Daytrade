import heroImage from "../../public/images/hero-office.png";

export const siteContent = {
  brand: {
    name: "Daytrade",
    logo: {
      src: "/images/daytrade-logo-home.png",
      alt: "Daytrade",
      width: 515,
      height: 167,
    },
  },
  navigation: [
    { label: "Daytrade", type: "menu" },
    { label: "Portfólio", type: "link", href: "/portfolio" },
    { label: "Investidor", type: "link", href: "/investidor" },
    { label: "Setores", type: "menu" },
    { label: "Carreira", type: "link", href: "/carreira" },
    { label: "Blog", type: "link", href: "/blog" },
  ],
  actions: {
    login: "Log in",
    primary: "Start now",
  },
  hero: {
    compliance: "29.270.075/0001-74 - Daytrade Invest Securitizadora S/A",
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
