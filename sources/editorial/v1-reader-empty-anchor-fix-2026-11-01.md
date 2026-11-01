# v1 live reader accessibility: empty upstream anchor removal

Date: 1 November 2026. Baseline: v0.44.17, deployed commit 33d4cb7e0c1a85456f92c7c6697c376470ed3508.

## Reproduced issue
Using Cloudflare Browser Rendering on the actual production hostname with `?view=reader&ref=John%203%3A16&translation=ESV`, Chromium's accessibility tree reported one unnamed interactive link within the reader. The rendered HTML identified an empty `<a class="va" href="https://www.esv.org/"></a>` arising from returned ESV markup; other three authorised translations did not expose that particular unnamed link in the same probe.

The existing `safeHtml` sanitizer preserves provider HTML links whose destinations are allowlisted, including empty links. Such anchors are keyboard-focusable and lack an accessible name. A redundant empty publisher-homepage link does not provide an independent useful action, particularly where the reader already offers normal publisher attribution.

## Correction and regression
When sanitising a publisher `<a>` element, discard elements with neither meaningful text nor an explicit accessible name. Preserve existing visible-link contents, allowlisted URLs and their target/rel protections. Preserve bounded `aria-label` values for intentionally icon-only publisher links, avoiding the original sanitizer's loss of their accessible names. This affects both the Bible reader and locations using the same sanitizer, without changing Scripture text, provider integration, passage references or user notes.

The synthetic Playwright browser regression supplies an empty Crossway-style verse anchor, a normal textual publisher link and a legitimately `aria-label`-named empty link. It requires the unnamed anchor to disappear while the two purposeful links remain. Every browser suite still runs on the PR; no licensed Bible text is placed in fixtures or logs.

## Evidence limits
A live Chromium accessibility-tree and rendered-markup reproduction identifies one real browser-structure defect. It does not certify NVDA, JAWS, VoiceOver, production zoom, all upstream Bible content or every publisher contract. Do not mark the v1 accessibility or publisher-rights acceptance gates complete based on this fix alone.
