import { captureSubmission } from "../../../lib/submissions.ts";
import { readJson, BodyTooLargeError } from "../../../lib/read-json.ts";
import { simulateInvestment, type InvestmentSimulation } from "../../../lib/investment-simulation.ts";

const profiles = ["Investidor pessoa física", "Investidor pessoa jurídica", "Parceiro comercial", "Outro"];

export async function POST(request: Request) {
  let data: unknown;
  try { data = await readJson(request); }
  catch (error) { return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: error instanceof BodyTooLargeError ? 413 : 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 });
  }
  const fields = data as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const nome = text("nome");
  const email = text("email").toLowerCase();
  const origem = text("origem");
  const pagina_origem = text("pagina_origem");
  if (!nome || nome.length > 200 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Informe seu nome e um e-mail válido." }, { status: 400 });
  }
  if (pagina_origem.length > 2048) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  const payload: Record<string, unknown> = { nome, email, origem, pagina_origem };
  let simulation: InvestmentSimulation | undefined;
  if (origem === "simulador_investimento") {
    const telefone = text("telefone").replace(/[\s()+.-]/g, "");
    const valor = fields.valor;
    const periodo = text("periodo");
    if (!/^\d{10,15}$/.test(telefone) || typeof valor !== "number" || !Number.isFinite(valor) || valor < 50000 || valor > 1_000_000_000 || !["1", "3", "5"].includes(periodo)) {
      return Response.json({ error: "Verifique o telefone com DDD, o valor mínimo de R$ 50.000,00 e o prazo." }, { status: 400 });
    }
    simulation = simulateInvestment(valor, Number(periodo));
    Object.assign(payload, { telefone, valor, periodo, simulacao: simulation });
  } else if (origem === "solicitar_apresentacao" && profiles.includes(text("perfil"))) {
    payload.perfil = text("perfil");
  } else {
    return Response.json({ error: "Selecione um perfil e verifique o formulário." }, { status: 400 });
  }
  const response = await captureSubmission("investor", payload, undefined, request);
  if (!response.ok || !simulation) return response;
  return Response.json({ ...await response.json(), simulation }, { headers: { "Cache-Control": "no-store" } });
}
