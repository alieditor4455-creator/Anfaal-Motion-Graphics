# reel 8 audio: speech track (voice + both recordings spliced into the pause) + ducked music + client SFX
import subprocess, sys
out = sys.argv[1]; A, RA, RB, B = 15.3, 7.0, 636 / 30, 25.25
dur = A + RA + RB + (101.375 - B)
def o(t):  # source speaker time -> output time
    return t if t < A else A + RA + RB + (t - B)
sfx = [(0.0, 'smooth_cammera_shutter', .3), (0.3, 'pop', .16), (1.9, 'pop', .16), (5.1, 'pop', .16), (10.5, 'pop', .16),
       (A - 2.4, 'premium_riser', .3), (A - 0.1, 'camera_shutter', .45), (A + RA - 0.1, 'smooth_cammera_shutter', .4), (A + RA + RB - 0.1, 'camera_shutter', .45),
       (A + RA - 1.3, 'pop', .24), (A + RA + RB - 1.3, 'pop', .24),
       (o(28.1), 'pop', .16), (o(31.8), 'pop', .16), (o(47.9), 'pop', .16), (o(67.1), 'pop', .16), (o(81.5), 'pop', .18), (o(96.0), 'pop', .16)]
inp = ['-i', 'public/an8/speech_full.wav', '-i', 'public/an8/music.wav']
fc = ['[0:a]aformat=channel_layouts=stereo[v]', f'[1:a]aformat=channel_layouts=stereo,afade=t=out:st={dur - 1.4}:d=1.4[m]']; lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an8/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
