import { execFileSync } from 'node:child_process'
import { readFileSync, mkdirSync, existsSync, copyFileSync, writeFileSync, realpathSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const digest=data=>createHash('sha256').update(data).digest('hex')
export function prepare(mode, destination) {
  if (!['community','enterprise'].includes(mode)) throw new Error('Unknown composition')
  const manifest=JSON.parse(readFileSync(resolve(root,'overlay.lock.json'),'utf8'))
  const core=resolve(root,'core')
  const sha=execFileSync('git',['-C',core,'rev-parse','HEAD'],{encoding:'utf8'}).trim()
  if(sha!==manifest.coreSha || !/^[0-9a-f]{40}$/.test(sha))throw new Error('Core pin mismatch')
  if(execFileSync('git',['-C',core,'status','--porcelain'],{encoding:'utf8'}).trim())throw new Error('Dirty core rejected')
  const patch=readFileSync(resolve(root,'public-interface.patch'))
  if(digest(patch)!==manifest.publicInterfacePatchSha256)throw new Error('Public interface patch mismatch')
  const dest=resolve(destination)
  if(existsSync(dest))throw new Error('Destination exists; no overwrite')
  mkdirSync(dest,{recursive:true})
  const archive=execFileSync('git',['-C',core,'archive',sha],{maxBuffer:100*1024*1024})
  execFileSync('tar',['-x','-C',dest],{input:archive})
  // Give source-aware tools their own root; parent .build ignore must not hide
  // the exported application from lint/build discovery.
  execFileSync('git',['init','--quiet',dest])
  execFileSync('git',['apply','--check',resolve(root,'public-interface.patch')],{cwd:dest,env:{...process.env,GIT_CEILING_DIRECTORIES:dirname(dest)}})
  execFileSync('git',['apply',resolve(root,'public-interface.patch')],{cwd:dest,env:{...process.env,GIT_CEILING_DIRECTORIES:dirname(dest)}})
  if(mode==='enterprise')for(const entry of manifest.overrides){
    // A single explicit business seam. Do not accept arbitrary paths from manifests.
    if(entry.target!=='lib/business/implementation.ts'||entry.source!=='overlay/lib/business/implementation.ts')throw new Error('Forbidden override target')
    const source=resolve(root,entry.source)
    if(realpathSync(source)!==source)throw new Error('Symlink override rejected')
    const data=readFileSync(source)
    if(digest(data)!==entry.sha256)throw new Error('Override digest mismatch')
    copyFileSync(source,resolve(dest,entry.target))
  }
  writeFileSync(resolve(dest,'composition.json'),JSON.stringify({mode,coreSha:sha,publicInterfacePatchSha256:manifest.publicInterfacePatchSha256,overrides:mode==='enterprise'?manifest.overrides:[]},null,2)+'\n')
  return dest
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(prepare(process.argv[2],process.argv[3]??resolve(root,'.build',process.argv[2])))
