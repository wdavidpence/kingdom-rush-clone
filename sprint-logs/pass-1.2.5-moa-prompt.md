KRC 1.2.5 combat. SAME assignment both models.

1.2.4 FAIL: assets.enemy_scout_hit is not a thing. Use this.textures.exists("enemy_scout_hit").
hitFlash must be 0.28 not 0.09.
Hit pose must look like the green scout (same palette as drawScout), recoiling.

After live:
    make("enemy_scout_dead", 80, 72, (ctx) => drawScoutDead(ctx));
add:
    make("enemy_scout_hit", 80, 72, (ctx) => { ... green flinch ... });

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
rounded(ctx, x, y, w, h, r, fill, stroke, line)
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

game.js LIVE:
          enemy.hitFlash = 0.09;
          enemy.sprite.setTint(0xfff3d6);
Change 0.09 to 0.28 and setTexture("enemy_scout_hit") if scout and textures.exists.
On expire restore enemy_scout_w0.

Do not invent assets. or drawScoutFlinch unless you also write that function with helpers.

HARD: { x: 100, y: 375 }, bannerY=98, no campaign, no version.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
