KRC v1.0.71 — Warden / Titan phase art.

You are the coding worker. Repo is at v1.0.70. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Boss shield and rage must be painted poses, not only a tint. Titan needs a readable stomp/enrage silhouette.

IMPLEMENT
1. Bake enemy_boss_idle, enemy_boss_shield, enemy_boss_rage (keep enemy_boss as idle alias).
   Bake enemy_titan_enrage if titan has a rage/phase, else improve titan frames only as needed.
2. In game.js, swap boss texture on phase change. reducedMotion uses idle + existing bars, no extra thrash.
3. Bump to 1.0.71, cache-bust.
4. Bake must not throw. All new keys must exist at runtime.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
