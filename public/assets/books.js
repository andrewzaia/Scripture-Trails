export const BOOKS = [
 ['Genesis',50,'Gen'],['Exodus',40,'Exod'],['Leviticus',27,'Lev'],['Numbers',36,'Num'],['Deuteronomy',34,'Deut'],
 ['Joshua',24,'Josh'],['Judges',21,'Judg'],['Ruth',4,'Ruth'],['1 Samuel',31,'1Sam'],['2 Samuel',24,'2Sam'],
 ['1 Kings',22,'1Kgs'],['2 Kings',25,'2Kgs'],['1 Chronicles',29,'1Chr'],['2 Chronicles',36,'2Chr'],
 ['Ezra',10,'Ezra'],['Nehemiah',13,'Neh'],['Esther',10,'Esth'],['Job',42,'Job'],['Psalms',150,'Ps'],
 ['Proverbs',31,'Prov'],['Ecclesiastes',12,'Eccl'],['Song of Solomon',8,'Song'],['Isaiah',66,'Isa'],
 ['Jeremiah',52,'Jer'],['Lamentations',5,'Lam'],['Ezekiel',48,'Ezek'],['Daniel',12,'Dan'],['Hosea',14,'Hos'],
 ['Joel',3,'Joel'],['Amos',9,'Amos'],['Obadiah',1,'Obad'],['Jonah',4,'Jonah'],['Micah',7,'Mic'],
 ['Nahum',3,'Nah'],['Habakkuk',3,'Hab'],['Zephaniah',3,'Zeph'],['Haggai',2,'Hag'],
 ['Zechariah',14,'Zech'],['Malachi',4,'Mal'],['Matthew',28,'Matt'],['Mark',16,'Mark'],
 ['Luke',24,'Luke'],['John',21,'John'],['Acts',28,'Acts'],['Romans',16,'Rom'],
 ['1 Corinthians',16,'1Cor'],['2 Corinthians',13,'2Cor'],['Galatians',6,'Gal'],
 ['Ephesians',6,'Eph'],['Philippians',4,'Phil'],['Colossians',4,'Col'],
 ['1 Thessalonians',5,'1Thess'],['2 Thessalonians',3,'2Thess'],['1 Timothy',6,'1Tim'],
 ['2 Timothy',4,'2Tim'],['Titus',3,'Titus'],['Philemon',1,'Phlm'],['Hebrews',13,'Heb'],
 ['James',5,'Jas'],['1 Peter',5,'1Pet'],['2 Peter',3,'2Pet'],['1 John',5,'1John'],
 ['2 John',1,'2John'],['3 John',1,'3John'],['Jude',1,'Jude'],['Revelation',22,'Rev']
].map(([name,chapters,abbr],index)=>({name,chapters,abbr,index,testament:index<39?'Old Testament':'New Testament'}));
const aliases={
  psalms:['psalm','ps'], 'songofsolomon':['songofsongs','song','sos','canticles'],
  john:['jn','jhn'], '1john':['1jn','1jhn'],'2john':['2jn','2jhn'],'3john':['3jn','3jhn'],
  matthew:['mt','matt'], mark:['mk','mrk'], luke:['lk','luk'], acts:['ac'],
  revelation:['revelations','rev','re'], philippians:['php','phil'], romans:['ro','rom'],
  exodus:['ex','exo'], '1kings':['1ki','1kgs'], '2kings':['2ki','2kgs'],
  '1corinthians':['1co','1cor'], '2corinthians':['2co','2cor'],
  '1samuel':['1sa','1sam'], '2samuel':['2sa','2sam'], '1chronicles':['1ch','1chr'],
  '2chronicles':['2ch','2chr'], '1thessalonians':['1th','1thess'], '2thessalonians':['2th','2thess'],
  '1timothy':['1ti','1tim'], '2timothy':['2ti','2tim'],
  '1peter':['1pe','1pet'], '2peter':['2pe','2pet'], 'philemon':['phm','phlm'],
  'ecclesiastes':['ecc','eccl'], 'deuteronomy':['dt','deut'], 'judges':['jdg','judg'],
  'zechariah':['zec','zech'], 'zephaniah':['zep','zeph'], 'habakkuk':['hab'], 'jeremiah':['jer'],
  '1chronicles':['1chr','1ch'], '2chronicles':['2chr','2ch']
};
const clean=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
const bookLookup=new Map();
for(const book of BOOKS){for(const key of [book.name,book.abbr,...(aliases[clean(book.name)]||[])])bookLookup.set(clean(key),book);}
export function findBook(text){return bookLookup.get(clean(text))||null;}
export function parseRef(input){
 const raw=String(input||'').trim().replace(/\.(\d+)\.(\d+)/g,' $1:$2').replace(/[.]/g,' ').replace(/\s+/g,' ');
 const match=raw.match(/^(.+?)\s*(\d{1,3})(?:\s*:\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?)?$/);
 if(!match)return null;
 const book=findBook(match[1]);if(!book)return null;
 const chapter=Number(match[2]), verse=match[3]?Number(match[3]):null, end=match[4]?Number(match[4]):null;
 if(chapter<1||chapter>book.chapters||(verse!==null&&(verse<1||verse>176))||(end!==null&&(end<verse||end>176)))return null;
 const suffix=verse===null?'':`:${verse}${end===null?'':`-${end}`}`;
 return {book,chapter,verse,end,formatted:`${book.name} ${chapter}${suffix}`};
}
export function referenceFor(book,chapter,verse=null){return `${book.name} ${chapter}${verse===null?'':`:${verse}`}`;}
export function chapterRef(value){const p=typeof value==='string'?parseRef(value):value;return p?`${p.book.name} ${p.chapter}`:null;}
export function bookOf(ref){return parseRef(ref)?.book||null;}
export function shortRef(value){const p=parseRef(value);return p?`${p.book.abbr} ${p.chapter}${p.verse?':'+p.verse:''}`:value;}
export function adjacentChapter(ref,direction){const p=parseRef(ref);if(!p)return null;let i=p.book.index,chapter=p.chapter+direction;if(chapter<1){i--;if(i<0)return null;chapter=BOOKS[i].chapters;}else if(chapter>p.book.chapters){i++;if(i>=BOOKS.length)return null;chapter=1;}return referenceFor(BOOKS[i],chapter);}
