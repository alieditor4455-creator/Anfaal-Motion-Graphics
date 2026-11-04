import subprocess,sys
A,Z,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
t0=A/30; dur=(Z-A+1)/30
B=[2.7,6.1,12.4,17.45,25.9,29.3,34.05,53.0]
sfx=[(x-0.35,'whoosh',.13) for x in B]
sfx+=[(8.92,'thud',.26),(25.95,'thud',.26),(36.7,'pop',.2),(42.9,'pop',.2),(50.3,'pop',.22),(62.6,'pop',.24),(67.5,'pop',.22)]
inp=['-ss',str(t0),'-t',str(dur),'-i','public/an3/voice.wav','-ss',str(t0),'-t',str(dur),'-i','public/an3/music.wav']
fc=['[0:a]aresample=48000,aformat=channel_layouts=stereo[v]','[1:a]aresample=48000,aformat=channel_layouts=stereo[m]']
lab=['[v]','[m]'];k=2
for (t,n,vol) in sfx:
    if t<t0-1 or t>t0+dur: continue
    rel=t-t0; inp+=['-i',f'public/an3/sfx/{n}.wav']
    if rel>=0: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:1.5,volume={vol},adelay={int(rel*1000)}|{int(rel*1000)}[s{k}]')
    else: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={-rel}:1.5,asetpts=PTS-STARTPTS,volume={vol}[s{k}]')
    lab.append(f'[s{k}]');k+=1
fc.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg','-v','error','-y',*inp,'-filter_complex',';'.join(fc),'-map','[out]',out],check=True)
