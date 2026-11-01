# Public publisher and source-rights implementation review

Date: 2026-10-31

## Scope and decision

Scripture Trails is a **non-commercial academic Bible-study website**. This review covers publicly available publisher terms, website citation/attribution practices, local data and images, and observable software controls. It is not a copy of an account agreement or private publisher correspondence. No non-public contractual text or details belong in this repository.

The v1 `source-licences` criterion remains OPEN pending completion of the implementation audit and required source/attribution regression checks. The operator's non-commercial purpose is the working premise. Functional API responses and valid copyright notices remain separate from proof of ongoing compliance with conditions.

## Public source conditions

| Edition | Provider | Public conditions relevant to this website |
| --- | --- | --- |
| ESV | Crossway | Copyright and publisher reference, non-commercial API eligibility, quotation/copying caps and request limits. Source: https://www.esv.org/api/ |
| NASB20 | API.Bible / Lockman | Current publisher metadata and copyright notice, non-commercial use conditions, FUMS usage reporting and limits. Sources: https://api.bible/terms-and-conditions and https://www.lockman.org/ |
| NIV | API.Bible / Biblica | Publisher metadata and attribution, constraints on displayed and redistributed content, applicable API.Bible reporting and use limits. Public source: https://www.biblica.com/permissions/ |
| NKJV | API.Bible / Thomas Nelson | Publisher metadata and notice, FUMS reporting, API.Bible access limits including the published 5,000 monthly-end-user threshold for relevant non-commercial plans. Source: https://api.bible/terms-and-conditions |

The website does not sell Bible translations, provide bulk downloads or host a standalone copyrighted Bible translation corpus. Client-side reading uses server-side API integrations. Public copyright notices are shown in the Bible reader, Atlas preview and side-by-side comparison.

## Technical observations and verification targets

1. API keys remain in server-side Cloudflare secrets. Only ESV, NASB20, NIV and NKJV are selectable, with fixed upstream endpoints and provider IDs.
2. API responses use no-store controls; no licensed Bible text is placed in notebook exports or project datasets.
3. For every displayed API.Bible passage, preserve the publisher's copyright metadata and the API.Bible service attribution; include the publisher link next to each passage in the reader, Atlas preview and both side-by-side columns.
4. FUMS v3 reports are sent from the site without shipping private notebook text or searches. Failed reports and publisher availability require monitoring.
5. The local Atlas cross-reference snapshot credits OpenBible.info and its public references; this does not extend a Creative Commons licence to ESV or another copyrighted Bible translation.
6. The five locally hosted historical-city photographs identify Wikimedia Commons source pages, image authors, licence URLs, WebP transformations and SHA-256 values. Preserve applicable CC BY/CC BY-SA notices in the city views.
7. The project must re-check public publisher conditions and quota limits when its use model, traffic, supported editions or publisher service changes.

## Limitations

This is a source-and-code audit of the published application, not a legal opinion, contractual disclosure, proof of all future publisher decisions or independent penetration test. The app's real-world traffic and external publisher dashboard status cannot be reconstructed from local repository files.

**Readiness is 13 of 17 met, 4 open** in the prepared v0.44.21 patch after the exercised production rollback. The source-licences criterion stays open: working API responses, visible publisher notices and the owner's separate confidential-agreement compliance attestation do not independently verify the live API.Bible account's edition selection, publisher-side FUMS attribution or end-user quota. No confidential agreements are published with this report.

### 1 November 2026 implementation recheck

Real production browser sessions for v0.44.20 retrieved representative ESV, NASB20, NIV and NKJV passages. The API.Bible editions retained their publisher/copyright links; the ESV's full standard copyright is visible in the site footer. Code inspection identified a scoped defect in cached API.Bible reader views: navigating away and returning to the same visible passage did not resubmit its reusable FUMS token, even though API.Bible's published guidance requires a report each time content is displayed. The v0.44.21 candidate reuses only the token from the successful passage response for a returning view, retaining the existing pseudonymous device/session IDs, and adds a browser regression. See https://care.api.bible/article/417-understanding-fums and https://github.com/andrewzaia/Scripture-Trails/issues/79.

The owner previously provided private API.Bible/ABS service agreements (including the NIV-specific extra agreement) and affirmed this academic website's non-commercial compliance. The agreements remain private and were not republished or re-extracted for this document. Actual current publisher account settings and utilisation cannot be reconstructed from public source code, so this report does not certify them.

## Public references

- https://www.esv.org/api/
- https://api.bible/terms-and-conditions
- https://www.biblica.com/permissions/
- https://www.lockman.org/
- https://www.openbible.info/labs/cross-references/
- https://creativecommons.org/licenses/by/4.0/
- https://commons.wikimedia.org/
