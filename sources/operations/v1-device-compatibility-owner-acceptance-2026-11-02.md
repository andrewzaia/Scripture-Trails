# Owner-accepted device compatibility scope for v1.0

Date: 2 November 2026
Decision-maker: Scripture Trails project owner
Decision type: Explicit owner acceptance of residual accessibility and device-testing risk
Status: Applicable to v1.0 launch decision; not a physical-device verification certificate

## Acceptance decision

The project owner confirmed on 2 November 2026 that the compatibility checks already performed are sufficient for the intended v1.0 release scope. This is a product risk-acceptance decision: the two previously mandatory physical-device/assistive-technology criteria are accepted **with limitations**, not falsely marked as empirically verified. No statement that every device works perfectly has been demonstrated by testing.

The owner's acceptance does not constitute final approval to publish the v1.0 release candidate. The separately required `launch-signoff` criterion stays open until the release candidate, current checks, deployment evidence and accepted risks are reviewed.

## Evidence already obtained

- Five required Playwright projects exercise Chromium desktop/mobile profiles, Firefox desktop, and WebKit desktop/mobile profiles, including keyboard, semantic accessibility, layout and navigation cases. These are automated browser checks; mobile profiles are not physical devices. See `.github/workflows/ci.yml`.
- Actual native desktop Chromium and Firefox 200% and 400% browser zoom was measured on the production website across twelve main views per engine, 48 of 48 checks with no page-level horizontal overflow. Responsive navigation and consent controls were also exercised. [Chromium evidence](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41306798370); [Firefox evidence](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41307235001).
- Native macOS Safari desktop displayed all twelve principal views at measured 1265 and 385 CSS-pixel widths, passing 24 of 24 reflow checks. This is actual Safari rendering, not native Safari page zoom. [Safari evidence](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41312947694).
- Scoped real desktop screen-reader checks using Windows NVDA and macOS VoiceOver have been recorded for route/heading focus. They do not establish complete interactive-reader or mobile assistive-technology journeys. See `sources/editorial/v1-live-screenreader-route-focus-2026-11-01.md`.

## Explicit unresolved limitations

1. **Physical mobile devices and mobile screen readers:** No verified real iPhone, iPad or Android device VoiceOver/TalkBack end-to-end study journeys. The existing automation and desktop screen-reader findings cannot prove equivalent physical mobile behaviour.
2. **Native Safari zoom:** Genuine Safari 200%/400% browser page-zoom acceptance was not established because SafariDriver protected automation did not change zoom state. Normal viewport reflow passed, but that is not the same test.
3. **Broader compatibility:** No testing can justify an assertion of perfect operation on every device, browser configuration, operating system version or assistive-technology combination.

## Risk controls and continued work

- Required PR CI, automated axe rules, Chromium/Firefox/WebKit matrix, release validation and exact-commit Cloudflare deployment checks remain mandatory. No check is disabled or bypassed for v1.0.
- Maintain GitHub [issue #65](https://github.com/andrewzaia/Scripture-Trails/issues/65) for optional subsequent physical-device and full screen-reader acceptance evidence, and remediate any reproducible defects through an appropriately versioned release.
- No independent academic approval is needed; the project owner remains the scholarly reviewer and authorises this explicitly qualified technical risk acceptance.
- A final `launch-signoff` decision must still identify the candidate version, GitHub SHA, CI checks, deployment status and residual risk. This acceptance document alone does not authorise a 1.0.0 release.

## Interpretation

Readiness states are distinct:

- `met`: scoped empirical or scholarly evidence meets the recorded criterion.
- `accepted-risk`: evidence is partial, the owner consciously accepts the remaining device or accessibility uncertainty for v1.0, and the unresolved limits remain visible.
- `open`: no applicable acceptance or documented risk decision has completed the criterion.

Only the named `screen-readers` and `cross-browser-zoom` criteria may use `accepted-risk`. Other criteria, including final `launch-signoff`, must still be `met` before 1.0.0 can be released.
