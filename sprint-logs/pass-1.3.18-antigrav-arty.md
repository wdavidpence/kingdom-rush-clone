KRC v1.3.18 antigrav artillery pack. THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after clusters.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle,
drawHeroCaptainIdle/Attack/Ability, projectile_magic, pad_empty,
drawDrift, drawShield, drawEmber, drawBrood, drawHexer.
Do not edit game.js.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face. KEEP make sizes 128.

Wow: at ~64px the artillery must read as a STONE REDOUBT + MORTAR, not a thatched hut.

1. drawArtilleryRedoubt128 — stone bunker, iron plates, fat #141008. Keep 128 wrappers.
2. drawArtilleryProps128 — ammo crates / fuse, not extra roof thatch.
3. drawArtilleryMortar128(ctx, firing) — barrel up; firing=true has muzzle flash. Distinct vs idle.
4. Keep drawArtilleryIdle/Fire as the 3-helper compose if that is live.
5. L2/L3 only if they still look like a hut. Skip if already a redoubt.
6. Skip missing. No CONFIG. No placeholders. No make(fn).
