KRC v1.3.4 antigrav LARGE WOW SPRINT (20 tasks). Work in THIS repo (kingdom-rush-clone-antigrav).
Do IN ORDER. After each: node --check public/src/krc-art.js and public/src/game.js.
Do not bump version. Do not touch campaign, { x: 100, y: 375 }, bannerY=98, bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, enemy_scout*, enemy_brute*, enemy_flyer*. MoA owns those.

Helpers only, live arities:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)
face(ctx, cx, cy, eye, pupil, angry)

Wow bar: fat #141008 outline 2.6-3.2, huge cream eyes, readable silhouette at ~40-50px. No hairline rims.

KEEP these make sizes exactly:
1. drawShield — armored knight. make("enemy_shield", 80, 72 ...
2. drawEmber — burning runner. make("enemy_ember", 80, 72 ...
3. drawBrood — split-bug. make("enemy_brood", 80, 72 ...
4. drawHexer — caster + staff. make("enemy_hexer", 80, 72 ...
5. drawTitan — huge stone brute. make("enemy_titan", 88, 80 ...
6. drawBossIdle — Warden. make("enemy_boss", 96, 88, (ctx) => drawBossIdle(ctx));
7. soldier_guard — keep make("soldier_guard", 56, 60. Fat outline, spear readable.
8. hero_captain_idle — keep make("hero_captain_idle", 64, 72. Clear helm + face at scale 1.02.
9. projectile_magic — keep make("projectile_magic", 36, 36. Fat rune bolt.
10. projectile_bomb — keep make("projectile_bomb", 40, 40. Round bomb + fuse.
11. projectile_arrow — keep make("projectile_arrow", 44, 20. Fat shaft + fletching.
12. fx_trail_magic 24x24, fx_trail_arrow 32x14, fx_trail_bomb 28x28 — thicker matching trails.
13. fx_spark 24x24 — white-hot core + dark rim.
14. fx_dust 32x32, fx_leaf 24x24 — readable puffs/leaves.
15. pad_empty 72x48 — KEEP gold CTA ring (do not gray it out).
16. tree_pine 56x80 vs tree_oak 64x72 — distinct silhouettes, not clones.
17. cloud_soft 80x36 — brighter cumulus.
18. banner_flag 28x44 — readable flag, not a stick.
19. gate_arch 128x96 — higher contrast stone/door/lanterns. Do not change game.js gate x/y/scale.
20. paintMapGround Forest Gate only: stronger warm sun ellipses (0xffe08a low alpha). Do not move pads or path.

If a draw* is missing, skip that number. No placeholders. No fake APIs. No CONFIG. No iconScale on mute/spells.
