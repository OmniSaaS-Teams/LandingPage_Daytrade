import { captureSubmission } from "../../../lib/submissions.ts";
import { readJson, BodyTooLargeError } from "../../../lib/read-json.ts";

export async function POST(request: Request) {
  let value: unknown;
  try { value = await readJson(request); } catch (error) { return Response.json({ error: "Dados inválidos." }, { status: error instanceof BodyTooLargeError ? 413 : 400 }); }
  if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  const fields = value as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const nome = text("nome"), empresa = text("empresa"), telefone = text("telefone").replace(/[\s()+.-]/g, "");
  if (!nome || nome.length > 200 || !empresa || empresa.length > 300 || !/^\d{10,15}$/.test(telefone)) return Response.json({ error: "Informe nome, empresa e telefone com DDD." }, { status: 400 });
  const response = await captureSubmission("contact", { nome, empresa, telefone, origem: "Contato WhatsApp" }, undefined, request);
  if (!response.ok) return response;
  const whatsapp = new URL("https://wa.me/5515991269893");
  whatsapp.searchParams.set("text", `Olá, sou ${nome}, da empresa ${empresa}. Vim pelo site e gostaria de mais informações.`);
  return Response.json({ ...await response.json(), whatsappUrl: whatsapp.toString() }, { headers: { "Cache-Control": "no-store" } });
}
