import { db } from "./db.ts";
import { readResume } from "./storage.ts";
import { webhookVariables } from "./submissions.ts";

type Job = { id: string; submission_id: string; destination: keyof typeof webhookVariables; attempts: number };

export async function processNextWebhook() {
  await db.query("UPDATE webhook_jobs SET status='failed',last_error='Processamento interrompido após cinco tentativas.' WHERE status='processing' AND attempts>=5 AND next_attempt_at<=strftime('%Y-%m-%dT%H:%M:%fZ','now')");
  // Atomic lease: concurrent workers cannot claim the same job. Recover abandoned leases.
  const claim = await db.query<Job>(`UPDATE webhook_jobs SET status='processing',attempts=attempts+1,next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','+2 minutes')
    WHERE id=(SELECT id FROM webhook_jobs WHERE status IN ('pending','processing') AND attempts<5 AND next_attempt_at<=strftime('%Y-%m-%dT%H:%M:%fZ','now') ORDER BY next_attempt_at LIMIT 1) RETURNING *`);
  const job = claim.rows[0];
  if (!job) return false;
  try {
    const url = process.env[webhookVariables[job.destination]];
    if (!url || !["http:", "https:"].includes(new URL(url).protocol)) throw new Error("Destino não configurado.");
    const submission = (await db.query<{ data: Record<string, unknown>; path: string | null; mime: string | null; original_name: string | null }>("SELECT s.data,u.path,u.mime,u.original_name FROM submissions s LEFT JOIN uploads u ON u.id=s.upload_id WHERE s.id=$1", [job.submission_id])).rows[0];
    if (!submission) throw new Error("Cadastro indisponível.");
    let body: FormData | string;
    const headers: Record<string, string> = { "Idempotency-Key": job.submission_id };
    if (job.destination === "career") {
      if (!submission.path || !submission.mime) throw new Error("Anexo indisponível.");
      body = new FormData();
      for (const [key, value] of Object.entries(submission.data)) body.set(key, String(value));
      body.set("curriculo", new Blob([new Uint8Array(await readResume(submission.path))], { type: submission.mime }), submission.original_name || `curriculo.${submission.path.split(".").pop()}`);
    } else {
      let payload = submission.data;
      if (job.destination === "lead") {
        const { nome, razaoSocial, cnpj, telefone, email, ...context } = payload;
        payload = { ...context, lead: { nome, razaoSocial, cnpj, telefone, email } };
      }
      body = JSON.stringify(payload);
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(url, { method: "POST", headers, body, redirect: "error", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await db.query("UPDATE webhook_jobs SET status='sent',sent_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),last_error=null WHERE id=$1", [job.id]);
  } catch (error) {
    const reason = error instanceof Error && /^(HTTP \d{3}|Destino não configurado\.|Anexo indisponível\.|Cadastro indisponível\.)$/.test(error.message) ? error.message : "Falha de conexão ou tempo limite.";
    await db.query("UPDATE webhook_jobs SET status=$1,last_error=$2,next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','+' || $3 || ' seconds') WHERE id=$4", [job.attempts >= 5 ? "failed" : "pending", reason, Math.min(3600, 30 * 2 ** job.attempts), job.id]);
  }
  return true;
}
