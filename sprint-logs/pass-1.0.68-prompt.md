KRC v1.0.68 — Rim light, AO, and skin volume on characters.

You are the coding worker. Repo is at v1.0.67. Implement this visual slice only. Do not change gold, lives, bounty, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Faces and limbs must have volume, not flat fills. Upgrade scout, brute, soldier, and hero draw functions with rim light, ambient occlusion under chin/arms, and warmer skin gradients. Keep existing frame keys. Do not invent new gameplay.

IMPLEMENT
1. In public/src/krc-art.js, upgrade drawScout, drawBrute, soldier frames, and hero poses with:
   - cool rim on the upper-left edge
   - contact AO under feet and chin
   - 2-3 stop skin/hide gradients
2. Bump version to 1.0.68 and cache-bust krc-art.js + game.js.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
