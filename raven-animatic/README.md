# Raven — Shorts №1 · Raven Agent

Animated storyboard (animatic) for a 42-second product film. Five scenes, built as
one self-contained HTML page: inline SVG, CSS and plain JS, no libraries, no build step.

Preview: https://dzhevaha.github.io/uprising-particles/raven-animatic/

## What this version is

Second edit, cut from ten frames to five on the client's 5 October notes: less
"skills", more workflow, and the analysis shown in action — a query typed, the
response rendered.

| # | Scene | In | Out |
|---|---|---|---|
| 01 | A bird out of the dark | 0:00 | 0:03.5 |
| 02 | Five streams into one layer | 0:03.5 | 0:24.3 |
| 03 | Asking in words | 0:24.3 | 0:34.9 |
| 04 | Numbers with a trail | 0:34.9 | 0:38.8 |
| 05 | Your partner in credit | 0:38.8 | 0:42.0 |

Scenes 02 and 03 are single continuous scenes, not cuts: 02 builds through
sources → arcs → layer → outputs → function ticker → "Agent", and 03 runs the
three Project Alpha requests — EBITDA walk, 25% haircut, opening cap table —
rebuilding the same table in place.

In 02 the schema assembles in the first ~4.3 s; the function ticker then carries
the remaining ~14 s, scrolling its eight functions at a readable pace and
settling on "Agent" at the end. Lengthen the scene by moving `T1` in its beat
block, not by slowing the build.

## Controls

| Key / button | Action |
|---|---|
| Space, Play | play / pause |
| ← → | step 0.1 s (Shift: 1 s) |
| Home | back to start |
| S, `Subs` | stand-in captions on / off |
| C, `Clean` | hide the control bar for screen recording (Esc to exit) |
| .25× .5× 1× | playback speed |

## Editing

`SPEC` near the top of the script is the geometry export from Claude Design,
inlined verbatim: tokens, per-frame nodes in 1920×1080 coordinates, table rows
and cells, and the logo path. Nothing in it is hand-edited — to change a layout,
re-export and replace it.

`TL` holds every scene's in and out point plus `xfade`. `CUES` holds the
voiceover lines as `[in, out, text]`. Each scene's internal beats live in its
entry in the `ANIM` object, in seconds from that scene's start.

Three deliberate departures from the export, each marked in the source:
`trailStatus` is missing from the token table and is reconstructed from the
reference PNG; the doc-icon paths in frame 04 are drawn at about twice the size
they appear at in the PNG and are scaled back; the haircut highlights are inset
so they read as separate rows rather than one block.

## Safe area

The film ships to YouTube, where the player draws its own captions over the
bottom of the picture. YouTube publishes no pixel spec for this — its help page
lists only which caption properties a viewer can change, and the player sizes
captions from the player height at playback time. So `SAFE` is built from what
is measurable instead: the control bar covers roughly the bottom 10% of the
frame and captions ride above it, caption text runs about 4–5% of frame height
at the default size (a viewer can push it to 200% or 300%), and captions are
bottom-centred. 255 px of 1080 holds a two-line caption at default size plus the
control bar.

Every scene is scaled and centred into what is left, from its content box in
`BOXES`. The background and grid still bleed to the frame edge — only content
is inset. Re-derive a box if `SPEC` changes; scene 02's x range deliberately
excludes the function ticker, which bleeds off both sides.

`YTCAP` draws stand-in captions inside the frame at the size YouTube renders
them — Roboto, white on a 75% black box, bottom-centred above the control bar.
A long voiceover line is split into several timed captions of at most two lines,
the way a real caption track behaves, so what you see is what will cover the
picture there. They are a placeholder: the shipped film carries no burnt-in
text. Press S to hide them.

Typefaces are Commissioner and IBM Plex Mono; the stand-in captions use Roboto.
All three load from Google Fonts.

## Status

A timing and motion test, not the final film. Voiceover, music, burnt-in
subtitles and the 4K render are done in After Effects. Timecodes are estimates
until Lori's recorded voiceover arrives. Figures on screen are illustrative and
need legal clearance before the final render.
