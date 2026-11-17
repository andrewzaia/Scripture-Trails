# Publisher rights - dated baseline and event-driven review

Baseline: 17 November 2026. The owner accepted the non-commercial academic v1 source-rights review on 2 November 2026, including separate private API.Bible/ABS and NIV agreements. This is qualified owner acceptance, not independent verification of private account plans, selected editions, end-user totals or publisher-side reporting.

## Operating principle

Review publisher terms and permissions when integrating content, when a relevant publisher notification is received or otherwise brought to the operator's attention, or when Scripture Trails materially changes its use of that content. **No arbitrary monthly, quarterly or annual licensing audit is required by project policy.** Specific contractual notice, usage, reporting or review obligations still apply if the agreement requires them. A dated baseline documents what was assessed, but does not freeze later contractual amendments.

Relevant triggers include changing provider, edition, authorised territory or application, introducing monetisation, materially changing caching or redistribution, or approaching an applicable contractual usage ceiling. Ordinary unrelated releases do not trigger a publisher review.

## Private evidence at initial integration or triggered review

Record the date, relevant agreement or publisher notice, authorised application and editions, permitted use, attribution and reporting duties, applicable limits, decisions and remaining questions. Keep credentials, private agreements and account screenshots **outside public Git**. Do not make a blanket public claim of independently verified licensing.

- ESV/Crossway: maintain applicable non-commercial API and audio permissions, attribution and quotation/request limits.
- NASB20/Lockman and NIV/Biblica via API.Bible: maintain edition-specific permissions, notices, FUMS and any separate NIV conditions.
- NKJV/Thomas Nelson via API.Bible: maintain applicable edition permission, FUMS and any 5,000 monthly end-user ceiling. A monthly audience threshold is an operational constraint, **not** a monthly licence-policy review requirement.
- Other datasets and images: retain dated source, attribution and adaptation evidence; review if use changes or relevant rights notice is received.

## Specific outstanding implementation evidence

Tests check publisher notices, attribution, absence of a bundled licensed Bible corpus and FUMS GET emission for initial and cached passage display. The site uses a manual FUMS v3 GET rather than executing a third-party tracker script alongside private notes. API.Bible recommends its tracker for browser environments and documents manual GET for other contexts. Request **private written provider confirmation** once on the browser implementation and anonymous `cb` cache-buster. HTTP 200 alone does not establish publisher-side ingestion.

Keep issue #79 open for specific unresolved account-side permission and FUMS questions, not perpetual scheduled policy reviews.
