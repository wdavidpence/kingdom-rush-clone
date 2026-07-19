import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "public/src/layout.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "layout.js" });
const layout = context.window.KRCLayout;
assert.deepEqual({ width: layout.width, height: layout.height, topHeight: layout.topHeight, shopY: layout.shopY, shopHeight: layout.shopHeight, pathWidth: layout.pathWidth }, { width: 420, height: 760, topHeight: 62, shopY: 642, shopHeight: 118, pathWidth: 46 });
assert.equal(layout.map.gateX, 397);
assert.equal(layout.map.gateY, 596);
console.log("layout contract: PASS");
