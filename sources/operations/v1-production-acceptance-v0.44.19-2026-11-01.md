# Scripture Trails - scoped v0.44.19 real-production acceptance

Acceptance evidence recorded: 1 November 2026 (Australia/Sydney)
Public origin: https://www.scripturetrails.com/
Published version: 0.44.19, from 0.44.18 PATCH
Exact merged commit: `9301e903325e0bfbead45e6443064b0c60183322`
Cloudflare production deployment: `55626de6-2faf-489b-b737-98efa26a40ec`, deployed successfully for that SHA

## Real live acceptance checks

GitHub Actions single-runner audit: https://github.com/andrewzaia/Scripture-Trails/actions/runs/41278653454

- Public footer, versioned app and latest public changelog report v0.44.19. Prior public changelog history retained (100 versions at the time).
- 12/12 live publisher passage responses across ESV, NASB20, NIV and NKJV validated status, edition, source notices and no-store semantics without logging licensed Scripture text.
- The real Chromium browser switched between all four editions, checked passage attribution and observed **three genuine FUMS HTTP 200 responses**, zero non-200 FUMS responses.
- Atlas preview, second-click refocus and reader deep links worked against the real production service.
- A temporary synthetic notebook note survived a reload in a fresh isolated browser context and was visible in the notebook.
- Mobile-emulated navigation and reduced motion passed, with **zero uncaught page errors**.
- Exact commit main-branch run https://github.com/andrewzaia/Scripture-Trails/actions/runs/41278592810 passed source/build and required release gate, while preserving the already passed PR Chromium, Firefox and WebKit matrix.

## Limited acceptance and follow-up

This meets the *scoped* `live-smoke` technical acceptance for the published 0.44.19 baseline, with explicit reproducible evidence and reviewer attribution. **Rerun on the eventual v1.0 release candidate** rather than assuming it will behave identically.

Browser HTTP 200 does not independently prove publisher dashboard aggregation; the publisher-rights gate stays open. Browser emulation is not physical mobile/Safari, actual NVDA/JAWS/VoiceOver, true 400% zoom or controlled production rollback, and it does not certify those gates.

**Recorded result:** `live-smoke` met as scoped technical acceptance on 2026-11-01; distinct launch-signoff still open.
