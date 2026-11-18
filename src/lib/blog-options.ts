export const blogCovers = [
  { path: "/images/hero-office.png", label: "Escritório Daytrade" },
  { path: "/images/features/credito-escritorio.png", label: "Crédito e negócios" },
  { path: "/images/features/cambio.png", label: "Câmbio" },
  { path: "/images/features/bpo.png", label: "Gestão financeira" },
  { path: "/images/features/investimento-executivo.png", label: "Investimento" },
];
export const blogCategories = ["Crédito", "Câmbio", "Investimentos", "Gestão financeira", "Institucional"];
export function validatePost(fields: Record<string, string>) {
  return fields.title.length >= 3 && fields.title.length <= 180 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug) && fields.slug.length <= 180 && fields.excerpt.length >= 10 && fields.excerpt.length <= 400 && fields.content.length >= 30 && fields.content.length <= 100000 && blogCategories.includes(fields.category) && blogCovers.some(cover => cover.path === fields.cover);
}
