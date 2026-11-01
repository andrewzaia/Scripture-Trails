# v1 native Safari desktop reflow and zoom evidence - 2 November 2026

## Purpose

Distinguish tests that genuinely exercised Apple Safari from Playwright WebKit simulations or failed native page-zoom automation. The v1 `cross-browser-zoom` criterion is **not complete** merely because these browser-level checks passed.

## Verified real Safari results

[Successful macOS SafariDriver audit](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41312947694) used the operating system's actual Safari application and built-in `safaridriver`. For each of Scripture Trails' twelve primary views it loaded the canonical v0.44.22 site and measured layout using JavaScript in Safari's isolated automation window.

| Safari viewport | Measured document width | Tested views | Document horizontal overflow | Result |
| --- | --- | --- | --- | --- |
| Desktop browser window requested at 1280 px | 1265 CSS px | 12 | 0 | PASS |
| Narrow browser window requested at 400 px | 385 CSS px | 12 | 0 | PASS |

Every check confirmed the intended view was present and visible and the footer reported v0.44.22. **24/24 native Safari checks passed.** This verified actual Safari rendering at two browser window sizes; it did **not** verify 200%/400% Safari page zoom, touch, an iPhone or an iPad.

## Native Safari zoom blocked by the automation method, not by the site

- [Initial OS-level zoom attempt](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41311551735) reached SafariDriver and collected the 100% baseline, but a native keyboard zoom command caused the subsequent SafariDriver metric call to time out.
- [Bounded Selenium shortcut attempt](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41312703034) sent Cmd+equals, Cmd+add and Cmd+plus through SafariDriver; all completed without changing the measured Safari DPR or CSS viewport. No zoom threshold was reached, so this **failed to verify zoom**.
- Apple documents SafariDriver's isolated automation window and protective glass pane, which intentionally blocks out-of-band keyboard/mouse input during WebDriver sessions: https://developer.apple.com/documentation/safari-developer-tools/webdriver . Therefore native-keyboard interactions combined with SafariDriver are not a valid route to accepting page-zoom behaviour.

A separate **actual page-zoom** audit succeeded in headed Linux desktop browsers by using OS-level keys against normal windows with real window managers (not protected SafariDriver windows):

| Browser | 200% and 400% measured | Views | Browser-wide overflow | Responsive menu |
| --- | --- | --- | --- | --- |
| Chromium | DPR 2 and 4, CSS viewport reaching 314 px | 12 at each zoom | None in 24 checks | 4/4 passed |
| Firefox | DPR 2 and 4, CSS viewport reaching 320 px | 12 at each zoom | None in 24 checks | 4/4 passed |

Original evidence: [Chromium run 41306798370](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41306798370) and [Firefox run 41307235001](https://github.com/andrewzaia/Scripture-Trails/actions/runs/41307235001).

## Outstanding work and interpretation

The cumulative evidence reduces **browser compatibility uncertainty**, but a physical iPhone/other mobile device, real mobile screen reader and actual Safari 200%/400% page zoom have not been tested. The project owner's own device acceptance may satisfy the manual requirement; no external scholarly review is required. Record exact device/OS/browser, tested actions, viewport and any blockers before qualifying a pass.

This is a read-only audit. No production code was changed to make it pass and no confidential publisher agreement or private note data was published.
