# Policy safety repair evidence (private review only)

Parent-authorized evidence handoff for #230/#231 / draft public PR #264. This independent evidence branch contains **no runnable application or overlay**. Main and codex/pinned-core-overlay are not push targets. The target was verified private with existing pull/push access; no access or repository settings were created/changed.

## Immutable source and review payload

- Exact public base: 721bbf3615f7b9a3672c149112382dac75c72cb8.
- Exact local candidate: a3ed50866bd8b9c76223192f1f9a1220ead0b0bc; parent is the exact base. Source and three test/build worktrees had clean tracked files. Only dependency symlinks were untracked. The candidate commit itself has not been pushed to public #264.
- [Safety-only patch](patches/public-safety-candidate.patch): seven existing backend/test files. It revalidates worker credential MCP identity/policy after body parsing; checks the shared credential executor; and enforces untrusted generic retry policy at the locked claim hook while preserving prior Factory/Skill domain refusals. No new enterprise management API is added in this delta.
- [Held mixed documentation](patches/held-mixed-documentation.patch) remains separate for boundary review, not approved publishing.
- [Source/worktree attestation](attestation/source-worktrees.json) includes exact base/head trees and payload hash. An isolated Git index applied the safety patch cleanly to the base. Its only difference from the full candidate is the held documentation file; applying both patches reconstructs the exact candidate tree. No checkout/history of the application is copied here.

Example review in a separately authorized local checkout of the public source: check out the exact base above, then git apply --check patches/public-safety-candidate.patch. The selected resulting tree is pinned in the attestation. The patch is a candidate for independent review/splitting, not automatic permission to publish it.

## Actual results and limits

- Root types/lint passed. [21 policy checks](proof/policy-pg.log), zero skips: 5 contract + 3 SDK + 10 real workspace-PG child scenarios + their parent + 1 application-PG scope case + 1 SQL adapter. Not 21 PG scenarios.
- [74 actual HTTP requests](proof/http-acceptance.json) passed on dedicated cloud Linux Next development/on-demand runtime with separate loopback PG17 databases. Synthetic Better Auth sessions and manually seeded compatible OAuth/run tokens exercise existing authentication; this is not a real external OAuth grant or real user/provider acceptance. Includes initial enrollment/revoke/version change after auth, six delayed OAuth bodies across one revoke, worker credential body-phase enforcement, and ambiguous continuation/retry refusal with no issued token.
- [Production webpack build](proof/production-build-result.json) succeeded at the exact local candidate in an isolated Node24 container. [Three unchanged production backend regressions](proof/production-e2e.log) passed in 18.2s: Factory execution, Skill baseline/claim/feedback and worker authorization. These are three scoped existing cases, not a full browser-suite run.
- [Environment/results](proof/environment-results.json) identifies source, stores, image digests, scopes and no forwarded provider keys. Original [API browser recording](proof/policy-http-raw.webm) was decoded and visually inspected; it shows synthetic policy reads and refusal, not all 74 cases or real product/provider execution. No headers/cookies/secrets are shown.
- An **isolated database-only overlay** of upstream audit 1b39b709ce361b9643524aea983860e6de818ff6 supports scope inheritance tests. The policy source ancestry still contains audit 9532817; this overlay is not a final combined source/Preview/production acceptance. Original personal/missing history remains untrusted and cannot be retroactively repaired by that upstream trigger.
- [Failure history](history/) is retained: public 721 CI policy/build/67 API requests passed, but main browser run had 84 passed, 1 skipped and 2 Factory/Skill backend failures (409 expected, 403 received). The local safety candidate corrects that ordering without weakening assertions. Cold local development timeouts and a 127.0.0.1 versus localhost middleware rewrite mismatch are not counted as passing runs. Using the existing CI localhost profile passed all three original cases; no product auth code or real auth configuration was changed.

**Local build/test green is not exact-candidate remote CI and is not production acceptance.** No workflow files are included on this evidence branch. Public #264 remains draft at the base, with the two main-CI failures; no fix was pushed there. Positive managed model lifecycle integration, verified worker/child enforcement and final parent-owned combined SHA/Preview/production acceptance remain incomplete. Budget lifecycle #265 exists but its policy adapter and further enterprise work are paused for boundary review. No live policy/allocation/provider usage is authorized or claimed.

## Public/private boundary and attribution

[Boundary inventory](BOUNDARY.md) separates common authentication/owner/fail-closed execution safety from organization management/configuration and allocation-governance candidates. Audit scope is evidence rather than blanket authority; quota/body/replay lifecycle safety crosses the boundary and must not double-charge or claim distributed app/workspace atomicity. The inventory and original local handoff describe the earlier public-publication hold; this separately authorized private evidence upload does not lift it.

[Source attribution](SOURCE-NOTICE.md) and the verbatim [source AGPL license](SOURCE-LICENSE-AGPL-3.0.txt) are preserved. No license, visibility, main branch, runtime overlay or historical public commit is changed by this handoff. Only project-specific patches, sanitized synthetic evidence and metadata are included.
