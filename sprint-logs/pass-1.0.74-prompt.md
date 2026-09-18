KRC v1.0.74 — Path and terrain tile sprites.

You are the coding worker. Repo is at v1.0.73. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Replace the tan ribbon with dirt ruts / stone flags / ember crust tiles.

IMPLEMENT
1. Bake tile_dirt, tile_stone, tile_ember (and edges if needed) in public/src/krc-art.js.
2. Use them in drawMap / path rendering. Keep Forest Gate node (100,375).
3. Bump to 1.0.74, cache-bust.
4. Bake must not throw.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
