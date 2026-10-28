# Browser release coverage

Run `npm ci`, `npx playwright install --with-deps chromium`, then `npm run test:browser`.
Use `npm run test:browser:report` to inspect the HTML report and retained failure traces.
Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use a locally installed Chromium
when its matching Playwright browser download is unavailable. CI installs the
pinned Playwright Chromium build. The static test server binds only to loopback. It does not run the Pages Functions.

The same journeys run in desktop Chromium (1440 px) and mobile Chromium (390 px,
touch enabled). They cover passage and edition navigation, error recovery, Atlas
preview/focus using its keyboard list, Gospel and Pauline map alternatives,
roadmap filters, local notes/highlights/bookmarks, linked places, dated collections,
backup round trips, explicit conflict replacement, import-versus-draft conflicts
and cross-tab stale-write protection for collections, reader notes and bookmarks.

All twelve views receive axe WCAG 2 A/AA and 2.1 A/AA checks in dark and light
themes and a horizontal page overflow check. Keyboard checks cover the skip link,
mobile navigation dismissal, Atlas and map lists, and roadmap filters. CI has no
test retries; the release-gate job fails if either source or browser checks fail.
Reports and failure traces are retained for 14 days and contain synthetic data.

Passage responses are invented fixture prose with synthetic attribution and no
Scripture-view token. Unexpected API requests and external network requests fail
the fixture. No publisher Bible text, account, API credential or live service is
used. API.Bible/Crossway adapters retain their separate Node tests; browser fixtures
do not establish live publisher availability or real response compatibility.

Automated scans and keyboard scenarios do not establish complete accessibility.
A manual screen-reader audit, real-device testing, Firefox and Safari coverage,
and subjective readability remain separate review work. The public roadmap keeps
manual assistive-technology review open.
