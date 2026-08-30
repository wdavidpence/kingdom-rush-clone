import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createCutsceneScript,
  cutsceneReducer,
  captionChunks,
} from "../public/src/cutscene-core.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/cutscene-core.js");
assert.equal(fs.existsSync(sourcePath), true, "cutscene-core.js must exist");

const sampleScript = Object.freeze({
  id: "test-intro",
  title: "Test Intro",
  narrator: "Captain Alder",
  panels: [
    {
      art: "gate",
      caption: "The gates of Thornmere stand strong against the encroaching wild.",
      speak: "Captain Alder",
      pan: [0, 0, 10, 0],
      minMs: 2400,
    },
    {
      art: "forest",
      caption: "Scouts report movement beneath the burning briars.",
      speak: "Thornwatch Scout",
      pan: [0, 5, 0, -5],
      minMs: 3000,
    },
  ],
});

test("script validation and normalization", () => {
  const normalized = createCutsceneScript(sampleScript);
  assert.equal(normalized.id, "test-intro");
  assert.equal(normalized.panels.length, 2);
  assert.deepEqual(normalized.panels[0].pan, [0, 0, 10, 0]);
  assert.equal(normalized.panels[0].minMs, 2400);
  assert.equal(normalized.panels[0].speak, "Captain Alder");

  // Defaults and minMs clamping
  const defaultScript = createCutsceneScript({
    panels: [
      { art: "road", caption: "Short hold", minMs: 100 },
      { art: "marsh", caption: "Long hold", minMs: 99999 },
      { art: "cliff", caption: "Default hold" },
    ],
  });
  assert.equal(defaultScript.panels[0].minMs, 2200, "minMs clamped to min 2200");
  assert.equal(defaultScript.panels[1].minMs, 12000, "minMs clamped to max 12000");
  assert.equal(defaultScript.panels[2].minMs, 5200, "minMs default 5200");
  assert.deepEqual(defaultScript.panels[2].pan, [0, 0, 0, 0], "default pan is [0,0,0,0]");

  // >= 1 panel validation
  assert.throws(() => createCutsceneScript({ panels: [] }), /at least 1 panel/);
  assert.throws(() => createCutsceneScript(null), /must be an object/);

  // Art registry validation
  assert.throws(
    () => createCutsceneScript({ panels: [{ art: "unknown_art", caption: "Valid" }] }),
    /registry keys/
  );

  // Custom registry list passed in
  const custom = createCutsceneScript(
    { panels: [{ art: "custom_bg", caption: "Valid" }] },
    ["custom_bg"]
  );
  assert.equal(custom.panels[0].art, "custom_bg");

  // Pan finite numbers validation
  assert.throws(
    () =>
      createCutsceneScript({
        panels: [{ art: "gate", caption: "Valid", pan: [0, 0, Infinity, 0] }],
      }),
    /finite numbers/
  );
  assert.throws(
    () =>
      createCutsceneScript({
        panels: [{ art: "gate", caption: "Valid", pan: [0, 0, 10] }],
      }),
    /finite numbers/
  );
});

test("reducer happy path", () => {
  const script = createCutsceneScript(sampleScript);
  let state = cutsceneReducer(undefined, { type: "START", script }, 1000);

  // 1. START -> panelIn (420ms fade)
  assert.equal(state.state, "panelIn");
  assert.equal(state.status, "panelIn");
  assert.equal(state.panelIndex, 0);
  assert.equal(state.canAdvance, false);
  assert.equal(state.isPlaying, true);
  assert.equal(state.phaseDurationMs, 420);

  // 2. TICK during panelIn
  state = cutsceneReducer(state, { type: "TICK" }, 1200);
  assert.equal(state.state, "panelIn");
  assert.equal(state.phaseElapsedMs, 200);
  assert.equal(state.canAdvance, false);

  // 3. TICK completes panelIn (at 420ms) -> holding
  state = cutsceneReducer(state, { type: "TICK" }, 1420);
  assert.equal(state.state, "holding");
  assert.equal(state.status, "holding");
  assert.equal(state.canAdvance, false, "canAdvance false before minMs");

  // 4. TICK during holding before minMs (panel minMs = 2400)
  state = cutsceneReducer(state, { type: "TICK" }, 2500);
  assert.equal(state.state, "holding");
  assert.equal(state.canAdvance, false);

  // 5. TICK reaches minMs (1000 + 2400 = 3400)
  state = cutsceneReducer(state, { type: "TICK" }, 3400);
  assert.equal(state.state, "holding");
  assert.equal(state.canAdvance, true, "canAdvance true once minMs elapsed");

  // 6. TICK never auto-advances
  state = cutsceneReducer(state, { type: "TICK" }, 5000);
  assert.equal(state.state, "holding", "TICK never auto-advances past holding");
  assert.equal(state.canAdvance, true);

  // 7. ADVANCE -> panelOut (360ms)
  state = cutsceneReducer(state, { type: "ADVANCE" }, 5000);
  assert.equal(state.state, "panelOut");
  assert.equal(state.status, "panelOut");
  assert.equal(state.phaseDurationMs, 360);

  // 8. TICK completes panelOut -> next panel (panelIndex 1)
  state = cutsceneReducer(state, { type: "TICK" }, 5360);
  assert.equal(state.state, "panelIn");
  assert.equal(state.panelIndex, 1);
  assert.equal(state.panel.art, "forest");

  // Panel 2 lifecycle
  state = cutsceneReducer(state, { type: "TICK" }, 5780); // panelIn finishes
  assert.equal(state.state, "holding");
  state = cutsceneReducer(state, { type: "TICK" }, 8780); // minMs 3000 reaches
  assert.equal(state.canAdvance, true);
  state = cutsceneReducer(state, { type: "ADVANCE" }, 8780); // advance to panelOut
  assert.equal(state.state, "panelOut");
  state = cutsceneReducer(state, { type: "TICK" }, 9140); // panelOut finishes
  assert.equal(state.state, "finished");
  assert.equal(state.isPlaying, false);

  // 9. DONE resets to idle
  state = cutsceneReducer(state, { type: "DONE" }, 9140);
  assert.equal(state.state, "idle");
  assert.equal(state.isPlaying, false);
});

