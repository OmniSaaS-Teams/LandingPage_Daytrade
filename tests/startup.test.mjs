import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { once } from "node:events";
import { setTimeout } from "node:timers/promises";
import { DatabaseSync } from "node:sqlite";
import { randomUUID, randomBytes, createHash } from "node:crypto";

test("production startup migrates SQLite and processes every public form with authenticated admin access", { skip: !existsSync(".next/standalone/server.js"), timeout: 45000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "daytrade-startup-"));
  const portProbe = createServer();
  portProbe.listen(0, "127.0.0.1");
  await once(portProbe, "listening");
  const port = portProbe.address().port;
  await new Promise(resolve => portProbe.close(resolve));
  const child = spawn(process.execPath, ["scripts/start.mjs"], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(port), HOSTNAME: "127.0.0.1", DATABASE_FILE: join(directory, "site.sqlite"), UPLOAD_DIR: join(directory, "private"), N8N_LEAD_WEBHOOK_URL: "", N8N_INVESTOR_WEBHOOK_URL: "", N8N_CAREER_WEBHOOK_URL: "", N8N_PARTNER_WEBHOOK_URL: "", N8N_CONTACT_WEBHOOK_URL: "", INSTAGRAM_ACCESS_TOKEN: "", ANALYTICS_TRUST_PROXY: "true" },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let logs = "";
  child.stdout.on("data", data => { logs += data; });
  child.stderr.on("data", data => { logs += data; });
  const stopped = once(child, "exit");
  try {
    let ready = false;
    for (let attempt=0; attempt<100; attempt++) {
      if (child.exitCode !== null) throw new Error(`Startup failed: ${logs}`);
      try { ready = (await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1000) })).ok; } catch {}
      if (ready) break;
      await setTimeout(100);
    }
    assert.ok(ready, logs);
    const base = `http://127.0.0.1:${port}`;
    const person = { nome: "Teste de inicialização", email: "startup@example.test", telefone: "15999999999" };
    const cases = [
      ["contacts", { ...person, empresa: "Empresa" }],
      ["leads", { ...person, razaoSocial: "Empresa LTDA", cnpj: "12.345.678/0001-90" }],
      ["partner-leads", { ...person, experiencia: "sim" }],
      ["investor-leads", { ...person, origem: "solicitar_apresentacao", perfil: "Investidor pessoa física" }],
      ["investor-leads", { ...person, origem: "simulador_investimento", valor: 50000, periodo: "3" }],
    ];
    for (const [path, data] of cases) {
      const options = { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID() }, body: JSON.stringify(data) };
      const response = await fetch(`${base}/api/${path}`, options);
      const receipt = await response.json();
      assert.equal(response.status, 200, JSON.stringify(receipt));
      assert.equal(receipt.success, true);
      assert.equal(typeof receipt.createdAt, "string");
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal((await (await fetch(`${base}/api/${path}`, options)).json()).id, receipt.id);
      if (data.origem === "simulador_investimento") assert.equal(receipt.simulation.values.carteira, 73106.77);
    }
    const resume = new FormData();
    for (const [key, value] of Object.entries({ ...person, area: "Tecnologia e dados", consentimento: "true" })) resume.set(key, value);
    resume.set("curriculo", new File(["%PDF-1.7 startup test"], "curriculo.pdf", { type: "application/pdf" }));
    const candidate = await fetch(`${base}/api/careers`, { method: "POST", headers: { "Idempotency-Key": randomUUID() }, body: resume });
    assert.equal(candidate.status, 200, await candidate.text());
    const eventId = randomUUID();
    const pageView = (headers = {}) => fetch(`${base}/api/page-views`, {
      method: "POST",
      headers: {
        "Idempotency-Key": randomUUID(), "X-Daytrade-Page-Path": "/", "User-Agent": "Mozilla/5.0",
        "X-Real-IP": "192.0.2.10", ...headers,
      },
    });
    assert.equal((await pageView({ "Idempotency-Key": eventId })).status, 204);
    assert.equal((await pageView({ "Idempotency-Key": eventId })).status, 204);
    assert.equal((await pageView({ "X-Real-IP": "::ffff:192.0.2.10" })).status, 204);
    assert.equal((await pageView({ "X-Real-IP": "2001:0DB8::1", "X-Daytrade-Page-Path": "/investidor" })).status, 204);
    assert.equal((await pageView({ "X-Real-IP": "", "X-Forwarded-For": "192.0.2.90" })).status, 204);
    assert.equal((await pageView({ "User-Agent": "Googlebot" })).status, 204);
    assert.equal((await pageView({ "Sec-Purpose": "prefetch" })).status, 204);
    assert.equal((await pageView({ "X-Daytrade-Page-Path": "/blog/artigo-inexistente" })).status, 204);
    assert.equal((await pageView({ "X-Daytrade-Page-Path": "/admin" })).status, 400);
    assert.equal((await pageView({ "X-Daytrade-Page-Path": "/?email=privado" })).status, 400);

    const sqlite = new DatabaseSync(join(directory, "site.sqlite"));
    try {
      assert.equal(sqlite.prepare("SELECT count(*) AS total FROM submissions").get().total, 6);
      assert.equal(sqlite.prepare("SELECT count(*) AS total FROM webhook_jobs").get().total, 0);
      assert.equal(sqlite.prepare("PRAGMA journal_mode").get().journal_mode, "wal");
      assert.equal(sqlite.prepare("PRAGMA foreign_key_check").all().length, 0);
      const views = sqlite.prepare("SELECT path, ip, count(*) AS total FROM page_views GROUP BY path, ip ORDER BY path, ip").all();
      assert.deepEqual(views.map(({ path, ip, total }) => [path, ip, total]), [
        ["/", null, 1], ["/", "192.0.2.10", 2], ["/investidor", "2001:db8::1", 1],
      ]);
      const upload = sqlite.prepare("SELECT id FROM uploads").get().id;
      assert.equal((await fetch(`${base}/api/admin/curriculos/${upload}`)).status, 401);
      const userId = randomUUID(), token = randomBytes(32).toString("hex");
      sqlite.prepare("INSERT INTO admin_users(id,email,password_hash) VALUES(?,?,'test-only')").run(userId, "admin@startup.test");
      sqlite.prepare("INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,strftime('%Y-%m-%dT%H:%M:%fZ','now','+1 hour'))").run(createHash("sha256").update(token).digest("hex"), userId);
      const authorized = await fetch(`${base}/api/admin/curriculos/${upload}`, { headers: { Cookie: `daytrade_admin=${token}` } });
      assert.equal(authorized.status, 200);
      assert.equal(authorized.headers.get("cache-control"), "private, no-store");
      assert.equal(await authorized.text(), "%PDF-1.7 startup test");
      const admin = await fetch(`${base}/admin/contatos?tipo=partner`, { headers: { Cookie: `daytrade_admin=${token}` } });
      assert.equal(admin.status, 200);
      assert.match(await admin.text(), /Parceiro Indicador/);
      const anonymousAccess = await fetch(`${base}/admin/acessos`, { redirect: "manual" });
      const anonymousAccessHtml = await anonymousAccess.text();
      assert.match(anonymousAccess.headers.get("location") ?? anonymousAccessHtml, /admin\/login/);
      assert.ok(!anonymousAccessHtml.includes("192.0.2.10"));
      const access = await fetch(`${base}/admin/acessos?periodo=7&rota=%2F`, { headers: { Cookie: `daytrade_admin=${token}` } });
      assert.equal(access.status, 200);
      assert.equal(access.headers.get("cache-control"), "private, no-store");
      const accessHtml = await access.text();
      assert.match(accessHtml, /Visualizações<\/span><strong>3<\/strong>/);
      assert.match(accessHtml, /IPs distintos<\/span><strong>1<\/strong>/);
      assert.match(accessHtml, /IPs com mais de um acesso<\/span><strong>1<\/strong>/);
      assert.match(accessHtml, /Visualizações sem IP<\/span><strong>1<\/strong>/);
      assert.match(accessHtml, /192\.0\.2\.10<\/code><\/td><td>2<\/td>/);
      assert.ok(!accessHtml.includes("2001:db8::1"));
      const anonymousInstagram = await fetch(`${base}/admin/instagram`, { redirect: "manual" });
      // A redirect after a Suspense boundary has started streaming uses a meta tag.
      if (anonymousInstagram.status === 307) assert.match(anonymousInstagram.headers.get("location"), /admin\/login/);
      else {
        assert.equal(anonymousInstagram.status, 200);
        const anonymousHtml = await anonymousInstagram.text();
        assert.match(anonymousHtml, /http-equiv="refresh"[^>]*admin\/login/);
        assert.ok(!anonymousHtml.includes('name="accessToken"'));
      }
      const encryptedOnly = "v1.this-value-must-never-appear-in-the-form";
      sqlite.prepare("INSERT INTO instagram_connection(id,username,token_ciphertext) VALUES(1,?,?)").run("test_profile", encryptedOnly);
      const settings = await fetch(`${base}/admin/instagram`, { headers: { Cookie: `daytrade_admin=${token}` } });
      assert.equal(settings.status, 200);
      const html = await settings.text();
      assert.match(html, /Salvar conexão/);
      assert.match(html, /test_profile/);
      assert.match(html, /type="password"/);
      assert.ok(!html.includes(encryptedOnly));
      assert.ok(!html.includes("token_ciphertext"));
      sqlite.prepare("DELETE FROM instagram_connection WHERE id=1").run();
      // Readiness must be checked on each request, never frozen during next build.
      sqlite.prepare("UPDATE schema_migrations SET name='hidden-for-health-test' WHERE name='003_submission_processing.sql'").run();
      assert.equal((await fetch(`${base}/api/health`)).status, 503);
      sqlite.prepare("UPDATE schema_migrations SET name='003_submission_processing.sql' WHERE name='hidden-for-health-test'").run();
      assert.equal((await fetch(`${base}/api/health`)).status, 200);
    } finally { sqlite.close(); }
    const privateFile = await fetch(`${base}/api/admin/curriculos/00000000-0000-0000-0000-000000000000`);
    assert.equal(privateFile.status,401);
  } finally {
    if (child.connected) child.send("daytrade:stop");
    else child.kill("SIGTERM");
    const killTimer = globalThis.setTimeout(() => child.kill("SIGKILL"), 12000);
    try { await stopped; } finally { globalThis.clearTimeout(killTimer); }
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + (process.platform === "win32" ? "\\" : "/")));
    await rm(directory, { recursive: true, force: true });
  }
});
