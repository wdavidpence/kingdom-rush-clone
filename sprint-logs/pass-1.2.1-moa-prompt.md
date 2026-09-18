KRC 1.2.1 Forest Gate. SAME assignment both models.

Live code to patch (exact):

krc-art.js:
    make("gate_arch", 96, 64, (ctx) => {

Replace entire callback with:
    make("gate_arch", 128, 96, (ctx) => {
Use helpers already in krc-art.js: shadow, rounded, linGrad, poly, ellipse, speckles.
Draw dark arch, timber doors, lanterns, ivy. No 1px mortar sludge.

game.js LIVE:
        this.gateImage = this.add.image(378, 588, "gate_arch").setDepth(-5).setScale(1.58);

If 128x96 use setScale(1.0). Never invent renderSetPiece or function strokePath(ctx, mapIndex).

Ruts: mapIndex===0 only. ADD two offset graphics strokes along this.path. Keep tile_dirt loop.

Forbidden: ...data... placeholders, make("gate_arch", function(ctx, w=128.

HARD: do not touch { x: 100, y: 375 }, bannerY = 98, campaign nodes, version.

Output only ```diff:public/src/krc-art.js and optional ```diff:public/src/game.js
