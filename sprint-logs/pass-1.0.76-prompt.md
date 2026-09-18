KRC v1.0.76 — Shop portraits matching in-world sprites.

You are the coding worker. Repo is at v1.0.75. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
HUD shop icons must be cropped portraits of the new 128px towers, not flat color tiles.

IMPLEMENT
1. Bake portrait_archer, portrait_mage, portrait_artillery, portrait_barracks from the current tower art language.
2. Point shop buttons at those portraits.
3. Bump to 1.0.76, cache-bust.
4. Bake must not throw.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
