import { captureSubmission } from "../../../lib/submissions.ts";
import { readJson, BodyTooLargeError } from "../../../lib/read-json.ts";

export async function POST(request: Request) {
  let value: unknown;
  try {
    value = await readJson(request);
  } catch (error) {
    return Response.json({ error: "Dados inválidos. Confira o formulário." }, { status: error instanceof BodyTooLargeError ? 413 : 400 });
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return Response.json({ error: "Dados inválidos. Confira o formulário." }, { status: 400 });
  }

  const fields = value as Record<string, unknown>;
  const text = (key: string) => typeof fields[key] === "string" ? fields[key].trim() : "";
  const nome = text("nome");
  const email = text("email").toLowerCase();
  const telefone = text("telefone").replace(/[\s()+.-]/g, "");
  const experiencia = text("experiencia");
  const invalid = (error: string) => Response.json({ error }, { status: 400 });

  if (!nome || nome.length > 200) return invalid("Informe seu nome completo.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid("Informe um e-mail válido.");
  if (!/^\d{10,15}$/.test(telefone)) return invalid("Informe um telefone ou celular com DDD.");
  if (!["sim", "nao"].includes(experiencia)) return invalid("Informe se tem experiência em FIDCs.");

  return captureSubmission("partner", {
    nome, email, telefone, experienciaFIDCs: experiencia === "sim",
    origem: "Site Daytrade - Parceiro Indicador",
  }, undefined, request);
}
