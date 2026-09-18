KRC v1.2.8 SAME assignment. Hermes judge. FROST IMPACT only.

LIVE:
    const drawFxIce0 = (ctx) => {
      const cx = 64;
      const cy = 64;
make("fx_ice", 128, 128, drawFxIce0);
castSpell frost stamps fx_ice_0 at screen center, scale 0.4→1.3 in 420ms. Will read as a pale disk.

DO:
1. Rewrite drawFxIce0: WHITE crystal shards with NAVY/BLACK outlines + ice-blue core. Must read at 80px as a snowflake/star, not mist.
   Helpers:
   poly(ctx, [[x,y],...], fill, stroke, line)
   linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
   radGrad(ctx, x, y, r0, r1, [[t,c],...])
   ellipse / rounded / shadow / speckles
2. game.js iceBurst0: start scale 0.75, duration 520. Keep fx_ice_0. reducedMotion stamp stays.

HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign, no meteor/ranger/scout edits.

NO placeholders. NO fake APIs.
