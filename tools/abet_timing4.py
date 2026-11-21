# v4: VO lines placed on a 118 BPM beat grid; word timings from voiced segments.
import soundfile as sf, numpy as np, json, re
B = 60 / 118
J = json.load(open("public/abet/vo2/lines.json"))
L = J["lines"]
BEAT = [2, 6, 13, 22, 26, 30, 41, 45, 51, 60, 66, 70, 74, 84]  # start beat of each line
out = []
for i, text in enumerate(L):
    a, sr = sf.read(f"public/abet/vo2/l{i:02d}.wav")
    hop = int(sr * 0.01)
    e = np.array([np.abs(a[j:j + hop]).mean() for j in range(0, len(a) - hop, hop)])
    v = e > 0.006
    k = 0
    while k < len(v):
        if not v[k]:
            j = k
            while j < len(v) and not v[j]: j += 1
            if j - k < 6 and k > 0 and j < len(v): v[k:j] = True
            k = j
        else: k += 1
    segs, s = [], None
    for k, x in enumerate(v):
        if x and s is None: s = k
        if not x and s is not None: segs.append([s / 100, k / 100]); s = None
    if s is not None: segs.append([s / 100, len(v) / 100])
    words = text.split(" ")
    wts = [len(re.sub(r"[^\w]", "", w)) + 1.5 for w in words]
    tv = sum(b - a_ for a_, b in segs)
    def vt(frac):
        target = frac * tv; acc = 0
        for a_, b in segs:
            if acc + (b - a_) >= target: return a_ + (target - acc)
            acc += b - a_
        return segs[-1][1]
    cum = np.cumsum([0] + wts) / sum(wts)
    st = BEAT[i] * B
    out.append({"start": round(st, 3), "dur": round(len(a) / sr, 3), "text": text, "words": words, "t": [round(st + vt(c), 3) for c in cum[:-1]]})
json.dump(out, open("src/Abet/timing4.json", "w"), indent=1)
for o in out: print("%.2f-%.2f" % (o["start"], o["start"] + o["dur"]), o["text"][:40], [round(x, 2) for x in o["t"]][:8])
