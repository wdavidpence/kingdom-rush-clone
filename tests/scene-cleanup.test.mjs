import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "public/src/scene-cleanup.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "scene-cleanup.js" });
const destroyed = [];
context.window.KRCSceneCleanup.destroyAll([{ destroy: () => destroyed.push("a") }, null, { destroy: () => destroyed.push("b") }]);
assert.deepEqual(destroyed, ["a", "b"]);
console.log("scene-cleanup contract: PASS");
