# Dual-build CI

Base prepared tree: 845c78cd90c328ac3cecea43c10f40fb68cba5a3. Applicable private PR head: 860f0cf216be85ff53e7ab295567635b23d63c23. Public core remains pinned to a1610e7cb411b0b676b8365df63c93986f205cbf.

The workflow runs contract tests, then full community and enterprise `pnpm build` sequentially. The owner made this repository public on 2026-10-25 and authorized ordinary hosted CI. It uses standard ubuntu-latest, without larger runners, self-hosted registration, new credentials or billing changes. The original billing-blocked run was requested once for re-execution after public visibility was verified.

A future self-hosted runner must be private-repository scoped, Linux x64, isolated from production credentials and databases, and use an ephemeral/clean workspace. The existing 16 GiB cloud environment completed the prior builds serially; parallel builds caused OOM. Required existing public download access includes npm, the pinned public Git repository, Next/SWC and Google fonts. Current core does not contain the later BYOS worker build, so this skeleton does not prove those worker deployment paths.

The community gate requires a completed Next BUILD_ID, exact core pin, zero composition overrides and checks the business source and Next artifacts against the current pinned private override bytes/path/markers. Unit regression deliberately injects private source into a synthetic build artifact and requires failure. Synthetic tests alone are not a successful Next build. Cache is excluded; this gate is evidence against accidental inclusion of current implementations, not a semantic noninterference proof for future private modules. New private implementations must update boundary tests.

Public-interface.patch is still a proposed interface, not merged into public core, and has no actual app consumer. Passing both builds demonstrates composition mechanics only, not enterprise functionality or production acceptance.

Local evidence files are outside Git; no application secrets or DB configuration are forwarded. Build reports record mode, destination, public pin and community artifact scan results. Original successful enterprise build remains valid because its inputs are unchanged; the new build wrapper and CI require exact-head hosted validation; local tests are not a substitute.
