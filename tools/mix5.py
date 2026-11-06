# reel 4 audio: crisp voice + ducked God's Plan + client SFX pack on every shutter cut
import subprocess, sys
out = sys.argv[1]; CA, CB = 999, 999; dur = 62.25
sh = lambda t: t if t < CA else t - (CB - CA)
# overlay-only reel: soft pop when each card lands, gentle whoosh on keyword changes
sfx = [(0.0, 'smooth_cammera_shutter', .3), (3.45, 'pop', .2), (8.35, 'pop', .2), (11.1, 'pop', .16), (28.2, 'pop', .2), (42.0, 'pop', .2), (46.6, 'pop', .18), (57.6, 'pop', .22)]
sfx += [(t - 0.25, 'whoosh', .08) for t in (14.38, 16.35, 18.38, 20.97, 24.29, 33.18, 36.09, 47.14, 49.8, 52.34)]
inp = ['-i', 'public/an5/voice.wav', '-i', 'public/an5/music.wav']
(lambda *a, **k: None)(['ffmpeg', '-v', 'error', '-y', '-i', 'public/an5/voice.wav', '-filter_complex', f'[0:a]atrim=0:{CA + 0.02},asetpts=PTS-STARTPTS[x];[0:a]atrim={CB - 0.02},asetpts=PTS-STARTPTS[y];[x][y]acrossfade=d=0.04:c1=tri:c2=tri[o]', '-map', '[o]', 'public/an5/voice_cut.wav'], check=True)
fc = ['[0:a]aformat=channel_layouts=stereo[v]', f'[1:a]aformat=channel_layouts=stereo,afade=t=out:st={dur - 1.6}:d=1.6[m]']; lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an5/sfx/{n}.wav']; d = int(max(0, sh(t)) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur},afade=t=out:st={dur - 0.6}:d=0.6[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
