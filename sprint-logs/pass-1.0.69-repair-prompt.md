KRC v1.0.69 REPAIR — do not bump version.

Bake crashes: ReferenceError: drawMageFire is not defined at public/src/krc-art.js:1914
  make("tower_mage_fire", 128, 128, drawMageFire);

That abort stops later makes, so tower_artillery_l2/l3 and tower_barracks_l2/l3 never exist at runtime. Browser proved those four keys missing.

FIX
1. Define drawMageFire (or point tower_mage_fire at an existing fire drawer) BEFORE the make() call.
2. Confirm these keys all bake: tower_archer_l2/l3, tower_mage_l2/l3/fire, tower_artillery_l2/l3, tower_barracks_l2/l3.
3. Do not change balance, Forest Gate (100,375), or bannerY.
4. Keep version 1.0.69.

VERIFY
- node --check public/src/krc-art.js
- node --check public/src/game.js
- bash scripts/smoke-static.sh
- No ReferenceError during bake.
