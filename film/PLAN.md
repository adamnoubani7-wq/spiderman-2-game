# "Plot Twist" — 17 s stylized wrestling short

Stylized 3D (mannequin-style characters), built entirely in Python with Blender (`bpy`), rendered with Cycles on CPU.
24 fps, 408 frames, 960x540.

## Cast
- **Blonde** — long straight blonde hair, red singlet, slightly taller.
- **Curly** — big dark curly hair, teal singlet.
- **Crowd** — ~400 fans on stepped bleachers on all four sides of the ring.

## Shots
| # | Frames | Time | Camera | Action | Sound |
|---|---|---|---|---|---|
| 1 | 1–72 | 0–3 s | high wide, slow push-in | arena reveal, both bounce in fight stance and close in | crowd roar, bell |
| 2 | 73–168 | 3–7 s | ring-side orbit | collar-and-elbow lock-up, shoving, circling, Curly drives Blonde back | impacts, crowd swells |
| 3 | 169–216 | 7–9 s | close two-shot | Blonde breaks the hold and grabs Curly's head, pulls her in | crowd "ohh" builds |
| 4 | 217–276 | 9–11.5 s | close profile | **the kiss**; Curly's arms fly out in shock, then settle | crowd noise drops to silence |
| 5 | 277–336 | 11.5–14 s | pan across crowd | the crowd jumps up, arms up, mouths open — total shock | huge gasp, then uproar |
| 6 | 337–408 | 14–17 s | wide over the crowd | still kissing; title "PLOT TWIST" slams in | bass hit |

## Pipeline
1. `build.py` — arena, ring, crowd, both characters, all animation, cameras + camera-switch markers → `out/scene.blend`
2. `render.py` — resumable frame render (skips frames that already exist) → `out/frames/`
3. `sound.py` — synthesized crowd / impacts / gasp / bass hit, timed to the shot list → `out/sound.wav`
4. `ffmpeg` mux → `out/plot_twist.mp4`
