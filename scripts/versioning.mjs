export function parseSemver(value){
 const match=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value||'');
 if(!match)throw new Error('Invalid semantic version: '+value);
 return match.slice(1).map(Number);
}
export function compareVersions(left,right){
 const a=parseSemver(left),b=parseSemver(right);
 for(let i=0;i<3;i++){if(a[i]!==b[i])return Math.sign(a[i]-b[i]);}
 return 0;
}
export function nextVersion(current,level){
 const [major,minor,patch]=parseSemver(current);
 switch(level){
  case 'major':return `${major+1}.0.0`;
  case 'minor':return `${major}.${minor+1}.0`;
  case 'patch':return `${major}.${minor}.${patch+1}`;
  default:throw new Error('Use major, minor or patch');
 }
}
export function validateReleases(releases,version){
 parseSemver(version);
 if(!Array.isArray(releases)||!releases.length)throw new Error('Release history cannot be empty');
 if(releases[0].version!==version)throw new Error('Newest public release must match package.json version');
 const used=new Set(),seenVersions=new Set();
 for(const item of releases){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||!Number.isFinite(Date.parse(item.date)))throw new Error('Invalid release date');
  if(!item.title?.trim()||!Array.isArray(item.changes)||!item.changes.length||item.changes.some(x=>typeof x!=='string'||!x.trim()))throw new Error('Each release needs a title and public changes');
  const identifier=`${item.date}/${item.title}`;
  if(used.has(identifier))throw new Error('Duplicate public release entry: '+identifier);
  used.add(identifier);
  if(item.version){
   parseSemver(item.version);
   if(seenVersions.has(item.version))throw new Error('Repeated release version: '+item.version);
   seenVersions.add(item.version);
   if(compareVersions(item.version,version)>0)throw new Error('Historical entry is newer than the live version');
  }
 }
 if(!releases.some(entry=>entry.version==='0.1.0'))throw new Error('Initial version must remain in the release history');
 return true;
}
