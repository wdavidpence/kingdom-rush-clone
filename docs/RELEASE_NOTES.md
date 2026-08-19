# KRC 1.0 Release Notes

## KRC 1.0.67 — 128px Runes / Mortar / Guard
- Remaining tower families rebuilt at 128x128. Scale helpers keep footprint.
- Worker: antigrav.


## KRC 1.0.66 — 128px Rangers rebuild
- Rangers idle/fire rebuilt at 128x128. On-map scale preserved.
- Worker: antigrav.


## KRC 1.0.65 — Guard walk / attack / block
- Soldiers have stride, thrust, and shield-forward frames.
- Worker: antigrav.


## KRC 1.0.64 — Hero idle / attack / ability poses
- Captain has idle, attack, and ability silhouettes.
- reducedMotion stays idle. Worker: antigrav.


## KRC 1.0.63 — Tower fire / recoil poses
- Each tower family has idle + fire textures. Shot flashes fire pose ~120ms.
- reducedMotion skips the swap.
- Worker: antigrav (gemini-3.7-flash-high).


## KRC 1.0.62 — Roster walk and fly cycles
- Shield, Ember, Brood, Flyer, Hexer, Titan now have 4-frame walk/fly sheets.
- Flip + reducedMotion lock match Scout/Brute.
- Worker: antigrav (gemini-3.7-flash-high).


## KRC 1.0.61 — Scout and Brute walk cycles
- Scout and Brute use 4-frame stride sheets (`w0`–`w3`) instead of a bobbing sticker.
- Flip from path direction. reducedMotion locks frame 0.
- Original painterly atlas only. Worker: antigrav (gemini-3.7-flash-high).

## KRC 1.0.8 — Campaign chrome, tooltips, combat visual fix

- Visible `v1.0.8` on document title, shell subtitle, and campaign banner.
- Campaign map cards, HUD icons, hover tooltips, and button press/shine polish.
- `window.__KRC_GAME__` + `window.KRC_VERSION` for live probes.
- Fixed `ReferenceError: dt is not defined` in `updateEnemyVisual` (wave combat).
- Original IP only. Next: AAA presentation program in `docs/aaa-50-iteration-plan.md`.

## KRC 1.0 — Polished Original Fantasy Tower Defense

Released as a static Phaser 3 campaign with durable modular helpers, automated Node contract tests, and GitHub Pages delivery.

### Highlights
- Three-map campaign with locked/unlocked map cards and 1–3 star records.
- Four tower families with level-gated abilities: Volley, Rune Nova, Barrage, Hold Fast.
- Guard rally points, training readiness meters, richer melee clashes.
- Enemy trait badges (armor / flying / swarm / control / elite).
- Hexer support aura that forces placement decisions.
- Warden boss with telegraphed shield and rage phases.
- Early-wave gold bonus, refund-aware sell UI, detailed selection stats.
- Keyboard + touch controls, pause/mute/reduced-motion, responsive shell.
- Storybook map palettes, projectile trails, recoil, controlled shake, music intensity ramps.
- Color-conscious HP bands and glyph trait labels beyond hue alone.

### Quality
- Full `tests/*.test.mjs` contract suite green.
- `node --check` on all `public/src/*.js`.
- Static asset smoke and QA ember regression hooks retained.
- Original IP only — Kingdom Rush is genre reference, not content source.

### Play
https://wdavidpence.github.io/kingdom-rush-clone/
