# TASK: KRC v1.0.7 — Hero Ability Sounds, Spell Sounds, Projectile Trails, Hero Aura

## Context
KRC is a Phaser 3 tower defense game at `/Users/davidpence/kingdom-rush-clone`. v1.0.6 added map atmosphere, tower polish, layered shoot/death sounds. The SoundBox class already has `playLayered()` with handlers for all hero abilities and spells — they just need to be wired up in the game code.

**Goal for v1.0.7:** Wire up hero ability sounds, spell sounds, add projectile trail enhancement, and hero command indicator aura.

## Constraints
- Single-file HTML game — Phaser 3.80 from CDN, all JS loaded inline
- Must pass: `node --check public/src/game.js`, all 11 tests, `bash scripts/smoke-static.sh`
- Do NOT modify game-data.js numerical balance values
- Respect reducedMotion setting for all visual effects

## Scope — What to Build

### 1. Hero Ability Sound Layering (castHeroAbility method)
Wire up the existing playLayered handlers:

**Charge ability:** Replace `this.audio.play("impact", 0.3)` with `this.audio.playLayered("chargeAbility")`
**Banner ability:** Replace `this.audio.play("ready", 0.3)` with `this.audio.playLayered("bannerAbility")`
**Heal ability:** Replace `this.audio.play("magic", 0.25)` with `this.audio.playLayered("healAbility")`

### 2. Spell Sound Layering (castSpell method)
Wire up the existing playLayered handlers:

**Meteor spell:** Replace `this.audio.play("boom", 0.4)` with `this.audio.playLayered("meteorSpell")`
**Frost spell:** Replace `this.audio.play("magic", 0.28)` with `this.audio.playLayered("frostSpell")`
**Rally spell:** Replace `this.audio.play("ready", 0.3)` with `this.audio.playLayered("rallySpell")`

### 3. Projectile Trail Enhancement (updateProjectiles method)
Replace random-dot trails with continuous trail lines:

Instead of the existing `Math.random() < 0.45` dot spawning, add a trail line behind each projectile:
```javascript
// In updateProjectiles, replace the random dot with a trail line:
if (!this.settings.reducedMotion && Math.random() < 0.3) {
  const trail = this.add.line(0, 0, p.x - Math.cos(p.sprite.rotation) * 8, p.y - Math.sin(p.sprite.rotation) * 8,
    p.x, p.y, p.trailColor || 0xfff0c0, 0.4).setLineWidth(1.5).setDepth(59);
  this.tweens.add({ targets: trail, alpha: 0, duration: 120, onComplete: () => trail.destroy() });
}
```

### 4. Hero Command Indicator Aura (updateHero method)
When the hero is selected or moving, add a golden pulsing aura:

```javascript
// In updateHero, after existing hero logic:
if (hero && !hero.dead) {
  // Golden aura around hero that pulses
  if (!this.heroAura || this.heroAura.destroyed) {
    this.heroAura = this.add.circle(hero.x, hero.y - 4, 20, 0xf5d76e, 0.15).setStrokeStyle(2, 0xfff2ba, 0.6).setDepth(45);
  } else {
    this.heroAura.setPosition(hero.x, hero.y - 4);
    const pulse = Math.sin(this.time.now * 0.006) * 0.05 + 0.15;
    this.heroAura.setFillStyle(0xf5d76e, pulse);
  }
} else if (this.heroAura) {
  this.heroAura.destroy();
  this.heroAura = null;
}
```

### 5. Tower Build Sound Enhancement (buildTower method)
Replace single-clip build sound with layered:
```javascript
// Replace this.audio.play("ready", 0.28) with:
this.audio.playLayered("towerBuild");
```

### 6. Tower Upgrade Sound Enhancement (upgradeSelected method)
Replace single-clip upgrade sound with layered:
```javascript
// Replace this.audio.play("ready", 0.34, ...) with:
this.audio.playLayered("towerUpgrade");
```

### 7. Tower Sell Sound Enhancement (sellSelected method)
Replace single-clip sell sound with layered:
```javascript
// Add after the refund logic, before tower.sprite.destroy():
this.audio.playLayered("towerSell");
```

### 8. Version Hash Update (public/index.html)
Change CSS version to `?v=20260817-5`

## Implementation Strategy
- Modify `public/src/game.js` only (SoundBox already has all playLayered handlers from v1.0.4)
- Update version hash in `public/index.html`

## Verification (run ALL before reporting)
1. `node --check public/src/game.js` — syntax pass
2. `for t in tests/*.test.mjs; do node "$t"; done` — all 11 tests pass
3. `bash scripts/smoke-static.sh` — smoke test passes
4. Report summary of changes and verification results

## IMPORTANT: Use agy for all file modifications
Run commands like: /Users/davidpence/.local/bin/agy --dangerously-skip-permissions --model 'gemini-3.7-flash-high' --print "implement the changes described above in public/src/game.js and index.html" with workdir=/Users/davidpence/kingdom-rush-clone
