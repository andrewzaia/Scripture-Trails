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
        "ref": "Genesis 17:9-14",
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
        "ref": "Genesis 25:8-10",
        "note": "Genesis records Abraham's death and burial context.",
        "source": "primary-scripture",
        "review": "editorial-reading-aid"
      }
    ],
    "corpus": "Hebrew Bible",
    "caution": "Keep each passage in its literary context. This selected sequence does not independently establish dates, routes or the historicity of each narrated event.",
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Genesis places Abram's call within the story of scattered nations, then follows a family living between promises and delayed fulfilment. Genesis 12 begins the journey; chapter 15 relates trust to righteousness; chapter 17 turns to covenant signs and family responsibility. Chapter 22 presents a severe test whose outcome should be read in the complete narrative rather than reduced to a detached moral lesson. The death notice in chapter 25 closes one life while the promises continue beyond it.",
      "comparison": "Read Genesis 15:6 before comparing Paul's and James's later uses of Abraham. Their arguments address different questions and should not be collapsed into a slogan that erases the earlier story.",
      "question": "What does the narrator show Abraham receiving, doing and still waiting for at each stage?",
      "limits": "The sequence follows Genesis's narrated family history; it is not an independently dated migration record or a verdict on every historical question.",
      "furtherRefs": [
        "Genesis 15:1-6",
        "Romans 4:1-5",
        "James 2:21-24"
      ],
      "research": []
    }
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
        "ref": "Exodus 3:2-10",
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
        "ref": "Exodus 20:1-17",
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Exodus introduces Moses in a setting of oppression, vulnerability and contested allegiance before depicting his commission at the burning bush. The departure account centres God's action on Israel's behalf; the Sinai section turns liberation into communal obligations and a covenantal way of life. Deuteronomy 34 closes the biblical account of Moses outside the promised land, leaving the next generation to continue. Follow the development from reluctant messenger to lawgiver rather than treating each scene as one seamless speech.",
      "comparison": "Read the bush commission in Exodus 3 alongside the covenant proclamation in Exodus 20, paying attention to the different audiences and purposes of the two texts.",
      "question": "Where does Moses act as an intermediary, and where does the narrative insist that God is the central actor?",
      "limits": "Biblical sequencing does not resolve the absolute date of the Exodus, the itinerary's disputed geography or the historicity of each reported event.",
      "furtherRefs": [
        "Exodus 3:7-15",
        "Deuteronomy 6:4-9",
        "Numbers 27:12-23"
      ],
      "research": []
    }
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
        "ref": "2 Samuel 7:12-16",
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "First Samuel introduces David through his selection and his confrontation with a Philistine warrior, while Second Samuel traces the transition from competing claimants to monarchy in Jerusalem. The dynastic promise of 2 Samuel 7 gives the account its future-facing dimension. Nathan's confrontation after David's abuse of power forces readers to hold the royal promises alongside the consequences of injustice. A faithful reading must not make the shepherd-king immune to moral criticism merely because he is central to later biblical expectations.",
      "comparison": "Compare the promise concerning David's house in 2 Samuel 7 with Nathan's accusation in 2 Samuel 12. Dynastic election does not erase accountability.",
      "question": "How do the narratives distinguish effective leadership, covenant obligation and personal misconduct?",
      "limits": "The historical scale of early Judah and the identification of material remains with David are subjects of archaeological debate, separate from the biblical narrative.",
      "furtherRefs": [
        "2 Samuel 7:8-16",
        "Psalm 51:1-12",
        "1 Kings 2:1-4"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Kings first portrays Solomon asking for discernment, then describes a major building programme and the dedication of the Temple. The Queen of Sheba episode depicts the far-reaching reputation of his wisdom, but the same narrative later describes his religious compromise. Reading only the beginning creates an idealised portrait that the book itself challenges. The Temple dedication should be studied as a theological account of worship and covenantal responsibility, not simply as proof that every dimension or building phase is independently verified.",
      "comparison": "Place Solomon's petition in 1 Kings 3 beside the warnings and failures of 1 Kings 11. Ask whether wisdom is being described as a permanent possession or a responsibility requiring faithful action.",
      "question": "What changes between Solomon's request to govern well and the book's assessment of his later reign?",
      "limits": "Exact construction dates and attribution of excavated architectural remains are debated; the account's chronology should not be presented as independently established archaeology.",
      "furtherRefs": [
        "1 Kings 3:4-15",
        "1 Kings 8:22-30",
        "1 Kings 11:1-13"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Hezekiah appears at the intersection of religious reform, Assyrian imperial pressure and the survival of Jerusalem. The narrative in Kings should be read beside Isaiah's account of diplomatic threats and prophetic counsel, while the Assyrian royal inscriptions provide an outside account of the campaign. Those sources have different aims and cannot simply be treated as identical descriptions. Hezekiah's later illness and response create a more complicated portrait than a military escape story alone.",
      "comparison": "Compare the siege account in 2 Kings 18-19 with Isaiah 36-37 and keep Sennacherib's recorded imperial claims separate from both biblical presentations.",
      "question": "Which claims are narrated by Judah's historians, which belong to Assyrian royal propaganda, and what overlap can be documented?",
      "limits": "An Assyrian campaign and Judahite king are historically contextualised, but that does not establish each speech, motive or reported miraculous outcome independently.",
      "furtherRefs": [
        "2 Kings 18:13-19",
        "Isaiah 37:14-20",
        "2 Chronicles 32:24-26"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Esther is a crafted court story about vulnerable communities navigating imperial power, fear and reversal. Early chapters introduce danger through banquets and decrees; Esther's decision to approach the king shifts the plot, and the closing chapters explain the commemoration of Purim. Pay attention to the agency of Esther and Mordecai, the role of concealed identity and the disturbing violence in the resolution. The Persian setting is integral to the story, but modern historical analysis does not establish every character or court incident as documented fact.",
      "comparison": "Read the danger announced in Esther 3 with Esther's decision in chapter 4 and the consequences in chapters 8-9. Narrative deliverance is not an endorsement of every action by imperial officials.",
      "question": "How do the story's reversals expose the fragility of political favour and the choices facing threatened communities?",
      "limits": "The book's composition, historical status and differences among Hebrew and Greek versions require separate study; a Persian court setting alone is not confirmation of a complete biography.",
      "furtherRefs": [
        "Esther 3:8-15",
        "Esther 4:12-17",
        "Esther 9:20-28"
      ],
      "research": [
        {
          "title": "Esther, Book of - Encyclopaedia Iranica",
          "author": "Shaul Shaked",
          "url": "https://www.iranicaonline.org/articles/esther-book-of/",
          "scope": "Source discusses Persian narrative setting, literary form and debate about historical status; it does not independently verify individual scenes."
        }
      ]
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Acts introduces Saul as an opponent of Jesus' followers, then narrates the change of direction that leads to preaching and travel with companions. The council debates and later imprisonment show that his mission involved disagreement, collaboration and political authority as well as conversion. Paul's own letters also provide primary testimony, but their emphasis, chronology and geographical details do not always map automatically onto Acts. Read his narrative in Acts and his arguments in the letters as distinct literary sources.",
      "comparison": "Compare Saul's calling in Acts 9 with his self-description in Galatians 1. Identify what each writer wants the audience to understand and what information is not supplied.",
      "question": "How do people such as Barnabas and the communities Paul visits shape the account rather than simply appearing as supporting characters?",
      "limits": "The conventional numbering of Paul's missionary journeys is a study framework, not a sequence explicitly numbered by Acts, and absolute travel dates remain debated.",
      "furtherRefs": [
        "Acts 9:1-19",
        "Galatians 1:11-24",
        "Acts 15:36-41"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "The Gospels present Jesus through different narrative arrangements and emphases, including proclamation, teaching, conflict, suffering and resurrection. A selected trail should follow each passage in its literary context, not convert Gospel episodes into a modern timetable. Distinguish quotations of Israel's Scriptures from later interpretation, and compare the Gospel writers without silently harmonising differences in order or detail. The selected episodes provide entry points into much fuller accounts rather than a complete life of Jesus.",
      "comparison": "Compare the teaching and ministry references with the passion narratives, noting how each Gospel connects identity, service and conflict. Read the full surrounding chapters before drawing one doctrinal conclusion.",
      "question": "Which claims are made directly by a Gospel narrator, and which are statements from people within the narrative?",
      "limits": "The Christian confessions of these texts are primary evidence for what the Gospels claim, not independent archaeological verification of each event or location.",
      "furtherRefs": [
        "Mark 1:14-15",
        "Luke 4:16-21",
        "John 20:24-31"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Ruth begins with bereavement, migration and a vulnerable household, not an abstract romance. Her decision to accompany Naomi reshapes their prospects, while the gleaning scenes put Israel's provisions for the poor into concrete social practice. Boaz's role develops through kinship obligations, public negotiation and family restoration. The genealogy at the end connects one family story with David's origins. The narrative's Moabite identity remains important and should not be erased when discussing later royal or messianic readings.",
      "comparison": "Set Ruth 1's commitment beside the field protections and the public agreement in Ruth 4. Personal loyalty and communal law are both essential to the story.",
      "question": "How do Ruth, Naomi and Boaz each exercise agency within economic and social constraints?",
      "limits": "The book's genealogy establishes the narrator's dynastic connection; it is not a separate archaeological record of every family relationship.",
      "furtherRefs": [
        "Ruth 1:16-17",
        "Ruth 2:8-12",
        "Ruth 4:13-17"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Hannah's narrative begins with prolonged grief, unequal treatment and prayer at Shiloh. Her response after Samuel's birth and her song in 1 Samuel 2 show how private anguish enters Israel's wider language of reversal and justice. Read the story without promising that every painful situation will end in the same way. The song moves beyond her household to celebrate God's care for the poor and critique the proud; it should not be restricted to a personal success story.",
      "comparison": "Compare Hannah's earlier speech in 1 Samuel 1 with the reversals in her song and Mary of Nazareth's later song in Luke 1, distinguishing thematic echo from direct identity.",
      "question": "What details show both Hannah's vulnerability and her capacity to act?",
      "limits": "This is one particular narrative and a poetic prayer. It offers no general medical prediction or guarantee about fertility.",
      "furtherRefs": [
        "1 Samuel 1:9-18",
        "1 Samuel 2:1-10",
        "Luke 1:46-55"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Samuel appears in a transition from local sanctuary ministry to the rise of kingship. His childhood call introduces the difficulty of hearing and delivering a message; later episodes show the community demanding political change and Samuel negotiating his place within it. The Saul and David narratives complicate any simple division between monarchy as gift and monarchy as rejection. Rather than lifting one verdict from a passage, trace how criticism, permission and warning coexist within the larger story.",
      "comparison": "Read 1 Samuel 8 alongside the account of Saul's selection and the later anointing of David. Ask who is speaking, whose motives are described and how the narrative judges them.",
      "question": "What responsibilities does Samuel retain when the people choose a king?",
      "limits": "The books preserve complex perspectives on kingship, not a modern constitutional argument or an independently timed account of every reign.",
      "furtherRefs": [
        "1 Samuel 8:4-22",
        "1 Samuel 12:13-25",
        "1 Samuel 16:1-13"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Elijah's narrative moves between unexpected provision, public confrontation and private exhaustion. The drought and Carmel scenes present the conflict over allegiance, but the quieter encounter after Elijah flees should not be skipped. His departure and Elisha's succession place prophetic responsibility beyond one dramatic personality. These episodes are literary and theological accounts of divine action; they do not provide an archaeological inventory of the supernatural events or a reproducible route around the region.",
      "comparison": "Read Elijah's bold confrontation in 1 Kings 18 beside his fear and questioning in 1 Kings 19, then the transfer to Elisha in 2 Kings 2.",
      "question": "How does the text portray courage and vulnerability in the same prophet?",
      "limits": "Reported miraculous provision and fire from heaven are biblical claims. No contemporary scientific evidence for each episode is asserted.",
      "furtherRefs": [
        "1 Kings 18:20-40",
        "1 Kings 19:1-18",
        "2 Kings 2:6-14"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Elisha's ministry follows Elijah's departure but is not merely a repetition of his predecessor's life. The stories include help for indebted families, the healing of Naaman and encounters with rulers, linking prophetic action to the vulnerable as well as the powerful. Naaman's story foregrounds questions of status, obedience and the participation of a servant girl who is easy to overlook. Reading each episode on its own terms prevents miracle accounts from becoming generic promises of healing or wealth.",
      "comparison": "Compare 2 Kings 4 and 5 to ask whose voices and needs the narrator allows to shape the outcome, including those without power.",
      "question": "What difference does the presence of ordinary households make to these prophetic narratives?",
      "limits": "Descriptions of healing are narrative claims and cannot responsibly be used as treatment instructions or proof that similar outcomes will occur.",
      "furtherRefs": [
        "2 Kings 4:1-7",
        "2 Kings 5:1-19",
        "2 Kings 6:8-23"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Jeremiah contains prophetic oracles, reported speeches, biographical narratives and correspondence, arranged in ways that are not a simple diary. His warnings address Judah's injustices and looming destruction, while the letter to exiles tells displaced households to build lives in an unfamiliar place. The new-covenant passages turn towards restoration without denying judgement. Reading Jeremiah 29:11 as a guarantee of immediate individual prosperity erases its addressed exiled community and its long horizon.",
      "comparison": "Compare the temple warning in Jeremiah 7, the exile letter in chapter 29 and the covenant promise of chapter 31 to see both continuity and a change of audience and horizon.",
      "question": "Who receives each message, and what circumstance makes the promise meaningful?",
      "limits": "The book's literary arrangement and historical composition are contested; one passage does not supply a continuous personal diary of Jeremiah's activities.",
      "furtherRefs": [
        "Jeremiah 7:1-15",
        "Jeremiah 29:4-14",
        "Jeremiah 31:31-34"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "The opening part of Daniel presents court tales about living under foreign authority, while later chapters shift towards apocalyptic visions. The narrative's three friends are central to the furnace episode in chapter 3, where Daniel himself is not named. The scene of Daniel in the lions' den and the visions should therefore not be treated as the same genre or episode. Historical and textual scholarship debates the book's composition and royal identifications; a sixth-century narrative setting does not by itself settle the date of its final form.",
      "comparison": "Compare the court dilemmas in Daniel 1 and 6 with the visionary setting of Daniel 7, keeping the shift in literary form explicit.",
      "question": "How do the court stories portray minority faithfulness under pressure, and how do the visions address hope during crisis?",
      "limits": "Daniel 3 is about his companions, not Daniel's own rescue. Modern scholarship discusses the book's possible later composition and distinct historical horizons.",
      "furtherRefs": [
        "Daniel 1:8-21",
        "Daniel 6:16-23",
        "Daniel 7:9-14"
      ],
      "research": [
        {
          "title": "Book of Daniel - Oxford Research Encyclopedia of Religion",
          "author": "Tawny Holm, 2019",
          "url": "https://academic.oup.com/edited-volume/62249/chapter-abstract/551358644",
          "scope": "Academic abstract distinguishes court tales, apocalyptic visions, setting and competing composition chronology; complete work is access-limited."
        },
        {
          "title": "Daniel 3 and 6 - Yale Bible Study",
          "author": "Yale Bible Study",
          "url": "https://yalebiblestudy.org/courses/daniel/lessons/daniel-3-and-6-study-guide/",
          "scope": "Study guide distinguishes Daniel's companions in the furnace narrative from Daniel in chapter 6."
        }
      ]
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Nehemiah opens with grief, prayer and a request to a Persian ruler before reporting the rebuilding of Jerusalem's walls amid opposition. The project requires organisation and community negotiation, not only the leadership of one individual. The closing reading with Ezra focuses on the public hearing of Torah and collective response. The social reforms in Nehemiah 5 and the later narrative complications should also temper heroic accounts that treat rebuilding as an uncomplicated triumph.",
      "comparison": "Read the work allocation and the financial complaints beside the public Torah assembly to see material concerns and covenant commitments together.",
      "question": "Whose labour and vulnerability can be missed when the story is told only through the governor's decisions?",
      "limits": "A biblical account of rebuilding is not a map of modern legal boundaries or an unqualified endorsement of each later political action.",
      "furtherRefs": [
        "Nehemiah 2:11-20",
        "Nehemiah 5:1-13",
        "Nehemiah 8:1-12"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Luke portrays Mary responding to an unexpected announcement, visiting Elizabeth and singing of social reversal and divine faithfulness. Later Gospel scenes locate her within Jesus' wider family and among those present at major turning points. John presents a distinct narrative setting at the wedding and at the crucifixion, which should be read without forcing all episodes into one modern chronology. Mary's identity must remain distinct from Mary Magdalene and Mary of Bethany, whose names occur in different contexts.",
      "comparison": "Read Luke 1's speech and song alongside John 19, noticing the different narrative voices and how each Gospel describes relationship and witness.",
      "question": "What does Mary's song say about the powerful and the lowly, beyond the immediate announcement concerning her child?",
      "limits": "The Gospels supply different selected episodes, not a complete independent chronology of Mary's life or every later tradition about her.",
      "furtherRefs": [
        "Luke 1:26-38",
        "Luke 1:46-55",
        "John 19:25-27"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Peter's trail moves from calling and discipleship into confession, failure and renewed responsibility. The Gospel accounts vary in scene selection and emphasis: the confession in Matthew should be studied with its immediate setting, and the denial narratives should not be collapsed into a single rehearsed script. Acts later depicts public witness and encounters over membership and table fellowship. Peter's changing role can be examined without assuming that every later institutional claim about church authority is settled by one verse.",
      "comparison": "Compare Matthew 16, the denial narratives and Acts 10, keeping the literary settings and different audiences in view.",
      "question": "How does Peter's fallibility affect interpretations of his public witness and leadership?",
      "limits": "The passage about rock and keys has diverse Christian interpretations; this trail does not decide them or certify a unique historical location for each scene.",
      "furtherRefs": [
        "Matthew 16:13-20",
        "Luke 22:54-62",
        "Acts 10:24-35"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "John the Baptist is portrayed as a wilderness preacher calling people to repentance and preparing for the ministry of Jesus. His testimony in John and the Synoptic Gospel accounts share important themes but use different narrative approaches. Mark 6 tells of John's earlier execution in a retrospective section, so it should not be used as evidence that every event in the Gospel is narrated in chronological order. John the Baptist is not John the apostle or the later authorial voice attributed to Revelation.",
      "comparison": "Read the wilderness opening in Mark 1 and John's testimony in John 1, then compare the retrospective account of his death with the earlier ministry descriptions.",
      "question": "How do John's public warnings, actions and imprisonment challenge people with political and religious power?",
      "limits": "The biblical narrative provides the basis of the trail, not an independent calendar for every stage or the identity of every later individual called John.",
      "furtherRefs": [
        "Mark 1:1-8",
        "John 1:19-34",
        "Mark 6:17-29"
      ],
      "research": []
    }
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
    "review": "editorial-reading-aid",
    "study": {
      "overview": "Acts presents Barnabas first as a generous community member and then as a trusted intermediary when Jerusalem believers are wary of Saul. The Antioch account shows him encouraging and recruiting another teacher rather than claiming the whole mission for himself. His later disagreement with Paul over John Mark makes their partnership more complicated and human. The text records separate departures, but not a detailed history of how either man subsequently interpreted the other's motives.",
      "comparison": "Compare Acts 9 with Acts 11 and the disagreement in Acts 15. What responsibilities does Barnabas take, and where does the partnership change?",
      "question": "What does the narrative imply about trust, second chances and unresolved disagreements without telling us everyone's private thoughts?",
      "limits": "Later traditions about Barnabas must be distinguished from Acts. His disagreement with Paul does not establish lasting hostility or a full personal biography.",
      "furtherRefs": [
        "Acts 4:32-37",
        "Acts 11:22-26",
        "Acts 15:36-41"
      ],
      "research": []
    }
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
  if(!trail.study||!['overview','comparison','question','limits'].every(k=>typeof trail.study[k]==='string'&&trail.study[k].length>=65))throw Error('Missing contextual person study '+trail.personId);
  if(!Array.isArray(trail.study.furtherRefs)||trail.study.furtherRefs.length<2||trail.study.furtherRefs.length>6||new Set(trail.study.furtherRefs).size!==trail.study.furtherRefs.length||trail.study.furtherRefs.some(ref=>!validateCanonicalReference(ref,counts)))throw Error('Invalid extended Scripture references '+trail.personId);
  if(!Array.isArray(trail.study.research)||trail.study.research.some(s=>!s.title||!s.author||!s.scope||!/^https:\/\//.test(s.url)))throw Error('Invalid person study research citation '+trail.personId);
  if(!trail.title||!trail.qualification||!trail.caution||!['Hebrew Bible','New Testament'].includes(trail.corpus)||!Object.hasOwn(TRAIL_REVIEW_LABELS,trail.review)||!Array.isArray(trail.stages)||trail.stages.length<3)throw Error('Incomplete person trail '+trail.personId);
  const refs=new Set();
  for(const s of trail.stages){const ref=validateCanonicalReference(s.ref,counts);if(!s.label||!s.note||!ref||ref.startVerse===null||ref.startChapter!==ref.endChapter||ref.endVerse-ref.startVerse>=30||!Object.hasOwn(TRAIL_SOURCE_LABELS,s.source)||!Object.hasOwn(TRAIL_REVIEW_LABELS,s.review)||refs.has(s.ref))throw Error('Invalid person trail source '+trail.personId);refs.add(s.ref);}
 }
 return true;
}
