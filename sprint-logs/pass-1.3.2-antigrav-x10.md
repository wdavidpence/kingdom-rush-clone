KRC v1.3.2 antigrav 10-UPGRADE SPRINT toward Wow. Work in THIS repo (kingdom-rush-clone-antigrav). Do IN ORDER. After each: node --check public/src/krc-art.js and public/src/game.js. Do not stop after one. Do not bump version. Do not touch campaign or { x: 100, y: 375 } or bannerY=98 or bounty 0.55. Do not rewrite drawScout (MoA owns that).

Helpers only, live arities:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

1. portrait_archer / portrait_mage / portrait_artillery / portrait_barracks — brighter faces, dark rim, readable at shop stamp size. Keep make(..., 72, 72, drawPortrait*).
2. pad_empty — 3D stone ring with inner hole, not a flat coin.
3. tree_pine — taller unique silhouette vs tree_oak. Keep live make sizes.
4. tree_oak — wider canopy, different from pine.
5. paintMapGround in public/src/game.js — add 4-6 warm sun patches (ellipses) so Forest Gate is not one flat olive. Do not move pads or path.
6. icon_gold and icon_heart — thicker outline so HUD icons read.
7. fx_spark — bigger white-hot core + dark rim.
8. cloud_soft — brighter, more cloud-shaped.
9. projectile_arrow — keep make("projectile_arrow", 44, 20. Fatter shaft + dark outline. Do not change 44,20.
10. shop info strip contrast: LIVE `this.infoBg = this.add.rectangle(W / 2, SHOP_Y - 10, W, 18, 0x120e0a, 0.78)` — only raise alpha to 0.9 if needed. No other HUD rewrite.

If a key is missing, skip that number. No placeholders. No fake APIs. No CONFIG.
