import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  clear() {
    for (const key of Object.keys(mem)) delete mem[key];
  },
};
globalThis.localStorage = localStorageMock;

const {
  HEROES,
  HERO_STORAGE_KEY,
  persistHeroPick,
  readHeroPick,
  renderHeroPicker,
} = await import("../public/src/hero-select.js");

const testDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(testDir, "../public/src/hero-select.js");
assert.equal(fs.existsSync(sourcePath), true, "hero-select.js must exist");

test("HEROES contract", () => {
  assert.equal(HEROES.length, 2);
  assert.equal(HEROES[0].id, "captain");
  assert.equal(HEROES[0].name, "Captain Alder");
  assert.equal(HEROES[0].role, "HUNT");
  assert.equal(HEROES[0].desc, "Charging duelist");
  assert.equal(HEROES[1].id, "sentinel");
  assert.equal(HEROES[1].name, "Sentinel Bryne");
  assert.equal(HEROES[1].role, "HOLD");
  assert.equal(HEROES[1].desc, "Unmoving bulwark");
  assert.equal(HERO_STORAGE_KEY, "krc_hero_pick");
});

test("persistHeroPick writes krc_hero_pick and readHeroPick returns it", () => {
  localStorageMock.clear();
  assert.equal(readHeroPick(), null);
  const saved = persistHeroPick("sentinel");
  assert.equal(saved.id, "sentinel");
  assert.equal(localStorageMock.getItem("krc_hero_pick"), "sentinel");
  assert.equal(readHeroPick(), "sentinel");
  persistHeroPick("captain");
  assert.equal(readHeroPick(), "captain");
  assert.equal(persistHeroPick("nope"), null);
  assert.equal(readHeroPick(), "captain");
});

test("renderHeroPicker builds two tap cards and persists on pick", () => {
  localStorageMock.clear();
  const created = [];
  const fakeDoc = {
    createElement(tag) {
      const el = {
        tagName: String(tag).toUpperCase(),
        className: "",
        style: { cssText: "" },
        dataset: {},
        children: [],
        listeners: {},
        textContent: "",
        type: "",
        appendChild(child) {
          this.children.push(child);
          return child;
        },
        addEventListener(name, fn) {
          this.listeners[name] = fn;
        },
        click() {
          this.listeners.click?.();
        },
      };
      created.push(el);
      return el;
    },
  };
  const prev = globalThis.document;
  globalThis.document = fakeDoc;
  const container = {
    innerHTML: "stale",
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
  };
  let picked = null;
  const root = renderHeroPicker(container, (hero) => {
    picked = hero;
  });
  globalThis.document = prev;

  assert.equal(container.innerHTML, "");
  assert.equal(container.children.length, 1);
  assert.equal(root.className, "shell");
  const cards = created.filter((el) => el.tagName === "BUTTON");
  assert.equal(cards.length, 2);
  assert.equal(cards[0].dataset.heroId, "captain");
  assert.equal(cards[1].dataset.heroId, "sentinel");
  cards[1].click();
  assert.equal(picked.id, "sentinel");
  assert.equal(localStorageMock.getItem("krc_hero_pick"), "sentinel");
  assert.equal(readHeroPick(), "sentinel");
});

console.log("hero-select contract: PASS");
