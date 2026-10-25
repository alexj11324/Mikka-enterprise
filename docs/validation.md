# Validation checkpoint — 2026-10-25

Current result: public original baseline and private composition full builds both exited 0. Earlier failed attempts below are retained as investigation history, not current blockers. Private GitHub repository is now verified accessible; upload/draft readback follows separately.

- Public core pin independently read from GitHub main: a1610e7cb411b0b676b8365df63c93986f205cbf.
- Local gitlink mode 160000 and .gitmodules reference that exact public repository. No floating branch or credential-bearing URL.
- Contract/composition tests: 4 passed, 0 failed, 0 skipped. TypeScript checks both default and override, rejects unsupported contract versions/existing destinations, verifies nested-output patch behavior, and byte-compares every existing public tracked file including LICENSE against the composed output.
- Full enterprise application build: NOT passed. Frozen offline dependency install, public lint/code/UI/migration validation passed; migration runner explicitly skipped actual SQL. Next build failed fetching the existing Geist font from fonts.googleapis.com (connection establishment failure). No font substitution, mocked build-success assertion, credentials, or production configuration was introduced.
- Initial preparation exposed parent Git-root/ignore inheritance; fixed by initializing a fresh output repository. The final build script also uses a temporary directory outside the private repository so Next root inference cannot select the overlay's parent lockfile. Final-script full build remains pending reachable official font delivery; no repetitive retry after the same network failure.
- Existing #268+#265 isolated worktree: local typecheck exit 0; existing PG/real SDK HTTP regression 27/27 and source-provider fence tests 4/4. Full integrated Next/worker/CI not complete; no new source commit or public push.
- Remote private baseline, API visibility readback, private draft PR and remote CI: blocked. gh repo create alexj11324/Mikka-enterprise --private returned GraphQL Resource not accessible by integration (createRepository). No alternative tool/identity retry, no new access credential. Existing same-owner private repositories were read; none had this overlay purpose.
- Six source issues read in full and mapped in boundary-migration.md. No transfer/closure/deletion/hiding performed. Destination IDs do not yet exist.

Local logs (not uploaded): /workspace/scratch/overlay-contract-tests.log; /workspace/scratch/overlay-enterprise-build-offline2.log; /tmp/quota-combo-types.log. Do not treat local-only logs as independently reviewed remote CI.

Resume requires an authorized existing GitHub connection able to create/access the exact PRIVATE target (or the owner supplying it), then API readback before push. This is a server-side GitHub integration permission denial, not missing user intent. No broad new IAM/PAT permission is requested or created by this checkpoint.

## Font/network investigation follow-up

The exact public baseline was exported without overlay or interface patch and reproduced the identical Geist failure with stripped transport environment. The same official Google CSS request succeeded through the existing proxy and failed without it (curl exit 7). Next's official Node font fetcher also retrieved the actual CSS and all five font resources; no mocked response or replacement font was used.

Forwarding existing proxy/CA paths exposed Turbopack's explicit TLS diagnostic. Enabling its documented-in-error system TLS option fixed that stage. This uses existing system trust, does not install a certificate, and never disables verification. Application/provider credentials and DB/migration variables remain excluded; five contract/environment regressions pass.

One parallel compilation exited 137 with cgroup OOM kill recorded under the existing 16 GiB limit. Subsequent builds are serial; no memory resource or paid service was added. Failed logs are retained alongside successful evidence, not overwritten as successes. Public baseline full build then exited 0 with 25/25 static pages. Private serial composition final result is recorded below after completion.

## Final local build results

Both exact public baseline and enterprise composition completed full pnpm build with exit 0, including lint, migration checks (SQL skipped), Next/Turbopack compile, TypeScript and page generation. Public build ID: rh5mAQMEX_UOxvgtWr0V-. Enterprise build ID: sWRcZ2GTgKsy0H9NLXHg9. Both app-path manifests contain 69 entries and 25 nonempty WOFF2 font artifacts with valid magic bytes. Every pre-existing public tracked file remains byte-identical after both builds. The composition adds only the three explicit business seam files; no UI font/design source was altered.

Builds intentionally had no real auth/provider configuration: Better Auth emitted missing-baseURL/default-secret diagnostics while collecting pages. This is build validation, not login/runtime or production acceptance. Artifacts are not approved for deployment with those missing runtime settings.

Final logs: /workspace/scratch/public-baseline-system-tls-build.log and /workspace/scratch/overlay-enterprise-serial-build.log. Artifact manifest: /workspace/scratch/overlay-build-artifacts.json. Environment/contract suite: 5/5 pass. No database migration executed.

Private repo readback: alexj11324/Mikka-enterprise, id 1433573282, private=true, visibility=private, default_branch=main, size=0, current connection push=true. Listing refs returned expected HTTP409 Git Repository is empty. This is a new repository supplied by the parent after the earlier createRepository denial, not a retried create or credentials workaround.
