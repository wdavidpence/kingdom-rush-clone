KRC v1.2.9 SAME assignment. Hermes judge. RALLY IMPACT only.

LIVE:
    const drawFxRally0 = (ctx) => {
      const cx = 64;
      const cy = 64;
make("fx_rally", 128, 128, drawFxRally0);
castSpell rally stamps fx_rally_0 at center, scale 0.4→1.3 in 440ms. Will read as a gold smudge.

DO:
1. Rewrite drawFxRally0: GOLD sunburst + DARK BROWN/BLACK outlines + white core. Must read at 80px as a crest/star, not a yellow disk.
   Helpers:
   poly(ctx, [[x,y],...], fill, stroke, line)
   linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
   radGrad(ctx, x, y, r0, r1, [[t,c],...])
   ellipse / rounded / shadow / speckles
2. game.js rallyBurst0: start scale 0.75, duration 520. Keep fx_rally_0. reducedMotion stamp stays.

HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign, no meteor/frost/ranger/scout edits.

NO placeholders. NO fake APIs.
