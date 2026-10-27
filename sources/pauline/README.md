# Pauline journey geography

The local itinerary in `public/data/pauline-journeys.json` is an editorial reading aid for the three conventional missionary journey groupings in Acts 13-21. It is not an independently verified chronology. Scripture passages are the primary narrative sources; no publisher Bible text is stored here.

## Place sources

`pleiades-selected.json` retains selected metadata from 35 Pleiades place resources: identifiers, titles, representative points, bounding boxes, location precision labels, individual creator/contributor credits, and original JSON SHA-256 values. It includes the 34 gazetteer places used by the itinerary and an additional undetermined Derbe record for comparison. The pinned upstream revision and immutable per-record source URLs are recorded in the extract.

Attribution: Pleiades contributors, Institute for the Study of the Ancient World at New York University, and the Ancient World Mapping Center at the University of North Carolina at Chapel Hill. Individual creator and contributor names are retained in each record. Data is redistributed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Original source: [Pleiades datasets](https://github.com/isawnyu/pleiades.datasets).

Transformations: selected metadata extracted, identifiers matched explicitly to itinerary places, representative coordinates rounded to four decimals for 33 orientation markers. The Chios place record supplies context but no ship position or landing marker. Island points indicate whole-island orientation, not harbours. Full upstream records can be recovered from the pinned snapshot URLs; the per-record hashes refer to those original records, not the extracted metadata.

Pleiades identifies ancient places. Its scholarly review does not establish the events narrated in Acts and is not independent review of this itinerary. Derbe's candidate settlement and the separate undetermined record are deliberately distinguished. Lystra is also labelled provisional rather than implying a precise event location.

## Coastal orientation

`public/data/pauline-coast.json` stores exterior rings extracted from Natural Earth's public-domain 1:110m land polygons. The pinned source URL, original source hash, bounds and transformation description are embedded in that file. Exterior rings were clipped to 19-38 E and 29-43 N and rounded to five decimals. Small islands may be absent at this resolution. No political borders, ancient roads or historical coastline reconstruction are supplied.

Source and terms: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/).

## Narrative rules and open questions

- Each stage cites a specific Acts passage and has the status `editorial-reading-aid`.
- The three numbered journeys are conventional groupings, not headings supplied by Acts. Stage numbers are ordinal, not dates or elapsed time.
- Regions and unnamed settings have null coordinates. No Tarsus visit is inferred from Cilicia, no third-journey Corinth visit is substituted for Greece, and no Jerusalem pin is added for the unnamed church in Acts 18:22.
- Opposite Chios and sighting Cyprus are offshore descriptions, not recorded island landings.
- Trogyllium, present in some textual witnesses of Acts 20:15, is discussed as a textual question rather than silently added to the common itinerary. No full manuscript apparatus is claimed.
- John Mark's separate return to Jerusalem, Barnabas and Mark's Cyprus journey, Apollos' travels and the Ephesian elders' trip to Miletus are not treated as Paul's movements.
- Dashed lines join consecutive mapped stages within a single journey only. They stop at unpinned stages and are not roads, navigation tracks, travel modes or measured distances.
- Claims about archaeological discoveries, absolute years and links between travel and letter composition require a separate sourced study. They are not inferred from the presence of a marker.
- Independent historical and textual specialist review remains outstanding. The source and uncertainty register is visible on the page.

`tests/pauline-journeys.test.mjs` checks canonical passage boundaries, source-point alignment, licence and provenance metadata, known narrative distinctions and connector gaps. Browser interaction checks supplement these structural tests.
