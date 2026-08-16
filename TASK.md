# TASK: KRC AAA Visual & Gameplay Upgrade (1.0.1 → 1.0.2)

## Context
KRC is a Phaser 3 tower defense game at `/Users/davidpence/kingdom-rush-clone`. It has solid gameplay systems (4 towers, 9 enemy types, hero, spells, campaign) but uses very basic procedural art (colored rectangles/circles), minimal CSS styling, and Kenney placeholder audio.

**Goal:** Transform KRC into a visually stunning, premium-quality tower defense game with rich procedural art, polished UI/UX, particle effects, atmospheric maps, and tight gameplay feel — while remaining legally distinct from Kingdom Rush (no copying of KR art, audio, characters, or maps).

## Constraints
- Single-file HTML game (no build step) — Phaser 3.80 from CDN, all JS loaded inline
- Must pass existing tests: `for t in tests/*.test.mjs; do node "$t"; done`
- Must pass syntax check: `node --check public/src/game.js` and all other JS files
- Must pass smoke test: `bash scripts/smoke-static.sh`
- All art must be procedurally generated via Phaser Canvas textures (no external image assets)
- Audio: enhance Kenney audio usage, add layered sound effects where possible
- Do NOT modify test files or game-data.js numerical balance values (towers, enemies, waves data)
- Do NOT change the game architecture: GameScene class, modular JS files, campaign state system

## Scope — What to Build (Prioritized)

### 1. Rich Procedural Art (`public/src/krc-art.js`)
Replace all basic colored rectangles with detailed procedural sprites:

**Towers (each 64x64 texture):**
- **Rangers:** Wooden watchtower with arrow slits, green roof, flag on top, detailed wood grain
- **Runes:** Stone circle with glowing runes, purple crystal center, magical aura ring
- **Mortar:** Stone mortar piece with bronze barrel, smoke particles on top, chain details
- **Guard:** Shield wall segment with battlements, yellow banner, soldier silhouette behind

**Enemies (each 48x48 texture):**
- **Scout:** Lean humanoid figure with bow, green tunic, quick stance
- **Brute:** Large muscular figure, brown leather armor, club weapon
- **Shield:** Heavy knight with large tower shield, chainmail, helmet
- **Ember:** Fiery figure with flame trail, orange/red glow effect
- **Broodling:** Insectoid creature, purple carapace, multiple legs
- **Flyer/Wisp:** Ethereal floating spirit with trailing light particles
- **Hexer:** Robed mage with staff, purple aura, floating crystals
- **Titan:** Colossal armored figure, stone-like skin, glowing cracks
- **Boss/Warden:** Dark sorcerer king with crown, purple cape, dual weapons

**Environment:**
- Detailed trees (pine + oak) with trunk, canopy layers, shadows
- Rocks with moss texture, bushes with leaf clusters
- Decorative ruins, banners, flowers with petals
- Gate: detailed stone archway with iron bars

**Projectiles:**
- Arrow: wooden shaft, fletching, metal tip with trail
- Magic orb: glowing purple sphere with particle ring
- Bomb: dark iron ball with fuse spark

**UI Elements:**
- Build pads: detailed stone circles with glow effect, range preview ring
- Hero: detailed captain sprite with sword, shield, helmet plume

### 2. Particle & Visual Effects (`public/src/game.js` — update methods)
- **Hit sparks:** Small particle bursts on enemy hit (color varies by tower type)
- **Death explosions:** Multi-layered particle explosion on enemy death (size varies by enemy)
- **Tower fire effects:** Projectile trails, muzzle flash on tower fire
- **Spell effects:** 
  - Meteor: falling fire trail with ground explosion ring
  - Frost: expanding ice wave with freeze particles
  - Rally: golden aura pulse from rally point
- **Hero abilities:** Charge (speed trail), Banner (golden buff wave), Heal (green cross particles)
- **Damage numbers:** Floating "+X" or "-X" text on hits/deaths
- **Screen shake:** Subtle camera shake on big hits (titan death, boss abilities)
- **Tower upgrade glow:** Pulsing golden ring when tower upgrades

