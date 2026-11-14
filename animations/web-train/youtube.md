# YouTube package: web-train Short

Made with the `yt-package`, `yt-seo` and `yt-script` skills from jakeschincariol/youtube-agent-skill.
Nothing here is published. Copy what you want and upload it yourself.

## Title + thumbnail (yt-package)

**Winner: `Spider-Man 2's Train Stop: Magic or Math?`**, with thumbnail text **300,000 NEWTONS**.
The pairing scored 100/100 in `title.py`. The title is 41 characters, so it fits the 60-character
desktop cut. It has a name and a number, and it asks a question. The thumbnail uses different words
from the title.

| # | title | chars | score | issue |
|---|---|---|---|---|
| 1 | Spider-Man 2's Train Stop: Magic or Math? | 41 | 98 | mobile shows "...Magic or..." (subject survives) |
| 2 | Spider-Man 2's Train Scene Is Real Physics | 42 | 94 | mobile cuts "Physics" |
| 3 | 3 Students Did the Math on Spider-Man 2's Train Scene | 53 | 94 | mobile cuts at "Spider-Man..." |

These scores are without thumbnail text. With "300,000 NEWTONS" added, #1 scores 100 and #3 scores 98.

**Thumbnail brief** (`thumbnail.jpg`):
- **Image:** the hook frame. The masked hero braces with both webs while the train's headlights glow behind him.
- **Expression:** strained, with squinting eyes.
- **Framing:** the hero is centred, with the webs running to the top corners.
- **Text:** two words, "300,000" in white and "NEWTONS" in yellow, with heavy dark outlines.
- **Contrast:** the text sits over the pale sky and skyline, where the outlines hold contrast at feed size.
- **Upload:** for a Short, use this file as the cover image where YouTube offers that. Otherwise pick the 0:02 frame.

## Description (yt-seo)

```
Could Spider-Man's web really stop the subway train in Spider-Man 2? In 2012, three physics
students worked it out, and real spider silk is surprisingly close.

Stopping four subway cars takes about 300,000 newtons. Weight for weight, spider silk is stronger
than steel, and Darwin's bark spider spins silk more than 10 times tougher than Kevlar. That is
almost exactly the toughness the students' numbers called for.

Sources:
- J. Forster, M. Bryan, A. Stone, "Doing whatever a spider can", Journal of Physics Special Topics,
  University of Leicester (2012)
- Agnarsson et al. (2010), "Bioprospecting finds the toughest biological material: extraordinary
  silk from a giant riverine orb spider", PLoS ONE

Animated stick-figure explainer. Fan-made, not affiliated with Marvel or Sony.

#Shorts #SpiderMan #Physics
```

## Tags

These are for disambiguation only. The skill caps them at 15.

```
spider-man 2 train scene, spiderman train scene physics, spider silk, spider silk strength,
spider silk vs steel, spider silk vs kevlar, darwin's bark spider, caerostris darwini,
university of leicester spider-man, could spider-man stop a train, physics of spider-man,
superhero physics, science shorts
```

## The query test

| query this should win | title has it | first two lines have it |
|---|---|---|
| spider-man 2 train scene physics | spider-man 2, train | spider-man 2, train, physics |
| could spider silk stop a train | train | spider silk, stop, train |
| spider silk stronger than steel | no | no (line 3) |

The first two queries pass. The third is covered only lower in the description. Changing the title to
win it would drop the movie name, which is the stronger search term, so the title stays.

## Hook check (yt-script)

`hookscore.py` rated the reel's current opening line **44/100 (weak)**:
"What if a spider's web could actually stop a runaway train?" Its weakest property is ADDRESS: the
line has no "you" in its first six words.

Best alternative, **67/100 (workable)**:
"You'd need 300,000 newtons to stop that train. What if spider silk could take it?"

Changing it means re-recording the first line and re-timing the shots. Ask if you want that version.

## Not done

- **voice.md:** every skill reads `~/.claude/youtube/voice.md` to match how you talk. There isn't
  one yet, because the skill builds it from three of your own videos. These drafts use a neutral
  explainer voice instead.
- **Chapters:** skipped (`yt-chapters`). Shorts don't show chapters.

**Ship it, or change it?**
