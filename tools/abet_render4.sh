#!/bin/bash
# chunked, resumable render of AbetVideo -> out/abet/video_v4_silent.mp4
set -e
cd "$(dirname "$0")/.."
mkdir -p out/abet/chunks4
CH=(0-359 360-719 720-1079 1080-1439)
for i in 0 1 2 3; do
  f=out/abet/chunks4/c$i.mp4
  [ -s $f ] && continue
  for try in 1 2 3; do
    RANGE=${CH[$i]} TMO=300000 node tools/render_one.mjs AbetVideoV4 $f 4 && break
    rm -f $f
  done
done
printf "file 'c0.mp4'\nfile 'c1.mp4'\nfile 'c2.mp4'\nfile 'c3.mp4'\n" > out/abet/chunks4/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/abet/chunks4/list.txt -c copy out/abet/video_v4_silent.mp4
echo ALL_DONE
