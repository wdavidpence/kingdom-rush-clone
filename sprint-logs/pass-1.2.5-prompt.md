KRC 1.2.5 SAME assignment. Hermes judge.

1.2.4 FAIL: antigrav hooks work but hit is 90ms (invisible) and ranger fire is a green bloom. MoA used assets.enemy_scout_hit (does not exist) and a brown blob, not a scout.

FIX:
1. game.js: enemy.hitFlash = 0.28 (not 0.09). Use this.textures.exists("enemy_scout_hit") never assets.
2. krc-art.js: make("enemy_scout_hit", 80, 72, ...) after enemy_scout_dead. Must look like the existing green scout (drawScout), recoiling, spear up. High contrast outline. Helpers:
   poly(ctx, [[x,y],...], fill, stroke, line)
   linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
   rounded / ellipse / shadow / speckles as in krc-art.js
3. flashTowerFirePose: do not add a bloom circle, or keep it under alpha 0.2. The fire KEY must carry the pose.
4. Thicken drawArcherFire bow vs idle.

HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign.
reducedMotion: no hit texture, stay w0.
