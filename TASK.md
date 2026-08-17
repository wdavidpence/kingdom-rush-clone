# TASK: KRC v1.0.5 — Enemy Slow/Hex VFX, Animated Range Ring, UI Sounds

## Context
KRC is a Phaser 3 tower defense game at `/Users/davidpence/kingdom-rush-clone`. v1.0.4 added sound layering. The game has particle system helpers (createParticles, createHitSparks, etc.) from v1.0.2/v1.0.3.

**Goal for v1.0.5:** Add enemy slow/hex visual effects, animated build pad range ring preview, and UI click sounds.

## Constraints
- Single-file HTML game — Phaser 3.80 from CDN, all JS loaded inline
- Must pass: `node --check public/src/game.js`, all 11 tests, `bash scripts/smoke-static.sh`
- Do NOT modify game-data.js numerical balance values
- Respect reducedMotion setting for all visual effects

## Scope — What to Build

### 1. Enemy Slow Visual Effect (updateEnemies / updateEnemyVisual)
When an enemy is slowed (frost spell, hexer aura), add:
- Blue tint overlay on the enemy sprite (setTint 0xaaddff when slowed)
- Ice crystal particles spawning around the enemy (use existing particle system helpers)
- Remove tint/particles when slow expires

### 2. Tower Hex Visual Effect (updateTowers)
When a tower is hexed by Hexer aura, add:
- Purple crackle particles around the tower sprite (use existing particle system)
- Subtle purple tint on the tower sprite while hexed

### 3. Build Pad Range Preview (handlePointer / selectPad)
When a build pad is selected and a tower type is chosen, show an animated dashed range ring:
- Use Phaser.Graphics to draw a dashed circle at the pad position
- Animate it with a pulsing alpha (sinusoidal) and color matching the tower type
- Show/hide based on selection state

### 4. UI Click Sounds (makeButton)
Add WebAudio click tone to every button press in makeButton:
- `this.audio.playLayered("uiClick")` on pointerdown

### 5. Error Sounds (error paths)
Add buzz tone when player tries invalid action:
- `this.audio.playLayered("uiError")` in error paths (can't afford, no target, etc.)

## Implementation Strategy
- Modify `public/src/game.js` only (SoundBox already has playLayered from v1.0.4)
- Update version hash in `public/index.html` to `?v=20260817-2`

## Verification (run ALL before reporting)
1. `node --check public/src/game.js`
2. `for t in tests/*.test.mjs; do node "$t"; done`
3. `bash scripts/smoke-static.sh`
4. Report summary of changes and verification results

## IMPORTANT: Use agy for all file modifications
Run commands like: /Users/davidpence/.local/bin/agy --dangerously-skip-permissions --print "implement the changes described above in public/src/game.js" with workdir=/Users/davidpence/kingdom-rush-clone
