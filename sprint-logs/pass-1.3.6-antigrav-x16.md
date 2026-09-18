KRC v1.3.6 antigrav WOW pack (16). THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check public/src/krc-art.js and public/src/game.js after each cluster.
No version bump. No campaign. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan and their enemy_* wrappers. MoA owns those.

Helpers only, live arities:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

Wow: fat #141008 outline, readable at play scale. KEEP all make() w,h exactly.

1. tower_archer_fire 128x128 — bow drawn / muzzle flash vs idle. Keep size.
2. tower_mage_fire 128x128 — rune flare vs idle. Keep size.
3. tower_artillery_fire 128x128 — barrel recoil / blast vs idle. Keep size.
4. tower_barracks_fire 128x128 — banner/door action vs idle. Keep size.
5. tower_mage 128x128 — bolder silhouette (last pack skipped). Keep size.
6. tower_artillery 128x128 — bolder silhouette. Keep size.
7. tower_barracks 128x128 — bolder silhouette. Keep size.
8. fx_meteor 128x128 — bigger fireball, dark rim. Keep size.
9. fx_ice 128x128 — readable frost burst. Keep size.
10. fx_rally 128x128 — gold sunburst readable. Keep size.
11. fx_meteor_0 / fx_meteor_1 if present — match meteor. Keep sizes.
12. fx_ice_0 / fx_ice_1 if present — match ice. Keep sizes.
13. fx_rally_0 / fx_rally_1 if present — match rally. Keep sizes.
14. fx_trail_smoke 24x24 — thicker smoke. Keep size.
15. Do not touch mute/spell iconScale.
16. Do not rewrite pad_empty to gray.

Skip missing keys. No CONFIG. No placeholders. No fake APIs.
