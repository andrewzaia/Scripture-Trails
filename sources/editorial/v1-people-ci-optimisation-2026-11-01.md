# Scripture Trails v1.0 readiness: person references and efficient CI

Date: 1 November 2026. Baseline v0.44.16. Evidence audit: https://github.com/andrewzaia/Scripture-Trails/issues/67 . Release operations: https://github.com/andrewzaia/Scripture-Trails/issues/78 .

## Biblical reading corrections
- Moses, Departure from Egypt: Exodus 12:31 records Pharaoh's command but the action of departure is narrated at Exodus 12:37-42. Set reading range to Exodus 12:31-42; the note refers to both events. Primary Scripture: https://bible.usccb.org/bible/exodus/12 .
- Solomon, The ark enters the temple: 1 Kings 8:1 is assembly, verse 6 describes the ark entering the Most Holy Place and 8:10-11 describes the cloud. Set range to 1 Kings 8:1-11. Primary Scripture: https://bible.usccb.org/bible/1kings/8 .

Maintain all stable people-trail identifiers and existing journal progress. These are contextual citation corrections, not independent historical or manuscript authentication.

## GitHub Actions runner efficiency
- On a PR, the required source/build job runs first; then all Chromium, Firefox and WebKit projects remain mandatory. A skipped, cancelled or failed PR browser result blocks the retained required `release-gate`.
- On a protected main push following the successfully checked PR, run the complete source/build and release consistency checks but skip the three redundant browser installations. The release-gate must see source success, the intentionally skipped browser job and precisely `refs/heads/main`.
- The gate uses `if: always()` and explicitly rejects unknown events or unexpected source/browser results. Unit tests execute its actual bash script for both permitted event paths and numerous forbidden outcomes.
- Trade-off: the squash-merge SHA no longer has a second full browser matrix. This depends on strict branch protection and latest-PR merge validation; if merge policy changes or the exact merge tree may differ from what the PR matrix tests, restore post-merge browsers. Cloudflare exact-commit deployment verification, plus live static smoke, remain required.

This does not certify external expert review, real screen readers or zoom, publication rights, interactive production acceptance, a physical rollback or final v1 go/no-go. Keep eight outstanding v1 criteria open.
