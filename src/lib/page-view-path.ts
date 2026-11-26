const publicPages = new Set([
  "/",
  "/area-do-cliente",
  "/blog",
  "/carreira",
  "/investidor",
  "/parceiro-indicador",
  "/portfolio",
  "/setores",
  "/setores/agronegocio",
  "/setores/condominios",
  "/setores/construtora",
  "/setores/industria",
  "/sobre-nos",
]);
const blogPrefix = "/blog/";
const maxArticlePathLength = blogPrefix.length + 180;

export function pageViewPath(value: string | null) {
  if (!value || value.length > maxArticlePathLength + 1) return null;
  const path = value.length > 1 ? value.replace(/\/$/, "") : value;
  if (publicPages.has(path)) return path;
  return path.length <= maxArticlePathLength && /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ? path : null;
}
