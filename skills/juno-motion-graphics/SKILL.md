---
name: juno-motion-graphics
description: Juno Motion Graphics — the locked, client-approved motion style for Juno (juno.tax, AI tax-prep teammates). Turns a Juno talking-head take (usually Dave Haase, CPA & founder) or a line of Juno copy into a premium 9:16 motion graphic in Remotion: full-screen graphic world on Juno Black (#1E1E1E), the speaker only ever inside a green-framed window (storefront with JUNO awning, hanging frame on a string with talent orbit, storefront + INBOX building, centred window), Juno Green talent dots, the "the why" lever that flips on every beat, two centred lines of lowercase Outfit with the green Juno period, green strike instead of red, smooth 60fps easing. Also makes the no-speaker version (Junior Mark "o." in the window). Use when someone asks for Juno motion graphics, a Juno reel/video/animation, "same style as the Juno video", "Juno motion style", or gives a Juno script/clip to animate.
---

# Juno Motion Graphics

A locked style. The client approved it after several rounds, so **do not redesign it**. Apply it to new lines.
The full rules are in `references/style.md`; read them before you change anything visual.
`template/JunoMotion.tsx` is the approved, working composition. It was made for the line "They'll attract
talent, they'll retain talent, and they'll grow without hiring. Your talent isn't the problem."
Start every new video from it.

Files:
- `template/JunoMotion.tsx`: the approved Remotion composition (exports `JunoDark` with the speaker and `JunoNoDave` with the "o." mark).
- `template/JunoLogo.tsx`: the approved 6.6s logo sting (`JunoLogo`, 9:16, 60fps, silent). OSS-pattern hull → starburst → the centre square becomes the ring → the junior node orbits and docks as the period → the mark glides into the wordmark as J-U-N wipe out of it. Use it as the end card or intro. The final frame is the real `logo_green.png` at 1/3 of the width.
- `assets/`: brand-approved lockups (logos, Junior Mark in green/dark/white/light), the 3D product icons, and the Outfit 400/700 and Caveat 500 fonts.
- `scripts/setup.sh`: copies the assets, extracts the take (JPEG sequence + audio) and installs the template.
- `scripts/timing.py`: speech phrases from silence detection, used to time the beats.
- `scripts/render.sh`: high-quality 60fps render (crf 10, preset slow, 120s timeout).
- `scripts/glitch_scan.py`: frame-jump scan. It must be clean before you deliver.
- `references/style.md`: the locked rules (palette, type, layout, scenes, easing, motion, don'ts).
- `examples/*.jpg`: approved frames (attract, retain, grow, strike, workflow) to compare against.

## Before building: ask (the user wants counter-questions first)
Ask only what you can't infer:
1. **Script and beats:** which line(s), and where they fall in the take.
2. **Versions:** with the speaker, without the speaker, or both. The default is both.
3. **The ending:** a strike only, or strike plus the reframe line ("your workflow is the problem.").
4. **Copy you would add:** handwritten notes and the footer ("Juno handles · you advise") are optional. Confirm them.
Never ask about style, colours, fonts or easing. Those are locked.

## Workflow
1. `bash scripts/setup.sh <project-root> <raw.mp4>`. Set `SRC_N` and `SRC_FPS` in `src/Juno/Motion.tsx` from its output.
   Register `JunoDark` and `JunoNoDave` in `src/Root.tsx` (fps `JUNO_FPS` = 60, 1080×1920, `JUNO_FRAMES`).
   The Remotion deps must be installed (`npm ci`).
2. `python3 scripts/timing.py <raw.mp4>` gives the phrase list. Map each phrase to a beat (see "Beat library" in style.md).
   Words land **on the spoken word**. A scene change starts ~0.1s before the phrase it belongs to.
3. Adapt the template, keeping its structure:
   - Text: edit the two `Roll` item lists (line 1 = lowercase lead, line 2 = bold hero word + green period).
   - Scenes: retime `SEG` (window moves), the `vis(...)` windows and `FLIPS` (lever) to the new beats.
     Re-use scenes from the library. A new idea must be built from the same parts (window, dots, lines, arc,
     lever, outline accents) in the same colours.
   - Dots: keep **continuous paths**. Each phase starts from where the dot actually is (see `att(1.25)` and
     `packet(i, 3.35)`), the dots stay behind the window, and no dot crosses another's side.
4. Check stills (`node scripts_stills.mjs JunoDark <dir> 0.5 <frames…>` or `npx remotion still`) against `examples/`.
5. `bash scripts/render.sh <root> JunoDark out/JunoDark.mp4` (and `JunoNoDave`).
6. `python3 scripts/glitch_scan.py out/JunoNoDave.mp4 out/JunoDark.mp4`. The no-speaker file must show `spikes []`.
   For a spike in the speaker file, run `--where <sec>`: it is acceptable only if it lies inside the footage window.
   For a spike in the graphics, render that frame range as stills and diff them. If the stills change smoothly,
   it is encoder flicker (raise the quality); otherwise fix the discontinuity.
7. Deliver the MP4s with SendUserFile, then commit the source (keep `public/juno/raw/` out of git).
   If the user wants it editable in AE, hand it to the `ae-editable-export` skill.
