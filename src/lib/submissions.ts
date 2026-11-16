import { createHash, randomUUID } from "node:crypto";
import { db } from "./db.ts";
import { allowAttempt } from "./rate-limit.ts";
import { removeResume, storeResume } from "./storage.ts";
import { submissionSource } from "./submission-source.ts";

export type SubmissionKind = "lead" | "investor" | "career" | "contact" | "partner";
export const webhookVariables = { lead: "N8N_LEAD_WEBHOOK_URL", investor: "N8N_INVESTOR_WEBHOOK_URL", career: "N8N_CAREER_WEBHOOK_URL", contact: "N8N_CONTACT_WEBHOOK_URL", partner: "N8N_PARTNER_WEBHOOK_URL" } as const;
type SavedSubmission = { id: string; created_at: string; request_hash: string };
class RequestConflict extends Error {}
const receipt = (saved: SavedSubmission) => Response.json({ success: true, id: saved.id, createdAt: saved.created_at }, { headers: { "Cache-Control": "no-store" } });

export async function captureSubmission(kind: SubmissionKind, data: Record<string, unknown>, file?: File, request?: Request) {
  try {
    const key = request?.headers.get("Idempotency-Key") || null;
    if (key && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)) {
      return Response.json({ error: "Identificador de envio inválido. Atualize a página e tente novamente." }, { status: 400 });
    }
    const hash = createHash("sha256").update(JSON.stringify(data));
    if (file) hash.update(new Uint8Array(await file.arrayBuffer()));
    const fingerprint = hash.digest("hex");
    const check = (saved: SavedSubmission | undefined) => {
      if (saved && saved.request_hash !== fingerprint) throw new RequestConflict();
      return saved;
    };
    if (key) {
      const existing = check((await db.query<SavedSubmission>("SELECT id,created_at,request_hash FROM submissions WHERE kind=$1 AND request_key=$2", [kind, key])).rows[0]);
      if (existing) return receipt(existing);
    }
    const identity = String(data.email || data.telefone || "anonymous");
    if (!await allowAttempt(`form:${kind}`, identity, 5, 600)) return Response.json({ error: "Muitos envios. Aguarde alguns minutos antes de tentar novamente." }, { status: 429 });
    let stored: string | undefined;
    try {
      if (file) stored = await storeResume(file);
      const id = randomUUID();
      const result = await db.transaction(async (client) => {
        if (key) {
          const existing = check((await client.query<SavedSubmission>("SELECT id,created_at,request_hash FROM submissions WHERE kind=$1 AND request_key=$2", [kind, key])).rows[0]);
          if (existing) return { saved: existing, created: false };
        }
        const uploadId = file ? randomUUID() : null;
        if (file && stored) await client.query("INSERT INTO uploads(id,path,original_name,mime,bytes) VALUES($1,$2,$3,$4,$5)", [uploadId, stored, file.name, file.type, file.size]);
        const sourcedData = { ...data, ...submissionSource(kind, data, request) };
        const saved = await client.query<SavedSubmission>("INSERT INTO submissions(id,kind,data,upload_id,request_key,request_hash) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,created_at,request_hash", [id, kind, JSON.stringify(sourcedData), uploadId, key, fingerprint]);
        if (process.env[webhookVariables[kind]]) await client.query("INSERT INTO webhook_jobs(id,submission_id,destination) VALUES($1,$2,$3)", [randomUUID(), id, kind]);
        return { saved: saved.rows[0], created: true };
      });
      if (!result.created && stored) await removeResume(stored);
      return receipt(result.saved);
    } catch (error) {
      if (stored) await removeResume(stored).catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error instanceof RequestConflict) return Response.json({ error: "Este envio já foi usado com outros dados. Tente novamente." }, { status: 409 });
    console.error("[submissions] Falha ao persistir cadastro; envio não confirmado.");
    return Response.json({ error: "Não foi possível salvar seus dados. Tente novamente em instantes." }, { status: 503 });
  }
}
