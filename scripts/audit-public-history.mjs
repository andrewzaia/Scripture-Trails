import {spawnSync} from 'node:child_process';

// Only print counts and classifications. Never disclose candidate secrets.
const git=(args,input)=>{
 const r=spawnSync('git',args,{input,maxBuffer:64*1024*1024});
 if(r.error||r.status!==0)throw Error('Git history audit failed at '+args[0]+'; inspect fetched refs');
 return r.stdout;
};
const lines=git(['rev-list','--objects','--all']).toString('utf8').trim().split('\n').filter(Boolean);
if(!lines.length)throw Error('No reachable objects available');
const paths=new Map();
for(const line of lines){
 const space=line.indexOf(' '),oid=space<0?line:line.slice(0,space);
 if(!/^[0-9a-f]{40,64}$/.test(oid))throw Error('Unexpected git object identifier');
 if(!paths.has(oid))paths.set(oid,space<0?'':line.slice(space+1));
}
const ids=[...paths.keys()];
const infos=git(['cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)'],Buffer.from(ids.join('\n')+'\n')).toString('utf8').trim().split('\n');
const blobs=infos.map(x=>x.split(' ')).filter(x=>x[1]==='blob').map(([oid,,size])=>({oid,size:Number(size),path:paths.get(oid)||''}));
if(!blobs.length)throw Error('No tracked blob objects found');
const sensitive=/(^|\/)(?:\.env(?:\.(?!example$)[^/]+)?|\.dev\.vars|id_(?:rsa|ed25519)|[^/]+\.(?:pem|p12|pfx|key))$/i;
const confidential=/(?:api[._-]?bible|biblica|crossway|abs).*(?:signed|contract|confidential|agreement).*\.(?:pdf|docx?|txt)$/i;
const signatures=[
 ['private-key-block',/-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
 ['github-classic',/\b(?:ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{36,}\b/],
 ['github-fine-grained',/\bgithub_pat_[A-Za-z0-9_]{50,}\b/],
 ['aws-access-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['google-api-key',/\bAIza[0-9A-Za-z_-]{35}\b/],
 ['stripe-live-key',/\bsk_live_[A-Za-z0-9]{16,}\b/],
 ['slack-token',/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/]
];
const found=new Map();let scanned=0,excluded=0;
for(const {path} of blobs){
 if(path==='.env.example')continue;
 if(sensitive.test(path)||confidential.test(path))found.set('sensitive-filename',(found.get('sensitive-filename')||0)+1);
}
const eligible=blobs.filter(x=>Number.isSafeInteger(x.size)&&x.size>=0&&x.size<=1048576);
excluded+=blobs.length-eligible.length;
for(let start=0;start<eligible.length;start+=24){
 const batch=eligible.slice(start,start+24);
 const raw=git(['cat-file','--batch'],Buffer.from(batch.map(x=>x.oid).join('\n')+'\n'));
 let offset=0;
 for(const item of batch){
  const end=raw.indexOf(10,offset);
  if(end<0)throw Error('Malformed Git batch header');
  const [oid,type,sizeText]=raw.subarray(offset,end).toString('utf8').split(' ');
  const size=Number(sizeText);
  if(oid!==item.oid||type!=='blob'||size!==item.size)throw Error('Unexpected Git batch object');
  const bytes=raw.subarray(end+1,end+1+size);
  if(bytes.length!==size||raw[end+1+size]!==10)throw Error('Incomplete Git blob');
  offset=end+size+2;
  if(bytes.includes(0)){excluded++;continue;}
  const content=bytes.toString('utf8');
  if(content.includes('\uFFFD')){excluded++;continue;}
  scanned++;
  for(const [name,regex] of signatures){
   if(regex.test(content))found.set(name,(found.get(name)||0)+1);
  }
 }
 if(offset!==raw.length)throw Error('Unexpected bytes after Git batch');
}
console.log('Reachable history security audit: '+JSON.stringify({
 objects:ids.length,blobs:blobs.length,textBlobsScanned:scanned,
 excludedBinaryOrOversized:excluded,potentialFindingCounts:Object.fromEntries([...found].sort(([a],[b])=>a.localeCompare(b)))
}));
if(found.size)process.exitCode=1;
