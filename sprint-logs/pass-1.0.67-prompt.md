KRC v1.0.67 — 128px Runes / Mortar / Guard rebuild.

You are the coding worker. Repo is at v1.0.66. Rangers already 128px. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Rebuild tower_mage, tower_artillery, tower_barracks idle+fire at 128x128. Crystal volume, iron mortar, fort keep. Keep on-map size via the existing getTowerScale helpers.

IMPLEMENT
1. Rebuild idle/fire for mage, artillery, barracks at 128x128 in public/src/krc-art.js.
2. Extend getTowerScale so all three families match Rangers on-map footprint.
3. Bump version to 1.0.67, cache-bust krc-art.js and game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
