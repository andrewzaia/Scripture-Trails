# v1.0 launch evidence ledger and release-candidate checklist

Updated: 1 November 2026
Repository baseline: v0.44.9
Prepared change: v0.44.10 - Emmaus source qualification and release acceptance tooling

## Non-negotiable decision

Nine of the 17 version 1.0 acceptance criteria have scoped evidence; eight remain **open**. This ledger is a release-blocking checklist, not a declaration of v1 readiness or independent expert certification. The existing `npm run check:v1` and required `release-gate` must remain enforced. **Do not set package.json to 1.0.0, merge, tag or publish v1 while any required criterion remains open.**

The project owner does not have to supply manual verification. Complete tasks via connected tools, repeatable test infrastructure, properly qualified external specialist records, or a commissioned independent assessment when those tools become available. If reliable evidence cannot be obtained, retain the gate as open; do not replace missing verification with a model assertion.

## Open acceptance criteria and evidence needed

| ID | Current evidence | Minimum closeout record |
| --- | --- | --- |
| `critical-claims` | `public/data/jesus-audit.json`; GitHub Issue #67 | Dated passage-by-passage and source-by-source critical review, corrections to important errors, and independent historical/textual expertise when conclusions depend on disputed archaeology or manuscript evidence |
| `source-licences` | `sources/legal/publisher-rights-review-2026-10-31.md`; GitHub Issue #75 | Verify edition-specific private API.Bible/ABS and Crossway plans, actual non-commercial eligibility, FUMS reporting, audience and quote limits; record only non-sensitive compliance outcomes publicly. Never commit confidential agreement PDFs, secrets or publisher correspondence |
| `content-audit` | `sources/editorial/v1-flagship-content-audit-inventory-2026-10-31.md`; GitHub Issue #67 | Complete substantive and canonical contextual checks for 219 journal-reading occurrences, 88 person stages, 79 Gospel stages, 83 Pauline stages and flagship cities. Log assessed claims, factual corrections, open uncertainties and dead ends; automation alone is insufficient |
| `screen-readers` | `sources/editorial/accessibility-audit-v0.29.1.md`; GitHub Issue #65 | Actual NVDA/JAWS and VoiceOver (including mobile) walkthroughs recording keyboard announcements, semantic reading order, modal controls, focus, corrections and platform versions. Automated axe scans are not a screen-reader certification |
| `cross-browser-zoom` | `tests/browser/accessibility-audit.spec.mjs`; GitHub Issue #65 | Real physical-device Safari/Firefox, true browser 200%/400% zoom and reduced motion acceptance with recorded devices, resolutions, failures and fixes. 320px simulated reflow or Playwright mobile emulation does not prove physical-device behaviour |
| `rollback` | This ledger; current Cloudflare Pages deployment history | Document and **exercise** a controlled Cloudflare production rollback to a known-good commit, verify domain/version and critical reader behaviour, then restore via an appropriately versioned, audited release. A written plan is not a completed production rollback |
| `live-smoke` | `scripts/check-live-v1.mjs` plus `scripts/check-live-reader.mjs` | After a v1 release candidate is deployed, record HTTP/HTML footer version, public changelog/roadmap, module asset versions, exact Cloudflare production commit, ESV/NASB20/NIV/NKJV responses and real-browser Atlas, notebook, navigation and responsive flows without saving copyrighted Bible text |
| `launch-signoff` | This ledger and `public/data/roadmap.json` | Timestamped written go/no-go decision naming release candidate commit, reviewer, every gate's evidence, severity of unresolved findings, accepted residual risks and Cloudflare/production acceptance. No self-declared signoff from unexecuted tasks |

## Production smoke instructions

Use `SCRIPTURE_TRAILS_EXPECTED_VERSION=<exact-release> npm run check:live-v1` after Cloudflare has reported a successful production deployment of that version. The check is read-only and requests only public page markup, release and roadmap metadata, and the versioned app module. It logs no licence-restricted Bible passage text and deliberately rejects a stale footer, changelog or asset version.

Use `npm run check:live-reader` separately to test ESV, NASB20, NIV and NKJV against three approved sample addresses. It validates HTTP status, edition identity, no-store response and publisher notices without logging returned Bible text. The server-side Cloudflare deployment record must also be compared with the exact GitHub merge SHA. A successful API/HTML check does **not** replace live browser interaction checks, licence-plan evidence, physical-device testing or an independent scholarly review.

## Cloudflare rollback procedure - written, not yet exercised

1. Identify the *currently serving* production deployment and its exact Git commit, version and status from the Cloudflare Pages deployment API. Save the immediately preceding known-good deployment ID and commit.
2. If a serious regression justifies rollback, pause additional website merges and confirm which commit will be restored. Do not choose a branch preview or unvalidated deployment.
3. Use Cloudflare Pages > scripture-trails > Deployments > the known-good production deployment > Roll back to this deployment. If the available Cloudflare API supports the rollback action, require success from its returned deployment record; never assume that choosing an older deployment on a list restores traffic.
4. Verify that the custom domain actually serves the known-good website version and the appropriate reader/Atlas/notebook user journeys. Confirm the Cloudflare deployment environment and success status against the restored commit.
5. Treat an emergency rollback as temporary restoration, **not** a new release. Investigate the regression and create a new properly incremented public version and both changelog entries to return to a forward release. Preserve release history and rerun full CI before deployment.

There has been **no completed production rollback rehearsal** under this checklist. Do not call `rollback` met until an executed recovery with observed production behaviour has been recorded. A rollback to an old public version may temporarily expose an older footer, which must be explicitly reported as emergency restoration, not silently republished as a new version.

## First-pass audit limitations

The documented 9/17 readiness score reflects scoped automated and AI-assisted editorial work. Independent screen reader and physical-device testing, private publisher plan/territory verification, specialist review and launch acceptance remain outstanding. No self-certified academic consensus or undisclosed licence permission is implied. This document contains no confidential publisher agreements or credentials.
