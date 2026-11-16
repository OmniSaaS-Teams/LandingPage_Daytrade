import { db } from "./db.ts";

export const kinds: Record<string, string> = { lead: "Seja cliente", investor: "Investidor", career: "Carreira", contact: "Contato" };
export const statuses: Record<string, string> = { novo: "Novo", em_atendimento: "Em atendimento", concluido: "Concluído", arquivado: "Arquivado" };
export const jobStatuses: Record<string, string> = { pending: "Pendente", processing: "Enviando", sent: "Entregue", failed: "Falhou" };
export const dateLabel = (date: string | Date) => new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
export const validId = (id: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
export type Submission = { id: string; kind: string; status: string; data: Record<string, string | number | boolean>; created_at: Date; upload_id: string | null; job_status?: string; attempts?: number; last_error?: string; };

export async function listSubmissions(kind: string, status: string, search: string, page: number) {
  const values = [kind, status, `%${search.replace(/[\\%_]/g, "\\$&")}%`];
  const where = "WHERE ($1='' OR s.kind=$1) AND ($2='' OR s.status=$2) AND (s.data->>'nome' LIKE $3 ESCAPE '\\' OR s.data->>'email' LIKE $3 ESCAPE '\\' OR s.data->>'telefone' LIKE $3 ESCAPE '\\')";
  const count = await db.query<{ total: string }>(`SELECT count(*) AS total FROM submissions s ${where}`, values);
  const result = await db.query<Submission>(`SELECT s.*,j.status AS job_status FROM submissions s LEFT JOIN webhook_jobs j ON j.submission_id=s.id ${where} ORDER BY s.created_at DESC,s.id LIMIT 25 OFFSET $4`, [...values, (page - 1) * 25]);
  return { rows: result.rows, total: Number(count.rows[0].total) };
}
