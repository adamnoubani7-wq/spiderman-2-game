---
name: video-gen
description: Generates a short AI video clip from a text prompt through fal.ai (Kling, Veo, Wan and other text-to-video models). Use when the user runs /video-gen or asks to generate, make or create a video clip from a prompt or description with AI.
---

# /video-gen

Prompt in, MP4 out, through fal.ai's queue API. `gen.py` uses only the Python standard library.

## Setup
- **Key:** a fal.ai API key saved as this environment's network secret for host `queue.fal.run`
  (header `Authorization`, prefix `Key`). The proxy injects it, so the script never sees it.
  Outside a cloud session, export `FAL_KEY`.
- **Network:** `queue.fal.run`, plus the host that serves the finished file (the result URL names it,
  e.g. `v3b.fal.media`). If the download is refused, add that exact host.

## Steps
1. **Prompt.** One shot, written like a camera direction: subject, action, setting, camera move, light,
   style. 1 to 3 sentences. For the channel, add "vertical 9:16".
2. **Cost check.** Each run is billed to the user's fal account. Say which model and duration you will
   use before the first run, and do not loop retries on failures.
3. **Run:**
   ```bash
   python3 "<skill dir>/gen.py" --prompt "..." --aspect 9:16 --duration 5 --out <name>.mp4
   ```
   Options: `--model <fal endpoint id>`, `--param key=value` for model-specific inputs
   (e.g. `--param negative_prompt="blur"`), `--timeout` seconds. A `<name>.json` with the input and
   raw result is saved next to the video.
4. **Check** the clip (extract a frame with ffmpeg and look at it), then hand over the path.

## Models
Default: `fal-ai/kling-video/v3/standard/text-to-video`. Others seen on fal (check the model page on
fal.ai first, since ids and inputs change): `fal-ai/veo3.1`, `fal-ai/kling-video/v2.6/pro/text-to-video`,
`fal-ai/wan/v2.7/text-to-video`. If a model rejects `aspect_ratio` or `duration`, read the error and
pass that model's own field names with `--param`.

## Rules
- Never put the key in a command, a file or chat.
- No real people's likeness, no logos or copyrighted characters in prompts.
