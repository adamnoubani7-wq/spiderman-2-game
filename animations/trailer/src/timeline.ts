import { ShotLead, LEAD_DUR } from './shots/LeadWordZoomAssemble';
import { ShotHero, HERO_DUR } from './shots/SpotlightHeroCard';
import { ShotTopics, TOPICS_DUR } from './shots/PillSlotCycle';
import { ShotMinute, MINUTE_DUR } from './shots/CountdownArcScatter';
import { ShotLockup, LOCKUP_DUR } from './shots/LogoShrinkWordmarkLockup';

// Single source of truth for the timeline (DESIGN.md stage 3). Captions/SFX derive from it.
export const LIST = [
  { id: 'lead', component: ShotLead, duration: LEAD_DUR },
  { id: 'hero', component: ShotHero, duration: HERO_DUR },
  { id: 'topics', component: ShotTopics, duration: TOPICS_DUR },
  { id: 'minute', component: ShotMinute, duration: MINUTE_DUR },
  { id: 'lockup', component: ShotLockup, duration: LOCKUP_DUR },
] as const;
export const SHOTS = (() => {
  let from = 0;
  return Object.fromEntries(LIST.map((s) => { const r = { ...s, from }; from += s.duration; return [s.id, r]; })) as Record<(typeof LIST)[number]['id'], (typeof LIST)[number] & { from: number }>;
})();
export const TRAILER_DUR = LIST.reduce((a, s) => a + s.duration, 0);

