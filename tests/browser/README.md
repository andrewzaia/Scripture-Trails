# Scripture Trails browser and assistive technology testing

The required PR browser matrix runs desktop/mobile Chromium, desktop Firefox and desktop/mobile WebKit. Tests use a localhost fixture server, mock Bible publisher APIs and reject external network calls. No licensed passages, tokens or real notebook data are used.

Run `npm ci`, install the Playwright engines, then run `npm run test:browser`. The source/build gate runs first, including release consistency, canonical reference checks, the v1 readiness guard and Node regression tests.

The existing Chromium and Firefox jobs additionally run `tests/zoom/actual-browser-zoom-regression.mjs` inside headed browsers, with native X11 Ctrl+plus keyboard input. The check requires measured DPR and effective CSS viewport changes at both true 200% and 400% zoom, no document overflow and functioning menu and consent controls across twelve main views. It fails if zoom was not actually achieved. WebKit's viewport and text tests are not represented as actual native Safari zoom.

Playwright also checks axe WCAG 2.2 AA, keyboard focus, route headings, control names, mobile touch-profile navigation, reduced motion, landscape and 320px/640px layout. Traces are retained for three days on CI.

The separate `.github/workflows/v1-native-at.yml` audit uses real Windows NVDA and macOS VoiceOver on standard GitHub-hosted machines with local synthetic Bible fixtures. Its outcomes must be assessed separately; a failed speech assertion remains a failure. This is not mobile iOS VoiceOver or Android TalkBack.

Physical mobile AT use and genuine native Safari 200%/400% page zoom remain unverified; no simulator or desktop runner can certify universal device compatibility. Do not bypass any source, browser, release or deployment checks.
