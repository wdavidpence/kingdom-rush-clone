KRC v1.2.0 SAME assignment. Hermes is judge only. You write the game art/code.

GOAL: Forest Gate battlefield Wow on the MARCH still frame. Not campaign nodes.

PLAYER MUST SEE without starting a wave:
1. A readable stone-and-timber GATE (dark arch, lanterns, ivy, timber doors). Silhouette must read at 390px. Current make("gate_arch") in public/src/krc-art.js (~line 8181, 96x64) is overworked mortar on a muddy stamp. Rebuild it at 128x96 or 160x96. Update public/src/game.js gate image if size/scale/position must change (now this.add.image(378, 588, "gate_arch").setScale(1.58)). Keep leak overlay keyed to the arch opening.
2. Path ruts: Forest Gate lane must look like packed dirt with two worn tracks into the threshold, not a single tan stroke. Prefer dressBattlefield / strokePath for mapIndex===0 only.

HARD:
- Do not touch campaign MAPS.forEach, node positions, or { x: 100, y: 375 }.
- Do not change bannerY = 98 or bounty Math.floor(spent * 0.55).
- Do not bump KRC_VERSION.
- Original KRC art only. No Kingdom Rush names/art.
- node --check public/src/krc-art.js and public/src/game.js
- Prefer editing the existing make("gate_arch") / make("gate_leak") bodies. Do not rewrite the whole atlas.

ACCEPT: a still Forest Gate screenshot looks like a place, not a HUD over ellipses.
FAIL: more speckles, more 1px mortar, more orange glow circles, campaign hover, tiny unreadable detail.
