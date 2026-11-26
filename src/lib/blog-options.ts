export const blogCovers = [
  { path: "/images/hero-office.png", label: "Escritório Daytrade", alt: "Profissional ao telefone em um escritório" },
  { path: "/images/features/credito-escritorio.png", label: "Crédito e negócios", alt: "Duas pessoas consultam um notebook com um cartão na mão" },
  { path: "/images/features/cambio.png", label: "Câmbio", alt: "Homem observa um avião pela janela de um escritório" },
  { path: "/images/features/bpo.png", label: "Gestão financeira", alt: "Três profissionais trabalham juntos diante de um notebook" },
  { path: "/images/features/investimento-executivo.png", label: "Investimento", alt: "Executivo de terno com os braços cruzados" },
];
export function blogCoverAlt(path: string) {
  return blogCovers.find(cover => cover.path === path)?.alt ?? "";
}
export const blogCategories = ["Crédito", "Câmbio", "Investimentos", "Gestão financeira", "Institucional"];
export function validatePost(fields: Record<string, string>) {
  return fields.title.length >= 3 && fields.title.length <= 180 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug) && fields.slug.length <= 180 && fields.excerpt.length >= 10 && fields.excerpt.length <= 400 && fields.content.length >= 30 && fields.content.length <= 100000 && blogCategories.includes(fields.category) && blogCovers.some(cover => cover.path === fields.cover);
}
