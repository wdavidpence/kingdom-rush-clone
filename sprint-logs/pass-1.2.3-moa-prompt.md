KRC 1.2.3 Forest Gate. SAME assignment both models.

1.2.2 bake applied and looked like a gray blob. FAIL. Need high contrast:
stone #6a5a48, hole #0a0806, gold lanterns, timber doors in the hole.

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
rounded(ctx, x, y, w, h, r, fill, stroke, line)
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

Replace make("gate_arch", 96, 64, (ctx) => { with make("gate_arch", 128, 96, (ctx) => { ... });

game.js LIVE:
        this.gateImage = this.add.image(378, 588, "gate_arch").setDepth(-5).setScale(1.58);
Change to (378, 520) scale 1.15 so it sits on the lane not the shop.
Ruts: this.add.graphics(); lineBetween ±5 along this.path; mapIndex===0.

Forbidden: gray-on-gray, canvas ctx in Scene, placeholders, renderSetPiece.
HARD: { x: 100, y: 375 }, bannerY=98, no campaign, no version.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
