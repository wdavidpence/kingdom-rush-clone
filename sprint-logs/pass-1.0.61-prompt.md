KRC v1.0.61 — Scout + Brute 4-frame walk sheets.

You are the coding worker. Implement this visual slice only. Do not change gold, lives, bounty, path coordinates, Forest Gate (100,375), or bannerY=98.

LEGAL: original KRC art only. No Kingdom Rush names, sprites, maps, or copies.

GOAL
Players must see Scout and Brute actually walk. Current sprites are single-pose stickers. Motion is only bob/squash in updateEnemyVisual. That is not good enough.

IMPLEMENT
1. In public/src/krc-art.js, add canvas-baked frames:
   - enemy_scout_w0 enemy_scout_w1 enemy_scout_w2 enemy_scout_w3
   - enemy_brute_w0 enemy_brute_w1 enemy_brute_w2 enemy_brute_w3
   Keep existing enemy_scout and enemy_brute as idle/frame 0 equivalents.
   Frames must show a real stride: planted foot, passing, opposite plant, recover.
   Legs, arms, spear/club, and body must change pose per frame.
   Keep the current painterly palette and bold outline. Upgrade detail (rim light, volume) if cheap.
2. In public/src/game.js updateEnemyVisual (and spawn if needed):
   - Cycle walk frames from distance traveled or time * speed.
   - Flip sprite.flipX from path direction (left vs right).
   - If settings.reducedMotion, lock frame 0 and do not bob.
   - Other enemy types unchanged.
3. Bump visible version to 1.0.61 in public/index.html title+subtitle, public/src/game.js KRC_VERSION, and cache-bust krc-art.js + game.js query strings.

CONSTRAINTS
- Phaser 3.80.1, texture.createCanvas + getContext + refresh, same as existing bake().
- Do not break window.KRCArt = { bake }.
- Do not add third-party images.
- Keep files syntactically valid.

VERIFY before you stop
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh

Return a short summary of files changed and frame keys added.
