# Scripture Trails public repository security and source-rights boundaries

Scope reviewed: 17 November 2026. This is a bounded source-side audit and operations policy, not a claim of independent GitHub security-setting access or complete secret clearance.

## Security and automation

- Protected `main` ruleset 26275373 requires an up-to-date `release-gate`, pull requests, and blocks force-push/deletion without bypass actors.
- Monthly `repository-security-audit.yml` fetches currently reachable heads and tags, checks blobs for common high-confidence credential patterns and sensitive filenames and **never prints candidate values**. It is read-only, uses one standard runner monthly, and does not add a PR gate or upload suspect data.
- This scan excludes binary or oversized blobs, arbitrary unprefixed secrets, unreachable or deleted refs, historical Actions logs and provider account settings. Its output counts exclusions and must never be called a full historical guarantee.
- Monthly grouped Dependabot PRs are limited to one pending PR per ecosystem. Such PRs still require the appropriate `npm run release` increment, both changelogs, full protected PR validation and review before merge. Never bypass version checks to merge automated updates.
- GitHub repository administrators must separately check Settings > Advanced Security: dependency graph, Dependabot alerts/security updates, secret scanning and push protection. Their current enablement **has not been verified** through this connection.

## Redistribution boundaries

- No root `LICENSE` file has been granted. Public readability does not grant redistribution of original code or editorial material. Choosing an explicit licence for original code remains an owner decision, separate from rights to third-party resources.
- Crossway ESV and API.Bible NASB20, NIV and NKJV material are third-party copyrighted translations and are not bundled or relicensed by the repository. Private account agreements, credentials and quotation permissions are separate.
- OpenBible-derived cross-reference link data requires its own licence and source provenance. That attribution does not extend to any copyrighted Bible passages.
- The five locally transformed Wikimedia city photographs have per-image source, creator, licence, adaptation and SHA-256 metadata in `public/data/city-studies.json`. Preserve their individual licences including relevant share-alike obligations.
- Four locally hosted Wikimedia incident illustrations have source, creator, licence, adaptation and matching import-record metadata in `public/data/christian-persecution-images.json` and `scripts/persecution-media-import-sources.json`. Some images predate or postdate the event and must not be presented as incident photographic proof.
- Map geometry, other source datasets and article links require independently applicable attribution or permissions. A link does not grant permission to copy a news publisher's text or images.

## Outstanding evidence and incident response

1. Reconcile the audit's excluded binary/historical materials, any available GitHub secret-scanning alerts, obsolete Action logs and all third-party redistribution terms.
2. If any active secret is found, revoke or rotate it with the provider before remediation. Removing the latest tracked copy does not remove it from public Git history.
3. Keep private contract and security-setting evidence out of this repository and public issues. Record a dated, non-sensitive outcome and explicitly scoped limitations.
4. Close #75 only when the remaining review is evidenced; deploying this automation alone does not certify its completion.

Issue: https://github.com/andrewzaia/Scripture-Trails/issues/75
