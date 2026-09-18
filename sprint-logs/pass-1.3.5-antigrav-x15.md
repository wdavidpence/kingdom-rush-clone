KRC v1.3.5 antigrav WOW pack (15). THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after each of krc-art.js and game.js.
No version bump. No campaign. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer and their make("enemy_scout|brute|flyer" wrappers.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face with live arities.
shadow(ctx,x,y,rx,ry,a) speckles(ctx,x,y,w,h,n,color,size)
Wow: fat #141008 outline, huge cream eyes, readable at ~40-50px.

1. drawDrift — keep make("enemy_drift", 80, 72. Phase ghost, readable core.
2. tower_archer 128x128 — bolder silhouette, keep size.
3. tower_mage 128x128 — keep size.
4. tower_artillery 128x128 if present — keep size.
5. tower_barracks 128x128 if present — keep size.
6. paintMapGround idx===1 Stone Pass — cooler light patches, not olive. Do not move pads/path.
7. paintMapGround idx===2 Ember Marsh — ember glow patches. Do not move pads/path.
8. paintMapGround idx===3 Gale Reach — wind-scuffed highlights. Do not move pads/path.
9. paintMapGround idx===4 Ash Spire — cinder glow. Do not move pads/path.
10. fx_trail_magic/arrow/bomb — if already thick, skip.
11. ruin_pillar — readable ruin, keep live make size.
12. rock_moss — keep live make size, more contrast.
13. bush_round — keep live make size.
14. flower_patch — keep live make size.
15. Do not touch mute/spell iconScale.

Skip missing keys. No CONFIG. No placeholders.
