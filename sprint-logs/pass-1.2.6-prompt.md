KRC 1.2.6 SAME assignment. Hermes judge. RANGER FIRE ONLY.

1.2.5: scout hit hook works. Ranger fire still a thatch hut. FAIL Wow.

DO:
1. Rewrite const drawArcherFire = (ctx) => { in public/src/krc-art.js so at ~36px the silhouette is: hut + a HUGE drawn bow (V string, thick stave) and leaning archer. Must differ from idle at a glance.
   Helpers: poly([[x,y]]), linGrad(..., [[t,c],...]), rounded, ellipse, shadow, speckles.
2. game.js flashTowerFirePose: bloom alpha 0 or omit the circle. Fire KEY carries the pose. Keep reducedMotion early return.

Do not touch campaign, gate, { x: 100, y: 375 }, bannerY=98, bounty, version, scout unless needed.

NO placeholders. NO fake APIs.
