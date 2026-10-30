# Notebook recovery and local-data loss audit

Date: 2026-10-31
Scope: Browser-local Scripture Trails notebook, including passage bookmarks, freeform notes, linked annotations, highlights, reading-plan progress, study collections and reading schedules.

## Existing protections inspected

- Browser localStorage stores a single canonical scripture-trails:notebook snapshot. Per-entry older legacy keys remain as migration fallbacks only.
- Version 5 JSON backups include all canonical notebook categories, with prior schemas accepted. Backups are downloaded on the device; the importer does not upload files to a server.
- The importer validates the declared schema, canonical references, size limits, duplicate note identifiers, collections and highlights. Preview conflicts default to keeping current content.
- Normal writes compare the current stored notebook with the expected in-memory snapshot and reject edits made by another tab. Import previews additionally compare the current in-memory state before applying.
- Single-key setItem preserves the prior snapshot when a browser quota exception stops the write. No local copy is deleted first.

## Material recovery defect and remediation

A corrupt canonical JSON snapshot previously caused silent fallback to empty in-memory defaults. The first subsequent notebook write could fail without providing a meaningful recovery path. Users might incorrectly assume their notes had been erased.

The site now detects unreadable canonical snapshots and inaccessible storage, and displays an accessible sitewide warning plus a local notebook recovery panel. Raw damaged bytes can be downloaded as an **unencrypted private recovery copy**. The recovery process requires selecting and successfully validating a backup, reviewing the conflict/import preview and explicitly confirming that restoring the backup will overwrite unreadable stored data. A single localStorage setItem performs replacement after comparing the exact damaged bytes with the preview's original snapshot. A changed cross-tab snapshot, absent confirmation or quota/storage exception leaves existing bytes unchanged. A reload after success uses the restored content without changing canonical reference IDs.

This recovery action never scans or uploads private notebook content, and cannot reconstruct data that was never backed up. The raw damaged copy may be analysed with local tools separately if salvage is possible, but no automated repair of damaged JSON or lost local browser storage is promised.

## Verification evidence

Node unit tests cover bad JSON, null, structurally invalid payloads, storage access denial, stale raw-data comparison, successful replacement, readable-notebook rejection, quota-induced write failure, and round-trip v5 backup validation. Existing tests also cover earlier schema formats, invalid references, oversized payloads, conflicting notes, reading progress, place-linked annotations, and overlapping collection schedules.

Chromium desktop and mobile browser tests exercise:
- A corrupt browser notebook, visible warning, local raw-data download matching the original bytes, import preview and required explicit confirmation.
- Rejected unconfirmed recovery with damaged bytes preserved.
- Valid backup restoration, notebook updates and successful reload.
- Another tab changing the damaged snapshot after the preview, with no overwrite.
- LocalStorage quota failures during recovery, with the original bytes intact and the preview still available.
- Existing ordinary multi-tab conflicts, corrupt backup rejection, checked conflict replacement, and stale linked-note/collection edits.

Browser automation uses synthetic notes, fixture passages and temporary browser profiles. No actual user's personal notebook data was read or changed. This verifies tested scenarios, not exhaustive recovery from every browser bug, storage corruption, device loss or operating-system crash.

## Security, privacy and residual risk

**Data without an independent backup can be permanently lost**, including after browser profile deletion, private browsing termination, device failure or browser storage eviction. Notebook backups are not encrypted. Users should save them to a private secure location, preferably an encrypted device or protected store, and create fresh backups after meaningful changes.

Actual recovery of corrupt raw JSON may be possible case by case, but neither promised nor used to claim acceptance. There is no cloud synchronisation or automatic backup and no server-side private note repository. The authorisation/source-licence, complete threat-model, accessibility on physical assistive technologies and rollback criteria remain distinct open v1.0 acceptance gates.

Release process and checks: full Node and browser suite, standard npm release minor increment, PR-wide release gate, exact production SHA and smoke verification of recovery UI. All test evidence and changes are traceable in GitHub PR and repository history.
