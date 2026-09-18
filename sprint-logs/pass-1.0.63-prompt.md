KRC v1.0.63 — Tower fire / recoil pose frames.

You are the coding worker. Repo is at v1.0.62. Implement this visual slice only. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Rangers, Runes, Mortar, Guard must flash a distinct fire pose on shot, then return to idle. Current towers are a single static sprite with maybe a scale punch.

IMPLEMENT
1. In public/src/krc-art.js bake:
   tower_archer_idle, tower_archer_fire
   tower_mage_idle, tower_mage_fire
   tower_artillery_idle, tower_artillery_fire
   tower_barracks_idle, tower_barracks_fire
   Keep existing tower_archer / tower_mage / tower_artillery / tower_barracks as idle aliases.
   Fire poses must change silhouette: bow drawn/loosed, crystal flare, mortar barrel kick, barracks horn/banner.
2. In public/src/game.js, when a tower fires, swap to the fire texture for ~120ms then idle. Skip under reducedMotion.
3. Bump version to 1.0.63 in index.html title+subtitle, game.js KRC_VERSION, cache-bust krc-art.js and game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
