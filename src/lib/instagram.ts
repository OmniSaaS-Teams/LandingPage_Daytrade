import { db } from "./db.ts";
import { environmentInstagramUsername, instagramConnection, instagramConnectionStatus } from "./instagram-settings.ts";

const refreshInterval = 15 * 60 * 1000;
const maxCacheAge = 24 * 60 * 60 * 1000;
export type InstagramPost = { id: string; caption: string; permalink: string; imageUrl: string | null; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; timestamp: string };
type Feed = { username: string; posts: string; last_success_at: string | null; next_attempt_at: number; lease_until: number; last_error: string | null };

export function instagramUsername() {
  return environmentInstagramUsername();
}
function instagramLink(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["www.instagram.com", "instagram.com"].includes(url.hostname) || !/^\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname) || url.username || url.password) return null;
    return `https://www.instagram.com${url.pathname}`;
  } catch { return null; }
}
function mediaImage(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const allowed = ["cdninstagram.com", "fbcdn.net", "fbsbx.com"].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    return url.protocol === "https:" && !url.username && !url.password && allowed ? url.href : null;
  } catch { return null; }
}

export function normalizeInstagramPosts(value: unknown): InstagramPost[] {
  if (!Array.isArray(value)) return [];
  const posts: InstagramPost[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const permalink = instagramLink(item.permalink);
    if (!permalink || typeof item.id !== "string" || !/^\d+$/.test(item.id) || !["IMAGE", "VIDEO", "CAROUSEL_ALBUM"].includes(item.media_type) || typeof item.timestamp !== "string" || !Number.isFinite(Date.parse(item.timestamp))) continue;
    if (posts.some(post => post.id === item.id)) continue;
    posts.push({ id: item.id, caption: typeof item.caption === "string" ? item.caption.slice(0, 2200) : "", permalink, imageUrl: mediaImage(item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url), mediaType: item.media_type, timestamp: new Date(item.timestamp).toISOString() });
  }
  return posts.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 5);
}

export async function instagramFeed() {
  const { username, configured } = await instagramConnectionStatus();
  const row = (await db.query<Feed>("SELECT * FROM instagram_feeds WHERE username=$1", [username])).rows[0];
  const fresh = row?.last_success_at && Date.parse(row.last_success_at) > Date.now() - maxCacheAge;
  // Only public post fields are returned, never account credentials or raw API responses.
  const posts: InstagramPost[] = fresh ? JSON.parse(row.posts) : [];
  return { username, posts, lastSuccess: row?.last_success_at || null, lastError: row?.last_error || null, configured };
}

class InstagramError extends Error {}
async function graphRequest(path: string, fields: Record<string, string>, token: string) {
  const version = process.env.INSTAGRAM_GRAPH_VERSION || "v27.0";
  if (!/^v\d+\.\d+$/.test(version)) throw new InstagramError("invalid_config");
  const url = new URL(`https://graph.instagram.com/${version}/${path}`);
  for (const [key, value] of Object.entries(fields)) url.searchParams.set(key, value);
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  const result = await response.json();
  if (!response.ok || result.error) throw new InstagramError(result.error?.code === 190 ? "token_expired" : "api_unavailable");
  return result;
}

export async function syncInstagram(force = false) {
  let config: Awaited<ReturnType<typeof instagramConnection>>;
  try { config = await instagramConnection(); }
  catch { return "credentials_unavailable"; }
  const { token, username } = config;
  if (!token) return "not_configured";
  const now = Date.now();
  await db.query("INSERT INTO instagram_feeds(username) VALUES($1) ON CONFLICT(username) DO NOTHING", [username]);
  // A short lease prevents concurrent worker/manual refreshes from repeating API calls.
  const claim = await db.query("UPDATE instagram_feeds SET lease_until=$1 WHERE username=$2 AND lease_until<$3 AND ($4=1 OR next_attempt_at<=$3) RETURNING username", [now + 60000, username, now, force ? 1 : 0]);
  if (!claim.rows.length) return "cached";
  try {
    const identityResponse = await graphRequest("me", { fields: "user_id,username" }, token);
    const identity = Array.isArray(identityResponse.data) ? identityResponse.data[0] : identityResponse;
    const userId = String(identity?.user_id || identity?.id || "");
    if (!/^\d+$/.test(userId) || String(identity.username).toLowerCase() !== username || (config.userId && config.userId !== userId)) throw new InstagramError("wrong_account");
    const result = await graphRequest(`${userId}/media`, { fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp", limit: "25" }, token);
    if (!Array.isArray(result.data)) throw new InstagramError("api_unavailable");
    const posts = normalizeInstagramPosts(result.data);
    if (result.data.length && !posts.length) throw new InstagramError("invalid_media");
    await db.query("UPDATE instagram_feeds SET posts=$1,last_success_at=$2,next_attempt_at=$3,lease_until=0,last_error=null WHERE username=$4", [JSON.stringify(posts), new Date().toISOString(), Date.now() + refreshInterval, username]);
    return "updated";
  } catch (error) {
    const reason = error instanceof InstagramError ? error.message : "api_unavailable";
    // Keep last known posts for up to 24h, but never keep deleted posts after a successful sync.
    await db.query("UPDATE instagram_feeds SET next_attempt_at=$1,lease_until=0,last_error=$2 WHERE username=$3", [Date.now() + 5 * 60 * 1000, reason, username]);
    return reason;
  }
}
