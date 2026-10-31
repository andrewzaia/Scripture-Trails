// Editorially curated study paths. Their descriptions are commentary, never attributed ESV quotations.
const CORE_PATHS = [
 {id:'creation',number:'01',label:'BEGINNINGS',name:'From creation to renewal',summary:'Follow the arc from the first creation to the promise of a renewed heaven and earth.',time:'3-4 hours',accent:'#c99b61',refs:['Genesis 1:1','Genesis 2:9','John 1:1','Colossians 1:15','Romans 8:21','Revelation 21:1','Revelation 22:2'],question:'How does the Bible describe the relationship between the first creation and the new creation?'},
 {id:'messiah',number:'02',label:'PROPHECY',name:'The promised Messiah',summary:'Trace prophetic texts and the ways New Testament writers connect them to Jesus.',time:'3-4 hours',accent:'#82a69f',refs:['Genesis 12:3','Isaiah 7:14','Micah 5:2','Isaiah 40:3','Isaiah 53:5','Luke 4:18','John 1:14'],question:'Which passages are quoted directly, and which are interpreted as thematic or prophetic connections?'},
 {id:'shepherd',number:'03',label:'IMAGERY',name:'The Good Shepherd',summary:'Explore the shepherd imagery in the Psalms, prophets and the teaching of Jesus.',time:'2-3 hours',accent:'#ad91b6',refs:['Psalm 23:1','Ezekiel 34:11','John 10:11','Luke 15:4','1 Peter 5:4'],question:'How does the description of a shepherd develop across the passages?'},
 {id:'covenant',number:'04',label:'COVENANT',name:'Promises and covenants',summary:'Read the promises to Abraham and Israel alongside New Testament covenant language.',time:'4-5 hours',accent:'#bf9d83',refs:['Genesis 12:3','Genesis 15:6','Exodus 12:13','Jeremiah 31:31','Luke 22:20','Galatians 3:8','Hebrews 8:8'],question:'What remains continuous in covenant language and what changes?'},
 {id:'grace',number:'05',label:'DOCTRINE',name:'Faith, grace and works',summary:'Study related passages in Romans, Galatians, Ephesians and James in their contexts.',time:'4-5 hours',accent:'#9babc4',refs:['Genesis 15:6','Romans 3:23','Romans 4:3','Galatians 3:8','Ephesians 2:8','James 2:23'],question:'What different questions are the biblical authors addressing when they speak about faith and works?'},
 {id:'comfort',number:'06',label:'PRACTICE',name:'Hope in difficult times',summary:'Connect ancient prayers and New Testament encouragement without removing their historical settings.',time:'3-4 hours',accent:'#92b69f',refs:['Psalm 23:1','Psalm 46:1','Isaiah 40:31','Matthew 6:25','Romans 8:28','Philippians 4:6','Revelation 21:4'],question:'What promises are made here, and to whom were they first addressed?'}
];

