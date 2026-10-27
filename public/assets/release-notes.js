/** Render public notes without inserting untrusted HTML. */
export async function initPublicReleases(){
 const versionNode=document.getElementById('site-version'),container=document.getElementById('public-release-list');
 if(!versionNode||!container)return;
 try{
  const res=await fetch('/data/releases.json');
  if(!res.ok)throw new Error('Release notes unavailable');
  const data=await res.json();
  if(!Array.isArray(data.releases)||!data.releases.length)throw new Error('No release notes');
  if(data.releases[0].version)versionNode.textContent='v'+data.releases[0].version;
  const root=document.createDocumentFragment();
  for(const entry of data.releases){
   const details=document.createElement('details');details.className='public-release-entry';
   const summary=document.createElement('summary'),name=document.createElement('span'),meta=document.createElement('span');
   name.className='public-release-title';name.textContent=entry.title;
   meta.className='public-release-meta';
   const date=document.createElement('time');date.dateTime=entry.date;
   date.textContent=new Date(entry.date+'T12:00:00Z').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
   meta.append(date);
   if(entry.version){const badge=document.createElement('span');badge.className='public-release-version';badge.textContent='v'+entry.version;meta.append(badge);}
   summary.append(name,meta);details.append(summary);
   const list=document.createElement('ul');
   for(const change of entry.changes){const li=document.createElement('li');li.textContent=change;list.append(li);}
   details.append(list);root.append(details);
  }
  container.replaceChildren(root);
 }catch{
  const note=document.createElement('p');note.textContent='Release notes are temporarily unavailable.';
  container.replaceChildren(note);
 }
}
