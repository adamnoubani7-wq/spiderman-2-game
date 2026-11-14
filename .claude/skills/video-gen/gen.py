#!/usr/bin/env python3
"""Text-to-video through fal.ai's queue API. Standard library only.

  gen.py --prompt "..." [--model fal-ai/kling-video/v3/standard/text-to-video]
         [--aspect 9:16] [--duration 5] [--param key=value ...] [--out clip.mp4]

The key comes from FAL_KEY. In a Claude cloud session the network proxy injects the saved key,
so FAL_KEY can be unset (a placeholder is sent and replaced by the proxy).
"""
import argparse, json, os, sys, time, urllib.request, urllib.error

p = argparse.ArgumentParser()
p.add_argument("--prompt", required=True)
p.add_argument("--model", default="fal-ai/kling-video/v3/standard/text-to-video")
p.add_argument("--aspect", default="9:16", help="aspect_ratio sent to the model, e.g. 9:16, 16:9, 1:1")
p.add_argument("--duration", default="5", help="seconds, sent as a string (most fal video models expect \"5\" or \"10\")")
p.add_argument("--param", action="append", default=[], help="extra model input, key=value (JSON values allowed)")
p.add_argument("--out", default="clip.mp4")
p.add_argument("--timeout", type=int, default=900)
a = p.parse_args()

KEY = os.environ.get("FAL_KEY") or "proxy-injected"
HDR = {"Authorization": f"Key {KEY}", "Content-Type": "application/json"}

def call(url, body=None, method=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers=HDR, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} from {url}: {e.read().decode()[:600]}")

inp = {"prompt": a.prompt, "aspect_ratio": a.aspect, "duration": a.duration}
for kv in a.param:
    k, v = kv.split("=", 1)
    try: v = json.loads(v)
    except ValueError: pass
    inp[k] = v

job = call(f"https://queue.fal.run/{a.model}", inp, "POST")
print(f"queued {job.get('request_id')} on {a.model}", flush=True)
t0 = time.time(); last = None
while True:
    st = call(job["status_url"])
    s = st.get("status")
    if s != last: print(f"  {s}  {int(time.time() - t0)}s", flush=True); last = s
    if s == "COMPLETED": break
    if time.time() - t0 > a.timeout: sys.exit(f"timed out after {a.timeout}s; request_id {job.get('request_id')}")
    time.sleep(5)
res = call(job["response_url"])

def find_url(o):
    if isinstance(o, dict):
        if isinstance(o.get("url"), str) and (o.get("content_type", "").startswith("video") or o["url"].split("?")[0].endswith((".mp4", ".mov", ".webm"))): return o["url"]
        for v in o.values():
            u = find_url(v)
            if u: return u
    if isinstance(o, list):
        for v in o:
            u = find_url(v)
            if u: return u
url = find_url(res)
if not url: sys.exit("no video in the result: " + json.dumps(res)[:800])
json.dump({"model": a.model, "input": inp, "result": res}, open(os.path.splitext(a.out)[0] + ".json", "w"), indent=1)
with urllib.request.urlopen(url, timeout=300) as r, open(a.out, "wb") as f: f.write(r.read())
print(f"saved {a.out} ({os.path.getsize(a.out) // 1024} KB) from {url}")
