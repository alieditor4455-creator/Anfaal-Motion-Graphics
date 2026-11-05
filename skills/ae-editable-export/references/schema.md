# project.json format (read by AnfaalBuilder.jsx)

All times are **seconds on the final timeline**. Positions are comp pixels (1080×1920 by default, origin top-left).
Colours: a palette key (`hue`, `gold`, `red`, `white`, `soft`, `bg`, `glass`, `pill`) or `#RRGGBB`.
Full TypeScript types: `types.ts`. Real example: `../examples/reel_spec.json`.

```jsonc
{
  "name": "Reel name (editable)", "width": 1080, "height": 1920, "fps": 30, "duration": 58.9,
  "palette": { "hue": "#2FD27E", "gold": "#E8C77F", "red": "#FF5F66", "white": "#F3F7F4", "soft": "#BFC8C2", "bg": "#030A06", "glass": "#0E2A1C", "pill": "#06120C" },
  "fonts": { "head": {"family":"Anton","style":"Regular","ps":"Anton-Regular"}, "body": {"family":"Inter","style":"Bold"}, "label": {"family":"Inter","style":"SemiBold"}, "mono": {"family":"JetBrains Mono","style":"Bold"} },
  "media": { "speaker.mov": "/path/person.mov", "wall.jpg": "/path/wall.jpg", "sfx/": "/path/sfx/" },   // packager only
  "background": { "file": "wall.jpg", "from": [540, 960], "to": [540, 700], "opacity": 90 },          // slow glide
  "speaker": { "file": "speaker.mov", "anchorY": 900, "scale": 100, "openZoom": true,
               "segments": [ { "at": 0, "srcIn": 0, "srcOut": 50.06 }, { "at": 50.06, "srcIn": 54.14, "srcOut": 62.98, "punch": true } ] },
  "keywords": [ { "t": 18.84, "to": 21.81, "lead": "impact pehle hi", "key": "aa chuka hai", "tone": "white", "y": 235, "scale": 0.56 } ],
  "onCamera": [ /* items (below), times on the main timeline */ ],
  "fullscreens": [ { "name": "Real chart", "from": 5.95, "to": 11.38, "bgFile": "wall.jpg", "bgOpacity": 35, "items": [ /* items, times LOCAL to the scene */ ] } ],
  "captions": [ { "t0": 0.44, "t1": 1.9, "y": 1535, "words": [ { "w": "gold", "t0": 0.44, "hot": "hue" }, { "w": "bhai", "t0": 0.8 } ] } ],
  "transitions": [5.95, 11.38],          // camera-shutter cuts
  "endFade": 0.5, "grain": true,
  "audio": [ { "role": "Voice", "file": "voice.wav", "at": 0 }, { "role": "SFX", "file": "sfx/pop.wav", "at": 6.6, "gain": -15 } ]
}
```

## Items (`onCamera` and `fullscreens[].items`)
Common: `type`, `at` (start), `out` (end, optional), `x`, `y`, `glide` (default true: ease-in rise + blur, ease-out lift).

| type | fields | builds |
|---|---|---|
| `image` | `file`, `w`, `rot`, `opacity`, `frame` (glass frame, default true) | footage layer + glass frame |
| `label` | `text`, `size` (24), `color` | tracked caps label |
| `title` | `lead`, `key`, `tone`, `scale` | two-tier keyword (lead + big key) |
| `text` | `text`, `size`, `font` (`head`/`body`/`mono`), `color` | plain text |
| `pill` / `button` | `text`, `size`, `fill`, `textColor`, `sub` | rounded button + glow (+ small label above) |
| `card` | `text`, `sub`, `w`, `h`, `fill` | glass card + title (+ label above) |
| `counter` | `from`, `to`, `countAt`, `dur`, `plus`, `unit`, `prefix`, `suffix`, `size`, `color` | Source Text expression counting up |
| `needle` | `len`, `wid`, `color`, `keys: [[t, deg], …]` | rotating hand (gauge / clock) |
| `rect` | `w`, `h`, `radius`, `fill`, `fillOpacity`, `stroke`, `rot` | shape layer |
