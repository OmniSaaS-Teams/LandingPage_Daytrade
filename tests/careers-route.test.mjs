import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { readdir } from "node:fs/promises";
import { POST } from "../src/app/api/careers/route.ts";
import { db } from "../src/lib/db.ts";
import { readResume,privatePath } from "../src/lib/storage.ts";
import { databaseFixture } from "./helpers/database.mjs";
const fixture=databaseFixture();
function request(overrides={},file=new File(["%PDF-1.7\nexample"],"resume.pdf",{type:"application/pdf"})) {const form=new FormData();for(const [k,v] of Object.entries({nome:"Maria Silva",email:"maria@example.test",telefone:"(15) 99999-9999",area:"Tecnologia e dados",mensagem:"Minha trajetória",consentimento:"true",...overrides}))form.set(k,v);if(file)form.set("curriculo",file);return new Request("http://localhost/api/careers",{method:"POST",body:form});}
test("persists candidate and private resume without requiring a webhook",async()=>{const r=await POST(request());assert.equal(r.status,200);const stored=(await db.query("SELECT s.data,u.path,u.mime FROM submissions s JOIN uploads u ON u.id=s.upload_id")).rows[0];assert.equal(stored.data.nome,"Maria Silva");assert.equal(stored.mime,"application/pdf");assert.equal((await readResume(stored.path)).toString(),"%PDF-1.7\nexample");assert.ok(!stored.path.includes("Maria"));});
test("rejects invalid fields and missing consent before persisting",async()=>{for(const data of [{nome:""},{email:"bad"},{telefone:"abc"},{area:"unknown"},{mensagem:"x".repeat(2001)},{consentimento:"false"}])assert.equal((await POST(request(data))).status,400);assert.equal((await db.query("SELECT * FROM submissions")).rows.length,0);});
test("rejects missing files, disguised files and excessive size",async()=>{assert.equal((await POST(request({},null))).status,400);assert.equal((await POST(request({},new File(["fake"],"fake.pdf")))).status,400);assert.equal((await POST(request({},new File(["%PDF-1.7"],"fake.exe")))).status,400);assert.equal((await POST(request({},new File([new Uint8Array(5242881)],"big.pdf")))).status,413);});
test("limits actual request bytes without a Content-Length",async()=>{const r=new Request("http://localhost/api/careers",{method:"POST",headers:{"Content-Type":"multipart/form-data; boundary=test"},body:new Uint8Array(6*1024*1024)});assert.equal((await POST(r)).status,413);});
test("cleans newly stored file if the database transaction fails",async()=>{const before=await readdir(fixture.directory).catch(()=>[]);const broken=mock.method(db,"transaction",async()=>{throw new Error("db failed");});try{assert.equal((await POST(request())).status,503);assert.deepEqual(await readdir(fixture.directory).catch(()=>[]),before);}finally{broken.mock.restore();}});
test("private storage rejects traversal and arbitrary paths",()=>{for(const path of ["../secret.pdf","/etc/passwd","anything.pdf"])assert.throws(()=>privatePath(path));});
