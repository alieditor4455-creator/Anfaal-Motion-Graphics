# reel 12 audio: cleaned voice + "Me and the Devil" (low, ducked under the voice) + bounce SFX from the client's pack
import subprocess, sys
out = sys.argv[1]; dur = 108.3
st = [0.3, 5.98, 12.06, 15.45, 22.02, 27.6, 39.43, 51.09, 63.1, 74.4, 85.87, 92.39, 97.98, 103.44]
sfx = [(0.0, 'smooth_cammera_shutter', .3)] + [(t, 'thud', .2) for t in st] + [(26.9, 'whoosh', .3), (80.15, 'whoosh', .28)]
inp = ['-i', 'public/an12/voice.wav', '-i', 'public/an12/music.wav']
fc = ['[0:a]aformat=channel_layouts=stereo,asplit=2[v][vk]',
      f'[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},asetpts=PTS-STARTPTS,volume=0.32,afade=t=in:d=1.2,afade=t=out:st={dur-1.5}:d=1.5[m0]',
      '[m0][vk]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=350[m]']
lab = ['[v]', '[m]']
for k, (t, n, vol) in enumerate(sfx, start=2):
    inp += ['-i', f'public/an12/sfx/{n}.wav']; d = int(max(0, t) * 1000)
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fc.append(''.join(lab) + f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(fc), '-map', '[out]', out], check=True)
