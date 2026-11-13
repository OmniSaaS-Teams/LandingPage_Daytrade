const failureMessage = "Não foi possível confirmar o envio. Tente novamente em instantes.";
// Same destination as the supplied investor landing page; override per environment when needed.
const referenceWebhook = "https://n8n.omnisaas.com.br/stg/fb5e9f6a-5690-4fce-9a1f-cc88f57ef134";
const profiles = ["Investidor pessoa física", "Investidor pessoa jurídica", "Parceiro comercial", "Outro"];

export async function POST(request: Request) {
  let data: unknown;
  try { data = await request.json(); }
  catch { return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({ error: "Dados inválidos. Verifique o formulário." }, { status: 400 });
  }
  const fields = data as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const nome = text("nome");
  const email = text("email");
  const origem = text("origem");
  const pagina_origem = text("pagina_origem");
  if (!nome || nome.length > 200 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Informe seu nome e um e-mail válido." }, { status: 400 });
  }
  if (pagina_origem.length > 2048) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  const payload: Record<string, unknown> = { nome, email, origem, pagina_origem };
  if (origem === "simulador_investimento") {
    const telefone = text("telefone").replace(/[\s()+.-]/g, "");
    const valor = fields.valor;
    const periodo = text("periodo");
    if (!/^\d{10,15}$/.test(telefone) || typeof valor !== "number" || !Number.isFinite(valor) || valor < 50000 || valor > 1_000_000_000 || !["1", "3", "5"].includes(periodo)) {
      return Response.json({ error: "Verifique o telefone com DDD, o valor mínimo de R$ 50.000,00 e o prazo." }, { status: 400 });
    }
    Object.assign(payload, { telefone, valor, periodo });
  } else if (origem === "solicitar_apresentacao" && profiles.includes(text("perfil"))) {
    payload.perfil = text("perfil");
  } else {
    return Response.json({ error: "Selecione um perfil e verifique o formulário." }, { status: 400 });
  }
  try {
    const response = await fetch(process.env.N8N_INVESTOR_WEBHOOK_URL || referenceWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return Response.json({ error: failureMessage }, { status: 502 });
    return Response.json({ success: true });
  } catch { return Response.json({ error: failureMessage }, { status: 502 }); }
}
