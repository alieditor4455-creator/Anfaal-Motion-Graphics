# reel 6 audio: crisp voice + ducked God's Plan + client SFX (pops on every chip, shutter on flash cuts, riser into big moments)
import subprocess, sys
out = sys.argv[1]; dur = 46.7
sfx = [(0.0, 'smooth_cammera_shutter', .3), (0.2, 'pop', .2), (3.15, 'pop', .2), (6.3, 'little_bit_hard_cammera_shutter', .5), (9.5, 'camera_shutter', .4),
       (10.3, 'pop', .18), (11.9, 'pop', .18), (13.45, 'pop', .2), (18.85, 'pop', .18), (21.1, 'pop', .2), (22.5, 'pop', .18), (25.5, 'pop', .18), (27.5, 'pop', .18),
       (29.3, 'pop', .18), (30.5, 'pop', .18), (32.9, 'little_bit_hard_cammera_shutter', .5), (37.2, 'camera_shutter', .4), (39.85, 'pop', .24), (41.95, 'pop', .2), (43.95, 'pop', .2),
       (6.4 - 2.4, 'premium_riser', .35), (33.0 - 2.4, 'premium_riser', .35)]
inp = ['-i', 'public/an6/voice.wav', '-i', 'public/an6/music.wav']
fc = ['[0:a]aformat=channel_layouts=stereo[v]', f'[1:a]aformat=channel_layouts=stereo,afade=t=out:st={dur - 1.4}:d=1.4[m]']; lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an6/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
