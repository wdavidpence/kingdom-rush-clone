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
      this.gold = this.startData?.gold ?? 260;
      this.lives = this.startData?.lives ?? 18;
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
      const make = (key, w, h, draw) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        const texture = this.textures.createCanvas(key, w, h);
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h);
        texture.refresh();
      };

      const ellipse = (ctx, x, y, rx, ry, fill, stroke = null, line = 1) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = line;
          ctx.stroke();
        }
      };
      const rounded = (ctx, x, y, w, h, r, fill, stroke = null, line = 1) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = line;
          ctx.stroke();
        }
      };
      const poly = (ctx, points, fill, stroke = null, line = 1) => {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = line;
          ctx.stroke();
        }
      };
      const gradient = (ctx, x0, y0, x1, y1, stops) => {
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        for (const [pos, color] of stops) grad.addColorStop(pos, color);
        return grad;
      };

      const tower = (key, cfg) =>
        make(key, 72, 72, (ctx) => {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ellipse(ctx, 36, 58, 27, 8, "rgba(0,0,0,.34)");
          rounded(ctx, 18, 31, 36, 26, 6, gradient(ctx, 18, 31, 54, 58, [[0, cfg.wallHi], [0.55, cfg.wall], [1, cfg.wallLo]]), "#2b2418", 2.2);
          for (let x = 23; x <= 45; x += 10) {
            ctx.strokeStyle = "rgba(255,238,190,.23)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 34);
            ctx.lineTo(x - 3, 53);
            ctx.stroke();
          }
          poly(ctx, [[11, 32], [36, 9], [61, 32]], gradient(ctx, 11, 9, 61, 35, [[0, cfg.roofHi], [0.55, cfg.roof], [1, cfg.roofLo]]), "#21170f", 2.5);
          ctx.strokeStyle = cfg.trim;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(16, 31);
          ctx.lineTo(36, 13);
          ctx.lineTo(56, 31);
          ctx.stroke();
          rounded(ctx, 29, 41, 14, 17, 4, "#1d160f", "rgba(255,238,180,.24)", 1);
          ctx.fillStyle = "rgba(255,255,255,.2)";
          ctx.fillRect(23, 35, 19, 3);
          if (cfg.mark === "archer") {
            ctx.strokeStyle = "#f4e6ad";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(36, 25, 10, -1.35, 1.35);
            ctx.stroke();
            ctx.strokeStyle = "#5a351e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(36, 14);
            ctx.lineTo(36, 36);
            ctx.stroke();
            poly(ctx, [[43, 23], [58, 19], [48, 29]], "#d7b35f", "#5a351e", 1);
          } else if (cfg.mark === "mage") {
            ellipse(ctx, 36, 26, 12, 12, "rgba(118,105,255,.35)", "#e2d6ff", 3);
            ctx.strokeStyle = "#f2eaff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(27, 33);
            ctx.lineTo(36, 16);
            ctx.lineTo(45, 33);
            ctx.moveTo(29, 27);
            ctx.lineTo(43, 27);
            ctx.stroke();
          } else if (cfg.mark === "artillery") {
            rounded(ctx, 28, 16, 17, 18, 5, "#3a2b20", "#f5c877", 2);
            ctx.strokeStyle = "#1a120d";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(42, 20);
            ctx.lineTo(58, 13);
            ctx.stroke();
            ellipse(ctx, 59, 13, 4, 4, "#ffcf72", "#51311e", 1.5);
          } else {
            rounded(ctx, 26, 18, 20, 20, 6, gradient(ctx, 26, 18, 46, 38, [[0, "#fff0a8"], [1, "#9d7d37"]]), "#3c2d19", 2);
            ctx.strokeStyle = "#5a421e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(36, 20);
            ctx.lineTo(36, 37);
            ctx.moveTo(28, 28);
            ctx.lineTo(44, 28);
            ctx.stroke();
          }
        });

      tower("tower_archer", { wallHi: "#7fa257", wall: "#567c3f", wallLo: "#314b2c", roofHi: "#a5d065", roof: "#6fa546", roofLo: "#3e6f32", trim: "#f5e7a6", mark: "archer" });
      tower("tower_mage", { wallHi: "#8375d8", wall: "#524994", wallLo: "#2e2c63", roofHi: "#b6a9ff", roof: "#7867db", roofLo: "#463b90", trim: "#eadfff", mark: "mage" });
      tower("tower_artillery", { wallHi: "#a87943", wall: "#78512f", wallLo: "#46311f", roofHi: "#e7a950", roof: "#b87431", roofLo: "#6e421f", trim: "#ffdf9a", mark: "artillery" });
      tower("tower_barracks", { wallHi: "#9d8746", wall: "#736138", wallLo: "#433722", roofHi: "#ead26a", roof: "#b99c43", roofLo: "#725b28", trim: "#fff0aa", mark: "barracks" });

      const enemy = (key, cfg) =>
        make(key, 72, 62, (ctx) => {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ellipse(ctx, 36, 48, cfg.shadow || 22, 7, "rgba(0,0,0,.32)");
          if (cfg.kind === "flyer") {
            ellipse(ctx, 20, 25, 17, 8, "rgba(206,247,255,.48)", "#9beaff", 1.4);
            ellipse(ctx, 52, 25, 17, 8, "rgba(206,247,255,.48)", "#9beaff", 1.4);
          }
          if (cfg.kind === "shield") rounded(ctx, 20, 31, 32, 19, 6, gradient(ctx, 20, 31, 52, 50, [[0, "#eef4f5"], [1, "#7a8794"]]), "#3a4450", 2);
          const body = gradient(ctx, 18, 12, 54, 46, [[0, cfg.hi], [0.45, cfg.mid], [1, cfg.lo]]);
          if (cfg.kind !== "flyer") {
            poly(ctx, [[20, 37], [14, 43], [25, 42]], cfg.lo, cfg.outline, 1);
            poly(ctx, [[52, 37], [58, 43], [47, 42]], cfg.lo, cfg.outline, 1);
          }
          ellipse(ctx, 36, 29, cfg.rx, cfg.ry, body, cfg.outline, 2.5);
          if (cfg.kind === "scout") {
            poly(ctx, [[23, 22], [14, 16], [19, 29]], cfg.mid, cfg.outline, 1.2);
            poly(ctx, [[49, 22], [58, 16], [53, 29]], cfg.mid, cfg.outline, 1.2);
          }
          ellipse(ctx, 28, 25, 2.2, 2.6, "#f6f0c2");
          ellipse(ctx, 44, 25, 2.2, 2.6, "#f6f0c2");
          ellipse(ctx, 29, 25, 1.2, 1.5, "#11100b");
          ellipse(ctx, 43, 25, 1.2, 1.5, "#11100b");
          ctx.strokeStyle = "#17130e";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(24, 20);
          ctx.lineTo(32, 23);
          ctx.moveTo(48, 20);
          ctx.lineTo(40, 23);
          ctx.stroke();
          ctx.strokeStyle = cfg.outline;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(30, 36);
          ctx.lineTo(43, 34);
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,.22)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(30, 20, 7, Math.PI, Math.PI * 1.55);
          ctx.stroke();
          if (cfg.kind === "brute" || cfg.kind === "titan" || cfg.kind === "boss") {
            rounded(ctx, 21, 11, 30, 8, 3, cfg.outline, "#24180f", 1.4);
            ellipse(ctx, 22, 12, 5, 6, cfg.horn || "#e6d0aa", "#33261c", 1);
            ellipse(ctx, 50, 12, 5, 6, cfg.horn || "#e6d0aa", "#33261c", 1);
          }
          if (cfg.kind === "ember") {
            poly(ctx, [[36, 2], [26, 22], [35, 17], [31, 34], [47, 13], [39, 17]], "#ffd166", "#7d2d1c", 1.4);
            ellipse(ctx, 36, 31, 9, 13, "rgba(255,213,89,.35)");
          }
          if (cfg.kind === "boss") {
            ellipse(ctx, 36, 10, 10, 5, "#f1d2ff", "#5d2870", 1.5);
            ctx.strokeStyle = "#f1d2ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(26, 10);
            ctx.lineTo(20, 2);
            ctx.moveTo(46, 10);
            ctx.lineTo(52, 2);
            ctx.stroke();
          }
        });

      enemy("enemy_scout", { kind: "scout", rx: 15, ry: 15, hi: "#d7f187", mid: "#9dce56", lo: "#537b34", outline: "#345122" });
      enemy("enemy_brute", { kind: "brute", rx: 18, ry: 17, hi: "#f2bf78", mid: "#c5773d", lo: "#6b3f27", outline: "#5a321f" });
      enemy("enemy_shield", { kind: "shield", rx: 17, ry: 16, hi: "#d9e1e8", mid: "#aab5bf", lo: "#66727f", outline: "#46515d" });
      enemy("enemy_ember", { kind: "ember", rx: 16, ry: 17, hi: "#ffb066", mid: "#e45f3c", lo: "#7d2d1c", outline: "#662216" });
      enemy("enemy_brood", { kind: "scout", rx: 14, ry: 14, hi: "#efa4c1", mid: "#bd6688", lo: "#65314b", outline: "#482033" });
      enemy("enemy_flyer", { kind: "flyer", rx: 14, ry: 14, hi: "#c8f6ff", mid: "#69cbe8", lo: "#2c7195", outline: "#245d78", shadow: 16 });
      enemy("enemy_titan", { kind: "titan", rx: 21, ry: 20, hi: "#b4aaa1", mid: "#81776e", lo: "#49413b", outline: "#342c27", horn: "#d7c3a4", shadow: 27 });
      enemy("enemy_boss", { kind: "boss", rx: 25, ry: 23, hi: "#f08cff", mid: "#a948c6", lo: "#55256b", outline: "#3b174c", horn: "#f1d2ff", shadow: 31 });

      make("projectile_arrow", 34, 18, (ctx) => {
        poly(ctx, [[2, 9], [24, 3], [16, 9], [24, 15]], "#f8e8a0", "#5a371e", 1.1);
        ctx.strokeStyle = "#6f4a27";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(7, 9);
        ctx.lineTo(31, 9);
        ctx.stroke();
      });
      make("projectile_magic", 24, 24, (ctx) => {
        ellipse(ctx, 12, 12, 10, 10, "rgba(156,140,255,.55)", "#eadfff", 2);
        ellipse(ctx, 12, 12, 5, 5, "#f4eeff");
      });
      make("projectile_bomb", 28, 28, (ctx) => {
        ellipse(ctx, 13, 15, 10, 10, gradient(ctx, 5, 5, 22, 24, [[0, "#5a4b3b"], [1, "#17110d"]]), "#0b0806", 1.5);
        ellipse(ctx, 19, 7, 4, 4, "#ffbd58", "#69381d", 1);
        ctx.strokeStyle = "#ffe0a6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 5);
        ctx.lineTo(25, 1);
        ctx.stroke();
      });
      make("soldier_guard", 44, 48, (ctx) => {
        ellipse(ctx, 22, 42, 16, 5, "rgba(0,0,0,.3)");
        ellipse(ctx, 22, 13, 8, 8, gradient(ctx, 14, 5, 30, 21, [[0, "#fff0a8"], [1, "#a9873f"]]), "#3e2d18", 1.8);
        rounded(ctx, 12, 21, 20, 18, 5, gradient(ctx, 12, 21, 32, 39, [[0, "#8f7542"], [1, "#4f3b22"]]), "#2e2115", 1.8);
        rounded(ctx, 25, 18, 13, 17, 4, gradient(ctx, 25, 18, 38, 35, [[0, "#fff2b0"], [1, "#8f7134"]]), "#3e2d18", 1.6);
        ctx.strokeStyle = "#d9c57d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(9, 24);
        ctx.lineTo(4, 33);
        ctx.moveTo(33, 25);
        ctx.lineTo(40, 17);
        ctx.stroke();
        ellipse(ctx, 19, 12, 1.5, 1.8, "#15120c");
        ellipse(ctx, 25, 12, 1.5, 1.8, "#15120c");
      });
      make("hero_captain", 54, 58, (ctx) => {
        ellipse(ctx, 27, 51, 20, 6, "rgba(0,0,0,.35)");
        rounded(ctx, 17, 24, 22, 24, 6, gradient(ctx, 17, 24, 39, 49, [[0, "#3f6fb4"], [0.55, "#274b7d"], [1, "#172d4d"]]), "#101b2f", 2);
        ellipse(ctx, 27, 15, 10, 10, gradient(ctx, 17, 5, 37, 25, [[0, "#ffe1a8"], [1, "#b47a45"]]), "#4a2d1c", 1.8);
        rounded(ctx, 16, 5, 22, 8, 3, "#d8b85d", "#4a351a", 1.5);
        poly(ctx, [[27, 0], [20, 8], [34, 8]], "#f0d47a", "#4a351a", 1.2);
        ellipse(ctx, 23, 14, 1.4, 1.8, "#10100b");
        ellipse(ctx, 31, 14, 1.4, 1.8, "#10100b");
        rounded(ctx, 32, 22, 14, 20, 5, gradient(ctx, 32, 22, 46, 42, [[0, "#f4e6a8"], [1, "#8d6f31"]]), "#3e2d18", 1.8);
        ctx.strokeStyle = "#e9d790";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(14, 27);
        ctx.lineTo(7, 42);
        ctx.moveTo(38, 26);
        ctx.lineTo(49, 12);
        ctx.stroke();
        ctx.strokeStyle = "#f7f0c4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(49, 12);
        ctx.lineTo(51, 3);
        ctx.stroke();
      });
      make("tree_pine", 40, 56, (ctx) => {
        ellipse(ctx, 20, 49, 14, 4, "rgba(0,0,0,.22)");
        rounded(ctx, 17, 34, 6, 15, 2, "#5a3d24");
        poly(ctx, [[20, 4], [6, 28], [14, 25], [4, 40], [36, 40], [26, 25], [34, 28]], gradient(ctx, 8, 4, 32, 42, [[0, "#6f9b4c"], [1, "#244522"]]), "#162c16", 1.3);
        ctx.strokeStyle = "rgba(219,240,169,.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, 13);
        ctx.lineTo(13, 27);
        ctx.moveTo(24, 24);
        ctx.lineTo(30, 36);
        ctx.stroke();
      });
      make("rock_moss", 28, 20, (ctx) => {
        ellipse(ctx, 14, 14, 12, 5, "rgba(0,0,0,.22)");
        rounded(ctx, 5, 4, 19, 11, 5, gradient(ctx, 4, 4, 24, 17, [[0, "#8d9184"], [1, "#464c42"]]), "#2f352d", 1.2);
        ellipse(ctx, 10, 7, 5, 2, "rgba(166,205,108,.5)");
      });
    }

    drawMap() {
      this.add.rectangle(W / 2, H / 2, W, H, this.map.grass).setDepth(-20);
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

      this.add.text(MAP_LAYOUT.entryLabelX, MAP_LAYOUT.entryLabelY, "IN", { font: "bold 12px Arial", color: "#24170e" }).setDepth(-7);
      this.add.text(MAP_LAYOUT.gateX - 30, MAP_LAYOUT.gateY - 11, "GATE", { font: "bold 12px Arial", color: "#24170e" }).setDepth(-7);

      for (let i = 0; i < 26; i += 1) {
        const x = 24 + ((i * 91) % 372);
        const y = 88 + ((i * 137) % 520);
        const nearRoad = this.path.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 46);
        if (nearRoad) continue;
        this.add.image(x, y - 10, "tree_pine").setScale(0.72 + (i % 3) * 0.08).setDepth(-15);
      }
      for (let i = 0; i < 18; i += 1) {
        const x = 18 + ((i * 67) % 384);
        const y = 92 + ((i * 59) % 516);
        if (i % 3 === 0) this.add.image(x, y, "rock_moss").setScale(0.72).setDepth(-6);
        else this.add.circle(x, y, 2, i % 2 ? 0xeed27a : 0xbadf7b, 0.75).setDepth(-6);
      }
      this.add.rectangle(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY, MAP_LAYOUT.gateWidth, MAP_LAYOUT.gateHeight, 0x57402c, 1).setStrokeStyle(3, 0x2d2117).setDepth(-5);
      this.add.rectangle(MAP_LAYOUT.gateX, MAP_LAYOUT.gateY, MAP_LAYOUT.gateInnerWidth, MAP_LAYOUT.gateInnerHeight, 0x15100c, 0.9).setDepth(-4);
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
        pad.base = this.add.circle(pad.x, pad.y, 25, 0x1a2215, 0.95).setStrokeStyle(3, 0xb19b58, 0.9);
        pad.icon = this.add.text(pad.x, pad.y - 1, "+", { font: "bold 26px Arial", color: "#e8dca8" }).setOrigin(0.5);
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
      this.hero.sprite = this.add.image(post.x, post.y - 8, "hero_captain").setScale(0.78).setDepth(46);
      this.hero.barBg = this.add.rectangle(post.x, post.y - 31, 30, 4, 0x2a120e).setDepth(47);
      this.hero.bar = this.add.rectangle(post.x - 15, post.y - 31, 30, 4, 0x5fd86f).setOrigin(0, 0.5).setDepth(48);
      this.hero.levelText = this.add
        .text(post.x, post.y + 18, "H1", { font: "bold 9px Arial", color: "#fff2ba" })
        .setOrigin(0.5)
        .setDepth(49);
    }

    createHud() {
      this.add.rectangle(W / 2, TOP_H / 2, W, TOP_H, 0x131b12, 0.96).setDepth(90);
      this.add.rectangle(W / 2, TOP_H, W, 2, 0x596f38).setDepth(91);
      this.goldText = this.add.text(12, 10, "", { font: "bold 18px Arial", color: COLORS.gold }).setDepth(100);
      this.livesText = this.add.text(138, 10, "", { font: "bold 18px Arial", color: "#ff8a73" }).setDepth(100);
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
      this.add.rectangle(W / 2, SHOP_Y, W, 2, 0x596f38).setDepth(91);
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
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.88));
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive();
      this.overlay.add(blocker);
      this.overlay.add(this.add.text(W / 2, 172, "KRC", { font: "bold 64px Arial", color: COLORS.gold }).setOrigin(0.5));
      this.overlay.add(
        this.add
          .text(W / 2, 236, `${this.map.name}: hold ten waves.`, {
            font: "18px Arial",
            color: COLORS.ink,
            align: "center",
            wordWrap: { width: 310 },
          })
          .setOrigin(0.5)
      );
      this.overlay.add(
        this.add
          .text(W / 2, 314, "Build on round pads. Tap the Captain, then tap the road to move him into trouble.", {
            font: "14px Arial",
            color: "#cfc4a2",
            align: "center",
            wordWrap: { width: 320 },
          })
          .setOrigin(0.5)
      );
      const startShadow = this.add.rectangle(W / 2, 436, 188, 56, 0x050704, 0.62).setStrokeStyle(1, 0x000000, 0.6);
      const start = this.add.rectangle(W / 2, 430, 188, 56, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282);
      const startShine = this.add.rectangle(W / 2, 416, 174, 12, 0xffffff, 0.17);
      const startLip = this.add.rectangle(W / 2, 448, 174, 9, 0x000000, 0.2);
      const startText = this.add.text(W / 2, 428, "TAP TO START", { font: "bold 19px Arial", color: "#fff7dc" }).setOrigin(0.5);
      const motion = this.add.rectangle(W / 2, 498, 188, 34, 0x334657, 1).setStrokeStyle(2, 0xb9d7ec, 0.7);
      const motionText = this.add
        .text(W / 2, 498, this.settings.reducedMotion ? "MOTION: REDUCED" : "MOTION: FULL", { font: "bold 13px Arial", color: "#e8f5ff" })
        .setOrigin(0.5);
      motion.setInteractive({ useHandCursor: true });
      motion.on("pointerdown", () => {
        const reduced = this.toggleReducedMotion();
        motionText.setText(reduced ? "MOTION: REDUCED" : "MOTION: FULL");
      });
      start.setInteractive({ useHandCursor: true });
      start.on("pointerdown", () => {
        this.audio.resume();
        this.audio.play("start", 0.45);
        this.audio.startMusic();
        this.overlayActive = false;
        this.overlay.destroy();
        this.say("Build two towers. Tap Captain to move him.");
      });
      this.overlay.add([startShadow, start, startShine, startLip, startText, motion, motionText]);
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
        pad.base.setStrokeStyle(active ? 4 : 3, active ? 0xf5d76e : 0xb19b58, 1);
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
      tower.sprite = this.add.image(pad.x, pad.y - 5, `tower_${type}`).setScale(0.72).setDepth(30);
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
      tower.sprite.setScale(0.72 + tower.level * 0.045);
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
      this.gold += Math.floor(spent * 0.55);
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
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
      if (tower.level >= cfg.upgrades.length && unlocked) {
        const cd = Math.ceil(Math.max(0, tower.abilityCooldown || 0));
        this.upgradeButton.setLabel(cd > 0 ? `${ability.name.slice(0, 3).toUpperCase()}\n${cd}s` : `${ability.name.slice(0, 3).toUpperCase()}\nRDY`);
      } else {
        this.upgradeButton.setLabel(tower.level >= cfg.upgrades.length ? "MAX" : `UP\n${cfg.upgrades[tower.level]}`);
      }
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
      this.gold += wave.gold;
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
          if (this.mapIndex < MAPS.length - 1) {
            this.audio.play("ready", 0.45);
            this.scene.restart({
              mapIndex: this.mapIndex + 1,
              gold: Math.min(this.gold + 180, 650),
              lives: Math.min(18, this.lives + 4),
            });
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
      enemy.sprite = this.add.image(enemy.x, enemy.y, `enemy_${type}`).setScale(base.size / 28).setDepth(40);
      enemy.nameText = this.add.text(enemy.x, enemy.y + 1, "", { font: "bold 10px Arial", color: "#102030" }).setOrigin(0.5).setDepth(41);
      enemy.barBg = this.add.rectangle(enemy.x, enemy.y - base.size - 8, 28, 4, 0x2a120e).setDepth(42);
      enemy.bar = this.add.rectangle(enemy.x - 14, enemy.y - base.size - 8, 28, 4, 0x68d764).setOrigin(0, 0.5).setDepth(43);
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
      enemy.sprite.y += Math.sin(this.time.now * 0.008 + enemy.wobble) * (enemy.base.flying ? 4 : 1.2);
      if (enemy.seg < this.path.length - 1) {
        const next = this.path[enemy.seg + 1];
        enemy.sprite.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, next.x, next.y) * 0.08;
      }
      enemy.barBg.setPosition(enemy.x, enemy.y - enemy.base.size - 8);
      enemy.bar.setPosition(enemy.x - 14, enemy.y - enemy.base.size - 8);
      enemy.bar.width = Math.max(1, 28 * (enemy.hp / enemy.maxHp));
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
      if (!source.magic) damage = Math.max(1, amount - enemy.base.armor * 3);
      if (enemy.type === "titan" || enemy.type === "boss") damage *= 0.86;
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
      for (const obj of [enemy.sprite, enemy.nameText, enemy.barBg, enemy.bar]) obj.destroy();
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
        tower.cooldown -= dt * (this.rallyTime > 0 ? 1.28 : 1);
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
      this.projectiles.push(projectile);
      this.audio.play(tower.type === "mage" ? "magic" : "shoot", tower.type === "artillery" ? 0.2 : 0.13, tower.type === "archer" ? 1.35 : 0.95);
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
      soldier.sprite = this.add.image(soldier.x, soldier.y - 4, "soldier_guard").setScale(0.78).setDepth(44);
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
      if (this.heroSelected) return "Captain: CHG hits a nearby enemy, BAN boosts melee, HEAL restores allies.";
      if (this.selectedBuild) {
        const cfg = TOWERS[this.selectedBuild];
        return `${cfg.name}: ${cfg.role}. ${cfg.targetRule}. ${cfg.counterplay}`;
      }
      if (this.selectedPad?.tower) {
        const tower = this.selectedPad.tower;
        const cfg = TOWERS[tower.type];
        return `${cfg.name} L${tower.level + 1}. ${
          tower.level < cfg.upgrades.length ? `Upgrade ${cfg.upgrades[tower.level]}g.` : "Fully upgraded."
        }`;
      }
      if (this.waveActive) return `${this.queue.length} enemies queued. Defend the gate.`;
      return "Tap CALL, build/upgrade, or tap Captain to move him.";
    }

    endGame(victory) {
      if (this.gameEnded) return;
      this.gameEnded = true;
      if (victory) {
        const stars = this.lives >= 14 ? 3 : this.lives >= 7 ? 2 : 1;
        window.KRCCampaign.save(window.KRCCampaign.recordWin(this.campaign, this.mapIndex, stars, this.gold));
      }
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
      const btnShadow = this.add.rectangle(W / 2, 426, 180, 54, 0x050704, 0.62).setDepth(601);
      const btn = this.add.rectangle(W / 2, 420, 180, 54, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282).setDepth(601.2);
      const btnShine = this.add.rectangle(W / 2, 407, 166, 12, 0xffffff, 0.17).setDepth(601.4);
      const btnLip = this.add.rectangle(W / 2, 438, 166, 9, 0x000000, 0.2).setDepth(601.4);
      const txt = this.add.text(W / 2, 418, "PLAY AGAIN", { font: "bold 18px Arial", color: "#fff7dc" }).setOrigin(0.5).setDepth(602);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.audio.stopAll();
        this.overlayActive = false;
        this.scene.restart();
      });
      this.audio.stopMusic();
      this.audio.play(victory ? "ready" : "fail", 0.5, victory ? 0.9 : 1);
      return [shade, blocker, title, sub, btnShadow, btn, btnShine, btnLip, txt];
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
        if (music?.isPlaying) music.setRate(urgent ? 1.06 : 0.94);
        return;
      }
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
