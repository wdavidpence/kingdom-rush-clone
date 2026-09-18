KRC 1.3.1 MoA ONE task: projectile_magic only.

Live: make("projectile_magic" in krc-art.js (search it).
Rewrite that make() so a fat outlined rune bolt reads at 24px.

Helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
rounded / ellipse / shadow / speckles

Optional game.js: mage projectile scale 0.9 → 1.2.

HARD: do not touch { x: 100, y: 375 }, bannerY=98, campaign, version.

Output ```diff:public/src/krc-art.js and optional ```diff:public/src/game.js
No placeholders. No fake APIs.
