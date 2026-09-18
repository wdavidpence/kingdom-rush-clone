KRC v1.2.10 SAME assignment. Hermes judge. PERSISTENT BATTLEFIELD only.

After a fight the lane looks like wave 0. FAIL.

DO in public/src/game.js only if possible:
1. After meteor burst0 is created (~6274), also add a dark scorch ellipse at target.x, target.y+8, ~44x18, 0x1a1008, alpha 0.45, depth -12. Push onto this.worldStains (already exists). If length > 12, shift and destroy oldest.
2. Scout death fade: live fade delay 720 → 2200 so the corpse stays. fadeCorpse(sprite) / tween delay: 720 on scout path.

Do not invent APIs. this.worldStains already used ~4936.
HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign.

NO placeholders.
