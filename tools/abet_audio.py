# ABET explainer audio: original ambient score + UI SFX + VO, with music ducking under the voice.
# usage: python3 tools/abet_audio.py out.wav
import json, sys
import numpy as np
import soundfile as sf

SR = 48000
DUR = 71.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
TM = json.load(open("src/Abet/timing.json"))
wt = lambda l, w: TM[l]["t"][w]


def t_arr(n):
    return np.arange(n) / SR


def lowpass(x, fc):
    # one-pole lowpass, vectorised via FFT-free recursion approximation (exp smoothing)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(0, len(x), 4096):  # block recursion for speed
        seg = x[i:i + 4096]
        out = np.empty_like(seg)
        for j, v in enumerate(seg):
            acc = (1 - a) * v + a * acc
            out[j] = acc
        y[i:i + 4096] = out
    return y


def fft_convolve(x, h):
    n = len(x) + len(h) - 1
    m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[:len(x)]


def reverb(x, secs=2.8, wet=0.35, pre=0.02):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + fft_convolve(x, ir) * wet * 2.2


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    e[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return e


# ---------------- score ----------------
NOTE = lambda m: 440.0 * 2 ** ((m - 69) / 12)
# D major: Dmaj9, Bm9, Gmaj7(#11), Asus -> A ; 4.5 s per chord
CHORDS = [[50, 57, 62, 66, 69, 76], [47, 54, 62, 66, 69, 73], [43, 55, 62, 66, 71, 73], [45, 52, 59, 64, 69, 71]]
CH = 4.5
L = np.zeros(N)
R = np.zeros(N)

ci = 0
start = 0.0
while start < DUR:
    ch = CHORDS[ci % 4]
    s0 = int(start * SR)
    ln = int((CH + 2.2) * SR)
    n = min(ln, N - s0)
    if n <= 0:
        break
    tt = t_arr(n)
    e = env_adsr(n, 1.6, 2.4)[:n]
    for j, m in enumerate(ch):
        f = NOTE(m)
        amp = 0.05 if j else 0.07
        for side, det in ((0, 0.9985), (1, 1.0015)):
            v = np.zeros(n)
            for h in range(1, 6):
                v += np.sin(2 * np.pi * f * det * h * tt + h * 0.7 + j) / h ** 1.6
            (L if side == 0 else R)[s0:s0 + n] += v * amp * e
    # sub
    sub = np.sin(2 * np.pi * NOTE(ch[0] - 12) * tt) * 0.09 * e
    L[s0:s0 + n] += sub
    R[s0:s0 + n] += sub
    ci += 1
    start += CH

pad = np.stack([L, R])
pad = np.stack([lowpass(pad[0], 1400), lowpass(pad[1], 1400)])

# plucked arpeggio during the light world (17.6 - 62.4), 100 bpm eighths
arp = np.zeros((2, N))
step = 0.3
pat = [0, 2, 3, 4, 3, 2, 4, 5]
tcur = 17.6
k = 0
while tcur < 62.2:
    ch = CHORDS[int(tcur // CH) % 4]
    m = ch[pat[k % 8] % len(ch)] + 12
    f = NOTE(m)
    n = int(0.9 * SR)
    s0 = int(tcur * SR)
    if s0 + n > N:
        break
    tt = t_arr(n)
    v = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 6.5)
    v *= np.minimum(1, tt * 400)
    fade_in = min(1, (tcur - 17.6) / 3)
    fade_out = min(1, (62.2 - tcur) / 2)
    g = 0.045 * fade_in * fade_out * (0.85 + 0.15 * ((k % 4) == 0))
    pan = 0.5 + 0.35 * np.sin(k * 0.9)
    arp[0, s0:s0 + n] += v * g * (1 - pan) * 1.4
    arp[1, s0:s0 + n] += v * g * pan * 1.4
    tcur += step
    k += 1
# echo
d = int(0.45 * SR)
for _ in range(3):
    arp[:, d:] += arp[:, :-d] * 0.28

music = pad + arp
music = np.stack([reverb(music[0], wet=0.4), reverb(music[1], wet=0.4)])

# global music envelope: fade in, swell for outro, end ring-out
t = t_arr(N)
menv = np.clip(t / 2.5, 0, 1) * (1 - np.clip((t - 69.6) / 1.4, 0, 1))
menv *= 0.85 + 0.15 * np.clip((t - 63) / 2, 0, 1)
music *= menv

# ---------------- SFX ----------------
sfx = np.zeros((2, N))


def put(sig, at, gain=1.0, pan=0.5):
    s0 = int(at * SR)
    if s0 >= N:
        return
    n = min(len(sig), N - s0)
    sfx[0, s0:s0 + n] += sig[:n] * gain * (1 - pan) * 1.4
    sfx[1, s0:s0 + n] += sig[:n] * gain * pan * 1.4


def whoosh(d=0.9, lo=300, hi=3000):
    n = int(d * SR)
    tt = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # sweep a resonant band by mixing differently-filtered layers
    a = lowpass(noise, hi) - lowpass(noise, lo)
    e = np.sin(np.pi * tt) ** 2 * np.exp(-tt * 0.8)
    out = a * e
    return out / (np.abs(out).max() + 1e-9)


def click(f=2400, d=0.05):
    n = int(d * SR)
    tt = t_arr(n)
    v = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) + 0.4 * rng.standard_normal(n) * np.exp(-tt * 300)
    return v / np.abs(v).max()


def pop(f0=900, f1=520, d=0.14):
    n = int(d * SR)
    tt = t_arr(n)
    f = np.linspace(f0, f1, n)
    v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28)
    return v / np.abs(v).max()


