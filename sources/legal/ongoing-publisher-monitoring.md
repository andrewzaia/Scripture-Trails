# Ongoing publisher rights and usage monitoring

Baseline: 17 November 2026. The owner accepted the non-commercial academic v1 source-rights review on 2 November 2026, including separate private API.Bible/ABS and NIV agreements. This is owner contractual acceptance with qualified implementation evidence, not independent verification of current account plan, selected editions, end-user totals or publisher-side reporting.

## Private operator checklist

For each publisher account, privately record operator/date, agreement version, authorised application and editions, purpose and territory, permitted passages/caching, user range, request quota, current usage and next review. Store credentials, agreements, and dashboard screenshots **outside public Git**.

- ESV/Crossway: check live non-commercial eligibility, authorised API/audio use, attribution and rate/quotation limits.
- NASB20/Lockman through API.Bible: check selected edition entitlement, copyright notices, FUMS and request limits.
- NIV/Biblica through API.Bible: check the separate NIV permission, territory, applicable non-commercial/no-AI conditions, notices and FUMS.
- NKJV/Thomas Nelson through API.Bible: check selected edition, notices and FUMS, plus the published **5,000 monthly end-user ceiling** for applicable non-commercial plans.
- Other data and photos: separately verify OpenBible licence/provenance, Commons adaptation and map-source terms.

## Technical controls and unresolved obligations

Existing tests check published copyright notices, source attribution, no bundled licensed Bible corpus, and FUMS GET emission on initial/cached passage display. The browser deliberately uses the documented manual FUMS v3 GET rather than executing a third-party tracker script beside locally stored private notes. API.Bible currently **recommends** its tracker for browser environments, and documents manual GET for other contexts. Request **private written provider confirmation** that this privacy-preserving browser integration and additional anonymous `cb` cache-buster meet the licence requirement. HTTP 200 does not prove publisher-side ingestion.

Review private account limits monthly while usage grows, and immediately before advertising, monetisation, changing translation editions or material traffic increases. Public audit notes should disclose only date, scope, decisions and remaining gaps. Keep issue #79 open until the private account-side baseline has actually been confirmed; recurring reviews then continue without reopening the v1 scholarly approval.
