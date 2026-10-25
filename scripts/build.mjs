import {execFileSync} from 'node:child_process'
import {prepare,root} from './prepare.mjs'
import {resolve,join} from 'node:path'
import {mkdtempSync} from 'node:fs'
import {tmpdir} from 'node:os'
// Initial local/CI build is deliberately credential-free. No production migrate.
for(const name of ['DATABASE_URL','MIKKA_DATABASE_URL','WORKSPACE_DATABASE_URL','VERCEL_ENV','MIGRATE'])if(process.env[name])throw new Error(`Unset ${name} for isolated skeleton build`)
if(execFileSync('pnpm',['--version'],{encoding:'utf8'}).trim()!=='10.34.3')throw new Error('Install pinned pnpm 10.34.3 first')
const mode=process.argv[2]??'enterprise'
const dest=prepare(mode,join(mkdtempSync(join(tmpdir(),'mikka-composition-')),mode))
const env={PATH:process.env.PATH,HOME:process.env.HOME,CI:'true',NEXT_TELEMETRY_DISABLED:'1',SWC_NATIVE_BINDING_CACHE:resolve(root,'.build','swc-cache')}
execFileSync('pnpm',['install','--frozen-lockfile',...(process.env.MIKKA_BUILD_OFFLINE==='1'?['--offline','--store-dir',resolve(root,'../..','.pnpm-store')]:[])],{cwd:dest,env,stdio:'inherit'})
// The pinned public build retains its own lint/migrate/build behavior. With no
// DB configuration, its migration runner must skip; production is a separate plan.
execFileSync('pnpm',['build'],{cwd:dest,env,stdio:'inherit'})
