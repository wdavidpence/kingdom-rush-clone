KRC v1.3.25 antigrav mage L2/L3 keep pack. THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after clusters.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle,
drawHeroCaptainIdle/Attack/Ability, projectile_magic, pad_empty,
drawMageCrystal128, drawMageIdle, drawArcherL2, drawArcherL3,
drawBarracksL2, drawBarracksL3, drawArtilleryL3.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face. KEEP 128.

Wow: mage L2/L3 must read as a TALL RUNE KEEP + bigger crystal at ~46px, not a hut.

1. drawMageL2 — taller keep, extra crystal. Keep 128. Call existing drawMageCrystal128 if already used; do not rewrite it.
2. drawMageL3 — tallest, banners. Keep 128. Same crystal helper rule.
3. Do not flatten L1 idle.
4. Do not edit game.js.
5. Skip missing. No CONFIG. No placeholders. No make(fn).
