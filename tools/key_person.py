# Clean green-screen key that keeps EVERYTHING that is not green (person, legs, chair).
# Green-difference matte (bg gd >= 0.078, subject gd <= ~0.02 on this footage), largest-subject
# cleanup + hole fill, guided-filter edge refine, light temporal smoothing, despill (G <= max(R,B)).
# usage: key_person.py in.mp4 out.webm [test_frame_sec test_out.jpg]
import sys, subprocess, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
test = float(sys.argv[3]) if len(sys.argv) > 3 else None
T0, T1 = 0.028, 0.072
def gf(I, p, r, eps):
    bf = lambda a: cv2.boxFilter(a, -1, (r, r))
    mI, mp = bf(I), bf(p); cov = bf(I * p) - mI * mp; var = bf(I * I) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    return bf(a) * I + bf(b)
cap = cv2.VideoCapture(src); fps = cap.get(5); W, H = int(cap.get(3)), int(cap.get(4))
if test is not None: cap.set(cv2.CAP_PROP_POS_MSEC, test * 1000)
proc = None if test is not None else subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-deadline", "good", "-cpu-used", "5", "-row-mt", "1", "-auto-alt-ref", "0", out], stdin=subprocess.PIPE)
prev = None; n = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    f = fr.astype(np.float32) / 255
    B, G, R = f[..., 0], f[..., 1], f[..., 2]
    gd = cv2.GaussianBlur(G - np.maximum(R, B), (3, 3), 0)
    a = 1 - np.clip((gd - T0) / (T1 - T0), 0, 1)
    # cleanup: keep the subject (largest blob + anything touching it), fill interior holes, drop specks
    hard = (a > 0.5).astype(np.uint8)
    k, lab, st, _ = cv2.connectedComponentsWithStats(hard, connectivity=8)
    if k > 1:
        keep = np.zeros(k, bool); keep[1:] = st[1:, 4] > 4000
        core = keep[lab]
        inv = (~core).astype(np.uint8); kk, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
        holes = np.zeros(kk, bool)
        for j in range(1, kk):
            x, y, w, h, area = st2[j]
            if area < 25000 and x > 0 and y > 0 and x + w < W and y + h < H: holes[j] = True
        core = core | holes[lab2]
        a = np.where(core, np.maximum(a, cv2.erode(core.astype(np.float32), np.ones((5, 5)))), a * cv2.dilate(core.astype(np.float32), np.ones((7, 7))))
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    a = np.clip(np.nan_to_num(gf(g, a.astype(np.float32), 5, 4e-4)), 0, 1)
    a = np.clip((a - 0.04) / 0.92, 0, 1)
    if prev is not None: a = prev * 0.2 + a * 0.8
    prev = a
    G2 = np.minimum(G, np.maximum(R, B) + 0.005)                        # despill only greenish pixels
    edge = np.clip(1 - a, 0, 1) ** 0.5                                    # extra neutralise on soft edges
    G2 = G2 * (1 - edge * 0.25) + ((R + B) / 2) * edge * 0.25
    o = (np.clip(np.dstack([B, G2, R]), 0, 1) * 255).astype(np.uint8)
    if test is not None:
        bg = np.zeros_like(fr); bg[:] = (30, 18, 12)
        comp = (o * a[..., None] + bg * (1 - a[..., None])).astype(np.uint8)
        cv2.imwrite(sys.argv[4], comp); break
    proc.stdin.write(np.dstack([o, (a * 255).astype(np.uint8)]).tobytes()); n += 1
    if n % 240 == 0: print("frames", n, flush=True)
if proc: proc.stdin.close(); proc.wait(); print("done", n)
