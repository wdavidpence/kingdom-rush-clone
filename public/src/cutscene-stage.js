/**
 * KRC v1.4.3 Cutscene Stage — Phaser storybook panel player + pure briefing helper.
 * Original Thornmere wording only. Does not copy any third-party IP.
 */

import {
  captionChunks,
  cutsceneReducer,
  createCutsceneScript,
} from "./cutscene-core.js";

const TRAIT_ORDER = Object.freeze(["ARM", "FLY", "SWM", "CTL"]);

const TYPE_TRAIT = Object.freeze({
  brute: "ARM",
  shield: "ARM",
  titan: "ARM",
  boss: "ARM",
  flyer: "FLY",
  brood: "SWM",
  hexer: "CTL",
});

const BRIEFING_LINE = Object.freeze({
  ARM: "ARM plates lead this march. Pierce the vanguard.",
  FLY: "FLY over the lane. Cover the sky.",
  SWM: "SWM packs the road. Spread your fire.",
  CTL: "CTL hexes the field. Break their grip.",
});

/**
 * Pure helper: one short line naming the dominant enemy trait.
 * @param {object|Array} waveComp packs, trait counts, or type lists
 * @returns {string}
 */
export function buildBriefingText(waveComp) {
  const counts = { ARM: 0, FLY: 0, SWM: 0, CTL: 0 };

  const add = (trait, n = 1) => {
    const key = String(trait || "").toUpperCase();
    if (counts[key] !== undefined) counts[key] += Math.max(0, Number(n) || 0);
  };

  const addType = (type, n = 1) => {
    const trait = TYPE_TRAIT[String(type || "").toLowerCase()];
    if (trait) add(trait, n);
  };

  if (waveComp == null) {
    return "Hold the road. Mixed foes approach.";
  }

  if (typeof waveComp === "string") {
    add(waveComp, 1);
    addType(waveComp, 1);
  } else if (Array.isArray(waveComp)) {
    for (const entry of waveComp) {
      if (Array.isArray(entry)) addType(entry[0], entry[1]);
      else if (entry && typeof entry === "object") {
        if (entry.type) addType(entry.type, entry.count ?? entry.n ?? 1);
        else if (entry.trait) add(entry.trait, entry.count ?? entry.n ?? 1);
        else if (entry.packs) {
          for (const pack of entry.packs) addType(pack[0], pack[1]);
        }
      } else {
        addType(entry, 1);
        add(entry, 1);
      }
    }
  } else if (typeof waveComp === "object") {
    if (Array.isArray(waveComp.packs)) {
      for (const pack of waveComp.packs) addType(pack[0], pack[1]);
    }
    if (Array.isArray(waveComp.types)) {
      for (const t of waveComp.types) addType(t, 1);
    }
    for (const key of TRAIT_ORDER) {
      if (waveComp[key] != null) add(key, waveComp[key]);
    }
    const lower = {
      arm: waveComp.arm,
      fly: waveComp.fly,
      swm: waveComp.swm,
      ctl: waveComp.ctl,
    };
    for (const [k, v] of Object.entries(lower)) {
      if (v != null) add(k, v);
    }
  }

  let dominant = null;
  let best = 0;
  for (const key of TRAIT_ORDER) {
    if (counts[key] > best) {
      best = counts[key];
      dominant = key;
    }
  }

  if (!dominant || best <= 0) return "Hold the road. Mixed foes approach.";
  return BRIEFING_LINE[dominant];
}

const ART_PALETTE = Object.freeze({
  gate: [0x1a2218, 0x3a4a36, 0x6a5a40, 0x2a2014],
  road: [0x2a2014, 0x5a4030, 0x8a6a45, 0x1a140c],
  forest: [0x0e1a0c, 0x1e3a18, 0x2a4a20, 0x0a1208],
  marsh: [0x1a180c, 0x3a2a14, 0x5a3018, 0x2a1008],
  keep: [0x12141a, 0x2a2c34, 0x4a4440, 0x0c0c10],
  camp: [0x1a140c, 0x3a2818, 0x5a3a20, 0x2a180c],
  cliff: [0x1a1c20, 0x3a4048, 0x6a7078, 0x121418],
  warden: [0x1a0804, 0x4a1808, 0x8a3010, 0x2a0c06],
});

