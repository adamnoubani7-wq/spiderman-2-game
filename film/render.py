"""Resumable render of film/out/scene.blend.
  python3 film/render.py                         # all frames, final settings -> out/frames/
  python3 film/render.py --test 1,90,200,240,300,380 --pct 50 --samples 12   # quick stills -> out/test/
"""
import bpy, os, sys, time, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
ap = argparse.ArgumentParser()
ap.add_argument("--test", default="")
ap.add_argument("--pct", type=int, default=100)
ap.add_argument("--samples", type=int, default=0)
ap.add_argument("--start", type=int, default=1)
ap.add_argument("--end", type=int, default=0)
ap.add_argument("--step", type=int, default=1)
a = ap.parse_args(sys.argv[1:])

bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "scene.blend"))
sc = bpy.context.scene
sc.render.resolution_percentage = a.pct
sc.render.threads_mode = "AUTO"
if a.samples:
    sc.cycles.samples = a.samples
if a.test:
    frames, d = [int(x) for x in a.test.split(",")], os.path.join(OUT, "test")
else:
    frames, d = list(range(a.start, (a.end or sc.frame_end) + 1, a.step)), os.path.join(OUT, "frames")
os.makedirs(d, exist_ok=True)

# camera for a frame = the last marker at or before it
marks = sorted((m.frame, m.camera) for m in sc.timeline_markers)
t0 = time.time()
done = 0
for f in frames:
    path = os.path.join(d, f"{f:04d}.png")
    if not a.test and os.path.exists(path):
        continue
    sc.frame_set(f)
    sc.camera = [c for mf, c in marks if mf <= f][-1]
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    done += 1
    el = time.time() - t0
    print(f"frame {f} done  {el / done:.1f}s/frame", flush=True)
print("finished", done, "frames in", round(time.time() - t0), "s")
