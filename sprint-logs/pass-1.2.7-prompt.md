KRC v1.2.7 SAME assignment. Hermes judge. METEOR IMPACT only. Combat ranger passes stay unshipped.

LIVE:
    const drawFxMeteor0 = (ctx) => {
      const cx = 64;
      const cy = 64;
Used as fx_meteor / fx_meteor_0. castSpell("meteor") stamps it at target, scale 0.35→1.15 in 380ms. Reads as an orange smudge.

DO:
1. Rewrite drawFxMeteor0 so at ~80px it is a WHITE-HOT CORE + BLACK-OUTLINED fire spikes + dark crater ring. Not a soft orange disk.
   Helpers:
   poly(ctx, [[x,y],...], fill, stroke, line)
   linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
   radGrad(ctx, x, y, r0, r1, [[t,c],...])
   ellipse / rounded / shadow / speckles
2. game.js meteor burst0: start scale 0.75, duration 520ms, keep fx_meteor_0 key. reducedMotion stamp stays.

Do not touch campaign, gate, { x: 100, y: 375 }, bannerY=98, bounty, version, ranger/scout.

NO placeholders. NO fake APIs.
