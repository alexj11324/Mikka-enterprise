import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {prepare,root} from '../scripts/prepare.mjs'
import {verifyCommunity} from '../scripts/verify-community.mjs'
test('artifact guard rejects incomplete builds and private implementation contamination',()=>{
 const dest=prepare('community',join(mkdtempSync(join(tmpdir(),'mikka-artifact-')),'community'))
 assert.throws(()=>verifyCommunity(dest),/Missing completed/)
 mkdirSync(join(dest,'.next','server'),{recursive:true})
 writeFileSync(join(dest,'.next','BUILD_ID'),'synthetic-guard-test')
 assert.ok(verifyCommunity(dest).filesChecked>=4)
 writeFileSync(join(dest,'.next','server','leaked.js'),readFileSync(join(root,'overlay/lib/business/implementation.ts')))
 assert.throws(()=>verifyCommunity(dest),/Private implementation/)
})
