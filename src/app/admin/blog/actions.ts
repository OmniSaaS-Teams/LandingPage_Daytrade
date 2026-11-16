"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../lib/auth.ts";
import { db } from "../../../lib/db.ts";
import { validId } from "../../../lib/admin-data.ts";
import { validatePost } from "../../../lib/blog-options.ts";

export async function savePost(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") || "");
  if (id && !validId(id)) throw new Error("Artigo inválido.");
  const fields = Object.fromEntries(["title", "slug", "excerpt", "category", "content", "cover"].map(key => [key, String(form.get(key) || "").trim()]));
  const back = id ? `/admin/blog/${id}` : "/admin/blog/novo";
  if (!validatePost(fields)) redirect(`${back}?erro=validacao`);
  const published = form.get("published") === "on";
  try {
    const values = [fields.title, fields.slug, fields.excerpt, fields.category, fields.content, fields.cover, published];
    if (id) {
      await db.query("UPDATE blog_posts SET title=$1,slug=$2,excerpt=$3,category=$4,content=$5,cover=$6,published=$7,published_at=CASE WHEN $7 AND published_at IS NULL THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE published_at END,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=$8", [...values, id]);
    } else {
      await db.query("INSERT INTO blog_posts(title,slug,excerpt,category,content,cover,published,published_at,id) VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7 THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE NULL END,$8)", [...values, randomUUID()]);
    }
  } catch (error) {
    if ((error as { message?: string }).message?.includes("UNIQUE constraint failed: blog_posts.slug")) redirect(`${back}?erro=slug`);
    throw error;
  }
  revalidatePath("/admin/blog", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath("/");
  redirect("/admin/blog?salvo=1");
}
export async function deletePost(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  if (!validId(id) || form.get("confirmar") !== "on") throw new Error("Confirme a exclusão.");
  await db.query("DELETE FROM blog_posts WHERE id=$1", [id]);
  revalidatePath("/admin/blog", "layout");
  revalidatePath("/blog", "layout");
  revalidatePath("/");
  redirect("/admin/blog");
}
