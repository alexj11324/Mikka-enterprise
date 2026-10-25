import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import vm from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
const require=createRequire(import.meta.url), dir=resolve('extensions/policy-admin');
const cache=new Map();
function load(name){
 if(cache.has(name))return cache.get(name);
 const exports={};cache.set(name,exports);
 const code=ts.transpileModule(readFileSync(join(dir,name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:id=>id.startsWith('./')?load(id.slice(2)):require(id),Request,Response,URL,Buffer});return exports;
}
test('extracted management surface strictly typechecks without a SQL/runtime import',()=>{
 const files=readdirSync(dir).filter(f=>f.endsWith('.ts')).map(f=>join(dir,f));
 const p=ts.createProgram(files,{strict:true,noEmit:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,skipLibCheck:true,types:['node']});
 assert.deepEqual(ts.getPreEmitDiagnostics(p).map(x=>ts.flattenDiagnosticMessageText(x.messageText,'\n')),[]);
});
test('management adapter over real loopback HTTP preserves transport guards and delegates authority to core (test double, not PostgreSQL)',async()=>{
 class PolicyError extends Error{constructor(code,status){super(code);this.code=code;this.status=status}}
 const calls=[];let mode='normal';
 const signed={version:7};
 const core={origin:'https://management.example.invalid',contract:{PolicyError,documentSchema:z.strictObject({schemaVersion:z.literal(1)})},
 authenticate:async req=>req.headers.get('cookie')==='session=synthetic-owner'?{userId:'synthetic-owner'}:null,
 admin:()=>({signer:{keyId:'synthetic-key',publicKey:'synthetic-public-key'},
 read:async(...args)=>{calls.push(['read',...args]);if(mode==='denied')throw new PolicyError('policyForbidden',403);return signed},
 current:async(...args)=>{calls.push(['current',...args]);if(mode==='revoked')throw new PolicyError('policyRevoked',403);return [{signed}]},
 publish:async(...args)=>{calls.push(['publish',...args]);if(mode==='conflict')throw new PolicyError('policyVersionConflict',409);if(mode==='failure')throw new Error('synthetic-internal-detail');return signed}})};
 const route=load('app-route').createPolicyRoutes(core);assert.equal(route.dynamic,'force-dynamic');
 const server=createServer(async(req,res)=>{try{
 const request=new Request(`http://127.0.0.1${req.url}`,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
 const response=await route.GET(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end()}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api/policy?workspaceId=11111111-1111-4111-8111-111111111111`;
 const headers={cookie:'session=synthetic-owner',origin:core.origin,'content-type':'application/json'};
 let count=0;
 async function call(expected,{method='GET',extra={},body,url=base}={}){const r=await fetch(url,{method,headers:{...headers,...extra},body});assert.equal(r.status,expected);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');count++;return r.json()}
 try{
 await call(200);assert.equal(calls[0][2],'synthetic-owner');
 const before=calls.length;await call(200,{url:base+'&version=2'});assert.equal(calls.length,before+1);assert.equal(calls.at(-1)[3],2);
 await call(401,{extra:{authorization:'Bearer synthetic-forbidden'}});
 await call(401,{extra:{cookie:''}});await call(401,{extra:{cookie:'session=synthetic-invalid'}});
 await call(422,{url:base.replace('11111111-1111-4111-8111-111111111111','invalid')});
 await call(422,{url:base+'&version=0'});await call(405,{method:'DELETE'});
 const publication=JSON.stringify({expectedVersion:7,document:{schemaVersion:1}});
 await call(403,{method:'POST',body:publication,extra:{origin:'https://other.example.invalid'}});
 await call(403,{method:'POST',body:publication,extra:{'sec-fetch-site':'cross-site'}});
 await call(415,{method:'POST',body:publication,extra:{'content-type':'text/plain'}});
 await call(422,{method:'POST',body:'{'});
 await call(413,{method:'POST',body:' '.repeat(65537)});
 await call(422,{method:'POST',body:JSON.stringify({expectedVersion:7,document:{schemaVersion:1},bypass:true})});
 await call(422,{method:'POST',body:JSON.stringify({expectedVersion:7,document:{schemaVersion:99}})});
 await call(201,{method:'POST',body:publication});assert.equal(calls.at(-1)[3],7);assert.equal(calls.at(-1)[4].schemaVersion,1);
 await call(201,{method:'POST',body:JSON.stringify({expectedVersion:7,rollbackOf:2})});assert.equal(calls.at(-1)[4],undefined);assert.equal(calls.at(-1)[5],2);
 mode='revoked';assert.equal((await call(200)).blocked,'policyRevoked');
 mode='denied';assert.equal((await call(403)).error,'policyForbidden');
 mode='conflict';assert.equal((await call(409,{method:'POST',body:publication})).error,'policyVersionConflict');
 mode='failure';assert.deepEqual(await call(503,{method:'POST',body:publication}),{error:'policyUnavailable'});
 assert.equal(count,21);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
});
