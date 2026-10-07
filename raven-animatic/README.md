# Raven — Shorts №1

Animated storyboard (animatic) for a 34.5-second product film. Four scenes, built
as one self-contained HTML page: inline SVG, CSS and plain JS, no libraries, no
build step.

Preview: https://dzhevaha.github.io/uprising-particles/raven-animatic/

## What this version is

Third edit. The client rewrote the voiceover and sent mockups of four key frames,
so this is not a revision of the previous cut — the script, the palette and three
of the four scenes are new.

| # | Scene | In | Out |
|---|---|---|---|
| 01 | Name on black | 0:00 | 0:05.0 |
| 02 | Layer and workflows | 0:05.0 | 0:24.5 |
| 03 | Where the number comes from | 0:24.5 | 0:31.0 |
| 04 | Credit work, connected | 0:31.0 | 0:34.5 |

Changed from the previous cut: the five inputs are now Deal documents,
Third-party data, Firm credit policies, Firm data and Raven credit intelligence —
the last is not an external source but what Raven has already computed, so its
rule is sage where the others are grey. The bottom of scene 02 is a named
workflow rail, not an abstract ticker, and it anchors on "Raven Agent". The audit
frame is no longer a single figure: it states the number, asks the agent to
compare against the client model, then opens the document behind it. The EBITDA
walk, the 25% haircut and the cap table are gone from the film entirely.

Scenes 02 and 03 are continuous, not cuts. In 02 the schema assembles in the
first ~3 s; the scene still runs its full 19.5 s against the voiceover, so the
rail carries the rest — it appears early and dormant, then walks its steps
slowly through the back half. Shortening that hold means re-cutting the scene
against the voiceover, not speeding the rail. The rail does not scroll: it is a
stationary breadcrumb whose active step walks along it. The exported still
shows that rail dormant — every step in `lineDark`, only the Agent capsule lit —
while the spec's tokens describe the active state, so both are used: steps sit
dormant, the active step is white over a sage underline, and steps it has passed
stay in `muted`. In 03 the panel dims when the question is asked and brightens
again as the source lands, and the whole group slides 240px right to make room
for the document card.

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
inlined verbatim: tokens, per-frame nodes in 1920×1080 coordinates, the workflow
rail, the Financial Summary table, the document card and the logo path. Nothing
in it is hand-edited — to change a layout, re-export and replace it.

`TL` holds every scene's in and out point plus `xfade`. `B01`…`B04` hold each
scene's internal beats, in seconds from that scene's own start. `CUES` holds the
voiceover lines as `[in, out, text]`.

## Safe area

The film ships to YouTube, where the player draws its own captions over the
bottom of the picture. YouTube publishes no pixel spec for this — its help page
lists only which caption properties a viewer can change, and the player sizes
captions from the player height at playback time. The export already keeps
content above `safeArea.bottom` (825 of 1080), which leaves room for the control
bar plus a two-line caption at default size, so no refit is applied here.

`YTCAP` draws stand-in captions inside the frame at the size YouTube renders
them — Roboto, white on a 75% black box, bottom-centred above the control bar. A
long voiceover line is split into several timed captions of at most two lines,
the way a real caption track behaves, and the measure narrows until a cue's lines
divide evenly so none ends on an orphan word. They are a placeholder: the shipped
film carries no burnt-in text. Press S to hide them.

Typefaces are IBM Plex Sans, IBM Plex Mono and Instrument Serif; the stand-in
captions use Roboto. All load from Google Fonts.

## Status

A timing and motion test, not the final film. Voiceover, music, burnt-in
subtitles and the 4K render are done in After Effects. Timecodes are estimates
until the re-recorded voiceover arrives. The closing card reads "Credit work,
connected" while the voiceover says "Raven. The AI platform for corporate
credit" — that pairing is still to be confirmed. Figures on screen are
illustrative and need legal clearance before the final render.
