KRC v1.0.78 — Sprite lighting / map tint cohesion.

You are the coding worker. Repo is at v1.0.77. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Units must sit in the map light, not look pasted on. Apply a subtle per-map tint/light on enemies, towers, hero, soldiers. Do not nuke readability.

IMPLEMENT
1. In game.js, after spawn/update, apply a small map-keyed tint (forest green-gold, stone cool, ember warm). Clear/restore correctly on death/hex/slow.
2. Keep reducedMotion: still apply static tint, no extra flicker.
3. Bump to 1.0.78, cache-bust.
4. Do not break existing tints for hex/slow/low-hp.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
