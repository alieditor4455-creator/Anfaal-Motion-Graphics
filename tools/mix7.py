# reel 7 audio: crisp voice only (client: no music) + soft SFX from the client's pack
import subprocess, sys
out = sys.argv[1]; dur = 87.95
sfx = [(0.0, 'smooth_cammera_shutter', .32), (3.65, 'pop', .16), (9.25, 'pop', .14), (9.95, 'pop', .14), (10.7, 'pop', .14), (13.55, 'pop', .16),
       (22.3, 'camera_shutter', .4), (27.6, 'smooth_cammera_shutter', .32), (28.25, 'pop', .16), (36.45, 'little_bit_hard_cammera_shutter', .4), (39.1, 'pop', .2),
       (47.95, 'pop', .16), (53.0, 'pop', .16), (62.25, 'pop', .16), (66.3, 'pop', .16), (73.05, 'pop', .14), (75.4, 'pop', .2), (82.45, 'pop', .16), (83.85, 'pop', .16),
       (22.39 - 2.4, 'premium_riser', .28)]
inp = ['-i', 'public/an7/voice.wav']; fc = ['[0:a]aformat=channel_layouts=stereo[v]']; lab = ['[v]']
for k, (t, n, vol) in enumerate(sfx, start=1):
    inp += ['-i', f'public/an7/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
