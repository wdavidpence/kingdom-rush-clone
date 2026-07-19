(() => {
  const TRAIT_META = Object.freeze({
    armor: Object.freeze({ id: "armor", glyph: "ARM", color: "#c9d2dc", minArmor: 1 }),
    flying: Object.freeze({ id: "flying", glyph: "FLY", color: "#8fdfff" }),
    swarm: Object.freeze({ id: "swarm", glyph: "SWM", color: "#f0a0c0" }),
    elite: Object.freeze({ id: "elite", glyph: "ELT", color: "#ffd27a" }),
  });

  function traitsFor(base = {}) {
    const traits = [];
    if ((Number(base.armor) || 0) >= (TRAIT_META.armor.minArmor || 1)) traits.push(TRAIT_META.armor);
    if (base.flying) traits.push(TRAIT_META.flying);
    if (Array.isArray(base.split) && base.split.length) traits.push(TRAIT_META.swarm);
    if (base.support || base.aura) traits.push(Object.freeze({ id: "control", glyph: "CTL", color: "#d2c2ff" }));
    const elite =
      (Number(base.leak) || 0) >= 3 ||
      (Number(base.bounty) || 0) >= 40 ||
      (Number(base.hp) || 0) >= 400 ||
      /warden|titan|boss/i.test(String(base.name || ""));
    if (elite) traits.push(TRAIT_META.elite);
    return traits;
  }

  function badgeText(traits) {
    if (!traits || !traits.length) return "";
    return traits.map((t) => t.glyph).join("·");
  }

  window.KRCEnemyTraits = Object.freeze({ TRAIT_META, traitsFor, badgeText });
})();
