import React from 'react';
import { Composition } from 'remotion';
import { Trailer } from './Main';
import { TRAILER_DUR } from './timeline';
import { ShotLead, LEAD_DUR } from './shots/LeadWordZoomAssemble';
import { ShotHero, HERO_DUR } from './shots/SpotlightHeroCard';
import { ShotTopics, TOPICS_DUR } from './shots/PillSlotCycle';
import { ShotMinute, MINUTE_DUR } from './shots/CountdownArcScatter';
import { ShotLockup, LOCKUP_DUR } from './shots/LogoShrinkWordmarkLockup';
import './brand';
const v = { fps: 30, width: 1920, height: 1080 } as const;
export const Root: React.FC = () => (
  <>
    <Composition id="Trailer" component={Trailer} durationInFrames={TRAILER_DUR} defaultProps={{ bgm: true }} {...v} />
    <Composition id="Lead" component={ShotLead} durationInFrames={LEAD_DUR} {...v} />
    <Composition id="Hero" component={ShotHero} durationInFrames={HERO_DUR} {...v} />
    <Composition id="Topics" component={ShotTopics} durationInFrames={TOPICS_DUR} {...v} />
    <Composition id="Minute" component={ShotMinute} durationInFrames={MINUTE_DUR} {...v} />
    <Composition id="Lockup" component={ShotLockup} durationInFrames={LOCKUP_DUR} {...v} />
  </>
);
