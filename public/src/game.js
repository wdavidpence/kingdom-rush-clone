(() => {
  const W = 420;
  const H = 760;
  const TOP_H = 62;
  const SHOP_Y = 642;
  const SHOP_H = 118;
  const PATH_WIDTH = 46;

  const COLORS = {
    grass: 0x273c1f,
    grass2: 0x314b27,
    road: 0x8a6a45,
    roadEdge: 0x4c3424,
    panel: 0x1b2417,
    panel2: 0x26351d,
    ink: "#f8f0d8",
    gold: "#f5c85a",
    red: "#e66550",
    green: "#77d75d",
    blue: "#65b7ff",
  };

  const PATH = [
    { x: -18, y: 126 },
    { x: 80, y: 126 },
    { x: 104, y: 222 },
    { x: 250, y: 222 },
    { x: 292, y: 326 },
    { x: 132, y: 372 },
    { x: 106, y: 488 },
    { x: 276, y: 520 },
    { x: 434, y: 596 },
  ];

  const BUILD_PADS = [
    { x: 68, y: 214 },
    { x: 180, y: 152 },
    { x: 326, y: 176 },
    { x: 202, y: 310 },
    { x: 326, y: 394 },
    { x: 74, y: 438 },
    { x: 194, y: 488 },
    { x: 328, y: 560 },
  ];

  const TOWERS = {
    archer: {
      id: "archer",
      name: "Rangers",
      glyph: "A",
      cost: 70,
      upgrades: [55, 100],
      damage: [18, 27, 39],
      rate: [0.62, 0.53, 0.46],
      range: [106, 120, 132],
      color: 0x78d66b,
      desc: "Fast arrows. Good vs flyers.",
    },
    mage: {
      id: "mage",
      name: "Runes",
      glyph: "M",
      cost: 95,
      upgrades: [75, 130],
      damage: [34, 49, 68],
      rate: [1.05, 0.93, 0.84],
      range: [104, 116, 128],
      color: 0x7d75ff,
      magic: true,
      slow: [0.12, 0.18, 0.25],
      desc: "Ignores armor and slows.",
    },
    artillery: {
      id: "artillery",
      name: "Mortar",
      glyph: "B",
      cost: 145,
      upgrades: [95, 170],
      damage: [55, 76, 104],
      rate: [1.75, 1.55, 1.35],
      range: [128, 145, 160],
      color: 0xe29b4a,
      splash: [42, 52, 64],
      desc: "Slow splash damage.",
    },
    barracks: {
      id: "barracks",
      name: "Guard",
      glyph: "G",
      cost: 120,
      upgrades: [80, 150],
      damage: [10, 15, 22],
      rate: [0.7, 0.62, 0.55],
      range: [70, 82, 92],
      color: 0xd8c56a,
      soldierHp: [90, 130, 180],
      desc: "Blocks the road.",
    },
  };

  const ENEMIES = {
    scout: { name: "Scout", hp: 54, speed: 50, armor: 0, bounty: 7, leak: 1, color: 0xbfe769, size: 15 },
    brute: { name: "Brute", hp: 142, speed: 42, armor: 3, bounty: 13, leak: 1, color: 0xe4a25d, size: 18 },
    shield: { name: "Shield", hp: 230, speed: 34, armor: 6, bounty: 19, leak: 2, color: 0xb7bfca, size: 20 },
    ember: { name: "Ember", hp: 118, speed: 50, armor: 1, bounty: 15, leak: 1, color: 0xe86240, size: 17, burn: true },
    flyer: { name: "Wisp", hp: 104, speed: 72, armor: 0, bounty: 14, leak: 1, color: 0x73d9ff, size: 15, flying: true },
    titan: { name: "Titan", hp: 520, speed: 26, armor: 8, bounty: 45, leak: 4, color: 0x8e8379, size: 24 },
    boss: { name: "Warden", hp: 1120, speed: 22, armor: 7, bounty: 120, leak: 8, color: 0xcd65e6, size: 30 },
  };

  const WAVES = [
    { label: "Scouts", gold: 18, spawn: 0.82, packs: [["scout", 12]] },
    { label: "Raiders", gold: 20, spawn: 0.64, packs: [["scout", 16], ["brute", 5]] },
    { label: "Armor", gold: 24, spawn: 0.7, packs: [["brute", 10], ["shield", 3], ["scout", 8]] },
    { label: "Fireline", gold: 28, spawn: 0.62, packs: [["ember", 8], ["scout", 12], ["shield", 4]] },
    { label: "Skybreak", gold: 30, spawn: 0.68, packs: [["flyer", 8], ["brute", 10], ["shield", 5]] },
    { label: "Crush", gold: 36, spawn: 0.62, packs: [["shield", 10], ["ember", 8], ["brute", 8]] },
    { label: "Storm", gold: 38, spawn: 0.56, packs: [["flyer", 10], ["scout", 18], ["brute", 8]] },
    { label: "Titanfall", gold: 44, spawn: 0.68, packs: [["titan", 3], ["shield", 8], ["ember", 8]] },
    { label: "Last Gate", gold: 50, spawn: 0.52, packs: [["scout", 16], ["flyer", 8], ["brute", 10], ["titan", 2]] },
    { label: "Warden", gold: 0, spawn: 0.62, packs: [["boss", 1], ["titan", 4], ["flyer", 8], ["shield", 8]] },
  ];

  class GameScene extends Phaser.Scene {
    constructor() {
      super("game");
    }

    create() {
      this.gold = 260;
      this.lives = 18;
      this.waveIndex = 0;
      this.waveActive = false;
      this.queue = [];
      this.spawnTimer = 0;
      this.enemies = [];
      this.towers = [];
      this.soldiers = [];
      this.projectiles = [];
      this.effects = [];
      this.selectedPad = null;
      this.selectedBuild = null;
      this.messageTimer = 0;
      this.gameEnded = false;
      this.overlayActive = true;
      this.audio = new SoundBox();
      this.spells = {
        meteor: { name: "Meteor", ready: 0, cooldown: 24 },
        frost: { name: "Frost", ready: 0, cooldown: 22 },
        rally: { name: "Rally", ready: 0, cooldown: 28 },
      };

      this.makeTextures();
      this.drawMap();
      this.createPads();
      this.createHud();
      this.createShop();
      this.showStartOverlay();
      this.input.on("pointerdown", this.handlePointer, this);
    }

    update(_time, deltaMs) {
      if (this.gameEnded) return;
      const dt = Math.min(0.05, deltaMs / 1000);
      this.updateMessages(dt);
      this.updateSpells(dt);
      this.updateWave(dt);
      this.updateEnemies(dt);
      this.updateSoldiers(dt);
      this.updateTowers(dt);
      this.updateProjectiles(dt);
      this.updateEffects(dt);
      this.audio.music(dt, this.waveActive && !this.gameEnded);
      this.updateHud();
    }

    makeTextures() {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(18, 18, 16);
      g.lineStyle(3, 0x000000, 0.2);
      g.strokeCircle(18, 18, 15);
      g.generateTexture("enemy_base", 36, 36);
      g.clear();
      g.fillStyle(0xffffff, 1);
      g.fillRect(15, 2, 6, 30);
      g.fillTriangle(18, 0, 4, 20, 32, 20);
      g.generateTexture("tower_base", 36, 36);
      g.clear();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture("orb", 16, 16);
      g.destroy();
    }

    drawMap() {
      this.add.rectangle(W / 2, H / 2, W, H, COLORS.grass).setDepth(-20);
      for (let i = 0; i < 80; i += 1) {
        const x = (i * 73) % W;
        const y = 76 + ((i * 47) % 545);
        const c = i % 2 ? 0x38542d : 0x20371b;
        this.add.rectangle(x, y, 24 + (i % 4) * 9, 4, c, 0.28).setAngle((i * 19) % 180).setDepth(-19);
      }

      const edge = this.add.graphics().setDepth(-10);
      edge.lineStyle(PATH_WIDTH + 14, COLORS.roadEdge, 1);
      this.strokePath(edge);
      const road = this.add.graphics().setDepth(-9);
      road.lineStyle(PATH_WIDTH, COLORS.road, 1);
      this.strokePath(road);
      const center = this.add.graphics().setDepth(-8);
      center.lineStyle(2, 0xb9905d, 0.5);
      this.strokePath(center);

      this.add.text(12, 83, "IN", { font: "bold 12px Arial", color: "#24170e" }).setDepth(-7);
      this.add.text(367, 585, "GATE", { font: "bold 12px Arial", color: "#24170e" }).setDepth(-7);
    }

    strokePath(graphics) {
      graphics.beginPath();
      graphics.moveTo(PATH[0].x, PATH[0].y);
      for (let i = 1; i < PATH.length; i += 1) graphics.lineTo(PATH[i].x, PATH[i].y);
      graphics.strokePath();
    }

    createPads() {
      for (const pad of BUILD_PADS) {
        pad.tower = null;
        pad.base = this.add.circle(pad.x, pad.y, 25, 0x1a2215, 0.95).setStrokeStyle(3, 0xb19b58, 0.9);
        pad.icon = this.add.text(pad.x, pad.y - 1, "+", { font: "bold 26px Arial", color: "#e8dca8" }).setOrigin(0.5);
      }
    }

    createHud() {
      this.add.rectangle(W / 2, TOP_H / 2, W, TOP_H, 0x131b12, 0.96).setDepth(90);
      this.add.rectangle(W / 2, TOP_H, W, 2, 0x596f38).setDepth(91);
      this.goldText = this.add.text(12, 10, "", { font: "bold 18px Arial", color: COLORS.gold }).setDepth(100);
      this.livesText = this.add.text(138, 10, "", { font: "bold 18px Arial", color: "#ff8a73" }).setDepth(100);
      this.waveText = this.add.text(252, 10, "", { font: "bold 18px Arial", color: COLORS.ink }).setDepth(100);
      this.messageText = this.add
        .text(12, 42, "", { font: "bold 12px Arial", color: "#f8f0d8", wordWrap: { width: 250 } })
        .setOrigin(0, 0.5)
        .setDepth(100);
      this.callButton = this.makeButton(334, 39, 72, 30, "CALL", 0x7a4f25, () => this.callWave());
    }

    createShop() {
      this.add.rectangle(W / 2, SHOP_Y + SHOP_H / 2, W, SHOP_H, COLORS.panel, 0.98).setDepth(90);
      this.add.rectangle(W / 2, SHOP_Y, W, 2, 0x596f38).setDepth(91);
      this.shopButtons = [];
      const types = Object.values(TOWERS);
      for (let i = 0; i < types.length; i += 1) {
        const t = types[i];
        const x = 48 + i * 81;
        const b = this.makeButton(x, SHOP_Y + 33, 72, 54, `${t.glyph}\n${t.cost}`, t.color, () => this.chooseBuild(t.id));
        b.type = t.id;
        this.shopButtons.push(b);
      }
      this.upgradeButton = this.makeButton(370, SHOP_Y + 33, 84, 54, "UP\n-", 0x55743c, () => this.upgradeSelected());
      this.sellButton = this.makeButton(370, SHOP_Y + 88, 84, 32, "SELL", 0x643a31, () => this.sellSelected());
      this.spellButtons = [];
      const spellDefs = [
        ["meteor", 56, "MET"],
        ["frost", 153, "ICE"],
        ["rally", 250, "RLY"],
      ];
      for (const [id, x, label] of spellDefs) {
        const btn = this.makeButton(x, SHOP_Y + 91, 86, 32, label, 0x334f6b, () => this.castSpell(id));
        btn.spell = id;
        this.spellButtons.push(btn);
      }
      this.infoText = this.add
        .text(12, SHOP_Y + 61, "Tap a tower type, then tap a build pad.", {
          font: "12px Arial",
          color: "#d9d0ae",
          wordWrap: { width: 330 },
        })
        .setDepth(100);
    }

    makeButton(x, y, w, h, label, color, cb) {
      const bg = this.add.rectangle(x, y, w, h, color, 0.95).setStrokeStyle(2, 0x0e120c, 0.9).setDepth(100);
      const text = this.add
        .text(x, y, label, { font: "bold 13px Arial", color: "#fff4d8", align: "center" })
        .setOrigin(0.5)
        .setDepth(101);
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => {
        this.audio.resume();
        cb();
      });
      return { bg, text, x, y, w, h, label, color, setLabel: (value) => text.setText(value) };
    }

    showStartOverlay() {
      this.overlay = this.add.container(0, 0).setDepth(500);
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.88));
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive();
      this.overlay.add(blocker);
      this.overlay.add(this.add.text(W / 2, 172, "KRC", { font: "bold 64px Arial", color: COLORS.gold }).setOrigin(0.5));
      this.overlay.add(
        this.add
          .text(W / 2, 236, "Hold the forest gate through ten waves.", {
            font: "18px Arial",
            color: COLORS.ink,
            align: "center",
            wordWrap: { width: 310 },
          })
          .setOrigin(0.5)
      );
      this.overlay.add(
        this.add
          .text(W / 2, 314, "Build on round pads. Upgrade smart. Use spells when the gate is about to break.", {
            font: "14px Arial",
            color: "#cfc4a2",
            align: "center",
            wordWrap: { width: 320 },
          })
          .setOrigin(0.5)
      );
      const start = this.add.rectangle(W / 2, 430, 188, 56, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282);
      const startText = this.add.text(W / 2, 430, "TAP TO START", { font: "bold 19px Arial", color: "#fff7dc" }).setOrigin(0.5);
      start.setInteractive({ useHandCursor: true });
      start.on("pointerdown", () => {
        this.audio.resume();
        this.overlayActive = false;
        this.overlay.destroy();
        this.say("Build two towers, then tap CALL.");
      });
      this.overlay.add([start, startText]);
    }

    handlePointer(pointer, targets) {
      if (this.overlayActive || this.gameEnded) return;
      if (targets.length && !this.selectedBuild) return;
      if (pointer.y < TOP_H || pointer.y > SHOP_Y) return;
      let closest = null;
      let best = 999;
      for (const pad of BUILD_PADS) {
        const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, pad.x, pad.y);
        if (d < best) {
          best = d;
          closest = pad;
        }
      }
      if (!closest || best > 34) {
        this.clearSelection();
        return;
      }
      if (this.selectedBuild && !closest.tower) {
        this.buildTower(closest, this.selectedBuild);
        return;
      }
      this.selectPad(closest);
    }

    chooseBuild(id) {
      if (this.overlayActive || this.gameEnded) return;
      this.selectedBuild = this.selectedBuild === id ? null : id;
      this.selectedPad = null;
      const cfg = TOWERS[id];
      this.say(this.selectedBuild ? `${cfg.name}: ${cfg.desc}` : "Build selection cleared.");
      this.refreshSelection();
    }

    selectPad(pad) {
      this.selectedPad = pad;
      this.selectedBuild = null;
      this.refreshSelection();
      if (pad.tower) {
        const cfg = TOWERS[pad.tower.type];
        this.say(`${cfg.name} level ${pad.tower.level + 1}. Upgrade or sell.`);
      } else {
        this.say("Empty build pad. Choose a tower below.");
      }
    }

    clearSelection() {
      this.selectedPad = null;
      this.selectedBuild = null;
      this.refreshSelection();
    }

    refreshSelection() {
      for (const pad of BUILD_PADS) {
        const active = pad === this.selectedPad;
        pad.base.setStrokeStyle(active ? 4 : 3, active ? 0xf5d76e : 0xb19b58, 1);
      }
      for (const b of this.shopButtons) {
        b.bg.setStrokeStyle(this.selectedBuild === b.type ? 4 : 2, this.selectedBuild === b.type ? 0xffffff : 0x0e120c);
      }
      this.updateUpgradeLabel();
    }

    buildTower(pad, type) {
      const cfg = TOWERS[type];
      if (this.gold < cfg.cost) {
        this.say(`Need ${cfg.cost} gold.`);
        this.audio.tone(110, 0.08, "sawtooth", 0.05);
        return;
      }
      this.gold -= cfg.cost;
      pad.icon.setText("");
      const tower = {
        type,
        level: 0,
        x: pad.x,
        y: pad.y,
        cooldown: 0.2,
        pad,
        soldiers: [],
      };
      pad.tower = tower;
      tower.sprite = this.add.image(pad.x, pad.y - 4, "tower_base").setTint(cfg.color).setScale(1.08).setDepth(30);
      tower.label = this.add.text(pad.x, pad.y + 1, cfg.glyph, { font: "bold 16px Arial", color: "#15180e" }).setOrigin(0.5).setDepth(31);
      tower.rangeRing = this.add.circle(pad.x, pad.y, cfg.range[0], cfg.color, 0.08).setStrokeStyle(1, cfg.color, 0.22).setDepth(20).setVisible(false);
      this.towers.push(tower);
      this.audio.tone(440, 0.06, "triangle", 0.04);
      this.selectedPad = pad;
      this.selectedBuild = null;
      this.refreshSelection();
      this.say(`${cfg.name} built.`);
    }

    upgradeSelected() {
      if (this.overlayActive || this.gameEnded) return;
      const tower = this.selectedPad?.tower;
      if (!tower) {
        this.say("Select a built tower first.");
        return;
      }
      const cfg = TOWERS[tower.type];
      if (tower.level >= 2) {
        this.say("Tower is fully upgraded.");
        return;
      }
      const cost = cfg.upgrades[tower.level];
      if (this.gold < cost) {
        this.say(`Need ${cost} gold to upgrade.`);
        return;
      }
      this.gold -= cost;
      tower.level += 1;
      tower.sprite.setScale(1.08 + tower.level * 0.16);
      tower.rangeRing.setRadius(cfg.range[tower.level]);
      this.audio.tone(620, 0.09, "triangle", 0.05);
      this.say(`${cfg.name} upgraded to level ${tower.level + 1}.`);
      this.updateUpgradeLabel();
    }

    sellSelected() {
      if (this.overlayActive || this.gameEnded) return;
      const tower = this.selectedPad?.tower;
      if (!tower) return;
      const cfg = TOWERS[tower.type];
      const spent = cfg.cost + cfg.upgrades.slice(0, tower.level).reduce((a, b) => a + b, 0);
      this.gold += Math.floor(spent * 0.55);
      tower.sprite.destroy();
      tower.label.destroy();
      tower.rangeRing.destroy();
      for (const s of tower.soldiers) this.killSoldier(s);
      this.towers = this.towers.filter((t) => t !== tower);
      this.selectedPad.tower = null;
      this.selectedPad.icon.setText("+");
      this.say("Tower sold.");
      this.refreshSelection();
    }

    updateUpgradeLabel() {
      const tower = this.selectedPad?.tower;
      if (!tower) {
        this.upgradeButton.setLabel("UP\n-");
        for (const t of this.towers) t.rangeRing.setVisible(false);
        return;
      }
      const cfg = TOWERS[tower.type];
      this.upgradeButton.setLabel(tower.level >= 2 ? "MAX" : `UP\n${cfg.upgrades[tower.level]}`);
      tower.rangeRing.setVisible(true);
      for (const t of this.towers) if (t !== tower) t.rangeRing.setVisible(false);
    }

    callWave() {
      if (this.overlayActive || this.gameEnded) return;
      if (this.waveIndex === 0 && this.towers.length < 2) {
        this.say("Build at least two towers before the first wave.");
        return;
      }
      if (this.waveActive) {
        this.say("Wave is already marching.");
        return;
      }
      if (this.waveIndex >= WAVES.length) return;
      const wave = WAVES[this.waveIndex];
      this.gold += wave.gold;
      this.queue = [];
      for (const [type, count] of wave.packs) {
        for (let i = 0; i < count; i += 1) this.queue.push(type);
      }
      this.waveActive = true;
      this.spawnTimer = 0.1;
      this.audio.tone(260, 0.06, "square", 0.035);
      this.audio.tone(390, 0.08, "square", 0.03, 0.07);
      this.say(`Wave ${this.waveIndex + 1}: ${wave.label}`);
    }

    updateWave(dt) {
      if (!this.waveActive) return;
      this.spawnTimer -= dt;
      const wave = WAVES[this.waveIndex];
      if (this.queue.length && this.spawnTimer <= 0) {
        this.spawnEnemy(this.queue.shift());
        this.spawnTimer = wave.spawn;
      }
      if (!this.queue.length && this.enemies.length === 0) {
        this.waveActive = false;
        this.waveIndex += 1;
        if (this.waveIndex >= WAVES.length) {
          this.endGame(true);
        } else {
          this.gold += 35 + this.waveIndex * 8;
          this.say(`Wave cleared. Prepare for ${WAVES[this.waveIndex].label}.`);
        }
      }
    }

    spawnEnemy(type) {
      const base = ENEMIES[type];
      const scale = 1 + this.waveIndex * 0.08;
      const start = PATH[0];
      const enemy = {
        type,
        base,
        x: start.x,
        y: start.y,
        seg: 0,
        hp: Math.round(base.hp * scale),
        maxHp: Math.round(base.hp * scale),
        speed: base.speed * (1 + this.waveIndex * 0.015),
        slow: 0,
        blockedBy: null,
        dead: false,
      };
      enemy.sprite = this.add.image(enemy.x, enemy.y, "enemy_base").setTint(base.color).setScale(base.size / 18).setDepth(40);
      enemy.nameText = this.add.text(enemy.x, enemy.y + 1, base.flying ? "F" : "", { font: "bold 10px Arial", color: "#102030" }).setOrigin(0.5).setDepth(41);
      enemy.barBg = this.add.rectangle(enemy.x, enemy.y - base.size - 8, 28, 4, 0x2a120e).setDepth(42);
      enemy.bar = this.add.rectangle(enemy.x - 14, enemy.y - base.size - 8, 28, 4, 0x68d764).setOrigin(0, 0.5).setDepth(43);
      this.enemies.push(enemy);
    }

    updateEnemies(dt) {
      for (const enemy of [...this.enemies]) {
        if (enemy.dead) continue;
        enemy.slow = Math.max(0, enemy.slow - dt);
        if (!enemy.blockedBy || enemy.blockedBy.dead) {
          enemy.blockedBy = this.findBlockingSoldier(enemy);
        }
        if (enemy.blockedBy) {
          this.enemyMelee(enemy, enemy.blockedBy, dt);
        } else {
          this.moveEnemy(enemy, dt);
        }
        this.updateEnemyVisual(enemy);
        if (enemy.seg >= PATH.length - 1) this.leakEnemy(enemy);
      }
    }

    moveEnemy(enemy, dt) {
      let speed = enemy.speed * (enemy.slow > 0 ? 0.58 : 1);
      if (enemy.hp < enemy.maxHp * 0.3 && enemy.type === "brute") speed *= 1.18;
      let remaining = speed * dt;
      while (remaining > 0 && enemy.seg < PATH.length - 1) {
        const target = PATH[enemy.seg + 1];
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);
        if (dist <= remaining) {
          enemy.x = target.x;
          enemy.y = target.y;
          enemy.seg += 1;
          remaining -= dist;
        } else {
          enemy.x += ((target.x - enemy.x) / dist) * remaining;
          enemy.y += ((target.y - enemy.y) / dist) * remaining;
          remaining = 0;
        }
      }
    }

    updateEnemyVisual(enemy) {
      enemy.sprite.setPosition(enemy.x, enemy.y);
      enemy.nameText.setPosition(enemy.x, enemy.y + 1);
      enemy.sprite.setAlpha(enemy.slow > 0 ? 0.72 : 1);
      enemy.barBg.setPosition(enemy.x, enemy.y - enemy.base.size - 8);
      enemy.bar.setPosition(enemy.x - 14, enemy.y - enemy.base.size - 8);
      enemy.bar.width = Math.max(1, 28 * (enemy.hp / enemy.maxHp));
    }

    leakEnemy(enemy) {
      this.lives -= enemy.base.leak;
      this.audio.tone(90, 0.12, "sawtooth", 0.05);
      this.removeEnemy(enemy, false);
      this.flashText("-" + enemy.base.leak, 360, 88, "#ff8069");
      if (this.lives <= 0) this.endGame(false);
    }

    damageEnemy(enemy, amount, source = {}) {
      if (enemy.dead) return;
      let damage = amount;
      if (!source.magic) damage = Math.max(1, amount - enemy.base.armor * 3);
      if (enemy.type === "titan" || enemy.type === "boss") damage *= 0.86;
      enemy.hp -= damage;
      if (source.slow) enemy.slow = Math.max(enemy.slow, 1.2 + source.slow * 2);
      if (enemy.hp <= 0) {
        this.gold += enemy.base.bounty;
        this.flashText(`+${enemy.base.bounty}`, enemy.x, enemy.y - 22, COLORS.gold);
        if (enemy.base.burn) this.explode(enemy.x, enemy.y, 38, 24, true);
        this.removeEnemy(enemy, true);
      }
    }

    removeEnemy(enemy, killed) {
      enemy.dead = true;
      for (const obj of [enemy.sprite, enemy.nameText, enemy.barBg, enemy.bar]) obj.destroy();
      this.enemies = this.enemies.filter((e) => e !== enemy);
      if (killed) {
        this.audio.tone(180 + Math.random() * 60, 0.05, "triangle", 0.025);
        this.puff(enemy.x, enemy.y, enemy.base.color);
      }
    }

    updateTowers(dt) {
      for (const tower of this.towers) {
        const cfg = TOWERS[tower.type];
        if (tower.type === "barracks") {
          this.updateBarracks(tower, dt);
          continue;
        }
        tower.cooldown -= dt * (this.rallyTime > 0 ? 1.28 : 1);
        if (tower.cooldown > 0) continue;
        const target = this.findTarget(tower, cfg.range[tower.level], tower.type === "archer");
        if (!target) continue;
        tower.cooldown = cfg.rate[tower.level];
        this.fireTower(tower, target);
      }
      this.rallyTime = Math.max(0, (this.rallyTime || 0) - dt);
    }

    findTarget(tower, range, canHitFlying = true) {
      let best = null;
      let bestProgress = -1;
      for (const enemy of this.enemies) {
        if (enemy.base.flying && !canHitFlying && tower.type === "artillery") continue;
        const d = Phaser.Math.Distance.Between(tower.x, tower.y, enemy.x, enemy.y);
        if (d <= range) {
          const progress = enemy.seg * 1000 + enemy.x + enemy.y;
          if (progress > bestProgress) {
            best = enemy;
            bestProgress = progress;
          }
        }
      }
      return best;
    }

    fireTower(tower, target) {
      const cfg = TOWERS[tower.type];
      const level = tower.level;
      const color = cfg.color;
      const projectile = {
        x: tower.x,
        y: tower.y - 10,
        target,
        tower,
        speed: tower.type === "artillery" ? 250 : 430,
        damage: cfg.damage[level],
        magic: !!cfg.magic,
        slow: cfg.slow?.[level] || 0,
        splash: cfg.splash?.[level] || 0,
      };
      projectile.sprite = this.add.image(projectile.x, projectile.y, "orb").setTint(color).setDepth(60);
      projectile.sprite.setScale(tower.type === "artillery" ? 1.25 : 0.8);
      this.projectiles.push(projectile);
      this.audio.tone(tower.type === "artillery" ? 150 : tower.type === "mage" ? 520 : 680, 0.035, "square", 0.012);
    }

    updateProjectiles(dt) {
      for (const p of [...this.projectiles]) {
        if (!p.target || p.target.dead) {
          this.removeProjectile(p);
          continue;
        }
        const d = Phaser.Math.Distance.Between(p.x, p.y, p.target.x, p.target.y);
        const step = p.speed * dt;
        if (d <= step || d < 8) {
          if (p.splash) this.explode(p.target.x, p.target.y, p.splash, p.damage, false);
          else this.damageEnemy(p.target, p.damage, { magic: p.magic, slow: p.slow });
          this.removeProjectile(p);
        } else {
          p.x += ((p.target.x - p.x) / d) * step;
          p.y += ((p.target.y - p.y) / d) * step;
          p.sprite.setPosition(p.x, p.y);
        }
      }
    }

    removeProjectile(p) {
      p.sprite.destroy();
      this.projectiles = this.projectiles.filter((x) => x !== p);
    }

    explode(x, y, radius, damage, fire) {
      const ring = this.add.circle(x, y, radius, fire ? 0xff623d : 0xf2b24d, 0.22).setStrokeStyle(2, fire ? 0xffd07a : 0xffefb2).setDepth(55);
      this.tweens.add({ targets: ring, alpha: 0, scale: 1.2, duration: 250, onComplete: () => ring.destroy() });
      for (const enemy of [...this.enemies]) {
        if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
          this.damageEnemy(enemy, damage, { magic: fire });
        }
      }
      this.audio.tone(120, 0.07, "sawtooth", 0.035);
    }

    updateBarracks(tower, dt) {
      const cfg = TOWERS.barracks;
      tower.cooldown -= dt;
      const alive = tower.soldiers.filter((s) => !s.dead);
      tower.soldiers = alive;
      const wanted = tower.level >= 2 ? 2 : 1;
      if (alive.length < wanted && tower.cooldown <= 0) {
        tower.cooldown = tower.level >= 1 ? 6.0 : 7.5;
        this.spawnSoldier(tower);
      }
      for (const soldier of alive) {
        soldier.attackCooldown -= dt;
        const target = this.findEnemyNear(soldier.x, soldier.y, cfg.range[tower.level] * 0.55, false);
        if (target) {
          soldier.target = target;
          if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = cfg.rate[tower.level];
            this.damageEnemy(target, cfg.damage[tower.level], {});
            this.audio.tone(260, 0.025, "square", 0.012);
          }
        }
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + 2 * dt);
        soldier.sprite.setPosition(soldier.x, soldier.y);
        soldier.bar.width = Math.max(1, 20 * (soldier.hp / soldier.maxHp));
        soldier.bar.setPosition(soldier.x - 10, soldier.y - 17);
      }
    }

    spawnSoldier(tower) {
      const point = this.nearestPathPoint(tower.x, tower.y);
      const maxHp = TOWERS.barracks.soldierHp[tower.level];
      const soldier = {
        x: point.x,
        y: point.y,
        hp: maxHp,
        maxHp,
        tower,
        attackCooldown: 0.2,
        dead: false,
      };
      soldier.sprite = this.add.circle(soldier.x, soldier.y, 10, 0xf0df8a, 1).setStrokeStyle(2, 0x4a3b22).setDepth(44);
      soldier.bar = this.add.rectangle(soldier.x - 10, soldier.y - 17, 20, 3, 0x7ee06a).setOrigin(0, 0.5).setDepth(45);
      tower.soldiers.push(soldier);
      this.soldiers.push(soldier);
    }

    nearestPathPoint(x, y) {
      let best = PATH[1];
      let bestD = Infinity;
      for (let i = 0; i < PATH.length - 1; i += 1) {
        const p = closestPointOnSegment({ x, y }, PATH[i], PATH[i + 1]);
        const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
        if (d < bestD) {
          best = p;
          bestD = d;
        }
      }
      return best;
    }

    findBlockingSoldier(enemy) {
      if (enemy.base.flying) return null;
      for (const s of this.soldiers) {
        if (!s.dead && Phaser.Math.Distance.Between(enemy.x, enemy.y, s.x, s.y) < enemy.base.size + 12) return s;
      }
      return null;
    }

    enemyMelee(enemy, soldier, dt) {
      soldier.hp -= (enemy.type === "boss" ? 34 : enemy.type === "titan" ? 18 : 8) * dt;
      if (soldier.hp <= 0) this.killSoldier(soldier);
    }

    killSoldier(soldier) {
      soldier.dead = true;
      soldier.sprite.destroy();
      soldier.bar.destroy();
      this.soldiers = this.soldiers.filter((s) => s !== soldier);
      soldier.tower.soldiers = soldier.tower.soldiers.filter((s) => s !== soldier);
    }

    updateSoldiers() {}

    findEnemyNear(x, y, range, includeFlying = true) {
      let best = null;
      let bestD = Infinity;
      for (const enemy of this.enemies) {
        if (!includeFlying && enemy.base.flying) continue;
        const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        if (d < range && d < bestD) {
          best = enemy;
          bestD = d;
        }
      }
      return best;
    }

    castSpell(id) {
      if (this.overlayActive || this.gameEnded) return;
      const spell = this.spells[id];
      if (spell.ready > 0) {
        this.say(`${spell.name} ready in ${Math.ceil(spell.ready)}s.`);
        return;
      }
      if (id === "meteor") {
        const target = this.enemies.reduce((best, e) => (!best || e.hp > best.hp ? e : best), null);
        if (!target) {
          this.say("No target for Meteor.");
          return;
        }
        this.explode(target.x, target.y, 72, 270, true);
        this.flashText("METEOR", target.x, target.y - 50, "#ffd37a");
      }
      if (id === "frost") {
        for (const enemy of this.enemies) enemy.slow = Math.max(enemy.slow, 4.2);
        this.flashText("FROST", W / 2, 312, "#aee9ff");
        this.cameras.main.flash(140, 130, 210, 255, false);
      }
      if (id === "rally") {
        this.rallyTime = 7;
        this.flashText("RALLY", W / 2, 312, "#fff1a0");
      }
      spell.ready = spell.cooldown;
      this.audio.tone(id === "frost" ? 520 : id === "rally" ? 360 : 140, 0.16, "triangle", 0.05);
    }

    updateSpells(dt) {
      for (const spell of Object.values(this.spells)) spell.ready = Math.max(0, spell.ready - dt);
      for (const b of this.spellButtons || []) {
        const s = this.spells[b.spell];
        b.setLabel(s.ready > 0 ? `${b.label}\n${Math.ceil(s.ready)}` : b.label);
        b.bg.setAlpha(s.ready > 0 ? 0.55 : 1);
      }
    }

    puff(x, y, color) {
      for (let i = 0; i < 8; i += 1) {
        const p = this.add.circle(x, y, 2 + Math.random() * 3, color, 0.8).setDepth(80);
        this.effects.push({ obj: p, life: 0.36, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90 });
      }
    }

    updateEffects(dt) {
      for (const e of [...this.effects]) {
        e.life -= dt;
        e.obj.x += e.vx * dt;
        e.obj.y += e.vy * dt;
        e.obj.alpha = Math.max(0, e.life / 0.36);
        if (e.life <= 0) {
          e.obj.destroy();
          this.effects = this.effects.filter((x) => x !== e);
        }
      }
    }

    flashText(text, x, y, color) {
      const t = this.add.text(x, y, text, { font: "bold 15px Arial", color }).setOrigin(0.5).setDepth(200);
      this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 760, ease: "Quad.easeOut", onComplete: () => t.destroy() });
    }

    say(text) {
      this.messageText.setText(text);
      this.messageTimer = 2.8;
    }

    updateMessages(dt) {
      if (this.messageTimer > 0) {
        this.messageTimer -= dt;
        if (this.messageTimer <= 0) this.messageText.setText("");
      }
    }

    updateHud() {
      this.goldText.setText(`Gold ${this.gold}`);
      this.livesText.setText(`Lives ${Math.max(0, this.lives)}`);
      this.waveText.setText(`Wave ${Math.min(this.waveIndex + 1, WAVES.length)}/${WAVES.length}`);
      this.callButton.bg.setAlpha(this.waveActive || this.gameEnded ? 0.45 : 1);
      this.callButton.setLabel(this.waveActive ? "LIVE" : "CALL");
      this.infoText.setText(this.infoLine());
      for (const b of this.shopButtons) {
        const cfg = TOWERS[b.type];
        b.bg.setAlpha(this.gold >= cfg.cost || this.selectedBuild === b.type ? 1 : 0.48);
      }
    }

    infoLine() {
      if (this.selectedBuild) return `${TOWERS[this.selectedBuild].name}: ${TOWERS[this.selectedBuild].desc}`;
      if (this.selectedPad?.tower) {
        const tower = this.selectedPad.tower;
        const cfg = TOWERS[tower.type];
        return `${cfg.name} L${tower.level + 1}. ${tower.level < 2 ? `Upgrade ${cfg.upgrades[tower.level]}g.` : "Fully upgraded."}`;
      }
      if (this.waveActive) return `${this.queue.length} enemies queued. Defend the gate.`;
      return "Tap CALL for the next wave, or build and upgrade first.";
    }

    endGame(victory) {
      if (this.gameEnded) return;
      this.gameEnded = true;
      this.overlayActive = true;
      const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.88).setDepth(600);
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setDepth(600.5).setInteractive();
      const title = this.add
        .text(W / 2, 258, victory ? "VICTORY" : "GATE LOST", {
          font: "bold 44px Arial",
          color: victory ? COLORS.gold : "#ff7f69",
        })
        .setOrigin(0.5)
        .setDepth(601);
      const sub = this.add
        .text(W / 2, 326, victory ? "The forest road holds." : `You reached wave ${this.waveIndex + 1}.`, {
          font: "18px Arial",
          color: COLORS.ink,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(601);
      const btn = this.add.rectangle(W / 2, 420, 180, 54, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282).setDepth(601);
      const txt = this.add.text(W / 2, 420, "PLAY AGAIN", { font: "bold 18px Arial", color: "#fff7dc" }).setOrigin(0.5).setDepth(602);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.overlayActive = false;
        this.scene.restart();
      });
      this.audio.tone(victory ? 520 : 110, 0.2, victory ? "triangle" : "sawtooth", 0.05);
      return [shade, blocker, title, sub, btn, txt];
    }
  }

  class SoundBox {
    constructor() {
      this.ctx = null;
      this.musicClock = 0;
      this.musicStep = 0;
    }

    resume() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    }

    tone(freq, duration = 0.08, type = "square", volume = 0.025, delay = 0) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    music(dt, urgent) {
      if (!this.ctx) return;
      this.musicClock -= dt;
      if (this.musicClock > 0) return;
      const base = urgent ? 0.72 : 1.6;
      this.musicClock = base;
      const notes = urgent ? [146, 174, 196, 174] : [130, 164, 196, 164];
      const note = notes[this.musicStep % notes.length];
      this.musicStep += 1;
      this.tone(note, urgent ? 0.055 : 0.09, "triangle", urgent ? 0.012 : 0.007);
    }
  }

  function closestPointOnSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
    return { x: a.x + t * dx, y: a.y + t * dy };
  }

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: W,
    height: H,
    backgroundColor: "#273c1f",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
    scene: GameScene,
  };

  window.addEventListener("load", () => {
    new Phaser.Game(config);
  });
})();
