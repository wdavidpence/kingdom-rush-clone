KRC v1.3.0 SAME assignment. Hermes judge. ARROW PROJECTILE only.

LIVE make("projectile_arrow", 44, 20, (ctx) => { in krc-art.js ~6154
game.js: projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);

Arrows vanish as thin sticks. FAIL Wow.

DO:
1. Rewrite that make() body: fat shaft, dark outline, bright fletching, iron head. Must read at 24px in flight.
   Helpers: poly([[x,y]]), linGrad(..., [[t,c],...]), rounded, ellipse, shadow, speckles
2. game.js archer scale 0.9 → 1.25. Artillery stays 1.1.

HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign.

NO placeholders. NO fake APIs.
