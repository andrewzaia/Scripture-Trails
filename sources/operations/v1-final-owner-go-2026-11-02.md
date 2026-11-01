# Scripture Trails v1.0.0 - owner launch authorisation

Date: 2 November 2026 (Australia/Sydney)
Decision: Explicit owner GO to publish v1.0.0, conditional on protected validation and production verification
Reviewer: Scripture Trails project owner, responsible for scholarly and editorial acceptance

## Owner launch GO

The project owner approved proceeding with the Scripture Trails v1.0.0 release in direct response to the final launch decision question. The approval covered the proposed first stable release, the two documented compatibility-testing limitations, and continuing publisher and security monitoring. The conversation approval and launch issue #78 are the decision provenance.

This GO authorises release preparation. It does not establish that v1.0.0 was deployed, that an independent professor approved content, or that unperformed physical-device tests passed.

## Accepted limitations and evidence

- Readiness: 15 scoped criteria met after recording this approval, 2 owner-accepted risks, 0 open. The two accepted-risk criteria stay named screen-readers and cross-browser-zoom.
- No verified full physical iOS/iPadOS/Android mobile VoiceOver/TalkBack interaction journeys.
- No verified native Safari 200%/400% browser page zoom, despite verified real desktop Chromium/Firefox zoom and native Safari viewport reflow.
- Real desktop NVDA/VoiceOver heading checks are bounded. VoiceOver notebook and About navigation required numerous reverse heading steps.
- Source rights are accepted for the owner's existing academic non-commercial use and subject to publisher-specific conditions. Private agreement files, account details and API credentials must never be published.
- Public Git history scanning and third-party source rights remain ongoing follow-ups, not a universal no-secrets or redistribution certificate.

## Verified pre-launch baseline

- Production v0.44.25, commit aa6f936fb91a09cf3dababc14b5bd047ae25eb49, Cloudflare deployment 59850217-3d76-4981-b527-d3fa7901e96d.
- Protected PR #95 passed 302 Node tests, 146 Chromium, 73 Firefox and 146 WebKit browser tests. Native real Chromium/Firefox 200%/400% zoom passed 24/24 views per browser.
- Twelve live publisher reader combinations were observed on the canonical domain across ESV, NASB20, NIV, NKJV and John 3:16, Psalm 23:1 and Romans 8:28. The reader normalises Psalm to Psalms.
- A targeted no-cost Git history scan checked 5,259 reachable objects and 2,285 text blobs for selected patterns, zero matches, with six oversized or binary objects excluded. See issue #75.
- Prior Cloudflare production rollback and recovery evidence is recorded in the launch evidence ledger.

## Required conditions to complete publication

1. Prepare v1.0.0 using the existing npm run release major command, preserving both changelogs, all previous release versions, footer and versioned assets.
2. Pass npm run build, all repository data and release validators, required full PR Chromium/Firefox/WebKit browser checks and the protected release-gate.
3. Confirm the merged GitHub commit matches the successfully deployed Cloudflare production commit and www.scripturetrails.com alias.
4. Verify the live 1.0.0 footer, public releases and roadmap data, app assets, and all four authorised Bible editions. Keep licence-restricted passage text out of logs.
5. Stop and remedy any failed release validation, deployment mismatch, licence defect or material new critical issue. Never bypass the required checks.

Owner approval and completed release are distinct events. This record documents the former.
