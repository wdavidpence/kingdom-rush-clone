# TASK: KRC v1.0.4 — Sound Layering & Visual Polish

## Context
KRC is a Phaser 3 tower defense game at `/Users/davidpence/kingdom-rush-clone`. Previous versions added particle effects, damage numbers, spell VFX, hero abilities, map atmosphere (v1.0.2), and tower upgrade effects, enemy trait badges, smooth health bars, sell coins, wave cinematic (v1.0.3).

**Goal for v1.0.4:** Implement sound layering (combining Kenney audio clips for richer sounds) and additional visual polish to approach AAA quality.

## Constraints
- Single-file HTML game (no build step) — Phaser 3.80 from CDN, all JS loaded inline
- Must pass existing tests: `for t in tests/*.test.mjs; do node "$t"; done`
- Must pass syntax check: `node --check public/src/game.js` and all other JS files
- Must pass smoke test: `bash scripts/smoke-static.sh`
- Do NOT modify game-data.js numerical balance values (towers, enemies, waves data)
- Do NOT change the game architecture: GameScene class, modular JS files

## Scope — What to Build (Prioritized)

### 1. Sound Layering (`public/src/game.js` — SoundBox class)
Replace single-clip sounds with layered combinations:

**Tower Shoot (archer):** Kenney-shoot + subtle impact layer
- Layer 1: `sfx_shoot` at volume 0.25 (main arrow whoosh)
- Layer 2: `sfx_impact` at volume 0.08, rate 1.5 (subtle thwip)
- Layer 3: WebAudio tone at 800Hz, 0.04s triangle (arrow tip)

**Tower Shoot (mage):** Kenney-magic + shimmer layer
- Layer 1: `sfx_magic` at volume 0.2 (main spell)
- Layer 2: `sfx_shoot` at volume 0.1, rate 2.0 (high shimmer)
- Layer 3: WebAudio tone at 1200Hz, 0.06s sine (magic sparkle)

**Tower Shoot (artillery):** Kenney-boom + rumble layer
- Layer 1: `sfx_boom` at volume 0.25 (main explosion)
- Layer 2: `sfx_impact` at volume 0.15, rate 0.7 (low rumble)
- Layer 3: WebAudio tone at 80Hz, 0.15s sawtooth (sub-bass)

**Enemy Hit:** Kenney-impact + damage layer
- Layer 1: `sfx_impact` at volume 0.2 (main hit)
- Layer 2: WebAudio tone based on damage type (higher pitch for magic)

**Enemy Death:** Kenney-impact + death layer
- Layer 1: `sfx_impact` at volume 0.3 (main death)
- Layer 2: `sfx_boom` at volume 0.15 (death thud)
- Layer 3: WebAudio pitch sweep from 400Hz to 100Hz, 0.2s (death fade)

**Tower Build:** Kenney-ready + construction layer
- Layer 1: `sfx_ready` at volume 0.25 (main build)
- Layer 2: `sfx_start` at volume 0.1, rate 1.3 (construction click)

**Tower Upgrade:** Kenney-ready + upgrade layer
- Layer 1: `sfx_ready` at volume 0.3 (main upgrade)
- Layer 2: WebAudio tone sweep from 300Hz to 600Hz, 0.15s (upgrade chime)

**Tower Sell:** Kenney-impact + coin layer
- Layer 1: `sfx_impact` at volume 0.2 (main sell)
- Layer 2: WebAudio tone sweep from 800Hz to 1200Hz, 0.08s (coin jingle)

**Spell Cast:** Kenney-magic/boom + spell layer
- Meteor: `sfx_boom` at 0.35 + WebAudio noise burst
- Frost: `sfx_magic` at 0.25 + WebAudio high sweep
- Rally: `sfx_ready` at 0.3 + WebAudio warm chord

**Hero Abilities:**
- Charge: `sfx_impact` at 0.3 + WebAudio speed sweep (200→800Hz, 0.15s)
- Banner: `sfx_ready` at 0.3 + WebAudio warm chord (440+550Hz, 0.2s)
- Heal: `sfx_magic` at 0.25 + WebAudio gentle sweep (600→400Hz, 0.2s)

**UI Sounds:**
- Button click: WebAudio short tone (600Hz, 0.03s triangle)
- Error/no-target: WebAudio low buzz (150Hz, 0.1s sawtooth)
- Wave start: `sfx_start` at 0.3 + WebAudio rising sweep

### 2. Enhanced Visual Polish
**Tower Selection Highlight:** When a tower pad is selected, add a subtle pulsing glow ring around it (already partially done — enhance with color matching tower type)

**Projectile Trail Enhancement:** Instead of random dots, create continuous trail lines behind projectiles using Phaser.Graphics or line segments

**Enemy Slow Effect:** When an enemy is slowed (frost, hexer aura), add a subtle blue tint overlay and ice crystal particles

**Tower Hex Effect:** When hexed by Hexer, add purple crackle particles around the tower sprite

**Build Pad Range Preview:** When selecting a build pad, show range ring with animated dashed line (Phaser.Graphics with dash pattern)

**Hero Command Indicator:** When hero is selected, add a subtle golden aura around the hero sprite that pulses

### 3. Map Atmosphere Enhancements
**Forest Gate:** Add subtle leaf particles drifting on wind (Phaser particle emitter)

**Stone Pass:** Add stone dust particles near the road edges

**Ember Marsh:** Add marsh gas bubbles rising from ground, heat shimmer distortion effect

## Implementation Strategy

### File Changes:
1. **`public/src/game.js`** — Update SoundBox class with layered sounds, add visual enhancements
2. **`public/index.html`** — Update CSS version hash

### Technical Notes:
- Use Phaser's `scene.sound.add()` for Kenney clips, WebAudio API for custom tones
- Layer sounds by calling multiple play() calls with different volumes/rates
- For WebAudio tones, use the existing `tone()` method but combine multiple calls
- Respect reducedMotion setting for all visual effects
- Keep all art procedural — no external image files needed

## Verification Checklist (Antigrav must run these)
1. `node --check public/src/game.js` — syntax pass
2. `for t in tests/*.test.mjs; do node "$t"; done` — all tests pass
3. `bash scripts/smoke-static.sh` — smoke test passes
4. Start local server, open in browser, verify:
   - Game loads without console errors
   - Sounds are layered and richer than before
   - Visual effects work correctly

## Version Bump
- Update CSS version hash in index.html to `?v=20260817-1`
