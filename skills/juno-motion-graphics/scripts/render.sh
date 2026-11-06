#!/usr/bin/env bash
# Usage: bash render.sh <remotion-project-root> <CompositionId> <out.mp4>
# High-quality encode: crf 10 + preset slow removes the encoder flicker on the flat Juno Black background.
set -euo pipefail
cd "$1"
B=$(ls -d /opt/pw-browsers/chromium_headless_shell*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
npx remotion render src/index.ts "$2" "$3" ${B:+--browser-executable="$B"} --codec=h264 --crf=10 --x264-preset=slow \
  --concurrency=3 --timeout=120000 --log=error
ffprobe -v error -show_entries format=duration:stream=r_frame_rate -of compact "$3"
