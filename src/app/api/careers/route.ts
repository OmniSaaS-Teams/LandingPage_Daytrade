import { captureSubmission } from "../../../lib/submissions.ts";

const maxFileSize = 5 * 1024 * 1024;
const maxRequestSize = maxFileSize + 128 * 1024;
const areas = new Set(["Comercial e relacionamento", "Crédito e operações", "Administrativo e financeiro", "Tecnologia e dados", "Outras áreas"]);
const invalid = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return invalid("Envie seus dados com o currículo em anexo.");
  }
  if (Number(request.headers.get("content-length")) > maxRequestSize) {
    return invalid("O currículo deve ter até 5 MB.", 413);
  }

  let data: FormData;
  try {
    // Limit the actual streamed body as well as the declared Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return invalid("Dados inválidos. Confira o formulário.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maxRequestSize) {
        await reader.cancel();
        return invalid("O currículo deve ter até 5 MB.", 413);
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    data = await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch {
    return invalid("Dados inválidos. Confira o formulário e o anexo.");
  }

  const text = (name: string) => typeof data.get(name) === "string" ? (data.get(name) as string).trim() : "";
  const nome = text("nome");
  const email = text("email").toLowerCase();
  const telefone = text("telefone").replace(/[\s()+.-]/g, "");
  const area = text("area");
  const mensagem = text("mensagem");
  if (!nome || nome.length > 200) return invalid("Informe seu nome completo.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid("Informe um e-mail válido.");
  if (!/^\d{10,15}$/.test(telefone)) return invalid("Informe um telefone com DDD.");
  if (!areas.has(area)) return invalid("Selecione uma área de interesse.");
  if (mensagem.length > 2000) return invalid("A apresentação deve ter até 2.000 caracteres.");
  if (text("consentimento") !== "true") return invalid("Autorize o uso dos dados para enviar seu currículo.");

  const file = data.get("curriculo");
  if (!(file instanceof File) || !file.size) return invalid("Anexe seu currículo.");
  if (file.size > maxFileSize) return invalid("O currículo deve ter até 5 MB.", 413);
  const extension = file.name.split(".").pop()?.toLowerCase();
  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const matches = (prefix: number[]) => prefix.every((byte, index) => signature[index] === byte);
  const mime = extension === "pdf" && matches([0x25, 0x50, 0x44, 0x46, 0x2d]) ? "application/pdf"
    : extension === "doc" && matches([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) ? "application/msword"
    : extension === "docx" && matches([0x50, 0x4b, 0x03, 0x04]) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    : null;
  if (!mime) return invalid("Envie um arquivo PDF, DOC ou DOCX válido.");

  const resume = new File([await file.arrayBuffer()], file.name, { type: mime });
  return captureSubmission("career", { nome, email, telefone, area, mensagem, consentimento: true, origem: "Site DayTrade - Carreira" }, resume, request);
}
