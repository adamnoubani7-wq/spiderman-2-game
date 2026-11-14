import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import manifest from '../public/audio/sfx/audio-manifest.json';
import { SHOTS, TRAILER_DUR } from './timeline';

// sound-design 4.6: from = target peak frame - source peak lag - output track offset
export const OUTPUT_AUDIO_OFFSET_F = 1.28; // AAC priming at 48 kHz; re-measured after render (see out/qa/audio-offset.txt)
const PEAK_F = (src: string) => ((manifest as Record<string, { peak_s: number }>)[src]?.peak_s ?? 0) * 30;
const sfxFrom = (targetPeakF: number, src: string) => Math.max(0, Math.round(targetPeakF - PEAK_F(src) - OUTPUT_AUDIO_OFFSET_F));
const cue = (target: number, src: string, volume: number, note: string) => ({ from: sfxFrom(target, src), src, volume, note });

const S = SHOTS;
const PILL_SWAPS = [0, 1, 2, 3].map((i) => S.topics.from + 12 + i * 21 + 4);
export const SFX = [
  cue(S.lead.from + 3, 'whoosh-soft.wav', 0.6, 'lead word blurs in'),
  cue(S.lead.from + 82, 'whoosh-big.wav', 0.8, 'crash zoom hands over to the theatre'),
  cue(S.hero.from + 3, 'clunk.wav', 1.0, 'stage lamp switched on'),
  cue(S.hero.from + 61, 'whoosh-soft.wav', 0.8, 'hero card rises'),
  cue(S.hero.from + 70, 'sparkle.wav', 0.6, 'beam lap 1'),
  cue(S.hero.from + 142, 'snap.wav', 1.4, 'card reseats'),
  ...PILL_SWAPS.map((f, i) => cue(f, i % 2 ? 'tick-b.wav' : 'tick-a.wav', 1.35 - i * 0.1, `pill ${i + 1} lands`)),
  cue(S.topics.from + 104, 'snap.wav', 1.5, '"the math." lands'),
  cue(S.minute.from + 6, 'ratchet.wav', 1.6, 'dial sweeps'),
  cue(S.minute.from + 52, 'tick-a.wav', 1.8, '"60" lands in the title'),
  cue(S.lockup.from + 26, 'whoosh-big.wav', 0.8, 'ring shrinks'),
  cue(S.lockup.from + 37, 'impact.wav', 1.0, 'ring brakes into the icon'),
  cue(S.lockup.from + 62, 'sparkle.wav', 0.7, 'wordmark slides in'),
];

export const Sound: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm ? (
      <Audio
        src={staticFile('audio/bgm/house-vibez.mp3')}
        volume={(f) => 0.42 * interpolate(f, [0, 15, TRAILER_DUR - 45, TRAILER_DUR - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    ) : null}
    {SFX.map((c, i) => (
      <Sequence key={i} from={c.from} name={`sfx ${c.note}`} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.src}`)} volume={c.volume} />
      </Sequence>
    ))}
  </>
);
