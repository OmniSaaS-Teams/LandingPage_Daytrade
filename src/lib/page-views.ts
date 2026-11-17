import { isIP } from "node:net";
import { db } from "./db.ts";

export const pageViewPeriods = [7, 30, 90] as const;
export const pageViewRetentionDays = pageViewPeriods[2];
export const pageViewIpPageSize = 25;
const dayMs = 86_400_000;

export function pageViewIp(headers: Headers) {
  if (process.env.ANALYTICS_TRUST_PROXY !== "true") return null;
  const ip = headers.get("x-real-ip")?.trim();
  if (!ip || ip.includes("%")) return null;
  const family = isIP(ip);
  if (family === 4) return ip;
  if (family !== 6) return null;

  // Serialize equivalent IPv6 spellings identically, including IPv4-mapped addresses.
  const normalized = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const mapped = /^::ffff:([\da-f]+):([\da-f]+)$/.exec(normalized);
  if (!mapped) return normalized;
  return mapped.slice(1).flatMap(word => {
    const value = Number.parseInt(word, 16);
    return [value >> 8, value & 255];
  }).join(".");
}

export async function savePageView(id: string, path: string, ip: string | null) {
  await db.query(`
    INSERT INTO page_views(id, path, ip, viewed_at) VALUES($1, $2, $3, $4)
    ON CONFLICT(id) DO NOTHING`, [id, path, ip, Date.now()]);
}

export async function prunePageViews() {
  await db.query("DELETE FROM page_views WHERE viewed_at < $1", [Date.now() - pageViewRetentionDays * dayMs]);
}

type Summary = { total: number; uniqueIps: number; repeatedIps: number; withoutIp: number };
type IpRow = { ip: string; views: number; firstView: number; lastView: number };
type PageRow = { path: string; views: number; uniqueIps: number };

export async function readPageViews(days: (typeof pageViewPeriods)[number], path: string | null, page: number) {
  const cutoff = Date.now() - days * dayMs;
  const where = path === null ? "viewed_at >= $1" : "viewed_at >= $1 AND path = $2";
  const bindings = path === null ? [cutoff] : [cutoff, path];
  const limit = `$${bindings.length + 1}`;
  const offset = `$${bindings.length + 2}`;

  const [stats, ips, pages] = await Promise.all([
    db.query<Summary>(`
      WITH per_ip AS (SELECT ip, count(*) AS views FROM page_views WHERE ${where} GROUP BY ip)
      SELECT coalesce(sum(views), 0) AS total,
        count(ip) AS uniqueIps,
        count(ip) FILTER (WHERE views > 1) AS repeatedIps,
        coalesce(sum(views) FILTER (WHERE ip IS NULL), 0) AS withoutIp
      FROM per_ip`, bindings),
    db.query<IpRow>(`
      SELECT ip, count(*) AS views, min(viewed_at) AS firstView, max(viewed_at) AS lastView
      FROM page_views WHERE ${where} AND ip IS NOT NULL
      GROUP BY ip ORDER BY views DESC, lastView DESC, ip
      LIMIT ${limit} OFFSET ${offset}`, [...bindings, pageViewIpPageSize, (page - 1) * pageViewIpPageSize]),
    db.query<PageRow>(`
      SELECT path, count(*) AS views, count(DISTINCT ip) AS uniqueIps
      FROM page_views WHERE viewed_at >= $1
      GROUP BY path ORDER BY views DESC, path`, [cutoff]),
  ]);

  return { summary: stats.rows[0], ips: ips.rows, pages: pages.rows };
}
