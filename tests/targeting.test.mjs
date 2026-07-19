import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const source = fs.readFileSync(path.join(projectRoot, "public/src/targeting.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "targeting.js" });

const targeting = context.window.KRCTargeting;
assert.ok(targeting, "targeting helpers should be exposed at window.KRCTargeting");

const pathPoints = [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }];
const tower = { x: 35, y: 65 };
const enemies = [
  { id: "enemy-early", x: 0, y: 80, seg: 0, dead: false, base: { flying: false } },
  { id: "enemy-late", x: 45, y: 100, seg: 1, dead: false, base: { flying: false } },
  { id: "enemy-flying", x: 90, y: 100, seg: 1, dead: false, base: { flying: true } },
  { id: "enemy-dead", x: 99, y: 100, seg: 1, dead: true, base: { flying: false } },
];

assert.equal(targeting.pathProgress(pathPoints, enemies[0]), 80, "progress should measure distance along the traversed path");
assert.equal(targeting.pathProgress(pathPoints, enemies[1]), 145, "later segments must outrank earlier segments regardless of screen coordinates");
assert.equal(
  targeting.findBestTarget({ path: pathPoints, tower, range: 90, enemies, canHitFlying: false }),
  enemies[1],
  "a ground-only tower should select the furthest eligible living ground enemy in range"
);
assert.equal(
  targeting.findBestTarget({ path: pathPoints, tower, range: 120, enemies, canHitFlying: true }),
  enemies[2],
  "a tower that can hit fliers should select the most progressed eligible flying enemy"
);

console.log("targeting contract: PASS");
