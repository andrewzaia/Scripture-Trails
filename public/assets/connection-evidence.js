import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
import {ADDITIONAL_CONNECTION_EVIDENCE} from './connection-evidence-expanded.js?v=0.43.1';
/** Selective passage-linked editorial register. The 603k OpenBible links remain unclassified. */
export const CONNECTION_KINDS=Object.freeze({
  "quotation": "Direct quotation",
  "parallel": "Narrative parallel",
  "echo": "Literary echo",
  "typology": "Typology (interpretive)",
  "theme": "Thematic link"
});
export const CONNECTION_EVIDENCE=Object.freeze([
  {
    "id": "ce001",
    "from": "Genesis 1:1",
    "to": "John 1:1",
    "kind": "echo",
    "explanation": "John uses creation and light language in its opening account of the Word; Genesis narrates God creating.",
    "caution": "Retain echo, not quotation. The literary connection does not collapse the distinct claims of the two openings.",
    "context": "John 1:1-5",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce002",
    "from": "Genesis 15:6",
    "to": "Romans 4:3",
    "kind": "quotation",
    "explanation": "Romans explicitly cites Abraham's belief and credited righteousness while arguing about faith, works and circumcision.",
    "caution": "Genesis concerns the promised heir; later theological debates about justification are not settled by identifying the citation.",
    "context": "Romans 4:1-8",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce003",
    "from": "Genesis 15:6",
    "to": "James 2:23",
    "kind": "quotation",
    "explanation": "James cites the same Genesis verse in an argument that faith works with action, referring also to Abraham offering Isaac.",
    "caution": "Read Genesis 22 alongside this comparison. Paul and James have distinct rhetorical contexts; no comprehensive reconciliation is claimed.",
    "context": "James 2:18-26",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce004",
    "from": "Deuteronomy 8:3",
    "to": "Matthew 4:4",
    "kind": "quotation",
    "explanation": "Matthew reports Jesus quoting the wilderness lesson about dependence on God's word when tempted to make bread.",
    "caution": "Deuteronomy addresses Israel and its wilderness testing. Identifying the quotation does not reconstruct Jesus' exact spoken language.",
    "context": "Matthew 4:1-11",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce005",
    "from": "Deuteronomy 18:15",
    "to": "Acts 3:22",
    "kind": "quotation",
    "explanation": "Peter's speech cites the prophet-like-Moses promise and applies the prophetic expectation in its proclamation of Jesus.",
    "caution": "Deuteronomy also regulates listening to prophets and false prophecy. The later application does not erase that original setting.",
    "context": "Acts 3:18-26",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce006",
    "from": "Psalm 22:1",
    "to": "Matthew 27:46",
    "kind": "quotation",
    "explanation": "Matthew reports Jesus' cry using the opening of Psalm 22, a lament that later turns toward praise.",
    "caution": "Keep the lament audible. The quotation alone does not settle every theological interpretation of Jesus' cry; Psalm numbering differs across editions.",
    "context": "Matthew 27:45-50",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce007",
    "from": "Psalm 110:1",
    "to": "Matthew 22:44",
    "kind": "quotation",
    "explanation": "Matthew cites the enthronement language of Psalm 110:1 in Jesus' question about David's son and lord.",
    "caution": "The psalm's royal setting and its later messianic use are distinct interpretive questions; no independent authorship conclusion follows.",
    "context": "Matthew 22:41-46",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce008",
    "from": "Isaiah 7:14",
    "to": "Matthew 1:23",
    "kind": "quotation",
    "explanation": "Matthew cites Isaiah's sign in its account of Jesus' birth.",
    "caution": "The original setting in Isaiah and translation differences are relevant.",
    "context": "Matthew 1:18-25",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce009",
    "from": "Isaiah 40:3",
    "to": "John 1:23",
    "kind": "quotation",
    "explanation": "John the Baptist explicitly identifies his voice with Isaiah's wilderness proclamation in a scene distinguishing him from the Messiah.",
    "caution": "Isaiah addresses consolation and restoration. Punctuation and the placement of wilderness language differ between textual traditions and translations.",
    "context": "John 1:19-28",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce010",
    "from": "Isaiah 53:4",
    "to": "Matthew 8:17",
    "kind": "quotation",
    "explanation": "Matthew cites the servant's bearing of affliction in explaining Jesus' healing ministry.",
    "caution": "Compare the larger servant poem. This specific healing context must not silently be replaced with a claim that Matthew here narrates the crucifixion.",
    "context": "Matthew 8:14-17",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce011",
    "from": "Jeremiah 31:31",
    "to": "Hebrews 8:8",
    "kind": "quotation",
    "explanation": "Hebrews quotes Jeremiah's new-covenant promise within its discussion of Jesus' priestly ministry and the covenant.",
    "caution": "Jeremiah names Israel and Judah. The quotation does not by itself settle competing Christian accounts of Israel, covenant or supersessionism.",
    "context": "Hebrews 8:6-13",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce012",
    "from": "Joel 2:28",
    "to": "Acts 2:17",
    "kind": "quotation",
    "explanation": "Peter explicitly cites Joel in interpreting Pentecost, with language about the Spirit, prophecy and the day of the Lord.",
    "caution": "Joel 2:28-32 is numbered Joel 3:1-5 in some editions. Identifying the citation does not settle the timing of every cosmic sign.",
    "context": "Acts 2:14-21",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce013",
    "from": "Micah 5:2",
    "to": "Matthew 2:6",
    "kind": "quotation",
    "explanation": "Matthew's Bethlehem citation adapts Micah's ruler language and includes shepherd wording associated with 2 Samuel 5:2.",
    "caution": "This is a composite/adapted citation, not identical wording from Micah alone. The Gospel's application and Micah's original context both remain relevant.",
    "context": "Matthew 2:1-12",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce014",
    "from": "Isaiah 61:1",
    "to": "Luke 4:18",
    "kind": "quotation",
    "explanation": "Luke's Nazareth reading uses Isaiah 61:1-2 and liberation wording from Isaiah 58:6, followed by Jesus' fulfilment announcement.",
    "caution": "The composite reading is not a transcript of a single Hebrew passage. Reconstructing the spoken reading or scroll handling is outside this review.",
    "context": "Luke 4:16-21",
    "review": "scripture-context-screened",
    "basis": "Selected passage wording and immediate context rechecked in the dated citation register, batch connections-20-01; academic access limits recorded there. Independent specialist review pending."
  },
  {
    "id": "ce015",
    "from": "Genesis 1:1",
    "to": "Revelation 21:1",
    "kind": "theme",
    "explanation": "Genesis opens with God creating heaven and earth; Revelation envisions a renewed world and God dwelling with humanity. Brian J. Tabb points to Isaiah 65:17 as Revelation 21:1's more immediate scriptural background.",
    "caution": "Keep this broad creation theme distinct from a direct quotation of Genesis. The comparison does not settle how creation is renewed or supply a scientific chronology.",
    "context": "Revelation 21:1-5",
    "review": "scripture-context-screened",
    "basis": "Selected passages and named scholarly commentary checked in citation batch connections-20-03 on 2026-10-29. Source scope and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce016",
    "from": "Psalm 23:1",
    "to": "John 10:11",
    "kind": "theme",
    "explanation": "Psalm 23 pictures the Lord guiding and sustaining the speaker; John presents Jesus as the shepherd who gives his life for the flock. Meda Stamper places John's imagery within Israel's scriptural shepherd traditions.",
    "caution": "This is a thematic comparison, not a verbatim quotation. Preserve the psalm's own voice and John's setting after the conflict in John 9; the shared metaphor does not make the passages interchangeable.",
    "context": "John 10:11-18",
    "review": "scripture-context-screened",
    "basis": "Selected passages and named scholarly commentary checked in citation batch connections-20-03 on 2026-10-29. Source scope and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce017",
    "from": "Exodus 12:13",
    "to": "1 Corinthians 5:7",
    "kind": "typology",
    "explanation": "Paul describes Christ using Passover lamb imagery, inviting Christian typological interpretation.",
    "caution": "Typology does not mean Exodus directly names Jesus.",
    "context": "1 Corinthians 5:6-8",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce018",
    "from": "Matthew 6:9",
    "to": "Luke 11:2",
    "kind": "parallel",
    "explanation": "Matthew gives the prayer within teaching about private prayer and forgiveness; Luke introduces it through a disciple's request after Jesus prays. Jennifer S. Wyant notes Luke's shorter form and its framework of trust.",
    "caution": "Retain Matthew's additional petitions and the differing settings and debt/sin wording. Liturgical forms and manuscript variants require their own review. A narrative parallel does not supply one reconstructed verbatim prayer or make prayer a formula guaranteeing an outcome.",
    "context": "Luke 11:1-4",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-05 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce019",
    "from": "Mark 12:30",
    "to": "Matthew 22:37",
    "kind": "parallel",
    "explanation": "Both accounts join love of God with love of neighbour. Mark includes the Shema and an appreciative exchange with a scribe; Matthew introduces a question intended to test Jesus. Amanda Brobst-Renaud stresses Mark's Jewish setting and the scribe's positive role.",
    "caution": "Keep the different introductions, responses and lists of faculties visible. Jesus and his interlocutors discuss Jewish Scripture; this is not a contrast between Christian love and a supposedly loveless Judaism. The parallel does not establish identical wording or independent eyewitness reports.",
    "context": "Matthew 22:34-40",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-05 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce020",
    "from": "2 Kings 18:13",
    "to": "Isaiah 36:1",
    "kind": "parallel",
    "explanation": "Kings and Isaiah share the invasion notice and the approach to Jerusalem. Kings also includes Hezekiah's tribute payment before the delegation; Isaiah moves directly to the Rabshakeh. Ray Ortlund identifies the larger parallel narrative.",
    "caution": "Preserve the tribute passage in Kings and the different narrative scope. Shared biblical wording does not establish independent historical confirmation, exact source dependence or an independently verified chronology.",
    "context": "Isaiah 36:1-3",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-04 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce021",
    "from": "1 Kings 8:1",
    "to": "2 Chronicles 5:2",
    "kind": "parallel",
    "explanation": "Both accounts bring the ark into the inner sanctuary and describe the cloud interrupting priestly service. Chronicles expands the musicians and united praise. Cameron B.R. Howard discusses the ark transfer and divine presence in Kings.",
    "caution": "Kings names priests carrying the ark; Chronicles names Levites and levitical priests. Preserve the differing personnel and musical emphasis. This literary comparison does not reconstruct the ark or supply external evidence of the ceremony.",
    "context": "2 Chronicles 5:2-14",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-04 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce022",
    "from": "2 Samuel 7:12",
    "to": "Luke 1:32",
    "kind": "echo",
    "explanation": "Luke's annunciation describes David's throne and an enduring kingdom, recalling the dynastic promise in Samuel.",
    "caution": "Retain echo, not direct quotation. Samuel's immediate dynastic setting and Luke's application should not be flattened into one speech.",
    "context": "Luke 1:26-33",
    "review": "scripture-context-screened",
    "basis": "Selected passages plus named scholarly commentary checked at the scope recorded in citation follow-up connections-support-01. Wider literature and textual questions remain open. Independent specialist review pending."
  },
  {
    "id": "ce023",
    "from": "Acts 9:3",
    "to": "Acts 22:6",
    "kind": "parallel",
    "explanation": "Acts 9 narrates Saul's encounter and Ananias's role; Acts 22 retells them in Paul's defence speech, with different emphases. Raj Nadella cautions against treating the encounter as a triumphalist rejection of Judaism.",
    "caution": "The companions' hearing is described differently in Acts 9:7 and 22:9; translation and Greek-language questions are not silently harmonised here. Both accounts belong to Acts, not two independent historical witnesses. The selected commentary addresses Acts 9's interpretation, not a full comparison of every retelling.",
    "context": "Acts 22:6-16",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-05 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  },
  {
    "id": "ce024",
    "from": "Exodus 3:2",
    "to": "Acts 7:30",
    "kind": "parallel",
    "explanation": "Stephen's speech retells Moses's encounter with the angel, divine voice and holy ground, then his commission to Egypt. Exodus narrates that call directly. Alan J. Thompson highlights God's presence with Moses in the wilderness.",
    "caution": "Acts condenses the Exodus narrative and places it within Stephen's defence; its forty-year framing and rhetorical purpose remain distinct. A later retelling is not independent confirmation of the event, a location identification or a verbatim transcript of Stephen's speech.",
    "context": "Acts 7:30-35",
    "review": "scripture-context-screened",
    "basis": "Selected passages and scoped named commentary checked in citation batch connections-20-05 on 2026-10-29. Access limits and remaining questions recorded there. Independent specialist review pending."
  }
,
 ...ADDITIONAL_CONNECTION_EVIDENCE
]);
export const REVIEW_LABELS=Object.freeze({
 "scripture-context-screened":"Internal passage comparison (not external peer review)",
 "editorial-reading-aid":"Editorial reading aid - detailed textual review pending"
});
const canonical=value=>parseRef(value)?.formatted||null;
const key=(a,b)=>[canonical(a),canonical(b)].sort().join('|');
const lookup=new Map();
for(const entry of CONNECTION_EVIDENCE){const k=key(entry.from,entry.to);if(lookup.has(k))throw Error('Duplicate connection evidence: '+k);lookup.set(k,entry);}
export function explainConnection(from,to){return lookup.get(key(from,to))||null;}
/** Passage association, not an assertion that a person appears in each verse. */
export function connectionsForPassages(passages,counts,limit=8){
 if(!Array.isArray(passages)||!counts)return [];
 const scopes=passages.map(p=>validateCanonicalReference(p,counts)).filter(Boolean);
 const contains=(anchor,scope)=>{
  const p=validateCanonicalReference(anchor,counts);if(!p||p.book!==scope.book)return false;
  const pos=(c,v)=>c*1000+v;
  return pos(scope.startChapter,scope.startVerse??1)<=pos(p.startChapter,p.startVerse??1)
   && pos(p.startChapter,p.startVerse??1)<=pos(scope.endChapter,scope.endVerse??counts[scope.book][scope.endChapter-1]);
 };
 return CONNECTION_EVIDENCE.filter(e=>scopes.some(scope=>contains(e.from,scope)||contains(e.to,scope))).slice(0,limit);
}
export function validateConnectionEvidence(counts){
 const ids=new Set(),pairs=new Set();
 for(const e of CONNECTION_EVIDENCE){
  if(ids.has(e.id)||pairs.has(key(e.from,e.to)))throw Error('Duplicate evidence identifier '+e.id);
  ids.add(e.id);pairs.add(key(e.from,e.to));
  if(!CONNECTION_KINDS[e.kind]||!e.explanation||!e.caution||!e.context||!REVIEW_LABELS[e.review]||!e.basis)throw Error('Incomplete evidence '+e.id);
  for(const ref of [e.from,e.to,e.context])if(!validateCanonicalReference(ref,counts))throw Error('Invalid evidence reference '+e.id+': '+ref);
 }return true;
}
