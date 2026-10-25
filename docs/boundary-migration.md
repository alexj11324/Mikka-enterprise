# Public core / private business extension split

Baseline read 2026-10-25: Mikka public main a1610e7cb411b0b676b8365df63c93986f205cbf; all six issues below remain open. Target private repository creation denied by GitHub integration. No issue or PR transferred, closed, deleted, hidden, or made private. No source branch rewritten.

## Non-negotiable public core
Tenant/owner authorization, credential custody safety, same-transaction audit integrity, quota atomic reservation/settlement/renewal state machine, idempotency, unknown-result reconciliation, lease/Factory/Skill/retry execution fences stay real, public and enforced. Business discovery metadata cannot override these decisions. Public operation is not allowed to replace them with no-op implementations.

For #265 specifically, `lib/quota/store.ts`, `errors.ts`, `runtime.ts`, quota schema, `config.ts` hard-cap validation and existing API authorization belong to the safety core. The mixed branch cannot be copied wholesale into private storage and removed from public history. New commercial allocation provisioning, plans/billing adapters and organization administration surfaces are private candidates. Exact quota integration changes in the isolated worktree remain uncommitted and require their own review and full integration tests.

## Exact old -> proposed new planning map
Destination names are proposed issue slugs, **not created issue IDs or links**. Every destination is in the same-owner target alexj11324/Mikka-enterprise after API verification of PRIVATE visibility and appropriate permissions.

| Public source | Private destination scope/slug | Public scope retained | Execution state |
|---|---|---|---|
| https://github.com/alexj11324/Mikka/issues/216 | organization-identity-federation: org IdP configuration and OIDC/SAML commercial adapter/administration | Login/account-link verification, anti-replay and authorization enforcement | Transfer preparation only; target absent |
| https://github.com/alexj11324/Mikka/issues/217 | organization-scim-provisioning: SCIM directory connector and org provisioning administration | Member lifecycle, token/session/run revocation and durable audit | Transfer preparation only; target absent |
| https://github.com/alexj11324/Mikka/issues/233 | customer-vpc-delivery: customer topology/protocol provisioning and support packaging | Endpoint validation, no silent public fallback, network isolation enforcement | Transfer preparation only; target absent |
| https://github.com/alexj11324/Mikka/issues/230 | managed-policy-administration: org/team hierarchy administration and publication workflow | Effective policy contract, signed version/hash propagation, expiry/revocation/fail-closed enforcement; active #264 owner remains responsible | Split spec first; do not transfer entire mixed issue |
| https://github.com/alexj11324/Mikka/issues/231 | organization-model-administration: org provider catalog and approved routing configuration | Provider/model/endpoint validation, budget check, fallback/child anti-bypass; no private runtime bypass | Split spec first; no code migration performed |
| https://github.com/alexj11324/Mikka/issues/232 | team-registry-administration: organization catalog review/distribution workflows | Digest pinning, safe unpacking, immutable source receipt, permission/revocation gates | Split spec first; no code migration performed |

## PR disposition
- #265 (50598846e592dbdb4b9419f96eb99b6cf5b9edbf) and #268 (a3294781eae74d824087c9c80bfc3f6093f196d7) remain public and unchanged. Local mixed work preserved at /workspace/scratch/quota-ledger-byos268; do not push it as enterprise migration.
- #272 is not an integration input; audit/mailbox security work retains its owner/review.
- #264 and #176 remain other owners' active work. No parallel edits or transfers.
- No public PR can be made individually private by this plan. Closing does not hide it; issue transfer is not a promise to erase historic public exposure. Old public commits/forks/caches are not retroactively private.

## Resume gates
1. Existing GitHub integration/user must be able to create or provide the exact private destination. Do not create access credentials or switch to stronger credentials to bypass the denial.
2. Read back owner/name/private/visibility; ensure repository purpose and contents before any upload.
3. Push minimal private baseline and draft PR; run contract/composition CI with public submodule only, no secrets. Record remote exact SHAs.
4. Review public interface patch independently; keep stable pinned build contract.
5. For mixed implementation, classify actual files and tests, retain safety core, migrate only new business adapters. Update old-to-new actual issue/PR IDs only after successful readback. Do not close/delete old items without a separate decision.

Architecture reference: https://github.com/lobehub/lobehub/blob/canary/.agents/skills/split-micro-app/SKILL.md (Cloud-owned builds with public default implementations). This is a structural reference, not a licensing determination or a claim about all LobeHub enterprise offerings.