def chime(fs=(1318.5, 1975.5), d=1.6):
    n = int(d * SR)
    tt = t_arr(n)
    v = np.zeros(n)
    for i, f in enumerate(fs):
        s = int(i * 0.09 * SR)
        v[s:] += (np.sin(2 * np.pi * f * tt[: n - s]) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt[: n - s])) * np.exp(-tt[: n - s] * 3.2)
    return v / np.abs(v).max()


def impact(d=1.8):
    n = int(d * SR)
    tt = t_arr(n)
    f = 46 + 40 * np.exp(-tt * 12)
    v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    v += lowpass(rng.standard_normal(n), 900) * np.exp(-tt * 9) * 0.6
    return v / np.abs(v).max()


def riser(d=1.3):
    n = int(d * SR)
    tt = np.linspace(0, 1, n)
    v = (lowpass(rng.standard_normal(n), 4000) - lowpass(rng.standard_normal(n), 400)) * tt ** 2.2
    v += np.sin(2 * np.pi * np.cumsum(300 + 900 * tt ** 2) / SR) * tt ** 3 * 0.3
    return v / np.abs(v).max()


def shimmer(d=1.8):
    n = int(d * SR)
    tt = t_arr(n)
    v = np.zeros(n)
    for f in (2349.3, 2793.8, 3520.0):
        v += np.sin(2 * np.pi * f * tt + f) * np.exp(-tt * 2.5)
    v *= np.minimum(1, tt * 20)
    return v / np.abs(v).max()


W1, W2, W3 = whoosh(0.9), whoosh(1.2, 200, 2200), whoosh(0.6, 600, 5000)
CL, PO, PO2 = click(), pop(), pop(1200, 760, 0.1)

# intro
put(riser(1.25), 0.1, 0.10)
put(impact(), 1.32, 0.30)
put(shimmer(), 2.2, 0.06, 0.7)
put(riser(0.9), 4.3, 0.07)
put(W2, 4.95, 0.12)
# what is ABET
put(W1, 5.4, 0.07, 0.45)
for a, p in ((wt(2, 1), 0.3), (wt(2, 3), 0.35), (wt(2, 4), 0.7), (wt(2, 8), 0.75)):
    put(PO, a, 0.08, p)
put(riser(1.1), 16.3, 0.09)
put(W2, 16.9, 0.10)
# how it works
put(W3, 17.7, 0.06)
put(W1, 20.8, 0.08)
for s in (TM[4]["start"], TM[5]["start"], TM[6]["start"], TM[7]["start"]):
    put(PO2, s, 0.08)
put(riser(0.8), 29.1, 0.07)
put(W2, 29.7, 0.11)
# deposit
put(W3, 34.75, 0.09)
put(CL, 36.52, 0.16)
put(W1, 37.15, 0.10)
for i in (5, 7, 9):
    put(PO2, wt(10, i), 0.05, 0.4 + i * 0.03)
put(CL, 42.78, 0.15)
put(PO, 42.85, 0.06)
for c in (43.55, 48.75, 54.35):
    put(CL, c, 0.14)
for c in (43.75, 49.05, 54.65):
    put(W3, c, 0.05)
for i in range(7):
    put(click(3200 + 200 * (i % 3), 0.03), 45.35 + i * (0.8 / 7), 0.09)
put(CL, 46.3, 0.12)
for i in range(4):
    put(PO2, wt(12, 6) + i * 0.32, 0.06)
put(CL, wt(13, 2) + 0.05, 0.16)
put(chime(), 57.1, 0.13)
put(W1, 58.7, 0.08)
put(W3, 59.75, 0.07, 0.7)
put(PO, 61.35, 0.08, 0.7)
# outro
put(riser(0.9), 61.4, 0.07)
put(W2, 62.2, 0.13)
put(impact(), 64.25, 0.26)
put(shimmer(), 65.1, 0.06, 0.3)
put(PO2, 67.2, 0.06)
put(PO2, 67.34, 0.06)

sfx = np.stack([reverb(sfx[0], 1.6, 0.25), reverb(sfx[1], 1.6, 0.25)])

# ---------------- VO ----------------
vo = np.zeros(N)
for i, L_ in enumerate(TM):
    a, sr = sf.read(f"public/abet/aud/l{i:02d}_48.wav")
    s0 = int(L_["start"] * SR)
    vo[s0:s0 + len(a)] += a[: N - s0]
vo = vo / (np.abs(vo).max() + 1e-9) * 0.82
# gentle presence: small high-shelf-ish lift by adding a touch of the high band
vo = vo + 0.15 * (vo - lowpass(vo, 3000))

# ducking envelope from VO
envv = np.abs(vo)
win = int(0.25 * SR)
envv = np.convolve(envv, np.ones(win) / win, mode="same")
envv = np.clip(envv / (envv.max() + 1e-9) * 3.0, 0, 1)
duck = 1 - 0.5 * envv

mix_ = music * duck * 0.9 + sfx
mix_[0] += vo
mix_[1] += vo
peak = np.abs(mix_).max()
mix_ = mix_ / peak * 0.89
sf.write(sys.argv[1], mix_.T, SR, subtype="PCM_24")
print("audio ok", round(peak, 3))
