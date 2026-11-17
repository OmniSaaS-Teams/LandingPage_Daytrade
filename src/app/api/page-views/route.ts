import { publishedPost } from "../../../lib/blog.ts";
import { pageViewPath } from "../../../lib/page-view-path.ts";
import { pageViewIp, savePageView } from "../../../lib/page-views.ts";

const eventIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const automatedAgent = /bot\b|crawler|spider|slurp|headlesschrome|lighthouse|facebookexternalhit/i;

export async function POST(request: Request) {
  const { headers } = request;
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return new Response(null, { status: 403 });

  const id = headers.get("idempotency-key");
  const path = pageViewPath(headers.get("x-daytrade-page-path"));
  if (!id || !eventIdPattern.test(id) || !path) return new Response(null, { status: 400 });

  const userAgent = headers.get("user-agent");
  const purpose = headers.get("sec-purpose") ?? headers.get("purpose") ?? "";
  if (!userAgent || automatedAgent.test(userAgent) || /prefetch|prerender/i.test(purpose)) {
    return new Response(null, { status: 204 });
  }

  try {
    if (!path.startsWith("/blog/") || await publishedPost(path.slice(6))) {
      await savePageView(id.toLowerCase(), path, pageViewIp(headers));
    }
    return new Response(null, { status: 204 });
  } catch {
    console.error("[page-views] Falha ao gravar visualização.");
    return new Response(null, { status: 503 });
  }
}
