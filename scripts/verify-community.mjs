import {readFileSync,readdirSync,lstatSync,existsSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {root} from './prepare.mjs'
export function verifyCommunity(destination) {
 const dest=resolve(destination)
 const composition=JSON.parse(readFileSync(join(dest,'composition.json'),'utf8'))
 if(composition.mode!=='community'||composition.overrides.length!==0)throw new Error('Not a community composition')
 const manifest=JSON.parse(readFileSync(join(root,'overlay.lock.json'),'utf8'))
 if(composition.coreSha!==manifest.coreSha)throw new Error('Community pin mismatch')
 const forbidden=manifest.overrides.flatMap(entry=>[
   readFileSync(join(root,entry.source)),Buffer.from(entry.source),
   Buffer.from('Initial private composition'),Buffer.from("distribution: 'enterprise'")
 ])
 let checked=0
 function scan(path) {
   if(lstatSync(path).isSymbolicLink())throw new Error('Unexpected artifact symlink')
   if(lstatSync(path).isDirectory()){
     for(const entry of readdirSync(path))if(!['.git','node_modules','cache'].includes(entry))scan(join(path,entry))
   }else{
     const bytes=readFileSync(path);checked++
     if(forbidden.some(value=>bytes.includes(value)))throw new Error(`Private implementation in community artifact: ${path.slice(dest.length+1)}`)
   }
 }
 scan(join(dest,'lib/business'))
 if(!existsSync(join(dest,'.next','BUILD_ID')))throw new Error('Missing completed Next build')
 scan(join(dest,'.next'))
 return {mode:'community',coreSha:composition.coreSha,buildId:readFileSync(join(dest,'.next','BUILD_ID'),'utf8').trim(),filesChecked:checked,scope:'business source and Next artifacts (excluding cache); current pinned override markers only, not a general semantic information-flow proof'}
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(verifyCommunity(process.argv[2]),null,2))
