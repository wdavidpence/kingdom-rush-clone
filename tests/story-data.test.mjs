import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ART_KEYS,
  CHAPTERS,
  chapterForMap,
} from "../public/src/story-data.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/story-data.js");
assert.equal(fs.existsSync(sourcePath), true, "story-data.js must exist");

test("art keys registry", () => {
  assert.ok(Array.isArray(ART_KEYS), "ART_KEYS must be an array");
  const expectedKeys = [
    "gate",
    "road",
    "forest",
    "marsh",
    "keep",
    "camp",
    "cliff",
    "warden",
  ];
  assert.equal(ART_KEYS.length, expectedKeys.length);
  for (const key of expectedKeys) {
    assert.ok(ART_KEYS.includes(key), `ART_KEYS must include ${key}`);
  }
});

test("story: 6 chapters and lengths", () => {
  assert.ok(Array.isArray(CHAPTERS), "CHAPTERS must be an array");
  assert.equal(CHAPTERS.length, 6, "Must define exactly 6 chapters");

  CHAPTERS.forEach((chapter, index) => {
    assert.ok(chapter.id, `Chapter ${index} must have id`);
    assert.ok(chapter.title, `Chapter ${index} must have title`);
    assert.ok(chapter.narrator, `Chapter ${index} must have narrator`);
    assert.ok(
      Array.isArray(chapter.panels) && chapter.panels.length >= 1,
      `Chapter ${index} must have >= 1 panel`
    );

    chapter.panels.forEach((panel, pIdx) => {
      assert.ok(panel.art, `Chapter ${index} panel ${pIdx} must have art`);
      assert.ok(
        typeof panel.caption === "string" &&
          panel.caption.length > 0 &&
          panel.caption.length <= 180,
        `Chapter ${index} panel ${pIdx} caption must be non-empty and <= 180 chars (got ${panel.caption?.length})`
      );
      assert.ok(panel.speak, `Chapter ${index} panel ${pIdx} must have speak`);
    });
  });
});

test("story: no forbidden substrings", () => {
  const forbiddenPatterns = [
    /linirea/i,
    /vez'?nan/i,
    /denas/i,
    /ironhide/i,
    /kingdom\s*rush/i,
    /linmere/i,
  ];

  // Inspect the raw file content to ensure no forbidden lore in comments or code
  const rawSource = fs.readFileSync(sourcePath, "utf8");
  for (const pattern of forbiddenPatterns) {
    assert.equal(
      pattern.test(rawSource),
      false,
      `story-data.js source must not contain forbidden pattern ${pattern}`
    );
  }

  // Inspect all string fields in the structured data
  CHAPTERS.forEach((ch, idx) => {
    const fieldsToTest = [
      ch.id,
      ch.title,
      ch.narrator,
      ...ch.panels.map((p) => p.caption),
      ...ch.panels.map((p) => p.speak),
      ...ch.panels.map((p) => p.art),
    ];

    for (const text of fieldsToTest) {
      if (typeof text === "string") {
        for (const pattern of forbiddenPatterns) {
          assert.equal(
            pattern.test(text),
            false,
            `Forbidden lore ${pattern} found in chapter ${idx} text: "${text}"`
          );
        }
      }
    }
  });
});

test("mapIndex mapping valid", () => {
  // chapters 0-1 -> mapIndex 0
  assert.equal(CHAPTERS[0].mapIndex, 0);
  assert.equal(CHAPTERS[1].mapIndex, 0);

  // chapters 2-3 -> mapIndex 1
  assert.equal(CHAPTERS[2].mapIndex, 1);
  assert.equal(CHAPTERS[3].mapIndex, 1);

  // chapters 4-5 -> mapIndex 2
  assert.equal(CHAPTERS[4].mapIndex, 2);
  assert.equal(CHAPTERS[5].mapIndex, 2);

  // Chapter 1 must be playable on Forest Gate (mapIndex 0)
  assert.equal(CHAPTERS[1].mapIndex, 0);
  assert.match(CHAPTERS[1].title, /forest gate/i);

  // Chapter 4 or 5 on Warden boss map (mapIndex 2)
  assert.equal(CHAPTERS[4].mapIndex, 2);
  assert.equal(CHAPTERS[5].mapIndex, 2);
  const bossMapChapter = CHAPTERS.slice(4, 6).find((ch) =>
    ch.panels.some((p) => p.art === "warden" || /warden/i.test(p.speak))
  );
  assert.ok(bossMapChapter, "Chapter 4 or 5 must reference the Warden");
});

test("art keys all in registry", () => {
  CHAPTERS.forEach((ch, cIdx) => {
    ch.panels.forEach((p, pIdx) => {
      assert.ok(
        ART_KEYS.includes(p.art),
        `Chapter ${cIdx} panel ${pIdx} art "${p.art}" must be in ART_KEYS`
      );
    });
  });
});

test("chapterForMap resolution", () => {
  // First unused for mapIndex 0 is Chapter 0
  const ch0 = chapterForMap(0);
  assert.equal(ch0.id, CHAPTERS[0].id);

  // When Chapter 0 is used, return Chapter 1
  const ch1 = chapterForMap(0, [CHAPTERS[0].id]);
  assert.equal(ch1.id, CHAPTERS[1].id);

  // When both used, fallback to first matching chapter for map
  const fallback0 = chapterForMap(0, [CHAPTERS[0].id, CHAPTERS[1].id]);
  assert.equal(fallback0.id, CHAPTERS[0].id);

  // Map 1 -> Chapter 2
  const ch2 = chapterForMap(1);
  assert.equal(ch2.id, CHAPTERS[2].id);
  const ch3 = chapterForMap(1, [CHAPTERS[2].id]);
  assert.equal(ch3.id, CHAPTERS[3].id);

  // Map 2 -> Chapter 4
  const ch4 = chapterForMap(2);
  assert.equal(ch4.id, CHAPTERS[4].id);
  const ch5 = chapterForMap(2, [CHAPTERS[4].id]);
  assert.equal(ch5.id, CHAPTERS[5].id);

  // Object with mapIndex field
  assert.equal(chapterForMap({ mapIndex: 1 }).id, CHAPTERS[2].id);
});

console.log("story-data contract: PASS");
