KRC 1.3.0 arrow projectile. SAME assignment both models.

Live:
    make("projectile_arrow", 44, 20, (ctx) => {

Rewrite that callback: fat outlined shaft, bright fletching, iron head. Must read at 24px.

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
rounded(ctx, x, y, w, h, r, fill, stroke, line)
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

game.js LIVE:
      projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);
Change the 0.9 to 1.25 for non-artillery.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
