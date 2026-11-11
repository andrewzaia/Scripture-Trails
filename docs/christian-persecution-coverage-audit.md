# Christian persecution geographic coverage audit

Checked: 2026-11-11
Candidate release: v1.11.0

The catalogue includes 470 published report records from 96 countries and territories. This release adds 35 records across 12 countries previously missing from the archive: Bahrain, Maldives, Georgia, Serbia, Croatia, Bosnia and Herzegovina, Sweden, Netherlands, Finland, Argentina, Honduras and Romania.

## Source-inclusive reporting policy

The archive preserves attributed reports whether confirmed, unverified, disputed or based on a single publisher. It includes reported attacks on clergy or church property, incidents affecting Christian worship, patterns of discrimination, and restrictive state laws. Entries are not independent findings of intent, guilt or responsibility.

- Use an original published source URL and the publisher's name on every record. Maintain the original account even if later reporting disputes it; cite follow-up sources where available.
- Describe arrests, convictions, allegations, religious motives and non-religious criminal explanations with the status actually reported.
- Maintain source date precision and avoid confusing publication dates with the day of an incident.
- Treat continuing regulatory restrictions and aggregate summaries as reports, not a number of individual attacks. Do not multiply victims or incidents to inflate report counts.
- Do not supply fabricated site-level coordinates for country-wide policies or ambiguous locations.
- Third-party images are included only with an established local-hosting reuse licence and attribution; otherwise link to the publisher.

## Simplified world-map issue and solution

The local 110m world geometry omits Bahrain (BHR) and Maldives (MDV) even though the published reports now include them. These two countries appear using separate, accessible, keyboard-operable country-level map symbols. Their coordinates are representative map locators, **not** a reported incident location. They are present in country-only and combined layers, remain selectable when filtering, and disappear if a future map geometry includes the full country polygon. Existing countries continue to use their own true local polygons.

Country-specific counts on the map represent *published report records*, not confirmed incidents or per-capita persecution levels. Locations with no report remain unshaded; absence of a recorded report does not establish safety.

## Research backlog

Next high-priority zero-coverage locations include Zimbabwe, North Macedonia, Albania, Switzerland, Norway, Denmark, Japan, South Korea, Mongolia, Ecuador, El Salvador, Panama and others where published records can be found. The detailed geographic research queue should be updated as more sources are found.

Continue deepening countries already covered by one or two reports, including Haiti, South Sudan, Afghanistan and the Philippines, as well as the Democratic Republic of the Congo.

## Release verification

Required before publication: npm release reproduction with the standard command, npm run build, all source/data/release checks, Chromium/Firefox/WebKit desktop and mobile flows, true 200% and 400% zoom, merge checks, and Cloudflare production deployment for the exact merged SHA. Verify the live site if available, and report any limitations.
