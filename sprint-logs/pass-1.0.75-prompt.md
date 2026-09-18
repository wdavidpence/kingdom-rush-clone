KRC v1.0.75 — Gate / exit painted set-piece.

You are the coding worker. Repo is at v1.0.74. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
The leak exit must be a real door with banners. Leak flash should hit that door.

IMPLEMENT
1. Rebuild gate_arch at higher detail. Add gate_leak flash overlay if useful.
2. Wire leak feedback to the gate art, not a random screen tint only.
3. Bump to 1.0.75, cache-bust.
4. Bake must not throw.

VERIFY
- node --check public/src/*.js
- bash scripts/smoke-static.sh
- node tests/art-bake.test.mjs
