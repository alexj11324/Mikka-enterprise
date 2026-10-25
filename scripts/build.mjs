import {execFileSync} from 'node:child_process'
import {buildEnvironment} from './build-environment.mjs'
import {prepare,root} from './prepare.mjs'
import {resolve,join} from 'node:path'
import {mkdtempSync} from 'node:fs'
import {tmpdir} from 'node:os'
if(execFileSync('pnpm',['--version'],{encoding:'utf8'}).trim()!=='10.34.3')throw new Error('Install pinned pnpm 10.34.3 first')
const mode=process.argv[2]??'enterprise'
const env=buildEnvironment(process.env,resolve(root,'.build','swc-cache'))
const dest=prepare(mode,join(mkdtempSync(join(tmpdir(),'mikka-composition-')),mode))
execFileSync('pnpm',['install','--frozen-lockfile',...(process.env.MIKKA_BUILD_OFFLINE==='1'?['--offline','--store-dir',resolve(root,'../..','.pnpm-store')]:[])],{cwd:dest,env,stdio:'inherit'})
// The pinned public build retains its own lint/migrate/build behavior. With no
// DB configuration, its migration runner must skip; production is a separate plan.
execFileSync('pnpm',['build'],{cwd:dest,env,stdio:'inherit'})
