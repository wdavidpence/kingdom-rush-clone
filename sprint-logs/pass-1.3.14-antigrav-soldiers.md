KRC v1.3.14 antigrav barracks/soldiers pack. THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after clusters.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle,
drawHeroCaptainIdle, drawHeroCaptainAttack, drawHeroCaptainAbility, projectile_magic.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face. KEEP make sizes.

1. drawSoldierGuardWalk frames 0-3 56x60 — fat #141008, huge cream eyes, readable shield+spear at ~28px. Distinct stride.
2. drawSoldierGuardAttack — thrust vs walk. Keep 56x60.
3. drawSoldierGuardBlock — raised shield vs walk. Keep 56x60.
4. tower_barracks idle vs fire — fire already has banner snap; idle must look calmer. Keep 128.
5. projectile_arrow — fatter head/fletch if it still vanishes at 16px.
6. Do not gray pad_empty. Do not move pads.
7. Do not edit campaign nodes.
8. Skip missing. No CONFIG. No placeholders. No make(fn).
