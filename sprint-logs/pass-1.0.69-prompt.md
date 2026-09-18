KRC v1.0.69 — Tower L2/L3 distinct morph art.

You are the coding worker. Repo is at v1.0.68. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Upgrading a tower must change silhouette, not only a numeral. Each family needs a clearly bigger/more ornate L3 vs L1.

IMPLEMENT
1. In public/src/krc-art.js bake per family:
   tower_archer_l2, tower_archer_l3 (and mage/artillery/barracks l2/l3)
   L1 stays existing idle. L2 adds a story (extra roof, extra crystal, extra barrel band, extra merlon). L3 is the hero silhouette of that family.
2. In public/src/game.js, after upgrade, setTexture to the level key. Fire pose can still overlay if present; if not, stay on level idle.
3. Bump version to 1.0.69, cache-bust.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