test("ADVANCE-during-panelIn", () => {
  const script = createCutsceneScript(sampleScript);
  let state = cutsceneReducer(undefined, { type: "START", script }, 1000);
  assert.equal(state.state, "panelIn");

  // User taps ADVANCE during panelIn (at t=1100, before 420ms fade finishes)
  state = cutsceneReducer(state, { type: "ADVANCE" }, 1100);
  assert.equal(
    state.state,
    "holding",
    "ADVANCE during panelIn completes panelIn instantly (no stuck states)"
  );
  assert.equal(state.status, "holding");
  assert.equal(state.elapsedPanelMs, 100);
});

test("reducedMotion", () => {
  const script = createCutsceneScript(sampleScript);
  let state = cutsceneReducer(
    undefined,
    { type: "START", script, reducedMotion: true },
    1000
  );

  assert.equal(state.reducedMotion, true);
  assert.equal(state.phaseDurationMs, 0, "panelIn duration is 0ms under reducedMotion");
  assert.deepEqual(state.pan, [0, 0, 0, 0], "pan is ignored/zeroed under reducedMotion");

  // TICK at 1000ms immediately completes 0ms panelIn -> holding
  state = cutsceneReducer(state, { type: "TICK" }, 1000);
  assert.equal(state.state, "holding");

  // When advancing, panelOut is 0ms
  state = cutsceneReducer(state, { type: "ADVANCE" }, 3400);
  assert.equal(state.state, "panelOut");
  assert.equal(state.phaseDurationMs, 0, "panelOut duration is 0ms under reducedMotion");

  // Next TICK at 3400ms immediately enters next panel
  state = cutsceneReducer(state, { type: "TICK" }, 3400);
  assert.equal(state.state, "panelIn");
  assert.equal(state.panelIndex, 1);
  assert.deepEqual(state.pan, [0, 0, 0, 0], "panel 2 pan also ignored");
});

test("caption clamp", () => {
  // createCutsceneScript enforces caption <= 180 chars
  const longCaption = "A".repeat(181);
  assert.throws(
    () =>
      createCutsceneScript({
        panels: [{ art: "gate", caption: longCaption }],
      }),
    /180 chars/
  );

  const exactCaption = "B".repeat(180);
  const normalized = createCutsceneScript({
    panels: [{ art: "gate", caption: exactCaption }],
  });
  assert.equal(normalized.panels[0].caption.length, 180);

  // captionChunks clamps input to 180 chars
  const chunksOver = captionChunks("C".repeat(250));
  assert.equal(chunksOver[chunksOver.length - 1], 180, "captionChunks clamps length to 180");

  // Empty caption produces valid minimum chunks
  const emptyChunks = captionChunks("");
  assert.ok(emptyChunks.length >= 2);
  assert.equal(emptyChunks[emptyChunks.length - 1], 0);
});

test("chunk monotonicity", () => {
  const cases = [
    "",
    "A",
    "Hello",
    "Hold the line at Forest Gate!",
    "C".repeat(180),
  ];

  for (const str of cases) {
    const chunks = captionChunks(str);
    assert.ok(chunks.length >= 2, `chunks length >= 2 for "${str.slice(0, 10)}"`);
    const expectedLast = Math.min(180, str.length);
    assert.equal(
      chunks[chunks.length - 1],
      expectedLast,
      `last chunk equals full length for "${str.slice(0, 10)}"`
    );

    for (let i = 1; i < chunks.length; i++) {
      assert.ok(
        chunks[i] >= chunks[i - 1],
        `monotonicity violated at index ${i}: ${chunks[i - 1]} > ${chunks[i]}`
      );
    }
  }

  // Check custom chunkMs
  const fastChunks = captionChunks("Thornwatch defense", 17);
  assert.ok(fastChunks.length >= 2);
  assert.equal(fastChunks[fastChunks.length - 1], 18);
  for (let i = 1; i < fastChunks.length; i++) {
    assert.ok(fastChunks[i] >= fastChunks[i - 1]);
  }
});

test("pure reducer and SKIP action", () => {
  const script = createCutsceneScript(sampleScript);
  const s0 = cutsceneReducer(undefined, { type: "START", script }, 1000);

  // Pure reducer: state contains no functions
  for (const [key, value] of Object.entries(s0)) {
    assert.notEqual(typeof value, "function", `state property ${key} must not be a function`);
  }

  // Same inputs -> same output
  const s0Copy = cutsceneReducer(undefined, { type: "START", script }, 1000);
  assert.deepEqual(s0, s0Copy);

  // SKIP transitions to finished immediately
  const skipped = cutsceneReducer(s0, { type: "SKIP" }, 1200);
  assert.equal(skipped.state, "finished");
  assert.equal(skipped.isPlaying, false);
  assert.equal(skipped.canAdvance, true);
});

console.log("cutscene-core contract: PASS");
