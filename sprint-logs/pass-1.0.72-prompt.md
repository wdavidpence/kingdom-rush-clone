KRC v1.0.72 — Spell impact sprite set.

You are the coding worker. Repo is at v1.0.71. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
MET / ICE / RLY impacts must be authored bursts, not only colored circles.

IMPLEMENT
1. Bake fx_meteor, fx_ice, fx_rally (and 2-frame variants if cheap) in public/src/krc-art.js.
2. Use them in spell cast/impact in public/src/game.js. reducedMotion: static stamp + fade.
3. Bump to 1.0.72, cache-bust.
4. Bake must not throw. New keys must exist at runtime.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs if present
