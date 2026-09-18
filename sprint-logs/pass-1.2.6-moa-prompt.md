KRC 1.2.6 ranger fire only. SAME assignment both models.

Live:
    const drawArcherFire = (ctx) => {
        drawArcherTowerBody128(ctx);

Replace the rest of that function so the drawn bow reads at 36px: thick stave, V-string, leaning archer. Use:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
rounded / ellipse / shadow / speckles

game.js flashTowerFirePose: remove or zero the bloom circle. Keep setTexture(fireKey).

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version, scout.

Output ```diff:public/src/krc-art.js and optional ```diff:public/src/game.js
