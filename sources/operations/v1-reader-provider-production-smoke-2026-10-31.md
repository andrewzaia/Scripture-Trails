# Scripture Trails v1 reader-provider acceptance evidence

Date: 2026-10-31 (Australia/Sydney)
Scope: Production website https://www.scripturetrails.com/ at v0.43.0 before the reader hardening release, and v0.43.1 after deployment.

## Real external provider observations

Cloudflare Browser Rendering was directed to the public production reader, with no mocked requests, connected to the deployed server-side Crossway and API.Bible proxies. The page reported an official edition status and finished loading in each tested case. **No Bible passage text or API credentials were copied to the repository, logs or this report.**

| Bible edition | John 3:16 | Psalms 23:1 | Romans 8:28 | Visible attribution |
| --- | --- | --- | --- | --- |
| ESV | Pass | Pass | Pass | ESV via Crossway and short copyright text in the passage |
| NASB20 | Pass | Pass | Pass | Lockman Foundation publisher notice supplied by API.Bible |
| NIV | Pass | Pass | Pass | Biblica publisher notice supplied by API.Bible |
| NKJV | Pass | Pass | Pass | Thomas Nelson publisher notice supplied by API.Bible |

All 12 observed reader loads completed successfully against live production. The four editions did not fall back to another translation on failure. No actual user or personal notebook data was used. The repeatable npm check:live-reader command probes the same 12 API routes without logging passage text. It verifies HTTP 200, cache-control no-store, meaningful passage payload and API.Bible edition/copyright identity.

## Failure and recovery validation

- In unit tests, missing ESV_API_KEY or API_BIBLE_KEY returns an explanatory 503 instead of exposing a key or silently switching translation.
- API.Bible 401/403 (authorisation or licence-related denial) maps to a safe translation_unavailable response; missing references, upstream throttling, upstream error, bad JSON, wrong Bible ID and missing copyright are rejected. Redirects cannot forward the API.Bible key; upstream response bodies have a one-megabyte limit and a ten-second timeout.
- The Crossway proxy is now explicitly protected against redirects, oversized or missing/malformed passages and ten-second network stalls, without exposing its secret; additional tests cover these cases and 429/502 error handling.
- Real-browser synthetic failure tests switch to an unavailable NASB20 edition, display an actionable outage message, then successfully load NKJV, ignoring an older delayed NIV response. This verifies graceful return to a working edition without disrupting real production secrets.
- Production credentials were **not** intentionally revoked or rate-limited to provoke downtime; those conditions are proven in isolated tests, not represented as live outage tests.

## Important limits

This evidence supports the bounded reader-provider-smoke and provider-failures acceptance criteria, **not** a legal approval of ESV, NASB20, NIV or NKJV redistribution rights. Explicit publisher account terms, territory and usage permissions and long-term API quotas still require a separate source-licence audit. Live responses establish only short-lived availability at the time checked; future uptime is not guaranteed.

The 1.0.0 release still needs a separate release-candidate smoke run checking version, exact SHA, Atlas, saved notes and responsive navigation; it cannot close live-smoke merely because this provider-only check passed. Independent screen-reader, physical device, threat-model, data recovery and rollback criteria remain open.

Evidence sources: functions/api/passage.js, functions/api/_api-bible.js, public/assets/app.js, scripts/check-live-reader.mjs, tests/api.test.mjs, tests/translations.test.mjs, tests/live-reader-smoke.test.mjs, tests/browser/journeys.spec.mjs, GitHub PR validation and verified Cloudflare production browser sessions.
