KRC v1.3.13 antigrav combat-fire pack. THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after each cluster.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle and those enemy_* wrappers.
FORBIDDEN: projectile_magic (reserved for MoA). Do not edit that make().

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face. KEEP make sizes.

1. drawArcherFire / tower_archer_fire 128x128 — at play scale (~36px) must read HUT + HUGE drawn bow (V string, thick stave) + leaning archer. Must differ from idle at a glance. Fat #141008.
2. drawMageFire / tower_mage_fire 128x128 — bigger launched bolt vs idle crystal. Keep 128.
3. drawArtilleryFire / tower_artillery_fire 128x128 — muzzle flash / barrel kick vs idle. Keep 128.
4. drawBarracksFire / tower_barracks_fire if present — rally banner snap. Skip if missing.
5. projectile_arrow — keep live canvas size. Fat shaft + fletching + head. Reads at ~16px.
6. projectile_bomb — keep live canvas size. Iron sphere + fuse spark. Not a gray circle.
7. soldier_guard idle/attack if present — fatter outline, huge eyes. Skip if already thick.
8. Do not gray pad_empty. Do not move pads.
9. Do not edit campaign nodes.
10. Skip missing. No CONFIG. No placeholders. No make(fn).
