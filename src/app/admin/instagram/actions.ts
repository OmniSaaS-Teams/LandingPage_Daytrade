"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth.ts";
import { saveInstagramConnection, InstagramSettingsError } from "../../../lib/instagram-settings.ts";
import { syncInstagram } from "../../../lib/instagram.ts";
import { allowAttempt } from "../../../lib/rate-limit.ts";

export async function saveConnection(form: FormData) {
  const admin = await requireAdmin();
  if (!await allowAttempt("instagram-settings", admin.id, 10, 600)) redirect("/admin/instagram?status=rate_limited");
  let status = "saved";
  try { await saveInstagramConnection(form.get("username"), form.get("accessToken")); }
  catch (error) { status = error instanceof InstagramSettingsError ? error.message : "storage_error"; }
  revalidatePath("/");
  revalidatePath("/admin/instagram");
  redirect(`/admin/instagram?status=${encodeURIComponent(status)}`);
}

export async function refresh() {
  const admin = await requireAdmin();
  const result = await allowAttempt("instagram-sync", admin.email, 4, 600) ? await syncInstagram(true) : "rate_limited";
  revalidatePath("/");
  revalidatePath("/admin/instagram");
  redirect(`/admin/instagram?status=${encodeURIComponent(result)}`);
}
