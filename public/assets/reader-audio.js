/** User-initiated ESV audio. Never store publisher audio locally. */
export function createReaderAudio({button,player,status}){
 let reference=null,enabled=false;
 const label=button.querySelector('[data-audio-label]');
 const feedback=message=>{status.textContent=message;};
 function render(){
  const playing=enabled&&!player.paused&&!player.ended,action=playing?'Pause':'Play';
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-label',action+' ESV audio for '+(reference||'the current passage'));
  button.title=enabled?action+' ESV reading of '+reference:'Audio is available after an ESV passage loads';
  label.textContent=playing?'Pause':'Listen';
 }
 function stop(){player.pause();player.removeAttribute('src');player.load();feedback('');render();}
 function sync({ref,translation,view,ready}){
  const available=translation==='ESV'&&view==='reader'&&ready===true;
  if(reference!==ref||enabled!==available)stop();
  enabled=available;reference=available?ref:null;
  button.hidden=translation!=='ESV';button.disabled=!available;render();
 }
 button.addEventListener('click',async()=>{
  if(!enabled)return;
  if(!player.paused){player.pause();return;}
  const requested=reference;
  if(!player.getAttribute('src'))player.src='/api/audio?q='+encodeURIComponent(requested);
  feedback('Loading ESV audio...');
  try{await player.play();if(enabled&&reference===requested)feedback('');}
  catch{if(enabled&&reference===requested){feedback('ESV audio could not play. Please try again.');render();}}
 });
 for(const event of ['play','playing','pause','ended'])player.addEventListener(event,render);
 player.addEventListener('error',()=>{if(enabled)feedback('ESV audio is temporarily unavailable. Please try again.');render();});
 sync({ref:null,translation:'ESV',view:'reader',ready:false});
 return {sync,stop};
}
