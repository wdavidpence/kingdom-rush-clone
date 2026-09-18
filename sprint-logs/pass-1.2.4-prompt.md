KRC v1.2.4 SAME assignment. Hermes judge. Combat Wow on Forest Gate, not campaign.

LIVE hooks already flash tower_*_fire and enemy_*_dead. They mush at phone size.

DO THIS:
1. public/src/krc-art.js after make("enemy_scout_dead"...):
   add make("enemy_scout_hit", 80, 72, (ctx) => { ... });
   High-contrast flinch: scout recoils, spear up, bright outline. Helpers only:
   poly(ctx, [[x,y],...], fill, stroke, line)
   linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
   rounded(ctx, x,y,w,h,r, fill, stroke, line)
   ellipse(ctx, x,y,rx,ry, fill, stroke, line)
   shadow(ctx, x,y,rx,ry,a)
   speckles(ctx, x,y,w,h,n, color, size)

2. game.js damage ~4646: if enemy.type==="scout" && textures.exists("enemy_scout_hit") && !reducedMotion, setTexture that key (keep hitFlash tint). Walk loop already restores _wN when hitFlash ends if you set texture only during hit — also restore: when hitFlash expires (~3950) set back to enemy_scout_w0 if still scout.

3. Thicken drawArcherFire bow/arms (starts line 645) so the drawn-bow silhouette reads at ~36px vs idle.

reducedMotion: no hit texture, stay w0.
HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign nodes.
NO placeholders, NO fake APIs, NO canvas ctx in Scene.
