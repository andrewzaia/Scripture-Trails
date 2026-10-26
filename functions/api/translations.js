import {TRANSLATIONS} from '../../public/assets/translations.js';

// Configuration only: never expose keys or spend Scripture API requests on polling.
export function onRequestGet({env}){
 return Response.json({translations:TRANSLATIONS.map(edition=>({
  code:edition.code,
  configured:Boolean(edition.provider==='Crossway'?env.ESV_API_KEY:env.API_BIBLE_KEY)
 }))},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
