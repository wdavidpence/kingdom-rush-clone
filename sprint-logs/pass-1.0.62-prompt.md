KRC v1.0.62 — Remaining roster walk/fly frames.

You are the coding worker. Implement this visual slice only. Repo is already at v1.0.61 with scout/brute walk cycles. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Shield, Ember, Brood, Flyer, Hexer, Titan must cycle distinct walk or fly frames. They are still single-pose stickers.

IMPLEMENT
1. In public/src/krc-art.js add 4 frames each:
   enemy_shield_w0..w3, enemy_ember_w0..w3, enemy_brood_w0..w3,
   enemy_flyer_w0..w3, enemy_hexer_w0..w3, enemy_titan_w0..w3
   Keep existing idle keys as frame 0 equivalents.
   Ground units: real stride (plant / pass / opposite plant / recover).
   Flyer: wing beat + body bob poses, not just a tint.
   Hexer: staff/curse pose changes.
   Titan: heavy stomp poses.
2. In public/src/game.js updateEnemyVisual, cycle those frames like scout/brute:
   - distance or time based
   - flipX from path direction
   - reducedMotion locks w0, no bob
   - boss/drift unchanged this pass
3. Bump version to 1.0.62 in public/index.html title+subtitle, game.js KRC_VERSION, and cache-bust krc-art.js + game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
