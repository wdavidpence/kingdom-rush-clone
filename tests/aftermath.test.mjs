import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AftermathLedger } from "../public/src/aftermath.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/aftermath.js");
assert.equal(fs.existsSync(sourcePath), true, "aftermath.js must exist");

test("ledger cap defaults to 48 and drops overflow", () => {
  const ledger = new AftermathLedger();
  assert.equal(ledger.maxEntries, 48);
  for (let i = 0; i < 60; i += 1) {
    ledger.record({ kind: "corpse", x: i, y: i * 2, t: i, rot: 0, kind2: "scout" });
  }
  const snap = ledger.snapshot();
  assert.equal(snap.entries.length, 48);
  assert.equal(snap.entries[0].x, 12);
  assert.equal(snap.entries[47].x, 59);
});

test("FIFO eviction removes oldest first", () => {
  const ledger = new AftermathLedger(3);
  ledger.record({ kind: "corpse", x: 1, y: 0, t: 1, rot: 0.1, kind2: "scout" });
  ledger.record({ kind: "scorch", x: 2, y: 0, t: 2, rot: 0, kind2: "meteor" });
  ledger.record({ kind: "arrow", x: 3, y: 0, t: 3, rot: 1.2, kind2: "flyer" });
  const stored = ledger.record({ kind: "crater", x: 4, y: 0, t: 4, rot: 0, kind2: "meteor" });
  assert.equal(stored.kind, "crater");
  const snap = ledger.snapshot();
  assert.equal(snap.entries.length, 3);
  assert.deepEqual(
    snap.entries.map((e) => e.kind),
    ["scorch", "arrow", "crater"]
  );
  assert.equal(snap.entries[0].x, 2);
  const oldest = ledger.evictOldest();
  assert.equal(oldest.kind, "scorch");
  assert.equal(ledger.snapshot().entries.length, 2);
});

test("snapshot/restore roundtrip is save-safe and function-free", () => {
  const ledger = new AftermathLedger(48);
  ledger.record({ kind: "corpse", x: 100, y: 375, t: 9, rot: 0.25, kind2: "brute" });
  ledger.record({ kind: "scorch", x: 40, y: 80, t: 10, rot: 0, kind2: "frost" });
  const snap = ledger.snapshot();
  const json = JSON.stringify(snap);
  assert.equal(json.includes("function"), false);
  for (const entry of snap.entries) {
    for (const value of Object.values(entry)) {
      assert.equal(typeof value === "function", false);
    }
  }
  const restored = new AftermathLedger(8);
  restored.restore(json);
  assert.deepEqual(restored.snapshot().entries, snap.entries);
  assert.equal(restored.maxEntries, 48);
  restored.restore({
    maxEntries: 2,
    entries: [
      { kind: "arrow", x: 1, y: 2, t: 1, rot: 0, kind2: "flyer" },
      { kind: "corpse", x: 3, y: 4, t: 2, rot: 0, kind2: "scout" },
      { kind: "scorch", x: 5, y: 6, t: 3, rot: 0, kind2: "meteor" },
    ],
  });
  const trimmed = restored.snapshot().entries;
  assert.equal(trimmed.length, 2);
  assert.equal(trimmed[0].kind, "corpse");
  assert.equal(trimmed[1].kind, "scorch");
});

console.log("aftermath ledger contract: PASS");
