"""Actual Apple Safari responsive-layout audit, no page-zoom claims.

Use native SafariDriver-controlled window sizing; Safari's automation glass pane
blocks out-of-band keyboard zoom. Records actual CSS viewport and overflow.
"""
import json
import time
from selenium import webdriver
from selenium.webdriver.safari.options import Options

ROUTES=['discover','reader','connections','jesus-map','paul-map','hebrew-geography','city-studies','entities','roadmap','journeys','notebook','about']
JS="""const e=document.documentElement;const view=arguments[0];const target=document.getElementById('view-'+view);const version=document.getElementById('site-version');const nav=document.getElementById('menu-toggle');return {
  clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,cssWidth:window.innerWidth,
  ratio:window.devicePixelRatio,
  version:version?.textContent?.trim()||null,
  routePresent:!!target,routeVisible:!!target&&getComputedStyle(target).display!=='none'&&!target.hidden,
  menuVisible:!!nav&&getComputedStyle(nav).display!=='none',
  documentTitle:document.title
}"""
browser=None
records=[]
try:
    browser=webdriver.Safari(options=Options())
    browser.command_executor._client_config.timeout=35
    for requestedWidth in [1280,400]:
        browser.set_window_rect(width=requestedWidth,height=930)
        for view in ROUTES:
            browser.get('https://www.scripturetrails.com/?view='+view)
            time.sleep(0.15)
            d=browser.execute_script(JS,view)
            d.update({'requestedWindowWidth':requestedWidth,'view':view,'overflow':d['scrollWidth']>d['clientWidth']+4})
            records.append(d)
            print('SAFARI_NATIVE_VIEW '+json.dumps(d,separators=(",",":")),flush=True)
    failing=[x for x in records if x['version']!='v0.44.22' or not x['routePresent'] or not x['routeVisible'] or x['overflow']]
    widths={str(w):sorted(set(x['clientWidth'] for x in records if x['requestedWindowWidth']==w)) for w in [1280,400]}
    print('SAFARI_RESPONSIVE_VERDICT '+json.dumps({'count':len(records),'failures':failing,'measuredWidths':widths,'realSafari':True,'nativeZoomTested':False},separators=(",",":")),flush=True)
    if failing:raise RuntimeError('Native Safari responsive audit found '+str(len(failing))+' failed of '+str(len(records))+' checks')
finally:
    if browser:
        try:browser.quit()
        except Exception:pass
