import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { databaseFixture } from "./helpers/database.mjs";
import { db } from "../src/lib/db.ts";
import { hashPassword, verifyPassword } from "../src/lib/passwords.ts";
import { findSession, tokenHash } from "../src/lib/session-store.ts";
import { publishedPost, publishedPosts } from "../src/lib/blog.ts";
import { validatePost } from "../src/lib/blog-options.ts";
import { processNextWebhook } from "../src/lib/webhooks.ts";
import { captureSubmission } from "../src/lib/submissions.ts";
import { POST as contact } from "../src/app/api/contacts/route.ts";
import { listSubmissions } from "../src/lib/admin-data.ts";
import { migrate } from "../scripts/migrate.mjs";
import { readJson, BodyTooLargeError } from "../src/lib/read-json.ts";
import { setTimeout } from "node:timers/promises";

databaseFixture();

test("SQLite keeps records after closing and reopening the database file",async()=>{
  await captureSubmission("contact",{nome:"Persistência",telefone:"15988888888"});
  await db.close();
  assert.equal((await db.query("SELECT data FROM submissions")).rows[0].data.nome,"Persistência");
});

test("concurrent async transactions remain isolated on the shared SQLite connection",async()=>{
  const operations=Array.from({length:6},(_,index)=>db.transaction(async tx=>{
    const id=randomUUID();
    await tx.query("INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,'test')",[id,`concurrent-${index}@example.test`]);
    await setTimeout(3);
    if(index===2) throw new Error("rollback only this transaction");
  }));
  const results=await Promise.allSettled(operations);
  assert.equal(results.filter(result=>result.status==='rejected').length,1);
  assert.equal((await db.query("SELECT count(*) AS total FROM admin_users")).rows[0].total,5);
});

test("JSON body limits apply to the actual stream without Content-Length",async()=>{
  const input=new Request("http://localhost/api/leads",{method:"POST",body:JSON.stringify({value:"x".repeat(40000)})});
  await assert.rejects(()=>readJson(input),BodyTooLargeError);
});

test("career worker includes the saved private file in multipart",async()=>{
  process.env.N8N_CAREER_WEBHOOK_URL="https://n8n.example.test/career";
  await captureSubmission("career",{nome:"Maria",email:"maria@example.test",consentimento:true},new File(["%PDF-1.7 test"],"curriculo.pdf",{type:"application/pdf"}));
  const network=mock.method(globalThis,"fetch",async()=>new Response(null,{status:204}));
  try{await processNextWebhook();const body=network.mock.calls[0].arguments[1].body;assert.equal(body.get("nome"),"Maria");assert.equal(await body.get("curriculo").text(),"%PDF-1.7 test");assert.equal((await db.query("SELECT status FROM webhook_jobs")).rows[0].status,"sent");}finally{network.mock.restore();}
});

