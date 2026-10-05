# Raven — Shorts №1 · Raven Agent

Animated storyboard (animatic) for a 44-second product film. Ten frames, built as
one self-contained HTML page: inline SVG, CSS and plain JS, no libraries, no build step.

Preview: https://dzhevaha.github.io/uprising-particles/raven-animatic/

## Controls

| Key / button | Action |
|---|---|
| Space, ▶ | play / pause |
| ← → | step 0.1 s (Shift: 1 s) |
| Home | back to start |
| S, `subs` | voiceover subtitles on / off |
| C, `clean` | hide the control bar for screen recording |
| .25× .5× 1× | playback speed |

## Editing the timing

`TL` at the top of the script holds every frame's in and out point, plus `xfade`,
the cross-fade length between frames. `CUES` below it holds the voiceover lines as
`[in, out, text]`. Each frame's internal beats live in its own build function —
frame 04–05 has them collected in a `B` object.

Geometry, palette and the logo path were taken from the approved storyboard PDF,
so the frames match it one to one. Typeface is Inter, loaded from Google Fonts.

## Status

This is a timing and motion test, not the final film. Voiceover, music, subtitles
burnt in and the 4K render are done in After Effects. Timecodes here are estimates
until the recorded voiceover arrives.
