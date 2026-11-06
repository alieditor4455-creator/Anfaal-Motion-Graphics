#!/usr/bin/env python3
"""Usage: python3 glitch_scan.py <video.mp4> [more.mp4 ...]
Flags frames whose change is >3.5x the local median (a jump / pop / flicker). Must print 'spikes []' for the
no-footage version. In the footage version, any spike must lie inside the footage window (the speaker's own
movement) - check with --where <seconds>."""
import subprocess, sys, numpy as np
from fractions import Fraction
def frames(p, ss=None, t=None, w=135, h=240):
    cmd=["ffmpeg","-v","error"]+(["-ss",str(ss),"-t",str(t)] if ss is not None else [])+["-i",p,"-vf",f"scale={w}:{h},format=gray","-f","rawvideo","-"]
    raw=subprocess.run(cmd,capture_output=True).stdout; return np.frombuffer(raw,np.uint8).reshape(-1,h,w).astype(float)
args=sys.argv[1:]
if "--where" in args:
    i=args.index("--where"); sec=float(args[i+1]); f=frames(args[0],sec-0.05,0.12,270,480)
    for k in range(len(f)-1):
        d=np.abs(f[k+1]-f[k]); ys,xs=np.where(d>25)
        print(k, round(d.mean(),2), (xs.min()*4,xs.max()*4,ys.min()*4,ys.max()*4) if len(xs) else None)
    sys.exit()
for p in args:
    f=frames(p); d=np.abs(np.diff(f,axis=0)).mean(axis=(1,2))
    fps=float(Fraction(subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=r_frame_rate","-of","csv=p=0",p],capture_output=True,text=True).stdout.strip().split("\n")[0].strip(",")))
    sp=[(round((i+1)/fps,2),round(float(d[i]),2)) for i in range(4,len(d)-4) if d[i]>max(0.8,3.5*np.median(np.r_[d[i-4:i],d[i+1:i+5]]))]
    print(p,"frames",len(f),"spikes",sp)
