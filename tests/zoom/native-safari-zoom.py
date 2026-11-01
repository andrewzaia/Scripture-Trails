"""Actual Apple Safari native browser zoom acceptance probe.

Isolated GitHub macOS runner, not deployed. Uses Safari's own WebDriver for DOM
measurement and actual macOS keyboard events to operate Safari page zoom.
No CSS transforms, synthetic text zoom, CDP, or viewport overrides for zoom.
"""
import json
import subprocess
import time
from selenium import webdriver
from selenium.webdriver.safari.options import Options

URL = "https://www.scripturetrails.com/?view=about"
JS_METRICS = """return {
  cssWidth: window.innerWidth,
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  ratio: window.devicePixelRatio,
  visualWidth: window.visualViewport ? window.visualViewport.width : null,
  version: document.querySelector('#site-version')?.textContent?.trim() ?? null,
  title: document.title
}"""

def native_zoom_in():
    script = 'tell application "Safari" to activate\ndelay 0.2\ntell application "System Events" to keystroke "+" using {command down}'
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=18)
    if result.returncode:
        raise RuntimeError("Native macOS keyboard zoom was not available: " + (result.stderr or result.stdout)[:700])

def metrics(driver):
    value = driver.execute_script(JS_METRICS)
    value["overflow"] = value["scrollWidth"] > value["clientWidth"] + 4
    return value

driver = None
try:
    options = Options()
    driver = webdriver.Safari(options=options)
    driver.set_window_rect(width=1280, height=940)
    driver.get(URL)
    time.sleep(2)
    baseline = metrics(driver)
    if baseline["version"] != "v0.44.22":
        raise RuntimeError("Wrong production version " + str(baseline["version"]))
    snapshots = [{"stage": "baseline", **baseline}]
    reached_200 = False
    reached_400 = False
    for index in range(22):
        native_zoom_in()
        time.sleep(0.35)
        current = metrics(driver)
        relative = current["ratio"] / baseline["ratio"]
        snapshots.append({"stage": f"native-zoom-{index + 1}", "relative": relative, **current})
        if not reached_200 and relative >= 1.95:
            reached_200 = True
            snapshots.append({"stage": "actual-200-percent", **current})
        if not reached_400 and relative >= 3.95:
            reached_400 = True
            snapshots.append({"stage": "actual-400-percent", **current})
            break
    result = {
        "engine": "Apple Safari",
        "baseline": baseline,
        "final": metrics(driver),
        "reached200": reached_200,
        "reached400": reached_400,
        "snapshots": snapshots
    }
    print("NATIVE_SAFARI_ZOOM_PROBE " + json.dumps(result, separators=(",", ":")), flush=True)
    if not (reached_200 and reached_400):
        raise RuntimeError("Native Safari 200%/400% page zoom was not established")
    if any(p["overflow"] for p in snapshots if p["stage"] in ("actual-200-percent", "actual-400-percent")):
        raise RuntimeError("Safari document horizontal overflow was detected at zoom")
finally:
    if driver:
        driver.quit()
