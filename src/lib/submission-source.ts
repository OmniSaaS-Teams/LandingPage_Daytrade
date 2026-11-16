import type { SubmissionKind } from "./submissions.ts";

const sources = {
  lead: { formulario: "seja_cliente", caminho: null, endpoint: "/api/leads" },
  investor: { formulario: "investidor", caminho: "/investidor", endpoint: "/api/investor-leads" },
  partner: { formulario: "parceiro_indicador", caminho: "/parceiro-indicador", endpoint: "/api/partner-leads" },
  contact: { formulario: "contato_whatsapp", caminho: null, endpoint: "/api/contacts" },
  career: { formulario: "carreira", caminho: "/carreira", endpoint: "/api/careers" },
} as const;

export function submissionSource(kind: SubmissionKind, data: Record<string, unknown>, request?: Request) {
  const source = sources[kind];
  let caminho: string | null = source.caminho;
  if (request) {
    const base = new URL(request.url);
    const pagePath = request.headers.get("X-Daytrade-Page-Path");
    const referrer = request.headers.get("referer");
    // Page location is attribution, not authentication. Keep only a local
    // pathname: no domain, query parameters or fragment from the browser.
    for (const candidate of [pagePath?.startsWith("/") ? pagePath : null, referrer]) {
      if (!candidate || candidate.length > 4096 || /[\x00-\x1f\x7f]/.test(candidate)) continue;
      try {
        const page = new URL(candidate, base);
        if (page.origin !== base.origin || page.pathname.length > 2048) continue;
        caminho = page.pathname;
        break;
      } catch { /* An invalid attribution must not prevent saving the form. */ }
    }
  }
  let formulario: string = source.formulario;
  if (kind === "investor") {
    if (data.origem === "simulador_investimento") formulario = "investidor_simulador";
    else if (data.origem === "solicitar_apresentacao") formulario = "investidor_apresentacao";
  }
  return { formulario, caminho_origem: caminho, endpoint_origem: source.endpoint };
}
