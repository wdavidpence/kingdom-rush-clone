(() => {
  const path = [
    { x: -18, y: 126 }, { x: 80, y: 126 }, { x: 104, y: 222 }, { x: 250, y: 222 },
    { x: 292, y: 326 }, { x: 132, y: 372 }, { x: 106, y: 488 }, { x: 276, y: 520 }, { x: 434, y: 596 },
  ];
  const buildPads = [
    { x: 68, y: 214 }, { x: 180, y: 152 }, { x: 326, y: 176 }, { x: 202, y: 310 },
    { x: 326, y: 394 }, { x: 74, y: 438 }, { x: 194, y: 488 }, { x: 328, y: 560 },
  ];

  const maps = [
    { name: "Forest Gate", grass: 0x273c1f, path, pads: buildPads },
    { name: "Stone Pass", grass: 0x243235,
      path: [{ x: -18, y: 150 }, { x: 122, y: 150 }, { x: 160, y: 258 }, { x: 68, y: 336 }, { x: 210, y: 396 }, { x: 334, y: 330 }, { x: 306, y: 502 }, { x: 426, y: 584 }],
      pads: [{ x: 74, y: 238 }, { x: 212, y: 172 }, { x: 322, y: 218 }, { x: 84, y: 424 }, { x: 206, y: 304 }, { x: 332, y: 404 }, { x: 176, y: 512 }, { x: 318, y: 574 }], },
    { name: "Ember Marsh", grass: 0x2b3024,
      path: [{ x: -18, y: 104 }, { x: 140, y: 144 }, { x: 310, y: 116 }, { x: 334, y: 246 }, { x: 168, y: 288 }, { x: 88, y: 420 }, { x: 248, y: 470 }, { x: 378, y: 570 }, { x: 438, y: 616 }],
      pads: [{ x: 74, y: 188 }, { x: 220, y: 202 }, { x: 344, y: 170 }, { x: 266, y: 330 }, { x: 74, y: 322 }, { x: 142, y: 518 }, { x: 298, y: 426 }, { x: 326, y: 560 }], },
  ];

  const towers = {
    archer: { id: "archer", name: "Rangers", glyph: "A", shopLabel: "AIR", role: "Rapid anti-air focus", targetRule: "First enemy; can target flying enemies", counterplay: "Use against fast or flying enemies; weak into armor.", cost: 70, upgrades: [55, 100, 240, 460], damage: [18, 27, 39, 58, 84], rate: [0.62, 0.53, 0.46, 0.4, 0.35], range: [106, 120, 132, 144, 156], color: 0x78d66b, desc: "Fast arrows. Good vs flyers." },
    mage: { id: "mage", name: "Runes", glyph: "M", shopLabel: "ARM", role: "Armor-piercing control", targetRule: "First enemy; can target flying enemies", counterplay: "Use against armored enemies; slower shots need support.", cost: 95, upgrades: [75, 130, 300, 560], damage: [34, 49, 68, 98, 138], rate: [1.05, 0.93, 0.84, 0.75, 0.68], range: [104, 116, 128, 140, 152], color: 0x7d75ff, magic: true, slow: [0.12, 0.18, 0.25, 0.32, 0.4], desc: "Ignores armor and slows." },
    artillery: { id: "artillery", name: "Mortar", glyph: "B", shopLabel: "AOE", role: "Ground-area damage", targetRule: "First ground enemy; cannot target flying enemies", counterplay: "Use against swarms; pair with anti-air coverage.", cost: 145, upgrades: [95, 170, 380, 700], damage: [55, 76, 104, 150, 212], rate: [1.75, 1.55, 1.35, 1.2, 1.06], range: [128, 145, 160, 176, 192], color: 0xe29b4a, splash: [42, 52, 64, 76, 90], desc: "Slow splash damage." },
    barracks: { id: "barracks", name: "Guard", glyph: "G", shopLabel: "HOLD", role: "Road blocking melee", targetRule: "Rally on the road; engage ground enemies", counterplay: "Use to hold chokepoints; cannot stop flying enemies.", cost: 120, upgrades: [80, 150, 340, 620], damage: [10, 15, 22, 32, 46], rate: [0.7, 0.62, 0.55, 0.49, 0.44], range: [70, 82, 92, 104, 116], color: 0xd8c56a, soldierHp: [90, 130, 180, 245, 330], desc: "Blocks the road." },
  };

  const enemies = {
    scout: { name: "Scout", hp: 54, speed: 50, armor: 0, bounty: 7, leak: 1, color: 0xbfe769, size: 15 },
    brute: { name: "Brute", hp: 142, speed: 42, armor: 3, bounty: 13, leak: 1, color: 0xe4a25d, size: 18 },
    shield: { name: "Shield", hp: 230, speed: 34, armor: 6, bounty: 19, leak: 2, color: 0xb7bfca, size: 20 },
    ember: { name: "Ember", hp: 118, speed: 50, armor: 1, bounty: 15, leak: 1, color: 0xe86240, size: 17, burn: true },
    brood: { name: "Broodling", hp: 76, speed: 56, armor: 0, bounty: 10, leak: 1, color: 0xc66f8f, size: 16, split: ["scout", 2] },
    flyer: { name: "Wisp", hp: 104, speed: 72, armor: 0, bounty: 14, leak: 1, color: 0x73d9ff, size: 15, flying: true },
    titan: { name: "Titan", hp: 520, speed: 26, armor: 8, bounty: 45, leak: 4, color: 0x8e8379, size: 24 },
    boss: { name: "Warden", hp: 1120, speed: 22, armor: 7, bounty: 120, leak: 8, color: 0xcd65e6, size: 30 },
  };

  const waves = [
    { label: "Scouts", gold: 18, spawn: 0.82, packs: [["scout", 12]] },
    { label: "Raiders", gold: 20, spawn: 0.64, packs: [["scout", 16], ["brute", 5]] },
    { label: "Armor", gold: 24, spawn: 0.7, packs: [["brute", 10], ["shield", 3], ["scout", 8]] },
    { label: "Fireline", gold: 28, spawn: 0.62, packs: [["ember", 8], ["brood", 6], ["shield", 4]] },
    { label: "Skybreak", gold: 30, spawn: 0.68, packs: [["flyer", 8], ["brute", 10], ["brood", 6], ["shield", 5]] },
    { label: "Crush", gold: 36, spawn: 0.62, packs: [["shield", 10], ["ember", 8], ["brute", 8]] },
    { label: "Storm", gold: 38, spawn: 0.56, packs: [["flyer", 10], ["scout", 18], ["brute", 8]] },
    { label: "Titanfall", gold: 44, spawn: 0.68, packs: [["titan", 3], ["shield", 8], ["ember", 8]] },
    { label: "Last Gate", gold: 50, spawn: 0.52, packs: [["scout", 16], ["flyer", 8], ["brute", 10], ["titan", 2]] },
    { label: "Warden", gold: 0, spawn: 0.62, packs: [["boss", 1], ["titan", 4], ["flyer", 8], ["shield", 8]] },
  ];

  window.KRCGameData = Object.freeze({ maps, towers, enemies, waves });
})();
