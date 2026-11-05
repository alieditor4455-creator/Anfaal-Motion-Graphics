# Anfaal Builder — editable After Effects files for every reel

Every reel I make comes with an **AE package**: a folder with the reel's JSON, all its media and the
builder script. The script turns the JSON into a fully editable After Effects comp.

## What you get in After Effects
- **Speaker** clip (transparent cut-out) with every cut applied, plus the jump-cut punch and the opening zoom
- **Background** (the chart wall) with its slow glide
- **Full screens** as separate precomps (folder *Full screens*): real screenshots, cards, counters, gauge/clock needles, titles
- **Keywords** (two-tier: small lead + big keyword) as live text layers with glide-in/out keyframes
- **Captions**: one text layer per line, hot words coloured, word-by-word highlight (Opacity animator), pill box behind
- **Cards / buttons / counters** above the head (shape + text layers; the counter is a Source Text expression)
- **Shutter transitions** (two black solids per cut), vignette, grain, end fade
- **Audio**: voice, music, every SFX on its own layer at the right time

Change any text, colour, timing or position like normal AE layers. Nothing is baked.

## Install (one time)
1. **Fonts** — install these (all free on Google Fonts), then restart AE:
   *Anton*, *Inter* (Bold + SemiBold), *JetBrains Mono* (Bold).
   If one is missing, the script still builds and tells you which font fell back.
2. **Allow scripts** — AE 2026: *Settings/Preferences › Scripting & Expressions* › tick
   **"Allow Scripts to Write Files and Access Network"**.
3. **Put the script in AE** (pick one):
   - Quick: *File › Scripts › Run Script File…* and choose `AnfaalBuilder.jsx` each time, or
   - Menu item: copy `AnfaalBuilder.jsx` to
     - Mac: `/Applications/Adobe After Effects 2026/Scripts/`
     - Windows: `C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\Scripts\`
     then restart AE → it appears under *File › Scripts*.
   - Dockable panel: copy it into the `Scripts/ScriptUI Panels/` folder instead → *Window › AnfaalBuilder.jsx*.

## Use (every video)
1. Unzip the reel's package (e.g. `reel4_AE_package.zip`) anywhere.
2. Open/create a project in AE and run **AnfaalBuilder**.
3. Click **Load .json…** and pick the `.json` inside the package (the media folder is set automatically —
   or paste the JSON text and click **Choose media folder…**).
4. Click **Build editable comp**. A report lists anything that needed attention (e.g. a missing font).

## Notes
- All times are on the final timeline. The JSON is plain text: you can also edit words or timings in it and rebuild.
- `speaker.mov` is ProRes 4444 with alpha (large on purpose — it keeps the cut-out clean).
- If you move the package folder, just point the script at the new location.
