(() => {
  const KRC_SCRIPT = typeof document !== "undefined" ? document.currentScript : null;
  const KRC_VERSION = "1.4.3";
  window.KRC_VERSION = KRC_VERSION;
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

  const AftermathLedger = window.KRCAftermath?.AftermathLedger || class AftermathLedger {
    constructor(maxEntries = 48) {
      const cap = Number(maxEntries);
      this.maxEntries = Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : 48;
      this._clock = 0;
      this.entries = [];
    }
    record(event) {
      if (!event || typeof event !== "object") return null;
      if (!["corpse", "scorch", "arrow", "crater"].includes(event.kind)) return null;
      const stored = {
        kind: event.kind,
        x: Number(event.x) || 0,
        y: Number(event.y) || 0,
        t: Number.isFinite(event.t) ? event.t : this._clock,
        rot: Number(event.rot) || 0,
        kind2: event.kind2 == null ? null : String(event.kind2),
      };
      if (!Number.isFinite(event.t)) this._clock += 1;
      else if (event.t >= this._clock) this._clock = event.t + 1;
      this.entries.push(stored);
      while (this.entries.length > this.maxEntries) this.evictOldest();
      return stored;
    }
    evictOldest() {
      if (!this.entries.length) return null;
      return this.entries.shift();
    }
    capTo(maxKeep) {
      const cap = Math.max(0, Math.floor(Number(maxKeep)));
      const evicted = [];
      while (this.entries.length > cap) {
        const old = this.evictOldest();
        if (old) evicted.push(old);
      }
      return evicted;
    }
    snapshot() {
      return {
        maxEntries: this.maxEntries,
        clock: this._clock,
        entries: this.entries.map((entry) => ({
          kind: entry.kind, x: entry.x, y: entry.y, t: entry.t, rot: entry.rot, kind2: entry.kind2,
        })),
      };
    }
    restore(json) {
      let data = json;
      if (typeof json === "string") data = JSON.parse(json);
      this.entries = [];
      if (!data || typeof data !== "object") {
        this._clock = 0;
        return this;
      }
      if (Number.isFinite(data.maxEntries) && data.maxEntries > 0) this.maxEntries = Math.floor(data.maxEntries);
      this._clock = Number.isFinite(data.clock) ? data.clock : 0;
      const list = Array.isArray(data.entries) ? data.entries : Array.isArray(data) ? data : [];
      for (const event of list) {
        const stored = this.record({ ...event, t: Number.isFinite(event?.t) ? event.t : this._clock });
        if (stored && this.entries.length && this.entries[this.entries.length - 1] !== stored) {
          /* record already pushed */
        }
      }
      return this;
    }
  };

  class GameScene extends Phaser.Scene {
    constructor() {
      super("game");
    }

    init(data = {}) {
      this.startData = data;
    }

    preload() {
      if (new URLSearchParams(window.location.search).has("shot")) return;
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
      this.syncTalentMods();
      this.path = this.map.path;
      this.buildPads = this.map.pads.map((pad) => ({ ...pad, tower: null }));
      this.gold = Math.round((this.startData?.gold ?? 280) * (this.talentMods?.gold || 1));
      this.lives = this.startData?.lives ?? 20;
      this.lives += this.starBonusLives();
      let heroPick = this.startData?.heroKind || (typeof localStorage !== "undefined" ? localStorage.krc_hero_pick : null) || "captain";
      try {
        if (!this.startData?.heroKind && typeof localStorage !== "undefined") {
          heroPick = localStorage.getItem("krc_hero_pick") || localStorage.krc_hero_pick || heroPick;
        }
      } catch {
        /* ignore */
      }
      this.heroKind = heroPick === "sentinel" ? "sentinel" : "captain";
      if (this.qaMode && new URLSearchParams(window.location.search).get("hero") === "sentinel") {
        this.heroKind = "sentinel";
      }
      this.ironMode = this.startData?.ironMode === true;
      if (new URLSearchParams(window.location.search).get("iron") === "1") {
        this.ironMode = true;
      }
      if (this.ironMode) this.lives = 1;
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
      this.aftermathLedger = new AftermathLedger(48);
      this.aftermathMarks = [];
      this.killStreak = 0;
      this.killStreakUntil = 0;
      this.entityRegistry = window.KRCEntityState.createRegistry();
      this.selectedPad = null;
      this.selectedBuild = null;
      this.familyPathBtns = null;
      this.messageTimer = 0;
      this.gameEnded = false;
      this.paused = false;
      this.overlayActive = true;
      this.tooltip = null;
      this.tooltipText = "";
      this.audio = new SoundBox(this);
      this.events.once("shutdown", this.cleanupScene, this);
      this.settings = window.KRCSettings?.load?.() || { muted: false, reducedMotion: false, musicVolume: 0.6, sfxVolume: 1.0 };
      this.audio.setMuted(this.settings.muted);
      this.audio.setMix(this.settings.musicVolume, this.settings.sfxVolume);
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
      this.createWolfDen();
      this.createHero();
      this.createHud();
      this.createShop();
      this.showStartOverlay();
      document.body.setAttribute("data-krc", "overlay");
      const shotMode = new URLSearchParams(window.location.search).get("shot");
      document.body.setAttribute("data-shotmode", String(shotMode || "") + "@" + location.hostname);
      if (shotMode && (location.hostname === "127.0.0.1" || location.hostname === "localhost")) {
        if (shotMode === "battle") {
          this.beginMap(0);
          this.dismissMapBriefing?.();
          this.updateHud();
          if (this.buildPads[0]) this.buildTower(this.buildPads[0], "archer");
          if (this.buildPads[2]) this.buildTower(this.buildPads[2], "mage");
        }
        try {
          this.sys.game.step(performance.now(), 16);
          const data = this.game.canvas.toDataURL("image/png");
          document.body.setAttribute("data-png", String(data.length));
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "http://127.0.0.1:8799/", false);
          xhr.send(data);
          document.body.setAttribute("data-xhr", String(xhr.status));
        } catch (e) {
          document.body.setAttribute("data-err", String(e && e.message || e));
        }
      }
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
      this.clearFamilyPathPick?.();
      this.hideTooltip();
      this.dismissWaveBriefing?.();
      this.clearAftermath?.(true);
      if (this._cutscene?.destroy) {
        this._cutscene.destroy();
        this._cutscene = null;
      }
      this.input.off("pointerdown", this.handlePointer, this);
      this.audio?.stopAll?.();
      window.KRCSceneCleanup.destroyAll((this.effects || []).map((effect) => effect.obj));
      this.effects = [];
      this.projectiles = [];
      for (const enemy of this.enemies || []) {
        for (const obj of [
          enemy.nameText, enemy.barBg, enemy.bar, enemy.traitText, enemy.traitGlow,
          enemy.auraRing, enemy.shieldRing, enemy.hexMark, enemy.crownTell,
          enemy.emberGlow, enemy.fuseSpark, enemy.sprite,
          enemy.frostCrust, enemy.armorPlate, enemy.burnCrust
        ]) obj?.destroy();
      }
      this.enemies = [];
      this.soldiers = [];
      this.towers = [];
      this.queue = [];
      this.killStreak = 0;
      this.killStreakUntil = 0;
    }

    showTooltip(x, y, text) {
      if (this.settings?.reducedMotion || !text) return;
      this.hideTooltip();
      const lines = String(text).split("\n");
      const maxWidth = Math.max(...lines.map((l) => l.length)) * 7 + 24;
      const height = lines.length * 16 + 14;

      const clampedX = Phaser.Math.Clamp(x, maxWidth / 2 + 10, W - maxWidth / 2 - 10);
      const clampedY = Phaser.Math.Clamp(y, height / 2 + 10, H - height / 2 - 10);

      const shadow = this.add.rectangle(clampedX + 2, clampedY + 2, maxWidth, height, 0x000000, 0.5).setDepth(899);
      const bg = this.add.rectangle(clampedX, clampedY, maxWidth, height, 0x141c12, 0.96)
        .setStrokeStyle(1.5, 0xe6d282, 0.85)
        .setDepth(900);
      const highlight = this.add.rectangle(clampedX, clampedY - height / 2 + 1, maxWidth - 4, 1, 0xfff0a0, 0.3).setDepth(900.5);

      const texts = [];
      lines.forEach((line, i) => {
        const isHeader = i === 0;
        const t = this.add.text(clampedX - maxWidth / 2 + 10, clampedY - height / 2 + 7 + i * 16, line, {
          font: isHeader ? "bold 12px 'Source Sans 3', Arial" : "11px 'Source Sans 3', Arial",
          color: isHeader ? "#fff2ba" : "#e0dbca",
        }).setOrigin(0, 0).setDepth(901);
        texts.push(t);
      });

      this.tooltip = { bg, shadow, highlight, texts, x: clampedX, y: clampedY };
    }

    hideTooltip() {
      if (this.tooltip) {
        if (this.tooltip.shadow) this.tooltip.shadow.destroy();
        if (this.tooltip.bg) this.tooltip.bg.destroy();
        if (this.tooltip.highlight) this.tooltip.highlight.destroy();
        for (const t of this.tooltip.texts) t.destroy();
        this.tooltip = null;
      }
    }

    getUpgradeTooltip() {
      const tower = this.selectedPad?.tower;
      if (!tower) return "Upgrade Tower (U)\nSelect a placed tower on a build pad.";
      const cfg = TOWERS[tower.type];
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
      if (tower.level >= 3 && !tower.spec) {
        const opts = this.specOptions(tower.type) || [];
        const names = opts.map((s) => s.name).join(" / ");
        return `Specialize (260g)\n${names || "Pick a path"}\nReplaces the tier-5 upgrade.`;
      }
      if (tower.spec) {
        return `${cfg.name} — ${tower.spec.name}\nSpecialized. Sell refunds 55% of gold spent.`;
      }
      if (tower.level >= cfg.upgrades.length) {
        if (unlocked) {
          const cd = Math.ceil(Math.max(0, tower.abilityCooldown || 0));
          return `${cfg.name} Special Ability\n${ability.name}: ${ability.desc || "Active ability"}\n${cd > 0 ? "Cooldown: " + cd + "s" : "[READY TO FIRE]"}`;
        }
        return `${cfg.name} (MAX Level)\nFully upgraded to maximum power!`;
      }
      const cost = cfg.upgrades[tower.level];
      const curDmg = cfg.damage[tower.level];
      const nextDmg = cfg.damage[tower.level + 1];
      const curRng = cfg.range[tower.level];
      const nextRng = cfg.range[tower.level + 1];
      const afford = this.gold >= cost ? "Can afford" : `Need ${cost - this.gold}g more`;
      return `Upgrade to Level ${tower.level + 2} (${cost}g)\nDamage: ${curDmg} -> ${nextDmg}\nRange: ${curRng} -> ${nextRng}\nStatus: ${afford}`;
    }

    getSellTooltip() {
      const tower = this.selectedPad?.tower;
      if (!tower) return "Sell Tower (S)\nSelect a placed tower to sell for 55% refund.";
      const cfg = TOWERS[tower.type];
      const spent = this.towerInvestedGold(tower);
      const refund = Math.floor(spent * 0.55);
      return `Sell ${cfg.name} (L${tower.level + 1})\nRefund: +${refund} gold (55% of ${spent}g total invested).`;
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
      this.audio.music(dt, (this.waveActive && !this.gameEnded) || this.lives <= 8);
      this.audio.ambience(dt);
      this.updateHud();
    }

    makeTextures() {
      if (window.KRCArt?.bake) {
        window.KRCArt.bake(this);
      } else {
        const make = (key, w, h, draw) => {
          if (this.textures.exists(key)) this.textures.remove(key);
          const texture = this.textures.createCanvas(key, w, h);
          const ctx = texture.getContext();
          ctx.clearRect(0, 0, w, h);
          draw(ctx, w, h);
          texture.refresh();
        };
        const makeFallbackTower = (key, color) => {
          make(key, 32, 32, (ctx) => { ctx.fillStyle = color; ctx.fillRect(4, 4, 24, 24); });
        };
        makeFallbackTower("tower_archer", "#6fa546");
        makeFallbackTower("tower_archer_idle", "#6fa546");
        makeFallbackTower("tower_archer_l2", "#6fa546");
        makeFallbackTower("tower_archer_l3", "#6fa546");
        make("tower_archer_fire", 32, 32, (ctx) => { ctx.fillStyle = "#8fbe62"; ctx.fillRect(2, 2, 28, 28); });
        makeFallbackTower("tower_mage", "#7867db");
        makeFallbackTower("tower_mage_idle", "#7867db");
        makeFallbackTower("tower_mage_l2", "#7867db");
        makeFallbackTower("tower_mage_l3", "#7867db");
        make("tower_mage_fire", 32, 32, (ctx) => { ctx.fillStyle = "#a888ff"; ctx.fillRect(2, 2, 28, 28); });
        makeFallbackTower("tower_artillery", "#b87431");
        makeFallbackTower("tower_artillery_idle", "#b87431");
        makeFallbackTower("tower_artillery_l2", "#b87431");
        makeFallbackTower("tower_artillery_l3", "#b87431");
        make("tower_artillery_fire", 32, 32, (ctx) => { ctx.fillStyle = "#d88441"; ctx.fillRect(2, 2, 28, 28); });
        makeFallbackTower("tower_barracks", "#b99c43");
        makeFallbackTower("tower_barracks_idle", "#b99c43");
        makeFallbackTower("tower_barracks_l2", "#b99c43");
        makeFallbackTower("tower_barracks_l3", "#b99c43");
        make("tower_barracks_fire", 32, 32, (ctx) => { ctx.fillStyle = "#d9bc63"; ctx.fillRect(2, 2, 28, 28); });
        make("portrait_archer", 32, 32, (ctx) => { ctx.fillStyle = "#6fa546"; ctx.fillRect(2, 2, 28, 28); });
        make("portrait_mage", 32, 32, (ctx) => { ctx.fillStyle = "#7867db"; ctx.fillRect(2, 2, 28, 28); });
        make("portrait_artillery", 32, 32, (ctx) => { ctx.fillStyle = "#b87431"; ctx.fillRect(2, 2, 28, 28); });
        make("portrait_barracks", 32, 32, (ctx) => { ctx.fillStyle = "#b99c43"; ctx.fillRect(2, 2, 28, 28); });
        ["scout","brute","shield","ember","brood","flyer","hexer","titan","boss"].forEach((k) => {
          make(`enemy_${k}`, 32, 32, (ctx) => { ctx.fillStyle = "#c0c0c0"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
          for (let fi = 0; fi < 4; fi += 1) {
            make(`enemy_${k}_w${fi}`, 32, 32, (ctx) => { ctx.fillStyle = "#c0c0c0"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
          }
          make(`enemy_${k}_dead`, 32, 32, (ctx) => { ctx.fillStyle = "#808080"; ctx.fillRect(4, 16, 24, 10); });
        });
        make("enemy_boss_idle", 32, 32, (ctx) => { ctx.fillStyle = "#a040c0"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
        make("enemy_boss_shield", 32, 32, (ctx) => { ctx.fillStyle = "#8060d0"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
        make("enemy_boss_rage", 32, 32, (ctx) => { ctx.fillStyle = "#d03060"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
        make("enemy_titan_enrage", 32, 32, (ctx) => { ctx.fillStyle = "#705040"; ctx.beginPath(); ctx.arc(16,16,12,0,Math.PI*2); ctx.fill(); });
        make("projectile_arrow", 16, 8, (ctx) => { ctx.fillStyle = "#f8e8a0"; ctx.fillRect(0,2,16,4); });
        make("projectile_magic", 16, 16, (ctx) => { ctx.fillStyle = "#c8b0ff"; ctx.beginPath(); ctx.arc(8,8,6,0,Math.PI*2); ctx.fill(); });
        make("projectile_bomb", 16, 16, (ctx) => { ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(8,8,6,0,Math.PI*2); ctx.fill(); });
        make("fx_trail_arrow", 16, 8, (ctx) => { ctx.fillStyle = "#f8e8a0"; ctx.fillRect(0,2,16,4); });
        make("fx_trail_magic", 12, 12, (ctx) => { ctx.fillStyle = "#c8b0ff"; ctx.beginPath(); ctx.arc(6,6,4,0,Math.PI*2); ctx.fill(); });
        make("fx_trail_bomb", 14, 14, (ctx) => { ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(7,7,5,0,Math.PI*2); ctx.fill(); });
        make("fx_trail_smoke", 12, 12, (ctx) => { ctx.fillStyle = "#666"; ctx.beginPath(); ctx.arc(6,6,4,0,Math.PI*2); ctx.fill(); });
        make("soldier_guard", 32, 32, (ctx) => { ctx.fillStyle = "#d8c56a"; ctx.fillRect(8,8,16,20); });
        for (let fi = 0; fi < 4; fi += 1) {
          make(`soldier_guard_walk${fi}`, 32, 32, (ctx) => { ctx.fillStyle = "#d8c56a"; ctx.fillRect(8,8,16,20); });
        }
        make("soldier_guard_attack", 32, 32, (ctx) => { ctx.fillStyle = "#d8c56a"; ctx.fillRect(8,8,16,20); });
        make("soldier_guard_block", 32, 32, (ctx) => { ctx.fillStyle = "#d8c56a"; ctx.fillRect(8,8,16,20); });
        make("den_wolf", 56, 48, (ctx) => { ctx.fillStyle = "#5a6058"; ctx.fillRect(4, 4, 48, 40); });
        make("unit_wolf", 48, 40, (ctx) => { ctx.fillStyle = "#7b8896"; ctx.fillRect(4, 4, 40, 32); });
        make("hero_captain", 32, 32, (ctx) => { ctx.fillStyle = "#3f6fb4"; ctx.fillRect(8,4,16,24); });
        make("hero_captain_idle", 32, 32, (ctx) => { ctx.fillStyle = "#3f6fb4"; ctx.fillRect(8,4,16,24); });
        make("hero_captain_attack", 32, 32, (ctx) => { ctx.fillStyle = "#3f6fb4"; ctx.fillRect(8,4,16,24); });
        make("hero_captain_ability", 32, 32, (ctx) => { ctx.fillStyle = "#3f6fb4"; ctx.fillRect(8,4,16,24); });
        make("tree_pine", 24, 32, (ctx) => { ctx.fillStyle = "#3a6a30"; ctx.fillRect(4,0,16,32); });
        make("rock_moss", 20, 14, (ctx) => { ctx.fillStyle = "#686c64"; ctx.fillRect(0,0,20,14); });
        make("pad_empty", 48, 32, (ctx) => { ctx.fillStyle = "#4a3c2a"; ctx.beginPath(); ctx.ellipse(24,16,20,10,0,0,Math.PI*2); ctx.fill(); });
        make("gate_arch", 128, 96, (ctx) => { ctx.fillStyle = "#6a5a48"; ctx.fillRect(8,14,112,68); ctx.fillStyle = "#0a0806"; ctx.fillRect(38,28,52,54); ctx.fillStyle = "#8a2020"; ctx.fillRect(16,22,18,36); ctx.fillRect(94,22,18,36); });
        make("gate_leak", 128, 96, (ctx) => { ctx.fillStyle = "rgba(255,50,20,0.8)"; ctx.fillRect(36,26,56,56); });
        make("bush_round", 24, 18, (ctx) => { ctx.fillStyle = "#4a8030"; ctx.fillRect(0,0,24,18); });
        make("flower_patch", 20, 14, (ctx) => { ctx.fillStyle = "#f0d060"; ctx.fillRect(0,0,20,14); });
        make("tree_oak", 32, 32, (ctx) => { ctx.fillStyle = "#4a8030"; ctx.fillRect(0,0,32,32); });
        make("ruin_pillar", 20, 32, (ctx) => { ctx.fillStyle = "#8a8070"; ctx.fillRect(0,0,20,32); });
        make("banner_flag", 20, 32, (ctx) => { ctx.fillStyle = "#e07050"; ctx.fillRect(0,0,20,32); });
        make("cloud_soft", 48, 24, (ctx) => { ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(0,0,48,24); });
        make("path_mark", 16, 10, (ctx) => { ctx.fillStyle = "rgba(180,150,100,.35)"; ctx.fillRect(0,0,16,10); });
        make("tile_dirt", 32, 32, (ctx) => { ctx.fillStyle = "#7a5530"; ctx.fillRect(0,0,32,32); });
        make("tile_stone", 32, 32, (ctx) => { ctx.fillStyle = "#5a6876"; ctx.fillRect(0,0,32,32); });
        make("tile_ember", 32, 32, (ctx) => { ctx.fillStyle = "#2a1e1c"; ctx.fillRect(0,0,32,32); });
        make("tile_dirt_edge", 32, 16, (ctx) => { ctx.fillStyle = "#4a301a"; ctx.fillRect(0,0,32,16); });
        make("tile_stone_edge", 32, 16, (ctx) => { ctx.fillStyle = "#3a424a"; ctx.fillRect(0,0,32,16); });
        make("tile_ember_edge", 32, 16, (ctx) => { ctx.fillStyle = "#1e1412"; ctx.fillRect(0,0,32,16); });
        make("icon_gold", 16, 16, (ctx) => { ctx.fillStyle = "#f5c85a"; ctx.fillRect(0,0,16,16); });
        make("icon_heart", 16, 16, (ctx) => { ctx.fillStyle = "#e66550"; ctx.fillRect(0,0,16,16); });
      }
      this.bakeMenuIcons();
    }

    bakeMenuIcons() {
      const make = (key, w, h, draw) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        const texture = this.textures.createCanvas(key, w, h);
        const ctx = texture.getContext();
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        draw(ctx, w, h);
        texture.refresh();
      };

      const rounded = (ctx, x, y, w, h, r, fill, stroke = null, line = 1) => {
        const rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
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

      const poly = (ctx, points, fill, stroke = null, line = 1) => {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
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

      const drawBadge = (ctx, w, h, c0, c1, cBorder) => {
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, c0);
        bgGrad.addColorStop(1, c1);
        rounded(ctx, 3, 3, w - 6, h - 6, 8, bgGrad, cBorder, 2);
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, 5);
        ctx.lineTo(w - 8, 5);
        ctx.stroke();
      };

      const drawSparkle = (ctx, x, y, r, color = "#ffffff") => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.35, y - r * 0.35);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x + r * 0.35, y + r * 0.35);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r * 0.35, y + r * 0.35);
        ctx.lineTo(x - r, y);
        ctx.lineTo(x - r * 0.35, y - r * 0.35);
        ctx.closePath();
        ctx.fill();
      };

      // Map 0: Forest Gate
      make("map_preview_0", 100, 100, (ctx) => {
        const bgGrad = ctx.createLinearGradient(0, 0, 100, 100);
        bgGrad.addColorStop(0, "#487434");
        bgGrad.addColorStop(0.5, "#2d4e22");
        bgGrad.addColorStop(1, "#182c12");
        rounded(ctx, 4, 4, 92, 92, 10, bgGrad, "#162810", 3);

        const treeGrad = ctx.createLinearGradient(0, 10, 0, 40);
        treeGrad.addColorStop(0, "#5e9444");
        treeGrad.addColorStop(1, "#26421a");
        for (const [tx, ty, r] of [[18, 22, 12], [34, 16, 14], [66, 16, 14], [82, 22, 12], [50, 12, 11]]) {
          ellipse(ctx, tx, ty, r, r * 0.9, treeGrad, "#162810", 1);
        }

        ctx.strokeStyle = "#8a6638";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(8, 74);
        ctx.bezierCurveTo(36, 76, 38, 52, 50, 48);
        ctx.bezierCurveTo(62, 44, 70, 72, 92, 70);
        ctx.stroke();

        ctx.strokeStyle = "#b58d52";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(8, 74);
        ctx.bezierCurveTo(36, 76, 38, 52, 50, 48);
        ctx.bezierCurveTo(62, 44, 70, 72, 92, 70);
        ctx.stroke();

        rounded(ctx, 36, 32, 8, 22, 2, "#686a60", "#2c2e28", 1.5);
        rounded(ctx, 56, 32, 8, 22, 2, "#686a60", "#2c2e28", 1.5);
        rounded(ctx, 34, 28, 32, 8, 2, "#7e8278", "#2c2e28", 1.5);
        rounded(ctx, 44, 35, 12, 19, 1, "#5c3d20", "#2c1a0c", 1);
        ctx.strokeStyle = "#d4b050";
        ctx.lineWidth = 1;
        ctx.strokeRect(44, 40, 12, 3);

        ellipse(ctx, 16, 74, 9, 7, "#42762a", "#1b3610", 1);
        ellipse(ctx, 84, 70, 10, 8, "#42762a", "#1b3610", 1);
        ellipse(ctx, 24, 84, 2.5, 2.5, "#f5d76e");
        ellipse(ctx, 78, 82, 2.5, 2.5, "#ff7282");
        ellipse(ctx, 28, 62, 2, 2, "#ffffff");

        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 6);
        ctx.lineTo(88, 6);
        ctx.stroke();
      });

      // Map 1: Stone Pass
      make("map_preview_1", 100, 100, (ctx) => {
        const bgGrad = ctx.createLinearGradient(0, 0, 100, 100);
        bgGrad.addColorStop(0, "#4a5a68");
        bgGrad.addColorStop(0.5, "#323c46");
        bgGrad.addColorStop(1, "#1c2228");
        rounded(ctx, 4, 4, 92, 92, 10, bgGrad, "#12161a", 3);

        poly(ctx, [[10, 50], [30, 22], [52, 50]], "#3a4652", "#1e262e", 1);
        poly(ctx, [[40, 50], [65, 14], [90, 50]], "#4c5c6c", "#1e262e", 1);
        poly(ctx, [[58, 22], [65, 14], [72, 22]], "#e4edf6");

        ctx.fillStyle = "#68727c";
        ctx.beginPath();
        ctx.moveTo(38, 38); ctx.lineTo(62, 38); ctx.lineTo(72, 92); ctx.lineTo(28, 92);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#8e9ba8";
        ctx.lineWidth = 2;
        ctx.stroke();

        poly(ctx, [[6, 34], [28, 36], [32, 90], [6, 90]], "#525c66", "#20262c", 1.5);
        poly(ctx, [[94, 34], [72, 36], [68, 90], [94, 90]], "#525c66", "#20262c", 1.5);

        rounded(ctx, 28, 42, 44, 8, 2, "#7a8692", "#262e36", 1.5);

        ellipse(ctx, 22, 78, 6, 4.5, "#606a74", "#20262c", 1);
        ellipse(ctx, 76, 82, 7, 5, "#606a74", "#20262c", 1);
        ellipse(ctx, 32, 86, 4, 3, "#74808c");

        ellipse(ctx, 24, 76, 3.5, 2, "#4a6e42");
        ellipse(ctx, 74, 80, 4, 2, "#4a6e42");

        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 6); ctx.lineTo(88, 6); ctx.stroke();
      });

      // Map 2: Ember Marsh
      make("map_preview_2", 100, 100, (ctx) => {
        const bgGrad = ctx.createLinearGradient(0, 0, 100, 100);
        bgGrad.addColorStop(0, "#5a2614");
        bgGrad.addColorStop(0.4, "#323820");
        bgGrad.addColorStop(1, "#181e10");
        rounded(ctx, 4, 4, 92, 92, 10, bgGrad, "#160e08", 3);

        ellipse(ctx, 50, 60, 42, 28, "#1a2414");

        ctx.strokeStyle = "#e85820";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(16, 56); ctx.quadraticCurveTo(45, 68, 84, 52); ctx.stroke();
        ctx.strokeStyle = "#ffd040";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(16, 56); ctx.quadraticCurveTo(45, 68, 84, 52); ctx.stroke();

        ctx.strokeStyle = "#5a4225";
        ctx.lineWidth = 13;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(12, 38); ctx.bezierCurveTo(40, 28, 45, 78, 88, 76); ctx.stroke();
        ctx.strokeStyle = "#7a5c34";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(12, 38); ctx.bezierCurveTo(40, 28, 45, 78, 88, 76); ctx.stroke();

        for (const [tx, ty] of [[24, 22], [74, 26]]) {
          ctx.strokeStyle = "#1e2616";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty + 18); ctx.lineTo(tx, ty);
          ctx.lineTo(tx - 6, ty - 8);
          ctx.moveTo(tx, ty + 6); ctx.lineTo(tx + 7, ty - 4);
          ctx.stroke();
        }

        for (const [fx, fy, r, c1, c2] of [
          [32, 46, 2.8, "#ffe870", "rgba(255,140,0,0.4)"],
          [62, 38, 3.2, "#ffdd50", "rgba(255,100,0,0.5)"],
          [48, 74, 2.2, "#fff090", "rgba(255,160,0,0.4)"],
          [78, 64, 2.8, "#ffe060", "rgba(255,90,0,0.4)"],
          [20, 76, 2.2, "#ffcc40", "rgba(255,120,0,0.4)"],
        ]) {
          ellipse(ctx, fx, fy, r * 2.2, r * 2.2, c2);
          ellipse(ctx, fx, fy, r, r, c1);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 6); ctx.lineTo(88, 6); ctx.stroke();
      });

      // Tower 1: Archer (Rangers bow portrait)
      make("icon_tower_archer", 72, 72, (ctx) => {
        drawBadge(ctx, 72, 72, "#24421b", "#0f220a", "#081406");

        const forestGlow = ctx.createRadialGradient(28, 28, 4, 36, 36, 32);
        forestGlow.addColorStop(0, "rgba(90, 180, 70, 0.28)");
        forestGlow.addColorStop(0.6, "rgba(40, 100, 30, 0.1)");
        forestGlow.addColorStop(1, "rgba(10, 30, 10, 0)");
        ellipse(ctx, 36, 36, 30, 30, forestGlow);

        ellipse(ctx, 36, 56, 24, 6, "rgba(0,0,0,0.45)");

        ctx.save();
        ctx.translate(34, 36);
        ctx.rotate(-0.38);

        ctx.lineWidth = 5.5;
        ctx.lineCap = "round";
        const woodGrad = ctx.createLinearGradient(-22, -24, 22, 24);
        woodGrad.addColorStop(0, "#e8b868");
        woodGrad.addColorStop(0.3, "#a6682b");
        woodGrad.addColorStop(0.7, "#6e3e14");
        woodGrad.addColorStop(1, "#402008");
        ctx.strokeStyle = woodGrad;

        ctx.beginPath();
        ctx.moveTo(8, -24);
        ctx.quadraticCurveTo(-22, -14, -6, 0);
        ctx.quadraticCurveTo(-22, 14, 8, 24);
        ctx.stroke();

        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(255, 220, 150, 0.6)";
        ctx.beginPath();
        ctx.moveTo(7, -22);
        ctx.quadraticCurveTo(-18, -13, -5, 0);
        ctx.quadraticCurveTo(-18, 13, 7, 22);
        ctx.stroke();

        ellipse(ctx, 8, -24, 3, 3, "#f5d76e", "#947018", 1);
        ellipse(ctx, 8, 24, 3, 3, "#f5d76e", "#947018", 1);

        ctx.lineWidth = 7.5;
        ctx.strokeStyle = "#5a3014";
        ctx.beginPath();
        ctx.moveTo(-7, -5); ctx.lineTo(-5, 5);
        ctx.stroke();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#f5c85a";
        ctx.beginPath();
        ctx.moveTo(-9, -4); ctx.lineTo(-4, 4);
        ctx.moveTo(-9, 2); ctx.lineTo(-4, -4);
        ctx.stroke();

        ctx.strokeStyle = "#f4f8fc";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, -24);
        ctx.lineTo(-4, 0);
        ctx.lineTo(8, 24);
        ctx.stroke();

        ctx.strokeStyle = "#dfab64";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(26, 0);
        ctx.stroke();

        poly(ctx, [[26, -6], [38, 0], [26, 6], [29, 0]], "#eef4fa", "#3a4856", 1);
        ctx.strokeStyle = "#90a0b0";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(36, 0); ctx.stroke();

        poly(ctx, [[-16, 0], [-25, -6], [-20, 0], [-25, 6]], "#388e3c", "#1b5e20", 1);
        poly(ctx, [[-14, 0], [-21, -4], [-17, 0], [-21, 4]], "#f5c85a");

        ctx.restore();

        poly(ctx, [[14, 18], [18, 14], [19, 19]], "#66bb6a");
        poly(ctx, [[54, 52], [58, 48], [57, 54]], "#81c784");
        drawSparkle(ctx, 58, 20, 2, "#d4edda");
      });

      // Tower 2: Mage (Runes orb portrait)
      make("icon_tower_mage", 72, 72, (ctx) => {
        drawBadge(ctx, 72, 72, "#321a58", "#160a30", "#0c041c");
        ellipse(ctx, 36, 58, 20, 6, "rgba(0,0,0,0.5)");

        ctx.strokeStyle = "rgba(160, 100, 240, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(36, 31, 26, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(240, 190, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(36, 31, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        poly(ctx, [[24, 54], [48, 54], [44, 46], [28, 46]], "#3a2456", "#f5c85a", 1.5);
        rounded(ctx, 28, 44, 16, 5, 2, "#f5c85a", "#9a7018", 1);
        ellipse(ctx, 36, 46, 3, 2, "#00f0ff");

        const orbGlow = ctx.createRadialGradient(36, 31, 6, 36, 31, 26);
        orbGlow.addColorStop(0, "rgba(210, 160, 255, 0.85)");
        orbGlow.addColorStop(0.4, "rgba(140, 60, 230, 0.5)");
        orbGlow.addColorStop(0.8, "rgba(60, 20, 150, 0.2)");
        orbGlow.addColorStop(1, "rgba(20, 5, 60, 0)");
        ellipse(ctx, 36, 31, 26, 26, orbGlow);

        const orbGrad = ctx.createRadialGradient(31, 26, 2, 36, 31, 16);
        orbGrad.addColorStop(0, "#ffffff");
        orbGrad.addColorStop(0.2, "#f2e4ff");
        orbGrad.addColorStop(0.5, "#a855f7");
        orbGrad.addColorStop(0.85, "#4c1d95");
        orbGrad.addColorStop(1, "#240954");
        ellipse(ctx, 36, 31, 16, 16, orbGrad, "#e9d5ff", 1.5);

        ctx.strokeStyle = "#70f0ff";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(36, 31, 12, -0.6, 1.8);
        ctx.stroke();

        ctx.strokeStyle = "#e8b4ff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(36, 22); ctx.lineTo(36, 40);
        ctx.moveTo(30, 27); ctx.lineTo(42, 35);
        ctx.moveTo(30, 35); ctx.lineTo(42, 27);
        ctx.stroke();

        ellipse(ctx, 30, 24, 3.5, 2.2, "rgba(255,255,255,0.9)");
        drawSparkle(ctx, 18, 18, 3.5, "#ffffff");
        drawSparkle(ctx, 54, 20, 2.5, "#70f0ff");
        drawSparkle(ctx, 50, 44, 2.2, "#f5d76e");
        drawSparkle(ctx, 20, 42, 2, "#e9d5ff");
      });

      // Tower 3: Artillery (Mortar barrel portrait)
      make("icon_tower_artillery", 72, 72, (ctx) => {
        drawBadge(ctx, 72, 72, "#4a2410", "#1e0c04", "#100402");
        ellipse(ctx, 36, 58, 22, 6, "rgba(0,0,0,0.5)");

        const furnaceGlow = ctx.createRadialGradient(20, 52, 4, 30, 46, 28);
        furnaceGlow.addColorStop(0, "rgba(255, 120, 20, 0.35)");
        furnaceGlow.addColorStop(0.6, "rgba(180, 50, 10, 0.15)");
        furnaceGlow.addColorStop(1, "rgba(40, 10, 0, 0)");
        ellipse(ctx, 30, 46, 28, 28, furnaceGlow);

        rounded(ctx, 16, 45, 40, 14, 4, "#5c3418", "#2a1408", 2);
        ellipse(ctx, 26, 52, 4, 4, "#8a94a0", "#202428", 1);
        ellipse(ctx, 46, 52, 4, 4, "#8a94a0", "#202428", 1);

        ctx.save();
        ctx.translate(34, 40);
        ctx.rotate(-0.52);

        const ironGrad = ctx.createLinearGradient(-10, -14, 26, 14);
        ironGrad.addColorStop(0, "#9ea8b2");
        ironGrad.addColorStop(0.35, "#525a62");
        ironGrad.addColorStop(0.7, "#282c32");
        ironGrad.addColorStop(1, "#141618");

        rounded(ctx, -10, -13, 38, 26, 5, ironGrad, "#0e1012", 2);

        const bronzeGrad = ctx.createLinearGradient(24, -15, 32, 15);
        bronzeGrad.addColorStop(0, "#f5d76e");
        bronzeGrad.addColorStop(0.5, "#b88c28");
        bronzeGrad.addColorStop(1, "#664810");
        rounded(ctx, 24, -15, 9, 30, 4, bronzeGrad, "#3d2a08", 1.5);

        ellipse(ctx, 32, 0, 3, 11, "#180400", "#f5c85a", 1);
        ellipse(ctx, 32, 0, 1.8, 8, "#660c00");

        ctx.strokeStyle = "#f5c85a";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(6, -13); ctx.lineTo(6, 13);
        ctx.stroke();
        ellipse(ctx, 6, -8, 1.2, 1.2, "#ffffff");
        ellipse(ctx, 6, 8, 1.2, 1.2, "#ffffff");

        ctx.strokeStyle = "#d0a070";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -13);
        ctx.quadraticCurveTo(-14, -20, -22, -16);
        ctx.stroke();

        ellipse(ctx, -22, -16, 4, 4, "#ffaa00");
        drawSparkle(ctx, -22, -16, 4.5, "#ffffff");

        ctx.restore();

        ellipse(ctx, 16, 51, 5, 5, "#30363d", "#141618", 1.5);
        ellipse(ctx, 15, 49, 1.2, 1.2, "#ffffff");
        ellipse(ctx, 23, 51, 5, 5, "#30363d", "#141618", 1.5);
        ellipse(ctx, 22, 49, 1.2, 1.2, "#ffffff");
        ellipse(ctx, 19.5, 43, 5, 5, "#3a424a", "#141618", 1.5);
        ellipse(ctx, 18.5, 41, 1.4, 1.4, "#ffffff");

        ellipse(ctx, 56, 22, 1.5, 1.5, "#ffcc00");
        ellipse(ctx, 62, 34, 1.2, 1.2, "#ff6600");
        ellipse(ctx, 50, 16, 1, 1, "#ffa000");
      });

      // Tower 4: Barracks (Guard shield portrait)
      make("icon_tower_barracks", 72, 72, (ctx) => {
        drawBadge(ctx, 72, 72, "#423816", "#201a08", "#120e04");
        ellipse(ctx, 36, 58, 22, 6, "rgba(0,0,0,0.5)");

        ctx.strokeStyle = "#e2eafd"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(58, 54); ctx.stroke();
        ctx.strokeStyle = "#404c5a"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(58, 54); ctx.stroke();

        ctx.strokeStyle = "#e2eafd"; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(58, 14); ctx.lineTo(14, 54); ctx.stroke();
        ctx.strokeStyle = "#404c5a"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(58, 14); ctx.lineTo(14, 54); ctx.stroke();

        ctx.strokeStyle = "#f5c85a"; ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.moveTo(10, 18); ctx.lineTo(20, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(62, 18); ctx.lineTo(52, 10); ctx.stroke();
        ellipse(ctx, 12, 12, 2.5, 2.5, "#ffd700", "#8a6010", 1);
        ellipse(ctx, 60, 12, 2.5, 2.5, "#ffd700", "#8a6010", 1);

        const shieldGrad = ctx.createLinearGradient(20, 18, 52, 56);
        shieldGrad.addColorStop(0, "#2a5482");
        shieldGrad.addColorStop(0.5, "#183454");
        shieldGrad.addColorStop(1, "#0c1a2e");

        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(52, 20);
        ctx.quadraticCurveTo(54, 38, 36, 57);
        ctx.quadraticCurveTo(18, 38, 20, 20);
        ctx.closePath();
        ctx.fillStyle = shieldGrad;
        ctx.fill();

        const rimGrad = ctx.createLinearGradient(20, 20, 52, 56);
        rimGrad.addColorStop(0, "#f5d76e");
        rimGrad.addColorStop(0.5, "#c89a28");
        rimGrad.addColorStop(1, "#78540c");
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = 3;
        ctx.stroke();

        for (const [rx, ry] of [[23, 23], [49, 23], [36, 52], [24, 36], [48, 36]]) {
          ellipse(ctx, rx, ry, 1.4, 1.4, "#e0e8f0", "#303840", 0.8);
        }

        ctx.fillStyle = "#f5c85a";
        ctx.fillRect(33, 24, 6, 24);
        ctx.fillRect(25, 30, 22, 6);
        ctx.strokeStyle = "#8a5810";
        ctx.lineWidth = 1;
        ctx.strokeRect(33, 24, 6, 24);
        ctx.strokeRect(25, 30, 22, 6);

        ellipse(ctx, 36, 33, 4, 4, "#e04838", "#80180c", 1);
        ellipse(ctx, 34.5, 31.5, 1.2, 1.2, "#ffffff");

        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(24, 22); ctx.lineTo(46, 44);
        ctx.stroke();
      });

      // Spell 1: Meteor
      make("icon_spell_meteor", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#501c0e", "#2c0c04", "#180602");

        ctx.save();
        ctx.translate(32, 32);
        ctx.rotate(0.65);

        const flameGrad = ctx.createLinearGradient(-26, 0, 16, 0);
        flameGrad.addColorStop(0, "rgba(255, 60, 0, 0)");
        flameGrad.addColorStop(0.4, "rgba(255, 100, 20, 0.7)");
        flameGrad.addColorStop(0.8, "rgba(255, 200, 40, 0.95)");
        flameGrad.addColorStop(1, "#ffffff");
        ctx.fillStyle = flameGrad;

        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.quadraticCurveTo(-6, -14, -26, -6);
        ctx.quadraticCurveTo(-14, -2, -28, 4);
        ctx.quadraticCurveTo(-12, 6, -24, 12);
        ctx.quadraticCurveTo(-4, 12, 14, 0);
        ctx.fill();

        const coreGrad = ctx.createRadialGradient(8, -2, 2, 6, 0, 12);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.3, "#fff066");
        coreGrad.addColorStop(0.6, "#ff6a20");
        coreGrad.addColorStop(1, "#941c08");
        ellipse(ctx, 6, 0, 10, 10, coreGrad, "#ffe880", 1.5);

        ctx.restore();
      });

      // Spell 2: Frost
      make("icon_spell_frost", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#1c405c", "#0c2032", "#06121c");

        ctx.save();
        ctx.translate(32, 32);

        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
        glow.addColorStop(0, "rgba(200, 240, 255, 0.8)");
        glow.addColorStop(0.5, "rgba(100, 190, 255, 0.4)");
        glow.addColorStop(1, "rgba(50, 120, 220, 0)");
        ellipse(ctx, 0, 0, 22, 22, glow);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let i = 0; i < 6; i += 1) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, -18);
          ctx.moveTo(0, -11); ctx.lineTo(-5, -15);
          ctx.moveTo(0, -11); ctx.lineTo(5, -15);
          ctx.stroke();
        }

        ctx.fillStyle = "#b8edff";
        ctx.beginPath();
        for (let i = 0; i < 6; i += 1) {
          const angle = (i * Math.PI) / 3;
          const hx = Math.cos(angle) * 7;
          const hy = Math.sin(angle) * 7;
          if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      });

      // Spell 3: Rally
      make("icon_spell_rally", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#543e14", "#2c2008", "#181004");

        ctx.save();
        ctx.translate(30, 34);

        const hornGrad = ctx.createLinearGradient(-18, 14, 18, -14);
        hornGrad.addColorStop(0, "#a06818");
        hornGrad.addColorStop(0.4, "#ffd866");
        hornGrad.addColorStop(0.8, "#e6a820");
        hornGrad.addColorStop(1, "#8a5010");
        ctx.fillStyle = hornGrad;

        ctx.beginPath();
        ctx.moveTo(-16, 12);
        ctx.quadraticCurveTo(-4, 16, 14, 6);
        ctx.lineTo(16, -10);
        ctx.quadraticCurveTo(-2, 0, -18, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffe890";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ellipse(ctx, 15, -2, 4, 9, "#ffd866", "#5a3408", 1.2);

        ctx.strokeStyle = "#fff0a0";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(15, -2, 10, -0.6, 0.6); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 240, 160, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(15, -2, 16, -0.6, 0.6); ctx.stroke();

        ctx.restore();
      });

      // Hero Ability 1: Charge
      make("icon_ability_charge", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#504010", "#2c2206", "#181202");

        ctx.save();
        ctx.translate(32, 32);

        const boltGrad = ctx.createLinearGradient(0, -20, 0, 20);
        boltGrad.addColorStop(0, "#ffffff");
        boltGrad.addColorStop(0.3, "#fff37a");
        boltGrad.addColorStop(0.8, "#ffaa00");
        boltGrad.addColorStop(1, "#e66000");

        poly(ctx, [[2, -20], [-13, -2], [-2, 0], [-9, 20], [13, -2], [2, 0]], boltGrad, "#ffffff", 1.5);

        ctx.restore();
      });

      // Hero Ability 2: Banner
      make("icon_ability_banner", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#501818", "#2c0c0c", "#180404");

        ctx.strokeStyle = "#ffd866";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(20, 10); ctx.lineTo(20, 54); ctx.stroke();
        poly(ctx, [[20, 6], [17, 12], [23, 12]], "#ffffff");

        const flagGrad = ctx.createLinearGradient(20, 14, 52, 38);
        flagGrad.addColorStop(0, "#e63e2e");
        flagGrad.addColorStop(0.6, "#a82014");
        flagGrad.addColorStop(1, "#5c0e06");
        ctx.fillStyle = flagGrad;

        ctx.beginPath();
        ctx.moveTo(20, 14);
        ctx.quadraticCurveTo(34, 10, 48, 16);
        ctx.lineTo(38, 28);
        ctx.lineTo(50, 40);
        ctx.quadraticCurveTo(34, 34, 20, 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffd866";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ellipse(ctx, 32, 26, 4, 4, "#ffd866");
      });

      // Hero Ability 3: Heal
      make("icon_ability_heal", 64, 64, (ctx) => {
        drawBadge(ctx, 64, 64, "#164426", "#0c2614", "#041408");

        ctx.save();
        ctx.translate(32, 32);

        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
        glow.addColorStop(0, "rgba(160, 255, 180, 0.8)");
        glow.addColorStop(0.5, "rgba(80, 220, 120, 0.4)");
        glow.addColorStop(1, "rgba(30, 140, 60, 0)");
        ellipse(ctx, 0, 0, 22, 22, glow);

        const crossGrad = ctx.createLinearGradient(-12, -12, 12, 12);
        crossGrad.addColorStop(0, "#b4f8c8");
        crossGrad.addColorStop(0.4, "#4ee47a");
        crossGrad.addColorStop(1, "#188c3e");
        ctx.fillStyle = crossGrad;

        const cw = 7, clen = 17;
        ctx.fillRect(-cw / 2, -clen, cw, clen * 2);
        ctx.fillRect(-clen, -cw / 2, clen * 2, cw);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-cw / 2, -clen, cw, clen * 2);
        ctx.strokeRect(-clen, -cw / 2, clen * 2, cw);

        poly(ctx, [[0, -4], [4, 0], [0, 4], [-4, 0]], "#ffffff");

        ctx.restore();
      });

      // Sound Icons
      make("icon_sound_on", 48, 48, (ctx) => {
        ctx.save();
        ctx.translate(22, 24);
        poly(ctx, [[-12, -5], [-6, -5], [0, -11], [0, 11], [-6, 5], [-12, 5]], "#d8e4f0", "#8098b0", 1.5);
        ctx.strokeStyle = "#f5d76e";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(0, 0, 6, -0.7, 0.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 11, -0.8, 0.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 16, -0.9, 0.9); ctx.stroke();
        ctx.restore();
      });

      make("icon_sound_off", 48, 48, (ctx) => {
        ctx.save();
        ctx.translate(22, 24);
        poly(ctx, [[-12, -5], [-6, -5], [0, -11], [0, 11], [-6, 5], [-12, 5]], "#8a9aa8");
        ctx.strokeStyle = "#ff4838";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(16, 14); ctx.stroke();
        ctx.restore();
      });

      // Motion Icons
      make("icon_motion_full", 48, 48, (ctx) => {
        ctx.save();
        ctx.translate(24, 24);
        ctx.strokeStyle = "#9ee0ff";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-14, 12); ctx.quadraticCurveTo(0, -6, 14, -12); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-6, 6); ctx.lineTo(-12, -2);
        ctx.moveTo(0, 0); ctx.lineTo(-4, -10);
        ctx.moveTo(6, -6); ctx.lineTo(2, -14);
        ctx.stroke();
        ctx.strokeStyle = "#ffd866";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(6, -8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, 16); ctx.lineTo(12, 16); ctx.stroke();
        ctx.restore();
      });

      make("icon_motion_reduced", 48, 48, (ctx) => {
        ctx.save();
        ctx.translate(24, 24);
        ctx.strokeStyle = "#a0b4c4";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-14, 12); ctx.quadraticCurveTo(0, -6, 14, -12); ctx.stroke();
        ctx.fillStyle = "#f5d76e";
        ctx.fillRect(-6, -10, 4, 10);
        ctx.fillRect(2, -10, 4, 10);
        ctx.restore();
      });
    }

    getMapUnitTint() {
      const tints = [
        0xf4f7e6, // Forest Gate: forest green-gold
        0xe6ecf5, // Stone Pass: stone cool
        0xfcf0e2, // Ember Marsh: ember warm
        0xe6f4f0, // Gale Reach: gale cool mist
        0xf6e8e2, // Ash Spire: ash warm
      ];
      return tints[this.mapIndex] ?? 0xffffff;
    }

    applyUnitTint(sprite) {
      if (!sprite) return;
      const tint = this.getMapUnitTint();
      if (tint && tint !== 0xffffff) {
        sprite.setTint(tint);
      } else {
        sprite.clearTint();
      }
    }

    drawMap() {
      const grass = this.map.grass;
      const themes = [
        { accent: 0x3a5a2e, accent2: 0x1e3018, road: 0x9a7a4a, roadEdge: 0x4a3420, pathMid: 0xc4a06a, tint: 0xffffff, unitTint: 0xf4f7e6, skyTop: 0x6a9ac8, skyBot: 0xb8d8a0 },
        { accent: 0x3a4a50, accent2: 0x1a282c, road: 0x8a9098, roadEdge: 0x3a4048, pathMid: 0xb0b8c0, tint: 0xc8d0d8, unitTint: 0xe6ecf5, skyTop: 0x5a7088, skyBot: 0x90a8a0 },
        { accent: 0x4a3a20, accent2: 0x2a2410, road: 0xb07a42, roadEdge: 0x5a3a18, pathMid: 0xe0a060, tint: 0xe8c898, unitTint: 0xfcf0e2, skyTop: 0xc07040, skyBot: 0xa08040 },
        { accent: 0x3a5550, accent2: 0x1a2c2a, road: 0x8a9a90, roadEdge: 0x3a4840, pathMid: 0xc0d0c4, tint: 0xd0e0d8, unitTint: 0xe6f4f0, skyTop: 0x6a8890, skyBot: 0x90b0a0 },
        { accent: 0x5a3a28, accent2: 0x2a1c14, road: 0x8a6a50, roadEdge: 0x3a2818, pathMid: 0xc4a080, tint: 0xe0c0a0, unitTint: 0xf6e8e2, skyTop: 0x8a6050, skyBot: 0xa08060 },
      ];
      const theme = themes[this.mapIndex] || themes[0];

      // Parallax sky with gradient layers
      const sky = this.add.graphics().setDepth(-22);
      sky.fillGradientStyle(theme.skyTop, theme.skyTop, theme.skyBot, theme.skyBot, 0.55, 0.55, 0.15, 0.15);
      sky.fillRect(0, 0, W, 120);
      // Sky glow layer
      const skyGlow = this.add.graphics().setDepth(-21.5);
      skyGlow.fillGradientStyle(0xffffff, 0xffffff, theme.skyTop, theme.skyTop, 0.5, 0.5, 0.8, 0.8);
      skyGlow.fillRect(0, 0, W, 60);

      this.add.rectangle(W / 2, H / 2, W, H, grass).setDepth(-21);
      this.paintMapGround(theme);

      for (let i = 0; i < 48; i += 1) {
        const x = (i * 89 + 17) % W;
        const y = 70 + ((i * 53) % 560);
        const c = i % 3 === 0 ? theme.accent : i % 2 ? theme.accent2 : grass;
        this.add.ellipse(x, y, 38 + (i % 5) * 10, 16 + (i % 3) * 4, c, 0.22).setDepth(-20);
      }

      for (let i = 0; i < 120; i += 1) {
        const x = (i * 73) % W;
        const y = 76 + ((i * 47) % 545);
        const c = i % 3 === 0 ? theme.accent : i % 2 ? theme.accent2 : grass;
        this.add.rectangle(x, y, 18 + (i % 4) * 7, 3, c, 0.22).setAngle((i * 19) % 180).setDepth(-19);
      }

      // v1.5.1 authored Forest Gate postcard (antigrav art lane)
      if (this.mapIndex === 0 && window.KRCArt?.composeForestGate) {
        try {
          const postcard = window.KRCArt.composeForestGate(this, W, H, 404, { container: true });
          if (postcard?.setDepth) postcard.setDepth(-20);
          this._gatePostcard = postcard;
        } catch { /* keep base map if compose fails */ }
      }

      // Atmospheric effects per map type
      if (!this.settings?.reducedMotion) {
        if (this.mapIndex === 0) {
          // Forest Gate: firefly particles
          for (let i = 0; i < 8; i += 1) {
            const fx = (i * 97 + 30) % W;
            const fy = 100 + ((i * 53) % 400);
            const firefly = this.add.circle(fx, fy, 2, 0xffff80, 0.6).setDepth(-17);
            this.tweens.add({
              targets: firefly, x: fx + (Math.random() - 0.5) * 60, y: fy + (Math.random() - 0.5) * 40,
              alpha: 0.2, duration: 1500 + Math.random() * 1000, yoyo: true, repeat: -1,
            });
          }
          // Forest Gate: drifting leaf particles
          const leafColors = [0x4a7c30, 0x8b6b3d, 0x5c7a29, 0x7c5a2b, 0x6e8b3d, 0x665233];
          for (let i = 0; i < 6; i += 1) {
            const lx = (i * 70 + 20) % W;
            const ly = 90 + ((i * 85) % 440);
            const leaf = this.textures.exists("fx_leaf")
              ? this.add.image(lx, ly, "fx_leaf").setScale(0.55 + (i % 2) * 0.15).setTint(leafColors[i]).setAlpha(0.75).setDepth(-17)
              : this.add.circle(lx, ly, 2.5 + (i % 2), leafColors[i], 0.65).setDepth(-17);
            if (leaf.setAngle) leaf.setAngle(-20 + i * 15);
            this.tweens.add({
              targets: leaf,
              x: { from: lx, to: (lx + 140) % W },
              y: { from: ly, to: ly + (i % 2 === 0 ? 14 : -14) },
              angle: { from: -20 + i * 15, to: 25 + i * 12 },
              alpha: { from: 0.75, to: 0.35 },
              duration: 3600 + i * 400,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          // Forest Gate: distant birds looping
          for (let b = 0; b < 3; b += 1) {
            const startX = -30 - b * 70;
            const startY = 45 + b * 28;
            const bird = this.add.graphics().setDepth(-16);
            bird.lineStyle(1.5, 0x243422, 0.75);
            bird.beginPath();
            bird.moveTo(-5, -2);
            bird.lineTo(0, 2);
            bird.lineTo(5, -2);
            bird.strokePath();
            bird.setPosition(startX, startY);
            this.tweens.add({
              targets: bird,
              x: W + 50,
              y: startY + (b % 2 === 0 ? 35 : -25),
              duration: 9500 + b * 1800,
              repeat: -1,
              delay: b * 1600,
            });
            this.tweens.add({
              targets: bird,
              scaleY: 0.4,
              duration: 240 + b * 40,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          // Forest Gate: grass-blade sway
          for (let i = 0; i < 16; i += 1) {
            const gx = (i * 93 + 40) % W;
            const gy = 85 + ((i * 61) % 470);
            const grassBlade = this.add.rectangle(gx, gy, 3, 13 + (i % 3) * 4, 0x4a7c30, 0.45).setOrigin(0.5, 1).setDepth(-18);
            const baseAngle = (i * 25) % 40 - 20;
            grassBlade.setAngle(baseAngle);
            this.tweens.add({
              targets: grassBlade,
              angle: baseAngle + 8,
              duration: 1800 + (i % 4) * 400,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
              delay: i * 110,
            });
          }
        } else if (this.mapIndex === 1) {
          // Stone Pass: mist layers
          for (let i = 0; i < 3; i += 1) {
            const mistX = (i * 160 + 40) % W;
            const mistY = 200 + i * 120;
            const mist = this.add.ellipse(mistX, mistY, 80 + i * 20, 16, theme.tint, 0.15).setDepth(-17);
            this.tweens.add({
              targets: mist, x: mistX + 40 - i * 20, duration: 3000 + i * 1000, yoyo: true, repeat: -1,
            });
          }
          // Stone Pass: stone dust particles near road edges
          const dustColors = [0x9a9890, 0x7c7468, 0x8e8a80, 0x6a6458];
          for (let i = 0; i < 4; i += 1) {
            const pt = this.path[Math.min(this.path.length - 1, 1 + i * 2)] || this.path[i % this.path.length];
            const dx = pt.x + (i % 2 === 0 ? 18 : -18);
            const dy = pt.y + (i % 2 === 0 ? -10 : 10);
            const dust = this.textures.exists("fx_dust")
              ? this.add.image(dx, dy, "fx_dust").setScale(0.35 + (i % 2) * 0.12).setTint(dustColors[i]).setAlpha(0.6).setDepth(-17)
              : this.add.circle(dx, dy, 1.5 + (i % 2) * 0.5, dustColors[i], 0.55).setDepth(-17);
            if (dust.setAngle) dust.setAngle(i * 45);
            this.tweens.add({
              targets: dust,
              y: dy - 25 - i * 6,
              x: dx + (i % 2 === 0 ? 6 : -6),
              scale: (dust.scale || 1) * 1.35,
              alpha: { from: 0.6, to: 0.15 },
              duration: 2500 + i * 400,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          // Stone Pass: 2 circling crows
          for (let c = 0; c < 2; c += 1) {
            const cx = 110 + c * 170;
            const cy = 130 + c * 90;
            const crow = this.add.graphics().setDepth(-16);
            crow.lineStyle(1.5, 0x1f2421, 0.75);
            crow.beginPath();
            crow.moveTo(-4, -2);
            crow.lineTo(0, 1.5);
            crow.lineTo(4, -2);
            crow.strokePath();
            crow.setPosition(cx, cy);
            const pathRadius = 35 + c * 15;
            const baseAngle = c * Math.PI;
            this.tweens.addCounter({
              from: 0,
              to: Math.PI * 2,
              duration: 6500 + c * 2000,
              repeat: -1,
              onUpdate: (tween) => {
                const val = tween.getValue();
                crow.setPosition(cx + Math.cos(val + baseAngle) * pathRadius, cy + Math.sin(val + baseAngle) * (pathRadius * 0.5));
              },
            });
          }
          // Stone Pass: grit puffs
          for (let g = 0; g < 3; g += 1) {
            const gx = (g * 130 + 50) % W;
            const gy = 150 + g * 110;
            const grit = this.add.circle(gx, gy, 1.5, 0xadaaa0, 0.5).setDepth(-17);
            this.tweens.add({
              targets: grit,
              x: gx + (g % 2 === 0 ? 20 : -20),
              y: gy - 20,
              alpha: { from: 0.55, to: 0.1 },
              duration: 2700 + g * 450,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        } else if (this.mapIndex === 2) {
          // Ember Marsh: heat shimmer bubbles
          for (let i = 0; i < 6; i += 1) {
            const bx = (i * 73 + 20) % W;
            const by = 150 + ((i * 47) % 350);
            const bubble = this.add.circle(bx, by, 2 + (i % 3), 0xe0a060, 0.3).setDepth(-17);
            this.tweens.add({
              targets: bubble, y: by - 20 - Math.random() * 15, alpha: 0, duration: 2000 + Math.random() * 1500,
              yoyo: false, repeat: -1, delay: i * 400,
            });
          }
          // Ember Marsh: marsh gas bubbles rising from ground
          const gasColors = [0x98c838, 0xd4d840, 0x78a830, 0xb8d048, 0x88b030];
          for (let i = 0; i < 5; i += 1) {
            const pt = this.path[Math.min(this.path.length - 1, i * 2)] || this.path[0];
            const gx = pt.x + ((i * 37) % 50) - 25;
            const gy = pt.y + ((i * 29) % 40) - 10;
            const gas = this.add.circle(gx, gy, 2 + (i % 2), gasColors[i], 0.55).setDepth(-17);
            this.tweens.add({
              targets: gas,
              y: gy - 36,
              alpha: { from: 0.65, to: 0 },
              duration: 2200 + i * 300,
              repeat: -1,
              delay: i * 350,
            });
            this.tweens.add({
              targets: gas,
              x: gx + (i % 2 === 0 ? 8 : -8),
              duration: 650 + (i % 3) * 150,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          // Ember Marsh: ember motes rising
          const emberColors = [0xff6600, 0xff9900, 0xff3300, 0xffcc00];
          for (let e = 0; e < 8; e += 1) {
            const ex = (e * 67 + 35) % W;
            const ey = 180 + ((e * 59) % 360);
            const ember = this.add.circle(ex, ey, 1.5 + (e % 2) * 0.5, emberColors[e % emberColors.length], 0.7).setDepth(-17);
            this.tweens.add({
              targets: ember,
              y: ey - 40 - (e % 3) * 15,
              x: ex + (e % 2 === 0 ? 15 : -15),
              alpha: { from: 0.8, to: 0 },
              scale: { from: 1, to: 0.4 },
              duration: 2000 + e * 300,
              repeat: -1,
              delay: e * 250,
              ease: "Quad.easeOut",
            });
          }
        }
      }

      if (this.textures.exists("cloud_soft")) {
        for (let i = 0; i < 4; i += 1) {
          const x = 40 + i * 100;
          const y = 58 + (i % 2) * 14;
          this.add.image(x, y, "cloud_soft").setScale(0.9 + (i % 3) * 0.15).setAlpha(0.55).setDepth(-18);
        }
      }

      const edge = this.add.graphics().setDepth(-10);
      edge.lineStyle(PATH_WIDTH + 14, theme.roadEdge, 0.95);
      this.strokePath(edge);
      const roadShadow = this.add.graphics().setDepth(-9);
      roadShadow.lineStyle(PATH_WIDTH + 6, 0x140e08, 0.4);
      this.strokePath(roadShadow);

      const tileKey =
        this.mapIndex === 0 ? "tile_dirt" :
        (this.mapIndex === 1 || this.mapIndex === 3) ? "tile_stone" :
        "tile_ember";
      const edgeKey =
        this.mapIndex === 0 ? "tile_dirt_edge" :
        (this.mapIndex === 1 || this.mapIndex === 3) ? "tile_stone_edge" :
        "tile_ember_edge";

      const ribbon = this.add.graphics().setDepth(-8.4);
      ribbon.lineStyle(PATH_WIDTH, theme.road, 1);
      this.strokePath(ribbon);

      if (this.textures.exists(tileKey)) {
        const stepDist = 14;
        for (let i = 0; i < this.path.length - 1; i += 1) {
          const a = this.path[i];
          const b = this.path[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          if (len === 0) continue;
          const angle = Math.atan2(dy, dx);
          const angleDeg = Phaser.Math.RadToDeg(angle);
          const steps = Math.max(1, Math.round(len / stepDist));
          const nx = -Math.sin(angle);
          const ny = Math.cos(angle);
          const edgeOffset = PATH_WIDTH * 0.42;

          for (let s = 0; s <= steps; s += 1) {
            const t = s / steps;
            const px = a.x + dx * t;
            const py = a.y + dy * t;

            const dirtKeys = ["tile_dirt", "tile_dirt_b", "tile_dirt_c"].filter((k) => this.textures.exists(k));
            const useKey = this.mapIndex === 0 && dirtKeys.length
              ? dirtKeys[(i * 5 + s) % dirtKeys.length]
              : tileKey;
            this.add.image(px, py, useKey).setAngle(angleDeg).setDepth(-8).setScale(1.28, 1.08).setAlpha(0.78);

            if (this.textures.exists(edgeKey) && s % 2 === 0) {
              this.add.image(px + nx * edgeOffset, py + ny * edgeOffset, edgeKey)
                .setAngle(angleDeg).setDepth(-7.8).setScale(1.05, 0.9).setAlpha(0.55);
              this.add.image(px - nx * edgeOffset, py - ny * edgeOffset, edgeKey)
                .setAngle(angleDeg + 180).setDepth(-7.8).setScale(1.05, 0.9).setAlpha(0.55);
            }
          }
        }
      } else {
        const road = this.add.graphics().setDepth(-8);
        road.lineStyle(PATH_WIDTH, theme.road, 1);
        this.strokePath(road);
        const center = this.add.graphics().setDepth(-7);
        center.lineStyle(3, theme.pathMid, 0.45);
        this.strokePath(center);
      }

      if (this.mapIndex === 0 && this.path && this.path.length >= 2) {
        const ruts = this.add.graphics().setDepth(-7.5);
        const normals = [];
        for (let i = 0; i < this.path.length; i += 1) {
          if (i === 0) {
            const dx = this.path[1].x - this.path[0].x;
            const dy = this.path[1].y - this.path[0].y;
            const len = Math.hypot(dx, dy) || 1;
            normals.push({ nx: -dy / len, ny: dx / len });
          } else if (i === this.path.length - 1) {
            const dx = this.path[i].x - this.path[i - 1].x;
            const dy = this.path[i].y - this.path[i - 1].y;
            const len = Math.hypot(dx, dy) || 1;
            normals.push({ nx: -dy / len, ny: dx / len });
          } else {
            const dx1 = this.path[i].x - this.path[i - 1].x;
            const dy1 = this.path[i].y - this.path[i - 1].y;
            const len1 = Math.hypot(dx1, dy1) || 1;
            const dx2 = this.path[i + 1].x - this.path[i].x;
            const dy2 = this.path[i + 1].y - this.path[i].y;
            const len2 = Math.hypot(dx2, dy2) || 1;
            const n1x = -dy1 / len1;
            const n1y = dx1 / len1;
            const n2x = -dy2 / len2;
            const n2y = dx2 / len2;
            const mx = n1x + n2x;
            const my = n1y + n2y;
            const mlen = Math.hypot(mx, my) || 1;
            normals.push({ nx: mx / mlen, ny: my / mlen });
          }
        }

        const rutOffset = 10;
        for (const side of [-1, 1]) {
          const off = side * rutOffset;
          ruts.lineStyle(3, 0x241508, 0.65);
          for (let i = 0; i < this.path.length - 1; i += 1) {
            ruts.lineBetween(
              this.path[i].x + normals[i].nx * off,
              this.path[i].y + normals[i].ny * off,
              this.path[i + 1].x + normals[i + 1].nx * off,
              this.path[i + 1].y + normals[i + 1].ny * off
            );
          }
          ruts.lineStyle(1.5, 0x140a04, 0.82);
          for (let i = 0; i < this.path.length - 1; i += 1) {
            ruts.lineBetween(
              this.path[i].x + normals[i].nx * off,
              this.path[i].y + normals[i].ny * off,
              this.path[i + 1].x + normals[i + 1].nx * off,
              this.path[i + 1].y + normals[i + 1].ny * off
            );
          }
        }
      }

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
              .setAlpha(0.4)
              .setDepth(-6.5)
              .setAngle(Phaser.Math.RadToDeg(Math.atan2(b.y - a.y, b.x - a.x)));
          }
        }
      }

      const renderPlaque = (cx, cy, labelText) => {
        const pw = labelText === "OUT" ? 34 : 28;
        const ph = 18;
        const plaqueG = this.add.graphics().setDepth(-6.2);
        plaqueG.fillStyle(0x0c0704, 0.45);
        plaqueG.fillRoundedRect(cx - pw / 2 + 1, cy - ph / 2 + 1, pw, ph, 4);
        plaqueG.fillStyle(0x382213, 1);
        plaqueG.fillRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 4);
        plaqueG.fillStyle(0x5e3e26, 1);
        plaqueG.fillRoundedRect(cx - pw / 2 + 1.5, cy - ph / 2 + 1.5, pw - 3, ph - 3, 3);
        plaqueG.lineStyle(1, 0x997048, 0.65);
        plaqueG.lineBetween(cx - pw / 2 + 3, cy - ph / 2 + 2, cx + pw / 2 - 3, cy - ph / 2 + 2);
        plaqueG.fillStyle(0xd49e4d, 0.85);
        plaqueG.fillCircle(cx - pw / 2 + 3, cy - ph / 2 + 3, 1);
        plaqueG.fillCircle(cx + pw / 2 - 3, cy - ph / 2 + 3, 1);
        plaqueG.fillCircle(cx - pw / 2 + 3, cy + ph / 2 - 3, 1);
        plaqueG.fillCircle(cx + pw / 2 - 3, cy + ph / 2 - 3, 1);

        this.add
          .text(cx, cy, labelText, {
            font: "bold 11px 'Source Sans 3', Arial",
            color: "#f8ecd0",
            shadow: { offsetX: 1, offsetY: 1, color: "#1a0e05", blur: 1, fill: true },
          })
          .setOrigin(0.5, 0.5)
          .setDepth(-6);
      };

      renderPlaque(MAP_LAYOUT.entryLabelX + 12, MAP_LAYOUT.entryLabelY + 7, "IN");

      if (this.path && this.path.length > 0) {
        const exitPt = this.path[this.path.length - 1];
        const outX = exitPt.x > W - 12 ? W - 22 : (exitPt.x < 12 ? 22 : exitPt.x);
        const outY = exitPt.y > SHOP_Y - 12 ? SHOP_Y - 14 : (exitPt.y < TOP_H + 12 ? TOP_H + 14 : exitPt.y);
        renderPlaque(outX, outY, "OUT");
      }

      const distToPath = (x, y) => {
        let best = 1e9;
        for (let i = 0; i < this.path.length - 1; i += 1) {
          const a = this.path[i];
          const b = this.path[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l2 = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2));
          const d = Phaser.Math.Distance.Between(x, y, a.x + dx * t, a.y + dy * t);
          if (d < best) best = d;
        }
        return best;
      };

      const placedDecor = [];
      const placeAway = (n, minPath, minPeer, preferEdge, fn) => {
        let placed = 0;
        for (let i = 0; i < n * 20 && placed < n; i += 1) {
          let x = 18 + ((i * 67 + placed * 41 + this.mapIndex * 13) % 384);
          let y = 80 + ((i * 89 + placed * 53 + this.mapIndex * 17) % 520);
          if (preferEdge) {
            const ring = (i + placed) % 4;
            if (ring === 0) x = 14 + ((i * 19) % 52);
            else if (ring === 1) x = 356 + ((i * 17) % 48);
            else if (ring === 2) y = 78 + ((i * 13) % 50);
            else y = 548 + ((i * 11) % 42);
            x += ((i * 13) % 17) - 8;
            y += ((i * 11) % 15) - 7;
          }
          if (x < 12 || x > 408 || y < 74 || y > 618) continue;
          if (distToPath(x, y) < minPath) continue;
          if (this.buildPads.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 48)) continue;
          if (Phaser.Math.Distance.Between(x, y, 378, 520) < 72) continue;
          if (placedDecor.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < minPeer)) continue;
          fn(x, y, placed);
          placedDecor.push({ x, y });
          placed += 1;
        }
      };

      const grove = [
        { trees: 14, bush: 10, rock: 8, ruin: 1 },
        { trees: 4, bush: 2, rock: 16, ruin: 4 },
        { trees: 3, bush: 1, rock: 10, ruin: 5 },
        { trees: 6, bush: 6, rock: 8, ruin: 2 },
        { trees: 2, bush: 1, rock: 14, ruin: 3 },
      ][this.mapIndex] || { trees: 10, bush: 8, rock: 10, ruin: 2 };

      placeAway(grove.trees, 56, 58, true, (x, y, i) => {
        const key = i % 3 === 0 && this.textures.exists("tree_oak") ? "tree_oak" : "tree_pine";
        this.add.image(x, y - 18, key).setScale(0.92 + (i % 5) * 0.08).setDepth(-15).setTint(theme.tint);
      });
      placeAway(grove.bush, 50, 46, false, (x, y, i) => {
        if (this.textures.exists("bush_round")) {
          this.add.image(x, y, "bush_round").setScale(0.62 + (i % 4) * 0.08).setDepth(-14).setTint(theme.tint);
        }
      });
      placeAway(grove.rock, 46, 42, false, (x, y, i) => {
        if (i % 2 === 0) this.add.image(x, y, "rock_moss").setScale(0.85).setDepth(-6).setTint(theme.tint);
        else if (this.textures.exists("flower_patch") && this.mapIndex === 0) this.add.image(x, y, "flower_patch").setScale(0.85).setDepth(-6);
        else this.add.image(x, y, "rock_moss").setScale(0.7).setDepth(-6).setTint(theme.tint);
      });
      placeAway(grove.ruin, 58, 70, true, (x, y) => {
        if (this.textures.exists("ruin_pillar")) this.add.image(x, y - 8, "ruin_pillar").setScale(0.9).setDepth(-13).setTint(theme.tint);
      });
      placeAway(2, 54, 80, true, (x, y) => {
        if (this.textures.exists("banner_flag")) {
          const flag = this.add.image(x, y - 10, "banner_flag").setScale(0.95).setDepth(-12);
          if (!this.settings?.reducedMotion) {
            this.tweens.add({
              targets: flag,
              rotation: 0.05,
              scaleX: 0.98,
              duration: 1600 + Math.random() * 400,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }
      });

      const gatePosX = 378;
      const gatePosY = 520;
      const gateScale = 1.15;

      const gateGlow = this.add.graphics().setDepth(-5.5);
      gateGlow.fillStyle(0xffaa22, 0.25);
      gateGlow.fillCircle(gatePosX, gatePosY - 4, 32);
      gateGlow.fillStyle(0xff7700, 0.3);
      gateGlow.fillCircle(gatePosX, gatePosY - 4, 20);
      gateGlow.fillStyle(0xffd455, 0.7);
      gateGlow.fillCircle(gatePosX - 35 * gateScale, gatePosY - 8 * gateScale, 4);
      gateGlow.fillCircle(gatePosX + 35 * gateScale, gatePosY - 8 * gateScale, 4);
      gateGlow.fillStyle(0xff8800, 0.5);
      gateGlow.fillCircle(gatePosX - 35 * gateScale, gatePosY - 8 * gateScale, 7);
      gateGlow.fillCircle(gatePosX + 35 * gateScale, gatePosY - 8 * gateScale, 7);

      if (!this.settings?.reducedMotion) {
        this.tweens.add({
          targets: gateGlow,
          alpha: { from: 0.75, to: 1.0 },
          scaleX: { from: 0.96, to: 1.05 },
          scaleY: { from: 0.96, to: 1.05 },
          duration: 850 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      if (this.textures.exists("gate_arch")) {
        this.gateImage = this.add.image(gatePosX, gatePosY, "gate_arch").setDepth(-5).setScale(gateScale);
      } else {
        this.gateImage = this.add.rectangle(gatePosX, gatePosY, MAP_LAYOUT.gateWidth, MAP_LAYOUT.gateHeight, 0x57402c, 1).setStrokeStyle(3, 0x2d2117).setDepth(-5);
        this.add.rectangle(gatePosX, gatePosY, MAP_LAYOUT.gateInnerWidth, MAP_LAYOUT.gateInnerHeight, 0x15100c, 0.9).setDepth(-4);
      }
      if (this.textures.exists("gate_leak")) {
        this.gateLeakOverlay = this.add.image(gatePosX, gatePosY, "gate_leak").setDepth(-4.8).setScale(gateScale).setAlpha(0);
      }
      this.dressBattlefield();

      const vig = this.add.graphics().setDepth(-3);
      vig.fillStyle(0x000000, 0.38);
      vig.fillRect(0, 0, W, 28);
      vig.fillRect(0, H - 28, W, 28);
      vig.fillStyle(0x000000, 0.22);
      vig.fillRect(0, 0, 18, H);
      vig.fillRect(W - 18, 0, 18, H);
      vig.fillStyle(0x000000, 0.12);
      vig.fillRect(0, 28, W, 18);
      vig.fillRect(0, H - 46, W, 18);
    }

    paintMapGround(theme) {
      const g = this.add.graphics().setDepth(-20.4);
      const idx = this.mapIndex | 0;
      if (idx === 0) {
        g.fillStyle(0x244218, 0.32);
        for (let i = 0; i < 20; i += 1) {
          g.fillEllipse((i * 67 + 40) % W, 90 + ((i * 91) % 500), 52 + (i % 4) * 14, 20 + (i % 3) * 9);
        }
        // Stronger warm sun dappled light ellipses (Forest Gate only)
        g.fillStyle(0xffe08a, 0.22);
        for (let i = 0; i < 18; i += 1) {
          const sx = (i * 73 + 55) % (W - 40) + 20;
          const sy = 95 + ((i * 89 + 30) % 480);
          g.fillEllipse(sx, sy, 64 + (i % 3) * 18, 24 + (i % 4) * 8);
        }
        g.fillStyle(0xfff4b0, 0.14);
        for (let i = 0; i < 10; i += 1) {
          const sx = (i * 97 + 80) % (W - 60) + 30;
          const sy = 120 + ((i * 103) % 430);
          g.fillEllipse(sx, sy, 40 + (i % 3) * 12, 16 + (i % 2) * 6);
        }
      } else if (idx === 1) {
        // Stone Pass: Cool slate bedrock with cool silver-blue light patches (no olive/green)
        g.fillStyle(0x3a4854, 0.32);
        for (let i = 0; i < 16; i += 1) {
          g.fillRoundedRect((i * 53 + 10) % Math.max(40, W - 80), 85 + ((i * 79) % 470), 48 + (i % 3) * 18, 18, 3);
        }
        // Cool slate/granite light dapples hitting the canyon floor
        g.fillStyle(0x8da6bc, 0.22);
        for (let i = 0; i < 16; i += 1) {
          const sx = (i * 67 + 35) % (W - 50) + 25;
          const sy = 95 + ((i * 83 + 20) % 470);
          g.fillEllipse(sx, sy, 56 + (i % 3) * 16, 20 + (i % 4) * 6);
        }
        g.fillStyle(0xc6d8e8, 0.15);
        for (let i = 0; i < 10; i += 1) {
          const sx = (i * 89 + 60) % (W - 60) + 30;
          const sy = 110 + ((i * 97) % 440);
          g.fillEllipse(sx, sy, 38 + (i % 3) * 12, 14 + (i % 2) * 6);
        }
        // Cool rock strata striations
        g.lineStyle(1.8, 0x1e2730, 0.45);
        for (let i = 0; i < 9; i += 1) {
          const x = 24 + i * 44;
          g.lineBetween(x, 110 + (i % 3) * 70, x + 36, 200 + i * 36);
        }
        g.lineStyle(1.1, 0xd0e2f2, 0.18);
        for (let i = 0; i < 7; i += 1) {
          const x = 32 + i * 52;
          g.lineBetween(x, 112 + (i % 3) * 70, x + 34, 198 + i * 36);
        }
      } else if (idx === 2) {
        // Ember Marsh: Scorched peat with radiant ember glow patches
        g.fillStyle(0x261008, 0.45);
        g.fillRect(0, 70, W, H - 70);
        // Volcanic fissure fractures
        g.lineStyle(2.4, 0xcc2c08, 0.55);
        for (let i = 0; i < 8; i += 1) {
          const x = 16 + i * 50;
          g.lineBetween(x, 130 + i * 28, x + 34, 310 + i * 18);
        }
        g.lineStyle(1.2, 0xffaa20, 0.7);
        for (let i = 0; i < 8; i += 1) {
          const x = 16 + i * 50;
          g.lineBetween(x + 2, 132 + i * 28, x + 32, 308 + i * 18);
        }
        // Deep ember heat aura patches
        g.fillStyle(0xb81e04, 0.32);
        for (let i = 0; i < 14; i += 1) {
          const ex = (i * 71 + 25) % (W - 40) + 20;
          const ey = 100 + ((i * 79 + 40) % 460);
          g.fillEllipse(ex, ey, 48 + (i % 3) * 18, 22 + (i % 2) * 8);
        }
        // Bright radiant ember glow pools
        g.fillStyle(0xff5511, 0.35);
        for (let i = 0; i < 12; i += 1) {
          const ex = (i * 73 + 30) % (W - 40) + 20;
          const ey = 105 + ((i * 81 + 35) % 450);
          g.fillEllipse(ex, ey, 32 + (i % 3) * 12, 14 + (i % 2) * 6);
        }
        // Hot molten ember centers
        g.fillStyle(0xffbb30, 0.26);
        for (let i = 0; i < 8; i += 1) {
          const ex = (i * 93 + 50) % (W - 60) + 30;
          const ey = 125 + ((i * 101) % 420);
          g.fillEllipse(ex, ey, 18 + (i % 2) * 8, 8 + (i % 2) * 3);
        }
        g.fillStyle(0xfff070, 0.16);
        for (let i = 0; i < 6; i += 1) {
          const ex = (i * 97 + 65) % (W - 70) + 35;
          const ey = 135 + ((i * 109) % 400);
          g.fillEllipse(ex, ey, 8, 4);
        }
      } else if (idx === 3) {
        // Gale Reach: Alpine crags with wind-scuffed highlights
        g.fillStyle(0x283e3c, 0.28);
        for (let i = 0; i < 14; i += 1) {
          g.fillEllipse((i * 61) % W, 100 + ((i * 77) % 460), 74, 15);
        }
        // Broad wind-scuffed swaths
        g.fillStyle(0x6eb4ae, 0.20);
        for (let i = 0; i < 15; i += 1) {
          const wx = (i * 67 + 20) % (W - 30) + 15;
          const wy = 95 + ((i * 83 + 15) % 470);
          g.fillEllipse(wx, wy, 68 + (i % 4) * 16, 18 + (i % 3) * 6);
        }
        // Bright wind-scuffed crag highlights
        g.fillStyle(0xd6f4f2, 0.22);
        for (let i = 0; i < 12; i += 1) {
          const wx = (i * 79 + 45) % (W - 50) + 25;
          const wy = 105 + ((i * 89 + 25) % 450);
          g.fillEllipse(wx, wy, 44 + (i % 3) * 14, 12 + (i % 2) * 5);
        }
        // Frosted wind-sheen glints
        g.fillStyle(0xf0fcfa, 0.14);
        for (let i = 0; i < 8; i += 1) {
          const wx = (i * 93 + 70) % (W - 60) + 30;
          const wy = 120 + ((i * 103) % 430);
          g.fillEllipse(wx, wy, 24 + (i % 2) * 8, 7);
        }
        // Sweeping wind streaks
        g.lineStyle(1.8, 0x82c4bd, 0.32);
        for (let i = 0; i < 11; i += 1) {
          g.lineBetween(0, 88 + i * 46, W, 68 + i * 46);
        }
        g.lineStyle(1.1, 0xdaf8f4, 0.28);
        for (let i = 0; i < 9; i += 1) {
          g.lineBetween(0, 92 + i * 52, W, 72 + i * 52);
        }
      } else {
        // Ash Spire (idx === 4): Basalt crust with smoldering cinder glow
        g.fillStyle(0x1e120e, 0.48);
        g.fillRect(0, 70, W, H - 70);
        // Basalt slabs
        g.fillStyle(0x100806, 0.55);
        for (let i = 0; i < 14; i += 1) {
          g.fillCircle((i * 79 + 20) % W, 120 + ((i * 67) % 440), 9 + (i % 3) * 6);
        }
        // Smoldering magma cracks
        g.lineStyle(2.2, 0xba2004, 0.48);
        for (let i = 0; i < 8; i += 1) {
          const x = 20 + i * 48;
          g.lineBetween(x, 115 + i * 32, x + 30, 275 + i * 22);
        }
        g.lineStyle(1.1, 0xff8818, 0.60);
        for (let i = 0; i < 8; i += 1) {
          const x = 20 + i * 48;
          g.lineBetween(x + 2, 117 + i * 32, x + 28, 273 + i * 22);
        }
        // Deep cinder underglow patches
        g.fillStyle(0x8a1402, 0.38);
        for (let i = 0; i < 14; i += 1) {
          const cx = (i * 67 + 35) % (W - 40) + 20;
          const cy = 100 + ((i * 81 + 30) % 460);
          g.fillEllipse(cx, cy, 50 + (i % 3) * 16, 20 + (i % 2) * 8);
        }
        // Glowing cinder patches
        g.fillStyle(0xd83606, 0.32);
        for (let i = 0; i < 12; i += 1) {
          const cx = (i * 73 + 45) % (W - 50) + 25;
          const cy = 110 + ((i * 87 + 25) % 440);
          g.fillEllipse(cx, cy, 32 + (i % 3) * 12, 14 + (i % 2) * 5);
        }
        // Bright cinder hot spots & ember cores
        g.fillStyle(0xff6e12, 0.25);
        for (let i = 0; i < 8; i += 1) {
          const cx = (i * 89 + 60) % (W - 60) + 30;
          const cy = 125 + ((i * 99) % 420);
          g.fillEllipse(cx, cy, 18 + (i % 2) * 6, 8 + (i % 2) * 3);
        }
        g.fillStyle(0xffca28, 0.18);
        for (let i = 0; i < 6; i += 1) {
          const cx = (i * 93 + 75) % (W - 70) + 35;
          const cy = 135 + ((i * 105) % 400);
          g.fillEllipse(cx, cy, 8, 4);
        }
      }
    }

    strokePath(graphics) {
      graphics.beginPath();
      graphics.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i += 1) graphics.lineTo(this.path[i].x, this.path[i].y);
      graphics.strokePath();
    }

    dressBattlefield() {
      this.worldStains = this.worldStains || [];
      if (!this.path?.length) return;
      const reduced = !!this.settings?.reducedMotion;
      const idx = this.mapIndex | 0;

      for (let i = 0; i < this.path.length; i += 1) {
        const p = this.path[i];
        const n = this.path[Math.min(this.path.length - 1, i + 1)];
        const dx = n.x - p.x;
        const dy = n.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const side = i % 2 === 0 ? 1 : -1;
        const ox = p.x + nx * (22 + (i % 3) * 7) * side;
        const oy = p.y + ny * (18 + (i % 3) * 5) * side;
        if (oy < TOP_H + 10 || oy > SHOP_Y - 22) continue;
        const kind = i % 5;
        if (kind === 0) {
          this.add.ellipse(ox, oy + 2, 15, 9, 0x3a2818, 0.5).setDepth(-13);
          this.add.ellipse(ox - 2, oy - 2, 10, 7, 0x6a5040, 0.45).setDepth(-13);
        } else if (kind === 1) {
          this.add.rectangle(ox, oy + 5, 3, 7, 0xc8b090, 0.85).setDepth(-11);
          const cap = this.add.circle(ox, oy, 5.5, 0x8a3040, 0.9).setDepth(-11);
          if (!reduced) {
            this.tweens.add({ targets: cap, scale: 1.1, duration: 1500 + i * 50, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          }
        } else if (kind === 2) {
          this.add.ellipse(ox, oy + 3, 22, 9, 0x152214, 0.32).setDepth(-14);
        } else {
          const tuft = this.add.rectangle(ox, oy, 3, 12, 0x4a7c30, 0.55).setOrigin(0.5, 1).setDepth(-13);
          tuft.setAngle((i * 17) % 24 - 12);
          if (!reduced) {
            this.tweens.add({ targets: tuft, angle: tuft.angle + 9, duration: 1700 + i * 40, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          }
        }
      }
      if (!reduced) {
        for (let i = 0; i < 5; i += 1) {
          const p = this.path[Math.min(this.path.length - 1, 1 + i * 2)];
          const mote = this.add.circle(p.x, p.y - 4, 1.7, 0xf5e6b0, 0.32).setDepth(12);
          this.tweens.add({
            targets: mote,
            y: p.y - 22,
            alpha: 0.06,
            duration: 2100 + i * 180,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }

      // —— Map-Specific Battlefield Dressings ——
      if (idx === 0) {
        // Map 0 (Forest Gate): Extra wild flowers and glowing fireflies
        const flowerColors = [0xffd54f, 0xeb4d88, 0x4fc3f7, 0xffffff, 0xffca28];
        for (let i = 0; i < this.path.length; i += 1) {
          const p = this.path[i];
          const n = this.path[Math.min(this.path.length - 1, i + 1)];
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const side = i % 2 === 0 ? -1 : 1;
          const fx = p.x + nx * (30 + (i % 4) * 6) * side;
          const fy = p.y + ny * (24 + (i % 3) * 6) * side;
          if (fy < TOP_H + 12 || fy > SHOP_Y - 20) continue;

          this.add.rectangle(fx, fy + 3, 1.8, 6, 0x3d7024, 0.75).setDepth(-12);
          const col = flowerColors[i % flowerColors.length];
          const petal = this.add.circle(fx, fy, 3.2, col, 0.92).setDepth(-11);
          this.add.circle(fx, fy, 1.2, 0x3d2810, 0.85).setDepth(-10.8);
          if (!reduced) {
            this.tweens.add({
              targets: petal,
              scale: 1.18,
              duration: 1800 + i * 120,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }

        if (!reduced) {
          for (let i = 0; i < 7; i += 1) {
            const p = this.path[Math.min(this.path.length - 1, (i * 2 + 1) % this.path.length)];
            const ffx = p.x + ((i * 37) % 60 - 30);
            const ffy = p.y + ((i * 29) % 50 - 25);
            if (ffy < TOP_H + 15 || ffy > SHOP_Y - 25) continue;
            const halo = this.add.circle(ffx, ffy, 4.0, 0xb4ff40, 0.22).setDepth(13);
            const core = this.add.circle(ffx, ffy, 1.6, 0xf6ffb0, 0.95).setDepth(13.1);
            this.tweens.add({
              targets: [halo, core],
              x: ffx + ((i % 2 === 0 ? 1 : -1) * (14 + i * 2)),
              y: ffy - (12 + (i % 3) * 6),
              alpha: { from: 0.95, to: 0.25 },
              duration: 2200 + i * 260,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }
      } else if (idx === 1) {
        // Map 1 (Stone Pass): Extra rocks, slate boulders, and ruin stones
        for (let i = 0; i < this.path.length; i += 1) {
          const p = this.path[i];
          const n = this.path[Math.min(this.path.length - 1, i + 1)];
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const side = (i % 3 === 0) ? -1 : 1;
          const rx = p.x + nx * (28 + (i % 3) * 8) * side;
          const ry = p.y + ny * (22 + (i % 4) * 6) * side;
          if (ry < TOP_H + 12 || ry > SHOP_Y - 20) continue;

          this.add.ellipse(rx + 1, ry + 3, 16, 8, 0x10161c, 0.45).setDepth(-13);
          if (i % 2 === 0) {
            const stone = this.add.rectangle(rx, ry, 11, 7, 0x627484, 0.88).setStrokeStyle(1.2, 0x1e2832, 0.75).setDepth(-12);
            stone.setAngle((i * 19) % 30 - 15);
            this.add.circle(rx - 2, ry - 1, 2.0, 0x547040, 0.65).setDepth(-11.5);
          } else {
            this.add.ellipse(rx, ry, 12, 7.5, 0x7c8e9e, 0.9).setDepth(-12);
            this.add.ellipse(rx - 1, ry - 1.5, 6, 3, 0xc4d8e8, 0.45).setDepth(-11.5);
          }
        }
      } else if (idx === 2) {
        // Map 2 (Ember Marsh): Extra glowing ember sparks
        if (!reduced) {
          for (let i = 0; i < 9; i += 1) {
            const p = this.path[Math.min(this.path.length - 1, (i * 2) % this.path.length)];
            const ex = p.x + ((i * 43) % 70 - 35);
            const ey = p.y + ((i * 31) % 40 - 20);
            if (ey < TOP_H + 15 || ey > SHOP_Y - 25) continue;
            const sparkCol = i % 3 === 0 ? 0xffea40 : (i % 2 === 0 ? 0xff7700 : 0xff3300);
            const spark = this.add.circle(ex, ey, 1.8 + (i % 2) * 0.6, sparkCol, 0.88).setDepth(13);
            this.tweens.add({
              targets: spark,
              x: ex + ((i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 5)),
              y: ey - (22 + (i % 4) * 8),
              alpha: { from: 0.95, to: 0.05 },
              scale: { from: 1.2, to: 0.4 },
              duration: 1600 + i * 180,
              repeat: -1,
              ease: "Cubic.easeOut",
            });
          }
        }
      } else if (idx === 3) {
        // Map 3 (Gale Reach): Extra sweeping wind streaks
        const windG = this.add.graphics().setDepth(-6.5);
        windG.lineStyle(1.4, 0xb8e8e4, 0.35);
        for (let i = 0; i < 6; i += 1) {
          const wy = 100 + i * 62;
          windG.lineBetween(20, wy, W - 20, wy - 24);
        }
        windG.lineStyle(0.9, 0xe2f8f6, 0.28);
        for (let i = 0; i < 5; i += 1) {
          const wy = 125 + i * 68;
          windG.lineBetween(40, wy, W - 40, wy - 20);
        }
        if (!reduced) {
          for (let i = 0; i < 5; i += 1) {
            const wy = 110 + i * 72;
            const streak = this.add.rectangle(0, wy, 48 + i * 10, 1.5, 0xdaf6f4, 0.4).setDepth(-6.4);
            streak.setAngle(-3.5);
            this.tweens.add({
              targets: streak,
              x: { from: -40, to: W + 40 },
              alpha: { from: 0.1, to: 0.5 },
              duration: 2600 + i * 400,
              repeat: -1,
              ease: "Linear",
              delay: i * 380,
            });
          }
        }
      } else if (idx === 4) {
        // Map 4 (Ash Spire): Extra smoldering cinder dots
        const cinderColors = [0xff4400, 0xff8800, 0xffc830, 0xff5511];
        for (let i = 0; i < 14; i += 1) {
          const cx = (i * 61 + 30) % (W - 50) + 25;
          const cy = 95 + ((i * 73 + 15) % (H - 210));
          const col = cinderColors[i % cinderColors.length];
          const dot = this.add.circle(cx, cy, 1.5 + (i % 3) * 0.5, col, 0.65).setDepth(-12);
          if (!reduced) {
            this.tweens.add({
              targets: dot,
              alpha: { from: 0.3, to: 0.95 },
              scale: { from: 0.85, to: 1.3 },
              duration: 1300 + i * 140,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }
      }
    }

    createPads() {
      for (const pad of this.buildPads) {
        pad.tower = null;
        if (this.textures.exists("pad_empty")) {
          pad.base = this.add.image(pad.x, pad.y + 2, "pad_empty").setDepth(8).setScale(1.12);
          pad.glow = this.add.circle(pad.x, pad.y, 22, 0xf5d76e, 0.08).setStrokeStyle(2, 0xf5d76e, 0.35).setDepth(7);
        } else {
          pad.base = this.add.circle(pad.x, pad.y, 25, 0x1a2215, 0.95).setStrokeStyle(3, 0xb19b58, 0.9);
        }
        pad.icon = this.add
          .text(pad.x, pad.y - 4, "+", { font: "bold 22px 'Source Sans 3', Arial", color: "#fff2ba", stroke: "#3a2810", strokeThickness: 3 })
          .setOrigin(0.5)
          .setDepth(9);
        pad.hint = this.add
          .text(pad.x, pad.y - 30, "BUILD", {
            font: "bold 9px Cinzel",
            color: "#ffd866",
            stroke: "#2a1808",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setDepth(10);
        if (!this.settings?.reducedMotion) {
          if (pad.glow) {
            this.tweens.add({
              targets: pad.glow,
              alpha: { from: 0.12, to: 0.42 },
              scale: { from: 1, to: 1.12 },
              duration: 900,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          this.tweens.add({
            targets: pad.hint,
            y: pad.y - 36,
            alpha: { from: 0.55, to: 1 },
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }
    }

    findDenPosition() {
      for (let i = 1; i < this.path.length - 2; i += 1) {
        const p1 = this.path[i];
        const p2 = this.path[i + 1];
        for (let t = 0.3; t <= 0.7; t += 0.2) {
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          if (len === 0) continue;
          const nx = -dy / len;
          const ny = dx / len;
          for (const side of [-1, 1]) {
            const x = Math.round(px + nx * 56 * side);
            const y = Math.round(py + ny * 56 * side);
            if (x < 36 || x > 384 || y < 110 || y > 550) continue;
            if (this.buildPads.some((p) => Math.hypot(x - p.x, y - p.y) < 50)) continue;
            const np = this.nearestPathPoint(x, y);
            const d = Math.hypot(x - np.x, y - np.y);
            if (d >= 50 && d <= 62) {
              return { x, y };
            }
          }
        }
      }
      const mid = this.path[Math.floor(this.path.length / 2)];
      return { x: mid.x + 56, y: mid.y };
    }

    createWolfDen() {
      const pos = this.findDenPosition();
      const den = {
        x: pos.x,
        y: pos.y,
        soldiers: [],
        level: 0,
      };
      this.wolfDen = den;
      if (this.textures.exists("den_wolf")) {
        den.sprite = this.add.image(den.x, den.y, "den_wolf").setDepth(14);
      } else {
        den.sprite = this.add.rectangle(den.x, den.y, 48, 36, 0x5a6058).setDepth(14);
      }
      den.sprite.setInteractive({ useHandCursor: true });
      den.sprite.on("pointerdown", () => {
        if (this.overlayActive || this.gameEnded) return;
        const alive = den.soldiers.filter((s) => !s.dead);
        if (alive.length >= 2) {
          this.say("Wolf pack is full (max 2).");
          return;
        }
        if (this.gold < 40) {
          this.say("Need 40 gold.");
          this.audio?.playLayered?.("uiError");
          return;
        }
        this.gold -= 40;
        this.updateHud();
        this.spawnWolf(den);
        this.say("Wolf summoned.");
        this.audio?.play?.("ready", 0.2, 1.2);
        if (!this.settings?.reducedMotion) {
          this.tweens.add({
            targets: den.sprite,
            scaleX: 1.08,
            scaleY: 0.92,
            duration: 80,
            yoyo: true,
            ease: "Quad.easeOut",
          });
        }
      });
    }

    createHero() {
      const post = this.nearestPathPoint(this.path[Math.min(2, this.path.length - 1)].x, this.path[Math.min(2, this.path.length - 1)].y);
      this.heroSelected = false;
      const isSentinel = this.heroKind === "sentinel";
      const hp = isSentinel ? 380 : 260;
      this.hero = this.entityRegistry.create("hero", {
        x: post.x,
        y: post.y,
        targetX: post.x,
        targetY: post.y,
        hp,
        maxHp: hp,
        level: 1,
        xp: 0,
        attackCooldown: 0,
        attackPoseTime: 0,
        abilityPoseTime: 0,
        respawn: 0,
        commandTime: 0,
        dead: false,
        isHero: true,
      });
      this.hero.kind = this.heroKind;
      const ringContainer = this.add.container(post.x, post.y).setDepth(37).setVisible(false);
      const innerDisc = this.add.circle(0, 0, 22, 0xf5d76e, 0.18);
      const outerRing = this.add.circle(0, 0, 34, 0xf5d76e, 0.08).setStrokeStyle(3.5, 0xf5d76e, 0.9);
      ringContainer.add([innerDisc, outerRing]);
      this.hero.ring = ringContainer;
      const heroIdleKey = this.textures.exists("hero_captain_idle") ? "hero_captain_idle" : "hero_captain";
      this.hero.sprite = this.add.image(post.x, post.y - 18, heroIdleKey).setScale(1.02).setDepth(46);
      if (isSentinel) {
        this.hero.sprite.setTint(0xb8c4c8);
      } else {
        this.applyUnitTint(this.hero.sprite);
      }
      this.hero.barBg = this.add.rectangle(post.x, post.y - 58, 30, 4, 0x2a120e).setDepth(47);
      this.hero.bar = this.add.rectangle(post.x - 15, post.y - 58, 30, 4, 0x5fd86f).setOrigin(0, 0.5).setDepth(48);
      this.hero.levelText = this.add
        .text(post.x, post.y + 18, "", { font: "bold 9px 'Source Sans 3', Arial", color: "#fff2ba" })
        .setOrigin(0.5)
        .setDepth(49);
    }

    applyHeroKind() {
      if (!this.hero) return;
      this.hero.kind = this.heroKind;
      const isSentinel = this.heroKind === "sentinel";
      this.hero.maxHp = isSentinel ? 380 : 260;
      this.hero.hp = Math.min(this.hero.hp, this.hero.maxHp);
      if (isSentinel) {
        this.hero.sprite?.setTint?.(0xb8c4c8);
        this.hero.levelText?.setText?.("HLD");
      } else {
        this.applyUnitTint(this.hero.sprite);
        this.hero.levelText?.setText?.(`H${this.hero.level}`);
      }
      if (this.heroPortraitLabel) {
        this.heroPortraitLabel.setText(isSentinel ? "SENTINEL" : "CAPTAIN");
      }
      if (this.heroButtons?.[0]) {
        this.heroButtons[0].setLabel(isSentinel ? "Hold" : "Charge");
      }
    }

    createHud() {
      // Layered Wood & Stone Base HUD Bar — reserved right rail for Mute / Pause / Call
      this.add.rectangle(W / 2, TOP_H / 2, W, TOP_H, 0x1f1712, 0.98).setDepth(90);
      this.add.rectangle(W / 2, TOP_H / 2 - 12, W, TOP_H / 2 - 4, 0x2b2019, 0.6).setDepth(90.2);
      this.add.rectangle(W / 2, TOP_H / 2 + 10, W, TOP_H / 2 - 4, 0x1a120c, 0.6).setDepth(90.2);
      this.add.rectangle(W / 2, TOP_H / 2 - 4, W - 16, TOP_H - 22, 0x2d2116, 0.85).setDepth(90.5);
      this.add.rectangle(W / 2, TOP_H / 2 - 4, W - 20, TOP_H - 26, 0x3d2f20, 0.35).setDepth(90.6);
      this.add.rectangle(W / 2, TOP_H, W, 4, 0x4a3726).setDepth(91);
      this.add.rectangle(W / 2, TOP_H - 1, W, 2, 0x8a6a42).setDepth(91.2);
      this.add.rectangle(W / 2, TOP_H - 2, W, 1, 0xf5c85a, 0.6).setDepth(91.5);
      const nailX = [10, 92, 174, 248, 410];
      nailX.forEach((nx) => {
        this.add.circle(nx, 6, 2.5, 0xf5c85a, 0.9).setStrokeStyle(1, 0x3a250c).setDepth(92);
        this.add.circle(nx, TOP_H - 8, 2.5, 0xf5c85a, 0.9).setStrokeStyle(1, 0x3a250c).setDepth(92);
      });
      if (this.textures.exists("icon_gold")) this.add.image(16, 18, "icon_gold").setScale(0.78).setDepth(100);
      if (this.textures.exists("icon_heart")) this.add.image(92, 18, "icon_heart").setScale(0.78).setDepth(100);
      this.goldText = this.add.text(28, 8, "", { font: "bold 16px Arial", color: COLORS.gold, stroke: "#3a2810", strokeThickness: 3 }).setDepth(100);
      this.livesText = this.add.text(104, 8, "", { font: "bold 16px Arial", color: "#ff8a73", stroke: "#3a1010", strokeThickness: 3 }).setDepth(100);
      if (this.spellRank() > 1 && !this.spellRankHud) {
        this.spellRankHud = this.add.text(168, 10, `SPELLS ${["", "I", "II", "III"][this.spellRank()]}`, { font: "bold 9px Cinzel", color: "#f5c85a" }).setDepth(100);
      }
      if (this.ironMode && !this.ironHud) {
        this.ironHud = this.add.text(168, 24, "IRON", { font: "bold 9px Cinzel", color: "#c8d0d8" }).setDepth(100);
      }
      this.mapText = this.add.text(12, 34, "", { font: "bold 12px Arial", color: "#e8d9a8" }).setDepth(100);
      this.waveText = this.add.text(150, 34, "", { font: "bold 12px Arial", color: COLORS.ink }).setDepth(100);
      this.waveBarBg = this.add.rectangle(12, 52, 140, 5, 0x26351d, 1).setOrigin(0, 0.5).setDepth(100);
      this.waveBar = this.add.rectangle(12, 52, 1, 5, 0xf5c85a, 1).setOrigin(0, 0.5).setDepth(101);
      this.messageText = this.add
        .text(12, 52, "", { font: "bold 10px 'Source Sans 3', Arial", color: "#f8f0d8", wordWrap: { width: 230 } })
        .setOrigin(0, 0.5)
        .setDepth(102);
      this.muteButton = this.makeButton(
        268,
        28,
        30,
        26,
        "",
        0x3d4f5a,
        () => this.toggleMuted(),
        {
          icon: this.settings.muted ? "icon_sound_off" : "icon_sound_on",
          iconScale: 0.38,
          iconOffsetY: 0,
          tooltip: () => this.settings.muted ? "Unmute Audio (M)" : "Mute Audio (M)",
        }
      );
      this.pauseButton = this.makeButton(
        306,
        28,
        34,
        26,
        "II",
        0x3d4f5a,
        () => this.togglePause(),
        {
          font: "bold 13px 'Source Sans 3', Arial",
          tooltip: () => this.paused ? "Resume Battle (P)" : "Pause Battle (P)",
        }
      );
      this.callButton = this.makeButton(
        366,
        28,
        76,
        32,
        "CALL",
        0x7a4f25,
        () => this.callWave(),
        {
          font: "bold 14px Cinzel, Arial, sans-serif",
          tooltip: () => this.waveActive ? "Wave marching — defend the road!" : "Call Next Wave (SPACE)\nCall early for an extra gold bonus!",
        }
      );
    }

    createShop() {
      // Layered Wood & Stone Base Shop Bar
      const shopMidY = SHOP_Y + SHOP_H / 2;
      this.add.rectangle(W / 2, shopMidY, W, SHOP_H, 0x1f1712, 0.98).setDepth(90);
      this.add.rectangle(W / 2, SHOP_Y + 31, W, 60, 0x2b2019, 0.5).setDepth(90.2);
      this.add.rectangle(W / 2, SHOP_Y + 62, W, 3, 0x140d08, 0.8).setDepth(90.3);
      this.add.rectangle(W / 2, SHOP_Y + 93, W, 58, 0x241b14, 0.5).setDepth(90.2);
      this.add.rectangle(W / 2, shopMidY, W - 14, SHOP_H - 10, 0x2d2116, 0.85).setDepth(90.5);
      this.add.rectangle(W / 2, shopMidY, W - 20, SHOP_H - 16, 0x3d2f20, 0.35).setDepth(90.6);
      this.add.rectangle(W / 2, SHOP_Y, W, 4, 0x4a3726).setDepth(91);
      this.add.rectangle(W / 2, SHOP_Y + 1, W, 2, 0x8a6a42).setDepth(91.2);
      this.add.rectangle(W / 2, SHOP_Y + 2, W, 1, 0xf5c85a, 0.6).setDepth(91.5);
      const shopNailX = [10, 110, 210, 310, 410];
      shopNailX.forEach((nx) => {
        this.add.circle(nx, SHOP_Y + 7, 2.5, 0xf5c85a, 0.9).setStrokeStyle(1, 0x3a250c).setDepth(92);
        this.add.circle(nx, SHOP_Y + 62, 2, 0xd4af37, 0.85).setStrokeStyle(1, 0x3a250c).setDepth(92);
        this.add.circle(nx, SHOP_Y + SHOP_H - 7, 2.5, 0xf5c85a, 0.9).setStrokeStyle(1, 0x3a250c).setDepth(92);
      });
      this.shopButtons = [];
      const types = Object.values(TOWERS);
      for (let i = 0; i < types.length; i += 1) {
        const t = types[i];
        const x = 48 + i * 81;
        const b = this.makeButton(
          x,
          SHOP_Y + 33,
          74,
          54,
          `${t.cost}g`,
          t.color,
          () => this.chooseBuild(t.id),
          {
            icon: `portrait_${t.id}`,
            iconScale: 0.64,
            iconOffsetY: -9,
            textOffsetY: 16,
            font: "bold 12px 'Source Sans 3', Arial",
            textColor: "#ffd866",
            tooltip: () => `${t.name} (${t.cost}g)\n${t.role}\nDmg: ${t.damage[0]} · Rng: ${t.range[0]} · Spd: ${t.rate[0]}s\n${t.desc}`,
          }
        );
        b.type = t.id;
        this.shopButtons.push(b);
      }
      this.upgradeButton = this.makeButton(
        370,
        SHOP_Y + 33,
        84,
        54,
        "UP\n-",
        0x55743c,
        () => this.upgradeSelected(),
        {
          font: "bold 13px 'Source Sans 3', Arial",
          tooltip: () => this.getUpgradeTooltip(),
        }
      );
      this.specButtons = [];
      for (let si = 0; si < 2; si += 1) {
        const idx = si;
        const specBtn = this.makeButton(
          328 + si * 58,
          SHOP_Y + 33,
          54,
          54,
          "SPEC",
          0x3d5535,
          () => {
            const tower = this.selectedPad?.tower;
            const opts = this.specOptions(tower?.type);
            if (tower && opts?.[idx]) this.confirmTowerSpec(tower, opts[idx].id);
          },
          {
            font: "bold 9px Cinzel",
            tooltip: () => {
              const tower = this.selectedPad?.tower;
              const opts = this.specOptions(tower?.type);
              const spec = opts?.[idx];
              if (!spec) return "Specialization";
              return `${spec.name} (260g)\nSpecialize this tower.`;
            },
          }
        );
        specBtn.setVisible(false);
        this.specButtons.push(specBtn);
      }
      this.sellButton = this.makeButton(
        370,
        SHOP_Y + 89,
        84,
        40,
        "SELL",
        0x643a31,
        () => this.sellSelected(),
        {
          font: "bold 12px 'Source Sans 3', Arial",
          minHitH: 44,
          tooltip: () => this.getSellTooltip(),
        }
      );
      this.spellButtons = [];
      const spellDefs = [
        ["meteor", 56, "Meteor", "icon_spell_meteor", "Meteor (24s cooldown)\nMassive AoE explosion (270 dmg).\nStrikes highest HP enemy swarm."],
        ["frost", 153, "Frost", "icon_spell_frost", "Frost (22s cooldown)\nFreezes & slows all active enemies\nfor 4.2 seconds."],
        ["rally", 250, "Rally", "icon_spell_rally", "Rally (28s cooldown)\nInspires all Guards & soldiers with\nboosted attack & temporary armor."],
      ];
      for (const [id, x, label, iconKey, tip] of spellDefs) {
        const btn = this.makeButton(
          x,
          SHOP_Y + 89,
          86,
          40,
          label,
          0x334f6b,
          () => this.castSpell(id),
          {
            icon: iconKey,
            iconScale: 0.38,
            iconOffsetX: -22,
            textOffsetX: 12,
            font: "bold 12px 'Source Sans 3', Arial",
            minHitH: 44,
            tooltip: () => {
              const s = this.spells[id];
              return s.ready > 0 ? `${tip}\nCooldown: ${Math.ceil(s.ready)}s` : `${tip}\n[READY TO CAST]`;
            },
          }
        );
        btn.spell = id;
        btn.cooldownBar = this.add.rectangle(x - 39, SHOP_Y + 104, 1, 4, 0xaee9ff, 0.95).setOrigin(0, 0.5).setDepth(102).setVisible(false);
        this.spellButtons.push(btn);
      }
      this.heroButtons = [];
      const heroDefs = [
        ["charge", 63, this.heroKind === "sentinel" ? "Hold" : "Charge", "icon_ability_charge", "Hero Charge (16s cooldown)\nCaptain dashes to target area with\na high-damage piercing strike."],
        ["banner", 166, "Banner", "icon_ability_banner", "Hero Banner (24s cooldown)\nPlants an inspiring battle standard\nto buff nearby soldiers."],
        ["heal", 269, "Heal", "icon_ability_heal", "Hero Heal (28s cooldown)\nRestores health to Captain\nand all nearby allied guards."],
      ];
      for (const [id, x, label, iconKey, tip] of heroDefs) {
        const btn = this.makeButton(
          x,
          SHOP_Y + 33,
          92,
          54,
          label,
          0x4f6f9f,
          () => this.castHeroAbility(id),
          {
            icon: iconKey,
            iconScale: 0.48,
            iconOffsetY: -9,
            textOffsetY: 16,
            font: "bold 12px 'Source Sans 3', Arial",
            tooltip: () => {
              const a = this.heroAbilities[id];
              return a.ready > 0 ? `${tip}\nCooldown: ${Math.ceil(a.ready)}s` : `${tip}\n[READY TO USE]`;
            },
          }
        );
        btn.ability = id;
        btn.cooldownBar = this.add.rectangle(x - 42, SHOP_Y + 55, 1, 4, 0xf5d76e, 0.95).setOrigin(0, 0.5).setDepth(102);
        this.heroButtons.push(btn);
      }
      // Captain portrait plate (hero_captain image in wood/gold frame)
      const plateX = 368;
      const plateY = SHOP_Y + 33;
      const plateW = 84;
      const plateH = 54;
      const plateShadow = this.add.rectangle(plateX + 2, plateY + 2, plateW, plateH, 0x050704, 0.55).setDepth(99);
      const plateBg = this.add.rectangle(plateX, plateY, plateW, plateH, 0x3d2716, 0.98).setStrokeStyle(2, 0xd4af37, 0.9).setDepth(100);
      const plateInner = this.add.rectangle(plateX, plateY, plateW - 10, plateH - 10, 0x1f1712, 0.95).setStrokeStyle(1, 0x8a6a42, 0.6).setDepth(100.2);
      const plateMat = this.add.rectangle(plateX, plateY, plateW - 16, plateH - 16, 0x243242, 0.85).setDepth(100.4);
      const plateImg = this.add.image(plateX, plateY - 1, "hero_captain").setScale(1.0).setDepth(100.6);
      const plateShine = this.add.rectangle(plateX, plateY - plateH / 2 + 3, plateW - 10, 2, 0xfff8d0, 0.35).setDepth(100.8);
      const plateLabel = this.add.text(plateX, plateY + 18, this.heroKind === "sentinel" ? "SENTINEL" : "CAPTAIN", {
        font: "900 8px 'Cinzel', 'Source Sans 3', Arial",
        color: "#f5c85a",
      }).setOrigin(0.5).setDepth(101);
      this.heroPortraitLabel = plateLabel;

      const plateElements = [plateShadow, plateBg, plateInner, plateMat, plateImg, plateShine, plateLabel];
      plateElements.forEach((el) => el.setVisible(false));
      plateElements.setVisible = (val) => {
        for (const el of plateElements) el.setVisible(val);
      };
      this.heroPortraitPlate = plateElements;
      this.infoBg = this.add.rectangle(W / 2, SHOP_Y - 10, W, 18, 0x120e0a, 0.78).setDepth(88);
      this.infoText = this.add
        .text(W / 2, SHOP_Y - 10, "Tap a tower, then a glowing pad.", {
          font: "11px 'Source Sans 3', Arial",
          color: "#f0e6c8",
          wordWrap: { width: 400 },
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(89);
      this.setHeroPanel(false);
    }

    makeButton(x, y, w, h, label, color, cb, options = {}) {
      const shadow = this.add.rectangle(x, y + 4, w, h, 0x050704, 0.55).setStrokeStyle(1, 0x000000, 0.5).setDepth(99);
      const bg = this.add.rectangle(x, y, w, h, color, 0.98).setStrokeStyle(2, 0xf2df92, 0.45).setDepth(100);
      const shine = this.add.rectangle(x, y - h * 0.28, w - 8, Math.max(4, h * 0.24), 0xffffff, 0.16).setDepth(100.5);
      const lip = this.add.rectangle(x, y + h * 0.35, w - 8, Math.max(3, h * 0.16), 0x000000, 0.18).setDepth(100.5);

      let icon = null;
      let iconShadow = null;
      const hasIcon = !!options.icon && this.textures.exists(options.icon);
      const iconOffsetX = options.iconOffsetX ?? 0;
      const iconOffsetY = options.iconOffsetY ?? (label ? -8 : 0);
      const iconScale = options.iconScale || 0.7;

      if (hasIcon) {
        iconShadow = this.add.image(x + iconOffsetX + 1, y + iconOffsetY + 2, options.icon)
          .setScale(iconScale * 0.96)
          .setTint(0x000000)
          .setAlpha(0.4)
          .setDepth(100.8);
        icon = this.add.image(x + iconOffsetX, y + iconOffsetY, options.icon)
          .setScale(iconScale)
          .setDepth(101);
      }

      const textOffsetX = options.textOffsetX ?? 0;
      const textOffsetY = options.textOffsetY ?? (hasIcon && label ? h * 0.22 : -1);
      const text = this.add
        .text(x + textOffsetX, y + textOffsetY, label, {
          font: options.font || "bold 13px 'Source Sans 3', Arial",
          color: options.textColor || "#fff4d8",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(101.2);

      let roleMarkShadow = null;
      let roleMarkG = null;
      let roleMarkText = null;
      let roleMarkX = 0;
      let roleMarkY = 0;
      let roleMarkTextOffsetY = 0;

      if (options.roleMark) {
        const rm = options.roleMark;
        roleMarkX = x - w / 2 + 13;
        roleMarkY = y - h / 2 + 11;

        const roleColors = {
          archer: { fill: 0x152613, stroke: 0x8ae67c },
          mage: { fill: 0x181636, stroke: 0x9b94ff },
          artillery: { fill: 0x301e13, stroke: 0xf0aa54 },
          barracks: { fill: 0x2e2815, stroke: 0xe6d47c },
        };
        const palette = roleColors[rm.type] || { fill: 0x222222, stroke: 0xf5c85a };

        roleMarkShadow = this.add.graphics().setDepth(100.9);
        roleMarkShadow.setPosition(roleMarkX + 1, roleMarkY + 1.5);
        roleMarkShadow.fillStyle(0x000000, 0.6);

        roleMarkG = this.add.graphics().setDepth(101.1);
        roleMarkG.setPosition(roleMarkX, roleMarkY);
        roleMarkG.fillStyle(palette.fill, 0.95);
        roleMarkG.lineStyle(1.5, palette.stroke, 0.95);

        const drawShape = (g) => {
          g.beginPath();
          if (rm.shape === "triangle") {
            g.moveTo(0, -10);
            g.lineTo(12, 8);
            g.lineTo(-12, 8);
            roleMarkTextOffsetY = 1;
          } else if (rm.shape === "diamond") {
            g.moveTo(0, -10);
            g.lineTo(12, 0);
            g.lineTo(0, 10);
            g.lineTo(-12, 0);
            roleMarkTextOffsetY = 0;
          } else if (rm.shape === "circle") {
            g.arc(0, 0, 10.5, 0, Math.PI * 2);
            roleMarkTextOffsetY = 0;
          } else if (rm.shape === "shield") {
            g.moveTo(-11, -9);
            g.lineTo(11, -9);
            g.lineTo(11, 1);
            g.lineTo(0, 10);
            g.lineTo(-11, 1);
            roleMarkTextOffsetY = -1;
          }
          g.closePath();
          g.fillPath();
          g.strokePath();
        };

        drawShape(roleMarkShadow);
        drawShape(roleMarkG);

        const fontSz = rm.label.length >= 4 ? "bold 8.5px 'Source Sans 3', Arial" : "bold 9.5px 'Source Sans 3', Arial";
        roleMarkText = this.add
          .text(roleMarkX, roleMarkY + roleMarkTextOffsetY, "", {
            font: fontSz,
            color: "#ffffff",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(101.3);
      }

      const minHitH = options.minHitH ?? 44;
      const hitW = options.hitW ?? w;
      const hitH = options.hitH ?? Math.max(h, minHitH);
      if (hitW !== w || hitH !== h) {
        bg.setInteractive({
          hitArea: new Phaser.Geom.Rectangle((w - hitW) / 2, (h - hitH) / 2, hitW, hitH),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: true,
        });
      } else {
        bg.setInteractive({ useHandCursor: true });
      }

      const applyPressed = (down) => {
        const dy = down ? 2 : 0;
        bg.y = y + dy;
        shine.y = y - h * 0.28 + dy;
        lip.y = y + h * 0.35 + dy;
        text.y = y + textOffsetY + dy;
        if (icon) icon.y = y + iconOffsetY + dy;
        if (iconShadow) iconShadow.y = y + iconOffsetY + 2 + dy;
        if (roleMarkG) roleMarkG.y = roleMarkY + dy;
        if (roleMarkShadow) roleMarkShadow.y = roleMarkY + 1.5 + dy;
        if (roleMarkText) roleMarkText.y = roleMarkY + roleMarkTextOffsetY + dy;
      };

      bg.on("pointerdown", () => {
        this.audio.playLayered?.("uiClick");
        this.audio.resume();
        applyPressed(true);
        cb();
      });
      bg.on("pointerup", () => applyPressed(false));
      bg.on("pointerover", () => {
        bg.setStrokeStyle(3, 0xfff2ba, 0.9);
        if (!this.settings?.reducedMotion) {
          bg.setScale(1.03);
          shine.setScale(1.03);
          lip.setScale(1.03);
          text.setScale(1.03);
          if (icon) icon.setScale(iconScale * 1.05);
          if (roleMarkG) roleMarkG.setScale(1.03);
          if (roleMarkShadow) roleMarkShadow.setScale(1.03);
          if (roleMarkText) roleMarkText.setScale(1.03);
        }
        const tip = typeof options.tooltip === "function" ? options.tooltip() : options.tooltip;
        if (tip) {
          this.showTooltip(x, y - h / 2 - 10, tip);
        }
      });
      bg.on("pointerout", () => {
        applyPressed(false);
        bg.setStrokeStyle(2, 0xf2df92, 0.45);
        bg.setScale(1);
        shine.setScale(1);
        lip.setScale(1);
        text.setScale(1);
        if (icon) icon.setScale(iconScale);
        if (roleMarkG) roleMarkG.setScale(1);
        if (roleMarkShadow) roleMarkShadow.setScale(1);
        if (roleMarkText) roleMarkText.setScale(1);
        this.hideTooltip();
      });

      return {
        bg,
        text,
        shadow,
        shine,
        lip,
        icon,
        iconShadow,
        roleMarkShadow,
        roleMarkG,
        roleMarkText,
        x,
        y,
        w,
        h,
        label,
        baseLabel: label,
        color,
        setIcon: (key) => {
          if (this.textures.exists(key)) {
            if (icon) {
              icon.setTexture(key);
              icon.setVisible(true);
            }
            if (iconShadow) {
              iconShadow.setTexture(key);
              iconShadow.setVisible(true);
            }
          }
        },
        setLabel: (value) => text.setText(value),
        setAlpha: (value) => {
          for (const obj of [shadow, bg, shine, lip, text, icon, iconShadow, roleMarkShadow, roleMarkG, roleMarkText].filter(Boolean)) obj.setAlpha(value);
        },
        setVisible: (value) => {
          for (const obj of [shadow, bg, shine, lip, text, icon, iconShadow, roleMarkShadow, roleMarkG, roleMarkText].filter(Boolean)) obj.setVisible(value);
          if (value) bg.setInteractive({ useHandCursor: true });
          else bg.disableInteractive();
        },
      };
    }

    setHeroPanel(active) {
      const normalButtons = [...(this.shopButtons || []), this.upgradeButton, this.sellButton, ...(this.spellButtons || [])].filter(Boolean);
      for (const btn of normalButtons) btn.setVisible(!active);
      for (const btn of this.specButtons || []) btn.setVisible(false);
      for (const btn of this.heroButtons || []) btn.setVisible(active);
      for (const btn of this.spellButtons || []) btn.cooldownBar?.setVisible(!active);
      for (const btn of this.heroButtons || []) btn.cooldownBar?.setVisible(active);
      if (!active) this.updateUpgradeLabel?.();
      if (this.heroPortraitPlate) {
        if (typeof this.heroPortraitPlate.setVisible === "function") {
          this.heroPortraitPlate.setVisible(active);
        } else if (Array.isArray(this.heroPortraitPlate)) {
          for (const el of this.heroPortraitPlate) el?.setVisible?.(active);
        }
      }
    }

    showStartOverlay() {
      this.overlay = this.add.container(0, 0).setDepth(500);
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W + 8, H + 8, 0x0a1008, 1));
      // Subtle gold border glow
      const borderGlow = this.add.rectangle(W / 2, H / 2, W - 40, H - 80, 0xf5c85a, 0.04).setStrokeStyle(2, 0xf5c85a, 0.15).setDepth(499);
      this.overlay.add(borderGlow);
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive();
      this.overlay.add(blocker);

      // Title Banner Frame
      const bannerX = W / 2;
const bannerY = 98;
      const bannerW = 360;
      const bannerH = 68;

      const bannerShadow = this.add.rectangle(bannerX + 3, bannerY + 3, bannerW, bannerH, 0x000000, 0.55).setDepth(500);
      const bannerBg = this.add.rectangle(bannerX, bannerY, bannerW, bannerH, 0x162414, 0.98)
        .setStrokeStyle(2.5, 0xf5c85a, 0.9)
        .setDepth(501);
      const bannerInner = this.add.rectangle(bannerX, bannerY, bannerW - 10, bannerH - 10, 0x223520, 0.7)
        .setStrokeStyle(1, 0xd8b548, 0.5)
        .setDepth(501.5);
      const bannerShine = this.add.rectangle(bannerX, bannerY - bannerH / 2 + 3, bannerW - 12, 2, 0xfff8d0, 0.35).setDepth(501.8);

      const corners = [
        [bannerX - bannerW / 2 + 8, bannerY - bannerH / 2 + 8],
        [bannerX + bannerW / 2 - 8, bannerY - bannerH / 2 + 8],
        [bannerX - bannerW / 2 + 8, bannerY + bannerH / 2 - 8],
        [bannerX + bannerW / 2 - 8, bannerY + bannerH / 2 - 8],
      ];
      const cornerDots = corners.map(([cx, cy]) => {
        return this.add.circle(cx, cy, 3, 0xffd866, 0.9).setStrokeStyle(1, 0x4a3410).setDepth(502);
      });

      const titleShadow = this.add.text(bannerX + 2, bannerY - 4, "KRC CAMPAIGN", {
        font: "bold 30px Cinzel",
        color: "#180f06",
      }).setOrigin(0.5).setDepth(502);

      const title = this.add.text(bannerX, bannerY - 6, "KRC CAMPAIGN", {
        font: "bold 30px Cinzel",
        color: "#ffd866",
        stroke: "#2a1808",
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(503);

      const versionMark = this.add.text(bannerX, bannerY + 20, `v${KRC_VERSION}`, {
        font: "bold 12px 'Source Sans 3', Arial",
        color: "#d8b548",
      }).setOrigin(0.5).setDepth(503);

      this.overlay.add([bannerShadow, bannerBg, bannerInner, bannerShine, ...cornerDots, titleShadow, title, versionMark]);

      let heroPickCaptain, heroPickSentinel;
      const updateHeroPicks = () => {
        const isCap = this.heroKind === "captain";
        if (heroPickCaptain) {
          heroPickCaptain.bg.setStrokeStyle(isCap ? 3 : 1.5, isCap ? 0xffd866 : 0x5a6a5a, isCap ? 1 : 0.6);
          heroPickCaptain.text.setColor(isCap ? "#ffd866" : "#aaaaaa");
        }
        if (heroPickSentinel) {
          heroPickSentinel.bg.setStrokeStyle(!isCap ? 3 : 1.5, !isCap ? 0xffd866 : 0x5a6a5a, !isCap ? 1 : 0.6);
          heroPickSentinel.text.setColor(!isCap ? "#ffd866" : "#aaaaaa");
        }
      };
      heroPickCaptain = this.makeButton(W / 2 - 80, 618, 120, 32, "CAPTAIN", 0x243548, () => {
        this.heroKind = "captain";
        window.KRCHeroSelect?.persistHeroPick?.("captain");
        updateHeroPicks();
        this.applyHeroKind();
      }, {
        font: "bold 11px Cinzel",
        tooltip: () => "Hero: Captain\nDamage & dash-charge hunter.",
      });
      heroPickSentinel = this.makeButton(W / 2 + 80, 618, 120, 32, "SENTINEL", 0x334440, () => {
        this.heroKind = "sentinel";
        window.KRCHeroSelect?.persistHeroPick?.("sentinel");
        updateHeroPicks();
        this.applyHeroKind();
      }, {
        font: "bold 11px Cinzel",
        tooltip: () => "Hero: Sentinel\nHigh HP hold & ground pull tank.",
      });
      heroPickCaptain.bg.on("pointerout", () => updateHeroPicks());
      heroPickSentinel.bg.on("pointerout", () => updateHeroPicks());
      updateHeroPicks();
      this.overlay.add([
        heroPickCaptain.shadow, heroPickCaptain.bg, heroPickCaptain.shine, heroPickCaptain.lip, heroPickCaptain.text,
        heroPickSentinel.shadow, heroPickSentinel.bg, heroPickSentinel.shine, heroPickSentinel.lip, heroPickSentinel.text,
      ].filter(Boolean));

      // Subtle floating golden sparkle particles around title
      if (!this.settings?.reducedMotion) {
        for (let i = 0; i < 14; i += 1) {
          const sx = bannerX - bannerW / 2 + 20 + Math.random() * (bannerW - 40);
          const sy = bannerY - bannerH / 2 + 6 + Math.random() * (bannerH - 12);
          const sparkle = this.add.circle(sx, sy, 1 + Math.random() * 1.8, 0xffeb7a, 0.3 + Math.random() * 0.5).setDepth(504);
          this.overlay.add(sparkle);
          this.tweens.add({
            targets: sparkle,
            y: sy + (Math.random() * 8 - 4),
            alpha: 0.1 + Math.random() * 0.7,
            scale: 0.6 + Math.random() * 0.8,
            duration: 1200 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }

      this.overlay.add(
        this.add
          .text(W / 2, 146, "Select a province to defend. Earn up to 3 stars per victory.", {
            font: "14px 'Source Sans 3', Arial",
            color: "#cfc4a2",
            align: "center",
            wordWrap: { width: 340 },
          })
          .setOrigin(0.5)
          .setDepth(502)
      );

      // --- Painted Campaign Kingdom Board ---
      const boardX = W / 2;
      const boardY = 295;
      const boardW = 360;
      const boardH = 300;

      // Wood/gold frame around the board
      const frameW = boardW + 16;
      const frameH = boardH + 16;
      const frameShadow = this.add.rectangle(boardX + 3, boardY + 4, frameW, frameH, 0x000000, 0.55).setDepth(500.5);
      const frameWoodOuter = this.add.rectangle(boardX, boardY, frameW, frameH, 0x24150a, 0.98)
        .setStrokeStyle(2, 0x130a04)
        .setDepth(500.7);
      const frameWoodMid = this.add.rectangle(boardX, boardY, boardW + 10, boardH + 10, 0x482b15, 0.95)
        .setStrokeStyle(1.5, 0x693e1d)
        .setDepth(500.8);
      const frameGoldOuter = this.add.rectangle(boardX, boardY, boardW + 12, boardH + 12, 0x000000, 0)
        .setStrokeStyle(2, 0xd8b548, 0.85)
        .setDepth(501.0);

      this.overlay.add([frameShadow, frameWoodOuter, frameWoodMid, frameGoldOuter]);

      if (this.textures.exists("campaign_board_bg")) {
        const boardBg = this.add.image(boardX, boardY, "campaign_board_bg").setDepth(501.2);
        this.overlay.add(boardBg);
      } else {
        const boardBg = this.add.rectangle(boardX, boardY, boardW, boardH, 0x1e281c, 0.98)
          .setStrokeStyle(2, 0xd4bc68)
          .setDepth(501.2);
        this.overlay.add(boardBg);
      }

      // Inner gold rim/bevel around the board
      const frameGoldInner = this.add.rectangle(boardX, boardY, boardW, boardH, 0x000000, 0)
        .setStrokeStyle(2, 0xf5c85a, 0.75)
        .setDepth(501.5);
      this.overlay.add(frameGoldInner);

      // Gold stud/corner rivets at 4 corners of the wooden frame
      const frameCorners = [
        [boardX - boardW / 2 - 4, boardY - boardH / 2 - 4],
        [boardX + boardW / 2 + 4, boardY - boardH / 2 - 4],
        [boardX - boardW / 2 - 4, boardY + boardH / 2 + 4],
        [boardX + boardW / 2 + 4, boardY + boardH / 2 + 4],
      ];
      const frameStuds = frameCorners.map(([fx, fy]) =>
        this.add.circle(fx, fy, 3.5, 0xffd866, 0.95).setStrokeStyle(1.5, 0x3e2608).setDepth(501.8)
      );
      this.overlay.add(frameStuds);

      const mapDescriptions = [
        "Forest Gate\nLush woodland path. Balanced lanes.\nDefend against agile scouts & brutes!",
        "Stone Pass\nNarrow rocky canyon pass.\nArmor-heavy forces and flyers ahead!",
        "Ember Marsh\nVolcanic swamp with lava fissures.\nBeware of exploding embers and bosses!",
        "Gale Reach\nWindy cliff cut. Cross-gusts hide flyers.\nHold the switchbacks!",
        "Ash Spire\nCinder peak with falling grit.\nArmor and embers climb the switch!",
      ];

      // Short name plaque titles under each node (Forest / Stone / Ember / Gale / Ash)
      const shortNames = ["Forest", "Stone", "Ember", "Gale", "Ash"];

      // Node Positions on the painted map board (HARD RULE: Forest Gate stays at { x: 100, y: 375 })
      const nodePositions = [
        { x: 100, y: 375 }, // Node 0: Forest Gate HARD RULE
        { x: 205, y: 305 }, // Node 1: Stone Pass
        { x: 308, y: 248 }, // Node 2: Ember Marsh
        { x: 338, y: 175 }, // Node 3: Gale Reach
        { x: 148, y: 248 }, // Node 4: Ash Spire, below banner, left of stone
      ];

      // Draw connecting path segments between nodes
      const drawPathSegment = (from, to, isUnlocked) => {
        const steps = 10;
        const color = isUnlocked ? 0xf5c85a : 0x556054;
        const alpha = isUnlocked ? 0.95 : 0.6;
        for (let i = 1; i < steps; i += 1) {
          const t = i / steps;
          const px = Phaser.Math.Linear(from.x, to.x, t);
          const py = Phaser.Math.Linear(from.y, to.y, t);

          // Shadow under path dot
          const shadowDot = this.add.circle(px + 1, py + 1, isUnlocked ? 3.5 : 2.8, 0x000000, 0.45).setDepth(501.9);
          // Base path dot
          const dot = this.add.circle(px, py, isUnlocked ? 3.2 : 2.5, color, alpha).setDepth(502);
          if (isUnlocked) dot.setStrokeStyle(1, 0x3d2706, 0.85);
          // Inner highlight dot
          const coreDot = this.add.circle(px, py - 0.5, isUnlocked ? 1.5 : 1.0, isUnlocked ? 0xfffae0 : 0x8a9888, isUnlocked ? 0.9 : 0.5).setDepth(502.1);

          this.overlay.add([shadowDot, dot, coreDot]);

          if (isUnlocked && !this.settings?.reducedMotion) {
            this.tweens.add({
              targets: [dot, coreDot],
              scaleX: 1.25,
              scaleY: 1.25,
              alpha: 1,
              duration: 800 + i * 90,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }
      };

      // Path 0 -> 1 (unlocked if node 1 is unlocked)
      drawPathSegment(nodePositions[0], nodePositions[1], !!this.campaign.unlocked[1]);
      // Path 1 -> 2 (unlocked if node 2 is unlocked)
      drawPathSegment(nodePositions[1], nodePositions[2], !!this.campaign.unlocked[2]);
      // Path 2 -> 3 (unlocked if node 3 is unlocked)
      drawPathSegment(nodePositions[2], nodePositions[3], !!this.campaign.unlocked[3]);
      // Path 3 -> 4 (unlocked if node 4 is unlocked)
      drawPathSegment(nodePositions[3], nodePositions[4], !!this.campaign.unlocked[4]);

      // Render Map Nodes
      MAPS.forEach((map, index) => {
        const unlocked = !!this.campaign.unlocked[index];
        const result = this.campaign.results[String(index)] || { stars: 0, bestGold: 0 };
        const pos = nodePositions[index];
        const nx = pos.x;
        const ny = pos.y;

        // Node Shadow & Base Emblem Circle
        const nodeShadow = this.add.circle(nx + 2, ny + 3, 27, 0x000000, 0.45).setDepth(502);
        const nodeBg = this.add.circle(nx, ny, 26, unlocked ? 0x2a3e26 : 0x1c221b)
          .setStrokeStyle(unlocked ? 3 : 2, unlocked ? 0xf5c85a : 0x4a554a, unlocked ? 1 : 0.7)
          .setDepth(503);

        const iconKey = `map_preview_${index}`;
        let iconImg = null;
        if (this.textures.exists(iconKey)) {
          iconImg = this.add.image(nx, ny, iconKey).setDisplaySize(42, 42).setDepth(504);
          if (!unlocked) iconImg.setTint(0x444444);
        }

        // Lock indicator if node is locked
        let lockBg = null;
        let lockText = null;
        if (!unlocked) {
          lockBg = this.add.circle(nx, ny, 15, 0x101410, 0.9).setDepth(505);
          lockText = this.add.graphics().setDepth(506);
          lockText.fillStyle(0xd8c48a, 1);
          lockText.fillRoundedRect(nx - 7, ny - 2, 14, 11, 2);
          lockText.lineStyle(2.2, 0xd8c48a, 1);
          lockText.strokeCircle(nx, ny - 5, 5);
          lockText.lineStyle(2, 0x2a2010, 1);
          lockText.strokeRoundedRect(nx - 7, ny - 2, 14, 11, 2);
        }

        // Star Rating Display
        const starStr = "★".repeat(result.stars || 0) + "☆".repeat(Math.max(0, 3 - (result.stars || 0)));
        const starsText = this.add
          .text(nx, ny - 36, starStr, {
            font: "bold 14px 'Source Sans 3', Arial",
            color: result.stars > 0 ? "#f5c85a" : "#687266",
            stroke: "#1a1008",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setDepth(505);

        // Short Map Name Plaque Label (Forest / Stone / Ember)
        const labelW = 76;
        const labelH = 20;
        const labelShadow = this.add.rectangle(nx + 1, ny + 37, labelW, labelH, 0x000000, 0.55).setDepth(503);
        const labelBg = this.add.rectangle(nx, ny + 36, labelW, labelH, unlocked ? 0x1d2b1a : 0x141814, 0.95)
          .setStrokeStyle(1.5, unlocked ? 0xd8b548 : 0x3e483e)
          .setDepth(504);
        const labelShine = this.add.rectangle(nx, ny + 27, labelW - 6, 1, 0xfff8d0, unlocked ? 0.35 : 0.1).setDepth(504.5);
        const labelText = this.add
          .text(nx, ny + 36, shortNames[index], {
            font: "bold 11px Cinzel",
            color: unlocked ? "#fff2ba" : "#7a8478",
          })
          .setOrigin(0.5)
          .setDepth(505);

        this.overlay.add(
          [nodeShadow, nodeBg, iconImg, lockBg, lockText, starsText, labelShadow, labelBg, labelShine, labelText].filter(Boolean)
        );

        // Node Interactivity
        const interactiveTargets = [nodeBg, labelBg, labelText, iconImg].filter(Boolean);
        const nodeGroup = [nodeBg, iconImg, labelBg, labelShine, labelText, starsText].filter(Boolean);

        if (unlocked) {
          interactiveTargets.forEach((target) => target.setInteractive({ useHandCursor: true }));

          const biomeHoverColors = [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878];
          const hoverColor = biomeHoverColors[index] ?? 0xfff0a0;

          const onOver = () => {
            nodeBg.setStrokeStyle(3.5, hoverColor, 1);
            labelBg.setStrokeStyle(2, hoverColor, 1);
            if (!this.settings?.reducedMotion) {
              this.tweens.add({ targets: nodeGroup, scaleX: 1.07, scaleY: 1.07, duration: 120, ease: "Quad.easeOut" });
            }
            this.showTooltip(nx, ny - 50, mapDescriptions[index]);
            this.setCampaignIntel(index, false);
          };

          const onOut = () => {
            nodeBg.setStrokeStyle(3, 0xf5c85a, 1);
            labelBg.setStrokeStyle(1.5, 0xd8b548, 1);
            if (!this.settings?.reducedMotion) {
              this.tweens.add({ targets: nodeGroup, scaleX: 1, scaleY: 1, duration: 120, ease: "Quad.easeOut" });
            }
            this.hideTooltip();
          };

          const onDown = () => {
            this.hideTooltip();
            this.audio.playLayered?.("uiClick");
            this.beginMap(index);
          };

          interactiveTargets.forEach((target) => {
            target.on("pointerover", onOver);
            target.on("pointerout", onOut);
            target.on("pointerdown", onDown);
          });
        } else {
          nodeBg.setInteractive({ useHandCursor: true });
          const biomeColor = [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878][index];
          nodeBg.on("pointerover", () => {
            nodeBg.setStrokeStyle(2.5, biomeColor, 0.85);
            this.showTooltip(nx, ny - 50, `${map.name}\nLOCKED — Clear previous map to unlock!`);
            this.setCampaignIntel(index, true);
          });
          nodeBg.on("pointerout", () => {
            nodeBg.setStrokeStyle(2, 0x4a554a, 0.7);
            this.hideTooltip();
          });
        }
      });

      const intelBg = this.add.rectangle(W / 2, 532, 348, 70, 0x1a140c, 0.94)
        .setStrokeStyle(2, 0xf5c85a, 0.88)
        .setDepth(502);
      this.campaignIntelBg = intelBg;
      const intelInner = this.add.rectangle(W / 2, 532, 338, 60, 0x24180e, 0.5)
        .setStrokeStyle(1, 0xd8b548, 0.4)
        .setDepth(502.2);
      this.campaignIntelTitle = this.add.text(W / 2, 512, "FOREST GATE · OPEN", {
        font: "bold 13px Cinzel",
        color: "#ffd866",
      }).setOrigin(0.5).setDepth(503);
      this.campaignIntelBody = this.add.text(W / 2, 542, "Green lane, honest bend. Scouts then brutes.\n3★ if the gate holds. Early CALL pays gold.", {
        font: "12px 'Source Sans 3', Arial",
        color: "#efe4c4",
        align: "center",
        wordWrap: { width: 320 },
      }).setOrigin(0.5).setDepth(503);
      this.overlay.add([intelBg, intelInner, this.campaignIntelTitle, this.campaignIntelBody]);

      let ironBtn;
      const updateIronBtn = () => {
        if (!ironBtn) return;
        const on = !!this.ironMode;
        ironBtn.bg.setStrokeStyle(on ? 2.5 : 1.5, on ? 0xf5c85a : 0x5a6a5a, on ? 1 : 0.6);
        ironBtn.text.setColor(on ? "#ffd866" : "#8a9688");
        ironBtn.setLabel(on ? "IRON WATCH: ON" : "IRON WATCH: OFF");
      };
      ironBtn = this.makeButton(
        W / 2 - 80,
        660,
        150,
        30,
        this.ironMode ? "IRON WATCH: ON" : "IRON WATCH: OFF",
        0x1c241a,
        () => {
          this.ironMode = !this.ironMode;
          updateIronBtn();
        },
        {
          font: "bold 11px Cinzel",
          tooltip: () => "Iron Watch Challenge\n1 life, no selling, no early-call bonus.",
        }
      );
      ironBtn.bg.on("pointerout", () => updateIronBtn());
      updateIronBtn();
      this.overlay.add([ironBtn.shadow, ironBtn.bg, ironBtn.shine, ironBtn.lip, ironBtn.text].filter(Boolean));

      const motionBtn = this.makeButton(
        W / 2 + 80,
        660,
        150,
        30,
        this.settings.reducedMotion ? "MOTION: REDUCED" : "MOTION: FULL",
        0x334657,
        () => {
          const reduced = this.toggleReducedMotion();
          motionBtn.setLabel(reduced ? "MOTION: REDUCED" : "MOTION: FULL");
          motionBtn.setIcon(reduced ? "icon_motion_reduced" : "icon_motion_full");
        },
        {
          icon: this.settings.reducedMotion ? "icon_motion_reduced" : "icon_motion_full",
          iconScale: 0.44,
          iconOffsetX: -52,
          textOffsetX: 12,
          font: "bold 13px 'Source Sans 3', Arial",
          tooltip: () => "Toggle Motion (R)\nSwitch between full and reduced motion effects.",
        }
      );
      this.overlay.add([motionBtn.shadow, motionBtn.bg, motionBtn.shine, motionBtn.lip, motionBtn.text, motionBtn.icon, motionBtn.iconShadow].filter(Boolean));

      this.overlay.add(
        this.add
          .text(W / 2, 698, "Hover a province. Stars, threat, and gold wait on the field.", {
            font: "12px 'Source Sans 3', Arial",
            color: "#a9b59d",
            align: "center",
            wordWrap: { width: 330 },
          })
          .setOrigin(0.5)
          .setDepth(502)
      );

      if (this.starBonusLives() > 0) {
        const aegisBg = this.add
          .rectangle(W / 2 - 80, 168, 160, 20, 0x24150a, 0.95)
          .setStrokeStyle(1.5, 0xd8b548, 0.9)
          .setDepth(503);
        const aegisText = this.add
          .text(W / 2 - 80, 168, "3★ AEGIS +1 LIFE", {
            font: "bold 11px Cinzel",
            color: "#f5c85a",
          })
          .setOrigin(0.5)
          .setDepth(504);
        this.overlay.add([aegisBg, aegisText]);
      }

      if (this.spellRank() > 1) {
        const spellPlaqueBg = this.add
          .rectangle(W / 2 + 80, 168, 90, 20, 0x24150a, 0.95)
          .setStrokeStyle(1.5, 0xd8b548, 0.9)
          .setDepth(503);
        const spellPlaqueText = this.add
          .text(W / 2 + 80, 168, `SPELLS ${["", "I", "II", "III"][this.spellRank()]}`, {
            font: "bold 11px Cinzel",
            color: "#f5c85a",
          })
          .setOrigin(0.5)
          .setDepth(504);
        this.overlay.add([spellPlaqueBg, spellPlaqueText]);
      }

      const resetTalents = this.makeButton(
        W / 2,
        610,
        168,
        28,
        "RESET TALENTS",
        0x5a3a32,
        () => this.confirmTalentReset(),
        { font: "bold 11px Cinzel", tooltip: () => "Refund all talent ranks.\\nTap twice to confirm." }
      );
      this.overlay.add([resetTalents.shadow, resetTalents.bg, resetTalents.shine, resetTalents.lip, resetTalents.text].filter(Boolean));
    }

    mapBriefing(index) {
      return (
        [
          "The lane is green and honest. Hold the bend before the gate.",
          "Stone walls funnel armor. Cover the sky.",
          "Fissures spit fire. Do not bunch on the mud.",
          "Cross-gusts hide flyers. Watch the switchbacks.",
          "Cinder grit blinds the high pads. Keep a hold on the climb.",
        ][index] || "Hold the road. Call when you are ready."
      );
    }

    showMapBriefing(mapIndex) {
      this.overlayActive = true;
      if (this.briefing) this.briefing.destroy();
      this.briefing = this.add.container(0, 0).setDepth(560);
      const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setInteractive();
      const plaqueShadow = this.add.rectangle(W / 2 + 2, 303, 344, 174, 0x050704, 0.55);
      const plaqueWood = this.add.rectangle(W / 2, 300, 340, 170, 0x24180e, 0.98).setStrokeStyle(3, 0x5a3e26, 0.95);
      const plaqueGold = this.add.rectangle(W / 2, 300, 328, 158).setStrokeStyle(2, 0xf5c85a, 0.85);
      const plaqueInner = this.add.rectangle(W / 2, 300, 320, 150, 0x162414, 0.92);
      const title = this.add
        .text(W / 2, 242, this.map.name, {
          font: "bold 20px Cinzel",
          color: "#ffd866",
          stroke: "#2a1808",
          strokeThickness: 4,
        })
        .setOrigin(0.5);
      const body = this.add
        .text(W / 2, 292, this.mapBriefing(mapIndex), {
          font: "14px 'Source Sans 3', Arial",
          color: "#fff4d8",
          align: "center",
          wordWrap: { width: 280 },
        })
        .setOrigin(0.5);
      const marchBtn = this.makeButton(W / 2, 360, 140, 32, "MARCH", 0x2d5535, () => this.dismissMapBriefing(), {
        font: "bold 13px Cinzel",
      });
      this.briefing.add([
        dim,
        plaqueShadow,
        plaqueWood,
        plaqueGold,
        plaqueInner,
        title,
        body,
        marchBtn.shadow,
        marchBtn.bg,
        marchBtn.shine,
        marchBtn.lip,
        marchBtn.text,
      ].filter(Boolean));
    }

    dismissMapBriefing() {
      if (this.briefing) {
        this.briefing.destroy();
        this.briefing = null;
      }
      this.overlayActive = false;
    }

    _storySeenKey(chapterId) {
      return `krc_cs_seen_${chapterId}`;
    }

    _storyWasSeen(chapterId) {
      try {
        return !!sessionStorage.getItem(this._storySeenKey(chapterId));
      } catch {
        return false;
      }
    }

    _markStorySeen(chapterId) {
      try {
        sessionStorage.setItem(this._storySeenKey(chapterId), "1");
      } catch {
        /* ignore quota / private mode */
      }
    }

    _usedChapterIds() {
      const ids = [];
      const chapters = window.KRCStoryData?.CHAPTERS || [];
      for (const ch of chapters) {
        if (ch?.id && this._storyWasSeen(ch.id)) ids.push(ch.id);
      }
      return ids;
    }

    playCutsceneChapter(chapter, onDone) {
      const stageApi = window.KRCCutsceneStage;
      if (!chapter || !stageApi?.play || this._cutscene) {
        return false;
      }
      this.overlayActive = true;
      this._cutscene = stageApi.play(this, chapter, {
        reducedMotion: !!this.settings?.reducedMotion,
        onComplete: () => {
          this._cutscene = null;
          this.overlayActive = false;
          onDone?.();
        },
      });
      return true;
    }

    playChapterIntro(mapIndex, onDone) {
      const story = window.KRCStoryData;
      const chapter = story?.chapterForMap?.(mapIndex, this._usedChapterIds());
      if (!chapter || this._storyWasSeen(chapter.id)) {
        onDone?.();
        return false;
      }
      const started = this.playCutsceneChapter(chapter, () => {
        this._markStorySeen(chapter.id);
        onDone?.();
      });
      if (!started) onDone?.();
      return started;
    }

    playWardenIntro(onDone) {
      const chapters = window.KRCStoryData?.CHAPTERS || [];
      let chapter = null;
      for (const ch of chapters) {
        if (ch.panels?.some((p) => p.art === "warden")) {
          const wardenPanels = ch.panels.filter((p) => p.art === "warden");
          chapter = {
            id: "warden-intro",
            title: ch.title,
            narrator: ch.narrator,
            panels: wardenPanels,
          };
          break;
        }
      }
      if (!chapter) {
        chapter = {
          id: "warden-intro",
          title: "The Cinder Warden",
          narrator: "Captain Alder of the Thornwatch",
          panels: [
            {
              art: "warden",
              caption: "A towering shape of molten cinder rises. Hold the road.",
              speak: "The Cinder Warden",
            },
          ],
        };
      }
      return this.playCutsceneChapter(chapter, onDone);
    }

    playEpilogue(onDone) {
      const chapters = window.KRCStoryData?.CHAPTERS || [];
      const matches = chapters.filter((ch) => ch.mapIndex === this.mapIndex);
      const chapter = matches[matches.length - 1];
      if (!chapter || this._storyWasSeen(chapter.id)) {
        onDone?.();
        return false;
      }
      const started = this.playCutsceneChapter(chapter, () => {
        this._markStorySeen(chapter.id);
        onDone?.();
      });
      if (!started) onDone?.();
      return started;
    }

    dismissWaveBriefing() {
      this.waveBriefingTimer?.remove?.();
      this.waveBriefingTimer = null;
      if (this.waveBriefing) {
        this.waveBriefing.destroy(true);
        this.waveBriefing = null;
      }
    }

    showWaveBriefing(wave) {
      this.dismissWaveBriefing();
      const line =
        window.KRCCutsceneStage?.buildBriefingText?.(wave) ||
        (wave?.label ? String(wave.label) : "Hold the road.");
      const reduced = !!this.settings?.reducedMotion;
      if (reduced) {
        this.waveBriefing = this.add
          .text(12, 68, line, { font: "11px Arial", color: "#f8f0d8" })
          .setOrigin(0, 0)
          .setDepth(140);
      } else {
        this.waveBriefing = this.add.container(W / 2, 78).setDepth(140);
        const card = this.add
          .rectangle(0, 0, 360, 36, 0xf4e6c8, 0.96)
          .setStrokeStyle(2, 0x8a6a42, 0.95)
          .setInteractive({ useHandCursor: true });
        const txt = this.add
          .text(0, 0, line, {
            font: "12px 'Source Sans 3', Arial",
            color: "#2a1a0c",
            align: "center",
            wordWrap: { width: 340 },
          })
          .setOrigin(0.5);
        card.on("pointerdown", () => this.dismissWaveBriefing());
        this.waveBriefing.add([card, txt]);
      }
      this.waveBriefingTimer = this.time.delayedCall(3500, () => this.dismissWaveBriefing());
    }

    setCampaignIntel(index, locked) {
      if (!this.campaignIntelTitle || !this.campaignIntelBody) return;
      const cards = [
        ["FOREST GATE · OPEN", "Green lane, honest bend. Scouts then brutes.\n3★ if the gate holds. Early CALL pays gold."],
        ["STONE PASS", "Armor and flyers in the pinch. Barracks hold the cut.\n3★: no leaks through the canyon."],
        ["EMBER MARSH", "Heat, embers, bosses. Artillery earns its keep.\nWatch the fissures."],
        ["GALE REACH", "Cross-gusts hide flyers on the switchbacks.\nKeep eyes on the sky."],
        ["ASH SPIRE", "Cinder peak. Armor and embers climb the switch.\nHold the high road."],
      ];
      const card = cards[index] || cards[0];
      const mapName = (MAPS[index]?.name || "Province").toUpperCase();
      if (locked) {
        this.campaignIntelTitle.setText(`${mapName} · LOCKED`);
        this.campaignIntelBody.setText("Clear the road behind you to open this province.");
      } else {
        this.campaignIntelTitle.setText(card[0]);
        this.campaignIntelBody.setText(card[1]);
      }
      if (this.campaignIntelBg) {
        const biomeColors = [0x7ec86a, 0xb8c4d0, 0xff7030, 0x7ec8e8, 0xd4a878];
        const color = locked ? 0x4a554a : (biomeColors[index] ?? 0x7ec86a);
        this.campaignIntelBg.setStrokeStyle(2, color, 0.88);
      }
    }

    heroPickerSessionDone() {
      try {
        return sessionStorage.getItem("krc_hero_picker_session") === "1";
      } catch {
        return true;
      }
    }

    markHeroPickerSession() {
      try {
        sessionStorage.setItem("krc_hero_picker_session", "1");
      } catch {
        /* ignore */
      }
    }

    showSessionHeroPicker(onDone) {
      const api = window.KRCHeroSelect;
      const host = typeof document !== "undefined"
        ? (document.querySelector(".shell") || document.getElementById("game") || document.body)
        : null;
      if (!api?.renderHeroPicker || !host) {
        this.markHeroPickerSession();
        onDone?.();
        return;
      }
      const box = document.createElement("div");
      box.setAttribute("data-krc-hero-picker", "1");
      box.style.cssText = "position:absolute;inset:0;z-index:40;background:rgba(8,12,6,0.86);display:flex;align-items:center;justify-content:center;";
      host.appendChild(box);
      api.renderHeroPicker(box, (hero) => {
        this.heroKind = hero?.id === "sentinel" ? "sentinel" : "captain";
        this.applyHeroKind();
        this.markHeroPickerSession();
        box.remove();
        onDone?.();
      });
    }

    beginMap(mapIndex) {
      if (this._awaitingHeroPick) return;
      if (!this.heroPickerSessionDone()) {
        this._awaitingHeroPick = true;
        this.showSessionHeroPicker(() => {
          this._awaitingHeroPick = false;
          this.beginMap(mapIndex);
        });
        return;
      }
      this.hideTooltip();
      this.audio.resume();
      this.audio.play("start", 0.45);
      this.audio.startMusic();
      if (mapIndex !== this.mapIndex) {
        this.overlayActive = false;
        this.overlay?.destroy();
        this.scene.restart({ mapIndex, gold: 280, lives: this.ironMode ? 1 : 20, heroKind: this.heroKind, ironMode: this.ironMode });
        return;
      }
      this.overlayActive = false;
      this.overlay.destroy();
      this.audio.startAmbience(mapIndex);
      if (this.ironMode) {
        this.lives = 1;
        if (!this.ironHud && this.livesText) {
          this.ironHud = this.add.text(168, 26, "IRON", { font: "bold 10px Cinzel", color: "#c8d0d8" }).setDepth(100);
        }
      }
      if (mapIndex === 0) { // Forest Gate
        this.add.rectangle(W / 2, H / 2, W, H, 0x1a3c14, 0.08).setDepth(5);
      } else if (mapIndex === 1) { // Stone Pass
        this.add.rectangle(W / 2, H / 2, W, H, 0x3a3a3a, 0.06).setDepth(5);
      } else if (mapIndex === 2) { // Ember Marsh
        this.add.rectangle(W / 2, H / 2, W, H, 0x3a1a0a, 0.08).setDepth(5);
      } else if (mapIndex === 3) {
        this.add.rectangle(W / 2, H / 2, W, H, 0x1a2c2c, 0.08).setDepth(5);
      } else if (mapIndex === 4) {
        this.add.rectangle(W / 2, H / 2, W, H, 0x2a1810, 0.08).setDepth(5);
      }
      this.playChapterIntro(mapIndex, () => this.showMapBriefing(mapIndex));
      this.updateHud();
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
      this.clearFamilyPathPick();
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
        // Range ring preview for selected tower pad
        if (this.rangePreview) this.rangePreview.destroy();
        const ring = this.makeRangeDecal(pad.x, pad.y, cfg.range[pad.tower.level], cfg.color);
        ring.setVisible(true);
        this.rangePreview = ring;
        this.syncRallyReadability(pad.tower);
      } else {
        // Hide range preview when no tower selected
        if (this.rangePreview) { this.rangePreview.destroy(); this.rangePreview = null; }
      }
    }

    clearSelection() {
      this.clearFamilyPathPick();
      this.selectedPad = null;
      this.selectedBuild = null;
      this.heroSelected = false;
      this.setHeroPanel(false);
      this.refreshSelection();
      for (const tower of this.towers) {
        if (tower.type === "barracks") this.syncRallyReadability(tower);
      }
    }

    refreshSelection() {
      for (const pad of this.buildPads) {
        const active = pad === this.selectedPad;
        if (pad.glow) {
          pad.glow.setVisible(!pad.tower);
          pad.glow.setStrokeStyle(active ? 3 : 2, active ? 0xfff0a0 : 0xf5d76e, active ? 0.85 : 0.35);
          pad.glow.setFillStyle(0xf5d76e, active ? 0.18 : 0.08);
          if (active && !pad.tower && !this.settings?.reducedMotion) {
            pad.glow.setScale(0);
            this.tweens.add({ targets: pad.glow, scale: 1, duration: 150, ease: "Quad.easeOut" });
          }
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

    getTowerTextureKey(towerOrType, level = 0) {
      const type = typeof towerOrType === "object" ? towerOrType?.type : towerOrType;
      const lvl = typeof towerOrType === "object" ? (towerOrType?.level || 0) : level;
      if (lvl >= 2 && this.textures.exists(`tower_${type}_l3`)) {
        return `tower_${type}_l3`;
      }
      if (lvl >= 1 && this.textures.exists(`tower_${type}_l2`)) {
        return `tower_${type}_l2`;
      }
      return this.textures.exists(`tower_${type}_idle`) ? `tower_${type}_idle` : `tower_${type}`;
    }

    getTowerScale(typeOrTower, level = 0) {
      const lvl = typeof typeOrTower === "object" ? (typeOrTower?.level || 0) : level;
      return 0.72 + lvl * 0.04;
    }

    getTowerSpawnScale(type) {
      return 0.36;
    }

    getTowerBounceScale(type, level = 0) {
      const lvl = typeof type === "object" ? (type?.level || 0) : level;
      return 0.74 + lvl * 0.04;
    }

    buildTower(pad, type) {
      const cfg = TOWERS[type];
      if (this.gold < cfg.cost) {
        this.say(`Need ${cfg.cost} gold.`);
        this.audio.playLayered?.("uiError");
        return;
      }
      this.gold -= cfg.cost;
      pad.icon.setText("");
      pad.icon.setVisible(false);
      if (pad.glow) pad.glow.setVisible(false);
      if (pad.hint) {
        this.tweens.killTweensOf(pad.hint);
        pad.hint.destroy();
        pad.hint = null;
      }
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
      const baseScale = this.getTowerScale(type, 0);
      const initialKey = this.getTowerTextureKey(type, 0);
      tower.sprite = this.add.image(pad.x, pad.y - 10, initialKey).setScale(baseScale).setDepth(30);
      this.applyUnitTint(tower.sprite);
      tower.ground = this.add.ellipse(pad.x, pad.y + 10, 56, 18, 0x050804, 0.4).setDepth(29);
      tower.label = this.add.text(pad.x + 16, pad.y + 15, "", { font: "bold 12px 'Source Sans 3', Arial", color: "#fff2ba" }).setOrigin(0.5).setDepth(31);
      tower.rangeRing = this.makeRangeDecal(pad.x, pad.y, cfg.range[0], cfg.color);
      if (type === "barracks") {
        tower.rallyRing = this.add.circle(tower.rallyX, tower.rallyY, 17, 0xf5d76e, 0.08).setStrokeStyle(2, 0xf5d76e, 0.9).setDepth(28);
        tower.rallyFlag = this.add.text(tower.rallyX, tower.rallyY - 20, "RLY", { font: "bold 9px 'Source Sans 3', Arial", color: "#fff2ba" }).setOrigin(0.5).setDepth(29);
        if (!this.settings?.reducedMotion) {
          this.tweens.add({
            targets: tower.rallyFlag,
            angle: { from: -3.5, to: 3.5 },
            scaleX: { from: 0.95, to: 1.05 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
        tower.trainMax = window.KRCBarracksReadiness.respawnCooldown(0);
        tower.cooldown = 0.35;
        tower.readyBadge = this.add
          .text(pad.x, pad.y + 28, "READY", {
            font: "bold 10px 'Source Sans 3', Arial",
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
      if (this.waveIndex === 0 && this.towers.length >= 2 && this.callButton && !this.settings?.reducedMotion) {
        this.tweens.add({
          targets: this.callButton.bg,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 220,
          yoyo: true,
          repeat: 3,
          ease: "Sine.easeInOut",
        });
      }
      if (!this.settings?.reducedMotion) {
        tower.sprite.setPosition(pad.x, pad.y + 6).setScale(this.getTowerSpawnScale(type));
        this.tweens.add({
          targets: tower.sprite,
          y: pad.y - 8,
          scale: baseScale,
          duration: 240,
          ease: "Cubic.out",
          onComplete: () => {
            if (!tower.sprite || this.settings?.reducedMotion) return;
            this.tweens.add({
              targets: tower.sprite,
              scaleX: baseScale * 1.035,
              scaleY: baseScale * 0.97,
              duration: 980,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          },
        });

        const flash = this.add.circle(pad.x, pad.y - 8, 12, 0xf5d76e, 0.7).setDepth(35);
        this.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 250, onComplete: () => flash.destroy() });

        const dustColors = [0xc2b280, 0xd4c596, 0x8b7d6b, 0x9e9484, 0xdfd3b6];
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const dist = 6 + Math.random() * 12;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * (dist * 0.6);
          const color = dustColors[i % dustColors.length];
          const dust = this.textures.exists("fx_dust")
            ? this.add.image(pad.x + dx * 0.3, pad.y + dy * 0.3, "fx_dust").setScale(0.35 + Math.random() * 0.25).setTint(color).setAlpha(0.7).setDepth(34)
            : this.add.circle(pad.x + dx * 0.3, pad.y + dy * 0.3, 4 + Math.random() * 4, color, 0.65).setDepth(34);
          if (dust.setAngle) dust.setAngle(Math.random() * 360);
          this.tweens.add({
            targets: dust,
            x: pad.x + dx * 1.5,
            y: pad.y + dy * 1.5 - 4,
            scale: (dust.scale || 1) * 1.8,
            alpha: 0,
            duration: 300 + Math.random() * 100,
            ease: "Quad.out",
            onComplete: () => dust.destroy(),
          });
        }

        const woodColors = [0x8b5a2b, 0x654321, 0xa0522d, 0xd2b48c];
        for (let i = 0; i < 6; i += 1) {
          const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 10 + Math.random() * 14;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist - (5 + Math.random() * 8);
          const w = 3 + Math.random() * 2;
          const h = 2 + Math.random() * 2;
          const color = woodColors[i % woodColors.length];
          const chip = this.add.rectangle(pad.x, pad.y - 4, w, h, color, 0.9).setDepth(36);
          chip.setRotation(Math.random() * Math.PI * 2);
          this.tweens.add({
            targets: chip,
            x: pad.x + dx,
            y: pad.y + dy,
            rotation: chip.rotation + (Math.random() > 0.5 ? 3.14 : -3.14),
            scale: 0.4,
            alpha: 0,
            duration: 250 + Math.random() * 100,
            ease: "Quad.out",
            onComplete: () => chip.destroy(),
          });
        }

        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2;
          const speed = 35 + Math.random() * 25;
          const p = this.add.circle(pad.x, pad.y - 8, 1.5 + Math.random(), 0xf5d76e, 0.85).setDepth(36);
          this.effects.push({ obj: p, life: 0.35 + Math.random() * 0.15, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
        }
      }
      this.audio.playLayered("towerBuild");
      this.selectedPad = pad;
      this.selectedBuild = null;
      this.setHeroPanel(false);
      this.refreshSelection();
      this.say(`${cfg.name} built.`);
    }

    clearFamilyPathPick() {
      if (this.familyPathBtns) {
        for (const btn of this.familyPathBtns) {
          if (btn) {
            for (const obj of [
              btn.shadow,
              btn.bg,
              btn.shine,
              btn.lip,
              btn.text,
              btn.icon,
              btn.iconShadow,
              btn.roleMarkShadow,
              btn.roleMarkG,
              btn.roleMarkText,
            ]) {
              obj?.destroy?.();
            }
          }
        }
        this.familyPathBtns = null;
      }
    }

    familyPaths(type) {
      const table = {
        archer: [
          { id: "skybit", label: "SKYBIT", tag: " SKY" },
          { id: "pinshot", label: "PINSHOT", tag: " PIN" },
        ],
        mage: [
          { id: "veil", label: "VEIL", tag: " VEL" },
          { id: "shard", label: "SHARD", tag: " SHD" },
        ],
        artillery: [
          { id: "crater", label: "CRATER", tag: " CRT" },
          { id: "fuse", label: "FUSE", tag: " FUS" },
        ],
        barracks: [
          { id: "spike", label: "SPIKE", tag: " SPK" },
          { id: "bulwark", label: "BULWARK", tag: " BLK" },
        ],
      };
      return table[type] || null;
    }

    towerFamily(type) {
      return window.KRCTowerSpec?.familyForType?.(type) || (type === "archer" ? "rangers" : type);
    }

    specOptions(type) {
      const family = this.towerFamily(type);
      return window.KRCTowerSpec?.SPEC_TREE?.[family] || null;
    }

    towerInvestedGold(tower) {
      const cfg = TOWERS[tower.type];
      const spent = cfg.cost + cfg.upgrades.slice(0, tower.level).reduce((a, b) => a + b, 0);
      if (!tower.spec) return spent;
      const extra = window.KRCTowerSpec?.specCost?.(this.towerFamily(tower.type), tower.level + 1) ?? 260;
      return spent + extra;
    }

    scaledTowerStat(tower, key) {
      const cfg = TOWERS[tower.type];
      const base = cfg[key]?.[tower.level];
      if (base == null) return 0;
      const mul = tower.spec?.bonus?.[key];
      let value = typeof mul === "number" ? base * mul : base;
      const tm = this.talentMods || {};
      if (key === "damage" && tower.type === "mage") value *= tm.mageDmg || 1;
      if (key === "rate" && tower.type === "archer") value = Math.max(0.25, value * (tm.rate || 1));
      if (key === "soldierHp") value *= tm.soldierHp || 1;
      return value;
    }

    drawSpecBadge(tower) {
      if (!tower) return;
      tower.specBadge?.destroy?.();
      tower.specBadge = null;
      const paint = window.KRCArt?.paintSpecBadge;
      if (typeof paint === "function") {
        try {
          const mark = paint.call(window.KRCArt, this, tower);
          if (mark) tower.specBadge = mark;
          return;
        } catch {
          /* art lane missing or signature mismatch */
        }
      }
      tower.specBadge = this.add.circle(tower.x + 16, tower.y - 24, 7, 0xf5c85a, 0.92)
        .setStrokeStyle(1.5, 0x3a250c)
        .setDepth(40);
    }

    syncSpecPanel(tower) {
      const opts = tower && tower.level >= 3 && !tower.spec ? this.specOptions(tower.type) : null;
      const showSpec = !!(opts && opts.length >= 2);
      if (this.upgradeButton) this.upgradeButton.setVisible(!showSpec);
      for (let i = 0; i < (this.specButtons || []).length; i += 1) {
        const btn = this.specButtons[i];
        if (!btn) continue;
        if (showSpec && opts[i]) {
          const label = String(opts[i].name).split(" ").join("\n");
          btn.setLabel(label);
          btn.setVisible(true);
        } else {
          btn.setVisible(false);
        }
      }
    }

    confirmTowerSpec(tower, specId) {
      if (this.overlayActive || this.gameEnded) return;
      if (!this.selectedPad || this.selectedPad.tower !== tower) return;
      const api = window.KRCTowerSpec;
      const family = this.towerFamily(tower?.type);
      const tier = (tower?.level ?? 0) + 1;
      const chosen = api?.chooseSpec?.(family, tower.spec?.id || null, tier, specId);
      if (!chosen) {
        this.say("Cannot specialize.");
        this.audio.playLayered?.("uiError");
        return;
      }
      if (tower.spec?.id === chosen.id) return;
      const cost = api.specCost(family, tier);
      if (this.gold < cost) {
        this.say(`Need ${cost} gold to upgrade.`);
        this.audio.playLayered?.("uiError");
        return;
      }
      this.gold -= cost;
      tower.spec = chosen;
      this.drawSpecBadge(tower);
      const cfg = TOWERS[tower.type];
      tower.rangeRing?.setRadius?.(this.scaledTowerStat(tower, "range"));
      this.flashText(chosen.name, tower.x, tower.y - 42, "#fff2ba");
      this.say(`${cfg.name} specialized: ${chosen.name}.`);
      this.audio.playLayered?.("towerUpgrade");
      this.updateUpgradeLabel();
      this.updateHud?.();
    }

    showFamilyPathPick(tower) {
      this.clearFamilyPathPick();
      const paths = this.familyPaths(tower?.type);
      if (!paths || paths.length < 2) return;
      const b0 = this.makeButton(
        tower.x - 52,
        tower.y - 56,
        88,
        28,
        paths[0].label,
        0x2d5535,
        () => this.confirmFamilyPath(tower, paths[0].id)
      );
      const b1 = this.makeButton(
        tower.x + 52,
        tower.y - 56,
        88,
        28,
        paths[1].label,
        0x5a3e28,
        () => this.confirmFamilyPath(tower, paths[1].id)
      );
      this.familyPathBtns = [b0, b1];
      this.say("Last upgrade: pick a path before gold is spent.");
    }

    confirmFamilyPath(tower, path) {
      if (this.overlayActive || this.gameEnded) return;
      const paths = this.familyPaths(tower?.type);
      const chosen = paths?.find((p) => p.id === path);
      if (!this.selectedPad || this.selectedPad.tower !== tower || tower.level !== 3 || !chosen) {
        return;
      }
      const cfg = TOWERS[tower.type];
      const cost = cfg.upgrades[3];
      if (this.gold < cost) {
        this.say(`Need ${cost} gold to upgrade.`);
        this.audio.playLayered?.("uiError");
        return;
      }
      this.gold -= cost;
      tower.level += 1;
      tower.path = path;
      this.clearFamilyPathPick();
      if (tower.firePoseTimer) {
        tower.firePoseTimer.remove(false);
        tower.firePoseTimer = null;
      }
      const idleKeyPath = this.getTowerTextureKey(tower);
      if (tower.sprite) {
        tower.sprite.setTexture(idleKeyPath);
        tower.sprite.setScale(this.getTowerScale(tower));
        if (tower.hexed) {
          tower.sprite.setTint(0xb49cff);
        } else {
          this.applyUnitTint(tower.sprite);
        }
      }
      tower.label.setText("");
      tower.rangeRing.setRadius(cfg.range[tower.level]);
      this.flashText(path.toUpperCase(), tower.x, tower.y - 42, "#fff2ba");
      this.say(`${cfg.name} upgraded to ${path.toUpperCase()}.`);
      this.audio.playLayered?.("towerUpgrade");
      this.updateUpgradeLabel();
    }

    upgradeSelected() {
      if (this.overlayActive || this.gameEnded) return;
      const tower = this.selectedPad?.tower;
      if (!tower) {
        this.say("Select a built tower first.");
        this.audio.playLayered?.("uiError");
        return;
      }
      const cfg = TOWERS[tower.type];
      if (tower.spec || tower.level >= cfg.upgrades.length) {
        this.say("Tower is fully upgraded.");
        this.audio.playLayered?.("uiError");
        return;
      }
      if (tower.level >= 3 && !tower.spec && this.specOptions(tower.type)) {
        this.syncSpecPanel(tower);
        this.say("Last upgrade: pick a specialization.");
        return;
      }
      if (tower.level === 3 && !tower.path && this.familyPaths(tower.type)) {
        this.showFamilyPathPick(tower);
        return;
      }
      const cost = cfg.upgrades[tower.level];
      if (this.gold < cost) {
        this.say(`Need ${cost} gold to upgrade.`);
        this.audio.playLayered?.("uiError");
        return;
      }
      this.gold -= cost;
      tower.level += 1;
      if (tower.firePoseTimer) {
        tower.firePoseTimer.remove(false);
        tower.firePoseTimer = null;
      }
      const idleKeyUp = this.getTowerTextureKey(tower);
      if (tower.sprite) {
        tower.sprite.setTexture(idleKeyUp);
        if (tower.hexed) {
          tower.sprite.setTint(0xb49cff);
        } else {
          this.applyUnitTint(tower.sprite);
        }
      }
      // Upgrade visual: scale bounce + scaffold morph + stronger glow burst
      if (tower.sprite && !this.settings?.reducedMotion) {
        this.tweens.add({ targets: tower.sprite, scale: this.getTowerBounceScale(tower.type, tower.level), duration: 120, yoyo: true, repeat: 1 });
        const isMax = tower.level >= cfg.upgrades.length;
        let ringColor = 0xcd7f32; // Bronze for L2
        let strokeColor = 0xdf9b52;
        if (isMax) {
          ringColor = 0x70d6ff; // Diamond for MAX
          strokeColor = 0xffffff;
        } else if (tower.level >= 3) {
          ringColor = 0xf5d76e; // Gold for L4+
          strokeColor = 0xfff2ba;
        } else if (tower.level === 2) {
          ringColor = 0xc0c8d0; // Silver for L3
          strokeColor = 0xf0f4f8;
        }
        // Short scaffold (2-3 wood rects) that rises then destroys
        const scaffoldPieces = [
          this.add.rectangle(tower.x - 12, tower.y - 4, 4, 20, 0x654321, 0.95).setDepth(34),
          this.add.rectangle(tower.x + 12, tower.y - 4, 4, 20, 0x654321, 0.95).setDepth(34),
          this.add.rectangle(tower.x, tower.y - 12, 26, 4, 0x8b5a2b, 0.95).setDepth(35),
        ];
        scaffoldPieces.forEach((piece, idx) => {
          this.tweens.add({
            targets: piece,
            y: piece.y - 14,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 320 + idx * 40,
            ease: "Quad.out",
            onComplete: () => piece.destroy(),
          });
        });
        // Stronger glow burst than the current ring
        const coreGlow = this.add.circle(tower.x, tower.y - 8, 16, 0xffffff, 0.95).setDepth(36);
        this.tweens.add({ targets: coreGlow, alpha: 0, scale: 2.2, duration: 300, ease: "Quad.out", onComplete: () => coreGlow.destroy() });
        const burst = this.add.circle(tower.x, tower.y - 8, 24, ringColor, 0.85).setStrokeStyle(4, strokeColor, 1).setDepth(35);
        this.tweens.add({ targets: burst, alpha: 0, scale: 3.2, duration: 450, ease: "Cubic.out", onComplete: () => burst.destroy() });
        const auraRing = this.add.circle(tower.x, tower.y - 8, 30, ringColor, 0.45).setStrokeStyle(2, 0xffffff, 0.9).setDepth(35);
        this.tweens.add({ targets: auraRing, alpha: 0, scale: 3.8, duration: 500, ease: "Quad.out", onComplete: () => auraRing.destroy() });
        // Sparkles around tower matching ring theme
        for (let i = 0; i < 16; i += 1) {
          const angle = (i / 16) * Math.PI * 2;
          const speed = 40 + Math.random() * 30;
          const sparkle = this.textures.exists("fx_spark")
            ? this.add.image(tower.x, tower.y - 8, "fx_spark").setScale(0.28 + Math.random() * 0.18).setTint(ringColor).setAlpha(0.95).setDepth(36)
            : this.add.circle(tower.x, tower.y - 8, 1.5 + Math.random(), ringColor, 0.9).setDepth(36);
          if (sparkle.setAngle) sparkle.setAngle(Math.random() * 360);
          this.effects.push({ obj: sparkle, life: 0.4 + Math.random() * 0.2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
        }
        this.cameras.main.flash(40, 255, 250, 220, false);
      }
      tower.sprite.setScale(this.getTowerScale(tower));
      const pathTag = this.familyPaths(tower.type)?.find((p) => p.id === tower.path)?.tag || "";
      tower.label.setText("");
      tower.rangeRing.setRadius(cfg.range[tower.level]);
      const unlocked = window.KRCTowerAbilities?.isUnlocked(tower.type, tower.level);
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      if (unlocked && ability && tower.level === ability.minLevel) {
        tower.abilityCooldown = 0;
        this.flashText(ability.name.toUpperCase(), tower.x, tower.y - 42, "#fff2ba");
        this.say(`${cfg.name} unlocked ${ability.name}: ${ability.description}`);
      } else {
        this.flashText(`UPGRADE L${tower.level + 1}`, tower.x, tower.y - 42, "#fff2ba");
        this.say(`${cfg.name} upgraded to level ${tower.level + 1}.`);
      }
      const levelBadge = this.add.text(tower.x, tower.y - 50, `L${tower.level + 1}`, {
        font: "bold 16px 'Source Sans 3', Arial",
        color: tower.level >= 3 ? "#f5d76e" : "#fff2ba",
      }).setOrigin(0.5).setDepth(100);
      this.tweens.add({ targets: levelBadge, y: tower.y - 70, alpha: 0, duration: 800, onComplete: () => levelBadge.destroy() });
      this.audio.playLayered("towerUpgrade");
      this.updateUpgradeLabel();
    }

    sellSelected() {
      if (this.overlayActive || this.gameEnded) return;
      if (this.ironMode) {
        this.say("Iron Watch: no selling.");
        return;
      }
      this.clearFamilyPathPick();
      const tower = this.selectedPad?.tower;
      if (!tower) return;
      const cfg = TOWERS[tower.type];
      const spent = this.towerInvestedGold(tower);
      const refund = Math.floor(spent * 0.55);
      this.gold += refund;
      this.audio.playLayered("towerSell");
      if (tower.firePoseTimer) {
        tower.firePoseTimer.remove(false);
        tower.firePoseTimer = null;
      }
      tower.sprite.destroy();
      tower.label.destroy();
      tower.rangeRing.destroy();
      tower.rallyRing?.destroy();
      tower.rallyFlag?.destroy();
      tower.readyBadge?.destroy();
      tower.readyMeter?.destroy();
      tower.readyFill?.destroy();
      tower.hexVeil?.destroy();
      tower.hexSlash?.destroy();
      tower.specBadge?.destroy?.();
      this.entityRegistry.transition(tower, "removed");
      for (const s of tower.soldiers) this.killSoldier(s);
      this.towers = this.towers.filter((t) => t !== tower);
      this.selectedPad.tower = null;
      this.selectedPad.icon.setText("+");
      this.selectedPad.icon.setVisible(true);
      if (this.selectedPad.glow) this.selectedPad.glow.setVisible(true);
      this.flashText(`+${refund}`, tower.x, tower.y - 28, COLORS.gold);
      this.createDamageNumber(tower.x, tower.y - cfg.cost - 20, `+${refund}`, COLORS.gold);
      this.createCoinBurst(tower.x, tower.y - 24);
      this.say(`Sold for ${refund} gold (55% refund).`);
      this.refreshSelection();
    }

    updateUpgradeLabel() {
      const tower = this.selectedPad?.tower;
      if (!tower) {
        this.upgradeButton.setLabel("UP\n-");
        this.sellButton.setLabel("SELL");
        this.syncSpecPanel(null);
        for (const t of this.towers) {
          t.rangeRing.setVisible(false);
          t.rangeRing._animated = false;
        }
        return;
      }
      const cfg = TOWERS[tower.type];
      const ability = window.KRCTowerAbilities?.getAbility(tower.type);
      const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
      this.syncSpecPanel(tower);
      if (tower.spec) {
        this.upgradeButton.setLabel("SPEC\nMAX");
      } else if (tower.level >= cfg.upgrades.length && unlocked) {
        const cd = Math.ceil(Math.max(0, tower.abilityCooldown || 0));
        this.upgradeButton.setLabel(cd > 0 ? `${ability.name.slice(0, 3).toUpperCase()}\n${cd}s` : `${ability.name.slice(0, 3).toUpperCase()}\nRDY`);
      } else {
        this.upgradeButton.setLabel(tower.level >= cfg.upgrades.length ? "MAX" : `UP\n${cfg.upgrades[tower.level]}`);
      }
      const spent = this.towerInvestedGold(tower);
      const refund = Math.floor(spent * 0.55);
      this.sellButton.setLabel(`SELL\n${refund}g`);
      if (tower.rangeRing) {
        tower.rangeRing.setVisible(true);
        if (!this.settings?.reducedMotion && !tower.rangeRing._animated) {
          tower.rangeRing.setScale(0);
          this.tweens.add({ targets: tower.rangeRing, scale: 1, duration: 200, ease: "Quad.easeOut" });
          tower.rangeRing._animated = true;
        }
      }
      for (const t of this.towers) {
        if (t !== tower) {
          t.rangeRing.setVisible(false);
          t.rangeRing._animated = false;
        }
      }
    }

    callWave() {
      if (this.overlayActive || this.gameEnded) return;
      if (!this.qaMode && this.waveIndex === 0 && this.towers.length < 2) {
        this.say("Build at least two towers before the first wave.");
        this.audio.playLayered?.("uiError");
        return;
      }
      if (this.waveActive) {
        this.say("Wave is already marching.");
        this.audio.playLayered?.("uiError");
        return;
      }
      if (this.waveIndex >= WAVES.length) return;
      const wave = WAVES[this.waveIndex];
      if (wave.packs.some((pack) => pack[0] === "boss") && !this._wardenIntroPlayed) {
        this._wardenIntroPlayed = true;
        if (this.playWardenIntro(() => this.callWave())) return;
      }
      let bonus = wave.gold;
      if (!this.ironMode && !this.waveActive && this.enemies.length === 0 && this.waveIndex < WAVES.length) {
        const earlyBonus = 8 + this.waveIndex * 2;
        bonus += earlyBonus;
        // Early call cinematic: golden flash on CALL button area
        if (!this.settings?.reducedMotion) {
          const flash = this.add.circle(W / 2, H - 60, 30, 0xf5c85a, 0.4).setDepth(95);
          this.tweens.add({ targets: flash, alpha: 0, scale: 2, duration: 350, onComplete: () => flash.destroy() });
        }
        this.flashText(`+${earlyBonus} EARLY`, W / 2, 120, "#fff2ba");
      }
      this.gold += bonus;
      // Wave start cinematic: expanding ring from gate position & horn cinematic
      if (!this.settings?.reducedMotion) {
        const gatePos = this.path[0];
        const waveRing = this.add.circle(gatePos.x, gatePos.y, 5, 0xff623d, 0.5).setStrokeStyle(3, 0xffd07a, 1).setDepth(50);
        this.tweens.add({ targets: waveRing, alpha: 0, scale: 15, duration: 600, onComplete: () => waveRing.destroy() });

        // Second delayed expanding ring from gate (stagger ~180ms)
        this.time.delayedCall(180, () => {
          if (!this.scene?.systems) return;
          const waveRing2 = this.add.circle(gatePos.x, gatePos.y, 5, 0xff8a3d, 0.4).setStrokeStyle(2, 0xffe08a, 0.9).setDepth(50);
          this.tweens.add({ targets: waveRing2, alpha: 0, scale: 15, duration: 600, onComplete: () => waveRing2.destroy() });
        });

        // Tiny brass flash near CALL button (<=80ms)
        const brassFlash = this.add.circle(W / 2, H - 60, 32, 0xd4a359, 0.6).setDepth(95);
        this.tweens.add({ targets: brassFlash, alpha: 0, scale: 1.3, duration: 75, onComplete: () => brassFlash.destroy() });

        // Red warning particles from gate
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * Math.PI * 2;
          const speed = 50 + Math.random() * 40;
          const warn = this.add.circle(gatePos.x, gatePos.y, 1.5 + Math.random(), 0xff623d, 0.8).setDepth(51);
          this.effects.push({ obj: warn, life: 0.4 + Math.random() * 0.2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
        }
      }
      this.queue = [];
      for (const [type, count] of wave.packs) {
        for (let i = 0; i < count; i += 1) this.queue.push(type);
      }
      this.waveTotal = this.queue.length;
      this.waveActive = true;
      this.audio.riseOnCall();
      this.spawnTimer = 0.1;
      this.audio.play("start", 0.35, 1.08);

      // Incoming-threat name chip for first queued enemy type
      const firstEnemyType = this.queue[0];
      const threatName = ENEMIES[firstEnemyType]?.name;
      if (threatName) {
        const gatePos = this.path[0];
        const chipX = Math.max(60, gatePos.x + 60);
        const chipY = Math.max(40, gatePos.y - 20);
        this.flashText(`THREAT: ${threatName.toUpperCase()}`, chipX, chipY, "#ffc27d");
      }
      // Wave label cinematic: large text that fades in then out
      this.flashText(`WAVE ${this.waveIndex + 1}: ${wave.label}`, W / 2, H / 2 - 40, "#ff8a73");
      this.say(`Wave ${this.waveIndex + 1}: ${wave.label}`);
      this.showWaveBriefing(wave);
    }

    toggleMuted() {
      this.settings.muted = !this.settings.muted;
      this.settings = window.KRCSettings?.save?.({ muted: this.settings.muted }) || this.settings;
      this.audio.setMuted(this.settings.muted);
      if (!this.settings.muted) this.audio.startMusic();
      if (this.muteButton?.setIcon) {
        this.muteButton.setIcon(this.settings.muted ? "icon_sound_off" : "icon_sound_on");
      } else {
        this.muteButton?.setLabel?.(this.settings.muted ? "×" : "♪");
      }
      this.say(this.settings.muted ? "Sound muted." : "Sound restored.");
    }

    toggleMute() {
      return this.toggleMuted();
    }

    toggleReducedMotion() {
      this.settings.reducedMotion = !this.settings.reducedMotion;
      this.settings = window.KRCSettings?.save?.({ reducedMotion: this.settings.reducedMotion }) || this.settings;
      if (this.settings.reducedMotion) {
        this.audio.stopAmbience();
        for (const tower of this.towers) {
          if (tower.rallyFlag && this.tweens.isTweening(tower.rallyFlag)) {
            this.tweens.killTweensOf(tower.rallyFlag);
            tower.rallyFlag.setAngle(0);
            tower.rallyFlag.setScale(1);
          }
        }
      }
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
          this.recordVictory(stars);
          const afterEpilogue = () => {
            if (this.mapIndex < MAPS.length - 1) {
              this.audio.play("ready", 0.45);
              this.showMapClearOverlay(stars);
            } else {
              this.endGame(true);
            }
          };
          this.playEpilogue(afterEpilogue);
        } else {
          const bonus = this.waveIndex >= 6 ? 32 + this.waveIndex * 5 : 22 + this.waveIndex * 5;
          this.gold += bonus;
          if (this.waveIndex >= 6) {
            this.flashText(`+${bonus} LATE`, W / 2, 120, "#fff2ba");
          }
          this.say(`Wave cleared. Prepare for ${WAVES[this.waveIndex].label}.`);
          this.trimAftermath(24);
          this.beginWaveCalm();
        }
      }
    }

    beginWaveCalm() {
      this.waveCalmUntil = this.time.now + 1400;
      this.audio.fallOnCalm();
      for (const e of this.effects) {
        if ((e.life || 0) > 0.12) e.life = Math.min(e.life, 0.18);
      }
      if (this.settings?.reducedMotion) return;
      const pts = this.path && this.path.length ? this.path : [{ x: 200, y: 300 }];
      for (let i = 0; i < 8; i += 1) {
        const pt = pts[i % pts.length];
        const dust = this.textures.exists("fx_dust")
          ? this.add.image(pt.x + (Math.random() - 0.5) * 20, pt.y + 6, "fx_dust").setScale(0.28 + Math.random() * 0.2).setTint(0xc8b89a).setAlpha(0.45).setDepth(18)
          : this.add.circle(
              pt.x + (Math.random() - 0.5) * 20,
              pt.y + 6,
              2.5 + Math.random() * 2,
              0xc8b89a,
              0.4
            ).setDepth(18);
        if (dust.setAngle) dust.setAngle(Math.random() * 360);
        this.tweens.add({
          targets: dust,
          alpha: 0,
          y: dust.y + 10,
          scale: (dust.scale || 1) * 1.3,
          duration: 720,
          ease: "Quad.out",
          onComplete: () => dust.destroy(),
        });
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
        walkDist: 0,
        facingLeft: false,
      });
      enemy.sprite = this.add.image(enemy.x, enemy.y - 4, `enemy_${type}`).setScale(base.size / 30).setDepth(40);
      this.applyUnitTint(enemy.sprite);
      if (type === "drift") {
        if (!this.textures.exists("enemy_drift")) enemy.sprite.setTexture("enemy_scout");
        enemy.sprite.setTint(0xb8e8ff).setAlpha(0.72);
      } else if (type === "scout") {
        // Scouts are smaller and faster — add speed lines when moving
        enemy.speedLines = [];
      } else if (type === "brute") {
        // Brutes are larger and slower — add heavy shadow
        if (enemy.sprite.setShadow) enemy.sprite.setShadow(4, 4, 0x000000, 2);
      } else if (type === "mage" || type === "wizard") {
        // Magic enemies get a subtle purple glow
        enemy.sprite.setTint(0xc8b0ff);
      } else if (type === "hexer") {
        enemy.hexMark = this.add.text(enemy.x, enemy.y - base.size - 25, "HEX", {
          font: "900 10px 'Cinzel', Arial",
          color: "#dcb0ff",
          stroke: "#220838",
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(45);
      } else if (type === "titan") {
        if (enemy.sprite.setShadow) enemy.sprite.setShadow(6, 6, 0x000000, 2.5);
        enemy.crownTell = this.add.graphics().setDepth(41);
        this.drawTitanCrownTell(enemy.crownTell);
      } else if (type === "ember") {
        enemy.emberGlow = this.add.circle(enemy.x, enemy.y, base.size + 4, 0xff4500, 0.25)
          .setStrokeStyle(1.5, 0xffaa00, 0.6)
          .setDepth(39);
        enemy.fuseSpark = this.add.circle(enemy.x, enemy.y - base.size, 3, 0xffff88, 0.9)
          .setStrokeStyle(1, 0xff4400, 0.9)
          .setDepth(41);
      } else if (type === "boss") {
        // Boss gets a larger shadow and pulsing aura
        if (enemy.sprite.setShadow) enemy.sprite.setShadow(8, 8, 0x000000, 3);
      }
      enemy.nameText = this.add.text(enemy.x, enemy.y + 1, "", { font: "bold 10px 'Source Sans 3', Arial", color: "#102030" }).setOrigin(0.5).setDepth(41);
      enemy.barBg = this.add.rectangle(enemy.x, enemy.y - base.size - 8, 28, 4, 0x2a120e).setDepth(42);
      enemy.bar = this.add.rectangle(enemy.x - 14, enemy.y - base.size - 8, 28, 4, 0x68d764).setOrigin(0, 0.5).setDepth(43);
      const traits = window.KRCEnemyTraits ? window.KRCEnemyTraits.traitsFor(base) : [];
      enemy.traits = traits;
      const badge = window.KRCEnemyTraits ? window.KRCEnemyTraits.badgeText(traits) : "";
      enemy.traitText = this.add
        .text(enemy.x, enemy.y - base.size - 16, badge, {
          font: "bold 9px 'Source Sans 3', Arial",
          color: traits[0]?.color || "#e8f0ff",
          backgroundColor: "#141a14aa",
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5)
        .setDepth(44)
        .setVisible(!!badge);
      // Pulsing glow on trait badges (animated via updateEnemies)
      enemy.traitGlow = this.add.rectangle(enemy.x, enemy.y - base.size - 16, 30, 12, traits[0]?.color || "#e8f0ff", 0.06).setOrigin(0.5).setDepth(43.5).setVisible(!!badge);
      this.enemies.push(enemy);
      return enemy;
    }

    spawnEnemyFrom(type, parent) {
      const child = this.spawnEnemy(type);
      child.x = parent.x;
      child.y = parent.y;
      child.seg = parent.seg;
      child.slow = 0;
      this.updateEnemyVisual(child, 0);
      return child;
    }

    drawTitanCrownTell(graphics) {
      if (!graphics) return;
      graphics.clear();
      // Shoulder pauldrons
      graphics.fillStyle(0x3a322b, 0.95);
      graphics.fillRoundedRect(-22, -6, 12, 10, 3);
      graphics.lineStyle(1.5, 0xd4af37, 0.9);
      graphics.strokeRoundedRect(-22, -6, 12, 10, 3);

      graphics.fillStyle(0x3a322b, 0.95);
      graphics.fillRoundedRect(10, -6, 12, 10, 3);
      graphics.lineStyle(1.5, 0xd4af37, 0.9);
      graphics.strokeRoundedRect(10, -6, 12, 10, 3);

      // Heavy stone & gold crown base
      graphics.fillStyle(0x2a241e, 0.95);
      graphics.fillRoundedRect(-11, -21, 22, 6, 2);
      graphics.lineStyle(1, 0x8e8379, 0.9);
      graphics.strokeRoundedRect(-11, -21, 22, 6, 2);

      // Crown spikes (left, center, right)
      graphics.fillStyle(0xd4af37, 0.95);
      graphics.lineStyle(1, 0x584010, 0.9);

      // Left spike
      graphics.beginPath();
      graphics.moveTo(-11, -21);
      graphics.lineTo(-8, -27);
      graphics.lineTo(-4, -21);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();

      // Center spike (taller)
      graphics.beginPath();
      graphics.moveTo(-4, -21);
      graphics.lineTo(0, -30);
      graphics.lineTo(4, -21);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();

      // Right spike
      graphics.beginPath();
      graphics.moveTo(4, -21);
      graphics.lineTo(8, -27);
      graphics.lineTo(11, -21);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();

      // Ruby gem in center peak
      graphics.fillStyle(0xff2244, 1);
      graphics.fillCircle(0, -22, 2.5);
    }

    updateEnemies(dt) {
      for (const enemy of [...this.enemies]) {
        if (enemy.dead) continue;
        enemy.slow = Math.max(0, enemy.slow - dt);
        enemy.burnTime = Math.max(0, (enemy.burnTime || 0) - dt);
        if (enemy.hitFlash > 0) {
          enemy.hitFlash -= dt;
          if (enemy.hitFlash <= 0 && enemy.sprite) this.applyUnitTint(enemy.sprite);
        }
        if (enemy.type === "boss" && enemy.base.phases) this.updateBossPhases(enemy, dt);
        if (!enemy.blockedBy || enemy.blockedBy.dead) {
          enemy.blockedBy = this.findBlockingSoldier(enemy);
        }
        if (enemy.blockedBy) {
          this.enemyMelee(enemy, enemy.blockedBy, dt);
        } else {
          this.moveEnemy(enemy, dt);
        }

        // For scouts: speed lines when moving fast
        if (enemy.type === "scout" && !enemy.blockedBy) {
          if (!this.settings?.reducedMotion && Math.random() < 0.3) {
            const line = this.add.line(0, 0, enemy.x, enemy.y, enemy.x - 12, enemy.y, 0xffffff, 0.3).setLineWidth(1).setDepth(42);
            this.tweens.add({ targets: line, alpha: 0, duration: 80, onComplete: () => line.destroy() });
          }
        }

        // For brutes: heavy thud effect when blocked
        if (enemy.type === "brute" && enemy.blockedBy) {
          if (!this.settings?.reducedMotion && Math.random() < 0.1) {
            const thud = this.add.circle(enemy.x, enemy.y + 8, 3, 0x8a6a45, 0.5).setDepth(42);
            this.tweens.add({ targets: thud, alpha: 0, scale: 2, duration: 150, onComplete: () => thud.destroy() });
          }
        }

        // For titans: heavy stomp puff and shockwave when blocked
        if (enemy.type === "titan" && enemy.blockedBy) {
          if (!this.settings?.reducedMotion) {
            enemy.stompTimer = (enemy.stompTimer || 0) - dt;
            if (enemy.stompTimer <= 0) {
              enemy.stompTimer = 0.45;
              for (const side of [-1, 1]) {
                const dust = this.textures.exists("fx_dust")
                  ? this.add.image(enemy.x + side * 10, enemy.y + 12, "fx_dust").setScale(0.42).setTint(0x9e8e7a).setAlpha(0.7).setDepth(39)
                  : this.add.circle(enemy.x + side * 10, enemy.y + 12, 4, 0x9e8e7a, 0.6).setDepth(39);
                if (dust.setAngle) dust.setAngle(Math.random() * 360);
                this.tweens.add({
                  targets: dust,
                  x: dust.x + side * 14,
                  y: dust.y - 2,
                  scale: (dust.scale || 1) * 2.0,
                  alpha: 0,
                  duration: 350,
                  ease: "Quad.easeOut",
                  onComplete: () => dust.destroy(),
                });
              }
              const wave = this.add.circle(enemy.x, enemy.y + 10, 8, 0x807060, 0.3)
                .setStrokeStyle(2, 0xc4b4a0, 0.8)
                .setDepth(38);
              this.tweens.add({
                targets: wave,
                scale: 2.5,
                alpha: 0,
                duration: 300,
                ease: "Quad.easeOut",
                onComplete: () => wave.destroy(),
              });
            }
          }
        }

        this.updateEnemyVisual(enemy, dt);
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
          enemy.auraRing = this.add.circle(enemy.x, enemy.y, radius, 0x8a2be2, 0.12).setStrokeStyle(2, 0xd8b0ff, 0.75).setDepth(21);
        } else {
          enemy.auraRing.setPosition(enemy.x, enemy.y);
          enemy.auraRing.setVisible(true);
          if (!this.settings?.reducedMotion) {
            const pulse = Math.sin(this.time.now * 0.005 + enemy.wobble);
            enemy.auraRing.setAlpha(0.75 + pulse * 0.25);
            enemy.auraRing.setScale(1 + pulse * 0.04);
          } else {
            enemy.auraRing.setAlpha(0.85);
            enemy.auraRing.setScale(1);
          }
        }
      }
      for (const tower of this.towers) this.syncTowerHex(tower);
    }

    syncTowerHex(tower) {
      if (!tower.sprite) return;
      if (!tower.hexVeil) {
        tower.hexVeil = this.add.circle(tower.x, tower.y - 8, 20, 0x2a1038, 0.42)
          .setStrokeStyle(2, 0xc89bff, 0.8).setDepth(32);
      }
      if (!tower.hexSlash) {
        tower.hexSlash = this.add.text(tower.x, tower.y - 8, "/", {
          font: "900 22px Cinzel, serif",
          color: "#e6c8ff",
          stroke: "#220838",
          strokeThickness: 4,
        }).setOrigin(0.5).setDepth(33);
      }
      const on = !!tower.hexed;
      tower.hexVeil.setPosition(tower.x, tower.y - 8).setVisible(on);
      tower.hexSlash.setPosition(tower.x + 1, tower.y - 8).setVisible(on);
      tower.sprite.setAlpha(on ? 0.52 : 1);
      if (this.settings?.reducedMotion) {
        tower.hexVeil.setAlpha(on ? 0.45 : 0);
        tower.hexSlash.setAlpha(on ? 0.9 : 0);
      } else if (on) {
        const pulse = 0.32 + Math.sin(this.time.now * 0.01) * 0.1;
        tower.hexVeil.setAlpha(pulse);
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
          this.cameraPunch("boss");
          if (this.settings?.reducedMotion) {
            const flash = this.add.circle(enemy.x, enemy.y, 10, 0xd7c3ff, 0.85).setDepth(70);
            this.tweens.add({ targets: flash, alpha: 0, scale: 2.5, duration: 200, onComplete: () => flash.destroy() });
          } else {
            const ring = this.add.circle(enemy.x, enemy.y, 40, 0xc9a6ff, 0.18).setStrokeStyle(3, 0xf0d8ff, 0.9).setDepth(70);
            this.tweens.add({ targets: ring, alpha: 0, scale: 1.8, duration: 500, onComplete: () => ring.destroy() });

            if (enemy.shieldRing) { enemy.shieldRing.destroy(); enemy.shieldRing = null; }
            const glyph = this.add.graphics().setDepth(70);
            glyph.lineStyle(2, 0xf0d8ff, 0.9);
            glyph.strokeCircle(0, 0, 24);
            glyph.lineStyle(1.5, 0xc9a6ff, 0.85);
            glyph.fillStyle(0x9b51e0, 0.28);
            glyph.beginPath();
            glyph.moveTo(-8, -10);
            glyph.lineTo(8, -10);
            glyph.lineTo(8, 0);
            glyph.lineTo(0, 10);
            glyph.lineTo(-8, 0);
            glyph.closePath();
            glyph.fillPath();
            glyph.strokePath();
            glyph.setPosition(enemy.x, enemy.y);
            enemy.shieldRing = glyph;
          }
        } else if (nextPhase === 3) {
          if (enemy.shieldRing) { enemy.shieldRing.destroy(); enemy.shieldRing = null; }
          enemy.armorBuff = 0;
          enemy.speed *= 1.15;
          this.flashText("WARDEN RAGE", enemy.x, enemy.y - 48, "#ff9ad8");
          this.say("Warden enrages — stall with Guards and burst during the open window.");
          this.cameraPunch("boss");
          for (let i = 0; i < 3; i += 1) this.spawnEnemyFrom("scout", enemy);
          if (this.settings?.reducedMotion) {
            const flash = this.add.circle(enemy.x, enemy.y, 10, 0xff4455, 0.85).setDepth(70);
            this.tweens.add({ targets: flash, alpha: 0, scale: 2.5, duration: 200, onComplete: () => flash.destroy() });
          } else {
            const ring = this.add.circle(enemy.x, enemy.y, 48, 0xff2244, 0.25).setStrokeStyle(4, 0xff8899, 0.95).setDepth(70);
            this.tweens.add({ targets: ring, alpha: 0, scale: 2.2, duration: 550, onComplete: () => ring.destroy() });

            const exclMark = this.add.text(enemy.x, enemy.y - 64, "!", {
              font: "900 30px Cinzel",
              color: "#ff2255",
              stroke: "#ffffff",
              strokeThickness: 4
            }).setOrigin(0.5).setDepth(72);
            this.tweens.add({
              targets: exclMark,
              y: enemy.y - 84,
              scale: { from: 0.6, to: 1.3 },
              alpha: { from: 1, to: 0 },
              duration: 750,
              ease: "Back.easeOut",
              onComplete: () => exclMark.destroy()
            });
          }
        }
      }
      if (enemy.phase === 2 && enemy.phaseTimer > 0) {
        enemy.sprite?.setTint(0xd8c2ff);
      } else if (enemy.phase === 3 && enemy.phaseTimer > 0) {
        enemy.sprite?.setTint(0xffb0c8);
      } else if (enemy.sprite && enemy.hitFlash > 0) {
        enemy.sprite.setTint(0xfff3d6);
      } else if (enemy.sprite && enemy.slow <= 0) {
        this.applyUnitTint(enemy.sprite);
      }
    }

    moveEnemy(enemy, dt) {
      let speed = enemy.speed * (enemy.slow > 0 ? 0.58 : 1);
      if (enemy.hp < enemy.maxHp * 0.3 && enemy.type === "brute") speed *= 1.18;
      let remaining = speed * dt;
      enemy.walkDist = (enemy.walkDist || 0) + remaining;
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

    updateEnemyVisual(enemy, dt) {
      enemy.sprite.setPosition(enemy.x, enemy.y);
      enemy.nameText.setPosition(enemy.x, enemy.y + 1);
      if (enemy.shieldRing) {
        if (this.settings?.reducedMotion) {
          enemy.shieldRing.destroy();
          enemy.shieldRing = null;
        } else {
          enemy.shieldRing.setPosition(enemy.x, enemy.y);
        }
      }
      enemy.sprite.setAlpha(enemy.slow > 0 ? 0.72 : 1);
      const baseScale = enemy.base.size / 30;
      const reducedMotion = !!this.settings?.reducedMotion;
      let pathAngle = 0;
      if (!enemy.blockedBy && enemy.seg < this.path.length - 1) {
        const next = this.path[enemy.seg + 1];
        pathAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, next.x, next.y) * 0.08;
        const dx = next.x - enemy.x;
        if (dx < -0.5) enemy.facingLeft = true;
        else if (dx > 0.5) enemy.facingLeft = false;
      } else if (enemy.blockedBy) {
        const dx = enemy.blockedBy.x - enemy.x;
        if (dx < -0.5) enemy.facingLeft = true;
        else if (dx > 0.5) enemy.facingLeft = false;
      }

      const isAnimated = ["scout", "brute", "shield", "ember", "brood", "flyer", "hexer", "titan"].includes(enemy.type);
      if (isAnimated || enemy.type === "boss") {
        enemy.sprite.setFlipX(!!enemy.facingLeft);
      }

      if (reducedMotion) {
        if (isAnimated) {
          const texKey = `enemy_${enemy.type}_w0`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
        } else if (enemy.type === "boss") {
          const texKey = this.textures.exists("enemy_boss_idle") ? "enemy_boss_idle" : "enemy_boss";
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
        }
        enemy.sprite.setScale(baseScale);
        enemy.sprite.rotation = (isAnimated || enemy.type === "boss") ? 0 : pathAngle;
      } else {
        const isFlyer = enemy.type === "flyer" || enemy.base?.flying;
        if (enemy.type === "scout") {
          const frameIdx = enemy.blockedBy ? 0 : Math.floor((enemy.walkDist || 0) / 4.2) % 4;
          const texKey = `enemy_scout_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            const t = this.time.now * 0.035 + enemy.wobble;
            enemy.sprite.y += Math.sin(this.time.now * 0.016 + enemy.wobble) * 0.4;
            enemy.sprite.rotation = Math.sin(t) * 0.22;
          } else {
            enemy.sprite.rotation = 0;
          }
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "brute") {
          const frameIdx = enemy.blockedBy ? 0 : Math.floor((enemy.walkDist || 0) / 5) % 4;
          const texKey = `enemy_brute_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            const t = this.time.now * 0.007 + enemy.wobble;
            enemy.sprite.y += Math.sin(t) * 0.8;
            enemy.sprite.rotation = Math.sin(this.time.now * 0.02 + enemy.wobble) * 0.15;
            const squash = Math.sin(t * 2);
            enemy.sprite.setScale(baseScale * (1 + squash * 0.08), baseScale * (1 - squash * 0.08));
          } else {
            enemy.sprite.rotation = 0;
            enemy.sprite.setScale(baseScale);
          }
        } else if (enemy.type === "shield") {
          const frameIdx = enemy.blockedBy ? 0 : Math.floor((enemy.walkDist || 0) / 7.5) % 4;
          const texKey = `enemy_shield_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            const t = this.time.now * 0.02 + enemy.wobble;
            enemy.sprite.rotation = Math.sin(t) * 0.15;
            enemy.sprite.y += Math.sin(this.time.now * 0.01 + enemy.wobble) * 0.3;
          } else {
            enemy.sprite.rotation = 0;
          }
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "ember") {
          const frameIdx = enemy.blockedBy
            ? Math.floor(this.time.now * 0.008 + enemy.wobble) % 4
            : Math.floor((enemy.walkDist || 0) / 6.5) % 4;
          const texKey = `enemy_ember_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          const floatY = Math.sin(this.time.now * 0.006 + enemy.wobble) * 1.5;
          enemy.sprite.y += floatY;
          enemy.sprite.rotation = enemy.blockedBy ? Math.sin(this.time.now * 0.025 + enemy.wobble) * 0.12 : 0;
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "brood") {
          const frameIdx = enemy.blockedBy ? 0 : Math.floor((enemy.walkDist || 0) / 6) % 4;
          const texKey = `enemy_brood_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            enemy.sprite.rotation = Math.sin(this.time.now * 0.03 + enemy.wobble) * 0.16;
            enemy.sprite.y += Math.sin(this.time.now * 0.015 + enemy.wobble) * 0.4;
          } else {
            enemy.sprite.rotation = 0;
          }
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "flyer" || isFlyer) {
          const frameIdx = Math.floor(this.time.now * 0.007 + enemy.wobble) % 4;
          const texKey = `enemy_flyer_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          const t = this.time.now * 0.005 + enemy.wobble;
          const floatY = Math.sin(t) * 3.5;
          const tilt = Math.sin(t * 0.8) * 0.06;
          enemy.sprite.y += floatY;
          enemy.sprite.rotation = enemy.blockedBy ? tilt * 1.5 : tilt;
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "hexer") {
          const frameIdx = enemy.blockedBy
            ? Math.floor(this.time.now * 0.005 + enemy.wobble) % 4
            : Math.floor((enemy.walkDist || 0) / 7) % 4;
          const texKey = `enemy_hexer_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            enemy.sprite.rotation = Math.sin(this.time.now * 0.02 + enemy.wobble) * 0.14;
            enemy.sprite.y += Math.sin(this.time.now * 0.01 + enemy.wobble) * 0.4;
          } else {
            enemy.sprite.rotation = 0;
          }
          enemy.sprite.setScale(baseScale);
        } else if (enemy.type === "titan") {
          const frameIdx = enemy.blockedBy ? 0 : Math.floor((enemy.walkDist || 0) / 9) % 4;
          const texKey = `enemy_titan_w${frameIdx}`;
          if (enemy.sprite.texture.key !== texKey && this.textures.exists(texKey)) {
            enemy.sprite.setTexture(texKey);
          }
          if (enemy.blockedBy) {
            const t = this.time.now * 0.006 + enemy.wobble;
            enemy.sprite.y += Math.sin(t) * 0.6;
            enemy.sprite.rotation = Math.sin(this.time.now * 0.015 + enemy.wobble) * 0.1;
            const squash = Math.sin(t * 2);
            enemy.sprite.setScale(baseScale * (1 + squash * 0.06), baseScale * (1 - squash * 0.06));
          } else {
            enemy.sprite.rotation = 0;
            enemy.sprite.setScale(baseScale);
          }
        } else if (enemy.type === "boss") {
          const phase = enemy.phase || 1;
          const phaseKey = phase === 3 ? "enemy_boss_rage" : phase === 2 ? "enemy_boss_shield" : "enemy_boss_idle";
          const fallbackKey = "enemy_boss";
          const targetKey = this.textures.exists(phaseKey) ? phaseKey : fallbackKey;
          if (enemy.sprite.texture.key !== targetKey && this.textures.exists(targetKey)) {
            enemy.sprite.setTexture(targetKey);
          }
          const bob = Math.sin(this.time.now * 0.006 + enemy.wobble);
          enemy.sprite.y += bob * (enemy.blockedBy ? 0.5 : 1.0);
          if (enemy.blockedBy) {
            enemy.sprite.rotation = Math.sin(this.time.now * 0.02 + enemy.wobble) * 0.08;
            const squash = Math.sin(this.time.now * 0.012 + enemy.wobble) * 0.03;
            enemy.sprite.setScale(baseScale * (1 + squash), baseScale * (1 - squash));
          } else {
            enemy.sprite.rotation = 0;
            enemy.sprite.setScale(baseScale);
          }
        } else {
          const bob = Math.sin(this.time.now * 0.008 + enemy.wobble);
          enemy.sprite.y += bob * (enemy.blockedBy ? 0.6 : 1.2);
          if (enemy.blockedBy) {
            enemy.sprite.rotation = Math.sin(this.time.now * 0.03 + enemy.wobble) * 0.18;
            enemy.sprite.setScale(baseScale * (1 + Math.sin(this.time.now * 0.04) * 0.04));
          } else {
            enemy.sprite.rotation = pathAngle;
            enemy.sprite.setScale(baseScale);
          }
        }
      }
      if (enemy.slow > 0) {
        enemy.sprite.setTint(0xaaddff);
        if (!enemy.iceTimer || enemy.iceTimer <= 0) {
          for (let i = 0; i < 2; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const dist = enemy.base.size * 0.6 + Math.random() * 4;
            const ice = this.add.circle(
              enemy.x + Math.cos(angle) * dist,
              enemy.y - enemy.base.size / 2 + Math.sin(angle) * dist,
              1.5 + Math.random(),
              0xaaddff, 0.7
            ).setDepth(45);
            this.effects.push({ obj: ice, life: 0.3 + Math.random() * 0.2, vx: Math.cos(angle) * 15, vy: -20 - Math.random() * 15 });
          }
          enemy.iceTimer = 0.2;
        }
      } else if (enemy.type === "boss" || enemy.base?.phases) {
        if (enemy.phase === 2 && enemy.phaseTimer > 0) {
          enemy.sprite.setTint(0xd8c2ff);
        } else if (enemy.phase === 3 && enemy.phaseTimer > 0) {
          enemy.sprite.setTint(0xffb0c8);
        } else {
          this.applyUnitTint(enemy.sprite);
        }
      } else {
        if (enemy.hp < enemy.maxHp * 0.35) {
          enemy.sprite.setTint(0xffb0a0);
        } else if (enemy.type === "drift") {
          enemy.sprite.setTint(0xb8e8ff);
        } else if (enemy.type === "mage" || enemy.type === "wizard") {
          enemy.sprite.setTint(0xc8b0ff);
        } else {
          this.applyUnitTint(enemy.sprite);
        }
      }
      enemy.iceTimer = Math.max(0, (enemy.iceTimer || 0) - dt);
      // Smooth health bar: tween width and color transition
      const hpRatio = enemy.hp / enemy.maxHp;
      const targetWidth = 28 * hpRatio;
      if (Math.abs(enemy.bar.width - targetWidth) > 0.5) {
        enemy.bar.width = Phaser.Math.Linear(enemy.bar.width, targetWidth, Math.min(1, dt * 6));
      }
      enemy.barBg.setPosition(enemy.x, enemy.y - enemy.base.size - 8);
      enemy.bar.setPosition(enemy.x - 14, enemy.y - enemy.base.size - 8);
      // Color transition: green → yellow → red with smooth interpolation
      let targetColor;
      if (hpRatio > 0.65) {
        const t = Math.min(1, (hpRatio - 0.65) / 0.35);
        targetColor = Phaser.Math.Linear(0x68d764, 0xf0c35a, 1 - t);
      } else if (hpRatio > 0.35) {
        const t = Math.min(1, (hpRatio - 0.35) / 0.3);
        targetColor = Phaser.Math.Linear(0xf0c35a, 0xff6b5a, 1 - t);
      } else {
        targetColor = 0xff6b5a;
      }
      enemy.bar.fillColor = targetColor;
      // Trait badge glow pulse
      if (enemy.traitGlow) {
        enemy.traitGlow.setPosition(enemy.x, enemy.y - enemy.base.size - 16);
        const pulse = Math.sin(this.time.now * 0.005 + enemy.wobble) * 0.04 + 0.06;
        enemy.traitGlow.alpha = pulse;
      }
      if (enemy.traitText) {
        enemy.traitText.setPosition(enemy.x, enemy.y - enemy.base.size - 16);
        enemy.traitText.setVisible(!!enemy.traitText.text);
      }
      if (enemy.hexMark) {
        enemy.hexMark.setPosition(enemy.x, enemy.y - enemy.base.size - 25);
        if (!reducedMotion) {
          enemy.hexMark.y += Math.sin(this.time.now * 0.006 + enemy.wobble) * 2;
        }
      }
      if (enemy.crownTell) {
        enemy.crownTell.setPosition(enemy.x, enemy.sprite ? enemy.sprite.y : enemy.y - 4);
        if (!reducedMotion && enemy.sprite) {
          enemy.crownTell.setRotation(enemy.sprite.rotation);
          enemy.crownTell.setScale(enemy.sprite.scaleX, enemy.sprite.scaleY);
        } else if (enemy.sprite) {
          enemy.crownTell.setRotation(enemy.sprite.rotation);
          enemy.crownTell.setScale(baseScale);
        }
      }
      if (enemy.emberGlow) {
        enemy.emberGlow.setPosition(enemy.x, enemy.y);
        if (!reducedMotion) {
          const tick = Math.abs(Math.sin(this.time.now * 0.01 + enemy.wobble));
          enemy.emberGlow.setAlpha(0.2 + tick * 0.35);
          enemy.emberGlow.setScale(0.9 + tick * 0.25);
        } else {
          enemy.emberGlow.setAlpha(0.3);
          enemy.emberGlow.setScale(1);
        }
      }
      if (enemy.fuseSpark) {
        const headY = enemy.sprite ? enemy.sprite.y - enemy.base.size * 0.7 : enemy.y - enemy.base.size;
        if (!reducedMotion) {
          const jitterX = (Math.random() - 0.5) * 3;
          const jitterY = (Math.random() - 0.5) * 3;
          enemy.fuseSpark.setPosition(enemy.x + jitterX, headY + jitterY);
          enemy.fuseSpark.setAlpha(0.6 + Math.random() * 0.4);
          if (Math.random() < 0.25) {
            const spark = this.textures.exists("fx_spark")
              ? this.add.image(enemy.x + jitterX, headY + jitterY, "fx_spark").setScale(0.32).setTint(0xffea00).setAlpha(0.95).setDepth(42)
              : this.add.circle(enemy.x + jitterX, headY + jitterY, 1.5, 0xffea00, 0.9).setDepth(42);
            if (spark.setAngle) spark.setAngle(Math.random() * 360);
            this.tweens.add({
              targets: spark,
              x: spark.x + (Math.random() - 0.5) * 12,
              y: spark.y - 6 - Math.random() * 8,
              alpha: 0,
              scale: 0.1,
              duration: 180 + Math.random() * 120,
              onComplete: () => spark.destroy(),
            });
          }
        } else {
          enemy.fuseSpark.setPosition(enemy.x, headY);
          enemy.fuseSpark.setAlpha(0.85);
        }
      }
      this.syncEnemyMaterials(enemy);
    }

    syncEnemyMaterials(enemy) {
      const size = enemy.base?.size || 16;
      const armor = (enemy.base?.armor || 0) + (enemy.armorBuff || 0);
      const slowed = (enemy.slow || 0) > 0;
      const burning = !!(enemy.base?.burn || (enemy.burnTime || 0) > 0);
      if (!enemy.frostCrust) {
        enemy.frostCrust = this.add.circle(enemy.x, enemy.y + 4, size * 0.55, 0xaee9ff, 0.22)
          .setStrokeStyle(2, 0xd8f6ff, 0.55).setDepth(41);
      }
      if (!enemy.armorPlate) {
        enemy.armorPlate = this.add.circle(enemy.x, enemy.y - 2, size * 0.62, 0xb7bfca, 0.0)
          .setStrokeStyle(2.5, 0xe8eef4, 0.7).setDepth(41.2);
      }
      if (!enemy.burnCrust) {
        enemy.burnCrust = this.add.circle(enemy.x, enemy.y + 3, size * 0.5, 0xff623d, 0.28)
          .setStrokeStyle(1.5, 0xffd07a, 0.65).setDepth(39.5);
      }
      enemy.frostCrust.setPosition(enemy.x, enemy.y + 4).setVisible(slowed);
      enemy.armorPlate.setPosition(enemy.x, enemy.y - 2).setVisible(armor >= 3);
      enemy.burnCrust.setPosition(enemy.x, enemy.y + 3).setVisible(burning);
      if (this.settings?.reducedMotion) {
        enemy.frostCrust.setAlpha(slowed ? 0.35 : 0);
        enemy.armorPlate.setAlpha(armor >= 3 ? 0.8 : 0);
        enemy.burnCrust.setAlpha(burning ? 0.4 : 0);
      } else {
        const t = this.time.now * 0.008;
        if (slowed) enemy.frostCrust.setAlpha(0.18 + Math.sin(t) * 0.06);
        if (armor >= 3) enemy.armorPlate.setAlpha(0.55 + Math.sin(t * 0.7) * 0.12);
        if (burning) enemy.burnCrust.setScale(1 + Math.sin(t * 1.4) * 0.08);
      }
    }

    leakEnemy(enemy) {
      this.lives -= enemy.base.leak;
      this.audio.play("impact", 0.45, 0.82);
      this.audio.play("fail", 0.2, 0.88);
      this.triggerGateLeak(enemy);
      this.removeEnemy(enemy, false);
      this.flashText("-" + enemy.base.leak, 360, 88, "#ff8069");
      if (this.lives <= 0) this.endGame(false);
    }

    triggerGateLeak(enemy) {
      const gx = this.gateImage ? this.gateImage.x : MAP_LAYOUT.gateX;
      const gy = this.gateImage ? this.gateImage.y : MAP_LAYOUT.gateY;

      // 1. Gate leak overlay breach flash directly on the gate art
      if (this.gateLeakOverlay) {
        this.tweens.killTweensOf(this.gateLeakOverlay);
        this.gateLeakOverlay.setAlpha(1.0);
        this.tweens.add({
          targets: this.gateLeakOverlay,
          alpha: 0,
          duration: this.settings?.reducedMotion ? 260 : 520,
          ease: "Quad.easeOut",
        });
      }

      // 2. Gate set-piece shudder & impact tint
      if (this.gateImage) {
        this.gateImage.setTint(0xff4444);
        if (!this.settings?.reducedMotion) {
          const baseScale = this.gateImage.scaleX || 1.15;
          this.tweens.killTweensOf(this.gateImage);
          this.gateImage.setScale(baseScale * 1.08);
          this.tweens.add({
            targets: this.gateImage,
            scaleX: baseScale,
            scaleY: baseScale,
            duration: 300,
            ease: "Back.easeOut",
            onComplete: () => {
              this.gateImage?.clearTint();
            },
          });
        } else {
          this.time.delayedCall(200, () => {
            this.gateImage?.clearTint();
          });
        }
      }

      // 3. Floating breach penalty directly at the gate door
      this.flashText("-" + enemy.base.leak, gx - 14, gy - 26, "#ff4040");

      // 4. Breach shockwave & spark explosion into the lane
      if (!this.settings?.reducedMotion) {
        const shockRing = this.add.circle(gx, gy, 10, 0xff2a10, 0.45).setStrokeStyle(3, 0xff9922, 1).setDepth(60);
        this.tweens.add({
          targets: shockRing,
          scale: 2.6,
          alpha: 0,
          duration: 420,
          ease: "Quad.easeOut",
          onComplete: () => shockRing.destroy(),
        });

        for (let i = 0; i < 7; i += 1) {
          const spark = this.textures.exists("fx_spark")
            ? this.add.image(gx - 6 + (Math.random() - 0.5) * 12, gy + (Math.random() - 0.5) * 12, "fx_spark").setScale(0.35 + Math.random() * 0.2).setTint(0xffe066).setAlpha(0.95).setDepth(61)
            : this.add.circle(gx - 6 + (Math.random() - 0.5) * 12, gy + (Math.random() - 0.5) * 12, 1.8 + Math.random() * 1.6, 0xffe066, 0.95).setDepth(61);
          if (spark.setAngle) spark.setAngle(Math.random() * 360);
          const angle = Math.PI * (0.65 + Math.random() * 0.7);
          const dist = 35 + Math.random() * 60;
          this.tweens.add({
            targets: spark,
            x: spark.x + Math.cos(angle) * dist,
            y: spark.y + Math.sin(angle) * dist,
            alpha: 0,
            scale: 0.1,
            duration: 320 + Math.random() * 180,
            ease: "Quad.easeOut",
            onComplete: () => spark.destroy(),
          });
        }

        for (let i = 0; i < 8; i += 1) {
          const splinter = this.textures.exists("fx_dust")
            ? this.add.image(gx, gy, "fx_dust").setScale(0.24 + Math.random() * 0.18).setTint(0x6a4428).setAlpha(0.9).setDepth(61)
            : this.add.rectangle(gx, gy, 4 + Math.random() * 3, 2 + Math.random() * 2, 0x6a4428).setDepth(61);
          if (splinter.setAngle) splinter.setAngle(Math.random() * 360);
          const angle = Math.PI * (1.0 + Math.random() * 0.45);
          const speed = 40 + Math.random() * 60;
          const life = 0.4 + Math.random() * 0.3;
          this.effects.push({
            obj: splinter,
            life,
            maxLife: life,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
          });
        }

        this.cameras.main.shake(130, 0.006);
      }
    }

    damageEnemy(enemy, amount, source = {}) {
      if (enemy.dead) return;
      if (source.fire) enemy.burnTime = Math.max(enemy.burnTime || 0, 1.1);
      let damage = amount;
      const armor = (enemy.base.armor || 0) + (enemy.armorBuff || 0);
      if (!source.magic) damage = Math.max(1, amount - armor * 3);
      if (enemy.type === "titan" || enemy.type === "boss") damage *= 0.86;
      if (enemy.type === "boss" && enemy.phase === 2 && enemy.phaseTimer > 0 && !source.magic) damage *= 0.55;
      enemy.hp -= damage;
      enemy.lastHit = source;
      // Hit sparks on damage (not for tiny amounts)
      if (damage >= 5 && !enemy.dead) {
        this.createHitSparks(enemy.x, enemy.y - 8, source.magic ? 0xc8b0ff : 0xfff0c0);
        this.createDamageNumber(enemy.x, enemy.y - enemy.base.size, `-${damage}`, source.magic ? "#c8b0ff" : "#fff2ba");
        if (enemy.sprite && !this.settings?.reducedMotion) {
          enemy.hitFlash = 0.09;
          enemy.sprite.setTint(0xfff3d6);
          const sx = enemy.sprite.scaleX || 1;
          const sy = enemy.sprite.scaleY || 1;
          this.tweens.add({
            targets: enemy.sprite,
            scaleX: sx * 1.14,
            scaleY: sy * 0.88,
            duration: 70,
            yoyo: true,
            ease: "Quad.easeOut",
          });
        }
      }
      if (enemy.hp <= 0) {
        const burn = enemy.base.burn;
        const split = enemy.base.split;
        const x = enemy.x;
        const y = enemy.y;
        this.gold += enemy.base.bounty;
        if (source.hero) this.addHeroXp(enemy.base.bounty);
        this.flashText(`+${enemy.base.bounty}`, x, y - 22, COLORS.gold);
        this.createDamageNumber(x, y - enemy.base.size - 10, `+${enemy.base.bounty}`, COLORS.gold);
        this.createCoinBurst(x, y - 18);
        const now = this.time.now;
        this.killStreak = now < (this.killStreakUntil || 0) ? (this.killStreak || 0) + 1 : 1;
        this.killStreakUntil = now + 1600;
        this.showKillPop(x, y, enemy.base.size, this.killStreak);
        this.removeEnemy(enemy, true);
        if (split) {
          const [childType, count] = split;
          for (let i = 0; i < count; i += 1) this.spawnEnemyFrom(childType, enemy);
          this.flashText("BROOD SPLIT", x, y - 38, "#f2bbd0");
          if (this.settings?.reducedMotion) {
            const flash = this.add.circle(x, y, 8, 0xf2bbd0, 0.85).setDepth(70);
            this.tweens.add({ targets: flash, alpha: 0, scale: 2.5, duration: 200, onComplete: () => flash.destroy() });
          } else {
            const burstRing = this.add.circle(x, y, 16, 0xff69b4, 0.35).setStrokeStyle(3, 0xf2bbd0, 0.95).setDepth(70);
            this.tweens.add({ targets: burstRing, alpha: 0, scale: 2.8, duration: 450, ease: "Quad.easeOut", onComplete: () => burstRing.destroy() });
          }
        }
        if (burn) this.explode(x, y, 38, 24, true);
      }
    }

    removeEnemy(enemy, killed) {
      this.entityRegistry.transition(enemy, killed ? "dead" : "leaked");
      enemy.dead = true;
      for (const obj of [
        enemy.nameText, enemy.barBg, enemy.bar, enemy.traitText, enemy.traitGlow,
        enemy.auraRing, enemy.shieldRing, enemy.hexMark, enemy.crownTell,
        enemy.emberGlow, enemy.fuseSpark,
        enemy.frostCrust, enemy.armorPlate, enemy.burnCrust
      ]) obj?.destroy();
      enemy.shieldRing = null;
      enemy.auraRing = null;
      enemy.hexMark = null;
      enemy.crownTell = null;
      enemy.emberGlow = null;
      enemy.fuseSpark = null;
      enemy.frostCrust = null;
      enemy.armorPlate = null;
      enemy.burnCrust = null;
      if (enemy.speedLines) {
        for (const line of enemy.speedLines) line?.destroy();
        enemy.speedLines = null;
      }
      this.enemies = this.enemies.filter((e) => e !== enemy);
      this.entityRegistry.transition(enemy, "removed");
      if (killed) {
        this.audio.playLayered("enemyDeath");
        const sprite = enemy.sprite;
        enemy.sprite = null;
        const family = enemy.type;
        const isFlyer = family === "flyer" || enemy.base?.flying;
        const deadKey = `enemy_${family}_dead`;
        if (sprite) {
          if (this.textures.exists(deadKey)) {
            sprite.setTexture(deadKey);
          }
          this.applyUnitTint(sprite);
          if (enemy.base?.color) sprite.setTint(enemy.base.color);
        }
        const corpse = this.recordAftermath("corpse", enemy.x, enemy.y, sprite?.rotation || 0, family);
        if (sprite) this.trackAftermathMark(sprite, "corpse", corpse?.t);
        if (isFlyer && enemy.lastHit?.family === "archer") {
          this.stampSpentArrow(enemy.x, enemy.y, enemy.lastHit.rot || sprite?.rotation || 0);
        }

        if (this.settings?.reducedMotion) {
          if (sprite) {
            sprite.rotation = 0;
            this.fadeCorpse(sprite);
          } else {
            this.puff(enemy.x, enemy.y, enemy.base?.color);
          }
          return;
        }
        if (family === "scout") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 15) / 30;
            sprite.setScale(baseScale);
            this.puff(enemy.x, enemy.y + 2, enemy.base?.color);
            sprite.setDepth(9);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 6,
              rotation: sprite.flipX ? -0.18 : 0.18,
              duration: 160,
              ease: "Quad.easeIn",
              onComplete: () => {
                this.fadeCorpse(sprite, 2200);
              },
            });
          }
        } else if (family === "brute") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 18) / 30;
            sprite.setScale(baseScale);
            const startY = sprite.y;
            const ex = enemy.x;
            this.tweens.add({
              targets: sprite,
              y: startY + 6,
              duration: 180,
              ease: "Quad.easeIn",
              onComplete: () => {
                const dustY = startY + 6;
                for (let i = 0; i < 5; i += 1) {
                  const dir = i % 2 === 0 ? 1 : -1;
                  const dust = this.textures.exists("fx_dust")
                    ? this.add.image(ex, dustY, "fx_dust").setScale(0.3 + Math.random() * 0.2).setTint(0xd0c4b4).setAlpha(0.75).setDepth(76)
                    : this.add.circle(ex, dustY, 2 + Math.random() * 2, 0xd0c4b4, 0.7).setDepth(76);
                  if (dust.setAngle) dust.setAngle(Math.random() * 360);
                  this.effects.push({
                    obj: dust,
                    life: 0.35 + Math.random() * 0.15,
                    vx: dir * (20 + Math.random() * 40),
                    vy: -8 - Math.random() * 12,
                  });
                }
                this.fadeCorpse(sprite);
              },
            });
            if ((enemy.base?.size || 0) >= 20) {
              this.cameras.main.shake(120, 0.006);
            }
          }
        } else if (family === "shield") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 20) / 30;
            sprite.setScale(baseScale);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 4,
              rotation: sprite.flipX ? -0.15 : 0.15,
              duration: 150,
              ease: "Quad.easeOut",
              onComplete: () => {
                for (let i = 0; i < 3; i += 1) {
                  const spark = this.textures.exists("fx_spark")
                    ? this.add.image(enemy.x + (Math.random() - 0.5) * 16, enemy.y + (Math.random() - 0.5) * 8, "fx_spark").setScale(0.3).setTint(0xfff0b0).setAlpha(0.95).setDepth(76)
                    : this.add.circle(enemy.x + (Math.random() - 0.5) * 16, enemy.y + (Math.random() - 0.5) * 8, 1.5, 0xfff0b0, 0.9).setDepth(76);
                  if (spark.setAngle) spark.setAngle(Math.random() * 360);
                  this.effects.push({ obj: spark, life: 0.25, vx: (Math.random() - 0.5) * 30, vy: -15 - Math.random() * 15 });
                }
                this.fadeCorpse(sprite);
              },
            });
          }
        } else if (family === "ember") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 17) / 30;
            sprite.setScale(baseScale);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 4,
              duration: 150,
              ease: "Quad.easeIn",
              onComplete: () => {
                for (let i = 0; i < 4; i += 1) {
                  const smoke = this.add.circle(enemy.x + (Math.random() - 0.5) * 14, enemy.y - 2, 2 + Math.random() * 2, 0x504038, 0.6).setDepth(76);
                  this.effects.push({ obj: smoke, life: 0.4 + Math.random() * 0.2, vx: (Math.random() - 0.5) * 15, vy: -20 - Math.random() * 15 });
                }
                this.fadeCorpse(sprite);
              },
            });
          }
        } else if (family === "brood") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 16) / 30;
            sprite.setScale(baseScale);
            this.puff(enemy.x, enemy.y, enemy.base?.color);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 4,
              duration: 160,
              ease: "Quad.easeIn",
              onComplete: () => {
                this.fadeCorpse(sprite);
              },
            });
          }
        } else if (isFlyer) {
          if (sprite) {
            const baseScale = (enemy.base?.size || 15) / 30;
            sprite.setScale(baseScale);
            const startY = sprite.y;
            this.tweens.add({
              targets: sprite,
              y: startY + 16,
              rotation: sprite.flipX ? -0.2 : 0.2,
              duration: 220,
              ease: "Quad.easeIn",
              onComplete: () => {
                this.puff(enemy.x, startY + 16, 0x73d9ff);
                this.fadeCorpse(sprite, 420, 500);
              },
            });
          }
        } else if (family === "hexer") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 18) / 30;
            sprite.setScale(baseScale);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 5,
              duration: 180,
              ease: "Quad.easeIn",
              onComplete: () => {
                for (let i = 0; i < 4; i += 1) {
                  const spark = this.textures.exists("fx_spark")
                    ? this.add.image(enemy.x + (Math.random() - 0.5) * 16, enemy.y + (Math.random() - 0.5) * 8, "fx_spark").setScale(0.35).setTint(0xd090ff).setAlpha(0.9).setDepth(76)
                    : this.add.circle(enemy.x + (Math.random() - 0.5) * 16, enemy.y + (Math.random() - 0.5) * 8, 1.8, 0xd090ff, 0.85).setDepth(76);
                  if (spark.setAngle) spark.setAngle(Math.random() * 360);
                  this.effects.push({ obj: spark, life: 0.35 + Math.random() * 0.15, vx: (Math.random() - 0.5) * 25, vy: -20 - Math.random() * 15 });
                }
                this.fadeCorpse(sprite);
              },
            });
          }
        } else if (family === "titan") {
          if (sprite) {
            const baseScale = (enemy.base?.size || 24) / 30;
            sprite.setScale(baseScale);
            const startY = sprite.y;
            const ex = enemy.x;
            this.tweens.add({
              targets: sprite,
              y: startY + 6,
              duration: 200,
              ease: "Quad.easeIn",
              onComplete: () => {
                for (let i = 0; i < 8; i += 1) {
                  const rock = this.textures.exists("fx_dust")
                    ? this.add.image(ex + (Math.random() - 0.5) * 24, startY + 6 + (Math.random() - 0.5) * 8, "fx_dust").setScale(0.28 + Math.random() * 0.2).setTint(0x888078).setAlpha(0.85).setDepth(76)
                    : this.add.circle(ex + (Math.random() - 0.5) * 24, startY + 6 + (Math.random() - 0.5) * 8, 1.8 + Math.random() * 2, 0x888078, 0.85).setDepth(76);
                  if (rock.setAngle) rock.setAngle(Math.random() * 360);
                  this.effects.push({
                    obj: rock,
                    life: 0.4 + Math.random() * 0.2,
                    vx: (Math.random() - 0.5) * 60,
                    vy: -15 - Math.random() * 25,
                  });
                }
                this.cameras.main.shake(140, 0.008);
                this.fadeCorpse(sprite, 720, 520);
              },
            });
          }
        } else {
          const size = enemy.base?.size || 16;
          this.puff(enemy.x, enemy.y, enemy.base?.color);
          const stain = this.add.ellipse(enemy.x, enemy.y + 6, 16 + size * 0.35, 7, 0x2a1810, 0.32).setDepth(-12);
          this.worldStains = this.worldStains || [];
          this.worldStains.push(stain);
          if (this.worldStains.length > 22) {
            const old = this.worldStains.shift();
            old?.destroy?.();
          }
          const ring = this.add.circle(enemy.x, enemy.y, 4, enemy.base?.color, 0.6).setStrokeStyle(2, "#fff8c0", 0.9).setDepth(75);
          this.tweens.add({ targets: ring, alpha: 0, scale: size / 8 + 1.5, duration: 280, onComplete: () => ring.destroy() });
          const debrisCount = Math.min(12, 4 + size / 3);
          for (let i = 0; i < debrisCount; i += 1) {
            const angle = (i / debrisCount) * Math.PI * 2 + Math.random() * 0.3;
            const speed = 50 + Math.random() * 80;
            const debris = this.add.circle(enemy.x, enemy.y, 1.5 + Math.random() * 2.5, enemy.base?.color, 0.8).setDepth(76);
            this.effects.push({ obj: debris, life: 0.3 + Math.random() * 0.2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30 });
          }
          if (size >= 20) {
            this.cameras.main.shake(120, 0.006);
          }
          if (sprite) {
            const baseScale = size / 30;
            sprite.setScale(baseScale);
            this.tweens.add({
              targets: sprite,
              y: sprite.y + 4,
              duration: 160,
              ease: "Quad.easeIn",
              onComplete: () => this.fadeCorpse(sprite),
            });
          }
        }
      } else {
        enemy.sprite?.destroy();
      }
    }

    updateTowers(dt) {
      for (const tower of this.towers) {
        const cfg = TOWERS[tower.type];
        if (window.KRCTowerAbilities) {
          tower.abilityCooldown = window.KRCTowerAbilities.tickCooldown(tower.abilityCooldown, dt);
        }
        if (tower.hexed && tower.sprite) {
          if (this.settings?.reducedMotion || Math.floor(this.time.now / 180) % 2 === 0) {
            tower.sprite.setTint(0xb49cff);
          } else {
            this.applyUnitTint(tower.sprite);
          }
        } else if (tower.sprite) {
          this.applyUnitTint(tower.sprite);
        }
        if (tower.type === "barracks") {
          this.updateBarracks(tower, dt);
          continue;
        }
        tower.cooldown -= dt * (this.rallyTime > 0 ? 1.28 : 1) * (tower.hexed ? Math.max(0.45, 1 - (tower.hexPenalty || 0.3)) : 1);
        // Hex visual: purple crackle particles around hexed tower
        if (tower.hexed && tower.sprite) {
          if (!tower.hexTimer || tower.hexTimer <= 0) {
            for (let i = 0; i < 3; i += 1) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 15 + Math.random() * 10;
              const crackle = this.add.circle(
                tower.x + Math.cos(angle) * dist,
                tower.y - 8 + Math.sin(angle) * dist,
                1.5 + Math.random() * 1.5,
                0xb49cff, 0.8
              ).setDepth(35);
              this.effects.push({ obj: crackle, life: 0.2 + Math.random() * 0.15, vx: Math.cos(angle) * 30, vy: -25 - Math.random() * 15 });
            }
            tower.hexTimer = 0.15;
          }
        } else {
          tower.hexTimer = 0;
        }
        tower.hexTimer = Math.max(0, (tower.hexTimer || 0) - dt);
        if (tower.sprite && !tower.hexed && !this.settings?.reducedMotion && !this.tweens.isTweening(tower.sprite)) {
          const t = this.time.now;
          const baseX = tower.x;
          const baseY = tower.y - 8;
          if (tower.type === "archer") {
            tower.sprite.x = baseX + Math.sin(t * 0.003 + baseX) * 0.6;
            tower.sprite.y = baseY;
          } else if (tower.type === "mage") {
            tower.sprite.x = baseX;
            tower.sprite.y = baseY + Math.sin(t * 0.004 + baseX) * 0.9;
          } else if (tower.type === "artillery") {
            tower.sprite.x = baseX;
            tower.sprite.y = baseY + Math.sin(t * 0.002 + baseX) * 0.5;
          }
        }
        if (tower.cooldown > 0) continue;
        const target = this.findTarget(tower, this.scaledTowerStat(tower, "range"), tower.type !== "artillery");
        if (!target) continue;
        tower.cooldown = this.scaledTowerStat(tower, "rate");
        this.fireTower(tower, target);
        const extraShots = (tower.spec?.bonus?.shots || 1) - 1;
        for (let s = 0; s < extraShots; s += 1) this.fireTower(tower, target);
        this.tryTowerAbility(tower, target);
      }
      this.rallyTime = Math.max(0, (this.rallyTime || 0) - dt);
      if (this.selectedPad?.tower) this.updateUpgradeLabel();
    }

    fadeCorpse(sprite) {
      if (!sprite) return;
      sprite.setDepth(9);
      const reduced = !!this.settings?.reducedMotion;
      const fadeMs = reduced ? 2000 : 4000;
      const delayMs = reduced ? 2000 : 21000;
      const sx = sprite.scaleX || 1;
      const sy = sprite.scaleY || 1;
      this.tweens.killTweensOf(sprite);
      this.tweens.add({
        targets: sprite,
        scaleX: sx * 0.96,
        scaleY: sy * 0.72,
        duration: Math.min(420, delayMs || 200),
        ease: "Quad.easeOut",
      });
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        delay: delayMs,
        duration: fadeMs,
        ease: "Linear",
        onComplete: () => sprite.destroy(),
      });
    }

    recordAftermath(kind, x, y, rot, kind2) {
      if (!this.aftermathLedger) this.aftermathLedger = new AftermathLedger(48);
      const stored = this.aftermathLedger.record({ kind, x, y, rot: rot || 0, kind2: kind2 || null });
      this.syncAftermathVisuals();
      return stored;
    }

    trackAftermathMark(obj, kind, t) {
      if (!obj) return;
      this.aftermathMarks = this.aftermathMarks || [];
      this.aftermathMarks.push({ obj, kind, t });
    }

    syncAftermathVisuals() {
      if (!this.aftermathLedger) return;
      const live = new Set(this.aftermathLedger.entries.map((entry) => entry.t));
      const kept = [];
      for (const mark of this.aftermathMarks || []) {
        if (mark?.obj && live.has(mark.t) && mark.obj.active !== false) kept.push(mark);
        else if (mark?.obj && mark.obj.active !== false) mark.obj.destroy?.();
      }
      this.aftermathMarks = kept;
    }

    stampSpellScorch(x, y, kind2) {
      const reduced = !!this.settings?.reducedMotion;
      const linger = reduced ? 6000 : 60000;
      const fadeMs = reduced ? 2000 : 4000;
      const g = this.add.graphics().setDepth(-12);
      if (kind2 === "frost" || kind2 === "ice") {
        g.fillStyle(0x1a3040, 0.42);
        g.fillEllipse(x, y + 6, 52, 20);
        g.fillStyle(0x4a7088, 0.16);
        g.fillEllipse(x, y + 4, 26, 10);
      } else {
        g.fillStyle(0x1a1008, 0.5);
        g.fillEllipse(x, y + 8, 52, 22);
        g.fillStyle(0x3a2010, 0.22);
        g.fillEllipse(x, y + 6, 28, 12);
      }
      const stored = this.recordAftermath("scorch", x, y, 0, kind2);
      this.trackAftermathMark(g, "scorch", stored?.t);
      this.worldStains = this.worldStains || [];
      this.worldStains.push(g);
      if (this.worldStains.length > 12) {
        const old = this.worldStains.shift();
        old?.destroy?.();
      }
      this.tweens.add({
        targets: g,
        alpha: 0,
        delay: Math.max(0, linger - fadeMs),
        duration: fadeMs,
        ease: "Linear",
        onComplete: () => g.destroy(),
      });
    }

    stampSpentArrow(x, y, rot) {
      const reduced = !!this.settings?.reducedMotion;
      const linger = reduced ? 6000 : 60000;
      const fadeMs = reduced ? 2000 : 4000;
      const key = this.textures.exists("projectile_arrow") ? "projectile_arrow" : null;
      const dart = key
        ? this.add.image(x, y + 4, key).setDepth(8).setScale(0.42).setRotation(rot || 0).setAlpha(0.9)
        : this.add.rectangle(x, y + 4, 10, 3, 0xf8e8a0, 0.9).setDepth(8).setRotation(rot || 0);
      const stored = this.recordAftermath("arrow", x, y, rot || 0, "flyer");
      this.trackAftermathMark(dart, "arrow", stored?.t);
      this.tweens.add({
        targets: dart,
        alpha: 0,
        delay: Math.max(0, linger - fadeMs),
        duration: fadeMs,
        ease: "Linear",
        onComplete: () => dart.destroy(),
      });
    }

    trimAftermath(maxKeep = 24) {
      if (!this.aftermathLedger) return;
      this.aftermathLedger.capTo(maxKeep);
      this.syncAftermathVisuals();
      this.accelerateAftermathFades();
    }

    accelerateAftermathFades() {
      const dur = this.settings?.reducedMotion ? 400 : 900;
      for (const mark of this.aftermathMarks || []) {
        if (!mark?.obj) continue;
        this.tweens.killTweensOf(mark.obj);
        this.tweens.add({
          targets: mark.obj,
          alpha: 0,
          duration: dur,
          ease: "Quad.easeOut",
          onComplete: () => mark.obj.destroy?.(),
        });
      }
    }

    clearAftermath(resetLedger) {
      for (const mark of this.aftermathMarks || []) mark?.obj?.destroy?.();
      this.aftermathMarks = [];
      if (resetLedger) this.aftermathLedger = new AftermathLedger(48);
    }

    flashTowerFirePose(tower, duration) {
      if (!tower || !tower.sprite || this.settings?.reducedMotion) return;
      const type = tower.type;
      const fireKey = `tower_${type}_fire`;
      const idleKey = this.getTowerTextureKey(tower);
      if (!this.textures.exists(fireKey)) return;
      const looks = {
        archer: { duration: 220, color: 0xc8f08a, r: 8, shake: 0 },
        mage: { duration: 340, color: 0xb49cff, r: 16, shake: 0 },
        artillery: { duration: 300, color: 0xff7a3a, r: 20, shake: 0.004 },
        barracks: { duration: 180, color: 0xf5d76e, r: 7, shake: 0 },
      };
      const look = looks[type] || looks.archer;
      const ms = duration && duration >= 250 ? duration : look.duration;

      tower.sprite.setTexture(fireKey);
      const bloom = this.add.circle(tower.x, tower.y - 12, look.r, look.color, 0.58).setDepth(36);
      this.tweens.add({ targets: bloom, alpha: 0, scale: type === "mage" ? 2.4 : 2.0, duration: Math.min(240, ms), onComplete: () => bloom.destroy() });
      if (look.shake) this.cameras.main.shake(70, look.shake);
      if (tower.firePoseTimer) {
        tower.firePoseTimer.remove(false);
        tower.firePoseTimer = null;
      }
      tower.firePoseTimer = this.time.delayedCall(ms, () => {
        if (tower.sprite && tower.sprite.active) {
          tower.sprite.setTexture(idleKey);
        }
        tower.firePoseTimer = null;
      });
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
          this.flashTowerFirePose(tower, 140);
          if (this.settings?.reducedMotion) {
            const ring = this.add.circle(tower.x, tower.y, 6, 0xb7f08a, 0.8).setDepth(56);
            this.tweens.add({ targets: ring, alpha: 0, scale: 2, duration: 150, onComplete: () => ring.destroy() });
          } else {
            const ring = this.add.circle(tower.x, tower.y, 20, 0xb7f08a, 0.15).setStrokeStyle(2.5, 0xb7f08a, 0.95).setDepth(56);
            this.tweens.add({ targets: ring, alpha: 0, scale: 1.6, duration: 350, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
          }
          this.flashText("VOLLEY", tower.x, tower.y - 40, "#b7f08a");
          Object.assign(tower, api.afterTrigger(tower));
          this.audio.play("shoot", 0.18, 1.5);
        }
        return;
      }
      if (ability.id === "nova") {
        this.flashTowerFirePose(tower, 140);
        if (this.settings?.reducedMotion) {
          const ring = this.add.circle(target.x, target.y, 8, 0xc2b6ff, 0.8).setDepth(56);
          this.tweens.add({ targets: ring, alpha: 0, scale: 2.5, duration: 150, onComplete: () => ring.destroy() });
        } else {
          const ring = this.add.circle(target.x, target.y, 54, 0xc2b6ff, 0.15).setStrokeStyle(2.5, 0xc2b6ff, 0.95).setDepth(56);
          this.tweens.add({ targets: ring, alpha: 0, scale: 1.3, duration: 400, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
        }
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
        this.flashTowerFirePose(tower, 140);
        const x = target.x;
        const y = target.y;
        const strikeX = x + 18;
        const strikeY = y - 10;
        if (this.settings?.reducedMotion) {
          const ring = this.add.circle(strikeX, strikeY, 8, 0xf0c27a, 0.8).setDepth(56);
          this.tweens.add({ targets: ring, alpha: 0, scale: 2.5, duration: 150, onComplete: () => ring.destroy() });
        } else {
          const ring = this.add.circle(strikeX, strikeY, 44, 0xf0c27a, 0.15).setStrokeStyle(2.5, 0xf0c27a, 0.95).setDepth(56);
          this.tweens.add({ targets: ring, alpha: 0, scale: 1.3, duration: 350, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
        }
        this.time.delayedCall(220, () => {
          if (this.gameEnded) return;
          this.explode(strikeX, strikeY, (cfg.splash?.[tower.level] || 50) * 1.15, cfg.damage[tower.level] * 0.7, false);
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
      let damage = this.scaledTowerStat(tower, "damage");
      if (tower.path === "skybit" && target.base?.flying) damage *= 1.28;
      if (tower.path === "pinshot" && (target.base?.armor || 0) >= 3) damage *= 1.22;
      if (tower.path === "shard" && (target.base?.armor || 0) >= 3) damage *= 1.22;
      if (tower.path === "fuse" && !target.base?.flying) damage *= 1.18;
      let slow = this.scaledTowerStat(tower, "slow") || cfg.slow?.[level] || 0;
      if (tower.path === "veil") slow *= 1.4;
      let splash = this.scaledTowerStat(tower, "splash") || cfg.splash?.[level] || 0;
      if (tower.path === "crater") splash *= 1.3;
      const projectile = this.entityRegistry.create("projectile", {
        x: tower.x,
        y: tower.y - 10,
        target,
        tower,
        speed: tower.type === "artillery" ? 250 : 430,
        damage,
        magic: !!cfg.magic,
        slow,
        splash,
        chain: (tower.type === "mage" && level >= 3 ? 2 : 0) || (tower.spec?.bonus?.chain ? 2 : 0),
      });
      const key =
        tower.type === "archer" ? "projectile_arrow" : tower.type === "artillery" ? "projectile_bomb" : "projectile_magic";
      projectile.sprite = this.add.image(projectile.x, projectile.y, key).setDepth(60);
      projectile.sprite.setScale(tower.type === "artillery" ? 1.1 : 0.9);
      projectile.sprite.rotation = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
      projectile.trailColor = color;
      projectile.family = tower.type;
      this.projectiles.push(projectile);
      if (tower.type === "archer") {
        this.audio.playLayered("archerShoot");
      } else if (tower.type === "mage") {
        this.audio.playLayered("mageShoot");
      } else if (tower.type === "artillery") {
        this.audio.playLayered("artilleryShoot");
      }
      // Muzzle flash effect
      const angle = Phaser.Math.Angle.Between(tower.x, tower.y - 10, target.x, target.y);
      this.createMuzzleFlash(tower.x, tower.y - 10, angle);
      this.flashTowerFirePose(tower, 120);
      if (tower.sprite && !this.settings.reducedMotion) {
        const recoilAngle = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
        const baseX = tower.x;
        const baseY = tower.y - 8;
        if (tower.type === "archer") {
          // Short snap toward target, then settle
          this.tweens.add({
            targets: tower.sprite,
            x: baseX + Math.cos(recoilAngle) * 4,
            y: baseY + Math.sin(recoilAngle) * 3,
            yoyo: true,
            duration: 60,
            onComplete: () => {
              if (tower.sprite) tower.sprite.setPosition(baseX, baseY);
            },
          });
        } else if (tower.type === "mage") {
          // Scale pulse + violet glow, then settle
          const baseScale = this.getTowerScale(tower);
          this.tweens.add({
            targets: tower.sprite,
            scaleX: baseScale * 1.2,
            scaleY: baseScale * 1.2,
            yoyo: true,
            duration: 90,
            onComplete: () => {
              if (tower.sprite) tower.sprite.setScale(baseScale);
            },
          });
          const glow = this.add.circle(tower.x, tower.y - 8, 16, 0x9b59b6, 0.55).setDepth(35);
          this.tweens.add({
            targets: glow,
            alpha: 0,
            scale: 1.5,
            duration: 160,
            onComplete: () => glow.destroy(),
          });
        } else if (tower.type === "artillery") {
          // Heavier kick away from target, then settle
          this.tweens.add({
            targets: tower.sprite,
            x: baseX - Math.cos(recoilAngle) * 7,
            y: baseY - Math.sin(recoilAngle) * 5,
            yoyo: true,
            duration: 110,
            onComplete: () => {
              if (tower.sprite) tower.sprite.setPosition(baseX, baseY);
            },
          });
        } else {
          this.tweens.add({
            targets: tower.sprite,
            x: baseX - Math.cos(recoilAngle) * 4,
            y: baseY - Math.sin(recoilAngle) * 3,
            yoyo: true,
            duration: 70,
            onComplete: () => {
              if (tower.sprite) tower.sprite.setPosition(baseX, baseY);
            },
          });
        }
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
          const hitX = p.target.x;
          const hitY = p.target.y;
          const family = p.family || (p.tower ? p.tower.type : "archer");
          this.createImpactDebris(hitX, hitY, family);
          if (p.splash) {
            this.explode(p.target.x, p.target.y, p.splash, p.damage, false);
          } else {
            this.damageEnemy(p.target, p.damage, { magic: p.magic, slow: p.slow, family, rot: p.sprite?.rotation || 0 });
            if (p.chain) this.chainMagic(hitX, hitY, p.damage, p.chain);
          }
          this.removeProjectile(p);
        } else {
          p.x += ((p.target.x - p.x) / d) * step;
          p.y += ((p.target.y - p.y) / d) * step;
          p.sprite.setPosition(p.x, p.y);
          p.sprite.rotation = Phaser.Math.Angle.Between(p.x, p.y, p.target.x, p.target.y);
          this.createProjectileTrail(p);
        }
      }
    }

    createProjectileTrail(p) {
      if (this.settings?.reducedMotion) return;

      const family = p.family || (p.tower ? p.tower.type : "archer");
      const rot = p.sprite ? p.sprite.rotation : Phaser.Math.Angle.Between(p.x, p.y, p.target.x, p.target.y);
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);

      if (family === "archer") {
        const trailKey = this.textures.exists("fx_trail_arrow") ? "fx_trail_arrow" : null;
        if (trailKey) {
          const trail = this.add
            .image(p.x - cos * 12, p.y - sin * 12, trailKey)
            .setRotation(rot)
            .setDepth(59)
            .setAlpha(0.68)
            .setScale(0.85);
          this.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 0.45,
            scaleY: 0.65,
            duration: 120,
            onComplete: () => trail.destroy(),
          });
        } else {
          const length = 12;
          const startX = p.x - cos * length;
          const startY = p.y - sin * length;
          const streak = this.add.line(0, 0, startX, startY, p.x, p.y, 0xf0c040, 0.6)
            .setLineWidth(1.5)
            .setDepth(59);
          this.tweens.add({
            targets: streak,
            alpha: 0,
            duration: 110,
            onComplete: () => streak.destroy(),
          });
        }
      } else if (family === "mage") {
        const trailKey = this.textures.exists("fx_trail_magic") ? "fx_trail_magic" : null;
        if (trailKey) {
          const backX = p.x - cos * 8 + (Math.random() - 0.5) * 3;
          const backY = p.y - sin * 8 + (Math.random() - 0.5) * 3;
          const trail = this.add
            .image(backX, backY, trailKey)
            .setRotation(rot + (Math.random() - 0.5) * 0.35)
            .setDepth(59)
            .setAlpha(0.8)
            .setScale(0.75);
          this.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.22,
            duration: 160,
            onComplete: () => trail.destroy(),
          });
        } else {
          const backX = p.x - cos * 6 + (Math.random() - 0.5) * 4;
          const backY = p.y - sin * 6 + (Math.random() - 0.5) * 4;
          const spark = this.textures.exists("fx_spark")
            ? this.add.image(backX, backY, "fx_spark").setScale(0.25 + Math.random() * 0.15).setTint(0x00ffff).setAlpha(0.9).setDepth(59)
            : this.add.circle(backX, backY, 1.5 + Math.random() * 1.5, 0x00ffff, 0.85).setDepth(59);
          if (spark.setAngle) spark.setAngle(Math.random() * 360);
          this.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 0.1,
            duration: 160,
            onComplete: () => spark.destroy(),
          });
        }
      } else if (family === "artillery") {
        const backX = p.x - cos * 10;
        const backY = p.y - sin * 10;
        const key = Math.random() < 0.65 && this.textures.exists("fx_trail_bomb")
          ? "fx_trail_bomb"
          : (this.textures.exists("fx_trail_smoke") ? "fx_trail_smoke" : null);

        if (key) {
          const smoke = this.add
            .image(
              backX + (Math.random() - 0.5) * 4,
              backY + (Math.random() - 0.5) * 4,
              key
            )
            .setRotation(Math.random() * Math.PI * 2)
            .setDepth(58)
            .setAlpha(0.72)
            .setScale(0.7);
          this.tweens.add({
            targets: smoke,
            scale: 1.35,
            alpha: 0,
            duration: 220,
            onComplete: () => smoke.destroy(),
          });
        } else {
          const smoke = this.add.circle(
            backX + (Math.random() - 0.5) * 3,
            backY + (Math.random() - 0.5) * 3,
            4,
            0x555555,
            0.45
          ).setDepth(58);
          this.tweens.add({
            targets: smoke,
            scale: 1.8,
            alpha: 0,
            duration: 230,
            onComplete: () => smoke.destroy(),
          });
        }

        if (Math.random() < 0.45) {
          const emberColor = Math.random() < 0.5 ? 0xff6600 : 0xffaa00;
          const ember = this.add.circle(
            backX + (Math.random() - 0.5) * 4,
            backY + (Math.random() - 0.5) * 4,
            1.2 + Math.random() * 0.8,
            emberColor,
            0.9
          ).setDepth(59);
          this.tweens.add({
            targets: ember,
            x: ember.x + (Math.random() - 0.5) * 8,
            y: ember.y + (Math.random() - 0.5) * 8,
            alpha: 0,
            duration: 140,
            onComplete: () => ember.destroy(),
          });
        }
      }
    }

    createImpactDebris(x, y, family) {
      if (this.settings?.reducedMotion) {
        const color = family === "mage" ? 0x00ffff : family === "artillery" ? 0xff5500 : 0xf0c040;
        const radius = family === "artillery" ? 8 : family === "mage" ? 6 : 4;
        const flash = this.add.circle(x, y, radius, color, 0.8).setDepth(80);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 140,
          onComplete: () => flash.destroy(),
        });
        return;
      }

      if (family === "archer") {
        const count = 5;
        const colors = [0xf0c040, 0xd4a359, 0xffecb3];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 40 + Math.random() * 50;
          const color = colors[i % colors.length];
          const chip = this.add.circle(x, y, 1.5 + Math.random(), color, 0.85).setDepth(80);
          this.tweens.add({
            targets: chip,
            x: x + Math.cos(angle) * (speed * 0.15),
            y: y + Math.sin(angle) * (speed * 0.15),
            alpha: 0,
            scale: 0.3,
            duration: 180 + Math.random() * 60,
            onComplete: () => chip.destroy(),
          });
        }
      } else if (family === "mage") {
        const count = 6;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 50 + Math.random() * 60;
          const color = Math.random() < 0.5 ? 0x00ffff : 0x80eeff;
          const spark = this.textures.exists("fx_spark")
            ? this.add.image(x, y, "fx_spark").setScale(0.32 + Math.random() * 0.2).setTint(color).setAlpha(0.95).setDepth(80)
            : this.add.circle(x, y, 2 + Math.random() * 1.5, color, 0.9).setDepth(80);
          if (spark.setAngle) spark.setAngle(Math.random() * 360);
          this.tweens.add({
            targets: spark,
            x: x + Math.cos(angle) * (speed * 0.18),
            y: y + Math.sin(angle) * (speed * 0.18),
            alpha: 0,
            scale: 0.1,
            duration: 200 + Math.random() * 80,
            onComplete: () => spark.destroy(),
          });
        }
        const flashRing = this.add.circle(x, y, 4, 0x00ffff, 0.6).setStrokeStyle(1.5, 0x80eeff).setDepth(79);
        this.tweens.add({
          targets: flashRing,
          scale: 3.5,
          alpha: 0,
          duration: 160,
          onComplete: () => flashRing.destroy(),
        });
      } else if (family === "artillery") {
        const count = 6;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 40 + Math.random() * 60;
          const isSmoke = i < 3;
          const color = isSmoke ? 0x444444 : (Math.random() < 0.5 ? 0xff5500 : 0xffaa00);
          const p = this.add.circle(x, y, isSmoke ? (3 + Math.random() * 2) : (2 + Math.random()), color, isSmoke ? 0.6 : 0.9).setDepth(80);
          this.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * (speed * 0.2),
            y: y + Math.sin(angle) * (speed * 0.2),
            alpha: 0,
            scale: isSmoke ? 1.6 : 0.3,
            duration: 220 + Math.random() * 80,
            onComplete: () => p.destroy(),
          });
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
          this.damageEnemy(enemy, damage, { magic: fire, fire });
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
      if (tower.rallyFlag && !this.settings?.reducedMotion && !this.tweens.isTweening(tower.rallyFlag)) {
        this.tweens.add({
          targets: tower.rallyFlag,
          angle: { from: -3.5, to: 3.5 },
          scaleX: { from: 0.95, to: 1.05 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
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

      const squadOffsets = [[-8, 5], [8, 5], [0, -6], [-10, -4], [10, -4]];
      for (let i = 0; i < roster.length; i += 1) {
        const soldier = roster[i];
        const off = squadOffsets[i % squadOffsets.length] || [0, 0];
        soldier.homeX = tower.rallyX + off[0];
        soldier.homeY = tower.rallyY + off[1];
        soldier.attackCooldown -= dt;
        soldier.attackPoseTime = Math.max(0, (soldier.attackPoseTime || 0) - dt);
        soldier.arrowCooldown = Math.max(0, (soldier.arrowCooldown || 0) - dt);
        const meleeTarget = this.findEnemyNear(soldier.x, soldier.y, this.scaledTowerStat(tower, "range") * 0.55, false);
        if (meleeTarget) {
          soldier.target = meleeTarget;
          meleeTarget.blockedBy = soldier;
          this.moveSoldierToward(soldier, meleeTarget.x, meleeTarget.y, 22, dt);
          if (soldier.attackCooldown <= 0) {
            soldier.attackCooldown = this.scaledTowerStat(tower, "rate");
            soldier.attackPoseTime = 0.24;
            soldier.strikeCount = (soldier.strikeCount || 0) + 1;
            let attackerDamage = this.scaledTowerStat(tower, "damage");
            if (tower.path === "spike") attackerDamage *= 1.25;
            const strike = readiness.meleeStrike({
              attackerDamage,
              bannerBonus: this.bannerTime > 0 ? 1.18 : 1,
              isCritWindow: soldier.strikeCount % 4 === 0,
            });
            this.damageEnemy(meleeTarget, strike.damage, {});
            this.meleeImpactFx(soldier, meleeTarget, strike.flash);
            this.audio.playLayered("guardStrike");
          }
        } else {
          soldier.target = null;
          this.moveSoldierToward(soldier, soldier.homeX, soldier.homeY, 4, dt);
          if (tower.level >= 2 && soldier.arrowCooldown <= 0) {
            const arrowTarget = this.findTarget(tower, this.scaledTowerStat(tower, "range"), true);
            if (arrowTarget) {
              soldier.arrowCooldown = 1.15;
              let arrowDamage = this.scaledTowerStat(tower, "damage") * (this.bannerTime > 0 ? 0.9 : 0.72);
              if (tower.path === "spike") arrowDamage *= 1.25;
              this.fireGuardArrow(soldier, arrowTarget, arrowDamage);
            }
          }
        }

        if (soldier.target) {
          const targetDx = soldier.target.x - soldier.x;
          if (targetDx < -0.5) soldier.facingLeft = true;
          else if (targetDx > 0.5) soldier.facingLeft = false;
        }

        soldier.hp = readiness.idleRegen(soldier.hp, soldier.maxHp, dt, !!soldier.target);
        soldier.sprite.setPosition(soldier.x, soldier.y - 4);

        const reducedMotion = !!this.settings?.reducedMotion;
        let desiredTexture = "soldier_guard";
        if (reducedMotion) {
          desiredTexture = "soldier_guard";
        } else if (soldier.attackPoseTime > 0 && this.textures.exists("soldier_guard_attack")) {
          desiredTexture = "soldier_guard_attack";
        } else if (soldier.target && (!soldier.isMoving || Phaser.Math.Distance.Between(soldier.x, soldier.y, soldier.target.x, soldier.target.y) <= 26) && this.textures.exists("soldier_guard_block")) {
          desiredTexture = "soldier_guard_block";
        } else if (soldier.isMoving) {
          const frameIdx = Math.floor((soldier.walkDist || 0) / 6.5) % 4;
          const walkKey = `soldier_guard_walk${frameIdx}`;
          desiredTexture = this.textures.exists(walkKey) ? walkKey : "soldier_guard";
        } else {
          desiredTexture = this.textures.exists("soldier_guard_walk0") ? "soldier_guard_walk0" : "soldier_guard";
        }

        if (soldier.sprite && soldier.sprite.texture.key !== desiredTexture && this.textures.exists(desiredTexture)) {
          soldier.sprite.setTexture(desiredTexture);
          this.applyUnitTint(soldier.sprite);
        }
        if (soldier.sprite) {
          soldier.sprite.setFlipX(!!soldier.facingLeft);
          if (reducedMotion) {
            soldier.sprite.rotation = 0;
          } else if (soldier.attackPoseTime > 0) {
            soldier.sprite.rotation = Math.sin(this.time.now * 0.03) * 0.08;
          } else if (soldier.target) {
            soldier.sprite.rotation = Math.sin(this.time.now * 0.015 + (soldier.wobble || 0)) * 0.05;
          } else {
            soldier.sprite.rotation = 0;
          }
        }

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
      this.flashTowerFirePose(tower, 160);
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
      const spark = this.textures.exists("fx_spark")
        ? this.add.image(midX, midY, "fx_spark").setScale(flashKind === "crit" ? 0.7 : 0.45).setTint(color).setAlpha(0.95).setDepth(70)
        : this.add.circle(midX, midY, flashKind === "crit" ? 10 : 6, color, 0.55).setDepth(70);
      if (spark.setAngle) spark.setAngle(Math.random() * 360);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: (spark.scale || 1) * (flashKind === "crit" ? 2.1 : 1.6),
        duration: flashKind === "crit" ? 180 : 120,
        onComplete: () => spark.destroy(),
      });
      if (flashKind === "crit" && !this.settings?.reducedMotion) {
        const ring = this.add.circle(midX, midY, 14, 0xfff1a0, 0.25).setStrokeStyle(2, 0xffea70, 0.9).setDepth(69);
        this.tweens.add({
          targets: ring,
          alpha: 0,
          scale: 2.2,
          duration: 220,
          ease: "Quad.easeOut",
          onComplete: () => ring.destroy(),
        });
      }
      if (this.bannerTime > 0) {
        const streak = this.add.line(0, 0, soldier.x, soldier.y - 12, enemy.x, enemy.y - 12, 0xffd700, 0.8)
          .setLineWidth(flashKind === "crit" ? 2.5 : 1.5)
          .setDepth(68);
        this.tweens.add({
          targets: streak,
          alpha: 0,
          duration: flashKind === "crit" ? 160 : 110,
          onComplete: () => streak.destroy(),
        });
      }
      if (flashKind === "crit") this.flashText("CLASH", midX, midY - 16, "#fff1a0");
      if (this.settings?.reducedMotion) return;

      if (soldier.sprite) {
        const shoveFactor = flashKind === "crit" ? 0.16 : 0.13;
        this.tweens.add({
          targets: soldier.sprite,
          x: soldier.x + (enemy.x - soldier.x) * shoveFactor,
          y: soldier.y - 4 + (enemy.y - soldier.y) * shoveFactor,
          yoyo: true,
          duration: 75,
        });
      }

      const streakCount = flashKind === "crit" ? 4 : 3;
      for (let i = 0; i < streakCount; i += 1) {
        const angle = (i * Math.PI * 2) / streakCount + (Math.random() - 0.5) * 0.4;
        const dist = (flashKind === "crit" ? 18 : 12) + Math.random() * 6;
        const endX = midX + Math.cos(angle) * dist;
        const endY = midY + Math.sin(angle) * dist;
        const streak = this.add.line(0, 0, midX, midY, endX, endY, color, 0.85)
          .setLineWidth(flashKind === "crit" ? 2 : 1.5)
          .setDepth(71);
        this.tweens.add({
          targets: streak,
          alpha: 0,
          duration: flashKind === "crit" ? 160 : 110,
          onComplete: () => streak.destroy(),
        });
      }
    }

    fireGuardArrow(soldier, target, damage) {
      if (soldier.tower) this.flashTowerFirePose(soldier.tower, 120);
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
      projectile.family = "archer";
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

    syncRallyReadability(tower) {
      if (!tower || tower.type !== "barracks" || !tower.rallyRing || !tower.rallyFlag) return;
      const selected = this.selectedPad?.tower === tower;
      tower.rallyRing.setFillStyle(0xf5d76e, selected ? 0.22 : 0.08);
      tower.rallyRing.setStrokeStyle(selected ? 3 : 2, 0xf5d76e, selected ? 1 : 0.9);
      tower.rallyFlag.setText(selected ? "HOLD" : "RLY");
      tower.rallyFlag.setFont(selected ? "bold 11px 'Source Sans 3', Arial" : "bold 9px 'Source Sans 3', Arial");
    }

    setRallyPoint(tower, rally) {
      tower.rallyX = rally.x;
      tower.rallyY = rally.y;
      tower.rallySegment = rally.segment;
      tower.rallyRing.setPosition(rally.x, rally.y);
      tower.rallyFlag.setPosition(rally.x, rally.y - 20);
      this.syncRallyReadability(tower);
      this.flashTowerFirePose(tower, 140);
      if (!this.settings?.reducedMotion) {
        for (let i = 0; i < 4; i += 1) {
          const angle = (i / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const dist = 5 + Math.random() * 8;
          const dust = this.textures.exists("fx_dust")
            ? this.add.image(rally.x + Math.cos(angle) * 3, rally.y + Math.sin(angle) * 2, "fx_dust").setScale(0.28 + Math.random() * 0.15).setTint(0xd4c596).setAlpha(0.65).setDepth(18)
            : this.add.circle(
                rally.x + Math.cos(angle) * 3,
                rally.y + Math.sin(angle) * 2,
                2 + Math.random() * 1.5,
                0xd4c596,
                0.6
              ).setDepth(18);
          if (dust.setAngle) dust.setAngle(Math.random() * 360);
          this.tweens.add({
            targets: dust,
            x: rally.x + Math.cos(angle) * dist,
            y: rally.y + Math.sin(angle) * dist,
            scale: (dust.scale || 1) * 1.4,
            alpha: 0,
            duration: 500,
            ease: "Quad.out",
            onComplete: () => dust.destroy(),
          });
        }
      }
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
        if (this.heroAura) {
          this.heroAura.destroy();
          this.heroAura = null;
        }
        hero.respawn -= dt;
        if (hero.respawn <= 0) this.respawnHero();
        return;
      }
      hero.commandTime = Math.max(0, hero.commandTime - dt);
      hero.attackPoseTime = Math.max(0, (hero.attackPoseTime || 0) - dt);
      hero.abilityPoseTime = Math.max(0, (hero.abilityPoseTime || 0) - dt);
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
        hero.attackPoseTime = 0.22;
        this.damageEnemy(attackTarget, (18 + hero.level * 7) * (this.bannerTime > 0 ? 1.25 : 1), { hero: true });
        this.audio.play("impact", 0.14, 1.1);
      }
      hero.hp = Math.min(hero.maxHp, hero.hp + (4 + hero.level) * dt);
      hero.sprite.setPosition(hero.x, hero.y - 18);

      const reducedMotion = !!this.settings?.reducedMotion;
      let desiredTexture = this.textures.exists("hero_captain_idle") ? "hero_captain_idle" : "hero_captain";
      if (!reducedMotion) {
        if (hero.abilityPoseTime > 0 && this.textures.exists("hero_captain_ability")) {
          desiredTexture = "hero_captain_ability";
        } else if (hero.attackPoseTime > 0 && this.textures.exists("hero_captain_attack")) {
          desiredTexture = "hero_captain_attack";
        }
      }
      if (hero.sprite && hero.sprite.texture.key !== desiredTexture && this.textures.exists(desiredTexture)) {
        hero.sprite.setTexture(desiredTexture);
        if (hero.kind === "sentinel") {
          hero.sprite.setTint(0xb8c4c8);
        } else {
          this.applyUnitTint(hero.sprite);
        }
      }

      hero.sprite.rotation = (!reducedMotion && attackTarget && hero.attackPoseTime > 0) ? Math.sin(this.time.now * 0.025) * 0.1 : 0;
      hero.ring.setPosition(hero.x, hero.y);
      if (this.heroSelected && !this.settings?.reducedMotion) {
        const pulseScale = 1 + Math.sin(this.time.now * 0.006) * 0.08;
        hero.ring.setScale(pulseScale);
      } else {
        hero.ring.setScale(1);
      }
      const heroHeadY = hero.sprite.y - hero.sprite.displayHeight * 0.5 - 8;
      hero.barBg.setPosition(hero.x, heroHeadY);
      hero.bar.setPosition(hero.x - 15, heroHeadY);
      hero.bar.width = Math.max(1, 30 * (hero.hp / hero.maxHp));
      hero.levelText.setPosition(hero.x, hero.y + 18).setText(hero.kind === "sentinel" ? "HLD" : `H${hero.level}`);
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
        if (this.heroKind === "sentinel") {
          hero.holdUntil = this.time.now + 3200;
          this.flashText("HOLD", hero.x, hero.y - 42, COLORS.gold);
        } else {
          const target = this.findEnemyNear(hero.x, hero.y, 92, false);
          if (!target) {
            this.say("No nearby ground target for Charge.");
            return;
          }
          // Charge trail: speed lines from hero to target
          if (!this.settings?.reducedMotion) {
            for (let i = 0; i < 8; i += 1) {
              const t = i / 8;
              const trailX = hero.x + (target.x - hero.x) * t + (Math.random() - 0.5) * 12;
              const trailY = hero.y + (target.y - hero.y) * t + (Math.random() - 0.5) * 12;
              const trail = this.add.circle(trailX, trailY, 1.5 + Math.random(), 0xf5d76e, 0.8).setDepth(72);
              this.effects.push({ obj: trail, life: 0.3 + Math.random() * 0.2, vx: (target.x - hero.x) * 0.5 + (Math.random() - 0.5) * 30, vy: (target.y - hero.y) * 0.5 + (Math.random() - 0.5) * 30 });
            }
          }
          this.moveHeroTo(target.x, target.y);
          hero.commandTime = 0.45;
          this.damageEnemy(target, 85 + hero.level * 16, { hero: true, magic: true });
          this.flashText("CHARGE", hero.x, hero.y - 42, COLORS.gold);
        }
      }
      if (id === "banner") {
        this.bannerTime = 8;
        // Banner wave: golden expanding ring from hero position
        if (!this.settings?.reducedMotion) {
          const wave = this.add.circle(hero.x, hero.y, 8, 0xf5d76e, 0.4).setStrokeStyle(3, 0xfff2ba, 0.9).setDepth(55);
          this.tweens.add({ targets: wave, alpha: 0, scale: 8, duration: 700, onComplete: () => wave.destroy() });
          // Golden sparkles spreading outward
          for (let i = 0; i < 16; i += 1) {
            const angle = (i / 16) * Math.PI * 2;
            const speed = 50 + Math.random() * 40;
            const sparkle = this.textures.exists("fx_spark")
              ? this.add.image(hero.x, hero.y, "fx_spark").setScale(0.28 + Math.random() * 0.2).setTint(0xf5d76e).setAlpha(0.9).setDepth(72)
              : this.add.circle(hero.x, hero.y, 1.5 + Math.random(), 0xf5d76e, 0.8).setDepth(72);
            if (sparkle.setAngle) sparkle.setAngle(Math.random() * 360);
            this.effects.push({ obj: sparkle, life: 0.5 + Math.random() * 0.3, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
          }
        }
        this.flashText("BANNER", hero.x, hero.y - 42, "#fff1a0");
      }
      if (id === "heal") {
        hero.hp = Math.min(hero.maxHp, hero.hp + 110 + hero.level * 24);
        for (const soldier of this.soldiers) soldier.hp = Math.min(soldier.maxHp, soldier.hp + 70);
        // Heal particles: green crosses rising from hero and soldiers
        if (!this.settings?.reducedMotion) {
          const healTargets = [hero, ...this.soldiers];
          for (const ht of healTargets) {
            if (!ht || !ht.sprite?.visible) continue;
            for (let i = 0; i < 4; i += 1) {
              const hParticle = this.add.circle(ht.x + (Math.random() - 0.5) * 16, ht.y, 2 + Math.random(), 0x77d75d, 0.8).setDepth(72);
              this.tweens.add({ targets: hParticle, alpha: 0, y: ht.y - 30 - Math.random() * 20, duration: 500 + Math.random() * 200, onComplete: () => hParticle.destroy() });
            }
          }
        }
        this.flashText("HEAL", hero.x, hero.y - 42, "#9eff9c");
      }
      hero.abilityPoseTime = 0.55;
      ability.ready = ability.cooldown;
      if (id === "charge") this.audio.playLayered("chargeAbility");
      else if (id === "banner") this.audio.playLayered("bannerAbility");
      else if (id === "heal") this.audio.playLayered("healAbility");
      this.cameraPunch("ability");
    }

    respawnHero() {
      const point = this.nearestPathPoint(this.path[1].x, this.path[1].y);
      Object.assign(this.hero, {
        x: point.x,
        y: point.y,
        targetX: point.x,
        targetY: point.y,
        hp: this.hero.maxHp,
        attackPoseTime: 0,
        abilityPoseTime: 0,
        dead: false,
        state: "active",
      });
      const idleKey = this.textures.exists("hero_captain_idle") ? "hero_captain_idle" : "hero_captain";
      if (this.hero.sprite && this.textures.exists(idleKey)) this.hero.sprite.setTexture(idleKey);
      if (this.hero.kind === "sentinel") {
        this.hero.sprite?.setTint?.(0xb8c4c8);
      } else {
        this.applyUnitTint(this.hero.sprite);
      }
      for (const obj of [this.hero.sprite, this.hero.barBg, this.hero.bar, this.hero.levelText]) obj.setVisible(true);
      this.say("Captain has returned.");
    }

    killHero() {
      const hero = this.hero;
      hero.dead = true;
      this.entityRegistry.transition(hero, "dead");
      hero.respawn = 9 * (this.talentMods?.heroRespawn || 1);
      hero.hp = 0;
      hero.attackPoseTime = 0;
      hero.abilityPoseTime = 0;
      this.heroSelected = false;
      hero.ring.setVisible(false);
      if (this.heroAura) {
        this.heroAura.destroy();
        this.heroAura = null;
      }
      this.hero.sprite?.clearTint?.();
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
      if (d <= stopDistance) {
        soldier.isMoving = false;
        return;
      }
      const step = Math.min(d - stopDistance, 52 * dt);
      const dx = ((x - soldier.x) / d) * step;
      const dy = ((y - soldier.y) / d) * step;
      soldier.x += dx;
      soldier.y += dy;
      soldier.isMoving = true;
      soldier.walkDist = (soldier.walkDist || 0) + step;
      if (dx < -0.3) soldier.facingLeft = true;
      else if (dx > 0.3) soldier.facingLeft = false;
    }

    spawnSoldier(tower) {
      this.flashTowerFirePose(tower, 140);
      const point = { x: tower.rallyX, y: tower.rallyY };
      let maxHp = TOWERS.barracks.soldierHp[tower.level];
      const hpMul = tower.spec?.bonus?.soldierHp;
      if (typeof hpMul === "number") maxHp = Math.round(maxHp * hpMul);
      const talentHp = this.talentMods?.soldierHp;
      if (typeof talentHp === "number") maxHp = Math.round(maxHp * talentHp);
      if (tower.path === "bulwark") maxHp = Math.round(maxHp * 1.28);
      const soldier = this.entityRegistry.create("soldier", {
        x: point.x,
        y: point.y,
        homeX: point.x,
        homeY: point.y,
        hp: maxHp,
        maxHp,
        tower,
        attackCooldown: 0.2,
        attackPoseTime: 0,
        walkDist: 0,
        facingLeft: false,
        wobble: Math.random() * Math.PI * 2,
        isMoving: false,
        dead: false,
      });
      soldier.sprite = this.add.image(soldier.x, soldier.y - 6, "soldier_guard").setScale(0.98).setDepth(44);
      this.applyUnitTint(soldier.sprite);
      soldier.bar = this.add.rectangle(soldier.x - 10, soldier.y - 17, 20, 3, 0x7ee06a).setOrigin(0, 0.5).setDepth(45);
      tower.soldiers.push(soldier);
      this.soldiers.push(soldier);
    }

    spawnWolf(den) {
      const point = this.nearestPathPoint(den.x, den.y);
      const squadOffsets = [[-8, 4], [8, 4]];
      const aliveCount = (den.soldiers || []).filter((s) => !s.dead).length;
      const off = squadOffsets[aliveCount % squadOffsets.length] || [0, 0];
      const homeX = point.x + off[0];
      const homeY = point.y + off[1];
      const maxHp = 90;
      const soldier = this.entityRegistry.create("soldier", {
        x: homeX,
        y: homeY,
        homeX,
        homeY,
        hp: maxHp,
        maxHp,
        tower: den,
        attackCooldown: 0.2,
        attackPoseTime: 0,
        walkDist: 0,
        facingLeft: false,
        wobble: Math.random() * Math.PI * 2,
        isMoving: false,
        dead: false,
      });
      soldier.sprite = this.add.image(soldier.x, soldier.y - 6, "unit_wolf").setScale(0.98).setDepth(44);
      this.applyUnitTint(soldier.sprite);
      soldier.bar = this.add.rectangle(soldier.x - 10, soldier.y - 17, 20, 3, 0x7ee06a).setOrigin(0, 0.5).setDepth(45);
      den.soldiers.push(soldier);
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
      if (enemy.base.phaseWalk) return null;
      const heroRadius = this.hero && !this.hero.dead && this.hero.holdUntil > this.time.now ? enemy.base.size + 62 : enemy.base.size + 14;
      if (
        this.hero &&
        !this.hero.dead &&
        Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y) < heroRadius
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
      if (tower && window.KRCBarracksReadiness && tower.type === "barracks") {
        const alive = tower.soldiers ? tower.soldiers.filter((s) => s !== soldier && !s.dead).length : 0;
        const wanted = window.KRCBarracksReadiness.wantedCount(tower.level);
        if (alive < wanted && tower.cooldown <= 0) {
          tower.trainMax = window.KRCBarracksReadiness.respawnCooldown(tower.level);
          tower.cooldown = tower.trainMax;
        }
        this.flashText("FALLEN", soldier.x, soldier.y - 24, "#f0a0a0");
        this.refreshBarracksReadiness(tower, alive, wanted);
      }
      soldier.sprite?.clearTint?.();
      soldier.sprite.destroy();
      soldier.bar.destroy();
      this.soldiers = this.soldiers.filter((s) => s !== soldier);
      if (soldier.tower?.soldiers) {
        soldier.tower.soldiers = soldier.tower.soldiers.filter((s) => s !== soldier);
      }
      this.entityRegistry.transition(soldier, "removed");
    }

    updateSoldiers(dt) {
      if (!this.wolfDen) return;
      const den = this.wolfDen;
      den.soldiers = den.soldiers.filter((s) => !s.dead);
      const squadOffsets = [[-8, 4], [8, 4]];
      for (let i = 0; i < den.soldiers.length; i += 1) {
        const wolf = den.soldiers[i];
        const off = squadOffsets[i % squadOffsets.length] || [0, 0];
        const home = this.nearestPathPoint(den.x, den.y);
        wolf.homeX = home.x + off[0];
        wolf.homeY = home.y + off[1];
        wolf.attackCooldown -= dt;
        wolf.attackPoseTime = Math.max(0, (wolf.attackPoseTime || 0) - dt);
        const meleeTarget = this.findEnemyNear(wolf.x, wolf.y, 45, false);
        if (meleeTarget) {
          wolf.target = meleeTarget;
          meleeTarget.blockedBy = wolf;
          this.moveSoldierToward(wolf, meleeTarget.x, meleeTarget.y, 20, dt);
          if (wolf.attackCooldown <= 0) {
            wolf.attackCooldown = 0.65;
            wolf.attackPoseTime = 0.22;
            wolf.strikeCount = (wolf.strikeCount || 0) + 1;
            const damage = 14;
            this.damageEnemy(meleeTarget, damage, {});
            this.meleeImpactFx(wolf, meleeTarget, "hit");
            this.audio.playLayered?.("guardStrike");
          }
        } else {
          wolf.target = null;
          this.moveSoldierToward(wolf, wolf.homeX, wolf.homeY, 4, dt);
        }

        if (wolf.target) {
          const targetDx = wolf.target.x - wolf.x;
          if (targetDx < -0.5) wolf.facingLeft = true;
          else if (targetDx > 0.5) wolf.facingLeft = false;
        }

        if (window.KRCBarracksReadiness) {
          wolf.hp = window.KRCBarracksReadiness.idleRegen(wolf.hp, wolf.maxHp, dt, !!wolf.target);
        }
        if (wolf.sprite) {
          wolf.sprite.setPosition(wolf.x, wolf.y - 4);
          wolf.sprite.setFlipX(!!wolf.facingLeft);
          if (wolf.attackPoseTime > 0) {
            wolf.sprite.rotation = Math.sin(this.time.now * 0.03) * 0.08;
          } else if (wolf.target) {
            wolf.sprite.rotation = Math.sin(this.time.now * 0.015 + (wolf.wobble || 0)) * 0.05;
          } else {
            wolf.sprite.rotation = 0;
          }
        }
        if (wolf.bar) {
          wolf.bar.width = Math.max(1, 20 * (wolf.hp / wolf.maxHp));
          wolf.bar.setPosition(wolf.x - 10, wolf.y - 17);
          wolf.bar.fillColor = wolf.target ? 0xf0c35a : 0x7ee06a;
        }
      }
    }

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

    playSpellFxStages(spellKey, x, y) {
      const fx = window.KRCSpellFx?.SPELL_FX?.[spellKey];
      if (!fx?.stages) return false;
      const reduced = Boolean(this.settings?.reducedMotion);
      for (const st of fx.stages) {
        const delay = reduced ? 0 : st.t;
        this.time.delayedCall(delay, () => {
          if (!this.scene?.isActive?.()) return;
          const g = this.add.graphics().setDepth(58);
          const color = st.color ?? 0xffffff;
          const alpha = st.alpha ?? 0.8;
          if (st.kind === "ring" || st.kind === "hornRings" || st.kind === "bannerPulse") {
            g.lineStyle(3, color, alpha);
            g.strokeCircle(x, y, reduced ? st.r : 6);
            this.tweens.add({
              targets: g, alpha: 0, scaleX: reduced ? 1 : st.r / 6, scaleY: reduced ? 1 : st.r / 6,
              duration: reduced ? 200 : 520, ease: "Cubic.easeOut", onComplete: () => g.destroy(),
            });
          } else if (st.kind === "shards" || st.kind === "cluster" || st.kind === "smoke" || st.kind === "dustFeet") {
            const pts = window.KRCSpellFx?.trailPoints?.("arrow", st.count ?? 6) || [];
            const spread = (st.r ?? 24) / 26 || 1;
            g.fillStyle(color, alpha);
            for (const p of pts) g.fillCircle(x + (p.x ?? 0) * spread - 13 * spread, y + (p.y ?? 0), 2.5);
            this.tweens.add({ targets: g, alpha: 0, duration: reduced ? 260 : 700, onComplete: () => g.destroy() });
          } else {
            g.fillStyle(color, alpha);
            g.fillCircle(x, y, Math.min(st.r ?? 20, 40));
            this.tweens.add({ targets: g, alpha: 0, duration: reduced ? 240 : 620, onComplete: () => g.destroy() });
          }
        });
      }
      return true;
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
          this.audio.playLayered?.("uiError");
          return;
        }
        this.playSpellFxStages?.("meteor", target.x, target.y);
        this.stampSpellScorch(target.x, target.y, "meteor");
        if (this.settings?.reducedMotion) {
          // reducedMotion: static stamp + fade
          const stamp = this.add.image(target.x, target.y, this.textures.exists("fx_meteor") ? "fx_meteor" : "fx_meteor_0")
            .setScale(0.85)
            .setAlpha(0.95)
            .setDepth(57);
          this.tweens.add({ targets: stamp, alpha: 0, duration: 280, ease: "Quad.easeOut", onComplete: () => stamp.destroy() });
        } else {
          // Dashed / crosshair targeting reticle at target
          const reticle = this.add.graphics().setDepth(57);
          reticle.lineStyle(2, 0xffd07a, 0.95);
          const r = 36;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            reticle.beginPath();
            reticle.arc(target.x, target.y, r, a, a + Math.PI / 8);
            reticle.strokePath();
          }
          reticle.lineStyle(2, 0xff5522, 0.9);
          reticle.lineBetween(target.x - 48, target.y, target.x - 20, target.y);
          reticle.lineBetween(target.x + 20, target.y, target.x + 48, target.y);
          reticle.lineBetween(target.x, target.y - 48, target.x, target.y - 20);
          reticle.lineBetween(target.x, target.y + 48, target.x, target.y + 20);
          reticle.fillStyle(0xfff8c0, 0.9);
          reticle.fillCircle(target.x, target.y, 4);

          this.tweens.add({
            targets: reticle,
            scale: { from: 1.35, to: 1.0 },
            alpha: { from: 0.2, to: 1.0 },
            duration: 180,
            ease: "Quad.easeOut",
            onComplete: () => reticle.destroy()
          });

          // Meteor trail: falling fire particles from sky to target
          for (let i = 0; i < 15; i += 1) {
            const trailX = target.x + (Math.random() - 0.5) * 30;
            const trailY = 60 + Math.random() * (target.y - 80);
            const trail = this.add.circle(trailX, trailY, 2 + Math.random() * 4, 0xff623d, 0.7).setDepth(58);
            this.effects.push({ obj: trail, life: 0.4 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 20, vy: Math.random() * 30 });
          }

          // Authored meteor impact burst (Frame 0 core detonation -> Frame 1 expanding magma shockwave)
          const burst0 = this.add.image(target.x, target.y, this.textures.exists("fx_meteor_0") ? "fx_meteor_0" : "fx_meteor")
            .setScale(0.75)
            .setAlpha(0.95)
            .setDepth(58);
          this.tweens.add({
            targets: burst0,
            scale: { from: 0.75, to: 1.15 },
            alpha: { from: 1.0, to: 0 },
            duration: 520,
            ease: "Quad.easeOut",
            onComplete: () => burst0.destroy()
          });

          if (this.textures.exists("fx_meteor_1")) {
            const burst1 = this.add.image(target.x, target.y, "fx_meteor_1")
              .setScale(0.6)
              .setAlpha(0)
              .setRotation((Math.random() - 0.5) * 0.4)
              .setDepth(57.5);
            this.tweens.add({
              targets: burst1,
              scale: { from: 0.6, to: 1.45 },
              alpha: { from: 0.9, to: 0 },
              delay: 70,
              duration: 440,
              ease: "Cubic.easeOut",
              onComplete: () => burst1.destroy()
            });
          }

          for (let i = 0; i < 12; i += 1) {
            const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.2;
            const dist = 15 + Math.random() * 35;
            const spark = this.textures.exists("fx_spark")
              ? this.add.image(target.x, target.y, "fx_spark").setScale(0.35 + Math.random() * 0.25).setTint(0xffd07a).setAlpha(0.95).setDepth(58)
              : this.add.circle(target.x, target.y, 2 + Math.random() * 2, 0xffd07a, 0.9).setDepth(58);
            if (spark.setAngle) spark.setAngle(Math.random() * 360);
            this.tweens.add({
              targets: spark,
              x: target.x + Math.cos(angle) * dist,
              y: target.y + Math.sin(angle) * dist,
              alpha: 0,
              scale: 0.1,
              duration: 300 + Math.random() * 150,
              onComplete: () => spark.destroy()
            });
          }
        }
        this.explode(target.x, target.y, 72, [270, 320, 370][this.spellRank() - 1] * (this.talentMods?.meteor || 1), true);
        this.flashText("METEOR", target.x, target.y - 50, "#ffd37a");
      }
      if (id === "frost") {
        if (!this.enemies.length) {
          this.say("No enemies to freeze.");
          this.audio.playLayered?.("uiError");
          return;
        }
        for (const enemy of this.enemies) {
          enemy.slow = Math.max(enemy.slow, [4.2, 5.0, 5.8][this.spellRank() - 1]);
        }
        this.playSpellFxStages?.("frost", W / 2, H / 2);
        this.stampSpellScorch(W / 2, H / 2, "frost");
        if (this.settings?.reducedMotion) {
          // reducedMotion: static stamp + fade
          const stamp = this.add.image(W / 2, H / 2, this.textures.exists("fx_ice") ? "fx_ice" : "fx_ice_0")
            .setScale(1.0)
            .setAlpha(0.92)
            .setDepth(57);
          this.tweens.add({ targets: stamp, alpha: 0, duration: 280, ease: "Quad.easeOut", onComplete: () => stamp.destroy() });
        } else {
          // Ice reticle / ground mark
          const cx = W / 2;
          const cy = H / 2;
          const iceMark = this.add.graphics().setDepth(57);
          iceMark.lineStyle(2, 0xd0f0ff, 0.9);
          iceMark.strokeCircle(cx, cy, 46);
          iceMark.lineStyle(1.5, 0xaee9ff, 0.85);
          iceMark.strokeCircle(cx, cy, 26);
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            const x1 = cx + Math.cos(angle) * 16;
            const y1 = cy + Math.sin(angle) * 16;
            const x2 = cx + Math.cos(angle) * 54;
            const y2 = cy + Math.sin(angle) * 54;
            iceMark.lineBetween(x1, y1, x2, y2);
          }
          this.tweens.add({
            targets: iceMark,
            scale: { from: 0.7, to: 1.1 },
            alpha: { from: 0, to: 0.95 },
            duration: 200,
            ease: "Quad.easeOut",
            onComplete: () => iceMark.destroy()
          });

          // Authored Frost Burst sprite (Frame 0 crystal star -> Frame 1 expanding frost nova)
          const iceBurst0 = this.add.image(cx, cy, this.textures.exists("fx_ice_0") ? "fx_ice_0" : "fx_ice")
            .setScale(0.75)
            .setAlpha(0.95)
            .setDepth(58);
          this.tweens.add({
            targets: iceBurst0,
            scale: { from: 0.75, to: 1.3 },
            rotation: 0.3,
            alpha: { from: 1.0, to: 0 },
            duration: 520,
            ease: "Quad.easeOut",
            onComplete: () => iceBurst0.destroy()
          });

          if (this.textures.exists("fx_ice_1")) {
            const iceBurst1 = this.add.image(cx, cy, "fx_ice_1")
              .setScale(0.7)
              .setAlpha(0)
              .setDepth(57.5);
            this.tweens.add({
              targets: iceBurst1,
              scale: { from: 0.7, to: 1.6 },
              rotation: -0.25,
              alpha: { from: 0.9, to: 0 },
              delay: 80,
              duration: 500,
              ease: "Cubic.easeOut",
              onComplete: () => iceBurst1.destroy()
            });
          }

          // Frost sparkles & mini frost stamps on each enemy
          for (const enemy of this.enemies) {
            if (this.textures.exists("fx_ice")) {
              const enemyIce = this.add.image(enemy.x, enemy.y - 6, "fx_ice").setScale(0.28).setAlpha(0.85).setDepth(73);
              this.tweens.add({
                targets: enemyIce,
                scale: 0.38,
                alpha: 0,
                y: enemy.y - 20,
                duration: 450,
                ease: "Quad.easeOut",
                onComplete: () => enemyIce.destroy()
              });
            } else {
              const frost = this.add.circle(enemy.x, enemy.y - 10, 3.5, 0xaee9ff, 0.85).setDepth(72);
              this.tweens.add({ targets: frost, alpha: 0, y: enemy.y - 32, duration: 400, onComplete: () => frost.destroy() });
            }
          }

          // Crystal shards
          const shardCount = 14;
          for (let i = 0; i < shardCount; i += 1) {
            const shard = this.add.graphics().setDepth(74);
            shard.fillStyle(i % 2 === 0 ? 0xe0ffff : 0x80d8ff, 0.9);
            shard.lineStyle(1, 0xffffff, 0.95);
            shard.beginPath();
            shard.moveTo(0, -10);
            shard.lineTo(4, 0);
            shard.lineTo(0, 10);
            shard.lineTo(-4, 0);
            shard.closePath();
            shard.fillPath();
            shard.strokePath();

            const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const startDist = 20;
            const targetDist = 70 + Math.random() * 60;
            const sx = cx + Math.cos(angle) * startDist;
            const sy = cy + Math.sin(angle) * startDist;
            shard.setPosition(sx, sy);
            shard.setRotation(angle);

            this.tweens.add({
              targets: shard,
              x: cx + Math.cos(angle) * targetDist,
              y: cy + Math.sin(angle) * targetDist,
              rotation: angle + Math.PI,
              alpha: 0,
              scale: { from: 1.2, to: 0.4 },
              duration: 450 + Math.random() * 150,
              ease: "Cubic.easeOut",
              onComplete: () => shard.destroy()
            });
          }
        }
        this.flashText("FROST", W / 2, 312, "#aee9ff");
        this.cameras.main.flash(140, 130, 210, 255, false);
      }
      if (id === "rally") {
        this.rallyTime = [7, 8.5, 10][this.spellRank() - 1];
        this.playSpellFxStages?.("rally", W / 2, H / 2);
        if (this.settings?.reducedMotion) {
          // reducedMotion: static stamp + fade
          const stamp = this.add.image(W / 2, H / 2, this.textures.exists("fx_rally") ? "fx_rally" : "fx_rally_0")
            .setScale(1.0)
            .setAlpha(0.92)
            .setDepth(57);
          this.tweens.add({ targets: stamp, alpha: 0, duration: 280, ease: "Quad.easeOut", onComplete: () => stamp.destroy() });
        } else {
          // Banner-style ring
          const cx = W / 2;
          const cy = H / 2;
          const bannerRing = this.add.graphics().setDepth(57);
          bannerRing.lineStyle(3, 0xf5d76e, 0.95);
          bannerRing.strokeCircle(cx, cy, 44);
          bannerRing.lineStyle(1.5, 0xfff2ba, 0.9);
          bannerRing.strokeCircle(cx, cy, 32);
          const tabPositions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
          bannerRing.fillStyle(0xf5d76e, 0.95);
          bannerRing.lineStyle(1.5, 0x7a5810, 0.9);
          for (const angle of tabPositions) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const perpX = -sin * 7;
            const perpY = cos * 7;
            const tipX = cx + cos * 56;
            const tipY = cy + sin * 56;
            const base1X = cx + cos * 42 + perpX;
            const base1Y = cy + sin * 42 + perpY;
            const base2X = cx + cos * 42 - perpX;
            const base2Y = cy + sin * 42 - perpY;
            bannerRing.beginPath();
            bannerRing.moveTo(base1X, base1Y);
            bannerRing.lineTo(tipX, tipY);
            bannerRing.lineTo(base2X, base2Y);
            bannerRing.closePath();
            bannerRing.fillPath();
            bannerRing.strokePath();
          }
          this.tweens.add({
            targets: bannerRing,
            scale: { from: 1.3, to: 1.0 },
            alpha: { from: 0.2, to: 1.0 },
            duration: 200,
            ease: "Quad.easeOut",
            onComplete: () => bannerRing.destroy()
          });

          // Authored Rally Burst sprite (Frame 0 sunburst crest -> Frame 1 expanding valor seal)
          const rallyBurst0 = this.add.image(cx, cy, this.textures.exists("fx_rally_0") ? "fx_rally_0" : "fx_rally")
            .setScale(0.4)
            .setAlpha(0.95)
            .setDepth(58);
          this.tweens.add({
            targets: rallyBurst0,
            scale: { from: 0.4, to: 1.3 },
            rotation: 0.2,
            alpha: { from: 1.0, to: 0 },
            duration: 440,
            ease: "Quad.easeOut",
            onComplete: () => rallyBurst0.destroy()
          });

          if (this.textures.exists("fx_rally_1")) {
            const rallyBurst1 = this.add.image(cx, cy, "fx_rally_1")
              .setScale(0.7)
              .setAlpha(0)
              .setDepth(57.5);
            this.tweens.add({
              targets: rallyBurst1,
              scale: { from: 0.7, to: 1.55 },
              rotation: -0.15,
              alpha: { from: 0.9, to: 0 },
              delay: 80,
              duration: 520,
              ease: "Cubic.easeOut",
              onComplete: () => rallyBurst1.destroy()
            });
          }

          // Golden particles spreading outward
          for (let i = 0; i < 20; i += 1) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 60 + Math.random() * 40;
            const particle = this.add.circle(cx, cy, 1.5 + Math.random(), 0xf5d76e, 0.8).setDepth(72);
            this.effects.push({ obj: particle, life: 0.5 + Math.random() * 0.3, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
          }
        }
        this.flashText("RALLY", W / 2, 312, "#fff1a0");
      }
      spell.ready = spell.cooldown;
      if (id === "meteor") this.audio.playLayered("meteorSpell");
      else if (id === "frost") this.audio.playLayered("frostSpell");
      else if (id === "rally") this.audio.playLayered("rallySpell");
    }

    updateSpells(dt) {
      for (const spell of Object.values(this.spells)) spell.ready = Math.max(0, spell.ready - dt);
      for (const b of this.spellButtons || []) {
        const s = this.spells[b.spell];
        const base = b.baseLabel || b.label;
        b.setLabel(s.ready > 0 ? `${base}\n${Math.ceil(s.ready)}` : base);
        b.setAlpha(s.ready > 0 ? 0.55 : 1);
        const pct = s.ready > 0 ? 1 - s.ready / s.cooldown : 1;
        b.cooldownBar.width = Math.max(1, 78 * pct);
        b.cooldownBar.setVisible(s.ready > 0);
        b.cooldownBar.setFillStyle(s.ready > 0 ? 0x84a9c7 : 0xaee9ff, s.ready > 0 ? 0.65 : 0.95);
      }
      for (const b of this.heroButtons || []) {
        const ability = this.heroAbilities[b.ability];
        const base = b.baseLabel || b.label;
        b.setLabel(ability.ready > 0 ? `${base}\n${Math.ceil(ability.ready)}` : base);
        b.setAlpha(ability.ready > 0 ? 0.55 : 1);
        const pct = ability.ready > 0 ? 1 - ability.ready / ability.cooldown : 1;
        b.cooldownBar.width = Math.max(1, 84 * pct);
        b.cooldownBar.setVisible(ability.ready > 0);
        b.cooldownBar.setFillStyle(ability.ready > 0 ? 0xa98f44 : 0xf5d76e, ability.ready > 0 ? 0.65 : 0.95);
      }
    }

    // —— Particle system helpers ——
    createParticles(x, y, count, cfg) {
      if (this.settings?.reducedMotion) return;
      const p = this.add.particles(x, y, cfg.key || "projectile_arrow", {
        speed: cfg.speed ?? 80,
        angleRange: cfg.angleRange ?? 360,
        scale: cfg.scale ?? { start: 1, end: 0 },
        alpha: cfg.alpha ?? { start: 0.8, end: 0 },
        lifespan: cfg.lifespan ?? 400,
        gravityY: cfg.gravityY ?? 60,
        quantity: count,
        emitting: false,
        blendMode: cfg.blendMode ?? "NORMAL",
      });
      p.setDepth(80);
      this.effects.push({ obj: p, life: cfg.lifespan / 1000 + 0.2, vx: 0, vy: 0, isEmitter: true });
      p.emitParticle(count);
    }

    createDamageNumber(x, y, text, color) {
      const t = this.add.text(x + (Math.random() - 0.5) * 16, y - 12, text, {
        font: "bold 14px 'Source Sans 3', Arial",
        color: color || "#fff2ba",
        stroke: "#0a0804",
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(210);
      if (this.settings?.reducedMotion) {
        this.time.delayedCall(600, () => t.destroy());
        return;
      }
      this.tweens.add({
        targets: t,
        y: y - 40 - Math.random() * 16,
        alpha: 0,
        scale: 0.7,
        duration: 650 + Math.random() * 150,
        ease: "Quad.easeOut",
        onComplete: () => t.destroy(),
      });
    }

    showKillPop(x, y, size, streak) {
      const baseY = y - (size || 16) - 36;
      const last = this.add.text(x, baseY, "LAST", {
        font: "900 11px Cinzel, serif",
        color: "#fff6d0",
        stroke: "#2a1608",
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(212);
      if (this.settings?.reducedMotion) {
        this.time.delayedCall(500, () => last.destroy());
      } else {
        this.tweens.add({
          targets: last,
          y: baseY - 16,
          alpha: 0,
          duration: 520,
          ease: "Quad.out",
          onComplete: () => last.destroy(),
        });
      }
      if (streak < 2) return;
      const combo = this.add.text(x + 18, baseY - 10, `x${streak}`, {
        font: "900 13px Cinzel, serif",
        color: "#ffd36a",
        stroke: "#2a1608",
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(213);
      if (this.settings?.reducedMotion) {
        this.time.delayedCall(500, () => combo.destroy());
      } else {
        this.tweens.add({
          targets: combo,
          y: baseY - 28,
          scale: 1.15,
          alpha: 0,
          duration: 640,
          ease: "Quad.out",
          onComplete: () => combo.destroy(),
        });
      }
    }

    createHitSparks(x, y, color) {
      if (this.settings?.reducedMotion) return;
      for (let i = 0; i < 5; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 60;
        const spark = this.textures.exists("fx_spark")
          ? this.add.image(x, y, "fx_spark").setScale(0.3 + Math.random() * 0.25).setTint(color || 0xfff0c0).setAlpha(0.95).setDepth(85)
          : this.add.circle(x, y, 1.5 + Math.random() * 2, color || 0xfff0c0, 0.9).setDepth(85);
        if (spark.setAngle) spark.setAngle(Math.random() * 360);
        this.effects.push({
          obj: spark, life: 0.2 + Math.random() * 0.15,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 20,
        });
      }
    }

    createMuzzleFlash(x, y, angle) {
      if (this.settings?.reducedMotion) return;
      const flash = this.add.circle(
        x + Math.cos(angle) * 8, y - 10 + Math.sin(angle) * 6,
        5, 0xfff8c0, 0.7
      ).setDepth(62);
      this.tweens.add({ targets: flash, alpha: 0, scale: 1.8, duration: 60, onComplete: () => flash.destroy() });
    }

    puff(x, y, color) {
      const count = this.settings?.reducedMotion ? 2 : 8;
      for (let i = 0; i < count; i += 1) {
        const p = this.add.circle(x, y, 2 + Math.random() * 3, color, 0.8).setDepth(80);
        this.effects.push({ obj: p, life: 0.36, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90 });
      }
    }

    createCoinBurst(x, y) {
      if (this.settings?.reducedMotion) {
        const coin = this.add.circle(x, y, 3.5, 0xf5c85a, 0.95).setStrokeStyle(1, 0xfff0a0, 0.9).setDepth(205);
        this.tweens.add({
          targets: coin,
          alpha: 0,
          duration: 420,
          ease: "Quad.easeOut",
          onComplete: () => coin.destroy(),
        });
        return;
      }
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        const isRect = i % 2 === 1;
        const coinColor = i % 3 === 0 ? 0xffd700 : (i % 3 === 1 ? 0xf5c85a : 0xe6a100);
        const coin = isRect
          ? this.add.rectangle(x, y, 5, 3, coinColor, 0.95).setStrokeStyle(1, 0xfff2b0, 0.9).setDepth(205)
          : this.add.circle(x, y, 2.5 + Math.random() * 0.8, coinColor, 0.95).setStrokeStyle(1, 0xfff2b0, 0.9).setDepth(205);
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const speed = 45 + Math.random() * 55;
        const life = 0.45 + Math.random() * 0.15;
        this.effects.push({
          obj: coin,
          life,
          maxLife: life,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 25,
          gravityY: 280,
        });
      }
    }

    updateEffects(dt) {
      for (const e of [...this.effects]) {
        if (e.isEmitter) {
          e.life -= dt;
          if (e.life <= 0) { e.obj.destroy(); this.effects = this.effects.filter((x) => x !== e); }
        } else {
          e.life -= dt;
          e.obj.x += e.vx * dt;
          e.obj.y += e.vy * dt;
          if (e.gravityY) e.vy += e.gravityY * dt;
          const maxLife = e.maxLife || 0.36;
          e.obj.alpha = Math.max(0, e.life / maxLife);
          if (e.life <= 0) { e.obj.destroy(); this.effects = this.effects.filter((x) => x !== e); }
        }
      }
    }

    flashText(text, x, y, color) {
      const t = this.add.text(x, y, text, { font: "bold 15px Cinzel", color }).setOrigin(0.5).setDepth(200);
      if (this.settings?.reducedMotion) {
        this.time.delayedCall(520, () => t.destroy());
        return;
      }
      this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 760, ease: "Quad.easeOut", onComplete: () => t.destroy() });
    }

    cameraPunch(kind) {
      if (this.settings?.reducedMotion) return;
      const cam = this.cameras?.main;
      if (!cam || typeof cam.shake !== "function") return;
      if (cam._krcPunchUntil && this.time.now < cam._krcPunchUntil) return;
      const boss = kind === "boss";
      const duration = boss ? 140 : 80;
      const intensity = boss ? 0.007 : 0.003;
      cam._krcPunchUntil = this.time.now + duration + 40;
      cam.shake(duration, intensity);
    }

    makeRangeDecal(x, y, radius, color) {
      const g = this.add.graphics().setDepth(8);
      const paint = (r) => {
        g.clear();
        const fill = color || 0x4a3420;
        g.fillStyle(fill, 0.15);
        g.fillCircle(0, 0, r);
        g.fillStyle(fill, 0.08);
        g.fillCircle(-r * 0.18, r * 0.12, r * 0.52);
        g.fillCircle(r * 0.2, -r * 0.14, r * 0.38);
        g.lineStyle(2, 0x5a4030, 0.32);
        const steps = 18;
        for (let i = 0; i < steps; i += 1) {
          if (i % 3 === 0) continue;
          const a0 = (i / steps) * Math.PI * 2;
          const a1 = ((i + 0.55) / steps) * Math.PI * 2;
          g.beginPath();
          g.arc(0, 0, Math.max(4, r - 1), a0, a1);
          g.strokePath();
        }
      };
      g.setPosition(x, y);
      g.setRadius = (r) => { g._krcRadius = r; paint(r); };
      g.setRadius(radius);
      g.setVisible(false);
      return g;
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
      this.goldText.setText(String(this.gold));
      this.livesText.setText(String(Math.max(0, this.lives)));
      this.waveText.setText(`Wave ${Math.min(this.waveIndex + 1, WAVES.length)}/${WAVES.length}`);
      this.mapText.setText(this.map.name);
      const remaining = this.waveActive ? this.queue.length + this.enemies.length : 0;
      const progress = this.waveTotal > 0 ? 1 - remaining / this.waveTotal : this.waveIndex / WAVES.length;
      this.waveBar.width = Math.max(1, 140 * Phaser.Math.Clamp(progress, 0, 1));
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
        return `Captain L${hero.level} HP ${Math.ceil(hero.hp)}/${hero.maxHp}. Tap road to move. Charge, Banner, Heal below.`;
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
        const dmg = this.scaledTowerStat(tower, "damage");
        const rate = this.scaledTowerStat(tower, "rate");
        const range = this.scaledTowerStat(tower, "range");
        const ability = window.KRCTowerAbilities?.getAbility(tower.type);
        const unlocked = ability && window.KRCTowerAbilities.isUnlocked(tower.type, tower.level);
        const spent = this.towerInvestedGold(tower);
        const refund = Math.floor(spent * 0.55);
        const up = tower.spec ? tower.spec.name : tower.level < cfg.upgrades.length ? `Up ${cfg.upgrades[tower.level]}g` : "MAX";
        const ab = unlocked ? ` · ${ability.name} ${Math.ceil(tower.abilityCooldown || 0) > 0 ? Math.ceil(tower.abilityCooldown) + "s" : "ready"}` : "";
        return `${cfg.name} L${tower.level + 1}: dmg ${dmg} / ${rate.toFixed(2)}s / rng ${range}. ${up}. Sell ${refund}g.${ab}`;
      }
      if (this.waveActive) return `${this.queue.length} queued, ${this.enemies.length} alive. Defend the gate.`;
      if (this.waveIndex === 0 && this.towers.length < 2) return "Two glowing pads. Then CALL — early gold.";
      return "CALL for early gold. Upgrade. Command the hero.";
    }

    endGame(victory) {
      if (this.gameEnded) return;
      this.gameEnded = true;
      const stars = victory ? this.computeStars() : 0;
      if (victory) this.recordVictory(stars);
      this.overlayActive = true;
      const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.88).setDepth(600);
      const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setDepth(600.5).setInteractive();

      const created = [shade, blocker];

      if (victory) {
        const panelShadow = this.add.rectangle(W / 2, 326, 396, 276, 0x050704, 0.65).setDepth(600.8);
        const panelWood = this.add.rectangle(W / 2, 320, 390, 270, 0x2c1f14, 1).setStrokeStyle(4, 0x5a3e26).setDepth(600.9);
        const panelGold = this.add.rectangle(W / 2, 320, 378, 258).setStrokeStyle(2, 0xe6d282, 0.85).setDepth(600.95);
        const panelFill = this.add.rectangle(W / 2, 320, 366, 246, 0xf4e6c8, 1).setStrokeStyle(1.5, 0x8a6a42).setDepth(601);

        const decorG = this.add.graphics().setDepth(601.05);
        decorG.lineStyle(2, 0xc8a450, 0.8);
        decorG.beginPath();
        decorG.moveTo(W / 2 - 130, 256);
        decorG.lineTo(W / 2 + 130, 256);
        decorG.strokePath();

        for (const [cx, cy] of [
          [W / 2 - 175, 203],
          [W / 2 + 175, 203],
          [W / 2 - 175, 437],
          [W / 2 + 175, 437],
        ]) {
          decorG.fillStyle(0xe6d282, 1);
          decorG.fillCircle(cx, cy, 4);
          decorG.lineStyle(1, 0x4a321c, 1);
          decorG.strokeCircle(cx, cy, 4);
        }

        created.push(panelShadow, panelWood, panelGold, panelFill, decorG);
      } else {
        const panelShadow = this.add.rectangle(W / 2, 326, 396, 276, 0x000000, 0.75).setDepth(600.8);
        const panelFrame = this.add.rectangle(W / 2, 320, 390, 270, 0x161113, 1).setStrokeStyle(4, 0x3d292a).setDepth(600.9);
        const panelFill = this.add.rectangle(W / 2, 320, 376, 256, 0x221a1b, 1).setStrokeStyle(2, 0x4d3031).setDepth(601);

        const topSootBar = this.add.rectangle(W / 2, 230, 366, 52, 0x0f0b0c, 0.94).setStrokeStyle(1.5, 0x3d2020).setDepth(601.05);
        const botSootBar = this.add.rectangle(W / 2, 400, 366, 54, 0x0f0b0c, 0.94).setStrokeStyle(1.5, 0x3d2020).setDepth(601.05);

        const crackG = this.add.graphics().setDepth(601.1);
        crackG.lineStyle(2, 0x6e2c2c, 0.85);
        crackG.beginPath();
        crackG.moveTo(W / 2 - 170, 210);
        crackG.lineTo(W / 2 - 130, 240);
        crackG.lineTo(W / 2 - 95, 225);
        crackG.strokePath();

        crackG.lineStyle(2, 0x5a2424, 0.85);
        crackG.beginPath();
        crackG.moveTo(W / 2 + 85, 248);
        crackG.lineTo(W / 2 + 125, 222);
        crackG.lineTo(W / 2 + 165, 258);
        crackG.strokePath();

        crackG.lineStyle(1.5, 0x733232, 0.7);
        crackG.beginPath();
        crackG.moveTo(W / 2 - 60, 310);
        crackG.lineTo(W / 2 - 20, 335);
        crackG.lineTo(W / 2 + 35, 320);
        crackG.strokePath();

        created.push(panelShadow, panelFrame, panelFill, topSootBar, botSootBar, crackG);
      }

      const title = this.add
        .text(W / 2, 230, victory ? "VICTORY" : "GATE LOST", {
          font: "bold 44px Cinzel",
          color: victory ? "#d4941e" : "#ff7f69",
          stroke: victory ? "#2b1704" : "#0f0404",
          strokeThickness: victory ? 5 : 7,
        })
        .setOrigin(0.5)
        .setDepth(601.3);
      const starLine = victory ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}  ${stars}/3 stars` : `Reached wave ${this.waveIndex + 1}`;
      const sub = this.add
        .text(W / 2, victory ? 268 : 292, victory ? `Campaign complete. ${starLine}` : starLine, {
          font: "18px 'Source Sans 3', Arial",
          color: victory ? "#3d2612" : "#e2d2c8",
          stroke: victory ? null : "#140808",
          strokeThickness: victory ? 0 : 3,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(601.3);

      if (victory) this.mountTalentPanel((obj) => created.push(obj), 318, 602);

      const btnY = victory ? 430 : 400;
      const btnShadow = this.add.rectangle(W / 2, btnY + 6, 180, 54, 0x050704, 0.62).setDepth(601.35);
      const btn = this.add.rectangle(W / 2, btnY, 180, 54, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282).setDepth(601.4);
      const btnShine = this.add.rectangle(W / 2, btnY - 13, 166, 12, 0xffffff, 0.17).setDepth(601.45);
      const btnLip = this.add.rectangle(W / 2, btnY + 18, 166, 9, 0x000000, 0.2).setDepth(601.45);
      const txt = this.add.text(W / 2, btnY - 2, "MAP SELECT", { font: "bold 18px Cinzel", color: "#fff7dc" }).setOrigin(0.5).setDepth(602);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.audio.stopAll();
        this.overlayActive = false;
        this.scene.restart({ mapIndex: 0, gold: 280, lives: 20, heroKind: this.heroKind, ironMode: this.ironMode });
      });
      this.audio.stopMusic();
      if (victory) {
        this.audio.play("start", 0.65);
        this.audio.tone(440, 0.3, "triangle", 0.06, 0);
        this.audio.tone(554.37, 0.3, "triangle", 0.06, 0.04);
        this.audio.tone(659.25, 0.35, "sine", 0.07, 0.08);
        this.audio.tone(880, 0.45, "sine", 0.08, 0.12);
      } else {
        this.audio.play("fail", 0.6);
        this.audio.tone(240, 0.18, "sawtooth", 0.08, 0);
        this.audio.tone(196, 0.22, "sawtooth", 0.08, 0.1);
        this.audio.tone(146, 0.3, "sawtooth", 0.09, 0.2);
      }
      created.push(title, sub, btnShadow, btn, btnShine, btnLip, txt);
      return created;
    }

    countPerfectStars() {
      const results = this.campaign?.results || {};
      return Object.values(results).filter((r) => (r?.stars || 0) >= 3).length;
    }

    totalCampaignStars() {
      const results = this.campaign?.results || {};
      return Object.values(results).reduce((sum, r) => sum + (r?.stars || 0), 0);
    }

    spellRank() {
      const stars = this.totalCampaignStars();
      if (stars >= 6) return 3;
      if (stars >= 3) return 2;
      return 1;
    }

    starBonusLives() {
      return this.countPerfectStars() > 0 ? 1 : 0;
    }

    computeStars() {
      if (this.lives >= 16) return 3;
      if (this.lives >= 10) return 2;
      return 1;
    }

    talentApi() {
      return window.KRCTalents || null;
    }

    syncTalentMods() {
      const api = this.talentApi();
      const ids = api?.TALENTS?.map((talent) => talent.id);
      this.talentMods = api?.applyTalents?.(this.campaign, ids) || {
        gold: 1,
        soldierHp: 1,
        rate: 1,
        mageDmg: 1,
        meteor: 1,
        heroRespawn: 1,
      };
      return this.talentMods;
    }

    recordVictory(stars) {
      if (this._winRecorded) return this.campaign;
      this.campaign = window.KRCCampaign.recordWin(this.campaign, this.mapIndex, stars, this.gold);
      window.KRCCampaign.save(this.campaign);
      this._winRecorded = true;
      return this.campaign;
    }

    talentSpendLabel(talent) {
      const rank = this.campaign?.talents?.[talent.id] || 0;
      return `${talent.name}\n${talent.cost}★ TAP  ${rank}/${talent.maxRank}`;
    }

    recommendedTalents(limit = 3) {
      const talents = this.talentApi()?.TALENTS || [];
      const ranks = this.campaign?.talents || {};
      const wallet = this.campaign?.earnedStars || 0;
      const open = talents.filter((talent) => (ranks[talent.id] || 0) < talent.maxRank);
      open.sort((a, b) => {
        const aAff = wallet >= a.cost ? 0 : 1;
        const bAff = wallet >= b.cost ? 0 : 1;
        if (aAff !== bAff) return aAff - bAff;
        return a.cost - b.cost || a.id.localeCompare(b.id);
      });
      const picked = open.slice(0, limit);
      for (const talent of talents) {
        if (picked.length >= limit) break;
        if (!picked.some((row) => row.id === talent.id)) picked.push(talent);
      }
      return picked;
    }

    trySpendTalent(talentId) {
      const api = this.talentApi();
      if (!api?.spendStar) return;
      const result = api.spendStar(this.campaign, talentId);
      if (!result?.ok) {
        this.say("Cannot spend that star.");
        this.audio.playLayered?.("uiError");
        return;
      }
      this.campaign = result.state;
      window.KRCCampaign.save(this.campaign);
      this.refreshTalentPanel();
      this.say("Talent ranked up.");
    }

    confirmTalentReset() {
      const now = this.time?.now || Date.now();
      if ((this._talentResetArmedUntil || 0) > now) {
        this._talentResetArmedUntil = 0;
        const api = this.talentApi();
        if (!api?.refundAll) return;
        this.campaign = api.refundAll(this.campaign);
        window.KRCCampaign.save(this.campaign);
        this.syncTalentMods();
        this.refreshTalentPanel();
        this.say("Talents refunded.");
        return;
      }
      this._talentResetArmedUntil = now + 2500;
      this.say("Tap RESET again to refund all stars.");
    }

    refreshTalentPanel() {
      const stars = Math.max(0, this.campaign?.earnedStars || 0);
      this._talentHoardText?.setText?.(`Talent hoard: ${stars} stars`);
      const recs = this.recommendedTalents(3);
      (this._talentSpendBtns || []).forEach((chip, index) => {
        const talent = recs[index] || this.talentApi()?.TALENTS?.find((row) => row.id === chip.talentId);
        if (talent) {
          chip.talentId = talent.id;
          chip.txt?.setText?.(this.talentSpendLabel(talent));
        }
      });
    }

    mountTalentPanel(add, y, depth) {
      const api = this.talentApi();
      if (!api) return [];
      const parts = [];
      const push = (obj) => {
        if (!obj) return;
        parts.push(obj);
        add(obj);
      };
      const stars = Math.max(0, this.campaign?.earnedStars || 0);
      const hoard = this.add
        .text(W / 2, y, `Talent hoard: ${stars} stars`, {
          font: "bold 13px Cinzel",
          color: "#3d2612",
        })
        .setOrigin(0.5)
        .setDepth(depth);
      push(hoard);
      this._talentHoardText = hoard;
      this._talentSpendBtns = [];
      const recs = this.recommendedTalents(3);
      recs.forEach((talent, index) => {
        const x = W / 2 + (index - 1) * 118;
        const bg = this.add
          .rectangle(x, y + 36, 110, 32, 0x4a6238, 1)
          .setStrokeStyle(2, 0xe6d282)
          .setDepth(depth)
          .setInteractive({ useHandCursor: true });
        const txt = this.add
          .text(x, y + 36, this.talentSpendLabel(talent), {
            font: "bold 9px Cinzel",
            color: "#fff7dc",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(depth + 0.2);
        const chip = { bg, txt, talentId: talent.id };
        bg.on("pointerdown", () => this.trySpendTalent(chip.talentId));
        this._talentSpendBtns.push(chip);
        push(bg);
        push(txt);
      });
      const resetBg = this.add
        .rectangle(W / 2, y + 72, 120, 26, 0x5a3a32, 1)
        .setStrokeStyle(2, 0xe6d282)
        .setDepth(depth)
        .setInteractive({ useHandCursor: true });
      const resetTxt = this.add
        .text(W / 2, y + 72, "RESET", {
          font: "bold 11px Cinzel",
          color: "#fff7dc",
        })
        .setOrigin(0.5)
        .setDepth(depth + 0.2);
      resetBg.on("pointerdown", () => this.confirmTalentReset());
      push(resetBg);
      push(resetTxt);
      return parts;
    }

    showMapClearOverlay(stars) {
      this.overlayActive = true;
      this.overlay = this.add.container(0, 0).setDepth(580);
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x0c120b, 0.86));
      this.overlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive());

      const panelShadow = this.add.rectangle(W / 2, 361, 416, 376, 0x050704, 0.65);
      const panelWood = this.add.rectangle(W / 2, 355, 410, 370, 0x2c1f14, 1).setStrokeStyle(4, 0x5a3e26);
      const panelGold = this.add.rectangle(W / 2, 355, 398, 358).setStrokeStyle(2, 0xe6d282, 0.85);
      const panelFill = this.add.rectangle(W / 2, 355, 386, 346, 0xf4e6c8, 1).setStrokeStyle(1.5, 0x8a6a42);

      const decorG = this.add.graphics();
      decorG.lineStyle(2, 0xc8a450, 0.8);
      decorG.beginPath();
      decorG.moveTo(W / 2 - 140, 242);
      decorG.lineTo(W / 2 + 140, 242);
      decorG.strokePath();

      for (const [cx, cy] of [
        [W / 2 - 185, 200],
        [W / 2 + 185, 200],
        [W / 2 - 185, 490],
        [W / 2 + 185, 490],
      ]) {
        decorG.fillStyle(0xe6d282, 1);
        decorG.fillCircle(cx, cy, 4);
        decorG.lineStyle(1, 0x4a321c, 1);
        decorG.strokeCircle(cx, cy, 4);
      }

      this.overlay.add([panelShadow, panelWood, panelGold, panelFill, decorG]);

      this.overlay.add(
        this.add
          .text(W / 2, 218, `${this.map.name} CLEARED`, {
            font: "bold 28px Cinzel",
            color: "#d4941e",
            stroke: "#2b1704",
            strokeThickness: 5,
          })
          .setOrigin(0.5)
      );
      this.overlay.add(
        this.add
          .text(W / 2, 268, `${"★".repeat(stars)}${"☆".repeat(3 - stars)}  ${stars}/3 stars`, {
            font: "22px 'Source Sans 3', Arial",
            color: "#3d2612",
          })
          .setOrigin(0.5)
      );
      this.overlay.add(
        this.add
          .text(W / 2, 292, "Next map unlocked. Carry some gold and lives forward.", {
            font: "14px 'Source Sans 3', Arial",
            color: "#4a321a",
            align: "center",
            wordWrap: { width: 340 },
          })
          .setOrigin(0.5)
      );
      this.mountTalentPanel((obj) => this.overlay.add(obj), 328, 590);
      const next = this.add.rectangle(W / 2, 448, 200, 52, 0x6a8b42, 1).setStrokeStyle(3, 0xe6d282);
      const nextText = this.add.text(W / 2, 446, "NEXT MAP", { font: "bold 18px Cinzel", color: "#fff7dc" }).setOrigin(0.5);
      next.setInteractive({ useHandCursor: true });
      next.on("pointerdown", () => {
        this.overlayActive = false;
        this.overlay.destroy();
        this.scene.restart({
          mapIndex: this.mapIndex + 1,
          gold: Math.min(this.gold + 180, 650),
          lives: this.ironMode ? 1 : Math.min(20, this.lives + 4),
          heroKind: this.heroKind,
          ironMode: this.ironMode,
        });
      });
      const menu = this.add.rectangle(W / 2, 508, 200, 40, 0x334657, 1).setStrokeStyle(2, 0xb9d7ec, 0.7);
      const menuText = this.add.text(W / 2, 506, "MAP SELECT", { font: "bold 14px Cinzel", color: "#e8f5ff" }).setOrigin(0.5);
      menu.setInteractive({ useHandCursor: true });
      menu.on("pointerdown", () => {
        this.overlayActive = false;
        this.overlay.destroy();
        this.scene.restart({ mapIndex: 0, gold: 280, lives: 20, heroKind: this.heroKind, ironMode: this.ironMode });
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
      this.ambienceOn = false; this.ambienceId = 0; this.ambienceClock = 0; this.lastAmbience = null;
      this.muted = false;
      this.musicVolume = typeof scene?.settings?.musicVolume === "number" ? scene.settings.musicVolume : 0.6;
      this.sfxVolume = typeof scene?.settings?.sfxVolume === "number" ? scene.settings.sfxVolume : 1.0;
      this.samples = {};
      const keys = ["shoot", "impact", "boom", "start", "ready", "fail", "magic", "music"];
      for (const key of keys) {
        if (scene.cache.audio.exists(`sfx_${key}`)) {
          this.samples[key] = scene.sound.add(`sfx_${key}`, {
            volume: key === "music" ? 0.11 * this.musicVolume : 0.32 * this.sfxVolume,
            loop: key === "music",
          });
        }
      }
    }

    setMuted(value) {
      this.muted = !!value;
      this.scene.sound.mute = this.muted;
      if (this.muted) {
        this.stopMusic();
        this.stopAmbience();
      }
    }

    setMix(musicVolume, sfxVolume) {
      if (typeof musicVolume === "number" && !isNaN(musicVolume)) {
        this.musicVolume = Math.max(0, Math.min(1, musicVolume));
      }
      if (typeof sfxVolume === "number" && !isNaN(sfxVolume)) {
        this.sfxVolume = Math.max(0, Math.min(1, sfxVolume));
      }
      if (this.samples.music && this.samples.music.isPlaying) {
        const baseVol = 0.09 * this.musicVolume;
        this.samples.music.setVolume(baseVol);
      }
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
      const v = volume * (this.sfxVolume !== undefined ? this.sfxVolume : 1);
      const sample = this.samples[name];
      // Layered sound system: combine Kenney clips with WebAudio tones for richness
      switch (name) {
        case "shoot": // Archer tower — whoosh + thwip + tip
          if (sample) sample.play({ volume: v * 0.8, rate });
          this.tone(320, 0.08, "triangle", v * 0.15);
          this.tone(800, 0.04, "triangle", v * 0.06);
          break;
        case "magic": // Mage tower — spell + shimmer + sparkle
          if (sample) sample.play({ volume: v * 0.7, rate });
          this.tone(520, 0.1, "sine", v * 0.1);
          this.tone(1200, 0.06, "sine", v * 0.05);
          break;
        case "boom": // Artillery — explosion + rumble + sub-bass
          if (sample) sample.play({ volume: Math.min(1, v * 0.9), rate });
          this.tone(80, 0.15, "sawtooth", v * 0.12);
          this.tone(120, 0.08, "triangle", v * 0.1);
          break;
        case "impact": // Enemy hit/death — thud + damage layer
          if (sample) sample.play({ volume: Math.min(1, v * 0.85), rate });
          this.tone(200, 0.06, "triangle", v * 0.08);
          break;
        case "ready": // Build/upgrade — click + chime
          if (sample) sample.play({ volume: Math.min(1, v * 0.85), rate });
          this.tone(600, 0.04, "triangle", v * 0.07);
          break;
        case "start": // Wave start — fanfare + rise
          if (sample) sample.play({ volume: Math.min(1, v * 0.85), rate });
          this.tone(440, 0.08, "sine", v * 0.08, 0);
          this.tone(554, 0.08, "sine", v * 0.07, 0.04);
          this.tone(659, 0.12, "sine", v * 0.06, 0.08);
          break;
        case "fail": // Game over — descending tone
          if (sample) sample.play({ volume: Math.min(1, v * 0.9), rate });
          this.tone(260, 0.15, "sawtooth", v * 0.08, 0);
          this.tone(200, 0.18, "sawtooth", v * 0.08, 0.08);
          this.tone(150, 0.25, "sawtooth", v * 0.09, 0.16);
          break;
        default: // Fallback for unknown sounds
          if (sample) {
            try { sample.play({ volume: v, rate }); } catch (_e) {}
          } else {
            this.tone(name === "boom" ? 120 : name === "magic" ? 520 : 320, 0.08, name === "boom" ? "sawtooth" : "triangle", v * 0.12);
          }
      }
    }

    // Layered sound for specific events (tower type aware)
    playLayered(type, volume = 0.25) {
      this.lastLayered = type;
      if (type === "uiClick") this.lastUiTick = "wood";
      if (this.muted) return;
      const v = volume * (this.sfxVolume !== undefined ? this.sfxVolume : 1);
      switch (type) {
        case "archerShoot": // Archer tower shoot
          if (this.samples.shoot) this.samples.shoot.play({ volume: v * 0.7, rate: 1 });
          this.tone(800, 0.04, "triangle", v * 0.06);
          this.tone(1600, 0.03, "triangle", v * 0.04);
          break;
        case "mageShoot": // Mage tower shoot
          if (this.samples.magic) this.samples.magic.play({ volume: v * 0.6, rate: 1 });
          this.tone(1200, 0.06, "sine", v * 0.05);
          this.tone(480, 0.08, "sine", v * 0.04);
          break;
        case "artilleryShoot": // Artillery tower shoot
          if (this.samples.boom) this.samples.boom.play({ volume: v * 0.5, rate: 0.9 });
          this.tone(80, 0.12, "sawtooth", v * 0.08);
          this.tone(40, 0.16, "sawtooth", v * 0.06);
          break;
        case "guardStrike": // Barracks melee strike
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.55, rate: 0.92 });
          this.tone(220, 0.05, "square", v * 0.05);
          break;
        case "enemyHit": // Enemy takes damage
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.5, rate: 1 });
          break;
        case "enemyDeath": // Enemy dies — thud + fade
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.6, rate: 1 });
          if (this.samples.boom) this.samples.boom.play({ volume: v * 0.2, rate: 0.8 });
          this.tone(400, 0.15, "sine", v * 0.06);
          break;
        case "towerBuild": // Tower placed
          if (this.samples.ready) this.samples.ready.play({ volume: v * 0.6, rate: 1 });
          if (this.samples.start) this.samples.start.play({ volume: v * 0.15, rate: 1.2 });
          break;
        case "towerUpgrade": // Tower upgraded — chime sweep
          if (this.samples.ready) this.samples.ready.play({ volume: v * 0.7, rate: 1 });
          this.tone(300, 0.08, "sine", v * 0.06);
          this.tone(600, 0.08, "sine", v * 0.05);
          break;
        case "towerSell": // Tower sold — coin jingle
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.5, rate: 1 });
          this.tone(800, 0.04, "triangle", v * 0.05);
          this.tone(1200, 0.04, "triangle", v * 0.04);
          break;
        case "meteorSpell": // Meteor spell
          if (this.samples.boom) this.samples.boom.play({ volume: v * 0.7, rate: 1 });
          this.tone(150, 0.2, "sawtooth", v * 0.08);
          break;
        case "frostSpell": // Frost spell
          if (this.samples.magic) this.samples.magic.play({ volume: v * 0.6, rate: 1 });
          this.tone(1400, 0.08, "sine", v * 0.05);
          break;
        case "rallySpell": // Rally spell
          if (this.samples.ready) this.samples.ready.play({ volume: v * 0.6, rate: 1 });
          this.tone(440, 0.1, "sine", v * 0.05);
          this.tone(554, 0.1, "sine", v * 0.04);
          break;
        case "chargeAbility": // Hero charge — speed sweep
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.6, rate: 1 });
          this.tone(200, 0.05, "sawtooth", v * 0.06);
          this.tone(800, 0.05, "sawtooth", v * 0.04);
          break;
        case "bannerAbility": // Hero banner — warm chord
          if (this.samples.ready) this.samples.ready.play({ volume: v * 0.6, rate: 1 });
          this.tone(440, 0.12, "sine", v * 0.05);
          this.tone(554, 0.12, "sine", v * 0.04);
          break;
        case "healAbility": // Hero heal — gentle sweep
          if (this.samples.magic) this.samples.magic.play({ volume: v * 0.5, rate: 1 });
          this.tone(600, 0.08, "sine", v * 0.05);
          this.tone(400, 0.08, "sine", v * 0.04);
          break;
        case "uiClick": // UI button click — quiet wood knock
          this.tone(180, 0.018, "triangle", v * 0.08);
          this.tone(110, 0.028, "sawtooth", v * 0.06, 0.008);
          if (this.samples.impact) this.samples.impact.play({ volume: v * 0.08, rate: 2.2 });
          break;
        case "uiError": // Error/no-target buzz — add a Kenney layer if available
          this.tone(150, 0.1, "sawtooth", v * 0.06);
          if (this.samples.fail) this.samples.fail.play({ volume: v * 0.15, rate: 0.8 });
          break;
        default: // Fallback to standard play
          this.play(type, volume);
      }
    }

    startMusic() {
      if (this.muted) return;
      const music = this.samples.music;
      if (!music || this.musicStarted) return;
      this.musicStarted = true;
      try {
        music.play({ volume: 0.09 * this.musicVolume, loop: true });
      } catch (_e) {
        this.musicStarted = false;
      }
    }

    stopMusic() {
      const music = this.samples.music;
      if (music?.isPlaying) music.stop();
      this.musicStarted = false;
    }

    riseOnCall() {
      this.lastMusicCue = "rise";
      if (this.muted) return;
      const music = this.samples.music;
      if (music?.isPlaying) {
        music.setRate(1.12);
        music.setVolume(0.14 * this.musicVolume);
      }
      this.tone(196, 0.12, "sawtooth", 0.02 * this.musicVolume);
      this.tone(294, 0.1, "triangle", 0.012 * this.musicVolume, 0.04);
    }

    fallOnCalm() {
      this.lastMusicCue = "fall";
      if (this.muted) return;
      const music = this.samples.music;
      if (music?.isPlaying) {
        music.setRate(0.96);
        music.setVolume(0.09 * this.musicVolume);
      }
    }

    startAmbience(mapIndex) {
      this.ambienceId = mapIndex | 0;
      this.lastAmbience = ["forest", "stone", "marsh", "gale", "ash"][this.ambienceId] || "forest";
      this.ambienceOn = !this.muted && !this.scene.settings?.reducedMotion;
      this.ambienceClock = 0;
    }

    stopAmbience() {
      this.ambienceOn = false;
      this.lastAmbience = null;
    }

    ambience(dt) {
      if (this.muted || this.scene.settings?.reducedMotion || !this.ambienceOn) return;
      this.ambienceClock -= dt;
      if (this.ambienceClock > 0) return;
      this.ambienceClock = this.scene.waveActive ? 1.15 : 2.4;
      const beds = {
        0: [196, 247],
        1: [110, 147],
        2: [82, 98],
        3: [220, 330],
        4: [98, 73],
      };
      const notes = beds[this.ambienceId] || beds[0];
      this.tone(notes[0], 0.18, "sine", 0.004 * this.musicVolume);
      this.tone(notes[1], 0.22, "triangle", 0.003 * this.musicVolume, 0.05);
    }

    stopAll() {
      for (const sample of Object.values(this.samples)) {
        if (sample?.isPlaying) sample.stop();
      }
      this.musicStarted = false;
      this.stopAmbience();
    }

    tone(freq, duration = 0.08, type = "square", volume = 0.025, delay = 0) {
      if (this.muted || !this.ctx) return;
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
      if (this.muted) return;
      if (this.musicStarted) {
        const music = this.samples.music;
        if (music?.isPlaying) {
          const targetRate = urgent ? 1.12 : 0.96;
          const targetVol = (urgent ? 0.14 : 0.09) * this.musicVolume;
          music.setRate(Phaser.Math.Linear(music.rate || 1, targetRate, Math.min(1, dt * 2.5)));
          music.setVolume(Phaser.Math.Linear(music.volume || (0.09 * this.musicVolume), targetVol, Math.min(1, dt * 2.2)));
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
      this.tone(note, urgent ? 0.055 : 0.09, "triangle", (urgent ? 0.014 : 0.007) * this.musicVolume);
      if (urgent) this.tone(note * 1.5, 0.03, "sine", 0.004 * this.musicVolume, 0.02);
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
    type: new URLSearchParams(window.location.search).has("canvas") ? Phaser.CANVAS : Phaser.AUTO,
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

  const boot = () => {
    if (window.__KRC_GAME__) return;
    const start = () => {
      if (window.__KRC_GAME__) return;
      window.__KRC_GAME__ = new Phaser.Game(config);
    };
    if (window.KRCTalents) {
      start();
      return;
    }
    const src = KRC_SCRIPT && KRC_SCRIPT.src;
    const url = src ? new URL("talent-tree.js", src).href : "src/talent-tree.js";
    import(url).then((mod) => {
      if (!window.KRCTalents) window.KRCTalents = mod.default || mod;
      start();
    }).catch(() => start());
  };
  if (document.readyState === "complete" || document.readyState === "interactive") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
