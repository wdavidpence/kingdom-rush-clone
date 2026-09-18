KRC v1.0.77 — Hair / cloth / weapon microdetail.

You are the coding worker. Repo is at v1.0.76. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Close look at hero, guards, scout, brute must hold extra strands, folds, and weapon edges.

IMPLEMENT
1. Add hair/cloth folds/weapon edge highlights on hero poses, soldier frames, scout, brute in public/src/krc-art.js. Keep existing keys.
2. Bump to 1.0.77, cache-bust.
3. Bake must not throw.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
