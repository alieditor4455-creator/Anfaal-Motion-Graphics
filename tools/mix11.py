# reel 11 audio: cleaned voice + "Me and the Devil" (low, ducked under the voice) + bounce SFX from the client's pack
import subprocess, sys
out = sys.argv[1]; dur = 56.12
st = [2.5, 8.22, 11.16, 19.1, 24.84, 27.84, 33.44, 36.08, 44.3, 46.63]
sfx = [(0.0, 'smooth_cammera_shutter', .3)] + [(t, 'thud', .2) for t in st] + [(30.2, 'whoosh', .3), (51.43, 'riser_2', .18), (51.5, 'thud', .22)]
inp = ['-i', 'public/an11/voice.wav', '-i', 'public/an11/music.wav']
fc = ['[0:a]aformat=channel_layouts=stereo,asplit=2[v][vk]',
      f'[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},asetpts=PTS-STARTPTS,volume=0.32,afade=t=in:d=1.2,afade=t=out:st={dur-1.5}:d=1.5[m0]',
      '[m0][vk]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=350[m]']
lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an11/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
