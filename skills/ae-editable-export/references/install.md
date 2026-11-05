# Editable After Effects project — install & use

## One time
1. Install the fonts listed in `project.json` → `fonts` (default: **Anton**, **Inter** Bold + SemiBold, **JetBrains Mono** Bold, all free on Google Fonts). Restart After Effects.
2. After Effects › *Settings › Scripting & Expressions* › tick **Allow Scripts to Write Files and Access Network**.
3. Copy `AnfaalBuilder.jsx` to the Scripts folder and restart AE (it appears under *File › Scripts*):
   - Mac: `/Applications/Adobe After Effects 2026/Scripts/`
   - Windows: `C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\Scripts\`
   (Dockable panel: put it in `Scripts/ScriptUI Panels/` → *Window › AnfaalBuilder.jsx*.)

## Every project
1. Unzip the package. Keep the folder together: `project.json`, `assets/` (if a video clip was sent separately, drop it into `assets/`).
2. *File › Scripts › AnfaalBuilder* › **Load .json…** › pick `project.json` (the folder is picked automatically).
3. **Build editable comp**. The report at the end lists anything to fix (e.g. a font that isn't installed).

Everything is normal AE layers: edit text, colours, timing and positions freely. Full screens are precomps in the *Full screens* folder; captions have a *Word highlight* animator; counters are Source Text expressions.
