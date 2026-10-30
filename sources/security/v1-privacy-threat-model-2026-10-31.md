# Scripture Trails - Security and privacy threat model
Date: 2026-10-31
Status: AI-assisted bounded application/source review and production controls audit, not a penetration test.

## Scope and assets

Public-facing origin: https://www.scripturetrails.com. Static Cloudflare Pages frontend, server-side Cloudflare Pages Functions at /api/passage, /api/search and /api/analytics-config; Crossway ESV and API.Bible as fixed upstream publishers; Bible text and FUMS view reports; visitor localStorage notebook, linked notes, highlights, collections, reading progress and unencrypted local backups. Optional consented Google Analytics. No account system or site-side note database.

Threat actors: unauthenticated automated API callers; malicious third-party upstream HTML/content; compromised external JavaScript delivery; other tabs or scripts with same-origin access; users attempting to import malicious backups; accidental private query leakage by referrer or analytics; unauthorised attackers trying to extract secret API keys. Threat boundaries: browser/private storage, server-side API credential bindings, third-party publishers and consent-based telemetry.

## Risk register, controls and residual risks

| Concern | Initial risk | Review finding and remediation | Residual |
| --- | --- | --- | --- |
| API credentials | High confidentiality | Keys only read from Cloudflare server environment and sent to fixed Crossway/API.Bible domains. Manual redirects, 10-second timeouts, safe errors, bounded upstream reply; no client API credentials, keys or publisher error text exposed. | Cloudflare secret access and deployment role governance require ongoing operator vigilance. |
| ESV keyword search | High availability/integrity | Previously allowed automatic redirects, unlimited response JSON and network stalls. Now manual redirect policy, 10-second timeout, 256 KiB streaming cap, strict result shapes/length limits, safe throttling and upstream error responses. | Provider outages/throttling and latency remain possible; not a service-level uptime guarantee. |
| Publisher HTML/XSS | High confidentiality | Bible reader transforms remote HTML through explicit DOM allowlist, strips scripts, images, inline handlers, unknown link hosts and unsafe URL protocols. Regression injects synthetic malicious publisher HTML and confirms it cannot execute. CSP disallows unsafe-inline and external scripts other than separately consented GA. | Automated payload tests and allowlist review are not a substitute for continuous browser/security research or manual specialist testing. |
| API.Bible FUMS | High confidentiality | Third-party FUMS JavaScript previously executed within the notebook origin. Converted to the API.Bible-documented FUMS v3 manual GET. Token fetched with fums-version=3; only publisher token, random pseudonymous device and session IDs sent. Uses no-referrer, no cookies and no notebook values. Removes third-party FUMS scripts from CSP. | Provider still receives pseudonymous usage and requester network metadata by design, as disclosed. Lack of independent publisher dashboard receipt confirmation prevents asserting perfect reporting delivery. |
| GA4 analytics | Medium privacy | Production-only configuration, explicit user opt-in, section-only measurement and sanitized referrer. No custom note, keyword or Bible reference event payloads. GA library loads only after opt-in. | Consent allows Google third-party code execution in the page origin, potentially granting access to browser storage at runtime. Those needing maximum privacy should decline analytics. This is an accepted opt-in dependency, not a promise of script isolation. |
| CSP and referrer | Medium privacy | CSP restricts scripts to same origin plus opt-in Google; no inline scripts, frame embedding, objects, foreign forms or unexpected base URLs. Site-wide Referrer-Policy changed from origin-only-on-cross-origin to no-referrer. FUMS connect-src is pinned to fums.api.bible. | Browser extensions, compromised same-origin code and end-user downloads remain outside CSP protection. |
| Personal notebook and backup | High integrity | Validated JSON import/merge, size and canonical reference bounds, XSS-safe rendered text, cross-tab expected-state check, quota failure protection, explicit corrupt-data recovery and local-only backups. | Notes remain unencrypted in browser storage and downloaded backup files. Device/browser loss without backup can permanently remove notes. |
| Abuse/rate limits | Medium-high availability | Crossway public API has documented upstream quotas (60/min, 1,000/h and 5,000/day); private keys are held server-side. The release includes a planned Cloudflare WAF zone rule matching exactly /api/passage and /api/search on the canonical host, counting by colo and IP, blocking above 30 requests per 10 seconds for 10 seconds with HTTP 429. Must be confirmed in the live zone before claiming effective operation. | Per-IP counters can over-limit shared NAT users and cannot prevent distributed abuse. Cloudflare Free plan allows a single zone rule and 10-second window. Provider rate limits remain the final safeguard. |
| Authentication / authorisation | Low | No user accounts, credential cookies or privileged notebook endpoints; all public API paths are read-only GET and input validated. No browser user notebook data uploaded to the application server. | Any visitor may query published Scripture up to applicable rate limits. This is intentional; no claim of private API authorisation. |
| Copyright and publisher terms | High legal/commercial | Published translation text is retrieved live, not stored in datasets. Required publisher attribution remains, and FUMS reporting is preserved via a publisher-documented mechanism. | Contract scope, location restrictions, sub-licensing, publisher quotas and licence terms remain in separate OPEN v1 source-licences criterion. |

## WAF release control

Canonical zone: scripturetrails.com. Expected new single rule on phase http_ratelimit, matching (http.host eq "www.scripturetrails.com" and (http.request.uri.path eq "/api/passage" or http.request.uri.path eq "/api/search")). Characteristics: cf.colo.id and ip.src. Period: 10 seconds; requests per period: 30; mitigation timeout: 10 seconds; action block with status 429. Existing rate-limiting phase had no entrypoint ruleset on inspection (404). Do not claim WAF activation until a GET returns the matching enabled rule; avoid making many live probe requests just to trigger the rule and disrupt readers.

The rule is a production configuration attached to this release and should be maintained as part of the release documentation. Undo by deleting only the named Scripture Trails rule, without altering unrelated rules. Cloudflare zone configuration is separate from the repository, so verify it independently after deployment.

## Acceptance and limitations

Evidence: reviewed source for the only three Pages Functions endpoints; public CSP; the script and telemetry paths; server-side read/response validation; existing notebook backup and browser-failure regressions; newly added security-specific Node and Playwright tests; production Cloudflare WAF rule readback. This is bounded AI-assisted verification rather than external specialist approval, full source dependency audit, third-party vendor assessment, vulnerability scan or adversarial penetration test. Critical vulnerabilities identified in the reviewed paths are remediated in code; consented GA and local-only note storage retain transparently scoped privacy limitations.

Next security work should include third-party dependency and supply chain vulnerability alerts, ongoing API quota and rate-limit monitoring, privacy review if adding authentication or cloud notes, and refresh the risk register when significant architecture or provider terms change.

Related published primary sources:
- https://docs.api.bible/guides/fair-use/ (documented FUMS v3 manual GET and identifiers)
- https://developers.cloudflare.com/waf/rate-limiting-rules/create-api/ (WAF Rulesets API)
- https://developers.cloudflare.com/waf/rate-limiting-rules/ (Free plan rule availability)
- https://api.esv.org/ (ESV API rate and usage requirements)
