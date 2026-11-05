# Matte for footage already on black: brightness key (keeps chair, legs, arms, anything lit) combined with a
# U2-Net person matte (rescues dark hair that is close to black), guided-filter edges, slight feather.
# Writes ProRes 4444 with alpha (fast to decode in Remotion). usage: key_black.py model.onnx in.mp4 out.mov [test_sec test.png]
import sys, subprocess, numpy as np, onnxruntime as ort, cv2
M, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
test = float(sys.argv[4]) if len(sys.argv) > 4 else None
sess = ort.InferenceSession(M, providers=["CPUExecutionProvider"]); inp = sess.get_inputs()[0].name
mean = np.array([0.485, 0.456, 0.406]); std = np.array([0.229, 0.224, 0.225])
def gf(I, p, r, eps):
    bf = lambda a: cv2.boxFilter(a, -1, (r, r))
    mI, mp = bf(I), bf(p); cov = bf(I * p) - mI * mp; var = bf(I * I) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    return bf(a) * I + bf(b)
cap = cv2.VideoCapture(src); fps = cap.get(5); W, H = int(cap.get(3)), int(cap.get(4))
if test is not None: cap.set(cv2.CAP_PROP_POS_MSEC, test * 1000)
proc = None if test is not None else subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
    "-c:v", "prores_ks", "-profile:v", "4", "-pix_fmt", "yuva444p10le", "-vendor", "apl0", "-qscale:v", "9", out], stdin=subprocess.PIPE)
prev = None; n = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    f = fr.astype(np.float32) / 255
    mx = cv2.GaussianBlur(f.max(2), (3, 3), 0)
    lum = np.clip((mx - 0.045) / 0.10, 0, 1)
    x = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), (320, 320)).astype(np.float32) / 255
    x = ((x - mean) / std).transpose(2, 0, 1)[None].astype(np.float32)
    m = sess.run(None, {inp: x})[0][0, 0]; m = (m - m.min()) / (m.max() - m.min() + 1e-6)
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    seg = np.clip((m - 0.3) / 0.4, 0, 1)
    a = np.maximum(lum, seg)
    hard = (a > 0.5).astype(np.uint8); k, lab, st, _ = cv2.connectedComponentsWithStats(hard, connectivity=8)
    if k > 1:
        keep = np.zeros(k, bool); keep[1:] = st[1:, 4] > 3000
        a = a * cv2.dilate(keep[lab].astype(np.float32), np.ones((9, 9)))
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    a = np.clip(np.nan_to_num(gf(np.maximum(g, seg * 0.3), a.astype(np.float32), 7, 6e-4)), 0, 1)
    a = cv2.GaussianBlur(np.clip((cv2.erode(a, np.ones((3, 3))) - 0.04) / 0.92, 0, 1), (5, 5), 0)
    if prev is not None: a = prev * 0.25 + a * 0.75
    prev = a
    o = fr
    if test is not None:
        bg = np.zeros_like(fr); bg[:] = (40, 60, 20)
        cv2.imwrite(sys.argv[5], (o * a[..., None] + bg * (1 - a[..., None])).astype(np.uint8)); break
    proc.stdin.write(np.dstack([o, (a * 255).astype(np.uint8)]).tobytes()); n += 1
    if n % 480 == 0: print("frames", n, flush=True)
if proc: proc.stdin.close(); proc.wait(); print("done", n)
