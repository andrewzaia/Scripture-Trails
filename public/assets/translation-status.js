export const TRANSLATION_STATUS=Object.freeze({
 checking:{label:'Checking',description:'Checking the translation configuration.'},
 configured:{label:'Configured',description:'The server key is configured. Availability is checked when you read a passage.'},
 loading:{label:'Loading',description:'Requesting the selected passage.'},
 available:{label:'Available',description:'The latest reading request succeeded in this session.'},
 not_configured:{label:'Not set up',description:'The server key has not been configured.'},
 rate_limited:{label:'Limit reached',description:'The provider request limit was reached. Try again later.'},
 passage_unavailable:{label:'No passage',description:'The requested passage is unavailable in this edition. Try the full chapter.'},
 unavailable:{label:'Unavailable',description:'The latest request failed. Select this translation to try again.'},
 unknown:{label:'Not checked',description:'Could not check the configuration. Select this translation to try reading.'}
});

export function statusForResponse(status,code){
 if(status>=200&&status<300)return 'available';
 if(code==='not_configured')return 'not_configured';
 if(status===429||code==='rate_limited')return 'rate_limited';
 if(code==='passage_unavailable')return 'passage_unavailable';
 return 'unavailable';
}
