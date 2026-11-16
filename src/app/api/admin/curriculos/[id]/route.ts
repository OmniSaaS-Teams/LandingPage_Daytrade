import { currentAdmin } from "../../../../../lib/auth.ts";
import { db } from "../../../../../lib/db.ts";
import { validId } from "../../../../../lib/admin-data.ts";
import { readResume } from "../../../../../lib/storage.ts";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return new Response("Acesso não autorizado.", { status: 401 });
  const { id } = await params;
  if (!validId(id)) return new Response("Não encontrado.", { status: 404 });
  const result = await db.query<{ path: string; mime: string }>("SELECT path,mime FROM uploads WHERE id=$1", [id]);
  const file = result.rows[0];
  if (!file) return new Response("Não encontrado.", { status: 404 });
  try {
    const bytes = await readResume(file.path);
    const extension = file.path.split(".").pop();
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": file.mime, "Content-Disposition": `attachment; filename="curriculo.${extension}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Arquivo indisponível.", { status: 404 }); }
}
