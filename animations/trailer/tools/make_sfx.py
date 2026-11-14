"""Synthesise the trailer's SFX (Freesound refused this server). Writes public/audio/sfx/*.wav and a manifest
with each file's measured peak offset, used for frame pinning (sound-design 4.6, offset two)."""
import json, os, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'sfx'); os.makedirs(OUT, exist_ok=True)
T = lambda n: np.arange(n) / SR
def bp(x, lo, hi): b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f): b, a = signal.butter(2, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f): b, a = signal.butter(2, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def norm(x, peak=0.89): return x / (np.max(np.abs(x)) + 1e-9) * peak
def whoosh(dur, rise=0.6, lo=300, hi=5000):
    n = int(dur * SR); t = T(n); x = rng.standard_normal(n)
    k = np.clip(t / (dur * rise), 0, 1); y = bp(x, lo, 1400) * (1 - k) + bp(x, 1400, hi) * k
    env = np.where(t < dur * rise, (t / (dur * rise)) ** 2, np.exp(-(t - dur * rise) * 9))
    return norm(y * env)
def impact(dur=1.2):
    n = int(dur * SR); t = T(n); f = 55 * (1 + 2.5 * np.exp(-t * 25))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    crack = hp(rng.standard_normal(n), 1800) * np.exp(-t * 60) * 0.5
    tail = lp(rng.standard_normal(n), 900) * np.exp(-t * 3.5) * 0.25
    return norm(body + crack + tail)
def clunk():
    n = int(0.45 * SR); t = T(n); x = lp(rng.standard_normal(n), 500) * np.exp(-t * 30) + np.sin(2 * np.pi * 95 * t) * np.exp(-t * 22) * 0.8
    x += hp(rng.standard_normal(n), 2500) * np.exp(-t * 120) * 0.4
    return norm(x)
def sparkle():
    n = int(1.2 * SR); out = np.zeros(n)
    for i, f in enumerate([2093, 2637, 3136, 3951, 4699]):
        s = int(i * 0.06 * SR); m = n - s; t = T(m)
        out[s:] += (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 5) * np.minimum(1, t / 0.003) * (0.9 - i * 0.1)
    return norm(out, 0.8)
def tick(f=2600):
    n = int(0.06 * SR); t = T(n); return norm(hp(rng.standard_normal(n), 3000) * np.exp(-t * 180) + np.sin(2 * np.pi * f * t) * np.exp(-t * 120) * 0.5, 0.8)
def snap():
    n = int(0.3 * SR); t = T(n); return norm(hp(rng.standard_normal(n), 1200) * np.exp(-t * 45) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 30) * 0.6)
def ratchet(dur=0.9, clicks=14):
    n = int(dur * SR); out = np.zeros(n); c = tick(1900)
    for k in range(clicks):
        s = int((k / clicks) ** 1.4 * (dur - 0.07) * SR); out[s:s + len(c)] += c * (1 - 0.5 * k / clicks)
    return norm(out, 0.7)
FILES = {'whoosh-soft.wav': whoosh(0.5, 0.55), 'whoosh-big.wav': whoosh(0.9, 0.6, 200, 6000), 'impact.wav': impact(),
         'clunk.wav': clunk(), 'sparkle.wav': sparkle(), 'tick-a.wav': tick(2600), 'tick-b.wav': tick(2200),
         'snap.wav': snap(), 'ratchet.wav': ratchet()}
man = {}
for name, x in FILES.items():
    sf.write(os.path.join(OUT, name), x.astype(np.float32), SR)
    e = np.convolve(x ** 2, np.ones(480) / 480, 'same')  # 10 ms energy window
    man[name] = {'source': 'synthesised in tools/make_sfx.py (Freesound returned 403 to this server)', 'license': 'own work',
                 'duration_s': round(len(x) / SR, 3), 'peak_s': round(int(np.argmax(e)) / SR, 4)}
json.dump(man, open(os.path.join(OUT, 'audio-manifest.json'), 'w'), indent=1)
print(json.dumps({k: v['peak_s'] for k, v in man.items()}))
