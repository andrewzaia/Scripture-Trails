import {chromium} from '@playwright/test';
import {execFileSync} from 'node:child_process';

// Real headed browser zoom experiment. No CSS transform, text-size injection,
// viewport emulation, DevTools page-scale override or simulated device metrics.
const browser=await chromium.launch({headless:false,args:['--window-size=1280,900']});
const context=await browser.newContext({viewport:null});
const page=await context.newPage();
const url='https://www.scripturetrails.com/?view=about';
const metrics=()=>page.evaluate(()=>({
  cssWidth:window.innerWidth,
  layoutWidth:document.documentElement.clientWidth,
  visualWidth:Math.round((window.visualViewport?.width||0)*10)/10,
  dpr:window.devicePixelRatio,
  scrollWidth:document.documentElement.scrollWidth,
  version:document.querySelector('#site-version')?.textContent?.trim()||null,
  activeView:document.querySelector('.view.active-view')?.id||null,
}));
const findings=[];
const routeResults=[];
const routeNames=['discover','reader','connections','jesus-map','paul-map','hebrew-geography','city-studies','entities','roadmap','journeys','notebook','about'];
async function inspectRoutesAtActualZoom(zoom){
 for(const view of routeNames){
  await page.goto('https://www.scripturetrails.com/?view='+view,{waitUntil:'load',timeout:30000});
  await page.locator('#view-'+view).waitFor({state:'visible',timeout:18000});
  if(view==='discover'&&zoom===400){
   await page.evaluate(()=>localStorage.removeItem('scripture-trails:analytics-consent'));
   await page.reload({waitUntil:'load'});
   await page.locator('#view-'+view).waitFor({state:'visible',timeout:18000});
  }
  let consent='not-shown';
  const panel=page.locator('#analytics-consent');
  if(await panel.isVisible()){
   try{
    await page.locator('#analytics-decline').click({timeout:4500});
    await panel.waitFor({state:'hidden',timeout:4500});
    consent='dismissed';
   }catch(e){consent='blocked';}
  }
  if(view==='reader')await page.locator('#passage-content[aria-busy="false"]').waitFor({state:'attached',timeout:18000});
  if(view==='connections')await page.locator('#atlas-preview-content[aria-busy="false"]').waitFor({state:'attached',timeout:18000});
  const measured=await metrics();
  const browserZoomMatches=Math.abs(measured.dpr-zoom/100)<0.08;
  const overflow=measured.scrollWidth>measured.layoutWidth+4;
  let drawer='not-tested';
  if(['discover','reader'].includes(view)){
   const button=page.locator('#menu-toggle');
   if(await button.isVisible()){
    try{
     await button.click({timeout:4500});
     const expanded=await button.getAttribute('aria-expanded');
     await page.keyboard.press('Escape');
     const collapsed=await button.getAttribute('aria-expanded');
     drawer=expanded==='true'&&collapsed==='false'?'pass':'fail';
    }catch(e){drawer='obstructed';}
   }
  }
  routeResults.push({zoom,view,dpr:measured.dpr,cssViewport:measured.layoutWidth,overflow,overflowPixels:measured.scrollWidth-measured.layoutWidth,consent,drawer,version:measured.version,browserZoomMatches});
 }
}
try{
 await page.goto(url,{waitUntil:'load'});
 await page.locator('#site-version').waitFor({state:'visible',timeout:20000});
 const baseline=await metrics();
 if(baseline.version!=='v0.44.22')throw Error('Version mismatch '+baseline.version);
 findings.push({phase:'baseline',...baseline});

 // First test Playwright keyboard commands; only a changed browser CSS viewport
 // and DPR count as authentic browser zoom evidence.
 await page.keyboard.press('Control+Equal');
 await page.waitForTimeout(250);
 const pw=await metrics();
 findings.push({phase:'playwright Control+Equal',...pw});
 const keyboardWorked=pw.cssWidth<baseline.cssWidth*0.98&&pw.dpr>baseline.dpr*1.02;
 if(!keyboardWorked){
  const raw=execFileSync('xdotool',['search','--onlyvisible','--name','Scripture Trails'],{encoding:'utf8'}).trim();
  const windows=raw.split(/\s+/).filter(Boolean);
  if(!windows.length)throw Error('OS Chrome window not found');
  execFileSync('xdotool',['windowactivate','--sync',windows.at(-1)]);
  // Native X11 keyboard events target the actual browser window, not the DOM.
  execFileSync('xdotool',['key','--clearmodifiers','ctrl+plus']);
  await page.waitForTimeout(250);
  findings.push({phase:'native xdotool ctrl+plus',...(await metrics())});
 }
 let reached200=false,reached400=false;
 for(let i=0;i<11;i++){
  const current=await metrics();
  const zoom=current.dpr/baseline.dpr;
  if(!reached200&&zoom>=1.9){reached200=true;findings.push({phase:'200-percent-candidate',...current});await inspectRoutesAtActualZoom(200);}
  if(!reached400&&zoom>=3.9){reached400=true;findings.push({phase:'400-percent-candidate',...current});await inspectRoutesAtActualZoom(400);break;}
  const raw=execFileSync('xdotool',['search','--onlyvisible','--name','Scripture Trails'],{encoding:'utf8'}).trim();
  const windows=raw.split(/\s+/).filter(Boolean);
  execFileSync('xdotool',['windowactivate','--sync',windows.at(-1)]);
  execFileSync('xdotool',['key','--clearmodifiers','ctrl+plus']);
  await page.waitForTimeout(200);
  findings.push({phase:'native-zoom-step-'+(i+1),...(await metrics())});
 }
 const end=await metrics();
 const measured=end.cssWidth>0&&baseline.cssWidth/end.cssWidth>=1.9&&end.dpr/baseline.dpr>=1.9;
 console.log('ACTUAL_BROWSER_ZOOM_PROBE',JSON.stringify({
  baseline,final:end,keyboardWorked,
  nativeZoomMeasured:measured,reached200,reached400,
  snapshots:findings,routeResults
 }));
 if(!measured)throw Error('Real headed browser zoom could not be verified; no true-zoom acceptance may be claimed');
 const violations=routeResults.filter(x=>x.overflow||(x.drawer==='fail'||x.drawer==='obstructed'||x.consent==='blocked')||!x.browserZoomMatches||x.version!=='v0.44.22');
 if(violations.length)throw Error('Actual browser zoom failed '+violations.length+' of '+routeResults.length+' sampled view checks; inspect ACTUAL_BROWSER_ZOOM_PROBE output');
}finally{await browser.close();}
