KRC v1.0.65 — Guard walk / attack / block frames.

You are the coding worker. Repo is at v1.0.64. Implement this visual slice only. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Barracks soldiers must read as a squad, not sliding tokens.

IMPLEMENT
1. In public/src/krc-art.js bake:
   soldier_guard_walk0..walk3, soldier_guard_attack, soldier_guard_block
   Keep soldier_guard as walk0/idle alias.
   Walk is a real stride. Attack is a spear thrust. Block is shield-forward.
2. In public/src/game.js:
   - cycle walk frames when moving
   - attack pose when striking
   - block pose when holding a blocker
   - flipX from move/facing
   - reducedMotion locks idle
3. Bump version to 1.0.65 in index.html, game.js KRC_VERSION, cache-bust krc-art.js and game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
