import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const sourcePath = path.join(projectRoot, "public/src/enemy-traits.js");
assert.equal(fs.existsSync(sourcePath), true, "enemy-traits.js should exist");
const source = fs.readFileSync(sourcePath, "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "enemy-traits.js" });
const api = context.window.KRCEnemyTraits;
assert.ok(api);

assert.equal(JSON.stringify(api.traitsFor({ armor: 0, flying: false }).map((t) => t.id)), "[]");
assert.equal(
  JSON.stringify(api.traitsFor({ armor: 3, flying: true, split: ["scout", 2] }).map((t) => t.id)),
  JSON.stringify(["armor", "flying", "swarm"])
);
assert.equal(
  JSON.stringify(api.traitsFor({ armor: 8, leak: 4, bounty: 45 }).map((t) => t.id)),
  JSON.stringify(["armor", "elite"])
);
assert.equal(
  JSON.stringify(api.traitsFor({ armor: 7, leak: 8, bounty: 120, name: "Warden" }).map((t) => t.id)),
  JSON.stringify(["armor", "elite"])
);

const label = api.badgeText(api.traitsFor({ armor: 6, flying: true }));
assert.match(label, /ARM/);
assert.match(label, /FLY/);

console.log("enemy-traits contract: PASS");
