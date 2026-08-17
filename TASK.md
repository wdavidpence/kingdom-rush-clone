# TASK: KRC v1.0.6 — Map Atmosphere Enhancements & Tower Upgrade Polish

## Context
KRC is a Phaser 3 tower defense game at `/Users/davidpence/kingdom-rush-clone`. v1.0.5 added enemy slow/hex VFX, range ring preview, UI sounds.

**Goal for v1.0.6:** Add map-specific atmosphere enhancements and tower upgrade polish to approach AAA quality.

## Constraints
- Single-file HTML game — Phaser 3.80 from CDN, all JS loaded inline
- Must pass: `node --check public/src/game.js`, all 11 tests, `bash scripts/smoke-static.sh`
- Do NOT modify game-data.js numerical balance values
- Respect reducedMotion setting for all visual effects

## Scope — What to Build

### 1. Forest Gate Atmosphere (map index 0)
Add subtle leaf particles drifting on wind:
- Use existing particle system helpers (createParticles or manual circle + effects)
- 6 leaf particles drifting slowly across the screen
- Green/brown colors, slow horizontal drift + slight vertical bob

### 2. Stone Pass Atmosphere (map index 1)
Add stone dust particles near road edges:
- 4 small grey/brown particles floating near the path
- Slow upward drift (like dust in sunlight)

### 3. Ember Marsh Atmosphere (map index 2)
Add marsh gas bubbles rising from ground:
- 5 green/yellow particles rising slowly from random positions near the path
- Slight horizontal wobble as they rise

### 4. Tower Upgrade Visual Polish (upgradeSelected method)
Enhance the existing upgrade VFX:
- Add level-specific ring color (bronze for L2, silver for L3, gold for L4+, diamond for MAX)
- Add a brief screen flash on upgrade (subtle, 50ms)

### 5. Tower Build Visual Polish (buildTower method)
Enhance the existing build effect:
- Add a brief golden flash at build position (scale up then fade)
- Add 8 small particles radiating outward from build point

### 6. Enemy Death Sound Enhancement (removeEnemy method)
Replace single-clip death sound with layered:
- Use `this.audio.playLayered("enemyDeath")` instead of single play

### 7. Tower Shoot Sound Enhancement (fireTower method)
Replace single-clip shoot sound with layered:
- Archer: `this.audio.playLayered("archerShoot")`
- Mage: `this.audio.playLayered("mageShoot")`
- Artillery: `this.audio.playLayered("artilleryShoot")`

### 8. Version Hash Update (public/index.html)
Change CSS version to `?v=20260817-4`

## Implementation Strategy
- Modify `public/src/game.js` only (SoundBox already has playLayered from v1.0.4)
- Update version hash in `public/index.html`

## Verification (run ALL before reporting)
1. `node --check public/src/game.js` — syntax pass
2. `for t in tests/*.test.mjs; do node "$t"; done` — all 11 tests pass
3. `bash scripts/smoke-static.sh` — smoke test passes
4. Report summary of changes and verification results

## IMPORTANT: Use agy for all file modifications
Run commands like: /Users/davidpence/.local/bin/agy --dangerously-skip-permissions --print "implement the changes described above in public/src/game.js and index.html" with workdir=/Users/davidpence/kingdom-rush-clone
