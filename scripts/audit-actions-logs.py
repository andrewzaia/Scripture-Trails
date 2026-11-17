#!/usr/bin/env python3
"""Temporary audit: inspect publicly accessible GitHub Actions logs without displaying their content."""
import concurrent.futures
import io
import json
import os
from pathlib import Path
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

REPO = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
OUT = Path(os.environ["RUNNER_TEMP"]) / "audit-actions-logs"
OUT.mkdir(mode=0o700, exist_ok=True)
API = f"https://api.github.com/repos/{REPO}"
MAX_UNCOMPRESSED_PER_FILE = 12 * 1024 * 1024
MAX_UNCOMPRESSED_TOTAL = 1024 * 1024 * 1024
MAX_ARCHIVE_BYTES = 60 * 1024 * 1024

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener = urllib.request.build_opener(NoRedirect())

def request_api(path):
    url = API + path
    for attempt in range(3):
        req = urllib.request.Request(url, headers={
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + TOKEN,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "scripture-trails-one-off-audit",
        })
        try:
            return 200, opener.open(req, timeout=45)
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                loc = e.headers.get("Location", "")
                if not loc.startswith("https://"):
                    raise RuntimeError("Unsafe redirect from GitHub API")
                # Signed redirect is fetched WITHOUT the GitHub token.
                return 200, urllib.request.urlopen(urllib.request.Request(loc, headers={"User-Agent":"scripture-trails-audit"}), timeout=60)
            if e.code in (404, 410):
                return e.code, None
            if e.code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(1 + attempt * 2)
                continue
            raise RuntimeError(f"GitHub API returned HTTP {e.code}") from None
    raise RuntimeError("GitHub API exhausted retries")

runs = []
for page in range(1, 25):
    status, response = request_api(f"/actions/runs?per_page=100&page={page}")
    if status != 200:
        raise RuntimeError("Cannot enumerate complete Actions history")
    with response:
        payload = json.load(response)
    if page == 1:
        declared = int(payload.get("total_count", -1))
        if declared < 0 or declared > 2200:
            raise RuntimeError("Unexpected run count, review pagination bounds")
    batch = payload.get("workflow_runs", [])
    if not isinstance(batch, list):
        raise RuntimeError("Invalid Actions run list")
    runs.extend(int(x["id"]) for x in batch)
    if len(batch) < 100:
        break
else:
    raise RuntimeError("Actions pagination exhausted")
if not runs or len(set(runs)) != len(runs):
    raise RuntimeError("No unique Actions runs")
print(f"Enumerated Actions workflow runs: {len(runs)}", flush=True)

def archive_for(run_id):
    status, response = request_api(f"/actions/runs/{run_id}/logs")
    if status != 200:
        return (run_id, "unavailable", [])
    with response:
        blob = response.read(MAX_ARCHIVE_BYTES + 1)
    if len(blob) > MAX_ARCHIVE_BYTES:
        return (run_id, "oversized-archive", [])
    if not zipfile.is_zipfile(io.BytesIO(blob)):
        return (run_id, "invalid-archive", [])
    items = []
    try:
        with zipfile.ZipFile(io.BytesIO(blob)) as archive:
            for info in archive.infolist():
                if info.is_dir():
                    continue
                if info.file_size > MAX_UNCOMPRESSED_PER_FILE:
                    return (run_id, "oversized-file", [])
                # Never use untrusted ZIP entry names as output paths.
                with archive.open(info) as stream:
                    data = stream.read(MAX_UNCOMPRESSED_PER_FILE + 1)
                if len(data) != info.file_size:
                    return (run_id, "unreadable-file", [])
                items.append(data)
    except (zipfile.BadZipFile, EOFError, OSError):
        return (run_id, "invalid-archive", [])
    return (run_id, "ok" if items else "empty-archive", items)

counts = {}
files = 0
total_bytes = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for i, result in enumerate(pool.map(archive_for, runs), 1):
        run_id, category, contents = result
        counts[category] = counts.get(category, 0) + 1
        if category == "ok":
            for n, payload in enumerate(contents):
                total_bytes += len(payload)
                if total_bytes > MAX_UNCOMPRESSED_TOTAL:
                    raise RuntimeError("Log size budget exceeded, full audit incomplete")
                (OUT / f"{run_id}-{n:04d}.log").write_bytes(payload)
                files += 1
        if i % 100 == 0:
            print(f"Archives processed: {i} of {len(runs)}", flush=True)
summary = {"workflowRunsEnumerated":len(runs),"results":counts,"logFilesExtracted":files,"extractedBytes":total_bytes}
print("Actions log fetch summary: " + json.dumps(summary,sort_keys=True),flush=True)
if counts.get("ok",0) == 0:
    raise RuntimeError("No readable Actions logs available")
if any(k != "ok" for k in counts):
    # Allow scanning available logs, but flag incomplete coverage in the workflow.
    (OUT.parent / "audit-actions-incomplete").write_text("incomplete")
