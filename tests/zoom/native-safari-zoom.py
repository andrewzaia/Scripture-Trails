"""Bounded native Safari zoom probe using WebDriver key actions.

No AppleScript application activation, which hung the first SafariDriver session.
Measure actual Safari DPR and layout viewport after each browser shortcut.
Do not certify zoom unless both independent metrics change accordingly.
"""
import json
import time
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.safari.options import Options

JS = """return {
  cssWidth:window.innerWidth,
  layoutWidth:document.documentElement.clientWidth,
  scrollWidth:document.documentElement.scrollWidth,
  ratio:window.devicePixelRatio,
  version:document.querySelector('#site-version')?.textContent?.trim()||null
}"""
def measure(driver):
    return driver.execute_script(JS)

driver=None
try:
    driver=webdriver.Safari(options=Options())
    driver.command_executor._client_config.timeout=35
    driver.set_window_rect(width=1280,height=940)
    driver.get('https://www.scripturetrails.com/?view=about')
    baseline=measure(driver)
    print("SAFARI_NATIVE_BASELINE "+json.dumps(baseline),flush=True)
    assert baseline['version']=='v0.44.22'
    steps=[]
    for keyname,key in [('equal',Keys.EQUAL),('add',Keys.ADD),('plus', '+')]:
        try:
            ActionChains(driver).key_down(Keys.COMMAND).send_keys(key).key_up(Keys.COMMAND).perform()
            time.sleep(0.5)
            current=measure(driver)
            steps.append({'key':keyname,'metrics':current})
            print('SAFARI_SHORTCUT_STEP '+json.dumps(steps[-1]),flush=True)
            if current['ratio']>baseline['ratio']*1.04 and current['layoutWidth']<baseline['layoutWidth']*0.97:
                break
        except Exception as exc:
            steps.append({'key':keyname,'error':type(exc).__name__+': '+str(exc)[:380]})
            print('SAFARI_SHORTCUT_ERROR '+json.dumps(steps[-1]),flush=True)
            break
    valid=any('metrics' in x and x['metrics']['ratio']>baseline['ratio']*1.04 and x['metrics']['layoutWidth']<baseline['layoutWidth']*0.97 for x in steps)
    print('SAFARI_SHORTCUT_VERDICT '+json.dumps({'verifiedInitialZoom':valid,'steps':steps}),flush=True)
    if not valid:
        raise RuntimeError('Safari native zoom did not measurably engage via WebDriver shortcuts')
finally:
    if driver:
        try:driver.quit()
        except Exception:pass
