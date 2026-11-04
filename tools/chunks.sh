#!/bin/bash
cd /home/user/Anfaal-Motion-Graphics
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell)
mkdir -p out/chunks; : > out/chunks/list.txt
N=2250; STEP=150
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  o=out/chunks/c_$(printf %04d $a).mp4
  echo "file '$(basename $o)'" >> out/chunks/list.txt
  [ -s $o ] && continue
  for try in 1 2 3; do
    timeout 900 npx remotion render src/index.ts AnfaalReel $o --frames=$a-$b --muted --concurrency=2 --timeout=120000 --crf=16 --browser-executable=$B --log=error > out/chunks/log_$a.txt 2>&1 && break
    echo "retry $a ($try)"; rm -f $o
  done
  [ -s $o ] || { echo "FAIL chunk $a"; exit 1; }
  echo "chunk $a ok"
done
timeout 900 npx remotion render src/index.ts AnfaalReel out/chunks/audio.wav --codec=wav --browser-executable=$B --log=error > out/chunks/log_audio.txt 2>&1 || { echo "FAIL audio"; exit 1; }
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i out/chunks/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/raw.mp4 || exit 1
/tmp/claude-0/-home-user-Anfaal-Motion-Graphics/3e8b9b60-25d6-51aa-8cc4-fe6a0d2db8e8/scratchpad/master.sh out/raw.mp4 out/Anfaal_Reel_final.mp4
echo RENDER_DONE
