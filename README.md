# Mikka enterprise overlay — local review baseline

The target `alexj11324/Mikka-enterprise` has **not been created**: GitHub's createRepository operation returned `Resource not accessible by integration`. This local repository is not proof of private GitHub visibility. Do not push this tree to the public core.

`core` is a public Git submodule pinned to `a1610e7cb411b0b676b8365df63c93986f205cbf`. No branch-tracking setting is used. `overlay.lock.json` additionally pins the public interface patch and the sole permitted private override by SHA-256. Public builds have a standalone community implementation and import no private package or credential.

The minimal v1 seam exposes distribution/management discovery metadata only. It does not authorize execution and advertises no implemented enterprise modules. Existing security, quota, credential, audit and recovery implementations remain in the public core. This skeleton does **not** implement SSO, SCIM, VPC delivery or a billing platform.

- `pnpm test`: compile both contract compositions and test safe destination handling.
- `pnpm prepare:core` / `pnpm prepare:enterprise`: create a fresh isolated source tree; refuse dirty/mismatched submodule, altered hashes, arbitrary override paths, symlinks and an existing output directory.
- `pnpm build`: build the enterprise composition using pinned pnpm 10.34.3 and the pinned public build. It rejects inherited DB/migration/production variables and passes a minimal environment. Deployment and production migrations require separate reviewed manifest-based orchestration.

No new PAT, deploy key, OAuth grant, CI secret, member or paid resource is included. Existing authorized access must be sufficient before remote creation/push resumes. API `private:true`/`visibility:private` must be read back before uploading private implementation; package.json `private:true` only prevents package publishing.

The public-interface patch is a review artifact pending separate public-core approval/commit. After it lands, update the submodule pin and remove the patch in a reviewed change; do not float to main. All source PRs and the unfinished #268+#265 worktree are retained.

See [boundary and migration plan](docs/boundary-migration.md) and [license notices](NOTICE.md).