test("password hashes use random salt and reject incorrect passwords", async () => {
  const one=await hashPassword("test-only-long-password"),two=await hashPassword("test-only-long-password");
  assert.notEqual(one,two);assert.ok(await verifyPassword("test-only-long-password",one));assert.equal(await verifyPassword("wrong",one),false);assert.equal(await verifyPassword("wrong","bad"),false);
});
test("sessions require opaque tokens, expire, and can be revoked",async()=>{
  const id=randomUUID(),token=randomBytes(32).toString("hex");
  await db.query("INSERT INTO admin_users(id,email,password_hash) VALUES($1,$2,$3)",[id,"admin@example.test","unused"]);
  await db.query("INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,strftime('%Y-%m-%dT%H:%M:%fZ','now','+1 hour'))",[tokenHash(token),id]);
  assert.equal((await findSession(token)).id,id);assert.equal(await findSession("bad"),null);assert.equal(await findSession(undefined),null);
  assert.notEqual((await db.query("SELECT token_hash FROM admin_sessions")).rows[0].token_hash,token);
  await db.query("UPDATE admin_sessions SET expires_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 second')");assert.equal(await findSession(token),null);
  await db.query("DELETE FROM admin_sessions");assert.equal(await findSession(token),null);
});
test("draft posts cannot be listed or fetched publicly",async()=>{
  const id=randomUUID();
  await db.query("INSERT INTO blog_posts(id,slug,title,excerpt,category,content) VALUES($1,'draft','Draft','Excerpt','Crédito','Content')",[id]);
  assert.equal((await publishedPosts()).length,0);assert.equal(await publishedPost("draft"),null);
  await db.query("UPDATE blog_posts SET published=true,published_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=$1",[id]);
  assert.equal((await publishedPosts("Crédito")).length,1);assert.equal((await publishedPosts("Câmbio")).length,0);assert.equal((await publishedPost("draft")).id,id);
  await db.query("UPDATE blog_posts SET published=false WHERE id=$1",[id]);assert.equal(await publishedPost("draft"),null);
});
test("editor restricts slugs and covers; HTML remains plain text",()=>{
  const post={title:"Artigo teste",slug:"artigo-teste",excerpt:"Resumo com tamanho suficiente",category:"Crédito",cover:"/images/hero-office.png",content:"<script>alert('x')</script> Texto suficiente para o artigo."};
  assert.ok(validatePost(post));assert.equal(validatePost({...post,slug:"../admin"}),false);assert.equal(validatePost({...post,cover:"https://evil.example/file"}),false);assert.equal(validatePost({...post,category:"unknown"}),false);
});
test("WhatsApp form is stored and invalid requests are rejected",async()=>{
  const request=body=>new Request("http://localhost/api/contacts",{method:"POST",body:JSON.stringify(body)});
  assert.equal((await contact(request({nome:"Maria",empresa:"Exemplo",telefone:"(15) 99999-9999"}))).status,200);
  assert.equal((await db.query("SELECT kind FROM submissions")).rows[0].kind,"contact");
  assert.equal((await contact(request({nome:"",empresa:"Exemplo",telefone:"abc"}))).status,400);
});
test("contact search treats SQL syntax as data and paginates",async()=>{
  await captureSubmission("contact",{nome:"Maria",telefone:"15999999999"});
  assert.equal((await listSubmissions("contact","","Maria",1)).total,1);
  assert.equal((await listSubmissions("","","' OR 1=1 --",1)).total,0);
  assert.equal((await listSubmissions("contact","arquivado","",1)).total,0);
});
test("webhook worker forwards the legacy lead contract with a stable idempotency key",async()=>{
  process.env.N8N_LEAD_WEBHOOK_URL="https://n8n.example.test/leads";
  const created=await (await captureSubmission("lead",{nome:"Maria",razaoSocial:"Exemplo",cnpj:"12345678000190",email:"maria@example.test",telefone:"15999999999",idEmpresa:"001"})).json();
  const network=mock.method(globalThis,"fetch",async()=>new Response(null,{status:204}));
  try {
    assert.equal(await processNextWebhook(),true);
    const [url,options]=network.mock.calls[0].arguments;assert.equal(url,process.env.N8N_LEAD_WEBHOOK_URL);assert.equal(options.headers["Idempotency-Key"],created.id);assert.equal(JSON.parse(options.body).lead.nome,"Maria");assert.equal(JSON.parse(options.body).idEmpresa,"001");
    assert.equal((await db.query("SELECT status FROM webhook_jobs")).rows[0].status,"sent");assert.equal(await processNextWebhook(),false);
  } finally { network.mock.restore(); }
});
test("failed webhook preserves the contact, retries and stops after five attempts",async()=>{
  process.env.N8N_INVESTOR_WEBHOOK_URL="https://n8n.example.test/investor";
  await captureSubmission("investor",{nome:"Maria",email:"maria@example.test",origem:"solicitar_apresentacao"});
  const network=mock.method(globalThis,"fetch",async()=>new Response("upstream secret",{status:500}));
  try {
    for(let i=0;i<5;i++){await db.query("UPDATE webhook_jobs SET next_attempt_at=strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 second')");await processNextWebhook();}
    const job=(await db.query("SELECT * FROM webhook_jobs")).rows[0];assert.equal(job.status,"failed");assert.equal(job.attempts,5);assert.equal(job.last_error,"HTTP 500");assert.equal((await db.query("SELECT * FROM submissions")).rows.length,1);assert.equal(await processNextWebhook(),false);
  }finally{network.mock.restore();}
});
test("migration runner is idempotent",async()=>{
  await migrate();
  assert.equal((await db.query("SELECT * FROM schema_migrations")).rows.length,1);
});
test("capture and queued delivery roll back together on error",async()=>{
  process.env.N8N_LEAD_WEBHOOK_URL="https://n8n.example.test/lead";
  const transaction = db.transaction.bind(db);
  const broken=mock.method(db,"transaction",async(work)=>transaction(async tx=>work({query:async(sql,values)=>{if(sql.includes("webhook_jobs"))throw new Error("queue insert failed");return tx.query(sql,values);}})));
  try{assert.equal((await captureSubmission("lead",{nome:"Maria",email:"maria@example.test"})).status,503);assert.equal((await db.query("SELECT * FROM submissions")).rows.length,0);}finally{broken.mock.restore();}
});
