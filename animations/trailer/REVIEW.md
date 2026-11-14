# Final review: Stick Science Lab trailer

Checked against `references/final-review.md` and `aesthetic-rules.md`. The evidence is the key-frame sheet
(`qa/final-sheet.jpg`, 24 frames covering every shot and every join), the per-shot stills (`out/qa/v1/`)
and the audio measurements (`qa/audio-offset.txt`, `qa/audio-check.txt`).

**Deviation from the skill:** the skill asks for the review to be done by a separate, clean-context agent.
This session only starts helper agents when the user asks for one, so the producing agent did this review
itself. That carries the confirmation-bias risk the skill warns about, so a second look by a person is worthwhile.

## P: product goals
- P1 ✓ Format, channel name and audience are clear by f645 (lockup with name, motto and handle).
- P2 ✓ The order follows the brief's priorities: hook (f0–83), real Short (f84–255), topics (f256–413), format (f414–513), brand (f514–645).
- P3 ✓ No unproven claims. "Under a minute" holds (the Short is 43 s). No posting schedule is promised. The topic pills name categories the channel intends to cover; only "movie scenes" exists so far. *Suggestion:* change the pills if the channel's direction changes.
- P4 ✓ Every row of the decision table is visible on screen (DESIGN.md).

## F: features
- F1 ✓ All five must-shows appear: hook (f50), real Short playing in the hero card (f135–255), topics (f300, f352), "60 sec to the answer" (f470), lockup (f645).
- F2 ✓ No repeated tagline. The subline "Real science, explained by stick figures" (f50) and the outro motto "REAL SCIENCE. STICK FIGURES." (f645) are close. *Suggestion:* change one if it reads as repetition.
- F3 ✓ The hero card shows the real reel, not a placeholder.

## V: visual direction
- V1 ✓ Poppins Bold display, Inter small text, ink, red accent (one word per shot: web, math, answer), blue glow, yellow beam and marker.
- V2 ✓ The cards' tuned timings are kept; the lockup holds 1.4 s after the motto lands.
- V3 ✓ The dark theatre (shot 2) and dark lockup (shot 5) are the cards' own looks, recoloured to the brand. No off-brand neon.
- V4 ✓ No banned elements; no third-party branding on screen.

## S: shot cards
- S1 ✓ All five mapped cards appear in order.
- S2 n/a The user didn't name specific variants.
- S3 ✓ Motion grammar and timings come from each demo's TSX unchanged: lead pivot and easing curves; spotlight station, lock, push, rise, two beam laps and reseat frames; pill BEAT=21 and SWAP=8; dial spring; lockup t-curves.
- S4 ✓ Known pitfalls respected: lead pivot measured at mount; the note's backing ends before the card edge (x 790 < 810); the note layer sits above the lighting layer; single accent word per shot.
- S5 ⚠ Adapted parameters, each with a reason: lead font 96 → 84 px (the longer line in Poppins would overflow 1920); spotlight push zoom 2.6 → 1.55 (the hero card is vertical, 534 px, and would leave the frame at 2.6); pill and countdown widths are estimates for Poppins, confirmed visually on stills (f300, f470).

## B: storyboard
- B1 ✓ Frame budgets match DESIGN.md (84 / 172 / 158 / 100 / 132 = 646 f, 21.5 s).
- B2 ✓ Text, joins and sound cues as planned.
- B3 ✓ Wordmark hold 1.4 s at the end; the hero holds 30 f after landing; the pill finale holds 48 f.
- B4 ✓ No unplanned shots.

## D: data
- D1–D5 ✓ Only the channel's own renders, icon and handle appear. No personal or private data.
- D3 ⚠ The "channel page" is a hand-built mock (the channel doesn't exist publicly yet), which the skill allows for non-replica scenes. It doesn't imitate YouTube's interface or branding.

## A: audio
- A1 ✓ BGM is `house-vibez.mp3` (Mixkit Stock Music Free License, bundled with the skill), at 0.42 with a 15 f fade in and 45 f fade out.
- A2 ✓ Each sound is pinned to its action through the `SHOTS` table (`src/Sound.tsx`).
- A3 n/a Not a beat-synced cut.
- A4 ✓ The ending runs whoosh, then impact (f551), then sparkle (f576), on the lockup's actual frames.
- A5 ✓ No sound sample is longer than 1.2 s.
- A6 ✓ After one fix, every cue's peak sits 0.7–15.6 dB above the music at that moment; zero clipped samples in both versions (`qa/audio-check.txt`). The first pass failed (ticks were 8–17 dB under the music) and was fixed.
- A7 ⚠ The sounds are synthesised (filtered noise and sine partials), not recorded foley. See A10.
- A8 ✓ Two versions, with and without music, rendered from the same timeline using `props-nobgm.json`.
- A9 ✓ Output offset measured by cross-correlation on three probes (clunk, impact, snap): 1.29 / 1.27 / 1.28 f. The table compensates 1.28 f, leaving ≤0.3 f residual. Pipeline: Remotion 4.0.484, AAC, 48 kHz, MP4, measured 2026-11-14.
- A10 ✗ **Not Freesound.** Freesound returned HTTP 403 to this server even after its hosts were allowed. Following the rule against silently substituting sounds, they were synthesised in `tools/make_sfx.py` (own work), and the substitution is recorded in `public/audio/sfx/audio-manifest.json`. *Suggested fix:* source real foley from Freesound on a normal computer and drop the files into the same names.

## Q: technical quality
- ✓ Text is sharp in all stills; rounded clips hold; no camera shake (none was added); joins at f84/f256/f414/f514 are clean; the render is deterministic (no Math.random or Date).
- ⚠ The hero card's video plays the reel with its own burned-in captions ("actually stop", f135). That's correct for showing the real Short but adds small text; acceptable.

## Summary
- **Must fix:** none outstanding. A6 failed on the first pass and is fixed.
- **Suggested:** replace the synthesised sounds with Freesound foley (A10); consider changing the subline or the motto so they don't read as repetition (F2).
- **Couldn't check:** whether it sounds good, because the audio was measured, not listened to.
