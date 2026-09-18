KRC v1.3.7 antigrav WOW pack (14). THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check public/src/krc-art.js and public/src/game.js after each cluster.
No version bump. No campaign. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan and enemy_scout/brute/flyer/titan wrappers.

Helpers only:
poly(ctx, [[x,y],...], fill, stroke, line)
linGrad(ctx, x0, y0, x1, y1, [[t,color],...])
radGrad(ctx, x, y, r0, r1, [[t,color],...])
ellipse(ctx, x, y, rx, ry, fill, stroke, line)
rounded(ctx, x, y, w, h, r, fill, stroke, line)
shadow(ctx, x, y, rx, ry, a)
speckles(ctx, x, y, w, h, n, color, size)

KEEP make() w,h exactly. Wow: high contrast, not muddy.

1. drawDirtTile / tile_dirt 54x48 — less puzzle-square, more dirt ribbon (softer corners, continuous ruts).
2. tile_dirt_b / tile_dirt_c — match dirt family. Keep 54x48.
3. tile_stone 54x48 — flagstone that tiles without seams.
4. tile_ember 54x48 — scorched path, keep size.
5. tile_dirt_edge 54x16, tile_stone_edge 54x16, tile_ember_edge 54x16 — softer edges.
6. gate_leak 128x96 — readable breach glow, keep size. Do not change gate x/y/scale in game.js.
7. path_mark 24x16 — subtle, not a sticker.
8. dressBattlefield: mapIndex 0 extra flowers/fireflies only. Do not move pads/path/gate.
9. dressBattlefield: mapIndex 1 extra rocks/ruins only.
10. dressBattlefield: mapIndex 2 extra ember sparks only (graphics ok).
11. dressBattlefield: mapIndex 3 extra wind streaks only.
12. dressBattlefield: mapIndex 4 extra cinder dots only.
13. Do not touch mute/spell iconScale.
14. Do not gray pad_empty.

Skip missing. No CONFIG. No placeholders. No fake APIs.
