import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,readFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import ts from 'typescript'
import {execFileSync} from 'node:child_process'
import {prepare,root} from '../scripts/prepare.mjs'
import vm from 'node:vm'
for(const mode of ['community','enterprise'])test(`${mode} composition compiles without private imports and exports only declared metadata`,()=>{
 const dest=prepare(mode,join(mkdtempSync(join(tmpdir(),'mikka-overlay-')),mode))
 const files=['contract.ts','implementation.ts','index.ts'].map(f=>join(dest,'lib/business',f))
 const program=ts.createProgram(files,{strict:true,noEmit:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,skipLibCheck:true,types:[]})
 assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')),[])
 const load=f=>{const exports={};const code=ts.transpileModule(readFileSync(join(dest,'lib/business',f+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(code,{exports,require:id=>{assert.equal(id,'./contract');return load('contract')}});return exports}
 const value=load('implementation').default
 assert.equal(value.distribution,mode);assert.equal(value.apiVersion,1);assert.equal(value.managementModules.length,0)
 assert.ok(Object.isFrozen(value));assert.ok(Object.isFrozen(value.managementModules))
 assert.throws(()=>load('contract').validateBusinessExtension({apiVersion:2,distribution:mode,managementModules:[]}),/Unsupported/)
 assert.throws(()=>prepare(mode,dest),/Destination exists/)
})

test('composition below overlay repository applies public patch to destination, not parent',()=>{
 const dest=prepare('enterprise',join(root,'.build',`nested-test-${Date.now()}`))
 assert.match(readFileSync(join(dest,'lib/business/contract.ts'),'utf8'),/BusinessExtension/)
})

test('enterprise overlay preserves every existing public tracked file including security and notices',()=>{
 const dest=prepare('enterprise',join(mkdtempSync(join(tmpdir(),'mikka-boundary-')),'app'))
 const files=execFileSync('git',['-C',join(root,'core'),'ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean)
 for(const file of files)assert.deepEqual(readFileSync(join(dest,file)),readFileSync(join(root,'core',file)),file)
 assert.ok(files.includes('LICENSE'))
})
