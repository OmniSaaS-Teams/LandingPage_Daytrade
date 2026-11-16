import assert from "node:assert/strict";
import { test, beforeEach, after, mock } from "node:test";
import { databaseFixture } from "./helpers/database.mjs";
import { db } from "../src/lib/db.ts";
import { normalizeInstagramPosts, instagramFeed, syncInstagram } from "../src/lib/instagram.ts";
databaseFixture();
const keys = ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USERNAME", "INSTAGRAM_USER_ID", "INSTAGRAM_GRAPH_VERSION"];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
beforeEach(() => { mock.restoreAll(); for (const key of keys) delete process.env[key]; });
after(() => { for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } });
const post = (id, day = 1) => ({ id: String(id), caption: "Novidades", permalink: `https://www.instagram.com/p/post${id}/`, media_type: "IMAGE", media_url: "https://scontent.cdninstagram.com/photo.jpg", timestamp: `2026-11-${String(day).padStart(2,"0")}T12:00:00Z` });
test("selects five newest unique posts and rejects unsafe links and images", () => {
  const posts = normalizeInstagramPosts([post(1), post(3,3), post(2,2), post(4,4), post(4,4), post(5,5), post(6,6), { ...post(7,7), permalink:"https://evil.test/p/a/" }]);
  assert.deepEqual(posts.map(p => p.id), ["6","5","4","3","2"]);
  assert.equal(normalizeInstagramPosts([{ ...post(1), media_url:"https://cdninstagram.com.evil.test/x" }])[0].imageUrl,null);
  assert.equal(normalizeInstagramPosts([{ ...post(1), media_type:"VIDEO", thumbnail_url:"https://a.fbcdn.net/thumb.jpg" }])[0].imageUrl,"https://a.fbcdn.net/thumb.jpg");
});
test("without credentials never calls Meta and returns an empty feed", async () => {
  mock.method(globalThis,"fetch", () => { throw new Error("unexpected fetch"); });
  assert.equal(await syncInstagram(),"not_configured");
  assert.deepEqual((await instagramFeed()).posts,[]);
});
test("sync persists posts, respects interval and preserves cache on token expiry", async () => {
  process.env.INSTAGRAM_ACCESS_TOKEN="test-secret";
  let calls=0;
  const fetchMock=mock.method(globalThis,"fetch", async url => {
    calls++;
    assert.equal(new URL(url).hostname,"graph.instagram.com");
    return Response.json(String(url).includes("/me?") ? { user_id:"123", username:"daytradesa" } : { data:[post(1),post(2,2)] });
  });
  assert.equal(await syncInstagram(),"updated");
  assert.equal((await instagramFeed()).posts.length,2);
  assert.equal(await syncInstagram(),"cached");
  assert.equal(calls,2);
  fetchMock.mock.mockImplementation(async () => Response.json({error:{code:190,message:"test-secret"}},{status:400}));
  assert.equal(await syncInstagram(true),"token_expired");
  const feed=await instagramFeed();
  assert.equal(feed.posts.length,2);
  assert.ok(!JSON.stringify(feed).includes("test-secret"));
  await db.query("UPDATE instagram_feeds SET last_success_at='2000-01-01T00:00:00Z'");
  assert.deepEqual((await instagramFeed()).posts,[]);
});
test("rejects another account and removes cache after successful empty response", async () => {
  process.env.INSTAGRAM_ACCESS_TOKEN="test";
  const handle=mock.method(globalThis,"fetch", async () => Response.json({user_id:"123",username:"other"}));
  assert.equal(await syncInstagram(true),"wrong_account");
  assert.equal(handle.mock.callCount(),1);
  handle.mock.mockImplementation(async url => Response.json(String(url).includes("/me?") ? {user_id:"123",username:"daytradesa"} : {data:[]}));
  assert.equal(await syncInstagram(true),"updated");
  assert.deepEqual((await instagramFeed()).posts,[]);
});