function coreApi() {
  if (typeof window !== "undefined" && window.KRCCutsceneCore) {
    return window.KRCCutsceneCore;
  }
  return { captionChunks, cutsceneReducer, createCutsceneScript };
}

function paintSilhouette(g, art, w, h) {
  const pal = ART_PALETTE[art] || ART_PALETTE.forest;
  if (g.fillGradientStyle) {
    g.fillGradientStyle(pal[0], pal[1], pal[2], pal[3], 1);
    g.fillRect(0, 0, w, h);
  } else {
    g.fillStyle(pal[0], 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(pal[1], 0.55);
    g.fillRect(0, h * 0.35, w, h * 0.65);
  }

  g.fillStyle(0x000000, 0.35);
  if (art === "gate") {
    g.fillRect(w * 0.22, h * 0.28, w * 0.56, h * 0.62);
    g.fillStyle(0x1a120c, 0.85);
    g.fillRect(w * 0.38, h * 0.42, w * 0.24, h * 0.48);
  } else if (art === "road") {
    g.fillStyle(0x6a5038, 0.8);
    g.fillTriangle(w * 0.1, h, w * 0.5, h * 0.38, w * 0.9, h);
  } else if (art === "forest") {
    g.fillStyle(0x0a1808, 0.9);
    g.fillTriangle(w * 0.12, h * 0.85, w * 0.28, h * 0.28, w * 0.44, h * 0.85);
    g.fillTriangle(w * 0.4, h * 0.9, w * 0.62, h * 0.22, w * 0.84, h * 0.9);
    g.fillTriangle(w * 0.7, h * 0.92, w * 0.88, h * 0.4, w * 1.02, h * 0.92);
  } else if (art === "marsh") {
    g.fillStyle(0x3a2010, 0.7);
    g.fillEllipse(w * 0.3, h * 0.72, w * 0.5, h * 0.16);
    g.fillEllipse(w * 0.7, h * 0.8, w * 0.46, h * 0.12);
    g.fillStyle(0x8a3010, 0.45);
    g.fillCircle(w * 0.62, h * 0.58, 18);
  } else if (art === "keep") {
    g.fillStyle(0x16141c, 0.92);
    g.fillRect(w * 0.28, h * 0.3, w * 0.44, h * 0.55);
    g.fillRect(w * 0.22, h * 0.22, w * 0.12, h * 0.63);
    g.fillRect(w * 0.66, h * 0.18, w * 0.12, h * 0.67);
  } else if (art === "camp") {
    g.fillStyle(0x2a1a0c, 0.9);
    g.fillTriangle(w * 0.18, h * 0.72, w * 0.32, h * 0.42, w * 0.46, h * 0.72);
    g.fillTriangle(w * 0.48, h * 0.78, w * 0.64, h * 0.46, w * 0.8, h * 0.78);
    g.fillStyle(0xcc5a20, 0.7);
    g.fillCircle(w * 0.5, h * 0.74, 10);
  } else if (art === "cliff") {
    g.fillStyle(0x2a3038, 0.92);
    g.fillTriangle(0, h, w * 0.4, h * 0.2, w * 0.55, h);
    g.fillTriangle(w * 0.3, h, w * 0.7, h * 0.12, w, h);
  } else if (art === "warden") {
    g.fillStyle(0x4a1008, 0.85);
    g.fillCircle(w * 0.5, h * 0.42, 54);
    g.fillStyle(0x120604, 0.92);
    g.fillTriangle(w * 0.28, h * 0.9, w * 0.5, h * 0.22, w * 0.72, h * 0.9);
    g.fillStyle(0xff623d, 0.55);
    g.fillCircle(w * 0.5, h * 0.4, 16);
  } else {
    g.fillRect(w * 0.2, h * 0.4, w * 0.6, h * 0.4);
  }
}

function tryArtPaint(scene, key, w, h) {
  const art = typeof window !== "undefined" ? window.KRCArt : null;
  const painter =
    art &&
    (art.paintPanel ||
      art.paintCutscene ||
      art[`paint_${key}`] ||
      art.paint);
  if (typeof painter !== "function") return null;
  try {
    return painter.call(art, scene, key, w, h);
  } catch {
    return null;
  }
}

export class CutsceneStage {
  constructor(scene, chapter, opts = {}) {
    this.scene = scene;
    this.chapter = chapter;
    this.opts = opts;
    this.reducedMotion = Boolean(opts.reducedMotion);
    this.onComplete = typeof opts.onComplete === "function" ? opts.onComplete : null;
    this.alive = true;
    this.state = null;
    this.chunks = [0, 0];
    this.shownChars = 0;
    this.container = null;
    this.artLayer = null;
    this.artGraphics = null;
    this.wipe = null;
    this.titleText = null;
    this.captionText = null;
    this.narratorText = null;
    this.skipBtn = null;
    this.hit = null;
    this._onUpdate = this._tick.bind(this);
    this._onAdvance = this._advance.bind(this);
    this._onSkip = this._skip.bind(this);
    this._onKey = this._onKeydown.bind(this);
  }

  start() {
    const scene = this.scene;
    const core = coreApi();
    const W = Number(scene.sys?.game?.config?.width) || 420;
    const H = Number(scene.sys?.game?.config?.height) || 760;
    this.W = W;
    this.H = H;

    const script = core.createCutsceneScript(this.chapter);
    this.script = script;
    this.state = core.cutsceneReducer(
      undefined,
      { type: "START", script, reducedMotion: this.reducedMotion },
      scene.time?.now || 0
    );

    this.container = scene.add.container(0, 0).setDepth(820);
    this.hit = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.01).setInteractive();
    this.hit.on("pointerdown", this._onAdvance);

    this.artLayer = scene.add.container(0, 0);
    const painted = tryArtPaint(scene, this.state.panel?.art, W, H);
    if (painted) {
      this.artLayer.add(painted);
    } else {
      this.artGraphics = scene.add.graphics();
      paintSilhouette(this.artGraphics, this.state.panel?.art || "forest", W, H);
      this.artLayer.add(this.artGraphics);
    }

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, 0x050804, 0.28);
    const plate = scene.add.rectangle(W / 2, H - 118, W - 28, 168, 0x1a140c, 0.88).setStrokeStyle(2, 0xd8b548, 0.85);
    const plateInner = scene.add.rectangle(W / 2, H - 118, W - 40, 154, 0xf4e6c8, 0.92).setStrokeStyle(1, 0x8a6a42, 0.7);

    this.titleText = scene.add
      .text(W / 2, 36, script.title || "", {
        font: "bold 18px Cinzel, serif",
        color: "#ffd866",
        stroke: "#1a1004",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: W - 48 },
      })
      .setOrigin(0.5, 0);

    this.narratorText = scene.add
      .text(28, H - 188, "", {
        font: "italic 12px 'Source Sans 3', Arial",
        color: "#6a4a28",
      })
      .setOrigin(0, 0);

    this.captionText = scene.add
      .text(28, H - 164, "", {
        font: "15px 'Source Sans 3', Arial",
        color: "#2a1a0c",
        wordWrap: { width: W - 56 },
        lineSpacing: 4,
      })
      .setOrigin(0, 0);

    this.wipe = scene.add.rectangle(0, H / 2, 0, H, 0x0c0804, 0.92).setOrigin(0, 0.5).setVisible(false);

    const skipBg = scene.add.rectangle(W - 40, 28, 64, 26, 0x24180e, 0.94).setStrokeStyle(1.5, 0xf5c85a, 0.9).setInteractive({ useHandCursor: true });
    const skipTxt = scene.add.text(W - 40, 28, "SKIP", { font: "bold 11px Cinzel, serif", color: "#fff4d8" }).setOrigin(0.5);
    skipBg.on("pointerdown", (pointer, lx, ly, event) => {
      event?.stopPropagation?.();
      this._onSkip();
    });
    this.skipBtn = skipBg;

    this.container.add([
      this.artLayer,
      veil,
      this.hit,
      plate,
      plateInner,
      this.titleText,
      this.narratorText,
      this.captionText,
      this.wipe,
      skipBg,
      skipTxt,
    ]);

    this._syncPanel(true);
    scene.events.on("update", this._onUpdate);
    scene.input.keyboard?.on("keydown-SPACE", this._onKey);
    this._tick();
    return this;
  }

  _onKeydown(event) {
    event?.preventDefault?.();
    this._advance();
  }

  _advance() {
    if (!this.alive || !this.state?.isPlaying) return;
    const core = coreApi();
    const now = this.scene.time?.now || 0;
    this.state = core.cutsceneReducer(this.state, { type: "ADVANCE" }, now);
    this._afterState();
  }

  _skip() {
    if (!this.alive) return;
    const core = coreApi();
    const now = this.scene.time?.now || 0;
    this.state = core.cutsceneReducer(this.state, { type: "SKIP" }, now);
    this._afterState();
  }

  _tick() {
    if (!this.alive || !this.state) return;
    const core = coreApi();
    const now = this.scene.time?.now || 0;
    this.state = core.cutsceneReducer(this.state, { type: "TICK" }, now);
    this._afterState();
  }

  _afterState() {
    if (!this.alive || !this.state) return;
    if (this.state.state === "finished" || this.state.phase === "finished") {
      const done = this.onComplete;
      this.destroy();
      done?.();
      return;
    }
    this._syncPanel(false);
  }

  _syncPanel(forceArt) {
    const panel = this.state.panel;
    if (!panel) return;
    const core = coreApi();
    const caption = panel.caption || "";
    this.chunks = core.captionChunks(caption, 34);

    if (forceArt || this._lastArt !== panel.art) {
      this._lastArt = panel.art;
      if (this.artGraphics) {
        this.artGraphics.clear();
        paintSilhouette(this.artGraphics, panel.art, this.W, this.H);
      }
    }

    const speak = panel.speak || this.script.narrator || "";
    this.narratorText?.setText(speak ? String(speak) : "");
    this.titleText?.setText(this.script.title || "");

    if (this.reducedMotion) {
      this.captionText?.setText(caption);
      this.artLayer?.setPosition(0, 0);
      this.wipe?.setVisible(false);
      this.container?.setAlpha(1);
      return;
    }

    const elapsed = this.state.elapsedPanelMs || 0;
    const idx = Math.min(this.chunks.length - 1, Math.max(0, Math.floor(elapsed / 34)));
    const chars = this.chunks[idx] || 0;
    this.shownChars = chars;
    this.captionText?.setText(caption.slice(0, chars));

    const pan = this.state.pan || [0, 0, 0, 0];
    let t = 0;
    if (this.state.phase === "holding") t = this.state.progress || 0;
    else if (this.state.phase === "panelOut") t = 1;
    const px = pan[0] + (pan[2] - pan[0]) * t;
    const py = pan[1] + (pan[3] - pan[1]) * t;
    this.artLayer?.setPosition(px, py);

    if (this.state.phase === "panelIn") {
      this.container?.setAlpha(this.state.progress || 0);
      this.wipe?.setVisible(false);
    } else if (this.state.phase === "panelOut") {
      this.container?.setAlpha(1);
      const p = this.state.progress || 0;
      this.wipe?.setVisible(true);
      this.wipe?.setSize(this.W * p, this.H);
    } else {
      this.container?.setAlpha(1);
      this.wipe?.setVisible(false);
    }
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    const scene = this.scene;
    scene?.events?.off("update", this._onUpdate);
    scene?.input?.keyboard?.off("keydown-SPACE", this._onKey);
    this.hit?.off("pointerdown", this._onAdvance);
    this.skipBtn?.off("pointerdown");
    this.hit?.disableInteractive?.();
    this.skipBtn?.disableInteractive?.();
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
    this.artLayer = null;
    this.artGraphics = null;
    this.wipe = null;
    this.titleText = null;
    this.captionText = null;
    this.narratorText = null;
    this.skipBtn = null;
    this.hit = null;
    this.state = null;
    this.scene = null;
    this.onComplete = null;
  }
}

export function playCutscene(scene, chapter, opts = {}) {
  const stage = new CutsceneStage(scene, chapter, opts);
  return stage.start();
}

if (typeof window !== "undefined") {
  window.KRCCutsceneStage = Object.freeze({
    buildBriefingText,
    CutsceneStage,
    play: playCutscene,
    playCutscene,
  });
}