const JOURNAL_CHAPTERS={
  "creation": [
    {
      "title": "The world is declared good",
      "focus": "Read the creation accounts alongside ancient praise and wisdom writing. Attend to literary order, human dignity and Sabbath rest.",
      "readings": [
        "Genesis 1",
        "Genesis 1:26-31",
        "Genesis 2:1-3",
        "Psalms 8",
        "Psalms 104:24-30",
        "Job 38:4-11"
      ],
      "connection": "Genesis 1 and Psalm 104 approach creation through different literary forms. Compare what each says about God's work and human place.",
      "question": "What does each text say about creation itself, and what does its literary form contribute?",
      "context": "Genesis 1 and Genesis 2 should be read in their own contexts; the poetic material in Job and the Psalms is not a scientific chronology."
    },
    {
      "title": "Human vocation and the fracture",
      "focus": "Follow human responsibility, broken trust, violence and the widening consequences of wrongdoing.",
      "readings": [
        "Genesis 2:4-25",
        "Genesis 3",
        "Genesis 4:1-16",
        "Genesis 6:5-13",
        "Ecclesiastes 3:11",
        "Romans 5:12-21"
      ],
      "connection": "Read Genesis 3 with Romans 5, noting Paul's argument about Adam and Christ rather than assuming both texts have identical purposes.",
      "question": "How do responsibility, moral choice and suffering change across these passages?",
      "context": "Genesis narratives and Paul's theological comparison are different genres. Distinguish the narrated events from later interpretation."
    },
    {
      "title": "Hope enters the story",
      "focus": "Trace covenant, blessing and restoration imagery from the early biblical narratives into prophetic future hope.",
      "readings": [
        "Genesis 9:8-17",
        "Genesis 12:1-3",
        "Isaiah 11:6-9",
        "Isaiah 35",
        "Isaiah 65:17-25",
        "Ezekiel 36:26-28"
      ],
      "connection": "Compare the rainbow covenant in Genesis 9 with the prophetic renewal of land, people and peace in Isaiah and Ezekiel.",
      "question": "What restoration is promised, and which audiences are addressed by each oracle?",
      "context": "Do not equate every prophetic image with the final scene in Revelation without considering its original setting."
    },
    {
      "title": "Wisdom, Word and the work of Christ",
      "focus": "Compare creation language in wisdom and prophetic literature with the New Testament's descriptions of Christ.",
      "readings": [
        "Genesis 1",
        "Proverbs 8:22-31",
        "Isaiah 40:12-31",
        "John 1:1-18",
        "Colossians 1:15-20",
        "Hebrews 1:1-4",
        "1 Corinthians 8:6"
      ],
      "connection": "Compare John 1 and Colossians 1 with Genesis 1; identify explicit vocabulary and separately note theological inferences.",
      "question": "How do the authors describe God's agency in creation, and where do their emphases differ?",
      "context": "Proverbs 8 personifies wisdom. Its relation to later Christology is interpreted differently across traditions."
    },
    {
      "title": "Creation waiting for freedom",
      "focus": "Examine the present experience of suffering and the future hope expressed through resurrection and renewal.",
      "readings": [
        "Romans 8:18-25",
        "2 Corinthians 5:17-21",
        "1 Corinthians 15:42-58",
        "2 Peter 3:10-13",
        "Hebrews 11:13-16",
        "Philippians 3:20-21"
      ],
      "connection": "Romans 8 describes creation groaning; 1 Corinthians 15 focuses on bodily resurrection. Distinguish these linked but non-identical subjects.",
      "question": "What is presented as already changed, and what remains awaited?",
      "context": "Second Peter 3 has notable textual and interpretive questions about the language of the world's transformation."
    },
    {
      "title": "A renewed heaven and earth",
      "focus": "Close by comparing the prophetic visions with John's closing vision and its imagery of life, healing and divine presence.",
      "readings": [
        "Isaiah 25:6-9",
        "Ezekiel 47:1-12",
        "Revelation 7:9-17",
        "Revelation 21:1-8",
        "Revelation 21:22-27",
        "Revelation 22:1-5"
      ],
      "connection": "Trace water and tree imagery from Ezekiel 47 into Revelation 22, and the removal of death from Isaiah 25 to Revelation 21.",
      "question": "Which features of the earlier visions are retained, reframed or expanded?",
      "context": "Revelation is apocalyptic literature; images should be interpreted with attention to symbolism and its Old Testament allusions."
    }
  ],
  "messiah": [
    {
      "title": "Promise and blessing to the nations",
      "focus": "Begin with ancestral promises and later New Testament readings of those promises.",
      "readings": [
        "Genesis 3:14-15",
        "Genesis 12:1-3",
        "Genesis 49:8-12",
        "Numbers 24:15-19",
        "Deuteronomy 18:15-19",
        "Galatians 3:6-16"
      ],
      "connection": "Compare Genesis 12 and Galatians 3. Paul explicitly interprets Abraham's blessing in relation to the nations.",
      "question": "Which claims are made directly in the earlier passages, and which are developed by later authors?",
      "context": "Genesis 3:15 and Numbers 24 are read messianically by many Christians, but their interpretation is debated."
    },
    {
      "title": "Davidic kingship",
      "focus": "Study royal promises and psalms before considering their New Testament reception.",
      "readings": [
        "2 Samuel 7:8-16",
        "Psalms 2",
        "Psalms 72",
        "Psalms 110",
        "Isaiah 9:1-7",
        "Luke 1:30-33"
      ],
      "connection": "The promise to David in 2 Samuel 7 and the announcement in Luke 1 invite comparison about kingship and an enduring throne.",
      "question": "What originally concerns Israel's monarchy, and how is it applied to Jesus?",
      "context": "Royal psalms have original court and worship contexts, even when later texts read them christologically."
    },
    {
      "title": "Birth and preparation",
      "focus": "Read the texts used in the infancy and forerunner narratives, keeping quotation and interpretation distinct.",
      "readings": [
        "Isaiah 7:1-9",
        "Isaiah 7:10-17",
        "Micah 5:1-5",
        "Isaiah 40:1-11",
        "Malachi 3:1-4",
        "Matthew 1:18-25",
        "Matthew 2:1-12",
        "Mark 1:1-8"
      ],
      "connection": "Matthew 1 cites Isaiah 7, while Matthew 2 connects Bethlehem to Micah 5. Examine the wording and each book's context.",
      "question": "How are prophetic texts quoted, adapted or situated within the Gospel accounts?",
      "context": "The Hebrew and Greek textual traditions and the historical setting of Isaiah 7 matter to interpretation."
    },
    {
      "title": "Servant and kingdom",
      "focus": "Consider prophetic servant passages alongside Jesus' teaching and early ministry.",
      "readings": [
        "Isaiah 42:1-9",
        "Isaiah 49:1-7",
        "Isaiah 61:1-3",
        "Luke 4:16-21",
        "Matthew 12:15-21",
        "Matthew 11:2-6"
      ],
      "connection": "Luke 4 directly features Isaiah 61. Matthew 12 uses Isaiah 42. Compare their different selections and emphases.",
      "question": "What mission is described for the servant, and what does Jesus claim or do in the Gospel passages?",
      "context": "The identity of the servant in Isaiah is complex and changes across passages; do not flatten every occurrence."
    },
    {
      "title": "Suffering and rejection",
      "focus": "Follow lament and suffering-servant language through Gospel narratives and apostolic explanation.",
      "readings": [
        "Psalms 22",
        "Isaiah 53",
        "Zechariah 12:10",
        "Mark 15:21-39",
        "Luke 24:25-27",
        "Acts 8:26-35"
      ],
      "connection": "Compare the actual wording of Psalm 22, Isaiah 53 and Mark 15. Acts 8 shows an explicit interpretive discussion of Isaiah.",
      "question": "Which connections are textual quotations, which are narrative parallels, and which require further argument?",
      "context": "Psalm 22 is a lament in its own right; claims about precise fulfilment should distinguish text, allusion and theological reading."
    },
    {
      "title": "Resurrection and exaltation",
      "focus": "Conclude with resurrection testimony, enthronement texts and later worship imagery.",
      "readings": [
        "Psalms 16:7-11",
        "Psalms 110",
        "Daniel 7:13-14",
        "Luke 24:44-49",
        "Acts 2:22-36",
        "Romans 1:1-4",
        "Hebrews 1",
        "Revelation 5"
      ],
      "connection": "Acts 2 explicitly applies Psalm 16 to the resurrection and uses Psalm 110 in its enthronement argument.",
      "question": "What do the different authors mean by resurrection, sonship and authority?",
      "context": "Daniel 7's son-of-man imagery belongs to an apocalyptic vision; interpretive traditions differ on its details."
    }
  ],
  "shepherd": [
    {
      "title": "The responsibility of a shepherd",
      "focus": "Start with shepherd language for leaders, rulers and God's guidance of his people.",
      "readings": [
        "Genesis 48:15",
        "Numbers 27:15-23",
        "2 Samuel 5:1-3",
        "Psalms 78:52-72",
        "Jeremiah 23:1-8",
        "Zechariah 11:4-17"
      ],
      "connection": "The language moves between pastoral care and the responsibility of political or religious leadership.",
      "question": "Who is being described as a shepherd in each text, and what duties are implied?",
      "context": "Shepherd is a metaphor with different referents; avoid treating every use as a direct prediction of Jesus."
    },
    {
      "title": "The Lord as shepherd",
      "focus": "Read personal songs of trust beside the communal confession of divine care.",
      "readings": [
        "Psalms 23",
        "Psalms 80:1-3",
        "Psalms 95:6-7",
        "Isaiah 40:10-11",
        "Psalms 100",
        "Genesis 49:22-24"
      ],
      "connection": "Psalm 23 is personal testimony while Psalm 80 speaks for the community. Isaiah 40 portrays a restoring shepherd.",
      "question": "How does the image change between individual trust and collective need?",
      "context": "Psalms are poetry and prayer, not unconditional guarantees that followers will avoid hardship."
    },
    {
      "title": "When leaders fail",
      "focus": "Compare prophetic indictments of leaders with God's commitment to find and protect the vulnerable.",
      "readings": [
        "Ezekiel 34:1-10",
        "Jeremiah 10:21",
        "Micah 3:1-4",
        "Zechariah 10:2-3",
        "Ezekiel 22:27-31",
        "Ezekiel 34:11-16"
      ],
      "connection": "Ezekiel 34 contrasts self-serving human shepherds with God's own intervention on behalf of the flock.",
      "question": "What failures are named, and what positive standard is set?",
      "context": "The prophets address identifiable communities and leaders; modern application should not erase those settings."
    },
    {
      "title": "Seeking those who are lost",
      "focus": "Consider rescue, inclusion and the contested boundaries of the flock.",
      "readings": [
        "Ezekiel 34:17-31",
        "Luke 15:1-7",
        "Matthew 9:35-38",
        "Matthew 18:10-14",
        "John 10:1-10",
        "Isaiah 49:8-13"
      ],
      "connection": "Luke 15 answers critics of Jesus' welcome to sinners; Matthew 18 uses a similar image in a different teaching setting.",
      "question": "Who is lost, who is sought, and how do the surrounding audiences shape the parables?",
      "context": "The parables are related but occur in distinct narrative contexts and should not automatically be harmonised."
    },
    {
      "title": "The Good Shepherd lays down his life",
      "focus": "Read Jesus' self-description alongside his ministry, passion and subsequent pastoral commission.",
      "readings": [
        "Isaiah 53:4-6",
        "John 10:11-30",
        "Mark 6:30-44",
        "Matthew 26:30-35",
        "John 21:15-19",
        "Hebrews 13:20-21",
        "1 Peter 2:21-25"
      ],
      "connection": "John 10 connects the shepherd's care with laying down his life; 1 Peter uses Isaiah's wandering sheep image.",
      "question": "How does care become costly, and what is asked of the restored disciples?",
      "context": "John 21 includes textual and pastoral questions; do not make its dialogue a simplistic hierarchy of love."
    },
    {
      "title": "Shepherding a community",
      "focus": "End with practical duties, accountability and future hope for the flock.",
      "readings": [
        "Acts 20:17-35",
        "1 Peter 5:1-11",
        "Ephesians 4:11-16",
        "James 5:13-20",
        "Revelation 7:13-17",
        "Revelation 19:11-16"
      ],
      "connection": "Compare the guidance given to elders in Acts 20 and 1 Peter 5 with the imagery of the Lamb in Revelation 7.",
      "question": "What obligations are laid upon human leaders, and what belongs to Christ alone?",
      "context": "Teaching on pastoral leadership is not a warrant for coercion or for ignoring vulnerable people."
    }
  ],
  "covenant": [
    {
      "title": "Preservation after judgement",
      "focus": "Explore covenant language in the early narratives, especially the promise to Noah.",
      "readings": [
        "Genesis 2:15-17",
        "Genesis 6:17-22",
        "Genesis 8:20-22",
        "Genesis 9:8-17",
        "Isaiah 54:7-10",
        "Psalms 89:1-4"
      ],
      "connection": "Genesis 9 explicitly names a covenant with Noah and living creatures; Isaiah 54 recalls its enduring assurance.",
      "question": "Who receives the promise, and is the promise conditional in its immediate context?",
      "context": "Genesis 2 does not explicitly use the word covenant; whether it describes an Adamic covenant is debated."
    },
    {
      "title": "Abraham: promise, trust and sign",
      "focus": "Move through the promises, land, descendants, blessing and the sign of the covenant.",
      "readings": [
        "Genesis 12:1-9",
        "Genesis 15",
        "Genesis 17:1-14",
        "Genesis 22:15-18",
        "Exodus 2:23-25",
        "Nehemiah 9:7-8"
      ],
      "connection": "Genesis 15 emphasises God's promise; Genesis 17 specifies a covenant sign and obligations.",
      "question": "How do promise, response and sign function differently across these chapters?",
      "context": "The historical horizons of the Abraham narratives and their later reception should be kept distinct."
    },
    {
      "title": "Israel at Sinai",
      "focus": "Read liberation, covenant ceremony, commandments and warnings within the story of Israel.",
      "readings": [
        "Exodus 19:1-9",
        "Exodus 20:1-21",
        "Exodus 24:1-11",
        "Leviticus 26:1-13",
        "Deuteronomy 6:1-9",
        "Deuteronomy 30:1-10"
      ],
      "connection": "Compare Exodus 24's covenant ceremony with Deuteronomy's later call to remember and obey.",
      "question": "What responsibilities accompany covenant membership, and how do the texts describe restoration after failure?",
      "context": "These passages address Israel's national and liturgical life; avoid extracting individual rules without context."
    },
    {
      "title": "Passover and David's house",
      "focus": "Follow redemption memorials and the promise of an enduring royal house.",
      "readings": [
        "Exodus 12:1-28",
        "2 Samuel 7:8-16",
        "Psalms 89:19-37",
        "Psalms 132:11-18",
        "Isaiah 55:1-5",
        "Luke 1:68-79"
      ],
      "connection": "Luke 1 recalls promises to Abraham and David. Compare how this account reads Israel's earlier hopes.",
      "question": "Which promises concern a people, which concern a king, and how are they related?",
      "context": "Passover and Davidic covenant are not the same covenant. Their connections in Christian theology require explanation."
    },
    {
      "title": "The prophets speak of renewal",
      "focus": "Investigate how prophetic texts announce restoration, inner transformation and a future covenant.",
      "readings": [
        "Jeremiah 31:27-40",
        "Jeremiah 32:36-41",
        "Ezekiel 36:22-32",
        "Ezekiel 37:15-28",
        "Hosea 2:14-23",
        "Isaiah 42:5-9"
      ],
      "connection": "Jeremiah 31 explicitly uses new-covenant language; Ezekiel emphasises a new heart and restored people.",
      "question": "What is promised to Israel and Judah, and which elements are presented as future renewal?",
      "context": "Distinguish the prophets' named audiences from later Christian interpretation and avoid erasing Jewish readings."
    },
    {
      "title": "The covenant in New Testament argument",
      "focus": "Study the last supper, Pauline reading of Abraham and the sustained treatment in Hebrews.",
      "readings": [
        "Luke 22:14-20",
        "1 Corinthians 11:23-26",
        "Galatians 3:6-29",
        "Hebrews 8",
        "Hebrews 9:11-28",
        "Hebrews 10:11-25",
        "Romans 11:17-32"
      ],
      "connection": "Hebrews 8 quotes Jeremiah 31; Romans 11 cautions Gentile believers against arrogance toward Israel.",
      "question": "Where do continuity, fulfilment and discontinuity appear, and how are they argued?",
      "context": "Avoid portraying all Jewish traditions as one position or claiming all Christians interpret covenant replacement alike."
    }
  ],
  "grace": [
    {
      "title": "The human predicament",
      "focus": "Read biblical assessments of wrongdoing and the law's moral challenge before moving to grace.",
      "readings": [
        "Genesis 3",
        "Psalms 14",
        "Ecclesiastes 7:15-22",
        "Romans 1:18-32",
        "Romans 3:9-26",
        "James 2:8-13"
      ],
      "connection": "Romans 3 joins quotations from Israel's Scriptures to an argument about universal need.",
      "question": "What problem does each author identify, and how broad is the author's claim?",
      "context": "Paul's argument develops across Romans 1-3; lifting Romans 3:23 alone obscures its structure."
    },
    {
      "title": "Abraham in three arguments",
      "focus": "Compare Genesis with Paul, James and Hebrews, all of whom use Abraham for different questions.",
      "readings": [
        "Genesis 15:1-6",
        "Genesis 22:1-19",
        "Romans 4",
        "Galatians 3:1-14",
        "James 2:14-26",
        "Hebrews 11:8-19"
      ],
      "connection": "Romans 4 cites Genesis 15:6; James 2 also cites that verse while discussing a different pastoral problem.",
      "question": "Which question does each writer answer, and how do they use the same ancestral narrative?",
      "context": "Do not simply assert that James and Paul use the terms faith, works and justify identically."
    },
    {
      "title": "The initiative of grace",
      "focus": "Explore salvation, mercy, faith and new life in Gospel and apostolic teaching.",
      "readings": [
        "Luke 18:9-14",
        "Romans 5:1-11",
        "Ephesians 2:1-10",
        "Titus 3:3-8",
        "2 Timothy 1:8-10",
        "John 3:14-21"
      ],
      "connection": "Ephesians 2 joins unearned grace with a purpose of good works in the same paragraph.",
      "question": "What is described as God's action, and what human response is requested?",
      "context": "Do not detach Ephesians 2:8 from 2:10 or turn narrative parables into a complete doctrinal formula."
    },
    {
      "title": "Law, freedom and obedience",
      "focus": "Read the law and the transformed life together, without reducing the debate to slogans.",
      "readings": [
        "Deuteronomy 6:4-9",
        "Matthew 5:17-20",
        "Romans 3:27-31",
        "Romans 6",
        "Galatians 5:1-15",
        "Philippians 2:12-16"
      ],
      "connection": "Paul's rejection of boasting in Romans 3 and his call to holy living in Romans 6 belong to one sustained argument.",
      "question": "Which uses of law refer to covenant identity, ethics, or a means of boasting?",
      "context": "Christian traditions differ over law and justification; present doctrinal interpretations as interpretations."
    },
    {
      "title": "Faith expressed in love",
      "focus": "Consider fruit, practice, service and the moral testing of professed belief.",
      "readings": [
        "Matthew 7:15-27",
        "John 15:1-17",
        "James 1:19-27",
        "1 John 3:11-24",
        "Ephesians 4:17-32",
        "1 Corinthians 13"
      ],
      "connection": "James distinguishes hearing from doing; John 15 speaks of abiding and fruit. Compare their ethical emphases.",
      "question": "How do the authors connect authentic faith with practical care for others?",
      "context": "Works do not mean precisely the same thing in every passage; retain each author's addressees and purpose."
    },
    {
      "title": "Bringing the tensions into focus",
      "focus": "Return to the apparent conflicts and assemble the evidence without forcing artificial agreement.",
      "readings": [
        "James 2:14-26",
        "Romans 4:1-25",
        "Galatians 5:16-26",
        "Ephesians 2:8-10",
        "Philippians 3:2-11",
        "1 Peter 1:3-9"
      ],
      "connection": "Read James 2 and Romans 4 side by side and state the distinctive questions each asks before formulating a synthesis.",
      "question": "What is the strongest evidence for both continuity and difference between these accounts?",
      "context": "Justification remains contested across Christian traditions. The journal records the textual data, not a binding denominational verdict."
    }
  ],
  "comfort": [
    {
      "title": "Lament is part of Scripture",
      "focus": "Start with prayers and narratives that give suffering a voice rather than dismissing it.",
      "readings": [
        "Psalms 13",
        "Psalms 22",
        "Psalms 42",
        "Lamentations 3:19-33",
        "Job 3",
        "Habakkuk 1:1-4"
      ],
      "connection": "Psalm 13 moves from complaint toward trust, while Job 3 resists simple resolution.",
      "question": "What do the speakers ask, and what remains unresolved?",
      "context": "Do not treat lament as a lack of faith or demand a positive emotional ending."
    },
    {
      "title": "Trust in trouble",
      "focus": "Read songs of refuge and prophetic hope with the original circumstances and audiences in view.",
      "readings": [
        "Psalms 23",
        "Psalms 46",
        "Psalms 121",
        "Isaiah 40:27-31",
        "Isaiah 43:1-7",
        "Proverbs 3:1-8"
      ],
      "connection": "Psalm 46 and Isaiah 40 portray strength differently. Compare communal worship with prophetic reassurance to exiles.",
      "question": "Who is addressed and what kind of help is promised?",
      "context": "Trust texts are not guarantees of immunity from illness, loss or danger."
    },
    {
      "title": "Jesus encounters grief",
      "focus": "Follow Jesus' teaching, tears and prayer across quite different situations.",
      "readings": [
        "Matthew 6:25-34",
        "Matthew 11:28-30",
        "John 11:17-44",
        "Mark 14:32-42",
        "Luke 22:39-46",
        "John 16:16-33"
      ],
      "connection": "Set Jesus' teaching about anxiety beside his grief at Lazarus' tomb and anguish in Gethsemane.",
      "question": "How does the Gospel material make room for both hope and intense distress?",
      "context": "Do not use Matthew 6 or Philippians 4 to shame someone struggling with anxiety or grief."
    },
    {
      "title": "Hope and endurance in the letters",
      "focus": "Consider suffering, weakness, community and resurrection hope in their full argumentative settings.",
      "readings": [
        "Romans 5:1-5",
        "Romans 8:18-39",
        "2 Corinthians 1:3-11",
        "2 Corinthians 4:7-18",
        "James 1:2-8",
        "1 Peter 1:3-9"
      ],
      "connection": "Second Corinthians joins consolation with solidarity in affliction; Romans 8 looks ahead to restoration.",
      "question": "What is promised now, and what is reserved for future hope?",
      "context": "Perseverance does not replace practical help, safety or professional medical care when needed."
    },
    {
      "title": "Carrying one another",
      "focus": "Read biblical accounts of exhaustion and practical instructions for communal care.",
      "readings": [
        "1 Kings 19:1-18",
        "Galatians 6:1-10",
        "Philippians 4:4-9",
        "Hebrews 10:19-25",
        "James 5:13-20",
        "Acts 2:42-47"
      ],
      "connection": "Elijah receives food, rest and renewed direction; Galatians calls believers to carry one another's burdens.",
      "question": "What tangible actions accompany prayer and encouragement?",
      "context": "Avoid assuming every person's hardship has the same cause or that religious counsel substitutes for safeguarding."
    },
    {
      "title": "Hope beyond loss",
      "focus": "Close with resurrection and new-creation passages without bypassing present grief.",
      "readings": [
        "Isaiah 25:6-9",
        "Isaiah 65:17-25",
        "Romans 8:18-27",
        "Romans 8:28-39",
        "1 Thessalonians 4:13-18",
        "Revelation 7:13-17",
        "Revelation 21:1-5"
      ],
      "connection": "Isaiah 25 and Revelation 21 both speak of the removal of death, while 1 Thessalonians 4 addresses a grieving church.",
      "question": "What does biblical hope affirm, and what questions remain open in the present?",
      "context": "Romans 8:28 should be read with Romans 8:18-39, not presented as a claim that individual suffering is good."
    }
  ]
};
const JOURNAL_EDITORIAL_GUIDES = {
  "creation": {
    "overview": "The creation readings move deliberately between narrative, praise, wisdom, apostolic argument and apocalyptic vision. Genesis 1 and 2 provide the opening literary framework; Psalms 8 and 104 reflect on human vocation and the natural world rather than furnishing a second scientific timeline. Romans 8 interprets suffering and longing for renewal in Paul's theological argument, and Revelation returns to river and tree imagery found earlier in Ezekiel. The strongest connection is the progression of biblical imagery and hope, not a claim that every writer describes an identical physical event.",
    "distinction": "Compare Genesis 2's garden with Ezekiel 47 and Revelation 22 as separate scenes before treating them as a single historical location. Proverbs 8 uses personified wisdom; John 1 and Colossians 1 develop distinct claims about Christ.",
    "practice": "Keep track of literary genre, audience and speaker at each stage. Record which claims are explicit quotations, thematic echoes, or your own interpretive conclusions."
  },
  "messiah": {
    "overview": "This journal distinguishes promises made within Israel's ancestral and royal histories from the ways New Testament authors identify and apply them to Jesus. Genesis 12 concerns blessing through Abraham; Isaiah 7 addresses a particular political crisis; Micah speaks of a ruler linked to Bethlehem; Isaiah 53 belongs to the complex servant passages. Matthew, Luke, John and the letters read these earlier texts within their own theological arguments. A useful study must distinguish an original prophetic audience, a direct later quotation and a retrospective Christian interpretation rather than labelling every Old Testament verse an unambiguous standalone prediction.",
    "distinction": "Read Isaiah 7:10-17 with its immediate setting before Matthew 1:22-23, and read Isaiah 52:13-53:12 before citing later apostolic uses. Notice when wording changes between Hebrew, Greek and New Testament citation.",
    "practice": "For each passage record the original speaker, audience and crisis; then record precisely what the later writer quotes, echoes or infers."
  },
  "shepherd": {
    "overview": "Pastoral imagery is not merely a comforting individual metaphor. Psalm 23 speaks in the voice of a worshipper relying on the Lord; Ezekiel 34 criticises leaders who exploit and neglect the flock and promises divine care. John 10 places Jesus' shepherd language alongside conflict over leadership and the protection of vulnerable people. Luke 15 focuses on recovering the lost, while 1 Peter brings the metaphor into the care of communities. Consider protection, justice, accountability and sacrificial service together rather than turning the texts into an idealised description of authority.",
    "distinction": "The Lord as shepherd in Psalm 23, the condemnation of failed shepherds in Ezekiel 34 and Jesus as shepherd in John 10 are connected but speak in different literary and historical settings.",
    "practice": "Ask who the flock represents, which leaders are being criticised and what actions demonstrate care rather than mere titles."
  },
  "covenant": {
    "overview": "Covenant language spans distinct relationships and circumstances. Genesis associates Abraham with land, descendants and blessing; Exodus narrates rescue and communal obligations; the Passover becomes a foundational marker in Israel's memory. Jeremiah 31 promises renewal while explicitly addressing Israel and Judah, and Luke, Hebrews and Paul later draw on covenant language in Christian arguments. Retaining these original audiences prevents a simple chronological diagram from replacing real differences in purpose. The focus should be on what God promises, what people are called to do and how later writers interpret prior commitments.",
    "distinction": "Distinguish Genesis 12 and 15, the Passover in Exodus 12, Sinai's communal laws and Jeremiah's new-covenant oracle. Hebrews 8 quotes Jeremiah at length, while Luke 22 uses covenant language in the supper narrative.",
    "practice": "Write down who is addressed and what signs or obligations appear in each covenant passage before attempting a synthesis."
  },
  "grace": {
    "overview": "Paul and James speak about Abraham, faith, righteousness and works in overlapping language but within different arguments. Romans 3-4 concerns human justification, the law and God's initiative; Galatians 3 links Abraham's faith to the promise reaching the nations; Ephesians 2 describes salvation as gift and also speaks of a life prepared for good works. James 2 challenges a claim to faith disconnected from actual care and action. The study is strongest when it lets the writers pose their own questions before comparing their conclusions. Avoid forcing each passage into one slogan that ignores the argument surrounding it.",
    "distinction": "Read Genesis 15:6 and 22 together, then compare Romans 4:3, Galatians 3:6 and James 2:21-24. The cited verse is the same in some places, but its rhetorical use differs.",
    "practice": "For each author identify the audience, the disputed behaviour or claim, and how examples of Abraham are used in that argument."
  },
  "comfort": {
    "overview": "Biblical comfort is not a guarantee that suffering will disappear immediately. Psalms contain both trust and lament; Isaiah 40 offers hope to a community in distress, and Jesus' teaching on anxiety belongs within the broader call to seek God's kingdom. Romans 8 confronts suffering while awaiting future hope, and Philippians connects prayer with perseverance within Paul's circumstances. Revelation's final vision is not a denial of present grief but a literary vision of its ultimate removal. These passages provide room for both sorrow and trust, and should not be used to blame someone whose circumstances remain difficult.",
    "distinction": "Keep the lament of Psalm 13 and the hope of Isaiah 40 in their respective settings. Compare Romans 8:18-28 with Revelation 21 without treating them as promises of immediate prosperity or guaranteed recovery.",
    "practice": "Ask what help is promised, to whom, and on what horizon. Acknowledge uncertainty rather than turning encouragement into a prediction about another person's life."
  }
};

