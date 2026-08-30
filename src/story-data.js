/**
 * KRC v1.4.1 Story Data — original KRC lore only.
 * Realm of Thornmere, Captain Alder of the Thornwatch, the Cinder Warden.
 */

export const ART_KEYS = Object.freeze([
  "gate",
  "road",
  "forest",
  "marsh",
  "keep",
  "camp",
  "cliff",
  "warden",
]);

export const CHAPTERS = Object.freeze([
  Object.freeze({
    id: "ch0-thornwatch-muster",
    title: "Muster of the Thornwatch",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 0,
    panels: Object.freeze([
      Object.freeze({
        art: "keep",
        caption:
          "In the fortress of Thornmere, Captain Alder rallies the Thornwatch as dark omens rise along the border.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "gate",
        caption:
          "The ancient gates shudder under the thud of approaching beasts. Alder orders the archers to make ready.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "forest",
        caption:
          "Beyond the wall, the deep briars stir with unnatural embers. The realm must not fall.",
        speak: "Captain Alder",
      }),
    ]),
  }),
  Object.freeze({
    id: "ch1-forest-gate",
    title: "Breach at Forest Gate",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 0,
    panels: Object.freeze([
      Object.freeze({
        art: "forest",
        caption:
          "Ash falls upon the canopy like black snow. Beast scouts prowl beneath the twisted boughs.",
        speak: "Thornwatch Scout",
      }),
      Object.freeze({
        art: "gate",
        caption:
          "Iron shields lock together at Forest Gate. Hold the line, soldiers of Thornmere!",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "road",
        caption:
          "The vanguard breaks, but the road ahead is thick with smoke. We march onward to Stone Pass.",
        speak: "Captain Alder",
      }),
    ]),
  }),
  Object.freeze({
    id: "ch2-stone-pass",
    title: "The High Pass Ambush",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 1,
    panels: Object.freeze([
      Object.freeze({
        art: "cliff",
        caption:
          "Craggy peaks loom over the narrow pass. Sharp winds carry the reek of brimstone and charred earth.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "road",
        caption:
          "Armored raiders descend from the bluffs, seeking to sever Thornmere from the southern garrisons.",
        speak: "Thornwatch Scout",
      }),
      Object.freeze({
        art: "camp",
        caption:
          "By nightfall our braziers burn bright. We fortify our camp amidst the jagged rock.",
        speak: "Captain Alder",
      }),
    ]),
  }),
  Object.freeze({
    id: "ch3-descent-to-mist",
    title: "Descent into the Mire",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 1,
    panels: Object.freeze([
      Object.freeze({
        art: "cliff",
        caption:
          "From the high crags, Captain Alder gazes down upon the great lowlands cloaked in smoldering fog.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "camp",
        caption:
          "Our soldiers mend their gear and tend the wounded. Alder reminds them of their sacred oath.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "road",
        caption:
          "The descent begins into the lowlands. The sulfur grows heavier with every step.",
        speak: "Thornwatch Scout",
      }),
    ]),
  }),
  Object.freeze({
    id: "ch4-ember-marsh",
    title: "The Burning Mire",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 2,
    panels: Object.freeze([
      Object.freeze({
        art: "marsh",
        caption:
          "Ember Marsh stretches wide, its stagnant pools boiling with strange volcanic heat.",
        speak: "Thornwatch Scout",
      }),
      Object.freeze({
        art: "keep",
        caption:
          "Ruins of a sunken redoubt rise from the mud, swarming with relentless broodlings.",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "warden",
        caption:
          "A towering shape of molten cinder emerges from the fumes: the Cinder Warden awakens.",
        speak: "The Cinder Warden",
      }),
    ]),
  }),
  Object.freeze({
    id: "ch5-cinder-warden",
    title: "Fall of the Cinder Warden",
    narrator: "Captain Alder of the Thornwatch",
    mapIndex: 2,
    panels: Object.freeze([
      Object.freeze({
        art: "warden",
        caption:
          "The Cinder Warden roars, unleashing waves of fire and scorched iron upon our defenses.",
        speak: "The Cinder Warden",
      }),
      Object.freeze({
        art: "marsh",
        caption:
          "Through smoke and boiling sludge, the Thornwatch stands unyielding. Stand firm for Thornmere!",
        speak: "Captain Alder",
      }),
      Object.freeze({
        art: "gate",
        caption:
          "The colossus shatters into cold ash. The gates of the realm stand unbroken, saved by our vigilance.",
        speak: "Captain Alder",
      }),
    ]),
  }),
]);

/**
 * Find the next chapter for a given mapIndex (first unused by index rules).
 * @param {number|object} mapIndex Map index (0, 1, or 2)
 * @param {Array|Set|object} [used] Already-used chapter IDs or indices
 * @returns {object|null} Selected chapter or null
 */
export function chapterForMap(mapIndex, used = []) {
  const targetMap = Number(
    typeof mapIndex === "object" && mapIndex !== null
      ? mapIndex.mapIndex
      : mapIndex
  );

  const usedSet =
    used instanceof Set
      ? used
      : new Set(Array.isArray(used) ? used : Object.keys(used || {}));

  const matching = CHAPTERS.filter((ch) => ch.mapIndex === targetMap);
  if (matching.length === 0) return null;

  const firstUnused = matching.find((ch) => {
    const globalIdx = CHAPTERS.indexOf(ch);
    return (
      !usedSet.has(ch.id) &&
      !usedSet.has(ch) &&
      !usedSet.has(globalIdx) &&
      !usedSet.has(String(globalIdx))
    );
  });

  return firstUnused || matching[0];
}

if (typeof window !== "undefined") {
  window.KRCStoryData = Object.freeze({
    ART_KEYS,
    CHAPTERS,
    chapterForMap,
  });
}
