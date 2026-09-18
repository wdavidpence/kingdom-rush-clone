KRC 1.2.3 SAME assignment. Hermes judge. Harsh pixel fail from 1.2.2 MoA: bake worked, still was an unreadable GRAY BLOB in the shop corner.

Need HIGH CONTRAST silhouette that reads at 390px:
- Stone mass light enough to see (#6a5a48)
- Center hole almost black (#0a0806) — that hole IS the Wow
- Two timber door leaves in the hole
- Two lanterns as bright gold ellipses
- A little ivy, not speckles covering the arch

LIVE helpers:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0,y0,x1,y1, [[t,c],...])
rounded(ctx, x,y,w,h,r, fill, stroke, line)
ellipse(ctx, x,y,rx,ry, fill, stroke, line)
shadow(ctx, x,y,rx,ry,a)
speckles(ctx, x,y,w,h,n, color, size)

Replace make("gate_arch", 96, 64, (ctx) => { whole block with 128x96.
game.js: this.add.image(378, 520, "gate_arch").setDepth(-5).setScale(1.15);  // ON the lane, not y=588 shop
Ruts: this.add.graphics lineBetween offsets, mapIndex===0, keep tile_dirt.

NO gray-on-gray. NO ctx in Scene. NO fake APIs.
HARD: { x: 100, y: 375 }, bannerY=98, bounty 0.55, no version, no campaign.
