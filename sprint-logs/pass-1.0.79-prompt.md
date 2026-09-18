KRC v1.0.79 — Authored VFX overlay sprites.

You are the coding worker. Repo is at v1.0.78. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Dust, sparks, leaves must be sprites, not only circles.

IMPLEMENT
1. Bake fx_dust, fx_spark, fx_leaf in public/src/krc-art.js.
2. Use them in existing particle/impact sites (build dust, hits, forest leaves). reducedMotion: skip extra overlays.
3. Bump to 1.0.79, cache-bust.
4. Bake must not throw. Keys must exist at runtime.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
