# Tenant quota PR migration: Mikka #265

This draft preserves the complete frozen implementation and review handoff from
[Mikka #265](https://github.com/alexj11324/Mikka/pull/265). It is an inactive
migration candidate, not an enterprise runtime installation or accepted feature.
The owner's 2026-10-29 request moves the PR review destination to this repository;
development, acceptance and integration remain paused.

## Exact source and coverage

- Source head: `50598846e592dbdb4b9419f96eb99b6cf5b9edbf`.
- Source branch: `codex/215-tenant-quota-20261025`, retained in Mikka.
- Reconstruction base: `40cbaff439dae444dd3f97729a7df450d7ec7b58`.
- PR's observed base branch head: `a1610e7cb411b0b676b8365df63c93986f205cbf`.
  Its merge base with the source head is the reconstruction base above.
- `series/*.patch` preserves all seven original commits, author attribution and
  complete code deltas, including tests, SQL and the locked SDK patch.
- `candidate.diff` is the complete binary-capable net diff, 47 changed files,
  1,847 additions and 50 deletions; no whole-repository snapshot is included.
- `source-map.json` records every file's base/head Git blob and mode, original
  commit metadata, artifact SHA-256 hashes and the reconstructed head tree.
- `original-pr.json` and `original-pr-description.md` preserve the complete
  original PR metadata and description. `original-discussion.json` preserves the
  observed conversation with its original permanent links.

Apply the ordered mail patches in a separate checkout of the exact source base
with `git am --keep-cr series/*.patch`, or apply `candidate.diff` to that base.
The patches target the original Mikka paths, not this repository's root. The
recorded tree equality checks establish byte preservation only; they do not run
or accept the implementation. Nothing here imports a patch into an active build.

## Boundary and pending work

The existing enterprise policy-management candidate remains
[enterprise #1](https://github.com/alexj11324/Mikka-enterprise/pull/1), unchanged.
Its historical boundary notes correctly identify #265 as mixed: quota atomic
reservation, settlement, lease recovery, membership and execution enforcement
remain public safety responsibilities; #265 implements no commercial billing
adapter. This preservation migration does not reclassify those responsibilities,
remove their source history, or install private replacements. The older statement
that the source PR must stay open is superseded only for PR disposition by the
owner's latest migration instruction, after target readback confirms coverage.

The full candidate is retained together so a later authorized integration can
review those boundaries without losing safety fixes. No scope split, adaptation,
redesign, feature implementation, build, functional test, CI rerun, merge or
production operation is performed by this migration. Original historical CI
results remain historical evidence; they do not certify this migration branch
or current main. No allocation or production policy is provisioned. Enabling the
fail-closed source before approved provisioning would deny execution.

The original PR description contains its detailed evidence and release gates,
including the two successful frozen-head CI runs and three base-reproduced
source-assertion failures. Real combined user/provider acceptance remains open.
Private `/workspace/evidence-215/` is only an original evidence locator; those
private files were not copied or claimed accessible here. Original public
discussion, checks and review links remain on the source PR after closure.

SSO/SCIM/VPC already have enterprise issues #2/#3/#4. Mixed Mikka #313 and #287
and unrelated PRs/issues are outside this migration; no issue is transferred or
closed. The original source branch and history are retained. Closing #265 records
relocation only, not a merge, acceptance or deletion of public code.
