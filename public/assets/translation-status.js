export const TRANSLATION_STATUS=Object.freeze({
 available:{label:'Available',description:'Available unless a reading request identifies a problem.'},
 unavailable:{label:'Unavailable',description:'The latest request failed. Try again using the translation selector in the Bible reader.'}
});

export function statusForResponse(status){
 return status>=200&&status<300?'available':'unavailable';
}
