import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(testDir, "../public/src/game.js"), "utf8");
const handler = source.slice(source.indexOf("    handlePointer("), source.indexOf("    chooseBuild("));

assert.ok(handler.indexOf("let closest = null") < handler.indexOf("const selectedTower"),
  "input must identify a build pad before treating a tap as a Guard rally command");
assert.match(handler, /selectedTower\?\.type === "barracks"[\s\S]*best > 34/,
  "a selected Guard should only consume taps away from build pads as rally commands");

console.log("game-input contract: PASS");
