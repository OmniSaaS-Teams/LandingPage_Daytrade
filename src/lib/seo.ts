import type { Metadata } from "next";
import { brand } from "../data/brand";

const defaultSiteUrl = "https://daytradeinvest.com.br";
export const metadataBase = new URL(new URL(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).origin);

export function siteUrl(path: string) {
  return new URL(path, metadataBase).href;
}

export const homeTitle = "Crédito para empresas | Daytrade Invest";
export const homeDescription = "Crédito para empresas em Sorocaba e região. A Daytrade Invest oferece antecipação de recebíveis e capital de giro. Solicite uma análise de crédito.";

export const socialImage = {
  url: siteUrl("/imagem-social.png"),
  width: 1200,
  height: 630,
  alt: "Daytrade Invest — Crédito para empresas",
};

export const publicPages = {
  "/": { title: homeTitle, description: homeDescription },
  "/sobre-nos": {
    title: "Sobre a Daytrade Invest | Securitizadora em Sorocaba",
    description: brand.description,
  },
  "/portfolio": {
    title: "Crédito, câmbio e BPO financeiro | Daytrade Invest",
    description: "Conheça as soluções da Daytrade Invest para empresas, incluindo capital de giro, antecipação de recebíveis, câmbio e BPO financeiro.",
  },
  "/investidor": {
    title: "Investimentos e política de risco | Daytrade Invest",
    description: "Conheça a política de investimento da Daytrade Invest, a alocação de recursos, os controles de risco e as garantias para investidores.",
  },
  "/setores": {
    title: "Crédito por setor | Daytrade Invest",
    description: "Conheça as soluções financeiras da Daytrade para o agronegócio, a indústria e a construção em um só lugar.",
  },
  "/parceiro-indicador": {
    title: "Parceiro indicador | Daytrade Invest",
    description: "Conheça o programa de indicação de clientes da Daytrade Invest e cadastre seu interesse em fazer parte da rede de parceiros.",
  },
  "/carreira": {
    title: "Carreira e envio de currículo | Daytrade Invest",
    description: "Conheça a cultura da Daytrade Invest e envie seu currículo para futuras oportunidades na equipe.",
  },
  "/blog": {
    title: "Blog de finanças para empresas | Daytrade Invest",
    description: "Leia artigos da Daytrade Invest sobre crédito, câmbio, investimentos e gestão financeira para empresas.",
  },
  "/area-do-cliente": {
    title: "Área do cliente | Daytrade Invest",
    description: "Acesse os portais da Daytrade para consultar recebíveis, usar o banco digital e encontrar outros serviços da área do cliente.",
  },
};

export function pageMetadata(
  path: string,
  { title, description }: { title: string; description: string },
  article?: { publishedTime?: string; modifiedTime?: string },
): Metadata {
  const url = siteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: brand.name,
      locale: "pt_BR",
      images: [socialImage],
      ...(article ? { type: "article", ...article } : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export function publicPageMetadata(path: keyof typeof publicPages) {
  return pageMetadata(path, publicPages[path]);
}
