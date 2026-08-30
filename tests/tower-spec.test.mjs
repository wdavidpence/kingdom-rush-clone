import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SPEC_TREE, chooseSpec, specCost, familyForType } from "../public/src/tower-spec.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/tower-spec.js");
assert.equal(fs.existsSync(sourcePath), true, "tower-spec.js must exist");

test("SPEC_TREE exposes two specs per family", () => {
  assert.deepEqual(Object.keys(SPEC_TREE).sort(), ["artillery", "barracks", "mage", "rangers"]);
  assert.equal(SPEC_TREE.rangers[0].id, "falcon");
  assert.equal(SPEC_TREE.rangers[0].name, "Falcon Roost");
  assert.equal(SPEC_TREE.rangers[0].bonus.rate, 0.85);
  assert.equal(SPEC_TREE.rangers[1].id, "marksman");
  assert.equal(SPEC_TREE.mage[0].id, "storm");
  assert.equal(SPEC_TREE.mage[0].bonus.chain, true);
  assert.equal(SPEC_TREE.mage[1].id, "frost");
  assert.equal(SPEC_TREE.artillery[0].id, "siege");
  assert.equal(SPEC_TREE.artillery[1].id, "cluster");
  assert.equal(SPEC_TREE.artillery[1].bonus.shots, 2);
  assert.equal(SPEC_TREE.barracks[0].id, "bulwark");
  assert.equal(SPEC_TREE.barracks[1].id, "spearwall");
  assert.equal(familyForType("archer"), "rangers");
});

test("chooseSpec happy path at tier 4", () => {
  const picked = chooseSpec("rangers", null, 4, "falcon");
  assert.ok(picked);
  assert.equal(picked.id, "falcon");
  assert.equal(picked.name, "Falcon Roost");
  assert.equal(picked.bonus.rate, 0.85);

  const mage = chooseSpec("mage", undefined, 5, "frost");
  assert.equal(mage.id, "frost");
  assert.equal(mage.bonus.slow, 1.5);
});

test("chooseSpec rejects bad tier, family, and specId", () => {
  assert.equal(chooseSpec("rangers", null, 3, "falcon"), null);
  assert.equal(chooseSpec("rangers", null, 0, "falcon"), null);
  assert.equal(chooseSpec("rangers", null, 4, "nope"), null);
  assert.equal(chooseSpec("wizard", null, 4, "storm"), null);
  assert.equal(chooseSpec("rangers", "falcon", 4, "marksman"), null);
});

test("chooseSpec is idempotent on re-pick", () => {
  const first = chooseSpec("artillery", null, 4, "siege");
  const again = chooseSpec("artillery", "siege", 4, "siege");
  const viaObject = chooseSpec("artillery", first, 4, "siege");
  assert.equal(first.id, "siege");
  assert.equal(again.id, first.id);
  assert.equal(again.name, first.name);
  assert.equal(viaObject.id, "siege");
  assert.deepEqual(again.bonus, first.bonus);
});

test("specCost is fixed 260 gold", () => {
  assert.equal(specCost("rangers", 4), 260);
  assert.equal(specCost("mage", 99), 260);
  assert.equal(specCost("artillery", 4), 260);
  assert.equal(specCost("barracks", 4), 260);
});

const source = fs.readFileSync(sourcePath, "utf8");
assert.equal(/document|Math\.random|innerHTML/.test(source), false, "tower-spec.js stays pure");

console.log("tower-spec contract: PASS");
