KRC v1.0.70 — Death poses per enemy family.

You are the coding worker. Repo is at v1.0.69. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Deaths must be posed corpses that fade, not a shared puff only.

IMPLEMENT
1. In public/src/krc-art.js bake enemy_*_dead for scout, brute, shield, ember, brood, flyer, hexer, titan (boss optional).
   Distinct silhouette: fallen, collapsed, cracked, etc.
2. In public/src/game.js on death, swap to dead texture then fade. Keep existing particles if present but do not rely on puff alone.
   reducedMotion: fade only, no extra tween thrash.
3. Bump version to 1.0.70, cache-bust.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
- Bake must not throw. All dead keys must exist at runtime.
