# reel 10 audio: cleaned voice (no music) + soft UI SFX from the client's pack
import subprocess, sys
out = sys.argv[1]; dur = 58.3
sfx = [(0.0, 'smooth_cammera_shutter', .3), (0.45, 'pop', .14), (1.75, 'pop', .1), (2.85, 'pop', .14), (5.25, 'pop', .14),
       (8.1, 'whoosh', .22), (8.45, 'pop', .12), (11.05, 'pop', .1), (13.96, 'pop', .1), (16.9, 'whoosh', .22), (17.2, 'pop', .12), (17.5, 'pop', .12), (17.8, 'pop', .12),
       (19.9, 'whoosh', .22), (22.75, 'pop', .14), (25.4, 'pop', .14), (26.2, 'pop', .1), (30.84, 'whoosh', .25), (32.5, 'pop', .12),
       (36.75, 'whoosh', .22), (37.93, 'pop', .2), (38.1, 'pop', .2), (40.1, 'pop', .14), (45.75, 'pop', .12), (48.0, 'pop', .14), (50.3, 'pop', .18),
       (52.2, 'pop', .16), (53.15, 'pop', .14), (55.0, 'pop', .15), (57.0, 'pop', .15)]
inp = ['-i', 'public/an10/voice.wav']; fc = ['[0:a]aformat=channel_layouts=stereo[v]']; lab = ['[v]']
for k, (t, n, vol) in enumerate(sfx, start=1):
    inp += ['-i', f'public/an10/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
