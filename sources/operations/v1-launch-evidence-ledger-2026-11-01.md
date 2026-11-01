# v1.0 launch evidence ledger and release-candidate checklist

Updated: 1 November 2026
Current evidence baseline: v0.44.20, production verified
Completed operational rehearsal: successful v0.44.19 rollback and v0.44.20 restoration on the canonical domain

## Non-negotiable decision

Thirteen of 17 version 1.0 acceptance criteria have scoped evidence; four remain **open**. This ledger is a release-blocking checklist, not a declaration of v1 readiness or independent expert certification. The existing `npm run check:v1` and required `release-gate` must remain enforced. **Do not set package.json to 1.0.0, merge, tag or publish v1 while any required criterion remains open.**

The project owner is the final scholarly and editorial reviewer for Scripture Trails. The owner explicitly accepted published content on 1 November 2026 and does not require an external professor. Technical, publisher and physical-device evidence must still be verified within each remaining gate. No missing test or private rights entitlement may be replaced by an unsupported model assertion.

## Owner scholarship and scoped production acceptance (1 November 2026)

**13 of 17 acceptance criteria met; 4 remain open.** The project owner personally declared their full scholarly and editorial review and acceptance of published Scripture Trails content on 1 November 2026. This is owner-led scholarly acceptance, **not** an independent academic certificate. No external professor is a mandatory release reviewer.

Two criteria are closed on this owner attestation: `critical-claims` and `content-audit`. See `sources/editorial/v1-owner-scholarly-acceptance-2026-11-01.md`. A third, `live-smoke`, is accepted on the basis of verified v0.44.19 live production checks, with scope limits and final-candidate rerun in `sources/operations/v1-production-acceptance-v0.44.19-2026-11-01.md`.

Publisher permissions and usage accounting, real assistive technologies and physical zoom, and final release go/no-go **remain distinct and cannot be satisfied by scholarly content acceptance alone**. Production rollback and recovery were exercised separately on the live canonical domain.

## Four open acceptance criteria and evidence needed

| ID | Current evidence | Minimum closeout record |
| --- | --- | --- |
| `source-licences` | `sources/legal/publisher-rights-review-2026-10-31.md`; GitHub Issues #75 and #79 | Confirm edition-specific API.Bible/ABS and Crossway entitlements and relevant confidential non-commercial terms, current FUMS account receipt, usage/quote limitations and appropriate attribution; publish only safe status outcomes |
| `screen-readers` | `sources/editorial/accessibility-audit-v0.29.1.md`; Issue #65 | Real NVDA or JAWS, VoiceOver on an Apple device and mobile screen-reader journey, with recorded versions, announcements and any blocking remediation |
| `cross-browser-zoom` | Cross-browser automated tests and Issue #65 | Physical-device Safari/Firefox, reduced-motion and actual 200%/400% browser zoom findings; fix critical keyboard and readability failures |
| `launch-signoff` | This ledger and live smoke evidence | Timestamped project owner go/no-go decision for the final candidate SHA, after all blocking gates are met, including residual risks |

## Production smoke instructions

Use `SCRIPTURE_TRAILS_EXPECTED_VERSION=<exact-release> npm run check:live-v1` after Cloudflare has reported a successful production deployment of that version. The check is read-only and requests only public page markup, release and roadmap metadata, and the versioned app module. It logs no licence-restricted Bible passage text and deliberately rejects a stale footer, changelog or asset version.

Use `npm run check:live-reader` separately to test ESV, NASB20, NIV and NKJV against three approved sample addresses. It validates HTTP status, edition identity, no-store response and publisher notices without logging returned Bible text. The server-side Cloudflare deployment record must also be compared with the exact GitHub merge SHA. A successful API/HTML check does **not** replace live browser interaction checks, licence-plan evidence, physical-device testing or an owner scholarly acceptance, which is documented separately.

## Cloudflare rollback procedure - exercised on production

