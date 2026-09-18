KRC 1.2.9 rally impact. SAME assignment both models.

Live:
    const drawFxRally0 = (ctx) => {
      const cx = 64;
      const cy = 64;
make("fx_rally", 128, 128, drawFxRally0);
make("fx_rally_0", 128, 128, drawFxRally0);

Rewrite that function: gold sunburst, dark brown/black outlines, white core. Must read at 80px as a crest, not a yellow disk.

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

game.js LIVE:
          const rallyBurst0 = this.add.image(cx, cy, this.textures.exists("fx_rally_0") ? "fx_rally_0" : "fx_rally")
            .setScale(0.4)
Change start scale to 0.75 and duration to 520. Keep the key. Do not invent setDuration.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version, meteor, frost, scout, ranger.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
