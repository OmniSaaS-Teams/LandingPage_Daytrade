import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { db, databaseFile } from "../src/lib/db.ts";
import { databaseFixture } from "./helpers/database.mjs";
import { instagramConnection, instagramConnectionStatus, InstagramSettingsError, saveInstagramConnection } from "../src/lib/instagram-settings.ts";
import { instagramFeed, syncInstagram } from "../src/lib/instagram.ts";

databaseFixture();
const keys = ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USERNAME", "INSTAGRAM_USER_ID", "INSTAGRAM_GRAPH_VERSION"];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
beforeEach(() => { mock.restoreAll(); for (const key of keys) delete process.env[key]; });
after(() => { for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } });
const firstToken = "test-only-instagram-secret-token-12345";
const secondToken = "test-only-replacement-secret-token-67890";

test("admin connection encrypts the token and only exposes safe metadata", async () => {
  await saveInstagramConnection(" @DayTradeSa ", firstToken);
  const saved = (await db.query("SELECT * FROM instagram_connection")).rows[0];
  assert.equal(saved.username, "daytradesa");
  assert.match(saved.token_ciphertext, /^v1\./);
  assert.ok(!JSON.stringify(saved).includes(firstToken));
  const status = await instagramConnectionStatus();
  assert.equal(status.username, "daytradesa");
  assert.equal(status.source, "admin");
  assert.equal(status.configured, true);
  assert.ok(!JSON.stringify(status).includes(firstToken));
  assert.equal((await readFile(join(dirname(databaseFile()), "secrets", "instagram.key"))).length, 32);
  assert.equal((await instagramConnection()).token, firstToken);
});

test("blank token preserves the saved credential; account changes require a new token", async () => {
  await saveInstagramConnection("daytradesa", firstToken);
  await saveInstagramConnection("daytradesa", "");
  assert.equal((await instagramConnection()).token, firstToken);
  await assert.rejects(() => saveInstagramConnection("other", ""), error => error instanceof InstagramSettingsError && error.message === "new_token_required");
  assert.equal((await instagramConnectionStatus()).username, "daytradesa");
  await saveInstagramConnection("other", secondToken);
  assert.equal((await instagramConnection()).token, secondToken);
  assert.equal((await instagramFeed()).username, "other");
  assert.deepEqual((await instagramFeed()).posts, []);
});

test("invalid configuration cannot be saved", async () => {
  for (const username of ["", "https://instagram.com/daytradesa", "bad name", "x".repeat(31), null]) {
    await assert.rejects(() => saveInstagramConnection(username, firstToken), /invalid_username/);
  }
  for (const token of ["short", "token with whitespace in it", "x".repeat(4097)]) {
    await assert.rejects(() => saveInstagramConnection("daytradesa", token), /invalid_token/);
  }
  await assert.rejects(() => saveInstagramConnection("daytradesa", ""), /token_required/);
  assert.equal((await db.query("SELECT * FROM instagram_connection")).rows.length, 0);
});

test("environment remains a fallback while panel configuration takes precedence without modifying it", async () => {
  process.env.INSTAGRAM_USERNAME = "legacy";
  process.env.INSTAGRAM_ACCESS_TOKEN = firstToken;
  process.env.INSTAGRAM_USER_ID = "123";
  assert.equal((await instagramConnection()).username, "legacy");
  assert.equal((await instagramConnection()).userId, "123");
  await saveInstagramConnection("new_account", secondToken);
  assert.equal((await instagramConnection()).username, "new_account");
  assert.equal((await instagramConnection()).userId, "");
  assert.equal((await instagramConnection()).token, secondToken);
  assert.equal(process.env.INSTAGRAM_ACCESS_TOKEN, firstToken);
  await db.close();
  assert.equal((await instagramConnection()).token, secondToken);
});

test("synchronizer uses and renews the encrypted panel token without restarting", async () => {
  await saveInstagramConnection("daytradesa", firstToken);
  const usedTokens = [];
  const network = mock.method(globalThis, "fetch", async url => {
    usedTokens.push(new URL(url).searchParams.get("access_token"));
    return Response.json(String(url).includes("/me?") ? { user_id: "123", username: "daytradesa" } : { data: [] });
  });
  try {
    assert.equal(await syncInstagram(), "updated");
    assert.deepEqual(usedTokens, [firstToken, firstToken]);
    await saveInstagramConnection("daytradesa", secondToken);
    assert.equal(await syncInstagram(), "updated");
    assert.deepEqual(usedTokens.slice(2), [secondToken, secondToken]);
    const feed = await instagramFeed();
    assert.ok(feed.lastSuccess);
    assert.ok(!JSON.stringify(feed).includes(secondToken));
  } finally { network.mock.restore(); }
});

test("unreadable encryption key fails closed without sending a credential to Meta", async () => {
  await saveInstagramConnection("daytradesa", firstToken);
  await writeFile(join(dirname(databaseFile()), "secrets", "instagram.key"), randomBytes(32));
  const network = mock.method(globalThis, "fetch", () => { throw new Error("Unexpected network request"); });
  try {
    assert.equal(await syncInstagram(true), "credentials_unavailable");
    assert.equal(network.mock.callCount(), 0);
    assert.ok(!JSON.stringify(await instagramConnectionStatus()).includes(firstToken));
    // A fresh token can recover the connection even if an old key was lost.
    await saveInstagramConnection("daytradesa", secondToken);
    assert.equal((await instagramConnection()).token, secondToken);
  } finally { network.mock.restore(); }
});

test("database failure does not partially replace an existing connection", async () => {
  await saveInstagramConnection("daytradesa", firstToken);
  const broken = mock.method(db, "transaction", async () => { throw new Error("Database unavailable"); });
  try { await assert.rejects(() => saveInstagramConnection("daytradesa", secondToken)); }
  finally { broken.mock.restore(); }
  assert.equal((await instagramConnection()).token, firstToken);
});
