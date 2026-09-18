KRC 1.2.4 combat. SAME assignment both models.

Add make("enemy_scout_hit", 80, 72, (ctx) => { flinch pose }) after live:
    make("enemy_scout_dead", 80, 72, (ctx) => drawScoutDead(ctx));

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
rounded(ctx, x, y, w, h, r, fill, stroke, line)
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

game.js LIVE around:
          enemy.hitFlash = 0.09;
          enemy.sprite.setTint(0xfff3d6);
If scout and texture exists, also setTexture("enemy_scout_hit").
When hitFlash expires (enemy.hitFlash <= 0), if scout restore enemy_scout_w0.

Optional: thicken bow in const drawArcherFire = (ctx) => {

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version.
No placeholders. No ctx in Scene.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
