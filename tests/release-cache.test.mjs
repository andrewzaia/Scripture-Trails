import test from 'node:test';
import assert from 'node:assert/strict';
import {initPublicReleases} from '../public/assets/release-notes.js';
test('release notes use the page version and bypass cached data without overwriting the footer',async()=>{
 const originalDocument=globalThis.document,originalFetch=globalThis.fetch;
 const footer={textContent:'v0.16.1'},container={replaceChildren(...children){this.children=children;}};let request;
 globalThis.document={getElementById:id=>id==='site-version'?footer:container,createElement:()=>({})};
 globalThis.fetch=async(url,options)=>{request={url,options};return {ok:true,json:async()=>({releases:[{version:'0.15.1'}]})};};
 try{await initPublicReleases();assert.deepEqual(request,{url:'/data/releases.json?v=0.16.1',options:{cache:'no-store'}});assert.equal(footer.textContent,'v0.16.1');assert.equal(container.children[0].textContent,'Release notes are temporarily unavailable.');}
 finally{globalThis.document=originalDocument;globalThis.fetch=originalFetch;}
});
