import {validateCanonicalReference} from './reference-integrity.js';
/** Editor-selected study sequences rather than reconstructed timelines. */
export const PERSON_TRAILS=Object.freeze([
  {
    "personId": "abraham",
    "title": "Abraham: promise and family",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Call of Abram",
        "ref": "Genesis 12:1",
        "note": "Abram is told to depart and receives a promise."
      },
      {
        "label": "Promise and faith",
        "ref": "Genesis 15:6",
        "note": "Genesis associates Abram's trust with righteousness."
      },
      {
        "label": "Covenant sign",
        "ref": "Genesis 17:1",
        "note": "A new covenant stage is narrated."
      },
      {
        "label": "Isaac and the test",
        "ref": "Genesis 22:2",
        "note": "A difficult test is narrated; consult the whole passage."
      },
      {
        "label": "End of Abraham's life",
        "ref": "Genesis 25:8",
        "note": "Genesis records Abraham's death and burial context."
      }
    ]
  },
  {
    "personId": "moses",
    "title": "Moses: calling and covenant",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Early life",
        "ref": "Exodus 2:10",
        "note": "Moses is brought up in the Egyptian royal household."
      },
      {
        "label": "The burning bush",
        "ref": "Exodus 3:2",
        "note": "Moses encounters the burning bush and is called to lead Israel."
      },
      {
        "label": "Departure from Egypt",
        "ref": "Exodus 12:31",
        "note": "Pharaoh calls Moses and Aaron during the Exodus narrative."
      },
      {
        "label": "At Sinai",
        "ref": "Exodus 20:1",
        "note": "The covenant's commandments are presented to Israel."
      },
      {
        "label": "Death east of the Jordan",
        "ref": "Deuteronomy 34:5",
        "note": "Deuteronomy concludes the life of Moses."
      }
    ]
  },
  {
    "personId": "david-king",
    "title": "David: shepherd, king and covenant",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Anointing",
        "ref": "1 Samuel 16:12",
        "note": "Samuel is instructed to anoint David."
      },
      {
        "label": "Confrontation with Goliath",
        "ref": "1 Samuel 17:45",
        "note": "David confronts the Philistine champion."
      },
      {
        "label": "King over Israel",
        "ref": "2 Samuel 5:3",
        "note": "The elders acknowledge David as king."
      },
      {
        "label": "Dynastic promise",
        "ref": "2 Samuel 7:12",
        "note": "A promise concerning David's house and successor is conveyed."
      },
      {
        "label": "Nathan confronts David",
        "ref": "2 Samuel 12:13",
        "note": "David responds to the prophet after his wrongdoing."
      }
    ]
  },
  {
    "personId": "solomon-king",
    "title": "Solomon: wisdom and temple",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Request for wisdom",
        "ref": "1 Kings 3:9",
        "note": "Solomon asks for wisdom to govern."
      },
      {
        "label": "Temple construction",
        "ref": "1 Kings 6:1",
        "note": "Kings dates the beginning of temple construction."
      },
      {
        "label": "The ark enters the temple",
        "ref": "1 Kings 8:1",
        "note": "Leaders assemble to bring the ark into the temple."
      },
      {
        "label": "Visit of Sheba's queen",
        "ref": "1 Kings 10:1",
        "note": "A visiting queen tests Solomon with questions."
      },
      {
        "label": "Later compromise",
        "ref": "1 Kings 11:4",
        "note": "Kings evaluates the later religious direction of Solomon's reign."
      }
    ]
  },
  {
    "personId": "hezekiah",
    "title": "Hezekiah: Judah and Assyria",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Accession and reforms",
        "ref": "2 Kings 18:3",
        "note": "The narrative praises Hezekiah's religious reforms."
      },
      {
        "label": "Assyrian campaign",
        "ref": "2 Kings 18:13",
        "note": "Sennacherib's campaign against Judah is introduced."
      },
      {
        "label": "Petition in Jerusalem",
        "ref": "2 Kings 19:14",
        "note": "Hezekiah receives the Assyrian communication and prays."
      },
      {
        "label": "Jerusalem's deliverance account",
        "ref": "Isaiah 37:36",
        "note": "Isaiah describes the fate of the Assyrian army."
      },
      {
        "label": "Hezekiah's illness",
        "ref": "2 Kings 20:1",
        "note": "The narrative returns to Hezekiah's illness; chronological order is not fixed by this trail."
      }
    ]
  },
  {
    "personId": "esther",
    "title": "Esther: a Persian court narrative",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Esther made queen",
        "ref": "Esther 2:17",
        "note": "Esther is placed in the royal court."
      },
      {
        "label": "Mordecai's appeal",
        "ref": "Esther 4:14",
        "note": "Mordecai asks Esther to act in a time of danger."
      },
      {
        "label": "Approach to the king",
        "ref": "Esther 5:1",
        "note": "Esther enters the court against the risk described earlier."
      },
      {
        "label": "Appeal at the banquet",
        "ref": "Esther 7:3",
        "note": "Esther petitions for her life and her people."
      },
      {
        "label": "New royal decree",
        "ref": "Esther 8:8",
        "note": "A new royal decree is authorised within the narrative."
      }
    ]
  },
  {
    "personId": "paul-apostle",
    "title": "Paul: conversion and witness",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Encounter near Damascus",
        "ref": "Acts 9:3",
        "note": "Acts narrates Saul's encounter on the road to Damascus."
      },
      {
        "label": "Commission at Antioch",
        "ref": "Acts 13:2",
        "note": "Barnabas and Saul are commissioned to their work."
      },
      {
        "label": "Vision in Troas",
        "ref": "Acts 16:9",
        "note": "Acts describes a vision prompting travel to Macedonia."
      },
      {
        "label": "Athens address",
        "ref": "Acts 17:22",
        "note": "Paul addresses listeners at the Areopagus."
      },
      {
        "label": "Ministry in Rome",
        "ref": "Acts 28:30",
        "note": "Acts closes with Paul teaching in Rome."
      }
    ]
  },
  {
    "personId": "jesus",
    "title": "Jesus: a Gospel reading trail",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Baptism",
        "ref": "Matthew 3:16",
        "note": "Matthew narrates Jesus' baptism."
      },
      {
        "label": "Public proclamation",
        "ref": "Mark 1:14",
        "note": "Mark summarises the beginning of Jesus' preaching."
      },
      {
        "label": "Nazareth synagogue",
        "ref": "Luke 4:18",
        "note": "Luke presents Jesus reading prophetic Scripture."
      },
      {
        "label": "Last supper",
        "ref": "Matthew 26:26",
        "note": "Matthew records words spoken over bread."
      },
      {
        "label": "Appearance to disciples",
        "ref": "John 20:19",
        "note": "John recounts a post-resurrection appearance."
      }
    ]
  }
]);
const indexed=new Map(PERSON_TRAILS.map(x=>[x.personId,x]));
export function personTrail(id){return indexed.get(id)||null;}
export function validatePersonTrails(counts,personIds){
 const seen=new Set();
 for(const trail of PERSON_TRAILS){
  if(seen.has(trail.personId)||!personIds.has(trail.personId))throw Error('Duplicate/unknown person trail '+trail.personId);
  seen.add(trail.personId);
  if(!trail.title||!trail.qualification||trail.stages.length<3)throw Error('Incomplete person trail '+trail.personId);
  for(const s of trail.stages)if(!s.label||!s.note||!validateCanonicalReference(s.ref,counts))throw Error('Invalid person trail source '+trail.personId);
 }
 return true;
}
