import { captureSubmission } from "../../../lib/submissions.ts";
import { readJson, BodyTooLargeError } from "../../../lib/read-json.ts";

const leadContext = {
  idEmpresa: "001",
  empresa: "Daytrade",
  idProduto: "10",
  descricaoProduto: "Antecipação de Recebíveis",
  idCampanha: "1001",
  descricaoCampanha: "Google Ads",
};

export async function POST(request: Request) {
  let data: unknown;

  try {
    data = await readJson(request);
  } catch (error) {
    if (error instanceof BodyTooLargeError) return Response.json({ error: "Formulário excede o tamanho permitido." }, { status: 413 });
    return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 });
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 });
  }

  const fields = data as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const lead = {
    nome: text("nome"),
    razaoSocial: text("razaoSocial"),
    cnpj: text("cnpj").replace(/[.\s\/-]/g, "").toUpperCase(),
    telefone: text("telefone").replace(/[\s()+.-]/g, ""),
    email: text("email"),
  };

  if (!lead.nome || lead.nome.length > 200 || !lead.razaoSocial || lead.razaoSocial.length > 300) {
    return Response.json({ error: "Preencha o Nome e a Razão Social." }, { status: 400 });
  }

  if (!/^[A-Z0-9]{12}\d{2}$/.test(lead.cnpj)) {
    return Response.json({ error: "Informe um CNPJ com 14 caracteres." }, { status: 400 });
  }

  if (!/^\d{10,15}$/.test(lead.telefone)) {
    return Response.json({ error: "Informe um telefone com DDD." }, { status: 400 });
  }

  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  return captureSubmission("lead", { ...leadContext, ...lead });
}
