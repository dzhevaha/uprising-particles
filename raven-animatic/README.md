# Raven — Shorts №1

Animated storyboard (animatic) for a 43-second product film. Five scenes, built
as one self-contained HTML page: inline SVG, CSS and plain JS, no libraries, no
build step.

Preview: https://dzhevaha.github.io/uprising-particles/raven-animatic/

## What this version is

Fourth edit. The client accepted the structure of the third but asked for three
things back: the dialogue shot that had been cut, an interface branded like the
real product, and a palette split between the brand and the application.

| # | Scene | In | Out |
|---|---|---|---|
| 01 | Name on black | 0:00 | 0:05.0 |
| 02 | The layer and the Agent | 0:05.0 | 0:19.0 |
| 03 | Asking in plain words | 0:19.0 | 0:31.0 |
| 04 | Where the number comes from | 0:31.0 | 0:39.0 |
| 05 | Credit work, connected | 0:39.0 | 0:43.0 |

Changed from the previous cut:

- **Scene 03 is back.** The client's note was that the film "missed the lead in
  to all that" — the audit shot landed without the conversation that produces
  the number. Three prompts now run in sequence: the EBITDA walk, a 25% haircut
  applied live to the Firm adjustment column, and an opening cap table.
- **The chat shell follows the real product**, not an invention: the input bar,
  the Web and Skills chips, the send button, the answer header and the status
  rows are all taken from the application's own screens. The sparkle icon is
  gone — the client read it as Gemini — and the Raven mark replaces it
  everywhere, including the prompt capsule in scene 04.
- **Three palettes, used deliberately.** Black and white for the brand frames,
  the client's own dark schema colours for scene 02, and the light product
  palette for the interface. Scenes 01 and 05 are the only black frames.
- **The workflow rail scrolls.** It was a stationary breadcrumb; it is now a
  carousel of eight steps with a magnetic dwell on each — a 0.32 s run between
  stops, half a second held on the step. When it stops, every step steps back and the Raven Agent capsule
  lights alone for three seconds — timed to land on the words "Through Raven
  Agent" as scene 03 opens.
- **The figures are continuous.** The third edit ended the vignette at a PF
  Adjusted EBITDA of 309.0 and Net Debt of 1230.0, then opened the audit frame
  on 115.0 and 450.0 for the same deal. Scene 04 now carries the numbers scene
  03 arrives at.

The schema at the top of scene 02 assembles in under four seconds — the five
sources, their wires, the layer card and the two outputs — and the carousel
starts the moment the outputs land. Nothing in the scene waits: the eighth stop
releases at 10.96 s and the Agent beat opens at 11.05.

Scenes 02, 03 and 04 are continuous, not cuts. Scene 02 hands over to the light
interface on a whiteout rather than a dissolve: both scenes are opaque, so a
plain cross-fade between a near-black frame and a white one passes through grey.

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
inlined verbatim: the three palettes, the schema, the workflow carousel, the
dialogue shell, every figure in the film and the logo path. Nothing in it is
hand-edited — to change a layout, re-export and replace it.

`TL` holds every scene's in and out point plus `xfade`. `B01`…`B05` hold each
scene's internal beats, in seconds from that scene's own start. `CUES` is
derived from `SPEC.voiceover`.

Two constants are measured rather than exported, because the export and the
reference frames disagree and the frames win:

- `RAIL0 = 120`. The export maps a carousel stop to a strip offset but states
  its origin 60 px off; every item, chevron and underline in the reference
  frames lands at `x = itemX + 120 − scrollX`. Checked across all eight stops in
  both 02e and 02f.
- `RAILBASE = 791`, `CHEVH = 10`. The export puts the strip's baseline at 782
  and its chevrons at 18 px; the frames put the baseline on 791 and draw the
  chevrons at about 10 px, centred on 781.5. The Agent capsule's own text is
  correct as exported.
- The brand lock-up baselines. The export gives the lock-up's block offsets, not
  text baselines, so the wordmark, tagline and footnote are placed from the
  reference frames.

## Safe area

The film ships to YouTube, where the player draws its own captions over the
bottom of the picture. YouTube publishes no pixel spec for this — its help page
lists only which caption properties a viewer can change, and the player sizes
captions from the player height at playback time. The export keeps content above
`safeArea.bottom` (825 of 1080), which leaves room for the control bar plus a
two-line caption at default size.

`YTCAP` draws stand-in captions inside the frame at the size YouTube renders
them — Roboto, white on a 75% black box, bottom-centred above the control bar. A
long voiceover line is split into several timed captions of at most two lines,
the way a real caption track behaves, and the measure narrows until a cue's lines
divide evenly so none ends on an orphan word. They are a placeholder: the shipped
film carries no burnt-in text. Press S to hide them.

Typefaces are IBM Plex Sans and IBM Plex Mono for the dark frames and Open Sans
for the light interface, matching the client's vignette; the stand-in captions
use Roboto. All load from Google Fonts.

## Status

A timing and motion test, not the final film. Voiceover, music, burnt-in
subtitles and the 4K render are done in After Effects. Open items:

- Scene 02 now runs six beats against a single voiceover line. It needs about
  five seconds of pause, or an extra line, before the timings are real.
- The closing card reads "Credit work, connected" while the voiceover says
  "Raven. The AI platform for corporate credit" — that pairing is still to be
  confirmed.
- 16:9 or a 9:16 vertical. The carousel and the tables do not fit vertically as
  drawn.
- Deal names and figures on screen are illustrative and need legal clearance.
- Vector logo, brandbook and licensed typefaces still to come from the client.