export const PATHS=CORE_PATHS.map(path=>{
 const chapters=JOURNAL_CHAPTERS[path.id]||[];
 return {...path,guide:JOURNAL_EDITORIAL_GUIDES[path.id],anchors:[...path.refs],chapters,refs:[...new Set([...path.refs,...chapters.flatMap(section=>section.readings)])]};
});

export const EDITORIAL_LINKS = [
 ['Genesis 1:1','John 1:1','echo','Creation and the opening of John'],
 ['Genesis 1:1','Revelation 21:1','theme','Creation and new creation'],
 ['Genesis 2:9','Revelation 22:2','theme','The tree of life imagery'],
 ['Genesis 1:26','Colossians 1:15','theme','The image of God'],
 ['Genesis 3:15','Romans 16:20','echo','The defeat of evil'],
 ['Genesis 12:3','Galatians 3:8','quotation','The promise to Abraham'],
 ['Genesis 12:3','Matthew 28:19','theme','Blessing reaching the nations'],
 ['Genesis 15:6','Romans 4:3','quotation','Abraham and faith'],
 ['Genesis 15:6','James 2:23','quotation','Abraham and faith in James'],
 ['Exodus 12:13','1 Corinthians 5:7','theme','Passover imagery'],
 ['Exodus 16:4','John 6:32','theme','Bread from heaven'],
 ['Deuteronomy 6:5','Mark 12:30','quotation','The greatest commandment'],
 ['Deuteronomy 8:3','Matthew 4:4','quotation','Bread and the word of God'],
 ['Deuteronomy 18:15','Acts 3:22','quotation','The prophet like Moses'],
 ['Psalm 2:7','Hebrews 1:5','quotation','Royal sonship language'],
 ['Psalm 22:1','Matthew 27:46','quotation','Words of lament at the cross'],
 ['Psalm 23:1','John 10:11','theme','God and the shepherd'],
 ['Psalm 23:1','Ezekiel 34:11','theme','The shepherd caring for the flock'],
 ['Psalm 23:1','1 Peter 5:4','theme','The chief shepherd'],
 ['Psalm 46:1','Philippians 4:6','theme','Help in trouble and prayer'],
 ['Psalm 51:10','Ezekiel 36:26','theme','A renewed heart'],
 ['Psalm 110:1','Matthew 22:44','quotation','The Lord at the right hand'],
 ['Isaiah 7:14','Matthew 1:23','quotation','Matthew cites Isaiah'],
 ['Isaiah 9:6','Luke 2:11','theme','Messianic royal imagery'],
 ['Isaiah 25:8','Revelation 21:4','echo','The removal of death and tears'],
 ['Isaiah 40:3','John 1:23','quotation','The voice in the wilderness'],
 ['Isaiah 40:31','Psalm 46:1','theme','Strength and reliance upon God'],
 ['Isaiah 53:4','Matthew 8:17','quotation','Matthew cites the suffering servant'],
 ['Isaiah 53:5','1 Peter 2:24','echo','Healing and the suffering servant'],
 ['Isaiah 61:1','Luke 4:18','quotation','Jesus reads Isaiah'],
 ['Jeremiah 31:31','Luke 22:20','theme','The new covenant'],
 ['Jeremiah 31:31','Hebrews 8:8','quotation','Hebrews quotes the covenant promise'],
 ['Ezekiel 34:11','John 10:11','theme','The shepherd imagery'],
 ['Ezekiel 36:26','John 3:5','theme','Renewal and new birth'],
 ['Joel 2:28','Acts 2:17','quotation','Peter cites Joel at Pentecost'],
 ['Micah 5:2','Matthew 2:6','quotation','The ruler from Bethlehem'],
 ['Malachi 3:1','Mark 1:2','quotation','A messenger prepares the way'],
 ['Matthew 5:17','Romans 3:31','theme','The Law in the New Testament'],
 ['Matthew 6:9','Luke 11:2','parallel','The Lord’s Prayer'],
 ['Matthew 6:25','Philippians 4:6','theme','Anxiety and trust'],
 ['Matthew 28:19','Acts 1:8','theme','Witness to the nations'],
 ['Mark 12:30','Matthew 22:37','parallel','The greatest commandment'],
 ['Luke 15:4','John 10:11','theme','The shepherd seeks the lost'],
 ['John 1:1','Colossians 1:15','theme','Christ and creation'],
 ['John 1:14','Philippians 2:7','theme','The incarnation'],
 ['John 3:16','Romans 5:8','theme','God’s love and salvation'],
 ['John 3:16','Ephesians 2:8','theme','Salvation through grace'],
 ['John 11:25','1 Corinthians 15:20','theme','Resurrection hope'],
 ['John 14:6','Acts 4:12','theme','Salvation in Christ'],
 ['Romans 3:23','Ecclesiastes 7:20','theme','Human sinfulness'],
 ['Romans 3:23','Ephesians 2:8','theme','Human need and grace'],
 ['Romans 8:1','John 5:24','theme','No condemnation and life'],
 ['Romans 8:21','Revelation 21:1','theme','Creation set free'],
 ['Romans 8:28','Genesis 50:20','theme','Providence and human actions'],
 ['Romans 12:2','Ephesians 4:23','theme','Renewal of the mind'],
 ['1 Corinthians 13:4','John 15:12','theme','Love in Christian life'],
 ['Galatians 3:8','Ephesians 2:8','theme','The gospel and grace'],
 ['Hebrews 11:1','2 Corinthians 5:7','theme','Faith and what is unseen'],
 ['Revelation 21:1','Revelation 21:4','theme','The new creation and comfort'],
 ['Revelation 21:4','Isaiah 25:8','echo','Death and sorrow removed'],
 ['Revelation 22:2','Genesis 2:9','theme','The tree of life revisited']
].map(([from,to,type,description])=>({from,to,type,description,source:'editorial'}));
export const FEATURES=[
 {k:'covenant',name:'Covenant',hint:'Promise and fulfilment as interpreted in Scripture'},
 {k:'quotation',name:'Quotation',hint:'A later passage explicitly quotes or cites another'},
 {k:'parallel',name:'Parallel',hint:'Related narrative or teaching in multiple passages'},
 {k:'echo',name:'Echo',hint:'Similar wording or literary imagery'},
 {k:'theme',name:'Theme',hint:'Editorially identified shared subject'}
];
