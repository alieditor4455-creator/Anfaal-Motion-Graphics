#!/bin/bash
# chunked, resumable render of AbetVideo -> out/abet/video_silent.mp4
set -e
cd "$(dirname "$0")/.."
mkdir -p out/abet/chunks
CH=(0-539 540-1079 1080-1619 1620-2129)
for i in 0 1 2 3; do
  f=out/abet/chunks/c$i.mp4
  [ -s $f ] && continue
  for try in 1 2 3; do
    RANGE=${CH[$i]} TMO=300000 node tools/render_one.mjs AbetVideo $f 4 && break
    rm -f $f
  done
done
printf "file 'c0.mp4'\nfile 'c1.mp4'\nfile 'c2.mp4'\nfile 'c3.mp4'\n" > out/abet/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/abet/chunks/list.txt -c copy out/abet/video_silent.mp4
echo ALL_DONE