### 3. Enhanced Map Rendering (`public/src/game.js` — drawMap method)
- **Parallax sky:** Multi-layer gradient sky with animated clouds
- **Terrain variety:** Each map gets unique ground texture patterns, grass tufts, dirt patches
- **Road detail:** Cobblestone pattern on road, edge stones, mud puddles
- **Atmospheric effects:** 
  - Map 1 (Forest): Dappled light, fireflies
  - Map 2 (Stone Pass): Mist/fog layers, stone debris
  - Map 3 (Ember Marsh): Heat shimmer, marsh gas bubbles
- **Depth layering:** Proper z-ordering for foreground/midground/background elements
- **Dynamic shadows:** Objects cast soft shadows on ground

### 4. Polished UI/UX (`public/styles.css` + `game.js` HUD)
- **HUD upgrade:** Gradient backgrounds, subtle borders, icon integration
- **Tower shop:** Hover/press animations, cost highlighting when affordable/unaffordable
- **Wave progress bar:** Animated fill with wave label countdown
- **Gold/lives display:** Animated number transitions, icon glow on change
- **Start overlay:** Title screen with game logo, "Tap to Start" prompt, controls hint
- **Game over / Victory screen:** Animated overlay with star rating, gold earned, next map button
- **Tower selection highlight:** Selected tower type glows in shop panel
- **Enemy trait badges:** Small colored icons on enemies showing ARM/FLY/SWM/etc.
- **Health bars:** Smooth animated health bars on enemies and hero

### 5. Enhanced Audio (`public/src/game.js` — SoundBox class)
- Layer multiple Kenney audio clips for richer sounds (shoot + impact, boom + rumble)
- Add volume variation based on distance/size
- Implement music crossfade between wave states
- Add UI click sounds from Kenney library

## Implementation Strategy

### File Changes (in order):
1. **`public/src/krc-art.js`** — Complete rewrite with detailed procedural textures (64x64 and 48x48 sprites)
2. **`public/src/game.js`** — Update methods:
   - `makeTextures()` — call enhanced art from krc-art.js, add particle texture generators
   - `drawMap()` — enhanced terrain, parallax sky, atmospheric effects
   - `updateEnemies()` — add hit sparks, death explosions, damage numbers
   - Tower fire methods — add muzzle flash, projectile trails
   - Spell casting — add visual effects (meteor, frost, rally)
   - Hero abilities — add visual effects
   - Upgrade/sell — add particle effects
   - Add `createParticles()`, `updateParticles()` methods for particle system
   - Add screen shake on big hits
3. **`public/styles.css`** — Enhanced styling for game container, HUD elements, overlays
4. **`public/index.html`** — Update CSS version hash

### Technical Notes:
- Use Phaser 3's built-in particle emitters where possible (`this.add.particles()`)
- For damage numbers, use Phaser Text objects with tween animations (move up + fade out)
- Keep all art procedural — no external image files needed
- Use Phaser tweens for smooth animations (health bars, UI transitions)
- Maintain the existing entity registry pattern for enemies/heroes/soldiers
- Keep the modular file structure — don't merge everything into game.js

## Verification Checklist (Antigrav must run these)
1. `node --check public/src/game.js` — syntax pass
2. `node --check public/src/krc-art.js` — syntax pass  
3. `for t in tests/*.test.mjs; do node "$t"; done` — all tests pass
4. `bash scripts/smoke-static.sh` — smoke test passes
5. Start local server, open in browser, verify:
   - Game loads without console errors
   - Towers build and fire with visual effects
   - Enemies have detailed sprites (not just colored rectangles)
   - Particle effects appear on hits and deaths
   - Maps have atmospheric rendering
   - UI is polished and responsive

## Version Bump
- Update CSS version hash in index.html to `?v=20260816-1`
- Update krc-art.js version hash to `?v=20260816-1`
- Update game.js version hash to `?v=20260816-1`
