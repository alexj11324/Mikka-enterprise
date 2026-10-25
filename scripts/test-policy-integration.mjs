import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync,openSync,closeSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {randomBytes} from 'node:crypto'
import {createRequire} from 'node:module'
import {execFileSync,spawn} from 'node:child_process'
import {createServer} from 'node:net'
import {root} from './prepare.mjs'
for(const key of ['DATABASE_URL','MIKKA_DATABASE_URL','WORKSPACE_DATABASE_URL','VERCEL_ENV','MIGRATE'])assert.ok(!process.env[key],`Unset inherited ${key}; isolated tests only`)
const port=Number(process.env.POLICY_TEST_PORT??5432),user=process.env.POLICY_TEST_USER??'postgres'
assert.ok(Number.isInteger(port)&&port>0&&port<65536);assert.match(user,/^[a-z_][a-z0-9_]*$/)
const manifest=JSON.parse(readFileSync(join(root,'overlay.lock.json'),'utf8'))
const reports=Object.fromEntries(['community','enterprise'].map(mode=>[mode,JSON.parse(readFileSync(join(root,'.build',mode+'-build-report.json'),'utf8'))]))
const dirs=Object.fromEntries(Object.entries(reports).map(([mode,r])=>{const c=JSON.parse(readFileSync(join(r.destination,'composition.json'),'utf8'));assert.equal(c.mode,mode);assert.equal(c.coreSha,manifest.coreSha);assert.ok(readFileSync(join(r.destination,'.next','BUILD_ID'),'utf8').trim());return [mode,r.destination]}))
assert.deepEqual(JSON.parse(readFileSync(join(dirs.enterprise,'composition.json'),'utf8')).overrides,manifest.overrides)
const require=createRequire(join(dirs.community,'package.json'));const {Pool}=require('pg')
const suffix=randomBytes(5).toString('hex'),appName=`policy_split_${suffix}_app_e2e`,wsName=`policy_split_${suffix}_workspace_e2e`
const url=name=>`postgresql://${user}@127.0.0.1:${port}/${name}`
const env={PATH:process.env.PATH,HOME:process.env.HOME,CI:'true',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',MIKKA_DATABASE_URL:url(appName),DATABASE_URL:url(wsName),POLICY_APP_TEST_URL:url(appName),POLICY_WORKSPACE_TEST_URL:url(wsName),REQUIRE_POLICY_DB:'1',BETTER_AUTH_SECRET:randomBytes(48).toString('hex')}
const evidence=resolve(root,'.build','policy-integration-evidence');mkdirSync(evidence,{recursive:true})
const run=(cwd,args,name,extra={})=>{const output=execFileSync(process.execPath,args,{cwd,env:{...env,...extra},encoding:'utf8',timeout:180000,maxBuffer:20*1024*1024});writeFileSync(join(evidence,name),output);return output}
const servers=[],fds=[]
async function freePort(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p}
try{
 const admin=new Pool({connectionString:url('postgres')});try{await admin.query(`CREATE DATABASE ${appName}`);await admin.query(`CREATE DATABASE ${wsName}`)}finally{await admin.end()}
 const first=run(dirs.community,['scripts/migrate.mjs'],'migrations.log',{MIGRATE:'1'}),replay=run(dirs.community,['scripts/migrate.mjs'],'migrations-replay.log',{MIGRATE:'1'});assert.equal(replay.trim(),'')
 const corePG=run(dirs.community,['--import','tsx','--test','lib/policy/postgres.test.ts','lib/policy/run-scope.test.ts'],'core-pg.log')
 const enterprisePG=run(dirs.enterprise,['--import','tsx','--test','lib/business/policy-admin/postgres.test.ts'],'enterprise-pg.log')
 for(const output of [corePG,enterprisePG])assert.match(output,/(?:skipped 0|# skipped 0)/)
 const origins={}
 for(const mode of ['community','enterprise']){
  const runtimePort=await freePort();origins[mode]=`http://127.0.0.1:${runtimePort}`
  const fd=openSync(join(evidence,mode+'-runtime.log'),'w');fds.push(fd)
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(runtimePort)],{cwd:dirs[mode],env:{...env,BETTER_AUTH_URL:origins[mode]},stdio:['ignore',fd,fd]});servers.push(child)
 }
 run(dirs.community,['--import','tsx','scripts/policy/split-acceptance.mjs'],'http.log',{POLICY_CORE_ORIGIN:origins.community,POLICY_ENTERPRISE_ORIGIN:origins.enterprise,POLICY_SPLIT_EVIDENCE_DIR:evidence})
 const http=JSON.parse(readFileSync(join(evidence,'acceptance.json'),'utf8'))
 const identities=[];for(const name of [appName,wsName]){const db=new Pool({connectionString:url(name)});try{identities.push((await db.query('SELECT current_database() database,version() server')).rows[0])}finally{await db.end()}}
 const attestation={utc:new Date().toISOString(),overlaySha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),overlayDirty:execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),coreSha:manifest.coreSha,overrides:manifest.overrides,buildIds:Object.fromEntries(Object.entries(dirs).map(([m,d])=>[m,readFileSync(join(d,'.next','BUILD_ID'),'utf8').trim()])),databases:identities,appliedMigrations:first.trim().split('\n').length,migrationReplay:0,corePG:'passed, zero skips',enterprisePG:'passed, zero skips',httpChecks:http.results,httpRequests:http.requests.length,provider:'no real provider invoked; policy-rejected requests, no provider credentials configured',production:false}
 writeFileSync(join(evidence,'attestation.json'),JSON.stringify(attestation,null,2));console.log(JSON.stringify({coreSha:attestation.coreSha,overlaySha:attestation.overlaySha,buildIds:attestation.buildIds,corePG:attestation.corePG,enterprisePG:attestation.enterprisePG,httpChecks:http.results.length,httpRequests:http.requests.length,databases:identities.map(x=>x.database)}))
}finally{for(const child of servers)if(child.exitCode===null)child.kill('SIGTERM');for(const fd of fds)closeSync(fd)}
