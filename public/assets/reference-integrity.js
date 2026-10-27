import {findBook} from './books.js';

/** Validate cited passage addresses against local 66-book verse counts.
 * This is versification-aware navigation screening, not historical verification.
 */
export function validateCanonicalReference(value,verseCounts){
 if(typeof value!=='string'||!verseCounts||typeof verseCounts!=='object')return null;
 const match=/^(.+?)\s+(\d{1,3})(?::(\d{1,3})(?:-(?:(\d{1,3}):)?(\d{1,3}))?)?$/.exec(value.trim());
 if(!match)return null;
 const [,rawBook,sc,sv,ec,ev]=match;
 const book=findBook(rawBook);
 const lengths=book&&verseCounts[book.name];
 if(!Array.isArray(lengths)||lengths.length!==book.chapters)return null;
 const startChapter=Number(sc),startVerse=sv===undefined?null:Number(sv);
 const endChapter=ec===undefined?startChapter:Number(ec),endVerse=ev===undefined?null:Number(ev);
 if(startChapter<1||startChapter>lengths.length||!Number.isInteger(lengths[startChapter-1])||lengths[startChapter-1]<1)return null;
 if(startVerse===null)return {book:book.name,startChapter,startVerse:null,endChapter:startChapter,endVerse:null};
 if(startVerse<1||startVerse>lengths[startChapter-1])return null;
 if(endVerse!==null){
  if(endChapter<startChapter||endChapter>lengths.length||endVerse<1||endVerse>lengths[endChapter-1])return null;
  if(endChapter===startChapter&&endVerse<startVerse)return null;
 }
 return {book:book.name,startChapter,startVerse,endChapter,endVerse:endVerse??startVerse};
}
