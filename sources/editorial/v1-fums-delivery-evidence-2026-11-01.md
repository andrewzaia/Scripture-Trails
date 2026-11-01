# API.Bible FUMS production delivery correction - 1 November 2026

Baseline: public v0.44.18. Related audits: GitHub Issue #75, Actions runs 41274044348, 41274134745, 41274274248 and pixel-isolation runs 41277028315, 41277085333 and 41277142446.

## Observation and evidence
The real production browser displayed NIV and made a valid FUMS reporting call. However, cross-origin browser `fetch` with `mode: no-cors` failed to produce an observable outbound request despite valid URL, publisher token and correct `connect-src` CSP. A Node.js GET from the same runner reached the FUMS endpoint with HTTP 200.

An isolated Chromium test amended only the locally intercepted production document's `img-src` policy. A manual publisher FUMS image request then reached `https://fums.api.bible/f3` and received HTTP **200**, confirmed by the browser's response event. Its image element emitted `error` when decoding the non-image response. The error event is therefore not evidence the GET was undelivered. Earlier experiment runs failed because of test harness mistakes: requestfailure was an object instead of a string, then the CSP amendment omitted deep-link query URLs. None modified production.

The API.Bible publisher explicitly documents `GET /f3?t=...&dId=...&sId=...` and the manual image-pixel mechanism; their newest instructions recommend a third-party JavaScript tracker for browsers. We prefer the documented manual GET pixel triggered by each rendered passage to avoid injecting code that could read the local-only personal study notebook.

Reference: https://care.api.bible/article/417-understanding-fums and https://docs.api.bible/guides/fair-use/ .

## Scope of the patch
- Replace failing cross-origin `fetch` reporting in `public/assets/fums.js` with a JavaScript-created 1x1 image pointed only at the pinned publisher FUMS URL.
- Add only `https://fums.api.bible` to the existing `img-src` CSP, keeping the restrictive `script-src`, existing `connect-src` and HTTPS-only outbound host unchanged.
- Use `referrerPolicy='no-referrer'`; token and anonymous 36-character device/session UUIDs are the only URL parameters. No notebook content, passage body, search query or visitor name is sent. Browser image requests may include third-party cookies if the browser permits them, unlike the former `credentials:omit` fetch; this is a privacy trade-off and third-party tracking is already inherent in the provider-required FUMS feature.
- Bound in-flight image references and clean them on load, decode error or timeout. Do not treat an image decode error as proof the HTTP report was rejected.
- Run automated unit and cross-browser pixel checks with synthetic publisher token, no licensed Bible text, plus live production recheck. Preserve user-visible Bible reader functionality.

## Verification limits
HTTP 200 indicates the FUMS GET reached the endpoint but does not independently prove API.Bible counted the event in its private publisher dashboard. Actual delivery after deployment must be rechecked. Contractual entitlements, full account usage and signed NIV terms must still be evaluated separately; keep `source-licences` OPEN pending that evidence. Do not claim scholarly or physical accessibility gates complete.

## Repeat-view cache safety identified during PR testing

The initial cross-browser reporting test observed one real synthetic pixel GET for two displayed API.Bible editions when the fixture reused the same FUMS token and anonymous identifiers. The second image instance was served from the browser image cache instead of issuing a second network GET. API.Bible explicitly requires a new FUMS report each time the same cached content is displayed, so a per-view unique URL is necessary irrespective of publisher cache policy. Add an anonymous random `cb` query parameter generated for each display, preserving stable device and session identifiers. Browser and unit regressions now require two GETs for the same token and verify nonce uniqueness and no personal data. The additional `cb` field is not documented in API.Bible's canonical parameter list; confirm that the live publisher endpoint accepts its presence and, where available, verify ingestion with the publisher before treating contractual rights as cleared.
