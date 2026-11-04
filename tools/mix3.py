import subprocess,sys
A,Z,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
t0=A/30; dur=(Z-A+1)/30
# shutter sound lands on the frame the blades meet (the hit is ~0.1 s into each file)
SH={'s':('smooth_cammera_shutter',.42),'c':('camera_shutter',.55),'h':('little_bit_hard_cammera_shutter',.55)}
cuts=[(2.7,'c'),(6.1,'s'),(8.92,'h'),(12.4,'c'),(15.0,'s'),(17.45,'s'),(25.9,'h'),(29.3,'c'),(34.05,'c'),(53.0,'s')]
sfx=[(0.0,'smooth_cammera_shutter',.38)]+[(x-0.1,SH[k][0],SH[k][1]) for x,k in cuts]
sfx+=[(8.92-3.0,'riser_2',.22),(34.05-2.4,'premium_riser',.5)]
sfx+=[(36.7,'pop',.18),(42.9,'pop',.18),(50.3,'pop',.2),(62.6,'pop',.22),(67.5,'pop',.2)]
inp=['-ss',str(t0),'-t',str(dur),'-i','public/an3/voice.wav','-ss',str(t0),'-t',str(dur),'-i','public/an3/music.wav']
fc=['[0:a]aresample=48000,aformat=channel_layouts=stereo[v]','[1:a]aresample=48000,aformat=channel_layouts=stereo[m]']
lab=['[v]','[m]'];k=2
for (t,n,vol) in sfx:
    if t<t0-7 or t>t0+dur: continue
    rel=t-t0; inp+=['-i',f'public/an3/sfx/{n}.wav']
    if rel>=0: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol},adelay={int(rel*1000)}|{int(rel*1000)}[s{k}]')
    else: fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={-rel},asetpts=PTS-STARTPTS,volume={vol}[s{k}]')
    lab.append(f'[s{k}]');k+=1
fc.append(''.join(lab)+f'amix=inputs={len(lab)}:normalize=0:duration=first,apad,atrim=0:{dur}[out]')
subprocess.run(['ffmpeg','-v','error','-y',*inp,'-filter_complex',';'.join(fc),'-map','[out]',out],check=True)
