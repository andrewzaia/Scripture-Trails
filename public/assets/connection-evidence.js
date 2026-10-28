import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
import {ADDITIONAL_CONNECTION_EVIDENCE} from './connection-evidence-expanded.js?v=0.18.0';
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
    "explanation": "John opens with wording reminiscent of the opening of Genesis, connecting its prologue to creation language.",
    "caution": "Literary comparison, not a word-for-word quotation.",
    "context": "John 1:1-5",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce002",
    "from": "Genesis 15:6",
    "to": "Romans 4:3",
    "kind": "quotation",
    "explanation": "Paul quotes Genesis 15:6 in a discussion of Abraham and faith.",
    "caution": "Paul's argument is distinct from the Genesis narrative.",
    "context": "Romans 4:1-8",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce003",
    "from": "Genesis 15:6",
    "to": "James 2:23",
    "kind": "quotation",
    "explanation": "James cites Genesis 15:6 while discussing Abraham's faith and actions.",
    "caution": "James and Paul use the same citation in different arguments.",
    "context": "James 2:18-26",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce004",
    "from": "Deuteronomy 8:3",
    "to": "Matthew 4:4",
    "kind": "quotation",
    "explanation": "Matthew reports Jesus quoting Deuteronomy during the wilderness temptation.",
    "caution": "The original address to Israel remains the context of Deuteronomy.",
    "context": "Matthew 4:1-11",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce005",
    "from": "Deuteronomy 18:15",
    "to": "Acts 3:22",
    "kind": "quotation",
    "explanation": "Peter's speech quotes the promise of a prophet like Moses.",
    "caution": "Acts makes a Christian application of the Deuteronomy passage.",
    "context": "Acts 3:18-26",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce006",
    "from": "Psalm 22:1",
    "to": "Matthew 27:46",
    "kind": "quotation",
    "explanation": "Matthew reports Jesus speaking the opening words of Psalm 22.",
    "caution": "Read the remainder of the lament as well.",
    "context": "Matthew 27:45-50",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce007",
    "from": "Psalm 110:1",
    "to": "Matthew 22:44",
    "kind": "quotation",
    "explanation": "Jesus quotes Psalm 110 in a discussion about David and the Messiah.",
    "caution": "This is an interpretive argument in Matthew's narrative.",
    "context": "Matthew 22:41-46",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
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
    "explanation": "John the Baptist identifies his role with a voice described by Isaiah.",
    "caution": "The original Isaiah context concerns consolation and restoration.",
    "context": "John 1:19-28",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce010",
    "from": "Isaiah 53:4",
    "to": "Matthew 8:17",
    "kind": "quotation",
    "explanation": "Matthew cites Isaiah when explaining Jesus' healing activity.",
    "caution": "The larger servant passage should also be consulted.",
    "context": "Matthew 8:14-17",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce011",
    "from": "Jeremiah 31:31",
    "to": "Hebrews 8:8",
    "kind": "quotation",
    "explanation": "Hebrews quotes the covenant promise recorded by Jeremiah.",
    "caution": "Hebrews develops a particular interpretation of that promise.",
    "context": "Hebrews 8:6-13",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce012",
    "from": "Joel 2:28",
    "to": "Acts 2:17",
    "kind": "quotation",
    "explanation": "Peter quotes Joel's prophetic passage in the Pentecost speech.",
    "caution": "Acts applies the words to the event it narrates.",
    "context": "Acts 2:14-21",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce013",
    "from": "Micah 5:2",
    "to": "Matthew 2:6",
    "kind": "quotation",
    "explanation": "Matthew cites Micah concerning Bethlehem in its infancy narrative.",
    "caution": "Matthew's wording adapts and interprets the prophetic text.",
    "context": "Matthew 2:1-12",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce014",
    "from": "Isaiah 61:1",
    "to": "Luke 4:18",
    "kind": "quotation",
    "explanation": "Luke portrays Jesus reading from Isaiah in Nazareth.",
    "caution": "The reading combines Isaianic language; translations can differ.",
    "context": "Luke 4:16-21",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce015",
    "from": "Genesis 1:1",
    "to": "Revelation 21:1",
    "kind": "theme",
    "explanation": "Both passages concern creation, while Revelation describes a new creation.",
    "caution": "This is a theological comparison, not an explicit quotation.",
    "context": "Revelation 21:1-5",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce016",
    "from": "Psalm 23:1",
    "to": "John 10:11",
    "kind": "theme",
    "explanation": "The shepherd image appears in the psalm and in Jesus' teaching.",
    "caution": "Shared imagery does not prove a direct quotation.",
    "context": "John 10:1-18",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
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
    "explanation": "Matthew and Luke preserve related forms of prayer attributed to Jesus.",
    "caution": "The two accounts differ in setting and wording.",
    "context": "Luke 11:1-4",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce019",
    "from": "Mark 12:30",
    "to": "Matthew 22:37",
    "kind": "parallel",
    "explanation": "Mark and Matthew narrate related teachings about loving God.",
    "caution": "Compare the surrounding narrative differences.",
    "context": "Matthew 22:34-40",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce020",
    "from": "2 Kings 18:13",
    "to": "Isaiah 36:1",
    "kind": "parallel",
    "explanation": "Both books introduce Sennacherib's invasion of Judah in Hezekiah's reign.",
    "caution": "Overlapping biblical accounts do not provide independent confirmation.",
    "context": "Isaiah 36:1-3",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce021",
    "from": "1 Kings 8:1",
    "to": "2 Chronicles 5:2",
    "kind": "parallel",
    "explanation": "Kings and Chronicles recount the assembly to bring the ark into Solomon's temple.",
    "caution": "Chronicles retells events using its own literary emphasis.",
    "context": "2 Chronicles 5:2-14",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce022",
    "from": "2 Samuel 7:12",
    "to": "Luke 1:32",
    "kind": "echo",
    "explanation": "Luke's annunciation uses Davidic royal language related to the dynastic promise of 2 Samuel.",
    "caution": "This is an intertextual reading, not an exact citation.",
    "context": "Luke 1:26-33",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce023",
    "from": "Acts 9:3",
    "to": "Acts 22:6",
    "kind": "parallel",
    "explanation": "Acts tells the Damascus road encounter twice, with different narrative perspectives.",
    "caution": "Details differ between the retellings.",
    "context": "Acts 22:6-16",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
  {
    "id": "ce024",
    "from": "Exodus 3:2",
    "to": "Acts 7:30",
    "kind": "parallel",
    "explanation": "Stephen's speech retells the story of Moses at the burning bush.",
    "caution": "A later narrative retelling is not independent historical proof.",
    "context": "Acts 7:30-34",
    "review": "scripture-context-screened",
    "basis": "Editorial comparison of cited passages; external specialist review pending"
  },
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
