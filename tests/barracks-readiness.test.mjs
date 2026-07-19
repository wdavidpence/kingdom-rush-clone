import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const sourcePath = path.join(projectRoot, "public/src/barracks-readiness.js");

assert.equal(fs.existsSync(sourcePath), true, "barracks-readiness.js should exist");
const source = fs.readFileSync(sourcePath, "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "barracks-readiness.js" });

const api = context.window.KRCBarracksReadiness;
assert.ok(api, "helper should expose window.KRCBarracksReadiness");

assert.equal(api.wantedCount(0), 1);
assert.equal(api.wantedCount(1), 1);
assert.equal(api.wantedCount(2), 2);
assert.equal(api.wantedCount(3), 2);
assert.equal(api.wantedCount(4), 3);

assert.equal(api.respawnCooldown(0), 7.5);
assert.equal(api.respawnCooldown(1), 6.0);
assert.equal(api.respawnCooldown(4), 5.0);

const ready = api.readinessState({ alive: 2, wanted: 2, cooldown: 0 });
assert.equal(ready.status, "ready");
assert.equal(ready.missing, 0);
assert.equal(ready.progress, 1);
assert.equal(ready.label, "READY");

const training = api.readinessState({ alive: 0, wanted: 2, cooldown: 3, maxCooldown: 6 });
assert.equal(training.status, "training");
assert.equal(training.missing, 2);
assert.ok(training.progress > 0.45 && training.progress < 0.55);
assert.match(training.label, /TRN 3/);

const partial = api.readinessState({ alive: 1, wanted: 3, cooldown: 0, maxCooldown: 5 });
assert.equal(partial.status, "understrength");
assert.equal(partial.missing, 2);
assert.equal(partial.label, "1/3");

assert.equal(api.idleRegen(50, 100, 1, true), 50, "no regen while fighting");
assert.equal(api.idleRegen(50, 100, 1, false), 55, "regen while idle");
assert.equal(api.idleRegen(99, 100, 1, false), 100, "regen clamps to max");

const strike = api.meleeStrike({ attackerDamage: 12, bannerBonus: 1.18, isCritWindow: true });
assert.ok(strike.damage > 12);
assert.equal(strike.flash, "crit");

const normal = api.meleeStrike({ attackerDamage: 10, bannerBonus: 1, isCritWindow: false });
assert.equal(normal.damage, 10);
assert.equal(normal.flash, "hit");

console.log("barracks-readiness contract: PASS");
