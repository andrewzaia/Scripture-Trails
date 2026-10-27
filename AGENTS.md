# Scripture Trails project instructions

## Mandatory semantic versioning and changelogs

**Every release that changes the public website must have a new Semantic Versioning number (MAJOR.MINOR.PATCH). No public-facing UI adjustment, content correction, performance change or bug fix may be deployed without the appropriate increment and a matching public and development changelog entry.** This applies across all development conversations, contributors, branches and tools.

### Choose the release level

- **PATCH** (for example 0.9.1 to 0.9.2): Bug fixes, spelling or content corrections, CSS changes, visual refinements, accessibility improvements, minor UI adjustments, performance or reliability optimisations, and other small backward-compatible changes.
- **MINOR** (for example 0.9.1 to 0.10.0): New features, new publicly accessible pages, substantial content or functionality expansions, and other backward-compatible enhancements.
- **MAJOR** (for example 0.9.1 to 1.0.0): Incompatible or breaking behaviour, deliberate removal of supported functionality, significant redesigns that break existing interaction patterns, or other incompatible changes. A significant visual refresh that keeps behaviour compatible can be MINOR instead; avoid inflation.
- The current version must always be read from `package.json` on the target branch; never infer it from old chat history or issue descriptions.

### Required workflow for EVERY public-facing change

1. Inspect existing implementation and current `package.json` version before making changes. Select the correct PATCH, MINOR or MAJOR level.
2. Make and test related changes, using one or multiple Git commits if useful. **A commit is not necessarily a release:** group related work into one release and increment exactly once for that release.
3. Before merging or deploying, execute the existing `npm run release -- patch|minor|major "Release title" "Visitor-visible change"` command with the actual level and meaningful user-facing summaries. Never hand-edit version numbers or bypass the release script.
4. This command must update `package.json`, `public/data/releases.json`, `CHANGELOG.md`, the footer version in `public/index.html`, and versioned browser asset references. Do not skip any of these files.
5. Record **every meaningful visitor-facing change** in the new public and development changelog entries. The public list is concise and newest-first. The development changelog can include more implementation detail. Preserve all historical releases and the existing collapsed About-page presentation.
6. Never publish credentials, configuration secrets, personally identifying data or irrelevant internal maintenance in public notes.
7. Run `npm run build` (including `check:release`, `check:refs` and tests), inspect the changelog and footer consistency, and verify the new version is strictly greater than the last released version.
8. **Pull-request CI must compare the complete PR against its merge base with the destination branch, not only the final individual commit.** Block any website-changing PR if the version and matching release notes have not advanced. Confirm GitHub checks before merging. Cloudflare may use a shallow checkout, so the GitHub PR check is the authority for historical version comparisons; Cloudflare builds must still pass the metadata, asset and content checks.
9. Once merged, verify the GitHub commit and Cloudflare Pages production deployment refer to the expected release, and check live-site version when accessible. Never report test, merge or deployment success without verification.
10. Report the previous version, new version, visitor-facing changes, relevant GitHub commit, test status and deployment status after every website release.

### Documentation-only exception

A commit that changes only private development instructions or documentation and **does not change the public website** does not require a new website release or new public About-page changelog entry. Such changes remain traceable in Git history. Changing release validation scripts or the public site is *not* documentation-only and requires a release.

## Project data policy

- Prefer local, version-controlled copies of reusable reference datasets and supporting assets where redistribution is permitted.
- Preserve source links, authorship, licence notices, snapshot dates, checksums and a description of transformations. Public availability alone does not establish permission to redistribute.
- The OpenBible source snapshot is in `sources/openbible/`. `npm run import:refs` regenerates all 66 locally hosted Atlas shards without network access.
- Keep historical studies, geography data, navigation metadata and reusable site images local. External citations should remain clickable source links.
- Bible translation text remains subject to the ESV and API.Bible publisher terms. Do not bulk-download, vendor or persist licensed Bible text without appropriate permission. Keep required Scripture-view reporting.
- Run the relevant checks, preserve the current interface, and use ordinary ASCII hyphen-minus characters in generated copy.
