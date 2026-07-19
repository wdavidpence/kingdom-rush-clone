import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(testDir, "../public/src/entity-state.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "entity-state.js" });

const registry = context.window.KRCEntityState.createRegistry();
const enemy = registry.create("enemy", { hp: 10 });
const tower = registry.create("tower", { level: 0 });
assert.equal(enemy.id, "enemy-1");
assert.equal(tower.id, "tower-2");
assert.equal(enemy.state, "active");
assert.equal(registry.isActive(enemy), true);
assert.equal(registry.transition(enemy, "dead"), true);
assert.equal(enemy.state, "dead");
assert.equal(registry.transition(enemy, "removed"), true);
assert.equal(registry.isActive(enemy), false);
assert.equal(registry.transition(enemy, "active"), false, "removed entities must not be revived");
console.log("entity-state contract: PASS");
