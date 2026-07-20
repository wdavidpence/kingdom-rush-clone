(() => {
  const { width: W, height: H, topHeight: TOP_H, shopY: SHOP_Y, shopHeight: SHOP_H, pathWidth: PATH_WIDTH, map: MAP_LAYOUT } = window.KRCLayout;
  const QA_MODE = new URLSearchParams(window.location.search).has("qa");

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

  const { maps: MAPS, towers: TOWERS, enemies: ENEMIES, waves: WAVES } = window.KRCGameData;

  class GameScene extends Phaser.Scene {
    constructor() {
      super("game");
    }

    init(data = {}) {
      this.startData = data;
    }

    preload() {
      const audioPath = "assets/kenney/audio/";
      const audioFiles = {
        shoot: "kenney-shoot.ogg",
        impact: "kenney-hit.ogg",
        boom: "kenney-explosion.ogg",
        start: "kenney-start.ogg",
        ready: "kenney-ready.ogg",
        fail: "kenney-gameover.ogg",
        magic: "kenney-alien-shot.ogg",
        music: "kenney-music.ogg",
      };
      for (const [key, file] of Object.entries(audioFiles)) {
        this.load.audio(`sfx_${key}`, `${audioPath}${file}`);
      }
    }

    create() {
      this.qaMode = QA_MODE;
      const requestedMap = QA_MODE ? Number(new URLSearchParams(window.location.search).get("map")) - 1 : NaN;
      this.mapIndex = Phaser.Math.Clamp(
        Number.isInteger(requestedMap) ? requestedMap : this.startData?.mapIndex || 0,
        0,
        MAPS.length - 1
      );
      this.map = MAPS[this.mapIndex];
      this.campaign = window.KRCCampaign.load(MAPS.length);
      this.path = this.map.path;
      this.buildPads = this.map.pads.map((pad) => ({ ...pad, tower: null }));
      this.gold = this.startData?.gold ?? 280;
      this.lives = this.startData?.lives ?? 20;
      this.waveIndex = 0;
      this.waveActive = false;
      this.waveTotal = 0;
      this.queue = [];
      this.spawnTimer = 0;
      this.enemies = [];
      this.towers = [];
      this.soldiers = [];
      this.projectiles = [];
      this.effects = [];
      this.entityRegistry = window.KRCEntityState.createRegistry();
      this.selectedPad = null;
      this.selectedBuild = null;
      this.messageTimer = 0;
      this.gameEnded = false;
      this.paused = false;
      this.overlayActive = true;
      this.audio = new SoundBox(this);
      this.events.once("shutdown", this.cleanupScene, this);
      this.settings = window.KRCSettings?.load?.() || { muted: false, reducedMotion: false };
      this.audio.setMuted(this.settings.muted);
      this.spells = {
        meteor: { name: "Meteor", ready: 0, cooldown: 24 },
        frost: { name: "Frost", ready: 0, cooldown: 22 },
        rally: { name: "Rally", ready: 0, cooldown: 28 },
      };
      this.heroAbilities = {
        charge: { name: "Charge", ready: 0, cooldown: 16 },
        banner: { name: "Banner", ready: 0, cooldown: 24 },
        heal: { name: "Heal", ready: 0, cooldown: 28 },
      };
      if (this.qaMode) {
        const startWave = Number(new URLSearchParams(window.location.search).get("startWave"));
        if (Number.isInteger(startWave) && startWave >= 1 && startWave <= WAVES.length) this.waveIndex = startWave - 1;
      }

      this.makeTextures();
      this.drawMap();
      this.createPads();
      this.createHero();
      this.createHud();
      this.createShop();
      this.showStartOverlay();
      this.input.on("pointerdown", this.handlePointer, this);
      this.input.keyboard?.on("keydown-P", () => this.togglePause());
      this.input.keyboard?.on("keydown-R", () => this.toggleReducedMotion());
      this.input.keyboard?.on("keydown-M", () => this.toggleMute());
      this.input.keyboard?.on("keydown-SPACE", (event) => {
        event?.preventDefault?.();
        this.callWave();
      });
      this.input.keyboard?.on("keydown-U", () => this.upgradeSelected());
      this.input.keyboard?.on("keydown-S", () => this.sellSelected());
      this.input.keyboard?.on("keydown-H", () => this.selectHero());
      this.input.keyboard?.on("keydown-ESC", () => {
        this.selectedPad = null;
        this.selectedBuild = null;
        this.heroSelected = false;
        this.setHeroPanel(false);
        this.refreshSelection();
      });
      this.input.keyboard?.on("keydown-ONE", () => this.chooseBuild("archer"));
      this.input.keyboard?.on("keydown-TWO", () => this.chooseBuild("mage"));
      this.input.keyboard?.on("keydown-THREE", () => this.chooseBuild("artillery"));
      this.input.keyboard?.on("keydown-FOUR", () => this.chooseBuild("barracks"));
      if (this.qaMode) {
        document.body.dataset.krcQa = "1";
        if (new URLSearchParams(window.location.search).has("emberTest")) {
          this.spawnEnemy("ember");
          const ember = this.enemies[this.enemies.length - 1];
          const goldBefore = this.gold;
          this.damageEnemy(ember, ember.maxHp + 999, { magic: true });
          document.body.dataset.krcEmberTest =
            this.enemies.length === 0 && this.gold === goldBefore + ENEMIES.ember.bounty ? "pass" : "fail";
        }
        if (new URLSearchParams(window.location.search).has("broodTest")) {
          this.spawnEnemy("brood");
          const brood = this.enemies[this.enemies.length - 1];
          const goldBefore = this.gold;
          this.damageEnemy(brood, brood.maxHp + 999, { magic: true });
          document.body.dataset.krcBroodTest =
            this.enemies.length === 2 && this.enemies.every((enemy) => enemy.type === "scout") && this.gold === goldBefore + ENEMIES.brood.bounty
              ? "pass"
              : "fail";
        }
      }
    }

    cleanupScene() {
      this.input.off("pointerdown", this.handlePointer, this);
      this.audio?.stopAll?.();
      window.KRCSceneCleanup.destroyAll((this.effects || []).map((effect) => effect.obj));
      this.effects = [];
      this.projectiles = [];
      this.enemies = [];
      this.soldiers = [];
      this.towers = [];
      this.queue = [];
    }

    update(_time, deltaMs) {
      if (this.gameEnded || this.paused) return;
      const dt = Math.min(0.05, deltaMs / 1000);
      this.updateMessages(dt);
      this.updateSpells(dt);
      this.updateWave(dt);
      this.updateEnemies(dt);
      this.updateSoldiers(dt);
      this.updateHero(dt);
      this.updateTowers(dt);
      this.updateProjectiles(dt);
      this.updateEffects(dt);
      this.audio.music(dt, this.waveActive && !this.gameEnded);
      this.updateHud();
    }

    makeTextures() {
      if (window.KRCArt?.bake) {
        window.KRCArt.bake(this);
        return;
      }
      const make = (key, w, h, draw) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        const texture = this.textures.createCanvas(key, w, h);
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h);
        texture.refresh();
      };
      make("tower_archer", 32, 32, (ctx) => { ctx.fillStyle = "#6fa546"; ctx.fillRect(4, 4, 24, 24); });
      make("tower_mage", 32, 32, (ctx) => { ctx.fillStyle = "#7867db"; ctx.fillRect(4, 4, 24, 24); });
      make("tower_artillery", 32, 32, (ctx) => { ctx.fillStyle = "#b87431"; ctx.fillRect(4, 4, 24, 24); });
      make("tower_barracks", 32, 32, (ctx) => { ctx.fillStyle = "#b99c43"; ctx.fillRect(4, 4, 24, 24); });
      ["scout","brute","shield","ember","brood","flyer","hexer","titan","boss"].forEach((k) => {
        make(`enemy_${k}`, 32, 32, (ctx) => { ctx.fillStyle = "#c0c0c0"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
      });
      make("projectile_arrow", 16, 8, (ctx) => { ctx.fillStyle = "#f8e8a0"; ctx.fillRect(0,2,16,4); });
      make("projectile_magic", 16, 16, (ctx) => { ctx.fillStyle = "#c8b0ff"; ctx.beginPath(); ctx.arc(8,8,6,0,Math.PI*2); ctx.fill(); });
      make("projectile_bomb", 16, 16, (ctx) => { ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(8,8,6,0,Math.PI*2); ctx.fill(); });
      make("soldier_guard", 32, 32, (ctx) => { ctx.fillStyle = "#d8c56a"; ctx.fillRect(8,8,16,20); });
      make("hero_captain", 32, 32, (ctx) => { ctx.fillStyle = "#3f6fb4"; ctx.fillRect(8,4,16,24); });
      make("tree_pine", 24, 32, (ctx) => { ctx.fillStyle = "#3a6a30"; ctx.fillRect(4,0,16,32); });
      make("rock_moss", 20, 14, (ctx) => { ctx.fillStyle = "#686c64"; ctx.fillRect(0,0,20,14); });
      make("pad_empty", 48, 32, (ctx) => { ctx.fillStyle = "#4a3c2a"; ctx.beginPath(); ctx.ellipse(24,16,20,10,0,0,Math.PI*2); ctx.fill(); });
      make("gate_arch", 64, 40, (ctx) => { ctx.fillStyle = "#5a4a38"; ctx.fillRect(0,0,64,40); });
      make("bush_round", 24, 18, (ctx) => { ctx.fillStyle = "#4a8030"; ctx.fillRect(0,0,24,18); });
      make("flower_patch", 20, 14, (ctx) => { ctx.fillStyle = "#f0d060"; ctx.fillRect(0,0,20,14); });
      make("tree_oak", 32, 32, (ctx) => { ctx.fillStyle = "#4a8030"; ctx.fillRect(0,0,32,32); });
      make("ruin_pillar", 20, 32, (ctx) => { ctx.fillStyle = "#8a8070"; ctx.fillRect(0,0,20,32); });
      make("banner_flag", 20, 32, (ctx) => { ctx.fillStyle = "#e07050"; ctx.fillRect(0,0,20,32); });
      make("cloud_soft", 48, 24, (ctx) => { ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(0,0,48,24); });
      make("path_mark", 16, 10, (ctx) => { ctx.fillStyle = "rgba(180,150,100,.35)"; ctx.fillRect(0,0,16,10); });
      make("icon_gold", 16, 16, (ctx) => { ctx.fillStyle = "#f5c85a"; ctx.fillRect(0,0,16,16); });
      make("icon_heart", 16, 16, (ctx) => { ctx.fillStyle = "#e66550"; ctx.fillRect(0,0,16,16); });
    }

    drawMap() {
      const grass = this.map.grass;
      const themes = [
        { accent: 0x3a5a2e, accent2: 0x1e3018, road: 0x9a7a4a, roadEdge: 0x4a3420, pathMid: 0xc4a06a, tint: 0xffffff, skyTop: 0x6a9ac8, skyBot: 0xb8d8a0 },
        { accent: 0x3a4a50, accent2: 0x1a282c, road: 0x8a9098, roadEdge: 0x3a4048, pathMid: 0xb0b8c0, tint: 0xc8d0d8, skyTop: 0x5a7088, skyBot: 0x90a8a0 },
        { accent: 0x4a3a20, accent2: 0x2a2410, road: 0xb07a42, roadEdge: 0x5a3a18, pathMid: 0xe0a060, tint: 0xe8c898, skyTop: 0xc07040, skyBot: 0xa08040 },
      ];
      const theme = themes[this.mapIndex] || themes[0];

      const sky = this.add.graphics().setDepth(-22);
      sky.fillGradientStyle(theme.skyTop, theme.skyTop, theme.skyBot, theme.skyBot, 0.55, 0.55, 0.15, 0.15);
      sky.fillRect(0, 0, W, 120);

      this.add.rectangle(W / 2, H / 2, W, H, grass).setDepth(-21);

      for (let i = 0; i < 48; i += 1) {
        const x = (i * 89 + 17) % W;
        const y = 70 + ((i * 53) % 560);
        const c = i % 3 === 0 ? theme.accent : i % 2 ? theme.accent2 : grass;
        this.add.ellipse(x, y, 38 + (i % 5) * 10, 16 + (i % 3) * 4, c, 0.22).setDepth(-20);
      }

      for (let i = 0; i < 120; i += 1) {
        const x = (i * 73) % W;
        const y = 76 + ((i * 47) % 545);
        const c = i % 3 === 0 ? theme.accent : i % 2 ? 0x38542d : 0x20371b;
        this.add.rectangle(x, y, 18 + (i % 4) * 7, 3, c, 0.22).setAngle((i * 19) % 180).setDepth(-19);
      }

      if (this.textures.exists("cloud_soft")) {
        for (let i = 0; i < 4; i += 1) {
          const x = 40 + i * 100;
          const y = 58 + (i % 2) * 14;
          this.add.image(x, y, "cloud_soft").setScale(0.9 + (i % 3) * 0.15).setAlpha(0.55).setDepth(-18);
        }
      }

      const edge = this.add.graphics().setDepth(-10);
      edge.lineStyle(PATH_WIDTH + 18, theme.roadEdge, 1);
      this.strokePath(edge);
      const roadShadow = this.add.graphics().setDepth(-9);
      roadShadow.lineStyle(PATH_WIDTH + 8, 0x1a120c, 0.35);
      this.strokePath(roadShadow);
      const road = this.add.graphics().setDepth(-8);
      road.lineStyle(PATH_WIDTH, theme.road, 1);
      this.strokePath(road);
      const center = this.add.graphics().setDepth(-7);
      center.lineStyle(3, theme.pathMid, 0.45);
      this.strokePath(center);

      if (this.textures.exists("path_mark")) {
        for (let i = 0; i < this.path.length - 1; i += 1) {
          const a = this.path[i];
          const b = this.path[i + 1];
          for (let s = 1; s <= 3; s += 1) {
            const t = s / 4;
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            this.add
              .image(x, y, "path_mark")
              .setAlpha(0.5)
              .setDepth(-6.5)
              .setAngle(Phaser.Math.RadToDeg(Math.atan2(b.y - a.y, b.x - a.x)));
          }
        }
      }

      this.add
        .text(MAP_LAYOUT.entryLabelX, MAP_LAYOUT.entryLabelY, "IN", {
          font: "bold 11px Arial",
          color: "#f8ecd0",
          backgroundColor: "#00000066",
          padding: { x: 4, y: 2 },
        })
        .setDepth(-6);

      const placeAway = (n, minDist, fn) => {
        let placed = 0;
        for (let i = 0; i < n * 4 && placed < n; i += 1) {
          const x = 20 + ((i * 97 + placed * 13) % 380);
          const y = 88 + ((i * 131 + placed * 29) % 520);
          const nearRoad = this.path.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < minDist);
          const nearPad = this.buildPads.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 40);
          if (nearRoad || nearPad) continue;
          fn(x, y, placed);
          placed += 1;
        }
      };

      placeAway(14, 48, (x, y, i) => {
        const key = i % 3 === 0 && this.textures.exists("tree_oak") ? "tree_oak" : "tree_pine";
        this.add.image(x, y - 12, key).setScale(0.78 + (i % 4) * 0.08).setDepth(-15).setTint(theme.tint);
      });
      placeAway(10, 42, (x, y, i) => {
        if (this.textures.exists("bush_round")) {
          this.add.image(x, y, "bush_round").setScale(0.7 + (i % 3) * 0.1).setDepth(-14).setTint(theme.tint);
        }
      });
      placeAway(12, 40, (x, y, i) => {
        if (i % 2 === 0) this.add.image(x, y, "rock_moss").setScale(0.85).setDepth(-6).setTint(theme.tint);
        else if (this.textures.exists("flower_patch")) this.add.image(x, y, "flower_patch").setScale(0.85).setDepth(-6);
      });
      placeAway(3, 55, (x, y) => {
        if (this.textures.exists("ruin_pillar")) this.add.image(x, y - 8, "ruin_pillar").setScale(0.9).setDepth(-13).setTint(theme.tint);
      });
      placeAway(2, 50, (x, y) => {
        if (this.textures.exists("banner_flag")) this.add.image(x, y - 10, "banner_flag").setScale(0.95).setDepth(-12);
      });

      if (this.textures.exists("gate_arch")) {
        this.add.image(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY, "gate_arch").setDepth(-5).setScale(1.05);
      } else {
        this.add.rectangle(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY, MAP_LAYOUT.gateWidth, MAP_LAYOUT.gateHeight, 0x57402c, 1).setStrokeStyle(3, 0x2d2117).setDepth(-5);
        this.add.rectangle(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY, MAP_LAYOUT.gateInnerWidth, MAP_LAYOUT.gateInnerHeight, 0x15100c, 0.9).setDepth(-4);
      }
      this.add
        .text(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY + 22, "GATE", {
          font: "bold 10px Arial",
          color: "#f0e0b0",
          backgroundColor: "#00000055",
          padding: { x: 4, y: 1 },
        })
        .setOrigin(0.5)
        .setDepth(-4);

      const vig = this.add.graphics().setDepth(-3);
      vig.fillStyle(0x000000, 0.2);
      vig.fillRect(0, 0, W, 16);
      vig.fillRect(0, H - 16, W, 16);
      vig.fillStyle(0x000000, 0.12);
      vig.fillRect(0, 0, 10, H);
      vig.fillRect(W - 10, 0, 10, H);
    }

    strokePath(graphics) {
      graphics.beginPath();
      graphics.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i += 1) graphics.lineTo(this.path[i].x, this.path[i].y);
      graphics.strokePath();
    }

    createPads() {
      for (const pad of this.buildPads) {
        pad.tower = null;
        if (this.textures.exists("pad_empty")) {
          pad.base = this.add.image(pad.x, pad.y + 2, "pad_empty").setDepth(8).setScale(0.95);
          pad.glow = this.add.circle(pad.x, pad.y, 22, 0xf5d76e, 0.08).setStrokeStyle(2, 0xf5d76e, 0.35).setDepth(7);
        } else {
          pad.base = this.add.circle(pad.x, pad.y, 25, 0x1a2215, 0.95).setStrokeStyle(3, 0xb19b58, 0.9);
        }
        pad.icon = this.add
          .text(pad.x, pad.y - 4, "+", { font: "bold 22px Arial", color: "#fff2ba", stroke: "#3a2810", strokeThickness: 3 })
          .setOrigin(0.5)
          .setDepth(9);
      }
    }

    createHero() {
      const post = this.nearestPathPoint(this.path[Math.min(2, this.path.length - 1)].x, this.path[Math.min(2, this.path.length - 1)].y);
      this.heroSelected = false;
      this.hero = this.entityRegistry.create("hero", {
        x: post.x,
        y: post.y,
        targetX: post.x,
        targetY: post.y,
        hp: 260,
        maxHp: 260,
        level: 1,
        xp: 0,
        attackCooldown: 0,
        respawn: 0,
        commandTime: 0,
        dead: false,
        isHero: true,
      });
      this.hero.ring = this.add.circle(post.x, post.y, 34, 0xf5d76e, 0.12).setStrokeStyle(2, 0xf5d76e, 0.6).setDepth(37).setVisible(false);
      this.hero.sprite = this.add.image(post.x, post.y - 10, "hero_captain").setScale(0.82).setDepth(46);
      this.hero.barBg = this.add.rectangle(post.x, post.y - 31, 30, 4, 0x2a120e).setDepth(47);
      this.hero.bar = this.add.rectangle(post.x - 15, post.y - 31, 30, 4, 0x5fd86f).setOrigin(0, 0.5).setDepth(48);
      this.hero.levelText = this.add
        .text(post.x, post.y + 18, "H1", { font: "bold 9px Arial", color: "#fff2ba" })
        .setOrigin(0.5)
        .setDepth(49);
    }

    createHud() {
      this.add.rectangle(W / 2, TOP_H / 2, W, TOP_H, 0x121a10, 0.94).setDepth(90);
      this.add.rectangle(W / 2, TOP_H / 2 - 8, W - 16, TOP_H - 18, 0x1c2818, 0.35).setDepth(90.5);
      this.add.rectangle(W / 2, TOP_H, W, 3, 0x8a9a48).setDepth(91);
      this.add.rectangle(W / 2, TOP_H - 1, W, 1, 0xf0d878, 0.35).setDepth(91.5);
      if (this.textures.exists("icon_gold")) this.add.image(18, 20, "icon_gold").setScale(0.9).setDepth(100);
      if (this.textures.exists("icon_heart")) this.add.image(144, 20, "icon_heart").setScale(0.9).setDepth(100);
      this.goldText = this.add.text(30, 10, "", { font: "bold 18px Arial", color: COLORS.gold, stroke: "#3a2810", strokeThickness: 3 }).setDepth(100);
      this.livesText = this.add.text(156, 10, "", { font: "bold 18px Arial", color: "#ff8a73", stroke: "#3a1010", strokeThickness: 3 }).setDepth(100);
      this.waveText = this.add.text(236, 8, "", { font: "bold 16px Arial", color: COLORS.ink }).setDepth(100);
      this.mapText = this.add.text(236, 27, "", { font: "bold 10px Arial", color: "#cfc4a2" }).setDepth(100);
      this.waveBarBg = this.add.rectangle(236, 42, 86, 5, 0x26351d, 1).setOrigin(0, 0.5).setDepth(100);
      this.waveBar = this.add.rectangle(236, 42, 1, 5, 0xf5c85a, 1).setOrigin(0, 0.5).setDepth(101);
      this.messageText = this.add
        .text(12, 42, "", { font: "bold 12px Arial", color: "#f8f0d8", wordWrap: { width: 232 } })
        .setOrigin(0, 0.5)
        .setDepth(100);
      this.muteButton = this.makeButton(211, 18, 34, 20, this.settings.muted ? "×" : "♪", 0x3d4f5a, () => this.toggleMuted());
      this.pauseButton = this.makeButton(337, 39, 36, 30, "II", 0x3d4f5a, () => this.togglePause());
      this.callButton = this.makeButton(385, 39, 60, 30, "CALL", 0x7a4f25, () => this.callWave());
    }

    createShop() {
      this.add.rectangle(W / 2, SHOP_Y + SHOP_H / 2, W, SHOP_H, COLORS.panel, 0.98).setDepth(90);
      this.add.rectangle(W / 2, SHOP_Y + SHOP_H / 2, W - 12, SHOP_H - 10, 0x24351c, 0.4).setDepth(90.5);
      this.add.rectangle(W / 2, SHOP_Y, W, 3, 0x8a9a48).setDepth(91);
      this.add.rectangle(W / 2, SHOP_Y + 1, W, 1, 0xf0d878, 0.35).setDepth(91.5);
      this.shopButtons = [];
      const types = Object.values(TOWERS);
      for (let i = 0; i < types.length; i += 1) {
        const t = types[i];
        const x = 48 + i * 81;
        const b = this.makeButton(x, SHOP_Y + 33, 72, 54, `${t.glyph}\n${t.cost}g\n${t.shopLabel}`, t.color, () => this.chooseBuild(t.id));
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
        btn.cooldownBar = this.add.rectangle(x - 39, SHOP_Y + 105, 1, 4, 0xaee9ff, 0.95).setOrigin(0, 0.5).setDepth(102);
        this.spellButtons.push(btn);
      }
      this.heroButtons = [];
      const heroDefs = [
        ["charge", 63, "CHG"],
        ["banner", 166, "BAN"],
        ["heal", 269, "HEAL"],
      ];
      for (const [id, x, label] of heroDefs) {
        const btn = this.makeButton(x, SHOP_Y + 33, 92, 54, label, 0x4f6f9f, () => this.castHeroAbility(id));
        btn.ability = id;
        btn.cooldownBar = this.add.rectangle(x - 42, SHOP_Y + 55, 1, 4, 0xf5d76e, 0.95).setOrigin(0, 0.5).setDepth(102);
        this.heroButtons.push(btn);
      }
      this.infoText = this.add
        .text(12, SHOP_Y + 61, "Tap a tower type, then tap a build pad.", {
          font: "12px Arial",
          color: "#d9d0ae",
          wordWrap: { width: 330 },
        })
        .setDepth(100);
      this.setHeroPanel(false);
    }

    makeButton(x, y, w, h, label, color, cb) {
      const shadow = this.add.rectangle(x, y + 4, w, h, 0x050704, 0.55).setStrokeStyle(1, 0x000000, 0.5).setDepth(99);
      const bg = this.add.rectangle(x, y, w, h, color, 0.98).setStrokeStyle(2, 0xf2df92, 0.45).setDepth(100);
      const shine = this.add.rectangle(x, y - h * 0.28, w - 8, Math.max(4, h * 0.24), 0xffffff, 0.16).setDepth(100.5);
      const lip = this.add.rectangle(x, y + h * 0.35, w - 8, Math.max(3, h * 0.16), 0x000000, 0.18).setDepth(100.5);
      const text = this.add
        .text(x, y - 1, label, { font: "bold 13px Arial", color: "#fff4d8", align: "center" })
        .setOrigin(0.5)
        .setDepth(101);
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerdown", () => {
        this.audio.resume();
        bg.y = y + 2;
        shine.y = y - h * 0.28 + 2;
        lip.y = y + h * 0.35 + 2;
        text.y = y + 1;
        cb();
      });
      bg.on("pointerup", () => {
        bg.y = y;
        shine.y = y - h * 0.28;
        lip.y = y + h * 0.35;
        text.y = y - 1;
      });
      bg.on("pointerout", () => {
        bg.y = y;
        shine.y = y - h * 0.28;
        lip.y = y + h * 0.35;
        text.y = y - 1;
      });
      return {
        bg,
        text,
        shadow,
        shine,
        lip,
        x,
        y,
        w,
        h,
        label,
        color,
        setLabel: (value) => text.setText(value),
        setAlpha: (value) => {
          for (const obj of [shadow, bg, shine, lip, text]) obj.setAlpha(value);
        },
        setVisible: (value) => {
          for (const obj of [shadow, bg, shine, lip, text]) obj.setVisible(value);
          if (value) bg.setInteractive({ useHandCursor: true });
          else bg.disableInteractive();
        },
      };
    }

    setHeroPanel(active) {
      const normalButtons = [...(this.shopButtons || []), this.upgradeButton, this.sellButton, ...(this.spellButtons || [])].filter(Boolean);
      for (const btn of normalButtons) btn.setVisible(!active);
      for (const btn of this.heroButtons || []) btn.setVisible(active);
      for (const btn of this.spellButtons || []) btn.cooldownBar.setVisible(!active);
      for (const btn of this.heroButtons || []) btn.cooldownBar.setVisible(active);
    }

    showStartOverlay() {
      this.overlay = this.add.container(0, 0).setDepth(500);
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.9));
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive();
      this.overlay.add(blocker);
      this.overlay.add(this.add.text(W / 2, 86, "KRC CAMPAIGN", { font: "bold 34px Arial", color: COLORS.gold, stroke: "#2a1a08", strokeThickness: 6 }).setOrigin(0.5));
      this.overlay.add(
        this.add
          .text(W / 2, 122, "Choose a map. Stars unlock from lives remaining.", {
            font: "14px Arial",
            color: "#cfc4a2",
            align: "center",
            wordWrap: { width: 340 },
          })
          .setOrigin(0.5)
      );

      MAPS.forEach((map, index) => {
        const unlocked = !!this.campaign.unlocked[index];
        const result = this.campaign.results[String(index)] || { stars: 0, bestGold: 0 };
        const y = 178 + index * 92;
        const card = this.add.rectangle(W / 2, y, 320, 78, unlocked ? 0x243528 : 0x1a1f1a, 1).setStrokeStyle(2, unlocked ? 0xe6d282 : 0x445044);
        const title = this.add
          .text(W / 2 - 140, y - 18, `${index + 1}. ${map.name}`, {
            font: "bold 18px Arial",
            color: unlocked ? "#fff2ba" : "#7a8478",
          })
          .setOrigin(0, 0.5);
        const starText = "★".repeat(result.stars || 0) + "☆".repeat(Math.max(0, 3 - (result.stars || 0)));
        const meta = this.add
          .text(W / 2 - 140, y + 12, unlocked ? `${starText}  best gold ${result.bestGold || 0}` : "LOCKED — clear previous map", {
            font: "13px Arial",
            color: unlocked ? "#d7e7c8" : "#6f776d",
          })
          .setOrigin(0, 0.5);
        this.overlay.add([card, title, meta]);
        if (unlocked) {
          card.setInteractive({ useHandCursor: true });
          card.on("pointerdown", () => this.beginMap(index));
          title.setInteractive({ useHandCursor: true });
          title.on("pointerdown", () => this.beginMap(index));
        }
      });

      const motion = this.add.rectangle(W / 2, 480, 188, 34, 0x334657, 1).setStrokeStyle(2, 0xb9d7ec, 0.7);
      const motionText = this.add
        .text(W / 2, 480, this.settings.reducedMotion ? "MOTION: REDUCED" : "MOTION: FULL", { font: "bold 13px Arial", color: "#e8f5ff" })
        .setOrigin(0.5);
      motion.setInteractive({ useHandCursor: true });
      motion.on("pointerdown", () => {
        const reduced = this.toggleReducedMotion();
        motionText.setText(reduced ? "MOTION: REDUCED" : "MOTION: FULL");
      });
      this.overlay.add([motion, motionText]);
      this.overlay.add(
        this.add
          .text(W / 2, 520, "Tip: Call early waves for a gold bonus. Guards hold roads.", {
            font: "12px Arial",
            color: "#a9b59d",
            align: "center",
            wordWrap: { width: 330 },
          })
          .setOrigin(0.5)
      );
    }

    beginMap(mapIndex) {
      this.audio.resume();
      this.audio.play("start", 0.45);
      this.audio.startMusic();
      if (mapIndex !== this.mapIndex) {
        this.overlayActive = false;
        this.overlay?.destroy();
        this.scene.restart({ mapIndex, gold: 280, lives: 20 });
        return;
      }
      this.overlayActive = false;
      this.overlay.destroy();
      this.say(`${this.map.name}: build two towers, then CALL. Tap pads for range preview.`);
    }

    handlePointer(pointer, targets) {
      if (this.overlayActive || this.gameEnded) return;
      if (this.hero && !this.hero.dead && Phaser.Math.Distance.Between(pointer.x, pointer.y, this.hero.x, this.hero.y) < 30) {
        this.selectHero();
        return;
      }
      if (targets.length && !this.selectedBuild) return;
      if (pointer.y < TOP_H || pointer.y > SHOP_Y) return;
      if (this.heroSelected) {
        this.moveHeroTo(pointer.x, pointer.y);
        return;
      }
      let closest = null;
      let best = 999;
      for (const pad of this.buildPads) {
        const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, pad.x, pad.y);
        if (d < best) {
          best = d;
          closest = pad;
        }
      }
      const selectedTower = this.selectedPad?.tower;
      if (selectedTower?.type === "barracks" && (!closest || best > 34)) {
        const rally = window.KRCRallyPoint.place(this.path, pointer.x, pointer.y);
        if (rally && Phaser.Math.Distance.Between(pointer.x, pointer.y, rally.x, rally.y) <= 54) {
          this.setRallyPoint(selectedTower, rally);
          return;
        }
        this.say("Tap the road to set this Guard rally point.");
        return;
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
      this.heroSelected = false;
      this.setHeroPanel(false);
      const cfg = TOWERS[id];
      this.say(this.selectedBuild ? `${cfg.name} — ${cfg.role}. ${cfg.targetRule}. ${cfg.counterplay}` : "Build selection cleared.");
      this.refreshSelection();
    }

    selectPad(pad) {
      this.selectedPad = pad;
      this.selectedBuild = null;
      this.heroSelected = false;
      this.setHeroPanel(false);
      this.refreshSelection();
      if (pad.tower) {
        const cfg = TOWERS[pad.tower.type];
        this.say(
          pad.tower.type === "barracks"
            ? `${cfg.name} level ${pad.tower.level + 1}. Tap the road to move its rally point.`
            : `${cfg.name} level ${pad.tower.level + 1}. Upgrade or sell.`
        );
      } else {
        this.say("Empty build pad. Choose a tower below.");
      }
    }

    clearSelection() {
      this.selectedPad = null;
      this.selectedBuild = null;
      this.heroSelected = false;
      this.setHeroPanel(false);
      this.refreshSelection();
    }

    refreshSelection() {
      for (const pad of this.buildPads) {
        const active = pad === this.selectedPad;
        if (pad.glow) {
          pad.glow.setVisible(!pad.tower);
          pad.glow.setStrokeStyle(active ? 3 : 2, active ? 0xfff0a0 : 0xf5d76e, active ? 0.85 : 0.35);
          pad.glow.setFillStyle(0xf5d76e, active ? 0.18 : 0.08);
          if (pad.base?.setTint) pad.base.setTint(active ? 0xfff2c0 : 0xffffff);
        } else if (pad.base?.setStrokeStyle) {
          pad.base.setStrokeStyle(active ? 4 : 3, active ? 0xf5d76e : 0xb19b58, 1);
        }
        if (pad.icon) pad.icon.setVisible(!pad.tower);
      }
      if (this.hero?.ring) this.hero.ring.setVisible(!!this.heroSelected);
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
      pad.icon.setVisible(false);
      if (pad.glow) pad.glow.setVisible(false);
      const tower = this.entityRegistry.create("tower", {
        type,
        level: 0,
        x: pad.x,
        y: pad.y,
        cooldown: 0.2,
        abilityCooldown: 0,
        pad,
        soldiers: [],
      });
      if (type === "barracks") {
        const rally = window.KRCRallyPoint.place(this.path, pad.x, pad.y);
        tower.rallyX = rally.x;
        tower.rallyY = rally.y;
        tower.rallySegment = rally.segment;
      }
      pad.tower = tower;
      tower.sprite = this.add.image(pad.x, pad.y - 8, `tower_${type}`).setScale(0.62).setDepth(30);
      tower.label = this.add.text(pad.x + 16, pad.y + 15, "I", { font: "bold 12px Arial", color: "#fff2ba" }).setOrigin(0.5).setDepth(31);
      tower.rangeRing = this.add.circle(pad.x, pad.y, cfg.range[0], cfg.color, 0.08).setStrokeStyle(1, cfg.color, 0.22).setDepth(20).setVisible(false);
      if (type === "barracks") {
        tower.rallyRing = this.add.circle(tower.rallyX, tower.rallyY, 17, 0xf5d76e, 0.08).setStrokeStyle(2, 0xf5d76e, 0.9).setDepth(28);
        tower.rallyFlag = this.add.text(tower.rallyX, tower.rallyY - 20, "RLY", { font: "bold 9px Arial", color: "#fff2ba" }).setOrigin(0.5).setDepth(29);
        tower.trainMax = window.KRCBarracksReadiness.respawnCooldown(0);
        tower.cooldown = 0.35;
        tower.readyBadge = this.add
          .text(pad.x, pad.y + 28, "READY", {
            font: "bold 10px Arial",
            color: "#d8f7a8",
            backgroundColor: "#1a2412",
            padding: { x: 4, y: 2 },
          })
          .setOrigin(0.5)
          .setDepth(32);
        tower.readyMeter = this.add.rectangle(pad.x - 18, pad.y + 40, 36, 4, 0x3d4a2c).setOrigin(0, 0.5).setDepth(32);
        tower.readyFill = this.add.rectangle(pad.x - 18, pad.y + 40, 36, 4, 0x8fd45a).setOrigin(0, 0.5).setDepth(33);
      }
      this.towers.push(tower);
      this.audio.play("ready", 0.28);
      this.selectedPad = pad;
      this.selectedBuild = null;
      this.setHeroPanel(false);
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
      if (tower.level >= cfg.upgrades.length) {
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
      tower.sprite.setScale(0.62 + tower.level * 0.04);
      tower.label.setText(["I", "II", "III", "IV", "V"][tower.level]);
      tower.rangeRing.setRadius(cfg.range[tower.level]);
      const unlocked = window.KRCTowerAbilities?.isUnlocked(tower.type, tower.level);
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      if (unlocked && ability && tower.level === ability.minLevel) {
        tower.abilityCooldown = 0;
        this.flashText(ability.name.toUpperCase(), tower.x, tower.y - 42, "#fff2ba");
        this.say(`${cfg.name} unlocked ${ability.name}: ${ability.description}`);
      } else {
        this.say(`${cfg.name} upgraded to level ${tower.level + 1}.`);
      }
      this.audio.play("ready", 0.34, 1 + tower.level * 0.08);
      this.updateUpgradeLabel();
    }

    sellSelected() {
      if (this.overlayActive || this.gameEnded) return;
      const tower = this.selectedPad?.tower;
      if (!tower) return;
      const cfg = TOWERS[tower.type];
      const spent = cfg.cost + cfg.upgrades.slice(0, tower.level).reduce((a, b) => a + b, 0);
      const refund = Math.floor(spent * 0.55);
      this.gold += refund;
      tower.sprite.destroy();
      tower.label.destroy();
      tower.rangeRing.destroy();
      tower.rallyRing?.destroy();
      tower.rallyFlag?.destroy();
      tower.readyBadge?.destroy();
      tower.readyMeter?.destroy();
      tower.readyFill?.destroy();
      this.entityRegistry.transition(tower, "removed");
      for (const s of tower.soldiers) this.killSoldier(s);
      this.towers = this.towers.filter((t) => t !== tower);
      this.selectedPad.tower = null;
      this.selectedPad.icon.setText("+");
      this.selectedPad.icon.setVisible(true);
      if (this.selectedPad.glow) this.selectedPad.glow.setVisible(true);
      this.flashText(`+${refund}`, tower.x, tower.y - 28, COLORS.gold);
      this.say(`Sold for ${refund} gold (55% refund).`);
      this.refreshSelection();
    }

    updateUpgradeLabel() {
      const tower = this.selectedPad?.tower;
      if (!tower) {
        this.upgradeButton.setLabel("UP\n-");
        this.sellButton.setLabel("SELL");
        for (const t of this.towers) t.rangeRing.setVisible(false);
        return;
      }
      const cfg = TOWERS[tower.type];
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
      if (tower.level >= cfg.upgrades.length && unlocked) {
        const cd = Math.ceil(Math.max(0, tower.abilityCooldown || 0));
        this.upgradeButton.setLabel(cd > 0 ? `${ability.name.slice(0, 3).toUpperCase()}\n${cd}s` : `${ability.name.slice(0, 3).toUpperCase()}\nRDY`);
      } else {
        this.upgradeButton.setLabel(tower.level >= cfg.upgrades.length ? "MAX" : `UP\n${cfg.upgrades[tower.level]}`);
      }
      const spent = cfg.cost + cfg.upgrades.slice(0, tower.level).reduce((a, b) => a + b, 0);
      const refund = Math.floor(spent * 0.55);
      this.sellButton.setLabel(`SELL\n${refund}g`);
      tower.rangeRing.setVisible(true);
      for (const t of this.towers) if (t !== tower) t.rangeRing.setVisible(false);
    }

    callWave() {
      if (this.overlayActive || this.gameEnded) return;
      if (!this.qaMode && this.waveIndex === 0 && this.towers.length < 2) {
        this.say("Build at least two towers before the first wave.");
        return;
      }
      if (this.waveActive) {
        this.say("Wave is already marching.");
        return;
      }
      if (this.waveIndex >= WAVES.length) return;
      const wave = WAVES[this.waveIndex];
      let bonus = wave.gold;
      if (!this.waveActive && this.enemies.length === 0 && this.waveIndex < WAVES.length) {
        const earlyBonus = 8 + this.waveIndex * 2;
        bonus += earlyBonus;
        this.flashText(`+${earlyBonus} EARLY`, W / 2, 120, "#fff2ba");
      }
      this.gold += bonus;
      this.queue = [];
      for (const [type, count] of wave.packs) {
        for (let i = 0; i < count; i += 1) this.queue.push(type);
      }
      this.waveTotal = this.queue.length;
      this.waveActive = true;
      this.spawnTimer = 0.1;
      this.audio.play("start", 0.35, 1.08);
      this.say(`Wave ${this.waveIndex + 1}: ${wave.label}`);
    }

    toggleMuted() {
      this.settings.muted = !this.settings.muted;
      this.settings = window.KRCSettings?.save?.({ muted: this.settings.muted }) || this.settings;
      this.audio.setMuted(this.settings.muted);
      if (!this.settings.muted) this.audio.startMusic();
      this.muteButton.setLabel(this.settings.muted ? "×" : "♪");
      this.say(this.settings.muted ? "Sound muted." : "Sound restored.");
    }

    toggleReducedMotion() {
      this.settings.reducedMotion = !this.settings.reducedMotion;
      this.settings = window.KRCSettings?.save?.({ reducedMotion: this.settings.reducedMotion }) || this.settings;
      this.say(this.settings.reducedMotion ? "Reduced motion enabled." : "Full motion enabled.");
      return this.settings.reducedMotion;
    }

    togglePause() {
      if (this.overlayActive || this.gameEnded) return;
      this.paused = !this.paused;
      if (this.paused) {
        this.sound.pauseAll();
        this.pauseButton.setLabel("▶");
        this.say("Paused. Tap ▶ or press P to continue.");
      } else {
        this.sound.resumeAll();
        this.pauseButton.setLabel("II");
        this.say("Battle resumed.");
      }
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
          const stars = this.computeStars();
          window.KRCCampaign.save(window.KRCCampaign.recordWin(this.campaign, this.mapIndex, stars, this.gold));
          if (this.mapIndex < MAPS.length - 1) {
            this.audio.play("ready", 0.45);
            this.showMapClearOverlay(stars);
          } else {
            this.endGame(true);
          }
        } else {
          this.gold += 22 + this.waveIndex * 5;
          this.say(`Wave cleared. Prepare for ${WAVES[this.waveIndex].label}.`);
        }
      }
    }

    spawnEnemy(type) {
      const base = ENEMIES[type];
      const scale = 1 + this.waveIndex * 0.08;
      const start = this.path[0];
      const enemy = this.entityRegistry.create("enemy", {
        type,
        base,
        x: start.x,
        y: start.y,
        seg: 0,
        hp: Math.round(base.hp * scale),
        maxHp: Math.round(base.hp * scale),
        speed: base.speed * (1 + this.waveIndex * 0.015),
        wobble: Math.random() * Math.PI * 2,
        slow: 0,
        blockedBy: null,
        dead: false,
      });
      enemy.sprite = this.add.image(enemy.x, enemy.y - 4, `enemy_${type}`).setScale(base.size / 30).setDepth(40);
      enemy.nameText = this.add.text(enemy.x, enemy.y + 1, "", { font: "bold 10px Arial", color: "#102030" }).setOrigin(0.5).setDepth(41);
      enemy.barBg = this.add.rectangle(enemy.x, enemy.y - base.size - 8, 28, 4, 0x2a120e).setDepth(42);
      enemy.bar = this.add.rectangle(enemy.x - 14, enemy.y - base.size - 8, 28, 4, 0x68d764).setOrigin(0, 0.5).setDepth(43);
      const traits = window.KRCEnemyTraits ? window.KRCEnemyTraits.traitsFor(base) : [];
      enemy.traits = traits;
      const badge = window.KRCEnemyTraits ? window.KRCEnemyTraits.badgeText(traits) : "";
      enemy.traitText = this.add
        .text(enemy.x, enemy.y - base.size - 16, badge, {
          font: "bold 9px Arial",
          color: traits[0]?.color || "#e8f0ff",
          backgroundColor: "#141a14aa",
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5)
        .setDepth(44)
        .setVisible(!!badge);
      this.enemies.push(enemy);
      return enemy;
    }

    spawnEnemyFrom(type, parent) {
      const child = this.spawnEnemy(type);
      child.x = parent.x;
      child.y = parent.y;
      child.seg = parent.seg;
      child.slow = 0;
      this.updateEnemyVisual(child);
      return child;
    }

    updateEnemies(dt) {
      for (const enemy of [...this.enemies]) {
        if (enemy.dead) continue;
        enemy.slow = Math.max(0, enemy.slow - dt);
        if (enemy.type === "boss" && enemy.base.phases) this.updateBossPhases(enemy, dt);
        if (!enemy.blockedBy || enemy.blockedBy.dead) {
          enemy.blockedBy = this.findBlockingSoldier(enemy);
        }
        if (enemy.blockedBy) {
          this.enemyMelee(enemy, enemy.blockedBy, dt);
        } else {
          this.moveEnemy(enemy, dt);
        }
        this.updateEnemyVisual(enemy);
        if (enemy.seg >= this.path.length - 1) this.leakEnemy(enemy);
      }
      this.applySupportAuras();
    }

    applySupportAuras() {
      for (const tower of this.towers) tower.hexed = false;
      for (const enemy of this.enemies) {
        if (enemy.dead || !enemy.base.aura) continue;
        const radius = enemy.base.aura.radius || 100;
        for (const tower of this.towers) {
          if (Phaser.Math.Distance.Between(enemy.x, enemy.y, tower.x, tower.y) <= radius) {
            tower.hexed = true;
            tower.hexPenalty = enemy.base.aura.fireRatePenalty || 0.3;
          }
        }
        if (!enemy.auraRing) {
          enemy.auraRing = this.add.circle(enemy.x, enemy.y, radius, 0x9b7cff, 0.05).setStrokeStyle(1, 0xb9a0ff, 0.35).setDepth(21);
        } else {
          enemy.auraRing.setPosition(enemy.x, enemy.y);
          enemy.auraRing.setVisible(true);
        }
      }
    }

    updateBossPhases(enemy, dt) {
      const ratio = enemy.hp / enemy.maxHp;
      const nextPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
      if (!enemy.phase) enemy.phase = 1;
      enemy.phaseTimer = Math.max(0, (enemy.phaseTimer || 0) - dt);
      if (nextPhase !== enemy.phase) {
        enemy.phase = nextPhase;
        enemy.phaseTimer = 2.4;
        if (nextPhase === 2) {
          enemy.armorBuff = 4;
          enemy.speed *= 1.12;
          this.flashText("WARDEN SHIELD", enemy.x, enemy.y - 48, "#d7c3ff");
          this.say("Warden raises a shield — pierce with Runes or focus fire.");
          const ring = this.add.circle(enemy.x, enemy.y, 40, 0xc9a6ff, 0.18).setStrokeStyle(3, 0xf0d8ff, 0.9).setDepth(70);
          this.tweens.add({ targets: ring, alpha: 0, scale: 1.8, duration: 500, onComplete: () => ring.destroy() });
        } else if (nextPhase === 3) {
          enemy.armorBuff = 0;
          enemy.speed *= 1.15;
          this.flashText("WARDEN RAGE", enemy.x, enemy.y - 48, "#ff9ad8");
          this.say("Warden enrages — stall with Guards and burst during the open window.");
          for (let i = 0; i < 3; i += 1) this.spawnEnemyFrom("scout", enemy);
          const ring = this.add.circle(enemy.x, enemy.y, 48, 0xff6ab8, 0.2).setStrokeStyle(3, 0xffd0ea, 0.95).setDepth(70);
          this.tweens.add({ targets: ring, alpha: 0, scale: 2.0, duration: 550, onComplete: () => ring.destroy() });
        }
      }
      if (enemy.phase === 2 && enemy.phaseTimer > 0) {
        enemy.sprite.setTint(0xd8c2ff);
      } else if (enemy.sprite) {
        enemy.sprite.clearTint();
      }
    }

    moveEnemy(enemy, dt) {
      let speed = enemy.speed * (enemy.slow > 0 ? 0.58 : 1);
      if (enemy.hp < enemy.maxHp * 0.3 && enemy.type === "brute") speed *= 1.18;
      let remaining = speed * dt;
      while (remaining > 0 && enemy.seg < this.path.length - 1) {
        const target = this.path[enemy.seg + 1];
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
      const bob = Math.sin(this.time.now * 0.008 + enemy.wobble);
      enemy.sprite.y += bob * (enemy.base.flying ? 4 : enemy.blockedBy ? 0.6 : 1.2);
      if (enemy.blockedBy) {
        enemy.sprite.rotation = Math.sin(this.time.now * 0.03 + enemy.wobble) * 0.18;
        enemy.sprite.setScale((enemy.base.size / 30) * (1 + Math.sin(this.time.now * 0.04) * 0.04));
      } else if (enemy.seg < this.path.length - 1) {
        const next = this.path[enemy.seg + 1];
        enemy.sprite.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, next.x, next.y) * 0.08;
        enemy.sprite.setScale(enemy.base.size / 30);
      }
      if (enemy.hp < enemy.maxHp * 0.35) enemy.sprite.setTint(0xffb0a0);
      else if (!enemy.base.phases) enemy.sprite.clearTint();
      enemy.barBg.setPosition(enemy.x, enemy.y - enemy.base.size - 8);
      enemy.bar.setPosition(enemy.x - 14, enemy.y - enemy.base.size - 8);
      enemy.bar.width = Math.max(1, 28 * (enemy.hp / enemy.maxHp));
      // Colorblind-safe HP: shape via width already; add pattern via bar color bands
      enemy.bar.fillColor = enemy.hp < enemy.maxHp * 0.35 ? 0xff6b5a : enemy.hp < enemy.maxHp * 0.7 ? 0xf0c35a : 0x68d764;
      if (enemy.traitText) {
        enemy.traitText.setPosition(enemy.x, enemy.y - enemy.base.size - 16);
        enemy.traitText.setVisible(!!enemy.traitText.text);
      }
    }

    leakEnemy(enemy) {
      this.lives -= enemy.base.leak;
      this.audio.play("impact", 0.45, 0.82);
      this.removeEnemy(enemy, false);
      this.flashText("-" + enemy.base.leak, 360, 88, "#ff8069");
      if (this.lives <= 0) this.endGame(false);
    }

    damageEnemy(enemy, amount, source = {}) {
      if (enemy.dead) return;
      let damage = amount;
      const armor = (enemy.base.armor || 0) + (enemy.armorBuff || 0);
      if (!source.magic) damage = Math.max(1, amount - armor * 3);
      if (enemy.type === "titan" || enemy.type === "boss") damage *= 0.86;
      if (enemy.type === "boss" && enemy.phase === 2 && enemy.phaseTimer > 0 && !source.magic) damage *= 0.55;
      enemy.hp -= damage;
      if (source.slow) enemy.slow = Math.max(enemy.slow, 1.2 + source.slow * 2);
      if (enemy.hp <= 0) {
        const burn = enemy.base.burn;
        const split = enemy.base.split;
        const x = enemy.x;
        const y = enemy.y;
        this.gold += enemy.base.bounty;
        if (source.hero) this.addHeroXp(enemy.base.bounty);
        this.flashText(`+${enemy.base.bounty}`, x, y - 22, COLORS.gold);
        this.removeEnemy(enemy, true);
        if (split) {
          const [childType, count] = split;
          for (let i = 0; i < count; i += 1) this.spawnEnemyFrom(childType, enemy);
          this.flashText("BROOD SPLIT", x, y - 38, "#f2bbd0");
        }
        if (burn) this.explode(x, y, 38, 24, true);
      }
    }

    removeEnemy(enemy, killed) {
      this.entityRegistry.transition(enemy, killed ? "dead" : "leaked");
      enemy.dead = true;
      for (const obj of [enemy.sprite, enemy.nameText, enemy.barBg, enemy.bar, enemy.traitText, enemy.auraRing]) obj?.destroy();
      this.enemies = this.enemies.filter((e) => e !== enemy);
      this.entityRegistry.transition(enemy, "removed");
      if (killed) {
        this.audio.play("impact", 0.2, 0.95 + Math.random() * 0.16);
        this.puff(enemy.x, enemy.y, enemy.base.color);
      }
    }

    updateTowers(dt) {
      for (const tower of this.towers) {
        const cfg = TOWERS[tower.type];
        if (window.KRCTowerAbilities) {
          tower.abilityCooldown = window.KRCTowerAbilities.tickCooldown(tower.abilityCooldown, dt);
        }
        if (tower.type === "barracks") {
          this.updateBarracks(tower, dt);
          continue;
        }
        tower.cooldown -= dt * (this.rallyTime > 0 ? 1.28 : 1) * (tower.hexed ? Math.max(0.45, 1 - (tower.hexPenalty || 0.3)) : 1);
        if (tower.hexed && tower.sprite && Math.floor(this.time.now / 180) % 2 === 0) {
          tower.sprite.setTint(0xb49cff);
        } else if (tower.sprite) {
          tower.sprite.clearTint();
        }
        if (tower.cooldown > 0) continue;
        const target = this.findTarget(tower, cfg.range[tower.level], tower.type !== "artillery");
        if (!target) continue;
        tower.cooldown = cfg.rate[tower.level];
        this.fireTower(tower, target);
        this.tryTowerAbility(tower, target);
      }
      this.rallyTime = Math.max(0, (this.rallyTime || 0) - dt);
      if (this.selectedPad?.tower) this.updateUpgradeLabel();
    }

    tryTowerAbility(tower, target) {
      const api = window.KRCTowerAbilities;
      if (!api || !api.canTrigger(tower)) return;
      const ability = api.getAbility(tower.type);
      if (!ability || !target || target.dead) return;
      const cfg = TOWERS[tower.type];
      if (ability.id === "volley") {
        const extras = this.enemies
          .filter((e) => !e.dead && e !== target && Phaser.Math.Distance.Between(tower.x, tower.y, e.x, e.y) <= cfg.range[tower.level])
          .slice(0, 2);
        for (const extra of extras) this.fireTower(tower, extra);
        if (extras.length) {
          this.flashText("VOLLEY", tower.x, tower.y - 40, "#b7f08a");
          Object.assign(tower, api.afterTrigger(tower));
          this.audio.play("shoot", 0.18, 1.5);
        }
        return;
      }
      if (ability.id === "nova") {
        this.explode(target.x, target.y, 54, cfg.damage[tower.level] * 0.55, true);
        for (const enemy of this.enemies) {
          if (!enemy.dead && Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y) <= 54) {
            enemy.slow = Math.max(enemy.slow || 0, 2.4);
          }
        }
        this.flashText("NOVA", target.x, target.y - 36, "#c2b6ff");
        Object.assign(tower, api.afterTrigger(tower));
        this.audio.play("magic", 0.26, 0.85);
        return;
      }
      if (ability.id === "barrage") {
        const x = target.x;
        const y = target.y;
        this.time.delayedCall(220, () => {
          if (this.gameEnded) return;
          this.explode(x + 18, y - 10, (cfg.splash?.[tower.level] || 50) * 1.15, cfg.damage[tower.level] * 0.7, false);
          this.flashText("BARRAGE", x, y - 42, "#f0c27a");
        });
        Object.assign(tower, api.afterTrigger(tower));
        this.audio.play("boom", 0.22, 0.9);
      }
    }

    chainMagic(x, y, damage, jumps) {
      let remaining = jumps;
      let fromX = x;
      let fromY = y;
      const hit = new Set();
      while (remaining > 0) {
        let best = null;
        let bestD = Infinity;
        for (const enemy of this.enemies) {
          if (enemy.dead || hit.has(enemy.id)) continue;
          const d = Phaser.Math.Distance.Between(fromX, fromY, enemy.x, enemy.y);
          if (d < 90 && d < bestD) {
            best = enemy;
            bestD = d;
          }
        }
        if (!best) break;
        hit.add(best.id);
        this.damageEnemy(best, damage * 0.55, { magic: true, slow: 0.12 });
        const bolt = this.add.line(0, 0, fromX, fromY, best.x, best.y, 0xb7a6ff, 0.85).setLineWidth(2).setDepth(68);
        this.tweens.add({ targets: bolt, alpha: 0, duration: 140, onComplete: () => bolt.destroy() });
        fromX = best.x;
        fromY = best.y;
        remaining -= 1;
      }
    }

    findTarget(tower, range, canHitFlying = true) {
      return window.KRCTargeting.findBestTarget({
        path: this.path,
        tower,
        range,
        enemies: this.enemies,
        canHitFlying,
      });
    }

    fireTower(tower, target) {
      const cfg = TOWERS[tower.type];
      const level = tower.level;
      const color = cfg.color;
      const projectile = this.entityRegistry.create("projectile", {
        x: tower.x,
        y: tower.y - 10,
        target,
        tower,
        speed: tower.type === "artillery" ? 250 : 430,
        damage: cfg.damage[level],
        magic: !!cfg.magic,
        slow: cfg.slow?.[level] || 0,
        splash: cfg.splash?.[level] || 0,
        chain: tower.type === "mage" && level >= 3 ? 2 : 0,
      });
      const key =
        tower.type === "archer" ? "projectile_arrow" : tower.type === "artillery" ? "projectile_bomb" : "projectile_magic";
      projectile.sprite = this.add.image(projectile.x, projectile.y, key).setDepth(60);
      projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);
      projectile.sprite.rotation = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
      projectile.trailColor = color;
      this.projectiles.push(projectile);
      this.audio.play(tower.type === "mage" ? "magic" : "shoot", tower.type === "artillery" ? 0.2 : 0.13, tower.type === "archer" ? 1.35 : 0.95);
      if (tower.sprite && !this.settings.reducedMotion) {
        const angle = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
        this.tweens.add({
          targets: tower.sprite,
          x: tower.x - Math.cos(angle) * 4,
          y: tower.y - 5 - Math.sin(angle) * 3,
          yoyo: true,
          duration: 70,
        });
      }
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
          if (p.splash) {
            this.explode(p.target.x, p.target.y, p.splash, p.damage, false);
          } else {
            const hitX = p.target.x;
            const hitY = p.target.y;
            this.damageEnemy(p.target, p.damage, { magic: p.magic, slow: p.slow });
            if (p.chain) this.chainMagic(hitX, hitY, p.damage, p.chain);
          }
          this.removeProjectile(p);
        } else {
          p.x += ((p.target.x - p.x) / d) * step;
          p.y += ((p.target.y - p.y) / d) * step;
          p.sprite.setPosition(p.x, p.y);
          p.sprite.rotation = Phaser.Math.Angle.Between(p.x, p.y, p.target.x, p.target.y);
          if (!this.settings.reducedMotion && Math.random() < 0.45) {
            const dot = this.add.circle(p.x, p.y, 2.2, p.trailColor || 0xfff0c0, 0.55).setDepth(59);
            this.tweens.add({ targets: dot, alpha: 0, scale: 0.2, duration: 160, onComplete: () => dot.destroy() });
          }
        }
      }
    }

    removeProjectile(p) {
      this.entityRegistry.transition(p, "removed");
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
      this.audio.play("boom", 0.28, fire ? 0.92 : 1.08);
      if (!this.settings.reducedMotion) {
        this.cameras.main.shake(90, 0.004);
      }
    }

    updateBarracks(tower, dt) {
      const cfg = TOWERS.barracks;
      const readiness = window.KRCBarracksReadiness;
      tower.cooldown -= dt;
      const alive = tower.soldiers.filter((s) => !s.dead);
      tower.soldiers = alive;
      const wanted = readiness.wantedCount(tower.level);
      if (alive.length < wanted && tower.cooldown <= 0) {
        tower.trainMax = readiness.respawnCooldown(tower.level);
        tower.cooldown = tower.trainMax;
        this.spawnSoldier(tower);
        this.flashText("DEPLOY", tower.x, tower.y - 36, "#d8f7a8");
        this.audio.play("ready", 0.18, 1.12);
      }
      const roster = tower.soldiers.filter((s) => !s.dead);
      tower.soldiers = roster;
      this.refreshBarracksReadiness(tower, roster.length, wanted);
      this.tryBarracksAbility(tower, roster);

      for (const soldier of roster) {
        soldier.homeX = tower.rallyX;
        soldier.homeY = tower.rallyY;
        soldier.attackCooldown -= dt;
        soldier.arrowCooldown = Math.max(0, (soldier.arrowCooldown || 0) - dt);
        const meleeTarget = this.findEnemyNear(soldier.x, soldier.y, cfg.range[tower.level] * 0.55, false);
        if (meleeTarget) {
          soldier.target = meleeTarget;
          meleeTarget.blockedBy = soldier;
          this.moveSoldierToward(soldier, meleeTarget.x, meleeTarget.y, 22, dt);
          if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = cfg.rate[tower.level];
            soldier.strikeCount = (soldier.strikeCount || 0) + 1;
            const strike = readiness.meleeStrike({
              attackerDamage: cfg.damage[tower.level],
              bannerBonus: this.bannerTime > 0 ? 1.18 : 1,
              isCritWindow: soldier.strikeCount % 4 === 0,
            });
            this.damageEnemy(meleeTarget, strike.damage, {});
            this.meleeImpactFx(soldier, meleeTarget, strike.flash);
            this.audio.play("impact", strike.flash === "crit" ? 0.2 : 0.12, strike.flash === "crit" ? 0.9 : 1.25);
          }
        } else {
          soldier.target = null;
          this.moveSoldierToward(soldier, soldier.homeX, soldier.homeY, 6, dt);
          if (tower.level >= 2 && soldier.arrowCooldown <= 0) {
            const arrowTarget = this.findTarget(tower, cfg.range[tower.level], true);
            if (arrowTarget) {
              soldier.arrowCooldown = 1.15;
              this.fireGuardArrow(soldier, arrowTarget, cfg.damage[tower.level] * (this.bannerTime > 0 ? 0.9 : 0.72));
            }
          }
        }
        soldier.hp = readiness.idleRegen(soldier.hp, soldier.maxHp, dt, !!soldier.target);
        soldier.sprite.setPosition(soldier.x, soldier.y - 4);
        soldier.sprite.rotation = soldier.target ? Math.sin(this.time.now * 0.02) * 0.12 : 0;
        soldier.bar.width = Math.max(1, 20 * (soldier.hp / soldier.maxHp));
        soldier.bar.setPosition(soldier.x - 10, soldier.y - 17);
        if (soldier.bar) soldier.bar.fillColor = soldier.target ? 0xf0c35a : 0x7ee06a;
      }
    }

    tryBarracksAbility(tower, roster) {
      const api = window.KRCTowerAbilities;
      if (!api || !api.canTrigger(tower) || !roster.length) return;
      const threatened = roster.some((s) => s.target);
      if (!threatened && !this.enemies.some((e) => !e.dead && Phaser.Math.Distance.Between(tower.rallyX, tower.rallyY, e.x, e.y) < 90)) {
        return;
      }
      for (const soldier of roster) {
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + soldier.maxHp * 0.35);
        soldier.holdFast = 3.5;
        if (soldier.sprite) {
          this.tweens.add({ targets: soldier.sprite, scale: 0.9, yoyo: true, duration: 120 });
        }
      }
      this.flashText("HOLD FAST", tower.rallyX, tower.rallyY - 36, "#ffe08a");
      Object.assign(tower, api.afterTrigger(tower));
      this.audio.play("ready", 0.22, 0.8);
    }

    refreshBarracksReadiness(tower, aliveCount, wanted) {
      if (!tower.readyBadge || !window.KRCBarracksReadiness) return;
      const state = window.KRCBarracksReadiness.readinessState({
        alive: aliveCount,
        wanted,
        cooldown: Math.max(0, tower.cooldown),
        maxCooldown: tower.trainMax || window.KRCBarracksReadiness.respawnCooldown(tower.level),
      });
      tower.readyBadge.setText(state.label);
      tower.readyBadge.setColor(
        state.status === "ready" ? "#d8f7a8" : state.status === "training" ? "#ffe08a" : "#f0c3a0"
      );
      tower.readyFill.width = Math.max(2, 36 * state.progress);
      tower.readyFill.fillColor = state.status === "ready" ? 0x8fd45a : state.status === "training" ? 0xe2b84a : 0xd4894a;
      const show = state.status !== "ready" || this.selectedPad?.tower === tower;
      tower.readyBadge.setVisible(show || state.status !== "ready");
      tower.readyMeter.setVisible(state.status !== "ready");
      tower.readyFill.setVisible(state.status !== "ready");
    }

    meleeImpactFx(soldier, enemy, flashKind) {
      const midX = (soldier.x + enemy.x) * 0.5;
      const midY = (soldier.y + enemy.y) * 0.5 - 8;
      const color = flashKind === "crit" ? 0xfff1a0 : 0xffd0a0;
      const spark = this.add.circle(midX, midY, flashKind === "crit" ? 10 : 6, color, 0.55).setDepth(70);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: flashKind === "crit" ? 2.1 : 1.6,
        duration: flashKind === "crit" ? 180 : 120,
        onComplete: () => spark.destroy(),
      });
      if (soldier.sprite) {
        this.tweens.add({
          targets: soldier.sprite,
          x: soldier.x + (enemy.x - soldier.x) * 0.08,
          y: soldier.y - 4 + (enemy.y - soldier.y) * 0.08,
          yoyo: true,
          duration: 70,
        });
      }
      if (flashKind === "crit") this.flashText("CLASH", midX, midY - 16, "#fff1a0");
    }

    fireGuardArrow(soldier, target, damage) {
      const projectile = this.entityRegistry.create("projectile", {
        x: soldier.x,
        y: soldier.y - 12,
        target,
        speed: 390,
        damage,
        magic: false,
        slow: 0,
        splash: 0,
      });
      projectile.sprite = this.add.image(projectile.x, projectile.y, "projectile_arrow").setDepth(60).setScale(0.72);
      projectile.sprite.rotation = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
      this.projectiles.push(projectile);
      this.audio.play("shoot", 0.09, 1.22);
    }

    selectHero() {
      this.selectedPad = null;
      this.selectedBuild = null;
      this.heroSelected = true;
      this.setHeroPanel(true);
      this.refreshSelection();
      this.say(`Captain L${this.hero.level}: abilities ready below, or tap road to move.`);
    }

    moveHeroTo(x, y) {
      const point = this.nearestPathPoint(x, y);
      this.hero.targetX = point.x;
      this.hero.targetY = point.y;
      this.hero.commandTime = 2.0;
      this.hero.blockedBy = null;
      this.heroSelected = false;
      this.setHeroPanel(false);
      this.refreshSelection();
      this.say("Captain moving.");
    }

    setRallyPoint(tower, rally) {
      tower.rallyX = rally.x;
      tower.rallyY = rally.y;
      tower.rallySegment = rally.segment;
      tower.rallyRing.setPosition(rally.x, rally.y);
      tower.rallyFlag.setPosition(rally.x, rally.y - 20);
      this.audio.play("ready", 0.22, 1.16);
      this.flashText("RALLY", rally.x, rally.y - 34, "#fff1a0");
      this.say("Guard rally point set. Troops are moving to hold the road.");
    }

    updateHero(dt) {
      const hero = this.hero;
      if (!hero) return;
      for (const ability of Object.values(this.heroAbilities)) ability.ready = Math.max(0, ability.ready - dt);
      this.bannerTime = Math.max(0, (this.bannerTime || 0) - dt);
      if (hero.dead) {
        hero.respawn -= dt;
        if (hero.respawn <= 0) this.respawnHero();
        return;
      }
      hero.commandTime = Math.max(0, hero.commandTime - dt);
      const forcedMove = hero.commandTime > 0 && Phaser.Math.Distance.Between(hero.x, hero.y, hero.targetX, hero.targetY) > 8;
      const target = forcedMove ? null : this.findEnemyNear(hero.x, hero.y, 42, false);
      if (!target) this.moveSoldierToward(hero, hero.targetX, hero.targetY, 4, dt);
      else if (Phaser.Math.Distance.Between(hero.x, hero.y, target.x, target.y) > 28) {
        this.moveSoldierToward(hero, target.x, target.y, 28, dt);
      }
      hero.attackCooldown -= dt * (this.bannerTime > 0 ? 1.35 : 1);
      const attackTarget = forcedMove ? null : this.findEnemyNear(hero.x, hero.y, 34, false);
      if (attackTarget && hero.attackCooldown <= 0) {
        hero.attackCooldown = Math.max(0.34, 0.58 - hero.level * 0.04);
        this.damageEnemy(attackTarget, (18 + hero.level * 7) * (this.bannerTime > 0 ? 1.25 : 1), { hero: true });
        this.audio.play("impact", 0.14, 1.1);
      }
      hero.hp = Math.min(hero.maxHp, hero.hp + (4 + hero.level) * dt);
      hero.sprite.setPosition(hero.x, hero.y - 8);
      hero.sprite.rotation = attackTarget ? Math.sin(this.time.now * 0.025) * 0.1 : 0;
      hero.ring.setPosition(hero.x, hero.y);
      hero.barBg.setPosition(hero.x, hero.y - 31);
      hero.bar.setPosition(hero.x - 15, hero.y - 31);
      hero.bar.width = Math.max(1, 30 * (hero.hp / hero.maxHp));
      hero.levelText.setPosition(hero.x, hero.y + 18).setText(`H${hero.level}`);
    }

    castHeroAbility(id) {
      if (this.overlayActive || this.gameEnded || !this.hero || this.hero.dead) return;
      const ability = this.heroAbilities[id];
      if (ability.ready > 0) {
        this.say(`${ability.name} ready in ${Math.ceil(ability.ready)}s.`);
        return;
      }
      const hero = this.hero;
      if (id === "charge") {
        const target = this.findEnemyNear(hero.x, hero.y, 92, false);
        if (!target) {
          this.say("No nearby ground target for Charge.");
          return;
        }
        this.moveHeroTo(target.x, target.y);
        hero.commandTime = 0.45;
        this.damageEnemy(target, 85 + hero.level * 16, { hero: true, magic: true });
        this.flashText("CHARGE", hero.x, hero.y - 42, COLORS.gold);
      }
      if (id === "banner") {
        this.bannerTime = 8;
        this.flashText("BANNER", hero.x, hero.y - 42, "#fff1a0");
      }
      if (id === "heal") {
        hero.hp = Math.min(hero.maxHp, hero.hp + 110 + hero.level * 24);
        for (const soldier of this.soldiers) soldier.hp = Math.min(soldier.maxHp, soldier.hp + 70);
        this.flashText("HEAL", hero.x, hero.y - 42, "#9eff9c");
      }
      ability.ready = ability.cooldown;
      this.audio.play(id === "charge" ? "impact" : "ready", 0.32, id === "charge" ? 0.85 : 1.05);
    }

    respawnHero() {
      const point = this.nearestPathPoint(this.path[1].x, this.path[1].y);
      Object.assign(this.hero, {
        x: point.x,
        y: point.y,
        targetX: point.x,
        targetY: point.y,
        hp: this.hero.maxHp,
        dead: false,
        state: "active",
      });
      for (const obj of [this.hero.sprite, this.hero.barBg, this.hero.bar, this.hero.levelText]) obj.setVisible(true);
      this.say("Captain has returned.");
    }

    killHero() {
      const hero = this.hero;
      hero.dead = true;
      this.entityRegistry.transition(hero, "dead");
      hero.respawn = 9;
      hero.hp = 0;
      this.heroSelected = false;
      hero.ring.setVisible(false);
      for (const obj of [hero.sprite, hero.barBg, hero.bar, hero.levelText]) obj.setVisible(false);
      this.say("Captain is recovering.");
    }

    addHeroXp(amount) {
      const hero = this.hero;
      if (!hero || hero.dead) return;
      hero.xp += amount;
      const needed = hero.level * 35;
      if (hero.level < 5 && hero.xp >= needed) {
        hero.xp -= needed;
        hero.level += 1;
        hero.maxHp += 34;
        hero.hp = hero.maxHp;
        this.flashText(`HERO L${hero.level}`, hero.x, hero.y - 38, COLORS.gold);
      }
    }

    moveSoldierToward(soldier, x, y, stopDistance, dt) {
      const d = Phaser.Math.Distance.Between(soldier.x, soldier.y, x, y);
      if (d <= stopDistance) return;
      const step = Math.min(d - stopDistance, 52 * dt);
      soldier.x += ((x - soldier.x) / d) * step;
      soldier.y += ((y - soldier.y) / d) * step;
    }

    spawnSoldier(tower) {
      const point = { x: tower.rallyX, y: tower.rallyY };
      const maxHp = TOWERS.barracks.soldierHp[tower.level];
      const soldier = this.entityRegistry.create("soldier", {
        x: point.x,
        y: point.y,
        homeX: point.x,
        homeY: point.y,
        hp: maxHp,
        maxHp,
        tower,
        attackCooldown: 0.2,
        dead: false,
      });
      soldier.sprite = this.add.image(soldier.x, soldier.y - 6, "soldier_guard").setScale(0.82).setDepth(44);
      soldier.bar = this.add.rectangle(soldier.x - 10, soldier.y - 17, 20, 3, 0x7ee06a).setOrigin(0, 0.5).setDepth(45);
      tower.soldiers.push(soldier);
      this.soldiers.push(soldier);
    }

    nearestPathPoint(x, y) {
      let best = this.path[1];
      let bestD = Infinity;
      for (let i = 0; i < this.path.length - 1; i += 1) {
        const p = closestPointOnSegment({ x, y }, this.path[i], this.path[i + 1]);
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
      if (
        this.hero &&
        !this.hero.dead &&
        Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y) < enemy.base.size + 14
      ) {
        return this.hero;
      }
      for (const s of this.soldiers) {
        if (!s.dead && Phaser.Math.Distance.Between(enemy.x, enemy.y, s.x, s.y) < enemy.base.size + 12) return s;
      }
      return null;
    }

    enemyMelee(enemy, soldier, dt) {
      const damage = (enemy.type === "boss" ? 34 : enemy.type === "titan" ? 18 : 8) * dt;
      const mitigated = soldier.holdFast && soldier.holdFast > 0 ? damage * 0.55 : damage;
      if (soldier.holdFast) soldier.holdFast = Math.max(0, soldier.holdFast - dt);
      soldier.hp -= soldier.isHero ? mitigated * 0.7 : mitigated;
      if (soldier.hp <= 0) {
        if (soldier.isHero) this.killHero();
        else this.killSoldier(soldier);
      }
    }

    killSoldier(soldier) {
      this.entityRegistry.transition(soldier, "dead");
      soldier.dead = true;
      const tower = soldier.tower;
      if (tower && window.KRCBarracksReadiness) {
        const alive = tower.soldiers.filter((s) => s !== soldier && !s.dead).length;
        const wanted = window.KRCBarracksReadiness.wantedCount(tower.level);
        if (alive < wanted && tower.cooldown <= 0) {
          tower.trainMax = window.KRCBarracksReadiness.respawnCooldown(tower.level);
          tower.cooldown = tower.trainMax;
        }
        this.flashText("FALLEN", soldier.x, soldier.y - 24, "#f0a0a0");
        this.refreshBarracksReadiness(tower, alive, wanted);
      }
      soldier.sprite.destroy();
      soldier.bar.destroy();
      this.soldiers = this.soldiers.filter((s) => s !== soldier);
      soldier.tower.soldiers = soldier.tower.soldiers.filter((s) => s !== soldier);
      this.entityRegistry.transition(soldier, "removed");
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
          this.audio.tone(150, 0.07, "sawtooth", 0.04);
          return;
        }
        this.explode(target.x, target.y, 72, 270, true);
        this.flashText("METEOR", target.x, target.y - 50, "#ffd37a");
      }
      if (id === "frost") {
        if (!this.enemies.length) {
          this.say("No enemies to freeze.");
          this.audio.tone(150, 0.07, "sawtooth", 0.04);
          return;
        }
        for (const enemy of this.enemies) enemy.slow = Math.max(enemy.slow, 4.2);
        this.flashText("FROST", W / 2, 312, "#aee9ff");
        this.cameras.main.flash(140, 130, 210, 255, false);
      }
      if (id === "rally") {
        this.rallyTime = 7;
        this.flashText("RALLY", W / 2, 312, "#fff1a0");
      }
      spell.ready = spell.cooldown;
      this.audio.play(id === "meteor" ? "boom" : "magic", id === "meteor" ? 0.4 : 0.28, id === "frost" ? 0.78 : 1.1);
    }

    updateSpells(dt) {
      for (const spell of Object.values(this.spells)) spell.ready = Math.max(0, spell.ready - dt);
      for (const b of this.spellButtons || []) {
        const s = this.spells[b.spell];
        b.setLabel(s.ready > 0 ? `${b.label}\n${Math.ceil(s.ready)}` : b.label);
        b.setAlpha(s.ready > 0 ? 0.55 : 1);
        const pct = s.ready > 0 ? 1 - s.ready / s.cooldown : 1;
        b.cooldownBar.width = Math.max(1, 78 * pct);
        b.cooldownBar.setFillStyle(s.ready > 0 ? 0x84a9c7 : 0xaee9ff, s.ready > 0 ? 0.65 : 0.95);
      }
      for (const b of this.heroButtons || []) {
        const ability = this.heroAbilities[b.ability];
        b.setLabel(ability.ready > 0 ? `${b.label}\n${Math.ceil(ability.ready)}` : b.label);
        b.setAlpha(ability.ready > 0 ? 0.55 : 1);
        const pct = ability.ready > 0 ? 1 - ability.ready / ability.cooldown : 1;
        b.cooldownBar.width = Math.max(1, 84 * pct);
        b.cooldownBar.setFillStyle(ability.ready > 0 ? 0xa98f44 : 0xf5d76e, ability.ready > 0 ? 0.65 : 0.95);
      }
    }

    puff(x, y, color) {
      const count = this.settings?.reducedMotion ? 2 : 8;
      for (let i = 0; i < count; i += 1) {
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
      if (this.settings?.reducedMotion) {
        this.time.delayedCall(520, () => t.destroy());
        return;
      }
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
      this.mapText.setText(`${this.map.name} ${this.mapIndex + 1}/${MAPS.length}`);
      const remaining = this.waveActive ? this.queue.length + this.enemies.length : 0;
      const progress = this.waveTotal > 0 ? 1 - remaining / this.waveTotal : this.waveIndex / WAVES.length;
      this.waveBar.width = Math.max(1, 86 * Phaser.Math.Clamp(progress, 0, 1));
      this.callButton.setAlpha(this.waveActive || this.gameEnded ? 0.45 : 1);
      this.callButton.setLabel(this.waveActive ? "LIVE" : "CALL");
      this.infoText.setText(this.infoLine());
      for (const b of this.shopButtons) {
        const cfg = TOWERS[b.type];
        b.setAlpha(this.gold >= cfg.cost || this.selectedBuild === b.type ? 1 : 0.48);
      }
      if (this.qaMode) {
        document.body.dataset.krcWave = String(this.waveIndex);
        document.body.dataset.krcEnemies = String(this.enemies.length);
        document.body.dataset.krcQueue = String(this.queue.length);
        document.body.dataset.krcTowers = String(this.towers.length);
        document.body.dataset.krcLives = String(this.lives);
      }
    }

    infoLine() {
      if (this.heroSelected) {
        const hero = this.hero;
        if (!hero || hero.dead) return "Captain is recovering — wait for respawn.";
        return `Captain L${hero.level} HP ${Math.ceil(hero.hp)}/${hero.maxHp}. Tap road to move. CHG/BAN/HEAL below.`;
      }
      if (this.selectedBuild) {
        const cfg = TOWERS[this.selectedBuild];
        const dmg = cfg.damage[0];
        const range = cfg.range[0];
        const afford = this.gold >= cfg.cost ? "affordable" : `need ${cfg.cost - this.gold}g more`;
        return `${cfg.name} ${cfg.cost}g (${afford}) · dmg ${dmg} · rng ${range} · ${cfg.shopLabel}: ${cfg.role}`;
      }
      if (this.selectedPad?.tower) {
        const tower = this.selectedPad.tower;
        const cfg = TOWERS[tower.type];
        const dmg = cfg.damage[tower.level];
        const rate = cfg.rate[tower.level];
        const range = cfg.range[tower.level];
        const ability = window.KRCTowerAbilities?.getAbility(tower.type);
        const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
        const spent = cfg.cost + cfg.upgrades.slice(0, tower.level).reduce((a, b) => a + b, 0);
        const refund = Math.floor(spent * 0.55);
        const up = tower.level < cfg.upgrades.length ? `Up ${cfg.upgrades[tower.level]}g` : "MAX";
        const ab = unlocked ? ` · ${ability.name} ${Math.ceil(tower.abilityCooldown || 0) > 0 ? Math.ceil(tower.abilityCooldown) + "s" : "ready"}` : "";
        return `${cfg.name} L${tower.level + 1}: dmg ${dmg} / ${rate.toFixed(2)}s / rng ${range}. ${up}. Sell ${refund}g.${ab}`;
      }
      if (this.waveActive) return `${this.queue.length} queued, ${this.enemies.length} alive. Defend the gate.`;
      if (this.waveIndex === 0 && this.towers.length < 2) return "Tutorial: build two towers on the round pads, then CALL the first wave.";
      return "Tap CALL for early-wave gold, upgrade towers, or command Captain.";
    }

    endGame(victory) {
      if (this.gameEnded) return;
      this.gameEnded = true;
      const stars = victory ? this.computeStars() : 0;
      if (victory) {
        window.KRCCampaign.save(window.KRCCampaign.recordWin(this.campaign, this.mapIndex, stars, this.gold));
      }
      this.overlayActive = true;
      const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.88).setDepth(600);
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setDepth(600.5).setInteractive();
      const title = this.add
        .text(W / 2, 230, victory ? "VICTORY" : "GATE LOST", {
          font: "bold 44px Arial",
          color: victory ? COLORS.gold : "#ff7f69",
        })
        .setOrigin(0.5)
        .setDepth(601);
      const starLine = victory ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}  ${stars}/3 stars` : `Reached wave ${this.waveIndex + 1}`;
      const sub = this.add
        .text(W / 2, 292, victory ? `Campaign complete. ${starLine}` : starLine, {
          font: "18px Arial",
          color: COLORS.ink,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(601);
      const btnShadow = this.add.rectangle(W / 2, 406, 180, 54, 0x050704, 0.62).setDepth(601);
      const btn = this.add.rectangle(W / 2, 400, 180, 54, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282).setDepth(601.2);
      const btnShine = this.add.rectangle(W / 2, 387, 166, 12, 0xffffff, 0.17).setDepth(601.4);
      const btnLip = this.add.rectangle(W / 2, 418, 166, 9, 0x000000, 0.2).setDepth(601.4);
      const txt = this.add.text(W / 2, 398, "MAP SELECT", { font: "bold 18px Arial", color: "#fff7dc" }).setOrigin(0.5).setDepth(602);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.audio.stopAll();
        this.overlayActive = false;
        this.scene.restart({ mapIndex: 0, gold: 280, lives: 20 });
      });
      this.audio.stopMusic();
      this.audio.play(victory ? "ready" : "fail", 0.5, victory ? 0.9 : 1);
      return [shade, blocker, title, sub, btnShadow, btn, btnShine, btnLip, txt];
    }

    computeStars() {
      if (this.lives >= 16) return 3;
      if (this.lives >= 10) return 2;
      return 1;
    }

    showMapClearOverlay(stars) {
      this.overlayActive = true;
      this.overlay = this.add.container(0, 0).setDepth(580);
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.86));
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive());
      this.overlay.add(this.add.text(W / 2, 220, `${this.map.name} CLEARED`, { font: "bold 28px Arial", color: COLORS.gold }).setOrigin(0.5));
      this.overlay.add(
        this.add
          .text(W / 2, 270, `${"★".repeat(stars)}${"☆".repeat(3 - stars)}  ${stars}/3 stars`, {
            font: "22px Arial",
            color: "#fff2ba",
          })
          .setOrigin(0.5)
      );
      this.overlay.add(
        this.add
          .text(W / 2, 318, "Next map unlocked. Carry some gold and lives forward.", {
            font: "14px Arial",
            color: "#cfc4a2",
            align: "center",
            wordWrap: { width: 320 },
          })
          .setOrigin(0.5)
      );
      const next = this.add.rectangle(W / 2, 400, 200, 52, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282);
      const nextText = this.add.text(W / 2, 398, "NEXT MAP", { font: "bold 18px Arial", color: "#fff7dc" }).setOrigin(0.5);
      next.setInteractive({ useHandCursor: true });
      next.on("pointerdown", () => {
        this.overlayActive = false;
        this.overlay.destroy();
        this.scene.restart({
          mapIndex: this.mapIndex + 1,
          gold: Math.min(this.gold + 180, 650),
          lives: Math.min(20, this.lives + 4),
        });
      });
      const menu = this.add.rectangle(W / 2, 468, 200, 40, 0x334657, 1).setStrokeStyle(2, 0xb9d7ec, 0.7);
      const menuText = this.add.text(W / 2, 466, "MAP SELECT", { font: "bold 14px Arial", color: "#e8f5ff" }).setOrigin(0.5);
      menu.setInteractive({ useHandCursor: true });
      menu.on("pointerdown", () => {
        this.overlayActive = false;
        this.overlay.destroy();
        this.scene.restart({ mapIndex: 0, gold: 280, lives: 20 });
      });
      this.overlay.add([next, nextText, menu, menuText]);
    }
  }

  class SoundBox {
    constructor(scene) {
      this.scene = scene;
      this.ctx = null;
      this.musicClock = 0;
      this.musicStep = 0;
      this.musicStarted = false;
      this.muted = false;
      this.samples = {};
      const keys = ["shoot", "impact", "boom", "start", "ready", "fail", "magic", "music"];
      for (const key of keys) {
        if (scene.cache.audio.exists(`sfx_${key}`)) {
          this.samples[key] = scene.sound.add(`sfx_${key}`, {
            volume: key === "music" ? 0.11 : 0.32,
            loop: key === "music",
          });
        }
      }
    }

    setMuted(value) {
      this.muted = !!value;
      this.scene.sound.mute = this.muted;
      if (this.muted) this.stopMusic();
    }

    resume() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (this.scene?.sound?.locked) this.scene.sound.unlock();
      if (this.scene?.sound?.context?.state === "suspended") {
        this.scene.sound.context.resume().catch(() => {});
      }
      if (!Ctx) return;
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    }

    play(name, volume = 0.25, rate = 1) {
      if (this.muted) return;
      const sample = this.samples[name];
      if (!sample) {
        this.tone(name === "boom" ? 120 : name === "magic" ? 520 : 320, 0.08, name === "boom" ? "sawtooth" : "triangle", volume * 0.12);
        return;
      }
      try {
        sample.play({ volume, rate });
      } catch (_e) {
        this.tone(name === "boom" ? 120 : 320, 0.08, "triangle", volume * 0.12);
      }
    }

    startMusic() {
      if (this.muted) return;
      const music = this.samples.music;
      if (!music || this.musicStarted) return;
      this.musicStarted = true;
      try {
        music.play({ volume: 0.09, loop: true });
      } catch (_e) {
        this.musicStarted = false;
      }
    }

    stopMusic() {
      const music = this.samples.music;
      if (music?.isPlaying) music.stop();
      this.musicStarted = false;
    }

    stopAll() {
      for (const sample of Object.values(this.samples)) {
        if (sample?.isPlaying) sample.stop();
      }
      this.musicStarted = false;
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
      if (this.musicStarted) {
        const music = this.samples.music;
        if (music?.isPlaying) {
          const targetRate = urgent ? 1.12 : 0.96;
          const targetVol = urgent ? 0.14 : 0.09;
          music.setRate(Phaser.Math.Linear(music.rate || 1, targetRate, Math.min(1, dt * 2.5)));
          music.setVolume(Phaser.Math.Linear(music.volume || 0.09, targetVol, Math.min(1, dt * 2.2)));
        }
        return;
      }
      if (!this.ctx) return;
      this.musicClock -= dt;
      if (this.musicClock > 0) return;
      const base = urgent ? 0.72 : 1.6;
      this.musicClock = base;
      const notes = urgent ? [146, 174, 196, 220, 174] : [130, 164, 196, 164];
      const note = notes[this.musicStep % notes.length];
      this.musicStep += 1;
      this.tone(note, urgent ? 0.055 : 0.09, "triangle", urgent ? 0.014 : 0.007);
      if (urgent) this.tone(note * 1.5, 0.03, "sine", 0.004, 0.02);
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
