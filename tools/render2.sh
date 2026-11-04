#!/bin/bash
# usage: render2.sh FIRST LAST OUT   (frames inclusive, reel 2)
cd /home/user/Anfaal-Motion-Graphics
A=$1; Z=$2; OUT=$3
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell)
D=out/r2chunks_${A}_${Z}; mkdir -p $D; : > $D/list.txt
for ((a=A; a<=Z; a+=150)); do
  b=$((a+149)); [ $b -gt $Z ] && b=$Z
  o=$D/c_$(printf %04d $a).mp4; echo "file '$(basename $o)'" >> $D/list.txt
  [ -s $o ] && continue
  for try in 1 2 3; do
    timeout 900 npx remotion render src/index.ts AnfaalReel2 $o --frames=$a-$b --muted --concurrency=2 --timeout=120000 --crf=16 --browser-executable=$B --log=error > $D/log_$a.txt 2>&1 && break
    echo "retry $a ($try)"; rm -f $o
  done
  [ -s $o ] || { echo "FAIL chunk $a"; exit 1; }
  echo "chunk $a ok"
done
python3 /tmp/claude-0/-home-user-Anfaal-Motion-Graphics/3e8b9b60-25d6-51aa-8cc4-fe6a0d2db8e8/scratchpad/mix2.py $A $Z $D/audio.wav || exit 1
ffmpeg -v error -y -f concat -safe 0 -i $D/list.txt -i $D/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest $D/raw.mp4 || exit 1
/tmp/claude-0/-home-user-Anfaal-Motion-Graphics/3e8b9b60-25d6-51aa-8cc4-fe6a0d2db8e8/scratchpad/master.sh $D/raw.mp4 $OUT
echo RENDER_DONE
