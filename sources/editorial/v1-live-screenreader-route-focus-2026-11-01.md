# Real screen-reader navigation investigation and route-heading focus - 1 November 2026

## Scope and distinction

Scripture Trails was tested against the published v0.44.21 website using **actual Windows NVDA with a headed Chromium browser** and **actual macOS VoiceOver with a headed WebKit browser** on GitHub-hosted desktop operating systems. The experiments ran on the isolated `audit/real-screenreaders-v1-20261101` branch using the Guidepup library. The site, API credentials, user notes, private publisher agreements and regular CI workflows were not edited by these diagnostic runs. The browser focus prototype changed only its temporary in-memory DOM.

These tests are narrower than a complete accessibility acceptance. They are not physical-device testing, not iPhone VoiceOver, not Android TalkBack, and not a WCAG conformance audit. The `screen-readers` and `cross-browser-zoom` v1 gates remain open until all specified journeys and device/zoom conditions have direct evidence.

## Real assistive-technology evidence

| Run | Screen reader | Verified observation |
| --- | --- | --- |
| [41295434495](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41295434495) | Windows NVDA and macOS VoiceOver | Both actual desktop readers spoke the live About page's primary heading. |
| [41295638296](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41295638296) | VoiceOver | Four live About, reader, Atlas and notebook headings announced successfully after in-app view changes. |
| [41295638296](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41295638296) / [41295876068](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41295876068) | NVDA | A testing mistake repeatedly invoked `navigateToWebContent()` following an SPA view change and produced empty spoken phrases; direct URL loading remained usable. Do **not** treat these alone as a confirmed website defect. |
| [41297821055](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41297821055) | NVDA | Refreshing the virtual buffer after the bad test reset did not restore the heading; an H1 focus probe in that broken sequence also did not help. |
| [41298081655](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41298081655) | NVDA | Correcting the automation sequence and not resetting the screen-reader cursor after the SPA change immediately recovered the Atlas H1 announcement (first heading navigation, no silence). A test-only polite route notice was not spontaneously captured. |
| [41298446261](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41298446261) | NVDA | Reader, Atlas and notebook headings announced on the first normal navigation. After more navigation, About and return-to-reader required the genuine `Control+Home` browse-position key, after which each H1 was announced on the first attempt. |
| [41298640292](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41298640292) | NVDA | In a **temporary browser-only** focus prototype, each destination H1 (Atlas, notebook, About, reader) received real DOM focus and NVDA's `reportCurrentFocus` announced that heading on every route. No automatic spoken phrase was captured before the explicit current-focus command. |

## Scoped website correction for v0.44.22

Previously `showView` focused the same shared `main` landmark after all section changes. A screen-reader reading cursor could remain positioned beyond the first heading during repeated view swaps, even though the document title and visible content changed. The compatible accessibility refinement now directs focus to the **newly displayed section H1** (with programmatic `tabindex=-1`) when `moveFocus` is requested. The main landmark remains the fallback if no H1 exists. This follows recognised SPA focus-management guidance while preserving:

- No forced focus on initial direct page load.
- The existing Skip to content link focusing the main landmark.
- Same-view reader reference selection's separate focus behaviour.
- Keyboard-accessible navigation buttons, aria-current, history and responsive drawer focus containment.
- No licensed Bible passage refetch or notebook storage mutation caused by focus alone.

Relevant guidance: [Chrome/Lighthouse managed focus](https://developer.chrome.com/docs/lighthouse/accessibility/managed-focus/), [VA.gov focus management](https://design.va.gov/accessibility/focus-management), and [W3C WCAG reflow understanding](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## Verification limits for the release

The successful NVDA prototype proves that the recommended H1 focus is programmatically exposed and announced on request; it does **not** demonstrate unsolicited NVDA announcement on every route. The published implementation must pass required source tests and Chromium/Firefox/WebKit keyboard/accessibility suites, the exact production deployment and live-site checks. Real NVDA and VoiceOver on the **final published revision** would improve confidence further. Physical mobile assistive-technology and genuine operating-system/browser zoom remain independently unverified.

The previous recorded NVDA Atlas 'defect' [#91](https://github.com/andrewzaia/Scripture-Trails/issues/91) was partly a test-harness artefact. Keep that distinction visible in issue closeout rather than claiming a previously demonstrated app outage was fixed.
