#!/usr/bin/env bash
# KRC static preflight. Run from the repository root.
set -euo pipefail

for file in public/src/*.js; do
  node --check "$file"
done

for file in \
  public/index.html \
  public/styles.css \
  public/src/game.js \
  public/assets/kenney/audio/kenney-shoot.ogg \
  public/assets/kenney/audio/kenney-music.ogg; do
  test -f "$file"
done

git diff --check
printf 'KRC static smoke preflight passed.\n'
printf 'For browser QA, serve with: python3 -m http.server 4173 --directory public --bind 127.0.0.1\n'
