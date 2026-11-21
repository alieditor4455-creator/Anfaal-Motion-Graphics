# ABET v4 audio: original 118 BPM tech-pulse track + minimal UI SFX + VO, ducked under the voice.
# usage: python3 -I tools/abet_audio4.py out.wav
import json, sys
import numpy as np
import soundfile as sf

SR = 48000
DUR = 48.0
N = int(SR * DUR)
B = 60 / 118
BAR = 4 * B
rng = np.random.default_rng(11)
TM = json.load(open("src/Abet/timing4.json"))
wt = lambda l, w: TM[l]["t"][w]
NOTE = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def fft_filter(x, lo=None, hi=None):
    """Zero-phase band filter with soft (raised-cosine) edges."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= np.clip(1 - (f - hi) / (hi * 0.6), 0, 1) ** 2
    if lo:
        g *= np.clip((f - lo * 0.6) / (lo * 0.4), 0, 1) ** 2
    return np.fft.irfft(X * g, n)


def conv(x, h):
    n = len(x) + len(h) - 1
    m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[: len(x)]


def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir[: int(0.015 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    return x * (1 - wet) + conv(x, ir) * wet * 2.0


T = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)


def add(sig, at, g=1.0, pan=0.5, dst=None):
    s0 = int(at * SR)
    if s0 >= N or s0 < 0:
        return
    n = min(len(sig), N - s0)
    (dst[0] if dst else L)[s0:s0 + n] += sig[:n] * g * (1 - pan) * 1.4
    (dst[1] if dst else R)[s0:s0 + n] += sig[:n] * g * pan * 1.4


# ---------- sections ----------
GROOVE_ON = 2 * B * 2  # drums from bar 1 (2.03 s)
BREAK = (41 * B, 45 * B)  # drums out under "So, how do you deposit?"
END_HIT = 92 * B
def drums_on(t):
    return GROOVE_ON <= t < END_HIT and not (BREAK[0] <= t < BREAK[1])

# ---------- instruments ----------
def kick():
    n = int(0.32 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 32)
    v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    v += 0.25 * fft_filter(rng.standard_normal(n), lo=1500) * np.exp(-t * 120)
    return v / np.abs(v).max()

def clap():
    n = int(0.22 * SR); t = np.arange(n) / SR
    env = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.012) * 400) ** 2) + 0.5 * np.exp(-((t - 0.024) * 400) ** 2)
    v = fft_filter(rng.standard_normal(n), lo=900, hi=5000) * env
    return v / np.abs(v).max()

def hat(d=0.045):
    n = int(d * SR); t = np.arange(n) / SR
    v = fft_filter(rng.standard_normal(n), lo=7000) * np.exp(-t * (60 if d < 0.1 else 14))
    return v / np.abs(v).max()

KICK, CLAP, HAT, OHAT = kick(), clap(), hat(), hat(0.25)

CHORDS = [[47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [50, 57, 62, 66, 69], [45, 52, 57, 61, 64]]  # Bm7 G D A

def pluck(f, d=0.32):
    n = int(d * SR); t = np.arange(n) / SR
    v = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 30) + 0.25 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 40)
    return v * np.exp(-t * 11) * np.minimum(1, t * 600)

def bass_note(f, d):
    n = int(d * SR); t = np.arange(n) / SR
    v = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 7))
    env = np.minimum(1, t * 300) * np.exp(-t * 3.5)
    return v * env

# ---------- arrange ----------
drum = [np.zeros(N), np.zeros(N)]
mus = [np.zeros(N), np.zeros(N)]
nbeats = int(DUR / B) + 1
for b in range(nbeats):
    tb = b * B
    if drums_on(tb):
        add(KICK, tb, 0.55, 0.5, drum)
        if b % 2 == 1:
            add(CLAP, tb, 0.22, 0.52, drum)
        add(HAT, tb + B / 2, 0.06, 0.62, drum)
        if b % 4 == 3:
            add(OHAT, tb + B / 2, 0.05, 0.38, drum)
        if b % 2 == 0:
            add(HAT, tb + B * 0.75, 0.035, 0.66, drum)
    # harmony
    ch = CHORDS[(b // 4) % 4]
    in_break = BREAK[0] <= tb < BREAK[1]
    if tb < END_HIT + B:
        # bass: eighths on the root
        if tb >= GROOVE_ON and not in_break:
            for e in (0, 0.5):
                add(bass_note(NOTE(ch[0] - 12), B * 0.48), tb + e * B, 0.22, 0.5, mus)
        # plucks: syncopated stabs
        for e, idx in ((0.5, 3), (0.75, 2), (1.5 if b % 2 == 0 else 9, 4)):
            if e < 1 and (tb >= 1.0):
                add(pluck(NOTE(ch[idx] + 12)), tb + e * B, 0.05 if not in_break else 0.035, 0.35 + 0.3 * (idx % 2), mus)
# pad (whole track, softer in the groove)
for bar in range(int(DUR / BAR) + 1):
    ch = CHORDS[bar % 4]
    s0 = bar * BAR
    n = int((BAR + 0.8) * SR)
    t = np.arange(n) / SR
    e = np.minimum(1, t / 0.4) * np.clip((BAR + 0.8 - t) / 0.8, 0, 1)
    for j, m in enumerate(ch[1:]):
        for side, det in ((0, 0.998), (1, 1.002)):
            v = sum(np.sin(2 * np.pi * NOTE(m) * det * h * t + j) / h ** 1.8 for h in range(1, 4))
            add(v * e, s0, 0.018, 0.2 if side == 0 else 0.8, mus)

# sweeps and hits at the transitions (soft)
def riser(d):
    n = int(d * SR); x = np.linspace(0, 1, n)
    v = fft_filter(rng.standard_normal(n), lo=600, hi=6000) * x ** 2.5
    return v / np.abs(v).max()
def impact(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    f = 44 + 50 * np.exp(-t * 14)
    v = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) + 0.4 * fft_filter(rng.standard_normal(n), hi=1200) * np.exp(-t * 10)
    return v / np.abs(v).max()
def air(d=0.8):
    n = int(d * SR); x = np.linspace(0, 1, n)
    v = fft_filter(rng.standard_normal(n), lo=150, hi=1600) * np.sin(np.pi * x) ** 2
    return v / np.abs(v).max()

for (at, d) in ((BREAK[1] - 2 * B, 2 * B), (END_HIT - 6 * B, 2 * B)):
    add(riser(d), at, 0.06, 0.5, mus)
add(impact(), 0.12, 0.25, 0.5, mus)           # logo
add(impact(), BREAK[1], 0.26, 0.5, mus)       # "deposit?" mask reveal / groove back in
add(impact(), 41.9, 0.22, 0.5, mus)           # outro logo
add(KICK, END_HIT, 0.5, 0.5, drum)
add(CLAP, END_HIT, 0.2, 0.5, drum)

# sidechain pump from the kick
pump = np.ones(N)
for b in range(nbeats):
    tb = b * B
    if drums_on(tb) or abs(tb - END_HIT) < 1e-6:
        s0 = int(tb * SR); n = int(0.3 * SR)
        seg = 1 - 0.45 * np.exp(-np.arange(n) / SR * 14)
        pump[s0:s0 + n] = np.minimum(pump[s0:s0 + n], seg[: max(0, min(n, N - s0))])
mus = [reverb(mus[0] * pump, 2.2, 0.3), reverb(mus[1] * pump, 2.2, 0.3)]
drum = [reverb(drum[0], 1.0, 0.12), reverb(drum[1], 1.0, 0.12)]
music = np.stack([mus[0] + drum[0], mus[1] + drum[1]])
music *= np.clip(T / 0.3, 0, 1) * (1 - np.clip((T - 47.2) / 0.8, 0, 1))

# ---------- SFX: only UI essentials + 2 soft air swishes ----------
def click(f=2400, d=0.05):
    n = int(d * SR); t = np.arange(n) / SR
    v = np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + 0.4 * rng.standard_normal(n) * np.exp(-t * 300)
    return v / np.abs(v).max()
def chime():
    n = int(1.4 * SR); t = np.arange(n) / SR; v = np.zeros(n)
    for i, f in enumerate((1318.5, 1975.5)):
        s = int(i * 0.08 * SR); v[s:] += np.sin(2 * np.pi * f * t[: n - s]) * np.exp(-t[: n - s] * 3.4)
    return v / np.abs(v).max()
sfx = [np.zeros(N), np.zeros(N)]
CL = click()
for c in (wt(7, 4) + 0.05, 29.45, 29.95, 33.05, 35.05, wt(11, 0) + 0.05):
    add(CL, c, 0.13, 0.5, sfx)
for i in range(7):
    add(click(3200 + 200 * (i % 3), 0.03), 31.1 + i * (0.65 / 7), 0.07, 0.5, sfx)
add(chime(), 36.25, 0.1, 0.5, sfx)
add(air(), 2.35, 0.04, 0.5, sfx)
add(air(0.6), 12.75, 0.045, 0.5, sfx)
sfx = np.stack([reverb(sfx[0], 1.2, 0.2), reverb(sfx[1], 1.2, 0.2)])

# ---------- VO ----------
vo = np.zeros(N)
for i, Lr in enumerate(TM):
    a, _ = sf.read(f"public/abet/aud3/l{i:02d}.wav")
    s0 = int(Lr["start"] * SR)
    vo[s0:s0 + len(a)] += a[: N - s0]
vo = vo / (np.abs(vo).max() + 1e-9) * 0.82
vo = vo + 0.15 * fft_filter(vo, lo=3000)
env = np.convolve(np.abs(vo), np.ones(int(0.2 * SR)) / int(0.2 * SR), mode="same")
env = np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
duck = 1 - 0.42 * env

mix_ = music * duck * 0.95 + sfx
mix_[0] += vo
mix_[1] += vo
peak = np.abs(mix_).max()
mix_ = mix_ / peak * 0.89
sf.write(sys.argv[1], mix_.T, SR, subtype="PCM_24")
print("audio ok", round(peak, 3))
