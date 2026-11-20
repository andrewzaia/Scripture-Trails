import {parseRef} from './books.js';

// The data is imported from pinned source editions and hosted as local book shards.
// No licensed English translation text is stored in or requested by this module.
const bookCache=new Map();
const make=(tag,className,text)=>{
 const element=document.createElement(tag);
 if(className)element.className=className;
 if(text!==undefined)element.textContent=text;
 return element;
};
export function originalLanguageFor(reference){
 const parsed=typeof reference==='string'?parseRef(reference):reference;
 if(!parsed)return null;
 return parsed.book.index<39?{code:'he',name:'Biblical Hebrew',source:'Westminster Leningrad Codex'}:{code:'syc',name:'Syriac Aramaic',source:'Peshitta New Testament'};
}
export function verseScriptLanguage(reference,verse){
 const parsed=typeof reference==='string'?parseRef(reference):reference;
 if(!parsed)return null;
 if(parsed.book.index>=39)return 'syc';
 const chapter=parsed.chapter,n=Number(verse),book=parsed.book.abbr;
 if(book==='Dan'&&(chapter>2&&chapter<8||chapter===2&&n>=4))return 'arc';
 if(book==='Ezra'&&(chapter===5||chapter===6&&n<=18||chapter===4&&n>=8||chapter===7&&n>=12&&n<=26))return 'arc';
 return 'he';
}
async function getBook(slug){
 if(!bookCache.has(slug)){
  const task=fetch('/data/originals/'+encodeURIComponent(slug)+'.json')
   .then(async response=>{
    if(!response.ok)throw Error('Original-language source is unavailable.');
    const record=await response.json();
    if(!record||typeof record!=='object'||!record.chapters||typeof record.chapters!=='object')throw Error('Original-language source is incomplete.');
    return record;
   }).catch(error=>{bookCache.delete(slug);throw error;});
  bookCache.set(slug,task);
 }
 return bookCache.get(slug);
}
export function originalVerseSelection(reference,data){
 const ref=typeof reference==='string'?parseRef(reference):reference;
 if(!ref||!data?.chapters)return [];
 const chapter=data.chapters[String(ref.chapter)]||{};
 const from=ref.verse??1,to=ref.end??(ref.verse===null?Math.max(0,...Object.keys(chapter).map(Number)):ref.verse);
 const verses=[];
 for(let verse=from;verse<=Math.min(to,176);verse++)verses.push({number:verse,text:chapter[String(verse)]||null});
 return verses;
}
/**
 * Keep the existing publisher-supplied HTML intact while presenting a companion
 * original-language panel. The guard prevents stale async updates after navigation.
 */
export async function showOriginalPassage(container,reference,{wrapEnglish=true,compact=false,guard=()=>true}={}){
 const ref=parseRef(reference);
 if(!ref||!container)return;
 const language=originalLanguageFor(ref);
 const layout=make('div','parallel-scripture'+(compact?' parallel-scripture-compact':''));
 const sourcePanel=make('section','original-scripture');
 const heading=make('div','original-scripture-heading');
 heading.append(make('strong','',language.name),make('small','',language.source));
 const lines=make('div','original-scripture-verses');
 lines.append(make('p','original-scripture-status','Loading source text...'));
 sourcePanel.append(heading,lines);
 if(wrapEnglish){
  const english=make('div','parallel-english');
  english.append(...Array.from(container.childNodes));
  layout.append(sourcePanel,english);
 }else layout.append(sourcePanel);
 container.replaceChildren(layout);
 const valid=()=>guard()&&layout.isConnected;
 try{
  const data=await getBook(ref.book.abbr.toLowerCase());
  if(!valid())return;
  lines.replaceChildren();
  heading.querySelector('small').textContent=language.code==='syc'?(data.editionNote?'Later Syriac NT tradition (SEDRA 3.0)':'Peshitta (SEDRA 3.0)'):(data.source||language.source);
  if(ref.verse===null&&data.superscriptions?.[String(ref.chapter)]){
   lines.append(make('p','original-superscription',data.superscriptions[String(ref.chapter)]));
  }
  const verses=originalVerseSelection(ref,data);
  for(const item of verses){
   const row=make('p','original-verse');
   const number=make('span','original-verse-number',String(item.number));
   const body=make('bdi','original-verse-text',item.text||'Text not available for this verse in the mapped edition.');
   const script=verseScriptLanguage(ref,item.number);
   body.lang=script;body.dir='rtl';
   if(!item.text)row.classList.add('original-verse-unmapped');
   row.append(number,body);lines.append(row);
  }
  if(!verses.length)lines.append(make('p','original-scripture-status','No verse-aligned text is available for this chapter.'));
  if(data.editionNote)sourcePanel.append(make('p','original-edition-note',data.editionNote));
  const link=make('a','original-source-link','Source and licensing');
  link.href=language.code==='he'?'https://github.com/openscriptures/morphhb':'https://github.com/ETCBC/syrnt';
  link.target='_blank';link.rel='noopener noreferrer';
  sourcePanel.append(link);
 }catch(error){
  if(valid())lines.replaceChildren(make('p','original-scripture-status',error.message||'Source text is unavailable.'));
 }
}
