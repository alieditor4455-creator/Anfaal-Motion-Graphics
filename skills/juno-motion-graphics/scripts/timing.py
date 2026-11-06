#!/usr/bin/env python3
"""Usage: python3 timing.py <raw.mp4> [threshold_dB=-32]
Prints speech phrases (start-end, seconds) from silence detection. Map each phrase to a beat in the template.
Words inside a phrase: split the phrase evenly by syllables, then confirm on the frame sheet / by ear."""
import subprocess, sys, re
raw = sys.argv[1]; thr = sys.argv[2] if len(sys.argv) > 2 else "-32"
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",raw],capture_output=True,text=True).stdout)
log = subprocess.run(["ffmpeg","-i",raw,"-af",f"silencedetect=noise={thr}dB:d=0.12","-f","null","-"],capture_output=True,text=True).stderr
s = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; e = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
cur = 0.0; segs = []
for a, b in zip(s, e):
    if a - cur > 0.08: segs.append((cur, a))
    cur = b
if dur - cur > 0.08: segs.append((cur, dur))
print(f"duration {dur:.2f}s")
for i, (a, b) in enumerate(segs): print(f"phrase {i+1}: {a:5.2f} - {b:5.2f}  ({b-a:.2f}s)")
