import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import {
  TALENTS,
  spendStar,
  refundAll,
  applyTalents,
} from "../public/src/talent-tree.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/talent-tree.js");
const campaignPath = path.join(testDir, "../public/src/campaign-state.js");
assert.equal(fs.existsSync(sourcePath), true, "talent-tree.js must exist");

const source = fs.readFileSync(sourcePath, "utf8");
assert.equal(/document|Math\.random|innerHTML/.test(source), false, "talent-tree.js stays pure");

function wallet(stars, talents = {}) {
  return JSON.parse(JSON.stringify({ earnedStars: stars, talents }));
}

test("TALENTS contract", () => {
  assert.equal(TALENTS.length, 6);
  const ids = TALENTS.map((t) => t.id);
  assert.deepEqual(ids, ["fordGold", "bulwarkVigor", "swiftQuiver", "runeDepth", "emberRain", "orderlyReturn"]);
  for (const talent of TALENTS) {
    assert.equal(typeof talent.name, "string");
    assert.ok(talent.cost >= 1 && talent.cost <= 3);
    assert.equal(talent.maxRank, 3);
    assert.equal(typeof talent.rankBonus, "number");
  }
});

test("spendStar happy path", () => {
  const start = wallet(5, { fordGold: 0 });
  const result = spendStar(start, "fordGold");
  assert.equal(result.ok, true);
  assert.equal(result.state.earnedStars, 4);
  assert.equal(result.state.talents.fordGold, 1);
  assert.equal(start.earnedStars, 5, "spend is atomic — input unchanged");
  assert.equal(start.talents.fordGold, 0);
  JSON.parse(JSON.stringify(result.state));
});

test("spendStar rejects unknown, poor, and capped", () => {
  assert.equal(spendStar(wallet(9), "notATalent").ok, false);
  assert.equal(spendStar(wallet(0), "fordGold").ok, false);
  assert.equal(spendStar(wallet(1), "emberRain").ok, false);
  const capped = spendStar(wallet(9, { fordGold: 3 }), "fordGold");
  assert.equal(capped.ok, false);
  assert.equal(capped.state.earnedStars, 9);
  assert.equal(capped.state.talents.fordGold, 3);
});

test("refundAll roundtrip returns full spend", () => {
  let state = wallet(10);
  const spent = [];
  for (const id of ["fordGold", "swiftQuiver", "emberRain"]) {
    const result = spendStar(state, id);
    assert.equal(result.ok, true);
    spent.push(TALENTS.find((t) => t.id === id).cost);
    state = result.state;
  }
  const total = spent.reduce((a, b) => a + b, 0);
  assert.equal(state.earnedStars, 10 - total);
  const refunded = refundAll(state);
  assert.equal(refunded.earnedStars, 10);
  for (const talent of TALENTS) assert.equal(refunded.talents[talent.id], 0);
  const empty = refundAll(wallet(0));
  assert.equal(empty.earnedStars, 0);
  assert.ok(empty.earnedStars >= 0);
});

test("applyTalents is monotonic with rank", () => {
  const zero = applyTalents(wallet(0), TALENTS.map((t) => t.id));
  assert.equal(zero.gold, 1);
  assert.equal(zero.soldierHp, 1);
  assert.equal(zero.rate, 1);
  assert.equal(zero.mageDmg, 1);
  assert.equal(zero.meteor, 1);
  assert.equal(zero.heroRespawn, 1);

  const r1 = applyTalents({ earnedStars: 0, talents: { fordGold: 1, swiftQuiver: 1, emberRain: 1, orderlyReturn: 1 } });
  const r2 = applyTalents({ earnedStars: 0, talents: { fordGold: 2, swiftQuiver: 2, emberRain: 2, orderlyReturn: 2 } });
  assert.ok(r1.gold > 1 && r2.gold >= r1.gold);
  assert.ok(r1.meteor > 1 && r2.meteor >= r1.meteor);
  assert.ok(r1.rate < 1 && r2.rate <= r1.rate);
  assert.ok(r1.heroRespawn < 1 && r2.heroRespawn <= r1.heroRespawn);
  assert.equal(r1.gold, 1.08);
  assert.equal(r2.gold, 1.16);
});

test("v1->v2 migration keeps stars 0 not NaN", () => {
  const mem = Object.create(null);
  const localStorageMock = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
    },
    setItem(key, value) {
      mem[key] = String(value);
    },
    removeItem(key) {
      delete mem[key];
    },
  };
  mem["krc.campaign.v1"] = JSON.stringify({
    unlocked: [true, false, false],
    results: { 0: { stars: 3, bestGold: 420 } },
  });
  const context = { window: { localStorage: localStorageMock } };
  vm.runInNewContext(fs.readFileSync(campaignPath, "utf8"), context, { filename: "campaign-state.js" });
  const loaded = context.window.KRCCampaign.load(3);
  assert.equal(Number.isNaN(loaded.earnedStars), false);
  assert.equal(loaded.earnedStars, 0);
  assert.equal(loaded.results[0].stars, 3);
  assert.equal(loaded.results[0].bestGold, 420);
  assert.deepEqual([...loaded.unlocked], [true, false, false]);
  assert.equal(loaded.talents.fordGold, 0);
  const saved = JSON.parse(mem["krc.campaign.v2"]);
  assert.equal(saved.earnedStars, 0);
  const again = context.window.KRCCampaign.recordWin(loaded, 0, 2, 100);
  assert.equal(again.earnedStars, 2);
  assert.equal(again.results[0].stars, 3);
  assert.equal(again.results[0].bestGold, 420);
});

console.log("talent-tree contract: PASS");
