import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..");
const source = fs.readFileSync(path.join(projectRoot, "public/src/rally-point.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "rally-point.js" });

const rally = context.window.KRCRallyPoint;
assert.ok(rally, "rally helper should be exposed at window.KRCRallyPoint");

const pathPoints = [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }];
assert.equal(JSON.stringify(rally.place(pathPoints, 36, 61)), JSON.stringify({ x: 0, y: 61, segment: 0 }),
  "a rally order should snap to the closest point on the traversable road"
);
assert.equal(JSON.stringify(rally.place(pathPoints, 74, 84)), JSON.stringify({ x: 74, y: 100, segment: 1 }),
  "a rally order should preserve its selected road segment for consistent visual placement"
);
assert.equal(rally.place([], 10, 10), null, "an invalid path must not create an unsafe rally order");

console.log("rally-point contract: PASS");
