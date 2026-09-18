KRC 1.2.2 Forest Gate. SAME assignment both models.

Helpers (exact):
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
poly(ctx, [[x,y],[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[0,"#222"],[1,"#111"]])
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

Replace:
    make("gate_arch", 96, 64, (ctx) => {
with make("gate_arch", 128, 96, (ctx) => { dark arch, timber doors, lanterns, ivy }).

game.js:
        this.gateImage = this.add.image(378, 588, "gate_arch").setDepth(-5).setScale(1.58);
Change scale to 1.0. Ruts via this.add.graphics() along this.path, mapIndex===0. Never use ctx in Scene.

Forbidden: addColorStop on linGrad result if you omitted stops; flat poly arrays; ...data...; renderSetPiece.

HARD: do not touch { x: 100, y: 375 }, bannerY = 98, campaign, version.

Output ```diff:public/src/krc-art.js and optional ```diff:public/src/game.js
