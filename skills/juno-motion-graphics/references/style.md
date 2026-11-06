# Juno Motion Graphics: locked style

Approved by the client in November 2026. Reference frames are in `../examples/`, and the working code is `../template/JunoMotion.tsx`.

## Canvas
- 1080×1920 (9:16), **60fps**, H.264 at crf 10 with preset slow (lower quality makes the flat background flicker).
- Background: **Juno Black `#1E1E1E`**, flat. Overlay a 54px grid of 1.5px lines at `rgba(248,249,250,.03)`.
- **Full screen from the first frame to the last.** The graphic world always fills the frame.
  - No full-bleed footage.
  - Nothing is ever laid over the speaker's face or body: no brackets, no orbit drawn on top, no gradients.
  - The speaker only appears **inside the window**.

## Palette (Juno brand, nothing else)
| Use | Colour |
|---|---|
| Hero / dots / frame / strike / period / lever | Juno Green `#1CE49B` |
| Text, hero word | Off White `#F8F9FA` |
| Lead line | `rgba(248,249,250,.78)` |
| Hairlines (orbit, ground, string) | `rgba(180,247,202,.25)` |
| Link lines / spokes | `rgba(180,247,202,.55)` |
| Lever stick | `rgba(248,249,250,.55)` |
| Shelf | `rgba(248,249,250,.16)` |
| INBOX windows off / building fill | `rgba(28,228,155,.18)` / `rgba(28,228,155,.06)` |

**Never use red.** A negative word is shown with a Juno Green strike (14px, rounded, soft glow) and dims to 38%.

## Logo rules (from the brand guide)
- Use only the provided lockups in `assets/`.
- Never rotate, stretch, recolour, or move or resize the period of the logo or the Junior Mark "o.".
  The hanging frame may swing, but the mark inside it does not rotate on its own.
- The awning uses `logo_dark.png` on Juno Green, at 48% of the awning width.
- The no-speaker version uses `mark_green.png` at 52% of the window width, on a `#2b2b2b → #171717` radial panel.

## Type: two centred lines, always
- Block top at y=250, centred horizontally.
- Line 1 (lead): Outfit 400, 64px, lowercase, −0.02em, line-height 84.
- Line 2 (hero): Outfit 700, 124px, lowercase, −0.045em, line-height 140. It **ends with a Juno Green period**.
- At most one hero idea per beat. If line 2 would exceed ~16 characters at 124px, shorten the copy rather than shrink the type.
- Handwritten note (optional): Caveat 500, 52px, rotated −4°, with a hand-drawn arrow that draws on.
- Footer (optional): Outfit 400, 26px caps, 0.14em tracking, centred at y=1720.
- **Masked roll** between texts (Island-reel style): the old line moves up 90% and blurs 4px while the new one rises from below, over 0.65s on SWAP.
  When only the lead changes, the hero word stays still (for example, "talent." between attract and retain).

## Layout anchors
- The window is always 0.8235 aspect (head and chest crop of a 1080×1920 source: x90 y430 w900 h1093).
- It has an 8px Juno Green frame, 10px radius and a soft shadow.
- W1 storefront: (330,840,420,510). W2 hanging: (350,830,380,461). W3 storefront-left: (140,930,320,389). W4 centred: (330,760,420,510).
- The lever sits bottom-right: base centre x 885, 125px green half-circle on the bottom edge, 210px stick, 20px ball.
- The big arc sits top-right: circle centre (1190,470), radius 330, 3px green, with a 17px dot travelling along it.
- Outline accents (3px green, unfilled): a small circle (140,640) and a diamond (185,1545). Use only these two.

## Beat library (scenes; reuse them, keep the order logic)
1. **Storefront (welcome / attract):** the window with the JUNO awning (green, white scallops) and a green base on a hairline ground.
   Talent dots (r56) fly in from off-screen on radial paths with soft trails and settle around the store.
2. **Hanging frame + orbit (retain / hold / stability):** the awning folds away and a string draws down from the top.
   The frame swings in a damped way (≤2.6°, 0.8Hz, eases to exactly 0). A shelf sits under it.
   The dots settle on a 430px orbit ring, each keeping its own side, and drift at 8°/s.
3. **Storefront + INBOX (capacity / growth without hiring / automation):** the window moves left and the building rises on the right.
   Three link lines connect them. The **same** dots shrink to r17 and glide along the links once, as work packets (no loop, no popping).
   The building's 18 windows fade on one after another.
4. **Centred window + calm grid (people / the team / reassurance):** the six dots form two columns of three beside the window (x190 and x890).
5. **Workflow network (system / process / Juno):** the dots move to a six-point star (r420) around the window and spokes draw from its centre behind it.
6. **Strike / unstrike (reframe a negative):** the strike draws on the negative word and it dims.
   For a reversal, the strike slides off, the word returns to full white and the green period lands.
7. **Logo sting / end card:** use `template/JunoLogo.tsx` (the junior-orbits-senior story).
   The vector ring and period are measured to match `mark_green.png` (ring R 168/99, dot r 36.5 at +204,+132.5).
   They hand over to the file through a 6-frame crossfade, then the logo file takes over at the dock. Static alternative: Juno Black background, `logo_green.png` at 1/3 of the width (360px), centred vertically.

The **lever** flips (±76°, SPRING, 0.75s) on every beat change and on the strike and unstrike.
The **arc** draws on at the first beat change and its dot travels along it continuously.

## Easing and timing (smooth: never snap)
| Name | Curve | Use |
|---|---|---|
| GLIDE | `bezier(0.22, 1, 0.36, 1)` | entrances, fly-ins, window intro (scale 0.9→1) |
| MOVE | `bezier(0.45, 0, 0.15, 1)` | window/layout moves (0.85–0.95s), dot regroups |
| SWAP | `bezier(0.65, 0, 0.35, 1)` | text rolls (0.65s), exits |
| DRAW | `bezier(0.33, 0, 0.2, 1)` | lines, rings, arc, string, ground |
| SPRING | `bezier(0.34, 1.22, 0.64, 1)` | lever flip only |
- Camera drift: the whole graphic layer scales 1 → 1.028 over the piece (origin 540,1060). The text and lever stay outside it.
- Dot trails: a line from the position 0.1s earlier to now, 1.6× the radius wide, green fading to 0.3 opacity.
- **Continuity rules:**
  - Every phase starts from the previous phase's actual position.
  - Every element that leaves eases to exactly zero.
  - Discrete counts (lit windows) cross-fade over ~1.5 steps.
  - Arrowheads and labels fade in rather than pop.
  - Dots render **behind** the window, so a path never crosses the speaker.
- Speech sync: hero words land on the spoken word. Scene moves start about 0.05–0.1s before their phrase.
  A tail after the last word is fine: about 2s for a reversal line and footer.

## Don'ts (all rejected by the client)
- Red anywhere.
- Full-bleed footage, or graphics on top of the speaker.
- Busy backgrounds: halftone blocks, node constellations or cell grids filling the frame.
- Too many elements at once.
- Speaker split-screen cards.
- More than two text lines, left-aligned text, or title case.
- Hard cuts or snappy easing.
- Brackets or orbit rings drawn over the footage.
