# Word timings for each VO line: distribute words over voiced segments (energy-based), weighted by length.
import soundfile as sf, numpy as np, json, re
L = [
 "Meet ABET Global.",
 "One clean portal for the global markets.",
 "Your wallet, your accounts, social trading and the economic calendar. All in one place.",
 "Getting started takes four simple steps.",
 "Create your account.",
 "Verify your profile.",
 "Fund your wallet.",
 "And start trading.",
 "So, how do you make a deposit? Let's walk through it.",
 "From your dashboard, tap Deposit.",
 "Step one. Choose your method: crypto wallet, e-wallet, or local bank.",
 "Step two. Enter the amount, and your payment details.",
 "Step three. Review your summary, and double check every detail.",
 "Step four. Confirm. Your deposit is on its way, and you can track it in your latest transactions.",
 "ABET Global. Your markets, simplified.",
]
START = [3.4, 6.0, 10.2, 18.0, 21.6, 23.6, 26.1, 27.8, 30.6, 34.6, 38.2, 44.4, 49.6, 55.2, 65.2]
out = []
for i, text in enumerate(L):
    a, sr = sf.read(f"public/abet/vo/l{i:02d}.wav")
    hop = int(sr * 0.01)
    e = np.array([np.abs(a[j:j + hop]).mean() for j in range(0, len(a) - hop, hop)])
    voiced = e > 0.006
    # close tiny gaps (<60ms)
    v = voiced.copy(); k = 0
    while k < len(v):
        if not v[k]:
            j = k
            while j < len(v) and not v[j]: j += 1
            if j - k < 6 and k > 0 and j < len(v): v[k:j] = True
            k = j
        else: k += 1
    segs = []; s = None
    for k, x in enumerate(v):
        if x and s is None: s = k
        if not x and s is not None: segs.append([s / 100, k / 100]); s = None
    if s is not None: segs.append([s / 100, len(v) / 100])
    words = text.split(" ")
    wts = [len(re.sub(r"[^\w]", "", w)) + 1.5 for w in words]
    total_v = sum(b - a_ for a_, b in segs)
    # map cumulative weight onto voiced time
    def vt(frac):
        target = frac * total_v; acc = 0
        for a_, b in segs:
            if acc + (b - a_) >= target: return a_ + (target - acc)
            acc += b - a_
        return segs[-1][1]
    cum = np.cumsum([0] + wts) / sum(wts)
    wt = [round(START[i] + vt(c), 3) for c in cum[:-1]]
    out.append({"start": START[i], "dur": round(len(a) / sr, 3), "text": text, "words": words, "t": wt})
json.dump(out, open("src/Abet/timing.json", "w"), indent=1)
for o in out: print(o["start"], o["dur"], list(zip(o["words"], o["t"]))[:6])
