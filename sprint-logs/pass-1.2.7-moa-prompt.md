KRC 1.2.7 meteor impact. SAME assignment both models.

Live:
    const drawFxMeteor0 = (ctx) => {
      const cx = 64;
      const cy = 64;
make("fx_meteor", 128, 128, drawFxMeteor0);
make("fx_meteor_0", 128, 128, drawFxMeteor0);

Rewrite that function: white-hot core, black-outlined spikes, dark crater. Must read at 80px. Not a soft orange disk.

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

game.js LIVE burst0:
          const burst0 = this.add.image(target.x, target.y, this.textures.exists("fx_meteor_0") ? "fx_meteor_0" : "fx_meteor")
            .setScale(0.35)
Change start scale to 0.75 and duration toward 520. Keep the key.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version, scout, ranger.

Output ```diff:public/src/krc-art.js and ```diff:public/src/game.js
