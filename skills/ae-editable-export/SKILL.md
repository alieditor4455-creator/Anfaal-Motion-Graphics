---
name: ae-editable-export
description: Turn any finished video or motion graphic (Remotion reels, talking-head edits, Forex Premium Motion reels, documentaries, promos) into an editable After Effects 2024–2026 project. Produces one folder with project.json, the AnfaalBuilder.jsx script, a README and an assets/ folder holding every clip, image, voice, music and SFX; the script rebuilds the whole edit in AE as editable layers (text, shapes, precomps, keyframes, audio). Use when the user asks for "editable AE file", "After Effects project", "AE script / JSON for this video", "make it editable", or wants to finish an edit in After Effects.
---

# AE Editable Export

The user finishes edits in After Effects. For every video you make (or any motion graphic they give you),
hand them a package they can rebuild in AE with one click: every caption, keyword, card, cut, transition and
sound becomes a normal, editable AE layer.

Files in this skill:
- `scripts/AnfaalBuilder.jsx` — the After Effects script (ExtendScript, ES3; AE 2024+). Never edit per video.
- `scripts/package_ae.mjs` — packs a spec + media into `<Project>/{project.json, AnfaalBuilder.jsx, README.md, assets/}` and zips it.
- `scripts/test_builder.mjs` — runs the AE script against a simulated AE 2026 object model. **Must pass before delivery.**
- `references/schema.md` — the JSON format (read it before writing a spec).
- `references/install.md` — the user's install/use guide (copied into every package as README.md).
- `examples/reel_spec.json` — a complete real spec (educational NFP reel) to copy from.

## Workflow

1. **Collect the edit's facts from the finished video's source**, all on the FINAL timeline (after cuts):
   duration/fps/size; speaker clip + cut segments (`at`, `srcIn`, `srcOut`); background; every keyword
   (two-tier lead + key), caption line (words with start times, hot words), on-camera card/button/counter,
   full-screen scene (items with their own local times), transition times, audio layers (voice, music, each SFX).
   If the video was made in Remotion, import its exported data (transcript, keyword list, windows, cuts) in a
   small TS spec file and bundle it with esbuild instead of retyping numbers (see the example's header).
   Map source→final times through every cut; anything that **ends exactly at a cut stays before it**.
2. **Media**: the speaker must be a cut-out with alpha → ProRes 4444 `.mov`
   (`ffmpeg -i in -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le -vendor apl0 -qscale:v 9 out.mov`).
   If the speaker is on a plain background, give the full frame (no shrinking, no edge fades) unless asked.
   Voice = the cleaned, already-cut voice; music = the levelled/ducked bed; SFX = the user's own pack.
3. **Write the spec** (`references/schema.md`) with a `"media"` map `{ "<name in assets/>": "<path on disk>" }`.
   Fonts as `{ "family", "style", "ps" }` (the script looks them up through AE's font API).
4. **Package**: `node scripts/package_ae.mjs spec.json out/ae`
5. **Test**: `node scripts/test_builder.mjs "out/ae/<Project>/project.json"` → must print `ALL CHECKS PASSED`.
   Also run once with a font missing: `FONTS=Inter-Bold node scripts/test_builder.mjs …` (must only add a font note).
   Fix the spec or script for every problem it lists; never deliver with problems.
6. **Deliver ONE zip** with SendUserFile — everything inside `assets/`, never send clips separately
   (the user can't download loose .mov files). To stay under the 400 MB upload limit:
   - trim the speaker clip to only the used segments and concatenate them, so its timeline equals the final
     timeline (`segments` then become `{at: t, srcIn: t, …}`); e.g.
     `ffmpeg -i person.mov -filter_complex "[0:v]trim=0:A,setpts=PTS-STARTPTS[a];[0:v]trim=B:C,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[v]" -map "[v]" -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le -vendor apl0 -qscale:v 30 speaker.mov`
   - raise `-qscale:v` (30 → 36) until the zip is < 400 MB; keep alpha (ProRes 4444).
   Tell the user: unzip, run AnfaalBuilder, **Load .json…** → `project.json`, **Build**.

## Rules (each came from a real failure)

- Keep the script ES3: no `let/const`, arrow functions, template strings, spread, `?.`/`??`. Check with
  `npx -y acorn@8.14.0 --ecma5 --silent scripts/AnfaalBuilder.jsx`.
- Never set `TextDocument.allCaps` (throws in AE 2026): uppercase the string instead (`caps: true` does this).
- Never trust `td.font = name`; AE ignores unknown names silently. The script resolves fonts via
  `app.fonts.getFontsByFamilyNameAndStyleName` and reports missing ones. List the fonts in the README.
- Every feature is wrapped so one failure never stops the build; the end report lists what to fix.
- Wide text auto-fits inside the 70 px side margins; keep keywords/cards off the face (band above the head).
- Every match name used must be in the test harness whitelist; add new ones there when you extend the script.
- Expressions are compile-checked by the test; keep them plain JavaScript.
- Don't send per-step progress chatter; package, test, deliver, then summarise in a few lines.
