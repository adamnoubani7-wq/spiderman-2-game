"""Per-line word alignment for long voiceovers (the engine's align.py runs the ASR model on the whole file,
which fails past a few minutes). Uses audio/line_XX.wav + audio/lines.json written by tts_kokoro.py.
Writes the same outputs as align.py: audio/words_new.json, words_ref.json, warp.json, web/words.js, web/warp.js."""
import json, os, re, difflib, glob, shutil, sys
import numpy as np, soundfile as sf, sherpa_onnx
KIT = sys.argv[1]
d = glob.glob(os.path.join(KIT, 'models', 'sherpa-onnx-nemo-parakeet*'))[0]
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f'{d}/encoder.int8.onnx', decoder=f'{d}/decoder.int8.onnx',
    joiner=f'{d}/joiner.int8.onnx', tokens=f'{d}/tokens.txt', model_type='nemo_transducer')
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
REPL = json.load(open('captions.json')) if os.path.exists('captions.json') else {}
meta = json.load(open('audio/lines.json'))
words = []
for m in meta:
    li, line = m['i'], m['text']
    for k, v in REPL.items(): line = line.replace(k, v)
    sw = line.split()
    a, sr = sf.read(f'audio/line_{li:02d}.wav', dtype='float32')
    if a.ndim > 1: a = a.mean(1)
    if sr != 16000:
        n = int(len(a) * 16000 / sr); a = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32); sr = 16000
    s = rec.create_stream(); s.accept_waveform(sr, a); rec.decode_stream(s); r = s.result
    asr = []
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith(' ') or tok.startswith('▁') or not asr: asr.append([tok.strip(' ▁'), ts])
        else: asr[-1][0] += tok
    sm = difflib.SequenceMatcher(a=[norm(w) for w in sw], b=[norm(w[0]) for w in asr], autojunk=False)
    st = [None] * len(sw)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): st[blk.a + k] = asr[blk.b + k][1]
    dur = m['dur']
    if st and st[0] is None: st[0] = 0.0
    for i in range(len(sw)):
        if st[i] is None:
            lo = next(j for j in range(i - 1, -1, -1) if st[j] is not None)
            hi = next((j for j in range(i + 1, len(sw)) if st[j] is not None), None)
            st[i] = st[lo] + ((st[hi] - st[lo]) * (i - lo) / (hi - lo) if hi is not None else (dur - st[lo]) * (i - lo) / (len(sw) - lo))
    for i, w in enumerate(sw):
        e = st[i + 1] if i + 1 < len(sw) else dur
        words.append({'w': w, 's': round(m['start'] + st[i], 3), 'e': round(m['start'] + min(e, st[i] + 1.2), 3), 'line': li})
total = sf.info('audio/vo.wav').duration
json.dump(words, open('audio/words_new.json', 'w'), indent=0)
shutil.copy('audio/words_new.json', 'audio/words_ref.json')
json.dump({'anchors': [[w['s'], w['s']] for w in words[::25]] + [[words[-1]['s'], words[-1]['s']]], 'old_end': words[-1]['e'], 'new_end': total}, open('audio/warp.json', 'w'))
open('web/words.js', 'w').write('const WORDS=' + json.dumps(words) + ';')
open('web/warp.js', 'w').write('window.WARP=null;')
print('words', len(words), 'duration', round(total, 2))
