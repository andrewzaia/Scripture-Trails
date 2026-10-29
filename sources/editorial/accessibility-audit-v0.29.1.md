# Browser accessibility audit - 29 October 2026

## Scope and limits

This audit covers the twelve main views in the existing study workspace: Discover, reader, Atlas, Jesus, Paul and Hebrew Bible maps, Historical Cities, people index, roadmap, study journeys, notebook and About. It combines code inspection, live Chromium keyboard reproduction, deterministic browser journeys, axe scans, narrow-width reflow and enlarged-text stress checks.

It is not a WCAG conformance certification or a screen-reader test. No VoiceOver, NVDA, TalkBack, physical phone, Safari or Firefox validation was performed. A 320 CSS pixel viewport is a reflow proxy; text enlarged through computed CSS sizes is a deterministic stress check, not actual browser or operating-system zoom. Synthetic test passages do not establish live Bible-provider availability. Existing notebook and licensed-content boundaries are retained.

## Reproduced findings and repairs

| Finding | Evidence before repair | Repair and regression coverage |
| --- | --- | --- |
| Passage links lose keyboard position | Opening the Genesis example on the live site left focus on the document body; the local destination-focus check failed | Move focus to the named main landmark on cross-view reference navigation and browser history, while retaining focus in same-view reader controls |
| Keyword search leaves focus in a hidden view | The local search-focus check failed | Focus the reader destination, expose its loading state and use a status region; opening a search result also moves focus before its button is replaced |
| Mobile navigation permits background focus | The modal-navigation behaviour check failed; the drawer had no focus containment or accessible internal close control | Give the open mobile drawer dialog semantics, an internal close button, background inertness, Tab/Shift+Tab containment, Escape and close/backdrop restoration, and desktop-resize cleanup |
| City content grows beyond the page at enlarged text size | At a 1280px viewport with 200 percent computed text sizes, Historical Cities reached 1399px document width | Allow city panels and marker choices to shrink and wrap their text, without hiding page overflow |
| Navigation context lacks an exposed current destination | Visual selection did not set aria-current, and every view kept the Discover document title | Mark the active navigation control, update the broad-section document title, and give the main landmark the current section's accessible name |

The initial targeted desktop run had four failing scenarios and one passing scenario. All twelve views already passed the 320px reflow scenario; no narrow-width defect is claimed from that baseline. The five targeted scenarios passed after the initial repairs. GitHub's pinned Chromium then exposed a resize race: CSS could hide the close button and blur it before the media-query callback inspected focus. The handler now recovers from the drawer's open state and tracks the last meaningful navigation focus, with both resize directions covered. Final source, browser, CI and production results are recorded in the release PR.

## Verification design

- Existing source checks and desktop/mobile journeys remain required by the GitHub release gate.
- Axe scans use WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags in both themes, plus an open mobile drawer scan. Automated rule results are not proof of complete conformance.
- Keyboard cases cover reference navigation, history, keyword search and result selection, mobile focus containment, Escape/close restoration and viewport changes. The initial page load still permits the Skip to content link to be the first Tab stop.
- All twelve views are checked at 320 CSS pixels and with 200 percent computed text sizes. Map and Atlas alternatives remain keyboard-accessible lists; a visual diagram's geometry does not substitute for those controls.
- Version checks cover the modified city stylesheet and the analytics module. Public release notes, footer and cache keys must agree.

## Human validation still required

Record the tester, date, operating system, device/browser and assistive-technology version, exact steps, expected result, observed result and severity for each finding. Use disposable local notebook data when testing storage or imports.

1. On macOS/Safari with VoiceOver and Windows/Chrome or Firefox with NVDA, check landmarks, headings, current navigation, passage loading/results, map alternatives, notebook forms and import conflict announcements. Confirm that opening/closing the mobile drawer is announced and background controls cannot be reached.
2. On physical iPhone/Safari and Android/Chrome, test portrait/landscape, software keyboard, pinch/text zoom, touch targets, long content and native controls. Include VoiceOver or TalkBack navigation.
3. Check actual browser zoom and text settings, forced-colour/high-contrast modes, reduced-motion preference and visible focus under the tester's configuration. Confirm labels and content do not overlap or disappear.
4. Report findings before marking the manual accessibility milestone delivered. Independent accessibility review and complete certification remain open.

## Primary guidance checked

- [W3C APG: modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): initial focus, contained Tab sequence, Escape and focus restoration. The drawer uses modal semantics only while open at mobile widths.
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): narrow viewport and zoom-related reflow scope, including diagram exceptions.
- [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): size and spacing rules and their exceptions. Dense diagram pins are not a reason to remove equivalent list controls.
- [MDN: inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert): background focus and interaction suppression.

Only scoped original findings and external guidance links are retained here.
