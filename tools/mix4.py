# reel 4 audio: crisp voice + ducked God's Plan + client SFX pack on every shutter cut
import subprocess, sys
out = sys.argv[1]; CA, CB = 50.06, 54.14; dur = 65.0 - (CB - CA)
sh = lambda t: t if t < CA else t - (CB - CA)
cuts = [(5.95, 'camera_shutter', .5), (11.38, 'smooth_cammera_shutter', .4), (18.84, 'camera_shutter', .5), (24.9, 'little_bit_hard_cammera_shutter', .5),
        (31.6, 'smooth_cammera_shutter', .4), (33.75, 'little_bit_hard_cammera_shutter', .5), (36.63, 'smooth_cammera_shutter', .4)]
sfx = [(0.0, 'smooth_cammera_shutter', .35)] + [(x - 0.1, n, v) for x, n, v in cuts]
sfx += [(33.75 - 2.4, 'premium_riser', .42), (29.0, 'pop', .2), (6.6, 'pop', .18), (58.6, 'pop', .22), (61.4, 'pop', .2)]
sfx = [x for x in sfx if not (CA <= x[0] < CB)]
inp = ['-i', 'public/an4/voice_cut.wav', '-i', 'public/an4/music.wav']
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/an4/voice.wav', '-filter_complex', f'[0:a]atrim=0:{CA + 0.02},asetpts=PTS-STARTPTS[x];[0:a]atrim={CB - 0.02},asetpts=PTS-STARTPTS[y];[x][y]acrossfade=d=0.04:c1=tri:c2=tri[o]', '-map', '[o]', 'public/an4/voice_cut.wav'], check=True)
fc = ['[0:a]aformat=channel_layouts=stereo[v]', f'[1:a]aformat=channel_layouts=stereo,afade=t=out:st={dur - 1.6}:d=1.6[m]']; lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an4/sfx/{n}.wav']; d = int(max(0, sh(t)) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
