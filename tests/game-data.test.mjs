import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const source = fs.readFileSync(path.join(projectRoot, "public/src/game-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "game-data.js" });

const data = context.window.KRCGameData;
assert.ok(data, "game data should be exposed at window.KRCGameData");
assert.equal(data.maps.length, 5, "campaign should retain all five maps");
assert.equal(data.maps[0].name, "Forest Gate");
assert.equal(data.maps[3].name, "Gale Reach");
assert.equal(data.maps[4].name, "Ash Spire");
assert.equal(data.waves.length, 10, "wave schedule should retain ten waves");
assert.deepEqual(Object.keys(data.towers).sort(), ["archer", "artillery", "barracks", "mage"]);
assert.deepEqual(Object.keys(data.enemies).sort(), ["boss", "brood", "brute", "ember", "flyer", "hexer", "scout", "shield", "titan"]);
assert.ok(data.enemies.hexer.aura && data.enemies.hexer.support, "hexer must be a support/control archetype with an aura");
assert.ok(data.enemies.boss.phases, "final boss must declare telegraphed phases");
assert.ok(data.waves.some((w) => w.packs.some(([type]) => type === "hexer")), "campaign waves must include the hexer support archetype");
assert.ok(data.waves[0].gold >= 20, "early-wave economy should fund opening builds");

const expectedTowerRoles = {
  archer: { role: "Rapid anti-air focus", targetRule: "First enemy; can target flying enemies", counterplay: "Use against fast or flying enemies; weak into armor." },
  mage: { role: "Armor-piercing control", targetRule: "First enemy; can target flying enemies", counterplay: "Use against armored enemies; slower shots need support." },
  artillery: { role: "Ground-area damage", targetRule: "First ground enemy; cannot target flying enemies", counterplay: "Use against swarms; pair with anti-air coverage." },
  barracks: { role: "Road blocking melee", targetRule: "Rally on the road; engage ground enemies", counterplay: "Use to hold chokepoints; cannot stop flying enemies." },
};
assert.deepEqual(
  Object.fromEntries(Object.entries(data.towers).map(([id, tower]) => [id, {
    role: tower.role,
    targetRule: tower.targetRule,
    counterplay: tower.counterplay,
  }])),
  expectedTowerRoles,
  "every tower must expose a concise, distinct tactical role, target rule, and counterplay cue"
);

for (const map of data.maps) {
  assert.ok(map.path.length >= 2, `${map.name} needs a traversable path`);
  assert.equal(map.pads.length, 8, `${map.name} needs eight build pads`);
}

for (const wave of data.waves) {
  for (const [enemyType, count] of wave.packs) {
    assert.ok(data.enemies[enemyType], `wave ${wave.label} references a known enemy`);
    assert.ok(count > 0, `wave ${wave.label} pack count must be positive`);
  }
}

console.log("game-data contract: PASS");
