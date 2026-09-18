KRC v1.0.73 — Projectile + trail sprite upgrade.

You are the coding worker. Repo is at v1.0.72. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Arrow / rune / bomb must read as authored missiles, not sticks and dots.

IMPLEMENT
1. Rebuild projectile_arrow, projectile_magic, projectile_bomb at higher detail in public/src/krc-art.js. Add trail stamps if useful (fx_trail_arrow etc).
2. Wire in updateProjectiles. reducedMotion: no trail spam.
3. Bump to 1.0.73, cache-bust.
4. Bake must not throw. Keys must exist at runtime.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
