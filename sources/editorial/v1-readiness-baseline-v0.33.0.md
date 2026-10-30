# Version 1.0 readiness baseline - 30 October 2026

## Decision

Not ready for a 1.0.0 release. Four of seventeen explicitly defined launch acceptance criteria have a scoped automated basis. Thirteen remain open. This is not a measure of how much of the Bible has been covered or a general quality percentage. The underlying product is functional, but publication-level review, manual accessibility and production assurance remain incomplete.

## Launch gates and acceptance evidence

1. Biblical evidence and editorial quality: current explanations are structurally checked, but 46 of 161 Atlas explanatory pairs have no separate dated citation assessment. A critical-claim review and content-rights audit are open. The existing 115 dated reviews are preserved and are not independent specialist certification.
2. Core study experience and content: local reference data checks are implemented. Flagship content audit and real production checks for ESV, NASB20, NIV and NKJV remain open.
3. Accessibility and compatibility: Chromium browser, keyboard and automated accessibility checks run in required CI. No completed NVDA, VoiceOver, TalkBack, Firefox, Safari, physical-device or 200%/400% zoom audit is asserted.
4. Security, privacy and licensed content: a threat-model review, notebook recovery drill and provider-failure audit are open. Existing tests are useful inputs, not substitutes for these reviews.
5. Release operations: semantic version/changelog and CI safeguards are implemented. Production rollback exercise, live release-candidate smoke test and documented launch approval are open.

## Prioritised sequence

- Baseline: publish criteria and a release guard. This framework is not equivalent to satisfying the gates.
- Evidence: close the 46 Atlas review gaps, revisit major interpretive claims and remediate core content gaps. Prioritise correction of demonstrable inaccuracies over increasing annotation counts.
- Accessibility: record real-device, screen-reader and cross-engine testing with reproduction evidence for each critical defect.
- Hardening: document third-party data flows and threats, run backup/failure cases and verify rights notices.
- Release candidate: freeze scope; verify the intended commit and deployed version; exercise rollback and record a go/no-go decision.

## Non-blocking work

The full OpenBible cross-reference corpus does not require individual commentary before v1.0. New original-language datasets, encrypted cloud accounts, more geographic collections, minor visual refinements and optional studies can be carried into later 1.x or 2.x milestones. A critical uncorrected factual or security defect is not acceptable merely because an associated feature is optional.

## What the automated guard can and cannot prove

The new `check:v1` command validates the five-gate schema, a fixed set of seventeen acceptance criteria, evidence paths, counts of unreviewed Atlas comparisons and recorded signoffs. It rejects releases at or above 1.0.0 while any criteria are open. The normal `npm run build` still runs release, local-reference and About-statistics consistency checks and the test suite.

Automated validation cannot establish that manual screen-reader testing, publisher permissions, a security audit or specialist research actually occurred. Those criteria require human evidence, reviewer identity, review date and independent scrutiny; the guard is a process control rather than a certification.
