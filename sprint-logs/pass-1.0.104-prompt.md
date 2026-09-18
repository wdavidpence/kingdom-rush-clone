KRC 1.0.104 same assignment for antigrav AND qwen2735 MoA.

HARD RULES: do not change Forest Gate { x: 100, y: 375 } or bannerY=98. No Claude. Surgical diff only.

In public/src/game.js method triggerGateLeak, AFTER the existing spark for-loop, add 8 wood splinters:
- small rectangles or fx_dust tinted 0x6a4428
- spawn at gx, gy
- fly left/up into the lane
- this.effects.push with vx, vy, life 0.4-0.7
- skip extra motion if reducedMotion (already inside that block)

Do not rewrite the whole function. Do not bump version (judge will).
node --check public/src/game.js
