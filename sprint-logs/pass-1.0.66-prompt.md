KRC v1.0.66 — 128px Rangers tower material rebuild.

You are the coding worker. Repo is at v1.0.65. Implement this visual slice only. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
The Rangers tower must stop looking like a green hut. Rebuild idle and fire at 128x128 with wood grain, thatch layers, a visible archer, ivy, and volume. Other families unchanged this pass except they must still load.

IMPLEMENT
1. Rebuild tower_archer, tower_archer_idle, tower_archer_fire at 128x128 in public/src/krc-art.js.
   Higher detail than current 96px: planks, roof tiles, window, archer silhouette, banner, contact shadow.
2. If game.js scales towers assuming 96px, adjust only archer scale so on-map size stays similar (do not balloon the sprite).
3. Bump version to 1.0.66 in index.html, game.js KRC_VERSION, cache-bust krc-art.js and game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
