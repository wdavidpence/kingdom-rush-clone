KRC v1.0.80 — Cohesion pass.

You are the coding worker. Repo is at v1.0.79. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Shared outline weight, scale, and palette so the atlas does not look like a mixed sticker sheet. Fix any leftover tiny 32px fallbacks that can appear in play. Unify outline darkness and highlight language on hero, soldiers, enemies, towers.

IMPLEMENT
1. Small cohesive outline/highlight tweaks in public/src/krc-art.js. Do not rewrite the whole atlas.
2. Confirm bake still produces every required key. Update tests/art-bake.test.mjs if you add keys.
3. Bump to 1.0.80, cache-bust.
4. Bake must not throw.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
- Full tests/*.test.mjs
