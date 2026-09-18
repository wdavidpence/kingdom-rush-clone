KRC v1.0.64 — Hero idle / attack / ability poses.

You are the coding worker. Repo is at v1.0.63. Implement this visual slice only. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Captain must look like a character, not a statue. Need idle, attack, and ability poses.

IMPLEMENT
1. In public/src/krc-art.js bake:
   hero_captain_idle, hero_captain_attack, hero_captain_ability
   Keep hero_captain as idle alias.
   Attack: sword/shield committed pose. Ability: charge/banner/heal readable silhouette change.
2. In public/src/game.js:
   - idle when standing
   - attack texture while swinging / on hit
   - ability texture during CHG/BAN/HEAL
   - reducedMotion stays on idle
3. Bump version to 1.0.64 in index.html, game.js KRC_VERSION, cache-bust krc-art.js and game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
