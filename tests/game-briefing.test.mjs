import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBriefingText } from "../public/src/cutscene-stage.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/cutscene-stage.js");
assert.equal(fs.existsSync(sourcePath), true, "cutscene-stage.js must exist");

const forbiddenPatterns = [
  /linirea/i,
  /vez'?nan/i,
  /denas/i,
  /ironhide/i,
  /kingdom\s*rush/i,
];

test("buildBriefingText names the dominant trait", () => {
  const arm = buildBriefingText({ packs: [["shield", 10], ["scout", 2]] });
  assert.match(arm, /ARM/, "shield-heavy wave names ARM");

  const fly = buildBriefingText({ packs: [["flyer", 12], ["brute", 2]] });
  assert.match(fly, /FLY/, "flyer-heavy wave names FLY");

  const swm = buildBriefingText({ packs: [["brood", 14], ["scout", 4]] });
  assert.match(swm, /SWM/, "brood-heavy wave names SWM");

  const ctl = buildBriefingText({ packs: [["hexer", 6], ["brute", 1]] });
  assert.match(ctl, /CTL/, "hexer-heavy wave names CTL");

  const mixCounts = buildBriefingText({ ARM: 1, FLY: 9, SWM: 2, CTL: 0 });
  assert.match(mixCounts, /FLY/, "explicit FLY-dominant mix names FLY");

  const titanArm = buildBriefingText({ packs: [["titan", 3], ["ember", 2]] });
  assert.match(titanArm, /ARM/, "titan packs count as ARM");

  const empty = buildBriefingText({ packs: [["scout", 8]] });
  assert.equal(typeof empty, "string");
  assert.ok(empty.length > 0);
  assert.ok(empty.length < 80, "briefing stays one short line");
});

test("buildBriefingText never contains forbidden substrings", () => {
  const samples = [
    buildBriefingText({ packs: [["shield", 8], ["flyer", 2]] }),
    buildBriefingText({ packs: [["flyer", 10]] }),
    buildBriefingText({ packs: [["brood", 12]] }),
    buildBriefingText({ packs: [["hexer", 5]] }),
    buildBriefingText({ ARM: 4, FLY: 4, SWM: 4, CTL: 5 }),
    buildBriefingText(null),
    buildBriefingText({ packs: [["scout", 20]] }),
  ];

  for (const line of samples) {
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(line),
        false,
        `briefing "${line}" must not match ${pattern}`
      );
    }
  }

  const rawSource = fs.readFileSync(sourcePath, "utf8");
  for (const pattern of forbiddenPatterns) {
    assert.equal(
      pattern.test(rawSource),
      false,
      `cutscene-stage.js must not contain forbidden pattern ${pattern}`
    );
  }
});

console.log("game-briefing contract: PASS");
