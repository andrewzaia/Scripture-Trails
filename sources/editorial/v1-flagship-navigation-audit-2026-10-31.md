# Flagship navigation and source-link integrity audit - 31 October 2026

## Found and corrected

Guided journals were selected in volatile application state and were not represented by URL parameters. A user could open a journal, but a reload, shared link or browser-history return could lose the chosen reading pathway. The journal directory's person-trail handoff also rewrote the current history entry, so returning to a selected journal from the person index could lose the previous address.

This release makes the original six journal identifiers shareable as `?view=journeys&journey=<id>`, validates IDs against the existing study catalogue, restores them on reload and browser history navigation, and removes the journal parameter when navigating into another view. The person-trail handoff now creates its own history entry rather than rewriting the origin. The existing notebook schema and saved-reading keys are unchanged.

## Automated coverage introduced

- All six guided journals are opened by their exact URL, each with six visible chapters and the existing approximate study-time estimate; invalid IDs safely show the directory.
- A journal's progress checklist persists through reload, "Resume next unread" opens the correct reader reference, and Back/Forward restores the original journal while preserving progress.
- A journal visitor can navigate to a filtered person trail and return by Back without losing the previous journal.
- All 20 person trails are checked for corresponding indexed people and valid Scripture refs; browser tests visit each indexed person and open a selected passage.
- All 79 Gospel stage IDs, 83 Pauline stages, 35 Gospel place IDs, five historical city shortcuts and every original journal reading target are checked against local data and 66-book verse-count boundaries. Existing dataset validators remain in effect.
- The broader desktop/mobile browser suite continues to test the other reading, Atlas, backup, privacy, failure and accessibility pathways. Fake Bible passages in tests are labelled synthetic and no authorised publisher text is rehosted or disclosed.

## Limitations and remaining v1.0 conditions

The tests demonstrate the particular paths checked, not an exhaustive proof that every possible link in the whole product works on all browsers and assistive devices. No human specialist historical or textual appraisal is claimed. Automated provider fixtures do not verify real ESV/NASB20/NIV/NKJV production credentials, licence permissions or external uptime. The v1 content audit remains open pending additional independent source reviews and user-experience coverage. Security, cross-browser/zoom, screen-reader and rollback acceptance criteria are separately open.

Release requirements: standard `npm run release` with a MINOR increment, matching published and repository changelogs and footer, full build plus Node tests, desktop/mobile browser suite, complete PR-diff release gate, exact-SHA Cloudflare production deployment, and live version/permalink smoke tests.