1. Identify the *currently serving* production deployment and its exact Git commit, version and status from the Cloudflare Pages deployment API. Save the immediately preceding known-good deployment ID and commit.
2. If a serious regression justifies rollback, pause additional website merges and confirm which commit will be restored. Do not choose a branch preview or unvalidated deployment.
3. Use Cloudflare Pages > scripture-trails > Deployments > the known-good production deployment > Roll back to this deployment. If the available Cloudflare API supports the rollback action, require success from its returned deployment record; never assume that choosing an older deployment on a list restores traffic.
4. Verify that the custom domain actually serves the known-good website version and the appropriate reader/Atlas/notebook user journeys. Confirm the Cloudflare deployment environment and success status against the restored commit.
5. Treat an emergency rollback as temporary restoration, **not** a new release. Investigate the regression and create a new properly incremented public version and both changelog entries to return to a forward release. Preserve release history and rerun full CI before deployment.

The controlled production rehearsal described below meets the `rollback` acceptance criterion. These steps remain the documented emergency procedure, not permission to bypass versioned releases. During emergency restoration, an earlier published footer can appear temporarily. Future corrective releases must follow Semantic Versioning and the two changelog requirements.

## Verified production recovery exercise (1 November 2026)

The project owner authorised a controlled production rollback rehearsal in the active development conversation. A live Cloudflare Pages rollback was executed against `https://www.scripturetrails.com`, not a staging or preview alias.

| Stage | Version | Git commit | Cloudflare Pages deployment | Observed evidence |
| --- | --- | --- | --- | --- |
| Baseline | v0.44.20 | `9b0bd28e99c1e32aa3278cfc5fd102402a544bd8` | `ba8a6f38-60d0-4f18-9f2b-f1d5ddcee3f8` | Production alias and live homepage, Atlas and ESV reader checked |
| Rollback | v0.44.19 | `9301e903325e0bfbead45e6443064b0c60183322` | `55626de6-2faf-489b-b737-98efa26a40ec` | API accepted rollback; production alias moved; live footer and asset versions showed v0.44.19; ESV reader loaded |
| Recovery | v0.44.20 | `9b0bd28e99c1e32aa3278cfc5fd102402a544bd8` | `ba8a6f38-60d0-4f18-9f2b-f1d5ddcee3f8` | API accepted restoration; custom domain returned to expected SHA; fresh homepage, Atlas and ESV browser checks showed v0.44.20 |

After recovery, additional live browser-rendered NASB20, NIV and NKJV John 3:16 checks all showed their respective edition status, copyright and publisher link. The recovery test did not validate every browser engine, physical device, account-specific publisher entitlement, notebook persistence in a real user browser or accessibility technology.

Recorded execution: [GitHub issue #78 recovery evidence](https://github.com/andrewzaia/Scripture-Trails/issues/78#issuecomment-6554645004), [four-edition follow-up](https://github.com/andrewzaia/Scripture-Trails/issues/78#issuecomment-6554648236).

The restoration reused previously released, immutable production artefacts; no unversioned public website change occurred during the rehearsal. Subsequent visitor-facing modifications must use the normal release process.

### Remaining publication-critical rights and accessibility checks

The project's owner has declared the academic/non-commercial purpose, personally accepted the biblical and historical content, and separately supplied six confidential ABS/API.Bible agreements for reference, including the NIV-specific addition. These agreements are not to be published. The technical review has verified public copyright links, live all-edition status and FUMS requests in covered browser tests, but it has **not** established the current API.Bible account plan, actual end-user tally, entitlement dashboard or publisher-side reconciliation. Avoid treating successful reader responses as legal permission evidence. The FUMS cached-passage redisplay defect and its targeted regression test are addressed in the accompanying v0.44.21 patch.

Real NVDA/JAWS, VoiceOver and physical-device/true-zoom tests remain distinct, as does final owner launch approval. No external professor signoff is required.

## First-pass audit limitations

The documented 13/17 readiness score reflects scoped automated, owner-led editorial and live operational verification. Real screen-reader and physical-device testing, private publisher plan/territory verification, controlled production rollback and final launch acceptance remain outstanding. A Chromium accessibility-tree and automated axe checks are not a screen-reader certification. The owner has accepted the scholarly content without external professor approval. No self-certified academic consensus or undisclosed licence permission is implied. This document contains no confidential publisher agreements or credentials.
