import {validateCanonicalReference} from './reference-integrity.js';
export const TRAIL_REVIEW_LABELS=Object.freeze({'editorial-reading-aid':'Editorial reading aid - independent specialist review pending'});
export const TRAIL_SOURCE_LABELS=Object.freeze({'primary-scripture':'Primary Scripture passage'});
/** Selected study sequences, not reconstructed biographies or externally reviewed histories. */
export const PERSON_TRAILS=Object.freeze([
  {
    "personId": "abraham",
    "title": "Abraham: promise and family",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Call of Abram",
        "ref": "Genesis 12:1",
        "note": "Abram is told to depart and receives a promise.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Promise and faith",
        "ref": "Genesis 15:6",
        "note": "Genesis associates Abram's trust with righteousness.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Covenant sign",
        "ref": "Genesis 17:1",
        "note": "A new covenant stage is narrated.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Isaac and the test",
        "ref": "Genesis 22:2",
        "note": "A difficult test is narrated; consult the whole passage.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "End of Abraham's life",
        "ref": "Genesis 25:8",
        "note": "Genesis records Abraham's death and burial context.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "moses",
    "title": "Moses: calling and covenant",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Early life",
        "ref": "Exodus 2:10",
        "note": "Moses is brought up in the Egyptian royal household.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The burning bush",
        "ref": "Exodus 3:2",
        "note": "Moses encounters the burning bush and is called to lead Israel.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Departure from Egypt",
        "ref": "Exodus 12:31",
        "note": "Pharaoh calls Moses and Aaron during the Exodus narrative.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "At Sinai",
        "ref": "Exodus 20:1",
        "note": "The covenant's commandments are presented to Israel.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Death east of the Jordan",
        "ref": "Deuteronomy 34:5",
        "note": "Deuteronomy concludes the life of Moses.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "david-king",
    "title": "David: shepherd, king and covenant",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Anointing",
        "ref": "1 Samuel 16:12",
        "note": "Samuel is instructed to anoint David.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Confrontation with Goliath",
        "ref": "1 Samuel 17:45",
        "note": "David confronts the Philistine champion.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "King over Israel",
        "ref": "2 Samuel 5:3",
        "note": "The elders acknowledge David as king.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Dynastic promise",
        "ref": "2 Samuel 7:12",
        "note": "A promise concerning David's house and successor is conveyed.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Nathan confronts David",
        "ref": "2 Samuel 12:13",
        "note": "David responds to the prophet after his wrongdoing.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "solomon-king",
    "title": "Solomon: wisdom and temple",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Request for wisdom",
        "ref": "1 Kings 3:9",
        "note": "Solomon asks for wisdom to govern.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Temple construction",
        "ref": "1 Kings 6:1",
        "note": "Kings dates the beginning of temple construction.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The ark enters the temple",
        "ref": "1 Kings 8:1",
        "note": "Leaders assemble to bring the ark into the temple.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Visit of Sheba's queen",
        "ref": "1 Kings 10:1",
        "note": "A visiting queen tests Solomon with questions.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Later compromise",
        "ref": "1 Kings 11:4",
        "note": "Kings evaluates the later religious direction of Solomon's reign.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "hezekiah",
    "title": "Hezekiah: Judah and Assyria",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Accession and reforms",
        "ref": "2 Kings 18:3",
        "note": "The narrative praises Hezekiah's religious reforms.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Assyrian campaign",
        "ref": "2 Kings 18:13",
        "note": "Sennacherib's campaign against Judah is introduced.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Petition in Jerusalem",
        "ref": "2 Kings 19:14",
        "note": "Hezekiah receives the Assyrian communication and prays.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Jerusalem's deliverance account",
        "ref": "Isaiah 37:36",
        "note": "Isaiah describes the fate of the Assyrian army.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Hezekiah's illness",
        "ref": "2 Kings 20:1",
        "note": "The narrative returns to Hezekiah's illness; chronological order is not fixed by this trail.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "esther",
    "title": "Esther: a Persian court narrative",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Esther made queen",
        "ref": "Esther 2:17",
        "note": "Esther is placed in the royal court.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Mordecai's appeal",
        "ref": "Esther 4:14",
        "note": "Mordecai asks Esther to act in a time of danger.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Approach to the king",
        "ref": "Esther 5:1",
        "note": "Esther enters the court against the risk described earlier.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Appeal at the banquet",
        "ref": "Esther 7:3",
        "note": "Esther petitions for her life and her people.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "New royal decree",
        "ref": "Esther 8:8",
        "note": "A new royal decree is authorised within the narrative.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "paul-apostle",
    "title": "Paul: conversion and witness",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Encounter near Damascus",
        "ref": "Acts 9:3",
        "note": "Acts narrates Saul's encounter on the road to Damascus.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Commission at Antioch",
        "ref": "Acts 13:2",
        "note": "Barnabas and Saul are commissioned to their work.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Vision in Troas",
        "ref": "Acts 16:9",
        "note": "Acts describes a vision prompting travel to Macedonia.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Athens address",
        "ref": "Acts 17:22",
        "note": "Paul addresses listeners at the Areopagus.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Ministry in Rome",
        "ref": "Acts 28:30",
        "note": "Acts closes with Paul teaching in Rome.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "New Testament",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "jesus",
    "title": "Jesus: a Gospel reading trail",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "stages": [
      {
        "label": "Baptism",
        "ref": "Matthew 3:16",
        "note": "Matthew narrates Jesus' baptism.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Public proclamation",
        "ref": "Mark 1:14",
        "note": "Mark summarises the beginning of Jesus' preaching.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Nazareth synagogue",
        "ref": "Luke 4:18",
        "note": "Luke presents Jesus reading prophetic Scripture.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Last supper",
        "ref": "Matthew 26:26",
        "note": "Matthew records words spoken over bread.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Appearance to disciples",
        "ref": "John 20:19",
        "note": "John recounts a post-resurrection appearance.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "New Testament",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid"
  },
  {
    "personId": "ruth-moabite",
    "title": "Ruth: loyalty and a family future",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "Read the kinship and family setting in Ruth before applying later theological interpretations. This selection does not establish an independent chronology.",
    "stages": [
      {
        "label": "Remaining with Naomi",
        "ref": "Ruth 1:6-18",
        "note": "Ruth chooses to remain with Naomi as Naomi prepares to return from Moab.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Gleaning in the field",
        "ref": "Ruth 2:1-13",
        "note": "The narrative introduces Boaz and his protection of Ruth while she gathers grain.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The threshing-floor request",
        "ref": "Ruth 3:1-13",
        "note": "Ruth appeals to Boaz within the story's kinship obligations; he identifies a nearer relative.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "A family future",
        "ref": "Ruth 4:1-17",
        "note": "A public arrangement precedes Ruth's marriage to Boaz and the birth of Obed.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "hannah-samuel",
    "title": "Hannah: lament, prayer and dedication",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "Hannah's experience is a particular narrative, not a promise that every prayer for a child has the same outcome. Her song is poetry within that narrative.",
    "stages": [
      {
        "label": "Prayer in distress",
        "ref": "1 Samuel 1:1-20",
        "note": "Hannah brings her distress to the sanctuary; the account then narrates Samuel's birth.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Dedicating Samuel",
        "ref": "1 Samuel 1:21-28",
        "note": "After Samuel is weaned, Hannah presents him at Shiloh in fulfilment of her vow.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Hannah's song",
        "ref": "1 Samuel 2:1-10",
        "note": "The song celebrates divine power and the reversal of human fortunes.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Continued care",
        "ref": "1 Samuel 2:18-21",
        "note": "Hannah brings Samuel a garment during annual visits, and the narrative describes her growing family.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "samuel-prophet",
    "title": "Samuel: listening and leadership",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "These selections move between episodes about prophecy and kingship. They do not resolve differing perspectives on monarchy or reconstruct every intervening event.",
    "stages": [
      {
        "label": "Called at Shiloh",
        "ref": "1 Samuel 3:1-21",
        "note": "Samuel receives a message about Eli's household and becomes recognised as a prophet.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Assembly at Mizpah",
        "ref": "1 Samuel 7:3-13",
        "note": "Samuel calls Israel to turn from other gods and intercedes during a Philistine threat.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The demand for a king",
        "ref": "1 Samuel 8:1-22",
        "note": "Samuel hears the elders' request and warns about the demands of royal rule.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "David is anointed",
        "ref": "1 Samuel 16:1-13",
        "note": "Samuel goes to Jesse's household and anoints David.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "elijah",
    "title": "Elijah: provision, confrontation and calling",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "Kings presents prophetic and miracle narratives. Their inclusion is not independent archaeological verification, and this sequence supplies no exact travel route.",
    "stages": [
      {
        "label": "Drought and provision",
        "ref": "1 Kings 17:1-16",
        "note": "The drought announcement is followed by accounts of provision at a brook and at a widow's home.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The challenge at Carmel",
        "ref": "1 Kings 18:20-39",
        "note": "Elijah challenges the prophets of Baal, and the account describes the people's response.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Flight and renewed commission",
        "ref": "1 Kings 19:1-18",
        "note": "After a threat, Elijah travels into the wilderness and receives a renewed commission at Horeb.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Elijah and Elisha part",
        "ref": "2 Kings 2:1-12",
        "note": "Elisha remains with Elijah as the narrative approaches Elijah's departure.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "elisha",
    "title": "Elisha: succession and service",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "Elisha is distinct from Elijah. These stories describe the narrative's claims about prophetic ministry; they are not medical instructions or independent evidence for each reported miracle.",
    "stages": [
      {
        "label": "Leaving the plough",
        "ref": "1 Kings 19:19-21",
        "note": "Elijah encounters Elisha at work, and Elisha leaves to follow him.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "After Elijah's departure",
        "ref": "2 Kings 2:1-15",
        "note": "Elisha asks for a share in Elijah's spirit and returns across the Jordan after the departure account.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The widow's oil",
        "ref": "2 Kings 4:1-7",
        "note": "Elisha responds to a widow's debt crisis in an account centred on vessels of oil.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Naaman and the Jordan",
        "ref": "2 Kings 5:1-19",
        "note": "Naaman's encounter includes an Israelite girl's advice, Elisha's instruction and Naaman's response.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "jeremiah",
    "title": "Jeremiah: warning and hope in crisis",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "The book is not arranged as a simple diary. The letter addresses an exiled community; its promise should not be detached into a guarantee of individual prosperity.",
    "stages": [
      {
        "label": "A prophetic calling",
        "ref": "Jeremiah 1:1-10",
        "note": "The opening locates Jeremiah's ministry and narrates his calling despite his hesitation.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The temple sermon",
        "ref": "Jeremiah 7:1-15",
        "note": "The message challenges confidence in the temple when conduct remains unjust.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "A letter to the exiles",
        "ref": "Jeremiah 29:1-14",
        "note": "The letter calls the exiles to live in Babylon while awaiting the restoration described in its message.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Buying a field",
        "ref": "Jeremiah 32:1-15",
        "note": "While Jerusalem is under siege, Jeremiah purchases a field as the narrative points toward restoration.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "daniel",
    "title": "Daniel: faithfulness in court narratives",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "These are selected court narratives, not a resolution of the book's composition date or disputed royal identifications. Daniel is not named among the three men in chapter 3.",
    "stages": [
      {
        "label": "Training in Babylon",
        "ref": "Daniel 1:1-21",
        "note": "Daniel and his companions face questions of food and service in the royal court.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Prayer over the king's mystery",
        "ref": "Daniel 2:14-23",
        "note": "Daniel asks for time, seeks mercy with his companions and gives thanks after the mystery is revealed.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The writing at the feast",
        "ref": "Daniel 5:13-31",
        "note": "Daniel addresses Belshazzar and interprets the writing in the narrative's account of the kingdom's fall.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Prayer and the lions' den",
        "ref": "Daniel 6:1-23",
        "note": "The account places Daniel's continued prayer under a royal prohibition and narrates his deliverance.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "nehemiah-governor",
    "title": "Nehemiah: prayer and rebuilding",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "Hebrew Bible",
    "caution": "These selections follow the book's presentation and do not establish modern territorial claims. Ezra and the community are central participants in the final reading.",
    "stages": [
      {
        "label": "News from Jerusalem",
        "ref": "Nehemiah 1:1-11",
        "note": "Nehemiah responds to news about Jerusalem with mourning, confession and prayer.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Permission to return",
        "ref": "Nehemiah 2:1-10",
        "note": "Nehemiah requests royal permission and letters before travelling toward Judah.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Opposition and completion",
        "ref": "Nehemiah 6:1-16",
        "note": "The narrative describes intimidation, an attempted trap and the completion of the wall.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Listening to the law",
        "ref": "Nehemiah 8:1-12",
        "note": "Ezra reads the law to the assembly; Nehemiah and other leaders address the people's response.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "mary-mother",
    "title": "Mary, mother of Jesus: response and witness",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "New Testament",
    "caution": "This Mary is distinct from Mary Magdalene and Mary of Bethany. The selection combines Luke and John for reading, without claiming to harmonise all Gospel accounts.",
    "stages": [
      {
        "label": "Gabriel's announcement",
        "ref": "Luke 1:26-38",
        "note": "Luke narrates Gabriel's announcement to Mary and her response.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Visiting Elizabeth",
        "ref": "Luke 1:39-56",
        "note": "The visit to Elizabeth leads into the song attributed to Mary.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The birth and the shepherds",
        "ref": "Luke 2:1-20",
        "note": "Luke presents Jesus' birth, the shepherds' visit and Mary's reflection on what is reported.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Near the cross",
        "ref": "John 19:25-27",
        "note": "John places Jesus' mother near the cross and records words concerning her and the beloved disciple.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "peter",
    "title": "Peter: calling, confession and witness",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "New Testament",
    "caution": "Different Gospel accounts are retained as distinct sources. The selection does not settle interpretations of Matthew's language about the rock, keys or church authority.",
    "stages": [
      {
        "label": "The catch and the call",
        "ref": "Luke 5:1-11",
        "note": "Luke connects Simon Peter's response to Jesus with a catch of fish and a call to follow.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Confession and correction",
        "ref": "Matthew 16:13-23",
        "note": "Peter's confession is followed by Jesus' rebuke when Peter resists the announced suffering.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "A renewed charge",
        "ref": "John 21:15-19",
        "note": "John presents Jesus questioning Peter and charging him with care for the flock.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "At Cornelius' household",
        "ref": "Acts 10:34-48",
        "note": "Peter speaks in a Gentile household, and Acts narrates the gift of the Spirit and baptism.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "john-baptist",
    "title": "John the Baptist: preparation and testimony",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "New Testament",
    "caution": "John the Baptist is distinct from John the apostle. Mark 6 recalls an earlier execution; this trail does not turn the Gospel's presentation order into exact event dates.",
    "stages": [
      {
        "label": "Birth and naming",
        "ref": "Luke 1:57-80",
        "note": "Luke narrates John's birth and naming, followed by Zechariah's prophetic song.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Preparing the way",
        "ref": "Mark 1:1-8",
        "note": "Mark introduces John's wilderness preaching and his announcement of one coming after him.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Testimony about Jesus",
        "ref": "John 1:19-34",
        "note": "John's account distinguishes the Baptist's role and records his testimony about Jesus.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "The recalled execution",
        "ref": "Mark 6:14-29",
        "note": "Herod's reaction to reports about Jesus introduces Mark's recollection of John's imprisonment and execution.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  },
  {
    "personId": "barnabas",
    "title": "Barnabas: generosity and partnership",
    "qualification": "Selected study sequence anchored in biblical texts; it is not a full biography, a harmonised timeline or independent historical proof.",
    "corpus": "New Testament",
    "caution": "This selection follows Acts and is not a complete account of Barnabas' life. The disagreement about Mark does not by itself establish everything either leader later thought or did.",
    "stages": [
      {
        "label": "A gift to the community",
        "ref": "Acts 4:32-37",
        "note": "Acts identifies Barnabas as Joseph, a Levite from Cyprus, and describes his gift from a field sale.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Introducing Saul",
        "ref": "Acts 9:26-30",
        "note": "Barnabas brings Saul to the apostles when the Jerusalem disciples are afraid of him.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Encouragement at Antioch",
        "ref": "Acts 11:19-26",
        "note": "Barnabas is sent to Antioch and brings Saul from Tarsus to share in teaching there.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      },
      {
        "label": "Disagreement over Mark",
        "ref": "Acts 15:36-41",
        "note": "Barnabas and Paul disagree about taking Mark, and Acts describes their separate departures.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "review": "editorial-reading-aid"
  }
]);
const indexed=new Map(PERSON_TRAILS.map(x=>[x.personId,x]));
export function personTrail(id){return indexed.get(id)||null;}
export function findPersonTrails(query='',corpus='all'){
 const fold=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=fold(query.trim());
 return PERSON_TRAILS.filter(t=>(corpus==='all'||t.corpus===corpus)&&fold([t.title,t.personId,t.corpus,...t.stages.flatMap(s=>[s.label,s.ref,s.note])].join(' ')).includes(q));
}
export function validatePersonTrails(counts,personIds,trails=PERSON_TRAILS){
 const seen=new Set();
 for(const trail of trails){
  if(seen.has(trail.personId)||!personIds.has(trail.personId))throw Error('Duplicate/unknown person trail '+trail.personId);
  seen.add(trail.personId);
  if(!trail.title||!trail.qualification||!trail.caution||!['Hebrew Bible','New Testament'].includes(trail.corpus)||!Object.hasOwn(TRAIL_REVIEW_LABELS,trail.review)||!Array.isArray(trail.stages)||trail.stages.length<3)throw Error('Incomplete person trail '+trail.personId);
  const refs=new Set();
  for(const s of trail.stages){const ref=validateCanonicalReference(s.ref,counts);if(!s.label||!s.note||!ref||ref.startVerse===null||ref.startChapter!==ref.endChapter||ref.endVerse-ref.startVerse>=30||!Object.hasOwn(TRAIL_SOURCE_LABELS,s.source)||!Object.hasOwn(TRAIL_REVIEW_LABELS,s.review)||refs.has(s.ref))throw Error('Invalid person trail source '+trail.personId);refs.add(s.ref);}
 }
 return true;
}
