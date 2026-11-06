#!/usr/bin/env bash
# Usage: bash setup.sh <remotion-project-root> <raw-talking-head.mp4>
# Copies the Juno assets into public/juno/, extracts the take as a 24fps JPEG sequence + audio,
# and drops the template into src/Juno/. Prints the frame count to put in SRC_N.
set -euo pipefail
ROOT=$(cd "$1" && pwd); RAW=$2; SK=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT/public/juno/fonts" "$ROOT/public/juno/raw" "$ROOT/src/Juno"
cp "$SK"/assets/*.png "$ROOT/public/juno/"; cp "$SK"/assets/fonts/*.woff2 "$ROOT/public/juno/fonts/"
rm -f "$ROOT"/public/juno/raw/f*.jpg
FPS=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate -of csv=p=0 "$RAW")
ffmpeg -v error -y -i "$RAW" -q:v 3 "$ROOT/public/juno/raw/f%04d.jpg"
ffmpeg -v error -y -i "$RAW" -vn -c:a aac -b:a 192k "$ROOT/public/juno/raw/audio.m4a"
[ -f "$ROOT/src/Juno/Motion.tsx" ] || cp "$SK/template/JunoMotion.tsx" "$ROOT/src/Juno/Motion.tsx"
grep -qx "public/juno/raw/" "$ROOT/.gitignore" 2>/dev/null || echo "public/juno/raw/" >> "$ROOT/.gitignore"
echo "source fps: $FPS   frames (SRC_N): $(ls "$ROOT"/public/juno/raw/f*.jpg | wc -l)"
