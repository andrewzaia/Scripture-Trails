# Public publisher and source-rights implementation review

Date: 2026-10-31

## Acceptance addendum - 2 November 2026

**Outcome: the project owner has accepted the scoped publisher and third-party source-rights review for Scripture Trails' existing non-commercial academic use.** The owner previously supplied private ABS/API.Bible contracts for reference, including the NIV-specific agreement, and expressly declared that Scripture Trails complies with those agreements. This is **owner contractual acceptance**, **not an independent legal opinion or a claim that an AI inspected the current private API.Bible billing/licensing dashboard**. Those agreements and credentials are confidential and remain outside the public repository.

Supporting independently observed implementation evidence:

- The four supported reader editions, ESV, NASB20, NIV and NKJV, loaded official provider text on the live production site, with visible copyright and publisher links for all editions. The API.Bible editions are retrieved through server-side authenticated API integrations, with no permanent licensed-text corpus or private notebook text included in exports.
- FUMS v3 is implemented for displays of API.Bible text; regression coverage specifically verifies reporting when the user returns to a previously loaded cached passage (released in v0.44.21). FUMS is a required publisher control, but API.Bible's public information does not offer a developer dashboard that proves receipt of each individual FUMS report. The application tests establish client-side emission, not server-side publisher ingestion.
- Copyrighted Bible publisher reference links and the local historical-city media licence, author, source and transformation metadata are covered by source reviews and automated tests. Cross-references do not convey rights to reuse copyrighted Bible translations.
- Official primary sources: [API.Bible terms](https://api.bible/terms-and-conditions), [API.Bible licensing overview](https://care.api.bible/article/369-understanding-api-bible-licensing), [API.Bible app configuration](https://care.api.bible/article/414-managing-apps), [FUMS policies](https://care.api.bible/article/396-licensing-policies-quick-reference) and [Crossway ESV API terms](https://www.esv.org/api/).

**Ongoing conditions and uncertainty:** API.Bible's NKJV non-commercial availability depends on the application retaining an eligible plan and not exceeding **5,000 monthly end users**. The operator must maintain the correct edition selections, non-commercial designation, FUMS integration and applicable quota, and reassess permissions before any advertising, fundraising or other monetisation that the agreement treats as commercial. The actual app plan, selected-end-user range and account-side licence configuration have **not been independently read through this integration**. Owner acceptance relies on the operator's existing contractual declaration and continuing obligation to keep those settings accurate. Successful passage retrieval alone is not proof of the legal terms.

This addendum supersedes only the former **OPEN** status for the scope defined by the v1 `source-licences` criterion, `Audit publisher/API conditions, stored data permissions, rights notices and bibliographic links for published material`. The dated 31 October review below is retained as a historical snapshot; it does not mean the account dashboard is now independently verified. The gate is accepted with the limitations above. See [GitHub issue #79](https://github.com/andrewzaia/Scripture-Trails/issues/79).

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
