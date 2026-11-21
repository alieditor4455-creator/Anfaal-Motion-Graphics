# Trace logo layers into simplified polygons (outer + holes) for 3D extrusion -> src/Abet/logoShapes.json
import cv2, json, numpy as np
from PIL import Image
def trace(path, thr=128, eps=0.6, min_area=40, up=4):
    a = np.array(Image.open(path))[..., 3]
    big = cv2.resize(a, (a.shape[1] * up, a.shape[0] * up), interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (5, 5), 0)
    m = (big > thr).astype(np.uint8) * 255
    cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    shapes = []
    if hier is None: return shapes
    hier = hier[0]
    for i, c in enumerate(cs):
        if hier[i][3] != -1: continue  # outer contours only here
        if cv2.contourArea(c) < min_area * up * up: continue
        outer = cv2.approxPolyDP(c, eps * up, True)[:, 0, :] / up
        holes = []
        j = hier[i][2]
        while j != -1:
            if cv2.contourArea(cs[j]) >= min_area * up * up:
                holes.append((cv2.approxPolyDP(cs[j], eps * up, True)[:, 0, :] / up).round(2).tolist())
            j = hier[j][0]
        shapes.append({"outer": outer.round(2).tolist(), "holes": holes})
    return shapes
out = {"w": 1040, "h": 290, "letters": trace("public/abet/logo_solid.png"), "bull": trace("public/abet/logo_bull.png", min_area=8), "bear": trace("public/abet/logo_bear.png", min_area=8)}
json.dump(out, open("src/Abet/logoShapes.json", "w"))
print({k: (len(v), sum(len(s["outer"]) for s in v)) for k, v in out.items() if isinstance(v, list)})
