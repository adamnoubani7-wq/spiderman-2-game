# Stick Science Lab: channel trailer, design spec

Built with the video-shotcraft skill in **autonomous** mode (`references/pipeline.md`): the agent
decides stages 0–3 and records them here instead of pausing for approval.

## Stage 0: product brief

- **Product:** the YouTube channel Stick Science Lab (@StickScienceLab). Its first Short is
  `animations/web-train/web-train.mp4`, a stick-figure explainer on whether a spider's web could stop a train.
- **Purpose:** channel trailer, the video shown to non-subscribers on the channel page. 16:9, 1920×1080,
  30 fps, about 21 s, English.
- **Audience:** curious viewers aged roughly 13–30 who watch science and movie-physics Shorts.
- **Must show:** (1) the "what if" hook format, (2) a real Short from the channel, (3) the topics covered,
  (4) the under-a-minute format, (5) the name, icon and handle.
- **Data:** nothing sensitive. All footage and images are the channel's own renders. No claims about posting
  frequency, because the channel hasn't proven a schedule yet.
- **Audio:** no BGM was specified, so the agent picks one in stage 6 (see below). There's no voiceover;
  the on-screen text carries the message.

| Need | Decision |
|---|---|
| A trailer that reads with sound off | Every shot carries its own line of text |
| Show the real product | The hero card plays the actual Short (ClipCard) |
| Don't over-promise | No "every week"; the only hard claim is "under 60 seconds" (the Short is 43 s) |
| Brand recall | The trailer ends on the lockup with icon, name and handle, held at least 1 s |

## Stage 1: visual direction

Direction: **"Bright lab notebook."** Playful but clear, taken from the reel's own palette and type.

- **Colour tokens:** ink `#221c22`, red `#d8312b` (accent, one word per shot), blue `#2457c9` and
  sky `#6cc6ff` (fields, glows), yellow `#ffe14d` (the spotlight beam and marker in place of champagne gold), paper `#f7f4ee`.
- **Type:** Poppins Bold for display (the reel's caption font), Inter 500/600 for small text.
- **Motion personality:** the "playful and cheerful" preset. Main moves run about 27 f with entrance easing
  `bezier(0.34,1.56,0.64,1)`, overshoot 1.08 and squash about 0.18. The cards' tuned timings are kept as they are
  (the skill says they must not be downgraded); only the skin changes.
- **Styleframe:** skipped. The palette and type already exist and were approved in the reel, the thumbnail and the icon,
  so stills of each shot serve as the styleframe check.

## Stage 2: features mapped to shots

| Feature | Card (style) | Why |
|---|---|---|
| Hook format | `lead-word-zoom-assemble` | One word fills the screen, then the whole question forms around it |
| A real Short | `spotlight-hero-card` + `ClipCard` | A single-hero opener; the hero card plays the real reel |
| Topics | `pill-slot-cycle` | A fixed sentence stem with a rotating slot, the card's own use case for listing items |
| Under-a-minute format | `countdown-arc-scatter` | A promise of time ("5 min to install" becomes "60 sec to the answer") |
| Brand | `logo-shrink-wordmark-lockup` | The standard end-card lockup: icon, wordmark and tagline |

Each motion technique is used once (rule P4).

## Stage 3: storyboard (energy arc: low open, then hero, then climb, then peak)

| # | Frames | Shot | Key motion and text |
|---|---|---|---|
| 1 | 0–84 | lead-word-zoom-assemble | "What" fills the screen, then "What if a **web** could stop a train?" assembles. Subline: "Real science, explained by stick figures." Ends on a crash zoom. |
| 2 | 84–256 | spotlight-hero-card | A dark theatre over the Stick Science Lab Shorts shelf. The spotlight hunts, locks on the centre Short, pushes in; the card rises playing the reel. A yellow beam laps it twice. Note: "One question, / **one minute.**" The card reseats and holds 30 f. |
| 3 | 256–414 | pill-slot-cycle | "We test" plus pills cycling through movie scenes, superpowers, video games, wild what-ifs, ending on "We test the math." |
| 4 | 414–514 | countdown-arc-scatter | The dial sweeps and the hero number 60 flies into the title "60 sec to the answer" (red on "answer"). Label: ANSWER TIME. Handle line: @StickScienceLab |
| 5 | 514–646 | logo-shrink-wordmark-lockup | A blue ring shrinks into the icon, the wordmark "Stick Science Lab" slides in, then the motto "REAL SCIENCE. STICK FIGURES." Holds at least 1 s. |

Transitions: shot 1's crash zoom is the first half of its cut into shot 2's dark theatre. The other joins are straight cuts
after each shot's built-in hold, because each card already ends on a rest.

Stills to check: 1→60, 2→120/170, 3→60/150, 4→90, 5→120 (frames local to each shot).
