import {parseRef} from './books.js';

// Public edition identifiers only. API credentials belong in Cloudflare secrets.
export const TRANSLATIONS=Object.freeze([
 {code:'ESV',name:'English Standard Version',provider:'Crossway'},
 {code:'NASB20',name:'New American Standard Bible 2020',provider:'API.Bible',bibleId:'a761ca71e0b3ddcf-01',publisher:'The Lockman Foundation',publisherUrl:'https://www.lockman.org/'},
 {code:'NIV',name:'New International Version 2011',provider:'API.Bible',bibleId:'78a9f6124f344018-01',publisher:'Biblica, Inc.',publisherUrl:'https://www.biblica.com/'},
 {code:'NKJV',name:'New King James Version',provider:'API.Bible',bibleId:'63097d2a0a2f7db3-01',publisher:'HarperCollins Christian Publishing',publisherUrl:'https://www.harpercollinschristian.com/'}
].map(edition=>Object.freeze(edition)));
export function getTranslation(code='ESV'){
 return TRANSLATIONS.find(edition=>edition.code===String(code).toUpperCase())||null;
}

// API.Bible uses USFM book IDs, which differ from the Atlas abbreviations.
const BOOK_IDS='GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export function apiBibleTarget(reference){
 const ref=parseRef(reference);
 if(!ref)return null;
 const chapter=`${BOOK_IDS[ref.book.index]}.${ref.chapter}`;
 if(ref.verse===null)return {resource:'chapters',id:chapter};
 const verse=`${chapter}.${ref.verse}`;
 if(ref.end!==null&&ref.end!==ref.verse)return {resource:'passages',id:`${verse}-${chapter}.${ref.end}`};
 return {resource:'verses',id:verse};
}
