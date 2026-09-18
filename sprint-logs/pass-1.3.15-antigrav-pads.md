KRC v1.3.15 antigrav pad/CTA pack. THIS repo kingdom-rush-clone-antigrav.
IN ORDER. node --check after clusters.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout, drawBrute, drawFlyer, drawTitan, drawBossIdle,
drawHeroCaptainIdle/Attack/Ability, projectile_magic, iconScale.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles/face. KEEP make sizes.

1. pad_empty 72x48 — keep size. Must read as a BUILD site: warm gold inner ring + dark stone rim. Not a gray blob. Fat #141008. BUILD text is already UI — do not draw letters.
2. pad_selected / pad_hover if present — brighter gold vs empty. Skip if missing.
3. Do not gray the pad. Do not move pad world positions.
4. gate_leak — skip if already white-hot.
5. fx_hit / fx_spark if present — fatter so they read at 16px. Skip missing.
6. Do not edit campaign nodes.
7. Do not edit mute/spell icons.
8. Skip missing. No CONFIG. No placeholders. No make(fn).
