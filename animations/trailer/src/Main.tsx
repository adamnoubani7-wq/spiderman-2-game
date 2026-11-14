import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import './brand';
import { LIST, SHOTS } from './timeline';
import { Sound } from './Sound';

export const Trailer: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    {LIST.map((s) => {
      const Comp = s.component;
      return (
        <Sequence key={s.id} from={SHOTS[s.id].from} durationInFrames={s.duration} name={s.id}>
          <Comp />
        </Sequence>
      );
    })}
    <Sound bgm={bgm} />
  </AbsoluteFill>
);
