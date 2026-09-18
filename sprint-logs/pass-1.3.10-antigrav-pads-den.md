KRC v1.3.10 antigrav: pads closer to the road + wolf den helper.
Work in THIS repo (kingdom-rush-clone-antigrav). IN ORDER.
node --check public/src/game-data.js public/src/game.js public/src/krc-art.js after each cluster.
No version bump. No { x: 100, y: 375 }. No bannerY=98. No bounty 0.55.
FORBIDDEN: drawScout/drawBrute/drawFlyer/drawTitan.

Helpers: poly/linGrad/radGrad/ellipse/rounded/shadow/speckles. KEEP existing make sizes except NEW keys below.

A) PADS — only public/src/game-data.js
PATH_WIDTH is 46. Target pad-to-path-segment distance 50-64px (near the lane, NOT on it, NOT 80+ away).
Keep exactly 8 pads per map. Min 56px between pads. Stay in x 28-392, y 92-575.

LIVE Forest Gate pads (FAR = too far):
(42,214)ok (180,152)ok (326,176)FAR88 (188,296)ok (326,394)FAR76 (60,424)ok (216,450)ok (250,575)ok
LIVE Stone Pass FAR: (212,172)77 (322,218)112 (84,424)74 (176,512)120
LIVE Ember FAR: (142,518)77
LIVE Gale FAR: (318,220)125 (168,520)121
LIVE Ash FAR: (198,188)89 (312,248)99 (156,532)123
Nudge ONLY FAR pads. Leave ok pads unchanged.

B) WOLF DEN — new nature barracks
1. krc-art.js NEW:
   make("den_wolf", 56, 48, ...)  stone den + wolf silhouette, fat #141008
   make("unit_wolf", 48, 40, ...)  wolf side-view, readable at ~40px
2. game.js: after createPads, spawn 1 den per map using nearestPathPoint offset ~56px, not on a pad.
   Click den (pointer on image): if gold>=40, spend 40, call a new spawnWolf(den) copied from LIVE spawnSoldier:

LIVE spawnSoldier:
    spawnSoldier(tower) {
      this.flashTowerFirePose(tower, 140);
      const point = { x: tower.rallyX, y: tower.rallyY };
      ...
      soldier.sprite = this.add.image(soldier.x, soldier.y - 6, "soldier_guard").setScale(0.98).setDepth(44);
      ...
      this.soldiers.push(soldier);
    }

spawnWolf must: entityRegistry.create("soldier", ...), sprite key "unit_wolf", push to this.soldiers so findBlockingSoldier works.
homeX/homeY = nearestPathPoint(den.x, den.y). Max 2 wolves per den. No flashTowerFirePose on den.
Use this.add.image + this.input.on existing pointer patterns. No new Phaser plugins. No CONFIG. No renderSetPiece.

3. If gold < 40, this.say("Need 40 gold.") like buildTower.

HARD: do not change campaign nodes or bannerY. Do not rewrite titan/scout/brute/flyer.
