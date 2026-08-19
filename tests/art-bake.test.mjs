import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const artSourcePath = path.join(projectRoot, "public/src/krc-art.js");
assert.equal(fs.existsSync(artSourcePath), true, "krc-art.js should exist");

const artSource = fs.readFileSync(artSourcePath, "utf8");
const context = { window: {} };
vm.runInNewContext(artSource, context, { filename: "krc-art.js" });
const art = context.window.KRCArt;
assert.ok(art, "KRCArt should be defined on window");
assert.equal(typeof art.bake, "function", "KRCArt.bake should be a function");

// Mock Phaser Canvas / Context
const createdTextures = new Map();

class MockContext {
  constructor() {
    this.fillStyle = "#000";
    this.strokeStyle = "#000";
    this.lineWidth = 1;
    this.lineCap = "butt";
    this.lineJoin = "miter";
    this.font = "10px sans-serif";
    this.textAlign = "start";
    this.textBaseline = "alphabetic";
  }
  save() {}
  restore() {}
  rotate() {}
  scale() {}
  translate() {}
  setTransform() {}
  resetTransform() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}
  fillRect() {}
  strokeRect() {}
  clearRect() {}
  fill() {}
  stroke() {}
  fillText() {}
  strokeText() {}
  createLinearGradient() {
    return { addColorStop() {} };
  }
  createRadialGradient() {
    return { addColorStop() {} };
  }
}

class MockTexture {
  constructor(key, w, h) {
    this.key = key;
    this.width = w;
    this.height = h;
    this.ctx = new MockContext();
  }
  getContext() {
    return this.ctx;
  }
  refresh() {}
}

const sceneMock = {
  textures: {
    exists(key) {
      return createdTextures.has(key);
    },
    remove(key) {
      createdTextures.delete(key);
    },
    createCanvas(key, w, h) {
      const tex = new MockTexture(key, w, h);
      createdTextures.set(key, tex);
      return tex;
    },
  },
};

assert.doesNotThrow(() => {
  art.bake(sceneMock);
}, "KRCArt.bake should execute without throwing");

const requiredKeys = [
  "enemy_boss",
  "enemy_boss_idle",
  "enemy_boss_shield",
  "enemy_boss_rage",
  "enemy_boss_dead",
  "enemy_titan",
  "enemy_titan_w0",
  "enemy_titan_w1",
  "enemy_titan_w2",
  "enemy_titan_w3",
  "enemy_titan_enrage",
  "enemy_titan_dead",
  "fx_meteor",
  "fx_meteor_0",
  "fx_meteor_1",
  "fx_ice",
  "fx_ice_0",
  "fx_ice_1",
  "fx_rally",
  "fx_rally_0",
  "fx_rally_1",
  "projectile_arrow",
  "projectile_magic",
  "projectile_bomb",
  "fx_trail_arrow",
  "fx_trail_magic",
  "fx_trail_bomb",
  "fx_trail_smoke",
  "tile_dirt",
  "tile_stone",
  "tile_ember",
  "gate_arch",
  "gate_leak",
  "portrait_archer",
  "portrait_mage",
  "portrait_artillery",
  "portrait_barracks",
];

for (const key of requiredKeys) {
  assert.equal(createdTextures.has(key), true, `Texture "${key}" must be baked`);
}

console.log("art-bake contract: PASS");
