import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const sourcePath = path.join(projectRoot, "public/src/tower-abilities.js");
assert.equal(fs.existsSync(sourcePath), true, "tower-abilities.js should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "tower-abilities.js" });
const api = context.window.KRCTowerAbilities;
assert.ok(api, "window.KRCTowerAbilities required");

const archer = api.getAbility("archer");
assert.equal(archer.id, "volley");
assert.equal(archer.minLevel, 3);
assert.ok(archer.cooldown > 0);

assert.equal(api.isUnlocked("archer", 2), false);
assert.equal(api.isUnlocked("archer", 3), true);

assert.equal(api.canTrigger({ type: "mage", level: 4, abilityCooldown: 0 }, 1.0), true);
assert.equal(api.canTrigger({ type: "mage", level: 4, abilityCooldown: 2 }, 1.0), false);
assert.equal(api.canTrigger({ type: "mage", level: 1, abilityCooldown: 0 }, 1.0), false);

const next = api.afterTrigger({ type: "artillery", level: 4, abilityCooldown: 0 });
assert.ok(next.abilityCooldown >= api.getAbility("artillery").cooldown);
assert.equal(next.abilityId, "barrage");

const tick = api.tickCooldown(3.5, 1.25);
assert.equal(tick, 2.25);

const names = ["archer", "mage", "artillery", "barracks"].map((t) => api.getAbility(t).id);
assert.deepEqual(names, ["volley", "nova", "barrage", "holdfast"]);

console.log("tower-abilities contract: PASS");
