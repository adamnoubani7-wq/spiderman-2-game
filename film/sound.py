"""Synthesized soundtrack for 'Plot Twist', timed to the shot list (24 fps, 408 frames = 17 s).
python3 film/sound.py  ->  film/out/sound.wav
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS, DUR = 48000, 24, 408 / 24
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(5)
L, Rr = np.zeros(N), np.zeros(N)


def sec(frame):
    return (frame - 1) / FPS


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, hi, order=2):
    return sosfilt(butter(order, hi, "lowpass", fs=SR, output="sos"), x)


def env(points):
    """piecewise-linear envelope from (seconds, gain) points"""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl, gr = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    L[i:i + len(sig)] += sig * gain * gl
    Rr[i:i + len(sig)] += sig * gain * gr


KISS, REACT, TITLE = sec(214), sec(281), sec(350)

# ---- crowd bed: two decorrelated band-limited noise layers with a slow "breathing" wobble
crowd_level = env([(0, 0.0), (0.6, 0.55), (3.3, 0.6), (3.6, 0.85), (5.5, 0.65), (6.0, 0.85), (7.5, 0.7),
                   (sec(185), 0.85), (KISS - 0.1, 0.9), (KISS + 0.45, 0.012), (REACT - 0.05, 0.008),
                   (REACT + 1.2, 0.6), (REACT + 2.0, 1.0), (DUR, 0.95)])
for ch in (0, 1):
    n = rng.standard_normal(N)
    bed = bp(n, 250, 2600) * 0.5 + bp(rng.standard_normal(N), 90, 400) * 0.6
    wob = 1 + 0.25 * lp(rng.standard_normal(N), 3) * 40
    bed *= wob * crowd_level
    (L if ch == 0 else Rr)[:] += bed * 0.55

# ---- claps and whistles while the crowd is loud
def clap():
    k = int(0.03 * SR)
    return bp(rng.standard_normal(k), 900, 5000) * np.exp(-np.linspace(0, 8, k))


def whistle(dur):
    k = int(dur * SR)
    tt = np.arange(k) / SR
    f = 1800 + 700 * np.sin(np.pi * tt / dur) + rng.uniform(-200, 200)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.sin(np.pi * tt / dur) ** 2


for _ in range(900):
    s = rng.uniform(0, DUR)
    if KISS < s < REACT + 0.8:
        continue
    add(clap(), s, rng.uniform(0.05, 0.15) * float(crowd_level[int(s * SR)]), rng.uniform(-0.9, 0.9))
for s in list(rng.uniform(0.5, KISS - 0.5, 6)) + list(rng.uniform(REACT + 1.0, DUR - 0.3, 6)):
    add(whistle(rng.uniform(0.4, 0.8)), s, 0.05, rng.uniform(-0.8, 0.8))

# ---- ring bell at the start
def bell(dur=1.6):
    k = int(dur * SR)
    tt = np.arange(k) / SR
    out = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in
              [(1180, 1, 2.5), (2950, 0.5, 4), (4110, 0.3, 6), (5600, 0.15, 8)])
    return out * np.minimum(1, tt * 2000)


for s in (0.25, 0.55, 0.85):
    add(bell(), s, 0.12, 0.1)

# ---- body impacts in the lock-up
def thud(strength=1.0):
    k = int(0.35 * SR)
    tt = np.arange(k) / SR
    low = np.sin(2 * np.pi * (70 - 30 * tt / 0.35) * tt) * np.exp(-tt * 14)
    click = lp(rng.standard_normal(k), 2500) * np.exp(-tt * 60)
    return (low + 0.4 * click) * strength


for f, s_ in [(84, 1.0), (97, 0.5), (109, 0.55), (133, 0.6), (147, 0.8), (159, 0.5), (178, 0.6)]:
    add(thud(s_), sec(f), 0.3, rng.uniform(-0.2, 0.2))
# footsteps on the mat during the bouncing face-off
for f in range(4, 72, 6):
    add(thud(0.18), sec(f), 0.4, -0.3 if (f // 6) % 2 else 0.3)

# ---- "ohhh" as the crowd sees the grab, then silence + heartbeat at the kiss
def crowd_vowel(dur, f1, f2, rise=1.0, voices=40):
    k = int(dur * SR)
    tt = np.arange(k) / SR
    out = np.zeros(k)
    for _ in range(voices):
        f0 = rng.uniform(120, 300) * (1 + (rise - 1) * tt / dur) * (1 + 0.01 * np.sin(2 * np.pi * rng.uniform(4, 6) * tt))
        ph = 2 * np.pi * np.cumsum(f0) / SR + rng.uniform(0, 6)
        saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
        out += saw * rng.uniform(0.5, 1)
    out = bp(out, f1 * 0.7, f1 * 1.3) + 0.5 * bp(out, f2 * 0.8, f2 * 1.2)
    out += 0.3 * bp(rng.standard_normal(k), 400, 3000)   # breath
    a = np.minimum(1, tt / (dur * 0.25)) * np.minimum(1, (dur - tt) / (dur * 0.35))
    return out / voices * a


add(crowd_vowel(1.3, 500, 850, 1.15), sec(186), 4.0)          # "ooohh?" building at the grab


def heartbeat():
    return thud(0.9) + np.pad(thud(0.6), (int(0.16 * SR), 0))[: int(0.35 * SR)]


for s in (KISS + 0.55, KISS + 1.35, KISS + 2.15):
    add(lp(heartbeat(), 200), s, 0.22)

# ---- the shock: huge gasp "aaah!" then roar
add(crowd_vowel(1.6, 750, 1250, 1.35, 60), REACT - 0.05, 9.0)
add(crowd_vowel(1.2, 650, 1100, 1.2, 40), REACT + 0.7, 5.0, 0.3)
swell = bp(rng.standard_normal(int(0.5 * SR)), 300, 4000) * np.linspace(0, 1, int(0.5 * SR)) ** 2
add(swell, REACT - 0.5, 0.15)

# ---- title hit: reverse whoosh into a sub drop
k = int(0.9 * SR)
whoosh = bp(rng.standard_normal(k), 400, 6000) * np.linspace(0, 1, k) ** 3
add(whoosh, TITLE - 0.9, 0.35)
k = int(2.2 * SR)
tt = np.arange(k) / SR
sub = np.sin(2 * np.pi * (55 * np.exp(-tt * 0.8)) * tt) * np.exp(-tt * 1.5) + 0.3 * bp(rng.standard_normal(k), 60, 900) * np.exp(-tt * 8)
add(sub, TITLE, 0.45)

# ---- master: fade out, normalize, soft clip
mix = np.stack([L, Rr], 1)
mix *= np.minimum(1, (DUR - t) / 0.6)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6) * 0.89
os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
wavfile.write(os.path.join(HERE, "out", "sound.wav"), SR, (mix * 32767).astype(np.int16))
print("wrote sound.wav", round(DUR, 2), "s")
for a, b, lab in [(0, 3, 'faceoff'), (3, 7, 'lockup'), (7.5, 8.8, 'grab'), (9.3, 11.6, 'kiss silence'), (11.7, 13, 'GASP'), (13, 14.5, 'roar'), (14.6, 15.5, 'title')]:
    seg = mix[int(a * SR):int(b * SR)]
    print(f'{lab:13s} rms {20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):6.1f} dB')
