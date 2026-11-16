"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/auth.ts";
import { db } from "../../../lib/db.ts";
import { statuses, validId } from "../../../lib/admin-data.ts";
import { removeResume } from "../../../lib/storage.ts";

export async function updateSubmission(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id")), status = String(form.get("status"));
  if (!validId(id) || !Object.hasOwn(statuses, status)) throw new Error("Dados inválidos.");
  await db.query("UPDATE submissions SET status=$1 WHERE id=$2", [status, id]);
  revalidatePath("/admin/contatos", "layout");
  redirect(`/admin/contatos/${id}?salvo=1`);
}
export async function retryWebhook(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  if (!validId(id)) throw new Error("Cadastro inválido.");
  await db.query("UPDATE webhook_jobs SET status='pending',attempts=0,next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),last_error=null WHERE submission_id=$1 AND status='failed'", [id]);
  revalidatePath("/admin/contatos", "layout");
  redirect(`/admin/contatos/${id}`);
}
export async function deleteSubmission(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  if (!validId(id) || form.get("confirmar") !== "on") throw new Error("Confirme a exclusão.");
  const file = await db.transaction(async client => {
    const result = await client.query("DELETE FROM submissions WHERE id=$1 RETURNING upload_id", [id]);
    if (!result.rows[0]?.upload_id) return null;
    const upload = await client.query("DELETE FROM uploads WHERE id=$1 RETURNING path", [result.rows[0].upload_id]);
    return upload.rows[0]?.path as string | undefined;
  });
  if (file) await removeResume(file);
  revalidatePath("/admin/contatos", "layout");
  revalidatePath("/admin");
  redirect("/admin/contatos");
}
