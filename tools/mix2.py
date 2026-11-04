import subprocess,sys
A,Z,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
t0=A/30; dur=(Z-A+1)/30
FS=[(1.95,7.9),(19.25,28.95),(37.0,45.1),(56.1,61.75)]
sfx=[(x-0.35,'whoosh',.14) for w in FS for x in w]
sfx+=[(3.25,'thud',.22),(8.1,'pop',.24),(20.4,'pop',.2),(23.9,'pop',.22),(31.6,'pop',.22),(40.2,'whoosh',.12),(42.7,'pop',.22),(57.6,'thud',.2),(64.3,'pop',.26)]
inp=['-ss',str(t0),'-t',str(dur),'-i','public/an2/cut.mp4','-ss',str(t0),'-t',str(dur),'-i','public/an2/music.wav']
fc=['[0:a]aresample=48000,aformat=channel_layouts=stereo[v]','[1:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.13[m]']
lab=['[v]','[m]'];k=2
for (t,n,vol) in sfx:
    if t<t0-1 or t>t0+dur: continue
    rel=t-t0
    inp+=['-i',f'public/an2/sfx/{n}.wav']
    if rel>=0: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:1.5,volume={vol},adelay={int(rel*1000)}|{int(rel*1000)}[s{k}]')
    else: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={-rel}:1.5,asetpts=PTS-STARTPTS,volume={vol}[s{k}]')
    lab.append(f'[s{k}]');k+=1
fc.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg','-v','error','-y',*inp,'-filter_complex',';'.join(fc),'-map','[out]',out],check=True)
