import { randomUUID } from "node:crypto";
import { db } from "./db.ts";
import { allowAttempt } from "./rate-limit.ts";
import { removeResume, storeResume } from "./storage.ts";

export type SubmissionKind = "lead" | "investor" | "career" | "contact";
export const webhookVariables = { lead: "N8N_LEAD_WEBHOOK_URL", investor: "N8N_INVESTOR_WEBHOOK_URL", career: "N8N_CAREER_WEBHOOK_URL" } as const;

export async function captureSubmission(kind: SubmissionKind, data: Record<string, unknown>, file?: File) {
  try {
    const identity = String(data.email || data.telefone || "anonymous");
    if (!await allowAttempt(`form:${kind}`, identity, 5, 600)) return Response.json({ error: "Muitos envios. Aguarde alguns minutos antes de tentar novamente." }, { status: 429 });
    let stored: string | undefined;
    try {
      if (file) stored = await storeResume(file);
      const id = randomUUID();
      await db.transaction(async (client) => {
        const uploadId = file ? randomUUID() : null;
        if (file && stored) await client.query("INSERT INTO uploads(id,path,original_name,mime,bytes) VALUES($1,$2,$3,$4,$5)", [uploadId, stored, file.name.slice(0, 255), file.type, file.size]);
        await client.query("INSERT INTO submissions(id,kind,data,upload_id) VALUES($1,$2,$3,$4)", [id, kind, JSON.stringify(data), uploadId]);
        if (kind !== "contact" && process.env[webhookVariables[kind]]) await client.query("INSERT INTO webhook_jobs(id,submission_id,destination) VALUES($1,$2,$3)", [randomUUID(), id, kind]);
      });
      return Response.json({ success: true, id });
    } catch (error) {
      if (stored) await removeResume(stored).catch(() => {});
      throw error;
    }
  } catch {
    console.error("[submissions] Falha ao persistir cadastro; envio não confirmado.");
    return Response.json({ error: "Não foi possível salvar seus dados. Tente novamente em instantes." }, { status: 503 });
  }
}
