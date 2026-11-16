# reel 9 audio: fixed voice only (client: no music) + soft SFX from the client's pack
import subprocess, sys
out = sys.argv[1]; dur = 91.0
sfx = [(0.0, 'smooth_cammera_shutter', .3), (0.85, 'pop', .14), (5.3, 'pop', .14), (14.25, 'pop', .16), (20.7, 'pop', .16), (29.1, 'pop', .16),
       (39.4, 'pop', .15), (47.5, 'pop', .14), (54.2, 'pop', .15), (66.2, 'pop', .2), (66.55, 'pop', .2), (66.9, 'pop', .2), (71.45, 'pop', .14), (77.7, 'pop', .16), (84.8, 'pop', .15), (85.8, 'pop', .18)]
inp = ['-i', 'public/an9/voice.wav']; fc = ['[0:a]aformat=channel_layouts=stereo[v]']; lab = ['[v]']
for k, (t, n, vol) in enumerate(sfx, start=1):
    inp += ['-i', f'public/an9/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
