import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await fs.readFile(path.join(root, "public/src/spell-fx.js"), "utf8");
const fx = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const { SPELL_FX, projectileTrails, createLcg, trailPoints, stageEvents } = fx;
assert.deepEqual(Object.keys(SPELL_FX), ["meteor", "frost", "rally"]);
assert.deepEqual(Object.keys(projectileTrails), ["arrow", "rune", "bomb"]);

for (const spell of Object.values(SPELL_FX)) {
  assert.ok(spell.durationMs >= 800 && spell.durationMs <= 2500);
  for (const stage of spell.stages) {
    if ("r" in stage) assert.ok(stage.r >= 2);
    if ("count" in stage) assert.ok(stage.count >= 1);
  }
}

// The exported plan is already safe if authored values are junk: clamping is held at the module boundary.
assert.equal(SPELL_FX.meteor.stages[0].r, 60);
assert.equal(SPELL_FX.meteor.stages[3].count, 7);
assert.equal(SPELL_FX.rally.durationMs, 1600);

const first = trailPoints("arrow", 8);
assert.deepEqual(first, trailPoints("arrow", 8));
assert.equal(first.length, 8);
assert.ok(first.every((point, index) => index === 0 || point.x > first[index - 1].x));
assert.deepEqual(trailPoints("not-a-trail"), []);
assert.deepEqual(trailPoints("arrow", "junk"), trailPoints("arrow", 8));

const rngA = createLcg(42);
const rngB = createLcg(42);
assert.deepEqual([rngA(), rngA(), rngA()], [rngB(), rngB(), rngB()]);

for (const [key, spell] of Object.entries(SPELL_FX)) {
  const fired = [];
  let elapsed = 0;
  for (let now = 0; now <= spell.durationMs; now += 25) {
    fired.push(...stageEvents(key, now, elapsed));
    elapsed = now;
  }
  assert.deepEqual(fired, spell.stages.map((stage) => stage.kind), `${key} stages should fire once`);
}
assert.deepEqual(stageEvents("unknown", 1000, 0), []);
assert.deepEqual(stageEvents("meteor", "junk", 0), []);

console.log("spell-fx contract: PASS");
